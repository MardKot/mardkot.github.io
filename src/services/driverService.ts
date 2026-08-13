import { 
  doc, 
  updateDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../firebase";

export async function startDelivery(orderId: string) {
  const orderRef = doc(db, "orders", orderId);
  await updateDoc(orderRef, {
    status: "delivering",
    updatedAt: serverTimestamp()
  });
}

export async function completeDelivery(orderId: string) {
  const orderRef = doc(db, "orders", orderId);
  await updateDoc(orderRef, {
    status: "completed",
    updatedAt: serverTimestamp()
  });
}

export async function updateDeliveryLocation(orderId: string, lat: number, lng: number, status: "preparing" | "delivering" | "delivered") {
  const orderRef = doc(db, "orders", orderId);
  await updateDoc(orderRef, {
    tracking: {
      lat,
      lng,
      lastUpdate: serverTimestamp(),
      status
    },
    updatedAt: serverTimestamp()
  });
}
