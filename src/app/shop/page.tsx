"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";

const categories = [
  { id: "all", label: "All" },
  { id: "mat", label: "Mats & Props" },
];

const products = [
  { id: 1, cat: "mat", badge: null, brand: "Manduka", name: "PRO Black 6mm", price: "\u00a3108", blurb: "The mat we actually use. Heavier than you expect. Lasts a decade.", swatch: "#1c1c1c" },
  { id: 2, cat: "mat", badge: null, brand: "Jade", name: "Harmony Natural Rubber", price: "\u00a378", blurb: "For sweaty practice. Grippier the harder you work.", swatch: "#5a7a4e" },
  { id: 3, cat: "mat", badge: "Editor\u2019s pick", brand: "Halfmoon", name: "Cork Yoga Block (pair)", price: "\u00a332", blurb: "Cold, heavy, honest. Wooden blocks feel medicinal after a while.", swatch: "#c7a277" },
  { id: 4, cat: "wear", badge: null, brand: "Girlfriend Collective", name: "Compressive High\u2011Rise Legging", price: "\u00a372", blurb: "Made from recycled bottles. No logos. Looks better the more you wear it.", swatch: "#2b2b2b" },
  { id: 5, cat: "wear", badge: null, brand: "Patagonia", name: "Lightweight Synchilla Pullover", price: "\u00a3110", blurb: "For savasana. For walks after. For everything else.", swatch: "#b0a38c" },
  { id: 6, cat: "home", badge: "Small batch", brand: "Halfmoon", name: "Buckwheat Bolster", price: "\u00a384", blurb: "The single most-used object in our Ubud studio. Heavy, supportive, worth the shipping.", swatch: "#a3875f" },
  { id: 7, cat: "home", badge: null, brand: "Citta", name: "Hand-loomed Meditation Cushion", price: "\u00a358", blurb: "Woven by a small co\u2011op in Jaipur. Each one slightly different.", swatch: "#c46a3b" },
  { id: 8, cat: "read", badge: null, brand: "Shambhala", name: "Light on Yoga \u2014 B.K.S. Iyengar", price: "\u00a324", blurb: "The book. Worth owning in paper so you can dog\u2011ear it.", swatch: "#e8e0d1" },
  { id: 9, cat: "read", badge: "New", brand: "Penguin", name: "The Heart of Yoga \u2014 Desikachar", price: "\u00a318", blurb: "Shorter, warmer, and quietly radical. Read it once a year.", swatch: "#f3c35c" },
  { id: 10, cat: "scent", badge: null, brand: "Haeckels", name: "Marine Incense", price: "\u00a326", blurb: "Seaweed, vetiver, something salty. For the beginning of practice.", swatch: "#3d4a3a" },
  { id: 11, cat: "scent", badge: "Studio staple", brand: "Scandinavia Form", name: "Beeswax Pillar Candle", price: "\u00a322", blurb: "Honey, a little smoke. We light one before each morning class.", swatch: "#f6d783" },
  { id: 12, cat: "mat", badge: null, brand: "Manduka", name: "eQua Microfibre Towel", price: "\u00a338", blurb: "Grips like glue when wet. Machine wash, line dry.", swatch: "#6a8ea3" },
];

export default function ShopPage() {
  const [cat, setCat] = useState("all");
  const filtered = cat === "all" ? products : products.filter((p) => p.cat === cat);

  return (
    <>
      <section className="shop-hero shop-hero-bold">
        <div className="shop-hero-inner">
          <h1 className="shop-hero-h1">
            Everything you need <em>to practice</em>
            <br />
            at home.
          </h1>
        </div>
      </section>

      <section className="shop-filters-wrap">
        <div className="shop-filters">
          {categories.map((c) => (
            <button
              key={c.id}
              className={"sf-chip " + (cat === c.id ? "active" : "")}
              onClick={() => setCat(c.id)}
            >
              {c.label}
            </button>
          ))}
          <div className="sf-right">
            <Icon name="search" size={14} />
            <input placeholder="Search \u2014 'block', 'incense', 'legging'..." />
          </div>
        </div>
      </section>

      <section className="shop-grid-wrap">
        <div className="shop-grid">
          {filtered.map((p) => (
            <article key={p.id} className="product">
              <div className="product-img" style={{ background: p.swatch }}>
                {p.badge && <div className="product-badge">{p.badge}</div>}
                <div className="product-ghost">{p.brand.split(" ")[0]}</div>
                <button className="product-save" aria-label="Save">
                  <Icon name="heart" size={14} />
                </button>
              </div>
              <div className="product-body">
                <div className="product-brand">{p.brand}</div>
                <div className="product-name">{p.name}</div>
                <p className="product-blurb">{p.blurb}</p>
                <div className="product-foot">
                  <div className="product-price">{p.price}</div>
                  <button className="product-cta">
                    Buy <Icon name="arrow-right" size={12} />
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
