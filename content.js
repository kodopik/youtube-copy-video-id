// == YouTube Copy Video ID Extension ===================================

// debug helper
function log(...args) {
  console.debug('[YT‑CopyID]', ...args);
}

// watch for DOM changes
const observer = new MutationObserver(() => {
  try {
    runInjection();
  } catch (e) {
    console.error('[YT‑CopyID] Injection error:', e);
  }
});
observer.observe(document.body, { childList: true, subtree: true });

// entry point
function runInjection() {
  injectStandardLists();
  injectWatchPage();
  injectStudioRows();
}

// 1) Standard YouTube lists (search, homepage, recommendations…)
function injectStandardLists() {
  const sel = [
    'ytd-video-renderer',
    'ytd-grid-video-renderer',
    'ytd-rich-item-renderer',
    'ytd-reel-shelf-renderer'         // захват шортсов в карусели
  ].join(',');
  document.querySelectorAll(sel).forEach(item => {
    if (item.dataset.ytCopyInjected) return;

    // найдем ВСЕ подходящие ссылки внутри одного элемента
    const link = item.querySelector(
      'a[href*="watch?v="],' +
      'a[href*="/shorts/"],' +
      'a[href*="/live/"]'
    );
    if (!link) return;

    let vid = null;
    const href = link.getAttribute('href');

    if (href.includes('watch?v=')) {
      vid = new URL(link.href).searchParams.get('v');
    } else if (href.includes('/shorts/')) {
      // /shorts/ID или /shorts/ID/...
      vid = href.split('/shorts/')[1].split(/[?&/]/)[0];
    } else if (href.includes('/live/')) {
      vid = href.split('/live/')[1].split(/[?&/]/)[0];
    }
    if (!vid) return;

    const meta = item.querySelector('#metadata-line, .view-count');
    addButton(meta, vid);
    item.dataset.ytCopyInjected = '1';
    log('List injected:', vid);
  });
}

// 2) Single video page — now supports /watch, /shorts/ID and /live/ID
function injectWatchPage() {
  const p = location.pathname;
  if (
    !(p.startsWith('/watch') ||
      p.startsWith('/shorts/') ||
      p.startsWith('/live/'))
  ) return;

  // находим мета‑блок, в котором лежит <h1>
  const metaBlock = document.querySelector('ytd-watch-metadata, ytd-rich-metadata-renderer');
  if (!metaBlock || metaBlock.dataset.ytWatchInjected) return;

  // заголовок у всех трёх форм — первый <h1> внутри metaBlock
  const h1 = metaBlock.querySelector('h1');
  if (!h1) return;

  // получение id
  let vid = null;
  if (p.startsWith('/watch')) {
    vid = new URL(location.href).searchParams.get('v');
  } else {
    // /shorts/ID or /live/ID
    vid = p.split('/')[2];
  }
  if (!vid) return;

  // вставляем четыре неразрывных пробела и кнопку
  h1.appendChild(document.createTextNode('\u00A0\u00A0\u00A0\u00A0'));
  h1.appendChild(createButton(vid));

  metaBlock.dataset.ytWatchInjected = '1';
  log('Watch page title injected:', vid);
}

// 3) YouTube Studio: insert button after each <ytcp-video-list-cell-video>
function injectStudioRows() {
  if (!location.hostname.includes('studio.youtube.com')) return;

  document.querySelectorAll('ytcp-video-list-cell-video').forEach(row => {
    if (row.dataset.ytCopyInjected) return;

    const link = row.querySelector('a[href*="/video/"]');
    if (!link) return;
    const m = link.getAttribute('href').match(/\/video\/([^\/]+)/);
    if (!m) return;
    const vid = m[1];

    const wrapper = document.createElement('div');
    wrapper.className = 'vm-video-actions-dropdown-menu yt-copyid-dropdown';
    wrapper.style.cssText = 'display:inline-block;margin-left:8px;vertical-align:middle;';

    const btn = createButton(vid);
    wrapper.appendChild(btn);

    row.insertAdjacentElement('afterend', wrapper);
    row.dataset.ytCopyInjected = '1';
    log('Studio row injected:', vid);
  });
}

// helper: create 📋 button
function createButton(vid) {
  const btn = document.createElement('span');
  btn.textContent = '📋';
  btn.title = vid;
  btn.style.cssText = `
    cursor: pointer;
    font-size: 1.1em;
    user-select: none;
    display: inline-block;
    padding: 0 4px;
    vertical-align: middle;
  `;
  btn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(vid)
      .then(() => showToast(vid, this))
      .catch(err => console.error('[YT‑CopyID] Clipboard error', err));
  });
  return btn;
}

// helper for standard lists
function addButton(container, vid) {
  if (container) container.appendChild(createButton(vid));
}

// toast: appears above the button, floats up and fades
function showToast(text, anchor) {
  const toast = document.createElement('div');
  toast.textContent = text;
  toast.style.cssText = `
    position: absolute;
    background: rgba(0,0,0,0.85);
    color: #fff;
    padding: 6px 10px;
    border-radius: 4px;
    font-size: 16px;
    line-height: 1.2;
    white-space: nowrap;
    pointer-events: none;
    z-index: 9999;
    opacity: 0;
    transform: translate(-50%, 0);
    transition: opacity 0.6s ease, transform 0.6s ease;
  `;
  document.body.appendChild(toast);

  try {
    const rect = anchor.getBoundingClientRect();
    const startY = window.scrollY + rect.top - 8;
    const startX = window.scrollX + rect.left + rect.width / 2;
    toast.style.top = `${startY}px`;
    toast.style.left = `${startX}px`;
    void toast.offsetWidth;
    toast.style.opacity = '1';
    toast.style.transform = 'translate(-50%, -20px)';
  } catch {
    toast.style.position = 'fixed';
    toast.style.bottom   = '40px';
    toast.style.left     = '50%';
    toast.style.transform= 'translate(-50%, -20px)';
    void toast.offsetWidth;
    toast.style.opacity = '1';
  }

  setTimeout(() => {
    if (toast.parentNode) toast.parentNode.removeChild(toast);
  }, 650);
}

// initial run
runInjection();

