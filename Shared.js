/* ═══════════════════════════════════════════════════════
   Kicks Art — Shared.js
   All shared logic across category pages and index
   ═══════════════════════════════════════════════════════ */

const WA_NUMBER = "201032995178";
const SIZES     = [41, 42, 43, 44, 45];
const QUALITY   = ["Mirror", "مستورد"];

/* Price config — set base prices per quality tier.
   Each product can override with its own `prices` object:
     prices: { Mirror: 1800, "مستورد": 1200 }
   If no `prices` key, falls back to these defaults.      */
const DEFAULT_PRICES = {
  "Mirror":    1800,
  "مستورد": 1200,
};

const selectedSizes   = {};
const selectedQuality = {};

/* ── WhatsApp icon SVG ────────────────────────────────── */
const waIconSVG = `<svg class="wa-icon" width="18" height="18" viewBox="0 0 24 24" fill="white">
  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15
    -.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475
    -.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52
    .149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207
    -.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372
    -.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2
    5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719
    2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
</svg>`;

/* ── Get price for a product + quality combination ───── */
function getPrice(product, quality) {
  if (!quality) return null;
  const prices = product.prices || DEFAULT_PRICES;
  return prices[quality] ?? null;
}

/* ── Format price for display ─────────────────────────── */
function formatPrice(price) {
  if (price === null || price === undefined) return "";
  return `${Number(price).toLocaleString("en-EG")} L.E`;
}

/* ── Build a single product card HTML ────────────────── */
function buildProductCard(p, { showOrderButton = true } = {}) {
  const sizesHTML = SIZES.map(s =>
    `<button class="size-btn" data-product="${p.id}" data-size="${s}"
      onclick="selectSize(${p.id},'${s}',this)">${s}</button>`
  ).join("");

  const qualityHTML = QUALITY.map(q =>
    `<button class="qua-btn" data-product="${p.id}" data-quality="${q}"
      onclick="selectQuality(${p.id},'${q}',this)">${q}</button>`
  ).join("");

  const priceDisplay = p.desc
    ? `<div class="product-desc" id="desc-${p.id}">${p.desc}</div>`
    : `<div class="product-desc" id="desc-${p.id}"></div>`;

  const orderBtn = showOrderButton
    ? `<button class="order-btn" id="order-${p.id}" onclick="orderProduct(${p.id},'${p.name}')">
         ${waIconSVG} Order via WhatsApp
       </button>`
    : "";

  return `
  <div class="product-card">
    <div class="product-img" style="background:${p.bg}">
      <img class="${p.classs || ""}" src="${p.image}" alt="${p.name}">
      ${p.tag ? `<span class="product-tag ${p.tagClass}">${p.tag}</span>` : ""}
    </div>
    <div class="product-body">
      <div class="product-name">${p.name}</div>
      ${priceDisplay}
      <div class="price-display" id="price-${p.id}"></div>
      <div class="size-label">Choose Size</div>
      <div class="sizes">${sizesHTML}</div>
      <div class="size-label">Quality</div>
      <div class="qua">${qualityHTML}</div>
      ${orderBtn}
    </div>
  </div>`;
}

/* ── Render a list of products into a container ───────── */
function renderProducts(products, containerId = "productsGrid") {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = products.map(p => buildProductCard(p)).join("");
}

/* ── Size / Quality interaction ───────────────────────── */
function selectSize(productId, size, btn) {
  document.querySelectorAll(`[data-product="${productId}"][data-size]`)
    .forEach(b => b.classList.remove("selected"));
  btn.classList.add("selected");
  selectedSizes[productId] = size;
  updateOrderButton(productId);
}

function selectQuality(productId, quality, btn) {
  document.querySelectorAll(`[data-product="${productId}"][data-quality]`)
    .forEach(b => b.classList.remove("selected"));
  btn.classList.add("selected");
  selectedQuality[productId] = quality;
  updateOrderButton(productId);
  updatePriceDisplay(productId);
}

/* ── Update price display on quality change ───────────── */
function updatePriceDisplay(productId) {
  const priceEl = document.getElementById(`price-${productId}`);
  if (!priceEl) return;

  // Find product in whichever PRODUCTS array is on the page
  const allProducts = typeof PRODUCTS !== "undefined" ? PRODUCTS : [];
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  const quality = selectedQuality[productId];
  const price   = getPrice(product, quality);

  if (price !== null) {
    priceEl.innerHTML = `<span class="price-tag">${formatPrice(price)}</span>`;
    priceEl.classList.add("visible");
  } else {
    priceEl.innerHTML = "";
    priceEl.classList.remove("visible");
  }
}

/* ── Enable / disable order button ───────────────────── */
function updateOrderButton(productId) {
  const btn = document.getElementById(`order-${productId}`);
  if (!btn) return;
  if (selectedSizes[productId] && selectedQuality[productId]) {
    btn.classList.add("ready");
  } else {
    btn.classList.remove("ready");
  }
}

/* ── Open WhatsApp with order details ─────────────────── */
function orderProduct(productId, productName, category) {
  const size    = selectedSizes[productId];
  const quality = selectedQuality[productId];
  if (!size || !quality) return;

  const allProducts = typeof PRODUCTS !== "undefined" ? PRODUCTS : [];
  const product     = allProducts.find(p => p.id === productId);
  const price       = product ? getPrice(product, quality) : null;
  const priceText   = price ? `\nPrice: ${formatPrice(price)}` : "";
  const cat         = category ? ` (${category})` : "";

  const msg = encodeURIComponent(
    `أهلاً \nعايز أطلب "${productName}"${cat} from Kicks Art\nSize: ${size}\nQuality: ${quality}${priceText}`
  );
  window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, "_blank");
}

/* ── Custom order form (index.html) ───────────────────── */
function submitCustomOrder() {
  const name    = document.getElementById("custName")?.value.trim();
  const phone   = document.getElementById("custPhone")?.value.trim();
  const size    = document.getElementById("custSize")?.value;
  const details = document.getElementById("custDetails")?.value.trim();
  if (!name || !phone) { alert("Please enter your name and phone number "); return; }
  let msg = `Hello \nI'd like a custom sneaker from Kicks Art\n\nName: ${name}\nPhone: ${phone}`;
  if (size)    msg += `\nSize: ${size}`;
  if (details) msg += `\nExtra details: ${details}`;
  msg += `\n\nLooking forward to hearing from you!`;
  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
}

/* ── Smooth scroll for anchor links ───────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", e => {
      e.preventDefault();
      const el = document.querySelector(a.getAttribute("href"));
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
});
