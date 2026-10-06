/* === BerryLife Shared JS ===
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

/* ── Auto-inject "About Us" link vào header-follow (đồng bộ mọi trang) ── */
function injectAboutUsLink() {
  var follow = document.getElementsByClassName ? document.getElementsByClassName('header-follow')[0] : null;
  if (!follow) return;
  var links = follow.getElementsByTagName('a');
  for (var i = 0; i < links.length; i++) {
    if (links[i].href && links[i].href.indexOf('AboutUs.html') >= 0) return; /* đã có sẵn */
  }
  var a = document.createElement('a');
  a.href = '/Pages/AboutUs.html';
  a.className = 'i18n';
  a.setAttribute('data-en', 'About Us');
  a.innerHTML = 'Giới Thiệu';
  follow.insertBefore(a, follow.firstChild);
}

/* ── Init on DOM ready ── */
function blInit() {
  injectAboutUsLink();
  injectLangToggle();
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
