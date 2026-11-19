import './style.css'

// ตั้งค่าบัญชีแอดมิน
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin123';
const STORAGE_KEY = 'sunday_suntooly_products';

// ข้อมูลเริ่มต้น (เผื่อกดปุ่มรีเซ็ต)
const defaultProducts = [
  { id: 1, name: 'ข้าวผัดปู กล่องพร้อมทาน', category: 'food', price: 45, oldPrice: 55, stock: 8, promo: 'ลดราคา', icon: '🍱' },
  { id: 2, name: 'แซนวิชแฮมชีส อบร้อน', category: 'food', price: 29, oldPrice: null, stock: 12, promo: 'ขายดี', icon: '🥪' },
  { id: 3, name: 'ชาเขียวรสน้ำผึ้งมะนาว 500มล.', category: 'drink', price: 20, oldPrice: 25, stock: 3, promo: '1 แถม 1', icon: '🍵' },
  { id: 4, name: 'กาแฟเอสเปรสโซ่เย็น แก้วใหญ่', category: 'drink', price: 35, oldPrice: null, stock: 15, promo: null, icon: '🧋' },
  { id: 5, name: 'มันฝรั่งทอดกรอบ รสออริจินัล', category: 'snack', price: 30, oldPrice: null, stock: 20, promo: null, icon: '🥔' },
  { id: 6, name: 'ช็อกโกแลตบาร์ อัลมอนด์', category: 'snack', price: 25, oldPrice: 32, stock: 0, promo: 'ลดพิเศษ', icon: '🍫' },
  { id: 7, name: 'ทิชชู่เปียก สูตรอ่อนโยน', category: 'daily', price: 19, oldPrice: null, stock: 10, promo: null, icon: '🧻' },
  { id: 8, name: 'เจลล้างมือแอลกอฮอล์ 75%', category: 'daily', price: 39, oldPrice: 49, stock: 4, promo: 'ใกล้หมด', icon: '🧴' },
];

let products = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [...defaultProducts];

// แปลงรหัสหมวดหมู่เป็นชื่อภาษาไทย
const categoryLabels = {
  food: '🍱 อาหารพร้อมทาน',
  drink: '🥤 เครื่องดื่ม',
  snack: '🍿 ขนมขบเคี้ยว',
  daily: '🧴 ของใช้ส่วนตัว'
};

// 1. ระบบตรวจสอบการล็อกอิน (ใช้ sessionStorage เพื่อจำสถานะระหว่างเปิดแท็บ)
const loginScreen = document.getElementById('loginScreen');
const dashboardScreen = document.getElementById('dashboardScreen');

function checkAuth() {
  const isLoggedIn = sessionStorage.getItem('sunday_admin_logged_in') === 'true';
  if (isLoggedIn) {
    loginScreen.classList.add('hidden');
    dashboardScreen.classList.remove('hidden');
    renderDashboard();
  } else {
    loginScreen.classList.remove('hidden');
    dashboardScreen.classList.add('hidden');
  }
}

document.getElementById('adminLoginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const user = document.getElementById('usernameInput').value.trim();
  const pass = document.getElementById('passwordInput').value;

  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    sessionStorage.setItem('sunday_admin_logged_in', 'true');
    checkAuth();
  } else {
    alert('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง!');
  }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  sessionStorage.removeItem('sunday_admin_logged_in');
  checkAuth();
});

// 2. บันทึกและอัปเดตข้อมูล
function saveAndRefresh() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  renderDashboard();
}

function updateStats() {
  document.getElementById('statTotalProducts').textContent = products.length;
  document.getElementById('statTotalStock').textContent = products.reduce((sum, p) => sum + p.stock, 0);
  document.getElementById('statLowStock').textContent = products.filter(p => p.stock > 0 && p.stock <= 5).length;
  document.getElementById('statOutOfStock').textContent = products.filter(p => p.stock === 0).length;
}

