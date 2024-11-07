var userinfo = null;
var header_credit = null;
window.addEventListener('load', () => {
  header_credit = document.querySelector('header-credit');
  // userinfo = header_credit.getCreditsData();
})
curToken = getCookie("access_token") || "",
  requesHost =
  location.host === "www.vidqu.ai"
    ? "https://tool-api.vidqu.ai"
    : "https://tool-api-test.vidqu.ai",
  translateDownloadData = null,
  translateDownloadDataY = null;


function getTranslateText(name, valData = {}, bool = false) {
  if (bool) {
    let num = valData.val;
    if (typeof num === 'string') {
      let strWithoutCommas = num.replace(/,/g, '');
      num = parseFloat(strWithoutCommas)
    }

    if (num !== 1) {
      name += '_p'  // 单复数
    }
  }
  let str = videoTransText[name]
  for (let key in valData) {
    const regex = new RegExp(`{{${key}}}`, 'g')
    str = str.replace(regex, valData[key])
  }
  // console.log(str)
  return str
}

function getUserinfo() {
  return new Promise((resolve, reject) => {
    fetchPost("api/user/info", {}, TOOL_API).then((res) => {
      if (res?.code === 200 && res?.data) {
        resolve(res.data)
      } else {
        console.error(res);
        resolve(res)
      }
    }).catch(err => {
      console.error(err);
      resolve();
    });
  })
}

const reloadNow = localStorage.getItem("reloadNow_videotranslate");
if (!reloadNow) {
  localStorage.setItem("reloadNow_videotranslate", 1);
  location.reload();
} else {
  localStorage.removeItem("reloadNow_videotranslate");
}
$(".credit-box .nav_title").html("");
var contryList = [],
  contryT,
  tab1_defaultCountry,
  tab2_defaultCountry,
  tab1_defaultOriginLan = { key: "", name: "" },
  tab2_defaultOriginLan = { key: "", name: "" },
  defaultAble = "2",
  defaultIsVideo = "2",
  defaultProofread = "1",
  videoDuration1,
  videoDuration2,
  curUploadFile,
  curYoutubeFile,
  isFileChange = false,
  isYoutubeFileChange = false,
  urlObj,
  isDownload = false,
  uploadVideoRes,
  youtubeVideoRes,
  demoList,
  originalLanList,
  shareDialogEl = document.querySelector("#shareDialogEl"),
  upload_task_id = "",
  youtube_task_id = "",
  winRef,
  curTab = "tab1",
  youtubeUrl,
  headMin = 0,
  giveawayMin = 0,
  useMin = 0,
  isUse = false,
  tab_url1,
  tab_url2,
  tab_image1,
  tab_image2,
  tab_fileName2,
  tab_key2,
  tab1_orVideo_script = [],
  tab1_taVideo_script = [],
  tab1_edit_orVideo_script = [],
  tab1_edit_taVideo_script = [],
  tab2_orVideo_script = [],
  tab2_taVideo_script = [],
  tab2_edit_orVideo_script = [],
  tab2_edit_taVideo_script = [],
  translateLimit,
  translateUseLimit,
  tab1_currentVal,
  tab1_originVal,
  tab1_targetVal,
  tab2_currentVal,
  tab2_originVal,
  tab2_targetVal,
  tab1_choose_country,
  tab2_choose_country;
// get
function getReq(url, headers = {}) {
  return fetch(url, {
    method: "GET",
    headers: {
      ...getHeaders(),
      ...headers,
    },
  }).then((response) => response.json());
}

// post
function postReq(url, data, headers = {}) {
  return fetch(url, {
    method: "POST",
    headers: {
      ...getHeaders(),
      ...headers,
    },
    body: JSON.stringify(data),
  }).then((response) => response.json());
}

// put
function putReq(url, data, headers = {}) {
  var controller = new AbortController();
  var { signal } = controller;
  return new Promise((resolve, reject) => {
    fetch(url, {
      method: "PUT",
      headers,
      signal,
      body: data,
    })
      .then((response) => resolve(response.status))
      .catch((err) => reject(err));
  });
}

// getHeader
function getHeaders() {
  const headers = {
    "Content-Type": "application/json",
    "Request-Language":
      getPreferredLanguage() == "ja" ? "jp" : getPreferredLanguage(),
    "Request-Origin": "vidqu"
  };
  curToken = getCookie("access_token") || "";
  if (curToken) {
    headers["Authorization"] = "Bearer " + curToken;
  }
  return headers;
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

function isMobileDevice() {
  const userAgent = navigator.userAgent;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    userAgent
  );
}

function isIOSBelowx(x) {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    const match = userAgent.match(/OS (\d+)_/);
    if (match && match[1]) {
      const iOSVersion = parseInt(match[1], 10);
      return iOSVersion <= x;
    }
  }
  return false;
}

function isMacOSBelow14() {
  const userAgent = navigator.userAgent;
  if (/Macintosh|MacIntel|MacPPC|Mac68K/.test(userAgent)) {
    const match = userAgent.match(/Mac OS X (\d+)[._](\d+)/);
    if (match) {
      const majorVersion = parseInt(match[1], 10);
      return majorVersion < 14;
    }
  }
  return false;
}

function isSafari() {
  const userAgent = navigator.userAgent;
  const vendor = navigator.vendor;
  const isSafari = /Safari/.test(userAgent) && /Apple Computer/.test(vendor);
  return isSafari && !/Chrome/.test(userAgent);
}

function isMacOS() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  return /Macintosh|MacIntel|MacPPC|Mac68K/.test(userAgent);
}

function isIOS() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  return /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
}

async function getT() {
  // const res = await fetchPost
  const res = await postReq(
    `${requesHost}/ai/public/is-free`,
    {
      action: 'credit_video_translate'
    }
  );
  if (res.data.is_free === 1) {
    translateLimit = 2;
    translateUseLimit = 0;
  } else {
    translateLimit = 2;
    translateUseLimit = translateLimit
  }
  // console.log(res.data.is_free) // 1 有， 2没有
  // const data = res;
  // contryT = data.data.name;
  // useMin = data.data.available_duration;
  // headMin = getMins(data.data.available_duration);
  // giveawayMin = getMins(data.data.giveaway_duration);
  useMin = header_credit.getCreditsData().credits * 60;
  useMin = useMin || 0
  headMin = getMins(useMin);
  giveawayMin = 0;

}

function getMins(num) {
  num = Number(num) / 60;
  if (Math.floor(num) === num || num.toFixed(1) === "0.0") {
    num = num.toString();
  } else {
    num = Math.ceil(num * 10) / 10 + ''
  }

  return num.replace(".0", "");
}

function formatTime(seconds) {
  let totalSeconds = parseInt(seconds, 10);
  let hours = Math.floor(totalSeconds / 3600);
  let minutes = Math.floor((totalSeconds % 3600) / 60);
  let secs = totalSeconds % 60;
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (secs < 10) {
    secs = "0" + secs;
  }
  if (hours > 0) {
    if (hours < 10) {
      hours = "0" + hours;
    }
    return hours + ":" + minutes + ":" + secs;
  } else {
    return minutes + ":" + secs;
  }
}

function hasHH(timeString) {
  const hhmmssPattern = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;
  const mmssPattern = /^([0-5]?[0-9]):([0-5][0-9])$/;
  if (hhmmssPattern.test(timeString)) {
    return true;
  } else if (mmssPattern.test(timeString)) {
    return false;
  } else {
    return false;
  }
}

async function getContry() {
  const res = await getReq(
    `${requesHost}/ai/public/options?type=video-translate`
  );
  try {
    const code = res.code;
    if (code === 200) {
      originalLanList = res.data.original_language || [];
      const resList = res.data.country || [];
      // renderCountryHTML(resList);
      demoList = res.data.demos || [];
      renderDemo(demoList);
      handleContry(resList, originalLanList);
      $(".select_contry").css("pointer-events", "");
      $(".demo_video").show();
      $("#origin_lan").val("");
    }
  } catch (err) {
    console.error(err);
  }
}

function handleContry(list, originalLanList) {
  list.forEach((item) => {
    let newItem;
    if (item.men_list.length > 0) {
      newItem = {
        ...item,
        list_config: [item.men_list[0]],
      };
    } else {
      newItem = {
        ...item,
        list_config: [item.women_list[0]],
      };
    }

    contryList = [...contryList, newItem];
  });
  originalLanList = originalLanList;
  renderContryList(contryList);
  renderOriginLanList(originalLanList);
}

function renderOriginLanList(originalLanList) {
  $(".selectOriginLan").html("");
  if (originalLanList.length === 0) {
    $(".selectOriginLan").html(videoTransText.no_result);
    return;
  }
  let html_Origin = "";
  let _idx = -1;
  _idx = _idx < 0 ? 0 : _idx;
  originalLanList.forEach((item, index) => {
    html_Origin += `
      <div class="select_item" data-name="${item.name}">
        <div class="origin_contry">
          ${item.name}
        </div>
      </div>
    `;
  });
  $(".selectOriginLan").html(html_Origin);
  countryListitemClick("origin_contry");
}

function renderContryList(list) {
  $(".selectContry").html("");
  let html = "";
  let _idx = -1;
  _idx = _idx < 0 ? 0 : _idx;
  list.forEach((item, index) => {
    html += `
      <div class="select_item ${index === _idx ? "active" : ""}" data-name="${(
        item?.country_name || ""
      ).trim()}">
        <img class="contry_icon" src="${item.img_url}" alt="">
        <div class="contry_name">
          ${item.country_name}
        </div>
      </div>
    `;

    if (index === _idx) {
      tab1_defaultCountry = item;
      tab2_defaultCountry = item;
      setDefaultCountryInfo({
        flag: item.img_url,
        text: item.country_name,
        className: "contry_name",
      });
    }
  });

  $(".selectContry").html(html);
  countryListitemClick("contry_name");
}

function countryListitemClick(str) {
  let countryListItem;
  if (str == "contry_name") {
    countryListItem = document
      .querySelector(".select_box.selectContry")
      .querySelectorAll(".select_item");
  } else if (str == "origin_contry") {
    countryListItem = document
      .querySelector(".select_box.selectOriginLan")
      .querySelectorAll(".select_item");
  }

  countryListItem.forEach((item) => {
    item.onclick = () => {
      if (!Array.from(item.classList).includes("active")) {
        gtag("event", "select_videotranslate_lang");
      }
      $(".select_contry1").removeClass("active");
      clearListitemActive(countryListItem);
      item.classList.add("active");
      const itemText = item.textContent.trim();
      if (str == "contry_name") {
        if (curTab === "tab1") {
          tab1_defaultCountry = contryList.find(
            (item) => item.country_name == itemText
          );
        } else {
          tab2_defaultCountry = contryList.find(
            (item) => item.country_name == itemText
          );
        }
      }
      if (str == "origin_contry") {
        if (curTab === "tab1") {
          tab1_defaultOriginLan = originalLanList.find(
            (item) => item.name == itemText
          );
        } else {
          tab2_defaultOriginLan = originalLanList.find(
            (item) => item.name == itemText
          );
        }
        renderOriginLanList(originalLanList);
      }
      if (curTab === "tab1") {
        tab1_choose_country = null;
        tab1_edit_taVideo_script = [];
      } else {
        tab2_choose_country = null;
        tab2_edit_taVideo_script = [];
      }
      setDefaultCountryInfo({
        flag:
          str == "contry_name" ? item.querySelector(".contry_icon").src : null,
        text: itemText,
        className: str,
      });
    };
  });
}

function clearListitemActive(listItem) {
  listItem.forEach((item) => {
    item.classList.remove("active");
  });
}


function setDefaultCountryInfo({ flag, text, className }) {
  if (flag) $(".contry_icon.default").attr("src", flag).show();
  let langTarget;
  if (className == "origin_contry") {
    $("#origin_lan").val(text);
    langTarget = document.querySelector(".select_contry1");
    langCountryTarget = langTarget.querySelector(".origin_contry.default");
    if (!$(".tra_left").hasClass("genertor")) {
      if (curTab === "tab1") {
        if (tab1_defaultOriginLan.key && curUploadFile) {
          $(".translate_btn").addClass("active");
        }
      } else {
        if (tab2_defaultOriginLan.key && curYoutubeFile) {
          $(".translate_btn").addClass("active");
        }
      }
    }
  } else if (className == "contry_name") {
    $(".contry_name.default").html(text);
    langTarget = document.querySelector(".select_contry2");
    langCountryTarget = langTarget.querySelector(".contry_name.default");
  }
  //  langTarget = document.querySelector(".select_contry2");
  // const langCountryTarget = langTarget.querySelector(".contry_name.default");
  const textW = langCountryTarget.scrollWidth;
  const blockW = langCountryTarget.clientWidth;
  if (textW > blockW) {
    langCountryTarget.setAttribute("title", text);
  } else {
    langCountryTarget.removeAttribute("title");
  }
}

function ableClick() {
  const ableListItem1 = document.querySelector(".toggleSwitch1");
  const ableListItem2 = document.querySelector(".toggleSwitch5");
  const ableListItem2_1 = $('.toggleSwitch2_1');
  $('.subtitle_preview').addClass('Erase_original');
  ableListItem2_1.on('change', (e) => {
    $('.toggleSwitch2_1').prop('checked', e.target.checked);
    if (e.target.checked) {
      $('.subtitle_preview').removeClass('Erase_original');
    } else {
      $('.subtitle_preview').addClass('Erase_original');
    }
  });
  ableListItem1.onchange = () => {
    const key = ableListItem1.checked ? 1 : 2;
    ableListItem2.checked = ableListItem1.checked;
    if (key === 1) {
      $(".subtitle_preview").addClass("active");
      $('.choose2_1').css({ display: 'flex' });
      $('.choose5_1').css({ display: 'flex' });
    } else {
      $('.choose2_1').css({ display: 'none' });
      $('.choose5_1').css({ display: 'none' });
      $('.toggleSwitch2_1').prop('checked', false);
      $('.subtitle_preview').removeClass('Erase_original');
      $('.subtitle_preview').addClass('Erase_original');
      $(".subtitle_preview").removeClass("active");
    }
    setDefaultAble(key);
  };
  ableListItem2.onchange = () => {
    const key = ableListItem2.checked ? 1 : 2;
    ableListItem1.checked = ableListItem2.checked;
    if (key === 1) {
      $(".subtitle_preview").addClass("active");
      $('.choose2_1').css({ display: 'flex' });
      $('.choose5_1').css({ display: 'flex' });
    } else {
      $('.choose2_1').css({ display: 'none' });
      $('.choose5_1').css({ display: 'none' });
      $('.toggleSwitch2_1').prop('checked', false);
      $('.subtitle_preview').removeClass('Erase_original');
      $('.subtitle_preview').addClass('Erase_original');
      $(".subtitle_preview").removeClass("active");
    }
    setDefaultAble(key);
  };
}

function setDefaultAble(key) {
  //   $(".isable").text(text);
  defaultAble = key;
}

