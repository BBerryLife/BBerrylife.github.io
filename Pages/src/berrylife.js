/* === BBerryLife Shared JS ===
   BB10 / IE compatible:
   - No classList
   - No querySelectorAll
   - No arrow functions
   - No fetch — dùng XMLHttpRequest
*/

/* ── Helpers ── */
function hasClass(el, cls) {
  if (!el || !el.className) return false;
  return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') >= 0;
}
function addClass(el, cls) {
  if (!el) return;
  if (!hasClass(el, cls)) el.className = el.className ? el.className + ' ' + cls : cls;
}
function removeClass(el, cls) {
  if (!el) return;
  el.className = (' ' + el.className + ' ').replace(' ' + cls + ' ', ' ').replace(/^\s+|\s+$/g, '');
}
function byId(id) { return document.getElementById(id); }

/* ══════════════════════════════════════════════════════════════
   NGÔN NGỮ (VI / EN)
   - Lưu lựa chọn vào localStorage, áp dụng cho mọi trang cho tới
     khi người dùng chuyển lại. Nội dung dịch được đánh dấu bằng
     class="i18n" + data-en="..." trực tiếp trong HTML.
   ══════════════════════════════════════════════════════════════ */
var BL_LANG_KEY = 'bl_lang';

function getLang() {
  try {
    var v = localStorage.getItem(BL_LANG_KEY);
    return (v === 'en') ? 'en' : 'vi';
  } catch (e) { return 'vi'; }
}
function setLang(lang) {
  try { localStorage.setItem(BL_LANG_KEY, lang); } catch (e) {}
}

/* Áp dụng bản dịch cho mọi phần tử .i18n trong 1 vùng (mặc định: toàn trang) */
function applyTranslations(root) {
  var scope = root && root.getElementsByClassName ? root : document;
  var lang = getLang();
  var list = scope.getElementsByClassName ? scope.getElementsByClassName('i18n') : [];
  for (var i = 0; i < list.length; i++) {
    var el = list[i];
    if (!el.getAttribute('data-vi')) {
      /* lần đầu chạy: lưu lại nội dung tiếng Việt gốc */
      el.setAttribute('data-vi', el.innerHTML);
    }
    if (lang === 'en') {
      var en = el.getAttribute('data-en');
      if (en) el.innerHTML = en;
    } else {
      var vi = el.getAttribute('data-vi');
      if (vi) el.innerHTML = vi;
    }
  }
  /* placeholder: class="i18n-ph" + data-en-ph="..." */
  var phList = scope.getElementsByClassName ? scope.getElementsByClassName('i18n-ph') : [];
  for (var j = 0; j < phList.length; j++) {
    var pel = phList[j];
    if (!pel.getAttribute('data-vi-ph')) {
      pel.setAttribute('data-vi-ph', pel.getAttribute('placeholder') || '');
    }
    if (lang === 'en') {
      var enph = pel.getAttribute('data-en-ph');
      if (enph) pel.setAttribute('placeholder', enph);
    } else {
      pel.setAttribute('placeholder', pel.getAttribute('data-vi-ph') || '');
    }
  }
  /* aria-label: class="i18n-aria" + data-en-aria="..." */
  var arList = scope.getElementsByClassName ? scope.getElementsByClassName('i18n-aria') : [];
  for (var k = 0; k < arList.length; k++) {
    var ael = arList[k];
    if (!ael.getAttribute('data-vi-aria')) {
      ael.setAttribute('data-vi-aria', ael.getAttribute('aria-label') || '');
    }
    if (lang === 'en') {
      var enar = ael.getAttribute('data-en-aria');
      if (enar) ael.setAttribute('aria-label', enar);
    } else {
      ael.setAttribute('aria-label', ael.getAttribute('data-vi-aria') || '');
    }
  }
  /* Tiêu đề trang */
  if (!window.BL_ORIG_TITLE) window.BL_ORIG_TITLE = document.title;
  if (lang === 'en' && window.PAGE_TITLE_EN) {
    document.title = window.PAGE_TITLE_EN;
  } else {
    document.title = window.BL_ORIG_TITLE;
  }
  /* thuộc tính lang của thẻ html */
  if (document.documentElement) document.documentElement.setAttribute('lang', lang);
  updateLangButtons(lang);
  if (typeof updateThemeButtons === 'function') updateThemeButtons();
}

