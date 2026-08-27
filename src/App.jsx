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
  designNote: "🧑‍🎨 طرح شما طراحی می‌شود و پیش از چاپ، برای تأیید برایتان ارسال می‌گردد. پس از تأیید شما، چاپ انجام می‌شود.",
  mainColor: "#4f6df5",
  secondColor: "#7c3aed",
  darkColor: "#1e2235",
  heroImage: "",
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
  { num: "۲", title: "تکمیل سفارش", desc: "مشخصات و جزئیات سفارش را وارد کنید." },
  { num: "۳", title: "تأیید طرح و چاپ", desc: "طرح برایتان ارسال می‌شود، تأیید کنید و چاپ انجام می‌شود." },
];

function formatPrice(n) {
  return Number(n || 0).toLocaleString("fa-IR") + " تومان";
}

function applyStyle(s) {
  const r = document.documentElement;
  r.style.setProperty("--main", s.mainColor);
  r.style.setProperty("--second", s.secondColor);
  r.style.setProperty("--dark", s.darkColor);
  r.style.setProperty("--font", `"${s.font || 'Vazirmatn'}", Tahoma, sans-serif`);
}

function SectionField({ label, value, onChange, rows, type, placeholder }) {
  return (
    <>
      <label>{label}</label>
      {rows ? (
        <textarea rows={rows} value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || ""} />
      ) : (
        <input type={type || "text"} value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || ""} />
      )}
    </>
  );
}

