//处理登录
function chatLogin() {
  let access_token = getCookie("access_token") ? getCookie("access_token") : "";
  access_token ? isLogin(true) : isLogin(false);
}
var defaultHeadImg = "/dist/img/aiFriend/icon_avatar.svg";
// 切换header头部的登录或者头像
function isLogin(bool) {
  if (bool) {
    $("#header_login").hide();
    $("#header_user,.meau_item.log").show();
    $("#header_inform").css('display','flex');
    const userInfo = JSON.parse(getCookie("user_info"));
    $("#header_user .header_avator, .mob-menu-title.user .header_avator").attr("src", userInfo?.head_portrait || defaultHeadImg);
    $("#header_user .header_avator, .mob-menu-title.user .header_avator").off("error").on("error", function() {
      console.error("error loading");
      setTimeout(() => {
        $("#header_user .header_avator").attr("src", userInfo?.head_portrait || defaultHeadImg);
      }, 1500) 
    })
    let name = userInfo?.first_name + " " + userInfo?.last_name;
    name = name === ' ' ? userInfo?.email.split("@")[0] : name;
    $("header .userName").text(name);
    $("header .useremail").text(userInfo?.email);
  } else {
    $("#header_login").css("display", "flex");
    $("#header_user,#header_inform").hide();
    $(".meau_item.log").hide();
  } 
}

$(function () {
  $(document).bind("click", function (e) {
    const targetItem = $(".menu-text");
    const text = $(".menu-text");
    const drop = $(".menu-drop");
    if (!targetItem.is(e.target) && targetItem.has(e.target).length === 0) {
      drop.fadeOut();
      text.attr("data-open", "false");
      text.removeClass("active");
      text.find(".arrow-normal").removeClass("active");
    }
  });
  $(".mobile-menu-item").click(function () {
    $(this).find(".mob-menu-dec").toggle();
    $(this).find(".arrow").toggleClass("active");
  });
  $(".menu-text").on("click", function (e) {
    const isOpen = $(this).attr("data-open");
    const drop = $(this).parent().find(".menu-drop");
    const text = $(".menu-text");
    if (isOpen === "false") {
      text.attr("data-open", "false");
      text.removeClass("active");
      text.find(".arrow-normal").removeClass("active");
      $(".menu-drop").hide();
      drop.fadeIn();
      $(this).attr("data-open", "true");
      $(this).addClass("active");
      $(this).find(".arrow-normal").addClass("active");
    } else {
      drop.hide();
      $(this).attr("data-open", "false");
      text.removeClass("active");
      text.find(".arrow-normal").removeClass("active");
    }
  });

  $("body").on("mouseup", function (e) {
    const target = $(e.target);
    if (target.hasClass("menu-contanier") && $(".meau_icon").hasClass("active")) {
      $(".meau_icon").click();
    }
  });
});

window.addEventListener("load", function () {
  chatLogin();
  $("#header_login").click(() => {
    showLoginWindow({
      fn: () => {
        chatLogin();
        const url = window.location.pathname
        if (url.includes("face-swap")) {
          $("header-credit")[0]?.init()
        }
      },
    });
  });
  $(".signoutBtn").click(() => {
    $(".meau_icon").hasClass("active") ? $(".meau_icon").click() : "";
    localStorage.removeItem("user_info");
    setCookie("loginProduct", "");
    setSessionCookie("st", "");
    setCookie("refresh_token", "");
    setCookie("user_info", "");
    setCookie("access_token", "");
    $("#header-credit").hide()
    isLogin(false);
  });
  $(".meau_icon").click(function () {
    if ($(this).hasClass("active")) {
      $(".menu-contanier").slideUp();
      document.body.style.overflow = "auto";
      $("#header").css("position","")
    } else {
      $(".menu-contanier").slideDown();
      document.body.style.overflow = "hidden";
      $("#header").css("position",'fixed')
    }
    $(this).toggleClass("active");
  });
});
