let upImageApi = null,
  host = location.host,
  env = (host.includes("vidqu.ai") && !host.includes("test")) ? "pro" : "dev",
  isPro = env === "pro";

const httpsTemp = (str) => {
  return `https://${str}/`;
};
const setSkipURL = () => {
  upImageApi = isPro
    ? httpsTemp("tool-api.vidqu.ai")
    : httpsTemp("tool-api-test.vidqu.ai");
};
setSkipURL();

function copyText(text) {
  const textToCopy = text
  const tempInput = document.createElement('input')
  tempInput.value = textToCopy
  document.body.appendChild(tempInput)
  tempInput.select()
  document.execCommand('copy')
  document.body.removeChild(tempInput)
}

function findKeysByValue(obj, valueToFind) {
  return Object.entries(obj)
    .filter(([key, value]) => value.includes(valueToFind))
    .map(([key, value]) => key)
}

function getUserType() {
  const getUserInfoType = JSON.parse(localStorage.getItem('user_info'))?.usertype
  const userTypeTotal = {
    free: ['free'],
    vip: ['vip', 'mk_vip'],
    vip_expired: ['vip_expired', 'mk_vip_expired']
  }
  return findKeysByValue(userTypeTotal, getUserInfoType).length ? findKeysByValue(userTypeTotal, getUserInfoType).toString() : 'free'
}

function ToolTip(params) {
  const { text = '', type = '', showtime = '' } = params
  $('body').append(`
    <bottom-message
      text="${text}"
      type="${type}"
      showtime="${showtime}"
      >
    </bottom-message>`)
}


class ShareDialog extends HTMLElement {
  constructor() {
    super()
    this.imageShareInfo = {
      action: '',
      imageKey: '',
      text: ''
    }
    this.fromPage = this.getAttribute('fromPage') || ''
    this.shareLink = '';
    this.action = ''

  }

  connectedCallback() {
    this.innerHTML = `
        <div class='preview-mask' style="display: none">
        <div class='preview-box hasMark'>
          <div class='preview-title'>
            <h3 class="preview-title-text">
              <div class="preview-title-img"></div>
              <span>Share</span>
            </h3>
            <div class='preview-close bingClickBtn1'>
              <img class="pc" style="width: 100%;height: 100%;background-size: cover" src="/dist/js/share-dialog/image/window_close.png" alt="">
              <img class="mobile" style="width: 100%;height: 100%;background-size: cover" src="/dist/js/share-dialog/image/winIconClose.png" alt="">
            </div>
          </div>
          <div class='preview-video-box'>
            <img class="show-img" style="display: none" src="" alt="">
            <video class="show-video" style="display: none" src="" alt="" poster="" playsinline='true' x5-video-player-type="h5-page"></video>
            <img class="v_preview_playIcon" src="/dist/js/share-dialog/image/icon_big_video2.svg">
          </div>
          <div class='share-box'>
                <div class='share-title-box'>
                  <div class='share-title'>
                    <span>Share the magic photo with your friends!</span>
                  </div>
                </div>
                <ul class='share-icon-box'>
                  <li class='share-Twitter share-third bingClickBtn6'>
                    <span class='icon'></span>
                  </li>
                  <li class='share-Linkedln share-third bingClickBtn7' style="display: none">
                    <span class='icon'></span>
                  </li>
                  <li class='share-Facebook share-third bingClickBtn8'>
                    <span class='icon'></span>
                  </li>
                  <li class='share-Discord share-third bingClickBtn9'>
                    <span class='icon'></span>
                  </li>
                  <li class='share-divider'>
                  <span class='icon'></span>
                  </li>
                  <li class='share-link share-icon bingClickBtn10'>
                  <span class='icon'></span>
                  </li>
                  </ul>
                  </div>
                  </div>
                  </div>
                  `;
    setTimeout(() => {
      /*Bind some basic verification and rules*/
      this.firstUpdated();
      /*Clicks on the binding page*/
      this.toBindEvent();

      this.toBindCss();
    }, 1000)
  }

  //There are three ways to return to login successfully
  firstUpdated() {
    this.shadowRootEl = document.querySelector('.preview-mask')
    this.showImg = this.shadowRootEl.querySelector('.show-img')
    this.showVideo = this.shadowRootEl.querySelector('.show-video')
    this.showVideoPlay = this.shadowRootEl.querySelector('.v_preview_playIcon')
  }

