var TOOL_API =
  location.host.includes("vidqu.ai") && !location.host.includes("test")
    ? "https://tool-api.vidqu.ai/"
    : "https://tool-api-test.vidqu.ai/";
var interHost =
  location.host.includes(".vidqu.ai") && !location.host.includes("test")
    ? "https://main-api.vidqu.ai/"
    : "https://main-api-test.vidqu.ai/";
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

//判断是否为空
function ttsBlank(data) {
  if (
    data == null ||
    data === "null" ||
    data === "" ||
    data === undefined ||
    data === "undefined" ||
    data === "unknown"
  ) {
    return true;
  } else {
    return false;
  }
}

// 添加cookie 隐私条例代码
// 排除pricing页面，其余页面添加

// const notAddCookies = ["/ai-tool-pricing.html", "/pricing.html"];

// if (!notAddCookies.includes(window.location.pathname)) {
//   const cookieScript = document.createElement("script");
//   cookieScript.src = "//cdn.cookie-script.com/s/4c47f3f11b64ab0de27986215ca17517.js";
//   cookieScript.type = "text/javascript";
//   const head = document.head || document.getElementsByTagName("head")[0];
//   head.appendChild(cookieScript);
// }

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

function initLoginDialog(path = "") {
  const _url = "/dist/js";
  addScripTag(_url + "/commonSignin/login-dialog.js");
  addScripTag(_url + "/confirm-dialog/index.js");

  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = _url + "/commonSignin/aiChatLogin.css";
  const head = document.head || document.getElementsByTagName("head")[0];
  head.appendChild(css);
  const myComponent = document.createElement('my-component');
  document.body.appendChild(myComponent);
}
initLoginDialog();

const localPathKey = "LOCAL_PATH_STORAGE";
const localPathJSON = localStorage.getItem(localPathKey);
const localPath = localPathJSON ? JSON.parse(localPathJSON) : [];
localStorage.setItem(localPathKey, JSON.stringify([...new Set([...localPath, location.pathname])]));

/**
 *
 * @param {fn} 回调函数
 * @param {isReloading} 是否刷新页面 默认不刷新
 */
