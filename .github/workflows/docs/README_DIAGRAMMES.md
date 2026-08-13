# Porto Market - Documentation des Diagrammes UML

## Vue d'ensemble

Porto Market est une application de gestion de marché et de livraison basée à Porto-Novo, Bénin. L'application permet aux clients de commander des produits du marché, aux buyers d'acheter les articles, et aux drivers de livrer les commandes.

## Fichiers de Diagrammes

Tous les diagrammes sont disponibles au format PlantUML dans le fichier `diagrammes_uml.puml`.

### Liste des Diagrammes

1. **MCD (Modèle Conceptuel de Données)** - Diagramme de classes
2. **Diagramme de Cas d'Utilisation** - Fonctionnalités par acteur
3. **Diagramme de Séquence - Passer une commande**
4. **Diagramme de Séquence - Achat au marché**
5. **Diagramme de Séquence - Livraison**
6. **Diagramme d'Activité - Cycle de vie d'une commande**
7. **Diagramme d'Activité - Gestion des batches**
8. **Diagramme d'État-Transition - Commande**
9. **Diagramme de Composants** - Architecture technique
10. **Diagramme de Déploiement** - Infrastructure

---

## 1. MCD - Modèle Conceptuel de Données

### Entités Principales

#### User (Utilisateur)
- **Rôles**: client, manager, chief_buyer, buyer, driver
- **Attributs**: uid, email, name, role, agency_id, phone_number
- **Relations**: 
  - Un utilisateur peut passer plusieurs commandes (si client)
  - Un utilisateur appartient à une agence

#### Agency (Agence)
- **Description**: Branche physique près d'un marché
- **Attributs**: id, name, market_name, location (JSON), cash_balance
- **Relations**: 
  - Une agence emploie plusieurs utilisateurs
  - Une agence reçoit plusieurs commandes

#### Order (Commande)
- **Statuts**: pending_payment → confirmed → buying → sorting → delivering → completed/cancelled
- **Attributs**: id, uid, client_id, agency_id, status, total_amount, delivery_address, tracking (JSON)
- **Relations**: 
  - Une commande contient plusieurs OrderItems
  - Une commande appartient à un client et une agence

#### OrderItem (Article de commande)
- **Statuts**: pending, assigned, bought, unavailable, substituted
- **Attributs**: id, order_id, batch_id, name, quantity, category, estimated_budget, actual_price
- **Relations**: 
  - Appartient à une commande
  - Peut être regroupé dans un batch
  - Peut avoir une proposition de substitution

#### Batch (Lot d'achat)
- **Description**: Regroupement d'articles par catégorie pour un buyer
- **Statuts**: preparing, active, completed
- **Attributs**: id, buyer_id, agency_id, category, status
- **Relations**: 
  - Un batch regroupe plusieurs OrderItems
  - Un batch est assigné à un buyer

#### Product (Produit)
- **Attributs**: id, name, description, price, unit, image, category_id, rating, available
- **Relations**: 
  - Un produit appartient à une catégorie
  - Un produit peut être commandé dans plusieurs OrderItems

#### Category (Catégorie)
- **Attributs**: id, name, icon, order
- **Exemples**: Céréales, Fruits, Légumes, Viandes & Poissons, Épices, Tubercules, Huilerie

#### SubstitutionProposal (Proposition de substitution)
- **Statuts**: pending, accepted, rejected
- **Attributs**: id, order_item_id, proposed_product_name, price, status
- **Description**: Permet de proposer un produit alternatif si l'article original est indisponible

#### CashLog (Journal de caisse)
- **Types**: credit, debit
- **Attributs**: id, agency_id, type, amount, description, user_id
- **Description**: Suivi des mouvements de trésorerie par agence

---

## 2. Acteurs et Cas d'Utilisation

### Client
- S'authentifier
- Consulter le catalogue
- Passer une commande
- Payer via Mobile Money (FedaPay/Kkiapay)
- Suivre sa commande en temps réel

### Manager
- S'authentifier
- Valider les commandes
- Gérer les équipes (users par agence)
- Gérer le catalogue produits
- Consulter les cash logs
- Suivre les livraisons

### Chief Buyer
- S'authentifier
- Créer des batches par catégorie
- Superviser les buyers
- Valider les substitutions de produits

### Buyer
- S'authentifier
- Marquer les articles comme achetés
- Proposer des substitutions
- Créer des batches

### Driver
- S'authentifier
- Commencer la livraison
- Compléter la livraison
- Mettre à jour la position GPS

---

## 3. Cycles de Vie

### Cycle de vie d'une commande

