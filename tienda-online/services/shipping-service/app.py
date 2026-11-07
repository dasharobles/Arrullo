"""Aplicación Flask para administrar logística y consultar envíos de Arrullo."""

import os
import hmac
from datetime import datetime

import mysql.connector
from dotenv import load_dotenv
from flask import Flask, flash, jsonify, redirect, render_template, request, url_for
from mysql.connector import Error, IntegrityError

load_dotenv()
app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "clave-desarrollo-cambiar-en-produccion")

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "tienda"),
    "port": int(os.getenv("DB_PORT", "3306")),
}

# Conexión interna al esquema de Arrullo, con simulación autenticada. Mantiene separada
# la base histórica del panel de logística y permite consultar pedidos reales.
ARRULLO_DB_CONFIG = {
    "host": os.getenv("ARRULLO_DB_HOST", DB_CONFIG["host"]),
    "user": os.getenv("ARRULLO_DB_USER", DB_CONFIG["user"]),
    "password": os.getenv("ARRULLO_DB_PASSWORD", DB_CONFIG["password"]),
    "database": os.getenv("ARRULLO_DB_NAME", "arrullo"),
    "port": int(os.getenv("ARRULLO_DB_PORT", str(DB_CONFIG["port"]))),
}

if os.getenv("ARRULLO_DB_SSL", "false").lower() == "true":
    ARRULLO_DB_CONFIG.update(ssl_disabled=False, ssl_verify_cert=True, ssl_verify_identity=True)
    if os.getenv("ARRULLO_DB_SSL_CA_FILE"):
        ARRULLO_DB_CONFIG["ssl_ca"] = os.getenv("ARRULLO_DB_SSL_CA_FILE")

ALLOWED_STATES = (
    "pendiente",
    "preparando",
    "enviado",
    "en_transito",
    "entregado",
    "cancelado",
)

CREATE_STATES = (
    "pendiente",
    "preparando",
    "enviado",
    "en_transito",
)


def get_connection():
    """Abre una conexión a MySQL usando la configuración del entorno."""
    return mysql.connector.connect(**DB_CONFIG)


def get_arrullo_connection():
    """Conecta al esquema de Arrullo usado por la tienda en línea."""
    return mysql.connector.connect(**ARRULLO_DB_CONFIG)


@app.get("/health")
def health():
    if not os.getenv("ARRULLO_SERVICE_API_KEY"):
        return jsonify(ok=False, service="arrullo-shipping", error="Falta configurar la conexión interna"), 503
    conn = None
    cur = None
    try:
        conn = get_arrullo_connection()
        cur = conn.cursor()
        cur.execute("SELECT id FROM shipments LIMIT 1")
        cur.fetchall()
        return jsonify(ok=True, service="arrullo-shipping", database="connected")
    except Error:
        return jsonify(ok=False, service="arrullo-shipping", error="No se pudo conectar con la base de envíos"), 503
    finally:
        close_connection(conn, cur)



@app.post('/api/v1/arrullo/orders/<int:order_id>/simulation')
def simulate_arrullo_parcel(order_id):
    expected = os.getenv('ARRULLO_SERVICE_API_KEY', '')
    if not expected or not hmac.compare_digest(request.headers.get('X-Arrullo-Service-Key', ''), expected):
        return jsonify(error='No autorizado'), 401
    from parcel_simulator import operate, SimulationError
    data = request.get_json(silent=True) or {}
    conn = None
    try:
        conn = get_arrullo_connection()
        return jsonify(operate(conn, order_id, data.get('action'), data.get('expectedStage')))
    except SimulationError as error:
        return jsonify(error=str(error)), error.status
    except Error:
        app.logger.exception('Error de paquetería simulada')
        return jsonify(error='No se pudo actualizar la paquetería simulada'), 503
    finally:
        close_connection(conn)

