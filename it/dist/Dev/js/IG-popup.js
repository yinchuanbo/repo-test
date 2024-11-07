let loadingIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16">
    <defs>
      <clipPath id="clip-path">
        <rect id="Rectangle_31790" data-name="Rectangle 31790" width="16" height="16" fill="#fff" stroke="#707070" stroke-width="1"/>
      </clipPath>
      <linearGradient id="linear-gradient" x1="0.5" y1="0.053" x2="0.5" y2="0.918" gradientUnits="objectBoundingBox">
        <stop offset="0" stop-color="#fff"/>
        <stop offset="1" stop-color="#fff" stop-opacity="0.549"/>
      </linearGradient>
      <linearGradient id="linear-gradient-2" x1="0.5" y1="0.152" x2="0.5" y2="0.872" gradientUnits="objectBoundingBox">
        <stop offset="0" stop-color="#fff" stop-opacity="0"/>
        <stop offset="1" stop-color="#fff" stop-opacity="0.549"/>
      </linearGradient>
    </defs>
    <g id="icon_loading" opacity="0.7" clip-path="url(#clip-path)">
      <path id="_2" data-name="2" d="M6.124.015a1.05,1.05,0,0,1,.348,2.071A5.251,5.251,0,0,0,7.35,12.513v2.1A7.35,7.35,0,0,1,6.124.015Z" transform="translate(0.65 0.694)" fill="url(#linear-gradient)"/>
      <path id="_1" data-name="1" d="M13.925,2.524a1.05,1.05,0,0,1,1.483-.08A7.35,7.35,0,0,1,10.5,15.265v-2.1A5.25,5.25,0,0,0,14,4.006,1.05,1.05,0,0,1,13.925,2.524Z" transform="translate(-2.5 0.041)" fill="url(#linear-gradient-2)"/>
    </g>
  </svg>
`;

(function ($) {
  window.$Popup = function (options) {
    let isBind = false;
    const settings = $.extend(
      {
        title: "Modal",
        type: "normal",
        limits: 1,
        content: "",
        errorType: "",
        otherBtns: "",
        closeBtn: jsonData.IGpopup.ok,
        applyBtn: '',
        autoClose: true,
        closeOnBackdropClick: true,
        onClose: function () { },
        onApply: function () { },
        topCloseFn: function () { },
      },
      options,
    );

    const errorType = {
      normal: jsonData.IGpopup.errorDesc,
      network: jsonData.IGpopup.errorNetwork,
      limit: jsonData.IGpopup.limitDes.replace('%s', settings.limits),
      task: jsonData.IGpopup.errorTask
    };

    if (settings.type === "error") {
      settings.title = jsonData.IGpopup.errorTitle;
      if (settings.errorType === 'network') {
        settings.title = jsonData.IGpopup.errorNetworkTitle;
      }
    } else if (settings.type === "limit") {
      settings.title = jsonData.IGpopup.limit;
    }

    const titleLeftHtml =
      settings.errorType === 'network'
        ? `<div class="title-left">
              <div>${settings.title}</div>
            </div>` :
        settings.type === "error"
          ? `<div class="title-left">
              <img src="/dist/img/IGcommon/error_icon.svg" alt="error icon"/>
              <div>${settings.title}</div>
            </div>`
          : `<div class="title-left">
             ${settings.title}
           </div>`;

    const titleRightHtml = settings.errorType === 'network' ? '' : `
      <div class="title-right">
        <img src="/dist/img/IGcommon/popup_x_icon.svg" alt="close button"/>
      </div>`;

    const titleHtml = `
      <div class="popup-title">
        ${titleLeftHtml}${titleRightHtml}
      </div>`;

    const contentHtml = `
      <div class="popup-content">${settings.content || errorType[settings.errorType] || ""}</div>`;

    const bottomBtnsHtml = `
      <div class="bottom-btns-box">
        <button class="closeModal">${settings.closeBtn}</button>
        <button class="closeModal2" style="display:${settings.applyBtn ? "block" : "none"}">${settings.applyBtn}</button>
        ${settings.otherBtns}
      </div>`;

    const $modal = $(
      `<div class="modal modal-wrapper ${settings.type}"></div>`,
    );
    const $container = $(
      `<div class="modal-container"></div>`,
    );
    $container.html(`${titleHtml}${contentHtml}${bottomBtnsHtml}`);
    $modal.html($container);


    const $closeModal = $modal.find(".closeModal");
    const $closeModal2 = $modal.find(".closeModal2");
    const $titleRight = $modal.find(".title-right");

    const bindEvents = () => {
      if (isBind) return;

      $closeModal.on("click", function () {
        settings.onClose();
        if (settings.autoClose) closeModal();
      });

      $closeModal2.on("click", function () {
        settings.onApply();
      });

      $titleRight.on("click", function () {
        settings.topCloseFn();
        closeModal();
      });

      if (settings.closeOnBackdropClick) {
        $modal.on("click", function (event) {
          if (!$(event.target).closest(".modal-container").length) {
            closeModal();
          }
        });
      }

      isBind = true;
    };

    const unbindEvents = () => {
      $closeModal.off("click");
      $closeModal2.off("click");
      $titleRight.off("click");
      $modal.off("click");

      isBind = false;
    };

    const unbindAssignEvent = ($assignModal) => {
      const $titleRight = $assignModal.find(".title-right");

      $assignModal.find(".closeModal").off("click");
      $assignModal.find(".closeModal2").off("click");
      $titleRight.off("click");
      $assignModal.off("click");
    };

    const showModal = () => {
      bindEvents();
      $modal.appendTo("body").show();
    };

    const closeModal = () => {
      unbindEvents();
      $modal.remove();
    };

    const closeAssignModal = ($el) => {
      const $assignModal = $el.hasClass("modal-wrapper")
        ? $el
        : $el.closest(".modal-wrapper");
      unbindAssignEvent($assignModal);
      $assignModal.remove();
    };

    showModal();

    return {
      modal: $modal,
      show: function () {
        showModal();
      },
      close: function () {
        closeModal();
      },
      closeAll: function () {
        const $allModal = $(".modal-wrapper");
        closeAssignModal($allModal);
      },
      closeButton: {
        disable() {
          $closeModal.css({
            "pointer-events": "none",
          });
        },
        enable() {
          $closeModal.removeAttr("style");
        },
      },
      loading: {
        start() {
          $closeModal.empty().append(loadingIcon);

          $closeModal.css({
            "pointer-events": "none",
          });

          $closeModal
            .find("svg")
            .css("animation", "rotation 1s infinite linear");
        },
        end() {
          $closeModal.empty().append(settings.closeBtn);
          $closeModal.css({
            "pointer-events": "auto",
          });
        },
      },
    };
  };
})(jQuery);
