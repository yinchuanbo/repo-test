const interHost =
  location.host.includes(".vidqu.ai") && !location.host.includes("test")
    ? "https://main-api.vidqu.ai"
    : "https://main-api-test.vidqu.ai";
let checkspwd = {
  newpwd: false,
  confirm: false,
};

let _reset_key = "";
$(".form-tips").html();
$(".form-email").removeClass("dirty");

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

// POST
function fetchPost(url, data = {}, headers = {}) {
	return new Promise((resolve, reject) => {
	  fetch(interHost + url, {
		method: "POST",
		headers: {
		  ...{
			"Content-Type": "application/json",
			"X-TASK-VERSION": "2.0.0",
			"Request-Origin": "vidqu",
		  },
		  ...headers,
		},
		body: JSON.stringify(data),
	  })
		.then((response) => {
		 resolve(response.json())
		})
		.catch((err) => reject(err));
	});
  }

$(document).on(
  "input propertychange",
  ".form-password[name='confirm']",
  function (evt) {
    evt.target.classList.remove("dirty");
    if (evt.target.value.length > 0 && checkspwd.newpwd) {
      $(".form-tips").html();
      if (
        containsVal(
          $(".form-input[name='newpwd']").val(),
          $(".form-input[name='confirm']").val()
        )
      ) {
        removeCheckStyle(evt);
        checkspwd.confirm = true;
        $(".form-tips").removeClass("dirty");
        $(".button-email").removeAttr("disabled");
      } else {
        checkspwd.confirm = false;
        addCheckStyle(evt);
        $(".form-tips").addClass("dirty");
        $(".button-email").attr("disabled", "disabled");
        $(".pwd-tips").html(jsonData.loginUser.pwd_tips.match);
      }
    } else {
      checkspwd.confirm = false;
      removeCheckStyle(evt);
      if (checkspwd.newpwd) {
        $(".form-tips").removeClass("dirty");
      }
    }

    if (checkspwd.confirm && checkspwd.newpwd) {
      $(".button-email").removeAttr("disabled");
    } else {
      $(".button-email").attr("disabled", "disabled");
    }
  }
);

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

// 使用 localStorage 保存数据
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
// 显示密码
function OpenOrClosePassword(e) {
	// clickStopPropagation(e);
	// console.log(e);
	var targetEle = e.target;
	var item = findAncestors(targetEle, function (node) {
		return node.classList && node.classList.contains("reveal-button");
	});
	if (!item) return;
	var chkbox = item.parentNode.querySelector('input');
	if (item.classList.contains("active")) {
		item.classList.remove("active");
		chkbox.setAttribute("type", "password");
	} else {
		item.classList.add("active");
		chkbox.setAttribute("type", "text");
	}

	var val = chkbox.value;
	chkbox.focus();
	chkbox.value = '';
	chkbox.value = val;
}
// 显示密码点击
function checkPasswordEyes() {
	let revealbutton = document.querySelectorAll('.reveal-button');
	let _that = this;
	revealbutton.forEach(item => item.addEventListener('click', OpenOrClosePassword.bind(_that)));
}

$(document).on(
  "input propertychange",
  ".form-password[name='newpwd']",
  function (evt) {
    evt.target.classList.remove("dirty");
    if (evt.target.value.length > 0) {
      console.log(onCheckPassword(evt.target.value));
      if (!onCheckPassword(evt.target.value)) {
        addCheckStyle(evt);
        $(".form-tips").addClass("dirty");
        $(".form-input[name='confirm']").removeClass("dirty");
        checkspwd.newpwd = false;
      } else {
        removeCheckStyle(evt);
        checkspwd.newpwd = true;
        // if (!checkspwd.confirm && !isBlank($(".form-input[name='confirm']").val())) {
        if (!isBlank($(".form-input[name='confirm']").val())) {
          $(".form-tips").addClass("dirty");
          if (
            !isBlank($(".form-input[name='confirm']").val()) &&
            containsVal(
              $(".form-input[name='newpwd']").val(),
              $(".form-input[name='confirm']").val()
            )
          ) {
            $(".form-input[name='confirm']").removeClass("dirty");
            $(".form-tips").removeClass("dirty");
            checkspwd.confirm = true;
          } else {
            $(".form-input[name='confirm']").addClass("dirty");
            $(".form-tips").html();
            checkspwd.confirm = false;
            $(".pwd-tips").html(jsonData.loginUser.pwd_tips.match);
          }
        } else {
          $(".form-tips").removeClass("dirty");
        }
      }
    } else {
      checkspwd.newpwd = false;
      removeCheckStyle(evt);
      $(".form-tips").removeClass("dirty");
      $(".form-input[name='confirm']").removeClass("dirty");
    }

    if (checkspwd.confirm && checkspwd.newpwd) {
      $(".button-email").removeAttr("disabled");
    } else {
      $(".button-email").attr("disabled", "disabled");
    }

    // console.log(checkspwd);
  }
);

