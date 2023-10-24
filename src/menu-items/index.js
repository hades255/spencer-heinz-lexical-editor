// project import
import other from './other';
import pages from './pages';
import admin from './admin';

// ==============================|| MENU ITEMS ||============================== //

const menuItems = {
  items: [pages, other]
};

export const menuItemsWithRole = (role) => {
  if (role === 'admin' || role === 'super admin') return { items: [pages, other, admin] };
  return menuItems;
};

export default menuItems;
