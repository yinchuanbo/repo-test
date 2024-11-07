const TOOL_API =
  location.host.includes("vidqu.ai") && !location.host.includes("test")
    ? "https://tool-api.vidqu.ai/"
    : "https://tool-api-test.vidqu.ai/";
const interHost =
  location.host.includes("vidqu.ai") && !location.host.includes("test")
    ? "https://main-api.vidqu.ai/"
    : "https://main-api-test.vidqu.ai/";
const homeUrl =
  location.host.includes("vidqu.ai") && !location.host.includes("test")
    ? "https://www.vidqu.ai/"
    : "https://test2-931c96916996ea8e.vidqu.ai/ai-image-generator-home.html";
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

function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
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
 * @param {string} titleText 
 * @param {string} content
 * @param {"true"|"false"} isCancel 
 * @param {"hint"| "tips"| "right"} iconType 
 * @param {"delete"|'ok'} submitType
 * @param {string} submitText
 * @param {JSON.stringify(['a', 'b', 'c'])} contentList
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
  css.href = _url + "/commonSignin/IGlogin.css";
  const head = document.head || document.getElementsByTagName("head")[0];
  head.appendChild(css);
  const body = document.querySelector("body");
  body.innerHTML += "<my-component></my-component>";
}
initLoginDialog();

const localPathKey = "LOCAL_PATH_STORAGE";
const localPathJSON = localStorage.getItem(localPathKey);
const localPath = localPathJSON ? JSON.parse(localPathJSON) : [];
localStorage.setItem(
  localPathKey,
  JSON.stringify([...new Set([...localPath, location.pathname])])
);

/**
 *
 * @param {fn}
 * @param {isReloading}
 */
