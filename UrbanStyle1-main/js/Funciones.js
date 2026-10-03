/**
 * Valida de forma genérica que cualquier control no esté vacío o en posición 0.
 * @param {HTMLElement} controlElement - El elemento HTML que dispara el evento (this)
 * @returns {boolean} - Devuelve true si el campo es válido, false en caso contrario.
 */

function obtenerUsuariosHardcodeados() {
  return {
    'admin@urbanstyle.cl': {
      password: 'Admin123',
      rol: 'admin'
    },
    'cliente@gmail.com': {
      password: 'Cliente123',
      rol: 'cliente'
    }
  };
}

function redirigirSegunRol(correo) {
  const usuariosPermitidos = obtenerUsuariosHardcodeados();
  const rol = usuariosPermitidos[correo] ? usuariosPermitidos[correo].rol : 'cliente';

  const redirectTo = localStorage.getItem('urbanstyleRedirectAfterLogin');
  const destino = rol === 'admin'
    ? '../View/admin_crearProductos.html'
    : (redirectTo || '../View/Inicio.html');

  localStorage.removeItem('urbanstyleRedirectAfterLogin');
  window.location.href = destino;
  return destino;
}

function getCurrentUser() {
  try {
    const usuario = JSON.parse(localStorage.getItem('urbanstyleUsuario') || 'null');
    return usuario && typeof usuario === 'object' ? usuario : null;
  } catch (error) {
    console.error('No se pudo leer la sesión del usuario:', error);
    return null;
  }
}

function cerrarSesion() {
  localStorage.removeItem('urbanstyleUsuario');
  window.location.href = '../View/Inicio.html';
}

function actualizarNavSesion() {
  const usuario = getCurrentUser();
  const navLists = document.querySelectorAll('.nav-links');

  navLists.forEach(navList => {
    let accountItem = navList.querySelector('a[href="../View/Login.html"]')?.closest('li');

    if (!accountItem) {
      accountItem = navList.querySelector('a[href="Login.html"]')?.closest('li');
    }

    if (!accountItem) {
      accountItem = navList.querySelector('a[href="./Login.html"]')?.closest('li');
    }

    let adminItem = navList.querySelector('[data-admin-item="true"]');
    if (!adminItem) {
      adminItem = document.createElement('li');
      adminItem.setAttribute('data-admin-item', 'true');
      adminItem.style.display = 'none';
      const adminLink = document.createElement('a');
      adminLink.href = '../View/admin_crearProductos.html';
      adminLink.textContent = 'Crear productos';
      adminItem.appendChild(adminLink);
      navList.appendChild(adminItem);
    }

    let adminOrdersItem = navList.querySelector('[data-admin-orders-item="true"]');
    if (!adminOrdersItem) {
      adminOrdersItem = document.createElement('li');
      adminOrdersItem.setAttribute('data-admin-orders-item', 'true');
      adminOrdersItem.style.display = 'none';
      const ordersLink = document.createElement('a');
      ordersLink.href = '../View/admin_compras.html';
      ordersLink.textContent = 'Compras';
      adminOrdersItem.appendChild(ordersLink);
      navList.appendChild(adminOrdersItem);
    }

    if (!usuario) {
      if (accountItem) {
        accountItem.style.display = 'list-item';
        const link = accountItem.querySelector('a');
        if (link) {
          link.textContent = 'Cuenta';
          link.setAttribute('href', '../View/Login.html');
          link.removeAttribute('data-logout');
          link.onclick = null;
        }
      }

      adminItem.style.display = 'none';
      adminOrdersItem.style.display = 'none';

      let registerItem = navList.querySelector('[data-register-item="true"]');
      if (!registerItem) {
        registerItem = document.createElement('li');
        registerItem.setAttribute('data-register-item', 'true');
        const registerLink = document.createElement('a');
        registerLink.href = '../View/registroUsuario.html';
        registerLink.textContent = 'Registrar';
        registerItem.appendChild(registerLink);
        navList.appendChild(registerItem);
      } else {
        registerItem.style.display = 'list-item';
      }
      return;
    }

    if (accountItem) {
      accountItem.style.display = 'none';
    }

    adminItem.style.display = usuario.rol === 'admin' ? 'list-item' : 'none';
    adminOrdersItem.style.display = usuario.rol === 'admin' ? 'list-item' : 'none';

    const registerItem = navList.querySelector('[data-register-item="true"]');
    if (registerItem) {
      registerItem.style.display = 'none';
    }

    let logoutItem = navList.querySelector('[data-logout-item="true"]');
    if (!logoutItem) {
      logoutItem = document.createElement('li');
      logoutItem.setAttribute('data-logout-item', 'true');
      const logoutLink = document.createElement('a');
      logoutLink.href = '#';
      logoutLink.textContent = 'Cerrar sesión';
      logoutLink.addEventListener('click', function (event) {
        event.preventDefault();
        cerrarSesion();
      });
      logoutItem.appendChild(logoutLink);
      navList.appendChild(logoutItem);
    } else {
      logoutItem.style.display = 'list-item';
    }
  });
}

