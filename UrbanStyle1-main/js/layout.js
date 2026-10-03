(function () {
  function buildHeader() {
    return `
      <header>
        <nav class="navbar-custom">
          <div class="logo">
            <a href="../View/Inicio.html" aria-label="UrbanStyle inicio">
              <img src="../Image/favicon-urbanstyle.svg" width="48" height="48" alt="Logo UrbanStyle">
            </a>
          </div>
          
          <button class="hamburger-btn" id="hamburgerBtn" type="button" aria-label="Abrir menú" aria-expanded="false">
            <span></span><span></span><span></span>
          </button>
          <ul class="nav-links" id="navLinks">
            <li><a href="../View/Inicio.html">Inicio</a></li>
            <li><a href="../View/Inicio.html#categorias">Explora</a></li>
            <li><a href="../View/Inicio.html#productos">Shop</a></li>
            <li><a href="../View/blog.html">Blog</a></li>
            <li><a href="../View/nosotros.html">Nosotros</a></li>
            <li><a href="../View/contacto.html">Contacto</a></li>
            <li data-admin-item="true" style="display:none;"><a href="../View/admin_crearProductos.html">Crear productos</a></li>
            <li data-admin-orders-item="true" style="display:none;"><a href="../View/admin_compras.html">Compras</a></li>
            <li><a href="../View/Login.html">Cuenta</a></li>
            <li class="nav-item-cart"><a href="../View/Carrito.html">Bolsa <span id="cartBadge" class="cart-badge">0</span></a></li>
          </ul>
        </nav>
      </header>
    `;
  }

  function buildFooter() {
    return `
      <footer class="bg-dark text-white text-center py-4 mt-5">
        <p class="mb-0">&copy; 2026 UrbanStyle. Todos los derechos reservados.</p>
      </footer>
    `;
  }

  function renderLayout() {
    const sharedHeader = document.getElementById('sharedHeader');
    const sharedFooter = document.getElementById('sharedFooter');

    if (sharedHeader) {
      sharedHeader.innerHTML = buildHeader();
    }

    if (sharedFooter) {
      sharedFooter.innerHTML = buildFooter();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderLayout);
  } else {
    renderLayout();
  }
})();
