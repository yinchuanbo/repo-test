



function getCreditsText(name, valData = {}, bool = false) { 
  if (bool) {
      let num = valData.val;
      if (typeof num === 'string') {
          let strWithoutCommas = num.replace(/,/g, '');
          num = parseFloat(strWithoutCommas)
      }

      if (num > 1 || (num<1 && num>0)) {
          name += '_p'  
      }
  }
  let str = jsonData['header-credit'][name]
  for (let key in valData) {
      const regex = new RegExp(`{{${key}}}`, 'g')
      str = str.replace(regex, valData[key])
  }
  return str
}


class HeaderCredit extends HTMLElement {
  constructor() {
    super();
    this.credits = null;  
    this.credit_expired_at = null;  
    this.is_credit_subscription = null; 
    this.subscription_status = false;  
    this.cssData = {};
  }

  getCreditsData(){
    if(!getCookie('access_token')){
      return {};
    }
    return {
      credits: this.credits,
      credit: this.credits,
      is_credit_subscription: this.is_credit_subscription,
      subscription_status: this.subscription_status,
    }
  }

  async connectedCallback() {
    if (this.showCreditBox()) {
      this.innerHTML = `
        <div class="credit_content">
          <img class="credit_icon" src="/dist/img/ai-tool-pricing/icon_coins.svg" alt="">
          <div class="credit_num">0 credits</div>
        </div>
        <div class="credit_popup">
          <div class="pop_container">
            <div class="pop_title">What are credits left?</div>
            <div class="pop_span">Credits left can be used to translate videos with Al Video Translation.</div>
          </div>
          <div class="pop_get_credit">
            <img class="bg_icon" src="/dist/img/header/pic_banner.png" alt="">
            <div class="get_credit_title">Get credits for:</div>
            <div class="get_credit_content">
              <div class="get_credit_list item1">
                <img class="checked_icon" src="/dist/img/header/tip_icon_hook.svg" alt="">
                <div class="list_span">20 credits of video to translate</div>
              </div>
              <div class="get_credit_list item2">
                <img class="checked_icon" src="/dist/img/header/tip_icon_hook.svg" alt="">
                <div class="list_span">Fast Video Processing</div>
              </div>
            </div>
            <div class="get_now">
              Get Now
            </div>
          </div>
        </div>
      `;
      
      this.cssData = {
        'nav-logo-flex': $('#header .nav-header-fixed .nav-header-middle .nav-logo').css('flex'),
        'header_user-display': $('#header .nav-header-fixed .nav-header-middle #header_user').css('display'),
        'toggle-mobile-nav-margin-left': $('#header .nav-header-fixed .nav-header-middle #toggle-mobile-nav').css('margin-left'),
      }
      this.addEventLogin();
      await this.init();
    } else {
      this.remove();
    }
  }

  showCreditBox() {
    let cataLogueAfter = window.location.pathname.replace(/^\/preview/, "");
    let pageArr = ["/video-translator.html", "/face-swap.html", "/multiple-face-swap.html", "/credit-history.html", "/pricing.html"];
    return pageArr.includes(cataLogueAfter);
  }

  async init() {
    this.access_token = getCookie("access_token") ? getCookie("access_token") : "";
    if(!this.access_token){
      $(this).css({
        display: 'none'
      });
      if(this.cssData['nav-logo-flex']){
        $('#header .nav-header-fixed .nav-header-middle .nav-logo').css({
          flex: this.cssData['nav-logo-flex']
        })
        $('#header .nav-header-fixed .nav-header-middle #header_user').css({
          display: this.cssData['header_user-display']
        })
        $('#header .nav-header-fixed .nav-header-middle #toggle-mobile-nav').css({
          'margin-left': this.cssData['toggle-mobile-nav-margin-left']
        })
      }
      
      
    }else{
      await this.getCreditInfo();
      $(this).css({
        display: 'block'
      });
    }
    await new Promise((resolve, reject) => {
      setTimeout(()=>{resolve()},2000)
    })
    this.dispatchEvent(new CustomEvent("creditsLoad"));
  }

  async updateInfo(data) {
    if (data) {
      this.credits = data.credit;
      this.credit_expired_at = data.credit_expired_at;
      this.is_credit_subscription = data.is_credit_subscription;
      this.subscription_status = data.subscription_status;
      this.county_type = data.county_type;
      this.updateNode();
      this.setPopoverNode()
    } else {
      await this.getCreditInfo();
    }
  }
  
