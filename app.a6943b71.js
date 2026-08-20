/* Reelburo. Две задачи: не давать роликам играть хором и прятать мобильную
   CTA у финала. Запуск ролика — дело родного плеера (<video controls> уже
   в разметке): скриптовый play() глушила настройка Safari «Никогда не
   воспроизводить», и на десктопе карточка молчала (20.08). Без JS ролики
   тоже играют.
   Автоперевода по локали НЕТ намеренно: Googlebot ходит с en-US и терял бы
   русскую главную. */

(function () {
  "use strict";

  // --- ролики: заиграл один — остальные молчат ---
  var reels = document.querySelectorAll("video.reel");
  reels.forEach(function (video) {
    video.addEventListener("play", function () {
      reels.forEach(function (other) {
        if (other !== video) other.pause();
      });
    });

    // --- свой плеер: большая кнопка вместо системной полосы (Миша, 20.08).
    // Разметка отдаёт родные controls; скрипт прячет их и показывает свою
    // кнопку. Клик = звук + запуск. Если play() отклонён (авария 20.08:
    // на одном десктопе запуск глох без причины) — МОЛНИЕНОСНО возвращаем
    // родные controls, чтобы посетитель дожал штатной кнопкой.
    var box = video.closest(".reel-box");
    var btn = box && box.querySelector(".reel-play");
    if (btn) {
      video.removeAttribute("controls");
      btn.hidden = false;
      btn.addEventListener("click", function () {
        video.muted = false;
        var p = video.play();
        if (p && p.catch) {
          p.catch(function () {
            video.controls = true;      // запаска: родной плеер
            btn.hidden = true;
          });
        }
      });
      video.addEventListener("play", function () { btn.hidden = true; });
      video.addEventListener("pause", function () {
        if (!video.controls) btn.hidden = false;
      });
      video.addEventListener("ended", function () {
        if (!video.controls) btn.hidden = false;
      });
      // Клик по самому ролику во время игры — пауза (как в соцсетях)
      video.addEventListener("click", function () {
        if (video.controls) return;     // родной плеер сам разберётся
        if (!video.paused) video.pause();
      });
    }

    // Плеер не должен молча не работать. Не смог открыть файл (кодек,
    // расширение браузера, оборванная сеть) — под роликом появляется прямая
    // ссылка: она открывается встроенным плеером браузера в новой вкладке.
    // 20.08: на одном десктопе кнопка не запускала ничего и причины не было
    // видно вообще.
    video.addEventListener("error", fallback, true);
    video.addEventListener("stalled", function () {
      // Ссылка-запаска — только если данных нет И ролик не играет: stalled
      // приходит и у здорового видео на паузе, пугать под ним нечего.
      setTimeout(function () {
        if (video.readyState < 2 && video.currentTime === 0) fallback();
      }, 8000);
    });

    function fallback() {
      var box = video.closest(".reel-item");
      if (!box || box.querySelector(".reel-fallback")) return;
      // Запаска обязана быть максимально совместимой: первый source теперь
      // webm, а ссылку показывают ровно когда плеер не справился — даём mp4.
      var src = video.querySelector('source[type="video/mp4"]') ||
                video.querySelector("source");
      if (!src) return;
      var a = document.createElement("a");
      a.className = "reel-fallback";
      a.href = src.getAttribute("src");
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = document.documentElement.lang === "en"
        ? "Video did not load here. Watch it separately"
        : "Ролик не открылся здесь. Смотреть отдельно";
      box.appendChild(a);
    }
  });

  // --- переключатель темы: ставит data-theme и запоминает выбор ---
  var themeBtn = document.querySelector(".theme-btn");
  if (themeBtn) {
    // Скринридеру нужно состояние кнопки, а не только имя
    themeBtn.setAttribute("aria-pressed",
      document.documentElement.getAttribute("data-theme") === "dark" ? "true" : "false");
    themeBtn.addEventListener("click", function () {
      var root = document.documentElement;
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      if (next === "dark") root.setAttribute("data-theme", "dark");
      else root.removeAttribute("data-theme");
      themeBtn.setAttribute("aria-pressed", next === "dark" ? "true" : "false");
      // Панель браузера — вслед за темой (значения = --bg из styles.css)
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", next === "dark" ? "#0F1115" : "#F2F3F5");
      try { localStorage.setItem("reelburo:theme", next); }
      catch (e) { /* приватный режим — тема живёт до перезагрузки */ }
    });
  }

  // --- мобильная липкая CTA: прячется, когда виден финальный блок ---
  var bar = document.querySelector(".mobile-cta");
  var final = document.querySelector(".final");
  if (bar && final && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        bar.classList.toggle("off", entry.isIntersecting);
      });
    }, { rootMargin: "0px 0px -20% 0px" }).observe(final);
  }
}());