function showLoginWindow(obj = {}) {
  const { fn = () => { }, isReloading = false, closeFn = () => { } } = obj;
  document.body.style.overflow = "hidden";

  $("my-component")
    .off("loginsuccess")
    .on("loginsuccess", async () => {
      fn();
      isLogin(true);
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
  Sesid = ttsBlank(Sesid) ? tokenSesid : Sesid;
  Sesidsign = ttsBlank(Sesid) ? tokenSesidsign : Sesidsign;
  // console.error("Sesid post", Sesid)
  setCookie("SsToken", Sesid);
  setCookie("SsToken-sign", Sesidsign);
}

// POST
function fetchPost(url, data = {}, headers = {}, isShowLogin = true) {
  return new Promise((resolve, reject) => {
    fetch(TOOL_API + url, {
      method: "POST",
      headers: {
        ...{
          "Content-Type": "application/json",
          "X-TASK-VERSION": "2.0.0",
          "Request-Origin": "vidqu",
          // "WEB-VERSIONS-NUM":currentVersion,
          Sesid: ttsBlank(getCookie("SsToken")) ? "" : getCookie("SsToken"),
          "Sesid-sign": ttsBlank(getCookie("SsToken-sign"))
            ? ""
            : getCookie("SsToken-sign"),
          Authorization: ttsBlank(getCookie("access_token"))
            ? ""
            : "Bearer " + getCookie("access_token"),
        },
        ...headers,
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        setCookieSesid(response);
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
        $Popup({
          type: "error",
          errorType: "network",
        });
        reject(err);
      });
  });
}

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

var fetchGet = function (url, headers = {}, isShowLogin = true) {
  return new Promise((resolve, reject) => {
    fetch(TOOL_API + url, {
      method: "GET",
      headers: {
        ...{
          "Content-Type": "application/json",
          "X-TASK-VERSION": "2.0.0",
          "Request-Origin": "vidqu",
          // "WEB-VERSIONS-NUM":currentVersion,
          Sesid: ttsBlank(getCookie("SsToken")) ? "" : getCookie("SsToken"),
          "Sesid-sign": ttsBlank(getCookie("SsToken-sign"))
            ? ""
            : getCookie("SsToken-sign"),
          Authorization: ttsBlank(getCookie("access_token"))
            ? ""
            : "Bearer " + getCookie("access_token"),
        },
        ...headers,
      },
    })
      .then((response) => {
        setCookieSesid(response);
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
        });
      })
      .catch((err) => {
        $Popup({
          type: "error",
          errorType: "network",
        });
        reject(err);
      });
  });
};

function fetchPostNormal(
  url,
  data,
  base_API = TOOL_API,
  headers = { "Content-Type": "application/json" }
) {
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

function setCookie(c_name, value, expiredays = 30) {
  var exdate = new Date();
  exdate.setDate(exdate.getDate() + expiredays);
  var host = location.hostname.includes(".vidqu.ai")
    ? ".vidqu.ai"
    : location.hostname;
  var c_value =
    encodeURIComponent(value) +
    (expiredays == null ? "" : ";expires=" + exdate.toUTCString()) +
    ";path=/;domain=" +
    host;
  document.cookie = c_name + "=" + c_value;
}

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

const getinsurValue = () => {
  let insurValue = "";
  let url = document.location.pathname;
  if (url.includes("/explore")) {
    insurValue = "en_vidq_imginfo";
  } else if (url == "/ai-image-generator.html") {
    insurValue = "en_vidq_imgenerator";
  } else if (url == "/") {
    insurValue = "en_vidq_home";
  }

  if (isSeo()) {
    insurValue = insurValue.replace("en", "enseo");
  }

  return insurValue;
};

function getUrlParam(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
  var r = window.location.search.substr(1).match(reg);
  if (r != null) return encodeURI(r[2]);
  return null;
}

const setInsurCookie = () => {
  if (!getCookie("insur")) {
    if (!isSeo() && !getUrlParam("insur") && !getCookie("insurLevel")) {
      setCookie("insur", getinsurValue(), 30);
    }
  }
  if (isSeo()) {
    if (!getCookie("insur")) {
      setCookie("insur", getinsurValue(), 30);
    } else {
      if (
        !getCookie("insur").includes("seo") &&
        !getUrlParam("insur") &&
        !getCookie("insurLevel")
      ) {
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
        document.cookie =
          "aff" +
          "=; expires=Thu, 01 Jan 1971 00:00:00 UTC; path=/;domain=.vidqu.ai";
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
      document.cookie =
        "insur" +
        "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;domain=.vidqu.ai";
      document.cookie =
        "insurLevel" +
        "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;domain=.vidqu.ai";
    }
    setCookie("aff", JSON.stringify(cookieObj), 120);
  }
};

function getPreferredLanguage() {
  let countriesArrLang = [
    "en",
    "de",
    "es",
    "fr",
    "it",
    "pt",
    "ja",
    "ar",
    "kr",
    "tw",
  ];
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
  var host = location.hostname.includes(".vidqu.ai")
    ? ".vidqu.ai"
    : location.hostname;
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

function igLogin() {
  let access_token = getCookie("access_token") ? getCookie("access_token") : "";
  access_token ? isLogin(true) : isLogin(false);
}

var defaultHeadImg = "/dist/img/IGhome/icon_avatar.svg";

// pc open login box

const profileDialog = new initProFile();
$("body").on("mouseup", function (e) {
  const target = $(e.target);
  // if (target.parents(".meau_item.user").length == 0) {
  //   $(".meau_item.user img").removeClass("active");
  //   $("#header_user .signout").hide();
  // }
  // inform msg like
  const isClickInformBtn =
    target.parents("#header_inform").length != 0 || target.hasClass("inform");
  if (isClickInformBtn) {
    if (judgeClient() == "pc") {
      $("#header_inform .inform_box").show();
    } else {
      $("header .inform_mobile_list").slideDown();
      document.body.style.overflow = "hidden";
    }
    $("#header_inform").addClass("active");
  } else if ($("#header_inform").hasClass("active") && judgeClient() == "pc") {
    $("#header_inform,.inform_item").removeClass("unlook");
    $("#header_inform .inform_box").hide();
    $("#header_inform").removeClass("active");
    aiGirlFriend.clearIfication();
  } else if (
    isClickInformBtn ||
    (target.hasClass("inform_m_back") && $("#header_inform").hasClass("active"))
  ) {
    $("header .inform_mobile_list").slideUp();
    document.body.style.overflow = "auto";
    $("#header_inform").removeClass("active");
    aiGirlFriend.clearIfication();
  }
  if (target.hasClass("likeIcon")) {
    const id = target.closest(".IGgrid_table_item").attr("data-id");
    likePost(id, target);
  }
  if (target.hasClass("mask_remix")) {

    if (window.location.pathname.includes("/explore/")) {
      gtag("event", "click_imginfo_card")
    } else {
      gtag("event", "click_home_card")
    }
    const id = target.closest(".IGgrid_table_item").attr("data-id");
    window.location.href = `/explore/${id}`;
  }
  if (target.hasClass("remix_btn")) {
    e.stopPropagation();
    if (window.location.pathname.includes("/explore/")) {
      gtag("event", "click_imginfo_cardtryitbtn")
    } else {
      gtag("event", "click_home_cardtryitbtn")
    }
    const id = target.closest(".IGgrid_table_item").attr("data-id");
    window.location.href = `/ai-image-generator.html?setInfoId=${id}`;
  }
  if (target.hasClass("header_editUser") || target.hasClass("userName")) {
    profileDialog.clearUserData();
    let createPop = $Popup({
      type: "editUser",
      title: jsonData.IGpopup.editUser.title,
      content: $(".editUserInfo").html(),
      closeBtn: jsonData.IGpopup.editUser.save,
      applyBtn: jsonData.IGpopup.editUser.cancel,
      autoClose: false,
      exist: "editUser",
      onClose: () => {
        let isPass = true;
        if (!profileDialog.editUser_Avatar) {
          $(".erorrTip[data-type='editUserAvatar']")
            .find(".image_error")
            .text(jsonData.aiGirlFriend.createMc.avatar_not);
          $(".erorrTip[data-type='editUserAvatar']").css(
            "visibility",
            "visible"
          );
          isPass = false;
        } else {
          $(".erorrTip[data-type='editUserAvatar']").css(
            "visibility",
            "hidden"
          );
        }
        if (!profileDialog.editUser_firstName) {
          $(".erorrTip[data-type='editUser_firstName']").css(
            "visibility",
            "visible"
          );
          isPass = false;
        } else {
          $(".erorrTip[data-type='editUser_firstName']").css(
            "visibility",
            "hidden"
          );
        }
        if (!profileDialog.editUser_lastName) {
          $(".erorrTip[data-type='editUser_lastName']").css(
            "visibility",
            "visible"
          );
          isPass = false;
        } else {
          $(".erorrTip[data-type='editUser_lastName']").css(
            "visibility",
            "hidden"
          );
        }
        if (!isPass) return;
        createPop.loading.start();
        $(".modal .createMc_item").addClass("loading");
        profileDialog.userInfoUpdate(
          () => {
            $(".modal .createMc_item").removeClass("loading");
            createPop.loading.end();
            createPop.close();
            profileDialog.clearUserData();
            updateUserData();
          },
          () => {
            createPop.loading.end();
          }
        );
      },
      onApply: async () => {
        createPop.close();
        profileDialog.clearUserData();
      },
    });
    profileDialog.getUserData();
    profileDialog.clickUserEvent();
  }
  if (target.parents(".addImage").length != 0 || target.hasClass("addImage")) {
    let dom =
      target.parents(".addImage").length != 0
        ? target.parents(".addImage")
        : target;
    if (dom.parents(".avatar").length != 0) {
      dom.parents(".editUser").length != 0
        ? $("#editUserAvatar").click()
        : $("#createMC_avatar").click();
    } else if (dom.parents(".background").length != 0) {
      $("#createMC_background").click();
    }
  }
  if (judgeClient() !== "pc") {
    e.stopPropagation();
    if (target.closest(".IGgrid_table_item").length !== 0 && !target.hasClass("likeIcon")) {
      const id = target.closest(".IGgrid_table_item").attr("data-id");
      window.location.href = `/explore/${id}`;
    }
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
      if (
        !res.data.is_in_ip_whitelist &&
        timezoneOffset === -480 &&
        browserLanguage.toLowerCase() === "zh-cn"
      ) {
        document.body.innerHTML =
          '<div class="shield-page">The website is not available</div>';
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
  showLoginWindow({
    fn: igLogin,
  });
});

$(document).ready(function () {
  igLogin();
  setInsurCookie();
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
        aiGirlFriend.GetMyCharacters();
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

function debounce(func, wait) {
  let timeout;

  return function () {
    let context = this; // 保存this指向
    let args = arguments; // 拿到event对象

    clearTimeout(timeout);
    timeout = setTimeout(function () {
      func.apply(context, args);
    }, wait);
  };
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

// 数字格式化
function formatNumber(value) {
  if (!value) return 0;
  value = Number(value);
  if (value < 1000) {
    return value.toString();
  } else if (value >= 1000 && value < 1000000) {
    const kValue = value / 1000;
    return kValue % 1 < 0.1 ? `${kValue.toFixed(0)}K` : `${kValue.toFixed(1)}K`;
  } else {
    const mValue = value / 1000000;
    return mValue % 1 < 0.1 ? `${mValue.toFixed(0)}M` : `${mValue.toFixed(1)}M`;
  }
}

// 底部提示 需要引入/dist/js/bottom-message/index.js使用
function ToolTip(params) {
  const { text = "", type = "", showtime = "" } = params;
  $("body").append(`
    <bottom-message
      text="${text}"
      type="${type}"
      showtime="${showtime}"
      >
    </bottom-message>`);
}

function copyText(text) {
  const textToCopy = text;
  const tempInput = document.createElement("input");
  tempInput.value = textToCopy;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand("copy");
  document.body.removeChild(tempInput);
}

let span = 240;

// render the grid page
function renderGrid({ list, isClear, callback }) {
  let spanrow = 5;
  const IGgrid_table_container = $(".IGgrid_table_container");
  if (judgeClient() !== "pc") {
    const fontsize = Number(getComputedStyle(window.document.documentElement)['font-size'].split("px")[0]) // get really px;
    const width = IGgrid_table_container.width();
    span = (width - (fontsize * 0.22)) / 2;
    spanrow = 1
  }
  const IGgrid_container = $(".IGgrid_container");
  const lottieLoading = $(".lottie-loading");
  if (!IGgrid_table_container || !IGgrid_container || !lottieLoading) {
    throw new Error("");
  }
  let num = list.length; // ready for display
  if (!num) {
    if (isClear) {
      IGgrid_table_container.html("");
    }
    callback?.();
    return;
  }
  let html = "";
  list.forEach(function (el, index) {
    html += `
      <div class="IGgrid_table_item notshowitem" data-id="${el.id}">
        <div class="img_box">
          <img
            src="${el.cover}"
            style="width: 100%"
            class="generated_img"
            data-id="${el.id}"
          />
          <div class="mask_remix">
            <p>
              ${el.prompt}
            </p>
            <div class="remix_btn">${jsonData?.IGhome?.remix}</div>
          </div>
        </div>
        <div class="userinfo">
          <img
            src="${el?.user?.avatar || "/dist/img/IGhome/icon_avatar.svg"}"
            class="userHeadImg"
          />
          <p class="nickname">${el?.user?.username}</p>
          <b class="likenum">${formatNumber(el?.stat?.like || 0)}</b>
          <div class="likeIcon ${el.liked ? "like" : ""}" data-like="${el?.stat?.like
      }"></div>
        </div>
      </div>
      `;
  });
  if (isClear) {
    IGgrid_table_container.html("");
  }
  IGgrid_table_container.append(html);
  $(".generated_img").off("load").on("load", function () {
    num--;
    const height = (span / $(this).width()) * $(this).height() + (61); // 10 + 24 + 27 pic height + userinfo distance
    $(`.IGgrid_table_item[data-id='${$(this).attr("data-id")}']`).css("grid-row-end", `span ${Number((height / spanrow).toFixed(0)) || 1}`)
    if (num <= 0) {
      IGgrid_container.removeClass("notshow");
      $(".IGgrid_table_item").removeClass("notshowitem")
    }
  });
  $(".generated_img").off("error").on("error", function () {
    if ($(this).attr("src") != "/dist/img/IGhome/default_failed_img.svg") {
      $(this).attr("src", "/dist/img/IGhome/default_failed_img.svg");
    }
  });
  // setGridEvents(list);
  callback?.();
}

function likePost(id, dom) {
  if (!getCookie("access_token")) {
    showLoginWindow();
    return;
  }
  const changeLikeStatus = (isLikeed) => {
    let likenum = Number(dom.attr("data-like"));
    console.error(likenum)
    if (isLikeed) {
      likenum <= 0 ? 0 : likenum--;
      dom.removeClass("like");
    } else {
      likenum++;
      dom.addClass("like");
    }
    dom.attr("data-like", likenum || 0);
    dom.siblings(".likenum").text(formatNumber(likenum || 0));
  };
  const isLiked = dom.hasClass("like");
  changeLikeStatus(isLiked);
  _$$.postComm(`generate/post/like`, { id })
    .then((res) => {
      if (res.code != 200) {
        changeLikeStatus(!isLiked); // Restore state on failure
        if (res.code === 401) {
          localStorage.removeItem("user_info");
          setCookie("loginProduct", "");
          setSessionCookie("st", "");
          setCookie("refresh_token", "");
          setCookie("user_info", "");
          setCookie("access_token", "");
          isLogin(false);
          window.location.reload()
        }
      }
      if (window.location.pathname.includes("/explore/")) {
        gtag("event", "click_imginfo_cardlikebtn")
      } else {
        gtag("event", "click_home_cardlikebtn")
      }
    })
    .catch((err) => {
      changeLikeStatus(!isLiked);
    });
}

let isScrollLoading = false;
let nomore = false;
function listenScroll({ callback }) {
  const IGgrid_container = $(".IGgrid_container");
  const throttle = (fun, delay) => {
    let last = 0;
    let timer = null;
    return function throttled(...args) {
      const now = Date.now();
      if (now - last >= delay) {
        clearTimeout(timer);
        fun.apply(this, args);
        last = now;
      } else if (!timer) {
        timer = setTimeout(() => {
          fun.apply(this, args);
          timer = null;
        }, delay - (now - last));
      }
    };
  };

  const handleScroll = function () {
    if (nomore) return false;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const vHeight = window.innerHeight || document.documentElement.clientHeight;
    const pageHeight = document.documentElement.scrollHeight;
    if (vHeight + scrollTop >= pageHeight - 400) {
      if (isScrollLoading) return;
      IGgrid_container.addClass("more_loading");
      console.log("send message", nomore);
      isScrollLoading = true;
      callback?.();
    }
  };
  window.removeEventListener("scroll", throttle(handleScroll, 500));
  window.addEventListener("scroll", throttle(handleScroll, 500));
}

function setGotoTop(targetClassname = null, classname = ".gotoHead") {
  if (targetClassname) {
    $(classname).on("click", function (e) {
      $("html, body").animate(
        {
          scrollTop: $(targetClassname).offset().top - 20,
        },
        0
      );
    });
  } else {
    $(classname).on("click", function (e) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
}

function setParams(obj) {
  let result = "";
  let item;
  for (item in obj) {
    if (obj[item] && String(obj[item])) {
      result += `&${item}=${obj[item]}`;
    }
  }
  if (result) {
    result = "?" + result.slice(1);
  }
  return result;
}

async function renderShare(obj, fromPage) {
  let html = `
    <div class="share_mask">
      <div class="share_box">
        <div class="share_close_icon"></div>
        <div class="share_title">
          <div class="icon"></div>
          <div class="text">${jsonData.IGshare.title}</div>
        </div>
        <div class="share_loading"></div>
        <div class="share_content">
          <div class="share_des">${jsonData.IGshare.des}</div>
          <div class="share_method">
            <div class="tw_method share">
              <div class="icon tw"></div>
              <div class="text tw">${jsonData.IGshare.x}</div>
            </div>
            <div class="fb_method share">
              <div class="icon fb"></div>
              <div class="text fb">${jsonData.IGshare.fb}</div>
            </div>
            <div class="link_method share">
              <div class="icon link"></div>
              <div class="text link">${jsonData.IGshare.link}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  const share_html = $(html);
  const shareBox = share_html.find(".share_box");
  const close = share_html.find(".share_close_icon");
  const xShare = share_html.find(".tw_method");
  const fbShare = share_html.find(".fb_method");
  const linkShare = share_html.find(".link_method");

  shareBox.addClass("loading");
  share_html.appendTo("body");
  if (fromPage === 'info') {
    gtag('event', 'show_imginfo_share')
  } else {
    gtag('event', 'show_generator_share')
  }
  let shareLink = await getShareLink(obj);
  shareLink = shareLink.trim()

  close.on("click", function () {
    share_html.remove();
  });

  share_html.on("click", function (e) {
    if (!$(e.target).closest(".share_box").length) {
      share_html.remove();
    }
  });

  xShare.on("click", function () {
    if (fromPage === 'info') {
      gtag('event', 'click_imginfo_xshare')
    } else {
      gtag('event', 'click_generator_xshare')
    }
    window.open(
      `https://twitter.com/intent/tweet?url=${shareLink}?play_source=Twitter&text=${encodeURIComponent(
        jsonData.IGshare.shareText
      )}`,
      "_blank"
    );
  });

  fbShare.on("click", function () {
    if (fromPage === 'info') {
      gtag('event', 'click_imginfo_fbshare')
    } else {
      gtag('event', 'click_generator_fbshare')
    }
    window.open(
      `https://www.facebook.com/sharer.php?u=${shareLink}?play_source=Facebook&text=${encodeURIComponent(
        jsonData.IGshare.shareText
      )}`,
      "_blank"
    );
  });

  linkShare.on("click", function () {
    if (fromPage === 'info') {
      gtag('event', 'click_imginfo_linkshare')
    } else {
      gtag('event', 'click_generator_linkshare')
    }
    try {
      copyText(shareLink);
      ToolTip({
        text: jsonData.IGshare.copySuc,
      });
    } catch (err) {
      ToolTip({
        type: "error",
        text: jsonData.IGshare.copyErr,
      });
    }
  });

  async function getShareLink(obj) {
    const params = setParams(obj);
    const url = `generate/image/share${params}`;
    try {
      const res = await _$$.getComm(url);
      console.log(res);
      if (res.code === 200) {
        shareBox.removeClass("loading");
        return res.data.url;
      } else {
        share_html.remove();
        ToolTip({
          type: "error",
          text: jsonData.IGshare.fail,
        });
      }
    } catch (err) {
      console.log(err);
      share_html.remove();
      ToolTip({
        type: "error",
        text: jsonData.IGshare.fail,
      });
      $Popup({
        type: "error",
        errorType: "network",
      });
    }
  }
}

function showLeadLogin(type, callback) {
  if (getCookie("access_token")) {
    if (type === "back") {
      window.history.back();
    }
    callback?.();
    return true;
  }
  const text = {};
  switch (type) {
    case "back":
      (text.title = jsonData.IGpopup.leadLoginBackTitle),
        (text.content = `<br/>${jsonData.IGpopup.leadLoginBackDes}<br/><br/><br/>`);
      break;
    case "download":
      (text.title = jsonData.IGpopup.leadLogindownTitle),
        (text.content = `<br/>${jsonData.IGpopup.leadLogindownDes}<br/><br/><br/>`);
      break;
  }
  const popup = $Popup({
    title: text.title,
    content: text.content,
    applyBtn: jsonData.IGpopup.NotNow,
    closeBtn: jsonData.header.login,
    onClose: () => {
      showLoginWindow({
        fn: () => {
          callback?.();
        },
      });
    },
    onApply: () => {
      popup.close();
      if (type === "back") {
        window.history.back();
      }
    },
  });
}

function getCreditsText(name, valData = {}, bool = false) {
  if (bool) {
    let num = valData.val;
    if (typeof num === "string") {
      let strWithoutCommas = num.replace(/,/g, "");
      num = parseFloat(strWithoutCommas);
    }

    if (num > 1 || (num < 1 && num > 0)) {
      name += "_p";
    }
  }
  let str = jsonData["IGheader"][name];
  for (let key in valData) {
    const regex = new RegExp(`{{${key}}}`, "g");
    str = str.replace(regex, valData[key]);
  }
  return str;
}

// getUserinfo().then((res) => {
//   setHeaderCredits(res.credit);
// }).catch(err => {
//   console.error(err)
// })
$("#header_credits").hide();

function getUserinfo() {
  return new Promise((resolve, reject) => {
    _$$.postComm("api/user/info")
      .then((res) => {
        if (res?.code === 200 && res?.data) {
          resolve(res.data);
        } else {
          console.error(res);
          resolve(res);
        }
      })
      .catch((err) => {
        console.error(err);
        resolve();
      });
  });
}

function setHeaderCredits(num) {
  if (!getCookie("access_token")) {
    return
  }
  $("#header_credits").html(
    `<img src="/dist/img/IGhome/icon_credits.svg">${getCreditsText(
      "credit",
      { val: num },
      true
    )}`
  );
  $("#header_credits").show();
}