function updateLangButtons(lang) {
  var btns = document.getElementsByClassName ? document.getElementsByClassName('lang-toggle-btn') : [];
  for (var i = 0; i < btns.length; i++) {
    if (lang === 'en') {
      btns[i].innerHTML = 'VN';
      btns[i].title = 'Chuyển sang Tiếng Việt';
    } else {
      btns[i].innerHTML = 'EN';
      btns[i].title = 'Switch to English';
    }
  }
}

function toggleLang() {
  var next = (getLang() === 'en') ? 'vi' : 'en';
  setLang(next);
  applyTranslations(document);
  return false;
}

/* Chèn nút chuyển ngôn ngữ, nằm dưới nút "Theo Dõi Facebook" trong header */
function injectLangToggle() {
  var follow = document.getElementsByClassName ? document.getElementsByClassName('header-follow')[0] : null;
  if (!follow) return;
  if (byId('langSwitchWrap')) return;
  var wrap = document.createElement('div');
  wrap.className = 'lang-switch';
  wrap.id = 'langSwitchWrap';
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'lang-toggle-btn';
  btn.setAttribute('onclick', 'return toggleLang();');
  btn.innerHTML = (getLang() === 'en') ? 'VN' : 'EN';
  wrap.appendChild(btn);
  follow.appendChild(wrap);
}


/* ══════════════════════════════════════════════════════════════
   GIAO DIỆN SÁNG / TỐI
   - Mặc định tự theo cài đặt của thiết bị (CSS @media prefers-color-scheme).
   - Người dùng bấm nút để chọn thủ công; lựa chọn lưu vào localStorage.
   - Nếu bấm về đúng chế độ của thiết bị thì xoá lựa chọn -> quay lại tự động.
   ══════════════════════════════════════════════════════════════ */
var BL_THEME_KEY = 'bl_theme';
var BL_ICON_MOON = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
var BL_ICON_SUN = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';

function systemPrefersDark() {
  try {
    return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  } catch (e) { return false; }
}
function getThemeChoice() {
  try {
    var v = localStorage.getItem(BL_THEME_KEY);
    return (v === 'dark' || v === 'light') ? v : 'auto';
  } catch (e) { return 'auto'; }
}
function effectiveTheme() {
  var c = getThemeChoice();
  if (c === 'auto') return systemPrefersDark() ? 'dark' : 'light';
  return c;
}
function applyThemeClass() {
  var h = document.documentElement;
  removeClass(h, 'theme-dark');
  removeClass(h, 'theme-light');
  var c = getThemeChoice();
  if (c !== 'auto') addClass(h, 'theme-' + c);
}
function updateThemeButtons() {
  var btns = document.getElementsByClassName ? document.getElementsByClassName('theme-toggle-btn') : [];
  var dark = (effectiveTheme() === 'dark');
  var vi = (getLang() !== 'en');
  for (var i = 0; i < btns.length; i++) {
    /* đang tối -> hiện mặt trời (bấm để sáng); đang sáng -> hiện mặt trăng (bấm để tối) */
    btns[i].innerHTML = dark ? BL_ICON_SUN : BL_ICON_MOON;
    var label = dark ? (vi ? 'Chuyển sang giao diện sáng' : 'Switch to light mode')
                     : (vi ? 'Chuyển sang giao diện tối' : 'Switch to dark mode');
    btns[i].title = label;
    btns[i].setAttribute('aria-label', label);
  }
}
function toggleTheme() {
  var next = (effectiveTheme() === 'dark') ? 'light' : 'dark';
  var sys = systemPrefersDark() ? 'dark' : 'light';
  var stored = false;
  try {
    if (next === sys) localStorage.removeItem(BL_THEME_KEY);
    else localStorage.setItem(BL_THEME_KEY, next);
    stored = true;
  } catch (e) {}
  applyThemeClass();
  if (!stored) { /* không lưu được (vd. chế độ riêng tư) -> vẫn đổi cho phiên này */
    var h = document.documentElement;
    removeClass(h, 'theme-dark'); removeClass(h, 'theme-light');
    addClass(h, 'theme-' + next);
  }
  updateThemeButtons();
  return false;
}
/* Nút đổi giao diện, nằm cạnh nút ngôn ngữ trong header */
function injectThemeToggle() {
  var wrap = byId('langSwitchWrap');
  if (!wrap || byId('themeToggleBtn')) return;
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.id = 'themeToggleBtn';
  btn.className = 'lang-toggle-btn theme-toggle-btn';
  btn.setAttribute('onclick', 'return toggleTheme();');
  wrap.appendChild(btn);
  updateThemeButtons();
}
/* Thiết bị đổi sáng/tối khi đang ở chế độ tự động -> cập nhật icon */
(function watchSystemTheme() {
  try {
    var mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
    if (!mq) return;
    var cb = function() { updateThemeButtons(); };
    if (mq.addEventListener) mq.addEventListener('change', cb);
    else if (mq.addListener) mq.addListener(cb);
  } catch (e) {}
})();

