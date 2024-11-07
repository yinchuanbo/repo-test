const cssText = `

@keyframes rotation {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

@keyframes modalShow {
    from {
        transform: translateY(100%);
    }
    to {
        transform: translateY(0.001%);
    }
}

.modal {
    background-color: rgba(0, 0, 0, 0.5);
    top: 0;
    z-index: 1000;
    display: none;
    position: fixed;
    width: 100vw;
    height: 100%;
}

.modal-container {
    position: fixed;
    min-width: 514px;
    top: 50%;
    left: 50%;
    background: #21242C 0% 0% no-repeat padding-box;
    padding: 26px 22px;
    box-shadow: 0px 3px 6px #0000008F;
    border-radius: 8px;
    color: #FFFDF5;
}

.popup-title {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font: normal normal 500 18px/36px Sora;
    letter-spacing: 0px;
    color: #FFFDF5;
}

.title-left {
    display: flex;
    align-items: center;
}

.title-left img {
    margin-right: 10px;
}

.title-left svg {
    margin-right: 10px;
}
.title-right {
    cursor: pointer;
}

.closeModal {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    min-width: 86px;
    height: 42px;
    padding: 0 10px;
    font: normal normal 500 16px/22px Sora;
    letter-spacing: 0px;
    color: #21242C;
    background: #F597E8 0% 0% no-repeat padding-box;
    border-radius: 10px;
    opacity: 1;
}
.closeModal2{
    height: 42px;
    border: 2px solid #cfcfcf;
    border-radius: 10px;
    padding: 0 19px;
    font: normal normal 500 16px/38px Sora;
    color: #cfcfcf;
    text-align: center;
    cursor: pointer;
    background-color: #21242c;
    margin-right: 16px;
}
.closeModal:hover {
    background: rgba(245, 151, 232, 0.88);
}

.popup-content {
    flex-grow: 1;
    font: normal normal normal 14px/22px Sora;
    color: #FFFDF5;
    height: 100%;
    width: 466px;
    margin: 24px 0 34px 0;
}

.bottom-btns-box {
    display: flex;
    flex-direction: row-reverse;
    font: normal normal 500 16px/22px Sora;
    color: #21242C;
}

.modal.share .bottom-btns-box {
    display: none;
}

@media (max-width: 1200px) {

    .modal-container {
        animation: modalShow 0.5s ease forwards;
        padding: 0.4rem .4rem .8rem .4rem;
        width: 100vw;
        min-width: 0;
        position: fixed;
        bottom: 0;
        top: auto;
        left: 0;
        right: auto;
        height: auto;
        overflow-y: scroll;
        max-height: 100%;
        overflow-y:scroll;
        border-radius: .6rem .6rem  0 0;
        // transform: none;
        // -webkit-backface-visibility: hidden;
        // backface-visibility: hidden;
      
        // -webkit-perspective: 1000;
        // perspective: 1000;
    }

    .popup-title {
        align-items: start;
        font: normal normal normal 0.36rem/0.48rem Sora;
    }

    .popup-title img {
        width: 0.3rem;
        height: 0.3rem;
    }

    .popup-content {
        width: 100%;
        font: normal normal normal 0.26rem/0.36rem Sora;
        letter-spacing: 0px;
        color: #BCBCBD;
        margin: 0.25rem 0 0rem 0;
    }

    .bottom-btns-box {
        flex-direction: column;
    }

    .modal-container .bottom-btns-box div {
        height: 1rem;
        font: normal normal 500 0.33rem/0.44rem Sora;
        letter-spacing: 0px;
        color: #CFCFCF;
        width: 100%;
        margin: 0.34rem 0 0 0;
    }

    .modal-container .bottom-btns-box button {
        height: 1rem !important;
        width: 100%;
        margin: 0.34rem 0 0 0;
    }

    .closeModal {
        height: 1rem;
        font: normal normal 500 0.33rem/0.44rem Sora;
        letter-spacing: 0px;
        color: #21242C;
        padding:0;
      }
    
}

@media (min-width: 1200px) {
    .title-right:hover img{
       content: url("/dist/img/aiFriend/btn_close_hover_popup.svg");
    }
    .modal-container {
        transform: translate(-50%, -50%);
    }
    .closeModal2:hover {
        color: #fffdf5;
        border: 2px solid #fffdf5;
    }
}
`;

let loadingIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <g id="icon_loading" transform="translate(-662 -408)">
    <g id="loading_11_" data-name="loading (11)" transform="translate(658.7 404.7)">
      <path id="Path_160887" data-name="Path 160887" d="M15.3,3.3a12,12,0,1,1-12,12A12,12,0,0,1,15.3,3.3Zm0,3.6a8.4,8.4,0,1,0,8.4,8.4,8.4,8.4,0,0,0-8.4-8.4Z" fill="rgba(33,36,44,0.33)"/>
      <path id="Path_160888" data-name="Path 160888" d="M24.618,23.449A11.8,11.8,0,0,0,7.926,6.757a1.77,1.77,0,1,0,2.5,2.5A8.262,8.262,0,0,1,22.115,20.946a1.77,1.77,0,1,0,2.5,2.5Z" transform="translate(-0.776 0)" fill="#21242c"/>
    </g>
  </g>
</svg>
`;

const style = document.createElement("style");
style.textContent = cssText;
document.head.appendChild(style);

(function ($) {
  window.$Popup = function (options) {
    let isBind = false;
    const settings = $.extend(
      {
        title: "Modal",
        type: "normal",
        content: "",
        errorType: "",
        otherBtns: "",
        closeBtn: jsonData.aiGirlFriend.ok,
        autoClose: true,
        addBorderRadius: false,
        exist: "",
        closeOnBackdropClick: true,
        onClose: function () {},
        onApply: function () {},
        topCloseFn: function () {},
      },
      options,
    );

    const errorType = {
      normal: jsonData.aiGirlFriend.errorDesc,
      network: jsonData.aiGirlFriend.errorNetwork,
    };

    if (settings.type === "error") {
      settings.addBorderRadius = true;
      settings.title = jsonData.aiGirlFriend.errorTitle;
    }

    const titleLeftHtml =
      settings.type === "error"
        ? `<div class="title-left">
              <img src="/dist/img/ai-chatting/error_icon.svg" alt="error icon"/>
              <div>${settings.title}</div>
            </div>`
        : `<div class="title-left">
             ${settings.title}
           </div>`;

    const titleRightHtml = `
      <div class="title-right">
        <img src="/dist/img/ai-chatting/popup_x_icon.svg" alt="close button"/>
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
      `<div class="modal-container ${settings.exist}"></div>`,
    );
    $container.html(`${titleHtml}${contentHtml}${bottomBtnsHtml}`);
    $modal.html($container);

    if (settings.addBorderRadius) {
      if ($(window).width() < 1200) {
        $container.css("border-radius", ".6rem .6rem 0px 0px");
      } else {
        $container.css("border-radius", "");
      }
    }

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

      $titleRight.on("mouseenter", function () {
        $("#Path_158819,#Path_158820").attr("stroke", "#fffdf5");
      });

      $titleRight.on("mouseleave", function () {
        $("#Path_158819,#Path_158820").attr("stroke", "#cfcfcf");
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
      $titleRight.off("mouseenter");
      $titleRight.off("mouseleave");
      $modal.off("click");

      isBind = false;
    };

    const unbindAssignEvent = ($assignModal) => {
      const $titleRight = $assignModal.find(".title-right");

      $assignModal.find(".closeModal").off("click");
      $assignModal.find(".closeModal2").off("click");
      $titleRight.off("click");
      $titleRight.off("mouseenter");
      $titleRight.off("mouseleave");
      $assignModal.off("click");
    };

    const showModal = () => {
      const $allModalContainer = $(".modal-container");
      if (
        $allModalContainer.hasClass(settings.exist) &&
        settings.exist !== ""
      ) {
        return;
      }

      if (settings.exist === "") {
        const $errorModal = $allModalContainer.filter(function () {
          return $(this).attr("class").trim() === "modal-container";
        });
        closeAssignModal($errorModal);
      }

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
      disableCloseBtn() {
        $closeModal.css({
          background: "#373B44",
          color: "#BCBCBD",
          "pointer-events": "none",
        });
      },
      enableCloseBtn() {
        $closeModal.css({
          background: "#F597E8",
          color: "#21242C",
          "pointer-events": "auto",
        });
      },
      closeButton: {
        disable() {
          $closeModal.css({
            background: "rgb(55, 59, 68)",
            color: "rgb(188, 188, 189)",
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
            .css("animation", "rotation .5s infinite linear");
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
