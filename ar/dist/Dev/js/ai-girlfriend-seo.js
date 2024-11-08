import {curToken} from "@js/config.js";

console.log("curToken", curToken)

$(".seo_btn").click(function() {
  switch (true) {
    case $(this).hasClass("sectionbtn_A"):
      gtag("event", "upclick_aigf_intro");
      break;
    case $(this).hasClass("sectionbtn_B"):
      gtag("event", "upclick_aigf_chat");
      break;
    case $(this).hasClass("sectionbtn_C_1"):
      gtag("event", "upclick_aigf_left");
      break;
    case $(this).hasClass("sectionbtn_C_2"):
      gtag("event", "upclick_aigf_right");
      break;
    case $(this).hasClass("sectionbtn_D"):
      gtag("event", "upclick_aigf_step")
      break;
    case $(this).hasClass("sectionbtn_F"):
      gtag("event", "upclick_aigf_feature");
      break;
    case $(this).hasClass("sectionFooter_btn"):
      gtag("event", "upclick_aigf_tail");
      break;
  }
  $("body")[0].scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
});

// 选择需要观察的DOM节点
const target = [
  $("#big_banner1")[0],
  $("#big_banner2")[0],
  $("#line1")[0],
  $("#line2")[0],
  $("#line3")[0],
  $("#take")[0],
  $("#message1")[0],
  $("#message2")[0],
  $("#abc_bg")[0],
];

// 创建一个 Intersection Observer 实例
const observer = new IntersectionObserver((entries, observer) => {
  // entries 是一个包含所有目标元素（这里即为 targetNode）的数组
  entries.forEach((entry) => {
    // 判断目标元素当前是否完全进入视图
    if (entry.isIntersecting) {
      // 当目标元素完全进入视图时执行该json
      entry.target.play();

      // 停止观察目标元素
      observer.unobserve(entry.target);
    }
  });
});

// 开始观察目标节点
target.forEach((targetNode) => {
  observer.observe(targetNode);
});

//mobile端 sectionA自动滑动
const slides = $(".slideA_box")
function slideA(){
  const currentImage = $(".slideA_box.active");
  const nextImage = currentImage.next().length ? currentImage.next() : slides.first();
  nextImage.addClass("active");
  currentImage.removeClass("active");
}


// secitonB 轮播图
let indexB = 1;
function changeBannerB() {
  indexB >= 2 ? (indexB = 1) : indexB++;
  $(".swiper_banner img").fadeOut("normal", function () {
    $(".swiper_banner  img").attr("src", `/dist/img/aiGirlFriendSeo/icon_banner${indexB}.png`);
    $(".swiper_banner  img").fadeIn();
  });
}

// sectionC 切换图片
function slideB(){
  $(".secitonC_img_box img.active").fadeOut("normal", function () {
    $(".secitonC_img_box img:not(.active)").addClass("active");
    $(this).removeClass("active").fadeIn();
  })
}
setInterval(slideB, 2000); 

// sectionD 渐入渐出 PC端
$(".sectionD .l_item").click(function (e) {
  if ($(this).hasClass("active")) return;
  $(".sectionD .l_item").removeClass("active");
  $(this).addClass("active");
  const index = $(this).data("index");
  $(".box_banner img").fadeOut("normal", function () {
    $(".box_banner img").attr("src", `/dist/img/aiGirlFriendSeo/step${index}_photo.png`);
    $(".box_banner img").fadeIn();
  });
});
// mobile端 渐入渐出轮播图
let image_length = 4,
  toggleIndex = 1;
function fadeToggleSectionD() {
  toggleIndex >= image_length ? (toggleIndex = 1) : toggleIndex++;
  $(".box_banner img").fadeOut("normal", function () {
    $(".box_banner img").attr("src", `/dist/img/aiGirlFriendSeo/step${toggleIndex}_photo.png`);
    $(".control_title,.control_item").removeClass("active");
    $(`.control_title[data-index='${toggleIndex}']`).addClass("active");
    $(`.control_item[data-index='${toggleIndex}']`).addClass("active");
    $(".box_banner img").fadeIn();
  });
}

// sectionF 轮播图
const images = $(".image_container img");

function nextImage() {
  const currentImage = $(".image_container img.active");
  const nextImage = currentImage.next().length ? currentImage.next() : images.first();
  nextImage.addClass("active");
  const index = nextImage.attr("alt");
  $(".text_container .text_item").removeClass("active");
  $(`.text_container .text_item:eq(${index - 1})`).addClass("active");
  currentImage.removeClass("active");
}
setInterval(nextImage, 2000); 

$(".micro-test-faq-name").click(function () {
  if (!$(this).parent(".micro-test-faq-item").hasClass("active")) {
    $(this).parent(".micro-test-faq-item").addClass("active").find(".micro-test-faq-desc").slideDown(300).end();
    // .siblings('.sound-test-faq-item').removeClass('active')
    // .find('.sound-test-faq-desc').slideUp(300);
  } else {
    $(this).parent(".micro-test-faq-item").removeClass("active").find(".micro-test-faq-desc").slideUp(300);
  }
});

// mobile端执行函数
if (userModel != "pc") {
  setInterval(function(){
    fadeToggleSectionD()
    changeBannerB()
    slideA()
  }, 4000);
}
