var TOOL_API =
  location.host.includes("vidqu.ai") && !location.host.includes("test")
    ? "https://tool-api.vidqu.ai/"
    : "https://tool-api-test.vidqu.ai/";
var Vidnoz_API = (location.host.includes("vidqu.ai") && !location.host.includes("test-"))
  ? "https://api.vidnoz.com"
  : "https://api-test.vidnoz.com";
var XTASKVERSION = "2.0.0";

/*
 *ajax请求方法
 *@{param.url} 接口地址
 *@{param.type} 接口请求方式 get post
 *@{param.data} 接口请求数据
 */
let access_token = getCookie("access_token") ? getCookie("access_token") : "";
// let refresh_token = getCookie("refresh_token") ? getCookie("refresh_token") : '';
let refresh_token = getCookie("refresh_token")
  ? getCookie("refresh_token")
  : "";
let allowToken = ["/web/recorder/newsharepage.html"]; //定义不需要token的页面
// let notTokenFlag = allowToken.includes(currentPagepath);
let notTokenFlag = false;
let request_header = "";
function jqAjaxPromise(param, progressFun = () => { }, origin = "web") {
  access_token = getCookie("access_token") ? getCookie("access_token") : "";
  // refresh_token = localStorage.getItem("refresh_token") ? localStorage.getItem("refresh_token") : '';
  refresh_token = getCookie("refresh_token") ? getCookie("refresh_token") : "";
  let url = TOOL_API + param.url;
  request_header = getCookie("access_token") ? { Authorization: "Bearer " + access_token } : { Authorization: "" };
  request_header['X-TASK-VERSION'] = XTASKVERSION;
  request_header['Request-Language'] = 'de';
  request_header['Request-Origin'] = origin;
  return new Promise((resolve, reject) => {
    let ajaxTimeOut = $.ajax({
      url: url,
      type: param.type || "GET",
      // headers: { "Authorization": 'Bearer ' + access_token },
      headers: {
        ...request_header,
        ...param.headers,
        "Request-Origin": origin
      },
      data: { origin, ...(param.data || "") },
      cache: true,
      async: true,
      timeout: 300000,
      xhrFields: {
        withCredentials: true,
      },
      xhr: () => {
        var xhr = $.ajaxSettings.xhr();

        if (xhr) {
          xhr.onprogress = function (e) {
            if (e.lengthComputable) {
              progressFun(e);
            }
          };
        }
        return xhr;
      },
      success: function (data) {
        data = typeof data === "string" ? JSON.parse(data) : data;
        if (data.code == 401) {
          if (!notTokenFlag) {
            requestAtoken(refresh_token);
          }
          // hack
          param.cb401 && param.cb401({
            data,
            resolve,
            reject
          })
        } else {
          resolve(data);
        }
      },
      error: function (error) {
        reject(error);
      },
      complete: function (XMLHttpREQUEST, status) {
        if (status === "timeout") {
          ajaxTimeOut.abort();
        }
      },
    });
    if (param.cancelToken) {
      param.cancelToken.promise.then(() => {
        reject({ status: "canceled" });
        ajaxTimeOut.abort();
      });
    }
  });
}


