$(document).ready(function () {
  const main_home = $(".main_home");
  const filterHeader = $(".filter_header");
  const horizontalSelector = $(".filter_header horizontal-selector");
  const IGgrid_container = $(".IGgrid_container");
  const filter = $(".main_home .filter");
  const filter_menu_item = $(".main_home .filter_menu_item");
  const filter_down_menu = $(".main_home .filter_down_menu");
  const listParams = {
    page: 1,
    pageSize: 36,
    tag: null,
    sort: "new",
    offset: null,
  };
  init();

  function init() {
    getTags();
    getList();
    setGotoTop("#explore_title");
    gtag('event', 'open_home_page')
    let login_Modal = document.querySelector("my-component");
    login_Modal.addEventListener("loginsuccess", () => {
      console.error("login successful");
      listParams.offset = null;
      listParams.page = 1;
      getList();
    })
    $(".signoutBtn").on("click", async function () {
      listParams.offset = null;
      listParams.page = 1;
      getList();
    });
    $(window).on("scroll", function (e) {
      const scrollTop = $(e.target).scrollTop();
      const filter_btn_right = $("horizontal-selector .filter_btn_right");
      if (judgeClient() == "pc") {
        if (scrollTop > 560) {
          filterHeader.css("background", "#070c14");
          filter_btn_right.addClass("blackbg")
        } else {
          filterHeader.css("background", "")
          filter_btn_right.removeClass("blackbg")
        }
      } else {
        const IGgrid_container_top =main_home.offset().top + 50;
        if (scrollTop > IGgrid_container_top) {
          filterHeader.css("background", "#070c14");
          filter_btn_right.addClass("blackbg")
        } else {
          filterHeader.css("background", "")
          filter_btn_right.removeClass("blackbg")
        }
      }
    })
  }

  // clear all's loading
  function setLoading(flag) {
    if (flag) {
      IGgrid_container.addClass("notshow");
    } else {
      IGgrid_container.removeClass("notshow");
    }
  }

  // load more's loading
  function setMoreLoading(flag) {
    if (flag) {
      IGgrid_container.addClass("more_loading");
    } else {
      IGgrid_container.removeClass("more_loading");
    }
  }

  // get tags
  function getTags() {
    _$$.getComm("generate/post/tag-list").then((res) => {
      horizontalSelector[0].render({
        list: res.data,
      });
      horizontalSelector.on("igSelectorItemclick", function (e) {
        gtag("event", "change_home_cate")
        listParams.tag = e.originalEvent.detail.key;
        if (e.originalEvent.detail.key === "All") {
          listParams.tag = null;
        }
        listParams.offset = null;
        listParams.page = 1;
        getList();
      });
    });
  }

  // get lists
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
    }).catch(err => {
      $Popup({type: "error", errorType: "network"});
    })
  }

  $("body").on("mouseup", function (e) {
    e.stopPropagation();
    if (e.target.closest(".filter_down_menu") === null) {
      filter_down_menu.removeClass("active");
    }
  });
  filter.on("click", function (e) {
    const filter_down_menu = $(this).parent();
    if (!filter_down_menu.hasClass("active")) {
      filter_down_menu.addClass("active");
    } else {
      filter_down_menu.removeClass("active");
    }
  });

  filter_menu_item.each(function () {
    const that = $(this);
    that.on("click", function (e) {
      $("#filer_icon").attr("src", that.children("img").attr("src"));
      $("#filer_name").text(that.children("span").text());
      $(".filter_down_menu").removeClass("active");
      listParams.sort = that.attr("data-key");
      gtag("event", `change_home_${listParams.sort}btn`)
      listParams.offset = null;
      listParams.page = 1;
      getList();
    });
  });

  document.addEventListener('scroll', function (e) {
    const targetHeight = window.innerHeight * 2
    const scrollHeight = document.body.scrollTop || document.documentElement.scrollTop
    if (scrollHeight > targetHeight) {
      $(".gotoHead").show()
    } else {
      $(".gotoHead").hide()
    }
  })
});
$(".face-btn").on("click",async function (e) {
  await new Promise((resolve) => setTimeout(resolve, 800));
  window.location.href = '/face-swap.html'
})
