import { categoryLabels, defaultProducts, loadProducts, saveProducts } from './store.js';

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin123';
const AUTH_KEY = 'sunday_spa_admin_auth';

let products = loadProducts();
let isInitialized = false;

export function isAdminAuthenticated() {
  return sessionStorage.getItem(AUTH_KEY) === 'true';
}

export function logoutAdmin() {
  sessionStorage.removeItem(AUTH_KEY);
}

export function renderAdminLogin() {
  initAdminEvents();
  document.getElementById('adminPassword').value = '';
}

export function renderAdminDashboard(onUnauthorized) {
  if (!isAdminAuthenticated()) {
    if (onUnauthorized) onUnauthorized();
    return;
  }

  products = loadProducts();
  initAdminEvents();
  updateStats();

  const keyword = document.getElementById('adminSearchInput').value.toLowerCase().trim();
  const cat = document.getElementById('adminCategoryFilter').value;

  const filtered = products.filter((p) => {
    const matchName = p.name.toLowerCase().includes(keyword);
    const matchCat = cat === 'all' || p.category === cat;
    return matchName && matchCat;
  });

  const tbody = document.getElementById('adminTableBody');
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-gray-400">ไม่พบสินค้าในระบบ</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map((item) => `
    <tr class="hover:bg-gray-50">
      <td class="py-3 px-4 flex items-center gap-3">
        <span class="text-2xl bg-gray-100 w-10 h-10 flex items-center justify-center rounded-lg">${item.icon}</span>
        <span class="font-semibold text-gray-800">${item.name}</span>
      </td>
      <td class="py-3 px-4 text-xs text-gray-600">${categoryLabels[item.category] || item.category}</td>
      <td class="py-3 px-4">
        <input
          type="number"
          value="${item.price}"
          min="1"
          onchange="window.adminUpdatePrice(${item.id}, this.value)"
          class="w-20 border border-gray-300 rounded px-2 py-1 font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
        />
      </td>
      <td class="py-3 px-4 text-gray-400 text-xs">${item.oldPrice ? `฿${item.oldPrice}` : '-'}</td>
      <td class="py-3 px-4">
        <div class="flex items-center gap-1.5">
          <button type="button" onclick="window.adminUpdateStock(${item.id}, -1)" class="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded font-bold text-gray-700 cursor-pointer">-</button>
          <span class="w-8 text-center font-bold ${item.stock === 0 ? 'text-red-600' : item.stock <= 5 ? 'text-amber-600' : 'text-gray-800'}">${item.stock}</span>
          <button type="button" onclick="window.adminUpdateStock(${item.id}, 1)" class="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded font-bold text-gray-700 cursor-pointer">+</button>
        </div>
      </td>
      <td class="py-3 px-4">
        ${item.promo ? `<span class="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded">${item.promo}</span>` : '<span class="text-gray-300">-</span>'}
      </td>
      <td class="py-3 px-4 text-right space-x-1">
        <button type="button" onclick="window.adminOpenEdit(${item.id})" class="bg-amber-400 hover:bg-amber-500 text-gray-900 px-2.5 py-1 rounded text-xs font-bold cursor-pointer">แก้ไข</button>
        <button type="button" onclick="window.adminDelete(${item.id})" class="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded text-xs font-bold cursor-pointer">ลบ</button>
      </td>
    </tr>
  `).join('');
}

function updateStats() {
  document.getElementById('statTotalProducts').textContent = products.length;
  document.getElementById('statTotalStock').textContent = products.reduce((sum, p) => sum + p.stock, 0);
  document.getElementById('statLowStock').textContent = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  document.getElementById('statOutOfStock').textContent = products.filter((p) => p.stock === 0).length;
}

window.adminUpdatePrice = function (id, newPrice) {
  if (!isAdminAuthenticated()) return;
  const price = Number(newPrice);
  if (price <= 0) return alert('ราคาต้องมากกว่า 0 บาท');
  const item = products.find((p) => p.id === id);
  if (item) {
    item.price = price;
    saveProducts(products);
    renderAdminDashboard();
  }
};

window.adminUpdateStock = function (id, delta) {
  if (!isAdminAuthenticated()) return;
  const item = products.find((p) => p.id === id);
  if (item) {
    item.stock = Math.max(0, item.stock + delta);
    saveProducts(products);
    renderAdminDashboard();
  }
};

window.adminDelete = function (id) {
  if (!isAdminAuthenticated()) return;
  if (confirm('ยืนยันการลบสินค้ารายการนี้?')) {
    products = products.filter((p) => p.id !== id);
    saveProducts(products);
    renderAdminDashboard();
  }
};

window.adminOpenEdit = function (id) {
  if (!isAdminAuthenticated()) return;
  const p = products.find((item) => item.id === id);
  if (!p) return;

  document.getElementById('modalTitle').textContent = '✏️ แก้ไขรายละเอียดและราคาสินค้า';
  document.getElementById('editId').value = p.id;
  document.getElementById('nameInput').value = p.name;
  document.getElementById('categoryInput').value = p.category;
  document.getElementById('iconInput').value = p.icon;
  document.getElementById('priceInput').value = p.price;
  document.getElementById('oldPriceInput').value = p.oldPrice || '';
  document.getElementById('stockInput').value = p.stock;
  document.getElementById('promoInput').value = p.promo || '';

  const modal = document.getElementById('productModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
};

function initAdminEvents() {
  if (isInitialized) return;
  isInitialized = true;

  const modal = document.getElementById('productModal');
  const form = document.getElementById('productForm');

  document.getElementById('adminLoginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('adminUsername').value.trim();
    const pass = document.getElementById('adminPassword').value;

    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      sessionStorage.setItem(AUTH_KEY, 'true');
      if (window.onAdminLoginSuccess) window.onAdminLoginSuccess();
    } else {
      alert('ชื่อผู้ใช้หรือรหัสผ่านแอดมินไม่ถูกต้อง');
    }
  });

  document.getElementById('addProductBtn').addEventListener('click', () => {
    if (!isAdminAuthenticated()) return;
    document.getElementById('modalTitle').textContent = '+ เพิ่มสินค้าใหม่';
    document.getElementById('editId').value = '';
    form.reset();
    document.getElementById('iconInput').value = '📦';
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  });

  document.getElementById('closeModalBtn').addEventListener('click', () => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!isAdminAuthenticated()) return alert('เฉพาะแอดมินเท่านั้น');

    const editId = document.getElementById('editId').value;
    const data = {
      name: document.getElementById('nameInput').value.trim(),
      category: document.getElementById('categoryInput').value,
      icon: document.getElementById('iconInput').value.trim() || '📦',
      price: Number(document.getElementById('priceInput').value),
      oldPrice: document.getElementById('oldPriceInput').value ? Number(document.getElementById('oldPriceInput').value) : null,
      stock: Number(document.getElementById('stockInput').value),
      promo: document.getElementById('promoInput').value.trim() || null,
    };

    if (editId) {
      const idx = products.findIndex((p) => p.id === Number(editId));
      if (idx !== -1) products[idx] = { ...products[idx], ...data };
    } else {
      const nextId = products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
      products.unshift({ id: nextId, ...data });
    }

    saveProducts(products);
    renderAdminDashboard();
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  });

  document.getElementById('adminSearchInput').addEventListener('input', () => renderAdminDashboard());
  document.getElementById('adminCategoryFilter').addEventListener('change', () => renderAdminDashboard());

  document.getElementById('resetDefaultBtn').addEventListener('click', () => {
    if (confirm('รีเซ็ตข้อมูลสินค้ากลับเป็นค่าเริ่มต้น?')) {
      products = [...defaultProducts];
      saveProducts(products);
      renderAdminDashboard();
    }
  });
}