  showShare(valueObj) {
    if (!valueObj.url || valueObj.url.trim() === '') {
      return false
    }

    // if(valueObj.action === 'cartoonshare'){
    //     gtag("event", "share_carton_result");
    // }else if(valueObj.action === 'facechangingshare'){
    //     gtag("event", "share_faceswap_result");
    // }

    this.shadowRootEl.style.display = '';
    this.getDetais(valueObj);
  }

  toBindCss() {
    const css = `
        .pc {display: block;}
        .mobile {display: none;}
        .preview-mask{
        position: fixed;
        top: 0;
        left:0;
        width: 100vw;
        height: 100vh;
        z-index: 1000;
        background: rgba(0, 0, 0, .4) 0% 0% no-repeat padding-box;
        display:flex;
      }
      .preview-box{
        margin:auto;
        width:752px;
        min-height:569px;
        background-color:#fff;
        padding:14px 16px 27px;
        border-radius: 8px;
        box-sizing:border-box;
      }
      .preview-title{
        position: relative;
        display:flex;
        justify-content:space-between;
        align-items:center;
        font-weight: bold;
      }
      .hasMark::before{
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        background: rgba(255, 255, 255, 0.8);
        border-radius: 8px;
        z-index: 10;
      }
      .hasMark::after{
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 11;
        --d:22px;
        width: 4px;
        height: 4px;
        border-radius: 50%;
        color: #333;
        box-shadow:
          calc(1*var(--d))      calc(0*var(--d))     0 0,
          calc(0.707*var(--d))  calc(0.707*var(--d)) 0 1px,
          calc(0*var(--d))      calc(1*var(--d))     0 2px,
          calc(-0.707*var(--d)) calc(0.707*var(--d)) 0 3px,
          calc(-1*var(--d))     calc(0*var(--d))     0 4px,
          calc(-0.707*var(--d)) calc(-0.707*var(--d))0 5px,
          calc(0*var(--d))      calc(-1*var(--d))    0 6px;
          animation: rotate 2s linear infinite;
      }
      @keyframes rotate {
          from {
              transform: rotate(0deg);
          }
          to {
              transform: rotate(360deg);
          }
      }
      .preview-title-text{
        display:flex;
        align-items:center;
      }
      .preview-title-img {
        margin-right: 3px;
        width: 27px;
        height: 37px; 
        background:url('/dist/js/share-dialog/image/icon_share_mini.svg') center/cover no-repeat; 
      }
      .preview-title h3{
        display: flex;
        align-items: center;
      }
      
      .preview-title h3 span{
            font: normal normal 600 24px/35px Poppins;
        }
      
      .preview-title .preview-close{
        width:32px;
        height:32px;
        border-radius: 8px;
        display:flex;
        justify-content:center;
        align-items:center;
        cursor:pointer;
        margin-right:-4px;
        margin-top:-6px;
      }
      .preview-title .preview-close:hover{
        background: rgba(140, 140, 151, .2) 0% 0% no-repeat padding-box;
      }
      .preview-video-box{
        margin-top:14px;
        width: 720px;
        height: 406px;
        position: relative;
        // border: 4px solid #000000;
        border-radius: 20px;
        overflow: hidden;
        // background: #171717;
      }
      .preview-video-box .v_preview_playIcon{
        position: absolute;
        width: 75px;
        height: 75px;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%);
        cursor: pointer;
        z-index: 1;
        box-shadow: 0 0 10px 2px rgba(0,0,0,.4);
        border-radius: 50%;
      }
      
      .preview-video-box .show-img{
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
      
      .preview-video-box .show-video{
        width: 100%;
        max-height: 100%;
        object-fit: contain;
        background: #171717;
      }
      .preview-operate-box{
        margin-top:24px;
        display:flex;
        gap:24px;
        position:relative;
      }
      .preview-operate-box button{
        background: rgba(139, 61, 255, 1) 0% 0% no-repeat padding-box;
        border-radius: 4px;
        padding:8px;
        border:none;
        outline:none;
        cursor:pointer;
        color: rgba(255, 255, 255, 1);
        font: normal normal normal 14px/19px Sora;
        min-width:138px;
        display:flex;
        align-items:center;
        gap:10px;
        justify-content:center;
      }
      .preview-operate-box button:hover{
        background: rgba(155, 87, 255, 1) 0% 0% no-repeat padding-box;
      }
      .preview-operate-box .preivew-share-button{
        margin-left:auto;
        border: 1px solid rgba(30, 30, 46, 1);
        background: rgba(255, 255, 255, 1) 0% 0% no-repeat padding-box;
        color: rgba(30, 30, 46, 1);
      }
      .preview-operate-box .preivew-share-button .share-text{
        display:flex;
        align-items:center;
        gap:10px;
        justify-content:center;
      }
      .preview-operate-box .preivew-share-button .share-text >span{
        width:22px;
        height:22px;
        background:url('/dist/js/share-dialog/image/video_library_share_black.svg') center/cover no-repeat;
        display:block;
      }
      .preview-operate-box .preivew-share-button:hover .share-text >span{
        background:url('/dist/js/share-dialog/image/video_library_share_hover.svg') center/cover no-repeat;
      }
      .preview-operate-box .preivew-share-button:hover{
        color: rgba(139, 61, 255, 1);
        background: rgba(255, 255, 255, 1) 0% 0% no-repeat padding-box;
        border: 1px solid rgba(139, 61, 255, 1);
      }
      .share-box{
        display:block;
        margin-top:12px;
        border-top:none
      }
      .share-box .share-title-box{
        display:flex;
        justify-content:space-between;
        align-items: flex-start;
        font-size: 16px;
      }
      .share-box .share-title{
        display:flex;
        align-items:center;
        gap:24px;
        margin-top:10px;
        font: normal normal normal 14px/19px Sora;
        color: #1E1E2E;
      }
      .share-box .close-share{
        padding:5px 14px;
        background: rgba(30, 30, 46, .05) 0% 0% no-repeat padding-box;
        border-radius: 0px 0px 6px 6px;
        cursor:pointer;
        flex-shrink:0;
      }
      .share-box .close-share:hover{
        background: rgba(30, 30, 46, .1);
      }
      .share-box .close-share >span{
        width:16px;
        height:10px;
        background:url('/dist/js/share-dialog/image/close_share.svg') center/cover no-repeat;
        display:inline-block;
      }
      .share-box .close-share:hover >span{
        transform:rotateZ(180deg);
        transition:all linear .3s;
      }
      .share-box .share-subtitle{
        margin-top:12px;
        display:flex;
        align-items:center;
        gap:6px;
        font: normal normal normal 13px/18px Sora;
        color: #8C8C97;
      }
      .share-box .share-icon-box{
        margin-top:15px;
        display:flex;
        align-items:center;
        gap:24px;
      }
      .share-box ul li{
        cursor:pointer;
      }
      .share-box ul li .icon{
        width: 60px;
        height: 60px;
        display:block;
      }
      .share-box ul li{
        position:relative;
      }
      .share-box .share-Twitter .icon{
        background:url('/dist/js/share-dialog/image/share_Twitter.svg') center/cover no-repeat;
      }
      .share-box .share-Linkedln .icon{
        background:url('/dist/js/share-dialog/image/share_Linkedln.svg') center/cover no-repeat;
      }
      .share-box .share-Facebook .icon{
        background:url('/dist/js/share-dialog/image/share_Facebook.svg') center/cover no-repeat;
      }
      .share-box .share-Discord .icon{
        display:none;
        background:url('/dist/js/share-dialog/image/share_Discord.svg') center/cover no-repeat;
      }
      .share-box .share-link .icon{
        background:url('/dist/js/share-dialog/image/share_popover_copy_link.svg') center/cover no-repeat;
      }
      .share-box .share-link .icon:hover{
        opacity:0.85;
      }
      .share-box .share-email .icon{
        background:url('/dist/js/share-dialog/image/share_email.svg') center/cover no-repeat;
      }
      .share-box .share-embed >.icon{
        background:url('/dist/js/share-dialog/image/share_embed.svg') center/cover no-repeat;
      }
      .share-box .share-embed{
        position:relative;
      }
      .pro-icon {
        position:absolute;
        left:0;
        bottom:-7px;
        background: #474747 0% 0% no-repeat padding-box;
        border-radius: 10px;
        font: normal normal 500 12px/15px Sora;
        color: #FFFFFF;
        padding: 2px 8px;
        display: flex;
        align-items: center;
        gap: 3px;
        cursor: pointer;
        &:before {
          content: "";
          display: inline-block;
          width: 12px;
          height: 12px;
          background: url(/dist/js/share-dialog/image/pro-icon.svg);
        }
      }
      .share-box .share-third .icon:hover{
        opacity:0.85;
      }
      .share-box.disabled .share-Twitter .icon{
        background:url('/dist/js/share-dialog/image/Twitter_off.svg') center/cover no-repeat;
      }
      .share-box.disabled .share-Linkedln .icon{
        background:url('/dist/js/share-dialog/image/Linkedln_off.svg') center/cover no-repeat;
      }
      .share-box.disabled .share-Facebook .icon{
        background:url('/dist/js/share-dialog/image/Facebook_off.svg') center/cover no-repeat;
      }
      .share-box.disabled .share-Discord .icon{
        background:url('/dist/js/share-dialog/image/Discord_off.svg') center/cover no-repeat;
      }
      .share-box.disabled .share-Twitter:hover .icon{
        background:url('/dist/js/share-dialog/image/Twitter_off_hover.svg') center/cover no-repeat;
      }
      .share-box.disabled .share-Linkedln:hover .icon{
        background:url('/dist/js/share-dialog/image/Linkedln_off_hover.svg') center/cover no-repeat;
      }
      .share-box.disabled .share-Facebook:hover .icon{
        background:url('/dist/js/share-dialog/image/Facebook_off_hover.svg') center/cover no-repeat;
      }
      .share-box.disabled .share-Discord:hover .icon{
        background:url('/dist/js/share-dialog/image/Discord_off_hover.svg') center/cover no-repeat;
      }
      .share-box.disabled .share-icon{
        background:#D4D4D6;
      }
      .share-box.disabled .share-icon:hover{
        background:#8C8C97;
      }
      .share-box .share-divider{
        width:1px;
        height:56px;
        background: #E3E3E3;
      }
      .share-box .share-divider{
        width:1px;
        height:56px;
        background: #E3E3E3;
      }
      .share-box .share-icon{
        width: 60px;
        height: 60px;
        background: #9672CB;
        border-radius:50%;
        display:flex;
        justify-content:center;
        align-items:center;
      }
      .share-box .share-icon:hover{
        background: #B185F3 0% 0% no-repeat padding-box;
      }
      .download{
        position:relative;
      }
      .download >div{
        display:flex;
        align-items:center;
        gap:10px;
      }
      .download .videolist-summary-download-list{
        position:absolute;
        left:0;
        top:50px;
        padding:8px;
        position: absolute;
        background-color: white;
        z-index: 25;
        padding: 8px;
        box-sizing: border-box;
        box-shadow: 0px 3px 6px #1E1E2E33;
        border-radius: 6px;
        min-width: 200px;
        display: none;
      }
      .download:hover .videolist-summary-download-list{
        display: block;
      }

      .download .videolist-summary-download-list::before{
        display:block;
        content:"";
        height:10px;
        width:100%;
        position:absolute;
        left:0;
        top:-10px;
      }

      .download .videolist-summary-download-list li{
        padding: 11px 8px;
        min-width: 184px;
        color: #000000;
        font-size: 14px;
        position: relative;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        border-radius: 4px;
      }
      .download .videolist-summary-download-list li:hover {
        background: rgba(140, 140, 151, 0.2) 0% 0% no-repeat padding-box;
      }
      .download .videolist-summary-download-list li .clarity{
        padding:1px 4px;
        background: rgba(139, 61, 255, .5) 0% 0% no-repeat padding-box;
        border-radius: 2px;
        font: italic normal normal 12px/16px Sora;
        color: rgba(255, 255, 255, 1);
        margin-left:8px;
      }
      .download .videolist-summary-download-list li >img{
        margin-right:8px;
      }
      .download .videolist-summary-download-list li .usertype{
        padding:4px 8px;
        background: rgba(71, 71, 71, 1) 0% 0% no-repeat padding-box;
        border-radius: 10px;
        font: normal normal 500 11px/15px Sora;
        color: rgba(255, 255, 255, 1);
        margin-left:24px;
        display:flex;
        align-items:center;
        justify-content:center;
        gap:3px;
      }
      .download .videolist-summary-download-list li .usertype img{
        margin-top:-2px;
      }
      
      @media (max-width: 1200px) {
        .pc {display: none;}
        .mobile {display: block;}
        .preview-box{
            width: 630px;
            height: 760px;
            min-height: initial;
            padding: 20px 0 53px
        }
        .preview-title{
            margin: 0 20px;
            height: 40px;
        }
        
        .preview-title-img {
            width: 27px;
            height: 37px;  
        }
        
        .preview-title h3 span{
            font-size: 30px;
            font-weight: bold;
        }
        
        .preview-title .preview-close{
            width: 40px;
            height: 40px;
        }
        .preview-video-box{
            margin-top: 28px;
            width: 100%;
            height: 450px;
            border: none
        }
        .share-box{
            margin-top: 24px;
        }
        
        .share-box .share-title-box .share-title {
            margin-left: 20px;
            font-size: 24px;
            padding-right: 10px;
            box-sizing: border-box;
            font: normal normal normal .24rem/.36rem Titillium Web;
            color:#6F6F6F;
        }
        
        .share-box .share-icon-box{
            margin-top: 20px;
            gap: 24px;
            padding-left:20px;
        }
        .share-box .share-icon{
            width:80px;
            height:80px;
        }
        
        .share-box ul li .icon{
            width:80px;
            height:80px;
        }
        
        .share-box.disabled .share-icon{
            background: #8C8C97;
        }
        
        .share-box.disabled .share-Twitter .icon{
            background:url('/dist/js/share-dialog/image/Twitter_off_hover.svg') center/cover no-repeat;
        }
        .share-box.disabled .share-Linkedln .icon{
            background:url('/dist/js/share-dialog/image/Linkedln_off_hover.svg') center/cover no-repeat;
        }
        .share-box.disabled .share-Facebook .icon{
            background:url('/dist/js/share-dialog/image/Facebook_off_hover.svg') center/cover no-repeat;
        }
        .share-box.disabled .share-Discord .icon{
            background:url('/dist/js/share-dialog/image/Discord_off_hover.svg') center/cover no-repeat;
        }
        
        .share-box .share-third .icon:hover{
            opacity: 1;
        }
        .share-box .share-link .icon:hover{
            opacity: 1;
        }
      }
      
      @media (max-width: 768px) {
        .preview-box{
            width: calc(630 / 750 * 100vw);
            height: calc(880 / 750 * 100vw);
            padding: calc(20 / 750 * 100vw) 0 calc(53 / 750 * 100vw)
        }
        .preview-title{
            margin: 0 calc(20 / 750 * 100vw);
            height: calc(56 / 750 * 100vw);
        }
        
        .preview-title-img {
            width: calc(27 / 750 * 100vw);
            height: calc(37 / 750 * 100vw);  
        }
        
        .preview-title h3 span{
            font-size: calc(30 / 750 * 100vw);
        }
        
        .preview-title .preview-close{
            width: calc(40 / 750 * 100vw);
            height: calc(40 / 750 * 100vw);
        }
        .preview-video-box{
            margin-top: calc(60 / 750 * 100vw);
            width: calc(630 / 750 * 100vw);
            height: calc(450 / 750 * 100vw);
            display: flex;
            align-items: center;
        }
        .share-box{
            margin-top: calc(40 / 750 * 100vw);
        }
        .share-box .share-icon-box{
            gap: calc(14 / 750 * 100vw)
        }
        .share-box .share-icon{
            width:calc(80 / 750 * 100vw);
            height:calc(80 / 750 * 100vw);
        }
        
        .share-box ul li .icon{
            width:calc(80 / 750 * 100vw);
            height:calc(80 / 750 * 100vw);
        }
        
        .share-box .share-title-box .share-title {
            margin-left: 20px;
            font-size: 14px;
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

  toBindEvent() {
    this.shadowRootEl.querySelector('.bingClickBtn1').onclick = (e) => {
      this.handleMark(true);
      this.close(e)
    };

    this.shadowRootEl.querySelector('.bingClickBtn6').onclick = this.openTwitter.bind(this);
    this.shadowRootEl.querySelector('.bingClickBtn7').onclick = this.openLinkedIn.bind(this);
    this.shadowRootEl.querySelector('.bingClickBtn8').onclick = this.openFacebook.bind(this);
    this.shadowRootEl.querySelector('.bingClickBtn9').onclick = this.openDiscord.bind(this);
    this.shadowRootEl.querySelector('.bingClickBtn10').onclick = this.copyLink.bind(this);
    this.showVideoPlay.onclick = this.playVideo.bind(this);
    this.showVideo.onclick = () => {
      if (!this.showVideo.paused) {
        this.showVideo.pause();
        this.showVideoPlay.style.display = '';
      }
    }
    const that = this;
    this.showVideo.addEventListener('pause', function () {
      that.showVideoPlay.style.display = '';
    })
    this.showVideo.addEventListener('play', function () {
      that.showVideoPlay.style.display = 'none';
    })
  }

  //Request details page parameters
  async getDetais({ url, text, action, imageKey, videoKey, poster, id, lan = "en", task_id, _idx = -1, backParams }) {
    this.action = action;
    this.task_id = task_id;
    this._idx = _idx;
    this.lan = lan;
    this.backParams = backParams;
    /*Share information content*/
    this.imageShareInfo = {
      action: action,
      imageKey: imageKey,
      videoKey: videoKey,
      text: text,
      id: id
    }
    this.showImg.src = url;
    this.shareLink = upImageApi + this.imageShareInfo.action + '-' + btoa(this.imageShareInfo.imageKey + ',' + this.imageShareInfo.id);

    this.showVideo.style.display = 'none'
    this.showVideoPlay.style.display = 'none'

    this.showImg.style.display = 'none'
    // if(action === 'texttovideo'){
    //   this.shareLink = upImageApi+this.imageShareInfo.action+'-'+btoa(this.imageShareInfo.imageKey +','+ this.imageShareInfo.videoKey);
    // }
    if ((action === 'texttovideo' || action === "videotranslateshare") && !imageKey.includes('.gif')) {
      this.showVideo.src = url;
      this.showVideo.poster = poster;
      this.showVideo.onloadedmetadata = () => {
        this.showVideo.style.display = ''
        this.showVideoPlay.style.display = ''
      }
      this.showVideo.load();
    } else {
      this.showImg.src = url;
      this.showImg.onload = () => {
        this.showImg.style.display = ''
      }
    }
    this.backParams && (await this.updateShareLink());
  }

  get(url, data, headers = {}) {
    return fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    }).then((response) => response.json());
  }

  findEleByClass(name) {
    return this.shadowRootEl.querySelector(name)
  }

  playVideo() {
    const that = this
    this.showVideoPlay.style.display = 'none';
    this.showVideo.play();
  }

  close(e) {
    e && e.stopPropagation()
    this.shadowRootEl.style.display = 'none';
    if (this.showVideo.src) {
      if (!this.showVideo.paused) {
        this.showVideo.currentTime = 0
        this.showVideo.pause();
      }
    }
  }

  setLocalStorage(taskId = "") {
    let getLocal = localStorage.getItem("shareLinks");
    if (!getLocal) {
      const obj = {};
      obj[taskId] = this.shareLink;
      localStorage.setItem("shareLinks", JSON.stringify(obj));
    } else {
      try {
        getLocal = JSON.parse(getLocal);
        localStorage.setItem(
          "shareLinks",
          JSON.stringify({
            ...getLocal,
            [taskId]: this.shareLink,
          })
        );
      } catch (error) {
        console.log("error");
      }
    }
  }
  getLocalStorage(taskId = "") {
    let getLocal = localStorage.getItem("shareLinks");
    if (getLocal) {
      try {
        getLocal = JSON.parse(getLocal);
        if (getLocal[taskId]) {
          this.shareLink = getLocal[taskId];
          this.imageShareInfo.shareLink = this.shareLink;
          return true;
        }
        return false;
      } catch (error) {
        return false;
      }
    }
  }
  async handleMark(bool = false) {
    const hasMark = document.querySelector(".preview-box");
    if (!bool) {
      if (hasMark) hasMark.classList.remove("hasMark");
    } else {
      if (hasMark) hasMark.classList.add("hasMark");
    }
  }
  async updateShareLink() {
    let idJoin = this.task_id;
    if (this._idx !== -1) {
      idJoin = `${this.action}${this.task_id}-${this._idx}`;
    }
    if (!this.getLocalStorage(idJoin)) {
      const getTaskRes = await fetchPost(`ai/tool/get-task`, {
        id: this.task_id,
      },TOOL_API).catch((e) => {
        console.log(e);
        this.handleMark();
      });
      const code = getTaskRes?.code;
      const additionalData = getTaskRes?.data?.additional_data;
      if (code === 200 && additionalData) {
        const params = this.backParams(additionalData);
        if (params) {
          const shareRes = await fetchPost(
            `ai/source/share-link`,
            params,
            TOOL_API
          ).catch((e) => {
            console.log(e);
            this.handleMark();
          });
          const code2 = shareRes?.code;
          const url2 = shareRes?.data?.url;
          if (code2 === 200 && url2) {
            this.shareLink = `${upImageApi}${(url2 || "").substring(1)}${
              this.lan ?? "en"
            }`;
            this.imageShareInfo.shareLink = this.shareLink;
            this.setLocalStorage(idJoin);
            this.handleMark();
          } else {
            this.handleMark();
          }
        } else {
          this.handleMark();
        }
      } else {
        this.handleMark();
      }
    } else {
      this.handleMark();
    }
  }

  openDiscord() {
    // if(this.action === 'spacefaceshare'){
    //     gtag("event", "share_carton_discord");
    // }
    const clientId = '1163417715940265996' //Discord application ID
    const redirectUrl = 'cde63f391315c1826177bff70b4c74853f5848eb32d54c651d1498948bc95e28' //Discord applications are redirected URL, which is the public key

    //const clientid = '1160809539944325241' // Discord application ID
    //const redirecturl = '5FB33727A81DEC77EC77E337A508CF61C672B040C5E530B0B688DFD07F6EE9B33E' // Discord App Stone URL, which is the public key

    const scope = 'webhook.incoming'
    const authUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_url=${redirectUrl}&response_type=code&scope=${scope}`

    //For the first time, you need to obtain authorization
    const popup = window.open(authUrl, 'Discord Auth', 'width=500,height=600')
    localStorage.setItem('imageShareInfo', JSON.stringify(this.imageShareInfo))
    //After the new window is loaded, you can monitor the closing incident
    popup.addEventListener('load', () => {
      //Some operations can be performed here, such as monitoring the closure of the new window
    })
  }