@app.get("/api/v1/arrullo/users/<int:user_id>/shipments")
def arrullo_user_shipments(user_id):
    """API interna: entrega solo los envíos del comprador autenticado por Arrullo."""
    expected_key = os.getenv("ARRULLO_SERVICE_API_KEY", "")
    supplied_key = request.headers.get("X-Arrullo-Service-Key", "")
    if not expected_key:
        return jsonify(error="Servicio de envíos sin configurar"), 503
    if not hmac.compare_digest(supplied_key, expected_key):
        return jsonify(error="No autorizado"), 401

    conn = None
    cur = None
    try:
        conn = get_arrullo_connection()
        cur = conn.cursor(dictionary=True)
        cur.execute("""
            SELECT o.public_id AS reference, s.status AS status,
                   COALESCE(s.carrier, o.carrier) AS carrier,
                   COALESCE(s.tracking_number, o.tracking_number) AS tracking_number,
                   p.validation_status, p.delivered_at, p.stage AS simulation_stage,
                   s.created_at AS created_at, a.recipient AS recipient,
                   a.line1 AS address_line, a.neighborhood AS neighborhood,
                   a.city AS city, a.postal_code AS postal_code
            FROM shipments s
            LEFT JOIN parcel_simulations p ON p.shipment_id=s.id
            JOIN orders o ON o.id = s.order_id
            JOIN addresses a ON a.id = o.address_id
            WHERE o.user_id = %s AND o.status NOT IN ('cancelled','refunded','pending_payment')
            ORDER BY o.created_at DESC
        """, (user_id,))
        items = cur.fetchall()
        for item in items:
            item['simulated'] = item['simulation_stage'] is not None
            item['delivered_at'] = item['delivered_at'].isoformat() + 'Z' if item['delivered_at'] else None
            cur.execute("SELECT e.stage,e.event_label,e.created_at FROM parcel_simulation_events e JOIN shipments s ON s.id=e.shipment_id JOIN orders o ON o.id=s.order_id WHERE o.public_id=%s AND o.user_id=%s ORDER BY e.id", (item['reference'], user_id))
            item['events'] = [{'stage':e['stage'],'label':e['event_label'],'date':e['created_at'].isoformat()+'Z'} for e in cur.fetchall()]
        return jsonify(service="arrullo-shipping", items=items)
    except Error:
        app.logger.exception("No fue posible consultar los envíos de Arrullo")
        return jsonify(error="No fue posible consultar el seguimiento de envíos"), 503
    finally:
        close_connection(conn, cur)


def close_connection(conn=None, cursor=None):
    """Cierra cursor y conexión de forma segura."""
    if cursor is not None:
        try:
            cursor.close()
        except Error:
            pass
    if conn is not None:
        try:
            if conn.is_connected():
                conn.close()
        except Error:
            pass


def parse_positive_int(value, field_name):
    """Convierte un valor a entero positivo o lanza ValueError."""
    try:
        number = int(value)
    except (TypeError, ValueError):
        raise ValueError(f"El campo {field_name} debe ser un número entero.")

    if number <= 0:
        raise ValueError(f"El campo {field_name} debe ser mayor que cero.")

    return number


@app.route("/")
def index():
    return redirect(url_for("envios"))


@app.route("/envios")
def envios():
    conn = None
    cur = None
    try:
        conn = get_connection()
        cur = conn.cursor(dictionary=True)
        cur.execute("""
            SELECT e.id, e.id_venta, e.id_direccion, e.num_guia, e.estado,
                   d.direccion, d.colonia, d.codigo_postal
            FROM ENVIOS e
            LEFT JOIN DIRECCIONES d ON d.id = e.id_direccion
            ORDER BY e.id DESC
        """)
        rows = cur.fetchall()
        return render_template("envios.html", envios=rows, allowed_states=ALLOWED_STATES)
    except Error:
        app.logger.exception("Error al consultar los envíos")
        flash("No fue posible consultar los envíos. Verifica la conexión con MySQL.", "danger")
        return render_template("envios.html", envios=[], allowed_states=ALLOWED_STATES), 500
    finally:
        close_connection(conn, cur)


@app.route("/envios/nuevo", methods=["GET", "POST"])
def nuevo_envio():
    if request.method == "GET":
        return render_template("nuevo_envio.html", create_states=CREATE_STATES)

    id_venta_raw = request.form.get("id_venta", "").strip()
    id_direccion_raw = request.form.get("id_direccion", "").strip()
    num_guia = request.form.get("num_guia", "").strip()
    estado = request.form.get("estado", "").strip()

    if not num_guia:
        flash("El número de guía es obligatorio.", "danger")
        return render_template("nuevo_envio.html", create_states=CREATE_STATES), 400

    if len(num_guia) > 100:
        flash("El número de guía no puede superar 100 caracteres.", "danger")
        return render_template("nuevo_envio.html", create_states=CREATE_STATES), 400

    if estado not in CREATE_STATES:
        flash("El estado seleccionado no es válido para un nuevo envío.", "danger")
        return render_template("nuevo_envio.html", create_states=CREATE_STATES), 400

    try:
        id_venta = parse_positive_int(id_venta_raw, "ID de venta")
        id_direccion = parse_positive_int(id_direccion_raw, "ID de dirección")
    except ValueError as exc:
        flash(str(exc), "danger")
        return render_template("nuevo_envio.html", create_states=CREATE_STATES), 400

    conn = None
    cur = None
    try:
        conn = get_connection()
        cur = conn.cursor(dictionary=True)

        cur.execute("SELECT id FROM VENTAS WHERE id=%s", (id_venta,))
        if cur.fetchone() is None:
            flash("La venta indicada no existe.", "danger")
            return render_template("nuevo_envio.html", create_states=CREATE_STATES), 400

        cur.execute("SELECT id FROM DIRECCIONES WHERE id=%s", (id_direccion,))
        if cur.fetchone() is None:
            flash("La dirección indicada no existe.", "danger")
            return render_template("nuevo_envio.html", create_states=CREATE_STATES), 400

        cur.execute("SELECT id FROM ENVIOS WHERE num_guia=%s", (num_guia,))
        if cur.fetchone() is not None:
            flash("Ya existe un envío con ese número de guía.", "danger")
            return render_template("nuevo_envio.html", create_states=CREATE_STATES), 409

        cur.execute("""
            INSERT INTO ENVIOS (id_venta, id_direccion, num_guia, estado)
            VALUES (%s, %s, %s, %s)
        """, (id_venta, id_direccion, num_guia, estado))
        conn.commit()

        flash("Envío registrado correctamente.", "success")
        return redirect(url_for("envios"))
    except IntegrityError:
        if conn:
            conn.rollback()
        flash("No se pudo registrar el envío porque alguno de los datos no es válido o la guía ya existe.", "danger")
        return render_template("nuevo_envio.html", create_states=CREATE_STATES), 400
    except Error:
        if conn:
            conn.rollback()
        app.logger.exception("Error al registrar un envío")
        flash("Ocurrió un error al registrar el envío.", "danger")
        return render_template("nuevo_envio.html", create_states=CREATE_STATES), 500
    finally:
        close_connection(conn, cur)