// 系统判断
function judgeClient() {
  let client = "";
  if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
    client = "ios";
  } else if (/(Android)/i.test(navigator.userAgent)) {
    client = "android";
  } else {
    client = "pc";
  }
  return client;
}
// 懒加载
function lazyLoad(preloadHeight = 100) {
  const elements = document.querySelectorAll("[data-original]");
  const type = judgeClient();
  const loadImage = function (element) {
    if (element.nodeName == "IMG" || element.nodeName == "IFRAME") {
      if (element.src) {
        element.src = element.getAttribute("data-original");
      } else {
        element.setAttribute("src", element.getAttribute("data-original"));
      }
      element.addEventListener("load", function () {
        element.removeAttribute("data-original");
      });
    } else {
      const datasrc = element.getAttribute("data-original");
      if (!datasrc.includes("`")) {
        element.style.backgroundImage = "url(" + element.getAttribute("data-original") + ")";
      } else {
        const srcArr = datasrc.split("`");
        let bgStr = "";
        srcArr.forEach((item) => {
          bgStr += "url(" + item + "),";
        });
        bgStr = bgStr.substring(0, bgStr.lastIndexOf(","));
        element.style.backgroundImage = bgStr;
      }

      if (datasrc.includes("---")) {
        var srcArr = datasrc.split("---");
        if (type === "pc") {
          element.style.backgroundImage = "url(" + srcArr[0] + ")";
        } else {
          element.style.backgroundImage = "url(" + srcArr[1] + ")";
        }
      }

      element.addEventListener("load", function () {
        element.removeAttribute("data-original");
      });
    }
  };
  let intersectionObserver = new IntersectionObserver(
    function (elements, observer) {
      elements.forEach(function (element) {
        if (element.isIntersecting) {
          if (element.target.className.includes("allin_bg")) {
            let li_list = element.target.parentNode.parentNode.parentNode.querySelectorAll("li");
            li_list.forEach((item) => {
              let img = item.querySelector("img");
              if (img.getAttribute("data-original")) {
                loadImage(img);
              }
            });
          } else if (
            element.target.className.includes("comment_person") ||
            element.target.className.includes("comment_star")
          ) {
            let li_list = element.target.parentNode.parentNode.parentNode.parentNode.querySelectorAll("li");
            if (li_list.length) {
              li_list.forEach((item) => {
                let imgEl = item.querySelectorAll("img");
                imgEl.forEach((img) => {
                  if (img.getAttribute("data-original")) {
                    loadImage(img);
                  }
                });
              });
            }
          } else {
            loadImage(element.target);
          }
          observer.unobserve(element.target);
        }
      });
    },
    {
      rootMargin: `0px 0px ${preloadHeight}px 0px`,
    }
  );
  elements.forEach((element) => {
    intersectionObserver.observe(element);
  });
}
const currentDate = new Date();
const timezoneOffset = currentDate.getTimezoneOffset();
const browserLanguage = navigator.language || navigator.userLanguage;
var currentCountry = ""; // 当前接口返回的国家代码 大写
// 获取访问白名单（针对公司ip）
const getWhiteList = () => {
  fetchPost(`api/site/mio-config?t=${new Date().getTime()}`, {}, TOOL_API).then((res) => {
    if (res.code === 200) {
      // currentCountry = res.data.current_country.toUpperCase()
      if (!res.data.is_in_ip_whitelist && timezoneOffset === -480 && browserLanguage.toLowerCase() === "zh-cn") {
        document.body.innerHTML = '<div class="shield-page">The website is under construction.</div>';
        document.head.innerHTML = `
                    <style>
                          *{
                              padding:0;
                              margin:0;
                            }
                          body{
                            background-image: linear-gradient(to right, rgb(241,238,255), rgb(254,254,255));
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            width: 100vw;
                            height: 100vh;
                            overflow: hidden;
                          }
                          .shield-page{
                            font: normal normal 600 30px/30px Poppins;
                            color: #785EEE;
                          }
                          @media (max-width: 768px){
                            .shield-page{
                              font: normal normal 600 20px/20px Poppins;
                            }
                          }
                     </style>`;
      }
    } else {
      console.log("err");
    }
  });
};
getWhiteList();

function $id(selector) {
  var getSelector = document.getElementById(selector);
  if (getSelector) return getSelector;
  return null;
}

function goApp() {
  window.location.href = "/app";
}

function gofaceSwap() {
  window.location.href = "/faceswap.html";
}

// window.addEventListener("resize", function () {
//   scrollLeft()
// });

function isShowFooterCookie() {
  const res = localStorage.getItem("cookieFooter");
  const now = new Date().getTime();
  if (now > res || res === null) {
    $(".fix-footer").show();
  }
}
/**
 *
 * @param {fn} 回调函数
 * @param {productName} 跳转登录产品默认ai
 * @param {isReloading} 是否刷新页面 默认不刷新
 */
function showLoginWindow(obj = {}) {
  const { fn = () => { }, isReloading = false, wait = null, closeFn = () => { } } = obj;
  document.body.style.overflow = "hidden";

  // 成功后执行函数
  $("my-component")
    .off("loginsuccess")
    .on("loginsuccess", async (event) => {
      if (event?.detail) {
        fn(event.detail)
      } else {
        fn()
      }
    })
    .off("closeLoginDialog")
    .on("closeLoginDialog", () => {
      closeFn();
      console.log("login closed");
      document.body.style.overflow = "auto";
    });
  if (isReloading) {
    localStorage.setItem("toolsPosition", isReloading);
  } else {
    localStorage.setItem("toolsPosition", "false");
  }
  $("my-component").length && $("my-component")[0].showLoginDialog(wait);
}
//设置cookie
function setCookie(c_name, value, expiredays) {
  var exdate = new Date();
  exdate.setDate(exdate.getDate() + expiredays);
  var host = location.hostname.includes(".vidqu.ai") ? ".vidqu.ai" : location.hostname;
  var c_value =
    encodeURIComponent(value) +
    (expiredays == null ? "" : ";expires=" + exdate.toUTCString()) +
    ";path=/;domain=" +
    host;
  document.cookie = c_name + "=" + c_value;
}
// 获取cookie
function getCookie(cookieName) {
  const allCookies = document.cookie;
  const cookiesArray = allCookies.split(";");

  for (const cookie of cookiesArray) {
    const [key, value] = cookie.trim().split("=");
    if (key === cookieName) {
      return decodeURIComponent(value);
    }
  }

  return null;
}