function guardarUsuario(event) {
  if (event && typeof event.preventDefault === 'function') {
    event.preventDefault();
  }

  const correoInput = document.getElementById('correo');
  const contrasenaInput = document.getElementById('contrasena');
  const nombreInput = document.getElementById('nombre');
  const telefonoInput = document.getElementById('telefono');
  const selectRegion = document.getElementById('selectRegion');
  const selectComuna = document.getElementById('comuna');

  const esRegistro = Boolean(nombreInput || telefonoInput || selectRegion || selectComuna);

  if (esRegistro) {
    if (!correoInput || !validaControl(correoInput)) {
      return false;
    }

    const nombre = nombreInput ? nombreInput.value.trim() : '';
    const correo = correoInput.value.trim().toLowerCase();
    const telefono = telefonoInput ? telefonoInput.value.trim() : '';
    const region = selectRegion ? selectRegion.value.trim() : '';
    const comuna = selectComuna ? selectComuna.value.trim() : '';

    if (!nombre || !telefono || !region || !comuna) {
      const nombreValido = nombreInput ? validaControl(nombreInput) : true;
      const telefonoValido = telefonoInput ? validaControl(telefonoInput) : true;
      const regionValida = selectRegion ? validaControl(selectRegion) : true;
      const comunaValida = selectComuna ? validaControl(selectComuna) : true;

      return nombreValido && telefonoValido && regionValida && comunaValida;
    }

    const regexCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (correo && !regexCorreo.test(correo)) {
      const errorCorreo = document.getElementById('errorCorreo');
      if (errorCorreo) {
        errorCorreo.innerHTML = '* Formato inválido (Ej: usuario@dominio.com)';
        errorCorreo.style.color = 'red';
      }
      return false;
    }

    const usuarioRegistrado = {
      email: correo,
      nombre,
      telefono,
      region,
      comuna,
      rol: 'cliente'
    };

    localStorage.setItem('urbanstyleUsuario', JSON.stringify(usuarioRegistrado));
    mostrarAlerta('Registro exitoso', 'Tu cuenta fue creada como cliente.', 'success');
    window.location.href = '../View/Inicio.html';
    return true;
  }

  if (!correoInput || !contrasenaInput) {
    return false;
  }

  const correo = correoInput.value.trim().toLowerCase();
  const contrasena = contrasenaInput.value.trim();

  const errores = {
    correo: document.getElementById('errorCorreo'),
    contrasena: document.getElementById('errorContrasena')
  };

  Object.values(errores).forEach(elemento => {
    if (elemento) {
      elemento.innerHTML = '';
      elemento.style.color = 'red';
    }
  });

  let formularioValido = true;

  if (!validaControl(correoInput)) {
    formularioValido = false;
  }

  if (!validaControl(contrasenaInput)) {
    formularioValido = false;
  }

  const regexCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (correo && !regexCorreo.test(correo)) {
    if (errores.correo) {
      errores.correo.innerHTML = '* Formato inválido (Ej: usuario@dominio.com)';
    }
    formularioValido = false;
  }

  const regexPass = /^([a-zA-Z0-9!@#\$%\^&,.]{6,50})$/;
  if (contrasena && !regexPass.test(contrasena)) {
    if (errores.contrasena) {
      errores.contrasena.innerHTML = '* Uno o mas datos son incorrectos';
    }
    formularioValido = false;
  }

  if (!formularioValido) {
    return false;
  }

  const usuariosPermitidos = obtenerUsuariosHardcodeados();

  if (!usuariosPermitidos[correo]) {
    if (errores.correo) {
      errores.correo.innerHTML = '* Este usuario no está autorizado';
    }
    return false;
  }

  if (usuariosPermitidos[correo].password !== contrasena) {
    if (errores.contrasena) {
      errores.contrasena.innerHTML = '* Uno o mas datos son incorrectos';
    }
    return false;
  }

  localStorage.setItem('urbanstyleUsuario', JSON.stringify({
    email: correo,
    rol: usuariosPermitidos[correo].rol
  }));

  redirigirSegunRol(correo);
  return true;
}

function volverDesdeLogin() {
  limpiarFormularioUsuario();

  if (window.history.length > 1) {
    window.history.back();
    return;
  }

  window.location.href = '../View/Inicio.html';
}

function limpiarFormularioUsuario() {
  const nombreInput = document.getElementById('nombre');
  const correoInput = document.getElementById('correo');
  const contrasenaInput = document.getElementById('contrasena');
  const telefonoInput = document.getElementById('telefono');
  const selectRegion = document.getElementById('selectRegion');
  const selectComuna = document.getElementById('comuna');

  if (nombreInput) {
    nombreInput.value = '';
    nombreInput.classList.remove('is-invalid');
  }

  if (correoInput) {
    correoInput.value = '';
    correoInput.classList.remove('is-invalid');
  }

  if (contrasenaInput) {
    contrasenaInput.value = '';
    contrasenaInput.classList.remove('is-invalid');
  }

  if (telefonoInput) {
    telefonoInput.value = '';
    telefonoInput.classList.remove('is-invalid');
  }

  if (selectRegion) {
    selectRegion.value = '';
    selectRegion.classList.remove('is-invalid');
  }

  if (selectComuna) {
    selectComuna.value = '';
    selectComuna.disabled = true;
    selectComuna.innerHTML = '<option value=""> Selecciona primero la Region </option>';
    selectComuna.classList.remove('is-invalid');
  }

  const errorCorreo = document.getElementById('errorCorreo');
  const errorContrasena = document.getElementById('errorContrasena');
  const errorMensajes = document.querySelectorAll('.error-mensaje');

  if (errorCorreo) errorCorreo.innerHTML = '';
  if (errorContrasena) errorContrasena.innerHTML = '';

  errorMensajes.forEach(item => {
    item.innerHTML = '';
  });
}

function cancelarRegistroUsuario() {
  limpiarFormularioUsuario();
  window.location.href = '../View/Inicio.html';
}

// Estructura de datos de Regiones y Comunas de Chile
const regionesYComunas = {
  "Arica y Parinacota": ["Arica", "Camarones", "Putre", "General Lagos"],
  "Tarapacá": ["Iquique", "Alto Hospicio", "Pozo Almonte", "Camiña", "Colchane", "Huara", "Pica"],
  "Antofagasta": ["Antofagasta", "Mejillones", "Sierra Gorda", "Taltal", "Calama", "Ollagüe", "San Pedro de Atacama", "Tocopilla", "María Elena"],
  "Atacama": ["Copiapó", "Caldera", "Tierra Amarilla", "Chañaral", "Diego de Almagro", "Vallenar", "Alto del Carmen", "Freirina", "Huasco"],
  "Coquimbo": ["La Serena", "Coquimbo", "Andacollo", "La Higuera", "Paiguano", "Vicuña", "Illapel", "Canela", "Los Vilos", "Salamanca", "Ovalle", "Combarbalá", "Monte Patria", "Punitaqui", "Río Hurtado"],
  "Valparaíso": ["Valparaíso", "Casablanca", "Concón", "Juan Fernández", "Puchuncaví", "Quintero", "Viña del Mar", "Isla de Pascua", "Los Andes", "Calle Larga", "Rinconada", "San Esteban", "La Ligua", "Cabildo", "Papudo", "Petorca", "Zapallar", "Quillota", "Calera", "Hijuelas", "La Cruz", "Nogales", "San Antonio", "Algarrobo", "El Quisco", "El Tabo", "Santo Domingo", "San Felipe", "Catemu", "Llaillay", "Panquehue", "Putaendo", "Santa María", "Quilpué", "Limache", "Olmué", "Villa Alemana"],
  "Región Metropolitana de Santiago": ["Cerrillos", "Cerro Navia", "Conchalí", "El Bosque", "Estación Central", "Huechuraba", "Independencia", "La Cisterna", "La Florida", "La Granja", "La Pintana", "La Reina", "Las Condes", "Lo Barnechea", "Lo Espejo", "Lo Prado", "Macul", "Maipú", "Ñuñoa", "Pedro Aguirre Cerda", "Peñalolén", "Providencia", "Pudahuel", "Quilicura", "Quinta Normal", "Recoleta", "Renca", "San Joaquín", "San Miguel", "San Ramón", "Santiago", "Vitacura", "Puente Alto", "Pirque", "San José de Maipo", "Colina", "Lampa", "Tiltil", "San Bernardo", "Buin", "Calera de Tango", "Paine", "Melipilla", "Alhué", "Curacaví", "María Pinto", "San Pedro", "Talagante", "El Monte", "Isla de Maipo", "Padre Hurtado", "Peñaflor"],
  "O'Higgins": ["Rancagua", "Codegua", "Coinco", "Coltauco", "Doñihue", "Graneros", "Las Cabras", "Machalí", "Malloa", "Mostazal", "Olivar", "Peumo", "Pichidegua", "Quinta de Tilcoco", "Rengo", "Requínoa", "San Vicente", "Pichilemu", "La Estrella", "Litueche", "Marchigüe", "Navidad", "Paredones", "San Fernando", "Chépica", "Chimbarongo", "Lolol", "Nancagua", "Palmilla", "Peralillo", "Placilla", "Pumanque", "Santa Cruz"],
  "Maule": ["Talca", "Constitución", "Curepto", "Empedrado", "Maule", "Pelarco", "Pencahue", "Río Claro", "San Clemente", "San Rafael", "Cauquenes", "Chanco", "Pelluhue", "Curicó", "Hualañé", "Licantén", "Molina", "Rauco", "Romeral", "Sagrada Familia", "Teno", "Vichuquén", "Linares", "Colbún", "Longaví", "Parral", "Retiro", "San Javier", "Villa Alegre", "Yerbas Buenas"],
  "Ñuble": ["Chillán", "Bulnes", "Chillán Viejo", "El Carmen", "Pemuco", "Pinto", "Quillón", "San Ignacio", "Yungay", "Quirihue", "Cobquecura", "Coelemu", "Ninhue", "Portezuelo", "Ranquil", "Treguaco", "San Carlos", "Coihueco", "San Fabián", "San Nicolás"],
  "Bío Bío": ["Concepción", "Coronel", "Chiguayante", "Florida", "San Pedro de la Paz", "Santa Juana", "Lota", "Penco", "Tomé", "Hualqui", "Talcahuano", "Hualpén", "Lebu", "Arauco", "Cañete", "Contulmo", "Curanilahue", "Los Álamos", "Tirúa", "Los Ángeles", "Antuco", "Cabrero", "Laja", "Mulchén", "Nacimiento", "Negrete", "Quilaco", "Quilleco", "San Rosendo", "Santa Bárbara", "Tucapel", "Yumbel", "Alto Bío Bío"],
  "La Araucanía": ["Temuco", "Carahue", "Cunco", "Curarrehue", "Freire", "Galvarino", "Gorbea", "Lautaro", "Loncoche", "Melipeuco", "Nueva Imperial", "Padre Las Casas", "Perquenco", "Pitrufquén", "Pucón", "Saavedra", "Teodoro Schmidt", "Toltén", "Vilcún", "Villarrica", "Cholchol", "Angol", "Collipulli", "Curacautín", "Ercilla", "Lonquimay", "Los Sauces", "Lumaco", "Purén", "Renaico", "Traiguén", "Victoria"],
  "Los Ríos": ["Valdivia", "Corral", "Lanco", "Los Lagos", "Máfil", "Mariquina", "Paillaco", "Panguipulli", "La Unión", "Futrono", "Lago Ranco", "Río Bueno"],
  "Los Lagos": ["Puerto Montt", "Calbuco", "Cochamó", "Fresia", "Frutillar", "Los Muermos", "Llanquihue", "Maullín", "Puerto Varas", "Castro", "Ancud", "Chonchi", "Curaco de Vélez", "Dalcahue", "Puqueldón", "Queilén", "Quellón", "Quemchi", "Quinchao", "Osorno", "Puerto Octay", "Purranque", "Puyehue", "Río Negro", "San Juan de la Costa", "San Pablo", "Chaitén", "Futaleufú", "Hualaihué", "Palena"],
  "Aysén": ["Coyhaique", "Lago Verde", "Aysén", "Cisnes", "Guaitecas", "Cochrane", "O'Higgins", "Tortel", "Chile Chico", "Río Ibáñez"],
  "Magallanes y de la Antártica Chilena": ["Punta Arenas", "Laguna Blanca", "Río Verde", "San Gregorio", "Cabo de Hornos (Ex Navarino)", "Antártica", "Porvenir", "Primavera", "Timaukel", "Natales", "Torres del Paine"]
};

// Función para poblar el <select> de regiones
function cargaRegiones() {
  const selectRegion = document.getElementById("selectRegion");
  
  if (!selectRegion) return;

  // Si aún no se han cargado las opciones, las agregamos
  if (selectRegion.options.length <= 1) {
    Object.keys(regionesYComunas).forEach(region => {
      const option = document.createElement("option");
      option.value = region;
      option.textContent = region;
      selectRegion.appendChild(option);
    });
  }

  // Cargar las comunas de la región seleccionada
  cargarComunas();
}

// Función para actualizar las comunas según la región elegida
function cargarComunas() {
  const selectRegion = document.getElementById("selectRegion");
  const selectComuna = document.getElementById("comuna");

  if (!selectRegion || !selectComuna) return;

  const regionSeleccionada = selectRegion.value;

  // Reset del select de comuna
  selectComuna.innerHTML = '<option value=""> Selecciona una Comuna </option>';

  if (regionSeleccionada && regionesYComunas[regionSeleccionada]) {
    selectComuna.disabled = false;
    regionesYComunas[regionSeleccionada].forEach(comuna => {
      const option = document.createElement("option");
      option.value = comuna;
      option.textContent = comuna;
      selectComuna.appendChild(option);
    });
  } else {
    selectComuna.disabled = true;
    selectComuna.innerHTML = '<option value=""> Selecciona primero la Region </option>';
  }
}

// VALIDACIONES DE CAMPOS VACÍOS
function validaControl(controlElement) {
  const contenedor = controlElement.closest('.form-group');
  const spanError = contenedor ? contenedor.querySelector('.error-mensaje') : null;

  // Limpiar mensaje previo
  if (spanError) {
    spanError.innerHTML = '';
  }

  const valor = controlElement.value ? controlElement.value.trim() : "";

  // Validar si está vacío, es nulo o el valor por defecto es "0" / ""
  if (valor === "" || valor === "0") {
    if (spanError) {
      spanError.innerHTML = "* Este campo es obligatorio";
      spanError.style.color = "red";
    }
    controlElement.classList.add('is-invalid');
    return false;
  }

  // Si pasa la validación
  controlElement.classList.remove('is-invalid');
  return true;
}

// Algoritmo de verificación de RUT Chileno (Módulo 11)
function validarRut(rut, dv) {
  let suma = 0;
  let multiplicador = 2;

  for (let i = rut.length - 1; i >= 0; i--) {
    suma += parseInt(rut.charAt(i)) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const dvEsperado = 11 - (suma % 11);
  let dvCalculado = "";

  if (dvEsperado === 11) dvCalculado = "0";
  else if (dvEsperado === 10) dvCalculado = "K";
  else dvCalculado = dvEsperado.toString();

  return dvCalculado.toUpperCase() === dv.toUpperCase();
}

// VALIDA EL RUT
function ValidaRut(sender, args) {
  var rdoSi = $('#<%=rbtnSi.ClientID %>');
  var rutValor = args.Value ? args.Value.trim() : "";

  // 1. Validar que no esté vacío
  if (rutValor === "") {
    args.IsValid = false;
    sender.innerHTML = "* Este campo es obligatorio";
    sender.style.color = "red";
    return;
  }

  if (rdoSi.length === 0 || rdoSi.is(':checked')) {
    var fragmentoTexto = rutValor.split('-');
    
    if (fragmentoTexto.length === 2) {
      var rut = fragmentoTexto[0];
      var dv = fragmentoTexto[1];

      if (rut === "" || dv === "" || !validarRut(rut, dv)) {
        args.IsValid = false;
        sender.innerHTML = "* Debe ingresar un RUT válido (Ej: 19115934-9)";
        sender.style.color = "red";
        return;
      }
    } else {
      args.IsValid = false;
      sender.innerHTML = "* El RUT debe incluir guion y dígito verificador";
      sender.style.color = "red";
      return;
    }
  }
  args.IsValid = true;
}

// VALIDA PASS 
function ValidaPass(sender, args) {
  var passValor = args.Value ? args.Value.trim() : "";
  
  if (passValor === "") {
    args.IsValid = false;
    sender.innerHTML = "* Este campo es obligatorio";
    sender.style.color = "red";
    return;
  }

  var regex = /^([a-zA-Z0-9!@#\$%\^&,.]{6,50})$/;
  if (!regex.test(passValor)) {
    args.IsValid = false;
    sender.innerHTML = "* Uno o mas datos son incorrectos";
    sender.style.color = "red";
    return;
  }
  args.IsValid = true;
}

// VALIDA Y COMPARA QUE LA PASS SEA IGUAL
function ComparaPass(sender, args) {
  var confirmPassValor = args.Value ? args.Value.trim() : "";
  
  if (confirmPassValor === "") {
    args.IsValid = false;
    sender.innerHTML = "* Este campo es obligatorio";
    sender.style.color = "red";
    return;
  }

  var txtPassword = $('#<%=txtPassword.ClientID %>').val();
  if (txtPassword !== confirmPassValor) {
    args.IsValid = false;
    sender.innerHTML = "* Las contraseñas no coinciden";
    sender.style.color = "red";
    return;
  }
  args.IsValid = true;
}

// VALIDA EL CORREO ELECTRÓNICO
function validarCampoCorreo(inputElement) {
  const spanError = document.getElementById('errorCorreo');
  if (spanError) {
    spanError.innerHTML = '';
  }
  
  const args = {
    Value: inputElement.value,
    IsValid: true
  };

  ValidaEmailFormat(spanError, args);
}

function ValidaEmailFormat(sender, args) {
  var correoValor = args.Value ? args.Value.replace(/\s+/g, '') : "";

  if (correoValor === "") {
    args.IsValid = false;
    if (sender) {
      sender.innerHTML = "* Este campo es obligatorio";
      sender.style.color = "red";
    }
    return;
  }

  var regexCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!regexCorreo.test(correoValor)) {
    args.IsValid = false;
    if (sender) {
      sender.innerHTML = "* Formato inválido (Ej: usuario@dominio.com)";
      sender.style.color = "red";
    }
    if (typeof AlertSweet === 'function') {
      AlertSweet('Formato correo invalido', '', 'alerta');
    }
    return;
  }

  args.IsValid = true;
}

function mostrarAlerta(titulo, texto = '', tipo = 'info') {
  const toastContainerId = 'urbanstyleToastContainer';
  let toastContainer = document.getElementById(toastContainerId);

  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = toastContainerId;
    toastContainer.className = 'urbanstyle-toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'urbanstyle-toast';

  const toneMap = {
    alerta: '#f5c451',
    warning: '#f5c451',
    success: '#8fe388',
    error: '#ff6b6b',
    info: '#d9d9d9',
    question: '#d9d9d9'
  };

  const borderColor = toneMap[tipo] || '#d9d9d9';
  toast.style.borderLeft = `4px solid ${borderColor}`;

  const title = document.createElement('strong');
  title.textContent = titulo;

  const message = document.createElement('span');
  message.textContent = texto || '';

  const content = document.createElement('div');
  content.className = 'urbanstyle-toast-content';
  content.appendChild(title);

  if (texto) {
    content.appendChild(message);
  }

  toast.appendChild(content);
  toastContainer.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 250);
  }, 2800);
}

// INICIALIZACIÓN DE EVENTOS AL CARGAR EL DOM
document.addEventListener("DOMContentLoaded", function () {
  // Carga regiones
  cargaRegiones();

  // Escuchador para la hamburguesa del menú responsive
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const navLinks = document.getElementById("navLinks");

  if (hamburgerBtn && navLinks) {
    hamburgerBtn.addEventListener("click", function () {
      navLinks.classList.toggle("active");
    });
  }

  renderUrbanStyleTrends();

  actualizarNavSesion();

  // Catálogo y Carrito
  updateCartBadge();

  if (document.getElementById('productosGrid')) {
    renderProducts();
    bindProductFilters();
  }

  if (document.getElementById('cartItems')) {
    renderCartPage();
  }

  if (document.getElementById('adminOrdersList')) {
    renderAdminOrders();
  }

  const productForm = document.getElementById('productForm');
  if (productForm) {
    renderAdminProducts();

    productForm.addEventListener('submit', async function (event) {
      event.preventDefault();

      const name = document.getElementById('productName').value.trim();
      const description = document.getElementById('productDescription').value.trim();
      const price = Number(document.getElementById('productPrice').value);
      const stock = Number(document.getElementById('productStock').value);
      const imageInput = document.getElementById('productImage');
      const selectedFile = imageInput && imageInput.files ? imageInput.files[0] : null;

      if (!name || !description || !price || price <= 0 || !Number.isInteger(stock) || stock < 0) {
        mostrarAlerta('Atención', 'Completa todos los campos, agrega un precio válido y define el stock obligatorio.', 'warning');
        return;
      }

      let image = '';
      if (selectedFile) {
        image = await readFileAsDataUrl(selectedFile);
      }

      createProduct({
        name,
        description,
        price,
        stock,
        image
      });

      mostrarAlerta('Producto creado', 'El producto se agregó correctamente al catálogo.', 'success');
      productForm.reset();
    });
  }

  document.addEventListener('click', function (event) {
    const addButton = event.target.closest('.add-cart-btn');
    if (addButton) {
      addToCart(addButton.dataset.productId);
      return;
    }

    const cartActionButton = event.target.closest('[data-cart-action]');
    if (cartActionButton) {
      const action = cartActionButton.dataset.cartAction;
      const productId = Number(cartActionButton.dataset.productId);

      if (action === 'increase') {
        changeCartQuantity(productId, 1 + Number(getCart().find(item => Number(item.id) === productId)?.quantity || 0));
      }

      if (action === 'decrease') {
        changeCartQuantity(productId, (Number(getCart().find(item => Number(item.id) === productId)?.quantity || 1) - 1));
      }

      if (action === 'remove') {
        removeFromCart(productId);
      }

      return;
    }

    const stockUpdateButton = event.target.closest('[data-stock-update]');
    if (stockUpdateButton) {
      const productId = stockUpdateButton.dataset.stockUpdate;
      const stockInput = document.getElementById(`stock-${productId}`);
      if (stockInput) {
        updateProductStock(productId, stockInput.value);
      }
      return;
    }

    const deleteButton = event.target.closest('[data-delete-product]');
    if (deleteButton) {
      deleteProduct(deleteButton.dataset.deleteProduct);
    }
  });
});

const defaultProducts = [
  {
    id: 1,
    name: 'Chaqueta Urban Fur',
    description: 'Chaqueta negra de corte urbano con cuello de textura y cierre frontal.',
    price: 45990,
    stock: 12,
    image: '../Image/catalogo-chaqueta-fur.jpg'
  },
  {
    id: 2,
    name: 'Chaqueta Racing Black',
    description: 'Chaqueta bomber negra con gráfica deportiva y detalles reflectantes.',
    price: 59990,
    stock: 8,
    image: '../Image/catalogo-chaqueta-racing.jpg'
  },
  {
    id: 3,
    name: 'Cortaviento Tech Grey',
    description: 'Cortaviento ligero gris con paneles contrastantes y silueta técnica.',
    price: 49990,
    stock: 15,
    image: '../Image/catalogo-cortaviento-tech.jpg'
  },
  {
    id: 4,
    name: 'Jeans Ripped Black',
    description: 'Jeans negros de corte relajado con detalles desgastados y cadenas.',
    price: 39990,
    stock: 10,
    image: '../Image/catalogo-jeans-ripped.jpg'
  },
  {
    id: 5,
    name: 'Cargo Utility Grey',
    description: 'Pantalón cargo gris de inspiración utilitaria para un fit urbano.',
    price: 44990,
    stock: 6,
    image: '../Image/catalogo-pantalon-cargo.jpg'
  }
];

const PRODUCT_STORAGE_KEY = 'urbanstyle_products';
const PRODUCT_CATALOG_VERSION_KEY = 'urbanstyle_catalog_version';
const PRODUCT_CATALOG_VERSION = 'streetwear-premium-images-v2';
const CART_STORAGE_KEY = 'urbanstyle_cart';

function renderUrbanStyleTrends() {
  const trendGrid = document.getElementById('trendGrid');
  if (!trendGrid) return;

  const trends = [
    {
      tag: 'Layering',
      title: 'Capa oversize',
      description: 'Chaquetas con volumen, texturas duras y una silueta que destaca sin perder fluidez.',
      image: '../Image/catalogo-chaqueta-racing.jpg'
    },
    {
      tag: 'Denim',
      title: 'Denim con actitud',
      description: 'Pantalones de corte urbano con lavado profundo, desgaste controlado y un ajuste relajado.',
      image: '../Image/catalogo-jeans-ripped.jpg'
    },
    {
      tag: 'Essentials',
      title: 'Básicos con carácter',
      description: 'Hoodies, poleras y cortes técnicos que sostienen la identidad UrbanStyle todos los días.',
      image: '../Image/Poleron-Pikachu.jpg'
    }
  ];

  trendGrid.innerHTML = trends.map(item => `
    <article class="trend-card">
      <div class="trend-card-media">
        <span class="trend-card-tag">${item.tag}</span>
        <img src="${item.image}" alt="${item.title}">
      </div>
      <div class="trend-card-body">
        <div class="meta">UrbanStyle / temporada</div>
        <h3>${item.title}</h3>
        <p>${item.description}</p>
      </div>
    </article>
  `).join('');
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      resolve('');
      return;
    }

    const reader = new FileReader();
    reader.onload = function () {
      resolve(typeof reader.result === 'string' ? reader.result : '');
    };
    reader.onerror = function () {
      reject(new Error('No se pudo leer la imagen seleccionada.'));
    };
    reader.readAsDataURL(file);
  });
}

