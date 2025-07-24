from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import docker
import asyncio
import uuid

app = FastAPI(title="TOTS Meet Assistant API")

class MeetingRequest(BaseModel):
    platform: str = "google_meet"
    native_meeting_id: str  # xxx-yyyy-zzz de Google Meet
    bot_name: str = "TOTS Notetaker"
    language: str = "es"

@app.post("/bots")
async def request_bot(req: MeetingRequest):
    """Crear un bot para unirse a una reunión"""
    
    # 1. Crear container con Playwright
    container_id = await start_bot_container(
        meeting_url=f"https://meet.google.com/{req.native_meeting_id}",
        bot_name=req.bot_name,
        language=req.language
    )
    
    # 2. Retornar información del bot
    return {
        "meeting_id": req.native_meeting_id,
        "bot_container_id": container_id,
        "status": "requested",
        "message": "Bot solicitado - será admitido en ~10 segundos"
    }

@app.get("/transcripts/{meeting_id}")
async def get_transcript(meeting_id: str):
    """Obtener transcripción en tiempo real"""
    # Implementar lógica para obtener transcripción
    return {"transcript": "Transcripción en tiempo real..."}

@app.delete("/bots/{meeting_id}")
async def stop_bot(meeting_id: str):
    """Remover bot de la reunión"""
    # Implementar lógica para detener container
    return {"status": "stopped"}

async def start_bot_container(meeting_url: str, bot_name: str, language: str):
    """Iniciar container Docker con el bot"""
    client = docker.from_env()
    
    container = client.containers.run(
        "tots-meet-bot:latest",  # Tu imagen Docker
        environment={
            "MEETING_URL": meeting_url,
            "BOT_NAME": bot_name,
            "LANGUAGE": language
        },
        detach=True
    )
    
    return container.id
