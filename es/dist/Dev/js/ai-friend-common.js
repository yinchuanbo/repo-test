function getHost() {
  let url = document.location.pathname;
  let value = "";
  if (url == "/novia-virtual.html") {
    value = "girl";
  } else if (url == "/ai-boyfriend.html") {
    value = "boy";
  }
  return value;
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

var pathUrlName = getHost();
let breakTime = 0;
let lastUrl = "";
var isSendMsgFn;
// POST
function fetchPost(url, data = {}, headers = {}, isShowLogin = true) {
  isSendMsgFn = sendErrorMsgXPF(url);
  return new Promise((resolve, reject) => {
    fetch(TOOL_API + url, {
      method: "POST",
      headers: {
        ...{
          "Content-Type": "application/json",
          "X-TASK-VERSION": "2.0.0",
          "Request-Origin": "vidqu",
          "Request-Language":"es",
          "Request-Project": pathUrlName == "girl" ? "girlfriend" : "boyfriend",
          // "WEB-VERSIONS-NUM":currentVersion,
          Sesid: ttsBlank(getCookie("SsToken")) ? "" : getCookie("SsToken"),
          "Sesid-sign": ttsBlank(getCookie("SsToken-sign")) ? "" : getCookie("SsToken-sign"),
          Authorization: ttsBlank(getCookie("access_token")) ? "" : "Bearer " + getCookie("access_token"),
        },
        ...headers,
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        setCookieSesid(response);
        if (breakTime != 0 && isSendMsgFn && response.status >= 500) {
          const data = {
            url,
            data: JSON.stringify(data),
            token: ttsBlank(getCookie("access_token")) ? "" : "Bearer " + getCookie("access_token"),
            Sesid: ttsBlank(getCookie("SsToken")) ? "" : getCookie("SsToken")
          }
          isSendMsgFn(url, data);
        }
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
// GET方法封装
var fetchGet = function (url, headers = {}, isShowLogin = true) {
  isSendMsgFn = sendErrorMsgXPF(url);
  let startTime;
  if (url == "chat/user/get-setting") {
    startTime = new Date().getTime();
  }
  return new Promise((resolve, reject) => {
    fetch(TOOL_API + url, {
      method: "GET",
      headers: {
        ...{
          "Content-Type": "application/json",
          "X-TASK-VERSION": "2.0.0",
          "Request-Origin": "vidqu",
          "Request-Language":"es",
          "Request-Project": pathUrlName == "girl" ? "girlfriend" : "boyfriend",
          // "WEB-VERSIONS-NUM":currentVersion,
          Sesid: ttsBlank(getCookie("SsToken")) ? "" : getCookie("SsToken"),
          "Sesid-sign": ttsBlank(getCookie("SsToken-sign")) ? "" : getCookie("SsToken-sign"),
          Authorization: ttsBlank(getCookie("access_token")) ? "" : "Bearer " + getCookie("access_token"),
        },
        ...headers,
      },
    })
      .then((response) => {
        if (url == "chat/user/get-setting") {
          breakTime = new Date().getTime() - startTime;
        }
        if (breakTime != 0 && isSendMsgFn && response.status >= 500) {
          const data = {
            url,
            token: ttsBlank(getCookie("access_token")) ? "" : "Bearer " + getCookie("access_token"),
            Sesid: ttsBlank(getCookie("SsToken")) ? "" : getCookie("SsToken")
          }
          isSendMsgFn(url, data);
        }
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

function sendErrorMsgXPF(nowUrl) {
  if (breakTime === 0 && nowUrl != lastUrl && nowUrl == 'chat/public/add-log') return;
  let startTime = new Date().getTime();
  const func = debounce(function (url, data) {
    const endTime = new Date().getTime();
    const duringTime = endTime - startTime;
    console.log(url, lastUrl, 'lastUrl')
    if (url == lastUrl) {
      lastUrl = "";
      func(url);
      return;
    }
    data = { ...{ isTimeout: duringTime > 4000 }, data }
    console.error("add-log")
    fetchPost("chat/public/add-log", data);
  }, 1000);
  return func;
}

function uploadImagePromise(file, name = "") {
  return new Promise(async (resolve, reject) => {
    try {
      var res = await getUploadFileUrl(file, name);
      console.log(res, "res");
      uploadFile({ url: res.data.upload_url, file })
        .then((code) => {
          if (code !== 200) {
            reject();
          } else {
            resolve({ res, code });
          }
        })
        .catch((err) => reject(err));
    } catch (err) {
      reject(err);
      console.log(err);
    }
  });
};

function getUploadFileUrl  (file, name)  {
  let type = file.type;
  let fileName = file.name;
  try {
    type = type.split("/")[1] || "png";
    name = name || fileName.split(".")[0] || "defaultName";
  } catch (e) {
    type = "png";
  }
  return fetchPost("ai/source/get-upload-url", { file_name: `${fileName}.${type}` });
};

function uploadFile(data)  {
  return new Promise(async (resolve, reject) => {
    try {
      var res = await fetchPut(data.url, data.file, "");
      resolve(res);
    } catch (e) {
      console.error(e.message);
      reject(e);
    }
  });
};

$(function () {
  lazyLoad()
  getCountryType();
})

function getCountryType() {
  fetchGet("ai/public/get-country-type")
    .then((res) => {
      if (res.code !== 200) return;
      const countryType = res.data.name;
      if ((countryType === "T1" || countryType === "T2") && judgeClient() === 'ios' && document.location.pathname !== '/pricing.html') {
        $('.fix-footer').css("bottom", '0.88rem');
        $("#iosFooter").show()
        $("#ios_footer_btn").click(function () {
          gtag("event", "en_faceappclick_fcios");
          window.location.href = "https://apps.apple.com/app/apple-store/id6497986083?pt=127019031&ct=from_es_vidq&mt=8";
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

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


