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

const ADMIN_PASSWORD = "1234";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const DEFAULT_SETTINGS = {
  shopName: "چاپ آسمانی",
  tagline: "مرجع چاپ سابلیمیشن و خدمات چاپی",
  phone: "۰۹۲۱۶۱۳۹۵۳۱",
  whatsapp: "989216139531",
  address: "مراغه، میدان مصلی، جنب داروخانه هشترودی",
  instagram: "nashrsky",
  telegram: "nashrsky",
  rubika: "nashrsky",
  bale: "nashrsky",
  heroTitle1: "ایده‌ات را",
  heroTitle2: "چاپ کن!",
  heroText: "چاپ سابلیمیشن حرفه‌ای روی ماگ، تیشرت، پازل، تخته شاسی، پرچم و رومیزی + خدمات چاپ فاکتور، تراکت و کارت ویزیت — با آپلود مستقیم فایل شما.",
  badgeText: "✨ چاپ اختصاصی با طرح دلخواه شما",
  trust1: "🚚 ارسال به سراسر کشور",
  trust2: "💳 تسویه پس از تأیید طرح",
  trust3: "🎨 مشاوره رایگان طراحی",
  trust4: "🔁 ضمانت کیفیت چاپ",
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
  { num: "۳", title: "تکمیل سفارش", desc: "پرداخت را انجام دهید و رسید ارسال کنید." },
];

function formatPrice(n) {
  return Number(n || 0).toLocaleString("fa-IR") + " تومان";
}

function applyStyle(s) {
  const r = document.documentElement;
  r.style.setProperty("--main", s.mainColor);
  r.style.setProperty("--second", s.secondColor);
  r.style.setProperty("--dark", s.darkColor);
  r.style.setProperty("--font", `"${s.font}", Tahoma, sans-serif`);
}

