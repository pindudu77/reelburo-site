/* Ставит тему ДО первой отрисовки, чтобы не мигало. Подключается в head без
   defer — потому отдельный крошечный файл, а не кусок app.js. Инлайном
   нельзя: CSP script-src 'self' запрещает инлайн-скрипты. */
(function () {
  "use strict";
  // Сайт живёт без заголовка frame-ancestors (GitHub Pages не умеет свои
  // заголовки, meta-CSP игнорирует frame-ancestors) — выламываемся из
  // чужого iframe сами.
  if (window.top !== window.self) {
    try {
      window.top.location.replace(location.href);
    } catch (e) {
      document.documentElement.style.display = "none";
    }
    return;
  }
  // Технические зеркала *.pages.dev и *.github.io — не для людей: прямой
  // заход уводим на основной домен (canonical уже стоит, это закрывает
  // ручные заходы и случайные ссылки).
  if (/\.pages\.dev$|\.github\.io$/.test(location.hostname)) {
    location.replace("https://reelburo.com" + location.pathname
                     + location.search + location.hash);
    return;
  }
  var theme = null;
  try { theme = localStorage.getItem("reelburo:theme"); } catch (e) { /* приватный режим */ }
  if (theme !== "dark" && theme !== "light") {
    theme = (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches)
      ? "dark" : "light";
  }
  if (theme === "dark") document.documentElement.setAttribute("data-theme", "dark");
  // Панель браузера в цвет фона темы (--bg из styles.css); в HTML — светлый дефолт.
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "dark" ? "#0F1115" : "#F2F3F5");
}());
