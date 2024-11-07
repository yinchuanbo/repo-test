let logintimer = null;
let openwin = null;
let openwinTimer = null;
let winRef = null;
const clientMask = document.createElement("div");
const leftWindow = (window.innerWidth - 600) / 2;
const topWindow = (window.innerHeight - 700) / 2;
const windowFeatures = `width=600,height=700,top=${topWindow},left=${leftWindow},scrollbars=yes,resizable=yes`;
clientMask.style = `
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999999999;
`;

let wait = null;

var XTASKVERSION = "2.0.0";
const interHost =
  location.host.includes(".vidqu.ai") && !location.host.includes("test")
    ? "https://main-api.vidqu.ai"
    : "https://main-api-test.vidqu.ai";

function hostName(){
  let name = '';
  let url = document.location.pathname;
  if (url == "/ai-girlfriend.html") {
    name = "girl";
  }else if(url == '/ai-boyfriend.html'){
    name = 'boy'
  }
  return name;
}

const selfLoginTxt = jsonData["login"];

function getUrlParam(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
  var r = window.location.search.substr(1).match(reg);
  if (r != null) return encodeURI(r[2]);
  return null;
}

//Get cookie
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

/**Ajax request method
 *@{param.url} interface address
 *@{param.type} Interface Request Get Post
 *@{param.data} Interface Request Data*/
let access_token = getCookie("access_token") ? getCookie("access_token") : "";
// let refresh_token = getCookie("refresh_token") ? getCookie("refresh_token") : '';
let refresh_token = getCookie("refresh_token")
  ? getCookie("refresh_token")
  : "";
