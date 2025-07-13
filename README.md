# Image Colorization Project

A full-stack image colorization application using Next.js frontend, FastAPI backend, and U-Net deep learning model.

## Features

- 🎨 AI-powered image colorization
- 📱 Modern responsive web interface
- 🚀 FastAPI backend with real-time processing
- 🤖 U-Net deep learning model
- 🔄 GitHub Actions CI/CD pipeline
- 📊 Real-time progress tracking
- 💾 Image upload and download

## Tech Stack

### Frontend
- Next.js (JavaScript, no app directory)
- React
- Tailwind CSS
- Axios for API calls

### Backend
- FastAPI
- Python 3.9+
- PyTorch
- OpenCV
- Pillow

### AI/ML
- U-Net architecture
- PyTorch Lightning
- Pre-trained colorization model

### DevOps
- GitHub Actions
- Docker
- Environment management

## Project Structure

```
image-colorization/
├── frontend/                 # Next.js frontend
├── backend/                  # FastAPI backend
├── models/                   # U-Net model files
├── .github/
│   └── workflows/           # GitHub Actions
├── docker-compose.yml       # Docker orchestration
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- Docker (optional)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd image-colorization
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Docker Setup

```bash
docker-compose up --build
```

## API Endpoints

- `POST /api/colorize` - Upload and colorize an image
- `GET /api/health` - Health check
- `GET /api/models` - List available models

## Model Information

The U-Net model is trained on a large dataset of grayscale and color image pairs. It uses:
- Encoder-decoder architecture
- Skip connections for better detail preservation
- Pre-trained weights for faster inference

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details 