function getProducts() {
  try {
    const catalogVersion = localStorage.getItem(PRODUCT_CATALOG_VERSION_KEY);

    if (catalogVersion !== PRODUCT_CATALOG_VERSION) {
      localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(defaultProducts));
      localStorage.setItem(PRODUCT_CATALOG_VERSION_KEY, PRODUCT_CATALOG_VERSION);
      return [...defaultProducts];
    }

    const storedProducts = JSON.parse(localStorage.getItem(PRODUCT_STORAGE_KEY) || 'null');
    if (Array.isArray(storedProducts) && storedProducts.length > 0) {
      return storedProducts;
    }
  } catch (error) {
    console.error('No se pudieron leer los productos guardados:', error);
  }

  localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(defaultProducts));
  localStorage.setItem(PRODUCT_CATALOG_VERSION_KEY, PRODUCT_CATALOG_VERSION);
  return [...defaultProducts];
}

function saveProducts(products) {
  localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(products));
}

function getCart() {
  try {
    const cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
    return Array.isArray(cart) ? cart : [];
  } catch (error) {
    console.error('No se pudo leer el carrito:', error);
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function formatPrice(value) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(Number(value));
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;

  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  badge.textContent = totalItems;
}

function getOrders() {
  try {
    const orders = JSON.parse(localStorage.getItem('urbanstyleOrders') || '[]');
    return Array.isArray(orders) ? orders : [];
  } catch (error) {
    console.error('No se pudieron leer las compras:', error);
    return [];
  }
}

function saveOrders(orders) {
  localStorage.setItem('urbanstyleOrders', JSON.stringify(orders));
}

function addToCart(productId) {
  const products = getProducts();
  const product = products.find(item => Number(item.id) === Number(productId));

  if (!product) return;

  const cart = getCart();
  const existingItem = cart.find(item => Number(item.id) === Number(productId));

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: Number(product.id),
      name: product.name,
      description: product.description,
      price: Number(product.price),
      image: product.image,
      quantity: 1
    });
  }

  saveCart(cart);
  updateCartBadge();

  mostrarAlerta('Producto agregado', `${product.name} fue agregado a la bolsa.`, 'success');

  if (document.getElementById('cartItems')) {
    renderCartPage();
  }
}

