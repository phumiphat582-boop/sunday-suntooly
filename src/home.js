import { loadProducts, saveProducts } from './store.js';

let products = loadProducts();
let cart = [];
let activeCategory = 'all';
let isInitialized = false;

export function renderHome() {
  products = loadProducts();
  initHomeEvents();

  const keyword = document.getElementById('homeSearchInput').value.toLowerCase().trim();
  const grid = document.getElementById('homeProductGrid');

  const filtered = products.filter((p) => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory;
    const matchName = p.name.toLowerCase().includes(keyword);
    return matchCat && matchName;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="col-span-full text-center py-12 text-gray-500">ไม่พบสินค้าที่ค้นหา</div>`;
    return;
  }

  grid.innerHTML = filtered.map((product) => {
    const outOfStock = product.stock === 0;
    return `
      <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 flex flex-col justify-between overflow-hidden relative">
        ${product.promo ? `<span class="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">${product.promo}</span>` : ''}
        <div class="h-32 bg-gray-50 flex items-center justify-center text-6xl ${outOfStock ? 'opacity-40' : ''}">${product.icon}</div>
        <div class="p-3 flex-1 flex flex-col justify-between">
          <div>
            <h3 class="text-sm font-semibold text-gray-800 line-clamp-2">${product.name}</h3>
            <p class="text-xs mt-1 ${product.stock <= 5 && product.stock > 0 ? 'text-amber-600 font-medium' : 'text-gray-400'}">
              ${outOfStock ? 'สินค้าหมดชั่วคราว' : `คงเหลือ ${product.stock} ชิ้น`}
            </p>
          </div>
          <div class="mt-3">
            <div class="flex items-baseline gap-1.5 mb-2">
              <span class="text-lg font-bold text-emerald-700">฿${product.price}</span>
              ${product.oldPrice ? `<span class="text-xs text-gray-400 line-through">฿${product.oldPrice}</span>` : ''}
            </div>
            <button
              type="button"
              onclick="window.homeAddToCart(${product.id})"
              ${outOfStock ? 'disabled' : ''}
              class="w-full py-1.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
                outOfStock
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white active:scale-95'
              }"
            >
              ${outOfStock ? 'สินค้าหมด' : '+ ใส่ตะกร้า'}
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  updateCartUI();
}

window.homeAddToCart = function (id) {
  const product = products.find((p) => p.id === id);
  if (!product || product.stock === 0) return;

  const existing = cart.find((item) => item.id === id);
  if (existing) {
    if (existing.qty >= product.stock) return alert('จำนวนเกินสต็อกคงเหลือ');
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  updateCartUI();
};

window.homeChangeCartQty = function (id, delta) {
  const idx = cart.findIndex((item) => item.id === id);
  if (idx === -1) return;

  const product = products.find((p) => p.id === id);
  const nextQty = cart[idx].qty + delta;

  if (nextQty <= 0) cart.splice(idx, 1);
  else if (nextQty <= product.stock) cart[idx].qty = nextQty;

  updateCartUI();
};

function updateCartUI() {
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  document.getElementById('cartBadge').textContent = totalQty;
  document.getElementById('cartTotal').textContent = `฿${totalPrice.toLocaleString()}`;

  const container = document.getElementById('cartItemsContainer');
  if (cart.length === 0) {
    container.innerHTML = `<p class="text-center text-gray-400 mt-10">ยังไม่มีสินค้าในตะกร้า</p>`;
    return;
  }

  container.innerHTML = cart.map((item) => `
    <div class="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
      <div class="flex items-center gap-3">
        <span class="text-3xl">${item.icon}</span>
        <div>
          <h4 class="text-sm font-semibold text-gray-800">${item.name}</h4>
          <p class="text-xs text-emerald-700 font-bold">฿${item.price} x ${item.qty}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button type="button" onclick="window.homeChangeCartQty(${item.id}, -1)" class="w-7 h-7 bg-white border border-gray-300 rounded font-bold text-gray-600 hover:bg-gray-100 cursor-pointer">-</button>
        <span class="text-sm font-semibold w-5 text-center">${item.qty}</span>
        <button type="button" onclick="window.homeChangeCartQty(${item.id}, 1)" class="w-7 h-7 bg-white border border-gray-300 rounded font-bold text-gray-600 hover:bg-gray-100 cursor-pointer">+</button>
      </div>
    </div>
  `).join('');
}

function initHomeEvents() {
  if (isInitialized) return;
  isInitialized = true;

  document.getElementById('homeSearchInput').addEventListener('input', renderHome);

  document.querySelectorAll('.home-cat-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.home-cat-btn').forEach((b) => {
        b.classList.remove('bg-emerald-700', 'text-white');
        b.classList.add('bg-gray-100', 'hover:bg-gray-200', 'text-gray-700');
      });
      btn.classList.remove('bg-gray-100', 'hover:bg-gray-200', 'text-gray-700');
      btn.classList.add('bg-emerald-700', 'text-white');
      activeCategory = btn.dataset.cat;
      renderHome();
    });
  });

  document.getElementById('openCartBtn').addEventListener('click', () => {
    document.getElementById('cartDrawer').classList.remove('hidden');
    document.getElementById('cartDrawer').classList.add('flex');
  });

  document.getElementById('closeCartBtn').addEventListener('click', () => {
    document.getElementById('cartDrawer').classList.add('hidden');
    document.getElementById('cartDrawer').classList.remove('flex');
  });

  document.getElementById('checkoutBtn').addEventListener('click', () => {
    if (cart.length === 0) return alert('กรุณาเลือกสินค้าก่อนสั่งซื้อ');

    cart.forEach((cItem) => {
      const prod = products.find((p) => p.id === cItem.id);
      if (prod) prod.stock = Math.max(0, prod.stock - cItem.qty);
    });

    saveProducts(products);
    alert('สั่งซื้อสำเร็จ! ขอบคุณที่ใช้บริการ SUNDAY SUNTOOLY');
    cart = [];
    renderHome();
    document.getElementById('cartDrawer').classList.add('hidden');
    document.getElementById('cartDrawer').classList.remove('flex');
  });
}