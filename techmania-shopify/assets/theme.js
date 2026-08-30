/* TechMania Shopify Theme JS */

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Menu Toggle
  const mobileMenuBtn = document.querySelector('[data-mobile-menu-btn]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // Cart Drawer Toggle
  const cartBtns = document.querySelectorAll('[data-cart-drawer-trigger]');
  const cartOverlay = document.querySelector('[data-cart-overlay]');
  const cartDrawer = document.querySelector('[data-cart-drawer]');
  const closeCartBtn = document.querySelector('[data-cart-close]');

  function openCart() {
    if (cartOverlay) cartOverlay.classList.add('active');
    if (cartDrawer) cartDrawer.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    if (cartOverlay) cartOverlay.classList.remove('active');
    if (cartDrawer) cartDrawer.classList.remove('active');
    document.body.style.overflow = '';
  }

  cartBtns.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    openCart();
  }));

  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // Tab Filtering on Homepage
  const tabBtns = document.querySelectorAll('[data-product-tab]');
  const tabGrids = document.querySelectorAll('[data-tab-content]');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-product-tab');

      tabBtns.forEach(b => {
        b.classList.remove('bg-black', 'text-white');
        b.classList.add('bg-gray-100', 'text-gray-700');
      });

      btn.classList.remove('bg-gray-100', 'text-gray-700');
      btn.classList.add('bg-black', 'text-white');

      tabGrids.forEach(grid => {
        if (grid.getAttribute('data-tab-content') === targetTab) {
          grid.classList.remove('hidden');
        } else {
          grid.classList.add('hidden');
        }
      });
    });
  });

  // Variant Option Selector for Product Page
  const variantRadios = document.querySelectorAll('[data-variant-radio]');
  variantRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      const selectedVariantId = radio.value;
      const variantInput = document.querySelector('[name="id"]');
      if (variantInput) {
        variantInput.value = selectedVariantId;
      }
    });
  });
});
