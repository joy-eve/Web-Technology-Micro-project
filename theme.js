/* Shared theme for every Artelier page. */
const THEME_KEY = 'artelierTheme';
const root = document.documentElement;

function saveTheme(theme) {
  root.dataset.theme = theme;
  try { localStorage.setItem(THEME_KEY, theme); } catch (error) {}
  document.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
    button.textContent = theme === 'dark' ? '☀' : '☾';
    button.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  });
  // Keep the current page URL as a fallback when pages are opened as local files.
  try {
    const url = new URL(location.href);
    url.searchParams.set('theme', theme);
    history.replaceState(null, '', url.href);
  } catch (error) {}
}

function loadTheme() {
  // The URL fallback helps when a browser treats separate file:// pages as separate storage areas.
  const urlTheme = new URLSearchParams(location.search).get('theme');
  let storedTheme = '';
  try { storedTheme = localStorage.getItem(THEME_KEY) || ''; } catch (error) {}
  const theme = urlTheme === 'dark' || urlTheme === 'light'
    ? urlTheme
    : storedTheme === 'dark' ? 'dark' : 'light';
  saveTheme(theme);
}

loadTheme();
document.addEventListener('DOMContentLoaded', loadTheme);

document.addEventListener('click', function (event) {
  const toggle = event.target.closest('[data-theme-toggle]');
  if (toggle) {
    saveTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
    return;
  }

  // Pass the current theme to every internal HTML page before navigating.
  const link = event.target.closest('a[href]');
  if (!link) return;
  const href = link.getAttribute('href');
  if (!href || href.startsWith('#') || /^(https?:|mailto:|tel:|javascript:)/i.test(href)) return;
  try {
    const next = new URL(href, location.href);
    const sameFolder = next.pathname.substring(0, next.pathname.lastIndexOf('/') + 1) ===
      location.pathname.substring(0, location.pathname.lastIndexOf('/') + 1);
    if (sameFolder && next.pathname.endsWith('.html')) {
      next.searchParams.set('theme', root.dataset.theme || 'light');
      link.href = next.href;
    }
  } catch (error) {}
});

window.addEventListener('storage', function (event) {
  if (event.key === THEME_KEY && (event.newValue === 'dark' || event.newValue === 'light')) {
    root.dataset.theme = event.newValue;
    document.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
      button.textContent = event.newValue === 'dark' ? '☀' : '☾';
    });
  }
});
