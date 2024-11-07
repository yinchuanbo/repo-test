let showImgWidth,
  totalSlides,
  isTransition,
  imgsLength = 1,
  showImgIndex = 1,
  page = 1,
  imgList,
  likeNum,
  date = $('.data_box').attr('data-time'),
  detailID = $('.detail_main').attr('data-detailID');

const imgBox = document.querySelector('.info_img_box')
const imgContainer = document.querySelector('.info_img')
const listParams = {
  page: 1,
  pageSize: 36,
  offset: null,
  id: detailID
};

function showImg() {
  imgList = document.querySelectorAll('.show_img')
  if (imgList.length > 1) {
    imgList.forEach((item, index) => {
      item.setAttribute('slider', index + 1)
    })

    if (document.body.clientWidth > 1200) {
      showImgWidth = Number($('.info_img_box').attr('data-width').replace('px', ''))
    } else {
      const remSize = Number($('html').css('fontSize').replace('px', ''))
      showImgWidth = 6.18 * remSize
      $('.info_left').css('width', showImgWidth)
      $('.show_img').css('width', showImgWidth)
      $('.info_img_box').css('width', showImgWidth)
    }

    $('.info_left').addClass('more_img')
    imgsLength = imgList.length
    const appendImg1 = imgList[0].cloneNode(true)
    const appendImg2 = imgList[imgList.length - 1].cloneNode(true)
    imgContainer.insertAdjacentElement('beforeend', appendImg1)
    imgContainer.insertAdjacentElement('afterbegin', appendImg2)
    imgContainer.style.transform = `translateX(${-showImgWidth * showImgIndex}px)`;
    imgList = document.querySelectorAll('.show_img')
    totalSlides = imgList.length

    imgContainer.addEventListener("transitionend", () => {
      isTransition = false
      const curSlide = imgList[showImgIndex].getAttribute('slider')
      if (curSlide === "1") {
        imgContainer.style.transition = "none";
        showImgIndex = 1;
        imgContainer.style.transform = `translateX(${-showImgWidth * showImgIndex}px)`;
      }
      if (curSlide === String(imgsLength)) {
        imgContainer.style.transition = "none";
        showImgIndex = totalSlides - 2;
        imgContainer.style.transform = `translateX(${-showImgWidth * showImgIndex}px)`;
      }
    });
    // setInterval(nextClick, 3000)

    $('.img_pre_icon').on('click', preClick)
    $('.img_next_icon').on('click', nextClick)
  } else {
    if (document.body.clientWidth <= 1200) {
      $('.info_img_box').css('width', `100%`)
    }
  }
}

function nextClick() {
  if (isTransition) return
  if (showImgIndex >= totalSlides - 1) return;
  isTransition = true
  imgContainer.style.transition = "transform 0.5s ease-in-out";
  showImgIndex++;
  imgContainer.style.transform = `translateX(${-showImgWidth * showImgIndex}px)`;
}

function preClick() {
  if (isTransition) return
  if (showImgIndex <= 0) return;
  isTransition = true
  imgContainer.style.transition = "transform 0.5s ease-in-out";
  showImgIndex--;
  imgContainer.style.transform = `translateX(${-showImgWidth * showImgIndex}px)`;
}

function renderList() {
  let html = `
    <div class="IGgrid_container notshow">
      <div class="IGgrid_table_container"></div>
      <lottie-player
        src="/dist/img/loading.json"
        background="transparent"
        speed="1"
        style="width: 160px; height: 160px"
        loop
        autoplay
        class="lottie-loading"
      ></lottie-player>
    <div>
  `
  $('.explore_content').html(html)

  const IGgrid_container = $(".IGgrid_container");

  function setLoading(flag) {
    if (flag) {
      IGgrid_container.addClass("notshow");
    } else {
      IGgrid_container.removeClass("notshow");
    }
  }

  function setMoreLoading(flag) {
    if (flag) {
      IGgrid_container.addClass("more_loading");
    } else {
      IGgrid_container.removeClass("more_loading");
    }
  }

  function getList(isClear = true) {
    isClear ? setLoading(true) : setMoreLoading(true);
    const params = setParams(listParams);
    nomore = false;
    _$$.getComm(`generate/post/list${params}`).then((res) => {
      isScrollLoading = false;
      IGgrid_container.removeClass("more_loading");
      if (res.data.list.length === 0 || res.data.list.length < listParams.pageSize) {
        nomore = true
      }
      listParams.offset = res.data.offset;
      renderGrid({
        list: res.data.list,
        isClear,
        callback: () => {
          isClear ? setLoading(false) : setMoreLoading(false);
        },
      });
      listenScroll({
        callback: () => {
          listParams.page++;
          getList(false)
        }
      });
    });
  }
  getList()
  setGotoTop()
}

