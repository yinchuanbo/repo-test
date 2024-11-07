class ModelSeletor extends HTMLElement {
  constructor(options) {
    super();
    this.tagList = [];
    this.modelList = [];
    this.nomore = false;
    this.totalPage = 1;
    this.params = {
      page: 1,
      pageSize: 12,
      tag: null,
      offset: null,
    }
  }
  /**
   * html
   * @param {Object} options
   *
   */
  html(options) {
    const { title = "Select Model" } = options;
    let html = "";
    this.modelList.forEach((model) => {
      html += `<div class="model_selector_item" data-id="${model.id}">
        <div class="coverimg_box default_img">
          <img src="${model.logo}" class="coverimg" crossOrigin="anonymous" />
        </div>
        <div class="model_selector_text">
          <div class="model_name">${model.name}</div>
          <div class="model_apply_btn">${jsonData.IGpopup.apply}</div>
        </div>
      </div>`;
    });
    return `
      <div class="modal modal-wrapper normal model_select">
        <div class="modal-container">
          <div class="popup-title">
            <div class="title-left">
              ${title}
            </div>
          <div class="title-right close_model_selector">
            <img src="/dist/img/IGcommon/popup_x_icon.svg" alt="close button" />
          </div>
        </div>
        <div class="popup-content">
          <div class="model_seletor">
            <horizontal-selector></horizontal-selector>
            <div class="model_selector_box show_loading">
              <div class="model_selector_list">${html}</div>
              <lottie-player src="/dist/img/IGhome/loading.json" background="transparent" speed="1" style="width: 160px; height: 160px;" loop autoplay class="lottie-loading"></lottie-player>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  // reRender list
  reRenderListhtml(list, isClear) {
    let html = ``;
    list.forEach((model) => {
      html += `<div class="model_selector_item" data-id="${model.id}">
        <div class="coverimg_box default_img">
          <img src="${model.logo}" class="coverimg" style="opacity: ${model.logo ? 1 : 0
        }" />
        </div>
        <div class="model_selector_text">
          <div class="model_name">${model.name}</div>
          <div class="model_apply_btn">Apply</div>
        </div>
      </div>`;
    });
    if (isClear) {
      $(this).find(".model_selector_list").html(html);
    } else {
      $(this).find(".model_selector_list").append(html)
    }
    this.events();
  }
  // get tags
  getTags() {
    const that = this;
    fetchGet("generate/model/tag-list").then((res) => {
      that.tagList = res.data;
      that.horizontalSelector[0].render({
        list: that.tagList,
      });
      that.getModelList(true);
    });
  }
  // get lists
  getModelList(isClear, callback) {
    const that = this;
    if (that.totalPage < that.params.page && !isClear) {
      that.params.page = that.totalPage;
      return
    };
    const params = setParams(that.params);
    that.showModelSelectorLoading(true);
    fetchGet(`generate/model/list${params}`).then((res) => {
      that.totalPage = res.data.pageCount;
      that.modelList = [...that.modelList, ...res.data.list];
      that.showModelSelectorLoading(false);
      that.reRenderListhtml(res.data.list, isClear);
      callback?.();
    });
  }
  //show model loading
  showModelSelectorLoading(flag) {
    if (flag) {
      $(this).find(".model_selector_box").addClass(this.params.page === 1 ? "show_loading" : "show_more_loading");
    } else {
      $(this).find(".model_selector_box").removeClass("show_loading").removeClass("show_more_loading");
    }
  }
  //show model selector
  showModelSelector(flag) {
    if (flag) {
      if (this.tagList.length === 0) {
        this.getTags();
      }
      $(this).addClass("show_wrapper");
    } else {
      $(this).removeClass("show_wrapper");
    }
  }
  /**
   * render html
   * @param {Object} options
   *
   */
  render(options) {
    this.innerHTML = this.html(options);
    this.events();
  }
  events() {
    const that = this;
    const close_model_selector = $(this).find(".close_model_selector");
    const model_select = $(this).find(".model_select");
    const filter_btn_right = $(this).find(".filter_btn_right");
    close_model_selector.off("click").on("click", function () {
      that.showModelSelector(false);
      gtag("event", "close_generator_modelwin")
    });
    model_select.off("mouseup").on("mouseup", function (event) {
      if (!$(event.target).closest(".modal-container").length) {
        that.showModelSelector(false);
      }
    })
    that.horizontalSelector = $(this).find("horizontal-selector");
    that.horizontalSelector
      .off("igSelectorItemclick")
      .on("igSelectorItemclick", function (e) {
        // listParams.tag = e.originalEvent.detail.key;
        const key = e.originalEvent.detail.key === "All" ? null : e.originalEvent.detail.key;
        that.params.tag = key;
        that.params.page = 1;
        gtag("event", "change_generator_modelcate")
        that.getModelList(true);
      });
    $(that).find(".model_selector_item").on("click", function () {
      const id = $(this).attr("data-id");
      const detail = that.modelList.find(el => el.id == id);
      gtag("event", "change_generator_model")
      that.dispatchEvent(
        new CustomEvent("getModelSelectorParams", {
          detail,
        })
      );
    });
    if (judgeClient() !== "pc") {
      filter_btn_right.off("mouseup")
      .on("mouseup", function (e) {
        const header = $(that)
        if (!header) throw new Error("don't have this element");
        if (header.hasClass("hidden_menu")) {
          header?.removeClass("hidden_menu");
        } else {
          header?.addClass("hidden_menu");
        }
      });
    }
  }
  connectedCallback() {
    $(this).addClass("hidden_menu");
    this.render({});
    this.listenScroll();
    window.$ModelSelector = $("model-selector")[0];
  }
  listenScroll() {
    const that = this;
    const model_seletor = document.querySelector(".model_seletor");
    const throttle = (fun, delay) => {
      let last = 0;
      let timer = null;
      return function throttled(...args) {
        const now = Date.now();
        if (now - last >= delay) {
          clearTimeout(timer);
          fun.apply(this, args);
          last = now;
        } else if (!timer) {
          timer = setTimeout(() => {
            fun.apply(this, args);
            timer = null;
          }, delay - (now - last));
        }
      };
    };

    const handleScroll = function () {
      const scrollTop = model_seletor.scrollTop;
      const vHeight = model_seletor.clientHeight;
      const pageHeight = model_seletor.scrollHeight;
      if (vHeight + scrollTop >= pageHeight - 100) {
        that.params.page++;
        that.getModelList();
      }
    };
    model_seletor.removeEventListener("scroll", throttle(handleScroll, 500));
    model_seletor.addEventListener("scroll", throttle(handleScroll, 500));
  }
  static get observedAttributes() {
    return ["my-attr"];
  }
}

window.customElements.define("model-selector", ModelSeletor);
