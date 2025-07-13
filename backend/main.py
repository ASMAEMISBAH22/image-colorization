from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import os
import uuid
import aiofiles
from pathlib import Path
import logging
from typing import Dict, Any
import json

from models.unet_model import UNetColorizer
from utils.image_processing import process_image, save_image
from utils.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Image Colorization API",
    description="AI-powered image colorization using U-Net model",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create necessary directories
UPLOAD_DIR = Path("uploads")
OUTPUT_DIR = Path("outputs")
UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

# Mount static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")

# Initialize model
colorizer = None

@app.on_event("startup")
async def startup_event():
    """Initialize the colorization model on startup"""
    global colorizer
    try:
        colorizer = UNetColorizer()
        logger.info("U-Net colorization model loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        colorizer = None

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Image Colorization API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": colorizer is not None,
        "timestamp": "2024-01-01T00:00:00Z"
    }

@app.get("/api/models")
async def get_models():
    """Get available models information"""
    return {
        "models": [
            {
                "name": "U-Net Colorizer",
                "description": "Deep learning model for image colorization",
                "architecture": "U-Net",
                "input_format": "Grayscale images",
                "output_format": "Color images",
                "status": "loaded" if colorizer else "not_loaded"
            }
        ]
    }

@app.post("/api/colorize")
async def colorize_image(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    """Colorize uploaded grayscale image"""
    
    # Validate file
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    if file.size > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=400, detail="File size too large (max 10MB)")
    
    # Check if model is loaded
    if colorizer is None:
        raise HTTPException(status_code=503, detail="Colorization model not available")
    
    try:
        # Generate unique filename
        file_id = str(uuid.uuid4())
        input_path = UPLOAD_DIR / f"{file_id}_input{Path(file.filename).suffix}"
        output_path = OUTPUT_DIR / f"{file_id}_output{Path(file.filename).suffix}"
        
        # Save uploaded file
        async with aiofiles.open(input_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Process image in background
        background_tasks.add_task(
            process_colorization,
            str(input_path),
            str(output_path),
            file_id
        )
        
        return {
            "message": "Image uploaded successfully",
            "file_id": file_id,
            "status": "processing",
            "input_url": f"/uploads/{input_path.name}",
            "output_url": f"/outputs/{output_path.name}",
            "progress_url": f"/api/progress/{file_id}"
        }
        
    except Exception as e:
        logger.error(f"Error processing image: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/progress/{file_id}")
async def get_progress(file_id: str):
    """Get processing progress for a file"""
    # In a real implementation, you'd track progress in a database or cache
    # For now, we'll return a simple status
    output_path = OUTPUT_DIR / f"{file_id}_output.jpg"
    
    if output_path.exists():
        return {
            "file_id": file_id,
            "status": "completed",
            "progress": 100,
            "output_url": f"/outputs/{output_path.name}"
        }
    else:
        return {
            "file_id": file_id,
            "status": "processing",
            "progress": 50  # Mock progress
        }

@app.get("/api/download/{file_id}")
async def download_result(file_id: str):
    """Download the colorized image"""
    output_path = OUTPUT_DIR / f"{file_id}_output.jpg"
    
    if not output_path.exists():
        raise HTTPException(status_code=404, detail="Result not found")
    
    return FileResponse(
        path=output_path,
        filename=f"colorized_{file_id}.jpg",
        media_type="image/jpeg"
    )

async def process_colorization(input_path: str, output_path: str, file_id: str):
    """Background task to process image colorization"""
    try:
        logger.info(f"Starting colorization for file {file_id}")
        
        # Process the image
        colorized_image = await process_image(input_path, colorizer)
        
        # Save the result
        await save_image(colorized_image, output_path)
        
        logger.info(f"Colorization completed for file {file_id}")
        
    except Exception as e:
        logger.error(f"Error in background colorization for {file_id}: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 