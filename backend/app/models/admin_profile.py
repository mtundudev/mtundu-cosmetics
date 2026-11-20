from sqlalchemy import Column, Integer, String
from backend.app.db.base import Base


class AdminProfile(Base):
    __tablename__ = "admin_profiles"

    id = Column(Integer, primary_key=True)
    display_name = Column(String(120), nullable=False, default="Msimamizi")
    avatar_path = Column(String(255), nullable=True)
