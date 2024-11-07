var userinfo = getCookie('user_info') ? JSON.parse(getCookie('user_info')) : '',
  curToken = getCookie("access_token") || '';

// get
function getReq(url, headers = {}) {
  return fetch(url, {
    method: "GET",
    headers: {
      ...getHeaders(),
      ...headers,
    }
  }).then((response) => response.json());
};

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
};

// getHeader
function getHeaders() {
  const headers = {
    "Content-Type": "application/json",
    "Request-App": "ai",
    "Request-Origin": "web",
    "Request-Language": getPreferredLanguage() == 'ja' ? 'jp' : getPreferredLanguage(),
  };
  if (curToken) {
    headers["Authorization"] = "Bearer " + curToken;
  }
  return headers;
};

async function sendPayDataOneTime(data = {}, src = '/api/stripe-pay/pay') {
  // const url = `${interHost}${src}`;
  const url = `${TOOL_API}api/order/stripe-generate`;
  const response = await fetch(url, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return response.json();
}

async function sendPayDataCreate(data = {}, src = '/stripe-pay-create') {
  // const url = `${interHost}${src}`;
  const url = `${TOOL_API}api/order/stripe-generate`;
  const response = await fetch(url, {
    method: "POST",
    headers: getHeaders(),  
    body: JSON.stringify(data),
  });
  return response.json();
}

function getKey() {
  return new Promise((resolve, reject) => {
    postReq(`${TOOL_API}api/stripe-pay/set`)
      .then(keyRes => {
        let pk = '';
        if (keyRes.code === 200) {
          const datas = keyRes.data || '';
          pk = datas.data || '';
        }
        resolve(pk);
      })
      .catch(error => {
        reject(error);
      });
  });
}

function showCarModal(type) {
  gtag('event', 'show_creditpricing_cart')
  closeCar()
  $('.dialog_pay_mask').addClass('show')
  $('.coupon_box').removeClass('paying')
  $('.m_paypal_content').removeClass('paying')
  $('.paypal_content').removeClass('paying')
  const isMob = document.body.clientWidth <= 1200;
  const submitBtn = !isMob ? document.getElementById('submit') : document.getElementById('mob_submit');
  submitBtn.classList.remove('loading')
  submitBtn.classList.remove('disabled')
  let targetClass = '';

  if (type == 'car') {
    targetClass = 'showpay';
  } else if (type == 'success') {
    targetClass = 'showsuc';
  } else if (type == 'err') {
    targetClass = 'showerr';
  }

  if (targetClass) {
    const className = !isMob ? '.dialog_pay.pc_modal' : '.dialog_pay_mob';
    $(className).addClass(targetClass);
  }
}

function closeCar() {
  if (paymentElement && paymentElement.clear) {
    paymentElement.clear()
  }
  $('.dialog_pay_mask').removeClass('show')
  $('.dialog_pay.pc_modal').removeClass('showpay showsuc showerr')
  $('.dialog_pay_mob').removeClass('showpay showsuc showerr')
  $('.coupon_box').removeClass('active')
  $('.total_price').removeClass('active')
  $('.coupon_price').html('')
  $('#input_code').val('')
  $('.coupon_err').hide()
  $('.remove_btn').hide()
  $('.apply_btn').html(`${payText.apply_btn}`)
  $('.dialog_pay_mob .coupon_box').removeClass('active')
  $('.dialog_pay_mob .total_price').removeClass('active')
  $('.dialog_pay_mob .coupon_price').html('')
  $('.dialog_pay_mob #input_code').val('')
  $('.dialog_pay_mob .coupon_err').hide()
  $('.dialog_pay_mob .remove_btn').hide()
  $('.dialog_pay_mob .apply_btn').html(`${payText.apply_btn}`)
  $('.paypal_content').show()
  $('.m_paypal_content').show()
  coupon_sale = null
  coupon_id = null
  promotion_code = null
}

function coupon(code, combo) {
  postReq(`${interHost}/api/stripe-pay/coupon`, { code, product_id: combo.id }).then(res => {
    if (res.code !== 200) {
      $('.coupon_err').show()
      $('.dialog_pay_mob .coupon_err').show()
      $('.paypal_content').show()
      $('.m_paypal_content').show()
      return
    }
    const coupon_price = res.data.salesPrice.toFixed(2)
    coupon_sale = coupon_price
    coupon_id = res.data.coupon_id
    promotion_code = code
    $('.coupon_price').html(`${combo.symbol}${formatterFix2.format(coupon_price)}`)
    $('.total_price').addClass('active')
    $('.apply_btn').html(`${payText.apply_btn_active}`)
    $('.dialog_pay_mob .coupon_price').html(`${combo.symbol}${formatterFix2.format(coupon_price)}`)
    $('.dialog_pay_mob .total_price').addClass('active')
    $('.dialog_pay_mob .apply_btn').html(`${payText.apply_btn_active}`)
    $('.paypal_content').hide()
    $('.m_paypal_content').hide()
  }).catch(err => {
    $('.coupon_err').show()
    $('.dialog_pay_mob .coupon_err').show()
  })
}

function formatCurrentDate(num) {
  const currentDate = new Date();

  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  currentDate.setMonth(currentDate.getMonth() + num);

  const formattedDate = new Intl.DateTimeFormat(localeArea[getPreferredLanguage()], options).format(currentDate);

  return formattedDate;
}

function changeCarInfo(combo, type) {
  // 暂不开放购买（等市场那边审核通过后再开放）
  $('#pc_car .title_text').html(`${payText.title1}`)
  $('#mob_car .title_text').html(`${payText.title1}`)
  $('#pc_car .product_info_des').html(payText.info_des1)
  $('#mob_car .product_info_des').html(payText.info_des1)
  $('#suc_info').html(payText.suc_des1)
  $('#m_suc_info').html(payText.suc_des1)
  if (combo.num == 1) {
    $('#pc_car .product_name .name').html(`${payText.plan1.replace("%s", formatter.format(combo.credit_num))}`)
    $('#mob_car .product_name .name').html(`${payText.plan1.replace("%s", formatter.format(combo.credit_num))}`)
    $('#suc_product_info').html(`${payText.plan1.replace("%s", formatter.format(combo.credit_num))}`)
    $('.dialog_pay_mob #suc_product_info').html(`${payText.plan1.replace("%s", formatter.format(combo.credit_num))}`)
    $('#pc_car #sub_date').html(`${payText.month}`)
    $('#mob_car #sub_date').html(`${payText.month}`)
  } else if (combo.num == 6) {
    $('#pc_car .product_name .name').html(`${payText.plan2.replace("%s", formatter.format(combo.credit_num))}`)
    $('#mob_car .product_name .name').html(`${payText.plan2.replace("%s", formatter.format(combo.credit_num))}`)
    $('#suc_product_info').html(`${payText.plan2.replace("%s", formatter.format(combo.credit_num))}`)
    $('.dialog_pay_mob #suc_product_info').html(`${payText.plan2.replace("%s", formatter.format(combo.credit_num))}`)
    $('#pc_car #sub_date').html(`${payText.sixm}`)
    $('#mob_car #sub_date').html(`${payText.sixm}`)
  } else if (combo.num == 12) {
    $('#pc_car .product_name .name').html(`${payText.plan3.replace("%s", formatter.format(combo.credit_num))}`)
    $('#mob_car .product_name .name').html(`${payText.plan3.replace("%s", formatter.format(combo.credit_num))}`)
    $('#suc_product_info').html(`${payText.plan3.replace("%s", formatter.format(combo.credit_num))}`)
    $('.dialog_pay_mob #suc_product_info').html(`${payText.plan3.replace("%s", formatter.format(combo.credit_num))}`)
    $('#pc_car #sub_date').html(`${payText.year}`)
    $('#mob_car #sub_date').html(`${payText.year}`)
  }
  if (combo.save) {
    $('#pc_car .product_name .price').html(`${combo.symbol}${formatterFix2.format(combo.save)}`)
    $('#pc_car .subtotal .price').html(`${combo.symbol}${formatterFix2.format(combo.save)}`)
    $('#mob_car .product_name .price').html(`${combo.symbol}${formatterFix2.format(combo.save)}`)
    $('#mob_car .subtotal .price').html(`${combo.symbol}${formatterFix2.format(combo.save)}`)
  } else {
    $('#pc_car .product_name .price').html(`${combo.symbol}${formatterFix2.format(combo.price)}`)
    $('#pc_car .subtotal .price').html(`${combo.symbol}${formatterFix2.format(combo.price)}`)
    $('#mob_car .product_name .price').html(`${combo.symbol}${formatterFix2.format(combo.price)}`)
    $('#mob_car .subtotal .price').html(`${combo.symbol}${formatterFix2.format(combo.price)}`)
  }
  if (combo.discount != 0) {
    $('#pc_car .discount').show()
    $('#pc_car .discount .off').html(`${payText.off.replace("%s", combo.discount)}`)
    $('#pc_car .discount .price').html(`-${combo.symbol}${formatterFix2.format(combo.discount_price)}`)
    $('#mob_car .discount').show()
    $('#mob_car .discount .off').html(`${payText.off.replace("%s", combo.discount)}`)
    $('#mob_car .discount .price').html(`-${combo.symbol}${formatterFix2.format(combo.discount_price)}`)
  } else {
    $('#pc_car .discount').hide()
    $('#mob_car .discount').hide()
  }
  $('#pc_car  #combo_total_price').html(`${combo.symbol}${formatterFix2.format(combo.price)}`)
  $('#pc_car #cur_date').html(`${formatCurrentDate(combo.num)}`)
  $('#pc_car #next_price').html(`${combo.symbol}${formatterFix2.format(combo.price)}`)
  $('#mob_car  #combo_total_price').html(`${combo.symbol}${formatterFix2.format(combo.price)}`)
  $('#mob_car #cur_date').html(`${formatCurrentDate(combo.num)}`)
  $('#mob_car #next_price').html(`${combo.symbol}${formatterFix2.format(combo.price)}`)
  if (type === 'credit') {
    $('#suc_info').html(payText.suc_des3)
    $('.dialog_pay_mob #suc_info').html(payText.suc_des3)
    $('#pc_car .title_text').html(payText.title2)
    $('#pc_car .product_name .name').html(`${formatter.format(combo.credit_num)} ${payText.credits}`)
    $('#mob_car .title_text').html(payText.title2)
    $('#mob_car .product_name .name').html(`${formatter.format(combo.credit_num)} ${payText.credits}`)
    $('#suc_product_info').html(`${formatter.format(combo.credit_num)} ${payText.credits}`)
    $('.dialog_pay_mob #suc_product_info').html(`${formatter.format(combo.credit_num)} ${payText.credits}`)
    $('#pc_car .product_info_des').html(payText.info_des2)
    $('#mob_car .product_info_des').html(payText.info_des2)
  }
  $('#suc_user_email').html(`${userinfo.email}`)
  $('#suc_product_credit').html(`${formatter.format(combo.credit_num)}`)
  $('.dialog_pay_mob #suc_user_email').html(`${userinfo.email}`)
  $('.dialog_pay_mob #suc_product_credit').html(`${formatter.format(combo.credit_num)}`)
  document.querySelector('.apply_btn').onclick = () => {
    const code = $('#input_code').val().trim()
    if (code) {
      coupon(code, combo)
    } else {
      $('.coupon_err').show()
    }
  }
  document.querySelector('.dialog_pay_mob .apply_btn').onclick = () => {
    const code = $('.dialog_pay_mob #input_code').val().trim()
    if (code) {
      coupon(code, combo)
    } else {
      $('.dialog_pay_mob .coupon_err').show()
    }
  }
  formEvent(combo, type)
  // initPaypal(combo, type)
  elements.update({
    amount: Math.ceil(combo.price * 100)
  });
  showCarModal('car')

  // if (document.body.clientWidth <= 1200) {
  //   userCoupon(type, $('.dialog_pay_mob #input_code'), $('.dialog_pay_mob .coupon_box'))
  // } else {
  //   userCoupon(type, $('#input_code'), $('.coupon_box'))
  // }
}

function userCoupon(type, el, activeEl) {
  const postData = {}
  if (type === 'credit') {
    postData.productType = 'ai-credits-disposable'
  } else {
    postData.productType = 'ai-credits-subscription'
  }
  postReq(`${interHost}/api/user/user-sign-coupon`, postData).then(res => {
    if (res.code === 200) {
      const { data } = res
      if (data && data.coupon) {
        activeEl.addClass('active')
        el.val(data.coupon)
        promotion_code = data.coupon
      }
    }
  })
}

function renderFaildTip() {
  let html = `
    <div class="failed_mask"></div>
    <div class="tip_failed">
      <div class="container">
        <div class="tip_close_icon"></div>
        <div class="tip_content">
          <div class="failed_icon"></div>
          <div class="failed_text">
            <div class="failed_title">${payText.tip_fail}</div>
            <div class="failed_des">${payText.tip_fail_des}</div>
          </div>
        </div>
        <div class="tip_btn">
          <div class="ok_btn">${payText.btn_ok}</div>
        </div>
      </div>
    </div>
  `

  $('.tip_failed_box').html(html)
  $('.ok_btn, .tip_close_icon').on('click', function () {
    window.location.reload()
  })
}

let elements, stripe, emailAddress, paymentElement, coupon_sale, coupon_id, promotion_code;

async function initPay(combo) {
  const key = await getKey()
  stripe = Stripe(key);
  const langList = {
    'ja': 'ja',
    'de': 'de',
    'en': 'en',
    'es': 'es',
    'fr': 'fr',
    'it': 'it',
    'pt': 'pt'
  }

  let options

  if (document.body.clientWidth <= 1200) {
    options = {
      mode: 'payment',
      paymentMethodTypes: ['card'],
      amount: Math.ceil(combo.price * 100),
      currency: combo.currency.toLowerCase(),
      setup_future_usage: 'off_session',
      locale: langList[getPreferredLanguage()],
      fonts: [{
        cssSrc: 'https://fonts.googleapis.com/css2?family=Lexend:wght@300&display=swap',
      }],
      appearance: {
        variables: {
          borderRadius: '3px',
          fontSizeBase: '0.7rem',
          colorText: '#A19CB5',
          fontSmooth: 'always',
          spacingGridRow: '25px',
          fontFamily: 'Lexend',
          colorDanger: '#FD3050',
          transition: 'none'
        },
        rules: {
          '.Input--invalid, .Input:focus': {
            boxShadow: 'none',
          },
          '.Input::placeholder': {
            color: '#A19CB5',
            fontSize: '0.8rem',
            fontFamily: 'Lexend',
          },
          '.Input': {
            boxShadow: 'none',
            paddingTop: '1.5rem',
            paddingBottom: '1.5rem',
            color: '#000000',
            fontFamily: 'Lexend',
            transition: 'none',
            fontWeight: 'bold'
          },
          '.Label': {
            textTransform: 'Capitalize',
          },
          '.Error': {
            color: '#FD3050'
          }
        }
      },
    };
    elements = stripe.elements(options);

    emailAddress = userinfo.email || ''
    const linkAuthenticationElement = elements.create("linkAuthentication", {
      defaultValues: {
        email: emailAddress
      }
    });

    linkAuthenticationElement.mount(".dialog_pay_mob #link-authentication-element");


    linkAuthenticationElement.on('change', (event) => {
      // emailAddress = event.value ? event.value.email : '';
      // 更新邮件地址
      linkAuthenticationElement.update({
        defaultValues: {
          email: emailAddress
        }
      });
    });

    paymentElement = elements.create('payment', {
      layout: {
        type: 'tabs',
        defaultCollapsed: false
      }
    });

    paymentElement.mount('.dialog_pay_mob #payment-element');
  } else {
    options = {
      mode: 'payment',
      paymentMethodTypes: ['card'],
      amount: Math.ceil(combo.price * 100),
      currency: combo.currency.toLowerCase(),
      setup_future_usage: 'off_session',
      locale: langList[getPreferredLanguage()],
      fonts: [{
        cssSrc: 'https://fonts.googleapis.com/css2?family=Lexend:wght@300&display=swap',
      }],
      appearance: {
        variables: {
          borderRadius: '3px',
          fontSizeBase: '0.8rem',
          colorText: '#A19CB5',
          fontSmooth: 'always',
          spacingGridRow: '25px',
          fontFamily: 'Lexend',
          colorDanger: '#FD3050',
          transition: 'none'
        },
        rules: {
          '.Input--invalid, .Input:focus': {
            boxShadow: 'none',
          },
          '.Input::placeholder': {
            color: '#A19CB5',
            fontSize: '0.8rem',
            fontFamily: 'Lexend',
          },
          '.Input': {
            boxShadow: 'none',
            paddingTop: '0.89rem',
            paddingBottom: '0.89rem',
            color: '#000000',
            fontFamily: 'Roboto',
            transition: 'none',
            fontWeight: 'bold',
            fontSize: '14px'
          },
          '.Label': {
            textTransform: 'Capitalize',
            color: '#1B1E37',
            opacity: '0.6',
            fontSize: '12px',
            fontFamily: 'Sora',
            fontWeight: '400'
          },
          '.Error': {
            color: '#FD3050',
            fontSize: '12px',
            fontFamily: 'Roboto',
            fontWeight: '400',
          }
        }
      },
    };
    elements = stripe.elements(options);

    emailAddress = userinfo.email || ''
    const linkAuthenticationElement = elements.create("linkAuthentication", {
      defaultValues: {
        email: emailAddress
      }
    });

    linkAuthenticationElement.mount("#link-authentication-element");


    linkAuthenticationElement.on('change', (event) => {
      // emailAddress = event.value ? event.value.email : '';
      // 更新邮件地址
      linkAuthenticationElement.update({
        defaultValues: {
          email: emailAddress
        }
      });
    });

    paymentElement = elements.create('payment', {
      layout: {
        type: 'tabs',
        defaultCollapsed: false
      }
    });

    paymentElement.mount('#payment-element');
  }

}

function formEvent(combo, type) {
  let form = document.getElementById('payment-form');
  let submitBtn = document.getElementById('submit');

  if (document.body.clientWidth <= 1200) {
    form = document.getElementById('mob_payment-form')
    submitBtn = document.getElementById('mob_submit')
  }

  const handleError = (error, type = '') => {
    submitBtn.classList.remove('loading')
    submitBtn.classList.remove('disabled')
    if (type === 'input') return;
    showCarModal('err')
  }

  submitBtn.onclick = async (event) => {
    event.preventDefault();
    gtag('event', 'buy_creditpricing_cart')

    const {
      error: submitError
    } = await elements.submit();
    if (submitError) {
      handleError(submitError, 'input');
      return;
    }
    submitBtn.classList.add('disabled')
    submitBtn.classList.add('loading')
    $('.coupon_box').addClass('paying')
    $('.m_paypal_content').addClass('paying')
    $('.paypal_content').addClass('paying')
    let clientSecret = null;
    let order_no
    let affData = getCookie('aff') ? JSON.parse(getCookie('aff')) : ''

    if (type) {
      try {
       const isSub = await postReq(`${TOOL_API}api/user/info`)
        if (isSub.code === 200) {
          if (isSub.data.is_credit_subscription != 1) {
            submitBtn.classList.remove('loading')
            renderFaildTip()
            return
          }
        } else {
          submitBtn.classList.remove('loading')
          renderFaildTip()
          return
        }
      } catch (error) {
        submitBtn.classList.remove('loading')
        renderFaildTip()
        return
      }
      try {
        const res = await sendPayDataOneTime({
          item: combo.id,
          product: 'ai-credits-disposable',
          st: getCookie('st') || '',
          insur: getCookie('insur') || '',
          aff: affData,
          page: getCookie('page') || 'crdonetime',
          coupon_price: coupon_sale || '',
          coupon_id: coupon_id || '',
          promotion_code: promotion_code || ''
        });
        ({
          clientSecret, order_no
        }) = res;
        if(res.data?.client_secret){
          clientSecret = res.data?.client_secret
        }
      } catch (error) {
        clientSecret = null;
      }
    } else {
      try {
        const res = await sendPayDataCreate({
          item: combo.id,
          product: 'ai-credits-subscription',
          st: getCookie('st') || '',
          insur: getCookie('insur') || '',
          aff: affData,
          page: getCookie('page') || 'crdsub',
          origin: 'web',
          coupon_price: coupon_sale || '',
          coupon_id: coupon_id || '',
          promotion_code: promotion_code || ''
        });
        ({
          clientSecret, order_no
        }) = res.data;
        if(res.data?.client_secret){
          clientSecret = res.data?.client_secret
        }
      } catch (error) {
        clientSecret = null;
      }
    }

    if (!clientSecret) {
      handleError(null);
      return;
    }

    const confirmPaymentRes = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${location.origin}/paysuccessful`,
        receipt_email: emailAddress,
      },
      redirect: 'if_required'
    });

    const {
      error
    } = confirmPaymentRes;

    if (error) {
      handleError(error);
    } else {
      let a_aid = '',
        chan = '',
        data1 = '',
        data2 = '',
        totalCost = combo.price,
        currency = combo.currency,
        productId = combo.id,
        orderId = order_no;
      if (affData) {
        a_aid = affData.a_aid
        chan = affData.chan
        data1 = affData.data1
        data2 = affData.data2
      }
      const data = {
        TotalCost: totalCost,
        Currency: currency,
        OrderID: orderId,
        ProductID: productId,
        AffiliateID: a_aid,
        ChannelID: chan,
        data1: data1,
        data2: data2
      }
      // postAff(data);
      // $('.close_icon').attr('data-info', 'success')
      showCarModal('success')
    }
  };
}

async function postAff(data) {
  let time = 0
  while (true) {
    try {
      const res = await postReq(`${interHost}/api/stripe-pay/go-aff`, data)
      if (res?.code === 200) {
        return
      } else {
        time++
        if (time >= 5) return
      }
    } catch (error) {
      time++
      if (time >= 5) return
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

// let paypal_script, paypal_btn

function createScript(isSub) { 
  // const clientId =
  //   location.host === "www.vidnoz.com"
  //     ? "AfllqWsA_FrC8U6MBRj8qqULVOGNfk__x1BA9NSQnu88EqBilojmUpXRs8_YRJElnr6Hu6GCDO0lsc5C"
  //     : "AWv_jjWq2899KylnKiyrwSU6vAXRNFVAG2z0fEPTZZHpqkT90sufWqapMrH2xmBAKKwp_fyisKSDXFWM";
  // const localLan = getPaypalLocale()
  // let paypal_src
  // if (isSub == 1) {
  //   paypal_src = `https://www.paypal.com/sdk/js?locale=${localLan}&client-id=${clientId}`
  // } else {
  //   paypal_src = `https://www.paypal.com/sdk/js?locale=${localLan}&client-id=${clientId}&vault=true&intent=subscription`
  // }
  // paypal_script = document.createElement('script');
  // paypal_script.setAttribute('src', paypal_src);
  // document.head.appendChild(paypal_script);
}

function initPaypal(combo, type) {
  // paypal_btn && paypal_btn.close()
  // if (type === 'credit') {
  //   // 订阅用户 走一次性支付
  //   createOrder(combo)
  // } else {
  //   // 非订阅用户 走订阅性支付
  //   createSubscription(combo)
  // }
}

// function createOrder(combo) {
//   paypal_btn = paypal.Buttons({
//     style: {
//       tagline: false,
//       layout: "horizontal",
//       color: "white",
//       label: "pay",
//       height: 44,
//     },
//     async createOrder() {
//       try {
//         const createOrderRes = await postReq(`${interHost}/api/paypal/create-order`, {
//           item: combo.id,
//           origin: "web",
//           product: 'ai-credits-disposable',
//           st: getCookie('st') || '',
//           insur: getCookie('insur') || '',
//           aff: getCookie('aff') ? JSON.parse(getCookie('aff')) : '',
//           page: getCookie('page') || 'crdonetime',
//         })
//         if (createOrderRes.code !== 200) {
//           showCarModal('err');
//         }
//         return createOrderRes.data.id;
//       } catch (error) {
//         showCarModal('err');
//       }
//     },
//     onApprove(data) {
//       return postReq(`${interHost}/api/paypal/capture-order`, {
//         order_id: data.orderID
//       }).then((captureRes) => {
//         if (captureRes.code === 200) {
//           showCarModal('success')
//         } else {
//           showCarModal('err');
//         }
//       }).catch((ero) => {
//         console.log(ero)
//         showCarModal('err');
//       });
//     },
//     onCancel: (data) => {
//       showCarModal('err');
//     },
//     onError: (err) => {
//       console.error(err);
//       showCarModal('err');
//     },
//   })
//   if (document.body.clientWidth <= 1200) {
//     paypal_btn.render('#m_paypal_btn')
//   } else {
//     paypal_btn.render('#paypal_btn')
//   }
// }

// function createSubscription(combo) {
//   postReq(`${interHost}/api/paypal/create-subscription`, {
//     item: combo.id,
//     product: 'ai-credits-subscription',
//     st: getCookie('st') || '',
//     insur: getCookie('insur') || '',
//     aff: getCookie('aff') ? JSON.parse(getCookie('aff')) : '',
//     page: getCookie('page') || 'crdsub',
//     origin: "web",
//   }).then(res => {
//     console.log(res)
//     if (res.code === 200) {
//       paypal_btn = paypal.Buttons({
//         style: {
//           tagline: false,
//           layout: "horizontal",
//           color: "white",
//           label: "pay",
//           height: 44,
//         },
//         createSubscription(data, actions) {
//           return actions.subscription.create({
//             plan_id: res.data.plan_id,
//             custom_id: res.data.order_no,
//           });
//         },
//         onApprove(data) {
//           let time = 0;
//           const retrieveSubscriptionFun = () => {
//             postReq(`${interHost}/api/paypal/retrieve-subscription`, {
//               subscription_id: data.subscriptionID
//             }).then(res => {
//               if (res.code === 200) {
//                 showCarModal('success')
//               } else if (res.code === 202) {
//                 setTimeout(() => {
//                   if (time < 5) {
//                     retrieveSubscriptionFun();
//                   } else {
//                     showCarModal('err');
//                   }
//                   time += 1;
//                 }, 10000);
//               } else {
//                 showCarModal('err');
//               }
//             }).catch(err => {
//               console.log(err)
//               showCarModal('err');
//             })
//           }
//           retrieveSubscriptionFun()
//         },
//         onCancel: (data) => {
//           showCarModal('err');
//         },
//         onError: (err) => {
//           console.error(err);
//           showCarModal('err');
//         },
//       })
//       if (document.body.clientWidth <= 1200) {
//         paypal_btn.render('#m_paypal_btn')
//       } else {
//         paypal_btn.render('#paypal_btn')
//       }
//     }
//   })

// }

// function getPaypalLocale() {
//   const langMap = {
//     en: "en_US",
//     de: "de_DE",
//     es: "es_ES",
//     fr: "fr_FR",
//     it: "it_IT",
//     ja: "ja_JP",
//     pt: "pt_PT",
//     kr: "ko_KR",
//     se: "sv_SE",
//     nl: "nl_NL",
//     tw: "zh_TW",
//     ar: "ar_AE ",
//   };
//   return langMap[getPreferredLanguage()] || "en_US";
// }


$(function () {
  showCreditBox()
$('#failed_pay, #success_pay, .dialog_pay_mob #failed_pay, .dialog_pay_mob #success_pay').on('click', function () {
  if (this.id === 'failed_pay') {
    showCarModal('car')
  } else {
    closeCar();
    window.location.reload()
    // window.location.href = history_url
    // window.location.href = "https://www.vidqu.ai/video-translator.html"
  }
})

$('.close_icon, .dialog_pay_mob .close_icon').on('click', function () {
  if ($('.dialog_pay').hasClass('showsuc') || $('.dialog_pay_mob').hasClass('showsuc')) {
    window.location.reload()
  }
  closeCar()
})

$('.coupon_btn, .dialog_pay_mob .coupon_btn').on('click', function () {
  if (document.body.clientWidth <= 1200) {
    if ($('.dialog_pay_mob .coupon_box').hasClass('active')) {
      $('.dialog_pay_mob .coupon_box').removeClass('active')
      $('.dialog_pay_mob .coupon_err').hide()
    } else {
      $('.dialog_pay_mob .coupon_box').addClass('active')
    }
    // $('.dialog_pay_mob .apply_btn').html(payText.apply_btn)
  } else {
    if ($('.coupon_box').hasClass('active')) {
      $('.coupon_box').removeClass('active')
      $('.coupon_err').hide()
    } else {
      $('.coupon_box').addClass('active')
    }
    // $('.apply_btn').html(payText.apply_btn)
  }
})

$('.remove_btn, .dialog_pay_mob .remove_btn').on('click', function () {
  $('.total_price').removeClass('active')
  $('.coupon_price').html('')
  $('#input_code').val('')
  $('.coupon_err').hide()
  $('.remove_btn').hide()
  $('.apply_btn').html(payText.apply_btn)
  $('.paypal_content').show()
  $('.m_paypal_content').show()
  $('.dialog_pay_mob .total_price').removeClass('active')
  $('.dialog_pay_mob .coupon_price').html('')
  $('.dialog_pay_mob #input_code').val('')
  $('.dialog_pay_mob .coupon_err').hide()
  $('.dialog_pay_mob .remove_btn').hide()
  $('.dialog_pay_mob .apply_btn').html(payText.apply_btn)
  coupon_sale = null
  coupon_id = null
  promotion_code = null
})

$('#input_code, .dialog_pay_mob #input_code').on('input', function () {
  if (document.body.clientWidth <= 1200) {
    if ($('.dialog_pay_mob #input_code').val()) {
      $('.dialog_pay_mob .remove_btn').show()
    } else {
      $('.dialog_pay_mob .remove_btn').hide()
    }
    $('.dialog_pay_mob .coupon_err').hide()
    $('.dialog_pay_mob .total_price').removeClass('active')
    $('.dialog_pay_mob .apply_btn').html(payText.apply_btn)
    $('.m_paypal_content').show()
  } else {
    if ($('#input_code').val()) {
      $('.remove_btn').show()
    } else {
      $('.remove_btn').hide()
    }
    $('.coupon_err').hide()
    $('.total_price').removeClass('active')
    $('.apply_btn').html(payText.apply_btn)
    $('.paypal_content').show()
  }
  coupon_sale = null
  coupon_id = null
  promotion_code = null
})
})