/* ── Modal width clamp ── */
function clampModalWidth() {
  var box = byId('helpModalBox');
  if (box) {
    var vw = document.documentElement.clientWidth || window.innerWidth || 600;
    box.style.width = Math.min(540, vw - 20) + 'px';
  }
}

/* ── Modal open / close ── */
function openHelpModal() {
  var modal = byId('helpModal');
  if (!modal) return;
  modal.style.display = 'block';
  clampModalWidth();
  document.body.style.overflow = 'hidden';
}
function closeHelpModal() {
  var modal = byId('helpModal');
  if (!modal) return;
  modal.style.display = 'none';
  document.body.style.overflow = '';
}
function onOverlayClick(e) {
  var t = e.target || e.srcElement;
  if (t && t.id === 'helpModal') closeHelpModal();
}

/* ESC key closes modal */
(function attachKeyClose() {
  if (document.addEventListener) {
    document.addEventListener('keydown', function(e) {
      if ((e.key === 'Escape') || (e.keyCode === 27)) closeHelpModal();
    });
  } else if (document.attachEvent) {
    document.attachEvent('onkeydown', function() {
      var e = window.event;
      if (e && e.keyCode === 27) closeHelpModal();
    });
  }
})();

/* ── Hiện/ẩn ô "Nhà mạng đang bị khóa" khi chọn đúng vấn đề trong dropdown ── */
function toggleCarrierField(sel) {
  var wrap  = byId('carrierFieldWrap');
  var field = byId('carrierField');
  if (!wrap || !sel) return;
  var show = sel.value === 'Tôi không thể mở khóa mạng của mình';
  wrap.style.display = show ? 'block' : 'none';
  if (field) {
    if (show) field.setAttribute('required', 'required');
    else field.removeAttribute('required');
  }
}