function getLikeView() {
  const params = setParams({ id: detailID })
  _$$.getComm(`generate/post/stat${params}`).then(res => {
    if (res.code === 200) {
      $('.like_num').html(formatNumber(res.data.like))
      $('.view_num').html(formatNumber(res.data.view))
      if (res.data.liked) $('.like_icon').addClass('active')
      likeNum = res.data.like
    } else {
      $('.like_num').html(formatNumber(0))
      $('.view_num').html(formatNumber(0))
      likeNum = 0
    }
  }).catch(err => {
    console.log(err)
    $('.like_num').html(formatNumber(0))
    $('.view_num').html(formatNumber(0))
    likeNum = 0
    $Popup({
      type: "error",
      errorType: "network",
    });
  })
}

function initPage() {
  gtag("event", "open_imginfo_page");
  getLikeView()
  $('.data_box .text').html(getLocalTime(date))
  showImg()
  renderList()
}

function getLocalTime(time) {
  const date = new Date(time.replace(' ', 'T'));
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function downloadImg(src) {
  // const link = document.createElement("a");
  // link.href = src;
  // link.setAttribute("download", "Vidqu_AI_Image.jpg");
  // link.click();
  // link.remove();
  fetch(src).then((res) => {
    res.blob().then((blob) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", "Vidqu_AI_Image.jpg");
      link.click();
      link.remove();
    });
  }).catch(err => {
    console.log(err)
    $Popup({
      type: "error",
      errorType: "network",
    });
  });
}

$(function () {
  initPage()
  let login_Modal = document.querySelector("my-component");
  login_Modal.addEventListener("loginsuccess", async () => {
    window.location.reload()
  })

  $(".signoutBtn").on("click", async function () {
    window.location.reload()
  });
});

$('.back_icon').on('click', function () {
  gtag("event", "click_imginfo_backbtn");
  if (document.referrer.includes("vidqu.ai")) {
    history.back()
  } else {
    window.location.href = homeUrl
  }
})

$('.icon_copy').on('click', function () {
  gtag("event", "click_imginfo_cpbtn");
  const str = $('.prompts_text').text().replace(/\s+/g, ' ').trim()
  try {
    copyText(str);
    ToolTip({
      text: jsonData.IGdetail.copySuc,
    });
  } catch (err) {
    ToolTip({
      type: 'error',
      text: jsonData.IGdetail.copyErr,
    });
  }
})

$('.like_icon').on('click', function () {
  gtag("event", "click_imginfo_likebtn");
  const access_token = getCookie("access_token") ? getCookie("access_token") : "";
  if (access_token) {
    if ($(this).hasClass('active')) {
      $(this).removeClass('active')
      likeNum--
      _$$.postComm('generate/post/like', { id: detailID }).then(res => {
        if (res.code != 200) {
          $('.like_icon').addClass('active')
          likeNum++
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
      }).catch(err => {
        console.log(err)
        $('.like_icon').addClass('active')
        likeNum++
      })
    } else {
      $(this).addClass('active')
      likeNum++
      _$$.postComm('generate/post/like', { id: detailID }).then(res => {
        if (res.code != 200) {
          $('.like_icon').removeClass('active')
          likeNum--
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
      }).catch(err => {
        console.log(err)
        $('.like_icon').removeClass('active')
        likeNum--
        $Popup({
          type: "error",
          errorType: "network",
        });
      })
    }
    $('.like_num').html(formatNumber(likeNum))

  } else {
    showLoginWindow()
  }
})

$('.download_box').on('click', function () {
  gtag("event", "click_imginfo_downloadbtn");
  let curImg
  if (imgsLength === 1) {
    curImg = imgList[0]
  } else {
    curImg = imgList[showImgIndex]
  }
  downloadImg(curImg.src)
})

$('.share_box').on('click', function () {
  gtag("event", "click_imginfo_sharebtn");
  renderShare({ id: detailID }, 'info')
})

$('.btn_remix, .generate_btn').on('click', function () {
  if ($(this).hasClass('btn_remix')) {
    gtag("event", "click_imginfo_tryitbtn");
  } else {
    gtag("event", "click_imginfo_generatebtn");
  }
  window.location.href = `/ai-image-generator.html?setInfoId=${detailID}`
})

document.addEventListener('scroll', function (e) {
  const targetHeight = window.innerHeight * 2
  const scrollHeight = document.body.scrollTop || document.documentElement.scrollTop
  if (scrollHeight > targetHeight) {
    $(".gotoHead").show()
  } else {
    $(".gotoHead").hide()
  }
})