from dataclasses import dataclass
from datetime import date, time


@dataclass
class CitaModel:
    id: int
    usuario_id: int
    especialidad: str
    profesional: str
    fecha: date
    hora: time
    motivo: str
    estado: str = "PENDIENTE"
    lugar: str = "Seguro Social Universitario"