function fetchPost(url, data, base_API, headers = {}) {
  return new Promise((resolve, reject) => {
    fetch(base_API + url, {
      method: "POST",
      headers: {
        ...{
          "Content-Type": "application/json",
          "Request-Origin": "vidqu",
          "Request-Language": "de",
          Authorization: "Bearer " + getCookie("access_token") || "",
        },
        ...headers,
      },
      body: JSON.stringify(data),
    })
      .then((resp) => {
        resolve(resp.json());
      })
      .catch((err) => {
        reject(err);
      });
  });
}
function fetchGet(url, base_API = TOOL_API, headers = {}) {
  return new Promise((resolve, reject) => {
    fetch(base_API + url, {
      method: "GET",
      headers: {
        ...{
          "Content-Type": "application/json",
          "Request-Origin": "vidqu",
          "Request-Language": "de",
          Authorization: "Bearer " + getCookie("access_token") || "",
        },
        ...headers,
      },
    })
      .then((response) => resolve(response.json()))
      .catch((err) => reject(err));
  });
}
// PUT方法封装
var fetchPut = function (url, data, BASE_API = "", headers = {}) {
  return new Promise((resolve, reject) => {
    fetch(BASE_API + url, {
      method: "PUT",
      headers: {
        ...{
          "X-TASK-VERSION": "2.0.0",
        },
        ...headers,
      },
      body: data,
    })
      .then((response) => resolve(response.status))
      .catch((err) => reject(err));
  });
};

function initLoginDialog(path = "") {
  const _url = "/dist/js";
  addScripTag(_url + "/commonSignin/login-dialog.js");
  addScripTag(_url + "/confirm-dialog/index.js");

  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = _url + "/commonSignin/selfComponent.css";
  const head = document.head || document.getElementsByTagName("head")[0];
  head.appendChild(css);
  const myComponent = document.createElement('my-component');
  document.body.appendChild(myComponent);
}

const addScripTag = (src) => {
  const script = document.createElement("script");
  script.src = src;
  script.type = "module";
  const head = document.head || document.getElementsByTagName("head")[0];
  head.appendChild(script);
};

const addcssTag = (src) => {
  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = src;
  const head = document.head || document.getElementsByTagName("head")[0];
  head.appendChild(css);
};

/**
 * modal弹窗
 * @param {string} titleText 标题文字
 * @param {string} content 提示内容
 * @param {"true"|"false"} isCancel 是否显示取消按钮("true"|"false")
 * @param {"hint"| "tips"| "right"} iconType 图标类型(hint 叹号 tips tip符号 right 正确符号 默认不加问号)
 * @param {"delete"|'ok'} submitType 按钮类型(delete和ok) 对应两种颜色
 * @param {string} submitText 按钮文字
 * @param {JSON.stringify(['a', 'b', 'c'])} contentList 多行文字显示
 */
function Modal(params) {
  const {
    iconType = "",
    titleText = "",
    isCancel = "false",
    submitType = "",
    content = "",
    contentList = "[]",
    isClose = "true",
    submitText = "",
  } = params;
  $("body").append(`
      <confirm-dialog
        titleText="${titleText}"
        contentList='${contentList}'
        iconType="${iconType}"
        isClose=${isClose}
        isCancel="${isCancel}"
        submitType="${submitType}"
        content="${content}"
        submitText="${submitText}">
      </confirm-dialog>`);
}

function randomchoice(arr) {
  let lastNumber = null; // 保存上次选择的数

  function helper() {
    let randomIndex = Math.floor(Math.random() * arr.length);
    let randomNum = arr[randomIndex];

    // 如果随机数与上次选择的数相同，则递归调用自身进行重新选择
    if (randomNum === lastNumber) {
      return helper();
    }

    lastNumber = randomNum; // 更新上次选择的数
    return randomNum;
  }

  return helper;
}

