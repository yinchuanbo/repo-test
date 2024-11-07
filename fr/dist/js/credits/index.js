class CreditsSystem {
  constructor(options) {
    Object.setPrototypeOf(CreditsSystem.prototype, options);
    this.cookies = getCookie("access_token") || "";
    this.credit = 0; //Default without gold coins
    this.is_wateremark = 2; //By default watermark
    this.last_use_credit = 2; //The default did not use the gold coin last time
    this.isShowBtnCredit = false; //Whether to show the gold coin on the button
    this.code = 200; //You can generate 200 by default to generate 3008 CREDIT less than 3005 video.
    this.textContentObj = jsonData?.faceSwap?.faceSwapPop01;
    this.appendedDom = options.appendedDom || null; //Binding the current node
    this.appendedPopDom = options.appendedPopDom || null; //Popular binding current node
    this.modalCoins = {
      notenough: "/dist/js/credits/img/icon_big_coins.svg",
      watermarker: "/dist/js/credits/img/icon_mark.svg",
      hd: "/dist/js/credits/img/icon_1080.svg"
    }
  }
  /*FacesWap Gold Coin logic:
 Free process:
 1. There are free time without displaying gold coins labels
 2. In the case of free times and log in, judge whether it is a Pro user, not a Pro user and consume gold coins: pop -up window (whether to remove watermarks)
 3. No free times [Trigger 1: Triggered when web pages enter, display gold coins label (distinguished single plural); trigger two: judge when meting conditions, display gold coins label (distinguish single plural) Number of free times)]]
 Gold coin process: must be displayed by the gold coin label (distinguished single plural) [cannot be generated, pop -up window (lack of gold coins)]
 Banner display method: no gold coins, free times, generated once within a day*/
  setCreditsTextContentObj(name, valData = {}) {
    let str = this.textContentObj[name];
    for (let key in valData) {
      const regex = new RegExp(`{{${key}}}`, "g");
      str = str.replace(regex, valData[key]);
    }
    return str;
  }

  //Display the gold coin prompt on the button
  showBtnCredits({bool, credits, appendDom, type}) {
    console.trace(credits);
    let dom = appendDom.find(".v_step3_btn_credits");
    if (bool) {
      dom.find(".v_step3_btn_credits_span").text(getfsCreditsText("credits", { val: credits }, true));
      dom.show();
      this.isShowBtnCredit = true;
    } else {
      dom.find(".v_step3_btn_credits_span").text(getfsCreditsText("credits", { val: credits }, true));
      dom.hide();
      this.isShowBtnCredit = false;
    }
  }
  getCanface(cookies, action = "face_changing", isClickBtn = false) {
    this.cookies = cookies || getCookie("access_token") || "";
    fetchPost("ai/tool/can-face", {
      action,
    })
      .then((res) => {
        console.log("res", res);
        if (res.code === 200) {
          this.credit = res.data.credit;
          this.is_wateremark = res.data.is_wateremark;
          this.last_use_credit = res.data.last_use_credit;
          // this.banner();
        } else {
          this.code = res.code;
          this.creditPop();
        }
      })
      .catch((err) => {
        console.log(err, "credit error cathch");
      });
  }
  //Show the number of gold coins
  creditPop() {
    //Do you want to display buttons gold coins label
    // this.showBtnCredits();
    if (!isClickBtn) return;
    if (this.credit != 0) {
      //Show consumption of gold coins pop -up window
    } else {
      //The display reaches the online pop -up window
    }
  }
  //Set the banner node
  setBannerHtml() {
    const banner = `
      <div class="swap_credit_banner" id="${this.bannerIdid}">
        <div
          class="swap_credit_banner_container credit_banner_subscription2"
        >
          <div class="swap_credit_title">
            <div class="swap_credit_text">${this.textContentObj.next_level}</div>
            <a
              href="javascript:;"
              class="swap_credit_btn swap_credit_btn_pc swap_credit_btn_photo"
            >
              ${this.textContentObj.Upgrade_Now}
            </a>
          </div>
          <div class="swap_credit_banner_content">
            <div class="credit_item credit_item1">
              <img class="item_icon" src="/dist/js/credits/img/package_tick.svg" />
              <div class="item_text"></div>
            </div>
            <div class="credit_item credit_item2 credit_item_m">
              <img class="item_icon" src="/dist/js/credits/img/package_tick.svg" />
              <div class="item_text">${this.textContentObj.No_watermark}</div>
            </div>
            <div class="credit_item credit_item3">
              <img class="item_icon" src="/dist/js/credits/img/package_tick.svg" />
              <div class="item_text"></div>
            </div>
            <div class="credit_item credit_item4 credit_item_m">
              <img class="item_icon" src="/dist/js/credits/img/package_tick.svg" />
              <div class="item_text">
                ${this.textContentObj.Priority_processing}
              </div>
            </div>
            <div class="credit_item credit_item5">
              <img class="item_icon" src="/dist/js/credits/img/package_tick.svg" />
              <div class="item_text"></div>
            </div>
            <div class="credit_item credit_item6 credit_item_m">
              <img class="item_icon" src="/dist/js/credits/img/package_tick.svg" />
              <div class="item_text">${this.textContentObj.HD_images_and_videos}</div>
            </div>
          </div>

          <a
            href="javascript:;"
            class="swap_credit_btn swap_credit_btn_m swap_credit_btn_photo"
          >
            ${this.textContentObj.Upgrade_Now}
          </a>
        </div>
        <div
          class="swap_credit_banner_container credit_banner_subscription"
        >
          <div class="swap_credit_title">
            <div class="swap_credit_text">
              ${this.textContentObj.credits_additional}
            </div>
            <a
              href="javascript:;"
              class="swap_credit_btn swap_credit_btn_pc swap_credit_btn_photo"
            >
              ${this.textContentObj.Get_More_Credits}
            </a>
          </div>
          <div class="swap_credit_banner_content">
            <div class="credit_item credit_item1">
              <img class="item_icon" src="/dist/js/credits/img/package_tick.svg" />
              <div class="item_text"></div>
            </div>
            <div class="credit_item credit_item3">
              <img class="item_icon" src="/dist/js/credits/img/package_tick.svg" />
              <div class="item_text"></div>
            </div>
            <div class="credit_item credit_item5">
              <img class="item_icon" src="/dist/js/credits/img/package_tick.svg" />
              <div class="item_text"></div>
            </div>
            <div class="credit_item credit_item6 credit_item_m">
              <img class="item_icon" src="/dist/js/credits/img/package_tick.svg" />
              <div class="item_text">${this.textContentObj.HD_images_and_videos}</div>
            </div>
          </div>
          <a
          href="javascript:;"
          class="swap_credit_btn swap_credit_btn_m swap_credit_btn_video"
        >
          ${this.textContentObj.Get_More_Credits}
        </a>
        </div>
      </div>`;
    if (!this.appendedDom) return null;
    this.appendedDom.html(banner);
  }
  showCreditBanner({ bool, showcallback, hidecallback }) {
    const userConfig = window.userRuleConfig;
    let swap_credit_banner = this.appendedDom.find(".swap_credit_banner");
    if (!userConfig?.countrycode) return;
    if (bool && swap_isSameDay()) {
      swap_credit_banner.find(".swap_credit_banner_container").hide();
      if (userConfig.is_subscriber === 1) {
        swap_credit_banner
        .find(".swap_credit_banner_content .credit_item6").hide();
        swap_credit_banner
        .find(".swap_credit_banner_content .credit_item5").hide();
        swap_credit_banner
        .find(".swap_credit_banner_container").css("height", "140px");
        
        let photos_num = 1500;
        let videos_mins = 75;
        if (isMobileDevice()) {
          swap_credit_banner
            .find(".swap_credit_banner_content .credit_item1 .item_text")
            .html(this.setCreditsTextContentObj("photos_or_mins_of_video", { val: photos_num, val2: videos_mins }));
          swap_credit_banner
            .find(".swap_credit_banner_content .credit_item3 .item_text")
            .html(this.setCreditsTextContentObj("Multi-face_swap_for_photos_and_videos"));
        }else{
          swap_credit_banner
            .find(".swap_credit_banner_content .credit_item1 .item_text")
            .html(this.setCreditsTextContentObj("photos_num", { val: photos_num }));
          swap_credit_banner
            .find(".swap_credit_banner_content .credit_item3 .item_text")
            .html(this.setCreditsTextContentObj("videos_mins", { val: videos_mins }));
        }
        swap_credit_banner.find(".credit_banner_subscription").show();
      } else {
        let photos_num = 960;
        let videos_mins = 48;

        if(isMobileDevice()){
          swap_credit_banner
            .find(".swap_credit_banner_content .credit_item1 .item_text")
            .html(this.setCreditsTextContentObj("photos_or_mins_of_video", { val: photos_num, val2: videos_mins }));
          swap_credit_banner
            .find(".swap_credit_banner_content .credit_item3 .item_text")
            .html(this.setCreditsTextContentObj("Multi-face_swap_for_photos_and_videos"));
          swap_credit_banner
            .find(".swap_credit_banner_content .credit_item5 .item_text")
            .html(this.setCreditsTextContentObj("HD_images_and_videos"));
            
        }else{
          swap_credit_banner
            .find(".swap_credit_banner_content .credit_item1 .item_text")
            .html(this.setCreditsTextContentObj("photos_num", { val: photos_num }));
          swap_credit_banner
            .find(".swap_credit_banner_content .credit_item3 .item_text")
            .html(this.setCreditsTextContentObj("videos_mins", { val: videos_mins }));
          swap_credit_banner
            .find(".swap_credit_banner_content .credit_item5 .item_text")
            .html(this.setCreditsTextContentObj("Multi-face_swap_for_photos_and_videos"));
        }
        
        swap_credit_banner
        .find(".swap_credit_banner_content .credit_item6").show();
        swap_credit_banner
        .find(".swap_credit_banner_content .credit_item5").show();
        swap_credit_banner.find(".credit_banner_subscription2").show();
      }

      showcallback?.();
      // window.gtagClick("show_credit_imgbanner");
    } else {
      swap_credit_banner.find(".max_video_width").css({
        paddingBottom: "93px",
      });
      swap_credit_banner.find(".swap_credit_banner_container").hide();
      hidecallback?.();
    }
  }

  //Set the gold coin pop -up window
  setCreditsPopup() {
    
    const creditPopup = `
    <div class="credits_popup_box">
        <div class="credits_popup">
          <div class="popup_close"></div>
          <div class="credit_popup_box">
            <img class="v_message_icon" src="" alt="" style="display: none;">
            <div class="popup_main">
              <div class="popup_title">
                <img src="/dist/js/credits/img/icon_wrong.svg" />
                <span></span>
              </div>
              <div class="popup_content"></div>
            </div>
          </div>
          <div class="popup_btn"><div class="icon_coins"></div><span></span></div>
          <div class="popup_removeWatermark"></div>
        </div>
    </div>
`;
    this.appendedPopDom.append(creditPopup);
    setTimeout(() => {
      /*Clicks on the binding page*/
      this.toBindCss();
    }, 50);
  }
  //Display gold coin pop -up window
  showCreditPopup({ title, content, btn, btnWater,btnFn,btnWaterFn, modalCoins,closeClick, isnotNeedPay }) {
    const creditPop = this.appendedPopDom.find(".credits_popup_box");
    this.btnFn = btnFn
    this.btnWaterFn = btnWaterFn
    creditPop.find(".popup_title span").html(title)
    creditPop.find(".popup_title").removeClass("normal");
    creditPop.find(".popup_content").html(content)
    creditPop.find(".popup_btn span").html(btn)
    if(btnWater){
      creditPop.find(".popup_removeWatermark").html(btnWater)
      creditPop.find(".popup_removeWatermark").show()
    }else{
      creditPop.find(".popup_removeWatermark").hide()
    }
    if (modalCoins && this.modalCoins[modalCoins]) {
      creditPop.find(".popup_title").addClass("normal");
      creditPop.find(".v_message_icon").attr("src", this.modalCoins[modalCoins]);
      creditPop.find(".v_message_icon").show();
    } else {
      creditPop.find(".v_message_icon").hide();
    }
    if (isnotNeedPay) {
      creditPop.find(".popup_btn").addClass("not_need_pay")
    } else {
      creditPop.find(".popup_btn").removeClass("not_need_pay")
    }
    creditPop.find(".popup_close").click(function(){
      closeClick?.() ;
      creditPop.hide()
    })
    creditPop.find(".popup_btn").click(function(){
      btnFn?.()
      creditPop.hide()
    })
    creditPop.find(".popup_removeWatermark").click(function(){
      btnWaterFn?.()
      creditPop.hide()
    })
    setTimeout(() => {
      creditPop.show()
    }, 50);
  }
  
  toBindCss() {
    const css = `
    .credits_popup_box{
      display: none;
      position: fixed;
      width:100vw;
      height:100vh;
      top:0;
      left:0;
      z-index:1000;
    }
    .credit_popup_box {
      display: flex;
      align-items: flex-start;
      min-height: 80px;
    }
    
    .v_message_icon {
      margin-right: 20px;
    }
    .credits_popup_box{
        display: none;
        position: fixed;
        width:100vw;
        height:100vh;
        top:0;
        left:0;
        z-index:1000;
    }
    .credits_popup {
        position: absolute;
        width: 530px;
        background: #FFFFFF 0% 0% no-repeat padding-box;
        box-shadow: 0px 10px 10px #0000001D;
        border: 1px solid #E2E2E2;
        border-radius: 8px;
        top: 50%;
        left: 50%;
        box-sizing: border-box;
        padding: 26px 20px 20px;
        transform: translate(-50%, -50%)
    }

    .credits_popup .popup_close {
        position: absolute;
        right: 18px;
        top: 18px;
        width: 18px;
        height: 18px;
        background-image: url("/dist/js/credits/img/close_hover.png");
        background-repeat: no-repeat;
        background-size: contain;
        cursor: pointer
    }
    
    .credits_popup .popup_title {
        text-align: left;
        font: normal normal bold 20px/24px Sora;
        margin-bottom: 8px;
        color: #F56A2E;
        display: flex;
        align-items: center;
    }

    .credits_popup .popup_title span {
      font: normal normal bold 18px/22px Sora;
      color: #EE1A3D;
      margin-left: 8px;
    }
    
    .credits_popup .popup_title.normal span {
      color: #000;
      margin-left: 0;
    }
    .credits_popup .popup_title.normal img {
      display: none
    }
    
    .credits_popup .popup_content {
        text-align: left;
        margin-bottom: 16px;
        font: normal normal normal 16px/21px Sora;
        letter-spacing: 0px;
        color: #737C90;
    }

    .credits_popup .popup_content .redSpan{
      color: #EE1A3D;
    }

    .credits_popup .popup_content .weightSpan{
      font-weight: bold;
    }
    
    .credits_popup .popup_btn {
        background: transparent linear-gradient(90deg, #FE6D35 0%, #F158B2 100%) 0% 0% no-repeat padding-box;
        border: 1px solid #00000000;
        height: 36px;
        padding:0 36px 0 24px;
        float: right;
        color: #FFFFFF;
        font: normal normal 500 14px/36px Sora;
        display: flex;
        text-align: center;
        align-items:center;
        cursor: pointer;
        transition: all 0.3s ease;
        background: transparent linear-gradient(99deg, #FF5B93 0%, #F64C17 100%) 0% 0% no-repeat padding-box;
    }
    .credits_popup .popup_btn.not_need_pay {
      background: rgb(35, 25, 175);
      padding: 0 36px;
    }
    .credits_popup .popup_btn.not_need_pay .icon_coins {
      display: none;
    }
    .credits_popup .popup_btn .icon_coins{
      width: 22px;
      height: 22px;
      margin-right:8px;
      background-image: url("/dist/js/credits/img/icon_coins.png");
      background-repeat: no-repeat;
      background-size: contain;
    }
    .credits_popup .popup_removeWatermark{
      height: 36px;
      padding:0 36px 0;
      cursor: pointer;
      border: 1px solid #C5C5C5;
      font: normal normal 500 14px/36px Sora;
      margin-right:12px;
      float: right;
    }

    .high_quality_content {
      display: flex;
      justify-content: center;
      position: absolute;
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
      align-items: center;
    }

    .high_quality_content span {
      font: normal normal 600 14px/21px Sora;
      letter-spacing: 0px;
      color: #39325A;
    }

    .high_quality_content img {
      width: 16px;
      height: 16px;
      cursor: pointer;
    }
    
    .high_quality_content .quality_num {
      width: 49px;
      height: 17px;
      font-family: Sora;
      font-size: 11px;
      line-height: 21px;
      font-style: italic; 
      background: rgb(86, 124, 248);
      border-radius: 5px;
      margin-left: 5px;
      color: #fff !important;
      text-align: center;
      background-image: url(/dist/js/credits/img/icon_tag_1080.png);
      background-size: 100% 100%;
    }

    .high_quality_content .dialog_main {
      position: absolute;
      bottom: 35px;
      left: -35px;
      width: 277px;
      height: 96px;
      background: var(--unnamed-color-ffffff) 0% 0% no-repeat padding-box;
      background: #FFFFFF 0% 0% no-repeat padding-box;
      box-shadow: 0px 3px 6px #00000029;
      border: 1px solid #E2E5EE;
      padding: 10px 16px;
      box-sizing: border-box;
      display: none;
    }

    .dialog_content {
      z-index: 2;
    }

    .high_quality_content .dialog_main::after {
      content: "";
      position: absolute;
      bottom: -10px;
      right: 75px;
      width: 16px;
      height: 16px;
      z-index: 1;
      transform: rotate(45deg);
      background: #fff;
      border-right: 2px solid #E2E5EE;
      border-bottom: 2px solid #E2E5EE
    }
    .high_quality_content h4 {
      font: normal normal 600 14px/21px Sora;
      letter-spacing: 0px;
      color: #39325A;
      margin-bottom: 6px;
      text-align: left;
    }
    
    .high_quality_content .dialog_main p {
      font: normal normal normal 12px/16px Sora;
      letter-spacing: 0px;
      color: #39325A;
      text-align: left;
    }

    /* 隐藏input输入框 */
    .customSwitch {
      position: absolute;
      left: -9999px;
    }
    
    /* 设置自定义颜色 */
    .switch {
      position: relative;
      display: inline-block;
      width: 40px;
      height: 20px;
      background-color: rgb(224, 226, 239);
      border-radius: 20px;
      transition: all 0.3s 0s;
      cursor: pointer;
    }
    /* 开关圆球 */
    .switch::after {
      content: "";
      position: absolute;
      top: 3px;
      left: 5px;
      width: 13px;
      height: 14px;
      border-radius: 18px;
      background-color: white;
      transition: all 0.3s 0s;
    }
    
    .customSwitch:checked + .switch::after {
      transform: translateX(18px);
    }
    
    .customSwitch:checked + .switch {
      background-color: #281FAE;
    }

    .switch.checked::after {
      transform: translateX(18px);
    }
    
    .switch.checked {
      background-color: #281FAE;
    }

    .show_details_icon_con {
      width: 16px;
      height: 16px;
      margin: auto 5px;
      display: flex;
      align-items: center;
    }

    .show_details_icon {
      user-select: none;
      -webkit-user-drag: none;
    }
    
    @media (min-width: 1200px) {
        .credits_popup .popup_close:hover {
            background-image: url("/dist/js/credits/img/close.png")
        }
    
        .credits_popup .popup_btn:hover {
          opacity:0.8;
        }

        .high_quality_content .show_details_icon_con:hover .dialog_main {
          display: block
        }

        .credits_popup .popup_removeWatermark:hover {
          border: 1px solid #000000;
        }
    }
    
    @media (max-width: 1200px) {
      .credits_popup .popup_removeWatermark {
        border: 1px solid #D3D3D3;
        text-align: center;
        float: none;
        margin: 0.1rem auto;
        padding: 0 0.3rem;
        width: 3.8rem;
      }
      .credits_popup .popup_title {
        justify-content: center;
        padding-top: 0.8rem
      }

      .credits_popup .popup_title img {
        position: absolute;
        top: 0.3rem;
        width: 0.8rem;
        height: 0.8rem;
      }
      
      .v_message_icon {
        margin-bottom: 0.2rem;
        margin-right: 0;
      }
      .credit_item6 {
        display: none !important;
      }
      .show_details_icon_con {
        position: relative;
      }
      .high_quality_content .dialog_main {
        left: -2.05rem;
        bottom: 0.6rem;
        width: 2.5rem;
      }
      
      .high_quality_content .dialog_main {
        width: 5rem;
      }
      .high_quality_content .dialog_main::after {
        left: 2.02rem
      }
      .credit_popup_box {
        display: flex;
        align-items: center;
        flex-direction: column;
      }
      .high_quality_content {
        width: 100%;
      }
      .high_quality_content span {
        font: normal normal 600 0.24rem / 0.3rem Sora;
      }

        .credits_popup {
            width: 6.3rem;
            padding: .62rem .37rem .36rem
        }
    
        .credits_popup .popup_close {
            top: .24rem;
            right: .24rem;
            width: .32rem;
            height: .32rem
        }
    
        .credits_popup .popup_title {
            font: normal normal bold .34rem/.52rem Sora;
            margin-bottom: .32rem;
            text-align: center
        }
    
        .credits_popup .popup_content {
            font: normal normal 500 .26rem/.39rem Sora;
            text-align: center;
            margin-bottom: .32rem
        }
    
        .credits_popup .popup_btn {
            font: normal normal 400 .3rem/.64rem Sora;
            border-radius: .08rem;
            height: .68rem;
            float: none;
            width: 4.8rem;
            margin: 0 auto;
            padding: 0 0.3rem;
            justify-content: center;
        }

        .credits_popup .popup_btn span {
          font: normal normal 400 .26rem/.64rem Sora;
        }

        .credits_popup .popup_progress_box {
            width: 5.5rem;
            height: .11rem;
            border: .01rem solid #EEECFF;
            border-radius: .1rem;
        }

        .credits_popup .popup_progress {
            border-radius: .1rem;
        }

        .credits_popup.progress{
            padding-bottom:.74rem;
        }
        
        .credits_popup.progress .popup_btn{
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

  //Set up the cache Photo, Video, Multi of the HD switch
  setUserHdCookie(name, value) {
    try {
      const userHdCookie = JSON.parse(getCookie("userHd") || "{}");
      const userinfo = JSON.parse(getCookie("user_info") || "{}");
      const thisuser = userHdCookie[userinfo.id] || {};
      thisuser[name] = value;
      userHdCookie[userinfo.id] = thisuser;
      setCookie("userHd", JSON.stringify(userHdCookie));
    } catch (err) {
      console.error(err);
    }
  }

  //Add HD button
  setHighQualityHtml (highQualityAppendDom, banSwitch, banSwitchCallback, type) {
    const that = this;
    this.is_hd = 2;
    const highQualityHtml = `
      <div class="high_quality_content">
        <span>${this.textContentObj.hq}</span>
        <div class="quality_num">
        </div>
        <div class="show_details_icon_con">
          <img src="/dist/js/credits/img/icon_info.svg" class="show_details_icon" />
          <div class="dialog_main">
            <h4>${this.textContentObj.hq}</h4>
            <p>${this.textContentObj.hqtips}</p>
          </div>
        </div>
        <input class="customSwitch" type="checkbox" ${banSwitch ? "disabled" : ""} />
        <label for="customSwitch" class="switch"></label>
      </div>
    `
    highQualityAppendDom.html(highQualityHtml);
    highQualityAppendDom.find(".switch").off("click").on("click", function (e) {
      if (banSwitch) {
        banSwitchCallback?.();
        return;
      }
      let bool = highQualityAppendDom.find(".customSwitch").attr("checked");
      console.log(highQualityAppendDom.find(".customSwitch"), bool)
      if (bool) {
        highQualityAppendDom.find(".customSwitch").removeAttr("checked");
        highQualityAppendDom.find(".switch").removeClass("checked");
        switch(type) {
          case "multi": 
            gtag("event", "click_faceswap_hdoff_m")
            break;
          case "photo": 
            gtag("event", "click_faceswap_hdoff")
            break;
          case "video": 
            gtag("event", "click_faceswap_hdoff_v")
            break;
        }
      } else {
        highQualityAppendDom.find(".customSwitch").attr("checked", "checked");
        highQualityAppendDom.find(".switch").addClass("checked");
        switch(type) {
          case "multi": 
            gtag("event", "click_faceswap_hdon_m")
            break;
          case "photo": 
            gtag("event", "click_faceswap_hdon")
            break;
          case "video": 
            gtag("event", "click_faceswap_hdon_v")
            break;
        }
      }
      bool = !bool;
      that.is_hd = bool ? 1 : 2;
      that.setUserHdCookie(type, that.is_hd)
    });
    const showPopopover = () => {
      const style = highQualityAppendDom.find(".dialog_main").attr("style") || "";
      if (style?.includes("none") || !style) {
        highQualityAppendDom.find(".dialog_main").show()
      } else {
        highQualityAppendDom.find(".dialog_main").hide()
      }
    }
    if (isMobileDevice()) {
      highQualityAppendDom.find(".show_details_icon_con").off("click").on("click", showPopopover)
    }
  }
}


////演示金币弹窗
// function getfsCreditsText(name, valData = {}, bool = false) {
//   if (bool) {
//     if (valData.val > 1) {
//name += "_p"; // single plural
//     }
//   }
//   let str = this.textContentObj.faceSwapPop02[name];
//   for (let key in valData) {
//     const regex = new RegExp(`{{${key}}}`, "g");
//     str = str.replace(regex, valData[key]);
//   }
//   // console.log(str)
//   return str;
// }
// const creditSystem = new CreditsSystem({
//   bannerId: "photo_banner",
//   appendedDom: $("#photo_Face_swapper_container .swap_credit_banner"),
// });
// creditSystem.setCreditsPopup();
// creditSystem.showCreditPopup({
//   title: getfsCreditsText("Model_not_credits_title"),
//   content: getfsCreditsText("Model_not_credit_span", { val: 123 }),
//   btn:getfsCreditsText("Model_not_credits_btn"),
//   btnWater:getfsCreditsText("Model_not_credits_btn"),
//   btnWaterFn:()=>{
//     alert(12312312)
//   }
// })



// const creditSystem = new CreditsSystem({
//   bannerId: "photo_banner",
//   appendedDom: $("#photo_Face_swapper_container .swap_credit_banner")
// });
// creditSystem.setBannerHtml();
// setTimeout(() => {
//   creditSystem.showCreditBanner({
//     bool:true
//   });
// }, 3000)