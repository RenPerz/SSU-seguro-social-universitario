CREATE DATABASE IF NOT EXISTS seguro_social_universitario;
USE seguro_social_universitario;

CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT NOT NULL AUTO_INCREMENT,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    ci VARCHAR(20) NOT NULL,
    email VARCHAR(120) NOT NULL,
    telefono VARCHAR(30) NULL,
    tipo_usuario VARCHAR(30) NOT NULL DEFAULT 'estudiante',
    fecha_nacimiento DATE NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id_usuario),
    UNIQUE KEY uk_usuarios_ci (ci),
    UNIQUE KEY uk_usuarios_email (email),
    INDEX idx_usuarios_tipo (tipo_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS especialidades (
    id_especialidad INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_especialidad),
    UNIQUE KEY uk_especialidades_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS profesionales (
    id_profesional INT NOT NULL AUTO_INCREMENT,
    id_especialidad INT NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    titulo VARCHAR(120) NULL,
    telefono VARCHAR(30) NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'ACTIVO',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_profesional),
    CONSTRAINT fk_profesionales_especialidad
        FOREIGN KEY (id_especialidad) REFERENCES especialidades (id_especialidad)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    INDEX idx_profesionales_especialidad (id_especialidad)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS citas (
    id_cita INT NOT NULL AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    id_profesional INT NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    motivo VARCHAR(300) NOT NULL,
    estado ENUM('PENDIENTE', 'CONFIRMADA', 'CANCELADA') NOT NULL DEFAULT 'PENDIENTE',
    lugar VARCHAR(200) NOT NULL DEFAULT 'Seguro Social Universitario',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id_cita),
    CONSTRAINT fk_citas_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_citas_profesional
        FOREIGN KEY (id_profesional) REFERENCES profesionales (id_profesional)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    INDEX idx_citas_usuario (id_usuario),
    INDEX idx_citas_fecha (fecha),
    INDEX idx_citas_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS recordatorios (
    id_recordatorio INT NOT NULL AUTO_INCREMENT,
    id_cita INT NOT NULL,
    tiempo_recordatorio ENUM('24 H', '12 H', '1 H') NOT NULL DEFAULT '24 H',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id_recordatorio),
    CONSTRAINT fk_recordatorios_cita
        FOREIGN KEY (id_cita) REFERENCES citas (id_cita)
        ON UPDATE CASCADE ON DELETE CASCADE,
    INDEX idx_recordatorios_cita (id_cita),
    INDEX idx_recordatorios_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO especialidades (nombre, descripcion) VALUES
('Medicina General', 'Atención primaria y control general de salud'),
('Odontología', 'Atención clínica odontológica'),
('Cardiología', 'Evaluación y seguimiento cardiovascular')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

INSERT INTO profesionales (id_especialidad, nombres, apellidos, titulo, telefono, estado) VALUES
(1, 'Carlos', 'Mendoza', 'Médico General', '70123456', 'ACTIVO'),
(2, 'Ana', 'Flores', 'Odontóloga', '70234567', 'ACTIVO'),
(3, 'Luis', 'Ramos', 'Cardiólogo', '70345678', 'ACTIVO')
ON DUPLICATE KEY UPDATE nombres = VALUES(nombres);

INSERT INTO usuarios (nombres, apellidos, ci, email, telefono, tipo_usuario, fecha_nacimiento) VALUES
('María', 'Pérez', '1234567', 'maria.perez@universitario.bo', '70987654', 'estudiante', '2001-05-14'),
('José', 'García', '7654321', 'jose.garcia@universitario.bo', '70123459', 'estudiante', '2000-11-25')
ON DUPLICATE KEY UPDATE email = VALUES(email);

INSERT INTO citas (id_usuario, id_profesional, fecha, hora, motivo, estado, lugar) VALUES
(1, 1, '2026-10-07', '10:30:00', 'Consulta general de seguimiento', 'CONFIRMADA', 'Seguro Social Universitario'),
(1, 2, '2026-10-12', '09:00:00', 'Revisión dental', 'PENDIENTE', 'Clínica odontológica SSU')
ON DUPLICATE KEY UPDATE motivo = VALUES(motivo);

INSERT INTO recordatorios (id_cita, tiempo_recordatorio, activo) VALUES
(1, '24 H', TRUE),
(2, '12 H', TRUE)
ON DUPLICATE KEY UPDATE activo = VALUES(activo);