let allowToken = ["/web/recorder/newsharepage.html"]; //Define the page that does not require Token
// let notTokenFlag = allowToken.includes(currentPagepath);
let notTokenFlag = false;
let request_header = "";
function jqAjaxPromise(param, progressFun = () => {}, origin = "vidqu") {
  access_token = getCookie("access_token") ? getCookie("access_token") : "";
  // refresh_token = localStorage.getItem("refresh_token") ? localStorage.getItem("refresh_token") : '';
  refresh_token = getCookie("refresh_token") ? getCookie("refresh_token") : "";
  const url = interHost + param.url;
  request_header = getCookie("access_token")
    ? { Authorization: "Bearer " + access_token }
    : { Authorization: "" };
  request_header["X-TASK-VERSION"] = XTASKVERSION;
  request_header["Request-Language"] = "en";
  request_header["Request-Origin"] = origin;
  request_header["Request-App"] = "ai";
  return new Promise((resolve, reject) => {
    let ajaxTimeOut = $.ajax({
      url: url,
      type: param.type || "GET",
      // headers: { "Authorization": 'Bearer ' + access_token },
      headers: {
        ...request_header,
        ...param.headers,
        "Request-Origin": origin,
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
          param.cb401 &&
            param.cb401({
              data,
              resolve,
              reject,
            });
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

function findAncestors(node, match) {
  while (node != null) {
    // eslint-disable-next-line
    if (match.call(null, node)) {
      return node;
    }
    node = node.parentNode;
  }
  return null;
}

function isBlank(data) {
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

//Use LocalStorage to save data
function getStorage(name) {
  const nameStorage = localStorage.getItem(name);
  let result = null;
  if (!nameStorage || nameStorage === "null" || nameStorage === null) {
    result = null;
  } else {
    result =
      typeof nameStorage === "number" ||
      name === "textareaVal" ||
      name === "token"
        ? nameStorage
        : JSON.parse(nameStorage);
  }
  return result;
}

//Read data with LocalStorage
function setStorage(name, param) {
  if (typeof param === "number" || typeof param === "string") {
    localStorage.setItem(name, param);
  } else {
    localStorage.setItem(name, JSON.stringify(param));
  }
}

//Use LocalStorage to delete data
function removeStorage(name) {
  if (!name) {
    localStorage.clear();
  } else {
    localStorage.removeItem(name);
  }
}

//Calculate the position of the window to make it center
function openCenteredWindow(url, width, height) {
  if (!winRef) {
    return window.open(url, "_blank", windowFeatures);
  } else {
    winRef.location.href = url;
    return winRef;
  }
}

function backVal(field) {
  return typeof field === "string" ? field : field.value;
}

const onCheckEmail = (email) => {
  const Expression =
    "^\\w[-\\w.+]*@([A-Za-z0-9][-A-Za-z0-9]*\\.)+[A-Za-z]{2,14}$";
  const logreg = new RegExp(Expression);
  return logreg.test(email);
};

const onCheckPassword = (pass) => {
  if (pass.trim().length === 0 || pass === null) {
    return false;
  } else if (pass.trim().length < 6 || pass.trim().length > 20) {
    return false;
  } else {
    return true;
  }
};

function _debounce(fn) {
  let t = null;
  return function () {
    if (t) {
      clearTimeout(t);
    }
    t = setTimeout(() => {
      fn.apply(this, arguments);
    }, 1000);
  };
}

/**
 * @param {data} and { type }
 */
function sendEmailRequest(param, dom) {
  jqAjaxPromise(
    {
      url: "/api/user/account-validate",
      type: "POST",
      data: { email: param.data },
    },
    () => {}
  )
    .then((res) => {
      if (res.code === 200) {
        if (param.type === "signin") {
          const _btn = dom.querySelector(".login-submit");
          _btn.setAttribute("anchor", res.data.type);
          _btn.removeAttribute("disabled");
          let btnText = "";
          if (res.data.status === 0) {
            btnText = selfLoginTxt["sign-up"];
          } else {
            if (res.data.type === "account") {
              btnText = selfLoginTxt["sign-in"];
            } else {
              btnText = dom
                .querySelector(`.button-thirdParty[anchor='${res.data.type}']`)
                .getAttribute("anchor-desc");
            }
          }
          _btn.querySelector("span").innerText = btnText;
        } else if (param.type === "resetPwd") {
          const _btn = dom.querySelector(".login-reset-pwd-btn");
          const _input = dom.querySelector(".login-reset-pwd-email");
          if (res.data.status === 0) {
            _btn.setAttribute("disabled", "diabled");
            _input.classList.add("error");
            _input.parentNode.classList.add("error");
            _input.parentNode.querySelector(".error-tip").innerText =
              selfLoginTxt["the-email-you-entered-is-incorrect-try-again"];
          } else {
            _input.classList.remove("error");
            _input.parentNode.classList.remove("error");
            _btn.removeAttribute("disabled");
          }
        }
      } else {
        if (param.type === "signin") {
          const _btn = dom.querySelector(".login-submit");
          _btn.removeAttribute("disabled");
        }
      }
    })
    .catch(() => {
      if (param.type === "signin") {
        const _btn = dom.querySelector(".login-submit");
        _btn.removeAttribute("disabled");
      }
    });
}

//Determine whether the two values ​​are equal directly
const containsVal = (field, value) => {
  const value1 = backVal(field);
  return value1 === value;
};

function getNewParam(param) {
  const paramObj = localStorage.getItem("toolsPosition")
    ? { position: location.pathname }
    : "";
  param = {
    productName: "vidqu",
    pageName: localStorage.getItem("loginPageName"),
    ...param,
  };
  param = paramObj ? { ...param, ...paramObj } : param;
  return param;
}

function getLoginStatus(loginId, current) {
  let _this = this;
  operateLoginTimer();
  let data = {
    loginId,
  };
  data = getNewParam(data);
  logintimer = setInterval(() => {
    jqAjaxPromise(
      {
        url: "/api/third-login/get-user-status",
        type: "GET",
        data,
      },
      () => {}
    )
      .then(async (res) => {
        res.code != 202 && clientMask.remove();
        if (res.code === 200) {
          operateLoginTimer();
          const userTraits = {
            id: res.data.id,
            email: res.data.email,
            first_name: res.data.first_name,
            last_name: res.data.last_name,
            head_portrait: res.data.head_portrait,
            usertype: res.data.type,
          };

          setCookie("access_token", res.data.access_token, 30);
          setCookie("refresh_token", res.data.refresh_token, 30);
          setCookie("loginProduct", res.data.redirect_url, 30);

          setStorage("user_info", userTraits);
          setCookie("user_info", JSON.stringify(userTraits), 30);
          setStorage("isReplace", true);

          const toolParams = localStorage.getItem("toolsPosition");
          const productToPagelocal = localStorage.getItem("productToPage");
          if (!toolParams && !productToPagelocal) {
            if (!toCurrentLangApp(localStorage.getItem("loginProductName"))) {
              location.href = res.data.redirect_url;
            }
          } else if (toolParams === "true") {
            location.reload();
          }

          let data;
          if (wait && Array.isArray(wait)) {
              data = await newDownloadFile(...wait);
          }

          _this.showSuccessWindow();
          setTimeout(() => {
            if(data != null){
              _this.loginSuccess(data);
            }else{
              _this.loginSuccess();
            }
          }, 2000);
          closeOpenerWindow();
        } else if (res.code === 202) {
          operateLoginTimer();
          getLoginStatus.bind(_this)(loginId, current);
        } else {
          operateLoginTimer();
          closeOpenerWindow();
          if (res.code === 203) {
            _this.toPath("link");
            _this.setLinkInfo({
              email: res.data.email,
              type: res.data.type,
            });
          } else if (res.code === 204) {
            _this.toPath("almost");
            _this.almostLoginId = loginId;
          }
        }
      })
      .catch((err) => {
        clientMask.remove();
        _this.shadowRootEl
          .querySelectorAll(".button-thirdParty")
          .forEach((item) => {
            item.removeAttribute("disabled");
          });
        console.error(err);
        operateLoginTimer();
      });
  }, 2000);
}

function loginRedirect(data) {
  return new Promise((resolve, reject) => {
    jqAjaxPromise(
      { url: "/api/third-login/login-redirect", type: "POST", data },
      () => {}
    )
      .then((res) => {
        if (res.code === 200) {
          openwin = openCenteredWindow(res.data.url, 600, 700);
          this.windowBody.classList.add("loading");
          if (openwin) {
            openwinTimer = setInterval(() => {
              if (openwin.closed) {
                this.windowBody.classList.remove("loading");
                clearInterval(openwinTimer);
                operateLoginTimer();
              }
            }, 500);
          }
        } else {
          console.log("Sign in failed. Please try again later.");
        }
      })
      .finally(() => {
        resolve();
      });
  });
}

function LogIn(data, current) {
  data = getNewParam(data);
  jqAjaxPromise(
    { url: "/api/third-login/login-url-box", type: "GET", data },
    () => {}
  )
    .then(async (res) => {
      if (res.code === 200) {
        await loginRedirect.bind(this)({
          access_token: getCookie("access_token"),
          loginId: res.data.loginId,
          action: current,
        });
        setCookie("loginid", res.data.loginId);
        getLoginStatus.bind(this)(res.data.loginId, current);
      } else {
        ToolTip({
          text: selfLoginTxt["sign-in-failed-please-try-again-later"],
          type: "error",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      operateLoginTimer();
    })
    .finally(() => {
      document
        .querySelector(".login-dialog")
        .querySelectorAll(".button-thirdParty")
        .forEach((child) => {
          child.removeAttribute("disabled");
        });
    });
}

function detectDeviceType() {
  const userAgent = navigator.userAgent;
  if (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent
    )
  ) {
    return "mobile";
  } else {
    return "pc";
  }
}

function thirdPartyLoginEvent(event) {
  const tarEle = event.target;
  const threeitem = findAncestors(tarEle, function (node) {
    return node.classList.contains("button-thirdParty");
  });
  if (!threeitem) return;
  operateLoginTimer();
  // closeOpenerWindow()
  const _anchor = threeitem.getAttribute("anchor");
  const _current = threeitem.getAttribute("current");
  threeitem.setAttribute("disabled", true);
  const appLoginId = !isBlank(getUrlParam("loginId"))
    ? getUrlParam("loginId")
    : "";
  const loginGaList = {
    google: "registerpop_google_official",
    yahoo: "registerpop_yahoo_official",
    facebook: "registerpop_facebook_official",
    linkedin: "registerpop_linkedin_official",
    microsoft: "registerpop_microsoft_official",
  };
  if (detectDeviceType() === "mobile") {
    winRef = window.open("", "_blank");
} else {
    winRef = window.open("", "_blank", windowFeatures);
}
  let insur = "";
  if (this.getUrlVal("insur")) {
    insur = this.getUrlVal("insur");
  } else {
    insur = hostName() == 'girl' ? "aigirlfriend":hostName() == 'boy'? 'aiboyfriend' : getCookie("insur");
  }
  LogIn.bind(this)(
    {
      type: _anchor,
      loginId: appLoginId,
      aff: getCookie("aff") ? JSON.parse(getCookie("aff")) : "",
      insur,
      code: getUrlParam("code"),
    },
    _current
  );
}

function thirdPartyLogin(_this) {
  let dom = _this.shadowRootEl || document;
  const threelogins = dom.querySelectorAll(".button-thirdParty");
  threelogins.forEach((item) =>
    item.addEventListener("click", thirdPartyLoginEvent.bind(_this))
  );
}

function LoginSubmission(param, fn = () => {}, isCanva) {
  const appLoginId = !isBlank(getUrlParam("loginId"))
    ? getUrlParam("loginId")
    : "";
  const paramData = {
    aff: getCookie("aff") ? JSON.parse(getCookie("aff")) : "",
    insur: getCookie("insur"),
    code: getUrlParam("code"),
    loginId: appLoginId,
  };
  param = { ...param, ...paramData };
  let _this = this;
  param = getNewParam(param);
  jqAjaxPromise(
    {
      url: "/api/user/login",
      type: "POST",
      data: param,
    },
    () => {}
  )
    .then(async (res) => {
      if (res.code === 200) {
        const userTraits = {
          id: res.data.id,
          email: res.data.email,
          first_name: res.data.first_name,
          last_name: res.data.last_name,
          head_portrait: res.data.head_portrait,
          usertype: res.data.type,
        };
        setCookie("access_token", res.data.access_token, 30);
        setCookie("refresh_token", res.data.refresh_token, 30);
        setCookie("loginProduct", res.data.redirect_url, 30);
        setStorage("user_info", userTraits);
        setCookie("user_info", JSON.stringify(userTraits), 30);
        setStorage("isReplace", true);
        const toolParams = localStorage.getItem("toolsPosition");
        const productToPagelocal = localStorage.getItem("productToPage");
        if (!toolParams && !productToPagelocal) {
          if (!toCurrentLangApp(localStorage.getItem("loginProductName"))) {
            location.href = res.data.redirect_url;
          }
        } else if (toolParams === "true") {
          location.reload();
        }
        let data;
        if (wait && Array.isArray(wait)) {
            data = await newDownloadFile(...wait);
        }
        this.showSuccessWindow();
        setTimeout(() => {
          if (data != null) {
            this.loginSuccess(data)
          } else {
              this.loginSuccess()
          }
        }, 2000);
      } else {
        if (res.code === 400) {
          Modal({
            iconType: "hint",
            titleText:
              selfLoginTxt[
                "the-password-you-entered-is-incorrect-try-again-or-click-forgot-password"
              ],
          });
        } else if (res.code === 210) {
          this.isAccount = "true";
          this.toPath("verify");
          this.verifyEmail = param.email;
        } else {
          Modal({
            iconType: "hint",
            titleText: selfLoginTxt["sign-in-failed-please-try-again-later"],
          });
        }
      }
    })
    .catch(() => {
      Modal({
        iconType: "hint",
        titleText: selfLoginTxt["sign-in-failed-please-try-again-later"],
      });
    })
    .finally(() => {
      fn();
    });
}

function operateLoginTimer() {
  if (logintimer) {
    window.clearInterval(logintimer);
    clearInterval(logintimer);
    logintimer = null;
  }
}

function closeOpenerWindow() {
  // window.opener = null
  // window.open('', '_self')
  !!openwin && openwin.close();
}

class MyComponent extends HTMLElement {
  constructor() {
    super();

    this.ltitle = this.getAttribute("ltitle") || selfLoginTxt["sign-title"];
    this.history = "";
    this.loginCheck = {
      email: false,
      pwd: false,
      code: false,
    };
    this.registerCheck = {
      email: false,
      firstName: false,
      lastName: false,
      pwd: false,
    };
    this.verifyEmail = this.getAttribute("verifyEmail") || "";
    this.linkEmail = this.getAttribute("linkEmail") || "";
    this.resetBackLink = false;
    this.linkType = "";
    this.almostLoginId = "";
    this.mainInputValue = "";
    this.isAccount = "";
    this.isTemplateType = this.getAttribute("isTemplateType") || "";
  }

  //ConnectedCallback was called when the custom element was first connected to the document DOM.
  connectedCallback() {
    this.innerHTML = `
        <div id="login-dialog" class="login-dialog ${
          this.isTemplateType === "true" ? "canva-container" : ""
        }" >
        <div class="login-dialog-container">
            <div class="login-dialog-left-img">
            </div>
            <div class="login-dialog-body" >
            <div class="small-loading">
                <p>${selfLoginTxt.loading}</p>
            </div>
            <i class='login-close-btn pointer'></i>
            <i class='login-back-btn pointer'></i>
            <div class="login-sigin">
                <h4 class="window-title">${this.ltitle}</h4>
                <p class="login-descript">${
                  selfLoginTxt["sign-up-easily-with"]
                }</p>
                <div class="login-btn-group">
                <button class="pointer button-google button-thirdParty"    anchor="google"    current="signin" data-btn="no-init" anchor-desc="${
                  selfLoginTxt["sign-in-with-google"]
                }"><span>Google</span></button>
                </div>
                <span class="login-tips"><i> ${
                  selfLoginTxt["or-sign-up-with-email"]
                } </i></span>
                <div class="login-input-box error-tip-box">
                <input type="email" placeholder="${
                  selfLoginTxt["email-address"]
                }" class="login-input window-input" autocomplete="off" title="">
                <span class="error-tip no-title"> ${
                  selfLoginTxt["invalid-email-address"]
                } </span>
                </div>
                <button class="pointer submit-btn login-submit bingClickBtn1" anchor="" disabled><span> 
                ${selfLoginTxt["sign-up"]}
                </span></button>
                <p class="login-text">${
                  selfLoginTxt["already-have-an-account"]
                }&nbsp;<span class="bingClickBtn2">${
      selfLoginTxt["sign-in"]
    }</span></p>
                
                <p class="login-register-text" style="margin-top: 60px;"> ${
                  selfLoginTxt["by-signing-up-you-agree-to-our"]
                }  <a target="_blank" href="/privacy.html"> ${
      selfLoginTxt["privacy-policy"]
    } </a> ${selfLoginTxt["and"]} <a target="_blank" href="/terms.html">${
      selfLoginTxt["terms"]
    }</a>.</p>
            </div>
            <!--  -->
            <div class="login-success">
                <img src="/dist/js/commonSignin/images/${
                  hostName() ? "successful_aiG.png" : "successful.png"
                }" width="88" height="88" >
                <h4 class="window-title"> ${
                  selfLoginTxt["log-in-successful"]
                } </h4>
                <span> ${
                  selfLoginTxt[
                    "please-return-to-the-app-and-start-your-journey-with-us"
                  ]
                } </span>
            </div>
            <!--  -->
            <div class="login-account">
                <h4 class="window-title"> ${
                  selfLoginTxt["sign-in-with-your-email"]
                } </h4>
                <div class="login-account-email-box error-tip-box">
                <span class="login-account-label"> ${
                  selfLoginTxt["email-address"]
                } </span>
                <input type="email" class="window-input login-account-email" title="">
                <span class="error-tip"> ${
                  selfLoginTxt["invalid-email-address"]
                } </span>
                </div>
                <div class="login-account-pwd-box">
                <span class="login-account-label"> ${
                  selfLoginTxt["password"]
                } </span>
                <div>
                    <input type="password" class="window-input login-account-pwd">
                    <i class="pwd-eye bingClickBtn3" title="${
                      selfLoginTxt["show-password"]
                    }"></i>
                </div>
                </div>
                <div class="login-account-code-box">
                  <span class="login-account-label"> ${
                    selfLoginTxt["verification-code"]
                  } </span>
                  <div class="login-account-code-input error-tip-box">
                      <input type="text" maxlength="4" class="window-input login-account-code">
                      <span class="error-tip no-title"> ${
                        selfLoginTxt["incorrect-verification-code"]
                      } </span>
                      <div class="login-account-code-img-box bingClickBtn4">
                          <img src='https://www.vidnoz.com/js/commonSignin/images/code_default.png' style="display: block" width="115" height="48">
                      </div>
                  </div>
                </div>
                <span class="bingClickBtn5"> ${
                  selfLoginTxt["forgot-password"]
                } </span>
                <button class="pointer submit-btn login-account-btn bingClickBtn6" disabled><span> ${
                  selfLoginTxt["sign-in"]
                } </span></button>
                <p> ${
                  selfLoginTxt["dont-have-an-account"]
                } &nbsp;<span class="bingClickBtn7"> ${
      selfLoginTxt["sign-up"]
    } </span></p>
            </div>
            <!--  -->
            <div class="login-register">
                <h4 class="window-title"> ${
                  selfLoginTxt["sign-up-with-your-email"]
                } </h4>
                <div class="login-register-email-box error-tip-box">
                <span class="login-register-tips"> ${
                  selfLoginTxt["email-address"]
                } </span>
                <input type="email" class="window-input login-register-email" title="">
                <span class="error-tip"> ${
                  selfLoginTxt["this-email-address-is-not-supported"]
                } </span>
                <span class="error-interim-email-tip">${
                  selfLoginTxt["this-email-address-is-not-supported"]
                }</span>
                </div>
                <div class="login-register-name-box">
                <div class="login-register-first-name-box error-tip-box">
                    <span class="login-register-tips"> ${
                      selfLoginTxt["first-name"]
                    } </span>
                    <input type="text" maxlength="100" class="window-input login-register-first-name">
                    <span class="error-tip"> ${
                      selfLoginTxt["enter-your-first-name-here"]
                    } </span>
                </div>
                <div class="login-register-last-name-box error-tip-box">
                    <span class="login-register-tips"> ${
                      selfLoginTxt["last-name"]
                    } </span>
                    <input type="text" maxlength="100" class="window-input login-register-last-name">
                    <span class="error-tip"> ${
                      selfLoginTxt["enter-your-last-name-here"]
                    } </span>
                </div>
                </div>
                <div class="login-register-pwd-box error-tip-box">
                <span class="login-register-tips"> ${
                  selfLoginTxt["password"]
                } </span>
                <div >
                    <input type="password" class="window-input login-register-pwd">
                    <i class="pwd-eye bingClickBtn8" title=" ${
                      selfLoginTxt["show-password"]
                    } "></i>
                </div>
                <span class="error-tip"> ${
                  selfLoginTxt["password-must-be-6-to-20-characters"]
                } </span>
                </div>
                <p class="login-register-text"> ${
                  selfLoginTxt["by-signing-up-you-agree-to-our"]
                }  <a target="_blank" href="/privacy.html"> ${
      selfLoginTxt["privacy-policy"]
    } </a> ${selfLoginTxt["and"]} <a target="_blank" href="/terms.html">${
      selfLoginTxt["terms"]
    }</a>.</p>
                <button class="pointer submit-btn login-register-btn bingClickBtn9" disabled><span> ${
                  selfLoginTxt["sign-up"]
                } </span></button>
                <p class="login-register-text login-register-last-text"> ${
                  selfLoginTxt["already-have-an-account"]
                }&nbsp;<span class="pointer bingClickBtn10">${
      selfLoginTxt["sign-in"]
    }</span></p>
            </div>
            <!--  -->
            <div class="login-verify">
                <h4 class="window-title"> ${
                  selfLoginTxt["verify-your-email"]
                } </h4>
                <p class="login-verify-text login-verify-one"> ${
                  selfLoginTxt["your-vidnoz-ai-account-is-almost-ready"]
                } </p>
                <p class="login-verify-text login-verify-two"> ${
                  selfLoginTxt[
                    "we-have-sent-a-6-digit-verification-code-to-your-email-please-check-it-soon-and-enter-the-verification-code-that-you-received-below-to-verify-your-email-and-activate-your-account"
                  ]
                } </p>
                <div class="login-verify-input-group">
                    <input type="number" maxlength="1">
                    <input type="number" maxlength="1">
                    <input type="number" maxlength="1">
                    <input type="number" maxlength="1">
                    <input type="number" maxlength="1">
                    <input type="number" maxlength="1">
                </div>
                <p class="login-verify-error-msg"> ${
                  selfLoginTxt["invalid-code"]
                } </p>
                <button class="pointer submit-btn login-verify-code-btn bingClickBtn11" data-btn="no-init"><span> ${
                  selfLoginTxt["verify"]
                } </span></button>
                <p class="login-verify-text login-verify-three"> ${
                  selfLoginTxt[
                    "you-might-need-to-check-your-spam-folder-if-you-dont-see-it-or"
                  ]
                } </p>
                <button class="pointer submit-btn login-verify-btn bingClickBtn12" data-btn="no-init"><span> ${
                  selfLoginTxt["resend-confirmation-email"]
                } </span></button>
            </div>
            <!--  -->
            <div class="login-reset-pwd">
                <h4 class="window-title"> ${
                  selfLoginTxt["reset-password"]
                } </h4>
                <p class="login-reset-pwd-text"> ${
                  selfLoginTxt["please-enter-your-email-address-and-well-sen"]
                } </p>
                <div class="login-reset-pwd-email-box error-tip-box">
                <span> ${selfLoginTxt["email-address"]} </span>
                <input type="email" class="window-input login-reset-pwd-email" title="">
                <p class="error-tip"> ${
                  selfLoginTxt["the-email-you-entered-is-incorrect-try-again"]
                } </p>
                </div>
                <button class="pointer submit-btn  login-reset-pwd-btn bingClickBtn13" disabled><span> ${
                  selfLoginTxt["submit"]
                } </span></button>
                <span class="login-reset-pwd-or"><i> ${
                  selfLoginTxt["or"]
                } </i></span>
                <button class="pointer login-reset-back-btn bingClickBtn14" data-btn="no-init"><span> ${
                  selfLoginTxt["back-to-sign-in"]
                } </span></button>
                <button class="pointer login-reset-back-btn login-reset-signup bingClickBtn15" data-btn="no-init"><span> ${
                  selfLoginTxt["sign-up-for-free"]
                } </span></button>
            </div>
            <!--  -->
            <div class="login-link">
                <h4 class="window-title"> ${selfLoginTxt["login-link"]} </h4>
                <p class="login-link-text"><span class="link-email"></span> ${
                  selfLoginTxt["already-exists-in-vidnoz-ai-please-log-in-this"]
                } <span class="link-type"></span>.</p>
                <div class="login-link-pwd-box">
                <span class="login-link-tips"> ${
                  selfLoginTxt["password"]
                } </span>
                <div>
                    <input type="password" class="window-input login-link-pwd">
                    <i class="pwd-eye bingClickBtn16" title="${
                      selfLoginTxt["show-password"]
                    }"></i>
                </div>
                <p class="pointer login-link-to-forgot bingClickBtn17"> ${
                  selfLoginTxt["forgot-password"]
                } </p>
                <button class="pointer submit-btn  login-link-btn bingClickBtn18" disabled><span> ${
                  selfLoginTxt["log-in-and-link"]
                } </span></button>
                </div>
            </div>
            <!--  -->
            <div class="login-almost-here">
                <img src="https://www.vidnoz.com/js/commonSignin/images/ico_send_email_in.svg" width="200" height="90">
                <h4 class="window-title"> ${
                  selfLoginTxt["you-are-almost-here"]
                } </h4>
                <p class="login-almost-here-text">${
                  selfLoginTxt["please-enter-your-email-to-continue"]
                }</p>
                <div class="login-almost-here-email-box error-tip-box">
                <input type="email" class="window-input login-almost-here-email" placeholder="${
                  selfLoginTxt["enter-your-email-here"]
                }" title="">
                <p class="error-tip"> ${
                  selfLoginTxt["invalid-email-address"]
                } </p>
                <span class="error-interim-email-tip no-title">${
                  selfLoginTxt["this-email-address-is-not-supported"]
                }</span>
                </div>
                <p class="login-almost-here-error-msg"></p>
                <button class="pointer submit-btn  login-almost-here-btn bingClickBtn19" disabled><span> ${
                  selfLoginTxt["continue"]
                } </span></button>
                <a href="https://www.vidqu.ai/privacy.html" target="_blank"> ${
                  selfLoginTxt["privacy-policy"]
                } </a>
            </div>
            <div class="login-send-succ">
              <img src="/dist/js/commonSignin/images/ico_send_email_in.svg" width="200" height="90">
              <h4 class="send-title"> ${selfLoginTxt["send-succ"]} </h4>
              <p class="login-send-succ-text">${
                selfLoginTxt["send-succ-tip"]
              }</p>
          </div>
            </div>
        </div>
      </div>
    `;

    /*Bind some basic verification and rules*/
    this.firstUpdated();
    /*Clicks on the binding page*/
    this.toBindEvent();
    //Website button click to display login pop -up window
    // loginButtonEvent()
  }

  //Login-Dialog-Body class different pop-ups add-on-class name ACCOUNT Register Success Verify Reset-PWD LINK (203 status code return type and mailbox) Almost
  //There are three ways to return to login successfully
  firstUpdated() {
    this.shadowRootEl = document.querySelector(".login-dialog");
    this.windowBody = this.shadowRootEl.querySelector(".login-dialog-body");
    this.loginInput = this.shadowRootEl.querySelector(".login-input");
    this.firstBtn = this.shadowRootEl.querySelector(".login-submit");
    this.loginAccountEmailInput = this.shadowRootEl.querySelector(
      ".login-account-email"
    );
    this.loginAccountPwd =
      this.shadowRootEl.querySelector(".login-account-pwd");
    this.loginAccountCode = this.shadowRootEl.querySelector(
      ".login-account-code"
    );
    this.loginAccountBtn =
      this.shadowRootEl.querySelector(".login-account-btn");
    this.loginRegisterEmailInput = this.shadowRootEl.querySelector(
      ".login-register-email"
    );
    this.loginRegisterFirstName = this.shadowRootEl.querySelector(
      ".login-register-first-name"
    );
    this.loginRegisterLastName = this.shadowRootEl.querySelector(
      ".login-register-last-name"
    );
    this.loginRegisterPwd = this.shadowRootEl.querySelector(
      ".login-register-pwd"
    );
    this.loginRegisterBtn = this.shadowRootEl.querySelector(
      ".login-register-btn"
    );
    this.loginResetPwdEmail = this.shadowRootEl.querySelector(
      ".login-reset-pwd-email"
    );
    this.loginResetPwdBtn = this.shadowRootEl.querySelector(
      ".login-reset-pwd-btn"
    );
    this.loginAlmostHereEmail = this.shadowRootEl.querySelector(
      ".login-almost-here-email"
    );
    this.loginAlmostHereBtn = this.shadowRootEl.querySelector(
      ".login-almost-here-btn"
    );
    this.loginLoginLinkPwd = this.shadowRootEl.querySelector(".login-link-pwd");
    this.loginLinkBtn = this.shadowRootEl.querySelector(".login-link-btn");
    this.verifyInputs = this.shadowRootEl.querySelectorAll(
      ".login-verify-input-group input"
    );
    thirdPartyLogin(this);
    // this.getVerificationCode();
    //Set focusing on removing ERROR status
    this.inputList = [
      {
        inputDom: this.loginInput,
        btnDom: this.firstBtn,
        tipBoxDom: this.shadowRootEl.querySelector(
          ".login-input-box.error-tip-box"
        ),
      },
      {
        inputDom: this.loginAccountEmailInput,
        btnDom: this.loginAccountBtn,
        tipBoxDom: this.shadowRootEl.querySelector(
          ".login-account-email-box.error-tip-box"
        ),
      },
      {
        inputDom: this.loginAccountPwd,
        btnDom: this.loginAccountBtn,
      },
      {
        inputDom: this.loginAccountCode,
        btnDom: this.loginAccountBtn,
        tipBoxDom: this.shadowRootEl.querySelector(
          ".login-account-code-input.error-tip-box"
        ),
      },
      {
        inputDom: this.loginRegisterEmailInput,
        btnDom: this.loginRegisterBtn,
        tipBoxDom: this.shadowRootEl.querySelector(
          ".login-register-email-box.error-tip-box"
        ),
      },
      {
        inputDom: this.loginRegisterFirstName,
        btnDom: this.loginRegisterBtn,
        tipBoxDom: this.shadowRootEl.querySelector(
          ".login-register-first-name-box.error-tip-box"
        ),
      },
      {
        inputDom: this.loginRegisterLastName,
        btnDom: this.loginRegisterBtn,
        tipBoxDom: this.shadowRootEl.querySelector(
          ".login-register-last-name-box.error-tip-box"
        ),
      },
      {
        inputDom: this.loginRegisterPwd,
        btnDom: this.loginRegisterBtn,
        tipBoxDom: this.shadowRootEl.querySelector(
          ".login-register-pwd-box.error-tip-box"
        ),
      },
      {
        inputDom: this.loginResetPwdEmail,
        btnDom: this.loginResetPwdBtn,
        tipBoxDom: this.shadowRootEl.querySelector(
          ".login-reset-pwd-email-box.error-tip-box"
        ),
      },
      {
        inputDom: this.loginAlmostHereEmail,
        btnDom: this.loginAlmostHereBtn,
        tipBoxDom: this.shadowRootEl.querySelector(
          ".login-almost-here-email-box.error-tip-box"
        ),
      },
      {
        inputDom: this.loginLoginLinkPwd,
        btnDom: this.loginLinkBtn,
      },
    ];
    this.inputList.map((item) => {
      //this.inputfocus (item) // Focus
      this.inputPut(item); //Enter the button to set ash to remove the error state
      return false;
    });

    //Forbidden space input
    $(this).keydown(function (e) {
      if (!e) e = window.event;
      if (e.keyCode === 32) {
        return false;
      }
    });

    this.loginInput.addEventListener("input", (e) => {
      const val = this.loginInput.value;
      if (onCheckEmail(val)) {
        this.mainInputValue = val;
      } else {
        this.mainInputValue = "";
      }
    });

    //Verify whether the qualified mailbox is registered
    this.loginInput.addEventListener(
      "input",
      _debounce(() => {
        const val = this.loginInput.value;
        if (onCheckEmail(val)) {
          sendEmailRequest(
            {
              data: val,
              type: "signin",
            },
            this.shadowRootEl
          );
        }
      })
    );

    this.loginInput.addEventListener("blur", () => {
      const val = this.loginInput.value;
      const tipBoxDom = this.loginInput.parentNode;
      if (!onCheckEmail(val)) {
        this.loginInput.classList.add("error");
        tipBoxDom.classList.add("error");
      }
    });

    //Mailbox password login
    this.loginAccountEmailInput.addEventListener("input", () => {
      const val = this.loginAccountEmailInput.value;
      if (onCheckEmail(val)) {
        this.changeAccountCheck("email");
      }
    });
    this.loginAccountEmailInput.addEventListener("blur", () => {
      const val = this.loginAccountEmailInput.value;
      const tipBoxDom = this.loginAccountEmailInput.parentNode;
      if (onCheckEmail(val)) {
        this.changeAccountCheck("email");
      } else {
        this.loginCheck.email = false;
        this.loginAccountEmailInput.classList.add("error");
        tipBoxDom.classList.add("error");
      }
    });

    this.loginAccountPwd.addEventListener("input", () => {
      if (this.loginAccountPwd.value.length >= 6) {
        this.changeAccountCheck("pwd");
      }
    });
    this.loginAccountPwd.addEventListener("blur", () => {
      if (this.loginAccountPwd.value.length >= 6) {
        this.changeAccountCheck("pwd");
      } else {
        this.loginCheck.pwd = false;
        // this.loginAccountPwd.classList.add('error')
      }
    });

    let doing = false;
    const doSomething = (e) => {
      const _code = this.loginAccountCode.value;
      if (_code.length < 4) return false;
      _debounce(this.sendCodeRequest(_code));
    };

    this.loginAccountCode.addEventListener(
      "compositionstart",
      function (e) {
        doing = true;
      },
      false
    );
    
    this.loginAccountCode.addEventListener(
      "input",
      function (e) {
        if (!doing) {
          doSomething();
        }
      },
      false
    );

    this.loginAccountCode.addEventListener(
      "compositionend",
      function (e) {
        doing = false;
        doSomething();
      },
      false
    );

    // this.loginAccountCode.addEventListener("input", () => {
    // });

    this.loginAccountCode.addEventListener("blur", () => {
      if (this.loginAccountCode.value.length < 4) {
        this.loginAccountCode.classList.add("error");
        this.loginAccountCode.parentNode.classList.add("error");
      }
    });

    // register
    this.loginRegisterEmailInput.addEventListener("input", (e) => {
      this.loginRegisterFirstName.removeAttribute("disabled");
      this.loginRegisterLastName.removeAttribute("disabled");
      this.loginRegisterPwd.removeAttribute("disabled");
      if (onCheckEmail(this.loginRegisterEmailInput.value)) {
        this.changeRegisterCheck("email");
      }
    });
    this.loginRegisterEmailInput.addEventListener("blur", () => {
      const _inputDom = this.loginRegisterEmailInput;
      const val = _inputDom.value;
      const tipBoxDom = _inputDom.parentNode;
      if (onCheckEmail(val)) {
        this.changeRegisterCheck("email");
        _inputDom.classList.remove("error");
      } else {
        this.loginCheck.email = false;
        _inputDom.classList.add("error");
        tipBoxDom.classList.add("error");
      }
    });
    this.loginRegisterFirstName.addEventListener("input", (e) => {
      if (this.loginRegisterFirstName.value.length) {
        this.changeRegisterCheck("firstName");
      }
    });
    this.loginRegisterFirstName.addEventListener("blur", () => {
      const _currentDom = this.loginRegisterFirstName;
      const tipBoxDom = _currentDom.parentNode;
      if (!_currentDom.value.length) {
        _currentDom.classList.add("error");
        tipBoxDom.classList.add("error");
        this.registerCheck.firstName = false;
      } else {
        this.changeRegisterCheck("firstName");
        _currentDom.classList.remove("error");
        tipBoxDom.classList.remove("error");
      }
    });
    this.loginRegisterLastName.addEventListener("input", (e) => {
      if (this.loginRegisterLastName.value.length) {
        this.changeRegisterCheck("lastName");
      }
    });
    this.loginRegisterLastName.addEventListener("blur", () => {
      const _currentDom = this.loginRegisterLastName;
      const tipBoxDom = _currentDom.parentNode;
      if (!_currentDom.value.length) {
        _currentDom.classList.add("error");
        tipBoxDom.classList.add("error");
        this.registerCheck.lastName = false;
      } else {
        this.changeRegisterCheck("lastName");
        _currentDom.classList.remove("error");
        tipBoxDom.classList.remove("error");
      }
    });
    this.loginRegisterPwd.addEventListener("input", (e) => {
      if (onCheckPassword(this.loginRegisterPwd.value)) {
        this.changeRegisterCheck("pwd");
      }
    });
    this.loginRegisterPwd.addEventListener("blur", () => {
      const _currentDom = this.loginRegisterPwd;
      const tipBoxDom = _currentDom.parentNode.parentNode;
      if (onCheckPassword(_currentDom.value)) {
        _currentDom.classList.remove("error");
        tipBoxDom.classList.remove("error");
        this.changeRegisterCheck("pwd");
      } else {
        this.registerCheck.pwd = false;
        _currentDom.classList.add("error");
        tipBoxDom.classList.add("error");
      }
    });

    //Verify mailbox verification code
    this.verifyInputs.forEach((child, index) => {
      child.addEventListener("input", (e) => {
        this.shadowRootEl.querySelector(
          ".login-verify-error-msg"
        ).style.visibility = "hidden";
        child.value = child.value.replace(/\D/g, "");
        if (child.value.length >= 1) {
          index + 1 <= this.verifyInputs.length - 1 &&
            this.verifyInputs[index + 1].focus();
        }
      });

      child.addEventListener("keydown", (e) => {
        if (
          (e.keyCode === 8 && child.value === "") ||
          (child.selectionStart === 0 && e.keyCode === 8)
        ) {
          child.value && e.preventDefault();
          child.value = "";
          index - 1 >= 0 && this.verifyInputs[index - 1].focus();
        }
      });
      //Paste verification code
      child.addEventListener("paste", (e) => {
        e.preventDefault();
        const clipboardData = e.clipboardData || window.clipboardData;
        const pastedText = clipboardData.getData("text");
        for (let i = 0; i < this.verifyInputs.length; i++) {
          this.verifyInputs[i].value = pastedText[i] || "";
        }
        this.verifyInputs[0].dispatchEvent(new Event("input"));
        this.verifyInputs[
          pastedText.length >= this.verifyInputs.length
            ? this.verifyInputs.length - 1
            : pastedText.length
        ].focus();
      });
    });
    // reset pwd
    this.loginResetPwdEmail.addEventListener(
      "input",
      _debounce((e) => {
        const val = this.loginResetPwdEmail.value;
        if (onCheckEmail(val)) {
          sendEmailRequest(
            {
              data: val,
              type: "resetPwd",
            },
            this.shadowRootEl
          );
        }
      })
    );
    this.loginResetPwdEmail.addEventListener("blur", () => {
      const _inputDom = this.loginResetPwdEmail;
      const val = _inputDom.value;
      if (onCheckEmail(val)) {
        _inputDom.classList.remove("error");
      } else {
        _inputDom.parentNode.classList.add("error");
        _inputDom.classList.add("error");
        _inputDom.parentNode.querySelector(".error-tip").innerText =
          selfLoginTxt["invalid-email-address"];
      }
    });

    // almost
    this.loginAlmostHereEmail.addEventListener("input", (e) => {
      this.shadowRootEl.querySelector(
        ".login-almost-here-error-msg"
      ).style.visibility = "hidden";
    });
    this.loginAlmostHereEmail.addEventListener(
      "input",
      _debounce((e) => {
        const val = this.loginAlmostHereEmail.value;
        if (onCheckEmail(val)) {
          this.loginAlmostHereBtn.removeAttribute("disabled");
        }
      })
    );
    this.loginAlmostHereEmail.addEventListener("blur", () => {
      const _inputDom = this.loginAlmostHereEmail;
      const val = _inputDom.value;
      if (onCheckEmail(val)) {
        this.loginAlmostHereBtn.removeAttribute("disabled");
      } else {
        _inputDom.parentNode.classList.add("error");
        _inputDom.classList.add("error");
        this.loginAlmostHereBtn.setAttribute("disabled", "disabled");
      }
    });

    // link
    this.loginLoginLinkPwd.addEventListener("input", () => {
      const val = this.loginLoginLinkPwd.value;
      if (val.trim().length >= 6) {
        this.loginLinkBtn.removeAttribute("disabled");
      } else {
        this.loginLinkBtn.setAttribute("disabled", "disabled");
      }
    });
    this.loginLoginLinkPwd.addEventListener("blur", () => {
      const _inputDom = this.loginLoginLinkPwd;
      const val = _inputDom.value;
      if (val.trim().length >= 6) {
        _inputDom.classList.remove("error");
        this.loginLinkBtn.removeAttribute("disabled");
      } else {
        // _inputDom.classList.add('error')
        this.loginLinkBtn.setAttribute("disabled", "disabled");
      }
    });
  }

  toBindEvent() {
    this.shadowRootEl.querySelector(".login-close-btn").onclick =
      this.closeLoginDialog.bind(this);
    this.shadowRootEl.querySelector(".login-back-btn").onclick =
      this.historyBack.bind(this);
    this.shadowRootEl.querySelector(".bingClickBtn1").onclick =
      this.jumpFun.bind(this);
    this.shadowRootEl.querySelector(".bingClickBtn2").onclick = () => {
      this.toPath.bind(this)("account");
    };
    this.shadowRootEl.querySelector(".bingClickBtn3").onclick =
      this.eyeClick.bind(this);
    this.shadowRootEl.querySelector(".bingClickBtn3").onmouseenter =
      this.eyeOver.bind(this);
    this.shadowRootEl.querySelector(".bingClickBtn3").onmouseleave =
      this.eyeLeave.bind(this);

    this.shadowRootEl.querySelector(".bingClickBtn4").onclick =
      this.getVerificationCode.bind(this);
    this.shadowRootEl.querySelector(".bingClickBtn5").onclick = () => {
      this.toPath.bind(this)("reset-pwd");
    };

    this.shadowRootEl.querySelector(".bingClickBtn6").onclick =
      this.loginAccountSubmit.bind(this);

    this.shadowRootEl.querySelector(".bingClickBtn7").onclick = () => {
      this.toPath.bind(this)("register");
    };

    this.shadowRootEl.querySelector(".bingClickBtn8").onclick =
      this.eyeClick.bind(this);
    this.shadowRootEl.querySelector(".bingClickBtn8").onmouseenter =
      this.eyeOver.bind(this);
    this.shadowRootEl.querySelector(".bingClickBtn8").onmouseleave =
      this.eyeLeave.bind(this);

    this.shadowRootEl.querySelector(".bingClickBtn9").onclick =
      this.SubmitRegistration.bind(this);

    this.shadowRootEl.querySelector(".bingClickBtn10").onclick = () => {
      this.toPath.bind(this)("account");
    };

    this.shadowRootEl.querySelector(".bingClickBtn11").onclick =
      this.verifyCode.bind(this);
    this.shadowRootEl.querySelector(".bingClickBtn12").onclick =
      this.SendEmail.bind(this);
    this.shadowRootEl.querySelector(".bingClickBtn13").onclick =
      this.resetPwdSubmit.bind(this);

    this.shadowRootEl.querySelector(".bingClickBtn14").onclick = () => {
      this.toPath.bind(this)("account");
    };

    this.shadowRootEl.querySelector(".bingClickBtn15").onclick = () => {
      this.toPath.bind(this)("register");
    };

    this.shadowRootEl.querySelector(".bingClickBtn16").onclick =
      this.eyeClick.bind(this);
    this.shadowRootEl.querySelector(".bingClickBtn16").onmouseenter =
      this.eyeOver.bind(this);
    this.shadowRootEl.querySelector(".bingClickBtn16").onmouseleave =
      this.eyeLeave.bind(this);

    this.shadowRootEl.querySelector(".bingClickBtn17").onclick = () => {
      this.toPath.bind(this)("reset-pwd");
    };

    this.shadowRootEl.querySelector(".bingClickBtn18").onclick =
      this.loginLinkSubmit.bind(this);
    this.shadowRootEl.querySelector(".bingClickBtn19").onclick =
      this.almostHereSubmit.bind(this);
  }

  closeLoginDialog(e) {
    // if (e?.target.classList.contains("login-close-btn")) {
    //   this.windowBody.classList.value.trim() === "login-dialog-body" &&
    //     gtag("event", "registerpop_close_official");
    //   this.windowBody.classList.contains("register") &&
    //     gtag("event", "registerpop_email_close_official");
    //   this.windowBody.classList.contains("verify") &&
    //     gtag("event", "registerpop_email_closeverify_official");
    //   this.windowBody.classList.contains("account") &&
    //     gtag("event", "registerpop_login_close_official");
    // }
    if (this.shadowRootEl) {
      this.shadowRootEl.style.display = "none";
      this.dispatchEvent(new CustomEvent("closeLoginDialog"));
    }
  }

  showLoginDialog(isWait = null) {
    wait = isWait;
    if (this.shadowRootEl) {
      this.shadowRootEl.style.display = "flex";
    }
    this.initDialog();
  }

  initDialog() {
    this.getVerificationCode();
    this.windowBody.classList = "login-dialog-body";
    this.mainInputValue = "";
    this.shadowRootEl.querySelector(".login-almost-here-error-msg").innerHTML =
      "";
    this.shadowRootEl.querySelectorAll("input").forEach((child) => {
      child.value = "";
      const inputEvent = new CustomEvent("input");
      child.dispatchEvent(inputEvent);
    });
    this.shadowRootEl
      .querySelectorAll('button:not([data-btn="no-init"])')
      .forEach((child) => {
        child.setAttribute("disabled", "disabled");
        child.classList.remove("btn-loading");
      });
  }

  localInit(addClassName) {
    this.shadowRootEl
      .querySelector(`.${addClassName}`)
      .querySelectorAll("input")
      .forEach((child) => {
        child.value = "";
        const inputEvent = new CustomEvent("input");
        child.dispatchEvent(inputEvent);
      });
    this.shadowRootEl
      .querySelector(`.${addClassName}`)
      .querySelectorAll('button:not([data-btn="no-init"])')
      .forEach((child) => {
        child.setAttribute("disabled", "disabled");
        child.classList.remove("btn-loading");
      });
  }

  historyBack() {
    if (this.history === "reset-pwd") {
      if (this.resetBackLink) {
        this.history = "link";
        this.resetBackLink = false;
      } else {
        this.history = "account";
      }
    } else if (this.history === "verify") {
      if (this.isAccount === "true") {
        this.isAccount = "";
        this.history = "account";
      } else {
        this.history = "register";
      }
    } else {
      this.history = "";
      if (!this.loginInput.value) {
        const inputEvent = new CustomEvent("input");
        this.loginInput.dispatchEvent(inputEvent);
      }
    }
    if (this.prePage === "verify") {
      this.prePage = "";
      this.loginRegisterFirstName.setAttribute("disabled", "disabled");
      this.loginRegisterLastName.setAttribute("disabled", "disabled");
      this.loginRegisterPwd.setAttribute("disabled", "disabled");
    } else {
      this.loginRegisterFirstName.removeAttribute("disabled");
      this.loginRegisterLastName.removeAttribute("disabled");
      this.loginRegisterPwd.removeAttribute("disabled");
    }
    this.windowBody.classList = `login-dialog-body ${this.history}`;
  }

  toPath(path) {
    // ga
    // if (path === "account") {
    //   this.windowBody.classList.value.trim() === "login-dialog-body" &&
    //     gtag("event", "registerpop_signin_official");
    //   this.windowBody.classList.contains("register") &&
    //     gtag("event", "registerpop_email_sigin_official");
    // }
    // if (path === "register") {
    //   this.windowBody.classList.contains("account") &&
    //     gtag("event", "registerpop_login_register_official");
    // }
    // ga
    if (path === "reset-pwd" && this.history === "link") {
      this.resetBackLink = true;
    }
    this.history = path;
    if (path === "reset-pwd") {
      let resetVal = "";
      if (this.windowBody.classList.contains("account")) {
        resetVal = this.loginAccountEmailInput.value;
      } else if (this.windowBody.classList.contains("link")) {
        resetVal = this.linkEmail;
      }
      if (onCheckEmail(resetVal)) {
        this.loginResetPwdEmail.value = resetVal;
        this.loginResetPwdEmail.dispatchEvent(new CustomEvent("input"));
      }
    } else if (path === "account") {
      this.localInit("login-account");
      this.loginCheck = {
        email: false,
        pwd: false,
        code: false,
      };
      this.loginAccountEmailInput.value = this.mainInputValue;
      this.changeAccountCheck("email");
    } else if (path === "register") {
      this.localInit("login-register");
      this.registerCheck = {
        email: false,
        firstName: false,
        lastName: false,
        pwd: false,
      };
      this.loginRegisterEmailInput.value = this.mainInputValue;
      this.changeRegisterCheck("email");
    } else if (path === "almost") {
      this.localInit("login-almost-here");
      this.shadowRootEl.querySelector(
        ".login-almost-here-error-msg"
      ).style.visibility = "hidden";
    } else if (path === "verify") {
      this.verifyInputs.forEach((child) => {
        child.value = "";
      });
      this.shadowRootEl.querySelector(
        ".login-verify-error-msg"
      ).style.visibility = "hidden";
    }
    if (path === "verify") {
      this.prePage = "verify";
      this.loginRegisterFirstName.setAttribute("disabled", "disabled");
      this.loginRegisterLastName.setAttribute("disabled", "disabled");
      this.loginRegisterPwd.setAttribute("disabled", "disabled");
    } else {
      this.prePage = "";
      this.loginRegisterFirstName.removeAttribute("disabled");
      this.loginRegisterLastName.removeAttribute("disabled");
      this.loginRegisterPwd.removeAttribute("disabled");
    }

    this.windowBody.classList = `login-dialog-body ${path}`;
  }

  jumpFun() {
    // this.firstBtn.setAttribute('disabled', 'disabled')
    let btnAnchor = this.firstBtn.getAttribute("anchor");
    //Click in three cases 1. Go to the registration window 2. Account password login 3. Google Microsoft Facebook LinkedIn
    if (
      btnAnchor === "register" ||
      btnAnchor === "account" ||
      btnAnchor === "apple"
    ) {
      btnAnchor = btnAnchor === "apple" ? "account" : btnAnchor;
      this.toPath(btnAnchor);
    } else {
      const appLoginId = !isBlank(getUrlParam("loginId"))
        ? getUrlParam("loginId")
        : "";
      // if (detectDeviceType() === "mobile") {
        winRef = window.open("", "_blank");
      // }
      LogIn.bind(this)({
        type: btnAnchor,
        loginId: appLoginId,
        aff: getCookie("aff") ? JSON.parse(getCookie("aff")) : "",
        insur: getCookie("insur"),
        code: getUrlParam("code"),
      });
    }
  }

  domAddClassName(queryClassName, addClassName) {
    const dom = this.shadowRootEl.querySelector(`.${queryClassName}`);
    if (dom) {
      dom.classList.add(addClassName);
    }
  }

  showSuccessWindow() {
    this.shadowRootEl.querySelector(".login-dialog-body").classList =
      "login-dialog-body success";
  }

  loginSuccess() {
    typeof setHead === "function" && setHead();
    this.dispatchEvent(new CustomEvent("loginsuccess"));
    this.closeLoginDialog();
  }

  eyeClick(e) {
    const dom = e.target;
    const inputDom = dom.parentNode.querySelector("input");
    if (dom.classList.contains("on")) {
      dom.classList.remove("on");
      inputDom.setAttribute("type", "password");
      dom.setAttribute("title", selfLoginTxt["show-password"]);
    } else {
      dom.setAttribute("title", selfLoginTxt["hide-password"]);
      inputDom.setAttribute("type", "text");
      dom.classList.add("on");
    }
    inputDom.focus();
    this.eyeOver(e);
  }

  //Solve the click error state flashing
  eyeOver(e) {
    const inputDom = e.target.parentNode.querySelector("input");
    //Determine whether to focus
    if (document.activeElement === inputDom) {
      inputDom.classList.add("eyeover");
      this.inputList.map((item) => {
        if (item.inputDom === inputDom && item.tipBoxDom) {
          item.tipBoxDom.classList.add("eyeover");
        }
        return false;
      });
    }
  }

  eyeLeave(e) {
    const inputDom = e.target.parentNode.querySelector("input");
    inputDom.classList.remove("eyeover");
    this.inputList.map((item) => {
      if (item.inputDom === inputDom && item.tipBoxDom) {
        item.tipBoxDom.classList.remove("eyeover");
      }
      return false;
    });
  }

  getVerificationCode = _debounce(() => {
    jqAjaxPromise(
      {
        url: "/api/user/code",
        type: "POST",
      },
      () => {}
    ).then((res) => {
      if (res.code === 200) {
        $("#codepic").find("img").attr("src", res.data.img);
        this.shadowRootEl
          .querySelector(".login-account-code-img-box img")
          .setAttribute("src", res.data.img);
        if (this.loginCheck.code) {
          this.loginCheck.code = false;
          this.loginAccountCode.classList.add("error");
          this.loginAccountCode.parentNode.classList.add("error");
          this.loginAccountBtn.setAttribute("disabled", "disabled");
        }
      } else {
        console.log("fail");
      }
    });
  });

  changeAccountCheck(type) {
    this.loginCheck[type] = true;
    if (this.loginCheck.email && this.loginCheck.pwd && this.loginCheck.code) {
      this.loginAccountBtn.removeAttribute("disabled");
    }
  }

  //Verify whether the CODE input is correct
  sendCodeRequest(param) {
    jqAjaxPromise(
      { url: "/api/user/check-code", type: "POST", data: { code: param } },
      () => {}
    ).then((res) => {
      if (res.code === 200) {
        if (containsVal(res.code === param)) {
          this.changeAccountCheck("code");
        } else {
          this.loginCheck.code = false;
          this.loginAccountCode.classList.add("error");
          this.loginAccountCode.parentNode.classList.add("error");
        }
      } else {
        this.loginCheck.code = false;
        this.loginAccountCode.classList.add("error");
        this.loginAccountCode.parentNode.classList.add("error");
      }
    });
  }

  loginAccountSubmit(e) {
    $("body").append(clientMask);
    const btnDom = e.currentTarget;
    btnDom.classList.add("btn-loading");
    LoginSubmission.bind(this)(
      {
        email: this.loginAccountEmailInput.value,
        password: this.loginAccountPwd.value,
        fromType: 1,
      },
      () => {
        btnDom.classList.remove("btn-loading");
        clientMask.remove();
      },
      this.isTemplateType
    );
  }

  // register
  changeRegisterCheck(type) {
    this.registerCheck[type] = true;
    if (
      this.registerCheck.email &&
      this.registerCheck.firstName &&
      this.registerCheck.lastName &&
      this.registerCheck.pwd
    ) {
      this.loginRegisterBtn.removeAttribute("disabled");
    }
  }

  inputPut(item) {
    const input = item.inputDom;
    const btn = item.btnDom;
    const tipBoxDom = item.tipBoxDom;
    input.addEventListener("input", () => {
      btn.setAttribute("disabled", "disabled");
      input.classList.remove("error");
      if (tipBoxDom) {
        tipBoxDom.classList.remove("error", "error-interim");
      }
    });
  }

  getUrlVal(val) {
    var url = window.location.href;
    if (!url.includes("?")) return false;
    var queryString = url.split("?")[1];
    var queryParams = queryString.split("&");
    var params = {};
    queryParams.forEach(function (param) {
      var keyValue = param.split("=");
      var key = decodeURIComponent(keyValue[0]);
      var value = decodeURIComponent(keyValue[1]);
      params[key] = value;
    });

    return params[val];
  }

  SubmitRegistration(e) {
    $("body").append(clientMask);
    const btnClassList = e.currentTarget.classList;
    let insur = "";
    console.log(9999, getCookie("insur"))
    if (this.getUrlVal("insur")) {
      insur = this.getUrlVal("insur");
    } else {
      insur = getCookie("insur");
    }
    btnClassList.add("btn-loading");
    const param = {
      email: this.loginRegisterEmailInput.value,
      first_name: this.loginRegisterFirstName.value,
      last_name: this.loginRegisterLastName.value,
      password: this.loginRegisterPwd.value,
      fromType: 1,
      aff: getCookie("aff") ? JSON.parse(getCookie("aff")) : "",
      insur,
      code: getUrlParam("code"),
      productName: "vidqu",
    };
    jqAjaxPromise(
      {
        url: "/api/user/signup",
        type: "POST",
        data: param,
      },
      () => {}
    )
      .then((res) => {
        if (res.code === 200) {
          const userTraits = {
            id: "",
            email: param.email,
            first_name: param.first_name,
            last_name: param.last_name,
            head_portrait: "",
          };
          setStorage("user_info", userTraits);
          setCookie("user_info", JSON.stringify(userTraits), 30);
          this.verifyEmail = param.email;
          this.toPath("verify");
        } else if (res.code === 1003) {
          Modal({
            iconType: "hint",
            titleText: selfLoginTxt["registration-failed"],
            content:
              selfLoginTxt[
                "registration-limit-exceeded-if-you-have-any-questions"
              ],
          });
        } else if (res.code === 1006) {
          this.verifyEmail = param.email;
          this.toPath("verify");
        } else if (res.code === 1008) {
          this.shadowRootEl
            .querySelector(".login-register-email-box.error-tip-box")
            .classList.add("error-interim");
          this.shadowRootEl
            .querySelector(".login-register-email-box.error-tip-box input")
            .classList.add("error");
        } else {
          console.log("fail");
          Modal({
            iconType: "hint",
            titleText: selfLoginTxt["sign-up-failed-please-try-again-later"],
          });
        }
      })
      .catch(() => {
        Modal({
          iconType: "hint",
          titleText: selfLoginTxt["sign-up-failed-please-try-again-later"],
        });
      })
      .finally(() => {
        btnClassList.remove("btn-loading");
        clientMask.remove();
      });
  }

  // verify email
  verifyCode(e) {
    $("body").append(clientMask);
    const btnClassList = e.currentTarget.classList;
    btnClassList.add("btn-loading");
    const errorDom = this.shadowRootEl.querySelector(".login-verify-error-msg");
    let code = "";
    this.verifyInputs.forEach((child) => {
      code += child.value;
    });
    if (code.length < 6) {
      errorDom.style.visibility = "visible";
      btnClassList.remove("btn-loading");
      clientMask.remove();
      return;
    }
    const appLoginId = !isBlank(getUrlParam("loginId"))
      ? getUrlParam("loginId")
      : "";
    let param = {
      email: this.verifyEmail,
      code,
      loginId: appLoginId,
    };
    param = getNewParam(param);
    jqAjaxPromise(
      {
        url: "/api/user/verify-code",
        type: "POST",
        data: param,
      },
      () => {}
    )
      .then((res) => {
        // console.log(res);
        if (res.code === 200) {
          errorDom.style.visibility = "hidden";
          const userTraits = {
            id: res.data.id,
            email: res.data.email,
            first_name: res.data.first_name,
            last_name: res.data.last_name,
            head_portrait: res.data.head_portrait,
            usertype: res.data.type,
          };
          setCookie("access_token", res.data.access_token, 30);
          setCookie("refresh_token", res.data.access_token, 30);
          setCookie("loginProduct", res.data.redirect_url, 30);
          setStorage("user_info", userTraits);
          setCookie("user_info", JSON.stringify(userTraits), 30);
          setStorage("isReplace", true);
          const toolParams = localStorage.getItem("toolsPosition");
          const productToPagelocal = localStorage.getItem("productToPage");
          if (!toolParams && !productToPagelocal) {
            if (!toCurrentLangApp(localStorage.getItem("loginProductName"))) {
              location.href = res.data.redirect_url;
            }
          } else if (toolParams === "true") {
            location.reload();
          }
          this.toPath("success");
          setTimeout(() => {
            this.loginSuccess();
          }, 2000);
        } else {
          errorDom.style.visibility = "visible";
        }
      })
      .catch(() => {
        console.log("fail");
        errorDom.style.visibility = "visible";
      })
      .finally(() => {
        btnClassList.remove("btn-loading");
        clientMask.remove();
      });
  }

  SendEmail(e) {
    const btnClassList = e.currentTarget.classList;
    btnClassList.add("btn-loading");
    const param = {
      email: this.verifyEmail,
      fromType: 1,
      productName: "vidqu",
    };
    jqAjaxPromise(
      {
        url: "/api/user/resend-register-code",
        type: "POST",
        data: param,
      },
      () => {}
    )
      .then((res) => {
        // console.log(res);
        if (res.code === 200) {
          Modal({
            iconType: "right",
            isClose: "false",
            titleText: `${selfLoginTxt["weve-sent-a-new-email-with-a-verification-link-to"]} ${this.verifyEmail}`,
          });
        } else {
          console.log("fail");
        }
      })
      .catch(() => {
        console.log("fail");
      })
      .finally(() => {
        btnClassList.remove("btn-loading");
      });
  }

  // reset pwd
  resetPwdSubmit(e) {
    const val = this.loginResetPwdEmail.value;
    const btnClassList = e.currentTarget.classList;
    btnClassList.add("btn-loading");
    jqAjaxPromise(
      {
        url: "/api/user/reset-password",
        type: "POST",
        data: {
          email: val,
          productName: "vidqu",
        },
      },
      () => {}
    )
      .then((res) => {
        console.log(res);
        if (res.code === 200) {
          const con = this.shadowRootEl.querySelector(".login-dialog-body");
          let str = jsonData["login"]["send-succ-tip"];
          const regex = new RegExp(`{{val}}`, "g");
          str = str.replace(regex, val);
          con.querySelector(".login-send-succ-text").innerText = str;
          this.shadowRootEl.querySelector(".login-dialog-body").classList =
            "login-dialog-body sendsuc";
          // Modal({
          //   iconType: "right",
          //   isClose: "false",
          //   titleText: `${selfLoginTxt["a-link-to-reset-your-password-has-been-sent-to"]} ${val}. ${selfLoginTxt["please-check-your-inbox"]}`,
          // });

          // $("confirm-dialog")
          //   .off("submit")
          //   .on("submit", () => {
          //     this.closeLoginDialog();
          //   });
        } else {
          console.log("fail");
        }
      })
      .catch(() => {
        Modal({
          iconType: "hint",
          isClose: "false",
          titleText: `${selfLoginTxt["failed-send"]}`,
        });
      })
      .finally(() => {
        btnClassList.remove("btn-loading");
      });
  }

  // almost here
  almostHereSubmit(e) {
    $("body").append(clientMask);
    const data = this.loginAlmostHereEmail.value;
    const btnClassList = e.currentTarget.classList;
    const errorDom = this.shadowRootEl.querySelector(
      ".login-almost-here-error-msg"
    );
    errorDom.innerText = "";
    btnClassList.add("btn-loading");
    jqAjaxPromise(
      { url: "/api/user/bind-email", type: "POST", data: { email: data } },
      () => {}
    )
      .then((res) => {
        if (res.code === 200) {
          getLoginStatus.bind(this)(this.almostLoginId);
          errorDom.style.visibility = "hidden";
        } else {
          if (res.code === 409) {
            errorDom.innerText =
              selfLoginTxt[
                "an-account-with-this-email-already-exists-please-try-a-different-email-address"
              ];
          } else if (res.code === 1008) {
            this.shadowRootEl
              .querySelector(".login-almost-here-email-box.error-tip-box")
              .classList.add("error-interim");
            this.shadowRootEl
              .querySelector(".login-almost-here-email-box.error-tip-box input")
              .classList.add("error");
          } else {
            errorDom.innerText =
              selfLoginTxt["email-verification-failed-please-try-again-later"];
          }
          clientMask.remove();
          errorDom.style.visibility = "visible";
          btnClassList.remove("btn-loading");
        }
      })
      .catch(() => {
        errorDom.innerText =
          selfLoginTxt["email-verification-failed-please-try-again-later"];
        errorDom.style.visibility = "visible";
        btnClassList.remove("btn-loading");
        clientMask.remove();
      });
  }

  // login Link
  setLinkInfo(info) {
    const { email = "", type = "" } = info;
    this.linkEmail = email;
    this.linkType = type;
    this.shadowRootEl.querySelector(".link-email").innerHTML = email;
    this.shadowRootEl.querySelector(".link-type").innerHTML = type;
  }

  loginLinkSubmit(e) {
    $("body").append(clientMask);
    const btnClassList = e.currentTarget.classList;
    btnClassList.add("btn-loading");
    LoginSubmission.bind(this)(
      {
        email: this.linkEmail,
        password: this.loginLoginLinkPwd.value,
        fromType: 1,
      },
      () => {
        btnClassList.remove("btn-loading");
        clientMask.remove();
      },
      this.isTemplateType
    );
  }
}

//Register a custom component
customElements.define("my-component", MyComponent);
