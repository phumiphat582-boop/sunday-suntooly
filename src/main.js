import './style.css';
import { renderHome } from './home.js';
import {
  isAdminAuthenticated,
  logoutAdmin,
  renderAdminDashboard,
  renderAdminLogin,
} from './admin.js';

const views = {
  home: document.getElementById('homeView'),
  adminLogin: document.getElementById('adminLoginView'),
  admin: document.getElementById('adminDashboardView'),
};

function resolveRoute(rawRoute) {
  if (!rawRoute || rawRoute === '/' || rawRoute === 'home') return 'home';
  if (rawRoute === 'admin' || rawRoute === 'admin-login') {
    return isAdminAuthenticated() ? 'admin' : 'admin-login';
  }
  return 'home';
}

export function navigate(rawRoute) {
  const page = resolveRoute(rawRoute);

  views.home.classList.add('hidden');
  views.adminLogin.classList.add('hidden');
  views.admin.classList.add('hidden');

  if (page === 'admin-login') {
    views.adminLogin.classList.remove('hidden');
    renderAdminLogin();
  } else if (page === 'admin') {
    views.admin.classList.remove('hidden');
    renderAdminDashboard(() => navigate('admin-login'));
  } else {
    views.home.classList.remove('hidden');
    renderHome();
  }

  const targetHash = `#/${page}`;
  if (window.location.hash !== targetHash) {
    window.location.hash = targetHash;
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Callback เมื่อล็อกอินแอดมินสำเร็จ
window.onAdminLoginSuccess = () => navigate('admin');

// ปุ่มนำทางระหว่าง Home และ Admin
document.getElementById('brandHomeBtn').addEventListener('click', () => navigate('home'));
document.getElementById('navGoHomeBtn').addEventListener('click', () => navigate('home'));
document.getElementById('loginBackHomeBtn').addEventListener('click', () => navigate('home'));
document.getElementById('navGoAdminBtn').addEventListener('click', () => navigate('admin'));

document.getElementById('adminLogoutBtn').addEventListener('click', () => {
  logoutAdmin();
  navigate('home');
});

// รองรับปุ่ม Back / Forward ของเบราว์เซอร์
window.addEventListener('hashchange', () => {
  const route = window.location.hash.replace(/^#\/?/, '');
  navigate(route);
});

// เริ่มต้นหน้าแรกตาม Hash ปัจจุบัน
const startRoute = window.location.hash.replace(/^#\/?/, '') || 'home';
navigate(startRoute);