/* ---------- پنل مدیریت ---------- */
function AdminPanel({ settings, setSettings, onClose }) {
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", icon: "🖨️", price: "", desc: "", tag: "", image: "" });
  const [sform, setSform] = useState(settings || {});
  const [features, setFeatures] = useState(defaultFeatures);
  const [steps, setSteps] = useState(defaultSteps);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snap) => {
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    const unsub2 = onSnapshot(collection(db, "orders"), (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    const getExtra = async () => {
      try {
        const f = await getDoc(doc(db, "content", "features"));
        if (f.exists()) setFeatures(f.data().list || defaultFeatures);
        const s = await getDoc(doc(db, "content", "steps"));
        if (s.exists()) setSteps(s.data().list || defaultSteps);
      } catch (e) { console.log("getExtra:", e); }
    };
    getExtra();
    return () => { unsub(); unsub2(); };
  }, []);

  const saveProduct = async (e) => {
    e.preventDefault();
    const data = { ...form, price: Number(form.price) || 0 };
    try {
      if (editing) await updateDoc(doc(db, "products", editing), data);
      else await addDoc(collection(db, "products"), data);
    } catch (err) { alert("خطا در ذخیره: " + err.message); }
    setForm({ title: "", icon: "🖨️", price: "", desc: "", tag: "", image: "" });
    setEditing(null);
  };

  const removeProduct = async (id) => {
    if (confirm("این محصول حذف شود؟")) await deleteDoc(doc(db, "products", id));
  };

  const startEdit = (p) => {
    setEditing(p.id);
    setForm({ title: p.title, icon: p.icon, price: p.price, desc: p.desc, tag: p.tag || "", image: p.image || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, "content", "settings"), sform);
      setSettings(sform);
      applyStyle(sform);
      alert("تنظیمات ذخیره شد ✅");
    } catch (err) { alert("خطا: " + err.message); }
  };

  const saveFeatures = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, "content", "features"), { list: features });
      alert("مزایا ذخیره شد ✅");
    } catch (err) { alert("خطا: " + err.message); }
  };

  const saveSteps = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, "content", "steps"), { list: steps });
      alert("مراحل سفارش ذخیره شد ✅");
    } catch (err) { alert("خطا: " + err.message); }
  };

  const removeOrder = async (id) => {
    if (confirm("این سفارش حذف شود؟")) await deleteDoc(doc(db, "orders", id));
  };

  return (
    <div className="admin-wrap">
      <div className="admin-header">
        <h2>🛠️ پنل مدیریت {settings.shopName}</h2>
        <button className="outline-button" onClick={onClose}>بازگشت به فروشگاه</button>
      </div>

      <div className="tabs">
        <button className={tab === "products" ? "tab active" : "tab"} onClick={() => setTab("products")}>📦 محصولات</button>
        <button className={tab === "settings" ? "tab active" : "tab"} onClick={() => setTab("settings")}>⚙️ تنظیمات</button>
        <button className={tab === "payment" ? "tab active" : "tab"} onClick={() => setTab("payment")}>💳 پرداخت</button>
        <button className={tab === "content" ? "tab active" : "tab"} onClick={() => setTab("content")}>📝 متون سایت</button>
        <button className={tab === "orders" ? "tab active" : "tab"} onClick={() => setTab("orders")}>📥 سفارش‌ها</button>
      </div>

      {tab === "products" && (
        <>
          <div className="admin-card">
            <h3>{editing ? "✏️ ویرایش محصول" : "➕ افزودن محصول جدید"}</h3>
            <form onSubmit={saveProduct} className="order-form">
              <label>نام محصول</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="ماگ سفارشی" />
              <div className="form-row">
                <div>
                  <label>ایموجی آیکون</label>
                  <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="☕" />
                </div>
                <div>
                  <label>قیمت (تومان)</label>
                  <input required type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="250000" />
                </div>
              </div>
              <label>توضیحات</label>
              <textarea value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder="توضیح کوتاه" />
              <div className="form-row">
                <div>
                  <label>برچسب (اختیاری)</label>
                  <input value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} placeholder="پرفروش / جدید" />
                </div>
                <div>
                  <label>لینک عکس (اختیاری)</label>
                  <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
                </div>
              </div>
              <div className="hero-buttons">
                <button type="submit" className="primary-button">{editing ? "ذخیره تغییرات ✅" : "افزودن محصول ✅"}</button>
                {editing && <button type="button" className="outline-button" onClick={() => { setEditing(null); setForm({ title: "", icon: "🖨️", price: "", desc: "", tag: "", image: "" }); }}>انصراف</button>}
              </div>
            </form>
          </div>

          <div className="admin-card">
            <h3>📦 محصولات موجود ({products.length})</h3>
            {products.length === 0 ? (
              <p className="empty-cart">هنوز محصولی ثبت نشده.</p>
            ) : (
              <div className="product-list-admin">
                {products.map((p) => (
                  <div className="product-admin-item" key={p.id}>
                    {p.image ? <img src={p.image} alt={p.title} className="pai-img" /> : <span className="pai-icon">{p.icon}</span>}
                    <div className="pai-info">
                      <strong>{p.title}</strong>
                      <small>{formatPrice(p.price)}{p.tag ? ` | ${p.tag}` : ""}</small>
                    </div>
                    <div className="admin-actions">
                      <button className="edit-btn" onClick={() => startEdit(p)}>✏️</button>
                      <button className="del-btn" onClick={() => removeProduct(p.id)}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {tab === "settings" && (
        <div className="admin-card">
          <h3>⚙️ تنظیمات فروشگاه</h3>
          <form onSubmit={saveSettings} className="order-form">
            <div className="form-row">
              <div>
                <label>نام فروشگاه</label>
                <input value={sform.shopName || ""} onChange={(e) => setSform({ ...sform, shopName: e.target.value })} />
              </div>
              <div>
                <label>شعار</label>
                <input value={sform.tagline || ""} onChange={(e) => setSform({ ...sform, tagline: e.target.value })} />
              </div>
            </div>
            <label>شماره تماس</label>
            <input value={sform.phone || ""} onChange={(e) => setSform({ ...sform, phone: e.target.value })} />
            <label>شماره واتساپ (با 98)</label>
            <input value={sform.whatsapp || ""} onChange={(e) => setSform({ ...sform, whatsapp: e.target.value })} />
            <label>آدرس فروشگاه</label>
            <input value={sform.address || ""} onChange={(e) => setSform({ ...sform, address: e.target.value })} />

            <h4 style={{ margin: "16px 0 6px", color: "var(--main)" }}>🖼️ لوگو</h4>
            <label>آدرس لوگو</label>
            <input value={sform.logoUrl || ""} onChange={(e) => setSform({ ...sform, logoUrl: e.target.value })} placeholder="logo.png یا https://..." />

            <h4 style={{ margin: "16px 0 6px", color: "var(--main)" }}>شبکه‌های اجتماعی</h4>
            <div className="form-row">
              <div><label>اینستاگرام</label><input value={sform.instagram || ""} onChange={(e) => setSform({ ...sform, instagram: e.target.value })} /></div>
              <div><label>تلگرام</label><input value={sform.telegram || ""} onChange={(e) => setSform({ ...sform, telegram: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div><label>روبیکا</label><input value={sform.rubika || ""} onChange={(e) => setSform({ ...sform, rubika: e.target.value })} /></div>
              <div><label>بله</label><input value={sform.bale || ""} onChange={(e) => setSform({ ...sform, bale: e.target.value })} /></div>
            </div>

            <h4 style={{ margin: "16px 0 6px", color: "var(--main)" }}>🎨 رنگ سایت</h4>
            <div className="form-row">
              <div><label>رنگ اصلی</label><input type="color" value={sform.mainColor || "#4f6df5"} onChange={(e) => setSform({ ...sform, mainColor: e.target.value })} style={{ height: "44px", padding: "4px" }} /></div>
              <div><label>رنگ دوم</label><input type="color" value={sform.secondColor || "#7c3aed"} onChange={(e) => setSform({ ...sform, secondColor: e.target.value })} style={{ height: "44px", padding: "4px" }} /></div>
              <div><label>رنگ تیره</label><input type="color" value={sform.darkColor || "#1e2235"} onChange={(e) => setSform({ ...sform, darkColor: e.target.value })} style={{ height: "44px", padding: "4px" }} /></div>
            </div>

            <h4 style={{ margin: "16px 0 6px", color: "var(--main)" }}>🔤 فونت سایت</h4>
            <label>انتخاب فونت</label>
            <select value={sform.font || "Vazirmatn"} onChange={(e) => setSform({ ...sform, font: e.target.value })}>
              {FONTS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>

            <label style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "16px" }}>
              <input type="checkbox" checked={!!sform.showProductLogo} onChange={(e) => setSform({ ...sform, showProductLogo: e.target.checked })} style={{ width: "auto" }} />
              نمایش لوگو بالای بخش محصولات
            </label>

            <button type="submit" className="primary-button" style={{ marginTop: "16px" }}>ذخیره تنظیمات ✅</button>
          </form>
        </div>
      )}

      {tab === "payment" && (
        <div className="admin-card">
          <h3>💳 تنظیمات پرداخت</h3>
          <form onSubmit={saveSettings} className="order-form">
            <h4 style={{ margin: "8px 0 6px", color: "var(--main)" }}>کارت‌به‌کارت</h4>
            <label>شماره کارت</label>
            <input value={sform.cardNumber || ""} onChange={(e) => setSform({ ...sform, cardNumber: e.target.value })} />
            <label>نام صاحب حساب</label>
            <input value={sform.cardHolder || ""} onChange={(e) => setSform({ ...sform, cardHolder: e.target.value })} />

            <h4 style={{ margin: "20px 0 6px", color: "var(--main)" }}>🌐 درگاه پرداخت آنلاین</h4>
            <p style={{ fontSize: "13px", color: "#777", marginBottom: "10px", background: "#f0f4ff", padding: "10px", borderRadius: "8px" }}>
              برای فعال‌کردن درگاه، ابتدا در سایت زرین‌پال / زیبال ثبت‌نام کنید و کلید مرچنت بگیرید.
            </p>
            <label>
              <input type="checkbox" checked={!!sform.gatewayEnabled} onChange={(e) => setSform({ ...sform, gatewayEnabled: e.target.checked })} style={{ width: "auto", marginLeft: "8px" }} />
              فعال‌سازی درگاه پرداخت آنلاین
            </label>
            <label style={{ marginTop: "12px" }}>کلید مرچنت</label>
            <input value={sform.gatewayMerchantId || ""} onChange={(e) => setSform({ ...sform, gatewayMerchantId: e.target.value })} />
            <button type="submit" className="primary-button" style={{ marginTop: "16px" }}>ذخیره تنظیمات پرداخت ✅</button>
          </form>
        </div>
      )}

      {tab === "content" && (
        <>
          <div className="admin-card">
            <h3>🏠 بخش هیرو (بالای صفحه)</h3>
            <form onSubmit={saveSettings} className="order-form">
              <label>متن نشان (Badge)</label>
              <input value={sform.badgeText || ""} onChange={(e) => setSform({ ...sform, badgeText: e.target.value })} />
              <div className="form-row">
                <div><label>تیتر بخش اول</label><input value={sform.heroTitle1 || ""} onChange={(e) => setSform({ ...sform, heroTitle1: e.target.value })} /></div>
                <div><label>تیتر بخش دوم (رنگی)</label><input value={sform.heroTitle2 || ""} onChange={(e) => setSform({ ...sform, heroTitle2: e.target.value })} /></div>
              </div>
              <label>متن توضیحات هیرو</label>
              <textarea rows="3" value={sform.heroText || ""} onChange={(e) => setSform({ ...sform, heroText: e.target.value })} />
              <button type="submit" className="primary-button">ذخیره هیرو ✅</button>
            </form>
          </div>

          <div className="admin-card">
            <h3>🚚 نوار اعتماد</h3>
            <form onSubmit={saveSettings} className="order-form">
              <label>متن ۱</label>
              <input value={sform.trust1 || ""} onChange={(e) => setSform({ ...sform, trust1: e.target.value })} />
              <label>متن ۲</label>
              <input value={sform.trust2 || ""} onChange={(e) => setSform({ ...sform, trust2: e.target.value })} />
              <label>متن ۳</label>
              <input value={sform.trust3 || ""} onChange={(e) => setSform({ ...sform, trust3: e.target.value })} />
              <label>متن ۴</label>
              <input value={sform.trust4 || ""} onChange={(e) => setSform({ ...sform, trust4: e.target.value })} />
              <button type="submit" className="primary-button">ذخیره نوار اعتماد ✅</button>
            </form>
          </div>

          <div className="admin-card">
            <h3>📝 مزایا (بخش «چرا ما؟»)</h3>
            <form onSubmit={saveFeatures} className="order-form">
              {features.map((f, i) => (
                <div key={i}>
                  <h5 style={{ margin: "12px 0 6px", color: "var(--main)" }}>مزیت {i + 1}</h5>
                  <div className="form-row">
                    <div><label>آیکون</label><input value={f.icon} onChange={(e) => { const n = [...features]; n[i].icon = e.target.value; setFeatures(n); }} /></div>
                    <div><label>عنوان</label><input value={f.title} onChange={(e) => { const n = [...features]; n[i].title = e.target.value; setFeatures(n); }} /></div>
                  </div>
                  <label>توضیحات</label>
                  <input value={f.desc} onChange={(e) => { const n = [...features]; n[i].desc = e.target.value; setFeatures(n); }} />
                </div>
              ))}
              <button type="submit" className="primary-button">ذخیره مزایا ✅</button>
            </form>
          </div>

          <div className="admin-card">
            <h3>🪜 مراحل سفارش</h3>
            <form onSubmit={saveSteps} className="order-form">
              {steps.map((f, i) => (
                <div key={i}>
                  <h5 style={{ margin: "12px 0 6px", color: "var(--main)" }}>قدم {i + 1}</h5>
                  <div className="form-row">
                    <div><label>شماره</label><input value={f.num} onChange={(e) => { const n = [...steps]; n[i].num = e.target.value; setSteps(n); }} /></div>
                    <div><label>عنوان</label><input value={f.title} onChange={(e) => { const n = [...steps]; n[i].title = e.target.value; setSteps(n); }} /></div>
                  </div>
                  <label>توضیحات</label>
                  <input value={f.desc} onChange={(e) => { const n = [...steps]; n[i].desc = e.target.value; setSteps(n); }} />
                </div>
              ))}
              <button type="submit" className="primary-button">ذخیره مراحل ✅</button>
            </form>
          </div>
        </>
      )}

      {tab === "orders" && (
        <div className="admin-card">
          <h3>📥 سفارش‌های مشتریان ({orders.length})</h3>
          {orders.length === 0 ? (
            <p className="empty-cart">هنوز سفارشی ثبت نشده.</p>
          ) : (
            orders.slice().reverse().map((o) => (
              <div className="order-item" key={o.id}>
                <div className="order-head">
                  <strong>👤 {o.name}</strong>
                  <span>📱 {o.phone}</span>
                  <button className="del-btn" onClick={() => removeOrder(o.id)}>🗑️</button>
                </div>
                <div className="order-cart">{o.items || "—"}</div>
                <div className="order-total">
                  <strong>جمع کل: {formatPrice(o.total)}</strong>
                  <span className="order-date">{o.date || ""}</span>
                </div>
                {o.payMethod && <div className="order-pay">💳 روش پرداخت: {o.payMethod}</div>}
                {o.receiptName && <div className="order-note">🧾 رسید: {o.receiptName}</div>}
                {o.note && <div className="order-note">📝 {o.note}</div>}
                {o.file && <div className="order-note">📎 فایل طرح: {o.file}</div>}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- کامپوننت اصلی ---------- */
function App() {
  const [route, setRoute] = useState("shop");
  const [authOK, setAuthOK] = useState(() => localStorage.getItem("chapsky_admin") === "true");
  const [pass, setPass] = useState("");
  const [products, setProducts] = useState(fallbackProducts);
  const [loaded, setLoaded] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [features, setFeatures] = useState(defaultFeatures);
  const [steps, setSteps] = useState(defaultSteps);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [receiptName, setReceiptName] = useState("");
  const [payMethod, setPayMethod] = useState("card");
  const [form, setForm] = useState({ name: "", phone: "", desc: "" });

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
        const f = await getDoc(doc(db, "content", "features"));
        if (f.exists()) setFeatures(f.data().list || defaultFeatures);
        const st = await getDoc(doc(db, "content", "steps"));
        if (st.exists()) setSteps(st.data().list || defaultSteps);
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
  const changeQty = (id, d) =>
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty: i.qty + d } : i)).filter((i) => i.qty > 0));
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const items = cart.map((i) => `${i.icon} ${i.title} × ${i.qty} = ${formatPrice(i.price * i.qty)}`).join("\n");
    const payText = payMethod === "card"
      ? `کارت‌به‌کارت به شماره ${settings.cardNumber} (${settings.cardHolder})`
      : "پرداخت آنلاین از طریق درگاه";
    const msg =
      `🛒 سفارش جدید از سایت ${settings.shopName}\n\n` +
      `👤 نام: ${form.name}\n📱 تماس: ${form.phone}\n` +
      (form.desc ? `📝 توضیحات: ${form.desc}\n` : "") +
      `\n📦 اقلام:\n${items}\n\n💰 جمع کل: ${formatPrice(total)}\n\n` +
      `💳 روش پرداخت: ${payText}\n` +
      (receiptName ? `🧾 رسید ارسال‌شده: ${receiptName}\n` : "") +
      (fileName ? `📎 فایل طرح: ${fileName} (لطفاً در همین گفتگو ارسال شود)\n` : "");
    window.open(`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");

    try {
      await addDoc(collection(db, "orders"), {
        name: form.name, phone: form.phone, note: form.desc, file: fileName, receiptName, payMethod: payText,
        items, total, date: new Date().toLocaleString("fa-IR"),
      });
    } catch (err) { console.error(err); }

    setOrderOpen(false); setCart([]); setFileName(""); setReceiptName(""); setForm({ name: "", phone: "", desc: "" });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (pass === ADMIN_PASSWORD) {
      localStorage.setItem("chapsky_admin", "true");
      setAuthOK(true);
    } else {
      alert("رمز عبور اشتباه است!");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("chapsky_admin");
    setAuthOK(false);
    setRoute("shop");
  };

  if (route === "admin") {
    if (!authOK) {
      return (
        <div className="login-screen">
          <form className="login-box" onSubmit={handleLogin}>
            <h2>🔒 پنل مدیریت</h2>
            <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="رمز عبور" autoComplete="new-password" />
            <button type="submit" className="primary-button full">ورود</button>
            <button type="button" className="outline-button full" onClick={() => setRoute("shop")}>بازگشت به فروشگاه</button>
          </form>
        </div>
      );
    }
    return (
      <AdminPanel
        settings={settings}
        setSettings={setSettings}
        onClose={() => setRoute("shop")}
      />
    );
  }

  const ProductCard = ({ p }) => {
    const [qty, setQty] = useState(1);
    return (
      <div className="product-card">
        {p.tag && <span className="product-tag">{p.tag}</span>}
        {p.image ? <img src={p.image} alt={p.title} className="product-img" onError={(e) => { e.target.style.display = "none"; }} /> : <div className="product-icon">{p.icon}</div>}
        <h3>{p.title}</h3>
        <p>{p.desc}</p>
        <div className="product-price">{formatPrice(p.price)}</div>
        <div className="qty-selector">
          <label>تعداد:</label>
          <input type="number" min="1" max="1000" value={qty} onChange={(e) => { const v = Math.max(1, Math.min(1000, Number(e.target.value) || 1)); setQty(v); }} />
        </div>
        <button className="add-button" onClick={() => { addToCart(p, qty); setQty(1); }}>افزودن به سبد 🛒</button>
      </div>
    );
  };

  return (
    <div className="site" dir="rtl">
      <header className="header">
        <div className="logo">
          <img src={settings.logoUrl} alt="لوگو" className="logo-img" onError={(e) => e.target.style.display = "none"} />
          <div>
            <strong>{settings.shopName}</strong>
            <small>{settings.tagline}</small>
          </div>
        </div>
        <nav>
          <a href="#home">خانه</a>
          <a href="#products">محصولات</a>
          <a href="#why-us">چرا ما؟</a>
          <a href="#contact">تماس با ما</a>
          <button className="nav-link admin-link" onClick={() => setRoute("admin")}>⚙️ مدیریت</button>
        </nav>
        <button className="cart-button" onClick={() => setCartOpen(true)}>
          🛒 سبد خرید
          {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </button>
      </header>

      <section className="hero" id="home">
        <div className="hero-content">
          <div className="hero-badge">{settings.badgeText}</div>
          <h1>{settings.heroTitle1} <span>{settings.heroTitle2}</span></h1>
          <p>{settings.heroText}</p>
          <div className="hero-buttons">
            <a href="#products" className="primary-button">🛍️ مشاهده محصولات</a>
            <a href="#contact" className="outline-button">📞 تماس با ما</a>
          </div>
          <div className="hero-info">
            <div><strong>۱۰۰٪</strong><span>چاپ سفارشی</span></div>
            <div><strong>+۱۲</strong><span>محصول متنوع</span></div>
            <div><strong>سریع</strong><span>آماده‌سازی سفارش</span></div>
          </div>
        </div>
        <div className="hero-image">
          <img src={settings.logoUrl} alt="لوگو" className="logo-hero-img" onError={(e) => e.target.style.display = "none"} />
          <div className="float-card fc1">☕ ماگ سفارشی</div>
          <div className="float-card fc2">👕 تیشرت</div>
          <div className="float-card fc3">🖼️ تخته شاسی</div>
        </div>
      </section>

      <div className="trust-bar">
        <span>{settings.trust1}</span><span>{settings.trust2}</span><span>{settings.trust3}</span><span>{settings.trust4}</span>
      </div>

      <section className="products" id="products">
        {settings.showProductLogo && (
          <img src={settings.logoUrl} alt="لوگو" className="logo-product-img" onError={(e) => e.target.style.display = "none"} />
        )}
        <h2>محصولات و خدمات ما</h2>
        <p className="section-sub">محصول را انتخاب کنید، طرح‌تان را آپلود کنید — ما چاپ می‌کنیم!</p>
        {!loaded ? (
          <p className="section-sub">⏳ در حال بارگذاری محصولات...</p>
        ) : (
          <div className="products-grid">
            {products.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </section>

      <section className="steps">
        <h2>سفارش در ۳ قدم</h2>
        <div className="steps-grid">
          {steps.map((s, i) => (
            <div key={i}><span className="step-num">{s.num}</span><h3>{s.title}</h3><p>{s.desc}</p></div>
          ))}
        </div>
      </section>

      <section className="why-us" id="why-us">
        <h2>چرا {settings.shopName}؟</h2>
        <div className="why-grid">
          {features.map((f, i) => (
            <div key={i}><span>{f.icon}</span><h3>{f.title}</h3><p>{f.desc}</p></div>
          ))}
        </div>
      </section>

      <footer className="footer" id="contact">
        <div className="footer-logo-wrap">
          <img src={settings.logoUrl} alt="لوگو" className="footer-logo" onError={(e) => e.target.style.display = "none"} />
        </div>
        <h2>تماس با ما</h2>
        <p>برای ثبت سفارش و مشاوره با ما در ارتباط باشید.</p>
        <div className="footer-info">
          <span>📱 {settings.phone}</span>
          <span>📍 {settings.address}</span>
          <span>📸 اینستاگرام: {settings.instagram}@</span>
        </div>
        <div className="social-row">
          <a href={`https://instagram.com/${settings.instagram}`} target="_blank" rel="noreferrer" className="social-btn">📸 اینستاگرام</a>
          <a href={`https://t.me/${settings.telegram}`} target="_blank" rel="noreferrer" className="social-btn">✈️ تلگرام</a>
          <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer" className="social-btn">💬 واتساپ</a>
          <a href={`https://rubika.ir/${settings.rubika}`} target="_blank" rel="noreferrer" className="social-btn">🔵 روبیکا</a>
          <a href={`https://ble.ir/${settings.bale}`} target="_blank" rel="noreferrer" className="social-btn">🟢 بله</a>
        </div>
        <p className="copy">© {settings.shopName} — تمامی حقوق محفوظ است.</p>
      </footer>

      {cartOpen && (
        <div className="overlay" onClick={() => setCartOpen(false)}>
          <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <h3>🛒 سبد خرید</h3>
              <button className="close-btn" onClick={() => setCartOpen(false)}>✕</button>
            </div>
            {cart.length === 0 ? (
              <p className="empty-cart">سبد خرید شما خالی است.</p>
            ) : (
              <>
                {cart.map((i) => (
                  <div className="cart-item" key={i.id}>
                    <span className="ci-title">{i.icon} {i.title}</span>
                    <div className="qty-box">
                      <button onClick={() => changeQty(i.id, 1)}>＋</button>
                      <span>{i.qty}</span>
                      <button onClick={() => changeQty(i.id, -1)}>－</button>
                    </div>
                    <span className="ci-price">{formatPrice(i.price * i.qty)}</span>
                  </div>
                ))}
                <div className="cart-total">
                  <strong>جمع کل:</strong><strong>{formatPrice(total)}</strong>
                </div>
                <button className="primary-button full" onClick={() => { setCartOpen(false); setOrderOpen(true); }}>
                  ادامه و تکمیل سفارش 📎
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {orderOpen && (
        <div className="overlay center" onClick={() => setOrderOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <h3>📎 تکمیل سفارش</h3>
              <button className="close-btn" onClick={() => setOrderOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="order-form">
              <label>نام و نام خانوادگی</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثلاً: علی محمدی" />
              <label>شماره تماس</label>
              <input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="۰۹۱۲..." />
              <label style={{ marginTop: "18px" }}>روش پرداخت</label>
              <div className="pay-options">
                <label className={"pay-option" + (payMethod === "card" ? " active" : "")}>
                  <input type="radio" name="pay" checked={payMethod === "card"} onChange={() => setPayMethod("card")} style={{ width: "auto" }} />
                  💳 کارت‌به‌کارت
                </label>
                {settings.gatewayEnabled ? (
                  <label className={"pay-option" + (payMethod === "online" ? " active" : "")}>
                    <input type="radio" name="pay" checked={payMethod === "online"} onChange={() => setPayMethod("online")} style={{ width: "auto" }} />
                    🌐 پرداخت آنلاین (درگاه)
                  </label>
                ) : null}
              </div>
              {payMethod === "card" ? (
                <div className="card-box">
                  <p style={{ fontWeight: "bold", marginBottom: "6px" }}>🏦 مبلغ را به کارت زیر واریز کنید:</p>
                  <p style={{ fontSize: "18px", letterSpacing: "2px", color: "var(--main)", fontWeight: "800", margin: "8px 0" }}>{settings.cardNumber}</p>
                  <p style={{ fontSize: "14px", color: "#555" }}>به نام: <strong>{settings.cardHolder}</strong></p>
                  <p style={{ fontSize: "13px", color: "#777", marginTop: "6px" }}>جمع قابل پرداخت: <strong>{formatPrice(total)}</strong></p>
                </div>
              ) : (
                <div className="card-box">
                  <p>🔗 به درگاه پرداخت آنلاین منتقل می‌شوید.</p>
                </div>
              )}
              <label>🧾 آپلود تصویر رسید پرداخت (عکس)</label>
              <div className="file-upload">
                <input type="file" id="receipt-file" accept="image/*" onChange={(e) => setReceiptName(e.target.files ? e.target.files[0].name : "")} />
                <label htmlFor="receipt-file" className="file-label">{receiptName ? `🧾 ${receiptName}` : "⬆️ انتخاب عکس رسید"}</label>
              </div>
              <label>توضیحات سفارش (تعداد، سایز، متن چاپ و...)</label>
              <textarea rows="3" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder="مثلاً: ۲۰ عدد ماگ با لوگوی شرکت" />
              <label>فایل طرح شما (عکس، PDF، PSD...)</label>
              <div className="file-upload">
                <input type="file" id="design-file" accept="image/*,.pdf,.psd,.ai,.zip" onChange={(e) => setFileName(e.target.files ? e.target.files[0].name : "")} />
                <label htmlFor="design-file" className="file-label">{fileName ? `📄 ${fileName}` : "⬆️ انتخاب فایل طرح"}</label>
              </div>
              <button type="submit" className="primary-button full">ارسال سفارش ✅</button>
              <small className="form-note">سفارش به واتساپ و پنل مدیریت شما ارسال می‌شود. عکس رسید را پس از باز شدن واتساپ ارسال کنید.</small>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;