function getHost() {
  let url = document.location.pathname;
  let value = "";
  if (url == "/ai-girlfriend.html") {
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

function toggleValue(arr, value) {
  const index = arr.indexOf(value);
  
  if (index === -1) {
      arr.push(value);
  } else {
      arr.splice(index, 1);
  }
  return arr;
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
  const productPage = ['/multiple-face-swap.html','/multiple-face-swap.html?openTab=videofs', '/face-swap.html','/face-swap.html?openTab=videofs', '/ai-girlfriend.html', '/ai-boyfriend.html']
  const localPathKey = 'LOCAL_PATH_STORAGE'
  const localPathJSON = localStorage.getItem(localPathKey)
  const localPath = localPathJSON ? JSON.parse(localPathJSON) : []
  function showPathNav() {
    productPage.forEach((pp) => {
      if (pp.includes("friend.html")){
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
  if (productPage.filter((pp) => new Set(localPath).has(pp)).length > 0) {
    showPathNav()
  } else {
    hidePathNav()
  }
  if (productPage.includes(location.pathname)) {
    localStorage.setItem(localPathKey, JSON.stringify([...new Set([...localPath, location.pathname])]))
    console.error(localPathJSON)
    showPathNav()
  }
})