import { 
  doc, 
  updateDoc, 
  serverTimestamp,
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { db } from "../firebase";

export async function validateOrder(orderId: string) {
  const orderRef = doc(db, "orders", orderId);
  await updateDoc(orderRef, {
    status: "confirmed",
    updatedAt: serverTimestamp()
  });
}

export async function sendToDelivery(orderId: string) {
  const orderRef = doc(db, "orders", orderId);
  await updateDoc(orderRef, {
    status: "delivering",
    updatedAt: serverTimestamp()
  });
}

export async function getTeam(agencyId: string) {
  const q = query(collection(db, "users"), where("agencyId", "in", [agencyId, "agency_ouando"]));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
}
