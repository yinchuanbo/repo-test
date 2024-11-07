var cssText = `

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
    font: normal normal 500 18px/36px Roboto;
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
    font: normal normal 500 16px/22px Roboto;
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
    font: normal normal 500 16px/38px Roboto;
    color: #cfcfcf;
    text-align: center;
    cursor: pointer;
    background-color: #21242c;
    margin-right: 16px;
}
.closeModal:hover {
    background: #F8B7EF;
}

.popup-content {
    flex-grow: 1;
    font: normal normal 500 14px/22px Roboto;
    color: #FFFDF5;
    height: 100%;
    width: 466px;
    margin: 24px 0 34px 0;
}

.bottom-btns-box {
    display: flex;
    flex-direction: row-reverse;
    font: normal normal 500 16px/22px Roboto;
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
        // transform: none;
        // -webkit-backface-visibility: hidden;
        // backface-visibility: hidden;
      
        // -webkit-perspective: 1000;
        // perspective: 1000;
        // border-radius: .6rem .6rem  0px 0px;
    }

    .popup-title {
        font: normal normal normal 0.36rem/0.48rem Roboto;
    }

    .popup-title svg {
        width: 0.3rem;
        height: 0.3rem;
    }

    .popup-content {
        width: 100%;
        font: normal normal normal 0.26rem/0.36rem Roboto;
        letter-spacing: 0px;
        color: #BCBCBD;
        margin: 0.25rem 0 0rem 0;
    }

    .bottom-btns-box {
        flex-direction: column;
    }

    .modal-container .bottom-btns-box div {
        height: 1rem;
        font: normal normal 500 0.33rem/0.44rem Roboto;
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
        font: normal normal 500 0.33rem/0.44rem Roboto;
        letter-spacing: 0px;
        color: #21242C;
    }
    
}

@media (min-width: 1200px) {
    .title-right:hover img{
       content: url("/dist/img/aiGirlFriend/btn_close_hover_popup.svg");
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
`
var style = document.createElement("style");
style.type = "text/css";
if (style.styleSheet) {
    style.styleSheet.cssText = cssText;
} else {
    style.appendChild(document.createTextNode(cssText));
}
document.head.appendChild(style);



(function ($) {
    $Popup = function (options) {
        var settings = $.extend(
            {
                title: "Modal",
                type: "normal",
                content: "",
                errorType: "",
                otherBtns: "",
                closeBtn: jsonData.aiGirlFriend.ok,
                autoClose: true,
                addBorderRadius: false,
                onClose: function () {},
                topCloseFn: function () {},
                exist: "",
            },
            options
        );


        if(settings.type === "error") settings.addBorderRadius = true;


        let errorType = {
            normal: jsonData.aiGirlFriend.errorDesc,
            network: jsonData.aiGirlFriend.errorNetwork
        }
        let title;



        if (settings.type === "error") {
            settings.title = "Failed"
            title = `<div class="title-left">
            <img src="/dist/img/ai-chatting/error_icon.svg"/>

                                      <div>${settings.title}</div>
                        </div>`;
            if(settings.errorType && !settings.content ) {
                settings.content = errorType[settings.errorType]
            }
        } else {
            title = `<div class="title-left">
                            ${settings.title}
                        </div>`;
        }

        title += ` <div class="title-right">
        <img src="/dist/img/ai-chatting/popup_x_icon.svg"/>

                        </div>`;
        let modal = $(`<div class="modal ${settings.type}"></div>`);

        let container = $(`<div class="modal-container ${settings.exist}"></div>`);

        container.html(`<div class="popup-title">${title}</div><div class="popup-content">${settings.content}</div></div>
                <div class="bottom-btns-box"><button class="closeModal">${settings.closeBtn}</button><button class="closeModal2" style="display:${settings.applyBtn?'block':'none'}">${settings.applyBtn}</button>${settings.otherBtns}</div>`);

        modal.html(container)

        if (!$(".modal-container").hasClass(settings.exist)) {
            modal.appendTo("body").show();
        }
        if(settings.exist === ''){
            const $errorModal = $(".modal-container").filter(function() {
                return $(this).attr("class").trim() === "modal-container";
            });
            $errorModal.closest(".modal").remove();
            modal.appendTo("body").show();
        }

        modal.find(".closeModal").on("click", function () {
            if(settings.autoClose) modal.remove();
            settings.onClose();
        });

        modal.find(".closeModal2").on("click", function () {
            settings.onApply();
        });

        modal.find(".title-right").on("click", function () {
            settings.topCloseFn();
            modal.remove();
        });

        function addBorderRadius() {
            if ($(window).width() < 1200) {
                $(".modal-container").css("border-radius", ".6rem .6rem 0px 0px");
            } else {
                $(".modal-container").css("border-radius", "");
            }
        }


        if(settings.addBorderRadius) addBorderRadius()

        $(".title-right").hover(()=> {
            $("#Path_158819,#Path_158820").attr("stroke","#fffdf5")
        },()=> {
            $("#Path_158819,#Path_158820").attr("stroke","#cfcfcf")
        })

        modal.click(function(event) {
            if (!$(event.target).closest('.modal-container').length) {
                modal.remove();
            }
        });

        return {
            modal: modal,
            show: function() {
                modal.appendTo("body").show();
            },
            close: function() {
                modal.remove();
            },
            disableCloseBtn() {
                $(".closeModal").css({
                    background: "#373B44",
                    color: "#BCBCBD",
                    "pointer-events": "none"
                })
            },
            enableCloseBtn() {
                $(".closeModal").css({
                    background: "#F597E8",
                    color: "#21242C",
                    "pointer-events": "auto"
                })
            },
            closeButton: {
                disable() {
                    $(".closeModal").css({ background: "rgb(55, 59, 68)",
                    color: "rgb(188, 188, 189)",
                    "pointer-events": "none"})
                },
                enable() {
                    $(".closeModal").removeAttr('style');
                }
            },
            loading: {
                start() {
                    $(".closeModal").empty().append(loadingIcon);
                    $(".closeModal").css({
                        "pointer-events": "none"
                    })
                    $(".closeModal svg").css("animation", "rotation .5s infinite linear");

                    $("head").append(`
                    <style>
                      @keyframes rotation {
                        from {
                          transform: rotate(0deg);
                        }
                        to {
                          transform: rotate(360deg);
                        }
                      }
                    </style>
                  `);
                },
                end() {
                    $(".closeModal").empty().append(settings.closeBtn);
                    $(".closeModal").css({
                        "pointer-events": "auto"
                    })
                }
            }
        };
    };
})(jQuery);
