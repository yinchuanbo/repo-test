const toolPicingUrl = "/pricing.html";
var userRuleConfig = {
  limit: 100, // 上传限制
  countrycode: "T3", //
  times: 1, // 当天剩余免费次数
  credit: 0, // 金币余额
  is_subscriber: 2, // 是否为订阅用户
};
window.userRuleConfig = userRuleConfig;
function setCookie(c_name, value, expiredays) {
  var exdate = new Date();
  exdate.setDate(exdate.getDate() + expiredays);
  var host = location.hostname.includes(".miocreate.com")
    ? ".miocreate.com"
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

function isMobileDevice() {
  const userAgent = navigator.userAgent;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    userAgent
  );
}

function randomchoice(arr) {
  let lastNumber = null;
  function helper() {
    let res = arr.filter((item) => {
      return item !== lastNumber;
    });
    let randomIndex = Math.floor(Math.random() * res.length);
    let randomNum = res[randomIndex];

    lastNumber = randomNum;
    return randomNum;
  }

  return helper;
}

function setNewTag(onlyshow) {
  const newTag = $(".new_tag");
  if (!newTag) return;
  const newTime = getCookie("newTime1") || 0;
  const nowTime = new Date().getTime();
  if (!newTime || nowTime <= Number(newTime) + 7 * 24 * 60 * 60 * 1000) {
    newTag.show();
  }
  if (!newTime && !onlyshow) {
    setCookie("newTime1", new Date().getTime());
    newTag.show();
  }
}

function setFsNewTag(onlyshow) {
  const newTag = $(".fs_new_tag");
  if (!newTag) return;
  const newTime = getCookie("newfsTime") || 0;
  const nowTime = new Date().getTime();
  if (!newTime || nowTime <= Number(newTime) + 7 * 24 * 60 * 60 * 1000) {
    newTag.show();
  }
  if (!newTime && !onlyshow) {
    setCookie("newfsTime", new Date().getTime());
    newTag.show();
  }
}

function getCreditsSystemText(name, valData = {}, bool = false) {
  if (bool) {
    if (valData.val > 1) {
      name += "_p"; // 单复数
    }
  }
  let str = jsonData?.faceSwap?.faceSwapPop01[name];
  for (let key in valData) {
    const regex = new RegExp(`{{${key}}}`, "g");
    str = str.replace(regex, valData[key]);
  }
  // console.log(str)
  return str;
}

const multicreditSystem = new CreditsSystem({
  bannerIdid: "multi_photo",
  appendedDom: $("#multiple_Face_swapper_container .swap_credit_banner"),
  creditsText: lan.faceSwapPop02,
  appendedPopDom: $("#multiple_Face_swapper_container"),
});
multicreditSystem.setBannerHtml();
multicreditSystem.setCreditsPopup();

const multiVcreditSystem = new CreditsSystem({
  bannerIdid: "multi_video",
  appendedDom: $("#multiple_Face_swapper_container_v .swap_credit_banner"),
  creditsText: lan.faceSwapPop02,
  appendedPopDom: $("#multiple_Face_swapper_container_v"),
});
multiVcreditSystem.setBannerHtml();
multiVcreditSystem.setCreditsPopup();
const photocreditSystem = new CreditsSystem({
  bannerIdid: "photo",
  appendedDom: $("#photo_Face_swapper_container .swap_credit_banner_v"),
  creditsText: lan.faceSwapPop02,
  appendedPopDom: $("#photo_Face_swapper_container"),
});
photocreditSystem.setBannerHtml();
photocreditSystem.setCreditsPopup();

const videocreditSystem = new CreditsSystem({
  bannerIdid: "video",
  appendedDom: $("#video_Face_swapper_container .swap_credit_banner_v"),
  creditsText: lan.faceSwapPop02,
  appendedPopDom: $("#video_Face_swapper_container"),
});
videocreditSystem.setBannerHtml();
videocreditSystem.setCreditsPopup();