function isMobileDevice() {
  const userAgent = navigator.userAgent;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
}
function touchEnlarge() {
  var lastTouchEnd = 0;
  document.documentElement.addEventListener(
    "touchend",
    function (event) {
      var now = Date.now();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    },
    false
  );
}

//是否可以下载文件
function isDownloadFile(url, type) {
  return new Promise((resolve, reject) => {
    if (type === "video") {
      let res = document.createElement("video");
      res.src = url;
      res.load();
      res.onloadeddata = () => resolve();
      res.onerror = () => reject();
    } else if (type === "image") {
      let res = new Image();
      res.src = url;
      res.onload = () => resolve();
      res.onerror = () => reject();
    }
  });
}

const getinsurValue = () => {
  let insurValue = "";
  let url = document.location.pathname;
  if (url == "/face-swap.html") {
    insurValue = "de_vidq_faceswap";
  } else if (url == "/video-translator.html") {
    insurValue = "de_vidq_videotranslate";
  } else if (url == "/") {
    // insurValue = "de_home";
  } else if (url == "/about.html") {
    // insurValue = "de_about";
  } else if (url == "/contact.html") {
    // insurValue = "de_contact";
  } else if (url == "/privacy.html") {
    insurValue = "de_privacy";
  } else if (url == "/terms.html") {
    insurValue = "de_terms";
  } else if (url == "/ai-attractiveness-test.html") {
    insurValue = "de_vidq_attracttest";
  }else if (url == "/multiple-face-swap.html") {
    insurValue = "de_vidq_mulfaceswap";
  }

  if (isSeo()) {
    insurValue = insurValue.replace("de", "deseo");
  }
  return insurValue;
};

//来源是否seo
const isSeo = () => {
  let flag = false;
  let seos = [
    "google.",
    "baidu.",
    "yandex.",
    "bing.",
    "yahoo.",
    "duckduckgo.",
    ".naver.",
    "go.mail.ru",
    "qwant.",
    "sougou.",
    ".so.",
    "rambler.",
    ".ask.",
    "daum.",
    ".ecosia.",
    ".startsiden.",
    ".onetonline.",
    "search.smt.docomo",
    ".biglobe.",
    "seznam.",
  ];
  for (let item of seos) {
    if (document.referrer.includes(item)) {
      flag = true;
      return flag;
    }
  }
};

// 设置缓存
const setInsurCookie = () => {
  // 设置Cookie
  if (!getCookie("insur")) {
    if (!isSeo()) {
      setCookie("insur", getinsurValue(), 30);
    }
  }
  if (isSeo()) {
    if (!getCookie("insur")) {
      setCookie("insur", getinsurValue(), 30);
    } else {
      if (!getCookie("insur").includes("seo")) {
        setCookie("insur", getinsurValue(), 30);
      }
    }
  }
};
setInsurCookie();

// 格式化千分化数字
function toThousands(num) {
  var numStr = (num || 0).toString();
  return numStr.replace(/(\d)(?=(?:\d{3})+$)/g, "$1,");
}

var localeArea = {
  ja: "ja-JP",
  de: "de-DE",
  en: "en-US",
  es: "en-US",
  fr: "fr-FR",
  it: "it-IT",
  pt: "pt-BR",
};



function getPreferredLanguage() {
  let countriesArrLang = ["en", "de", "es", "fr", "it", "pt", "ja", "ar"];
  // let countriesArrLang = ["de", "es", "fr", "it", "nl", "pt", "sv"];
  let getUILanguage = "";
  getUILanguage = $("html").attr("lang").substring(0, 2);
  var countriesLangName = countriesArrLang.filter(function (item) {
    if (item === getUILanguage) {
      return true;
    }
    return false;
  });
  if (countriesLangName.length > 0) {
    if (countriesLangName[0] == "ja") {
      return "jp";
    } else {
      return countriesLangName[0];
    }
  } else {
    return "en";
  }
}