function getUrlParam(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
  var r = window.location.search.substr(1).match(reg);
  if (r != null) return encodeURI(r[2]);
  return null;
}
// 设置会话级的cookie
function setCookie(c_name, value) {
	var host = location.hostname.includes(".vidqu.ai")
	  ? ".vidqu.ai"
	  : location.hostname;
	var c_value = escape(value) + ";path=/;domain=" + host;
	document.cookie = c_name + "=" + c_value;
  }
const resetPasswordSend = (param) => {
  fetchPost("/api/user/do-reset-password", param).then((res) => {
    // console.log(res);
    if (res.code === 200) {
      $(".button-email").removeAttr("disabled");
      const user_traits = {
        id: res.data.id,
        email: res.data.email,
        first_name: res.data.first_name,
        last_name: res.data.last_name,
        head_portrait: res.data.head_portrait,
        usertype: res.data.type,
      };
      const nowLoginProduct = res.data.redirect_url;
      setCookie("access_token", res.data.access_token, 30);
      setCookie("refresh_token", res.data.refresh_token, 30);
      setCookie("user_info", JSON.stringify(user_traits), 30);
      setCookie("loginProduct", nowLoginProduct, 30);
	  window.location.href = nowLoginProduct;
      $(".form-tips").removeClass("dirty");
    } else {
      console.log("fail");
      if (res.code === 409) {
        $(".button-email").attr("disabled", "disabled");
        $(".form-tips").html(res.message).addClass("dirty");
      } else {
        $(".button-email").removeAttr("disabled");
        $(".form-tips").html(res.message).addClass("dirty");
      }
    }
  });
};



$("body").keydown(function (e) {
  var theEvent = e || window.event;
  var code = theEvent.keyCode || theEvent.which || theEvent.charCode;
  if (code == 13) {
    if (!$(".button-email").attr("disabled")) {
      $(".button-email").click();
    }
    return false;
  }
});

const removeCheckStyle = (el) => {
  el.target.classList.remove("dirty");
};

const addCheckStyle = (el) => {
  el.target.classList.add("dirty");
};

const setCheckEmail = (el, type) => {
  let _setval = "";
  _setval = type == "page" ? el.value : el.target.value;
  if (_setval) {
    if (type == "page") {
      el.classList.remove("dirty");
    } else {
      el.target.classList.remove("dirty");
    }
    return true;
  } else {
    if (isBlank(_setval)) {
      if (type == "page") {
        el.classList.remove("dirty");
      } else {
        el.target.classList.remove("dirty");
      }
      return true;
    } else {
      if (type == "page") {
        el.classList.add("dirty");
      } else {
        el.target.classList.add("dirty");
      }
      return false;
    }
  }
};

// 最大长度
const max_length = (field, length) => {
  if (!regexs.numericRegex.test(length)) return false;
  return backVal(field).length <= parseInt(length, 10);
};

// 最小长度
const min_length = (field, length) => {
  if (!regexs.numericRegex.test(length)) return false;
  return backVal(field).length >= parseInt(length, 10);
};

const containsVal = (field, value) => {
  var value1 = backVal(field);
  return value1 == value;
};
function backVal(field) {
  return typeof field === "string" ? field : field.value;
}
const onCheckPassword = (pass) => {
  $(".pwd-tips").html(jsonData.loginUser.pwd_tips.len);
  if (pass.trim().length == 0 || pass == null) {
    return false;
  } else if (pass.trim().length < 6 || pass.trim().length > 20) {
    return false;
  } else {
    return true;
  }
};

function findAncestors(node, match) {
	while (node != null) {
		if (match.call(null, node)) {
			return node;
		}
		node = node.parentNode;
	}
	return null;
}

window.addEventListener("load", () => {
  let backUrl = location.search,
    bsininHref = "",
    bsinupHref = "";
  document
  .querySelector(".button-email")
  .addEventListener("click", function (el) {
	_reset_key = getUrlParam("reset_key");
	$(".button-email").attr("disabled", "disabled");
	if (checkspwd) {
		$(".form-input").removeClass("dirty");
		resetPasswordSend({
			reset_key: _reset_key,
			new_password: $("#newpassword").val(),
			productName: "vidqu"
		});
	}
  });

  if (!isBlank(getUrlParam("page_name"))) {
    bsininHref = $("#back-to-signin").attr("href");
    bsinupHref = $("#signup-to-free").attr("href");
    if (backUrl.indexOf("?") != -1) {
      $("#back-to-signin").attr("href", bsininHref + "?page_name=" + backUrl);
      $("#signup-to-free").attr("href", bsinupHref + "?page_name=" + backUrl);
    } else {
      $("#back-to-signin").attr("href", bsininHref + "&page_name=" + backUrl);
      $("#signup-to-free").attr("href", bsinupHref + "&page_name=" + backUrl);
    }
  }

  if (!isBlank(getStorage("video_email"))) {
    $("#signinemail").val(getStorage("video_email").email);
    $("#email-forgot-submit").removeAttr("disabled");
    checks.email = true;
  }

  checkPasswordEyes();
});
