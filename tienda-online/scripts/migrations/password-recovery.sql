CREATE TABLE IF NOT EXISTS password_reset_tokens (
 token_hash CHAR(64) PRIMARY KEY,
 user_id INT UNSIGNED NOT NULL,
 expires_at DATETIME NOT NULL,
 used_at DATETIME NULL,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(user_id) REFERENCES usuarios(id),
 INDEX(user_id,used_at), INDEX(expires_at)
) ENGINE=InnoDB;
