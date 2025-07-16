"""
Configuration d'optimisation mémoire pour PyTorch
"""
import os
import torch
import gc
from typing import Optional

class MemoryOptimizer:
    """Classe pour optimiser l'utilisation mémoire de PyTorch"""
    
    def __init__(self):
        self.device = self._get_device()
        self._configure_torch()
    
    def _get_device(self) -> str:
        """Détermine le meilleur device disponible"""
        if torch.cuda.is_available():
            # Vérifier la mémoire GPU disponible
            gpu_memory = torch.cuda.get_device_properties(0).total_memory / 1024**3  # GB
            if gpu_memory >= 4:  # Au moins 4GB de GPU
                return "cuda"
            else:
                print(f"⚠️  GPU disponible mais mémoire insuffisante ({gpu_memory:.1f}GB), utilisation CPU")
                return "cpu"
        else:
            return "cpu"
    
    def _configure_torch(self):
        """Configure PyTorch pour optimiser la mémoire"""
        # Configuration pour CPU
        if self.device == "cpu":
            # Limiter le nombre de threads pour éviter la surcharge
            torch.set_num_threads(min(4, os.cpu_count() or 4))
            
            # Configuration pour économiser la mémoire
            os.environ['OMP_NUM_THREADS'] = str(min(4, os.cpu_count() or 4))
            os.environ['MKL_NUM_THREADS'] = str(min(4, os.cpu_count() or 4))
            
            # Désactiver les optimisations gourmandes en mémoire
            torch.backends.cudnn.benchmark = False
            torch.backends.cudnn.deterministic = True
        
        # Configuration pour GPU
        elif self.device == "cuda":
            # Optimisations GPU
            torch.backends.cudnn.benchmark = True
            torch.backends.cudnn.deterministic = False
            
            # Limiter la mémoire GPU utilisée
            gpu_memory_fraction = 0.8  # Utiliser 80% de la mémoire GPU
            torch.cuda.set_per_process_memory_fraction(gpu_memory_fraction)
            
            # Activer le garbage collection automatique
            torch.cuda.empty_cache()
    
    def clear_memory(self):
        """Nettoie la mémoire"""
        gc.collect()
        if self.device == "cuda":
            torch.cuda.empty_cache()
    
    def load_model_optimized(self, model_path: str, model_class):
        """Charge un modèle avec optimisations mémoire"""
        try:
            # Charger le modèle sur le device approprié
            model = model_class()
            
            # Charger les poids
            checkpoint = torch.load(model_path, map_location=self.device)
            model.load_state_dict(checkpoint)
            
            # Déplacer vers le device
            model = model.to(self.device)
            
            # Mode évaluation pour économiser la mémoire
            model.eval()
            
            # Désactiver les gradients pour économiser la mémoire
            with torch.no_grad():
                pass
            
            print(f"✅ Modèle chargé sur {self.device}")
            return model
            
        except Exception as e:
            print(f"❌ Erreur lors du chargement du modèle: {e}")
            return None
    
    def process_image_optimized(self, model, image_tensor):
        """Traite une image avec optimisations mémoire"""
        try:
            # Nettoyer la mémoire avant le traitement
            self.clear_memory()
            
            # Déplacer l'image vers le device
            image_tensor = image_tensor.to(self.device)
            
            # Traitement avec optimisations
            with torch.no_grad():
                # Traitement par batch si nécessaire
                if image_tensor.dim() == 3:
                    image_tensor = image_tensor.unsqueeze(0)  # Ajouter dimension batch
                
                # Inférence
                output = model(image_tensor)
                
                # Nettoyer après le traitement
                del image_tensor
                self.clear_memory()
                
                return output
                
        except Exception as e:
            print(f"❌ Erreur lors du traitement: {e}")
            return None
    
    def get_memory_info(self):
        """Retourne les informations sur l'utilisation mémoire"""
        info = {
            "device": self.device,
            "cpu_memory": None,
            "gpu_memory": None
        }
        
        # Mémoire CPU
        import psutil
        process = psutil.Process()
        info["cpu_memory"] = {
            "rss": process.memory_info().rss / 1024**2,  # MB
            "vms": process.memory_info().vms / 1024**2,  # MB
            "percent": process.memory_percent()
        }
        
        # Mémoire GPU
        if self.device == "cuda":
            info["gpu_memory"] = {
                "allocated": torch.cuda.memory_allocated() / 1024**2,  # MB
                "cached": torch.cuda.memory_reserved() / 1024**2,  # MB
                "total": torch.cuda.get_device_properties(0).total_memory / 1024**2  # MB
            }
        
        return info

# Configuration globale
memory_optimizer = MemoryOptimizer()

# Variables d'environnement pour optimiser la mémoire
os.environ['PYTORCH_CUDA_ALLOC_CONF'] = 'max_split_size_mb:128'
os.environ['CUDA_LAUNCH_BLOCKING'] = '1'

# Configuration pour éviter les fuites mémoire
def configure_memory_settings():
    """Configure les paramètres mémoire globaux"""
    # Limiter la taille des pools de mémoire
    if hasattr(torch, 'set_memory_fraction'):
        torch.set_memory_fraction(0.8)  # Utiliser 80% de la mémoire disponible
    
    # Configuration pour les opérations sur CPU
    torch.set_num_threads(min(4, os.cpu_count() or 4))
    
    print("✅ Configuration mémoire optimisée")

# Appel automatique de la configuration
configure_memory_settings() 