  openFacebook() {
    if(this.action === 'aiattractivenesstestshare'){
      gtag("event", "share_attracttest_fb");
  }
    if (this.action === "videotranslateshare") {
      gtag("event", "share_videotranslate_fb");
    } 
    const shareText = `#${this.imageShareInfo.text}`
    window.open(`https://www.facebook.com/sharer.php?u=${this.shareLink}?play_source=Facebook&text=${encodeURIComponent(shareText)}`, '_blank')
  }

  openLinkedIn() {
    const shareText = `#${this.imageShareInfo.text}`
    let linkedinShare = encodeURIComponent(`${this.shareLink}?play_source=LinkedIn`)
    window.open(`https://www.linkedin.com/shareArticle?spm=&mini=true&url=${linkedinShare}&text=${shareText}`, '_blank')
  }

  openTwitter() {
    if(this.action === 'aiattractivenesstestshare'){
      gtag("event", "share_attracttest_tw");
  }
    if (this.action === "videotranslateshare") {
      gtag("event", "share_videotranslate_tw");
    } 
    const shareText = `#${this.imageShareInfo.text}`
    window.open(`https://twitter.com/intent/tweet?url=${this.shareLink}?play_source=Twitter&text=${encodeURIComponent(shareText)}`, '_blank')
  }

  copyLink() {
    if(this.action === 'aiattractivenesstestshare'){
      gtag("event", "share_attracttest_link");
  }
    if (this.action === "videotranslateshare") {
      gtag("event", "share_videotranslate_link");
    } 
    copyText(this.shareLink)
    try {
      ToolTip({
        text: "Copied successfully"
      })
    } catch (err) {
      ToolTip({
        text: 'Copied failed'
      })
    }
  }

  changeTips(obj) {
    if (obj.title) {
      let _el = this.shadowRootEl.querySelector('.preview-title-text span')
      _el.innerHTML = obj.title;
    }

    if (obj.content) {
      let _el = this.shadowRootEl.querySelector('.share-title span')
      _el.innerHTML = obj.content;
    }
  }
}

//Register a custom component
customElements.define('share-dialog', ShareDialog);
