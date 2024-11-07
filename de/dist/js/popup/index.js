class PopComponents extends HTMLElement {
  constructor() {
    super();
    this.type = this.getAttribute("type") || ""; //error progress suceess
    this.pop_title = this.getAttribute("popup_title") || "";
    this.content = this.getAttribute("content") || "";
    this.btn = this.getAttribute("btn") || "";
    this.speed = this.getAttribute("speed") || 20;
    this.close = this.getAttribute("close") || 0;
    this.progressType = this.getAttribute("progressType") || "progress";
    this.contentClass = this.getAttribute("contentClass") || ""; //Content additional custom class class
  }

  connectedCallback() {
    this.innerHTML = `
            <div class="popup_box">
                <div class="website_popup ${this.type}">
                    <div class="popup_close"></div>
                    <div class="popup_title">${this.pop_title}</div>
                    <div class="popup_content ${this.contentClass}">${this.content}</div>
                    <div class="popup_btn">${this.btn}</div>
                    <div class="popup_progress_box">
                        <div class="popup_progress"></div>
                    </div>
                </div>
            </div>
        `;

    setTimeout(() => {
      /*Clicks on the binding page*/
    //   this.toBindEvent();
      this.toBindCss();
      if (this.type === "progress" && this.progressType === "progress") {
        this.progress();
      }
    }, 50);
  }


  toBindCss() {
    const css = `
        .popup_box{
            position: fixed;
            width:100vw;
            height:100vh;
            top:0;
            left:0;
            z-index:1000;
        }
        .website_popup {
            position: absolute;
            width: 500px;
            background: #FFFFFF 0% 0% no-repeat padding-box;
            box-shadow: 0px 10px 10px #0000001D;
            border: 1px solid #E2E2E2;
            border-radius: 8px;
            top: 50%;
            left: 50%;
            box-sizing: border-box;
            padding: 26px 20px 16px;
            transform: translate(-50%, -50%)
        }
        
        .website_popup.error .popup_title {
            color: #EE1A69
        }
        
        .website_popup.error .popup_title:before {
            content:"";
            background-image: url("/dist/js/popup/img/icon_wrong.png");
            background-repeat: no-repeat;
            background-size: contain;
            width: 24px;
            height: 24px;
            display: inline-block;
            margin-right:8px;
        }

        .website_popup.success .popup_title:before {
            content:"";
            background-image: url("/dist/js/popup/img/icon_ok.png");
            background-repeat: no-repeat;
            background-size: contain;
            width: 24px;
            height: 24px;
            display: inline-block;
            margin-right:8px;
        }

        .website_popup .popup_close {
            position: absolute;
            right: 18px;
            top: 18px;
            width: 18px;
            height: 18px;
            background-image: url("/dist/js/popup/img/close.png");
            background-repeat: no-repeat;
            background-size: contain;
            cursor: pointer
        }
        
        .website_popup .popup_title {
            font: normal normal bold 18px/22px Sora;
            margin-bottom: 13px;
            display: flex;
            color: #39325A;
            align-items: center;
        }
        
        .website_popup .popup_progress_box {
            display: none;
            width: 432px;
            height: 11px;
            background: #E8E7F6 0% 0% no-repeat padding-box;
            border: 1px solid #EEECFF;
            border-radius: 10px;
        }

        .website_popup .popup_progress {
            width: 0;
            height: 100%;
            background: #281FAE;
            border-radius: 10px;
            transition:width .3s ease;
        }

        .website_popup.progress{
            padding-bottom:40px;
        }
        
        .website_popup.progress .popup_btn{
            display:none;
        }

        .website_popup.progress .popup_progress_box{
            display:block;
        }

        .website_popup .popup_content {
            text-align: left;
            font: normal normal normal 16px/21px Sora;
            color: #737C90;
            margin-bottom: 16px;
        }

        .website_popup.progress .popup_content {
            text-align: left;
            font: normal normal bold 18px/22px Sora;
            color: #2C374F;
            margin-bottom: 16px;
        }
        
        .website_popup .popup_btn {
            width: 120px;
            height: 40px;
            background: #281FAE ;
            border-radius: 4px;
            font: normal normal normal 16px/40px Sora;
            letter-spacing: 0px;
            color: #FFFFFF;
            float: right;
            text-align: center;
            cursor: pointer;
            transition: opacity 0.3s ease
        }
        
        @media (min-width: 1200px) {
            .website_popup .popup_close:hover {
                background-image: url("/dist/js/popup/img/close_hover.png")
            }
        
            .website_popup .popup_btn:hover {
                opacity: 0.8
            }
        }
        
        @media (max-width: 1200px) {
            .website_popup {
                width: 6.3rem;
                padding: .62rem .2rem .36rem
            }
        
            .website_popup .popup_close {
                top: .24rem;
                right: .24rem;
                width: .32rem;
                height: .32rem
            }
        
            .website_popup .popup_title {
                font: normal normal bold .34rem/.52rem Sora;
                margin-bottom: .43rem;
                text-align: center;
                justify-content:center;
            }

            .website_popup .popup_title:before {
               display: none !important;
            }
        
            .website_popup .popup_content {
                font: normal normal 500 .26rem/.39rem Sora;
                text-align: center;
                margin-bottom: .32rem
            }
        
            .website_popup .popup_btn {
                width: 1.82rem;
                font: normal normal 500 .3rem/.64rem Sora;
                border-radius: .08rem;
                height: .68rem
            }

            .website_popup .popup_progress_box {
                width: 5.5rem;
                height: .11rem;
                border: .01rem solid #EEECFF;
                border-radius: .1rem;
            }
    
            .website_popup .popup_progress {
                border-radius: .1rem;
                background-color: #FF9810;
            }
    
            .website_popup.progress{
                padding-bottom:.74rem;
            }
            
            .website_popup.progress .popup_btn{
                display:none;
            }

        }

    `;

    const styleTag = document.createElement("style");
    styleTag.type = "text/css";

    if (styleTag.styleSheet) {
      styleTag.styleSheet.cssText = css; // For IE
    } else {
      styleTag.appendChild(document.createTextNode(css)); // For other browsers
    }

    document.head.appendChild(styleTag);
  }

  disconnectedCallback() {}

  async progress() {
    let i = 0;
    while (i < 98) {
      i++;
      this.popupBox.querySelector(".popup_progress").style.width = i + "%";
      await new Promise((resolve) => setTimeout(resolve, this.speed));
    }
  }

  removePopup() {
    const that = this
    return new Promise(function (resolve, reject) {
      resolve();
      that.remove();
    });
  }
}

//Register a custom component
customElements.define("popup-lite", PopComponents);
