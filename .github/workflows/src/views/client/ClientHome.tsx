import React, { useState, useEffect, useRef } from "react";
import { UserProfile } from "../../hooks/useAuth";
import { Card, Button, Input, Toast } from "../../components/UI";
import { cn, formatCurrency } from "../../lib/utils";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { updateProfile } from "../../services/userService";
import { processFedapayPayment, processKkiapayPayment } from "../../services/paymentService";
import { ordersApi, paymentsApi, agenciesApi } from "../../services/api";
import { 
  ShoppingBasket, 
  Search, 
  Plus, 
  ChevronRight, 
  MapPin, 
  ShoppingCart, 
  History, 
  User,
  Star,
  ShieldCheck,
  Truck,
  ArrowRight,
  Menu,
  LogOut,
  CheckCircle2,
  X,
  Facebook,
  Instagram,
  Twitter,
  Play,
  Navigation,
  Clock,
  Navigation2,
  Phone
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";

import { SmartList } from "../../components/SmartList";
import { AIChatbot } from "../../components/AIChatbot";

const PRODUCTS = [
  { id: 1, name: "Maïs Blanc", price: 450, unit: "kg", image: "🌽", category: "Céréales", rating: 4.8, isFlexible: true, minPrice: 50 },
  { id: 2, name: "Gari Sohoui", price: 350, unit: "kg", image: "🍚", category: "Farines", rating: 4.9, isFlexible: true, minPrice: 50 },
  { id: 3, name: "Huile de palme", price: 1200, unit: "L", image: "🧴", category: "Huilerie", rating: 4.7, isFlexible: true, minPrice: 100 },
  { id: 4, name: "Tomates Fraîches", price: 800, unit: "panier", image: "🍅", category: "Légumes", rating: 4.5, isFlexible: true, minPrice: 100 },
  { id: 5, name: "Piment Sec", price: 200, unit: "lot", image: "🌶️", category: "Épices", rating: 4.6, isFlexible: true, minPrice: 50 },
  { id: 6, name: "Ignames", price: 1500, unit: "tas", image: "🍠", category: "Tubercules", rating: 4.9, isFlexible: true, minPrice: 500 },
  { id: 7, name: "Ananas Pain de Sucre", price: 500, unit: "unité", image: "🍍", category: "Fruits", rating: 5.0, isFlexible: true, minPrice: 500 },
];

const CATEGORIES = [
  { name: "Céréales", icon: "🌽", count: 24 },
  { name: "Fruits", icon: "🥭", count: 15 },
  { name: "Légumes", icon: "🍅", count: 18 },
  { name: "Viandes & Poissons", icon: "🥩", count: 12 },
  { name: "Épices", icon: "🌶️", count: 32 },
  { name: "Tubercules", icon: "🍠", count: 10 },
  { name: "Huilerie", icon: "🧴", count: 8 },
];

export default function ClientHome({ profile, onLogout }: { profile: UserProfile | null; onLogout: () => void }) {
  const { t } = useTranslation();
  const [tab, setTab] = useState("home");
  const [agencyId, setAgencyId] = useState<number | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("porto_market_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("Tous");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'fedapay' | 'kkiapay' | 'momo'>('fedapay');
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState<any>(null);
  const [showTracking, setShowTracking] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [homeSelectedCategory, setHomeSelectedCategory] = useState<string>("Tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(false);
  const [customPrice, setCustomPrice] = useState<number>(0);
  const [customQuantity, setCustomQuantity] = useState<number>(0);
  const [flexMode, setFlexMode] = useState<'price' | 'quantity'>('price');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem("porto_market_cart", JSON.stringify(cart));
    } catch {}
  }, [cart]);

  useEffect(() => {
    if (selectedProduct) {
      setCustomPrice(selectedProduct.isFlexible ? (selectedProduct.minPrice || 0) : 0);
      setCustomQuantity(selectedProduct.isFlexible ? 
        (selectedProduct.minPrice ? parseFloat((selectedProduct.minPrice / selectedProduct.price).toFixed(2)) : (selectedProduct.minQuantity || 0)) 
        : 1);
      setFlexMode('price');
    } else {
      setCustomPrice(0);
      setCustomQuantity(0);
    }
  }, [selectedProduct]);

  useEffect(() => {
    // Fetch live products
    const unsubProducts = onSnapshot(collection(db, "products"), (snap) => {
      if (snap.empty) {
        // Fallback or Initial Seed could be done here if needed
        setProducts(PRODUCTS);
      } else {
        setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    });

    // Fetch live categories if any
    const unsubCats = onSnapshot(collection(db, "categories"), (snap) => {
      if (!snap.empty) {
        setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else {
        // Translate mock categories
        setCategories(CATEGORIES.map(cat => ({
          ...cat,
          name: t(`catalog.categories.${cat.name}`, { defaultValue: cat.name })
        })));
      }
    });

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    if (profile?.displayName) {
      setToast({ message: `${t('header.welcome')}, ${profile.displayName} !`, type: "success" });
    }

    // Poll active deliveries from the backend every 8s while logged in
    let trackingInterval: ReturnType<typeof setInterval> | undefined;
    if (profile?.uid) {
      const refreshTracking = async () => {
        try {
          const list: any = await ordersApi.list();
          const active = (list?.data || []).find((o: any) =>
            ["delivering", "sorting", "buying"].includes(o.status)
          );
          setTrackingOrder(active || null);
        } catch {
          // silent — backend may be unreachable; we'll retry on the next tick
        }
      };
      refreshTracking();
      trackingInterval = setInterval(refreshTracking, 8000);
    }

    // Resolve the agency id (int) used by the backend
    agenciesApi.list().then((list: any) => {
      const first = Array.isArray(list) ? list[0] : list?.data?.[0];
      if (first?.id) setAgencyId(first.id);
    }).catch(() => {});

    return () => {
      unsubProducts();
      unsubCats();
      if (trackingInterval) clearInterval(trackingInterval);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [profile?.uid]);

  const featuredProducts = products.filter(p => p.featured);
  const totalCart = cart.reduce((sum, item) => sum + (item.price || 0), 0);

  const handleLogout = () => {
    onLogout();
  };

  const addToCart = (product: any, variant?: any, customQty?: number, customPrc?: number) => {
    const itemToAdd = {
      ...product,
      name: variant ? `${product.name} (${variant.name})` : product.name,
      price: customPrc || (variant ? variant.price : product.price),
      quantity: customQty || 1,
      variantId: variant?.id || null
    };
    
    setCart(prev => [...prev, itemToAdd]);
    setSelectedProduct(null);
    setToast({ message: `${product.name} ajouté au panier`, type: "success" });
  };

  const handleAddSmartItems = (items: any[]) => {
    setCart(prev => [...prev, ...items]);
    setToast({ message: `${items.length} produits ajoutés par l'IA`, type: "success" });
  };

  /**
   * Confirme la commande côté backend Laravel et nettoie le panier.
   */
  const confirmPaidOrder = async (orderId: number, transactionRef?: string) => {
    try {
      await paymentsApi.confirm({ order_id: orderId, transaction_ref: transactionRef });
    } catch (err) {
      console.error("Failed to confirm paid order on backend", err);
    }
    setOrderSuccess(String(orderId));
    setCart([]);
    try { localStorage.removeItem("porto_market_cart"); } catch {}
    setIsCartOpen(false);
    setToast({ message: "Paiement réussi !", type: "success" });
    setIsCheckingOut(false);
  };

  /**
   * Checkout — entièrement routé via le backend Laravel :
   *   1. Auth Sanctum (auto-register si absent)
   *   2. POST /api/orders (création de la commande en pending_payment)
   *   3. POST /api/payments/init (réservation d'un transaction_ref)
   *   4. SDK widget côté client (FedaPay / Kkiapay) ou simulation MoMo
   *   5. POST /api/payments/confirm (sur callback succès)
   */
  const handleCheckout = async () => {
    if (!profile) {
      window.location.href = "/login";
      return;
    }
    if (cart.length === 0) return;
    setIsCheckingOut(true);

    // 1) Création de la commande (l'utilisateur a déjà un token Sanctum après login)
    let order: any;
    try {
      order = await ordersApi.create({
        agency_id: agencyId ?? null,
        delivery_address: "Porto-Novo - À définir",
        time_window: "Aujourd'hui, 14h-16h",
        items: cart.map((item: any) => ({
          product_id: typeof item.id === "number" ? item.id : null,
          name: item.name,
          category: item.category,
          quantity: item.quantity || 1,
          unit_price: item.price,
        })),
      });
    } catch (err) {
      console.error("Order creation failed", err);
      setToast({ message: "Impossible de créer la commande", type: "error" });
      setIsCheckingOut(false);
      return;
    }

    const orderId: number = order.id;

    // 3) Réservation d'un transaction_ref backend
    let transactionRef: string | undefined;
    try {
      const init: any = await paymentsApi.initiate({
        amount: totalCart,
        phone_number: profile.phoneNumber || "00000000",
        order_id: orderId,
        method: paymentMethod,
      });
      transactionRef = init.transaction_ref;
    } catch (err) {
      console.error("Payment init failed", err);
      setToast({ message: "Initialisation du paiement échouée", type: "error" });
      setIsCheckingOut(false);
      return;
    }

    // 4) SDK widget → 5) confirm
    const onPaymentResponse = (resp: any) => {
      const success =
        !resp ||
        resp?.reason?.code === "SUCCESS" ||
        resp?.transaction?.status === "approved" ||
        resp?.status === "success" ||
        resp?.status === "approved";

      if (success) {
        confirmPaidOrder(orderId, transactionRef);
      } else {
        setToast({ message: "Paiement annulé ou refusé", type: "error" });
        setIsCheckingOut(false);
      }
    };

    try {
      if (paymentMethod === 'fedapay') {
        processFedapayPayment({
          amount: totalCart,
          description: `Commande Porto Market #${String(orderId).padStart(6, '0')}`,
          customer: {
            firstname: profile.displayName?.split(" ")[0] || "Client",
            lastname: profile.displayName?.split(" ")[1] || "Porto",
            email: profile.email || "client@portomarket.bj",
            phone: profile.phoneNumber || "00000000"
          },
          callback: onPaymentResponse,
        });
      } else if (paymentMethod === 'kkiapay') {
        processKkiapayPayment(totalCart, `Commande #${orderId}`, onPaymentResponse);
      } else {
        // MoMo : tant que la passerelle USSD n'est pas branchée, on simule
        // un succès et on laisse le backend confirmer la commande.
        await new Promise(resolve => setTimeout(resolve, 1500));
        await confirmPaidOrder(orderId, transactionRef);
      }
    } catch (err) {
      console.error("Checkout failed", err);
      setToast({ message: "Échec du paiement", type: "error" });
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F7FA]">
      {/* Top Promotion Bar */}
      <motion.div 
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        className="promo-bar shrink-0 z-50 sticky top-0"
      >
        Livraison offerte pour votre première commande à Porto-Novo !
      </motion.div>

      {/* Header */}
      <header className={cn(
        "px-6 md:px-12 h-20 flex items-center justify-between sticky top-8 z-40 transition-all duration-300 mx-4 md:mx-8 rounded-2xl",
        scrolled ? "glass shadow-lg" : "bg-transparent"
      )}>
        <div className="flex items-center gap-4 md:gap-12">
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl md:text-2xl font-black tracking-tighter text-[#1A1A1A] cursor-pointer"
            onClick={() => setTab("home")}
          >
            PORTO.MARKET
          </motion.h1>
          <nav className="hidden lg:block">
            <ul className="flex gap-8 text-sm font-bold text-[#1A1A1A]">
              <li><button onClick={() => setTab("home")} className={cn("hover:text-brand transition-colors", tab === "home" && "text-brand")}>{t('nav.home')}</button></li>
              <li><button onClick={() => setTab("shop")} className={cn("hover:text-brand transition-colors", tab === "shop" && "text-brand")}>{t('nav.shop')}</button></li>
              <li><button onClick={() => profile ? setTab("orders") : window.location.href = "/login"} className={cn("hover:text-brand transition-colors", tab === "orders" && "text-brand")}>{t('nav.orders')}</button></li>
              <li><button onClick={() => profile ? setTab("profile") : window.location.href = "/login"} className={cn("hover:text-brand transition-colors", tab === "profile" && "text-brand")}>{t('nav.profile')}</button></li>
              <li><a href="https://wa.me/22900000000" target="_blank" rel="noreferrer" className="hover:text-brand transition-colors flex items-center gap-1 font-bold"><Phone size={14} className="text-green-500" /> {t('nav.support')}</a></li>
            </ul>
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-6">
          <div className="hidden md:flex items-center gap-2 text-[10px] font-bold uppercase text-gray-400 tracking-widest">
            <MapPin className="w-3 h-3 text-brand" />
            {t('header.location')}
          </div>
          
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center">
              <LanguageSwitcher className="mr-2" />
            </div>
            
            <AnimatePresence>
              {isSearchBarVisible && (
                <motion.div 
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: window.innerWidth < 640 ? 140 : 240, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="relative overflow-hidden"
                >
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input 
                    ref={searchInputRef}
                    autoFocus
                    placeholder={t('header.search')} 
                    className="pl-9 h-10 w-full rounded-xl bg-white/50 border-gray-100 placeholder:text-gray-400 text-sm focus:bg-white transition-all shadow-sm"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (tab !== "shop") setTab("shop");
                    }}
                    onBlur={() => {
                      if (!searchQuery) setIsSearchBarVisible(false);
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="flex"
              onClick={() => setIsSearchBarVisible(!isSearchBarVisible)}
            >
              <Search size={20} />
            </Button>
            {profile ? (
               <Button variant="ghost" size="icon" className="hidden sm:flex" onClick={handleLogout}><User size={20} /></Button>
            ) : (
               <Button variant="ghost" size="icon" className="hidden sm:flex" onClick={() => window.location.href = "/login"}><User size={20} /></Button>
            )}
            <div className="relative">
              <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(true)} className="relative">
                <ShoppingCart size={20} />
                <AnimatePresence>
                  {cart.length > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 bg-brand text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-white font-black"
                    >
                      {cart.length}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden bg-gray-50 rounded-xl"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed inset-x-6 top-24 z-50 glass rounded-[2.5rem] p-8 flex flex-col gap-8 lg:hidden shadow-2xl border border-white/40"
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-brand">Navigation</span>
                <LanguageSwitcher />
              </div>

              <div className="flex flex-col gap-4">
                <button onClick={() => { setTab("home"); setIsMenuOpen(false); }} className={cn("text-3xl font-black text-left transition-all", tab === "home" ? "text-brand translate-x-2" : "text-gray-400")}>{t('nav.home')}</button>
                <button onClick={() => { setTab("shop"); setIsMenuOpen(false); }} className={cn("text-3xl font-black text-left transition-all", tab === "shop" ? "text-brand translate-x-2" : "text-gray-400")}>{t('nav.shop')}</button>
                <button onClick={() => { profile ? setTab("orders") : window.location.href = "/login"; setIsMenuOpen(false); }} className={cn("text-3xl font-black text-left transition-all", tab === "orders" ? "text-brand translate-x-2" : "text-gray-400")}>{t('nav.orders')}</button>
                <button onClick={() => { profile ? setTab("profile") : window.location.href = "/login"; setIsMenuOpen(false); }} className={cn("text-3xl font-black text-left transition-all", tab === "profile" ? "text-brand translate-x-2" : "text-gray-400")}>{t('nav.profile')}</button>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Assistance</p>
                <a href="https://wa.me/22900000000" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-lg font-bold">
                  <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500">
                    <Phone size={20} />
                  </div>
                  {t('nav.support')}
                </a>
              </div>

              <div className="flex gap-4 pt-4">
                {profile ? (
                  <Button variant="ghost" className="flex-1 rounded-2xl h-16 font-bold text-red-500 bg-red-50" onClick={() => { handleLogout(); setIsMenuOpen(false); }}>
                    <LogOut size={20} className="mr-2" /> Déconnexion
                  </Button>
                ) : (
                  <Button variant="primary" className="flex-1 rounded-2xl h-16 font-bold text-lg" onClick={() => { window.location.href = "/login"; setIsMenuOpen(false); }}>
                    {t('nav.connect')}
                  </Button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1">
        {tab === "home" ? (
          <div className="space-y-24 pb-24">
            {/* ... Home Content (No change) ... */}
            <section className="relative h-[85vh] flex items-center px-6 md:px-24 overflow-hidden rounded-b-[4rem] mx-4 md:mx-8 -mt-24 pt-24 min-h-[600px]">
              {/* Background Video/Image */}
              <div className="absolute inset-0 z-0">
                <img 
                  src="https://picsum.photos/seed/market-porto/1920/1080?blur=2" 
                  className="w-full h-full object-cover brightness-50"
                  alt="Background"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
              </div>

              <div className="relative z-10 max-w-2xl text-white">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-brand mb-6 block">
                    {t('hero.badge')}
                  </span>
                  <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter">
                    {t('hero.title_1')} <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-blue-400">{t('hero.title_2')}</span>
                  </h1>
                  <p className="text-lg md:text-xl opacity-80 mb-10 font-medium max-w-lg leading-relaxed">
                    {t('hero.desc')}
                  </p>
                  <div className="flex items-center gap-4">
                    <Button 
                      size="lg" 
                      className="h-16 px-12 rounded-2xl bg-brand text-white text-lg shadow-xl shadow-blue-500/20 whitespace-nowrap" 
                      onClick={() => setTab("shop")}
                    >
                      {t('hero.cta')}
                    </Button>
                  </div>
                  
                  {/* Mobile Benin Badge */}
                  <div className="xl:hidden mt-8 flex items-center gap-3 bg-white/5 backdrop-blur-sm p-3 rounded-2xl border border-white/10 w-fit">
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/20">
                      <img src="https://images.unsplash.com/photo-1594910419263-ce96bd72199f?q=80&w=100&h=100" alt="Amazon" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-brand">Culture Bénin</p>
                      <p className="text-xs font-bold text-white opacity-80 italic">Porto.Market, le choix du local</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Float Graphics */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="hidden xl:flex absolute right-16 top-1/2 -translate-y-1/2 items-center gap-8"
              >
                <div className="relative group">
                   <div className="absolute -inset-4 bg-brand/20 blur-3xl group-hover:bg-brand/40 transition-all rounded-full" />
                   <div className="relative w-80 h-[550px] rounded-[3rem] overflow-hidden border-8 border-white/20 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                      <img 
                        src="https://images.unsplash.com/photo-1594910419263-ce96bd72199f?q=80&w=600&h=1000&auto=format&fit=crop" 
                        className="w-full h-full object-cover" 
                        alt="Amazon Benin" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/80 to-transparent text-white">
                         <span className="text-[10px] font-black uppercase tracking-widest text-brand mb-2 block">Symbole du Bénin</span>
                         <p className="text-2xl font-black mb-1 leading-tight">L'Amazone</p>
                         <p className="text-white/60 text-xs">Fierté & Courage du Peuple</p>
                      </div>
                   </div>
                </div>

                <div className="flex flex-col gap-6">
                  <Card className="glass-dark p-6 w-64 animate-float">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-brand rounded-lg flex items-center justify-center text-white">
                          <Navigation size={20} />
                        </div>
                        <div className="text-white">
                          <p className="text-[10px] uppercase font-bold opacity-60">Origine Locale</p>
                          <p className="text-sm font-bold">Porto-Novo & Cotonou</p>
                        </div>
                      </div>
                      <div className="flex -space-x-2">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-gray-200 overflow-hidden">
                            <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="avatar" referrerPolicy="no-referrer" />
                          </div>
                        ))}
                        <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-brand flex items-center justify-center text-[10px] font-bold text-white">
                          +2k
                        </div>
                      </div>
                   </Card>

                   <Card className="glass p-6 w-64 animate-float bg-white/10 backdrop-blur-xl border-white/20">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white">
                          <CheckCircle2 size={20} />
                        </div>
                        <div className="text-white">
                          <p className="text-[10px] uppercase font-bold opacity-60">Qualité Benin</p>
                          <p className="text-sm font-bold">100% Organique</p>
                        </div>
                      </div>
                   </Card>

                   <Card className="glass p-6 w-64 animate-float bg-brand/10 backdrop-blur-xl border-brand/20">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand/20 rounded-lg flex items-center justify-center text-brand">
                          <ShoppingBasket size={20} />
                        </div>
                        <div className="text-white">
                          <p className="text-[10px] uppercase font-bold opacity-60">Patrimoine</p>
                          <p className="text-sm font-bold">Porto-Novo l'Incomparable</p>
                        </div>
                      </div>
                   </Card>
                </div>
              </motion.div>
            </section>

            {/* Featured Products */}
            {featuredProducts.length > 0 && (
              <section className="px-6 md:px-24 py-24">
                <div className="flex justify-between items-end mb-12 px-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand mb-4 block">Sélection Porto</span>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none">Nos Produits Phares.</h2>
                  </div>
                  <Button variant="ghost" className="text-brand font-bold" onClick={() => { setTab("shop"); setSelectedCategory("Tous"); }}>
                    Tout voir <ArrowRight size={18} className="ml-2" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
                  {featuredProducts.slice(0, 3).map((p) => (
                    <motion.div 
                      key={p.id}
                      whileHover={{ scale: 1.02 }}
                      className="group bg-white rounded-[3rem] p-6 shadow-sm border border-gray-100 hover:shadow-2xl transition-all cursor-pointer"
                      onClick={() => setSelectedProduct(p)}
                    >
                      <div className="aspect-[4/3] bg-gray-50 rounded-[2rem] flex items-center justify-center text-6xl mb-6 relative overflow-hidden">
                        {p.image?.startsWith('http') ? (
                          <img src={p.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt={p.name} />
                        ) : (
                          <span>{p.image}</span>
                        )}
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                          <Star className="w-3 h-3 text-orange-400 fill-orange-400" />
                          <span className="text-[10px] font-black">{p.rating || '4.5'}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h3 className="text-xl font-black leading-tight">{p.name}</h3>
                          <span className="text-brand font-black text-xl">{p.price}F</span>
                        </div>
                        <p className="text-gray-400 text-xs font-medium line-clamp-2">{p.description || `Unité: ${p.unit}`}</p>
                      </div>
                      <Button className="w-full mt-6 rounded-2xl h-12 bg-gray-100 text-gray-900 font-bold group-hover:bg-brand group-hover:text-white transition-colors">
                        Commander
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Features / Social Proof */}
            <section className="px-6 md:px-24">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <FeatureCard 
                  icon={<ShieldCheck className="w-8 h-8 text-brand" />}
                  title={t('features.quality_title')}
                  desc={t('features.quality_desc')}
                />
                <FeatureCard 
                  icon={<Truck className="w-8 h-8 text-brand" />}
                  title={t('features.delivery_title')}
                  desc={t('features.delivery_desc')}
                />
                <FeatureCard 
                  icon={<Star className="w-8 h-8 text-brand" />}
                  title={t('features.price_title')}
                  desc={t('features.price_desc')}
                />
              </div>
            </section>

            {/* Combined Categories & Product Feed */}
            <section className="px-6 md:px-24 bg-white py-32 rounded-[4rem] mx-4 md:mx-8 border border-gray-100 shadow-sm relative overflow-hidden">
              {/* Background accent */}
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gray-50/50 -skew-x-12 translate-x-1/2" />
              
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row justify-between items-end gap-12 mb-20 px-4">
                  <div className="max-w-xl">
                    <span className="text-xs font-black uppercase tracking-[0.4em] text-brand mb-6 block">{t('shop.live_market')}</span>
                    <h2 className="text-4xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-8">
                       {t('shop.title_break_1')} <br />
                       <span className="text-gray-300 italic serif font-light pr-4">{t('shop.title_break_2')}</span> {t('shop.title_break_3')}
                    </h2>
                    <p className="text-gray-500 font-medium text-lg leading-relaxed">
                       {t('shop.market_desc')}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 justify-end max-w-2xl">
                    <Button 
                      variant={homeSelectedCategory === "Tous" ? "primary" : "ghost"}
                      className={cn("rounded-2xl px-6 font-bold transition-all", homeSelectedCategory === "Tous" ? "bg-brand" : "hover:bg-gray-100")}
                      onClick={() => setHomeSelectedCategory("Tous")}
                    >
                      🏪 {t('shop.all')}
                    </Button>
                    {categories.map(cat => (
                      <Button 
                        key={cat.id || cat.name}
                        variant={homeSelectedCategory === (cat.id || cat.name) ? "primary" : "ghost"}
                        className={cn(
                          "rounded-2xl px-6 font-bold transition-all whitespace-nowrap", 
                          homeSelectedCategory === (cat.id || cat.name) ? "bg-brand" : "hover:bg-gray-100"
                        )}
                        onClick={() => setHomeSelectedCategory(cat.id || cat.name)}
                      >
                        {cat.icon || "📦"} {t(`catalog.categories.${cat.name}`, { defaultValue: cat.name })}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Animated Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-4 min-h-[400px]">
                  <AnimatePresence mode="popLayout">
                    {products
                      .filter(p => homeSelectedCategory === "Tous" || p.category === homeSelectedCategory)
                      .slice(0, 8)
                      .map((p, idx) => (
                        <motion.div 
                          key={p.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.4, delay: idx * 0.05 }}
                          className="group"
                        >
                          <Card className="p-5 h-full border-transparent hover:border-brand/10 hover:shadow-2xl hover:shadow-brand/5 transition-all rounded-[2.5rem] bg-white flex flex-col">
                            <div 
                              className="aspect-square bg-gray-50 rounded-[2rem] flex items-center justify-center text-4xl mb-6 relative overflow-hidden cursor-pointer group-hover:scale-[1.03] transition-transform duration-500"
                              onClick={() => setSelectedProduct(p)}
                            >
                               {p.image?.startsWith('http') ? (
                                 <img src={p.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt={p.name} />
                               ) : (
                                 <span>{p.image}</span>
                               )}
                               <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                            </div>
                            <div className="flex justify-between items-start mb-2 px-1">
                               <span className="text-[9px] font-black uppercase tracking-widest text-brand/50">{t(`catalog.categories.${p.category}`, { defaultValue: p.category })}</span>
                               <div className="flex items-center gap-1 text-[9px] font-black text-orange-500">
                                  <Star size={10} fill="currentColor" /> {p.rating || '4.5'}
                               </div>
                            </div>
                            <h4 className="text-lg font-black text-[#1A1A1A] mb-4 px-1 leading-tight group-hover:text-brand transition-colors">{p.name}</h4>
                            
                            <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center px-1">
                               <p className="text-xl font-black text-[#1A1A1A]">{p.price}F</p>
                               <Button 
                                 size="icon" 
                                 className="rounded-xl h-10 w-10 bg-gray-50 text-gray-400 group-hover:bg-brand group-hover:text-white transition-all active:scale-90"
                                 onClick={() => addToCart(p)}
                                >
                                 <Plus size={18} />
                               </Button>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                  </AnimatePresence>
                </div>

                <div className="mt-20 text-center">
                   <Button 
                    size="lg" 
                    variant="outline"
                    className="rounded-[2rem] h-16 px-12 border-gray-100 font-black text-xs uppercase tracking-[0.2em] gap-3 hover:bg-[#1A1A1A] hover:text-white transition-all shadow-xl shadow-gray-200/50"
                    onClick={() => {
                       setTab("shop");
                       setSelectedCategory(homeSelectedCategory);
                       window.scrollTo({ top: 0 });
                    }}
                   >
                     {t('shop.explorer_boutique')} <ArrowRight size={18} />
                   </Button>
                </div>
              </div>
            </section>

            {/* CTA Final */}
            <section className="px-6 md:px-24 py-12">
               <div className="relative bg-[#1A1A1A] rounded-[4rem] p-12 md:p-24 overflow-hidden text-center text-white">
                  <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                    <h2 className="text-4xl md:text-7xl font-black tracking-tight">{t('shop.cta_final.title')}</h2>
                    <p className="text-lg md:text-xl text-gray-400 font-medium">{t('shop.cta_final.subtitle')}</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                      <Button size="lg" className="rounded-2xl h-16 px-12 bg-brand font-bold text-lg" onClick={() => setTab("shop")}>{t('shop.cta_final.button')}</Button>
                      {trackingOrder && (
                        <Button 
                          variant="outline" 
                          size="lg" 
                          className="rounded-2xl h-16 px-12 bg-white/5 border-white/20 text-white font-bold text-lg gap-2"
                          onClick={() => setShowTracking(true)}
                        >
                          <Truck className="w-5 h-5 animate-bounce" /> {t('tracking.updates_btn', { defaultValue: 'Suivre mon colis' })}
                        </Button>
                      )}
                    </div>
                  </div>
                  {/* Decorative */}
                  <div className="absolute top-0 right-0 w-96 h-96 bg-brand opacity-10 blur-[120px]" />
                  <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 opacity-10 blur-[120px]" />
               </div>
            </section>
          </div>
        ) : tab === "orders" ? (
          <OrderHistoryView 
            profile={profile} 
            products={products}
            addToCart={addToCart}
            setIsCartOpen={setIsCartOpen}
            onTrackOrder={(order) => {
              setTrackingOrder(order);
              setShowTracking(true);
            }} 
          />
        ) : tab === "profile" ? (
          <ProfileView profile={profile} onLogout={handleLogout} />
        ) : (
          /* Shop View: Responsive Grid with Sidebar */
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 px-6 md:px-12 py-12 max-w-[1600px] mx-auto min-h-screen">
            {/* Sidebar Desktop */}
            <aside className="hidden lg:flex flex-col gap-10 sticky top-32 h-fit bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#1A1A1A]">{t('shop.categories')}</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => setSelectedCategory("Tous")}
                    className={cn(
                      "flex items-center justify-between w-full group py-1 px-4 rounded-xl transition-all",
                      selectedCategory === "Tous" ? "bg-brand/10 text-brand" : "hover:bg-gray-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-brand/10 transition-colors">🏪</span>
                      <span className="text-sm font-bold text-gray-600 group-hover:text-black transition-colors">{t('shop.all_categories')}</span>
                    </div>
                  </button>
                  {categories.map(c => (
                    <button 
                      key={c.name} 
                      onClick={() => setSelectedCategory(c.name)}
                      className={cn(
                        "flex items-center justify-between w-full group py-1 px-4 rounded-xl transition-all",
                        selectedCategory === c.name ? "bg-brand/10 text-brand" : "hover:bg-gray-50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-brand/10 transition-colors">{c.icon || "📦"}</span>
                        <span className="text-sm font-bold text-gray-600 group-hover:text-black transition-colors">{t(`catalog.categories.${c.name}`, { defaultValue: c.name })}</span>
                      </div>
                      <span className="text-[10px] bg-gray-100 px-2 py-1 rounded-full text-gray-400 font-black">{c.count || 0}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#1A1A1A]">{t('shop.price_range')}</h3>
                  <span className="text-xs text-brand font-bold">{t('footer.stay_informed')}</span>
                </div>
                <div className="space-y-2">
                  <FilterOption label={t('shop.all_prices')} checked />
                  <FilterOption label={`${t('shop.under')} 1,000F`} />
                  <FilterOption label="1,000F — 5,000F" />
                  <FilterOption label="5,000F+" />
                </div>
              </div>

              <Card className="bg-brand/5 border-none p-6 text-brand">
                 <p className="text-xs font-black uppercase tracking-widest mb-2">{t('shop.need_help')}</p>
                 <p className="text-sm font-medium mb-4">{t('shop.help_desc')}</p>
                 <Button variant="outline" className="w-full rounded-xl border-brand/20 text-brand bg-white font-bold h-10 text-xs">{t('shop.help_btn')}</Button>
              </Card>
            </aside>

            {/* Shop Column */}
            <div className="space-y-12">
               {/* Smart List AI */}
               <SmartList products={products} onAddItems={handleAddSmartItems} />

               {/* Search / Sort */}
               <div className="flex flex-col sm:flex-row justify-between items-center gap-6 bg-white p-4 px-6 rounded-[2rem] border border-gray-100 shadow-sm">
                  <div className="relative flex-1 w-full max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input 
                      placeholder={t('shop.search_placeholder')} 
                      className="pl-12 bg-gray-50/50 border-none h-12 text-sm rounded-2xl" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-widest text-gray-300">{t('shop.sort_by')}</span>
                    <select 
                      className="bg-transparent font-bold text-sm focus:outline-none"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="newest">{t('shop.sort.newest')}</option>
                      <option value="price-asc">{t('shop.sort.price_asc')}</option>
                      <option value="price-desc">{t('shop.sort.price_desc')}</option>
                      <option value="rating">{t('shop.sort.rating')}</option>
                    </select>
                  </div>
               </div>

               {/* Grid */}
               <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                  {products
                    .filter(p => {
                      const belongsToCategory = selectedCategory === "Tous" || p.category === selectedCategory;
                      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                            p.category.toLowerCase().includes(searchQuery.toLowerCase());
                      return belongsToCategory && matchesSearch;
                    })
                    .sort((a, b) => {
                      if (sortBy === "price-asc") return a.price - b.price;
                      if (sortBy === "price-desc") return b.price - a.price;
                      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
                      return 0;
                    })
                    .map((p, idx) => (
                    <motion.div 
                      key={p.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card 
                        onClick={() => setSelectedProduct(p)}
                        className="group p-5 hover:shadow-2xl hover:shadow-brand/10 transition-all border-gray-100 rounded-[2.5rem] bg-white cursor-pointer"
                      >
                        <div 
                          className="aspect-[4/3] bg-gray-50 rounded-[2rem] flex items-center justify-center text-6xl mb-6 relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-500 cursor-pointer"
                          onClick={() => setSelectedProduct(p)}
                        >
                           {p.image?.startsWith('http') ? (
                             <img src={p.image} className="w-full h-full object-cover rounded-[2rem]" referrerPolicy="no-referrer" alt={p.name} />
                           ) : (
                             <span>{p.image}</span>
                           )}
                           <div className="absolute top-4 right-4 flex gap-1">
                              <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"><ArrowRight size={14} /></Button>
                           </div>
                        </div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-brand/60">{p.category}</span>
                          <div className="flex items-center gap-1 text-[10px] font-black text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                            <Star size={10} fill="currentColor" /> {p.rating}
                          </div>
                        </div>
                        <h4 className="text-xl font-bold text-[#1A1A1A] mb-2">{p.name}</h4>
                        <p className="text-[10px] text-gray-400 font-medium line-clamp-2 mb-4 h-10">{p.description || `Produit frais direct du marché.`}</p>
                        
                        <div className="flex justify-between items-center mt-auto">
                          <div>
                            <p className="text-2xl font-black text-[#1A1A1A] tracking-tight">{p.price}F <span className="text-xs text-gray-400 font-medium">/ {p.unit}</span></p>
                          </div>
                          <Button 
                            variant="primary" 
                            size="icon" 
                            className={cn("rounded-2xl h-12 w-12 shadow-brand/20 shadow-lg active:scale-90", (p.variants?.length > 0 || p.isFlexible) ? "bg-black" : "bg-brand")}
                            onClick={(e) => {
                              e.stopPropagation();
                              (p.variants?.length > 0 || p.isFlexible) ? setSelectedProduct(p) : addToCart(p);
                            }}
                          >
                            {(p.variants?.length > 0 || p.isFlexible) ? <Plus size={24} className="group-hover:rotate-90 transition-transform" /> : <Plus size={24} />}
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
               </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#141414] text-white pt-24 pb-12 px-6 md:px-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-24">
          <div className="col-span-2 space-y-8">
            <h2 className="text-3xl font-black tracking-tighter italic">PORTO.MARKET</h2>
            <p className="text-gray-500 max-w-sm font-medium">{t('footer.brand_desc')}</p>
            <div className="flex gap-4">
              <FooterSocial icon={<Facebook size={20} />} />
              <FooterSocial icon={<Instagram size={20} />} />
              <FooterSocial icon={<Twitter size={20} />} />
            </div>
          </div>
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-gray-300">{t('footer.company')}</h4>
            <ul className="space-y-4 text-gray-500 font-medium text-sm">
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.vision')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.careers')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.partners')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.blog')}</a></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-gray-300">{t('footer.support')}</h4>
            <ul className="space-y-4 text-gray-500 font-medium text-sm">
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.faq')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.delivery')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.momo')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.contact')}</a></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-12 border-t border-white/5">
          <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">{t('footer.copyright')}</p>
          <div className="flex gap-8 text-[10px] text-gray-600 font-black uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">{t('footer.privacy')}</a>
            <a href="#" className="hover:text-white transition-colors">{t('footer.cgv')}</a>
          </div>
        </div>
      </footer>

      {/* Product Modal */}
      <AnimatePresence>
        {showTracking && trackingOrder && (
          <OrderTrackingModal 
            order={trackingOrder} 
            onClose={() => setShowTracking(false)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedProduct(null)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[3rem] w-full max-w-2xl relative overflow-hidden shadow-2xl flex flex-col md:flex-row h-auto max-h-[90vh] md:h-[500px] overflow-y-auto"
            >
               <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-20 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center hover:bg-white transition-colors">
                  <X />
               </button>

               <div className="w-full md:w-1/2 bg-gray-50 flex items-center justify-center text-8xl p-12 overflow-hidden">
                  {selectedProduct.image?.startsWith('http') ? (
                    <img src={selectedProduct.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt={selectedProduct.name} />
                  ) : (
                    <span>{selectedProduct.image}</span>
                  )}
               </div>

                <div className="w-full md:w-1/2 p-10 flex flex-col overflow-y-auto">
                  <div className="space-y-4 mb-8">
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand">{selectedProduct.category}</span>
                     <h2 className="text-3xl font-black text-[#1A1A1A] leading-tight">{selectedProduct.name}</h2>
                     <p className="text-sm text-gray-500 leading-relaxed italic">{selectedProduct.description || "Pas de description disponible."}</p>
                     
                     {selectedProduct.attributes && selectedProduct.attributes.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                           {selectedProduct.attributes.map((attr: any, i: number) => (
                             <div key={i} className="bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl flex items-center gap-2">
                                <span className="text-[9px] font-black uppercase text-gray-400">{attr.name}:</span>
                                <span className="text-[10px] font-bold text-gray-900">{attr.value}</span>
                             </div>
                           ))}
                        </div>
                     )}
                  </div>

                  <div className="mt-auto space-y-6">
                     {selectedProduct.isFlexible ? (
                        <div className="space-y-6 p-6 rounded-3xl bg-gray-50 border border-gray-100">
                           <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                 <span className="text-[10px] font-black uppercase tracking-widest text-brand">{t('shop.flexible')}</span>
                                 <div className="h-px w-8 bg-brand/10" />
                              </div>
                              <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                                 <button 
                                   onClick={() => setFlexMode('price')}
                                   className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all", flexMode === 'price' ? "bg-brand text-white shadow-md shadow-brand/20" : "text-gray-400 hover:text-gray-600")}
                                 >
                                   Prix
                                 </button>
                                 <button 
                                   onClick={() => setFlexMode('quantity')}
                                   className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all", flexMode === 'quantity' ? "bg-brand text-white shadow-md shadow-brand/20" : "text-gray-400 hover:text-gray-600")}
                                 >
                                   {selectedProduct.unit}
                                 </button>
                              </div>
                           </div>
                           
                           <div className="grid grid-cols-1 gap-6">
                              <div className={cn("space-y-2 transition-all duration-300", flexMode !== 'price' && "opacity-30 pointer-events-none scale-[0.98]")}>
                                 <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('shop.custom_amount')} (F CFA)</label>
                                 <div className="relative">
                                    <Input 
                                       type="number" 
                                       className="h-14 rounded-2xl pl-12 font-black text-lg bg-white" 
                                       placeholder="ex: 500"
                                       value={customPrice || ""}
                                       disabled={flexMode !== 'price'}
                                       onChange={(e) => {
                                          const val = parseFloat(e.target.value) || 0;
                                          setCustomPrice(val);
                                          setCustomQuantity(parseFloat((val / selectedProduct.price).toFixed(2)));
                                       }}
                                    />
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 font-bold">F</div>
                                 </div>
                                 {selectedProduct.minPrice && (
                                    <p className="text-[9px] font-bold text-gray-400 italic">{t('shop.min_price_error', { min: selectedProduct.minPrice })}</p>
                                 )}
                              </div>

                              <div className={cn("space-y-2 transition-all duration-300", flexMode !== 'quantity' && "opacity-30 pointer-events-none scale-[0.98]")}>
                                 <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('shop.custom_quantity')} ({selectedProduct.unit})</label>
                                 <div className="relative">
                                    <Input 
                                       type="number" 
                                       step="0.1"
                                       className="h-14 rounded-2xl pl-12 font-black text-lg bg-white" 
                                       placeholder={`ex: 1.5 ${selectedProduct.unit}`}
                                       value={customQuantity || ""}
                                       disabled={flexMode !== 'quantity'}
                                       onChange={(e) => {
                                          const val = parseFloat(e.target.value) || 0;
                                          setCustomQuantity(val);
                                          setCustomPrice(Math.round(val * selectedProduct.price));
                                       }}
                                    />
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 font-bold uppercase text-[10px]">{selectedProduct.unit}</div>
                                 </div>
                                 {selectedProduct.minQuantity && (
                                    <p className="text-[9px] font-bold text-gray-400 italic">{t('shop.min_qty_error', { min: selectedProduct.minQuantity, unit: selectedProduct.unit })}</p>
                                 )}
                              </div>
                           </div>

                           <Button 
                              onClick={() => {
                                 if (selectedProduct.minPrice && customPrice < selectedProduct.minPrice) {
                                    setToast({ message: t('shop.min_price_error', { min: selectedProduct.minPrice }), type: "error" });
                                    return;
                                 }
                                 if (selectedProduct.minQuantity && customQuantity < selectedProduct.minQuantity) {
                                    setToast({ message: t('shop.min_qty_error', { min: selectedProduct.minQuantity, unit: selectedProduct.unit }), type: "error" });
                                    return;
                                 }
                                 addToCart(selectedProduct, null, customQuantity, customPrice);
                              }}
                              disabled={!customPrice || customPrice <= 0}
                              className="w-full rounded-2xl h-16 bg-brand text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-brand/20 active:scale-95"
                           >
                              {t('common.add_to_cart', { defaultValue: 'Ajouter au panier' })} — {customPrice || 0}F
                           </Button>
                        </div>
                     ) : selectedProduct.variants && selectedProduct.variants.length > 0 ? (
                        <div className="space-y-3">
                           <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Options disponibles :</p>
                           <div className="grid grid-cols-1 gap-2">
                              {selectedProduct.variants.map((v: any) => (
                                 <button 
                                   key={v.id}
                                   onClick={() => addToCart(selectedProduct, v)}
                                   className="flex justify-between items-center p-4 rounded-2xl bg-gray-50 hover:bg-brand hover:text-white transition-all group"
                                 >
                                    <span className="font-bold text-sm tracking-tight">{v.name}</span>
                                    <span className="font-black text-brand group-hover:text-white">{v.price}F</span>
                                 </button>
                              ))}
                           </div>
                        </div>
                     ) : (
                        <div className="flex flex-col gap-4">
                           <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                              <div className="flex items-center gap-3">
                                 <button 
                                    onClick={() => setCustomQuantity(Math.max(1, (customQuantity || 1) - 1))}
                                    className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-gray-100 font-black text-gray-400 hover:text-brand"
                                 >-</button>
                                 <span className="font-black text-lg w-8 text-center">{customQuantity || 1}</span>
                                 <button 
                                    onClick={() => setCustomQuantity((customQuantity || 1) + 1)}
                                    className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-gray-100 font-black text-gray-400 hover:text-brand"
                                 >+</button>
                              </div>
                              <p className="text-2xl font-black text-[#1A1A1A] tracking-tighter">{(customQuantity || 1) * selectedProduct.price}F</p>
                           </div>
                           <Button 
                             onClick={() => addToCart(selectedProduct, null, customQuantity || 1, (customQuantity || 1) * selectedProduct.price)}
                             className="rounded-2xl h-14 bg-brand text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-brand/20 active:scale-95"
                           >
                             {t('common.add_to_cart', { defaultValue: 'Ajouter au panier' })}
                           </Button>
                        </div>
                     )}
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {!isMenuOpen && (
          <motion.nav 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="lg:hidden fixed bottom-6 left-6 right-6 h-18 glass-dark rounded-[2.5rem] shadow-2xl flex items-center justify-around px-8 z-50 border-white/10"
          >
            <NavIcon active={tab === "home"} icon={<Star size={24} />} onClick={() => setTab("home")} />
            <NavIcon active={tab === "shop"} icon={<ShoppingBasket size={24} />} onClick={() => setTab("shop")} />
            <NavIcon active={false} icon={<History size={24} />} onClick={() => setTab("orders")} />
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
              onClick={() => setIsCartOpen(false)}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black tracking-tight underline decoration-brand decoration-4 underline-offset-8">{t('cart.title')}</h2>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-4">{t('cart.subtitle')}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(false)} className="rounded-full bg-gray-50"><X /></Button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                      <ShoppingBasket size={40} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{t('cart.empty_title')}</h3>
                      <p className="text-sm text-gray-400">{t('cart.empty_desc')}</p>
                    </div>
                    <Button variant="outline" onClick={() => { setIsCartOpen(false); setTab("shop"); }} className="rounded-xl px-8">{t('cart.go_to_shop')}</Button>
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <motion.div 
                      key={`${item.id}-${idx}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl shrink-0">{item.image}</div>
                        <div>
                          <p className="font-bold text-[#1A1A1A]">{item.name}</p>
                          <p className="text-xs text-gray-400 font-medium">{item.quantity} {item.unit}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-brand">{item.price}F</p>
                        <button 
                          onClick={() => setCart(prev => prev.filter((_, i) => i !== idx))}
                          className="text-[10px] text-red-400 font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {t('common.remove')}
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-8 bg-gray-50/50 border-t border-gray-100 space-y-6">
                  <div className="space-y-3">
                    <div className="space-y-4 pt-2 pb-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('cart.payment_mode')}</p>
                      <div className="grid grid-cols-3 gap-2">
                        <button 
                          onClick={() => setPaymentMethod('fedapay')}
                          className={cn("flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all", paymentMethod === 'fedapay' ? "border-[#2563EB] bg-blue-50" : "border-white bg-white shadow-sm")}
                        >
                          <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white text-[10px] font-black">FP</div>
                          <span className="text-[9px] font-black italic">FedaPay</span>
                        </button>
                        <button 
                          onClick={() => setPaymentMethod('kkiapay')}
                          className={cn("flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all", paymentMethod === 'kkiapay' ? "border-[#6C2BD9] bg-purple-50" : "border-white bg-white shadow-sm")}
                        >
                          <div className="w-8 h-8 rounded-lg bg-[#6C2BD9] flex items-center justify-center text-white text-[10px] font-black">KK</div>
                          <span className="text-[9px] font-black italic">KkiaPay</span>
                        </button>
                        <button 
                          onClick={() => setPaymentMethod('momo')}
                          className={cn("flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all", paymentMethod === 'momo' ? "border-[#FACC15] bg-yellow-50" : "border-white bg-white shadow-sm")}
                        >
                          <div className="w-8 h-8 rounded-lg bg-[#FACC15] flex items-center justify-center text-white text-[10px] font-black">MO</div>
                          <span className="text-[9px] font-black italic">MoMo</span>
                        </button>
                      </div>
                    </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-medium">{t('cart.subtotal')}</span>
                        <span className="font-bold">{totalCart}F CFA</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-medium">{t('cart.delivery_fee')}</span>
                        <span className="font-bold text-green-500">{t('cart.free')}</span>
                      </div>
                      <div className="flex justify-between text-xl pt-3 border-t border-gray-100">
                        <span className="font-black tracking-tight uppercase">{t('common.total')}</span>
                        <span className="font-black text-brand underline decoration-gray-200 underline-offset-4">{totalCart}F CFA</span>
                      </div>
                  </div>
                  
                  <Button 
                    variant="primary" 
                    className="w-full h-16 rounded-2xl text-lg font-black shadow-xl shadow-brand/20 relative overflow-hidden group"
                    onClick={handleCheckout}
                    loading={isCheckingOut}
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      Payer via MTN MoMo <ArrowRight size={20} />
                    </span>
                    <motion.div 
                      className="absolute inset-0 bg-yellow-400"
                      initial={{ x: "-100%" }}
                      animate={{ x: isCheckingOut ? "0%" : "-100%" }}
                      transition={{ duration: 2 }}
                    />
                  </Button>
                  <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest">Paiement sécurisé et instantané</p>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Floating Language Switcher */}
      <LanguageSwitcher isFloating className={isCartOpen ? "hidden" : "flex"} />

      {/* AI Chatbot */}
      <AIChatbot products={products} onAddItems={handleAddSmartItems} />

      {/* Success Modal */}
      <AnimatePresence>
        {orderSuccess && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand/10 backdrop-blur-xl"
              onClick={() => setOrderSuccess(null)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white p-12 rounded-[3.5rem] shadow-2xl relative max-w-lg w-full text-center space-y-8"
            >
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto animate-bounce">
                <CheckCircle2 size={48} />
              </div>
              <div>
                <h2 className="text-4xl font-black tracking-tight mb-4">{t('success.title')}</h2>
                <p className="text-gray-500 font-medium">{t('success.desc', { id: orderSuccess.slice(0, 8) })}</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2">{t('success.next_step')}</p>
                <p className="font-bold text-sm">{t('success.buyer_assigned')}</p>
              </div>
              <Button variant="primary" className="w-full h-14 rounded-2xl" onClick={() => setOrderSuccess(null)}>
                {t('common.close', { defaultValue: 'Fermer' })}
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="space-y-4">
      <div className="w-16 h-16 rounded-[2rem] bg-white border border-gray-100 flex items-center justify-center shadow-lg shadow-gray-200/50">
        {icon}
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-gray-500 text-sm font-medium leading-relaxed">{desc}</p>
    </div>
  );
}

function FilterOption({ label, checked = false }: { label: string; checked?: boolean }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <input type="checkbox" defaultChecked={checked} className="w-4 h-4 rounded-md border-gray-200 text-brand focus:ring-brand" />
      <span className="text-xs font-bold text-gray-500 group-hover:text-black transition-colors">{label}</span>
    </label>
  );
}

function NavIcon({ active, icon, onClick }: { active: boolean; icon: any; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "p-3 rounded-[1.5rem] transition-all duration-300 relative",
        active ? "text-brand scale-110" : "text-white/40 hover:text-white"
      )}
    >
      {icon}
      {active && <motion.div layoutId="nav-active" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand rounded-full" />}
    </button>
  );
}

function FooterSocial({ icon }: { icon: any }) {
  return (
    <a href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-brand hover:border-brand transition-all text-gray-400 hover:text-white">
      {icon}
    </a>
  );
}

function OrderHistoryView({ profile, onTrackOrder, products, addToCart, setIsCartOpen }: { 
  profile: UserProfile | null, 
  onTrackOrder: (order: any) => void,
  products: any[],
  addToCart: (product: any) => void,
  setIsCartOpen: (open: boolean) => void
}) {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    let cancelled = false;
    const fetchOrders = async () => {
      try {
        const list: any = await ordersApi.list();
        if (cancelled) return;
        const arr = (list?.data || []) as any[];
        // Tri du plus récent au plus ancien
        arr.sort((a, b) => (new Date(b.created_at).getTime()) - (new Date(a.created_at).getTime()));
        setOrders(arr);
      } catch (err) {
        console.error("Failed to load orders", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchOrders();
    const interval = setInterval(fetchOrders, 12000); // léger polling pour suivre les changements de statut
    return () => { cancelled = true; clearInterval(interval); };
  }, [profile?.uid]);

  if (loading) return <div className="p-12 text-center text-gray-400">{t('orders.loading')}</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
      <div>
        <h2 className="text-4xl font-black tracking-tight mb-4">{t('orders.title')}</h2>
        <p className="text-gray-500 font-medium italic">{t('orders.subtitle')}</p>
      </div>

      <div className="space-y-6">
        {orders.length === 0 ? (
          <div className="bg-white p-12 rounded-[2.5rem] text-center border border-gray-100 italic text-gray-400">
            {t('orders.no_orders')}
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id}>
              <Card className="p-8 border-gray-100 hover:shadow-xl transition-all rounded-[2.5rem] bg-white group">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black uppercase tracking-widest text-[#1A1A1A]">{t('orders.order_id')}{String(order.id).padStart(6, '0')}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-500">{order.delivery_address || order.deliveryAddress}</p>
                    <p className="text-[10px] text-gray-300 font-black uppercase mt-1 tracking-widest">{t('orders.created_at')} {order.created_at ? new Date(order.created_at).toLocaleDateString('fr-FR') : (order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('fr-FR') : 'Récemment')}</p>
                  </div>
                </div>
                <div className="text-right flex flex-col justify-center items-end border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-12">
                  <p className="text-3xl font-black text-[#1A1A1A] mb-1">{order.total_amount || order.totalAmount}F CFA</p>
                  <Button variant="ghost" size="sm" className="gap-2 group-hover:text-brand" onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                    {expandedOrder === order.id ? "Masquer" : "Détails"} <ChevronRight size={14} className={cn("transition-transform", expandedOrder === order.id && "rotate-90")} />
                  </Button>
                </div>
              </div>

               {expandedOrder === order.id && (
                 <motion.div 
                   initial={{ height: 0, opacity: 0 }}
                   animate={{ height: "auto", opacity: 1 }}
                   className="px-6 py-6 border-t border-gray-100 bg-gray-50/50 rounded-b-[2rem] overflow-hidden"
                 >
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 px-2">{t('orders.items')}</p>
                   <div className="space-y-4">
                      {order.items?.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between items-center px-2">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 bg-white border border-gray-100 rounded-lg flex items-center justify-center text-sm shadow-sm">📦</div>
                             <div>
                                <p className="text-sm font-bold text-gray-800">{item.name}</p>
                                <p className="text-[10px] text-gray-400 font-medium">{item.quantity}</p>
                             </div>
                          </div>
                          <p className="font-black text-xs text-gray-700">{item.subtotal || item.estimated_budget || item.estimatedBudget}F</p>
                        </div>
                      ))}
                      <div className="pt-4 border-t border-gray-200 mt-4 flex justify-between items-center px-2">
                         <Button 
                          variant="outline" 
                          className="rounded-xl h-10 px-6 gap-2 font-bold text-xs" 
                          onClick={() => {
                            order.items.forEach((item: any) => {
                              const product = products.find(p => p.name === item.name);
                              if (product) addToCart(product);
                            });
                            setIsCartOpen(true);
                          }}
                         >
                           {t('orders.reorder')}
                         </Button>
                         <div className="text-right">
                           <span className="text-[10px] font-black uppercase text-gray-400 block">{t('orders.total_paid')}</span>
                           <span className="text-lg font-black text-brand">{order.total_amount || order.totalAmount}F CFA</span>
                         </div>
                      </div>
                   </div>
                 </motion.div>
               )}

              {/* Progress Stepper (Simulated based on status) */}
              <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                 <div className="flex gap-8 items-center flex-1">
                    <div className="flex justify-between items-center relative flex-1 max-w-sm">
                      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
                      <Step status="completed" label={t('orders.steps.payment')} />
                      <Step status={['confirmed', 'buying', 'sorting', 'delivering', 'completed'].includes(order.status) ? "completed" : "pending"} label={t('orders.steps.validation')} />
                      <Step status={['buying', 'sorting', 'delivering', 'completed'].includes(order.status) ? "completed" : "pending"} label={t('orders.steps.purchase')} />
                      <Step status={['delivering', 'completed'].includes(order.status) ? "completed" : "pending"} label={t('orders.steps.delivery')} />
                    </div>
                 </div>

                 {order.status === 'delivering' && (
                   <Button 
                    className="rounded-xl h-10 px-4 gap-2 bg-brand font-bold text-xs shadow-lg shadow-brand/20 animate-pulse"
                    onClick={() => {
                      onTrackOrder(order);
                    }}
                   >
                     <Navigation size={14} className="rotate-45" /> {t('orders.track')}
                   </Button>
                 )}
              </div>
            </Card>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Step({ status, label }: { status: "completed" | "pending" | "active"; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 relative z-10">
      <div className={cn(
        "w-6 h-6 rounded-full border-4 flex items-center justify-center transition-all",
        status === "completed" ? "bg-brand border-blue-100 text-white" : "bg-white border-gray-100 text-gray-300"
      )}>
        {status === "completed" && <CheckCircle2 size={12} />}
      </div>
      <span className={cn("text-[9px] font-black uppercase tracking-widest", status === "completed" ? "text-brand" : "text-gray-300")}>{label}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  const labels: any = {
    pending_payment: t('orders.status_list.pending_payment', { defaultValue: "Attente Paiement" }),
    confirmed: t('orders.status_list.confirmed', { defaultValue: "Confirmée" }),
    buying: t('orders.status_list.buying', { defaultValue: "Achats en cours" }),
    sorting: t('orders.status_list.sorting', { defaultValue: "Tri & Colisage" }),
    delivering: t('orders.status_list.delivering', { defaultValue: "En Livraison" }),
    completed: t('orders.status_list.completed', { defaultValue: "Terminée" }),
    cancelled: t('orders.status_list.cancelled', { defaultValue: "Annulée" })
  };
  const styles: any = {
    pending_payment: "bg-orange-50 text-orange-600 border-orange-100",
    confirmed: "bg-blue-50 text-blue-600 border-blue-100",
    buying: "bg-purple-50 text-purple-600 border-purple-100",
    sorting: "bg-blue-50 text-blue-600 border-blue-100",
    delivering: "bg-indigo-50 text-indigo-600 border-indigo-100",
    completed: "bg-green-50 text-green-600 border-green-100",
    cancelled: "bg-red-50 text-red-600 border-red-100"
  };
  
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-black uppercase border", styles[status])}>
      {labels[status] || status}
    </span>
  );
}

function OrderTrackingModal({ order, onClose }: { order: any, onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl relative z-10 flex flex-col md:flex-row h-[80vh] md:h-[70vh]"
      >
        {/* Left: Map Side */}
        <div className="flex-1 bg-blue-50 relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px]" />
          
          {/* Animated Map Grid */}
          <div className="absolute inset-0">
             <div className="w-full h-full relative">
                {/* Simulated Streets */}
                <div className="absolute top-1/4 inset-x-0 h-1 bg-blue-100/50" />
                <div className="absolute top-1/2 inset-x-0 h-1 bg-blue-100/50" />
                <div className="absolute left-1/3 inset-y-0 w-1 bg-blue-100/50" />
                <div className="absolute left-2/3 inset-y-0 w-1 bg-blue-100/50" />
             </div>
          </div>

          {/* Delivery Animation */}
          <div className="relative z-10 flex flex-col items-center">
             <motion.div 
              animate={{ 
                x: order.tracking?.lng ? (order.tracking.lng - 2.44) * 5000 : [0, 40, 20, 0],
                y: order.tracking?.lat ? (order.tracking.lat - 6.37) * 5000 : [0, -20, 30, 0]
              }}
              transition={{ duration: 0.5 }}
              className="relative"
             >
                <div className="w-12 h-12 bg-brand rounded-full flex items-center justify-center text-white shadow-xl shadow-brand/40">
                  <Truck className="animate-pulse" />
                </div>
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-brand text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-tighter whitespace-nowrap">
                   {order.tracking?.status === 'delivering' ? 'Livreur en route' : 'Préparation'}
                </div>
             </motion.div>
             <div className="mt-24 p-4 bg-white/80 backdrop-blur-md rounded-2xl border border-blue-100 shadow-sm text-center">
                <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Position Actuelle</p>
                <p className="text-xs font-bold text-brand italic">Porto-Novo, Quartier Ouando</p>
             </div>
          </div>

          {/* Destination Pin */}
          <div className="absolute bottom-1/4 right-1/4 text-red-500">
             <MapPin size={32} />
             <div className="bg-red-500 text-white text-[8px] font-black px-1 rounded absolute -top-4 left-1/2 -translate-x-1/2">{t('common.you')}</div>
          </div>
        </div>

        {/* Right: Info Side */}
        <div className="w-full md:w-96 bg-white p-8 md:p-12 flex flex-col gap-8 border-l border-gray-50">
           <div className="flex justify-between items-start">
              <div>
                <span className="text-brand font-black text-xs uppercase tracking-widest">{t('tracking.status')}</span>
                <h3 className="text-3xl font-black mt-1">{t('tracking.parcel')}{String(order.id).padStart(6, '0')}</h3>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}><X /></Button>
           </div>

           <div className="space-y-6 flex-1">
              <div className="p-6 bg-gray-50 rounded-[2rem] space-y-4">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-300">
                       <Navigation className="rotate-45" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{t('tracking.estimation_title')}</p>
                       <p className="text-lg font-black text-[#1A1A1A]">{t('tracking.estimation_time')}</p>
                    </div>
                 </div>
                 <div className="h-1.5 bg-white rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-brand"
                      animate={{ width: ["10%", "65%"] }}
                      transition={{ duration: 2 }}
                    />
                 </div>
              </div>

              <div className="space-y-4">
                 <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em]">{t('tracking.updates')}</h4>
                 <div className="space-y-4">
                    <TrackingStep time="Début" label={t('tracking.steps.start')} status={['confirmed', 'buying', 'sorting', 'delivering', 'completed'].includes(order.status) ? 'completed' : 'pending'} />
                    <TrackingStep time="Marché" label={t('tracking.steps.market')} status={['buying', 'sorting', 'delivering', 'completed'].includes(order.status) ? (['sorting', 'delivering', 'completed'].includes(order.status) ? 'completed' : 'active') : 'pending'} />
                    <TrackingStep time="Agence" label={t('tracking.steps.agency')} status={['sorting', 'delivering', 'completed'].includes(order.status) ? (['delivering', 'completed'].includes(order.status) ? 'completed' : 'active') : 'pending'} />
                    <TrackingStep time="Route" label={t('tracking.steps.road')} status={order.status === 'delivering' ? 'active' : (order.status === 'completed' ? 'completed' : 'pending')} />
                    <TrackingStep time="Fin" label={t('tracking.steps.end')} status={order.status === 'completed' ? 'completed' : 'pending'} />
                 </div>
              </div>
           </div>

           <div className="pt-8 border-t border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center overflow-hidden">
                 <img src={`https://picsum.photos/seed/${order.driverId || 'driver'}/200`} className="w-full h-full object-cover" alt="Driver" />
              </div>
              <div className="flex-1">
                 <p className="text-xs font-black">{order.driverName || "Livreur en attente"}</p>
                 <p className="text-[10px] text-gray-400 font-bold">Votre livreur Porto Market</p>
              </div>
              {order.driverPhone ? (
                <a
                  href={`tel:${order.driverPhone}`}
                  className="bg-green-500 rounded-full h-10 w-10 shadow-lg shadow-green-200 flex items-center justify-center text-white"
                  aria-label="Appeler le livreur"
                >
                  <Phone size={16} />
                </a>
              ) : (
                <Button size="icon" disabled className="bg-gray-300 rounded-full h-10 w-10">
                  <Phone size={16} />
                </Button>
              )}
           </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function TrackingStep({ time, label, status }: { time: string, label: string, status: 'completed' | 'active' | 'pending' }) {
  return (
    <div className="flex gap-4 items-start">
       <span className="text-[9px] font-black text-gray-300 w-10 pt-1 tracking-tighter">{time}</span>
       <div className="relative">
          <div className={cn(
            "w-2.5 h-2.5 rounded-full z-10 relative mt-1.5",
            status === 'completed' ? "bg-gray-200" : status === 'active' ? "bg-brand ring-4 ring-blue-100" : "bg-gray-100"
          )} />
          {status !== 'pending' && <div className="absolute top-2.5 left-1/2 -translate-x-1/2 h-8 w-[1px] bg-gray-100 -z-0" />}
       </div>
       <p className={cn("text-xs font-bold", status === 'active' ? "text-brand" : "text-gray-400")}>{label}</p>
    </div>
  );
}

function ProfileView({ profile, onLogout }: { profile: UserProfile | null; onLogout: () => void }) {
  if (!profile) return null;
  const { t } = useTranslation();

  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    displayName: profile.displayName || "",
    phoneNumber: profile.phoneNumber || "",
    address: "Porto-Novo, Quartier Ouando" // In real app, this would be in profile
  });

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await updateProfile(profile.uid, {
        name: formData.displayName,
        phone_number: formData.phoneNumber,
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Update failed", err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 w-full min-h-[600px]">
      <div className="space-y-12">
        <header className="flex items-center gap-8">
           <div className="w-24 h-24 bg-brand rounded-[2.5rem] flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-brand/20 grow-0 shrink-0">
             {formData.displayName?.charAt(0) || "U"}
           </div>
           <div>
              <h2 className="text-4xl font-black tracking-tight">{formData.displayName || profile.displayName}</h2>
              <p className="text-gray-500 font-medium">{t('profile.member_since')}</p>
           </div>
        </header>

        <Card className="p-8 border-gray-100 rounded-[2.5rem] shadow-sm bg-white">
           <div className="flex justify-between items-center mb-8 px-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">{t('profile.delivery_info')}</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-brand font-bold text-[10px] uppercase tracking-widest"
                onClick={() => isEditing ? handleUpdate() : setIsEditing(true)}
                loading={isUpdating}
              >
                {isEditing ? t('profile.save') : t('profile.edit')}
              </Button>
           </div>
           
           <div className="space-y-6">
                      {isEditing ? (
                        <div className="space-y-4 px-2">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{t('profile.full_name')}</label>
                            <Input value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} className="h-12 rounded-xl" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{t('profile.phone')}</label>
                            <Input value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} className="h-12 rounded-xl" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{t('profile.address')}</label>
                            <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="h-12 rounded-xl" />
                          </div>
                        </div>
                      ) : (
                        <>
                          <ProfileItem icon={<User size={18} />} label={t('profile.full_name')} value={profile.displayName || t('common.not_defined')} />
                          <ProfileItem icon={<Phone size={18} />} label={t('profile.phone')} value={profile.phoneNumber || t('common.not_defined')} />
                          <ProfileItem icon={<MapPin size={18} />} label={t('profile.default_address')} value={formData.address} />
                          <ProfileItem icon={<ShieldCheck size={18} />} label={t('profile.role')} value={profile.role === 'client' ? t('profile.client_role') : (profile.role || "Client")} />
                        </>
                      )}
           </div>
           
           {isEditing && (
             <div className="mt-8 pt-6 border-t border-gray-50 flex gap-4 px-2">
                <Button variant="ghost" className="rounded-xl h-10 px-6 font-bold text-[10px] uppercase text-gray-400" onClick={() => setIsEditing(false)}>
                   {t('profile.cancel')}
                </Button>
             </div>
           )}
        </Card>

        <div className="pt-12 text-center">
           <Button 
            variant="ghost" 
            className="text-red-500 font-black uppercase tracking-widest text-[10px] hover:bg-red-50"
            onClick={onLogout}
           >
             {t('profile.logout')}
           </Button>
        </div>
      </div>
    </div>
  );
}

function ProfileItem({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-4 px-2">
       <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 shrink-0">
         {icon}
       </div>
       <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-1">{label}</p>
          <p className="font-bold text-gray-800">{value}</p>
       </div>
    </div>
  );
}

const motion_div = ({ children, onClick }: any) => <div onClick={onClick} className="cursor-pointer">{children}</div>;
