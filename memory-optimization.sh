#!/bin/bash

# Script d'optimisation mémoire pour l'application de colorisation d'images
# Usage: ./memory-optimization.sh [start|stop|status|optimize|monitor]

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TOTAL_MEMORY_LIMIT="4G"
BACKEND_MEMORY_LIMIT="2G"
FRONTEND_MEMORY_LIMIT="512M"
REDIS_MEMORY_LIMIT="256M"

# Fonction d'affichage
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

# Fonction pour vérifier l'utilisation mémoire
check_memory_usage() {
    print_status "Vérification de l'utilisation mémoire..."
    
    # Mémoire système
    total_mem=$(free -h | grep Mem | awk '{print $2}')
    used_mem=$(free -h | grep Mem | awk '{print $3}')
    free_mem=$(free -h | grep Mem | awk '{print $4}')
    mem_percent=$(free | grep Mem | awk '{printf("%.1f", $3/$2 * 100.0)}')
    
    echo "📊 Utilisation mémoire système:"
    echo "   Total: $total_mem"
    echo "   Utilisée: $used_mem"
    echo "   Libre: $free_mem"
    echo "   Pourcentage: ${mem_percent}%"
    
    # Mémoire Docker
    if command -v docker &> /dev/null; then
        echo ""
        echo "🐳 Utilisation mémoire Docker:"
        docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
    fi
    
    # Alertes
    if (( $(echo "$mem_percent > 80" | bc -l) )); then
        print_warning "Utilisation mémoire élevée: ${mem_percent}%"
    fi
    
    if (( $(echo "$mem_percent > 90" | bc -l) )); then
        print_error "Utilisation mémoire critique: ${mem_percent}%"
    fi
}

# Fonction pour optimiser la mémoire
optimize_memory() {
    print_status "Optimisation de la mémoire..."
    
    # Nettoyage du cache système
    print_status "Nettoyage du cache système..."
    sudo sync
    echo 3 | sudo tee /proc/sys/vm/drop_caches > /dev/null 2>&1 || true
    
    # Nettoyage des conteneurs Docker arrêtés
    print_status "Nettoyage des conteneurs Docker arrêtés..."
    docker container prune -f 2>/dev/null || true
    
    # Nettoyage des images Docker non utilisées
    print_status "Nettoyage des images Docker non utilisées..."
    docker image prune -f 2>/dev/null || true
    
    # Nettoyage des volumes Docker non utilisés
    print_status "Nettoyage des volumes Docker non utilisés..."
    docker volume prune -f 2>/dev/null || true
    
    # Nettoyage du cache npm
    print_status "Nettoyage du cache npm..."
    npm cache clean --force 2>/dev/null || true
    
    # Nettoyage du cache pip
    print_status "Nettoyage du cache pip..."
    pip cache purge 2>/dev/null || true
    
    print_success "Optimisation mémoire terminée"
}

# Fonction pour démarrer les services avec optimisations
start_services() {
    print_status "Démarrage des services avec optimisations mémoire..."
    
    # Vérifier l'espace disque
    disk_usage=$(df -h . | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$disk_usage" -gt 90 ]; then
        print_warning "Espace disque faible: ${disk_usage}%"
    fi
    
    # Démarrer avec les limites de ressources
    docker-compose up -d
    
    # Attendre que les services soient prêts
    print_status "Attente du démarrage des services..."
    sleep 30
    
    # Vérifier l'état des services
    docker-compose ps
    
    print_success "Services démarrés avec optimisations"
}

# Fonction pour arrêter les services
stop_services() {
    print_status "Arrêt des services..."
    docker-compose down
    print_success "Services arrêtés"
}

# Fonction pour surveiller en continu
monitor_services() {
    print_status "Surveillance continue des services (Ctrl+C pour arrêter)..."
    
    while true; do
        clear
        echo "🔄 Surveillance en temps réel - $(date)"
        echo "=================================="
        
        check_memory_usage
        
        echo ""
        echo "📈 État des conteneurs:"
        docker-compose ps
        
        echo ""
        echo "⏰ Prochaine vérification dans 30 secondes..."
        sleep 30
    done
}

# Fonction pour afficher le statut
show_status() {
    print_status "Statut des services..."
    
    echo "🔍 État des conteneurs:"
    docker-compose ps
    
    echo ""
    check_memory_usage
    
    echo ""
    echo "📋 Configuration des limites mémoire:"
    echo "   Backend: $BACKEND_MEMORY_LIMIT"
    echo "   Frontend: $FRONTEND_MEMORY_LIMIT"
    echo "   Redis: $REDIS_MEMORY_LIMIT"
    echo "   Total: $TOTAL_MEMORY_LIMIT"
}

# Fonction d'aide
show_help() {
    echo "Usage: $0 [COMMANDE]"
    echo ""
    echo "Commandes disponibles:"
    echo "  start     - Démarrer les services avec optimisations"
    echo "  stop      - Arrêter tous les services"
    echo "  status    - Afficher le statut des services et l'utilisation mémoire"
    echo "  optimize  - Optimiser la mémoire (nettoyage cache, etc.)"
    echo "  monitor   - Surveillance continue en temps réel"
    echo "  help      - Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0 start      # Démarrer avec optimisations"
    echo "  $0 monitor    # Surveiller en continu"
    echo "  $0 optimize   # Nettoyer la mémoire"
}

# Gestion des arguments
case "${1:-help}" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    status)
        show_status
        ;;
    optimize)
        optimize_memory
        ;;
    monitor)
        monitor_services
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Commande inconnue: $1"
        show_help
        exit 1
        ;;
esac 