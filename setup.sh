#!/bin/bash

# Image Colorization Project Setup Script
# This script sets up the complete development environment

set -e  # Exit on any error

echo "🎨 Setting up Image Colorization Project..."
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed. Please install Python 3.9+"
        exit 1
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm"
        exit 1
    fi
    
    # Check Docker (optional)
    if ! command -v docker &> /dev/null; then
        print_warning "Docker is not installed. Docker setup will be skipped."
        DOCKER_AVAILABLE=false
    else
        DOCKER_AVAILABLE=true
    fi
    
    print_success "System requirements check completed"
}

# Setup Python backend
setup_backend() {
    print_status "Setting up Python backend..."
    
    cd backend
    
    # Create virtual environment
    if [ ! -d "venv" ]; then
        print_status "Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    print_status "Activating virtual environment..."
    source venv/bin/activate
    
    # Upgrade pip
    print_status "Upgrading pip..."
    pip install --upgrade pip
    
    # Install dependencies
    print_status "Installing Python dependencies..."
    pip install -r requirements.txt
    
    # Create necessary directories
    print_status "Creating necessary directories..."
    mkdir -p uploads outputs logs
    
    cd ..
    print_success "Backend setup completed"
}

# Setup Node.js frontend
setup_frontend() {
    print_status "Setting up Node.js frontend..."
    
    cd frontend
    
    # Install dependencies
    print_status "Installing Node.js dependencies..."
    npm install
    
    # Create necessary directories
    print_status "Creating necessary directories..."
    mkdir -p public/uploads
    
    cd ..
    print_success "Frontend setup completed"
}

# Setup Docker (if available)
setup_docker() {
    if [ "$DOCKER_AVAILABLE" = true ]; then
        print_status "Setting up Docker environment..."
        
        # Build Docker images
        print_status "Building Docker images..."
        docker-compose build
        
        print_success "Docker setup completed"
    else
        print_warning "Skipping Docker setup (Docker not available)"
    fi
}

# Create environment files
create_env_files() {
    print_status "Creating environment files..."
    
    # Backend .env
    if [ ! -f "backend/.env" ]; then
        cat > backend/.env << EOF
# Backend Environment Variables
ENVIRONMENT=development
LOG_LEVEL=INFO
DEVICE=cpu
SECRET_KEY=your-secret-key-change-in-production
API_BASE_URL=http://localhost:8000
EOF
        print_success "Created backend/.env"
    fi
    
    # Frontend .env.local
    if [ ! -f "frontend/.env.local" ]; then
        cat > frontend/.env.local << EOF
# Frontend Environment Variables
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NODE_ENV=development
EOF
        print_success "Created frontend/.env.local"
    fi
}

# Run tests
run_tests() {
    print_status "Running tests..."
    
    # Backend tests
    print_status "Running backend tests..."
    cd backend
    source venv/bin/activate
    python -m pytest tests/ -v
    cd ..
    
    # Frontend tests
    print_status "Running frontend tests..."
    cd frontend
    npm test -- --watchAll=false
    cd ..
    
    print_success "All tests passed"
}

# Display setup completion
show_completion() {
    echo ""
    echo "🎉 Setup completed successfully!"
    echo "================================="
    echo ""
    echo "Next steps:"
    echo "1. Start the backend:"
    echo "   cd backend && source venv/bin/activate && uvicorn main:app --reload"
    echo ""
    echo "2. Start the frontend (in a new terminal):"
    echo "   cd frontend && npm run dev"
    echo ""
    echo "3. Or use Docker (if available):"
    echo "   docker-compose up"
    echo ""
    echo "4. Access the application:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:8000"
    echo "   API Docs: http://localhost:8000/docs"
    echo ""
    echo "Happy coding! 🚀"
}

# Main setup function
main() {
    check_requirements
    setup_backend
    setup_frontend
    setup_docker
    create_env_files
    
    # Ask if user wants to run tests
    read -p "Do you want to run tests? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        run_tests
    fi
    
    show_completion
}

# Run main function
main "$@" 