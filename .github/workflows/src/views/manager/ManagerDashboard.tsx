import React, { useState, useEffect } from "react";
import { UserProfile } from "../../hooks/useAuth";
import { Card, Button, Input, Toast } from "../../components/UI";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { 
  LogOut, Users, Wallet, ShoppingBag, Bell, ChevronRight, TrendingUp, Clock, 
  Printer, CheckCircle2, Truck, Grid3X3, Plus, Trash2, Edit, BarChart3, Search, 
  Package, LayoutGrid, Info, Star
} from "lucide-react";
import { formatCurrency, cn } from "../../lib/utils";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";

import { validateOrder, sendToDelivery, getTeam } from "../../services/managerService";
import { addProduct, updateProduct, deleteProduct, getProducts, getCategories, addCategory, deleteCategory, Product, Category, seedCatalog, ProductAttribute, ProductVariant } from "../../services/catalogService";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase";

export default function ManagerDashboard({ profile, onLogout }: { profile: UserProfile; onLogout: () => void }) {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Form states
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: "",
    description: "",
    price: 0,
    unit: "kg",
    image: "🌽",
    category: "",
    available: true,
    attributes: [],
    variants: [],
    isFlexible: false,
    minPrice: 0,
    minQuantity: 0
  });

  const [newCategory, setNewCategory] = useState({
    name: "",
    icon: "📦",
    order: 0
  });

  const [agencySettings, setAgencySettings] = useState({
    name: profile.agencyId || "Agence Ouando",
    location: "Porto-Novo, Bénin",
    phone: "+229 00 00 00 00"
  });

  useEffect(() => {
    // Set first category as default if available
    if (categories.length > 0 && !newProduct.category) {
      setNewProduct(prev => ({ ...prev, category: categories[0].name }));
    }
  }, [categories]);

  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      where("agencyId", "==", profile.agencyId || "agency_ouando"),
      where("status", "in", ["pending_payment", "confirmed", "buying", "sorting", "delivering", "completed"])
    );
    const unsubOrders = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubProducts = onSnapshot(collection(db, "products"), (snap) => {
      setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    });

    const unsubCategories = onSnapshot(collection(db, "categories"), (snap) => {
      const cats = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      setCategories(cats.sort((a,b) => a.order - b.order));
    });

    const fetchTeamData = async () => {
      try {
        const teamData = await getTeam(profile.agencyId || "agency_ouando");
        setTeam(teamData);
      } catch (err) {
        console.error("Failed to fetch team", err);
      }
    };

    fetchTeamData();

    return () => {
      unsubOrders();
      unsubProducts();
      unsubCategories();
    };
  }, [profile.agencyId]);

  const handleResetProductForm = () => {
    setNewProduct({
      name: "",
      description: "",
      price: 0,
      unit: "kg",
      image: "🌽",
      category: categories[0]?.name || "",
      available: true,
      attributes: [],
      variants: [],
      isFlexible: false,
      minPrice: 0,
      minQuantity: 0
    });
    setEditingProduct(null);
    setImagePreview(null);
    setSelectedFile(null);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      description: product.description || "",
      price: product.price,
      unit: product.unit,
      image: product.image,
      category: product.category,
      available: product.available,
      attributes: product.attributes || [],
      variants: product.variants || [],
      isFlexible: product.isFlexible || false,
      minPrice: product.minPrice || 0,
      minQuantity: product.minQuantity || 0
    });
    if (product.image.startsWith('http')) {
      setImagePreview(product.image);
    } else {
      setImagePreview(null);
    }
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name) return;
    try {
      await addCategory(newCategory);
      setNewCategory({ name: "", icon: "📦", order: categories.length + 1 });
      setToast({ message: "Catégorie ajoutée avec succès", type: "success" });
    } catch (err) {
      console.error("Failed to add category", err);
      setToast({ message: "Erreur lors de l'ajout", type: "error" });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setNewProduct(prev => ({ ...prev, image: file.name })); // Use name as placeholder until upload
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || newProduct.price <= 0) {
      setToast({ message: "Veuillez remplir correctement les champs", type: "error" });
      return;
    }
    
    setIsProcessing('adding_product');
    try {
      let imageUrl = newProduct.image;
      
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile);
      }

      // Ensure a category is selected
      const categoryToUse = newProduct.category || (categories.length > 0 ? categories[0].name : "Général");

      if (editingProduct?.id) {
        await updateProduct(editingProduct.id, {
          ...newProduct,
          image: imageUrl,
          category: categoryToUse
        });
        setToast({ message: "Produit mis à jour", type: "success" });
      } else {
        await addProduct({
          ...newProduct,
          image: imageUrl,
          category: categoryToUse
        });
        setToast({ message: "Produit ajouté au catalogue", type: "success" });
      }

      setNewProduct({
        name: "",
        description: "",
        price: 0,
        unit: "kg",
        image: "🌽",
        category: categoryToUse,
        available: true,
        attributes: [],
        variants: []
      });
      setEditingProduct(null);
      setSelectedFile(null);
      setImagePreview(null);
    } catch (err) {
      console.error("Failed to add product", err);
      setToast({ message: "Erreur lors de l'ajout", type: "error" });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleSeed = async () => {
    setIsProcessing('seeding');
    try {
      await seedCatalog();
      setToast({ message: "Catalogue de base généré !", type: "success" });
    } catch (err) {
      console.error("Seeding failed", err);
      setToast({ message: "Erreur lors de la génération", type: "error" });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm("Supprimer cette catégorie ?")) return;
    try {
      await deleteCategory(id);
      setToast({ message: "Catégorie supprimée", type: "success" });
    } catch (err) {
      console.error("Delete category failed", err);
    }
  };

  const addAttributeField = () => {
    setNewProduct(prev => ({
      ...prev,
      attributes: [...(prev.attributes || []), { name: "", value: "" }]
    }));
  };

  const addVariantField = () => {
    setNewProduct(prev => ({
      ...prev,
      variants: [...(prev.variants || []), { id: Date.now().toString(), name: "", price: 0, available: true }]
    }));
  };

  const handleAction = async (orderId: string, action: 'validate' | 'deliver') => {
    setIsProcessing(orderId);
    try {
      if (action === 'validate') {
        await validateOrder(orderId);
        setToast({ message: `Commande #${orderId.slice(0, 8)} validée`, type: "success" });
      }
      if (action === 'deliver') {
        await sendToDelivery(orderId);
        setToast({ message: `Commande #${orderId.slice(0, 8)} envoyée en livraison`, type: "success" });
      }
    } catch (err) {
      console.error("Action failed", err);
      setToast({ message: "Action échouée", type: "error" });
    } finally {
      setIsProcessing(null);
    }
  };

  const handlePrint = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    const total = order?.totalAmount ?? 0;
    const items = (order?.items || []) as any[];
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Reçu #${orderId.slice(0, 8)}</title>
      <style>
        body{font-family:system-ui,sans-serif;padding:24px;color:#111;max-width:480px;margin:0 auto;}
        h1{font-size:18px;margin:0 0 4px;letter-spacing:.5px;}
        .muted{color:#888;font-size:11px;text-transform:uppercase;letter-spacing:.15em;}
        table{width:100%;border-collapse:collapse;margin-top:16px;}
        td,th{padding:6px 0;font-size:12px;border-bottom:1px dashed #eee;text-align:left;}
        .total{font-size:14px;font-weight:700;margin-top:12px;display:flex;justify-content:space-between;}
      </style></head><body>
      <h1>PORTO.MARKET</h1>
      <div class="muted">Reçu de commande</div>
      <p style="margin:12px 0 4px"><strong>#${orderId.slice(0, 8)}</strong></p>
      <p class="muted">${new Date().toLocaleString('fr-FR')}</p>
      <table><thead><tr><th>Article</th><th>Qté</th><th style="text-align:right">Prix</th></tr></thead><tbody>
        ${items.map(it => `<tr><td>${it.name || ''}</td><td>${it.quantity || ''}</td><td style="text-align:right">${it.estimatedBudget || 0}F</td></tr>`).join('')}
      </tbody></table>
      <div class="total"><span>Total</span><span>${total}F CFA</span></div>
      <p class="muted" style="margin-top:24px">Merci pour votre confiance.</p>
      <script>window.onload=()=>{window.print();}</script>
      </body></html>`;
    const w = window.open("", "_blank", "width=480,height=640");
    if (!w) {
      setToast({ message: "Impossible d'ouvrir la fenêtre d'impression", type: "error" });
      return;
    }
    w.document.write(html);
    w.document.close();
    setToast({ message: `Impression du reçu #${orderId.slice(0, 8)}`, type: "success" });
  };

  return (
    <div className="flex h-screen bg-[#F4F4F1] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#FFFFFF] border-r border-gray-200 flex flex-col p-6 shrink-0 shadow-sm">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-8 h-8 bg-[#2563EB] rounded-lg" />
          <h1 className="text-xl font-extrabold tracking-tighter text-[#1A1A1A]">PORTO.MARKET</h1>
        </div>

        <nav className="flex-1 space-y-1">
          <SidebarItem icon={<TrendingUp size={18} />} label={t('manager.nav.overview', { defaultValue: "Vue d'ensemble" })} active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <SidebarItem icon={<ShoppingBag size={18} />} label={t('manager.nav.orders', { defaultValue: "Commandes" })} active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
          <SidebarItem icon={<Grid3X3 size={18} />} label={t('manager.nav.catalog', { defaultValue: "Catalogue" })} active={activeTab === 'catalog'} onClick={() => setActiveTab('catalog')} />
          <SidebarItem icon={<Wallet size={18} />} label={t('manager.nav.wallet', { defaultValue: "Trésorerie" })} active={activeTab === 'wallet'} onClick={() => setActiveTab('wallet')} />
          <SidebarItem icon={<Users size={18} />} label={t('manager.nav.team', { defaultValue: "Équipe" })} active={activeTab === 'team'} onClick={() => setActiveTab('team')} />
          <SidebarItem icon={<Bell size={18} />} label={t('manager.nav.settings', { defaultValue: "Paramètres" })} active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="pt-6 border-t border-gray-100">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-4">{t('manager.agency')}</p>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-sm font-bold text-[#1A1A1A]">{profile.agencyId}</p>
            <p className="text-[10px] text-gray-500 font-medium">{t('manager.location')}</p>
          </div>
        </div>
        <div className="mt-auto pt-6 border-t border-gray-100">
           <Button variant="ghost" className="w-full justify-start gap-3 text-gray-400 hover:text-red-500 hover:bg-red-50" onClick={onLogout}>
             <LogOut size={18} /> {t('profile.logout')}
           </Button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-10 space-y-8 bg-[#F5F7FA]">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-5xl font-black tracking-tight text-[#1A1A1A] mb-2 uppercase">
              {activeTab === 'overview' && t('manager.nav.overview', { defaultValue: "SITUATION" })}
              {activeTab === 'orders' && t('manager.nav.orders', { defaultValue: "COMMANDES" })}
              {activeTab === 'catalog' && t('manager.nav.catalog', { defaultValue: "CATALOGUE" })}
              {activeTab === 'wallet' && t('manager.nav.wallet', { defaultValue: "TRÉSORERIE" })}
              {activeTab === 'team' && t('manager.nav.team', { defaultValue: "ÉQUIPE" })}
              {activeTab === 'settings' && t('manager.nav.settings', { defaultValue: "AGENCE" })}
            </h2>
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 bg-[#1A1A1A] text-white text-[10px] font-black uppercase tracking-widest rounded">{t('manager.live')}</span>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{profile.agencyId} • {new Date().toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative hidden md:block group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand transition-colors" size={18} />
               <input 
                 type="text" 
                 placeholder={t('header.search')} 
                 className="h-14 pl-12 pr-6 bg-white border border-gray-100 rounded-2xl w-64 focus:w-80 transition-all focus:ring-4 focus:ring-brand/5 outline-none font-medium text-sm"
               />
            </div>
            <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-white border border-gray-100 shadow-sm relative">
              <Bell size={20} />
              <div className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </Button>
            <div className="flex items-center gap-4 pl-6 border-l border-gray-100">
               <div className="w-12 h-12 bg-gray-200 rounded-2xl overflow-hidden grayscale hover:grayscale-0 transition-all cursor-pointer">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.uid}`} alt="avatar" />
               </div>
            </div>
          </div>
        </header>

        {/* Conditional Content based on activeTab */}
        {(activeTab === 'overview' || activeTab === 'orders') && (
          <>
            {/* Stats Grid */}
            <section className="grid grid-cols-4 gap-6">
              <StatCard label={t('manager.stats.sales', { defaultValue: "Chiffre d'Affaire" })} value={formatCurrency(orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0))} change="+12%" />
              <StatCard label={t('manager.stats.active_orders', { defaultValue: "Commandes Actives" })} value={orders.filter(o => o.status !== 'completed').length.toString()} change="+3" />
              <StatCard label={t('manager.stats.cash', { defaultValue: "Caisse Agence" })} value={formatCurrency(458000)} change="-5%" />
              <StatCard label={t('manager.stats.buying', { defaultValue: "Achats en Cours" })} value={orders.filter(o => o.status === 'buying').length.toString()} change="Urgent" color="text-red-500" />
            </section>

            {/* Sales Chart */}
            <section>
               <Card className="p-8 border-none bg-white rounded-[2.5rem] shadow-sm">
                  <div className="flex justify-between items-center mb-10">
                    <div>
                      <h3 className="text-xl font-serif">{t('manager.sales_curve')}</h3>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{t('manager.time_range', { defaultValue: "7 derniers jours" })} • {t('manager.agency')} {profile.agencyId}</p>
                    </div>
                    <div className="flex gap-2">
                       <Button variant="outline" size="sm" className="rounded-xl border-gray-100 font-bold text-[10px] uppercase tracking-tighter">{t('manager.weekly')}</Button>
                       <Button variant="ghost" size="sm" className="rounded-xl font-bold text-[10px] uppercase tracking-tighter">{t('manager.monthly')}</Button>
                    </div>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { name: 'Lun', sales: 45000 },
                        { name: 'Mar', sales: 52000 },
                        { name: 'Mer', sales: 48000 },
                        { name: 'Jeu', sales: 61000 },
                        { name: 'Ven', sales: 55000 },
                        { name: 'Sam', sales: 67000 },
                        { name: 'Dim', sales: 72000 },
                      ]}>
                        <defs>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94A3B8'}} dy={10} />
                        <YAxis hide />
                        <Tooltip 
                          contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                          itemStyle={{fontSize: '12px', fontWeight: 'bold'}}
                        />
                        <Area type="monotone" dataKey="sales" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
               </Card>
            </section>

            {/* Order Queue */}
            <section>
              <Card className="border-none shadow-none bg-white p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-serif">{t('manager.order_queue')}</h3>
                  <div className="flex gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-gray-400 font-bold uppercase">{t('manager.live_update')}</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-100 italic font-serif text-gray-400 text-sm">
                        <th className="pb-4 font-normal">{t('manager.table.order_id')}</th>
                        <th className="pb-4 font-normal">{t('manager.table.client')}</th>
                        <th className="pb-4 font-normal">{t('manager.table.amount')}</th>
                        <th className="pb-4 font-normal">{t('manager.table.status')}</th>
                        <th className="pb-4 font-normal text-right">{t('manager.table.actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-gray-400 italic">{t('manager.table.no_orders')}</td>
                        </tr>
                      ) : (
                        orders.map(order => (
                          <React.Fragment key={order.id}>
                            <tr className="group hover:bg-gray-50 transition-colors">
                              <td className="py-4 font-mono text-xs text-gray-500">#{order.id.slice(0, 8)}</td>
                              <td className="py-4 font-medium text-sm text-gray-400">ID: {order.clientId.slice(0, 6)}</td>
                              <td className="py-4 font-bold text-sm text-gray-900">{formatCurrency(order.totalAmount)}</td>
                              <td className="py-4">
                                <StatusBadge status={order.status} />
                              </td>
                              <td className="py-4 text-right">
                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 gap-2 rounded-lg text-xs"
                                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                  >
                                    {expandedOrder === order.id ? t('common.reduce', { defaultValue: "Réduire" }) : t('common.items', { defaultValue: "Items" })}
                                  </Button>
                                  <Button variant="outline" size="sm" className="h-8 gap-2 rounded-lg" onClick={() => handlePrint(order.id)}>
                                    <Printer size={12} /> {t('common.receipt', { defaultValue: "Reçu" })}
                                  </Button>
                                  {order.status === 'pending_payment' ? (
                                    <Button 
                                      variant="primary" 
                                      size="sm" 
                                      className="h-8 gap-2 rounded-lg bg-green-600 hover:bg-green-700"
                                      onClick={() => handleAction(order.id, 'validate')}
                                      loading={isProcessing === order.id}
                                    >
                                      <CheckCircle2 size={12} /> {t('common.validate', { defaultValue: "Valider" })}
                                    </Button>
                                  ) : (
                                    <Button 
                                      variant="primary" 
                                      size="sm" 
                                      className="h-8 gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700"
                                      onClick={() => handleAction(order.id, 'deliver')}
                                      loading={isProcessing === order.id}
                                      disabled={['delivering', 'completed'].includes(order.status)}
                                    >
                                      <Truck size={12} /> {t('common.deliver', { defaultValue: "Livrer" })}
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                            {expandedOrder === order.id && (
                              <tr className="bg-gray-50/50">
                                <td colSpan={5} className="p-6">
                                  <div className="space-y-4">
                                    <div className="flex justify-between items-center px-2">
                                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{t('manager.order_details')}</h4>
                                      <span className="text-[10px] font-bold text-gray-400 italic">{t('profile.address')}: {order.deliveryAddress || "Quartier Ouando, Porto-Novo"}</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {order.items?.map((item: any, idx: number) => (
                                        <div key={idx} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                          <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-xl shrink-0">
                                            {item.image?.startsWith('http') ? <img src={item.image} className="w-full h-full object-cover rounded-xl" referrerPolicy="no-referrer" alt={item.name} /> : item.image}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm text-[#1A1A1A] truncate">{item.name}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{item.quantity} x {item.price}F / {item.unit}</p>
                                          </div>
                                          <p className="font-black text-sm text-brand">{item.quantity * item.price}F</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </section>
          </>
        )}

        {activeTab === 'catalog' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-in slide-in-from-bottom-8 duration-500">
            <div className="lg:col-span-1 space-y-8">
                <Card className="p-10 bg-white border-none rounded-[3rem] shadow-xl shadow-gray-200/40 relative overflow-hidden group">
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-8">
                       <h3 className="text-2xl font-black italic tracking-tight uppercase">{editingProduct ? t('profile.edit') : t('common.new', { defaultValue: "Nouveau" })} {t('common.product', { defaultValue: "Produit" })}</h3>
                       {editingProduct && (
                         <Button variant="ghost" size="sm" type="button" onClick={handleResetProductForm} className="text-xs text-red-400 hover:text-red-500">{t('manager.cancel')}</Button>
                       )}
                    </div>
                    <form onSubmit={handleAddProduct} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('manager.designation')}</label>
                        <input type="text" className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-none text-sm font-bold focus:ring-4 focus:ring-brand/5 outline-none transition-all" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder={t('common.product_placeholder', { defaultValue: "Maïs, Tomate..." })} required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('manager.price')}</label>
                           <input type="number" className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-none text-sm font-bold focus:ring-4 focus:ring-brand/5 outline-none transition-all" value={newProduct.price || ''} onChange={e => setNewProduct({...newProduct, price: parseInt(e.target.value) || 0})} required />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('manager.unit')}</label>
                           <input 
                             type="text" 
                             className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-none text-sm font-bold focus:ring-4 focus:ring-brand/5 outline-none transition-all" 
                             value={newProduct.unit} 
                             onChange={e => setNewProduct({...newProduct, unit: e.target.value})} 
                             placeholder="kg, L, unité, tas..."
                             required 
                           />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('manager.product_image')}</label>
                        <div className="flex flex-col gap-4">
                           <div className="relative group/img h-48 w-full bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100 flex items-center justify-center overflow-hidden transition-all hover:bg-gray-100">
                              {imagePreview ? (
                                <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                              ) : (
                                <div className="text-center space-y-2">
                                   <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto text-gray-300">
                                      <Plus size={24} />
                                   </div>
                                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('manager.choose_file')}</p>
                                </div>
                              )}
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer z-20" 
                              />
                           </div>
                           <div className="flex items-center gap-3">
                              <div className="h-[1px] bg-gray-100 flex-1" />
                              <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">{t('manager.or_url')}</span>
                              <div className="h-[1px] bg-gray-100 flex-1" />
                           </div>
                           <input 
                             type="text" 
                             placeholder={t('common.url_emoji_placeholder', { defaultValue: "URL de l'image ou Emoji" })}
                             className="w-full h-12 px-6 rounded-xl bg-gray-50 border-none text-xs font-bold focus:ring-4 focus:ring-brand/5 outline-none transition-all" 
                             value={newProduct.image} 
                             onChange={e => {
                               setNewProduct({...newProduct, image: e.target.value});
                               if (!e.target.value.startsWith('http')) {
                                 setImagePreview(null);
                               }
                             }} 
                           />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('manager.classification')}</label>
                        <select className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-none text-sm font-bold focus:ring-4 focus:ring-brand/5 outline-none transition-all appearance-none" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                          {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                          {categories.length === 0 && (
                            <>
                              <option value="">{t('manager.select')}</option>
                              <option>{t('manager.cereals')}</option>
                              <option>{t('manager.vegetables')}</option>
                              <option>{t('manager.meats')}</option>
                            </>
                          )}
                        </select>
                      </div>

                      {/* Flexible Pricing Controls */}
                      <div className="p-6 bg-brand/5 rounded-[2rem] space-y-6 border border-brand/10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black uppercase tracking-widest text-[#1A1A1A]">{t('catalog.flexible_pricing')}</span>
                            <div className="w-5 h-5 rounded-full bg-brand/10 text-brand flex items-center justify-center">
                              <Star size={10} fill="currentColor" />
                            </div>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setNewProduct({...newProduct, isFlexible: !newProduct.isFlexible})}
                            className={cn(
                              "w-12 h-6 rounded-full relative transition-all duration-300",
                              newProduct.isFlexible ? "bg-brand" : "bg-gray-200"
                            )}
                          >
                            <div className={cn(
                              "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                              newProduct.isFlexible ? "left-7" : "left-1"
                            )} />
                          </button>
                        </div>

                        {newProduct.isFlexible && (
                          <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{t('catalog.min_price')} (F)</label>
                                <input 
                                  type="number" 
                                  className="w-full h-12 px-4 rounded-xl bg-white border-none text-xs font-bold focus:ring-4 focus:ring-brand/5 outline-none" 
                                  value={newProduct.minPrice || ''} 
                                  onChange={e => setNewProduct({...newProduct, minPrice: parseInt(e.target.value) || 0})} 
                                />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{t('catalog.min_qty')} ({newProduct.unit || 'u'})</label>
                                <input 
                                  type="number" 
                                  step="0.1"
                                  className="w-full h-12 px-4 rounded-xl bg-white border-none text-xs font-bold focus:ring-4 focus:ring-brand/5 outline-none" 
                                  value={newProduct.minQuantity || ''} 
                                  onChange={e => setNewProduct({...newProduct, minQuantity: parseFloat(e.target.value) || 0})} 
                                />
                             </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('manager.detailed_desc')}</label>
                        <textarea 
                          rows={3}
                          className="w-full p-6 rounded-2xl bg-gray-50 border-none text-sm font-bold focus:ring-4 focus:ring-brand/5 outline-none transition-all resize-none" 
                          value={newProduct.description} 
                          onChange={e => setNewProduct({...newProduct, description: e.target.value})} 
                          placeholder={t('common.description_placeholder', { defaultValue: "Description du produit..." })} 
                        />
                      </div>

                      {/* Attributes */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('manager.attributes')}</label>
                          <Button type="button" variant="ghost" size="sm" onClick={addAttributeField} className="h-6 w-6 rounded-full bg-gray-100"><Plus size={12} /></Button>
                        </div>
                        {newProduct.attributes?.map((attr, idx) => (
                          <div key={idx} className="flex gap-2">
                             <input 
                               className="flex-1 h-10 px-4 rounded-xl bg-gray-50 border-none text-[10px] font-bold outline-none" 
                               placeholder={t('common.attr_name_placeholder', { defaultValue: "Nom (ex: Origine)" })} 
                               value={attr.name}
                               onChange={e => {
                                 const newAttrs = [...(newProduct.attributes || [])];
                                 newAttrs[idx].name = e.target.value;
                                 setNewProduct({...newProduct, attributes: newAttrs});
                               }}
                             />
                             <input 
                               className="flex-1 h-10 px-4 rounded-xl bg-gray-50 border-none text-[10px] font-bold outline-none" 
                               placeholder={t('common.attr_value_placeholder', { defaultValue: "Valeur" })} 
                               value={attr.value}
                               onChange={e => {
                                 const newAttrs = [...(newProduct.attributes || [])];
                                 newAttrs[idx].value = e.target.value;
                                 setNewProduct({...newProduct, attributes: newAttrs});
                               }}
                             />
                             <Button 
                               type="button" 
                               variant="ghost" 
                               size="sm" 
                               className="h-10 w-10 text-red-300 hover:text-red-500"
                               onClick={() => {
                                 const newAttrs = (newProduct.attributes || []).filter((_, i) => i !== idx);
                                 setNewProduct({...newProduct, attributes: newAttrs});
                               }}
                             >
                               <Trash2 size={12} />
                             </Button>
                          </div>
                        ))}
                      </div>

                      {/* Variants */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('manager.variants')}</label>
                          <Button type="button" variant="ghost" size="sm" onClick={addVariantField} className="h-6 w-6 rounded-full bg-gray-100"><Plus size={12} /></Button>
                        </div>
                        {newProduct.variants?.map((v, idx) => (
                          <div key={idx} className="flex gap-2">
                             <input 
                               className="flex-1 h-10 px-4 rounded-xl bg-gray-50 border-none text-[10px] font-bold outline-none" 
                               placeholder={t('common.variant_name_placeholder', { defaultValue: "Nom (ex: Sac 5kg)" })} 
                               value={v.name}
                               onChange={e => {
                                 const newVars = [...(newProduct.variants || [])];
                                 newVars[idx].name = e.target.value;
                                 setNewProduct({...newProduct, variants: newVars});
                               }}
                             />
                             <input 
                               type="number"
                               className="w-24 h-10 px-4 rounded-xl bg-gray-50 border-none text-[10px] font-bold outline-none" 
                               placeholder={t('manager.price')} 
                               value={v.price || ''}
                               onChange={e => {
                                 const newVars = [...(newProduct.variants || [])];
                                 newVars[idx].price = parseInt(e.target.value) || 0;
                                 setNewProduct({...newProduct, variants: newVars});
                               }}
                             />
                             <Button 
                               type="button" 
                               variant="ghost" 
                               size="sm" 
                               className="h-10 w-10 text-red-300 hover:text-red-500"
                               onClick={() => {
                                 const newVars = (newProduct.variants || []).filter((_, i) => i !== idx);
                                 setNewProduct({...newProduct, variants: newVars});
                               }}
                             >
                               <Trash2 size={12} />
                             </Button>
                          </div>
                        ))}
                      </div>

                      <Button 
                        type="submit" 
                        loading={isProcessing === 'adding_product'}
                        className="w-full h-16 bg-[#1A1A1A] hover:bg-black text-white rounded-2xl shadow-xl shadow-gray-900/10 text-xs font-black uppercase tracking-widest gap-3"
                      >
                        <Plus size={20} /> {t('manager.save_product', { defaultValue: "Enregistrer le produit" })}
                      </Button>
                    </form>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000" />
               </Card>

               <Card className="p-10 bg-white border-none rounded-[3rem] shadow-xl shadow-gray-200/40">
                  <h3 className="text-xl font-black italic tracking-tight mb-8">{t('manager.new_category')}</h3>
                  <form onSubmit={handleAddCategory} className="space-y-6">
                    <input type="text" placeholder={t('manager.designation')} className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-none text-sm font-bold focus:ring-4 focus:ring-brand/5 outline-none transition-all" value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value})} required />
                    <input type="text" placeholder={t('common.icon_placeholder', { defaultValue: "Icône (ex: 📦)" })} className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-none text-sm font-bold focus:ring-4 focus:ring-brand/5 outline-none transition-all" value={newCategory.icon} onChange={e => setNewCategory({...newCategory, icon: e.target.value})} required />
                    <Button type="submit" variant="outline" className="w-full h-14 rounded-2xl border-dashed border-gray-200 hover:border-brand hover:text-brand font-black text-[10px] uppercase tracking-widest gap-3">
                       <LayoutGrid size={18} /> {t('manager.create_universe', { defaultValue: "Créer l'univers" })}
                    </Button>
                  </form>
               </Card>
            </div>

            <div className="lg:col-span-2 space-y-12">
               <section className="space-y-6">
                 <div className="flex justify-between items-center px-4">
                    <h3 className="text-2xl font-black italic">Catégories Actives</h3>
                    <span className="text-[10px] font-black uppercase bg-gray-100 px-3 py-1 rounded-full text-gray-400">{categories.length} GROUPES</span>
                 </div>
                 <div className="flex flex-wrap gap-4">
                   {categories.map(cat => (
                     <div key={cat.id} className="bg-white p-4 pl-6 pr-10 rounded-[2rem] flex items-center gap-4 shadow-sm group hover:shadow-xl hover:-translate-y-1 hover:border-brand/20 border border-transparent transition-all relative overflow-hidden">
                        <span className="text-2xl relative z-10">{cat.icon}</span>
                        <span className="font-bold text-sm tracking-tight text-[#1A1A1A] relative z-10">{cat.name}</span>
                        <button onClick={() => deleteCategory(cat.id!)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                           <Trash2 size={16} />
                        </button>
                        <div className="absolute -left-4 -bottom-4 w-12 h-12 bg-gray-50 rounded-full group-hover:bg-brand/5 transition-colors" />
                     </div>
                   ))}
                   {categories.length === 0 && (
                     <div className="p-12 border-2 border-dashed border-gray-200 rounded-[3rem] w-full text-center">
                        <p className="text-gray-400 font-bold italic">Aucune catégorie définie. Utilisez le formulaire à gauche.</p>
                     </div>
                   )}
                 </div>
               </section>

               <section className="space-y-6">
                 <div className="flex justify-between items-center px-4">
                    <h3 className="text-2xl font-black italic">Inventaire Agence</h3>
                    <div className="flex items-center gap-4">
                       {products.length === 0 && (
                         <Button 
                           variant="outline" 
                           size="sm" 
                           onClick={handleSeed}
                           loading={isProcessing === 'seeding'}
                           className="rounded-xl border-brand text-brand hover:bg-blue-50 h-10 px-6 font-black text-[10px] uppercase tracking-widest gap-2"
                         >
                           <Package size={14} /> Générer catalogue de base
                         </Button>
                       )}
                       <span className="text-[10px] font-black uppercase bg-gray-100 px-3 py-1 rounded-full text-gray-400">{products.length} RÉFÉRENCES</span>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                   {products.map(product => (
                     <div key={product.id} className="group bg-white p-6 rounded-[3rem] shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all border border-transparent hover:border-gray-50 flex flex-col gap-6 relative overflow-hidden">
                        <div className="flex justify-between items-start relative z-10">
                          <div className="w-16 h-16 bg-gray-50 rounded-[1.5rem] flex items-center justify-center text-4xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 shadow-inner overflow-hidden">
                            {product.image?.startsWith('http') ? (
                              <img src={product.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt={product.name} />
                            ) : (
                              product.image
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2 text-right">
                             <span className="bg-[#1A1A1A] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-lg shadow-gray-300">{product.category}</span>
                             {product.variants && product.variants.length > 0 && (
                               <span className="text-[8px] font-bold text-brand uppercase tracking-widest">{product.variants.length} Variantes</span>
                             )}
                             <button onClick={() => deleteProduct(product.id!)} className="w-8 h-8 rounded-full bg-red-50 text-red-300 hover:text-red-500 flex items-center justify-center transition-colors">
                                <Trash2 size={14} />
                             </button>
                          </div>
                        </div>
                        <div className="relative z-10 space-y-2">
                         <h4 className="text-xl font-black text-[#1A1A1A] leading-tight">{product.name}</h4>
                          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed line-clamp-2">{product.description || (product.unit ? `1 ${product.unit}` : "")}</p>
                          
                          {product.attributes && product.attributes.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                               {product.attributes.map((attr, i) => (
                                 <span key={i} className="text-[8px] font-black uppercase text-gray-400 border border-gray-100 px-2 py-0.5 rounded-lg">{attr.name}: {attr.value}</span>
                               ))}
                            </div>
                          )}
                        </div>
                        <div className="flex justify-between items-center pt-6 border-t border-gray-50 relative z-10">
                           <p className="text-2xl font-black text-brand tracking-tighter">{product.price}F</p>
                           <Button 
                             variant="ghost" 
                             size="sm" 
                             className="h-8 w-8 rounded-lg text-gray-300 hover:text-brand"
                             onClick={() => handleEditProduct(product)}
                           >
                              <Edit size={14} />
                           </Button>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50/50 rounded-full translate-x-12 -translate-y-12 blur-2xl group-hover:bg-brand/5 transition-colors" />
                     </div>
                   ))}
                   {products.length === 0 && (
                     <div className="col-span-full p-24 border-2 border-dashed border-gray-200 rounded-[4rem] text-center space-y-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-300">
                           <Package size={40} />
                        </div>
                        <h4 className="text-xl font-bold">{t('manager.empty_catalog_title')}</h4>
                        <p className="text-gray-400 italic max-w-xs mx-auto text-sm">{t('manager.empty_catalog_desc')}</p>
                     </div>
                   )}
                 </div>
               </section>
            </div>
          </div>
        )}

        {activeTab === 'wallet' && (
          <div className="space-y-8">
            <div className="grid grid-cols-3 gap-6">
              <Card className="p-8 bg-[#1A1A1A] text-white space-y-4 rounded-[2.5rem]">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{t('manager.validated_total')}</p>
                <h3 className="text-4xl font-black">{formatCurrency(orders.filter(o => o.status !== 'pending_payment').reduce((acc, o) => acc + (o.totalAmount || 0), 0))}</h3>
                <div className="flex items-center gap-2 text-green-400 text-xs font-bold">
                   <TrendingUp size={14} /> +12.4% {t('manager.this_month', { defaultValue: "ce mois" })}
                </div>
              </Card>
              <Card className="p-8 bg-white space-y-4 rounded-[2.5rem]">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{t('manager.pending_total')}</p>
                <h3 className="text-4xl font-black text-[#1A1A1A]">{formatCurrency(orders.filter(o => o.status === 'pending_payment').reduce((acc, o) => acc + (o.totalAmount || 0), 0))}</h3>
                <p className="text-xs text-orange-500 font-bold">{t('manager.relance_needed', { count: orders.filter(o => o.status === 'pending_payment').length })}</p>
              </Card>
            </div>

            <Card className="p-8 bg-white rounded-[2.5rem]">
               <h3 className="text-xl font-serif mb-6">{t('manager.cash_movements')}</h3>
               <div className="space-y-4">
                  {orders.slice(0, 5).map(o => (
                    <div key={o.id} className="flex items-center justify-between p-4 border-b border-gray-50 last:border-none">
                      <div className="flex items-center gap-4">
                         <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", o.status === 'pending_payment' ? "bg-orange-50 text-orange-500" : "bg-green-50 text-green-500")}>
                            {o.status === 'pending_payment' ? <Clock size={18} /> : <CheckCircle2 size={18} />}
                         </div>
                         <div>
                            <p className="font-bold text-sm">{t('manager.wallet.order_receipt', { defaultValue: "Règlement Commande" })} #{o.id.slice(0, 8)}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">{o.status === 'pending_payment' ? t('manager.wallet.forecast', { defaultValue: "Entrée Prévisionnelle" }) : t('manager.wallet.actual', { defaultValue: "Encaissement Réel" })}</p>
                         </div>
                      </div>
                      <p className={cn("font-black text-lg", o.status === 'pending_payment' ? "text-gray-300" : "text-green-600")}>
                        {o.status === 'pending_payment' ? "" : "+"}{o.totalAmount}F
                      </p>
                    </div>
                  ))}
               </div>
            </Card>
          </div>
        )}

        {/* Team tab already defined ... */}
        {activeTab === 'team' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in slide-in-from-bottom-8 duration-500">
            {team.length === 0 ? (
              <div className="col-span-full p-20 text-center text-gray-400 italic">{t('manager.no_team')}</div>
            ) : (
              team.map(member => (
                <UserCard 
                  key={member.uid}
                  name={member.displayName || "Sans nom"} 
                  role={member.role} 
                  status={t('common.active', { defaultValue: "Actif" })} 
                  orders={Math.floor(Math.random() * 20)} // Placeholder for activity
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl space-y-8">
            <Card className="p-8 bg-white rounded-[2.5rem] space-y-8">
                <h3 className="text-2xl font-serif">{t('manager.agency_info')}</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-gray-400">{t('manager.agency_name')}</label>
                    <Input value={agencySettings.name} onChange={e => setAgencySettings({...agencySettings, name: e.target.value})} className="h-14 rounded-2xl border-gray-100" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-gray-400">{t('manager.physical_location')}</label>
                    <Input value={agencySettings.location} onChange={e => setAgencySettings({...agencySettings, location: e.target.value})} className="h-14 rounded-2xl border-gray-100" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-gray-400">{t('manager.phone_contact')}</label>
                    <Input value={agencySettings.phone} onChange={e => setAgencySettings({...agencySettings, phone: e.target.value})} className="h-14 rounded-2xl border-gray-100" />
                  </div>
                </div>
                <Button className="w-full h-16 bg-[#2563EB] rounded-2xl text-lg font-bold shadow-xl shadow-blue-500/20">{t('manager.update_agency')}</Button>
            </Card>

            <Card className="p-8 bg-red-50 border border-red-100 rounded-[2.5rem] space-y-4">
               <h4 className="text-red-600 font-bold">{t('manager.danger_zone')}</h4>
               <p className="text-xs text-red-500 opacity-70">{t('manager.delete_desc')}</p>
               <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-100 rounded-xl h-12">{t('manager.deactivate_agency')}</Button>
            </Card>
          </div>
        )}
      </main>

      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100]"
          >
            <Toast 
              message={toast.message} 
              type={toast.type} 
              onClose={() => setToast(null)} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TickerItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col items-end">
      <span className="text-[8px] font-black text-white/40 tracking-widest uppercase">{label}</span>
      <span className="text-sm font-black italic">{value}</span>
    </div>
  )
}

function ProgressItem({ label, value, percent }: { label: string, value: string, percent: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          className="h-full bg-white rounded-full shadow-lg shadow-white/20"
        />
      </div>
    </div>
  )
}

function AlertItem({ type, message }: { type: 'warning' | 'info' | 'success', message: string }) {
  const styles = {
    warning: "bg-orange-50 text-orange-600 border-orange-100",
    info: "bg-blue-50 text-blue-600 border-blue-100",
    success: "bg-green-50 text-green-600 border-green-100"
  }
  return (
    <div className={cn("px-4 py-3 rounded-2xl border flex items-center gap-3 text-xs font-bold", styles[type])}>
      <div className={cn("w-1.5 h-1.5 rounded-full", type === 'warning' ? "bg-orange-600" : type === 'info' ? "bg-blue-600" : "bg-green-600")} />
      {message}
    </div>
  )
}

function SidebarItem({ icon, label, active = false, onClick }: { icon: any; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all",
        active ? "bg-blue-50 text-[#2563EB]" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
      )}
    >
      {icon}
      <span className="text-sm font-bold tracking-tight">{label}</span>
      {active && <div className="ml-auto w-1 h-4 bg-[#2563EB] rounded-full" />}
    </div>
  );
}

function StatCard({ label, value, change, color = "text-green-500" }: { label: string; value: string; change: string; color?: string }) {
  return (
    <Card className="p-6 bg-white border-none space-y-2">
      <p className="text-xs text-gray-400 font-serif italic">{label}</p>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-bold">{value}</p>
        <span className={cn("text-[10px] font-bold", color)}>{change}</span>
      </div>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  const styles: any = {
    pending_payment: "bg-orange-50 text-orange-600 border-orange-100",
    confirmed: "bg-blue-50 text-blue-600 border-blue-100",
    buying: "bg-purple-50 text-purple-600 border-purple-100",
    sorting: "bg-emerald-50 text-emerald-600 border-emerald-100",
    delivering: "bg-indigo-50 text-indigo-600 border-indigo-100",
    completed: "bg-green-50 text-green-600 border-green-100",
  };
  const labels: any = {
    pending_payment: t('status.pending_payment', { defaultValue: "Attente Paiement" }),
    confirmed: t('status.confirmed', { defaultValue: "Confirmé" }),
    buying: t('status.buying', { defaultValue: "Achats en cours" }),
    sorting: t('status.sorting', { defaultValue: "Tri & Colisage" }),
    delivering: t('status.delivering', { defaultValue: "En Livraison" }),
    completed: t('status.completed', { defaultValue: "Livré" }),
  };
  return (
    <span className={cn("px-2 py-1 rounded-full text-[10px] font-bold uppercase border", styles[status])}>
      {labels[status] || status.replace("_", " ")}
    </span>
  );
}

function UserCard({ name, role, status, orders }: { name: string; role: string; status: string; orders: number; key?: any }) {
  return (
    <Card className="p-6 border-none shadow-sm flex items-center gap-4">
      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-400 text-xl">{name.charAt(0)}</div>
      <div className="flex-1">
        <h4 className="font-bold text-[#1A1A1A]">{name}</h4>
        <p className="text-[10px] uppercase font-black text-[#2563EB] tracking-widest">{role}</p>
      </div>
      <div className="text-right">
        <p className="text-xs font-bold text-green-500">{status}</p>
        <p className="text-[10px] text-gray-400">{orders} courses</p>
      </div>
    </Card>
  );
}
