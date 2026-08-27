import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import "./App.css";

const firebaseConfig = {
  apiKey: "AIzaSyCGhx8c3sKhBd9GaP1lXdjMIs4ocaqMQCg",
  authDomain: "chapsky-f10ce.firebaseapp.com",
  projectId: "chapsky-f10ce",
  storageBucket: "chapsky-f10ce.firebasestorage.app",
  messagingSenderId: "1030447349157",
  appId: "1:1030447349157:web:37b8ed52a78c4e59bffc4c"
};

const ADMIN_PASSWORD = "@Hadi6977";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const DESIGN_NOTE = "🧑‍🎨 طرح شما طراحی می‌شود و پیش از چاپ، برای تأیید برایتان ارسال می‌گردد. پس از تأیید شما، چاپ انجام می‌شود.";

const PROVINCES = [
  "آذربایجان شرقی","آذربایجان غربی","اردبیل","اصفهان","البرز","ایلام","بوشهر","تهران",
  "چهارمحال و بختیاری","خراسان جنوبی","خراسان رضوی","خراسان شمالی","خوزستان","زنجان",
  "سمنان","سیستان و بلوچستان","فارس","قزوین","قم","کردستان","کرمان","کرمانشاه",
  "کهگیلویه و بویراحمد","گلستان","گیلان","لرستان","مازندران","مرکزی","هرمزگان","همدان","یزد"
];

const SHIPPING_POST_COST = 150000;

const DEFAULT_SETTINGS = {
  shopName: "چاپ اسکای",
  tagline: "مرجع چاپ سابلیمیشن و خدمات چاپی",
  phone: "۰۹۲۱۶۱۳۹۵۳۱",
  whatsapp: "989216139531",
  telegram: "nashrsky",
  rubika: "nashrsky",
  bale: "nashrsky",
  address: "مراغه، میدان مصلی، جنب داروخانه هشترودی",
  instagram: "nashrsky",
  heroTitle1: "ایده‌ات را",
  heroTitle2: "چاپ کن!",
  heroText: "چاپ سابلیمیشن حرفه‌ای روی ماگ، تیشرت، پازل، تخته شاسی، پرچم و رومیزی + خدمات چاپ فاکتور، تراکت و کارت ویزیت — با آپلود مستقیم فایل شما.",
  badgeText: "✨ چاپ اختصاصی با طرح دلخواه شما",
  trust1: "🚚 ارسال به سراسر کشور",
  trust2: "💳 تسویه پس از تأیید طرح",
  trust3: "🎨 مشاوره رایگان طراحی",
  trust4: "🔁 ضمانت کیفیت چاپ",
  designNote: DESIGN_NOTE,
  mainColor: "#4f6df5",
  secondColor: "#7c3aed",
  darkColor: "#1e2235",
  font: "Vazirmatn",
  logoUrl: "logo.png",
  showProductLogo: true,
  cardNumber: "6219861927791078",
  cardHolder: "هادی دست‌افکن",
  gatewayEnabled: false,
  gatewayMerchantId: "",
};

const FONTS = [
  { value: "Vazirmatn", label: "وزیرمتن (Vazirmatn) — مدرن و تمیز" },
  { value: "Estedad", label: "استعداد (Estedad) — شیک و مینیمال" },
  { value: "Sahel", label: "ساحل (Sahel) — خوش‌خط و نرم" },
];

const fallbackProducts = [
  { id: "f1", title: "ماگ سفارشی", icon: "☕", price: 250000, desc: "چاپ عکس و متن دلخواه روی ماگ سرامیکی", tag: "پرفروش", image: "" },
  { id: "f2", title: "تیشرت", icon: "👕", price: 380000, desc: "چاپ سابلیمیشن روی تیشرت", tag: "", image: "" },
  { id: "f3", title: "پازل", icon: "🧩", price: 320000, desc: "پازل شخصی‌سازی‌شده با عکس دلخواه", tag: "", image: "" },
];

