class PopComponents extends HTMLElement {
    constructor() {
      super();
      this.type = this.getAttribute("type") || "success"; //error progress suceess
      this.popup_title = this.getAttribute("popup_title") || "";
      this.content = this.getAttribute("content") || "";
      this.btn = this.getAttribute("btn") || "";
      this.speed = this.getAttribute("speed") || 20;
      this.close = this.getAttribute("close") || 0;
      this.timer = null;
      this.progressType = this.getAttribute("progressType") || "progress";
      this.contentClass = this.getAttribute("contentClass") || ""; //Content additional custom class class
    }
  
    connectedCallback() {
      this.innerHTML = `
              <div class="popup_box">
                  <div class="mio_popup ${this.type}">
                      <div class="popup_close"></div>
                      <div class="type_icon"></div>
                      <div class="popup_container">
                        <div class="popup_title">${this.popup_title}</div>
                        <div class="popup_content ${this.contentClass}">${this.content}</div>
                      </div>
                      <div class="popup_btn">${this.btn}</div>
                      <div class="popup_progress_box">
                          <div class="popup_progress"></div>
                      </div>
                  </div>
              </div>
          `;
  
      setTimeout(() => {
        /*Clicks on the binding page*/
        // this.toBindEvent();
        this.toBindCss();
        if (this.type === "progress" && this.progressType === "progress") {
          this.fakeProgress();
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
        .mio_popup {
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
        
        .mio_popup.error .popup_title {
            color: #EE1A3D;
        }
        
        .mio_popup .popup_close {
            position: absolute;
            right: 18px;
            top: 18px;
            width: 18px;
            height: 18px;
            background-image: url("/dist/js/popup/img/close_hover.png");
            background-repeat: no-repeat;
            background-size: contain;
            cursor: pointer
        }
        
        .mio_popup .popup_title {
            font: normal normal bold 18px/22px Sora;;
            margin-bottom: 13px;
            color: #000;
            display: flex;
            align-items: center;
        }
        
        .mio_popup .popup_progress_box {
            display: none;
            width: 432px;
            height: 11px;
            background: #281FAE 0% 0% no-repeat padding-box;
            border: 1px solid #EEECFF;
            border-radius: 10px;
        }

        .mio_popup .popup_progress {
            width: 0;
            height: 100%;
            background: #0E45F5;
            border-radius: 10px;
            transition:width .3s ease;
        }

        .mio_popup.progress{
            padding-bottom:40px;
        }
        
        .mio_popup.progress .popup_btn{
            display:none;
        }

        .mio_popup.progress .popup_progress_box{
            display:block;
        }

        .mio_popup.downloadsuccess .popup_title:before{
            margin-right: 8px;
            content: '';
            width: 24px;
            height: 24px;
            background-image: url("/dist/img/face-swap/icon_wrong.svg");
            background-size: cover;
        }

        .mio_popup .popup_content {
            text-align: left;
            color: #737C90;
            margin-bottom: 16px;
            font: normal normal 400 16px/20px Sora;
        }
        
        .mio_popup .popup_btn {
            width: 123px;
            height: 40px;
            background: #281FAE 0% 0% no-repeat padding-box;
            border-radius: 4px;
            font: normal normal 400 18px/40px Sora;
            letter-spacing: 0px;
            color: #FFFFFF;
            float: right;
            text-align: center;
            cursor: pointer;
            transition: opacity 0.3s ease
        }
        
        @media (min-width: 986px) {
            .mio_popup .popup_close:hover {
                background-image: url("/dist/js/popup/img/close.png")
            }
        
            .mio_popup .popup_btn:hover {
                background: #000000 0% 0% no-repeat padding-box;
            }
        }
        
        @media (max-width: 986px) {
            .mio_popup {
                width: 6.3rem;
                padding: .62rem .37rem .36rem
            }
        
            .mio_popup .popup_close {
                top: .24rem;
                right: .24rem;
                width: .32rem;
                height: .32rem
            }
        
            .mio_popup .popup_title {
                font: normal normal bold .34rem/.52rem Sora;
                margin-bottom: .32rem;
                text-align: center
            }
        
            .mio_popup .popup_content {
                font: normal normal 500 .26rem/.39rem Sora;
                text-align: center;
                margin-bottom: .32rem
            }
        
            .mio_popup .popup_btn {
                width: 1.82rem;
                font: normal normal 500 .3rem/.64rem Sora;
                border-radius: .08rem;
                height: .68rem
            }

            .mio_popup .popup_progress_box {
                width: 5.5rem;
                height: .11rem;
                border: .01rem solid #EEECFF;
                border-radius: .1rem;
            }
    
            .mio_popup .popup_progress {
                border-radius: .1rem;
            }
    
            .mio_popup.progress{
                padding-bottom:.74rem;
            }
            
            .mio_popup.progress .popup_btn{
                display:none;
            }

        }

    `;

        const styleTag = document.createElement('style');
        styleTag.type = 'text/css';

        if (styleTag.styleSheet) {
            styleTag.styleSheet.cssText = css;  // For IE
        } else {
            styleTag.appendChild(document.createTextNode(css));  // For other browsers
        }

        document.head.appendChild(styleTag);
    }
  
    // toBindEvent() {
    //   this.popupBox = document.querySelector(".mio_popup");
    //   const that = this;
    //   this.popupBox.querySelector(".popup_close").onclick = function () {
    //     if (that.close === 1) {
    //       console.log(that.type, "type");
    //       document.getElementById("mio_popup").style.display = "none";
    //     } else {
    //       that.remove();
    //     }
    //   };
    //   this.popupBox.querySelector(".popup_btn").onclick = function () {
    //     if (that.close === 1) {
    //       document.getElementById("mio_popup").style.display = "none";
    //     } else {
    //       that.remove();
    //     }
    //   };
    // }
  
    // downloadFetch(
    //   url,
    //   name,
    //   sucessCallback,
    //   failedCallback,
    //   NoExistCallback
    // ) {
    //   fetch(url)
    //     .then((response) => {
    //       if (!response.ok) {
    //         throw new Error(
    //           "Failed to fetch the resource. Status: " + response.status
    //         );
    //       }
    //       const contentLength = response.headers.get("Content-Length");
    //       const total = parseInt(contentLength, 10);
    //       let loaded = 0;
    //       const reader = response.body.getReader();
    //       return new ReadableStream({
    //         start(controller) {
    //           function pump() {
    //             return reader.read().then(({ done, value }) => {
    //               if (done) {
    //                 controller.close();
    //                 return;
    //               }
    //               loaded += value.length;
    //               const progress = Math.round((loaded / total) * 100);
    //               // barDom.style.width = `${progress}%`;
    //               if (progress < 100) {
    //                 $(".popup_progress").attr("style", `width:${progress}%`);
    //                 // showPop({
    //                 //   type: "success",
    //                 // });
    //               }
    //               controller.enqueue(value);
    //               return pump();
    //             });
    //           }
    //           return pump();
    //         },
    //       });
    //     })
    //     .then((stream) => new Response(stream))
    //     .then((response) => response.blob())
    //     .then((blob) => {
    //       const blobUrl = URL.createObjectURL(blob);
    //       const a = document.createElement("a");
    //       a.href = blobUrl;
    //       a.download = name;
    //       a.click();
    //       URL.revokeObjectURL(blobUrl);
    //       a.remove();
    //       sucessCallback()
    //     })
    //     .catch((error) => {
    //       if (error.message.includes("404")) {
    //         NoExistCallback();
    //       } else {
    //         failedCallback();
    //       }
    //     });
    // }
  
    async fakeProgress() {
      let i = 0;
      this.timer = setInterval(() => {
        if (i>98) {clearInterval(this.timer);return;}
        i++
        document.querySelector(".popup_progress").style.width = i + "%";
      }, this.speed)
  
      // let i = 0;
      // while (i < 98) {
      //   i++;
      //   document.querySelector(".popup_progress").style.width = i + "%";
      //   await new Promise((resolve) => setTimeout(resolve, this.speed));
      // }
    }
  
    removePopup() {
      const that = this
      return new Promise(function (resolve, reject) {
        clearInterval(that.timer);
        console.log("Popup remove")
        resolve();
        that.remove();
      });
    }
  }
  
  //Register a custom component
  customElements.define("popup-lite", PopComponents);
  