import { api } from "./api";

/**
 * Met à jour le profil utilisateur via le backend Laravel.
 */
export async function updateProfile(_uid: string, data: { name?: string; phone_number?: string; agency_id?: number }) {
  return api.put("/user/profile", data);
}
