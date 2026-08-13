import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  getDocs,
  query,
  orderBy
} from "firebase/firestore";
import { db } from "../firebase";

export interface ProductAttribute {
  name: string;
  value: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  sku?: string;
  available: boolean;
}

export interface Product {
  id?: string;
  name: string;
  description?: string;
  price: number;
  unit: string;
  image: string;
  images?: string[];
  category: string;
  rating?: number;
  featured?: boolean;
  available: boolean;
  attributes?: ProductAttribute[];
  variants?: ProductVariant[];
  isFlexible?: boolean;
  minPrice?: number;
  minQuantity?: number;
}

export interface Category {
  id?: string;
  name: string;
  icon: string;
  order: number;
}

export async function addProduct(product: Omit<Product, 'id'>) {
  return await addDoc(collection(db, "products"), {
    ...product,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function seedCatalog() {
  const categories = [
    { name: "Céréales", icon: "🌽", order: 1 },
    { name: "Fruits", icon: "🥭", order: 2 },
    { name: "Légumes", icon: "🍅", order: 3 },
    { name: "Viandes & Poissons", icon: "🥩", order: 4 },
    { name: "Épices", icon: "🌶️", order: 5 },
    { name: "Tubercules", icon: "🍠", order: 6 },
    { name: "Huilerie", icon: "🧴", order: 7 },
  ];

  const products = [
    // Céréales
    { 
      name: "Maïs Blanc", 
      price: 450, 
      unit: "kg", 
      image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=400", 
      category: "Céréales", 
      available: true, 
      featured: true,
      description: "Maïs blanc de qualité supérieure, récolté localement à Porto-Novo. Idéal pour votre pâte quotidienne.",
      rating: 4.8,
      attributes: [{ name: "Origine", value: "Bénin" }, { name: "Qualité", value: "Bio" }]
    },
    { 
      name: "Gari Sohoui", 
      price: 350, 
      unit: "kg", 
      image: "https://images.unsplash.com/photo-1627311197479-7a064bc3e824?auto=format&fit=crop&q=80&w=400", 
      category: "Céréales", 
      available: true, 
      description: "Gari fin et croquant, idéal pour les repas rapides ou les accompagnements.",
      rating: 4.9,
      variants: [
        { id: "1", name: "Sachet 1kg", price: 350, available: true },
        { id: "2", name: "Sac 5kg", price: 1600, available: true }
      ]
    },
    { 
      name: "Riz Local", 
      price: 600, 
      unit: "kg", 
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400", 
      category: "Céréales", 
      available: true, 
      description: "Riz parfumé produit localement, sans additifs.",
      rating: 4.7,
      isFlexible: true,
      minPrice: 100
    },
    // Fruits & Légumes
    { 
      name: "Tomates Fraîches", 
      price: 800, 
      unit: "panier", 
      image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=400", 
      category: "Légumes", 
      available: true,
      description: "Tomates charnues et mûres à point, directement du champ.",
      rating: 4.5,
      isFlexible: true,
      minPrice: 200
    },
    { 
      name: "Ananas Pain de Sucre", 
      price: 500, 
      unit: "unité", 
      image: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&q=80&w=400", 
      category: "Fruits", 
      available: true,
      featured: true,
      description: "Le célèbre ananas sucré du Bénin.",
      rating: 5.0,
      isFlexible: true,
      minPrice: 500 // On vend à l'unité minimum
    },
    { 
      name: "Carottes", 
      price: 300, 
      unit: "kg", 
      image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&q=80&w=400", 
      category: "Légumes", 
      available: true,
      description: "Carottes croquantes.",
      rating: 4.4,
      isFlexible: true,
      minPrice: 100
    },
    // Tubercules
    { 
      name: "Ignames", 
      price: 1500, 
      unit: "tas", 
      image: "https://images.unsplash.com/photo-1628172826767-f316279f061f?auto=format&fit=crop&q=80&w=400", 
      category: "Tubercules", 
      available: true,
      description: "Ignames de qualité supérieure, parfaites pour le pilé.",
      rating: 4.9,
      isFlexible: true,
      minPrice: 500
    },
    { 
      name: "Manioc", 
      price: 1000, 
      unit: "tas", 
      image: "https://images.unsplash.com/photo-1628172826649-1be7f2bc2927?auto=format&fit=crop&q=80&w=400", 
      category: "Tubercules", 
      available: true,
      description: "Manioc frais.",
      rating: 4.3,
      isFlexible: true,
      minPrice: 500
    },
    // Épices & Huiles
    { 
      name: "Huile de palme", 
      price: 1200, 
      unit: "L", 
      image: "https://images.unsplash.com/photo-1628172826508-e7379261c33f?auto=format&fit=crop&q=80&w=400", 
      category: "Huilerie", 
      available: true,
      description: "Huile de palme rouge naturelle, riche en vitamines.",
      rating: 4.6,
      isFlexible: true,
      minPrice: 100
    },
    { 
      name: "Piment Sec", 
      price: 500, 
      unit: "Pot", 
      image: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&q=80&w=400", 
      category: "Épices", 
      available: true,
      description: "Piment rouge séché au soleil, très piquant.",
      rating: 4.7,
      isFlexible: true,
      minPrice: 50
    },
    // Viandes
    { 
      name: "Poisson Fumé", 
      price: 2500, 
      unit: "tas", 
      image: "https://images.unsplash.com/photo-1626027376711-20947ba94a4c?auto=format&fit=crop&q=80&w=400", 
      category: "Viandes & Poissons", 
      available: true,
      featured: true,
      description: "Poisson fumé traditionnellement, goût exceptionnel pour vos sauces.",
      rating: 4.8
    },
    { 
      name: "Viande de Mouton", 
      price: 4500, 
      unit: "kg", 
      image: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&q=80&w=400", 
      category: "Viandes & Poissons", 
      available: true,
      description: "Viande de mouton fraîche.",
      rating: 4.5
    }
  ];

  // Add categories
  for (const cat of categories) {
    await addCategory(cat);
  }

  // Add products
  for (const prod of products) {
    await addProduct(prod as any);
  }
}

export async function updateProduct(productId: string, data: Partial<Product>) {
  const productRef = doc(db, "products", productId);
  await updateDoc(productRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
}

export async function deleteProduct(productId: string) {
  await deleteDoc(doc(db, "products", productId));
}

export async function addCategory(category: Omit<Category, 'id'>) {
  return await addDoc(collection(db, "categories"), {
    ...category,
    createdAt: serverTimestamp()
  });
}

export async function getProducts() {
  const q = query(collection(db, "products"), orderBy("category"));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}

export async function getCategories() {
  const q = query(collection(db, "categories"), orderBy("order"));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
}

export async function deleteCategory(categoryId: string) {
  await deleteDoc(doc(db, "categories", categoryId));
}