@app.route("/envios/<int:id>/estado", methods=["POST"])
def actualizar_estado(id):
    estado = request.form.get("estado", "").strip()

    if estado not in ALLOWED_STATES:
        flash("El estado seleccionado no es válido.", "danger")
        return redirect(url_for("envios"))

    conn = None
    cur = None
    try:
        conn = get_connection()
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT estado FROM ENVIOS WHERE id=%s", (id,))
        envio = cur.fetchone()

        if envio is None:
            flash("El envío no existe.", "danger")
            return redirect(url_for("envios"))

        if envio["estado"] == "entregado" and estado != "entregado":
            flash("Un envío entregado no puede regresar a un estado anterior.", "warning")
            return redirect(url_for("envios"))

        cur.execute("UPDATE ENVIOS SET estado=%s WHERE id=%s", (estado, id))
        conn.commit()
        flash("Estado del envío actualizado.", "success")
        return redirect(url_for("envios"))
    except Error:
        if conn:
            conn.rollback()
        app.logger.exception("Error al actualizar el estado del envío %s", id)
        flash("No fue posible actualizar el estado del envío.", "danger")
        return redirect(url_for("envios"))
    finally:
        close_connection(conn, cur)


@app.route("/envios/<int:id>/entregar", methods=["POST"])
def validar_entrega(id):
    conn = None
    cur = None
    try:
        conn = get_connection()
        cur = conn.cursor(dictionary=True)
        conn.start_transaction()

        cur.execute("SELECT id, estado FROM ENVIOS WHERE id=%s FOR UPDATE", (id,))
        envio = cur.fetchone()

        if envio is None:
            conn.rollback()
            flash("El envío no existe.", "danger")
            return redirect(url_for("envios"))

        if envio["estado"] == "entregado":
            conn.rollback()
            flash("Este envío ya fue validado como entregado.", "warning")
            return redirect(url_for("envios"))

        if envio["estado"] == "cancelado":
            conn.rollback()
            flash("Un envío cancelado no puede marcarse como entregado.", "warning")
            return redirect(url_for("envios"))

        cur.execute("""
            INSERT INTO VALIDACION_ENTREGA
                (id_envio, fecha_entrega_real, estado)
            VALUES (%s, %s, %s)
        """, (id, datetime.now(), "entregado"))

        cur.execute("UPDATE ENVIOS SET estado=%s WHERE id=%s", ("entregado", id))
        conn.commit()

        flash("Entrega validada correctamente.", "success")
        return redirect(url_for("envios"))
    except Error:
        if conn:
            conn.rollback()
        app.logger.exception("Error al validar la entrega del envío %s", id)
        flash("No fue posible validar la entrega.", "danger")
        return redirect(url_for("envios"))
    finally:
        close_connection(conn, cur)


@app.route("/envios/buscar", methods=["GET"])
def buscar_envio():
    guia = request.args.get("guia", "").strip()
    conn = None
    cur = None

    try:
        conn = get_connection()
        cur = conn.cursor(dictionary=True)
        cur.execute("""
            SELECT e.id, e.id_venta, e.id_direccion, e.num_guia, e.estado,
                   d.direccion, d.colonia, d.codigo_postal
            FROM ENVIOS e
            LEFT JOIN DIRECCIONES d ON d.id = e.id_direccion
            WHERE e.num_guia LIKE %s
            ORDER BY e.id DESC
        """, (f"%{guia}%",))
        rows = cur.fetchall()
        return render_template(
            "envios.html",
            envios=rows,
            busqueda=guia,
            allowed_states=ALLOWED_STATES,
        )
    except Error:
        app.logger.exception("Error al buscar el envío")
        flash("No fue posible realizar la búsqueda. Verifica la conexión con MySQL.", "danger")
        return render_template(
            "envios.html",
            envios=[],
            busqueda=guia,
            allowed_states=ALLOWED_STATES,
        ), 500
    finally:
        close_connection(conn, cur)


if __name__ == "__main__":
    app.run(host=os.getenv("HOST", "127.0.0.1"), port=int(os.getenv("PORT", "5000")), debug=os.getenv("FLASK_DEBUG", "0") == "1")