function setSessionCookie(c_name, value) {
  var host = location.hostname.includes("vidqu.ai")
    ? "vidqu.ai"
    : location.hostname;
  var c_value = escape(value) + ";path=/;domain=" + host;
  document.cookie = c_name + "=" + c_value;
}
$(function () {
  const productPage = ['/multiple-face-swap.html','/multiple-face-swap.html?openTab=videofs', '/face-swap.html','/face-swap.html?openTab=videofs', '/ai-girlfriend.html', '/ai-boyfriend.html']
  const localPathKey = 'LOCAL_PATH_STORAGE'
  const localPathJSON = localStorage.getItem(localPathKey)
  const localPath = localPathJSON ? JSON.parse(localPathJSON) : []
  function showPathNav() {
    productPage.forEach((pp) => {
      if (pp.includes("girlfriend.html")){
        $(".chat_tools").show()
      }
      $(`a[href="${pp}"]`).parent().show()
    })
  }
  function hidePathNav() {
    productPage.forEach((pp) => {
      $(`a[href="${pp}"]`).parent().hide()
    })
  }
  // if (productPage.filter((pp) => new Set(localPath).has(pp)).length > 0) {
  //   showPathNav()
  // } else {
  //   hidePathNav()
  // }
  // if (productPage.includes(location.pathname)) {
  //   localStorage.setItem(localPathKey, JSON.stringify([...new Set([...localPath, location.pathname])]))
  //   console.error(localPathJSON)
  //   showPathNav()
  // }
})

window.addEventListener("load", function () {
  //懒加载
  lazyLoad();
  // scrollLeft()
  touchEnlarge();

  isShowFooterCookie();

  $("#go_credits").click(() => {
    window.open("/credit-history.html")
  });
  $("#footer_btn").on("click", function () {
    $(".fix-footer").hide();
    localStorage.setItem("cookieFooter", new Date().getTime() + 30 * 24 * 60 * 60 * 1000);
  });

  $('#header .myfileBtn').on('click',function(e){
    e.preventDefault();
    e.stopPropagation();
    gtag('event', 'click_vidqmyfiles_profilefilebtn');
    // window.location.href = '/my-files.html';
    if(!location.pathname.includes('my-files.html')){
      window.open('/my-files.html')
    }
  })
});

$(window).ready(function () {
  initLoginDialog();
});

window.questLanguage = getPreferredLanguage();


async function newDownloadFile(task_id = "", key, width, height, size) {
  handleBtnMsClass(true);
  handleDownloadClass(true);
  try {
    let data = {
      id: task_id
    }
    if (key) {
      data.img_key = key
    }
    if (width) {
      data.width = width
    }
    if (height) {
      data.height = height
    }
    if (size) {
      data.size = size
    }
    const res = await jqAjaxPromise({
      tools: true,
      url: "ai/source/vidqu-download",
      type: "POST",
      data,
      cb401({ resolve }) {
        resolve({ code: 401 });
      },
    });
    console.log("res--下载", res);
    const code = res?.code;
    const downloadParam = res?.data?.is_local_download;
    const additionalData = res?.data?.additional_data;
    localStorage.setItem("isSavingtask", false)
    if (code === 200 && downloadParam !== null && downloadParam !== undefined) {
      handleBtnMsClass();
      handleDownloadClass();
      return {
        code: downloadParam,
        data: additionalData,
      }; // 1 本地下载，2 远程下载
    } else {
      handleBtnMsClass();
      handleDownloadClass();
      return {
        code,
      };
    }
  } catch (error) {
    handleBtnMsClass();
    handleDownloadClass();
    localStorage.setItem("isSavingtask", false)
    return {
      code: -1,
    };
  }
}

function handleBtnMsClass(bool = false) {
  const btnMs = document.querySelectorAll('.btnM');
  for (let i = 0; i < btnMs.length; i++) {
    const btnM = btnMs[i];
    if (bool) {
      btnM.classList.add("downDisabled")
    } else {
      btnM.classList.remove("downDisabled")
    }
  }
}
function handleDownloadClass(bool = false) {
  const classArrs = [
    ".btn.download_video",
    ".btn_download",
    ".click_download",
    ".show__img__download",
    ".popup_success .repeat",
    ".main__content__left .left__show__video__box .download__btn",
    ".tips__box .download__again",
    ".btn_download_clip",
    ".show__img__download_clip",
    ".gened__bottom_download",
    "#canClick",
  ];
  for (let i = 0; i < classArrs.length; i++) {
    const classArr = classArrs[i];
    const classArrDoms = document.querySelectorAll(classArr)
    if (classArrDoms?.length) {
      for (let j = 0; j < classArrDoms.length; j++) {
        const dom = classArrDoms[j];
        if (bool) {
          dom.classList.add("downDisabled")
        } else {
          dom.classList.remove("downDisabled")
        }
      }
    }
  }
}

function removeAllDownDisabled() {
  const downDisableds = document.querySelectorAll(".downDisabled");
  for (let i = 0; i < downDisableds.length; i++) {
    const downDisabled = downDisableds[i];
    downDisabled.classList.remove("downDisabled");
  }
}

