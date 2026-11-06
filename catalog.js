// Glam Empire - Product catalog
// Feature 3: Search Bar - filter products by keyword across name, brand, category, and description.

const PRODUCTS = [
  { id: 'velvet-matte',    name: 'Velvet Matte Lipstick',  brand: 'GlamCo',    category: 'Lips',  price: 22, emoji: '💄', blurb: 'Long-wear matte lipstick with botanical emulsifiers.' },
  { id: 'gloss-bomb',      name: 'Shine Bomb Lip Gloss',   brand: 'LuxeLab',  category: 'Lips',  price: 16, emoji: '💋', blurb: 'High-shine gloss with a plumping effect.' },
  { id: 'silk-foundation', name: 'Silk Touch Foundation', brand: 'GlamCo',    category: 'Face',  price: 34, emoji: '🧴', blurb: 'Non-comedogenic 4K-ready foundation.' },
  { id: 'hd-blur',         name: 'HD Blur Powder',         brand: 'PixelGlow', category: 'Face',  price: 28, emoji: '✨', blurb: 'Micro-powder optical diffusion for camera-ready skin.' },
  { id: 'blush-pop',       name: 'Blush Pop Palette',      brand: 'LuxeLab',  category: 'Face',  price: 26, emoji: '🌸', blurb: 'Silky pressed blush in four buildable shades.' },
  { id: 'lash-drama',      name: 'Lash Drama Mascara',     brand: 'PixelGlow', category: 'Eyes', price: 19, emoji: '👁️', blurb: 'Volume-boosting smudge-proof mascara.' },
  { id: 'shadow-story',    name: 'Shadow Story Palette',  brand: 'GlamCo',    category: 'Eyes',  price: 42, emoji: '🎨', blurb: '12 avant-garde editorial shades curated by runway artists.' },
  { id: 'liner-sharp',     name: 'Sharp Line Eyeliner',   brand: 'LuxeLab',  category: 'Eyes',  price: 15, emoji: '🖊️', blurb: 'Precision felt-tip liner in ultra-pigmented black.' },
  { id: 'glow-serum',      name: 'Glow Serum Primer',     brand: 'VanceLab',  category: 'Skin',  price: 38, emoji: '🧖', blurb: 'Skin prep serum with pigment-stabilizing formula.' },
  { id: 'setting-spray',   name: 'Sweat-Proof Setting Spray', brand: 'StageFX', category: 'Skin', price: 24, emoji: '💦', blurb: 'Polymer setting spray tested under stage lights.' },
  { id: 'brush-set',       name: 'Pro Brush Set (8 pc)',  brand: 'GlamCo',    category: 'Tools', price: 55, emoji: '🖌️', blurb: 'Vegan synthetic brushes for flawless blending.' },
  { id: 'sfx-kit',         name: 'SFX Starter Kit',        brand: 'ChenFX',   category: 'Tools', price: 78, emoji: '🎭', blurb: 'Silicone appliance kit with edge-blending solvents.' },
];

// Shared user preferences (favorites, ratings) - used by later features
function getPrefs() {
  try { return JSON.parse(localStorage.getItem('glamPrefs')) || { favorites: [], ratings: {} }; }
  catch (e) { return { favorites: [], ratings: {} }; }
}
function savePrefs(p) { localStorage.setItem('glamPrefs', JSON.stringify(p)); }

// Render a list of products into the grid
function renderCatalog(list) {
  const grid = document.getElementById('pgrid');
  grid.innerHTML = '';
  for (const p of list) {
    const d = document.createElement('div');
    d.className = 'pcard';
    d.innerHTML = '<div class="emoji">' + p.emoji + '</div>'
      + '<div class="cat">' + p.category + '</div>'
      + '<h3 style="font-size:15px">' + p.name + '</h3>'
      + '<div class="brand">by ' + p.brand + '</div>'
      + '<div class="price">$' + p.price + '</div>'
      + '<p class="sub" style="font-size:12px;margin-top:6px">' + p.blurb + '</p>';
    grid.appendChild(d);
  }
}

// ===== Feature 3: Search Bar =====
// Live search: matches the query against name, brand, category, and blurb.
function onSearch() {
  const q = document.getElementById('searchBar').value.trim().toLowerCase();
  let results;
  if (q === '') {
    results = PRODUCTS;
  } else {
    results = PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.blurb.toLowerCase().includes(q)
    );
  }
  const count = document.getElementById('resultCount');
  count.textContent = q === '' ? '' : results.length + ' product' + (results.length === 1 ? '' : 's') + ' found for "' + q + '"';
  if (results.length === 0) {
    document.getElementById('pgrid').innerHTML = '<p class="sub" style="grid-column:1/-1;text-align:center;padding:30px">😕 No products match "' + q + '". Try another keyword!</p>';
  } else {
    renderCatalog(results);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderCatalog(PRODUCTS);
});