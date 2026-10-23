"use strict";

/* ===============================
  要素の取得
================================== */
const header = document.querySelector(".header");
const hamburger = document.querySelector(".js-hamburger");
const nav = document.querySelector(".js-nav");

const HEADER_SHOW_POSITION = 80;
const HEADER_HIDE_DELAY = 1100;

let scrollTimer;

/* ===============================
  ヘッダーの表示・非表示
================================== */
function showHeader() {
  if (header === null) return;

  header.classList.add("is-scrolled");
}

function hideHeader() {
  if (header === null) return;

  header.classList.remove("is-scrolled");
}

function startHeaderHideTimer() {
  clearTimeout(scrollTimer);

  scrollTimer = setTimeout(function () {
    // メニューが開いている間はヘッダーを隠さない
    if (nav !== null && nav.classList.contains("is-open")) {
      return;
    }

    hideHeader();
  }, HEADER_HIDE_DELAY);
}

if (header !== null) {
  window.addEventListener("scroll", function () {
    if (window.scrollY > HEADER_SHOW_POSITION) {
      showHeader();
      startHeaderHideTimer();
    } else {
      clearTimeout(scrollTimer);
      hideHeader();
    }
  });
}

/* ===============================
  ハンバーガーメニュー
================================== */
function openMenu() {
  if (hamburger === null || nav === null) return;

  clearTimeout(scrollTimer);

  nav.classList.add("is-open");
  hamburger.classList.add("is-open");

  hamburger.setAttribute("aria-expanded", "true");
  hamburger.setAttribute("aria-label", "メニューを閉じる");
}

function closeMenu() {
  if (hamburger === null || nav === null) return;

  nav.classList.remove("is-open");
  hamburger.classList.remove("is-open");

  hamburger.setAttribute("aria-expanded", "false");
  hamburger.setAttribute("aria-label", "メニューを開く");

  // スクロール位置が80pxより下なら、少し後にヘッダーを隠す
  if (window.scrollY > HEADER_SHOW_POSITION) {
    startHeaderHideTimer();
  } else {
    hideHeader();
  }
}

if (hamburger !== null && nav !== null) {
  hamburger.addEventListener("click", function () {
    const isOpen = nav.classList.contains("is-open");

    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  /* ナビ内のリンクをクリックしたときだけ閉じる */
  nav.addEventListener("click", function (event) {
    const clickedLink = event.target.closest("a");

    if (clickedLink === null) return;

    closeMenu();
  });

  /* Escキーでも閉じられるようにする */
  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;

    closeMenu();
  });
}

/* ===============================
  打ち上げ花火スライダー
================================== */
$(function () {
  const $slider = $(".autoplay");

  if ($slider.length === 0) return;

  $slider.slick({
    autoplay: true,
    autoplaySpeed: 2000,
    speed: 800,
    infinite: false,
    centerMode: true,
    centerPadding: "0px",
    slidesToShow: 3,
    arrows: true,
    dots: false,

    accessibility: true,
    focusOnSelect: false,
    pauseOnFocus: true,

    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          centerPadding: "10%",
        },
      },
    ],
  });

  lightbox.option({
    wrapAround: true,
    disableScrolling: true,
    albumLabel: "画像 %1 / %2",
    fadeDuration: 300,
    imageFadeDuration: 300,
    resizeDuration: 300,
  });

  $slider.on("click", "a[data-lightbox]", function() {
    $slider.slick("slickPause");

    this.blur();

    window.setTimeout(function() {
      const lightboxElement = document.getElementById("lightbox");

      if(lightboxElement !== null) {
        lightboxElement.focus({
          preventScroll: true,
        });
      }
    }, 0);
  });

  const lightboxObserver = new MutationObserver(function() {
    const isLightboxOpen = document.body.classList.contains("lb-disable-scrolling");

    if(isLightboxOpen) {
      $slider.slick("slickPause");
    } else {
      $slider.slick("slickPlay");
    }
  },);

  lightboxObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"],
  });
});

/* ===============================
  チケット枚数・買い物カゴ AI作成
================================== */
const ticketArea = document.querySelector(".js-ticket-area");
const ticketCartButton = document.querySelector(".js-ticket-cart");
const ticketCartBadge = document.querySelector(
  ".js-ticket-cart-count",
);
const ticketSummary = document.querySelector(
  ".js-ticket-summary",
);
const ticketSummaryList = document.querySelector(
  ".js-ticket-summary-list",
);
const ticketEmptyMessage = document.querySelector(
  ".js-ticket-empty",
);
const ticketTotalCount = document.querySelector(
  ".js-ticket-total-count",
);
const ticketTotalPrice = document.querySelector(
  ".js-ticket-total-price",
);
const ticketSummaryClose = document.querySelector(
  ".js-ticket-summary-close",
);
const ticketPurchaseButton = document.querySelector(
  ".js-ticket-purchase",
);

const MAX_TICKET_COUNT = 10;
const yenFormatter = new Intl.NumberFormat("ja-JP");

/**
 * 購入内容を開く
 */
function openTicketSummary() {
  if (
    ticketSummary === null ||
    ticketCartButton === null
  ) {
    return;
  }

  ticketSummary.classList.add("is-visible");
  ticketSummary.setAttribute("aria-hidden", "false");

  ticketCartButton.setAttribute(
    "aria-expanded",
    "true",
  );
}

/**
 * 購入内容を閉じる
 */
function closeTicketSummary() {
  if (
    ticketSummary === null ||
    ticketCartButton === null
  ) {
    return;
  }

  ticketSummary.classList.remove("is-visible");
  ticketSummary.setAttribute("aria-hidden", "true");

  ticketCartButton.setAttribute(
    "aria-expanded",
    "false",
  );
}

