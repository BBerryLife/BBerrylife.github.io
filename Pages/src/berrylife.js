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
  if (typeof centerCoverImage    === 'function') centerCoverImage();
  if (typeof equalizeServiceCards === 'function') equalizeServiceCards();
}

/* ── Init on DOM ready ── */
function blInit() {
  coverBgInit();
  equalizeServiceCards();
  setTimeout(equalizeServiceCards, 200);
}

if (document.addEventListener) {
  document.addEventListener('DOMContentLoaded', blInit);
  window.addEventListener('load', coverBgInit);
  window.addEventListener('resize', onWindowResize);
} else if (document.attachEvent) {
  document.attachEvent('onreadystatechange', function() {
    if (document.readyState === 'complete') blInit();
  });
  window.attachEvent('onload', coverBgInit);
  window.attachEvent('onresize', onWindowResize);
}