```
pending_payment
    ↓ (paiement validé)
confirmed
    ↓ (validation manager)
buying
    ↓ (tous articles traités)
sorting
    ↓ (préparation terminée)
delivering
    ↓ (livraison réussie)
completed
```

**Annulation possible depuis:**
- `pending_payment`: échec paiement ou timeout
- `confirmed`: refus du manager
- `delivering`: problème majeur

### Statuts des OrderItems

```
pending → assigned → bought ✓
                      → unavailable ❌
                      → substituted ⚠️
```

### Statuts des Batches

```
preparing → active → completed
```

---

## 4. Architecture Technique

### Frontend
- **Framework**: React + TypeScript
- **State Management**: Hooks personnalisés (useAuth)
- **UI Components**: Interfaces adaptatives par rôle

### Backend
- **Framework**: Laravel PHP (API REST)
- **ORM**: Eloquent
- **Base de données**: MySQL

### Services Cloud (Firebase)
- **Authentification**: Firebase Auth
- **Base de données temps réel**: Firestore
- **Collections principales**:
  - `/users/{uid}`
  - `/orders/{orderId}`
  - `/orders/{orderId}/items/{itemId}`
  - `/batches/{batchId}`
  - `/products/{productId}`
  - `/categories/{categoryId}`

### APIs Externes
- **Paiement**: FedaPay, Kkiapay (Mobile Money)
- **Cartographie**: Google Maps API (géolocalisation, routing)
- **Notifications**: Push notifications, SMS

---

## 5. Flux Principaux

### 5.1 Passer une commande

1. **Authentification**: Le client se connecte via Firebase Auth
2. **Consultation**: Navigation dans le catalogue produits
3. **Panier**: Ajout des articles avec quantités
4. **Validation**: Saisie de l'adresse et créneau de livraison
5. **Paiement**: Transaction via Mobile Money (USSD)
6. **Confirmation**: Statut passe à `confirmed`

### 5.2 Traitement de la commande

1. **Validation Manager**: Vérification de la commande
2. **Création des Batches**: Regroupement par catégorie
3. **Achat**: Les buyers achètent les articles au marché
4. **Marquage**: Chaque article est marqué (bought/unavailable/substituted)
5. **Tri**: Les articles sont triés par commande
6. **Livraison**: Assignment à un driver

### 5.3 Livraison

1. **Assignation**: Un driver est assigné à la commande
2. **Départ**: Statut passe à `delivering`
3. **Suivi GPS**: Position mise à jour toutes les 30 secondes
4. **Arrivée**: Livraison au client
5. **Complétion**: Statut passe à `completed`

---

## 6. Règles de Gestion

### Paiement
- Paiement obligatoire avant validation
- Support: Mobile Money (MTN MoMo, Moov Money)
- APIs: FedaPay et Kkiapay

### Substitutions
- Si un article est indisponible, le buyer propose un substitut
- Le client doit accepter ou refuser la substitution
- Si refusé, l'article est marqué `unavailable`

### Batches
- Regroupement intelligent par catégorie de produits
- Optimise les déplacements des buyers au marché
- Permet un suivi granulaire de l'avancement

### Trésorerie
- Chaque agence a un solde de caisse (`cash_balance`)
- Tous les mouvements sont tracés dans `cash_logs`
- Credits: remboursements, ajustements
- Debits: achats, dépenses opérationnelles

---

## 7. Visualiser les Diagrammes

Pour visualiser les diagrammes PlantUML:

### Option 1: Extension VS Code
1. Installer l'extension "PlantUML"
2. Ouvrir `docs/diagrammes_uml.puml`
3. Utiliser `Alt+D` pour prévisualiser

### Option 2: En ligne
1. Aller sur https://www.plantuml.com/plantuml/
2. Copier-coller le contenu d'un diagramme
3. Visualiser instantanément

### Option 3: CLI
```bash
# Installer PlantUML
java -jar plantuml.jar docs/diagrammes_uml.puml

# Génère les fichiers PNG/SVG
```

---

## 8. Technologies Clés

| Couche | Technologie | Rôle |
|--------|-------------|------|
| Frontend | React + TypeScript | Interface utilisateur |
| Backend | Laravel PHP | API REST, logique métier |
| Auth | Firebase Auth | Authentification sécurisée |
| DB Temps réel | Firestore | Données synchronisées |
| DB Relationnelle | MySQL | Données structurées |
| Paiement | FedaPay, Kkiapay | Mobile Money |
| Maps | Google Maps API | Géolocalisation |

---

## Contact et Support

Pour toute question sur l'architecture ou les diagrammes, consulter la documentation complète ou contacter l'équipe de développement.
