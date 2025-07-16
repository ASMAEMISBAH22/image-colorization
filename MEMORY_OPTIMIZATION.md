# 🔧 Guide d'Optimisation Mémoire

## 🚨 Problème : Mémoire serveur SSH à 100%

Votre serveur SSH consomme 100% de sa mémoire à cause de l'application de colorisation d'images. Voici les solutions complètes.

## 📊 Causes identifiées

### 1. **PyTorch et modèles d'IA gourmands**
- PyTorch 2.1.1 + torchvision chargent des modèles lourds
- Les modèles de colorisation peuvent consommer 2-4GB de RAM
- Pas de limites de ressources configurées

### 2. **Services multiples sans limites**
- Backend (FastAPI + PyTorch)
- Frontend (Next.js)
- Redis, Nginx, Prometheus, Grafana
- Tous sans limites de mémoire

### 3. **Configuration Docker non optimisée**
- Pas de limites de ressources
- Pas de nettoyage automatique
- Cache non géré

## 🛠️ Solutions implémentées

### 1. **Limites de ressources Docker**

Le fichier `docker-compose.yml` a été mis à jour avec des limites strictes :

```yaml
deploy:
  resources:
    limits:
      memory: 2G    # Backend limité à 2GB
      cpus: '1.0'
    reservations:
      memory: 1G
      cpus: '0.5'
```

**Limites par service :**
- **Backend** : 2GB max (PyTorch + modèle)
- **Frontend** : 512MB max (Next.js)
- **Redis** : 256MB max (cache)
- **Nginx** : 128MB max (proxy)
- **Prometheus** : 512MB max (monitoring)
- **Grafana** : 256MB max (visualisation)

### 2. **Script d'optimisation mémoire**

Utilisez le script `memory-optimization.sh` :

```bash
# Rendre le script exécutable
chmod +x memory-optimization.sh

# Démarrer avec optimisations
./memory-optimization.sh start

# Surveiller en temps réel
./memory-optimization.sh monitor

# Optimiser la mémoire
./memory-optimization.sh optimize

# Vérifier le statut
./memory-optimization.sh status
```

### 3. **Optimisations PyTorch**

Le fichier `backend/memory_config.py` contient :

- **Gestion automatique device** (CPU/GPU)
- **Limitation threads CPU**
- **Nettoyage mémoire automatique**
- **Chargement optimisé des modèles**

## 🚀 Utilisation recommandée

### Démarrage sécurisé

```bash
# 1. Arrêter tous les services
docker-compose down

# 2. Nettoyer la mémoire
./memory-optimization.sh optimize

# 3. Démarrer avec optimisations
./memory-optimization.sh start

# 4. Surveiller
./memory-optimization.sh monitor
```

### Surveillance continue

```bash
# Dans un terminal séparé
./memory-optimization.sh monitor
```

### Nettoyage automatique

Ajoutez au crontab pour un nettoyage quotidien :

```bash
# Éditer le crontab
crontab -e

# Ajouter cette ligne pour nettoyer à 2h du matin
0 2 * * * /chemin/vers/votre/projet/memory-optimization.sh optimize
```

## 📈 Monitoring et alertes

### Vérifications automatiques

Le script surveille :
- **Utilisation mémoire système** (alertes à 80% et 90%)
- **Mémoire par conteneur Docker**
- **Espace disque**
- **État des services**

### Alertes configurées

- ⚠️ **Warning** : > 80% mémoire utilisée
- 🚨 **Critical** : > 90% mémoire utilisée
- 💾 **Disk** : > 90% espace disque utilisé

## 🔧 Optimisations supplémentaires

### 1. **Configuration Redis optimisée**

```bash
# Dans docker-compose.yml, Redis utilise :
command: redis-server --appendonly yes --maxmemory 200mb --maxmemory-policy allkeys-lru
```

### 2. **Variables d'environnement PyTorch**

```bash
# Ajoutées automatiquement dans memory_config.py
PYTORCH_CUDA_ALLOC_CONF=max_split_size_mb:128
CUDA_LAUNCH_BLOCKING=1
OMP_NUM_THREADS=4
MKL_NUM_THREADS=4
```

### 3. **Nettoyage automatique**

Le script nettoie :
- Cache système
- Conteneurs Docker arrêtés
- Images Docker non utilisées
- Cache npm et pip

## 🆘 Dépannage

### Si la mémoire reste élevée

```bash
# 1. Vérifier les processus gourmands
docker stats

# 2. Nettoyer en profondeur
./memory-optimization.sh optimize

# 3. Redémarrer les services
./memory-optimization.sh stop
./memory-optimization.sh start

# 4. Vérifier les logs
docker-compose logs backend
```

### Si un service plante

```bash
# 1. Vérifier les logs
docker-compose logs [service_name]

# 2. Augmenter temporairement les limites
# Modifier docker-compose.yml et redémarrer

# 3. Vérifier l'espace disque
df -h
```

## 📋 Checklist de vérification

- [ ] Script `memory-optimization.sh` exécutable
- [ ] Limites de ressources dans `docker-compose.yml`
- [ ] `memory_config.py` dans le backend
- [ ] `psutil` ajouté aux dépendances
- [ ] Services démarrés avec `./memory-optimization.sh start`
- [ ] Surveillance active avec `./memory-optimization.sh monitor`
- [ ] Nettoyage automatique configuré (crontab)

## 🎯 Résultats attendus

Après application de ces optimisations :

- **Mémoire utilisée** : < 80% en fonctionnement normal
- **Stabilité** : Services plus stables, moins de plantages
- **Performance** : Meilleure réactivité du serveur
- **Monitoring** : Surveillance en temps réel avec alertes

## 📞 Support

Si les problèmes persistent :

1. Vérifiez les logs : `docker-compose logs`
2. Surveillez en temps réel : `./memory-optimization.sh monitor`
3. Optimisez : `./memory-optimization.sh optimize`
4. Redémarrez : `./memory-optimization.sh stop && ./memory-optimization.sh start` 