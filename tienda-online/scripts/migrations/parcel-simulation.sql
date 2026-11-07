CREATE TABLE IF NOT EXISTS parcel_simulations (
 shipment_id BIGINT UNSIGNED PRIMARY KEY,
 tracking_number VARCHAR(120) NOT NULL UNIQUE,
 stage ENUM('label_pending','shipped','delivered') NOT NULL,
 validation_status ENUM('pendiente','validada','rechazada') NOT NULL DEFAULT 'pendiente',
 delivered_at DATETIME NULL,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(shipment_id) REFERENCES shipments(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS parcel_simulation_events (
 id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
 shipment_id BIGINT UNSIGNED NOT NULL,
 stage VARCHAR(30) NOT NULL,
 event_label VARCHAR(120) NOT NULL,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(shipment_id) REFERENCES shipments(id),
 INDEX(shipment_id,id)
) ENGINE=InnoDB;