const defaultFeatures = [
  { icon: "⭐", title: "کیفیت تضمینی", desc: "بهترین متریال و دستگاه‌های به‌روز" },
  { icon: "🚀", title: "تحویل سریع", desc: "آماده‌سازی سفارش در کمترین زمان" },
  { icon: "💰", title: "قیمت منصفانه", desc: "قیمت‌گذاری شفاف و رقابتی" },
  { icon: "📎", title: "آپلود آسان", desc: "ارسال مستقیم فایل طرح همراه سفارش" },
];

const defaultSteps = [
  { num: "۱", title: "انتخاب محصول", desc: "محصول و تعداد دلخواه را انتخاب کنید." },
  { num: "۲", title: "آپلود طرح", desc: "فایل عکس یا طرح خود را همراه سفارش ارسال کنید." },
  { num: "۳", title: "تأیید طرح و چاپ", desc: "طرح برایتان ارسال می‌شود، تأیید کنید و چاپ انجام می‌شود." },
];

function formatPrice(n) {
  return Number(n || 0).toLocaleString("fa-IR") + " تومان";
}

function applyStyle(s) {
  const r = document.documentElement;
  r.style.setProperty("--main", s.mainColor || "#4f6df5");
  r.style.setProperty("--second", s.secondColor || "#7c3aed");
  r.style.setProperty("--dark", s.darkColor || "#1e2235");
  r.style.setProperty("--font", `"${s.font || 'Vazirmatn'}", Tahoma, sans-serif`);
}

