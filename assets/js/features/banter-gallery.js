"use strict";

/*
  Walford World Cup V6
  Banter Gallery renderer
*/

(function () {
  function esc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatDate(value) {
    if (!value) return "";

    const date = new Date(`${value}T12:00:00`);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }

  function renderMedia(item) {
    const file = esc(item.file);
    const caption = esc(item.caption || item.headline || "Banter Gallery item");

    if (item.type === "video") {
      const poster = item.poster
        ? ` poster="${esc(item.poster)}"`
        : "";

      return `
        <video
          class="banter-gallery-media"
          controls
          playsinline
          preload="metadata"${poster}
        >
          <source src="${file}" type="video/mp4">
          Your browser does not support video playback.
        </video>
      `;
    }

    return `
      <button
        class="banter-gallery-image-button"
        type="button"
        data-banter-full-image="${file}"
        aria-label="Open ${caption}"
      >
        <img
          class="banter-gallery-media"
          src="${file}"
          alt="${caption}"
          loading="lazy"
        >
      </button>
    `;
  }

  function renderCard(item) {
    const teams = `${esc(item.teamA)} v ${esc(item.teamB)}`;
    const owners = `${esc(item.ownerA)} v ${esc(item.ownerB)}`;

    const score = item.score
      ? `<span class="banter-gallery-score">${esc(item.score)}</span>`
      : "";

    return `
      <article class="banter-gallery-card">
        <div class="banter-gallery-media-wrap">
          ${renderMedia(item)}
        </div>

        <div class="banter-gallery-card-body">
          <div class="banter-gallery-meta">
            <span>${esc(item.stage)}</span>
            <span>${formatDate(item.date)}</span>
          </div>

          <h3>${esc(item.headline)}</h3>

          <p class="banter-gallery-match">
            ${teams}
            ${score}
          </p>

          <p class="banter-gallery-owners">${owners}</p>

          <p class="banter-gallery-caption">
            ${esc(item.caption)}
          </p>
        </div>
      </article>
    `;
  }

  function renderGallery() {
    const gallery = document.getElementById("banterGalleryGrid");

    if (!gallery) {
      return;
    }

    const items = Array.isArray(window.WC_BANTER_GALLERY)
      ? window.WC_BANTER_GALLERY
      : [];

    if (!items.length) {
      gallery.innerHTML = `
        <p class="banter-gallery-empty">
          No Banter Gallery images have been added yet.
        </p>
      `;
      return;
    }

    gallery.innerHTML = items.map(renderCard).join("");
  }

  function openImage(file) {
    const modal = document.getElementById("banterGalleryModal");
    const modalImage = document.getElementById("banterGalleryModalImage");

    if (!modal || !modalImage) {
      return;
    }

    modalImage.src = file;
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("banter-gallery-modal-open");
  }

  function closeImage() {
    const modal = document.getElementById("banterGalleryModal");
    const modalImage = document.getElementById("banterGalleryModalImage");

    if (!modal || !modalImage) {
      return;
    }

    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    modalImage.src = "";
    document.body.classList.remove("banter-gallery-modal-open");
  }

  document.addEventListener("click", function (event) {
    const imageButton = event.target.closest("[data-banter-full-image]");

    if (imageButton) {
      openImage(imageButton.dataset.banterFullImage);
      return;
    }

    if (
      event.target.closest("[data-banter-modal-close]") ||
      event.target.id === "banterGalleryModal"
    ) {
      closeImage();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeImage();
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderGallery);
  } else {
    renderGallery();
  }
})();