function showLoginWindow(obj = {}) {
  const { fn = () => {}, isReloading = false, closeFn = () => {} } = obj;
  document.body.style.overflow = "hidden";

  // 成功后执行函数
  $("my-component")
    .off("loginsuccess")
    .on("loginsuccess", async () => {
      fn();
      console.log("login successful");
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
  $("my-component").length && $("my-component")[0].showLoginDialog();
}
function goApp() {
  window.location.href = "/app";
}

function goFaceSwap() {
  window.location.href = "/face-swap.html";
}

function setCookieSesid(response) {
  let Sesid = response.headers.get("Sesid");
  let Sesidsign = response.headers.get("Sesid-sign");
  let tokenSesid = getCookie("SsToken");
  let tokenSesidsign = getCookie("SsToken-sign");
  // 如果是null的话不替换原来的值
  Sesid = ttsBlank(Sesid) ? tokenSesid : Sesid;
  Sesidsign = ttsBlank(Sesid) ? tokenSesidsign : Sesidsign;
  // console.error("Sesid post", Sesid)
  setCookie("SsToken", Sesid);
  setCookie("SsToken-sign", Sesidsign);
}


// PUT方法封装
var fetchPut = function (url, data, headers = {}) {
  return new Promise((resolve, reject) => {
    fetch(url, {
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


function fetchPostNormal(url, data, base_API = TOOL_API, headers = { "Content-Type": "application/json" }) {
  return new Promise((resolve, reject) => {
    fetch(base_API + url, {
      method: "POST",
      headers: {
        ...{
          "Request-Origin": "vidqu",
          Authorization: "Bearer " + getCookie("access_token") || "",
        },
        ...headers,
      },
      body: data instanceof FormData ? data : JSON.stringify(data),
    })
      .then((response) => {
        response.json().then(async (data) => {
          if (data.code === 401) {
            localStorage.removeItem("user_info");
            setCookie("loginProduct", "");
            setSessionCookie("st", "");
            setCookie("refresh_token", "");
            setCookie("user_info", "");
            setCookie("access_token", "");
            isLogin(false);
            if (isShowLogin) {
              showLoginWindow();
            }
            await aiGirlFriend.initCharacters();
            aiGirlFriend.GetRecentChatting();
            aiGirlFriend.GetMyCharacters();
            resolve(data);
          } else {
            resolve(data);
          }
        });
      })
      .catch((err) => {
        reject(err);
      });
  });
}
function fetchGetNormal(url, base_API = TOOL_API, headers = {}) {
  return new Promise((resolve, reject) => {
    fetch(base_API + url, {
      method: "GET",
      headers: {
        ...{
          "Content-Type": "application/json",
          "Request-Origin": "vidqu",
          Authorization: "Bearer " + getCookie("access_token") || "",
        },
        ...headers,
      },
    })
      .then((response) =>
        response.json().then(async (data) => {
          if (data.code === 401) {
            aiChatting.closeChat();
            localStorage.removeItem("user_info");
            setCookie("loginProduct", "");
            setSessionCookie("st", "");
            setCookie("refresh_token", "");
            setCookie("user_info", "");
            setCookie("access_token", "");
            isLogin(false);
            if (isShowLogin) {
              showLoginWindow();
            }
            await aiGirlFriend.initCharacters();
            aiGirlFriend.GetRecentChatting();
            aiGirlFriend.GetMyCharacters();
            reject(data);
          } else {
            resolve(data);
          }
        })
      )
      .catch((err) => reject(err));
  });
}

//设置cookie
function setCookie(c_name, value, expiredays = 30) {
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
//设置初始cookie
const getinsurValue = () => {
  let insurValue = "";
  let url = document.location.pathname;
  if (url == "/novia-virtual.html") {
    insurValue = "es_vidqu_aigf";
  }

  if (isSeo()) {
    insurValue = insurValue.replace("es", "esseo");
  }

  return insurValue;
};

/**
 * 获取url id
 */

function getUrlParam(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
  var r = window.location.search.substr(1).match(reg);
  if (r != null) return encodeURI(r[2]);
  return null;
}

// 设置缓存
const setInsurCookie = () => {
  // 设置Cookie
  if (!getCookie("insur")) {
    if (!isSeo() && !getUrlParam("insur") && !getCookie("insurLevel")) {
      setCookie("insur", getinsurValue(), 30);
    }
  }
  if (isSeo()) {
    if (!getCookie("insur")) {
      setCookie("insur", getinsurValue(), 30);
    } else {
      if (!getCookie("insur").includes("seo") && !getUrlParam("insur") && !getCookie("insurLevel")) {
        setCookie("insur", getinsurValue(), 30);
      }
    }
  }
  if (getUrlParam("insur")) {
    if (!getCookie("insurLevel")) {
      setCookie("insur", getUrlParam("insur"), 30);
      setCookie("insurLevel", "strong", 30);
      if (
        getCookie("aff") &&
        JSON.parse(getCookie("aff")) &&
        JSON.parse(getCookie("aff")).a_aid &&
        getCookie("insur") &&
        getCookie("insur").includes("googlecamp")
      ) {
        document.cookie = "aff" + "=; expires=Thu, 01 Jan 1971 00:00:00 UTC; path=/;domain=.vidqu.ai";
      }
    }
  }

  if (getUrlParam("a_aid") !== null) {
    cookieObj = {
      a_aid: getUrlParam("a_aid"),
      chan: getUrlParam("chan"),
      data1: getUrlParam("data1"),
      data2: getUrlParam("data2"),
    };
    if (getCookie("insur") && getCookie("insur").includes("googlecamp")) {
      document.cookie = "insur" + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;domain=.vidqu.ai";
      document.cookie = "insurLevel" + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;domain=.vidqu.ai";
    }
    setCookie("aff", JSON.stringify(cookieObj), 120);
  }
};

function getPreferredLanguage() {
  let countriesArrLang = ["en", "de", "es", "fr", "it", "pt", "ja", "ar", "kr", "tw"];
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
const transtoBlob = ({ b64data, contentType = "image/png" }) => {
  contentType = contentType || "";
  let sliceSize = 1024;
  let byteCharacters = atob(b64data.split(",")[1]);
  let bytesLength = byteCharacters.length;
  let slicesCount = Math.ceil(bytesLength / sliceSize);
  let byteArrays = new Array(slicesCount);

  for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
    let begin = sliceIndex * sliceSize;
    let end = Math.min(begin + sliceSize, bytesLength);

    let bytes = new Array(end - begin);
    for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
      bytes[i] = byteCharacters[offset].charCodeAt(0);
    }
    byteArrays[sliceIndex] = new Uint8Array(bytes);
  }
  return new Blob(byteArrays, { type: contentType });
};
function setSessionCookie(c_name, value) {
  var host = location.hostname.includes(".vidqu.ai") ? ".vidqu.ai" : location.hostname;
  var c_value = escape(value) + ";path=/;domain=" + host;
  document.cookie = c_name + "=" + c_value;
}

function handleScrollAnimation() {
  $(".scroll-animation").each(function (i, v) {
    if (v.getBoundingClientRect().top < window.innerHeight * 0.66) {
      $(v).addClass("on");
    } else {
      //$(v).removeClass('on')
    }
  });
}
window.addEventListener("scroll", function () {
  handleScrollAnimation();
});

//处理登录
function chatLogin() {
  let access_token = getCookie("access_token") ? getCookie("access_token") : "";
  access_token ? isLogin(true) : isLogin(false);
  window.aiChatting && window.aiChatting.updateAudioLimit()
}
var defaultHeadImg = "/dist/img/aiFriend/icon_avatar.svg";
// 切换header头部的登录或者头像
function isLogin(bool) {
  if (bool) {
    $("#header_login").hide();
    $("#header_user,#header_inform").show();
    const userInfo = JSON.parse(getCookie("user_info"));
    let name = userInfo.first_name + " " + userInfo.last_name;
    name = name === ' ' ? userInfo.email.split("@")[0] : name;
    $("#header_user .header_avator").attr("src", userInfo.head_portrait || defaultHeadImg);
    $("header .userName").text(name);
    $(".meau_item.log").show();
  } else {
    $("#header_login").show();
    $("#header_user,#header_inform").hide();
    $(".meau_item.log").hide();
  }
}
// pc open login box
$(".meau_item.user img").click(function () {
  if (judgeClient() != "pc") return;
  $(this).hasClass("active") ? $("#header_user .signout").hide() : $("#header_user .signout").css("display", "flex");
  $(this).toggleClass("active");
});

// 事件委托
$("body").on("mouseup", function (e) {
  const target = $(e.target);
  // 点击其他地方关闭signOut
  if (target.parents(".meau_item.user").length == 0) {
    $(".meau_item.user img").removeClass("active");
    $("#header_user .signout").hide();
  }
  // inform msg like
  const isClickInformBtn = target.parents("#header_inform").length != 0 || target.hasClass("inform");
  if (isClickInformBtn) {
    if (judgeClient() == "pc") {
      $("#header_inform .inform_box").show();
    } else {
      $("header .inform_mobile_list").slideDown();
      document.body.style.overflow = "hidden";
    }
    gtag("event", "notifications_aigirlfriend_header");
    $("#header_inform").addClass("active");
    clearGetIfications();
  } else if ($("#header_inform").hasClass("active") && judgeClient() == "pc") {
    $("#header_inform,.inform_item").removeClass("unlook");
    $("#header_inform .inform_box").hide();
    $("#header_inform").removeClass("active");
    aiGirlFriend.clearIfication();
  } else if (isClickInformBtn || (target.hasClass("inform_m_back") && $("#header_inform").hasClass("active"))) {
    $("header .inform_mobile_list").slideUp();
    document.body.style.overflow = "auto";
    $("#header_inform").removeClass("active");
    aiGirlFriend.clearIfication();
  }
});

$(".inform_list_box").on("scroll", function (e) {
  const scrollTop = $(".inform_list_box").scrollTop();
  const height = $(".inform_list").height() - $(".inform_list_box").height();
  if (scrollTop >= height) {
    aiGirlFriend.GetIfications(false);
  }
});

function resizeImageByFile(file) {
  var maxSide = 3072;
  return new Promise((resolve, reject) => {
    var reader = new FileReader();
    reader.onloadend = () => {
      let img = new Image();
      img.onload = () => {
        let canvas = document.createElement("canvas");
        let ctx = canvas.getContext("2d");
        let maxDimension = Math.max(img.width, img.height);
        if (maxDimension > maxSide) {
          let scaleFactor = maxSide / maxDimension;
          canvas.width = img.width * scaleFactor;
          canvas.height = img.height * scaleFactor;
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        var base64 = canvas.toDataURL();
        var blob = transtoBlob({
          b64data: base64,
          contentType: "image/png",
        });
        let imgType = "width";
        if (canvas.width < canvas.height) {
          imgType = "height";
        }
        resolve({ blog: blob, imgType });
      };
      img.onerror = () => {
        resolve({ blog: null });
      };
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const currentDate = new Date();
const timezoneOffset = currentDate.getTimezoneOffset();
const browserLanguage = navigator.language || navigator.userLanguage;
const getWhiteList = () => {
  fetchPost(`api/site/mio-config?t=${new Date().getTime()}`, {}).then((res) => {
    if (res.code === 200) {
      if (!res.data.is_in_ip_whitelist && timezoneOffset === -480 && browserLanguage.toLowerCase() === "zh-cn") {
        document.body.innerHTML = '<div class="shield-page">The website is not available</div>';
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

$("#header_login").click(() => {
  gtag("event", "login_aigirlfriend_header");
  showLoginWindow({
    fn: () => {
      chatLogin();
    },
  });
});

$(".signoutBtn").click(() => {
  $(".meau_icon").hasClass("active") ? $(".meau_icon").click() : "";
  gtag("event", "signout_aigirlfriend_header");
  localStorage.removeItem("user_info");
  setCookie("loginProduct", "");
  setSessionCookie("st", "");
  setCookie("refresh_token", "");
  setCookie("user_info", "");
  setCookie("access_token", "");
  isLogin(false);
});

$(document).ready(function () {
  chatLogin();
  setInsurCookie();
});

// header处理
$(".meau_icon").click(function () {
  if ($(this).hasClass("active")) {
    $(".meau_list").slideUp();
    document.body.style.overflow = "auto";
  } else {
    $(".meau_list").slideDown();
    document.body.style.overflow = "hidden";
  }
  $(this).toggleClass("active");
});

$(".meau_list.mobile_show").click(function (e) {
  const target = $(e.target);
  if (target.hasClass("meau_list")) {
    $(".meau_icon").click();
  }
});

function randomchoice(arr) {
  let lastNumber = null; // 上一次选择的下标
  function helper() {
    let res = arr.filter((item) => {
      return item !== lastNumber;
    });
    let randomIndex = Math.floor(Math.random() * res.length);
    let randomNum = res[randomIndex];

    lastNumber = randomNum; // 更新上次选择的对象
    return randomNum;
  }

  return helper;
}
// update user info
function updateUserData() {
  fetchPostNormal("api/user/get-profile", {}, interHost)
    .then((res) => {
      if (res.code == 200) {
        setUserInfo(res);
        aiGirlFriend.GetMyCharacters()
      }
    })
    .catch(() => {
      console.error("updateUserData error");
    });
}

function setUserInfo(res) {
  const { id } = JSON.parse(getCookie("user_info"));
  const newUserData = {
    head_portrait: res.data.head_portrait,
    email: res.data.email,
    id,
    first_name: res.data.first_name,
    last_name: res.data.last_name,
    usertype: res.data.type,
  };
  setCookie("user_info", JSON.stringify(newUserData));
  isLogin(true);
}

function isBlob(obj) {
  return obj instanceof Blob;
}



// 判断两个对象是否全等
function areObjectsEqual(obj1, obj2) {
  // 获取两个对象的键数
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  // 判断键数是否相同
  if (keys1.length !== keys2.length) {
    console.log("length unlike");
    return false;
  }

  // 遍历每个键
  for (const key of keys1) {
    // 判断键是否在另一个对象中存在
    if (!obj2.hasOwnProperty(key)) {
      console.log("key is not +", key);
      return false;
    }

    // 判断键对应的值是否相同
    if (obj1[key] != obj2[key]) {
      console.log("value is not +", key, obj1[key], obj2[key]);
      return false;
    }
  }

  return true;
}

// 当前语言和当前机型
window.questLanguage = getPreferredLanguage();
window.userModel = judgeClient();
