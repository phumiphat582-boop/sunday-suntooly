import './style.css';

let currentCategory = 'all';
const productGrid = document.getElementById('productGrid');
const categoryBtns = document.querySelectorAll('#categoryContainer .cat-btn');

function enterCategory(category) {
  currentCategory = category;

  categoryBtns.forEach((btn) => {
    const isSelected = btn.dataset.cat === category;
    btn.classList.toggle('active', isSelected);
    btn.classList.toggle('bg-[#008060]', isSelected);
    btn.classList.toggle('text-white', isSelected);
    btn.classList.toggle('bg-gray-100', !isSelected);
    btn.classList.toggle('hover:bg-gray-200', !isSelected);
    btn.classList.toggle('text-gray-700', !isSelected);
  });

  // 🔴 3. กรองเฉพาะสินค้าหมวดอาหารพร้อมทาน ('food') เมื่อไม่ได้เลือก 'all'
  const itemsToShow =
    currentCategory === 'all'
      ? products
      : products.filter((product) => product.category === currentCategory);

  productGrid.innerHTML = itemsToShow
    .map(
      (item) => `
      <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between">
        <div class="text-5xl text-center my-3">${item.icon}</div>
        <div>
          <h3 class="font-bold text-gray-800 text-sm line-clamp-2">${item.name}</h3>
          <p class="text-[#008060] font-extrabold text-base mt-1">฿${item.price}</p>
          <p class="text-xs text-gray-400 mt-0.5">คงเหลือ ${item.stock} ชิ้น</p>
        </div>
      </div>
    `
    )
    .join('');
}

// 🔴 4. ผูกคลิกปุ่มหมวดหมู่ทั้งหมด (เมื่อคลิก [🍱 อาหารพร้อมทาน] จะส่งค่า 'food')
categoryBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    enterCategory(btn.dataset.cat);
  });
});

// 🔴 5. ถ้าต้องการให้เปิดหน้าเว็บมาแล้ว "เข้าหมวดอาหารพร้อมทาน" ทันที ให้ใช้ enterCategory('food')
enterCategory('all');

// 1. จำลองฐานข้อมูลสินค้า/พัสดุ (ในอนาคตสามารถเปลี่ยนไปดึงจาก API หรือ Firebase/Supabase ได้)
const mockDatabase = {
  TH1001: {
    productName: 'คีย์บอร์ดไร้สาย Mechanical',
    customer: 'คุณสมชาย ใจดี',
    status: 'กำลังจัดส่ง',
    statusColor: 'text-yellow-600 bg-yellow-100',
    timeline: [
      { time: '17 พ.ย. 2026 - 14:30', detail: 'พนักงานกำลังนำส่งพัสดุถึงปลายทาง' },
      { time: '17 พ.ย. 2026 - 08:15', detail: 'พัสดุถึงศูนย์คัดแยก กรุงเทพฯ' },
      { time: '16 พ.ย. 2026 - 18:00', detail: 'ผู้ส่งมอบพัสดุให้บริษัทขนส่งเรียบร้อย' },
    ],
  },
  TH1002: {
    productName: 'เมาส์เกมมิ่งไร้สาย',
    customer: 'คุณสมหญิง รักเรียน',
    status: 'จัดส่งสำเร็จ',
    statusColor: 'text-green-600 bg-green-100',
    timeline: [
      { time: '16 พ.ย. 2026 - 11:20', detail: 'จัดส่งสำเร็จ (ผู้รับเซ็นรับเรียบร้อย)' },
      { time: '16 พ.ย. 2026 - 09:00', detail: 'พนักงานกำลังนำส่งพัสดุ' },
    ],
  },
};

// 2. ดึง Element จากหน้า HTML
const form = document.getElementById('track-form');
const input = document.getElementById('tracking-input');
const resultBox = document.getElementById('result-box');

// 3. ดักจับเหตุการณ์เมื่อกดปุ่มค้นหา
form.addEventListener('submit', (e) => {
  e.preventDefault(); // ป้องกันหน้าเว็บรีเฟรช

  const trackingNumber = input.value.trim().toUpperCase();
  const data = mockDatabase[trackingNumber];

  resultBox.classList.remove('hidden');

  if (data) {
    // กรณีพบข้อมูลสินค้า
    const timelineHTML = data.timeline
      .map(
        (item) => `
        <li class="mb-3 ml-4">
          <div class="w-2 h-2 bg-blue-600 rounded-full -left-1.5 mt-1.5 absolute"></div>
          <p class="text-xs text-gray-500">${item.time}</p>
          <p class="text-sm text-gray-800">${item.detail}</p>
        </li>
      `
      )
      .join('');

    resultBox.innerHTML = `
      <div class="flex justify-between items-center mb-3">
        <div>
          <p class="text-sm text-gray-500">รหัสพัสดุ: <span class="font-bold text-gray-800">${trackingNumber}</span></p>
          <p class="font-semibold text-gray-800">${data.productName}</p>
        </div>
        <span class="px-3 py-1 rounded-full text-xs font-semibold ${data.statusColor}">
          ${data.status}
        </span>
      </div>
      <p class="text-sm text-gray-600 mb-4">ผู้รับ: ${data.customer}</p>
      
      <h3 class="text-sm font-bold text-gray-700 mb-2">ประวัติการจัดส่ง:</h3>
      <ul class="relative border-l border-gray-300 ml-2">
        ${timelineHTML}
      </ul>
    `;
  } else {
    // กรณีไม่พบข้อมูล
    resultBox.innerHTML = `
      <div class="text-center py-4 text-red-500">
        ❌ ไม่พบข้อมูลรหัสพัสดุ <strong>"${trackingNumber}"</strong> <br/>
        <span class="text-xs text-gray-500">ลองทดสอบพิมพ์ TH1001 หรือ TH1002</span>
      </div>
    `;
  }
});