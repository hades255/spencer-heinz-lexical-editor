// project import
import pages from './pages';
import admin from './admin';
import superadmin from './super';

// ==============================|| MENU ITEMS ||============================== //

const menuItems = {
  items: [pages]
};

export const menuItemsWithRole = (role) => {
  if (role === 'admin') return { items: [pages, admin] };
  if (role === 'super admin') return { items: [pages, admin, superadmin] };
  return menuItems;
};

export default menuItems;