function changeCartQuantity(productId, newQuantity) {
  const cart = getCart();
  const item = cart.find(product => Number(product.id) === Number(productId));

  if (!item) return;

  item.quantity = Number(newQuantity);

  if (item.quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  saveCart(cart);
  updateCartBadge();

  if (document.getElementById('cartItems')) {
    renderCartPage();
  }
}

function removeFromCart(productId) {
  const cart = getCart();
  const itemToRemove = cart.find(item => Number(item.id) === Number(productId));

  if (!itemToRemove) return;

  const updatedCart = cart.filter(item => Number(item.id) !== Number(productId));
  saveCart(updatedCart);
  updateCartBadge();

  mostrarAlerta('Producto eliminado', `${itemToRemove.name} fue eliminado del carrito.`, 'alerta');

  if (document.getElementById('cartItems')) {
    renderCartPage();
  }
}

function renderProducts() {
  const productGrid = document.getElementById('productosGrid');
  if (!productGrid) return;

  const products = getFilteredProducts();

  if (!products.length) {
    productGrid.innerHTML = `
      <div class="col-12">
        <div class="alert alert-secondary mb-0" role="alert">
          No se encontraron productos con ese nombre.
        </div>
      </div>
    `;
    return;
  }

  productGrid.innerHTML = products.map((product, index) => `
    <div class="col">
      <article class="card h-100 product-card shadow-sm">
        <div class="premium-product-media">
          <span class="premium-product-tag">${index === 0 ? 'NEW DROP' : 'URBAN PICK'}</span>
          ${product.image ? `<img src="${product.image}" class="card-img-top" alt="${product.name}" loading="lazy">` : '<div class="card-img-top placeholder-image" aria-label="Sin imagen"></div>'}
        </div>
        <div class="card-body d-flex flex-column">
          <div class="premium-product-meta">URBANSTYLE / ${String(index + 1).padStart(2, '0')}</div>
          <h5 class="card-title">${product.name}</h5>
          <p class="card-text text-muted">${product.description}</p>
          <div class="mt-auto">
            <p class="fs-5 fw-bold text-success">${formatPrice(product.price)}</p>
            <button type="button" class="btn btn-dark w-100 add-cart-btn" data-product-id="${product.id}">
              Añadir a la bolsa <span>→</span>
            </button>
          </div>
        </div>
      </article>
    </div>
  `).join('');
}

function renderCartPage() {
  const cartItemsContainer = document.getElementById('cartItems');
  const emptyCartMessage = document.getElementById('emptyCart');
  const cartSummary = document.getElementById('cartSummary');

  if (!cartItemsContainer || !emptyCartMessage || !cartSummary) return;

  const cart = getCart();

  if (!cart.length) {
    cartItemsContainer.innerHTML = '';
    emptyCartMessage.style.display = 'block';
    cartSummary.innerHTML = '';
    updateCartBadge();
    return;
  }

  emptyCartMessage.style.display = 'none';

  const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
  const shipping = subtotal > 0 ? 2000 : 0;
  const total = subtotal + shipping;

  cartItemsContainer.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p>${item.description || 'Producto de UrbanStyle'}</p>
        <div class="cart-item-price">${formatPrice(item.price)}</div>
      </div>
      <div class="cart-item-actions">
        <div class="qty-box">
          <button type="button" class="qty-btn" data-cart-action="decrease" data-product-id="${item.id}">-</button>
          <span>${item.quantity}</span>
          <button type="button" class="qty-btn" data-cart-action="increase" data-product-id="${item.id}">+</button>
        </div>
        <div class="cart-item-total">${formatPrice(item.price * item.quantity)}</div>
        <button type="button" class="btn btn-remove" data-cart-action="remove" data-product-id="${item.id}">Eliminar</button>
      </div>
    </div>
  `).join('');

  cartSummary.innerHTML = `
    <div class="summary-card">
      <h3>Resumen del pedido</h3>
      <div class="summary-row">
        <span>Subtotal</span>
        <strong>${formatPrice(subtotal)}</strong>
      </div>
      <div class="summary-row">
        <span>Envío</span>
        <strong>${formatPrice(shipping)}</strong>
      </div>
      <div class="summary-row total-row">
        <span>Total</span>
        <strong>${formatPrice(total)}</strong>
      </div>
      <button type="button" class="btn btn-dark w-100 mt-3 checkout-btn">Finalizar compra</button>
    </div>
  `;

  const checkoutButton = cartSummary.querySelector('.checkout-btn');
  if (checkoutButton) {
    checkoutButton.addEventListener('click', function () {
      const usuarioActual = getCurrentUser();

      if (!usuarioActual || usuarioActual.rol !== 'cliente') {
        mostrarAlerta('Atención', 'Debes iniciar sesión como cliente para finalizar la compra.', 'warning');
        localStorage.setItem('urbanstyleRedirectAfterLogin', '../View/Carrito.html');
        setTimeout(() => {
          window.location.href = '../View/Login.html';
        }, 1000);
        return;
      }

      const purchaseCart = getCart();
      if (!purchaseCart.length) {
        mostrarAlerta('Carrito vacío', 'Agrega productos antes de finalizar la compra.', 'warning');
        return;
      }

      const subtotal = purchaseCart.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
      const shipping = subtotal > 0 ? 2000 : 0;
      const total = subtotal + shipping;

      const newOrder = {
        id: Date.now(),
        email: usuarioActual.email || 'cliente@urbanstyle.cl',
        fecha: new Date().toISOString(),
        subtotal,
        shipping,
        total,
        items: purchaseCart.map(item => ({
          id: Number(item.id),
          name: item.name,
          quantity: Number(item.quantity),
          price: Number(item.price)
        }))
      };

      const savedOrders = getOrders();
      savedOrders.unshift(newOrder);
      saveOrders(savedOrders);

      cartItemsContainer.innerHTML = `
        <div class="purchase-summary-card">
          <div class="purchase-summary-header">
            <span class="section-number">05 / PEDIDO</span>
            <h3>¡Compra exitosa!</h3>
          </div>
          <p class="purchase-summary-text">Tu pedido fue confirmado y el carrito fue limpiado correctamente.</p>

          <div class="purchase-items">
            ${purchaseCart.map(item => `
              <div class="purchase-item-row">
                <span>${item.name} x${item.quantity}</span>
                <strong>${formatPrice(item.price * item.quantity)}</strong>
              </div>
            `).join('')}
          </div>

          <div class="purchase-total-row">
            <span>Subtotal</span>
            <strong>${formatPrice(subtotal)}</strong>
          </div>
          <div class="purchase-total-row">
            <span>Envío</span>
            <strong>${formatPrice(shipping)}</strong>
          </div>
          <div class="purchase-total-row purchase-grand-total">
            <span>Total pagado</span>
            <strong>${formatPrice(total)}</strong>
          </div>
        </div>
      `;

      emptyCartMessage.style.display = 'none';
      cartSummary.innerHTML = `
        <div class="summary-card">
          <h3>Resumen final</h3>
          <p class="mb-3 text-muted">Gracias por comprar en UrbanStyle.</p>
          <a href="../View/Inicio.html" class="btn btn-dark w-100 mt-2">Seguir comprando</a>
        </div>
      `;

      saveCart([]);
      updateCartBadge();
      mostrarAlerta('Compra exitosa', 'Tu pedido fue registrado correctamente.', 'success');
    });
  }
}

function renderAdminOrders() {
  const ordersList = document.getElementById('adminOrdersList');
  if (!ordersList) return;

  const usuarioActual = getCurrentUser();
  if (!usuarioActual || usuarioActual.rol !== 'admin') {
    window.location.href = '../View/Login.html';
    return;
  }

  const orders = getOrders();

  if (!orders.length) {
    ordersList.innerHTML = `
      <div class="admin-empty-state">
        <h3>No hay compras registradas</h3>
        <p>Aún no se han realizado ventas en UrbanStyle.</p>
      </div>
    `;
    return;
  }

  ordersList.innerHTML = orders.map(order => `
    <article class="admin-order-card">
      <div class="admin-order-header">
        <div>
          <span class="section-number">PEDIDO #${order.id}</span>
          <h3>${order.email}</h3>
        </div>
        <strong>${new Date(order.fecha).toLocaleDateString('es-CL')} - ${new Date(order.fecha).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</strong>
      </div>

      <div class="admin-order-items">
        ${order.items.map(item => `
          <div class="admin-order-item-row">
            <span>${item.name} x${item.quantity}</span>
            <strong>${formatPrice(item.price * item.quantity)}</strong>
          </div>
        `).join('')}
      </div>

      <div class="admin-order-totals">
        <div><span>Subtotal</span><strong>${formatPrice(order.subtotal)}</strong></div>
        <div><span>Envío</span><strong>${formatPrice(order.shipping)}</strong></div>
        <div class="admin-order-grand-total"><span>Total</span><strong>${formatPrice(order.total)}</strong></div>
      </div>
    </article>
  `).join('');
}

function getAvailableProducts() {
  return getProducts().filter(product => Number(product.stock ?? 1) > 0);
}

function createProduct(productData) {
  const products = getProducts();
  const nextId = products.length ? Math.max(...products.map(item => Number(item.id))) + 1 : 1;

  const newProduct = {
    id: nextId,
    name: productData.name,
    description: productData.description,
    price: Number(productData.price),
    stock: Number(productData.stock) || 0,
    image: productData.image ? productData.image.trim() : ''
  };

  products.unshift(newProduct);
  saveProducts(products);

  mostrarAlerta('Producto creado', `${newProduct.name} se creó correctamente.`, 'success');

  if (document.getElementById('productosGrid')) {
    renderProducts();
  }

  if (document.getElementById('productList')) {
    renderAdminProducts();
  }
}

function deleteProduct(productId) {
  const products = getProducts();
  const productToDelete = products.find(item => Number(item.id) === Number(productId));

  if (!productToDelete) return;

  const remainingProducts = products.filter(item => Number(item.id) !== Number(productId));
  saveProducts(remainingProducts);

  const cart = getCart().filter(item => Number(item.id) !== Number(productId));
  saveCart(cart);

  updateCartBadge();

  mostrarAlerta('Producto eliminado', `${productToDelete.name} fue eliminado del catálogo.`, 'alerta');

  if (document.getElementById('productosGrid')) {
    renderProducts();
  }

  if (document.getElementById('productList')) {
    renderAdminProducts();
  }

  if (document.getElementById('cartItems')) {
    renderCartPage();
  }
}

function updateProductStock(productId, newStock) {
  const products = getProducts();
  const productIndex = products.findIndex(item => Number(item.id) === Number(productId));

  if (productIndex === -1) return;

  const parsedStock = Number(newStock);
  if (!Number.isInteger(parsedStock) || parsedStock < 0) {
    mostrarAlerta('Atención', 'El stock debe ser un número entero mayor o igual a 0.', 'warning');
    return;
  }

  products[productIndex].stock = parsedStock;
  saveProducts(products);

  mostrarAlerta('Stock actualizado', `El stock de ${products[productIndex].name} quedó en ${parsedStock}.`, 'success');

  if (document.getElementById('productosGrid')) {
    renderProducts();
  }

  if (document.getElementById('productList')) {
    renderAdminProducts();
  }
}

function renderAdminProducts() {
  const productList = document.getElementById('productList');
  if (!productList) return;

  const products = getProducts();

  if (!products.length) {
    productList.innerHTML = '<p class="empty-admin">No hay productos disponibles.</p>';
    return;
  }

  productList.innerHTML = products.map(product => `
    <div class="admin-product-item">
      ${product.image ? `<img src="${product.image}" alt="${product.name}">` : '<div class="admin-product-image placeholder-image" aria-label="Sin imagen"></div>'}
      <div class="admin-product-info">
        <h4>${product.name}</h4>
        <p>${product.description}</p>
        <strong>${formatPrice(product.price)}</strong>
        <div class="admin-stock-control">
          <label for="stock-${product.id}">Stock</label>
          <input id="stock-${product.id}" type="number" min="0" step="1" value="${Number(product.stock ?? 0)}" data-stock-input="${product.id}">
        </div>
      </div>
      <div class="admin-product-actions">
        <button type="button" class="btn btn-dark btn-sm" data-stock-update="${product.id}">Guardar stock</button>
        <button type="button" class="btn btn-danger btn-sm" data-delete-product="${product.id}">Eliminar</button>
      </div>
    </div>
  `).join('');
}

// Filtrado y ordenamiento de productos
function getFilteredProducts() {
  const searchInput = document.getElementById('searchProducts');
  const sortSelect = document.getElementById('sortProducts');

  let products = getAvailableProducts();

  const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';
  if (searchTerm) {
    products = products.filter(product => product.name.toLowerCase().includes(searchTerm));
  }

  const sortValue = sortSelect ? sortSelect.value : 'default';

  switch (sortValue) {
    case 'name-asc':
      products = [...products].sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name-desc':
      products = [...products].sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'price-asc':
      products = [...products].sort((a, b) => Number(a.price) - Number(b.price));
      break;
    case 'price-desc':
      products = [...products].sort((a, b) => Number(b.price) - Number(a.price));
      break;
    default:
      break;
  }

  return products;
}

function bindProductFilters() {
  const searchInput = document.getElementById('searchProducts');
  const sortSelect = document.getElementById('sortProducts');
  const applySortButton = document.getElementById('applySort');

  if (searchInput) {
    searchInput.addEventListener('input', renderProducts);
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', renderProducts);
  }

  if (applySortButton) {
    applySortButton.addEventListener('click', renderProducts);
  }
}