/**
 * 購入内容の開閉
 */
function toggleTicketSummary() {
  if (ticketSummary === null) return;

  const isOpen =
    ticketSummary.classList.contains("is-visible");

  if (isOpen) {
    closeTicketSummary();
  } else {
    openTicketSummary();
  }
}

/**
 * 購入内容を再描画する
 */
function renderTicketSummary() {
  if (
    ticketArea === null ||
    ticketSummaryList === null ||
    ticketTotalCount === null ||
    ticketTotalPrice === null
  ) {
    return;
  }

  const ticketCards =
    ticketArea.querySelectorAll(".ticket-card");

  let totalCount = 0;
  let totalPrice = 0;

  ticketSummaryList.innerHTML = "";

  ticketCards.forEach(function (card) {
    const ticketName =
      card.dataset.ticketName ?? "";

    const price = Number(
      card.dataset.price ?? 0,
    );

    const count = Number(
      card.dataset.count ?? 0,
    );

    if (count === 0) return;

    const subtotal = price * count;

    totalCount += count;
    totalPrice += subtotal;

    const listItem = document.createElement("li");
    listItem.classList.add("ticket-summary-item");

    const nameElement =
      document.createElement("span");

    nameElement.classList.add(
      "ticket-summary-name",
    );

    nameElement.textContent = ticketName;

    const countElement =
      document.createElement("span");

    countElement.classList.add(
      "ticket-summary-count",
    );

    countElement.textContent = `${count}枚`;

    const subtotalElement =
      document.createElement("span");

    subtotalElement.classList.add(
      "ticket-summary-subtotal",
    );

    subtotalElement.textContent =
      subtotal === 0
        ? "無料"
        : `${yenFormatter.format(subtotal)}円`;

    listItem.append(
      nameElement,
      countElement,
      subtotalElement,
    );

    ticketSummaryList.append(listItem);
  });

  ticketTotalCount.textContent = String(totalCount);
  ticketTotalPrice.textContent =
    yenFormatter.format(totalPrice);

  /* 買い物カゴの枚数 */
  if (ticketCartBadge !== null) {
    ticketCartBadge.textContent = String(totalCount);

    ticketCartBadge.classList.toggle(
      "is-visible",
      totalCount > 0,
    );
  }

  /* 買い物カゴの読み上げ用ラベル */
  if (ticketCartButton !== null) {
    ticketCartButton.setAttribute(
      "aria-label",
      totalCount > 0
        ? `購入内容を開く。現在${totalCount}枚選択中`
        : "購入内容を開く",
    );
  }

  /* 0枚時のメッセージ */
  if (ticketEmptyMessage !== null) {
    ticketEmptyMessage.hidden = totalCount > 0;
  }

  /* 購入ボタン */
  if (ticketPurchaseButton !== null) {
    ticketPurchaseButton.disabled =
      totalCount === 0;
  }
}

/**
 * カード内の枚数とボタンを更新する
 */
function updateTicketCard(card, count) {
  const countElement =
    card.querySelector(".ticket-count");

  const minusButton = card.querySelector(
    '[data-action="minus"]',
  );

  const plusButton = card.querySelector(
    '[data-action="plus"]',
  );

  card.dataset.count = String(count);

  if (countElement !== null) {
    countElement.textContent = String(count);
  }

  if (minusButton !== null) {
    minusButton.disabled = count === 0;
  }

  if (plusButton !== null) {
    plusButton.disabled =
      count >= MAX_TICKET_COUNT;
  }
}

/* プラス・マイナスボタン */
if (ticketArea !== null) {
  ticketArea.addEventListener(
    "click",
    function (event) {
      const clickedButton =
        event.target.closest(
          ".ticket-count-button",
        );

      if (clickedButton === null) return;

      const ticketCard =
        clickedButton.closest(".ticket-card");

      if (ticketCard === null) return;

      const action =
        clickedButton.dataset.action;

      const currentCount = Number(
        ticketCard.dataset.count ?? 0,
      );

      let nextCount = currentCount;

      if (action === "plus") {
        nextCount = Math.min(
          currentCount + 1,
          MAX_TICKET_COUNT,
        );
      }

      if (action === "minus") {
        nextCount = Math.max(
          currentCount - 1,
          0,
        );
      }

      updateTicketCard(
        ticketCard,
        nextCount,
      );

      /*
       * 合計内容だけ更新する。
       * 購入内容ウィンドウは自動では開かない。
       */
      renderTicketSummary();
    },
  );
}

/* カゴをクリック */
if (ticketCartButton !== null) {
  ticketCartButton.addEventListener(
    "click",
    toggleTicketSummary,
  );
}

/* 閉じるボタン */
if (ticketSummaryClose !== null) {
  ticketSummaryClose.addEventListener(
    "click",
    closeTicketSummary,
  );
}

/* 購入ボタン */
if (ticketPurchaseButton !== null) {
  ticketPurchaseButton.addEventListener(
    "click",
    function () {
      if (
        ticketTotalCount === null ||
        ticketTotalPrice === null
      ) {
        return;
      }

      window.alert(
        `選択枚数：${ticketTotalCount.textContent}枚\n` +
          `合計金額：${ticketTotalPrice.textContent}円\n\n` +
          "購入手続き画面は現在準備中です。",
      );
    },
  );
}

/* Escキーで閉じる */
document.addEventListener(
  "keydown",
  function (event) {
    if (event.key !== "Escape") return;

    closeTicketSummary();
  },
);

/* 初期表示 */
renderTicketSummary();