function isVideoClick() {
  const isVideoListItem1 = document.querySelector(".toggleSwitch2");
  const isVideoListItem2 = document.querySelector(".toggleSwitch6");
  isVideoListItem1.onchange = () => {
    const key = isVideoListItem1.checked ? 1 : 2;
    isVideoListItem2.checked = isVideoListItem1.checked;
    setDefaultIsVideo(key);
  };
  isVideoListItem2.onchange = () => {
    const key = isVideoListItem2.checked ? 1 : 2;
    isVideoListItem1.checked = isVideoListItem2.checked;
    setDefaultIsVideo(key);
  };
}

function setDefaultIsVideo(key) {
  // $(".isvideo").text(text);
  defaultIsVideo = key;
  if (defaultIsVideo == "1") {
    if (contryT === "T1") {
      $(".info_time").text(videoTransText.video_timeT1);
    } else if (contryT === "T2") {
      $(".info_time").text(videoTransText.video_timeT2);
    } else {
      $(".info_time").text(videoTransText.video_timeT3);
    }
  } else {
    if (contryT === "T1") {
      $(".info_time").text(videoTransText.audio_timeT1);
    } else if (contryT === "T2") {
      $(".info_time").text(videoTransText.audio_timeT2);
    } else {
      $(".info_time").text(videoTransText.audio_timeT3);
    }
  }
}

function proofreadClick() {
  const proofreadItem = document.querySelector(".toggleSwitch3");
  proofreadItem.onchange = () => {
    const key = proofreadItem.checked ? 1 : 2;
    setDefaultProofread(key);
    if (key === 1) {
      gtag("event", "script_videotranslate_proof");
    }
  };
}

function setDefaultProofread(key) {
  defaultProofread = key;
}

function showLarge() {
  $(".dialog_mask").addClass("show");
  $(".dialog_content").addClass("show");
  videoDom.pause();
  $(".play_btn").show();
}

async function toEdit() {
  const token = getCookie("access_token") || "";
  const task_id = curTab === "tab1" ? upload_task_id : youtube_task_id;
  if (!token) {
    showLoginWindow({
      wait: [task_id],
      fn: (data = null) => {
        if (data) {
          if (curTab === "tab1") {
            translateDownloadData = data;
          } else {
            translateDownloadDataY = data;
          }
        }
        initPage();
      },
    });
  } else {
    const task_id = curTab === "tab1" ? upload_task_id : youtube_task_id;
    winRefCommon = window.open("", "_blank");
    gtag("event", "click_videotranslate_edit");
    setCookie("st2", "editvideotranslate");
    $(".btnM").addClass("edit_loading");
    await setJumpToEdit({
      task_id,
      keyname: "video_key",
      pcTag: "editvideotranslate",
    });
    $(".btnM").removeClass("edit_loading");
  }
  $(".btn.download_video, .btn_download, .click_download").removeClass(
    "pointer_none"
  );
}

function showDemo(index, item) {
  $(".pre_btn").show();
  $(".next_btn").show();
  if (index == 0) {
    $(".pre_btn").hide();
  }
  if (index == demoList.length - 1) {
    $(".next_btn").hide();
  }
  $("#demo_video").attr("poster", item.cover_url);
  $("#demo_video").attr("src", item.video_url);
  $("#demo_video").attr("data-index", index);
  $(".demo_dialog_name").text(item.name);
  $(".dialog_mask").addClass("show");
  $(".demo_container").addClass("show");
}

function closeDemo() {
  $(".dialog_mask").removeClass("show");
  $(".demo_container").removeClass("show");
  $(".demo_play_icon").show();
  videoDemo.pause();
  videoDemo.currentTime = 0;
}

function showSwitch() {
  const switchs = document.querySelectorAll(".switch");
  switchs.forEach((el) => {
    el.classList.remove("disable");
  });
}

function showTip(type) {
  $(".tip_box").addClass("show");
  if (type != "progress") {
    showSwitch();
  }
  switch (type) {
    case "suc":
      $(".tip_content").addClass("success");
      break;
    case "fail":
      $(".tip_content").addClass("failed");
      break;
    case "progress":
      $(".tip_content").addClass("progress");
      break;
  }
}

function closeTip() {
  $(".tip_box").removeClass("show");
  $(".tip_content").removeClass("success failed progress");
}

function showFailed(type) {
  $(".title_text_tip").text(videoTransText.failed_title);
  $(".tip_failed").removeClass("notvip");
  $(".tip_failed").removeClass("enough");
  if (document.body.clientWidth <= 1200) {
    $(".tip_content").css("width", "95%");
  }
  $(".failed_btn").html(videoTransText.failed_btn);
  $(".failed_btn")
    .off("click")
    .on("click", function () {
      closeTip();
    });
  switch (type) {
    case "network":
      $(".title_text_tip").text(videoTransText.network_failed);
      $(".title_text_des").text(videoTransText.failed_des2);
      break;
    case "fail":
      $(".title_text_des").text(videoTransText.failed_des1);
      break;
    case "fail_useTime":
      $(".title_text_des").text(videoTransText.failed_des20);
      break;
    case "format":
      let text;
      if (isSafari() || isIOS() || isMacOS()) {
        text = videoTransText.failed_des23;
      } else {
        text = videoTransText.failed_des6;
      }
      $(".title_text_des").text(text);
      break;
    case "duration":
      $(".title_text_des").text(videoTransText.failed_des5);
      break;
    case "download":
      $(".title_text_des").text(videoTransText.failed_des3);
      break;
    case "upload":
      $(".title_text_des").text(videoTransText.failed_des4);
      break;
    case "max":
      let creditsData = header_credit.getCreditsData();
      if (creditsData.is_credit_subscription === 1) {
        $(".title_text_des").text(videoTransText.failed_des8_1g);
      } else {
        $(".title_text_des").text(videoTransText.failed_des8);
      }
      break;
    case "videoLan":
      $(".title_text_des").text(videoTransText.failed_des9);
      break;
    case "videoLan_useTime":
      $(".title_text_des").text(videoTransText.failed_des19);
      break;
    case "download_file":
      $(".title_text_des").text(videoTransText.failed_des10);
      break;
    case "download_file2":
      $(".title_text_des").text(videoTransText.failed_des24);
      break;
    case "upload_file":
      $(".title_text_des").text(videoTransText.failed_des11);
      break;
    case "limit":
      if (document.body.clientWidth <= 1200) {
        $(".tip_content").css("width", "5.4rem");
      }
      userinfo = header_credit.getCreditsData();
      if (userinfo.is_credit_subscription === 1) {
        $(".title_text_tip").text(videoTransText.limit_failed);
        $(".title_text_des").text(videoTransText.failed_des7);
        $(".tip_failed").removeClass("notvip");
        $(".failed_btn").html(videoTransText.failed_btn);
        $(".failed_btn")
          .off("click")
          .on("click", function () {
            closeTip();
          });
      } else {
        gtag("event", "show_videotranslate_max");
        $(".failed_btn").html(`${videoTransText.unlocknow}`);
        $(".title_text_tip").text(videoTransText.limit_failed);
        $(".title_text_des").text(videoTransText.failed_des13);
        $(".tip_failed").addClass("notvip");
        $(".notvip .failed_btn")
          .off("click")
          .on("click", function () {
            closeTip();
            gtag("event", "click_videotranslate_max");
            setCookie("st", "translator_timemaxlimit");
            // window.open("/pricing.html");
          });
      }
      break;
    case "noAudio":
      $(".title_text_des").text(videoTransText.failed_des12);
      break;
    case "noAudio_useTime":
      $(".title_text_des").text(videoTransText.failed_des18);
      break;
    case "url_limit":
      gtag("event", "toomany_videotranslate_urlparse");
      $(".title_text_des").text(videoTransText.failed_des14);
      break;
    case "min_limit":
      $(".title_text_des").text(videoTransText.failed_des15);
      break;
    case "only_one_drag":
      $(".title_text_des").text(videoTransText.failed_des17);
      break;
    case "url_fail":
      gtag("event", "failed_videotranslate_urlparse");
      $(".title_text_des").text(videoTransText.failed_des16);
      break;
    case "not_enough":
      gtag("event", "show_videotranslate_nocredit");
      let needMin;
      if (curTab === "tab1") {
        let duration = videoDuration1 < 60 ? 60 : videoDuration1
        needMin = getMins(duration - useMin);
      } else {
        let duration = videoDuration2 < 60 ? 60 : videoDuration2
        needMin = getMins(duration - useMin);
      }
      if (document.body.clientWidth <= 1200) {
        $(".tip_content").css("width", "5.4rem");
      }
      $(".tip_failed").addClass("enough");
      $(".title_text_tip").text(videoTransText.min_notEnough);
      $(".title_text_des").html(
        videoTransText.failed_des21.replace("%s", needMin)
      );
      $(".failed_btn").html(`
					<img src="/dist/img/video-translate/icon_time.svg" class="fail_icon_time" />
					<div class="text">${videoTransText.get_more}</div>
				`);
      $(".failed_btn")
        .off("click")
        .on("click", function () {
          gtag("event", "click_videotranslate_nocredit");
          setCookie("st", "translator_notime");
          // window.open("/pricing.html");
          closeTip();
        });
      break;
    case "not_youtube":
      gtag("event", "notytb_videotranslate_urlparse");
      $(".title_text_des").text(videoTransText.failed_des22);
      break;
  }
  showTip("fail");
  if (
    type == "download" ||
    type == "duration" ||
    type == "format" ||
    type == "max" ||
    type == "url_fail"
  )
    return;
  if (curTab === "tab1") {
    if (tab1_defaultOriginLan.key && curUploadFile) {
      $(".translate_btn").addClass("active");
    } else {
      $(".translate_btn").removeClass("active");
    }
  } else {
    if (tab2_defaultOriginLan.key && curYoutubeFile) {
      $(".translate_btn").addClass("active");
    } else {
      $(".translate_btn").removeClass("active");
    }
  }

  $(".translate_btn_text").html(videoTransText.btn_tra1);
}



let timer;
function handleAddNum() {
  let duration;
  if (curTab === "tab1") {
    duration = videoDuration1;
  } else {
    duration = videoDuration2;
  }
  $("#loading_progress").text(0);
  let progress_time = 0,
    progress = 0,
    showProgress = 0;
  clearInterval(timer);
  timer = null;
  if (defaultIsVideo == "1") {
    progress_time = duration * 2.5;
  } else {
    progress_time = duration;
  }

  timer = setInterval(() => {
    progress += 90 / progress_time;
    showProgress = Math.round(progress);
    if (showProgress >= 90) {
      showProgress = 90;
      clearInterval(timer);
      timer = null;
    }
    $("#loading_progress").text(showProgress);
  }, 1000);
}

let proofread_timer;
function handleAddProofreadNum() {
  $(".proofread_loading").text(0);
  $(".loading_tip_progress").css("width", "0%");
  let progress_time = 0;
  clearInterval(proofread_timer);
  proofread_timer = null;
  proofread_timer = setInterval(() => {
    progress_time++;
    if (progress_time >= 90) {
      progress_time = 90;
      clearInterval(proofread_timer);
      proofread_timer = null;
    }
    $(".proofread_loading").text(progress_time);
    $(".loading_tip_progress").css("width", `${progress_time}%`);
  }, 1000);
}

async function uploadFile(file) {
  if (!file) return;
  $(".tra_box.step1").addClass("loading");
  let btn_status = $(".translate_btn").attr('class')
  $(".translate_btn").removeClass("active");
  ableSelect(false);
  tab1_orVideo_script = [];
  tab1_taVideo_script = [];
  tab1_edit_orVideo_script = [];
  tab1_edit_taVideo_script = [];
  tab1_choose_country = null;
  urlObj = null;

  isFileChange = true;

  let maxSizeMB = 500
  let creditsData = header_credit.getCreditsData();
  if (creditsData.is_credit_subscription === 1) {
    maxSizeMB = 1024
  }
  const maxSize = 1024 * 1024 * maxSizeMB;
  const fileName = file.name;
  const fileExtension = fileName.split(".").pop().toLowerCase();
  let allowedExtensions, allowedMimeTypes;
  if (isSafari() || isIOS() || isMacOS()) {
    allowedExtensions = ["m4v", "mp4", "mov"];
    allowedMimeTypes = ["video/mp4", "video/quicktime"];
  } else {
    allowedExtensions = ["m4v", "mp4", "mov", "webm"];
    allowedMimeTypes = ["video/mp4", "video/quicktime", "video/webm"];
  }

  videoDom.pause();
  if (
    allowedExtensions.includes(fileExtension) ||
    allowedMimeTypes.includes(file.type)
  ) {
    if (file.size > maxSize) {
      gtag("event", "max_videotranslate_upload");
      showFailed("max");
      $(".tra_box.step1").removeClass("loading");
      if (btn_status.includes('active')) {
        $(".translate_btn").addClass("active");
      }
      ableSelect(true);
    } else {
      const videoURL = URL.createObjectURL(file);
      const video = document.getElementById("getLoadedDom_video1");
      video.src = videoURL;
      video.addEventListener(
        "loadedmetadata",
        async () => {
          const duration = video.duration;
          if (duration < 10) {
            showFailed("duration");
          } else if (duration > 10800) {
            showFailed("min_limit");
          } else {
            curUploadFile = file;
            videoDuration1 = duration;
            tab_url1 = videoURL;
            const imgUrl = await getVideoCoverImage(video);
            if (imgUrl) {
              tab_image1 = imgUrl;
              $(".pre_img").attr("poster", tab_image1);
              $(".step_src_style1 .small_img").attr("src", tab_image1);
            } else {
              $("step_src_style1 .small_img").css("background", "#000");
            }
            if (tab1_defaultOriginLan.key && curTab === "tab1") {
              $(".translate_btn").addClass("active");
            }
            $(".pre_img").attr("src", tab_url1);
            $(".tra_box.step1").addClass("active1");
            $(".step_src_style1 .video_info_title").text(file.name);
            $(".step_src_style1 .video_info_duration").text(
              videoTransText.video_info_duration.replace(
                "%s",
                formatTime(videoDuration1)
              )
            );
            $(".tra_left")
              .removeClass("genertor upload translate")
              .addClass("upload");
            $(".play_btn1").show();
            isTimeIconShow();
          }
          $(".tra_box.step1").removeClass("loading");
          ableSelect(true);
        },
        { once: true }
      );
    }
  } else {
    showFailed("format");
    $(".tra_box.step1").removeClass("loading");
    if (btn_status.includes('active')) {
      $(".translate_btn").addClass("active");
    }
    ableSelect(true);
  }
}