/* ---------- پنل مدیریت ---------- */
function AdminPanel({ settings, setSettings, onClose }) {
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", icon: "", price: "", desc: "", tag: "", image: "" });
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
    setForm({ title: "", icon: "", price: "", desc: "", tag: "", image: "" });
    setEditing(null);
  };

  const removeProduct = async (id) => {
    if (confirm("این محصول حذف شود؟")) await deleteDoc(doc(db, "products", id));
  };

  const startEdit = (p) => {
    setEditing(p.id);
    setForm({ title: p.title, icon: p.icon || "", price: p.price, desc: p.desc, tag: p.tag || "", image: p.image || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveAll = async (e, prefix) => {
    e && e.preventDefault();
    try {
      await setDoc(doc(db, "content", prefix), sform);
      setSettings(sform);
      applyStyle(sform);
      alert("تنظیمات ذخیره شد ✅");
    } catch (err) { alert("خطا: " + err.message); }
  };

  const saveFeatures = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, "content", "features"), { list: features });
      setFeatures(features);
      alert("مزایا ذخیره شد ✅");
    } catch (err) { alert("خطا: " + err.message); }
  };

  const saveSteps = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, "content", "steps"), { list: steps });
      setSteps(steps);
      alert("مراحل سفارش ذخیره شد ✅");
    } catch (err) { alert("خطا: " + err.message); }
  };

  const removeOrder = async (id) => {
    if (confirm("این سفارش حذف شود؟")) await deleteDoc(doc(db, "orders", id));
  };

  const setS = (key, val) => setSform((prev) => ({ ...prev, [key]: val }));

  return (
    <div className="admin-wrap">
      <div className="admin-header">
        <h2>🛠️ پنل مدیریت {settings.shopName}</h2>
        <button className="outline-button" onClick={onClose}>بازگشت به فروشگاه</button>
      </div>

      <div className="tabs">
        <button className={tab === "products" ? "tab active" : "tab"} onClick={() => setTab("products")}>📦 محصولات</button>
        <button className={tab === "info" ? "tab active" : "tab"} onClick={() => setTab("info")}>⚙️ اطلاعات فروشگاه</button>
        <button className={tab === "appearance" ? "tab active" : "tab"} onClick={() => setTab("appearance")}>🎨 ظاهر سایت</button>
        <button className={tab === "texts" ? "tab active" : "tab"} onClick={() => setTab("texts")}>📝 متون سایت</button>
        <button className={tab === "payment" ? "tab active" : "tab"} onClick={() => setTab("payment")}>💳 پرداخت</button>
        <button className={tab === "orders" ? "tab active" : "tab"} onClick={() => setTab("orders")}>📥 سفارش‌ها</button>
      </div>

      {/* محصولات */}
      {tab === "products" && (
        <>
          <div className="admin-card">
            <h3>{editing ? "✏️ ویرایش محصول" : "➕ افزودن محصول جدید"}</h3>
            <form onSubmit={saveProduct} className="order-form">
              <label>نام محصول</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="ماگ سفارشی" />
              <div className="form-row">
                <div><label>ایموجی آیکون</label><input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="☕" /></div>
                <div><label>قیمت (تومان)</label><input required type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="250000" /></div>
              </div>
              <label>لینک عکس محصول (اختیاری)</label>
              <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
              <label>توضیحات</label>
              <textarea value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder="توضیح کوتاه" />
              <label>برچسب (اختیاری)</label>
              <input value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} placeholder="پرفروش / جدید" />
              <div className="hero-buttons">
                <button type="submit" className="primary-button">{editing ? "ذخیره تغییرات ✅" : "افزودن محصول ✅"}</button>
                {editing && <button type="button" className="outline-button" onClick={() => { setEditing(null); setForm({ title: "", icon: "", price: "", desc: "", tag: "", image: "" }); }}>انصراف</button>}
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
                    {p.image ? <img src={p.image} alt={p.title} className="pai-img" onError={(e) => { e.target.style.display = "none"; }} /> : <span className="pai-icon">{p.icon || "🖨️"}</span>}
                    <div className="pai-info"><strong>{p.title}</strong><small>{formatPrice(p.price)}{p.tag ? ` | ${p.tag}` : ""}</small></div>
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

      {/* اطلاعات فروشگاه */}
      {tab === "info" && (
        <div className="admin-card">
          <h3>⚙️ اطلاعات فروشگاه</h3>
          <form onSubmit={(e) => saveAll(e, "info")} className="order-form">
            <div className="form-row">
              <div><SectionField label="نام فروشگاه" value={sform.shopName} onChange={(v) => setS("shopName", v)} /></div>
              <div><SectionField label="شعار" value={sform.tagline} onChange={(v) => setS("tagline", v)} /></div>
            </div>
            <SectionField label="شماره تماس" value={sform.phone} onChange={(v) => setS("phone", v)} />
            <SectionField label="شماره واتساپ (با 98)" value={sform.whatsapp} onChange={(v) => setS("whatsapp", v)} />
            <SectionField label="آیدی تلگرام (بدون @)" value={sform.telegram} onChange={(v) => setS("telegram", v)} />
            <SectionField label="آیدی روبیکا (بدون @)" value={sform.rubika} onChange={(v) => setS("rubika", v)} />
            <SectionField label="آیدی اینستاگرام (بدون @)" value={sform.instagram} onChange={(v) => setS("instagram", v)} />
            <SectionField label="آیدی بله (بدون @)" value={sform.bale} onChange={(v) => setS("bale", v)} />
            <SectionField label="آدرس فروشگاه" value={sform.address} onChange={(v) => setS("address", v)} />
            <button type="submit" className="primary-button" style={{ marginTop: "16px" }}>ذخیره اطلاعات ✅</button>
          </form>
        </div>
      )}

      {/* ظاهر سایت */}
      {tab === "appearance" && (
        <div className="admin-card">
          <h3>🎨 ظاهر سایت</h3>
          <form onSubmit={(e) => saveAll(e, "appearance")} className="order-form">
            <h4 style={{ margin: "10px 0 6px", color: "var(--main)" }}>🔤 فونت سایت</h4>
            <label>انتخاب فونت</label>
            <select value={sform.font || "Vazirmatn"} onChange={(e) => setS("font", e.target.value)}>
              {FONTS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
            <h4 style={{ margin: "16px 0 6px", color: "var(--main)" }}>🎨 رنگ سایت</h4>
            <div className="form-row">
              <div><label>رنگ اصلی</label><input type="color" value={sform.mainColor || "#4f6df5"} onChange={(e) => setS("mainColor", e.target.value)} style={{ height: "44px", padding: "4px" }} /></div>
              <div><label>رنگ دوم</label><input type="color" value={sform.secondColor || "#7c3aed"} onChange={(e) => setS("secondColor", e.target.value)} style={{ height: "44px", padding: "4px" }} /></div>
              <div><label>رنگ تیره</label><input type="color" value={sform.darkColor || "#1e2235"} onChange={(e) => setS("darkColor", e.target.value)} style={{ height: "44px", padding: "4px" }} /></div>
            </div>
            <h4 style={{ margin: "16px 0 6px", color: "var(--main)" }}>🖼️ لوگو و تصاویر</h4>
            <SectionField label="لینک لوگو" value={sform.logoUrl} onChange={(v) => setS("logoUrl", v)} placeholder="logo.png یا https://..." />
            <SectionField label="لینک تصویر بخش هیرو (اختیاری)" value={sform.heroImage} onChange={(v) => setS("heroImage", v)} placeholder="https://..." />
            <label style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "12px" }}>
              <input type="checkbox" checked={!!sform.showProductLogo} onChange={(e) => setS("showProductLogo", e.target.checked)} style={{ width: "auto" }} />
              نمایش لوگو بالای بخش محصولات
            </label>
            <button type="submit" className="primary-button" style={{ marginTop: "16px" }}>ذخیره ظاهر سایت ✅</button>
          </form>
        </div>
      )}

      {/* متون سایت */}
      {tab === "texts" && (
        <>
          <div className="admin-card">
            <h3>🏠 بخش هیرو (بالای صفحه)</h3>
            <form onSubmit={(e) => saveAll(e, "texts")} className="order-form">
              <SectionField label="متن نشان (Badge)" value={sform.badgeText} onChange={(v) => setS("badgeText", v)} />
              <div className="form-row">
                <div><SectionField label="تیتر بخش اول" value={sform.heroTitle1} onChange={(v) => setS("heroTitle1", v)} /></div>
                <div><SectionField label="تیتر بخش دوم (رنگی)" value={sform.heroTitle2} onChange={(v) => setS("heroTitle2", v)} /></div>
              </div>
              <SectionField label="متن توضیحات هیرو" value={sform.heroText} onChange={(v) => setS("heroText", v)} rows={3} />
              <button type="submit" className="primary-button">ذخیره هیرو ✅</button>
            </form>
          </div>

          <div className="admin-card">
            <h3>🚚 نوار اعتماد</h3>
            <form onSubmit={(e) => saveAll(e, "texts")} className="order-form">
              <SectionField label="متن ۱" value={sform.trust1} onChange={(v) => setS("trust1", v)} />
              <SectionField label="متن ۲" value={sform.trust2} onChange={(v) => setS("trust2", v)} />
              <SectionField label="متن ۳" value={sform.trust3} onChange={(v) => setS("trust3", v)} />
              <SectionField label="متن ۴" value={sform.trust4} onChange={(v) => setS("trust4", v)} />
              <button type="submit" className="primary-button">ذخیره نوار اعتماد ✅</button>
            </form>
          </div>

          <div className="admin-card">
            <h3>📝 متن طراحی / چاپ</h3>
            <form onSubmit={(e) => saveAll(e, "texts")} className="order-form">
              <SectionField label="متن توضیح طراحی" value={sform.designNote} onChange={(v) => setS("designNote", v)} rows={2} />
              <button type="submit" className="primary-button">ذخیره متن ✅</button>
            </form>
          </div>

          <div className="admin-card">
            <h3>📝 مزایا (چرا ما؟)</h3>
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

      {/* پرداخت */}
      {tab === "payment" && (
        <div className="admin-card">
          <h3>💳 تنظیمات پرداخت</h3>
          <form onSubmit={(e) => saveAll(e, "payment")} className="order-form">
            <SectionField label="شماره کارت" value={sform.cardNumber} onChange={(v) => setS("cardNumber", v)} />
            <SectionField label="نام صاحب حساب" value={sform.cardHolder} onChange={(v) => setS("cardHolder", v)} />
            <label style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "12px" }}>
              <input type="checkbox" checked={!!sform.gatewayEnabled} onChange={(e) => setS("gatewayEnabled", e.target.checked)} style={{ width: "auto" }} />
              فعال‌سازی درگاه پرداخت آنلاین
            </label>
            {sform.gatewayEnabled && <SectionField label="کلید مرچنت" value={sform.gatewayMerchantId} onChange={(v) => setS("gatewayMerchantId", v)} />}
            <button type="submit" className="primary-button" style={{ marginTop: "16px" }}>ذخیره تنظیمات پرداخت ✅</button>
          </form>
        </div>
      )}

      {/* سفارش‌ها */}
      {tab === "orders" && (
        <div className="admin-card">
          <h3>📥 سفارش‌های مشتریان ({orders.length})</h3>
          {orders.length === 0 ? (
            <p className="empty-cart">هنوز سفارشی ثبت نشده.</p>
          ) : (
            orders.slice().reverse().map((o) => (
              <div className="order-item" key={o.id}>
                <div className="order-head"><strong>👤 {o.name}</strong><span>📱 {o.phone}</span><button className="del-btn" onClick={() => removeOrder(o.id)}>🗑️</button></div>
                {o.province && o.city && <div className="order-note">📍 {o.province}، {o.city}</div>}
                {o.address && <div className="order-note">🏠 آدرس: {o.address}</div>}
                {o.postal && <div className="order-note">📮 کدپستی: {o.postal}</div>}
                {o.shipping && <div className="order-note">🚚 روش ارسال: {o.shipping}{o.shippingCost ? ` (${formatPrice(o.shippingCost)})` : ""}</div>}
                <div className="order-cart">{o.items || "—"}</div>
                <div className="order-total"><strong>جمع کل: {formatPrice(o.total)}</strong><span className="order-date">{o.date || ""}</span></div>
                {o.payMethod && <div className="order-pay">💳 روش پرداخت: {o.payMethod}</div>}
                {o.note && <div className="order-note">📝 {o.note}</div>}
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
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shippingCost = shipping === "پست" ? SHIPPING_POST_COST : 0;
  const total = subtotal + shippingCost;
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!shipping) {
      alert("لطفاً روش ارسال را انتخاب کنید!");
      return;
    }
    const items = cart.map((i) => `${i.icon || "🖨️"} ${i.title} × ${i.qty} = ${formatPrice(i.price * i.qty)}`).join("\n");
    const payText = payMethod === "card"
      ? `کارت‌به‌کارت به شماره ${settings.cardNumber} (${settings.cardHolder})`
      : "پرداخت آنلاین از طریق درگاه";
    const body =
      `🛒 سفارش جدید از سایت ${settings.shopName}\n\n` +
      `👤 نام: ${form.name}\n📱 تماس: ${form.phone}\n` +
      `📍 استان: ${form.province}\n🏙️ شهر: ${form.city}\n` +
      `🏠 آدرس: ${form.address}\n📮 کدپستی: ${form.postal}\n` +
      `🚚 روش ارسال: ${shipping}${shippingCost ? ` (${formatPrice(shippingCost)})` : " (رایگان)"}\n` +
      (form.desc ? `📝 جزئیات سفارش: ${form.desc}\n` : "") +
      `\n📦 اقلام:\n${items}\n` +
      (shippingCost ? `\n🚚 هزینه ارسال: ${formatPrice(shippingCost)}\n` : "") +
      `\n💰 جمع کل: ${formatPrice(total)}\n` +
      `💳 روش پرداخت: ${payText}\n\n${settings.designNote}\n\n⚡ پاسخ در کوتاه‌ترین زمان`;

    window.open(`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(body)}`, "_blank");

    try {
      await addDoc(collection(db, "orders"), {
        name: form.name, phone: form.phone, province: form.province, city: form.city,
        address: form.address, postal: form.postal, shipping, shippingCost,
        note: form.desc, payMethod: payText,
        items, total, date: new Date().toLocaleString("fa-IR"),
      });
    } catch (err) { console.error("order save:", err); }
    setSuccess({ name: form.name, total, shipping, shippingCost, items, payText });
    setOrderOpen(false); setCart([]); setShipping("");
    setForm({ name: "", phone: "", desc: "", address: "", postal: "", province: "", city: "" });
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
    return <AdminPanel settings={settings} setSettings={setSettings} onClose={() => setRoute("shop")} />;
  }

  const ProductCard = ({ p }) => {
    const [qty, setQty] = useState(1);
    return (
      <div className="product-card">
        {p.tag && <span className="product-tag">{p.tag}</span>}
        {p.image ? <img src={p.image} alt={p.title} className="product-img" onError={(e) => { e.target.style.display = "none"; }} /> : <div className="product-icon">{p.icon || "🖨️"}</div>}
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
          <div><strong>{settings.shopName}</strong><small>{settings.tagline}</small></div>
        </div>
        <nav>
          <a href="#home">خانه</a>
          <a href="#products">محصولات</a>
          <a href="#why-us">چرا ما؟</a>
          <a href="#contact">تماس با ما</a>
          <button className="nav-link admin-link" onClick={() => setRoute("admin")}>⚙️ مدیریت</button>
        </nav>
        <button className="cart-button" onClick={() => setCartOpen(true)}>🛒 سبد خرید{cartCount > 0 && <span className="cart-count">{cartCount}</span>}</button>
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
        {settings.heroImage && (
          <div className="hero-image">
            <img src={settings.heroImage} alt="تبلیغ" className="logo-hero-img" onError={(e) => e.target.style.display = "none"} />
          </div>
        )}
      </section>

      <div className="trust-bar">
        <span>{settings.trust1}</span><span>{settings.trust2}</span><span>{settings.trust3}</span><span>{settings.trust4}</span>
      </div>

      <section className="products" id="products">
        {settings.showProductLogo && <img src={settings.logoUrl} alt="لوگو" className="logo-product-img" onError={(e) => e.target.style.display = "none"} />}
        <h2>محصولات و خدمات ما</h2>
        <p className="section-sub">محصول را انتخاب کنید، طرح‌تان را آپلود کنید — ما چاپ می‌کنیم!</p>
        {!loaded ? (
          <p className="section-sub">⏳ در حال بارگذاری محصولات...</p>
        ) : (
          <div className="products-grid">{products.map((p) => <ProductCard key={p.id} p={p} />)}</div>
        )}
      </section>

      <section className="steps">
        <h2>سفارش در ۳ قدم</h2>
        <div className="steps-grid">
          {steps.map((s, i) => <div key={i}><span className="step-num">{s.num}</span><h3>{s.title}</h3><p>{s.desc}</p></div>)}
        </div>
      </section>

      <section className="why-us" id="why-us">
        <h2>چرا {settings.shopName}؟</h2>
        <div className="why-grid">
          {features.map((f, i) => <div key={i}><span>{f.icon}</span><h3>{f.title}</h3><p>{f.desc}</p></div>)}
        </div>
      </section>

      <footer className="footer" id="contact">
        <div className="footer-logo-wrap"><img src={settings.logoUrl} alt="لوگو" className="footer-logo" onError={(e) => e.target.style.display = "none"} /></div>
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
            <div className="cart-header"><h3>🛒 سبد خرید</h3><button className="close-btn" onClick={() => setCartOpen(false)}>✕</button></div>
            {cart.length === 0 ? (
              <p className="empty-cart">سبد خرید شما خالی است.</p>
            ) : (
              <>
                {cart.map((i) => (
                  <div className="cart-item" key={i.id}>
                    <span className="ci-title">{i.icon || "🖨️"} {i.title}</span>
                    <div className="qty-box">
                      <button onClick={() => changeQty(i.id, 1)}>＋</button><span>{i.qty}</span><button onClick={() => changeQty(i.id, -1)}>－</button>
                    </div>
                    <span className="ci-price">{formatPrice(i.price * i.qty)}</span>
                  </div>
                ))}
                <div className="cart-total"><strong>جمع کل:</strong><strong>{formatPrice(subtotal)}</strong></div>
                <button className="primary-button full" onClick={() => { setCartOpen(false); setOrderOpen(true); }}>ادامه و تکمیل سفارش 📎</button>
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
              <label>نام و نام خانوادگی</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثلاً: علی محمدی" />
              <label>شماره تماس</label>
              <input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="۰۹۱۲..." />
              <label style={{ marginTop: "18px" }}>📍 استان</label>
              <select required value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })}>
                <option value="">انتخاب استان...</option>
                {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <label>🏙️ شهر</label>
              <input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="مثلاً: مراغه" />
              <label>🏠 آدرس کامل (خیابان، پلاک، واحد)</label>
              <textarea rows="2" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="مثلاً: خیابان امام، پلاک ۱۲، واحد ۲" />
              <label>📮 کدپستی</label>
              <input required type="text" inputMode="numeric" value={form.postal} onChange={(e) => setForm({ ...form, postal: e.target.value })} placeholder="۱۰ رقمی" maxLength="10" />
              <label style={{ marginTop: "18px" }}>🚚 روش ارسال</label>
              <div className="pay-options">
                <label className={"pay-option" + (shipping === "پست" ? " active" : "")}>
                  <input type="radio" name="ship" checked={shipping === "پست"} onChange={() => setShipping("پست")} style={{ width: "auto" }} />
                  📮 پست پیشتاز ({formatPrice(SHIPPING_POST_COST)})
                </label>
                <label className={"pay-option" + (shipping === "چاپار" ? " active" : "")}>
                  <input type="radio" name="ship" checked={shipping === "چاپار"} onChange={() => setShipping("چاپار")} style={{ width: "auto" }} />
                  🚚 چاپار (رایگان)
                </label>
                <label className={"pay-option" + (shipping === "تیپاکس" ? " active" : "")}>
                  <input type="radio" name="ship" checked={shipping === "تیپاکس"} onChange={() => setShipping("تیپاکس")} style={{ width: "auto" }} />
                  🚛 تیپاکس (رایگان)
                </label>
              </div>
              <label style={{ marginTop: "14px" }}>روش پرداخت</label>
              <div className="pay-options">
                <label className={"pay-option" + (payMethod === "card" ? " active" : "")}>
                  <input type="radio" name="pay" checked={payMethod === "card"} onChange={() => setPayMethod("card")} style={{ width: "auto" }} />
                  💳 کارت‌به‌کارت
                </label>
              </div>
              {payMethod === "card" ? (
                <div className="card-box">
                  <p style={{ fontWeight: "bold", marginBottom: "6px" }}>🏦 مبلغ را به کارت زیر واریز کنید:</p>
                  <p style={{ fontSize: "18px", letterSpacing: "2px", color: "var(--main)", fontWeight: "800", margin: "8px 0" }}>{settings.cardNumber}</p>
                  <p style={{ fontSize: "14px", color: "#555" }}>به نام: <strong>{settings.cardHolder}</strong></p>
                  <p style={{ fontSize: "13px", color: "#777", marginTop: "6px" }}>
                    {shippingCost > 0 ? <>جمع کالاها: {formatPrice(subtotal)} + هزینه ارسال: {formatPrice(shippingCost)} = <strong>{formatPrice(total)}</strong></> : <>جمع قابل پرداخت: <strong>{formatPrice(total)}</strong></>}
                  </p>
                </div>
              ) : (
                <div className="card-box"><p>🔗 به درگاه پرداخت آنلاین منتقل می‌شوید.</p></div>
              )}
              <label>📝 جزئیات کامل سفارش (سایز، تعداد، متن چاپ، رنگ و...) *</label>
              <textarea rows="3" required value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder="لطفاً تمام جزئیات سفارش شامل تعداد، سایز، متن موردنظر برای چاپ، رنگ و هر نکته‌ی دیگر را بنویسید" />
              <button type="submit" className="primary-button full">ارسال سفارش ✅</button>
              <div className="alt-contact">
                📢 در صورت عدم دسترسی به واتساپ، از طریق <strong>تلگرام</strong> به آیدی <strong>@{settings.telegram}</strong> پیام دهید.
                <div className="alt-buttons">
                  <a className="alt-btn tg" href={`https://t.me/${settings.telegram}`} target="_blank" rel="noreferrer">✈️ ارسال از تلگرام</a>
                </div>
                <p className="rubika-note">🔵 اگر تلگرام هم ندارید، از <strong>روبیکا</strong> به شماره <strong>{settings.phone}</strong> یا آیدی <strong>@{settings.rubika}</strong> پیام دهید.</p>
              </div>
              <small className="form-note">⚠️ با ارسال، پنجره‌ی واتساپ باز می‌شود. سفارش شما در سامانه نیز ثبت می‌شود.</small>
            </form>
          </div>
        </div>
      )}

      {success && (
        <div className="overlay center" onClick={() => setSuccess(null)}>
          <div className="modal success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header"><h3>✅ سفارش شما ثبت شد!</h3><button className="close-btn" onClick={() => setSuccess(null)}>✕</button></div>
            <div className="success-body">
              <p>👤 {success.name}</p>
              <p className="success-items">{success.items}</p>
              <p>🚚 روش ارسال: {success.shipping}{success.shippingCost ? ` (${formatPrice(success.shippingCost)})` : " (رایگان)"}</p>
              <p className="success-total">💰 مبلغ: <strong>{formatPrice(success.total)}</strong></p>
              <p style={{ fontSize: "13px", color: "#777", marginTop: "10px" }}>💳 {success.payText}</p>
              <p style={{ fontSize: "13px", color: "var(--main)", marginTop: "10px" }}>{settings.designNote}</p>
            </div>
            <button className="primary-button full" onClick={() => setSuccess(null)}>باشه</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;