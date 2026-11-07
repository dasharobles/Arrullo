"""Adaptación AR-014: paquetería persistente para los envíos de Arrullo."""
import uuid
from datetime import datetime

STAGES = ('label_pending', 'shipped', 'delivered')
LABELS = {'label_pending': 'Guía generada', 'shipped': 'En tránsito', 'delivered': 'Entrega validada'}


def determinar_estado(estado_paqueteria, fecha_entrega):
    # Regla original de AR-014, conservada: entregar sin fecha no valida.
    if estado_paqueteria == 'en_transito':
        return 'pendiente'
    if estado_paqueteria == 'entregado':
        return 'validada' if fecha_entrega is not None else 'rechazada'
    return 'pendiente'


class SimulationError(Exception):
    def __init__(self, message, status=409):
        super().__init__(message)
        self.status = status


def operate(conn, order_id, action, expected_stage=None):
    if action not in ('generate', 'advance'):
        raise SimulationError('Acción de paquetería inválida.', 400)
    cur = conn.cursor(dictionary=True)
    try:
        conn.start_transaction()
        cur.execute('SELECT id,status FROM orders WHERE id=%s FOR UPDATE', (order_id,))
        order = cur.fetchone()
        if not order:
            raise SimulationError('Pedido no encontrado.', 404)
        if order['status'] in ('pending_payment', 'cancelled', 'refunded'):
            raise SimulationError('Este pedido no admite una guía de envío.')
        cur.execute('SELECT id,tracking_number,status FROM shipments WHERE order_id=%s FOR UPDATE', (order_id,))
        shipment = cur.fetchone()
        if not shipment:
            raise SimulationError('El pedido no tiene un envío registrado.')
        cur.execute('SELECT * FROM parcel_simulations WHERE shipment_id=%s FOR UPDATE', (shipment['id'],))
        sim = cur.fetchone()
        if action == 'generate':
            if sim:
                conn.commit()
                return {'trackingNumber': sim['tracking_number'], 'status': sim['stage'], 'simulated': True}
            if order['status'] == 'delivered' or shipment['status'] in ('shipped', 'delivered') or shipment['tracking_number']:
                raise SimulationError('Este envío ya tiene guía o está finalizado. Conserva su seguimiento actual.')
            guide = 'SIM-' + uuid.uuid4().hex.upper()
            cur.execute('SELECT id FROM shipments WHERE UPPER(TRIM(tracking_number))=%s LIMIT 1', (guide,))
            if cur.fetchone():
                raise SimulationError('No se pudo reservar una guía única. Intenta nuevamente.')
            stage, delivered, validation = 'label_pending', None, 'pendiente'
            cur.execute('INSERT INTO parcel_simulations (shipment_id,tracking_number,stage,validation_status) VALUES (%s,%s,%s,%s)', (shipment['id'],guide,stage,validation))
        else:
            if not sim:
                raise SimulationError('Primero genera la guía simulada.')
            if sim['stage'] == 'delivered':
                conn.commit()
                return {'trackingNumber':sim['tracking_number'], 'status':'delivered', 'simulated':True}
            if expected_stage != sim['stage']:
                raise SimulationError('El seguimiento cambió. Actualiza los pedidos antes de continuar.')
            if order['status'] == 'delivered':
                raise SimulationError('El pedido ya está finalizado.')
            guide = sim['tracking_number']
            stage = STAGES[STAGES.index(sim['stage']) + 1]
            delivered = datetime.utcnow() if stage == 'delivered' else None
            validation = determinar_estado('entregado' if stage == 'delivered' else 'en_transito', delivered)
            cur.execute('UPDATE parcel_simulations SET stage=%s,delivered_at=%s,validation_status=%s WHERE shipment_id=%s', (stage,delivered,validation,shipment['id']))
        cur.execute('UPDATE shipments SET carrier=%s,tracking_number=%s,status=%s WHERE id=%s', ('Paquetería simulada Arrullo',guide,stage,shipment['id']))
        cur.execute('UPDATE orders SET status=%s,carrier=%s,tracking_number=%s WHERE id=%s', ('preparing' if stage=='label_pending' else stage,'Paquetería simulada Arrullo',guide,order_id))
        cur.execute('INSERT INTO parcel_simulation_events (shipment_id,stage,event_label) VALUES (%s,%s,%s)', (shipment['id'],stage,LABELS[stage]))
        conn.commit()
        return {'trackingNumber':guide,'status':stage,'validation':validation,'simulated':True}
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
