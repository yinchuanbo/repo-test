class HorizontalSelector extends HTMLElement {
  constructor() {
    super();
    this.moveNum = 300;
    this.moveDistance = 0;
    this.removeDistance = 0;
    this.taglist = [];
  }
  /**
   * html
   * @param {Array} list
   *
   */
  html({ list }) {
    let html = ``;
    list.forEach(function (el) {
      html += `<div class="filter_choose_item ${
        el.name ? "" : "skeleton_dom"
      }" data-key="${el?.id}">${el?.name || ""}</div>`;
    });
    return `
      <div class="filter_btn_left">
        <img src="/dist/img/IGhome/btn_arrow-left_normal.svg" alt="">
      </div>
      <div class="filter_choose_box">
        <div class="filter_choose_item active" data-key="All">All</div>
        ${html}
      </div>
      <div class="filter_btn_right">
        <img src="/dist/img/IGhome/btn_arrow-right_normal.svg" alt="">
      </div>
    `;
  }
  /**
   * render html
   * @param {HTMLElement} dom
   *
   */
  render({ list = [] }) {
    this.innerHTML = this.html({ list });
    this.events();
  }
  events() {
    const that = this;
    const horizontalSelector = $(this);
    const outSideWidth = $(this).width();
    const inSideWidth = $(".filter_choose_box")[0].scrollWidth;
    this.removeDistance = inSideWidth - outSideWidth;
    if (inSideWidth > outSideWidth) {
      horizontalSelector.find(".filter_btn_right").css("display", "flex");
    }
    horizontalSelector.find(".filter_choose_item").each(function () {
      const item = $(this);
      item.on("click", function () {
        const key = item.attr("data-key");
        item
          .addClass("active")
          .siblings(".filter_choose_item")
          .removeClass("active");
        that.dispatchEvent(
          new CustomEvent("igSelectorItemclick", {
            detail: {
              key,
            },
          })
        );
      });
    });
    // filter_btn_right click
    horizontalSelector.find(".filter_btn_right").on("click", function () {
      if (judgeClient() !== "pc") {
        const header = $(".filter_header")
        if (!header) throw new Error("don't have this element");
        if (header.hasClass("hidden_menu")) {
          header?.removeClass("hidden_menu");
        } else {
          header?.addClass("hidden_menu");
        }
        return;
      }
      if (Math.abs(that.moveDistance - that.moveNum) >= that.removeDistance) {
        that.moveDistance = -that.removeDistance;
      } else {
        that.moveDistance = that.moveDistance - that.moveNum;
      }
      $(".filter_choose_box").attr(
        "style",
        `transform: translateX(${that.moveDistance}px)`
      );
      if (that.moveDistance < 0) {
        horizontalSelector.find(".filter_btn_left").css("display", "flex");
      }
      if (Math.abs(that.moveDistance) >= that.removeDistance) {
        horizontalSelector.find(".filter_btn_right").hide();
      }
    });
    // filter_btn_left click
    horizontalSelector.find(".filter_btn_left").on("click", function () {
      if (that.moveDistance + that.moveNum >= 0) {
        that.moveDistance = 0;
      } else {
        that.moveDistance = that.moveDistance + that.moveNum;
      }
      $(".filter_choose_box").attr(
        "style",
        `transform: translateX(${that.moveDistance}px)`
      );
      if (that.moveDistance >= 0) {
        horizontalSelector.find(".filter_btn_left").hide();
      }
      if (Math.abs(that.moveDistance) < that.removeDistance) {
        horizontalSelector.find(".filter_btn_right").css("display", "flex");
      }
    });
  }
  connectedCallback() {
    this.render({ list: new Array(11).fill(11) });
  }
}

window.customElements.define("horizontal-selector", HorizontalSelector);