// 3. แสดงตารางสินค้าในหน้าแอดมิน
function renderDashboard() {
  updateStats();

  const keyword = document.getElementById('adminSearchInput').value.toLowerCase().trim();
  const catFilter = document.getElementById('adminCategoryFilter').value;

  const filtered = products.filter(p => {
    const matchName = p.name.toLowerCase().includes(keyword);
    const matchCat = catFilter === 'all' || p.category === catFilter;
    return matchName && matchCat;
  });

  const tbody = document.getElementById('adminTableBody');
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-gray-400">ไม่พบรายการสินค้า</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(item => `
    <tr class="hover:bg-gray-50">
      <td class="py-3 px-4 flex items-center gap-3">
        <span class="text-2xl bg-gray-100 w-10 h-10 flex items-center justify-center rounded-lg">${item.icon}</span>
        <span class="font-semibold text-gray-800">${item.name}</span>
      </td>
      <td class="py-3 px-4 text-xs text-gray-600">${categoryLabels[item.category] || item.category}</td>
      <td class="py-3 px-4">
        <!-- ปรับราคาด่วนในตารางได้เลย -->
        <input 
          type="number" 
          value="${item.price}" 
          min="1"
          onchange="quickUpdatePrice(${item.id}, this.value)"
          class="w-20 border rounded px-2 py-1 font-bold text-[#008060] focus:ring-2 focus:ring-[#008060] outline-none"
        />
      </td>
      <td class="py-3 px-4 text-gray-400 text-xs">${item.oldPrice ? `฿${item.oldPrice}` : '-'}</td>
      <td class="py-3 px-4">
        <!-- ปุ่มเพิ่ม/ลดสต็อกด่วน -->
        <div class="flex items-center gap-1.5">
          <button onclick="quickUpdateStock(${item.id}, -1)" class="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded font-bold text-gray-700">-</button>
          <span class="w-8 text-center font-bold ${item.stock === 0 ? 'text-red-600' : item.stock <= 5 ? 'text-orange-500' : 'text-gray-800'}">
            ${item.stock}
          </span>
          <button onclick="quickUpdateStock(${item.id}, 1)" class="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded font-bold text-gray-700">+</button>
        </div>
      </td>
      <td class="py-3 px-4">
        ${item.promo ? `<span class="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded">${item.promo}</span>` : '<span class="text-gray-300">-</span>'}
      </td>
      <td class="py-3 px-4 text-right space-x-1">
        <button onclick="openEditModal(${item.id})" class="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-2.5 py-1 rounded text-xs font-bold">
          แก้ไข
        </button>
        <button onclick="deleteItem(${item.id})" class="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded text-xs font-bold">
          ลบ
        </button>
      </td>
    </tr>
  `).join('');
}

// 4. ฟังก์ชันปรับราคาและสต็อกแบบด่วนในตาราง
window.quickUpdatePrice = function(id, newPrice) {
  const price = Number(newPrice);
  if (price <= 0) return alert('ราคาต้องมากกว่า 0 บาท');
  const product = products.find(p => p.id === id);
  if (product) {
    product.price = price;
    saveAndRefresh();
  }
};

window.quickUpdateStock = function(id, delta) {
  const product = products.find(p => p.id === id);
  if (product) {
    product.stock = Math.max(0, product.stock + delta);
    saveAndRefresh();
  }
};

window.deleteItem = function(id) {
  if (confirm('ยืนยันการลบสินค้ารายการนี้?')) {
    products = products.filter(p => p.id !== id);
    saveAndRefresh();
  }
};

// 5. จัดการ Modal เพิ่ม / แก้ไขข้อมูลเต็มรูปแบบ
const productModal = document.getElementById('productModal');
const productForm = document.getElementById('productForm');

document.getElementById('addProductBtn').addEventListener('click', () => {
  document.getElementById('modalTitle').textContent = '+ เพิ่มสินค้าใหม่';
  document.getElementById('editId').value = '';
  productForm.reset();
  document.getElementById('iconInput').value = '📦';
  productModal.classList.remove('hidden');
  productModal.classList.add('flex');
});

window.openEditModal = function(id) {
  const p = products.find(item => item.id === id);
  if (!p) return;

  document.getElementById('modalTitle').textContent = '✏️ แก้ไขรายละเอียดสินค้า';
  document.getElementById('editId').value = p.id;
  document.getElementById('nameInput').value = p.name;
  document.getElementById('categoryInput').value = p.category;
  document.getElementById('iconInput').value = p.icon;
  document.getElementById('priceInput').value = p.price;
  document.getElementById('oldPriceInput').value = p.oldPrice || '';
  document.getElementById('stockInput').value = p.stock;
  document.getElementById('promoInput').value = p.promo || '';

  productModal.classList.remove('hidden');
  productModal.classList.add('flex');
};

document.getElementById('closeModalBtn').addEventListener('click', () => {
  productModal.classList.add('hidden');
  productModal.classList.remove('flex');
});

productForm.addEventListener('submit', (e) => {
  e.preventDefault();
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
    const idx = products.findIndex(p => p.id === Number(editId));
    if (idx !== -1) products[idx] = { ...products[idx], ...data };
  } else {
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    products.unshift({ id: newId, ...data });
  }

  saveAndRefresh();
  productModal.classList.add('hidden');
  productModal.classList.remove('flex');
});

// Event Listeners อื่นๆ
document.getElementById('adminSearchInput').addEventListener('input', renderDashboard);
document.getElementById('adminCategoryFilter').addEventListener('change', renderDashboard);

document.getElementById('resetDefaultBtn').addEventListener('click', () => {
  if (confirm('ต้องการรีเซ็ตรายการสินค้าทั้งหมดกลับเป็นค่าเริ่มต้นใช่หรือไม่?')) {
    products = [...defaultProducts];
    saveAndRefresh();
  }
});

// เริ่มต้นตรวจสอบสิทธิ์
checkAuth();