/* global React, Icon */
const { useState: useStateA } = React;

function AffiliatePage({ setPage }) {
  const [cat, setCat] = useStateA("all");

  const categories = [
    { id: "all", label: "All" },
    { id: "mat", label: "Mats & Props" },
  ];

  const products = [
    {
      id: 1, cat: "mat", badge: null, brand: "Manduka",
      name: "PRO Black 6mm", price: "£108",
      blurb: "The mat we actually use. Heavier than you expect. Lasts a decade.",
      swatch: "#1c1c1c",
      commission: "6%",
    },
    {
      id: 2, cat: "mat", badge: null, brand: "Jade",
      name: "Harmony Natural Rubber", price: "£78",
      blurb: "For sweaty practice. Grippier the harder you work.",
      swatch: "#5a7a4e",
      commission: "5%",
    },
    {
      id: 3, cat: "mat", badge: "Editor's pick", brand: "Halfmoon",
      name: "Cork Yoga Block (pair)", price: "£32",
      blurb: "Cold, heavy, honest. Wooden blocks feel medicinal after a while.",
      swatch: "#c7a277",
      commission: "8%",
    },
    {
      id: 4, cat: "wear", badge: null, brand: "Girlfriend Collective",
      name: "Compressive High‑Rise Legging", price: "£72",
      blurb: "Made from recycled bottles. No logos. Looks better the more you wear it.",
      swatch: "#2b2b2b",
      commission: "10%",
    },
    {
      id: 5, cat: "wear", badge: null, brand: "Patagonia",
      name: "Lightweight Synchilla Pullover", price: "£110",
      blurb: "For savasana. For walks after. For everything else.",
      swatch: "#b0a38c",
      commission: "4%",
    },
    {
      id: 6, cat: "home", badge: "Small batch", brand: "Halfmoon",
      name: "Buckwheat Bolster", price: "£84",
      blurb: "The single most-used object in our Ubud studio. Heavy, supportive, worth the shipping.",
      swatch: "#a3875f",
      commission: "7%",
    },
    {
      id: 7, cat: "home", badge: null, brand: "Citta",
      name: "Hand-loomed Meditation Cushion", price: "£58",
      blurb: "Woven by a small co‑op in Jaipur. Each one slightly different.",
      swatch: "#c46a3b",
      commission: "8%",
    },
    {
      id: 8, cat: "read", badge: null, brand: "Shambhala",
      name: "Light on Yoga — B.K.S. Iyengar", price: "£24",
      blurb: "The book. Worth owning in paper so you can dog‑ear it.",
      swatch: "#e8e0d1",
      commission: "5%",
    },
    {
      id: 9, cat: "read", badge: "New", brand: "Penguin",
      name: "The Heart of Yoga — Desikachar", price: "£18",
      blurb: "Shorter, warmer, and quietly radical. Read it once a year.",
      swatch: "#f3c35c",
      commission: "5%",
    },
    {
      id: 10, cat: "scent", badge: null, brand: "Haeckels",
      name: "Marine Incense", price: "£26",
      blurb: "Seaweed, vetiver, something salty. For the beginning of practice.",
      swatch: "#3d4a3a",
      commission: "10%",
    },
    {
      id: 11, cat: "scent", badge: "Studio staple", brand: "Scandinavia Form",
      name: "Beeswax Pillar Candle", price: "£22",
      blurb: "Honey, a little smoke. We light one before each morning class.",
      swatch: "#f6d783",
      commission: "8%",
    },
    {
      id: 12, cat: "mat", badge: null, brand: "Manduka",
      name: "eQua Microfibre Towel", price: "£38",
      blurb: "Grips like glue when wet. Machine wash, line dry.",
      swatch: "#6a8ea3",
      commission: "6%",
    },
  ];

  const featured = products[0];
  const filtered = cat === "all" ? products : products.filter(p => p.cat === cat);

  return (
    <>
      {/* Hero */}
      <section className="shop-hero shop-hero-bold">
        <div className="shop-hero-inner">
          <h1 className="shop-hero-h1">
            Everything you need <em>to practice</em><br/>at home.
          </h1>
        </div>
      </section>

      {/* Filter bar */}
      <section className="shop-filters-wrap">
        <div className="shop-filters">
          {categories.map(c => (
            <button key={c.id}
              className={"sf-chip " + (cat === c.id ? "active" : "")}
              onClick={() => setCat(c.id)}>
              {c.label}
            </button>
          ))}
          <div className="sf-right">
            <Icon name="search" size={14}/>
            <input placeholder="Search — 'block', 'incense', 'legging'..." />
          </div>
        </div>
      </section>

      {/* Product grid */}
      <section className="shop-grid-wrap">
        <div className="shop-grid">
          {filtered.map(p => (
            <article key={p.id} className="product">
              <div className="product-img" style={{background: p.swatch}}>
                {p.badge && <div className="product-badge">{p.badge}</div>}
                <div className="product-ghost">{p.brand.split(' ')[0]}</div>
                <button className="product-save" aria-label="Save">
                  <Icon name="heart" size={14}/>
                </button>
              </div>
              <div className="product-body">
                <div className="product-brand">{p.brand}</div>
                <div className="product-name">{p.name}</div>
                <p className="product-blurb">{p.blurb}</p>
                <div className="product-foot">
                  <div className="product-price">{p.price}</div>
                  <button className="product-cta">
                    Buy <Icon name="arrow-right" size={12}/>
                  </button>
                </div>
                <div className="product-note">
                  <span className="affil-dot" /> Affiliate link
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

window.AffiliatePage = AffiliatePage;