function showHdCredits({ clickfn, type }) {
  let obj = {
    photo: photocreditSystem,
    multi: multicreditSystem,
    video: videocreditSystem,
    multiv: multiVcreditSystem,
  };
  obj[type].showCreditPopup({
    title: getCreditsSystemText("hqpoptitle"),
    content: getCreditsSystemText("pop1080p"),
    btn: getCreditsSystemText("unlocknow"),
    btnFn: () => {
      clickfn?.();
      // window.open(toolPicingUrl);
    },
    modalCoins: "hd",
  });
}

function swap_isSameDay() {
  // if (window.userRuleConfig?.is_subscriber === 1) {
  //   return true;
  // }
  let timestamp1 = Date.now();
  let timestamp2 = getCookie("faceSwapTime_swap");
  if (!timestamp2) {
    return false;
  }
  const date1 = new Date(timestamp1);
  const date2 = new Date(Number(timestamp2));

  // 获取日期的各个部分
  const year1 = date1.getFullYear();
  const month1 = date1.getMonth();
  const day1 = date1.getDate();

  const year2 = date2.getFullYear();
  const month2 = date2.getMonth();
  const day2 = date2.getDate();

  // 判断是否在同一天
  return year1 === year2 && month1 === month2 && day1 === day2;
}

function getUserHdCookie() {
  try {
    const userHdCookie = JSON.parse(getCookie("userHd") || "{}");
    const userinfo = JSON.parse(getCookie("user_info") || "{}");
    const thisuser = userHdCookie[userinfo.id] || {};
    const is_subscriber = window.userRuleConfig.is_subscriber;
    if (is_subscriber !== 1) {
      userHdCookie[userinfo.id] = {};
      setCookie("userHd", JSON.stringify(userHdCookie));
      return;
    }
    const domoptions = {
      multi: "",
      video: "_video",
      photo: "_photo",
      multiv: "_multiv",
    };
    const objoptions = {
      multi: multicreditSystem,
      video: videocreditSystem,
      photo: photocreditSystem,
      multiv: multiVcreditSystem,
    };
    Object.keys(thisuser).forEach(function (key) {
      if (thisuser[key] === 1) {
        $(`.high_quality_append_dom${domoptions[key]} .customSwitch`).attr(
          "checked",
          "checked"
        );
        objoptions[key].is_hd = 1;
      } else {
        $(
          `.high_quality_append_dom${domoptions[key]} .customSwitch`
        ).removeAttr("checked");
        objoptions[key].is_hd = 2;
      }
    });
  } catch (err) {
    console.error(err);
  }
}

async function getVideoCoverImage(videoElement) {
  videoElement.setAttribute("crossOrigin", "anonymous"); //设置图片跨域访问
  return new Promise((resolve, reject) => {
    videoElement.play();
    setTimeout(() => {
      videoElement.pause();
    }, 100);
    setTimeout(() => {
      try {
        let canvas = document.createElement("canvas");
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        let context = canvas.getContext("2d");
        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        let imageDataURL = canvas.toDataURL("image/jpeg");
        resolve(imageDataURL);
      } catch (err) {
        console.log("获取第一帧失败");
        resolve("");
      }
    }, 500);
  });
}

function getCreditsFromVideoOrPic(obj, maintype = "image") {
  const num = obj.uploadFacesNumber;
  let credits = 1;
  if (maintype === "video") {
    if (num <= 3) {
      let maxNum = obj.duration / (window.userRuleConfig.duration || 10);
      credits = Math.ceil(maxNum) * 5;
    } else {
      let maxNum = obj.duration / (window.userRuleConfig.duration || 10);
      credits = Math.ceil(maxNum) * 2 * num;
    }
  } else {
    if (num > 6) {
      credits = 2;
    }
  }
  return credits;
}


function changeHeaderCredit (credit) {
  const header = $("header-credit")?.[0];
  const go_credits = $("#go_credits");
  if (header) {
    header.updateInfo();
  }
  if (go_credits) {
    go_credits.find(".credits_num span").text(credit)
  }
}

function isMacorIos() {
  var agent = navigator.userAgent.toLowerCase();
  var isMac = /macintosh|mac os x/i.test(agent);
  var iOS = /iPad|iPhone|iPod/.test(agent) && !window.MSStream;
  if (iOS || isMac) {
    //your code
    return true;
  }
  return false;
}