function AdminPanel({ settings, setSettings, onClose }) {
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", icon: "", price: "", desc: "", tag: "", image: "" });
  const [sform, setSform] = useState(settings || {});

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snap) => {
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    const unsub2 = onSnapshot(collection(db, "orders"), (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => { unsub(); unsub2(); };
  }, []);

  const saveProduct = async (e) => {
    e.preventDefault();
    const data = { ...form, price: Number(form.price) || 0 };
    try {
      if (editing) await updateDoc(doc(db, "products", editing), data);
      else await addDoc(collection(db, "products"), data);
    } catch (err) { alert("خطا: " + err.message); }
    setForm({ title: "", icon: "", price: "", desc: "", tag: "", image: "" });
    setEditing(null);
  };

  const removeProduct = async (id) => {
    if (confirm("حذف شود؟")) await deleteDoc(doc(db, "products", id));
  };

  const startEdit = (p) => {
    setEditing(p.id);
    setForm({ title: p.title, icon: p.icon || "", price: p.price, desc: p.desc, tag: p.tag || "", image: p.image || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, "content", "settings"), sform);
      setSettings(sform);
      applyStyle(sform);
      alert("ذخیره شد ✅");
    } catch (err) { alert("خطا: " + err.message); }
  };

  const removeOrder = async (id) => {
    if (confirm("حذف شود؟")) await deleteDoc(doc(db, "orders", id));
  };

  const setS = (k, v) => setSform((p) => ({ ...p, [k]: v }));
  const F = ({ label, value, onVal, rows }) => (
    <>
      <label>{label}</label>
      {rows ? (
        <textarea rows={rows} value={value || ""} onChange={(e) => onVal(e.target.value)} />
      ) : (
        <input value={value || ""} onChange={(e) => onVal(e.target.value)} />
      )}
    </>
  );

  return (
    <div className="admin-wrap">
      <div className="admin-header">
        <h2>🛠️ پنل مدیریت</h2>
        <button className="outline-button" onClick={onClose}>بازگشت به فروشگاه</button>
      </div>
      <div className="tabs">
        <button className={tab === "products" ? "tab active" : "tab"} onClick={() => setTab("products")}>📦 محصولات</button>
        <button className={tab === "settings" ? "tab active" : "tab"} onClick={() => setTab("settings")}>⚙️ تنظیمات</button>
        <button className={tab === "orders" ? "tab active" : "tab"} onClick={() => setTab("orders")}>📥 سفارش‌ها</button>
      </div>

      {tab === "products" && (
        <>
          <div className="admin-card">
            <h3>{editing ? "ویرایش" : "افزودن محصول"}</h3>
            <form onSubmit={saveProduct} className="order-form">
              <F label="نام محصول" value={form.title} onVal={(v) => setForm({ ...form, title: v })} />
              <div className="form-row">
                <div><F label="ایموجی" value={form.icon} onVal={(v) => setForm({ ...form, icon: v })} /></div>
                <div><F label="قیمت (تومان)" value={form.price} onVal={(v) => setForm({ ...form, price: v })} /></div>
              </div>
              <F label="لینک عکس" value={form.image} onVal={(v) => setForm({ ...form, image: v })} />
              <F label="توضیحات" value={form.desc} onVal={(v) => setForm({ ...form, desc: v })} rows={2} />
              <F label="برچسب" value={form.tag} onVal={(v) => setForm({ ...form, tag: v })} />
              <button type="submit" className="primary-button">{editing ? "ذخیره ✅" : "افزودن ✅"}</button>
            </form>
          </div>
          <div className="admin-card">
            <h3>محصولات ({products.length})</h3>
            {products.length === 0 ? <p className="empty-cart">محصولی نیست.</p> : products.map((p) => (
              <div className="product-admin-item" key={p.id}>
                {p.image ? <img src={p.image} className="pai-img" onError={(e) => e.target.style.display = "none"} /> : <span className="pai-icon">{p.icon || "🖨️"}</span>}
                <div className="pai-info"><strong>{p.title}</strong><small>{formatPrice(p.price)}</small></div>
                <div className="admin-actions">
                  <button className="edit-btn" onClick={() => startEdit(p)}>✏️</button>
                  <button className="del-btn" onClick={() => removeProduct(p.id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "settings" && (
        <div className="admin-card">
          <h3>⚙️ تنظیمات</h3>
          <form onSubmit={saveSettings} className="order-form">
            <div className="form-row"><div><F label="نام" value={sform.shopName} onVal={(v) => setS("shopName", v)} /></div><div><F label="شعار" value={sform.tagline} onVal={(v) => setS("tagline", v)} /></div></div>
            <F label="شماره تماس" value={sform.phone} onVal={(v) => setS("phone", v)} />
            <F label="واتساپ (با 98)" value={sform.whatsapp} onVal={(v) => setS("whatsapp", v)} />
            <F label="تلگرام" value={sform.telegram} onVal={(v) => setS("telegram", v)} />
            <F label="روبیکا" value={sform.rubika} onVal={(v) => setS("rubika", v)} />
            <F label="اینستاگرام" value={sform.instagram} onVal={(v) => setS("instagram", v)} />
            <F label="بله" value={sform.bale} onVal={(v) => setS("bale", v)} />
            <F label="آدرس" value={sform.address} onVal={(v) => setS("address", v)} />
            <F label="متن طراحی" value={sform.designNote} onVal={(v) => setS("designNote", v)} rows={2} />
            <h4 style={{ margin: "14px 0 6px", color: "var(--main)" }}>فونت</h4>
            <select value={sform.font || "Vazirmatn"} onChange={(e) => setS("font", e.target.value)}>
              {FONTS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
            <h4 style={{ margin: "14px 0 6px", color: "var(--main)" }}>رنگ‌ها</h4>
            <div className="form-row">
              <div><F label="اصلی" value={sform.mainColor} onVal={(v) => setS("mainColor", v)} /></div>
              <div><F label="دوم" value={sform.secondColor} onVal={(v) => setS("secondColor", v)} /></div>
              <div><F label="تیره" value={sform.darkColor} onVal={(v) => setS("darkColor", v)} /></div>
            </div>
            <F label="لینک لوگو" value={sform.logoUrl} onVal={(v) => setS("logoUrl", v)} />
            <F label="شماره کارت" value={sform.cardNumber} onVal={(v) => setS("cardNumber", v)} />
            <F label="نام صاحب حساب" value={sform.cardHolder} onVal={(v) => setS("cardHolder", v)} />
            <button type="submit" className="primary-button" style={{ marginTop: "16px" }}>ذخیره ✅</button>
          </form>
        </div>
      )}

      {tab === "orders" && (
        <div className="admin-card">
          <h3>سفارش‌ها ({orders.length})</h3>
          {orders.length === 0 ? <p className="empty-cart">سفارشی نیست.</p> : orders.slice().reverse().map((o) => (
            <div className="order-item" key={o.id}>
              <div className="order-head"><strong>👤 {o.name}</strong><span>📱 {o.phone}</span><button className="del-btn" onClick={() => removeOrder(o.id)}>🗑️</button></div>
              {o.city && <div className="order-note">📍 {o.city}</div>}
              <div className="order-cart">{o.items || "—"}</div>
              <div className="order-total"><strong>{formatPrice(o.total)}</strong><span>{o.date}</span></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function App() {
  const [route, setRoute] = useState("shop");
  const [authOK, setAuthOK] = useState(() => localStorage.getItem("chapsky_admin") === "true");
  const [pass, setPass] = useState("");
  const [products, setProducts] = useState(fallbackProducts);
  const [loaded, setLoaded] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [payMethod, setPayMethod] = useState("card");
  const [shipping, setShipping] = useState("");
  const [success, setSuccess] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", desc: "", address: "", postal: "", province: "", city: "" });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      if (list.length > 0) setProducts(list);
      setLoaded(true);
    });
    const getSettings = async () => {
      try {
        const s = await getDoc(doc(db, "content", "settings"));
        if (s.exists()) {
          const merged = { ...DEFAULT_SETTINGS, ...s.data() };
          setSettings(merged);
          setTimeout(() => applyStyle(merged), 100);
        }
      } catch (e) { console.log(e); }
    };
    getSettings();
    return () => unsub();
  }, []);

  const addToCart = (p, qty = 1) => {
    setCart((prev) => {
      const found = prev.find((i) => i.id === p.id);
      if (found) return prev.map((i) => (i.id === p.id ? { ...i, qty: i.qty + qty } : i));
      return [...prev, { ...p, qty }];
    });
    setCartOpen(true);
  };
  const changeQty = (id, d) => setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty: i.qty + d } : i)).filter((i) => i.qty > 0));
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shippingCost = shipping === "پست" ? SHIPPING_POST_COST : 0;
  const total = subtotal + shippingCost;
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!shipping) { alert("روش ارسال را انتخاب کنید!"); return; }
    const items = cart.map((i) => `${i.icon || ""} ${i.title} × ${i.qty} = ${formatPrice(i.price * i.qty)}`).join("\n");
    const payText = `کارت‌به‌کارت ${settings.cardNumber} (${settings.cardHolder})`;
    const body =
      `🛒 سفارش جدید از ${settings.shopName}\n\n👤 ${form.name}\n📱 ${form.phone}\n` +
      `📍 ${form.province}، ${form.city}\n🏠 ${form.address}\n📮 ${form.postal}\n` +
      `🚚 ${shipping}${shippingCost ? ` (${formatPrice(shippingCost)})` : " (رایگان)"}\n` +
      (form.desc ? `📝 ${form.desc}\n` : "") +
      `\n📦 ${items}\n💰 جمع کل: ${formatPrice(total)}\n💳 ${payText}\n\n${settings.designNote}`;
    window.open(`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(body)}`, "_blank");
    try {
      await addDoc(collection(db, "orders"), { name: form.name, phone: form.phone, province: form.province, city: form.city, address: form.address, postal: form.postal, shipping, shippingCost, note: form.desc, payMethod: payText, items, total, date: new Date().toLocaleString("fa-IR") });
    } catch (err) { console.error(err); }
    setSuccess(true);
    setOrderOpen(false); setCart([]); setShipping("");
    setForm({ name: "", phone: "", desc: "", address: "", postal: "", province: "", city: "" });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (pass === ADMIN_PASSWORD) { localStorage.setItem("chapsky_admin", "true"); setAuthOK(true); }
    else alert("رمز اشتباه است!");
  };

  if (route === "admin") {
    if (!authOK) {
      return (
        <div className="login-screen">
          <form className="login-box" onSubmit={handleLogin}>
            <h2>🔒 پنل مدیریت</h2>
            <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} autoComplete="new-password" />
            <button className="primary-button full">ورود</button>
            <button type="button" className="outline-button full" onClick={() => setRoute("shop")}>بازگشت</button>
          </form>
        </div>
      );
    }
    return <AdminPanel settings={settings} setSettings={setSettings} onClose={() => setRoute("shop")} />;
  }

  const ProductCard = ({ p }) => {
    const [qty, setQty] = useState(1);
    return (
      <div className="product-card">
        {p.tag && <span className="product-tag">{p.tag}</span>}
        {p.image ? <img src={p.image} className="product-img" onError={(e) => e.target.style.display = "none"} /> : <div className="product-icon">{p.icon || "🖨️"}</div>}
        <h3>{p.title}</h3><p>{p.desc}</p>
        <div className="product-price">{formatPrice(p.price)}</div>
        <button className="add-button" onClick={() => { addToCart(p, qty); setQty(1); }}>افزودن به سبد 🛒</button>
      </div>
    );
  };

  return (
    <div className="site" dir="rtl">
      <header className="header">
        <div className="logo">
          <img src={settings.logoUrl} className="logo-img" onError={(e) => e.target.style.display = "none"} />
          <div><strong>{settings.shopName}</strong><small>{settings.tagline}</small></div>
        </div>
        <nav>
          <a href="#home">خانه</a><a href="#products">محصولات</a><a href="#why-us">چرا ما؟</a>
          <button className="nav-link admin-link" onClick={() => setRoute("admin")}>⚙️ مدیریت</button>
        </nav>
        <button className="cart-button" onClick={() => setCartOpen(true)}>🛒{cartCount > 0 && <span className="cart-count">{cartCount}</span>}</button>
      </header>

      <section className="hero" id="home">
        <div className="hero-content">
          <div className="hero-badge">{settings.badgeText}</div>
          <h1>{settings.heroTitle1} <span>{settings.heroTitle2}</span></h1>
          <p>{settings.heroText}</p>
          <a href="#products" className="primary-button">🛍️ محصولات</a>
        </div>
      </section>

      <div className="trust-bar"><span>{settings.trust1}</span><span>{settings.trust2}</span><span>{settings.trust3}</span><span>{settings.trust4}</span></div>

      <section className="products" id="products">
        <h2>محصولات و خدمات ما</h2>
        {!loaded ? <p>⏳ در حال بارگذاری...</p> : <div className="products-grid">{products.map((p) => <ProductCard key={p.id} p={p} />)}</div>}
      </section>

      <footer className="footer" id="contact">
        <h2>تماس با ما</h2>
        <div className="footer-info"><span>📱 {settings.phone}</span><span>📍 {settings.address}</span></div>
        <div className="social-row">
          <a href={`https://t.me/${settings.telegram}`} className="social-btn">✈️ تلگرام</a>
          <a href={`https://wa.me/${settings.whatsapp}`} className="social-btn">💬 واتساپ</a>
          <a href={`https://rubika.ir/${settings.rubika}`} className="social-btn">🔵 روبیکا</a>
        </div>
        <p className="copy">© {settings.shopName}</p>
      </footer>

      {cartOpen && (
        <div className="overlay" onClick={() => setCartOpen(false)}>
          <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header"><h3>🛒 سبد</h3><button className="close-btn" onClick={() => setCartOpen(false)}>✕</button></div>
            {cart.length === 0 ? <p className="empty-cart">خالی است.</p> : (
              <>
                {cart.map((i) => (
                  <div className="cart-item" key={i.id}>
                    <span>{i.title}</span>
                    <div className="qty-box"><button onClick={() => changeQty(i.id, 1)}>＋</button><span>{i.qty}</span><button onClick={() => changeQty(i.id, -1)}>－</button></div>
                    <span className="ci-price">{formatPrice(i.price * i.qty)}</span>
                  </div>
                ))}
                <div className="cart-total"><strong>جمع:</strong><strong>{formatPrice(subtotal)}</strong></div>
                <button className="primary-button full" onClick={() => { setCartOpen(false); setOrderOpen(true); }}>تکمیل سفارش 📎</button>
              </>
            )}
          </div>
        </div>
      )}

      {orderOpen && (
        <div className="overlay center" onClick={() => setOrderOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header"><h3>📎 تکمیل سفارش</h3><button className="close-btn" onClick={() => setOrderOpen(false)}>✕</button></div>
            <form onSubmit={handleSubmit} className="order-form">
              <div className="design-note">{settings.designNote}</div>
              <input required placeholder="نام و نام خانوادگی" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input required type="tel" placeholder="شماره تماس" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <select required value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })}>
                <option value="">استان...</option>{PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <input required placeholder="شهر" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              <input required placeholder="آدرس کامل" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <input required placeholder="کدپستی" maxLength="10" value={form.postal} onChange={(e) => setForm({ ...form, postal: e.target.value })} />
              <label>🚚 روش ارسال</label>
              <div className="pay-options">
                <label className={"pay-option" + (shipping === "پست" ? " active" : "")}><input type="radio" checked={shipping === "پست"} onChange={() => setShipping("پست")} style={{ width: "auto" }} /> پست ({formatPrice(SHIPPING_POST_COST)})</label>
                <label className={"pay-option" + (shipping === "چاپار" ? " active" : "")}><input type="radio" checked={shipping === "چاپار"} onChange={() => setShipping("چاپار")} style={{ width: "auto" }} /> چاپار (رایگان)</label>
                <label className={"pay-option" + (shipping === "تیپاکس" ? " active" : "")}><input type="radio" checked={shipping === "تیپاکس"} onChange={() => setShipping("تیپاکس")} style={{ width: "auto" }} /> تیپاکس (رایگان)</label>
              </div>
              <label>💳 پرداخت</label>
              <div className="card-box">
                <p style={{ fontWeight: "bold" }}>به کارت {settings.cardNumber} ({settings.cardHolder}) واریز کنید.</p>
                <p>{shippingCost > 0 ? <>جمع: {formatPrice(subtotal)} + ارسال: {formatPrice(shippingCost)} = <strong>{formatPrice(total)}</strong></> : <>قابل پرداخت: <strong>{formatPrice(total)}</strong></>}</p>
              </div>
              <textarea required rows="3" placeholder="جزئیات کامل سفارش (تعداد، سایز، متن چاپ، رنگ و...)" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} />
              <button className="primary-button full">ارسال سفارش ✅</button>
              <div className="alt-contact">
                📢 در صورت عدم دسترسی به واتساپ، از <strong>تلگرام</strong> {settings.telegram} یا <strong>روبیکا</strong> {settings.rubika} یا شماره {settings.phone} پیام دهید.
                <a className="alt-btn tg" href={`https://t.me/${settings.telegram}`} target="_blank" rel="noreferrer">✈️ تلگرام</a>
              </div>
            </form>
          </div>
        </div>
      )}

      {success && (
        <div className="overlay center" onClick={() => setSuccess(false)}>
          <div className="modal success-modal">
            <h3>✅ سفارش شما ثبت شد!</h3>
            <p>{settings.designNote}</p>
            <button className="primary-button full" onClick={() => setSuccess(false)}>باشه</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;