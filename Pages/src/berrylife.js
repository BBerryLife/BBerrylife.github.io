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
  if (typeof equalizeServiceCards === 'function') {
    setTimeout(equalizeServiceCards, 80);
    setTimeout(equalizeServiceCards, 400);
  }
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

/* ── Service selection (step 1 → step 2) ── */
function selectService(type) {
  var cards = ['unlock', 'rom'];
  for (var i = 0; i < cards.length; i++) {
    var c = byId('card-' + cards[i]);
    if (c) removeClass(c, 'selected');
  }
  var sel = byId('card-' + type);
  if (sel) addClass(sel, 'selected');
  var stepForm = byId('step-form');
  if (stepForm) addClass(stepForm, 'visible');
  var fmts = ['unlock', 'rom'];
  for (var j = 0; j < fmts.length; j++) {
    var fw = byId('form-wrap-' + fmts[j]);
    if (fw) fw.style.display = 'none';
  }
  var target = byId('form-wrap-' + type);
  if (target) target.style.display = 'block';
  setTimeout(function() {
    var sf = byId('step-form');
    if (sf && sf.scrollIntoView) sf.scrollIntoView(false);
  }, 80);
}

function resetToStep1() {
  var stepForm = byId('step-form');
  if (stepForm) removeClass(stepForm, 'visible');
  var cards = ['unlock', 'rom'];
  for (var i = 0; i < cards.length; i++) {
    var c = byId('card-' + cards[i]);
    if (c) removeClass(c, 'selected');
  }
  var fmts = ['unlock', 'rom'];
  for (var j = 0; j < fmts.length; j++) {
    var fw = byId('form-wrap-' + fmts[j]);
    if (fw) fw.style.display = 'none';
    var sc = byId('success-' + fmts[j]);
    if (sc) sc.style.display = 'none';
  }
}

/* ── BerryBus accordion ── */
var bbOpen = false;
function toggleBerryBus() {
  bbOpen = !bbOpen;
  var body  = byId('bb-body');
  var arrow = byId('bb-arrow');
  var acc   = byId('bb-accordion');
  if (body)  body.style.display = bbOpen ? 'block' : 'none';
  if (arrow) arrow.innerHTML    = bbOpen ? '&#9650;' : '&#9660;';
  if (acc) {
    if (bbOpen) addClass(acc, 'bb-open');
    else        removeClass(acc, 'bb-open');
  }
}

/* ── BerryBus sub-tabs ── */
function switchBBTab(tab) {
  var tabs = ['route', 'stop', 'place'];
  for (var i = 0; i < tabs.length; i++) {
    var btn   = byId('bbtab-' + tabs[i] + '-btn');
    var panel = byId('bbtab-' + tabs[i]);
    if (btn)   removeClass(btn,   'active');
    if (panel) removeClass(panel, 'active');
  }
  var activeBtn   = byId('bbtab-' + tab + '-btn');
  var activePanel = byId('bbtab-' + tab);
  if (activeBtn)   addClass(activeBtn,   'active');
  if (activePanel) addClass(activePanel, 'active');
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
  btn.innerHTML = 'Đang gửi...';
  var xhr = new XMLHttpRequest();
  xhr.open('POST', form.action, true);
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.onreadystatechange = function() {
    if (xhr.readyState !== 4) return;
    if (xhr.status >= 200 && xhr.status < 300) {
      form.reset();
      if (successEl) successEl.style.display = 'block';
      btn.innerHTML = 'Đã Gửi!';
    } else {
      btn.disabled  = false;
      btn.innerHTML = 'Gửi Lại';
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };
  xhr.onerror = function() {
    btn.disabled  = false;
    btn.innerHTML = 'Gửi Lại';
    alert('Không thể kết nối. Vui lòng kiểm tra mạng và thử lại.');
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

/* ── Equalize service-card heights ── */
function equalizeServiceCards() {
  var picker = byId('servicePicker');
  if (!picker) return;
  var cards = picker.getElementsByClassName ? picker.getElementsByClassName('service-card') : [];
  if (cards.length < 2) return;
  cards[0].style.height = '';
  cards[1].style.height = '';
  var h = Math.max(cards[0].offsetHeight, cards[1].offsetHeight);
  if (h <= 0) return;
  cards[0].style.height = h + 'px';
  cards[1].style.height = h + 'px';
}

/* ── Window resize handler ── */
function onWindowResize() {
  clampModalWidth();
  if (typeof centerCardImages    === 'function') centerCardImages();
  if (typeof equalizeServiceCards === 'function') equalizeServiceCards();
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
  a.innerHTML = 'About Us';
  follow.insertBefore(a, follow.firstChild);
}

/* ── Init on DOM ready ── */
function blInit() {
  injectAboutUsLink();
  injectSidebar();
  injectHelpModal();
  coverBgInit();
  centerCardImages();
  equalizeServiceCards();
  setTimeout(equalizeServiceCards, 200);
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