/* ── Form submit via XHR (IE / BB10 compatible) ── */
function handleModalSubmit(e, formId) {
  if (e.preventDefault) e.preventDefault();
  else e.returnValue = false;
  var form      = e.target || e.srcElement;
  var successEl = byId('success-' + formId);
  var btn       = byId('btn-' + formId);
  if (!form || !btn) return false;
  btn.disabled  = true;
  btn.innerHTML = (getLang() === 'en') ? 'Sending...' : 'Đang gửi...';
  var xhr = new XMLHttpRequest();
  xhr.open('POST', form.action, true);
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.onreadystatechange = function() {
    if (xhr.readyState !== 4) return;
    if (xhr.status >= 200 && xhr.status < 300) {
      form.reset();
      if (successEl) successEl.style.display = 'block';
      btn.innerHTML = (getLang() === 'en') ? 'Sent!' : 'Đã Gửi!';
    } else {
      btn.disabled  = false;
      btn.innerHTML = (getLang() === 'en') ? 'Retry' : 'Gửi Lại';
      alert((getLang() === 'en') ? 'An error occurred. Please try again.' : 'Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };
  xhr.onerror = function() {
    btn.disabled  = false;
    btn.innerHTML = (getLang() === 'en') ? 'Retry' : 'Gửi Lại';
    alert((getLang() === 'en') ? 'Could not connect. Please check your network and try again.' : 'Không thể kết nối. Vui lòng kiểm tra mạng và thử lại.');
  };
  xhr.send(new FormData(form));
  return false;
}

/* ── Cover image background (IE + BB10 WebKit) ── */
function coverBgInit() {
  var wrap = byId('coverImgWrap');
  if (!wrap) return;
  var imgs = wrap.getElementsByTagName('img');
  var img  = imgs.length > 0 ? imgs[0] : null;
  if (!img) return;
  var src = img.getAttribute('src') || '';
  if (!src) return;
  wrap.style.backgroundImage    = 'url("' + src + '")';
  wrap.style.backgroundPosition = 'center center';
  wrap.style.backgroundRepeat   = 'no-repeat';
  wrap.style.backgroundSize     = 'cover';
  wrap.style.webkitBackgroundSize = 'cover';
  img.onerror = function() {
    var fallback = src.replace(/\.webp(\?.*)?$/i, '.png');
    if (fallback !== src) {
      img.onerror = null;
      img.src = fallback;
      wrap.style.backgroundImage = 'url("' + fallback + '")';
    }
  };
}

/* ── Window resize handler ── */
function onWindowResize() {
  clampModalWidth();
  if (typeof centerCardImages === 'function') centerCardImages();
}

/* ── Fill và center card images trong khung cố định chiều cao (IE/BB10) ── */
function centerCardImages() {
  var wraps = document.getElementsByClassName ? document.getElementsByClassName('card-img-wrap') : [];
  for (var i = 0; i < wraps.length; i++) {
    (function(wrap) {
      var img = wrap.getElementsByTagName('img')[0];
      if (!img) return;
      function adjustImg() {
        var wrapH = wrap.offsetHeight || 180;
        var wrapW = wrap.offsetWidth || 300;
        img.style.width  = 'auto';
        img.style.height = 'auto';
        img.style.top    = '0';
        img.style.left   = '0';
        var natW = img.naturalWidth  || img.width  || wrapW;
        var natH = img.naturalHeight || img.height || wrapH;
        var scaleW = wrapW / natW;
        var scaleH = wrapH / natH;
        var scale  = scaleW > scaleH ? scaleW : scaleH;
        var newW = Math.ceil(natW * scale);
        var newH = Math.ceil(natH * scale);
        img.style.width  = newW + 'px';
        img.style.height = newH + 'px';
        img.style.left = '-' + Math.floor((newW - wrapW) / 2) + 'px';
        img.style.top  = '-' + Math.floor((newH - wrapH) / 2) + 'px';
      }
      if (img.complete && (img.naturalWidth || img.width)) {
        adjustImg();
      } else {
        img.onload = adjustImg;
      }
    })(wraps[i]);
  }
}

/* ── Auto-inject Footer ── */
function injectFooter() {
  if (document.getElementsByClassName('site-footer').length > 0) return;
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState !== 4) return;
    if (xhr.status >= 200 && xhr.status < 300) {
      var holder = document.createElement('div');
      holder.innerHTML = xhr.responseText;
      while (holder.firstChild) {
        document.body.appendChild(holder.firstChild);
      }
      applyTranslations(document);
    }
  };
  xhr.open('GET', '/Pages/src/footer.html', true);
  xhr.send(null);
}

/* ── Auto-inject Sidebar (dùng chung, tránh copy/paste HTML mỗi trang) ──
   Mọi trang chỉ cần: <aside class="sidebar"></aside>
   Nội dung sidebar sẽ tự được tải từ sidebar.html và chèn vào trong.
*/
function injectSidebar() {
  var aside = document.getElementsByTagName('aside')[0];
  if (!aside) return;
  /* Nếu đã có nội dung (trang cũ chưa dọn) -> không chèn trùng */
  if (aside.innerHTML.replace(/\s/g, '') !== '') return;
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState !== 4) return;
    if (xhr.status >= 200 && xhr.status < 300) {
      aside.innerHTML = xhr.responseText;
      applyTranslations(document);
    }
  };
  xhr.open('GET', '/Pages/src/sidebar.html', true);
  xhr.send(null);
}

/* ── Auto-inject Help Modal (dùng chung, tránh copy/paste HTML mỗi trang) ──
   Mọi trang chỉ cần: <script src="/Pages/src/berrylife.js"></script>
   Modal sẽ tự được tải từ help-modal.html và chèn vào cuối <body>.
*/
function injectHelpModal() {
  if (byId('helpModal')) return; /* đã có sẵn (trang cũ chưa dọn) -> không chèn trùng */
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState !== 4) return;
    if (xhr.status >= 200 && xhr.status < 300) {
      var holder = document.createElement('div');
      holder.innerHTML = xhr.responseText;
      while (holder.firstChild) {
        document.body.appendChild(holder.firstChild);
      }
      applyTranslations(document);
    }
  };
  xhr.open('GET', '/Pages/src/help-modal.html', true);
  xhr.send(null);
}

/* ── Init on DOM ready ── */
function blInit() {
  injectLangToggle();
  injectThemeToggle();
  injectFooter();
  injectSidebar();
  injectHelpModal();
  applyTranslations(document);
  coverBgInit();
  centerCardImages();
}

if (document.addEventListener) {
  document.addEventListener('DOMContentLoaded', blInit);
  window.addEventListener('load', coverBgInit);
  window.addEventListener('load', centerCardImages);
  window.addEventListener('resize', onWindowResize);
} else if (document.attachEvent) {
  document.attachEvent('onreadystatechange', function() {
    if (document.readyState === 'complete') blInit();
  });
  window.attachEvent('onload', coverBgInit);
  window.attachEvent('onload', centerCardImages);
  window.attachEvent('onresize', onWindowResize);
}