function ableSelect(isable) {
  const switchs = document.querySelectorAll(".switch");
  if (isable) {
    $(".step_tab_box").css("pointer-events", "");
    $(".step_src_style").css("pointer-events", "");
    $(".step_content").css("pointer-events", "");
    $(".select_contry").css("pointer-events", "");
    $(".select_able").css("pointer-events", "");
    $(".select_video").css("pointer-events", "");
    $(".get_url_icon").css("pointer-events", "");
    $(".get_url_icon").removeClass("loading");
    $(".delete_icon").css("pointer-events", "");
    $(".back_icon").css("pointer-events", "");
    switchs.forEach((el) => {
      el.classList.remove("disable");
    });
  } else {
    $(".step_tab_box").css("pointer-events", "none");
    $(".step_src_style").css("pointer-events", "none");
    $(".step_content").css("pointer-events", "none");
    $(".select_contry").css("pointer-events", "none");
    $(".select_able").css("pointer-events", "none");
    $(".select_video").css("pointer-events", "none");
    $(".get_url_icon").css("pointer-events", "none");
    $(".get_url_icon").addClass("loading");
    $(".delete_icon").css("pointer-events", "none");
    $(".back_icon").css("pointer-events", "none");
    switchs.forEach((el) => {
      el.classList.add("disable");
    });
  }
}

async function getVideoCoverImage(videoElement) {
  videoElement.setAttribute("crossOrigin", "anonymous");
  return new Promise((resolve, reject) => {
    videoElement.play();
    videoElement.muted = true;
    setTimeout(() => {
      videoElement.pause();
    }, 1000);
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
        console.log("获取第一帧失败", err);
        resolve(false);
      }
    }, 1500);
  });
}

function readfile(data) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.readAsBinaryString(data);
    reader.onload = (e) => {
      resolve(true);
    };
    reader.onerror = (e) => {
      resolve(false);
    };
  });
}

function handleFaildReq(failType, vipFailType) {
  ableSelect(true);
  if (userinfo?.is_credit_subscription === 1) {
    showFailed(vipFailType);
  } else {
    showFailed(failType);
  }
  $(".play_btn").hide();
  $(".play_btn1").hide();
  $(".proofread_content").removeClass("loading");
  clearInterval(timer);
  timer = null;
  if (curTab === "tab1") {
    tab1_choose_country = null;
    if (uploadVideoRes && !isFileChange) {
      $(".tra_left").removeClass("genertor").addClass("translate");
      if (videoDom.paused) {
        $(".play_btn").show();
      } else {
        $(".play_btn").hide();
      }
    } else {
      $(".tra_left").removeClass("genertor").addClass("upload");
      if (videoPre.paused) {
        $(".play_btn1").show();
      } else {
        $(".play_btn1").hide();
      }
    }
  } else {
    tab2_choose_country = null;
    if (youtubeVideoRes && !isYoutubeFileChange) {
      $(".tra_left").removeClass("genertor").addClass("translate");
      if (videoDom.paused) {
        $(".play_btn").show();
      } else {
        $(".play_btn").hide();
      }
    } else {
      $(".tra_left").removeClass("genertor").addClass("upload");
      if (videoPre.paused) {
        $(".play_btn1").show();
      } else {
        $(".play_btn1").hide();
      }
    }
  }

  closeProofread();
}

function showProofread(loading = true) {
  gtag("event", "show_videotranslate_script");
  if (curTab === "tab1") {
    $(".proofread_video").attr("src", tab_url1);
    $(".proofread_video").attr("poster", tab_image1);
    const totalDuration = formatTime(videoDuration1);
    let curDuration;
    if (hasHH(totalDuration)) {
      curDuration = "00:00:00";
    } else {
      curDuration = "00:00";
    }
    $(".duration_show").html(`${curDuration}/${totalDuration}`);
    if (uploadVideoRes && !isFileChange) {
      videoDom.pause();
      videoDom.currentTime = 0;
      $(".play_btn").show();
    } else if (curUploadFile) {
      videoPre.pause();
      videoPre.currentTime = 0;
      $(".play_btn1").show();
    }
  } else {
    $(".proofread_video").attr("src", tab_url2);
    $(".proofread_video").attr("poster", tab_image2);
    const totalDuration = formatTime(videoDuration2);
    let curDuration;
    if (hasHH(totalDuration)) {
      curDuration = "00:00:00";
    } else {
      curDuration = "00:00";
    }
    $(".duration_show").html(`${curDuration}/${totalDuration}`);
    if (youtubeVideoRes && !isYoutubeFileChange) {
      videoDom.pause();
      videoDom.currentTime = 0;
      $(".play_btn").show();
    } else if (curYoutubeFile) {
      videoPre.pause();
      videoPre.currentTime = 0;
      $(".play_btn1").show();
    }
  }

  progressbar.value = 0;
  progressbar.style.backgroundSize = "0% 100%";
  voicebar.style.backgroundSize = "20% 100%";
  voicebar.value = 20;
  videoProof.volume = 0.2;
  if (loading) {
    $(".proofread_content").addClass("loading");
    handleAddProofreadNum();
  } else {
    if (curTab === "tab1") {
      if (tab1_edit_orVideo_script.length > 0) {
        renderSubtitle(tab1_edit_orVideo_script, tab1_edit_taVideo_script);
      }
    } else {
      if (tab2_edit_orVideo_script.length > 0) {
        renderSubtitle(tab2_edit_orVideo_script, tab2_edit_taVideo_script);
      }
    }
  }
  $(".voice_num").html(voicebar.value);
  $(".voice_box").removeClass("active");
  $(".dialog_proofread").addClass("active");
  $(".playpause_box").removeClass("pause");
  document.body.style.overflow = "hidden";
}

function closeProofread() {
  $(".dialog_proofread").removeClass("active");
  $(".voice_box").removeClass("active");
  videoProof.currentTime = 0;
  progressbar.value = 0;
  progressbar.style.backgroundSize = "0% 100%";
  videoProof.pause();
  videoProof.src = "";
  $(".duration_show").html("00:00/00:00");
  $(".playpause_box").removeClass("pause");
  $(".translate_btn").addClass("active");
  $(".translate_btn_text").html(videoTransText.btn_tra1);
  $(".subtitle_item").removeClass("disabled getfocus");
  document.body.style.overflow = "";
}

async function translateVideo(isProofread) {
  if (!navigator.onLine) {
    showFailed('network')
    return;
  }
  closeProofread();
  ableSelect(false);
  let edit_taVideo_script, choose_country, defaultCountry;
  if (curTab === "tab1") {
    edit_taVideo_script = tab1_edit_taVideo_script;
    choose_country = tab1_choose_country;
    defaultCountry = tab1_defaultCountry;
  } else {
    edit_taVideo_script = tab2_edit_taVideo_script;
    choose_country = tab2_choose_country;
    defaultCountry = tab2_defaultCountry;
  }
  gtag("event", "trans_videotranslate_btn");
  if (isProofread) {
    // gtag("event", "trans_videotranslate_btn");
    $(".translate_btn").removeClass("active");
    $(".translate_btn_text").html(videoTransText.btn_tra2);
    $(".tra_left").removeClass("upload translate").addClass("genertor");
    $(".video_loading_icon").hide();
    $(".play_btn1").hide();
    $(".play_btn").hide();
    videoPre.pause();
    videoPre.currentTime = 0;
    videoDom.pause();
    videoDom.currentTime = 0;
    handleAddNum();
  } else if (
    !(choose_country?.country_name === defaultCountry?.country_name) &&
    defaultProofread == 1 &&
    edit_taVideo_script.length === 0
  ) {
    $(".translate_btn").removeClass("active");
    $(".translate_btn_text").html(videoTransText.btn_tra2);
  } else if (defaultProofread == 1 && edit_taVideo_script.length !== 0) {
    showProofread(false);
    ableSelect(true);
    return;
  } else {
    // gtag("event", "trans_videotranslate_btn");
    $(".translate_btn").removeClass("active");
    $(".translate_btn_text").html(videoTransText.btn_tra2);
    $(".tra_left").removeClass("upload translate").addClass("genertor");
    $(".video_loading_icon").hide();
    $(".play_btn1").hide();
    $(".play_btn").hide();
    videoPre.pause();
    videoPre.currentTime = 0;
    videoDom.pause();
    videoDom.currentTime = 0;
    handleAddNum();
  }

  if (curTab === "tab1") {
    if (urlObj?.key) {
      createTask();
    } else {
      const fileRes = await readfile(curUploadFile);
      if (!fileRes) {
        handleFaildReq("upload", "upload");
        return;
      }
      try {
        const urlRes = await postReq(
          `${requesHost}/ai/source/temp-upload-url`,
          {
            file_name:
              "Vidqu_VideoTranslate_" +
              new Date().getTime() +
              curUploadFile.name,
          }
        );
        if (urlRes.code === 200) {
          urlObj = urlRes.data;
          const upload_url = urlObj.upload_url || "";
          let code = 200;
          if (upload_url) {
            code = await putUrl(upload_url, curUploadFile);
          }
          // upload_url ? await putReq(upload_url, curUploadFile) : "";
          const accessfile = await getFileUrlRequest(urlObj.access_url);
          if (accessfile && code === 200) {
            createTask();
          } else {
            handleFaildReq("upload_file", "upload_file");
            return;
          }
        } else {
          handleFaildReq("upload_file", "upload_file");
          return;
        }
      } catch (error) {
        console.log("err", error);
        // handleFaildReq("upload_file", "upload_file");
        handleFaildReq("network", "network");
      }
    }
  } else {
    createTask();
  }
}

