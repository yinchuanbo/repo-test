$(document).ready(function () {
  const localeLan = {
    ja: "jp",
    de: "de",
    en: "en",
    es: "es",
    fr: "fr",
    it: "it",
    pt: "pt",
  };

  let products = [];
  const historyText = jsonData.creditHistory["javascript"];

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

  function showList(type) {
    $(".history_content").removeClass("payment credit record");
    if (type === "payment") {
      $(".history_content").addClass("payment");
    } else if (type === "credit") {
      $(".history_content").addClass("credit");
    } else if (type === "record") {
      $(".history_content").addClass("record");
    }
  }

  function formatTimestamp(time) {
    const date = new Date(time * 1000);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    const formattedDate = `${year}/${month}/${day} ${hours}:${minutes}`;
    return formattedDate;
  }

  function getScrollDistanceToBottom() {
    const documentHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    );

    const viewportHeight =
      window.innerHeight || document.documentElement.clientHeight;
    const scrollPosition =
      window.scrollY ||
      window.pageYOffset ||
      document.body.scrollTop + (document.documentElement.scrollTop || 0);
    const distanceToBottom = documentHeight - (viewportHeight + scrollPosition);

    return distanceToBottom;
  }

  function scrollGetMore(tab) {
    if (tab == "payment" && loadPayMore) {
      getPayHistory(payPage);
    } else if (tab == "credit" && loadCreditMore) {
      getCreditHistory(creditPage);
    }
  }

  function getCountryConfig() {
    return new Promise((resolve, reject) => {
      fetchPost("ai/tool/videoface-user", {}, TOOL_API)
        .then((res) => {
          if (res.code === 200) {
            userRuleConfig = res.data;
            $("#banner_num").text(res.data.credit || 0);
            if (res.data.is_subscriber === 1) {
              $(".credits_buy_pro").show();
              $(".credits_buy").hide();
            }
            $("#go_credits .credits_num span").text(res.data.credit);
            resolve();
          } else {
            console.error("Error getCountryConfig", res);
            ToolTip({
              type: "error",
              title: textContentObj.Failed,
              content: textContentObj.processImage,
              btn: textContentObj.ok,
            });
            reject();
          }
        })
        .catch((err) => {
          console.error(err);
          ToolTip({
            type: "error",
            title: textContentObj.errorNetworkTitle,
            content: textContentObj.errorNetwork,
            btn: textContentObj.ok,
          });
          reject();
        });
    });
  }

  async function getPayHistory(page) {
    if (payLoding) return;
    payLoding = true;
    try {
      const res = await fetchGet(
        `api/vidqu-credits/payments?page=${page || ""}`
      );
      if (res.code === 200) {
        const { data } = res;
        if (data.page) {
          loadPayMore = true;
          payPage = data.page;
        } else {
          loadPayMore = false;
        }
        payList = [...payList, ...data.list];
        const cancel_item = payList.find(
          (item) => item.product === "ai-vidqu-credits-subscription"
        );
        cancelInfo = cancel_item;
        for (const item of payList) {
          if (item.id === cancel_item.id) {
            item.cancel = true;
            break;
          }
        }
        // 下个周期是否订阅
        if (data.next_subscription_status) {
          isCancelShow = 1;
        } else {
          isCancelShow = 0;
        }
        if (!payList.length) {
          showList("record");
        } else {
          renderPayList(data.list);
        }
      }
    } catch (err) {
      console.log(err);
    } finally {
      payLoding = false;
    }
  }

  function renderPayList(list) {
    if (!list.length) return;
    let html = "";
    list.forEach((item) => {
      let paid = historyText.paid;
      let pay_type;
      if (item.pay_status == 2) {
        paid = historyText.unpaid;
      }
      if (item.product == "ai-vidqu-credits-disposable") {
        pay_type = `${formatter.format(item.credit)} ${historyText.credits}`;
      } else if (item.num == 1) {
        pay_type = historyText.type1;
      } else if (item.num == 6) {
        pay_type = historyText.type2;
      } else if (item.num == 12) {
        pay_type = historyText.type3;
      } else {
        pay_type = historyText.unknown;
      }
      if (item.cancel && isCancelShow) {
        gtag("event", "show_account_cancel");
      }
      html += `
          <div class="list_item">
            <div class="pay_info_l">
              <div class="pay_type">${pay_type}</div>
              <div class="date_no">
                <span class="date">${formatTimestamp(item.created_at)}</span>
                <span class="no">${historyText.trID} ${item.order_no}</span>
                ${
                  item.cancel && isCancelShow
                    ? `<span class="cancel_btn">${historyText.cancel}</span>`
                    : ""
                }
                ${
                  item.cancel
                    ? `<a target="_blank" href=${"/pricing.html?st=creditrenew&renew=1"} class="renew_btn" style="${
                        item.cancel && !isCancelShow ? "" : "display: none;"
                      }">${historyText.renew}</a>`
                    : ""
                }
              </div>
            </div>
            <div class="pay_info_r">
              <div class="pay_state">${paid}</div>
              <div class="pay_price">${item.symbol}${item.price}</div>
            </div>
          </div>
        `;
        
      if (item.cancel && !isCancelShow) {
        gtag("event", "show_account_renew");
      }
    });

    $(".payment_list").append(html);
    $(".cancel_btn").on("click", function () {
      const date = cancelInfo.created_at * 1000;
      $(".dis_subtime").text(formateDisSubDate(date, cancelInfo.num));
      showCancelDialog("confirm");
      gtag("event", "click_account_cancel");
    });
    $(".renew_btn").on("click", function () {
      setSessionCookie("st", "creditrenew");
      gtag("event", "click_account_renew");
    });
    showList("payment");
  }

  function formateDisSubDate(date, num) {
    const currentDate = new Date(date);
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    currentDate.setMonth(currentDate.getMonth() + num);

    const formattedDate = new Intl.DateTimeFormat(
      localeArea[getPreferredLanguage()],
      options
    ).format(currentDate);

    return formattedDate;
  }

  async function getCreditHistory(page) {
    if (creditLoading) return;
    creditLoading = true;
    try {
      const res = await fetchGet(`api/vidqu-credits?page=${page || ""}`);
      if (res.code === 200) {
        const { data } = res;
        if (data.page) {
          loadCreditMore = true;
          creditPage = data.page;
        } else {
          loadCreditMore = false;
        }
        creditList = [...creditList, ...data.list];
        if (!creditList.length) {
          showList("record");
        } else {
          renderCreditList(data.list);
        }
      }
    } catch (err) {
      console.log(err);
    } finally {
      creditLoading = false;
    }
  }

  function renderCreditList(list) {
    if (!list.length) return;
    let html = "";
    list.forEach((item) => {
      let type_text;
      if (item.type == 21) {
        type_text = historyText.type4;
      } else if (item.type == 20) {
        type_text = historyText.type5;
      } else if (item.type == 14) {
        type_text = historyText.type13;
      } else if (item.type == 22 || item.type == 23) {
        type_text = historyText.type14;
      } else if (item.type == 10) {
        if (item.project.type == "ai-sockpuppet-credits-subscription") {
          if (item.project.num == 1) {
            type_text = historyText.type6;
          } else if (item.project.num == 6) {
            type_text = historyText.type7;
          } else if (item.project.num == 12) {
            type_text = historyText.type8;
          }
        } else {
          type_text = historyText.type9;
        }
      } else if (item.type == 100) {
        type_text = historyText.type10;
      } else if (item.type == 13) {
        type_text = historyText.type11;
      } else if (item.type == 11) {
        type_text = historyText.type12;
      } else if (item.type == 12 || item.type == 121) {
        type_text = historyText.type15;
      } else {
        type_text = historyText.other; // other type
      }
      html += `
        <div class="list_item">
          <div class="use_info_l">
            <div class="use_type">${type_text}</div>
            <div class="use_date">${formatTimestamp(item.created_at)}</div>
          </div>
          <div class="use_info_r">
            <div class="use_num"><span class="credit_change">${
              String(item.credit).includes("-")
                ? item.credit
                : `+${item.credit}`
            }</span> ${
        item.credit == 1 || item.credit == -1
          ? historyText.credit
          : historyText.credits
      }</div>
          </div>
        </div>
      `;
    });

    $(".credit_list").append(html);
  }

  async function getProductCredit() {
    const res = await fetchGet(
      `api/products/lists?action=vidqu_credits&lang=en`,
      TOOL_API
    );
    if (res.code === 200) {
      const {
        data: { product },
      } = res;
      products = product;
      if (!product?.length) return;
      credit150 = product[0];
      credit500 = product[1];
      credit1500 = product[2];
      initCreditItem(credit150, "credit150", product[0].id);
      initCreditItem(credit500, "credit500", product[1].id);
      initCreditItem(credit1500, "credit1500", product[2].id);
      $(".more_credits_list_item .buy_btn").click(function () {
        if (!getCookie("access_token")) {
          showLoginWindow({
            isReloading: true,
          });
          return;
        }
        let data0id = $(this).attr("data-id");
        let obj = products.find((item) => item.id === data0id);
        gtag("event", `buyclick_account_${obj.credit_num}credit`);
        changeCarInfo(obj, "credit");
      });

      $(".m_buy_btn").on("click", function () {
        let id;
        $(".more_credits_list_item").each((i, item) => {
          if ($(item).hasClass("active")) {
            id = item.id;
          }
        });
        if (id == "credit150") {
          changeCarInfo(credit150, "credit");
          gtag("event", "buyclick_account_150credit");
        } else if (id == "credit500") {
          changeCarInfo(credit500, "credit");
          gtag("event", "buyclick_account_500credit");
        } else if (id == "credit1500") {
          changeCarInfo(credit1500, "credit");
          gtag("event", "buyclick_account_1500credit");
        }
      });
      $(".more_credits_list_item").on("click", function () {
        $(".more_credits_list_item").removeClass("active");
        $(this).addClass("active");
      });
      if (window?.userRuleConfig?.is_subscriber == 1) {
        gtag("event", "show_account_onetime");
        $(".more_credits").show();
      }
    }
  }

  function showCancelDialog(type) {
    $(".dialog_pay_mask").addClass("show");
    $(".cancel_dialog").removeClass("showconfirm showsuc showerr");
    switch (type) {
      case "confirm":
        $(".cancel_dialog").addClass("showconfirm");
        gtag("event", "show_account_cancelpop");
        break;
      case "suc":
        $(".cancel_dialog").addClass("showsuc");
        gtag("event", "show_account_cancelsucc");
        break;
      case "fail":
        $(".cancel_dialog").addClass("showerr");
        gtag("event", "show_account_cancelfail");
        break;
    }
  }

  function closeCancelDialog() {
    $(".dialog_pay_mask").removeClass("show");
    $(".cancel_dialog").removeClass("showconfirm showsuc showerr");
  }

  function initCreditItem(combo, id, dataId) {
    $(`#${id} .buy_num`).html(
      `${formatter.format(combo.credit_num)} ${historyText.credits}`
    );
    $(`#${id} .buy_btn`).attr("data-id", dataId);
    $(`#${id} .cur_price .symbol`).html(`${combo.symbol}`);
    $(`#${id} .cur_price .price_num`).html(`${combo.price}`);
    $(`#${id} .one_price .symbol`).html(`${combo.symbol}`);
    $(`#${id} .one_price .price_num`).html(`${combo.ai_per_minute_dollar}`);
    $(`#${id} .orign_price`).html(`${combo.symbol}${combo.save}`);
    if (combo.discount != 0) {
      $(`#${id} .item_tip`).html(`${combo.discount}${historyText.off}`);
    } else {
      $(`#${id} .item_tip`).hide();
      $(`#${id} .orign_price`).hide();
      $(`#${id} .m_orign_price`).hide();
    }
    if (document.body.clientWidth < 1200) {
      $(`#${id} .m_buy_num`).html(`${combo.credit_num} ${historyText.credits}`);
      $(`#${id} .m_orign_price`).html(`${combo.symbol}${combo.save}`);
    }
  }

  let ispro,
    payPage,
    creditPage,
    credit150,
    credit500,
    credit1500,
    payLoding = false,
    creditLoading = false,
    payList = [],
    creditList = [],
    loadPayMore = false,
    loadCreditMore = false,
    cancelInfo,
    creditInfo = {},
    isCancelShow;

  async function initPage() {
    gtag("event", "show_account_history");
    if (!getCookie("access_token")) {
      window.location.href = "/";
    } else {
      // await showCreditDes()
      // fetchPost(`ai/tool/videoface-user`).then((res) => {
      //   if (res.code === 200) {
      //     const { data } = res;
      //     creditInfo = data;
      //     $(".credits_num").text(formatter.format(data.credit));
      //     if (data.credit > 0) {
      //       $(".more_credits").show();
      //     }
      //     // createScript(data.sockpuppet_user_type)
      //   }
      // });
      getCountryConfig();
      await getProductCredit();
      await getCreditHistory();
      await getPayHistory();
      // 关闭全局loading；
      $("#credit_history_loading").hide();
      initPay(credit150);
      // initPaypal(credit150, 'credit')
    }
  }

  $(function () {
    initPage();
  });

  window.addEventListener("scroll", async function () {
    const bottom = getScrollDistanceToBottom();
    let bottomHeight;
    if (document.body.clientWidth < 1200) {
      bottomHeight = 2153;
    } else {
      bottomHeight = 657;
    }
    if (bottom <= bottomHeight) {
      if ($("#payment_history").hasClass("active")) {
        scrollGetMore("payment");
      } else {
        scrollGetMore("credit");
      }
    }
  });

  $(".cancel_close, .no_confirm_btn, .ok_btn, .fail_btn").on(
    "click",
    function () {
      closeCancelDialog();
      if ($(this).hasClass("no_confirm_btn")) {
        gtag("event", "click_account_cancelpop_notnow");
      } else if ($(this).hasClass("ok_btn")) {
        gtag("event", "click_account_cancelsucc_ok");
      } else if ($(this).hasClass("fail_btn")) {
        gtag("event", "click_account_cancelfail_tryagain");
      }
    }
  );

  // 取消订阅
  $(".confirm_btn").on("click", function () {
    gtag("event", "click_account_cancelpop_confirm");
    $(".confirm_btn").addClass("loading");
    fetchPost(`api/order/cancel-stripe-subscript`, {}, TOOL_API)
      .then((res) => {
        if (res.code === 200) {
          showCancelDialog("suc");
          $(".cancel_btn").remove();
          $(".renew_btn").show();
          gtag("event", "show_credithistory_renew");
        } else {
          showCancelDialog("fail");
        }
        $(".confirm_btn").removeClass("loading");
      })
      .catch((err) => {
        showCancelDialog("fail");
        $(".confirm_btn").removeClass("loading");
      });
  });

  $(".tab_item").on("click", function () {
    $(".tab_item").removeClass("active");
    $(this).addClass("active");
    if (this.id.includes("payment")) {
      if (payList.length) {
        showList("payment");
      } else {
        showList("record");
      }
    } else {
      if (creditList.length) {
        showList("credit");
      } else {
        showList("record");
      }
    }
  });

  $(".credits_buy").on("click", function () {
    window.open("/pricing.html");
    setSessionCookie("st", "accountbuy");
    gtag("event", "click_account_buybtn");
  });

  $(".close_icon, .dialog_pay_mob .close_icon").on("click", function () {
    if (
      $(".dialog_pay").hasClass("showsuc") ||
      $(".dialog_pay_mob").hasClass("showsuc")
    ) {
      window.location.reload();
    }
    gtag("event", "close_creditpricing_cart");
  });
  
  $(".signout").click(() => {
    setTimeout(()=>{
        location.reload()
    },50);
});
});
