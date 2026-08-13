// Typed wrapper around the Laravel REST API at VITE_API_URL.
// Stores the Sanctum token in localStorage and attaches it to every request.

const TOKEN_KEY = "porto_market_api_token";

function baseUrl(): string {
  const raw = (import.meta as any).env?.VITE_API_URL || "/api";
  return String(raw).replace(/\/+$/, "");
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

export class ApiError extends Error {
  status: number;
  body: any;
  constructor(message: string, status: number, body: any) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = `${baseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(init.headers || {});
  headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(url, { ...init, headers, credentials: "include" });
  const text = await res.text();
  const body = text ? safeParse(text) : null;

  if (!res.ok) {
    const message = (body && (body.message || body.error)) || `HTTP ${res.status}`;
    throw new ApiError(message, res.status, body);
  }
  return body as T;
}

function safeParse(t: string) {
  try { return JSON.parse(t); } catch { return t; }
}

export const api = {
  get:    <T = any>(path: string)              => request<T>(path),
  post:   <T = any>(path: string, body?: any)  => request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put:    <T = any>(path: string, body?: any)  => request<T>(path, { method: "PUT",  body: body ? JSON.stringify(body) : undefined }),
  delete: <T = any>(path: string)              => request<T>(path, { method: "DELETE" }),
};

// ---------------------- Domain endpoints ----------------------

export interface AuthUser {
  id: number;
  uid?: string;
  name: string;
  email: string;
  role: "client" | "manager" | "chief_buyer" | "buyer" | "driver";
  phone_number?: string;
  agency_id?: number | null;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export const authApi = {
  login: async (email: string, password: string) => {
    const r = await api.post<AuthResponse>("/auth/login", { email, password });
    setToken(r.token);
    return r;
  },
  register: async (input: { name: string; email: string; password: string; password_confirmation: string; role?: string; phone_number?: string; agency_id?: number }) => {
    const r = await api.post<AuthResponse>("/auth/register", { role: "client", ...input });
    setToken(r.token);
    return r;
  },
  me:     () => api.get<AuthUser>("/user"),
  logout: async () => {
    try { await api.post("/auth/logout"); } finally { setToken(null); }
  },
};

export const productsApi = {
  list:       (params?: { category_id?: number; search?: string; featured?: boolean }) => {
    const qs = new URLSearchParams();
    if (params?.category_id) qs.set("category_id", String(params.category_id));
    if (params?.search) qs.set("search", params.search);
    if (params?.featured) qs.set("featured", "1");
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return api.get(`/products${suffix}`);
  },
  get:        (id: number) => api.get(`/products/${id}`),
  categories: () => api.get("/categories"),
};

export const agenciesApi = {
  list: () => api.get("/agencies"),
  get:  (id: number) => api.get(`/agencies/${id}`),
};

export interface NewOrderItem {
  product_id?: number | null;
  name: string;
  category?: string;
  quantity: number | string;
  unit_price: number;
}

export interface NewOrderInput {
  agency_id?: number | null;
  delivery_address: string;
  time_window?: string;
  items: NewOrderItem[];
}

export const ordersApi = {
  list:   () => api.get("/orders"),
  get:    (id: number) => api.get(`/orders/${id}`),
  create: (input: NewOrderInput) => api.post("/orders", input),
  cancel: (id: number) => api.post(`/orders/${id}/cancel`),
};

export const paymentsApi = {
  initiate: (input: { amount: number; phone_number: string; order_id: number; method?: "fedapay" | "kkiapay" | "momo" }) =>
    api.post("/payments/init", input),
  confirm:  (input: { order_id: number; transaction_ref?: string }) =>
    api.post("/payments/confirm", input),
};

export const driverApi = {
  deliveries:     () => api.get("/driver/deliveries"),
  updateStatus:   (id: number, status: "delivering" | "completed") => api.put(`/driver/deliveries/${id}/status`, { status }),
  updateLocation: (id: number, lat: number, lng: number, status: "preparing" | "delivering" | "delivered" = "delivering") =>
    api.post(`/driver/deliveries/${id}/location`, { lat, lng, status }),
};

export const adminApi = {
  allOrders:    (params?: { status?: string; agency_id?: number }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set("status", params.status);
    if (params?.agency_id) qs.set("agency_id", String(params.agency_id));
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return api.get(`/admin/orders${suffix}`);
  },
  setStatus:    (id: number, status: string) => api.put(`/admin/orders/${id}/status`, { status }),
  assignDriver: (id: number, driver_id: number) => api.put(`/admin/orders/${id}/assign`, { driver_id }),
};