async function putUrl(upload_url, curUploadFile) {
  let time = 0;
  while (true) {
    try {
      const code = await putReq(upload_url, curUploadFile);
      if (code !== 200) {
        time++;
        if (time >= 3) {
          handleFaildReq("upload_file", "upload_file");
          return code;
        }
      }
      return code;
    } catch (error) {
      time++;
      if (time >= 3) {
        console.log(err);
        handleFaildReq("upload_file", "upload_file");
        return;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

function getYoutubeVideoTask(url) {
  if (!url.includes("youtu")) {
    showFailed("not_youtube");
    return;
  }
  let is_to_mp4 = 2;
  if (isIOSBelowx(16) || isMacOSBelow14()) {
    is_to_mp4 = 1;
  }
  ableSelect(false);
  const data = {
    url,
    option: "video-translate",
    type: "youtube",
    is_to_mp4,
  };
  postReq(
    `${requesHost}/ai/ai-tool/add-task`,
    { action: "link_download", param: data },
    { "X-TASK-VERSION": "2.0.0" }
  )
    .then((res) => {
      if (res.code === 200) {
        checkYoutubeVideo(res.data.task_id);
      } else if (res.code === 3002) {
        ableSelect(true);
        showFailed("url_limit");
        isTimeIconShow();
      } else {
        ableSelect(true);
        showFailed("url_fail");
      }
    })
    .catch((err) => {
      console.log(err);
      ableSelect(true);
      showFailed("url_fail");
    });
}

async function checkYoutubeVideo(taskId) {
  let time = 0;
  while (true) {
    try {
      const res = await postReq(`${requesHost}/ai/tool/get-task`, {
        id: taskId,
      });
      const message = res.message;
      if (message.includes("duration too long")) {
        gtag("event", "max_videotranslate_urlparse");
        ableSelect(true);
        showFailed("min_limit");
        $(".get_url_icon").removeClass("loading");
        return;
      }
      if (message.includes("filesize too big")) {
        gtag("event", "max_videotranslate_urlparse");
        ableSelect(true);
        showFailed("max");
        $(".get_url_icon").removeClass("loading");
        return;
      }
      if (message.includes("duration too short")) {
        gtag("event", "max_videotranslate_urlparse");
        ableSelect(true);
        showFailed("duration");
        $(".get_url_icon").removeClass("loading");
        return;
      }

      if (res.code !== 200) {
        time++;
        if (time >= 5) {
          ableSelect(true);
          showFailed("url_fail");
          $(".get_url_icon").removeClass("loading");
          return;
        }
      } else {
        time = 0
      }
      const status = res.data.status;
      if (status === 0) {
        handleYoutube(res.data);
        return;
      } else if (![0, -1, -2].includes(status)) {
        ableSelect(true);
        showFailed("url_fail");
        $(".get_url_icon").removeClass("loading");
        return;
      }
    } catch (error) {
      time++;
      if (time >= 5) {
        console.error(error, "error");
        ableSelect(true);
        if (!navigator.onLine) {
          showFailed('network')
        } else {
          showFailed("url_fail");
        }
        $(".get_url_icon").removeClass("loading");
        return;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
}

async function handleYoutube(data) {
  const { additional_data } = data;
  if (additional_data.min_duration > additional_data.duration) {
    showFailed("duration");
    return;
  }
  const video = document.getElementById("getLoadedDom_video2");
  video.src = additional_data.url;
  isYoutubeFileChange = true;
  video.addEventListener("loadedmetadata", async function () {
    const duration = video.duration;
    curYoutubeFile = additional_data.url;
    videoDuration2 = duration;
    tab_url2 = additional_data.url;
    tab_fileName2 = additional_data.title;
    tab_image2 = additional_data.thumbnail_url;
    tab_key2 = additional_data.key;
    $(".pre_img").attr("poster", tab_image2);
    $(".step_src_style2 .small_img").attr("src", tab_image2);
    if (tab2_defaultOriginLan.key && curTab === "tab2") {
      $(".translate_btn").addClass("active");
    }
    $(".pre_img").attr("src", tab_url2);
    $(".tra_box.step1").addClass("active2").removeClass("youtube");
    $(".step_src_style2 .video_info_title").text(tab_fileName2);
    $(".step_src_style2 .video_info_duration").text(
      videoTransText.video_info_duration.replace(
        "%s",
        formatTime(videoDuration2)
      )
    );
    $(".tra_left").removeClass("genertor upload translate").addClass("upload");
    $(".play_btn1").show();
    isTimeIconShow();
    ableSelect(true);
  });
  video.load();
}

function isTimeIconShow() {
  if (curTab === "tab1") {
    let timeText = getTranslateText('btn_credit', { val: getMins(videoDuration1) < 1 ? 1 : getMins(videoDuration1) }, true)

    $(".time_text").text(timeText);
  } else {
    let timeText = getTranslateText('btn_credit', { val: getMins(videoDuration2) < 1 ? 1 : getMins(videoDuration2) }, true)

    $(".time_text").text(timeText);
  }
  let creditsData = header_credit.getCreditsData();
  if (creditsData.is_credit_subscription === 1) {
    $(".time_icon_box").addClass("active");
    $("#free_show").hide();
  } else if (translateUseLimit >= translateLimit) {
    $(".time_icon_box").addClass("active");
    $("#free_show").hide();
  } else {
    $("#free_show").show();
    $(".time_icon_box").removeClass("active");
  }
}

function createTask() {
  if (defaultAble == 1) {
    gtag("event", "enable_videotranslate_subtitles");
  } else {
    gtag("event", "disable_videotranslate_subtitles");
  }
  if (defaultIsVideo == 1) {
    gtag("event", "all_videotranslate_video");
  } else {
    gtag("event", "only_videotranslate_audio");
  }
  let edit_taVideo_script, choose_country, defaultCountry;
  if (curTab === "tab1") {
    edit_taVideo_script = tab1_edit_taVideo_script;
    choose_country = tab1_choose_country;
    defaultCountry = tab1_defaultCountry;
  } else {
    edit_taVideo_script = tab2_edit_taVideo_script;
    choose_country = tab2_choose_country;
    defaultCountry = tab2_defaultCountry;
  }


  const data = {
    key: curTab === "tab1" ? urlObj.key : tab_key2,
    tts_config: defaultCountry.list_config[0].tts_config,
    is_subtitles: Number(defaultAble),
    is_lipsync: Number(defaultIsVideo),
    is_proofread_video_script: Number(defaultProofread),
    original_language:
      curTab === "tab1"
        ? tab1_defaultOriginLan?.key
        : tab2_defaultOriginLan?.key,
    duration: curTab === "tab1" ? videoDuration1 : videoDuration2,
    erase_original_subtitles: document.querySelector('.toggleSwitch2_1').checked ? 1 : 2
  };

  if (edit_taVideo_script.length > 0) {
    data.target_proofread_video_script = edit_taVideo_script;
  }

  postReq(
    `${requesHost}/ai/ai-tool/add-task`,
    { action: "credit_video_translate", param: data },
    { "X-TASK-VERSION": "2.0.0" }
  )
    .then((res) => {
      if (res.code === 200) {
        const taskId = res.data.task_id;
        if (
          !(choose_country?.country_name === defaultCountry?.country_name) &&
          defaultProofread == 1 &&
          edit_taVideo_script.length === 0
        ) {
          showProofread();
        }
        checkCreateVideo(taskId);
      } else if (res.code === 3002) {

        videoTransText.failed_des7 = videoTransText.failed_des7.replace(
          "%ss",
          res.message
        );
        translateLimit = res.message;
        translateUseLimit = translateLimit;
        isTimeIconShow();

        gtag("event", "alert_videotranslate_maxlimit");
        handleFaildReq("limit", "limit");
      } else if (res.code === 3015) {
        let headText;
        useMin = Number(res.message);
        const showHeadMin = getMins(useMin);
        if (showHeadMin <= 1) {
          if (document.body.clientWidth <= 1200) {
            headText = videoTransText.m_head_min2.replace("%s", showHeadMin);
          } else {
            headText = videoTransText.head_min2.replace("%s", showHeadMin);
          }
        } else {
          if (document.body.clientWidth <= 1200) {
            headText = videoTransText.m_head_min1.replace("%s", showHeadMin);
          } else {
            headText = videoTransText.head_min1.replace("%s", showHeadMin);
          }
        }
        $(".video_tra_head_text").html(headText);
        handleFaildReq("not_enough", "not_enough");
      } else if (res.code === 3008) {
        handleFaildReq("not_enough", "not_enough");
      } else {
        handleFaildReq("fail", "fail");
      }
    })
    .catch((err) => {
      console.log(err);
      handleFaildReq("network", "network");
    });
}

function getFileUrlRequest(fileURL) {
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", fileURL, true);
    xhr.send();
    xhr.addEventListener("readystatechange", processRequest, false);
    xhr.onerror = (err) => {
      console.log(err);
      handleFaildReq("network", "network");
    };
    function processRequest(e) {
      if (xhr.readyState == 2) {
        let fileSize = xhr.getResponseHeader("Content-Length");
        if (fileSize && fileSize / 1024 > 1) {
          resolve(true);
        } else {
          resolve(false);
        }
        xhr.abort();
      }
    }
  });
}

async function checkCreateVideo(taskId) {
  let time = 0;
  let edit_taVideo_script, choose_country;
  if (curTab === "tab1") {
    edit_taVideo_script = tab1_edit_taVideo_script;
    choose_country = tab1_choose_country;
    defaultCountry = tab1_defaultCountry;
  } else {
    edit_taVideo_script = tab2_edit_taVideo_script;
    choose_country = tab2_choose_country;
    defaultCountry = tab2_defaultCountry;
  }
  while (true) {
    try {
      const res = await postReq(`${requesHost}/ai/tool/get-task`, {
        id: taskId,
      });
      const message = res.message;
      if (message.includes("No default align-model for language:")) {
        handleFaildReq("videoLan", "videoLan_useTime");
        return;
      }
      if (
        message.includes("original audio speech to text fail") ||
        message.includes("no audio")
      ) {
        handleFaildReq("noAudio", "noAudio_useTime");
        return;
      }
      if (res.code !== 200) {
        time++;
        if (time >= 5) {
          handleFaildReq("fail", "fail_useTime");
          return;
        }
      } else {
        time = 0;
      }
      const status = res.data.status;
      if (status === 0) {
        if (
          !(choose_country?.country_name === defaultCountry?.country_name) &&
          defaultProofread == 1 &&
          edit_taVideo_script.length === 0
        ) {
          handleProofreadTask(res.data);
        } else {
          if (curTab === "tab1") {
            translateDownloadData = await setDownloadData(
              "video-translate",
              res
            );
          } else {
            translateDownloadDataY = await setDownloadData(
              "video-translate",
              res
            );
          }
          handleTask(res.data);
          gtag("event", "show_videotranslate_edit");
          if (curTab === "tab1") {
            upload_task_id = taskId;
            uploadVideoRes = res.data;
          } else {
            youtube_task_id = taskId;
            youtubeVideoRes = res.data;
          }
          translateUseLimit++;
        }
        await header_credit.updateInfo();
        await getT()
        isTimeIconShow();
        return;
      } else if (![0, -1, -2].includes(status)) {
        handleFaildReq("fail", "fail_useTime");
        return;
      }
    } catch (error) {
      time++;
      if (time >= 5) {
        console.error(error, "error");

        if (!navigator.onLine) {
          handleFaildReq("network", "network");
        } else {
          handleFaildReq("fail", "fail_useTime");
        }
        return;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
}

function handleTask(data) {
  clearInterval(timer);
  timer = null;
  $("#pre_video").attr("src", data.additional_data.video_url);
  $("#pre_video").attr("poster", data.additional_data.cover_url);
  $("#large_video").attr("src", data.additional_data.video_url);
  $("#large_video").attr("poster", data.additional_data.cover_url);
  let progress = Number($("#loading_progress").text()),
    final_timer;
  final_timer = setInterval(() => {
    progress += 1;
    $("#loading_progress").text(progress);
    if (progress >= 100) {
      progress = 100;
      clearInterval(final_timer);
      final_timer = null;
      ableSelect(true);
      $(".tra_left").removeClass("genertor upload").addClass("translate");
      $(".play_btn").show();
      $(".translate_btn_text").html(videoTransText.btn_tra1);
      $(".translate_btn").addClass("active");
      urlObj = null;
      if (curTab === "tab1") {
        isFileChange = false;
        tab1_orVideo_script = [];
        tab1_taVideo_script = [];
        tab1_edit_orVideo_script = [];
        tab1_edit_taVideo_script = [];
        tab1_originVal = "";
        tab1_currentVal = "";
        tab1_targetVal = "";
        tab1_choose_country = null;
      } else {
        isYoutubeFileChange = false;
        tab2_orVideo_script = [];
        tab2_taVideo_script = [];
        tab2_edit_orVideo_script = [];
        tab2_edit_taVideo_script = [];
        tab2_originVal = "";
        tab2_currentVal = "";
        tab2_targetVal = "";
        tab2_choose_country = null;
      }

      if (defaultIsVideo == "1") {
        if (contryT === "T1") {
          $(".tip_time").text(videoTransText.video_timeT1);
        } else if (contryT === "T2") {
          $(".tip_time").text(videoTransText.video_timeT2);
        } else {
          $(".tip_time").text(videoTransText.video_timeT3);
        }
      } else {
        if (contryT === "T1") {
          $(".tip_time").text(videoTransText.audio_timeT1);
        } else if (contryT === "T2") {
          $(".tip_time").text(videoTransText.audio_timeT2);
        } else {
          $(".tip_time").text(videoTransText.audio_timeT3);
        }
      }
      if (userinfo?.is_credit_subscription === 1) {
        let headText;
        useMin = data.available_duration;
        const showHeadMin = getMins(useMin);
        if (showHeadMin <= 1) {
          if (document.body.clientWidth <= 1200) {
            headText = videoTransText.m_head_min2.replace("%s", showHeadMin);
          } else {
            headText = videoTransText.head_min2.replace("%s", showHeadMin);
          }
        } else {
          if (document.body.clientWidth <= 1200) {
            headText = videoTransText.m_head_min1.replace("%s", showHeadMin);
          } else {
            headText = videoTransText.head_min1.replace("%s", showHeadMin);
          }
        }
        $(".video_tra_head_text").html(headText);
      }
      if (translateUseLimit >= translateLimit && userinfo?.is_credit_subscription !== 1) {
        $(".tip").hide();
        $("#free_show").hide();
        $("#p_free_show").hide();
        // if (document.body.clientWidth <= 1200) {
        //   $(".info_choose3 .info_box").css("top", "-1.82rem");
        //   $(".info_choose6 .info_box").css("top", "-1.82rem");
        // } else {
        //   $(".info_choose3 .info_box").css("top", "-91px");
        //   $(".info_choose6 .info_box").css("top", "-91px");
        // }
      }
      $(".upgrade_banner").show();
      gtag("event", "succ_videotranslate_btn");
    }
  }, 50);
}

function handleProofreadTask(data) {
  clearInterval(proofread_timer);
  proofread_timer = null;
  let progress = Number($(".proofread_loading").text()),
    final_timer;
  final_timer = setInterval(() => {
    progress += 1;
    $(".proofread_loading").text(progress);
    $(".loading_tip_progress").css("width", `${progress}%`);
    if (progress >= 100) {
      progress = 100;
      clearInterval(final_timer);
      final_timer = null;
      ableSelect(true);
      $(".proofread_content").removeClass("loading");
      if (curTab === "tab1") {
        isFileChange = true;
        tab1_choose_country = tab1_defaultCountry;
        tab1_orVideo_script =
          data.additional_data.origin_proofread_video_script.sort(
            (a, b) => a.index - b.index
          );
        tab1_taVideo_script =
          data.additional_data.target_proofread_video_script.sort(
            (a, b) => a.index - b.index
          );
        tab1_edit_orVideo_script = JSON.parse(
          JSON.stringify(tab1_orVideo_script)
        );
        tab1_edit_taVideo_script = JSON.parse(
          JSON.stringify(tab1_taVideo_script)
        );
        renderSubtitle(tab1_edit_orVideo_script, tab1_edit_taVideo_script);
      } else {
        isYoutubeFileChange = true;
        tab2_choose_country = tab2_defaultCountry;
        tab2_orVideo_script =
          data.additional_data.origin_proofread_video_script.sort(
            (a, b) => a.index - b.index
          );
        tab2_taVideo_script =
          data.additional_data.target_proofread_video_script.sort(
            (a, b) => a.index - b.index
          );
        tab2_edit_orVideo_script = JSON.parse(
          JSON.stringify(tab2_orVideo_script)
        );
        tab2_edit_taVideo_script = JSON.parse(
          JSON.stringify(tab2_taVideo_script)
        );
        renderSubtitle(tab2_edit_orVideo_script, tab2_edit_taVideo_script);
      }
      if (!$(".tra_left").attr('class').includes('translate')) {
        $(".tra_left")
          .removeClass("genertor upload translate")
          .addClass("upload");
      }
    }
  }, 50);
}

function renderSubtitle(originList, targetList) {
  const defaultOriginLan =
    curTab === "tab1" ? tab1_defaultOriginLan : tab2_defaultOriginLan;
  const defaultCountry =
    curTab === "tab1" ? tab1_defaultCountry : tab2_defaultCountry;
  $(".subtitle_content").html("");
  let html = `
	<div class="contry_info">
		<div class="contry_info_item origin">
			<img src="${defaultOriginLan.img_url}" />
			<div class="contry_info_item_name">${defaultOriginLan.name}</div>
		</div>
		<div class="contry_info_item target">
			<img src="${defaultCountry.img_url}" />
			<div class="contry_info_item_name">${defaultCountry.country_name}</div>
		</div>
	</div>
	`;
  targetList.forEach((item, i) => {
    const orItem = originList[i];
    html += `
		<div class="subtitle_item" data-index=${i}>
			<div class="subtitle_time" data-index=${i}>${item.stime}-${item.etime}</div>
			<div class="subtitle_text">
				<div class="subtitle_item_text origin">
					<label data-index=${i} class="label_box origin" for="origin_sub_${i}">${orItem.title}</label>
					<textarea data-index=${i} id="origin_sub_${i}" class="origin_input" spellcheck="false" autocomplete="off"></textarea>
				</div>
				<div class="subtitle_item_text target">
					<label data-index=${i} class="label_box target" for="target_sub_${i}">${item.title}</label>
					<textarea data-index=${i} id="target_sub_${i}" class="target_input" spellcheck="false" autocomplete="off"></textarea>
				</div>
			</div>
			<div class="subtitle_btn_box">
        <div class="cancel_btn" data-index=${i}>${videoTransText.btn_cancel}</div>
        <div class="save_btn" data-index=${i}>
          <div class="text">${videoTransText.btn_save}</div>
          <div class="icon"></div>
        </div>
      </div>
		</div>
		`;
  });

  $(".subtitle_content").html(html);

  $(".label_box").on("click", function () {
    const height = $(this).innerHeight();
    const originLabel = $(this).parent().parent().find(".label_box.origin");
    const targetLabel = $(this).parent().parent().find(".label_box.target");
    let otherHeight;
    if ($(this).hasClass("origin")) {
      otherHeight = targetLabel.innerHeight();
    } else {
      otherHeight = originLabel.innerHeight();
    }
    const finalHeight = otherHeight >= height ? otherHeight : height;
    $(this)
      .parent()
      .parent()
      .css("height", finalHeight + "px");
    originLabel.css("height", finalHeight + "px");
    targetLabel.css("height", finalHeight + "px");
    $(this).hide();
    const textInput = $(this).next();
    textInput.css("height", finalHeight + "px");
    textInput.val($(this).text());
    textInput.show();
  });

  $(".origin_input, .target_input").on("focus", function (e) {
    this.setSelectionRange(this.value.length, this.value.length);
    this.scrollTop = this.scrollHeight;
    $(".subtitle_item").addClass("disabled");
    $(this)
      .parent()
      .parent()
      .parent()
      .addClass("getfocus")
      .removeClass("disabled");
    const index = Number($(this).attr("data-index"));
    const curItem = targetList[index];
    const videoCur = getCurtime(curItem.stime);
    videoProof.currentTime = videoCur;
    if ($(this).hasClass("origin_input")) {
      if (curTab === "tab1") {
        tab1_originVal = e.target.value;
      } else {
        tab2_originVal = e.target.value;
      }
    } else {
      if (curTab === "tab1") {
        tab1_targetVal = e.target.value;
      } else {
        tab2_targetVal = e.target.value;
      }
    }
  });

  $(".origin_input, .target_input").on("input", function (e) {
    const index = Number($(this).attr("data-index"));
    let currentVal = e.target.value.trim();
    let maxLength, orVideo_script;
    if (curTab === "tab1") {
      tab1_currentVal = currentVal;
      orVideo_script = tab1_orVideo_script;
      taVideo_script = tab1_taVideo_script;
    } else {
      tab2_currentVal = currentVal;
      orVideo_script = tab2_orVideo_script;
      taVideo_script = tab2_taVideo_script;
    }

    if ($(this).hasClass("origin_input")) {
      maxLength = orVideo_script[index].title.trim().length * 2;
      if (currentVal.length >= maxLength) {
        currentVal = currentVal.substring(0, maxLength);
        $(this).val(currentVal);
      }
      const originVal = currentVal;
      if (curTab === "tab1") {
        tab1_originVal = originVal;
      } else {
        tab2_originVal = originVal;
      }
      if (originVal.trim() !== originList[index].title.trim()) {
        $(this)
          .parent()
          .parent()
          .parent()
          .find(".save_btn")
          .attr("data-origin", 1);
      }
    } else {
      maxLength = taVideo_script[index].title.trim().length * 3;
      if (currentVal.length >= maxLength) {
        currentVal = currentVal.substring(0, maxLength);
        $(this).val(currentVal);
      }
      const targetVal = currentVal;
      if (curTab === "tab1") {
        tab1_targetVal = targetVal;
      } else {
        tab2_targetVal = targetVal;
      }
      if (targetVal.trim() !== originList[index].title.trim()) {
        $(this)
          .parent()
          .parent()
          .parent()
          .find(".save_btn")
          .attr("data-target", 1);
      }
    }
  });

  $(".save_btn").on("click", async function () {
    gtag("event", "save_videotranslate_script");
    const defaultCountry =
      curTab === "tab1" ? tab1_defaultCountry : tab2_defaultCountry;
    const index = Number($(this).attr("data-index"));
    const oritem = originList[index];
    const taitem = targetList[index];
    const language = defaultCountry?.list_config[0]?.tts_config?.language;
    const originEdit = $(this).attr("data-origin");
    const targetEdit = $(this).attr("data-target");
    let originVal, targetVal;
    if (curTab === "tab1") {
      originVal = tab1_originVal;
      targetVal = tab1_targetVal;
    } else {
      originVal = tab2_originVal;
      targetVal = tab2_targetVal;
    }
    if (originEdit) {
      try {
        $(this).addClass("loading");
        const res = await postReq(`${Vidnoz_API}/ai/translation/text`, {
          to: language,
          text: originVal,
        });
        if (res.code === 200) {
          const { data } = res;
          const targetVal = data.translated;
          if (curTab === "tab1") {
            tab1_targetVal = targetVal;
          } else {
            tab2_targetVal = targetVal;
          }
          taitem.title = targetVal;
          oritem.title = originVal;
          $(this).parent().parent().find(".target_input").val(taitem.title);
          $(this)
            .parent()
            .parent()
            .find(".label_box.target")
            .text(taitem.title);
          $(this)
            .parent()
            .parent()
            .find(".label_box.origin")
            .text(oritem.title);
          ToolTip({
            text: videoTransText.save_suc,
          });
        } else {
          $(this).parent().parent().find(".origin_input").val(oritem.title);
          $(this).parent().parent().find(".target_input").val(taitem.title);
          ToolTip({
            text: videoTransText.save_fail,
            type: "error",
          });
        }
      } catch (error) {
        console.log(error);
        $(this).parent().parent().find(".origin_input").val(oritem.title);
        $(this).parent().parent().find(".target_input").val(taitem.title);
        ToolTip({
          text: videoTransText.save_fail,
          type: "error",
        });
      } finally {
        $(this).removeClass("loading");
      }
    } else if (targetEdit) {
      if (targetVal) {
        taitem.title = targetVal;
        ToolTip({
          text: videoTransText.save_suc,
        });
      } else {
        $(this).parent().parent().find(".origin_input").val(oritem.title);
        $(this).parent().parent().find(".target_input").val(taitem.title);
        ToolTip({
          text: videoTransText.save_fail,
          type: "error",
        });
      }
    }
    $(this).removeAttr("data-origin");
    $(this).removeAttr("data-target");
    $(".subtitle_item").removeClass("disabled getfocus");
    currentVal = "";
    if (curTab === "tab1") {
      tab1_currentVal = currentVal;
    } else {
      tab2_currentVal = currentVal;
    }
  });

  $(".cancel_btn").on("click", function () {
    gtag("event", "cancel_videotranslate_script");
    const index = Number($(this).attr("data-index"));
    const oritem = originList[index];
    const taitem = targetList[index];
    $(".subtitle_item").removeClass("disabled getfocus");
    currentVal = "";
    $(this).parent().parent().find(".origin_input").val(oritem.title);
    $(this).parent().parent().find(".target_input").val(taitem.title);
    $(this).parent().parent().find(".label_box.origin").text(oritem.title);
    $(this).parent().parent().find(".label_box.target").text(taitem.title);
    $(this).next().removeAttr("data-origin");
    $(this).next().removeAttr("data-target");
  });

  $(".bottom_content_btn")
    .off("click")
    .on("click", function () {
      gtag("event", "download_videotranslate_script");
      downloadSRT(targetList);
    });
}

function getCurtime(duation) {
  const timePattern = /^(\d{2}):(\d{2}):(\d{2}),(\d{3})$/;
  const match = duation.match(timePattern);
  if (!match) {
    return 0;
  }
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const seconds = parseInt(match[3], 10);

  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  return totalSeconds;
}

function downloadSRT(targetList) {
  const defaultOriginLan =
    curTab === "tab1" ? tab1_defaultOriginLan : tab2_defaultOriginLan;
  const defaultCountry =
    curTab === "tab1" ? tab1_defaultCountry : tab2_defaultCountry;
  let str = "";
  targetList.forEach((item) => {
    str += `${item.index}\n${item.stime} --> ${item.etime}\n${item.title}\n\n`;
  });
  str = str.trim();
  const blob = new Blob([str], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${defaultOriginLan.name}_to_${defaultCountry?.country_name}.srt`;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

function downLoadProgress(url, name) {
  // let progress = 0;
  return new Promise((resolve, reject) => {
    isDownload = true;
    const a = document.createElement("a");
    a.download = name;
    a.href = url;
    a.click();
    a.remove();
    resolve();
  });
}


async function downloadLocal() {
  if (!isDownload) {
    $(".progress_container .progress").css({
      width: '0',
      transition: 'none'
    })
    setTimeout(() => {
      $(".progress_container .progress").css({
        transition: 'width 5s',
        width: '99%'
      })
    }, 20)
    showTip("progress");
    // let nowKey = uploadVideoRes.additional_data?.video_key;

    let nowKey =
      curTab === "tab1" ? uploadVideoRes.additional_data.video_key : youtubeVideoRes.additional_data.video_key
    postReq(`${requesHost}/ai/source/get-access-url`, {
      key: nowKey,
      file_name: `Vidqu_videotranslator.${nowKey.split(".")[1]}`,
      action: "download"
    }).then((res) => {
      if (res.code === 200) {
        removeAllDownDisabled();
        getFileUrlRequest(res.data.url).then(bool => {
          if (bool) {
            downLoadProgress(
              res.data.url,
              `Vidqu_videotranslator.${nowKey.split(".")[1]}`
            ).then(() => {
              closeTip();
              showTip("suc");
              gtag("event", "dwsucc_videotranslate_res");
              isDownload = false;
              $(".progress_container .progress").css({
                transition: 'none'
              })
            });
          } else {
            removeAllDownDisabled();
            isDownload = false;
            closeTip();
            // showFailed("download_file");
            showFailed("download_file2");

          }
        });
      } else {
        removeAllDownDisabled();
        isDownload = false;
        closeTip();
        showFailed("download_file");
      }
    }).catch((err) => {
      removeAllDownDisabled();
      isDownload = false;
      closeTip();
      showFailed("download_file");
    });
  } else {
    removeAllDownDisabled();
    showTip("progress");
  }
}

async function handleDownload() {
  downloadLocal();
  return;
}

function demoDownload(url) {
  gtag("event", "dw_videotranslate_demo");
  const download_a = document.createElement("a");
  download_a.href = url;
  (document.body || document.documentElement).appendChild(download_a);
  download_a.click();
  download_a.remove();
}

function renderDemo(list) {
  let html = "";
  list.forEach((item, index) => {
    let demoVideoEl = isMobileDevice()
      ? `
    <video src="${item.video_url}" id="demoVideoEl_${index}" class="mobile_demo_video"></video>
    `
      : "";
    html += `
    <div class="demo_item" data-index="${index}">
      <div class="img_box">
        <img class="cover_img" src="${item.cover_url}" />
        <div class="demo_downicon">
          <div class="downicon" data-index="${index}"></div>
        </div>
        <div class="demo_icon"></div>
        <div class="demo_duration">${formatTime(item.duration)}</div>
        <img class="demo_country" src="${item.img_url}" />
      </div>
      <div class="demo_name">${item.name}</div>
      <div class="demo_time">${item.create_at}</div>
      ${demoVideoEl}
    </div>
    `;
  });

  $(".demo_box").html(html);
  $(".demo_item").on("click", function () {
    const index = Number($(this).attr("data-index"));
    const item = demoList[index];
    if (isMobileDevice()) {
      mobileShowDemo(item, index);
    } else {
      showDemo(index, item);
    }
  });

  $(".downicon").on("click", function (e) {
    e.stopPropagation();
    const index = Number($(this).attr("data-index"));
    const item = demoList[index];
    demoDownload(item.video_url);
  });
}

function mobileShowDemo(item, index) {
  const video = document.getElementById("demoVideoEl_" + index);
  video.play();
  if (video.requestFullscreen) {
    video.requestFullscreen();
  } else if (video.mozRequestFullScreen) {
    video.mozRequestFullScreen();
  } else if (video.webkitRequestFullscreen) {
    video.webkitRequestFullscreen();
  } else if (video.msRequestFullscreen) {
    video.msRequestFullscreen();
  }
  document.addEventListener("fullscreenchange", handleFullscreenChange);
  document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
  document.addEventListener("mozfullscreenchange", handleFullscreenChange);
  document.addEventListener("MSFullscreenChange", handleFullscreenChange);
  function handleFullscreenChange() {
    if (
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    ) {
      // 进入全屏
    } else {
      // 退出全屏状态
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange
      );
      video.pause();
    }
  }
}

async function isUseMin() {
  try {
    const res = await getReq(`${requesHost}/ai/user-usage/is-giveaway`);
    if (res.code === 200) {
      if (res.data.is_giveaway == 2) {
        isUse = true;
      } else {
        isUse = false;
      }
    } else if (res.code === 401) {
      localStorage.clear();
      setCookie("refresh_token", "", -1);
      setCookie("access_token", "", -1);
      setCookie("user_info", "", -1);
      location.reload();
    }
  } catch (error) {
    console.log(error);
  }
}

function changeUpgradeInfo() {
  let headText, title, btnText, bannerTitle, bannerBtnText;
  userinfo = header_credit.getCreditsData();
  if (userinfo?.is_credit_subscription !== 1) {
    headMin = 0;
  }
  if (headMin <= 1) {
    if (document.body.clientWidth <= 1200) {
      headText = videoTransText.m_head_min2.replace("%s", headMin);
    } else {
      headText = videoTransText.head_min2.replace("%s", headMin);
    }
  } else {
    if (document.body.clientWidth <= 1200) {
      headText = videoTransText.m_head_min1.replace("%s", headMin);
    } else {
      headText = videoTransText.head_min1.replace("%s", headMin);
    }
  }

  $(".user_menu_item.list_credits").hide();
  const html = `
		<div class="video_tra_head_icon1"></div>
		<div class="video_tra_head_text">${headText}</div>
		<div class="video_tra_head_icon2"></div>
	`;
  $(".credit-box .nav_title").html(html);
  $(".credit_des_q").text(videoTransText.head_min_q);
  $(".credit_des_a").text(videoTransText.head_min_a);

  if (userinfo?.is_credit_subscription === 1) {
    gtag("event", "show_videotranslate_probanner");
    $(".upgrade_banner_item.item5").hide();
    if (isUse) {
      title = videoTransText.head_min_title3;
      btnText = videoTransText.head_min_btn3;
      bannerBtnText = videoTransText.upgrade_btn_pro_use;
      bannerTitle = videoTransText.upgrade_title_pro_use;
    } else {
      title = videoTransText.head_min_title2;
      btnText = videoTransText.head_min_btn2;
      bannerBtnText = videoTransText.upgrade_btn_pro_nouse;
      bannerTitle = videoTransText.upgrade_title_pro_nouse;
    }
    $(document.body).addClass('is_credit_subscription');
    $(".upload_text .des").html(videoTransText.upload_des_ios_pro);
  } else {
    $(document.body).removeClass('is_credit_subscription')
    $(".upload_text .des").html(videoTransText.upload_des_ios);
    gtag("event", "show_videotranslate_freebanner");
    $(".upgrade_banner_item.item5").show();
    title = videoTransText.head_min_title1;
    btnText = videoTransText.head_min_btn1;
    bannerBtnText = videoTransText.upgrade_btn_free;
    bannerTitle = videoTransText.upgrade_title_free;
  }

  const giveawayText = getGiveAwayText(
    videoTransText.head_min_item3_one,
    videoTransText.head_min_item3
  );

  const desHtml = `
			<div class="credit_des_bg_title">${title}</div>
			<div class="credit_des_bg_item">
          <div class="credit_des_bg_item">${videoTransText.head_min_item1}</div>
          <div class="credit_des_bg_item">${videoTransText.head_min_item2}</div>
          <div class="credit_des_bg_item">${giveawayText}</div>
          <div class="credit_des_bg_item">${videoTransText.head_min_item4}</div>
      </div>
			<a href="/pricing.html" id="videotranslate_pro" onclick="linkClick()" target="_blank" class="get_btn">${btnText}</a>
	`;
  $(".credit_des_bg_content").html(desHtml);
  $(".upgrade_banner_title").text(bannerTitle);
  $(".upgrade_banner_btn").text(bannerBtnText);
  if (document.body.clientWidth <= 1200) {
    $(".header-credits-box .credit_des_bg").css({
      borderRadius: ".34rem",
      background: "linear-gradient(111deg, #FFF6D9 0%, #FFEFE8 100%) 0% 0%",
    });
    $("#m_list_credits").hide();
    $(".credit_des_bg_icon").show();
    $(".header-credits").html(html);
  }
}

function linkClick() {
  if (userinfo?.is_credit_subscription === 1) {
    if (isUse) {
      gtag("event", "click_videotranslate_progetbtnused");
      setCookie("st", "translator_progettimeused");
    } else {
      gtag("event", "click_videotranslate_progetbtn");
      setCookie("st", "translator_progettime");
    }
  } else {
    gtag("event", "click_videotranslate_freegetbtn");
    setCookie("st", "translator_freegettime");
  }
}

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

function handleProofreadBar(e) {
  let rate = e.target.value / 100;
  videoProof.currentTime = videoProof.duration * rate;
  updateProgress();
}

function updateProgress() {
  const sliderTime = (videoProof.currentTime / videoProof.duration) * 100 || 0;
  let curDuration, totalDuation;
  if (curTab === "tab1") {
    totalDuation = videoProof.duration
      ? formatTime(videoProof.duration)
      : formatTime(videoDuration1);
  } else {
    totalDuation = videoProof.duration
      ? formatTime(videoProof.duration)
      : formatTime(videoDuration2);
  }

  curDuration = formatTime(videoProof.currentTime);
  if (hasHH(totalDuation) && !hasHH(curDuration)) {
    curDuration = "00:" + curDuration;
  }
  $(".duration_show").html(`${curDuration}/${totalDuation}`);
  progressbar.style.backgroundSize = `${sliderTime}% 100%`;
  progressbar.value = sliderTime;
}

function handleVoiceBar(e) {
  $(".voice_num").html(Math.round(e.target.value));
  videoProof.volume = e.target.value / 100;
  voicebar.style.backgroundSize = `${e.target.value}% 100%`;
}

function getGiveAwayText(text1, text2) {
  let textRes;
  if (giveawayMin <= 1) {
    textRes = text1.replace("%s", giveawayMin);
  } else {
    textRes = text2.replace("%s", giveawayMin);
  }
  return textRes;
}

async function initPage(isFirst) {
  // await getT();
  // await getContry();

  // return;
  ableSelect(false);
  $("#origin_lan").attr("placeholder", videoTransText.original_lan);
  await getT();
  if (isFirst) {
    await getContry();
    ableClick();
    isVideoClick();
    proofreadClick();
    $(".home-header .appsigninbtn").attr(
      "product-position",
      "isTool-no-reloading"
    );
    if (isMobileDevice() && isIOSBelowx(15)) {
      $(".proofread_content").css("paddingBottom", "3rem");
    }
    if (isSafari() || isIOS() || isMacOS()) {
      $(".video_upload_input").attr("accept", ".m4v, .mp4, .mov");
      $(".upload_text .des").html(videoTransText.upload_des_ios);
    }
    $("#Login").click(() => {
      gtag("event", "login_videotranslate_header");
    });
    $("#SignUp").click(() => {
      gtag("event", "signup_videotranslate_header");
    });
    $(".signupfootbtn").attr(
      "onclick",
      'gtag("event", "signup_videotranslate_footer")'
    );
  }
  if (curUploadFile || curYoutubeFile) {
    isTimeIconShow();
  }
  if (uploadVideoRes || youtubeVideoRes) {
    isTimeIconShow();
  }
  const upgrade_item3_text = getGiveAwayText(
    videoTransText.upgrade_item3_one,
    videoTransText.upgrade_item3
  );
  $(".upgrade_banner_item.item3").text(upgrade_item3_text);

  curToken = getCookie("access_token") || "";
  if (!curToken) {
    gtag("event", "open_videotranslate_page");
  } else {
    await isUseMin();
    $(".head-portrait .appsigninbtn").click(function (e) {
      e.stopPropagation();
      e.preventDefault();
    });
    // showCreditBox(); 显示header金币
    changeUpgradeInfo();
  }

  if (userinfo?.is_credit_subscription === 1) {
    $(".upgrade_banner").show();
  } else {
    if (translateUseLimit > 0) {
      $(".upgrade_banner").show();
    } else {
      $(".upgrade_banner").hide();
    }
  }
  ableSelect(true);
}

async function setHoverInfoTime(userinfo) {
  if (userinfo?.is_credit_subscription !== 1) {
    if (defaultIsVideo == "1") {
      if (contryT === "T1") {
        $(".info_time").text(videoTransText.video_timeT1);
        $(".tip_time").text(videoTransText.video_timeT1);
      } else if (contryT === "T2") {
        $(".info_time").text(videoTransText.video_timeT2);
        $(".tip_time").text(videoTransText.video_timeT2);
      } else {
        $(".info_time").text(videoTransText.video_timeT3);
        $(".tip_time").text(videoTransText.video_timeT3);
      }
    } else {
      if (contryT === "T1") {
        $(".info_time").text(videoTransText.audio_timeT1);
        $(".tip_time").text(videoTransText.audio_timeT1);
      } else if (contryT === "T2") {
        $(".info_time").text(videoTransText.audio_timeT2);
        $(".tip_time").text(videoTransText.audio_timeT2);
      } else {
        $(".info_time").text(videoTransText.audio_timeT3);
        $(".tip_time").text(videoTransText.audio_timeT3);
      }
    }
    $("#free_show").show();
  } else {
    $(".tip").hide();
    if (translateUseLimit < translateLimit) {
      $("#free_show").show();
    } else {
      $("#free_show").hide();
    }
    $("#p_free_show").hide();
    // if (document.body.clientWidth <= 1200) {
    //   $(".info_choose3 .info_box").css("top", "-1.82rem");
    //   $(".info_choose6 .info_box").css("top", "-1.82rem");
    // } else {
    //   $(".info_choose3 .info_box").css("top", "-91px");
    //   $(".info_choose6 .info_box").css("top", "-91px");
    // }
  }
}


$(function () {
  ableSelect(false);
  $(".demo_video").hide();
  if (isSafari() || isIOS() || isMacOS()) {
    $(".video_upload_input").attr("accept", ".m4v, .mp4, .mov");
    $(".upload_text .des").html(videoTransText.upload_des_ios);
  }
  let header_credit = document.querySelector('header-credit');
  header_credit.addEventListener('creditsLoad', function () {
    initPage(true);
  }, { once: true })
});
$(function () {
  window.videoDom = document.querySelector("#pre_video");
  window.videoLargeDom = document.querySelector("#large_video");
  window.videoDemo = document.querySelector("#demo_video");
  window.videoPre = document.querySelector(".pre_img");
  window.videoProof = document.querySelector(".proofread_video");
  window.progressbar = document.querySelector(".progressbar");
  window.voicebar = document.querySelector(".voicebar");

  getUserinfo().then(county_type_data => {
    contryT = county_type_data.county_type;
    setHoverInfoTime(county_type_data)
    userinfo = county_type_data
  })
  $('#header_login').click(() => {
    gtag('event', 'login_videotranslate_header')
  })
  $('#header_user>.signout').click(() => {
    gtag("event", "click_videotranslate_profileoutbtn");
  })
  $('#header_user').on('mouseenter', () => {
    gtag("event", "show_videotranslate_profilepop");
  })
  $(".signout").click(() => {
    // 退出登录了
    setTimeout(() => {
      // 等待cookie被清空，
      location.reload()
    }, 50);
  });

  progressbar.addEventListener("input", function (e) {
    handleProofreadBar(e);
  });

  voicebar.addEventListener(
    "input",
    function (e) {
      e.stopPropagation();
      handleVoiceBar(e);
    },
    false
  );

  videoProof.addEventListener("timeupdate", function () {
    updateProgress();
  });

  videoProof.addEventListener("ended", function () {
    $(".playpause_box").removeClass("pause");
  });

  videoDom.addEventListener("click", function () {
    if (!videoDom.paused) {
      videoDom.pause();
      $(".play_btn").show();
    }
  });

  videoDom.addEventListener("ended", function () {
    videoDom.currentTime = 0;
    $(".play_btn").show();
  });

  videoDom.addEventListener("waiting", function () {
    $(".video_loading_icon").show();
    videoDom.onprogress = function () {
      if (videoDom.buffered.length > 0) {
        const bufferedEnd = videoDom.buffered.end(0);
        if (bufferedEnd - videoDom.currentTime > 1) {
          $(".video_loading_icon").hide();
        }
      }
    };
  });

  videoDom.addEventListener("playing", function () {
    $(".video_loading_icon").hide();
  });

  if (isMobileDevice()) {
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible") {
        // 页面变为可见状态
      } else {
        videoDom.pause();
        videoPre.pause();
      }
    });
    videoDom.setAttribute("controls", "controls");
    videoPre.setAttribute("controls", "controls");
    function videoFullscreen(video) {
      if (video.requestFullscreen) {
        video.requestFullscreen();
      } else if (video.mozRequestFullScreen) {
        video.mozRequestFullScreen();
      } else if (video.webkitRequestFullscreen) {
        video.webkitRequestFullscreen();
      } else if (video.msRequestFullscreen) {
        video.msRequestFullscreen();
      }
    }
    function handleFullscreenChange() {
      if (
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      ) {
        // 进入全屏
      } else {
        // 退出全屏状态
        videoDom.pause();
        videoPre.pause();
      }
    }
    videoDom.addEventListener("play", function () {
      $(".play_btn").hide();
      videoFullscreen(videoDom);
    });
    videoDom.addEventListener("pause", function () {
      $(".play_btn").show();
    });
    videoPre.addEventListener("pause", function () {
      // videoPre.currentTime = 0
      $(".play_btn1").show();
    });
    videoPre.addEventListener("play", function () {
      $(".play_btn1").hide();
      videoFullscreen(videoPre);
    });
  }

  videoPre.addEventListener("click", function () {
    if (!videoPre.paused) {
      videoPre.pause();
      $(".play_btn1").show();
    }
  });

  videoPre.addEventListener("ended", function () {
    videoPre.currentTime = 0;
    $(".play_btn1").show();
  });

  videoLargeDom.addEventListener("click", function () {
    if (!videoLargeDom.paused) {
      videoLargeDom.pause();
      $(".large_play_icon").show();
    }
  });

  videoLargeDom.addEventListener("ended", function () {
    videoLargeDom.currentTime = 0;
    $(".large_play_icon").show();
  });

  videoLargeDom.addEventListener("waiting", function () {
    $(".largeVideo_loading_icon").show();
    videoLargeDom.onprogress = function () {
      if (videoLargeDom.buffered.length > 0) {
        const bufferedEnd = videoLargeDom.buffered.end(0);
        if (bufferedEnd - videoLargeDom.currentTime > 1) {
          $(".largeVideo_loading_icon").hide();
        }
      }
    };
  });

  videoLargeDom.addEventListener("playing", function () {
    $(".largeVideo_loading_icon").hide();
  });

  videoDemo.addEventListener("click", function () {
    if (!videoDemo.paused) {
      videoDemo.pause();
      $(".demo_play_icon").show();
    }
  });

  videoDemo.addEventListener("ended", function () {
    videoDemo.currentTime = 0;
    $(".demo_play_icon").show();
  });

  $(".play_btn").on("click", function () {
    if (videoDom.paused) {
      videoDom.play();
      if (isMobileDevice()) {
        let video = videoDom;
        if (video.requestFullscreen) {
          video.requestFullscreen();
        } else if (video.mozRequestFullScreen) {
          video.mozRequestFullScreen();
        } else if (video.webkitRequestFullscreen) {
          video.webkitRequestFullscreen();
        } else if (video.msRequestFullscreen) {
          video.msRequestFullscreen();
        }
      }
      $(this).hide();
    }
  });

  $(".play_btn1").on("click", function () {
    if (videoPre.paused) {
      videoPre.play();
      $(this).hide();
    }
  });

  $(".large_play_icon").on("click", function () {
    if (videoLargeDom.paused) {
      videoLargeDom.play();
      $(this).hide();
    }
  });

  $(".demo_play_icon").on("click", function () {
    gtag("event", "play_videotranslate_demo");
    if (videoDemo.paused) {
      videoDemo.play();
      $(this).hide();
    }
  });

  const input = $(".video_upload_input");

  input.on("change", function (e) {
    const file = input[0].files[0];
    uploadFile(file);
    setTimeout(() => {
      input[0].value = "";
    }, 500);
  });

  $(".step_src_none, .step_src_style1").on("click", function () {
    gtag("event", "click_videotranslate_upload");
    input.click();
  });

  $(".tra_box.step1").on("dragover", (e) => {
    e.preventDefault();
    e.stopPropagation();
  });

  $(".step_src_none, .step_src_style1").on("dragover", (e) => {
    e.preventDefault();
    e.stopPropagation();
    $(".tra_box.step1").addClass("drag");
  });

  $(".step_src_none, .step_src_style1").on("dragleave", function (e) {
    e.preventDefault();
    e.stopPropagation();
    $(".tra_box.step1").removeClass("drag");
  });

  $(".step_src_none, .step_src_style1").on("drop", function (e) {
    e.preventDefault();
    e.stopPropagation();
    gtag("event", "drag_videotranslate_upload");
    $(".tra_box.step1").removeClass("drag");
    if (e.originalEvent.dataTransfer.files.length > 1) {
      showFailed("only_one_drag");
      return;
    }
    let file = e.originalEvent.dataTransfer.files[0];
    uploadFile(file);
  });

  $(".step_tab").on("click", function () {
    $(".step_tab").removeClass("active");
    $(".step1").removeClass("youtube active1 active2");
    $(".translate_btn").removeClass("active");
    $(this).addClass("active");

    if ($(this).hasClass("tab1")) {
      gtag("event", "click_videotranslate_videotab");
      $(".step1").removeClass("youtube");
      curTab = "tab1";
      $(".play_btn").hide();
      $(".play_btn1").hide();
      if (youtubeVideoRes) {
        videoDom.duration = 0;
        videoDom.pause();
      }
      if (curYoutubeFile) {
        videoPre.duration = 0;
        videoPre.pause();
      }
      if (uploadVideoRes && !isFileChange) {
        let timeText = getTranslateText('btn_credit', { val: getMins(videoDuration1) < 1 ? 1 : getMins(videoDuration1) }, true)
        videoDom.duration = 0;
        videoDom.pause();
        isTimeIconShow();
        $("#pre_video").attr("src", uploadVideoRes.additional_data.video_url);
        $("#pre_video").attr(
          "poster",
          uploadVideoRes.additional_data.cover_url
        );
        $("#large_video").attr("src", uploadVideoRes.additional_data.video_url);
        $("#large_video").attr(
          "poster",
          uploadVideoRes.additional_data.cover_url
        );
        $(".play_btn").show();
        $(".time_text").text(timeText);
        $(".pre_img").attr("src", tab_url1);
        $(".pre_img").attr("poster", tab_image1);
        $(".step_src_style1 .small_img").attr("src", tab_image1);
        $(".step_src_style1 .video_info_title").text(curUploadFile.name);
        $(".step_src_style1 .video_info_duration").text(
          videoTransText.video_info_duration.replace(
            "%s",
            formatTime(videoDuration1)
          )
        );
        $(".tra_box.step1").addClass("active1");
        $(".tra_left")
          .removeClass("genertor upload translate")
          .addClass("translate");
        if (tab1_defaultOriginLan.key) {
          $(".translate_btn").addClass("active");
        } else {
          $(".translate_btn").removeClass("active");
        }
      } else if (curUploadFile) {
        let timeText = getTranslateText('btn_credit', { val: getMins(videoDuration1) < 1 ? 1 : getMins(videoDuration1) }, true)
        isTimeIconShow();
        $(".play_btn1").show();
        $(".time_text").text(timeText);
        $(".pre_img").attr("src", tab_url1);
        $(".pre_img").attr("poster", tab_image1);
        $(".step_src_style1 .small_img").attr("src", tab_image1);
        $(".step_src_style1 .video_info_title").text(curUploadFile.name);
        $(".step_src_style1 .video_info_duration").text(
          videoTransText.video_info_duration.replace(
            "%s",
            formatTime(videoDuration1)
          )
        );
        $(".tra_box.step1").addClass("active1");
        $(".tra_left")
          .removeClass("genertor upload translate")
          .addClass("upload");
        if (tab1_defaultOriginLan.key) {
          $(".translate_btn").addClass("active");
        } else {
          $(".translate_btn").removeClass("active");
        }
      } else {
        $(".play_btn1").hide();
        $(".translate_btn").removeClass("active");
        $(".tra_box.step1").removeClass("active1");
        $(".tra_left").removeClass("genertor upload translate");
        $(".time_icon_box").removeClass("active");

        if (translateUseLimit < translateLimit || userinfo?.is_credit_subscription !== 1) {
          $("#free_show").show();
        } else {
          $("#free_show").hide();
        }
      }
      const countryListItem = document
        .querySelector(".select_box.selectContry")
        .querySelectorAll(".select_item");
      clearListitemActive(countryListItem);
      $(`[data-name="${tab1_defaultCountry.country_name}"]`).addClass("active");
      setDefaultCountryInfo({
        flag: null,
        text: tab1_defaultOriginLan.name,
        className: "origin_contry",
      });
      setDefaultCountryInfo({
        flag: tab1_defaultCountry.img_url,
        text: tab1_defaultCountry.country_name,
        className: "contry_name",
      });
    } else {
      gtag("event", "click_videotranslate_urltab");
      $(".step1").addClass("youtube");
      curTab = "tab2";
      $(".play_btn").hide();
      $(".play_btn1").hide();
      if (uploadVideoRes) {
        videoDom.duration = 0;
        videoDom.pause();
      }
      if (curUploadFile) {
        videoPre.duration = 0;
        videoPre.pause();
      }
      if (youtubeVideoRes && !isYoutubeFileChange) {
        let timeText = getTranslateText('btn_credit', { val: getMins(videoDuration2) < 1 ? 1 : getMins(videoDuration2) }, true)
        isTimeIconShow();
        $("#pre_video").attr("src", youtubeVideoRes.additional_data.video_url);
        $("#pre_video").attr(
          "poster",
          youtubeVideoRes.additional_data.cover_url
        );
        $("#large_video").attr(
          "src",
          youtubeVideoRes.additional_data.video_url
        );
        $("#large_video").attr(
          "poster",
          youtubeVideoRes.additional_data.cover_url
        );
        $(".play_btn").show();
        $(".time_text").text(timeText);
        $(".pre_img").attr("src", tab_url2);
        $(".pre_img").attr("poster", tab_image2);
        $(".step_src_style2 .small_img").attr("src", tab_image2);
        $(".step_src_style2 .video_info_title").text(curYoutubeFile.name);
        $(".step_src_style2 .video_info_duration").text(
          videoTransText.video_info_duration.replace(
            "%s",
            formatTime(videoDuration2)
          )
        );
        $(".tra_box.step1").addClass("active2").removeClass("youtube");
        $(".tra_left")
          .removeClass("genertor upload translate")
          .addClass("translate");
        if (tab2_defaultOriginLan.key) {
          $(".translate_btn").addClass("active");
        } else {
          $(".translate_btn").removeClass("active");
        }
      } else if (curYoutubeFile) {
        let timeText = getTranslateText('btn_credit', { val: getMins(videoDuration2) < 1 ? 1 : getMins(videoDuration2) }, true)
        isTimeIconShow();
        $(".play_btn1").show();
        $(".time_text").text(timeText);
        $(".pre_img").attr("src", tab_url2);
        $(".pre_img").attr("poster", tab_image2);
        $(".step_src_style2 .small_img").attr("src", tab_image2);
        $(".step_src_style2 .video_info_title").text(tab_fileName2);
        $(".step_src_style2 .video_info_duration").text(
          videoTransText.video_info_duration.replace(
            "%s",
            formatTime(videoDuration2)
          )
        );
        $(".tra_box.step1").addClass("active2").removeClass("youtube");
        $(".tra_left")
          .removeClass("genertor upload translate")
          .addClass("upload");
        if (tab2_defaultOriginLan.key) {
          $(".translate_btn").addClass("active");
        } else {
          $(".translate_btn").removeClass("active");
        }
      } else {
        $(".play_btn1").hide();
        $(".tra_box.step1").removeClass("active");
        $(".translate_btn").removeClass("active2");
        $(".tra_left").removeClass("genertor upload translate");
        $(".time_icon_box").removeClass("active");

        if (translateUseLimit < translateLimit || userinfo?.is_credit_subscription !== 1) {
          $("#free_show").show();
        } else {
          $("#free_show").hide();
        }
      }
      const countryListItem = document
        .querySelector(".select_box.selectContry")
        .querySelectorAll(".select_item");
      clearListitemActive(countryListItem);
      $(`[data-name="${tab2_defaultCountry.country_name}"]`).addClass("active");
      setDefaultCountryInfo({
        flag: null,
        text: tab2_defaultOriginLan.name,
        className: "origin_contry",
      });
      setDefaultCountryInfo({
        flag: tab2_defaultCountry.img_url,
        text: tab2_defaultCountry.country_name,
        className: "contry_name",
      });
    }
  });

  $(".back_icon").on("click", function () {
    gtag("event", "back_videotranslate_script");
    closeProofread();
  });

  $(".playpause_box").on("click", function (e) {
    if ($(".playpause_box").hasClass("pause")) {
      $(".playpause_box").removeClass("pause");
      videoProof.pause();
    } else {
      $(".playpause_box").addClass("pause");
      videoProof.play();
    }
  });

  $(".voice_icon").on("click", function (e) {
    e.stopPropagation();
    if ($(".voice_box").hasClass("active")) {
      $(".voice_box").removeClass("active");
    } else {
      $(".voice_box").addClass("active");
    }
  });

  $(".input_url").on("input", function (e) {
    const val = e.target.value.trim();
    if (val) {
      $(".input_box").addClass("oninput");
      youtubeUrl = val;
    } else {
      $(".input_box").removeClass("oninput");
    }
  });

  $(".delete_icon").on("click", function (e) {
    e.stopPropagation();
    $(".step1").removeClass("active1 active2");
    $(".translate_btn").removeClass("active");
    $(".pre_img").attr("src", "");
    $(".pre_img").attr("poster", "");
    $(".play_btn1").hide();
    $("#pre_video").attr("src", "");

    $(".tra_left").removeClass("genertor upload translate");
    $(".time_icon_box").removeClass("active");

    if (userinfo?.is_credit_subscription !== 1) {
      $("#free_show").show();
    } else {
      $("#free_show").hide();
    }
    if (curTab === "tab1") {
      videoDuration1 = "";
      tab_image1 = "";
      tab_url1 = "";
      curUploadFile = "";
      uploadVideoRes = "";
      tab1_orVideo_script = [];
      tab1_taVideo_script = [];
      tab1_edit_orVideo_script = [];
      tab1_edit_taVideo_script = [];
      tab1_currentVal = "";
      tab1_originVal = "";
      tab1_targetVal = "";
      tab1_choose_country = null;
      $("step_src_style1 .small_img").attr("src", "");
    } else {
      videoDuration2 = "";
      tab_image2 = "";
      tab_url2 = "";
      curYoutubeFile = "";
      youtubeVideoRes = "";
      tab2_orVideo_script = [];
      tab2_taVideo_script = [];
      tab2_edit_orVideo_script = [];
      tab2_edit_taVideo_script = [];
      tab2_currentVal = "";
      tab2_originVal = "";
      tab2_targetVal = "";
      tab2_choose_country = null;
      $(".input_url").val("");
      $("step_src_style2 .small_img").attr("src", "");
      $(".step1").addClass("youtube");
      $(".input_box").removeClass("oninput");
    }
  });

  $(".get_url_icon").on("click", function () {
    gtag("event", "click_videotranslate_urlparse");
    getYoutubeVideoTask(youtubeUrl);
  });

  $(".upgrade_banner_btn").on("click", function () {
    if (userinfo?.is_credit_subscription === 1) {
      if (isUse) {
        gtag("event", "click_videotranslate_probannerused");
        setCookie("st", "translator_probannerused");
      } else {
        gtag("event", "click_videotranslate_probanner");
        setCookie("st", "translator_probanner");
      }
    } else {
      gtag("event", "click_videotranslate_freebanner");
      setCookie("st", "translator_freebanner");
    }
    // window.open("/pricing.html");
  });

  $(".select_contry").on("click", function () {
    if ($(this).hasClass("select_contry1")) return;
    if ($(this).hasClass("active")) {
      $(this).removeClass("active");
    } else {
      $(this).addClass("active");
      if ($(this).hasClass("select_contry")) {
        const countryListItem = document
          .querySelector(".select_box.selectContry")
          .querySelectorAll(".select_item");
        countryListItem.forEach((item) => {
          const itemLang = item.querySelector(".contry_name");
          const textW = itemLang.scrollWidth;
          const blockW = itemLang.clientWidth;
          if (textW > blockW) {
            item.setAttribute("title", item.textContent.trim());
          } else {
            item.removeAttribute("title");
          }
        });
      }
    }
  });

  $(".original_lan").on("click", function () {
    if ($(".select_contry1").hasClass("active")) {
      $("#origin_lan").blur();
      $(".select_contry1").removeClass("active");
    } else {
      $("#origin_lan").focus();
    }
  });

  $("#origin_lan").on("focus", function () {
    $(".select_contry1").addClass("active");
    const keywords = $("#origin_lan").val().toLowerCase();
    const searchList = originalLanList?.filter((item) =>
      item.name.toLowerCase().includes(keywords)
    );
    let key;
    if (curTab === "tab1") {
      key = tab1_defaultOriginLan;
    } else {
      key = tab2_defaultOriginLan;
    }
    if (searchList?.length === 0) {
      $("#origin_lan").val('')
      renderOriginLanList(originalLanList);
    } else if ((key?.key)) {
      renderOriginLanList(originalLanList);
    } else {
      renderOriginLanList(searchList);
    }
  });

  $("#origin_lan").on("input", function (e) {
    $(".translate_btn").removeClass("active");
    const keywords = e.target.value.trim().toLowerCase();
    const searchList = originalLanList?.filter((item) =>
      item.name.toLowerCase().includes(keywords)
    );
    renderOriginLanList(searchList);
    if (curTab === "tab1") {
      tab1_defaultOriginLan = { key: "", name: "" };
      tab1_edit_taVideo_script = [];
    } else {
      tab2_defaultOriginLan = { key: "", name: "" };
      tab2_edit_taVideo_script = [];
    }
  });

  $(".dialog_content .close_icon").on("click", function () {
    $(".dialog_mask").removeClass("show");
    $(".dialog_content").removeClass("show");
    videoLargeDom.pause();
    videoLargeDom.currentTime = 0;
    $(".large_play_icon").show();
  });

  $(".suc_btn, .tip_close_icon").on("click", function () {
    closeTip();
  });

  $(".btn.zoom").on("click", function () {
    gtag("event", "zoomin_videotranslate_res");
    showLarge();
  });

  $(".btn_edit").on("click", function () {
    $(".btn.download_video, .btn_download, .click_download").addClass(
      "pointer_none"
    );
    toEdit();
  });

  $(".btn.share, .btn_share").on("click", function () {
    gtag("event", "share_videotranslate_res");
    videoDom.pause();
    $(".play_btn").show();
    videoLargeDom.pause();
    videoLargeDom.currentTime = 0;
    $(".large_play_icon").show();
    shareDialogEl.changeTips({
      content: videoTransText.shareTitle,
    });
    const videoRes = curTab === "tab1" ? uploadVideoRes : youtubeVideoRes;
    const task_id = curTab === "tab1" ? upload_task_id : youtube_task_id;
    function backParams(data = []) {
      return {
        id: task_id,
        key: data.video_key,
        action: 'credit_video_translate'
      };
    }
    shareDialogEl.showShare({
      url: videoRes.additional_data.video_url,
      action: "videotranslateshare",
      imageKey: videoRes.additional_data.cover_key,
      videoKey: videoRes.additional_data.video_key,
      poster: videoRes.additional_data.cover_url,
      text: videoTransText.shareText,
      title: videoTransText.shareTitle,
      task_id,
      id: task_id,
      backParams,
    });
  });

  $(".btn.download_video, .btn_download, .click_download").on(
    "click",
    function () {
      gtag("event", "download_videotranslate_res");
      setCookie("st2", "dlvideotranslate");
      curToken = getCookie("access_token") || "";
      const task_id = curTab === "tab1" ? upload_task_id : youtube_task_id;
      if (isBlank(curToken)) {
        gtag("event", "alert_videotranslate_dwlogin");
        showLoginWindow({
          wait: [task_id],
          fn: (data = null) => {
            if (data) {
              if (curTab === "tab1") {
                translateDownloadData = data;
              } else {
                translateDownloadDataY = data;
              }
            }
            initPage();
          },
        });
      } else {
        // winRef = window.open("", "_blank");
        $(".btn.download_video, .btn_download, .click_download").addClass(
          "downDisabled"
        );
        $(".btn_edit").addClass("pointer_none");
        handleDownload();
      }
    }
  );

  $(".demo_download").on("click", function (e) {
    e.stopPropagation();
    const index = Number($("#demo_video").attr("data-index"));
    const item = demoList[index];
    demoDownload(item.video_url);
  });

  $(".demo_share").on("click", function () {
    gtag("event", "share_videotranslate_demo");
    const index = Number($("#demo_video").attr("data-index"));
    const item = demoList[index];
    try {
      const textToCopy = item.video_url;
      const tempInput = document.createElement("input");
      tempInput.value = textToCopy;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      document.body.removeChild(tempInput);
      $("body").append(`
    <bottom-message
      text="${videoTransText.copy_suc}"
      type=""
      showtime=""
      >
    </bottom-message>`);
    } catch (error) {
      $("body").append(`
    <bottom-message
      text="${videoTransText.copy_fail}"
      type=""
      showtime=""
      >
    </bottom-message>`);
    }
  });

  $(".demo_close").on("click", function () {
    closeDemo();
  });

  $(".next_btn").on("click", function () {
    $(".pre_btn").show();
    const index = Number($("#demo_video").attr("data-index"));
    if (index + 1 >= demoList.length - 1) {
      $(this).hide();
    }
    const next_item = demoList[index + 1];
    if (next_item) {
      $(".demo_dialog_name").text(next_item.name);
      $("#demo_video").attr("poster", next_item.cover_url);
      $("#demo_video").attr("src", next_item.video_url);
      $("#demo_video").attr("data-index", index + 1);
      $(".demo_play_icon").show();
    }
  });

  $(".pre_btn").on("click", function () {
    $(".next_btn").show();
    const index = Number($("#demo_video").attr("data-index"));
    if (index - 1 <= 0) {
      $(this).hide();
    }
    const pre_item = demoList[index - 1];
    if (pre_item) {
      $(".demo_dialog_name").text(pre_item.name);
      $("#demo_video").attr("poster", pre_item.cover_url);
      $("#demo_video").attr("src", pre_item.video_url);
      $("#demo_video").attr("data-index", index - 1);
      $(".demo_play_icon").show();
    }
  });

  $(".translate_btn, .proofread_translate_btn").on("click", function () {
    if ($(this).hasClass("proofread_translate_btn")) {
      translateVideo(true);
    } else {
      translateVideo();
    }
  });

  $(".info").on("mouseenter", function () {
    gtag("event", "show_videotranslate_tip");
  });
  $(".info_choose6").on("click", function () {
    $(".info_choose1").removeClass("info_box_click");
    $(".info_choose2").removeClass("info_box_click");
    $(".info_choose3").removeClass("info_box_click");
    $(".info_choose4").removeClass("info_box_click");
    $(".info_choose5").removeClass("info_box_click");
    if (isMobileDevice()) {
      gtag("event", "show_videotranslate_tip");
      $(".info_choose6").addClass("info_box_click");
    }
  });

  $(".info_choose5").on("click", function () {
    $(".info_choose1").removeClass("info_box_click");
    $(".info_choose2").removeClass("info_box_click");
    $(".info_choose3").removeClass("info_box_click");
    $(".info_choose4").removeClass("info_box_click");
    $(".info_choose6").removeClass("info_box_click");
    if (isMobileDevice()) {
      gtag("event", "show_videotranslate_tip");
      $(".info_choose5").addClass("info_box_click");
    }
  });

  $(".info_choose4").on("click", function () {
    $(".info_choose1").removeClass("info_box_click");
    $(".info_choose2").removeClass("info_box_click");
    $(".info_choose3").removeClass("info_box_click");
    $(".info_choose6").removeClass("info_box_click");
    $(".info_choose5").removeClass("info_box_click");
    if (isMobileDevice()) {
      gtag("event", "show_videotranslate_tip");
      $(".info_choose4").addClass("info_box_click");
    }
  });

  $(".info_choose3").on("click", function () {
    $(".info_choose1").removeClass("info_box_click");
    $(".info_choose2").removeClass("info_box_click");
    $(".info_choose6").removeClass("info_box_click");
    $(".info_choose4").removeClass("info_box_click");
    $(".info_choose5").removeClass("info_box_click");
    if (isMobileDevice()) {
      gtag("event", "show_videotranslate_tip");
      $(".info_choose3").addClass("info_box_click");
    }
  });

  $(".info_choose2").on("click", function () {
    $(".info_choose1").removeClass("info_box_click");
    $(".info_choose6").removeClass("info_box_click");
    $(".info_choose3").removeClass("info_box_click");
    $(".info_choose4").removeClass("info_box_click");
    $(".info_choose5").removeClass("info_box_click");
    if (isMobileDevice()) {
      gtag("event", "show_videotranslate_tip");
      $(".info_choose2").addClass("info_box_click");
    }
  });
  $(".info_choose2_1").on("click", function () {
    if (isMobileDevice()) {
      gtag("event", "show_videotranslate_tip");
      $(".info_choose2_1").addClass("info_box_click");
    }
  });
});

$(function () {
  document
    .querySelector("my-component")
    .addEventListener("loginsuccess", function () {
      initPage();
      getUserinfo().then(county_type_data => {
        contryT = county_type_data.county_type;
        setHoverInfoTime(county_type_data)
      })
    });
});

window.addEventListener("googleonetopsuccess", function () {
  initPage();
});

document.addEventListener(
  "mouseup",
  (e) => {
    let contrySelect1 = document.querySelector(".select_contry1");
    let contrySelect2 = document.querySelector(".select_contry2");
    let voiceSet = document.querySelector(".voice_set");
    if (contrySelect1 && !contrySelect1.contains(e.target)) {
      $(".select_contry1").removeClass("active");
      const inputVal = $("#origin_lan").val().trim().toLowerCase()
      const obj = originalLanList?.find((item) => item.name.toLowerCase() == inputVal)
      if (obj) {
        if (curTab === "tab1") {
          tab1_defaultOriginLan = obj
        } else {
          tab2_defaultOriginLan = obj
        }
        renderOriginLanList(originalLanList);
        setDefaultCountryInfo({
          flag: null,
          text: obj.name,
          className: "origin_contry",
        });
      }
    }
    if (contrySelect2 && !contrySelect2.contains(e.target)) {
      $(".select_contry2").removeClass("active");
    }
    if (voiceSet && !voiceSet.contains(e.target)) {
      $(".voice_box ").removeClass("active");
    }
  },
  false
);

document.addEventListener("touchstart", (e) => {
  $(".info_choose3").removeClass("info_box_click");
  $(".info_choose2").removeClass("info_box_click");
  $(".info_choose2_1").removeClass("info_box_click");
  $(".info_choose4").removeClass("info_box_click");
  $(".info_choose5").removeClass("info_box_click");
  $(".info_choose6").removeClass("info_box_click");
});

// seo 部分
// swiper
// m
class CustomSwiperOne {
  constructor({ container = "", children = "" }) {
    this.container = container;
    this.children = children;
    this.swiperItemIndex = 0;
    this.init();
  }
  init() {
    this.containerDom = document.querySelector(this.container);
    this.containerItemDom = this.containerDom.querySelectorAll(this.children);
    this.containerItemLen = this.containerItemDom.length;
    this.render();
  }
  render() {
    let dots = `<div class="swiper__dots">`;
    for (let i = 0; i < this.containerItemLen; i++) {
      const item = this.containerItemDom[i];
      item.style.left = `${i * 100}%`;
      let classes = "";
      if (i === 0) {
        classes = "active";
      }
      dots += `<span class="swiper__dots-item ${classes}" data-i="${i}"></span>`;
      this.moveItemByTouch(item);
    }
    this.containerDom.insertAdjacentHTML("beforeend", dots);
    this.dotsClick();
  }
  clearDotActive() {
    for (let i = 0; i < this.dotsItem.length; i++) {
      const dotItem = this.dotsItem[i];
      dotItem.classList.remove("active");
    }
  }
  dotAddActive() {
    for (let i = 0; i < this.dotsItem.length; i++) {
      const dotItem = this.dotsItem[i];
      dotItem.classList.remove("active");
      if (i === this.swiperItemIndex) {
        dotItem.classList.add("active");
      }
    }
  }
  dotsClick() {
    this.dotsItem = this.containerDom.querySelectorAll(".swiper__dots-item");
    for (let i = 0; i < this.dotsItem.length; i++) {
      const dotItem = this.dotsItem[i];
      dotItem.onclick = () => {
        this.clearDotActive();
        this.moveSwiperItem(dotItem.dataset.i);
        dotItem.classList.add("active");
      };
    }
  }
  moveSwiperItem(i = 0) {
    const dis = i - this.swiperItemIndex;
    for (let i = 0; i < this.containerItemLen; i++) {
      const item = this.containerItemDom[i];
      let left = parseInt(item.style.left);
      left -= dis * 100;
      item.style.left = `${left}%`;
    }
    this.swiperItemIndex = i;
    this.dotAddActive();
  }
  moveItemByTouch(element = null) {
    if (!element) return;
    let startX, startY, distX, distY;
    element.addEventListener("touchstart", handleTouchStart, false);
    element.addEventListener("touchmove", handleTouchMove, false);
    function handleTouchStart(event) {
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
    }
    function handleTouchMove(event) {
      if (!startX || !startY) {
        return;
      }
      distX = event.touches[0].clientX - startX;
      distY = event.touches[0].clientY - startY;
      if (Math.abs(distX) > Math.abs(distY)) {
        event.preventDefault();
      }
    }
    element.addEventListener(
      "touchend",
      () => {
        if (Math.abs(distX) > 50) {
          let i = this.swiperItemIndex;
          if (distX > 0) {
            if (this.swiperItemIndex <= 0) {
              i = 0;
            } else {
              i--;
            }
            this.handleSwiperItem(i);
          } else if (distX < 0) {
            if (this.swiperItemIndex >= this.containerItemLen - 1) {
              i = this.containerItemLen - 1;
            } else {
              i++;
            }
            this.handleSwiperItem(i);
          }
        }
        startX = null;
        startY = null;
        distX = 0;
        distY = 0;
      },
      false
    );
  }
  handleSwiperItem(i) {
    this.moveSwiperItem(i);
  }
}

// FAQS
const faqsTranslatorItems = document.querySelectorAll(".faqs__translator_item");

function faqsTranslatorItemsClick() {
  for (let i = 0; i < faqsTranslatorItems.length; i++) {
    const item = faqsTranslatorItems[i];
    const header = item.querySelector(".faqs__translator_item-header");
    const body = item.querySelector(".faqs__translator_item-body");
    header.onclick = () => {
      const show =
        body.style.maxHeight === "0px" || body.style.maxHeight === "";
      body.style.maxHeight = show ? body.scrollHeight + "px" : "0";
      if (show) {
        header.classList.add("show");
      } else {
        header.classList.remove("show");
      }
    };
  }
}

// Maximize__values_pc
const MaximizePcBoxsHeader = document.querySelectorAll(
  ".Maximize_pc_boxs_header"
);
const MaximizePcBoxsLi = document.querySelectorAll(".Maximize_pc_boxs_li");

function clearMaximizePcBoxsLiAcive() {
  for (let i = 0; i < MaximizePcBoxsLi.length; i++) {
    const item = MaximizePcBoxsLi[i];
    item.classList.remove("active");
    const content = item.querySelector(".Maximize_pc_boxs_ceontent");
    content.style.maxHeight = 0;
  }
}

function MaximizePcBoxsHeaderClick() {
  const MaximizeImgs = document.querySelectorAll(".Maximize_pc_boxs_img img");
  function MaximizeImgsClear() {
    for (let i = 0; i < MaximizeImgs.length; i++) {
      const element = MaximizeImgs[i];
      element.style.display = "none";
    }
  }
  for (let i = 0; i < MaximizePcBoxsHeader.length; i++) {
    const item = MaximizePcBoxsHeader[i];
    const next = item.nextElementSibling;
    if (i === 0) {
      next.style.maxHeight = next.scrollHeight + "px";
    }
    item.onclick = function () {
      MaximizeImgsClear();
      MaximizeImgs[i].style.display = "block";
      MaximizeImgs[i].animate(
        [
          {
            transform: `scale(0.8)`,
            opacity: 0,
          },
          {
            transform: `scale(1)`,
            opacity: 1,
          },
        ],
        {
          duration: 300,
          easing: "cubic-bezier(0.2, 0, 0.2, 1)",
        }
      );

      const show =
        next.style.maxHeight === "0px" || next.style.maxHeight === "";
      if (!show) {
        // this.parentNode.classList.remove("active");
        // next.style.maxHeight = 0;
      } else {
        clearMaximizePcBoxsLiAcive();
        this.parentNode.classList.add("active");
        next.style.maxHeight = next.scrollHeight + "px";
      }
    };
  }
}

// flags
let lock = false;
function hideFlags() {
  let flagsDom = document.querySelectorAll(".country__flags_boxs-item");
  let showOrHideBut = document.querySelector(".country__flags_showOrHide");
  function showOrHideFlags(type = "hide") {
    flagsDom = Array.from(flagsDom);
    if (type === "hide") {
      const sliceFlags = flagsDom.slice(15);
      for (let i = 0; i < sliceFlags.length; i++) {
        const flag = sliceFlags[i];
        flag.style.display = "none";
      }
    } else if (type === "show") {
      for (let i = 0; i < flagsDom.length; i++) {
        const flag = flagsDom[i];
        flag.style.display = "flex";
      }
    }
  }
  showOrHideFlags();
  showOrHideBut.onclick = () => {
    if (!lock) {
      showOrHideFlags("show");
      lock = true;
      showOrHideBut.innerHTML = videoTransText.goBack;
    } else {
      showOrHideFlags();
      lock = false;
      showOrHideBut.innerHTML = videoTransText.seeAllLangauges;
      document.querySelector(".country__flags").scrollIntoView();
    }
  };
  for (let i = 0; i < flagsDom.length; i++) {
    const flag = flagsDom[i];
    flag.onclick = () => {
      const element = document.querySelector(
        `[data-name="${(flag?.textContent || "").trim()}"]`
      );
      element.click();
      const selectDom = document.querySelector(".select_contry");
      selectDom.classList.remove("active");
      window.scrollTo(0, 0);
      gtag("event", "upclick_videotranslate_chooselang");
    };
  }
}

const renderCountryHTML = (countryData = []) => {
  const countryFlagsBoxs = document.querySelector(".country__flags_boxs");
  let html = "";
  for (let i = 0; i < countryData.length; i++) {
    const data = countryData[i];
    html += `<div class="country__flags_boxs-item">
        <img src="${data.img_url}" />
        <span>${data.country_name}</span>
      </div>`;
  }
  countryFlagsBoxs.innerHTML = "";
  countryFlagsBoxs.insertAdjacentHTML("beforeend", html);
  hideFlags();
};

const initScrollBarPos = () => {
  const listsDom = document.querySelector(
    ".recommende__article_swiper .swiper-wrapper"
  );
  listsDom ? listsDom.scrollTo(300, 0) : '';
};

$(function () {

  // if (isMobileDevice()) {
  //   initScrollBarPos();
  //   new CustomSwiperOne({
  //     container: ".use__occasions_swiper",
  //     children: ".use__occasions_swiper-item",
  //   });
  // } else {
  //   new Swiper(".recommende__article_swiper", {
  //     width: 1088,
  //     slidesPerView: 4,
  //     spaceBetween: 16,
  //     speed: 800,
  //     autoplay: {
  //       delay: 8000,
  //       disableOnInteraction: false,
  //     },
  //     navigation: {
  //       nextEl: ".recommende__article .swiper-button-next",
  //       prevEl: ".recommende__article .swiper-button-prev",
  //     },
  //   });
  //   var mySwiper = new Swiper(".swiper-container", {
  //     width: 270,
  //     slidesPerView: 1,
  //     initialSlide: 2,
  //     observer: true,
  //     observeParents: true,
  //     spaceBetween: 15,
  //     centeredSlides: true,
  //     // loop: true,
  //     navigation: {
  //       nextEl: ".use__occasions .swiper-button-next",
  //       prevEl: ".use__occasions .swiper-button-prev",
  //     },
  //   });
  // }
  // const slides = document.querySelectorAll(".use__occasions_swiper-item");
  // slides.forEach((slide, index) => {
  //   slide.addEventListener("click", function () {
  //     mySwiper.slideTo(index);
  //   });
  // });
  faqsTranslatorItemsClick();
  MaximizePcBoxsHeaderClick();
});


function showLoginWindow(obj = {}) {
  const { fn = () => { }, productName = "ai", isReloading = false, wait = null } = obj;
  // 成功后执行函数
  $("my-component").off("loginsuccess").on("loginsuccess", function (event) {
    if (event?.detail) {
      fn(event.detail)
    } else {
      fn()
    }
    chatLogin();
  });
  localStorage.setItem("loginProductName", productName);
  if (isReloading) {
    localStorage.setItem("toolsPosition", isReloading);
  } else {
    localStorage.setItem("toolsPosition", "false");
  }
  $("my-component").length && $("my-component")[0].showLoginDialog(wait);
}