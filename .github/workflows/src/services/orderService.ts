import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  writeBatch, 
  doc 
} from "firebase/firestore";
import { db } from "../firebase";

export interface OrderItem {
  id?: string;
  name: string;
  quantity: string;
  category: string;
  estimatedBudget: number;
  status: "pending" | "assigned" | "bought" | "unavailable";
}

export interface NewOrder {
  clientId: string;
  agencyId: string;
  items: OrderItem[];
  totalAmount: number;
  deliveryAddress: string;
  timeWindow: string;
  status?: string;
  tracking?: {
    lat: number;
    lng: number;
    lastUpdate: any;
    status: "preparing" | "delivering" | "delivered";
  };
}

export async function createOrder(orderData: NewOrder) {
  try {
    const batch = writeBatch(db);
    
    // 1. Create Order document
    const orderRef = doc(collection(db, "orders"));
    const orderId = orderRef.id;
    
    batch.set(orderRef, {
      clientId: orderData.clientId,
      agencyId: orderData.agencyId,
      status: orderData.status || "pending_payment",
      totalAmount: orderData.totalAmount,
      deliveryAddress: orderData.deliveryAddress,
      timeWindow: orderData.timeWindow,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // 2. Create Order Items
    orderData.items.forEach(item => {
      const itemRef = doc(collection(db, `orders/${orderId}/items`));
      batch.set(itemRef, {
        ...item,
        orderId: orderId,
        status: "pending",
        createdAt: serverTimestamp()
      });
    });
    
    await batch.commit();
    return orderId;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}