  setPopoverNode() {
    if (!["/face-swap.html", "/multiple-face-swap.html"].includes(document.location.pathname)) {
      return
    }
    const item1Node = $(this).find(".item1 .list_span");
    const item2Node = $(this).find(".item2 .list_span");
    const nodeBtn = $(this).find(".get_now");
    if (this.is_credit_subscription != 1) {
      item1Node.html(getCreditsText("photos_num", { val: 960 }));
      item2Node.html(getCreditsText("videos_mins", { val: 48 }));
      nodeBtn.text(getCreditsText("Get_Now"))
    } else {
      nodeBtn.text(getCreditsText("More_credits"))
      item1Node.html(getCreditsText("photos_num", { val: 1500 }));
      item2Node.html(getCreditsText("videos_mins", { val: 75 }));
    }
  }

  getCreditInfo() {
    const that = this;
    return new Promise((resolve, reject) => {
      fetchPost("api/user/info",{},TOOL_API).then((res) => {
        if(res?.code === 200 && res?.data){
          that.updateInfo(res.data);
        }else{
          console.error(res);
        }
        resolve();
      }).catch(err=>{
        console.error(err);
        resolve();
      });
    })
  }

  updateNode(){
    $(this).find('.credit_num').text(getCreditsText('credit',{val: this.credits},true));
    $(this).find('.pop_title').text(getCreditsText('video_translate_title'));
    $(this).find('.pop_span').text(getCreditsText('video_translate_span'));
    $(this).find('.get_credit_title').text(getCreditsText('Get_credits_for'));
    $(this).find('.get_now').text(getCreditsText('Get_Now'));
    const go_credits = $("#go_credits");
    if (go_credits) {
      go_credits.find(".credits_num span").text(this.credits)
    }
    if(isMobileDevice()){
      $('#header .nav-header-fixed .nav-header-middle #header_user').css({
        display: 'none'
      })
      const head_portrait = JSON.parse(getCookie("user_info") || "{}").head_portrait || "https://www.vidnoz.com/img/_common/head.png";
      $('#m_login_user').html(
        `
          <img class="m_login_user" src="${head_portrait}" />
          <div>${getCreditsText('credit',{val: ""})}: ${this.credits}</div>
        `
      )
      if (getCookie("access_token")) {
        $('#m_login_user').show();
        $("#m_login_user").click(function () {
          window.open("/credit-history.html");
        })
      }
    }
  }

  addEventLogin(){
    const that = this;
    $(".signout").click(() => {
      setTimeout(()=>{
        that.init();
      },50);
    });
    let login_Modal = document.querySelector('my-component');
    login_Modal.addEventListener('loginsuccess', function (event) {
      that.init();
    })
    this.eventMethod();
  }

  eventMethod(){
    $(this).on('mouseenter',()=>{
      if(cataLogueAfter.includes('video-translator.html')){
        gtag("event", "show_videotranslate_creditspop");
      }
      if(cataLogueAfter.includes('face-swap.html')){
        gtag("event", "show_faceswap_creditpopover");
      }
      if(cataLogueAfter.includes('multiple-face-swap.html')){
        gtag("event", "show_mulfaceswap_creditpopover");
      }
    })
    $(document).on('mouseup',(event)=>{
      if (!$(event.target).closest(".credit_popup").length) {
        $(".credit_popup").removeClass("credit_popup_show");
      }
    })
    $(this).find('.credit_content').click(()=>{
      if(cataLogueAfter.includes('video-translator.html')){
        gtag("event", "click_videotranslate_credits");
      }
      if(cataLogueAfter.includes('face-swap.html')){
        gtag("event", "click_faceswap_creditnav");
      }
      if(cataLogueAfter.includes('multiple-face-swap.html')){
        gtag("event", "click_mulfaceswap_creditnav");
      }
      if (isMobileDevice()) {
        $(".credit_popup").addClass("credit_popup_show");
        return;
      }
      // window.open('/pricing.html')
    })
    $(this).find('.get_now').click(()=>{
      if(cataLogueAfter.includes('video-translator.html')){
        gtag("event", "click_videotranslate_getbtn");
      }
      if(cataLogueAfter.includes('face-swap.html')){
        gtag("event", "click_faceswap_creditpopover");
      }
      if(cataLogueAfter.includes('multiple-face-swap.html')){
        gtag("event", "click_mulfaceswap_creditpopover");
      }
      // window.open('/pricing.html')
    })

  }
}
let cataLogueAfter = window.location.pathname.replace(/^\/preview/, "");
let pageArr = ["/video-translator.html", "/face-swap.html", "/multiple-face-swap.html", "/credit-history.html", "/pricing.html"];
if(pageArr.includes(cataLogueAfter)){
  window.addEventListener("DOMContentLoaded",function(){
    customElements.define("header-credit", HeaderCredit);
    if (isMobileDevice()) {

    }
    customElements.upgrade(document.querySelector('header-credit'))
  })
}