function initCreditsComponents() {
  multiVcreditSystem.setHighQualityHtml(
    $(".high_quality_append_dom_multiv"),
    userRuleConfig?.is_subscriber !== 1,
    () => {
      gtag("event", "alert_faceswap_hd_v");
      showHdCredits({
        clickfn: () => {
          gtag("event", "click_faceswap_hd_v");
        },
        type: "multiv",
      });
    },
    "multiv"
  );
  multicreditSystem.setHighQualityHtml(
    $(".high_quality_append_dom"),
    window.userRuleConfig?.is_subscriber !== 1,
    () => {
      gtag("event", "alert_faceswap_hd_m");
      showHdCredits({
        clickfn: () => {
          gtag("event", "click_faceswap_hd_m");
        },
        type: "multi",
      });
    },
    "multi"
  );
  photocreditSystem.setHighQualityHtml(
    $(".high_quality_append_dom_photo"),
    userRuleConfig?.is_subscriber !== 1,
    () => {
      gtag("event", "alert_faceswap_hd");
      showHdCredits({
        clickfn: () => {
          gtag("event", "click_faceswap_hd");
        },
        type: "photo",
      });
    },
    "photo"
  );
  videocreditSystem.setHighQualityHtml(
    $(".high_quality_append_dom_video"),
    userRuleConfig?.is_subscriber !== 1,
    () => {
      gtag("event", "alert_faceswap_hd_v");
      showHdCredits({
        clickfn: () => {
          gtag("event", "click_faceswap_hd_v");
        },
        type: "video",
      });
    },
    "video"
  );
  multiVcreditSystem.showCreditBanner({
    bool: true,
    showcallback: () => {
      gtag("event", "show_mulfaceswap_videobanner")
      $(
        "#multiple_Face_swapper_container_v .swap_credit_btn_video, #multiple_Face_swapper_container_v .swap_credit_btn_photo"
      )
        .off("click")
        .on("click", function () {
          if (getCookie("access_token")) {
            // window.gtagClick("logged_credit_mulbannerbtn_mv");
            setSessionCookie("st", "mulloggedcreditbannermv", 30);
          } else {
            // window.gtagClick("notlogged_credit_mulbannerbtn_mv");
            setSessionCookie("st", "mulnotcreditbannermv", 30);
          }
        });
    },
  });
  multicreditSystem.showCreditBanner({
    bool: true,
    showcallback: () => {
      gtag("event", "show_mulfaceswap_imgbanner")
      $(
        "#multiple_Face_swapper_container .swap_credit_btn_video, #multiple_Face_swapper_container .swap_credit_btn_photo"
      )
        .off("click")
        .on("click", function () {
          if (getCookie("access_token")) {
            // window.gtagClick("logged_credit_mulbannerbtn");
            setSessionCookie("st", "mulloggedcreditbanner", 30);
          } else {
            // window.gtagClick("notlogged_credit_mulbannerbtn");
            setSessionCookie("st", "mulnotcreditbanner", 30);
          }
        });
    },
  });
  videocreditSystem.showCreditBanner({ bool: true, showcallback: () => {
    gtag("event", "show_faceswap_videobanner");
  } });
  photocreditSystem.showCreditBanner({ bool: true, showcallback: () => {
    gtag("event", "show_faceswap_imgbanner");
  } });
  getUserHdCookie();
  $(".signout").click(() => {
    // 退出登录了
    setTimeout(() => {
      location.reload();
    }, 50);
  });
  
  // gtag credit banner click
  photocreditSystem.appendedDom.find(".swap_credit_btn").click(function() {
    gtag("event", "click_faceswap_imgbanner");
    setCookie("st", "fsimgcreditbanner")
  })
  videocreditSystem.appendedDom.find(".swap_credit_btn").click(function() {
    gtag("event", "click_faceswap_videobanner");
    setCookie("st", "fsvideocreditbanner")
  })
  multicreditSystem.appendedDom.find(".swap_credit_btn").click(function() {
    gtag("event", "click_mulfaceswap_imgbanner");
    setCookie("st", "mulfsimgcreditbanner")
  })
  multiVcreditSystem.appendedDom.find(".swap_credit_btn").click(function() {
    gtag("event", "click_mulfaceswap_videobanner");
    setCookie("st", "mulfsvideocreditbanner")
  })
}
