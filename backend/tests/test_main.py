import pytest
from fastapi.testclient import TestClient
from main import app
import os
import tempfile
from PIL import Image
import io

client = TestClient(app)

def create_test_image():
    """Create a test grayscale image"""
    img = Image.new('L', (100, 100), color=128)
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    return img_bytes

def test_root_endpoint():
    """Test the root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert data["message"] == "Image Colorization API"

def test_health_check():
    """Test the health check endpoint"""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "model_loaded" in data

def test_models_endpoint():
    """Test the models endpoint"""
    response = client.get("/api/models")
    assert response.status_code == 200
    data = response.json()
    assert "models" in data
    assert len(data["models"]) > 0

def test_colorize_endpoint_with_valid_image():
    """Test colorization with a valid image"""
    img_bytes = create_test_image()
    
    files = {"file": ("test.jpg", img_bytes, "image/jpeg")}
    response = client.post("/api/colorize", files=files)
    
    # Should return 200 or 503 (if model not loaded)
    assert response.status_code in [200, 503]
    
    if response.status_code == 200:
        data = response.json()
        assert "file_id" in data
        assert "status" in data

def test_colorize_endpoint_with_invalid_file():
    """Test colorization with an invalid file"""
    # Create a text file instead of image
    files = {"file": ("test.txt", b"not an image", "text/plain")}
    response = client.post("/api/colorize", files=files)
    assert response.status_code == 400

def test_colorize_endpoint_without_file():
    """Test colorization without file"""
    response = client.post("/api/colorize")
    assert response.status_code == 422

def test_progress_endpoint():
    """Test the progress endpoint"""
    # Test with a non-existent file ID
    response = client.get("/api/progress/nonexistent-id")
    assert response.status_code == 200
    data = response.json()
    assert "file_id" in data
    assert "status" in data

def test_download_endpoint():
    """Test the download endpoint"""
    # Test with a non-existent file ID
    response = client.get("/api/download/nonexistent-id")
    assert response.status_code == 404

@pytest.mark.asyncio
async def test_process_image():
    """Test image processing function"""
    from utils.image_processing import process_image, validate_image
    
    # Create a temporary test image
    with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp_file:
        img = Image.new('L', (100, 100), color=128)
        img.save(tmp_file.name, format='JPEG')
        
        # Test validation
        assert validate_image(tmp_file.name) == True
        
        # Clean up
        os.unlink(tmp_file.name)

def test_image_validation():
    """Test image validation"""
    from utils.image_processing import validate_image
    
    # Test with non-existent file
    assert validate_image("nonexistent.jpg") == False
    
    # Test with valid image
    img_bytes = create_test_image()
    with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp_file:
        tmp_file.write(img_bytes.getvalue())
        tmp_file.flush()
        
        assert validate_image(tmp_file.name) == True
        os.unlink(tmp_file.name) 