async function setDownloadData(type, res) {
  if (res?.data?.user_id <= 0) {
    return Promise.resolve(null);
  }
  try {
    const localData = await isLocalDownload(type);
    let curdata = null;
    if (localData) {
      const { is_localdownload, limit_download } = localData;
      curdata = {
        code: limit_download === 1 && is_localdownload !== 1 ? 3006 : is_localdownload
      }
    }
    return Promise.resolve(curdata);
  } catch (error) {
    console.error(error)
    return Promise.resolve(null);
  }
}
async function isLocalDownload(type = "") {

  if (getCookie('access_token')) {
    try {
      const getTask = await jqAjaxPromise({
        tools: true,
        url: "ai/source/is-local-download",
        type: "POST",
        data: {
          type
        },
        async cb401({ resolve, reject }) {
          try {
            await newRequestAtoken()
            await isLocalDownload(type);
          } catch (error) {
            resolve(null);
          }
        },
        notRefreshToken: true
      });
      const code = getTask?.code;
      const newData = getTask?.data;
      if (code === 200 && newData) {
        return Promise.resolve(newData);
      } else {
        return Promise.resolve(null);
      }
    } catch (error) {
      console.error(error)
      return Promise.resolve(null);
    }
  } else {
    return Promise.resolve(null);
  }
}

const newRequestAtoken = async () => {
  try {
    const res = await jqAjaxPromise({
      url: "/api/user/refresh-token", type: "POST", data: {
        refresh_token: getCookie("refresh_token") || '',
      }
    });
    const code = res?.code;
    const accessToken = res?.data?.access_token
    const refreshToken = res?.data?.refresh_token
    if (code === 200 && accessToken) {
      localStorage.setItem("access_token", accessToken);
      setCookie("access_token", accessToken, 30);
      localStorage.setItem("refresh_token", refreshToken);
      setCookie("refresh_token", refreshToken, 30);
      return Promise.resolve();
    } else {
      logoutPage();
      return Promise.reject();
    }
  } catch (error) {
    logoutPage()
    return Promise.reject();
  }
};


var formatter = new Intl.NumberFormat(localeArea[getPreferredLanguage()], {
  style: "decimal",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

var formatterFix2 = new Intl.NumberFormat(localeArea[getPreferredLanguage()], {
  style: "decimal",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});


async function showCreditDes() {
  const requesHost =
    location.host === "www.vidnoz.com"
      ? "https://tool-api.vidnoz.com"
      : "https://tool-api-test.vidnoz.com";
  const res = await fetch(`${requesHost}/ai/public/get-country-type`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: getCookie("access_token")
        ? `Bearer ${getCookie("access_token")}`
        : "",
    },
  });
  const data = await res.json();
  if (data.data.name != "T1") {
    $(".credit_des_bg_content").addClass("t2");
  }
}

function changeHeaderCredit (credit) {
  const header = $("header-credit")?.[0];
  const go_credits = $("#go_credits");
  if (header && header.updateInfo) {
    header.updateInfo();
  }
  if (go_credits) {
    go_credits.find(".credits_num span").text(credit)
  }
}

function showCreditBox() {
  if (isLogin() && document.body.clientWidth <= 1200) {
    $(".header-credits-box").addClass("show");
    $(".menu-item.credit").show();
  } else {
    $(".header-credits-box").removeClass("show");
    $(".menu-item.credit").hide();
  }
}

function getCountryType() {
  fetchGet("ai/public/get-country-type")
    .then((res) => {
      if (res.code !== 200) return;
      const countryType = res.data.name;
      if ((countryType === "T1" || countryType === "T2") && judgeClient() === 'ios' && document.location.pathname !== '/pricing.html') {
        $('.fix-footer').css("bottom", '0.88rem');
        $("#iosFooter").show()
        $("#iosFooter .fix-footer-title").css("display", "flex")
        $("#ios_footer_btn").click(function () {
          gtag("event", "de_faceappclick_fcios");
          window.location.href = "https://apps.apple.com/app/apple-store/id6497986083?pt=127019031&ct=from_de_vidq&mt=8";
        });
      }
    }) 
    .catch((err) => {
      console.log(err);
    });
}
getCountryType();
window.PRICING_HISTORY_PAGE = 'PRICING_HISTORY_PAGE'
if(location.pathname !== '/pricing.html'){
  localStorage.setItem(PRICING_HISTORY_PAGE, location.pathname)
}
