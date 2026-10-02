citas_db = [
    {
        "id": 1,
        "usuario_id": 101,
        "especialidad": "Medicina General",
        "profesional": "Dr. Carlos Mendoza",
        "fecha": "2026-10-07",
        "hora": "10:30:00",
        "motivo": "Consulta general de seguimiento",
        "estado": "CONFIRMADA",
        "lugar": "Seguro Social Universitario",
    },
    {
        "id": 2,
        "usuario_id": 101,
        "especialidad": "Odontología",
        "profesional": "Dra. Ana Flores",
        "fecha": "2026-10-12",
        "hora": "09:00:00",
        "motivo": "Revisión dental",
        "estado": "PENDIENTE",
        "lugar": "Clínica odontológica SSU",
    },
]

recordatorios_db = [
    {
        "id_recordatorio": 1,
        "id_cita": 1,
        "tiempo_recordatorio": "24 H",
        "activo": True,
        "fecha_programada": "2026-10-06T10:30:00",
        "enviado": False,
    },
    {
        "id_recordatorio": 2,
        "id_cita": 2,
        "tiempo_recordatorio": "12 H",
        "activo": True,
        "fecha_programada": "2026-10-11T09:00:00",
        "enviado": False,
    },
]

notificaciones_db = []

usuarios_db = []
