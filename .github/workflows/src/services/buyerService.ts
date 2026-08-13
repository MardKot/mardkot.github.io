import { 
  doc, 
  updateDoc, 
  serverTimestamp,
  getDocs,
  collection
} from "firebase/firestore";
import { db } from "../firebase";

async function updateOrderStatusIfComplete(orderId: string) {
  const itemsSnap = await getDocs(collection(db, `orders/${orderId}/items`));
  const allFinished = itemsSnap.docs.every(d => ['bought', 'unavailable'].includes(d.data().status));
  
  if (allFinished) {
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
      status: "sorting",
      updatedAt: serverTimestamp()
    });
  }
}

export async function markItemAsBought(orderId: string, itemId: string, price: number) {
  const itemRef = doc(db, `orders/${orderId}/items/${itemId}`);
  await updateDoc(itemRef, {
    status: "bought",
    actualPrice: price,
    updatedAt: serverTimestamp()
  });
  await updateOrderStatusIfComplete(orderId);
}

export async function markItemUnavailable(orderId: string, itemId: string) {
  const itemRef = doc(db, `orders/${orderId}/items/${itemId}`);
  await updateDoc(itemRef, {
    status: "unavailable",
    updatedAt: serverTimestamp()
  });
  await updateOrderStatusIfComplete(orderId);
}
