
// var BASE_API = location.host.includes("www.vidnoz.com")
//     ? "https://api.vidnoz.com/"
//     : "https://api-test.vidnoz.com/";
// var TOOL_API = location.host.includes("www.vidnoz.com")
//     ? "https://tool-api.vidnoz.com/"
//     : "https://tool-api-test.vidnoz.com/";
let BASE_API=TOOL_API


function getCreditsText(name, valData = {}, bool = false) {
    if (bool) {
        let num = valData.val;
        if (typeof num === 'string') {
            let strWithoutCommas = num.replace(/,/g, '');
            num = parseFloat(strWithoutCommas)
        }

        if (num > 1) {
            name += '_p'  // 单复数
        }
    }
    let str = textContentObj[name]
    for (let key in valData) {
        const regex = new RegExp(`{{${key}}}`, 'g')
        str = str.replace(regex, valData[key])
    }
    // console.log(str)
    return str
}

class CreditsCombo {
    constructor(el, mainObj,productData) {
        this.element = el;
        this.comboData = [];
        // this.initPay = initPay;
        this.m_actCombo = null;
        this.mainObj = mainObj;
        this.monthLists = [
            'Due_january',
            'Due_february',
            'Due_march',
            'Due_april',
            'Due_may',
            'Due_june',
            'Due_july',
            'Due_august',
            'Due_september',
            'Due_october',
            'Due_november',
            'Due_december'
        ],
        this.productData = productData;
        this.initComboList();
    }
    async initComboList() {
        // let arr = await this.getCombo();
        let arr = this.productData;
        this.setComboData(arr);
        this.mainObj.comboAndPackInitEnd('combo');
        initPay(arr[0]);
        this.eventInit(arr[0].country_gradient?.includes('T1') || true);
        this.element.removeClass('credits_container_loading');
        return
        let time = '15s';
        $(".tips_p2").text(getCreditsText('new_credits_p2', { val: 15 }))
        if (!arr[0].country_gradient.includes('T1')) {
            time = '10s';
            $(".tips_p2").text(getCreditsText('new_credits_p2', { val: 10 }))
        }
        $('#credits_table .credits_table_content1').html(
            `
                <div class="credits_table_item credits_table_item5 weight_higher">${getCreditsText('1_6faces')}</div>
                <div class="credits_table_item credits_table_item7">${getCreditsText('Credits', { val: 1 }, true)}</div>
                <div class="credits_table_item credits_table_item6 weight_higher">${getCreditsText('7_10faces')}</div>
                <div class="credits_table_item credits_table_item8">${getCreditsText('Credits', { val: 2 }, true)}</div>
            `
        )
        $('#credits_table .credits_table_content2').html(
            `
                <div class="credits_table_item credits_table_item9 weight_higher">${getCreditsText('1_3faces')}</div>
                <div class="credits_table_item credits_table_item11">${getCreditsText('Credits', { val: 5 }, true)}/${time}</div>
                <div class="credits_table_item credits_table_item10 weight_higher">${getCreditsText('4_10faces')}</div>
                <div class="credits_table_item credits_table_item12">${getCreditsText('4_faces_value')}/${time}</div>
            `
        )
    }
    eventInit(t1) {

        const that = this;
        // let planB = (credit_diversion === 'new' && t1)? "b" : ""  // AB分流

        let planB = mobile_diversion === 'new' ? "b" : "" //仅限mobile样式分流
        // let planB = ""
        this.element.find('.credit_subscribe').click(function () {
            if (!getCookie("access_token")) {
                showLoginWindow({
                    isReloading: true
                });
                return;
            }
            let id = $(this).attr("data-id");
            let obj = that.comboData.filter(item => item.id === id)[0];
            switch(obj.num) {
                case 1:
                    gtag("event", "pricing_monthly_buy");
                    break;
                case 6:
                    gtag("event", "pricing_halfyearly_buy");
                    break;
                case 12:
                    gtag("event", "pricing_yearly_buy");
                    break;
            }

            changeCarInfo(obj)
        })
        $('#credits_subscribe_page .m_credit_subscribe').click(function () {
            if (!getCookie("access_token")) {
                showLoginWindow({
                    isReloading: true
                });
                return;
            }
            let obj = that.m_actCombo;
            switch(obj.num) {
                case 1:
                    gtag("event", "pricing_monthly_buy");
                    break;
                case 6:
                    gtag("event", "pricing_halfyearly_buy");
                    break;
                case 12:
                    gtag("event", "pricing_yearly_buy");
                    break;
            }
            changeCarInfo(obj)
        })
        this.element.find('.credits_combo_item').click(function () {
            that.changeCombo_m(this)
        })
        that.changeCombo_m(this.element.find('.credit_credits_max')[0]);
        $('#credits_fiexd_container .credits_fiexd_submit').click(function () {
            if (that.mainObj.page !== 'combo') { return };
            if (!getCookie("access_token")) {
                showLoginWindow({
                    isReloading: true
                });
                return;
            }
            let obj = that.m_actCombo
            switch(obj.num) {
                case 1:
                    gtag("event", "pricing_monthly_buy");
                    break;
                case 6:
                    gtag("event", "pricing_halfyearly_buy");
                    break;
                case 12:
                    gtag("event", "pricing_yearly_buy");
                    break;
            }
            changeCarInfo(obj)
        })
        $('#credits_pack_combo_mB .credit_subscribe_mB').click(function () {
            if (that.mainObj.page !== 'combo') { return };
            if (!getCookie("access_token")) {
                showLoginWindow({
                    isReloading: true
                });
                return;
            }
            let obj = that.m_actCombo
            switch(obj.num) {
                case 1:
                    gtag("event", "pricing_monthly_buy");
                    break;
                case 6:
                    gtag("event", "pricing_halfyearly_buy");
                    break;
                case 12:
                    gtag("event", "pricing_yearly_buy");
                    break;
            }
            changeCarInfo(obj)
        })

        $(window).on("scroll", () => {
            const $fixEl = $(".credits_combo_container_wrapper")
            const scrollTop = $(window).scrollTop();
            const elementTop = $('.credits_combo_container_fix_placeholder').offset().top;

            if (elementTop < scrollTop) {
                $fixEl.addClass('fixed');
            } else {
                $fixEl.removeClass('fixed');
            }
        })
    }
    initComboBtn() {
        this.changeCombo_m(this.element.find('.credit_credits_max')[0]);
    }
    setComboData(data) {

        let credit_second = 10;
        this.comboData = data.sort((a, b) => a.credit_num - b.credit_num);
        // 移动端样式分流
        this.setMobile_planB(data);

        let planB = mobile_diversion === 'new' ? "b" : "" //仅限mobile样式分流

        if (this.comboData[0].country_gradient?.includes('T1') || true) {
            // if(credit_diversion === 'new'){
            //     gtag("event", "show_creditpriceb");
            // }else{
            //     gtag("event", "show_creditprice");
            // }

            // gtag("event", "show_creditprice"+planB);
            credit_second = 15
        }
        let htmlStr = ''
        this.comboData.forEach(item => {
            let credit_price_or = ''
            if (item.save && item.save !== item.price && parseFloat(item.save) !== 0) {
                credit_price_or = `<div class="credit_price_or">
                                    ${item.symbol}${item.save}
                                </div>`
            }

            let credit_credits_max = '';
            let comboName = '';
            let str = '';
            if (item.num === 1) {
                str = getCreditsText('Monthly');
                gtag("event", "pricing_monthly_show");
            } else if (item.num === 6) {
                str = getCreditsText('Half_Yearly');
                gtag("event", "pricing_halfyearly_show");
            } else {
                str = getCreditsText('Yearly');
                credit_credits_max = 'credit_credits_max'
                gtag("event", "pricing_yearly_show");
            }
            comboName = str;

            let discountStr = ''
            if (item.discount != '0' && item.discount != '') {
                discountStr = `<div class="credit_discount">
                                ${getCreditsText('discount', { val: item.discount })}
                              </div>`
            }

            htmlStr += `
            <div class="credits_combo_item ${credit_credits_max}">
                ${discountStr}
                <div class="credit_info">
                <div class="credit_name">
                    ${comboName}
                </div>
                <div class="credit_num">
                    ${getCreditsText('Credits', { val: formatter.format(item.credit_num) }, true)}
                </div>
                </div>
                <div class="credit_price_detail">
                <div class="credit_price">
                    <div class="credit_price_align">
                    <span>${item.symbol}</span>${item.price}
                    </div>
                    ${credit_price_or}
                </div>
                <div class="credit_price_each">
                    ${getCreditsText('credit_price', { val: item.symbol + '' + item.ai_per_minute_dollar })}
                </div>
                </div>
                <div class="credit_subscribe" data-id=${item.id}>
                    ${textContentObj.Subscribe}
                </div>
            </div>
            `
        })
        this.element.html(htmlStr)
    }
    getCombo() {
        return getProductData();
        return new Promise((resolve, reject) => {
            const that = this;
            // /ai/product/product-credits
            fetchPost('/api/products/lists', {
                action: 'video_translate_credits',
                lang: 'en'
                // diversion: credit_diversion === 'new'? "new" : ""
            }).then(res => {
                resolve(res.data)
            }).catch(err => {
                console.log(err)
                reject(res.data)
            })
        })
    }
    changeCombo_m(el) {
        const that = this;
        let credit_subscribe = $(el).find('.credit_subscribe');
        let id = credit_subscribe.attr("data-id");
        let obj = that.comboData.filter(item => item.id === id)[0];
        if (!obj) { return };
        that.m_actCombo = obj;

        that.element.find('.credits_combo_item').removeClass('credits_combo_item_act');
        $(el).addClass('credits_combo_item_act');
        let index = $(el).index();
        $(".credit_plan_info_cell").addClass("hidden")
        $(".credit_plan_info_row").each(function (i, e) {
            const $cell = $(e).find(".credit_plan_info_cell")
            $cell.eq(0).removeClass("hidden")
            $cell.eq(index + 1).removeClass("hidden")
        })

        $(".m_credit_subscribe_credits").text(getCreditsText('Credits_p', {
            val: parseInt(obj.credit_num),
        }))

        $(".m_credit_subscribe_price").html(`<span>${obj.symbol}</span>${obj.price}`)
        const $listPrice = $(".m_credit_subscribe_list_price")
        if(!!obj.save){
            $listPrice.text(obj.symbol + '' + obj.save)
        }else{
            $listPrice.hide()
        }
        if(obj.save === obj.price){
            $listPrice.hide()
        }else{
            $listPrice.show()
        }
        $(".m_credit_subscribe_due").text(that.getFutureYearAndMonth(obj.num))

        $('#credits_subscribe_page .m_credit_plan_content1').html(
            getCreditsText('m_your_plan4', {
                val: parseInt(obj.credit_num),
                val2: parseInt(obj.credit_num / 20)
            })
        )
        $('#credits_subscribe_page .m_credit_plan_content2').html(
            textContentObj.m_your_plan5
        )
        $('#credits_subscribe_page .m_credit_plan_content3').html(
            getCreditsText('m_your_plan6', { val: 500 })
        )
        $('#credits_subscribe_page .m_credit_plan_content4').html(
            getCreditsText('m_your_plan7', { val: 500 })
        )

        if (that.mainObj.page !== 'combo') { return };
        //
        $('#credits_fiexd_container .credits_fiexd_num').text(
            getCreditsText('Credits', { val: obj.credit_num }, true)
        )
        $('#credits_fiexd_container .credits_fiexd_price').html(
            `<span>${obj.symbol}</span>${obj.price}`
        )
        $('#credits_fiexd_container .credits_price_each').text(
            // getCreditsText('credit_price',{val: obj.symbol +''+ obj.ai_per_minute_dollar})
            that.getFutureYearAndMonth(obj.num)
        )
        let saveStr = obj.save ? obj.symbol + '' + obj.save : "";
        $('#credits_fiexd_container .credits_fiexd_price_or').text(
            saveStr
        )
        if(obj.save === obj.price){
            $('#credits_fiexd_container .credits_fiexd_price_or').hide()
        }else{
            $('#credits_fiexd_container .credits_fiexd_price_or').show()
        }
        $('#credits_fiexd_container .credits_fiexd_submit').text(
            getCreditsText('Subscribe')
        )
    }
    getFutureYearAndMonth(num) {
        const today = new Date()
        const future = new Date(today.getFullYear(), today.getMonth() + num, today.getDate())
        const futureYear = future.getFullYear()
        const futureMonth = future.getMonth() + 1
        const futureDate = future.getDate();
        return getCreditsText(this.monthLists[futureMonth - 1], { val: futureDate, val2: futureYear })
    }

    // 仅限移动端分流
    setMobile_planB(data){
        let that = this;
        let mobile_planB_dom = $('#credits_pack_combo_mB');
        mobile_planB_dom.removeClass('credits_container_loading')
        let comboDataPlanB = data.sort((a, b) => a.credit_num - b.credit_num);
        let htmlStr = ``;
        comboDataPlanB.forEach((item,index)=>{

            let comboName = '';
            let str = '';
            let checked_item = '';
            if (item.num === 1) {
                str = getCreditsText('Monthly');
            } else if (item.num === 6) {
                str = getCreditsText('Half_Yearly');
            } else {
                str = getCreditsText('Yearly');
                checked_item = 'checked_item'
            }
            comboName = str;

            let credit_price_or = ''
            if (item.save && item.save !== item.price && parseFloat(item.save) !== 0) {
                credit_price_or = `<div class="credit_price_or">
                                    ${item.symbol}${item.save}
                                </div>`
            }

            htmlStr += `
            <div class="select_item ${checked_item}" comboDataIndex="${index}">
              <div class="credit_discount">
                ${getCreditsText('discount', { val: item.discount })}
              </div>
              <div class="credit_name">
                ${comboName}
              </div>
              <div class="credit_price">
                <div class="credit_price_align">
                  <span>${item.symbol}</span>${item.price}
                </div>
                ${credit_price_or}
              </div>
              <img class="check_icon" src="/dist/img/ai-tool-pricing/icon_checked_mB.svg" />
            </div>
            `
        })
        mobile_planB_dom.find('.credits_combo_item_mb').html(htmlStr)


        that.setCheckedCombo(comboDataPlanB[comboDataPlanB.length - 1]);
        mobile_planB_dom.find('.select_item').click(function(){
            mobile_planB_dom.find('.select_item').removeClass('checked_item');
            $(this).addClass('checked_item');
            let index = $(this).attr('comboDataIndex');
            that.element.find('.credits_combo_item')[index].click();
            that.setCheckedCombo();
        })

    }
    setCheckedCombo(data){
        let that = this;
        let item = data || that.m_actCombo;
        let credit_second = 10;
        if (this.comboData[0].country_gradient?.includes('T1') || true) {
            credit_second = 15;
        }
        let mobile_planB_dom = $('#credits_pack_combo_mB');
        let creditsDom = mobile_planB_dom.find('.credit_info .credit_price_detail .credits_num_mB .text_value_mB');
        let unitDom = mobile_planB_dom.find('.credit_info .credit_price_detail .credits_unit_mB .text_value_mB');
        let swapPhotoDom = mobile_planB_dom.find('#Swap_photos_value');
        let swapVideoDom = mobile_planB_dom.find('#Swap_video_value');
        creditsDom.text(item.credit_num);
        unitDom.text(item.symbol + item.ai_per_minute_dollar);
        swapPhotoDom.text(item.credit_num);
        swapVideoDom.text(getCreditsText('value_min', { val: Math.round(item.credit_num / 5 * credit_second / 60) }))

        let Credits_renewed_time = mobile_planB_dom.find('#Credits_renewed_time');
        let str = '';
        if (item.num === 1) {
            str = getCreditsText('Credits_renewed_monthly');
        } else if (item.num === 6) {
            str = getCreditsText('Credits_renewed_half-yearly');
        } else {
            str = getCreditsText('Credits_renewed_yearly');
        }
        Credits_renewed_time.text(str)
    }
}

class CreditsPack {
    constructor(el, mainObj,productData) {
        this.element = el;
        this.packData = [];
        this.m_actPack = {};
        this.mainObj = mainObj;
        this.productData = productData;
        this.initPackData();
    }
    async initPackData() {
        // let arr = await this.getPackData();
        let arr = this.productData;
        this.setPackData(arr);

        initPay(arr[0]);
        this.mainObj.comboAndPackInitEnd('pack');
        this.eventInit()
        this.element.removeClass('credits_container_loading')
    }
    eventInit() {
        const that = this;
        this.element.find('.credit_subscribe').click(function () {
            if (!getCookie("access_token")) {
                showLoginWindow({
                    isReloading: true
                });
                return;
            }
            let id = $(this).attr("data-id");
            let obj = that.packData.filter(item => item.id === id)[0];
            gtag("event", `pack_credit${obj.credit_num}_buy`);
            changeCarInfo(obj, 'credit')
        })
        $('#credits_pack_page .m_credit_subscribe').click(function () {
            if (!getCookie("access_token")) {
                showLoginWindow({
                    isReloading: true
                });
                return;
            }
            let obj = that.m_actPack;
            gtag("event", `pack_credit${obj.credit_num}_buy`);
            changeCarInfo(obj, 'credit')
        })
        this.element.find('.credits_pack_item').click(function () {
            that.changePack_m(this)
        })
        that.changePack_m(this.element.find('.credits_pack_item')[2]);
        $('#credits_fiexd_container .credits_fiexd_submit').click(function () {
            if (that.mainObj.page !== 'pack') { return };
            if (!getCookie("access_token")) {
                showLoginWindow({
                    isReloading: true
                });
                return;
            }
            let obj = that.m_actPack
            gtag("event", `pack_credit${obj.credit_num}_buy`);
            changeCarInfo(obj, 'credit')
        })
    }
    initPackBtn() {
        this.changePack_m(this.element.find('.credits_pack_item')[2]);
    }
    setPackData(data) {
        this.packData = data.sort((a, b) => a.credit_num - b.credit_num);
        let htmlStr = ''
        this.packData.forEach(item => {
            let discountStr = ''
            if (item.discount && item.discount != '0') {
                discountStr = `<div class="credit_discount">
                                ${item.discount}% OFF
                              </div>`
            }
            let credit_price_or = `<div class="credit_price_or credit_price_none">
                ${item.symbol}${item.save}
            </div>`
            if (item.save !== item.price && item.save && parseFloat(item.save) !== 0) {
                credit_price_or = `<div class="credit_price_or">
                                    ${item.symbol}${item.save}
                                </div>`
            }
            htmlStr += `
            <div class="credits_pack_item">
                ${discountStr}
                <div class="credit_num">
                    ${getCreditsText('Credits', { val: formatter.format(item.credit_num) }, true)}
                </div>
                <div class="credit_price_detail">
                    <div class="credit_price">
                            ${credit_price_or}
                        <div class="credit_price_align">
                            <span>${item.symbol}</span>${item.price}
                        </div>
                    </div>
                    <div class="credit_price_each">
                        ${item.symbol}${item.ai_per_minute_dollar}/Credit
                    </div>
                    
                    <div class="m_credit_price_num">
                        <div class="credit_num">
                            ${getCreditsText('Credits', { val: formatter.format(item.credit_num) }, true)}
                        </div>
                        <div class="credit_price_each">
                            ${item.symbol}${item.ai_per_minute_dollar}/Credit
                        </div>
                    </div>
                </div>
                <div class="credit_subscribe" data-id=${item.id}>
                    ${getCreditsText('Buy_Now')}
                </div>
            </div>
            `
            gtag("event", `pack_credit${item.credit_num}_show`);
        })
        this.element.html(htmlStr)
    }
    getPackData() {
        // return new Promise((resolve, reject) => {
        //     const that = this;
        //     // /ai/product/product-credits
        //     fetchPost('ai/product/product-credits', {
        //         type: 2
        //     }).then(res => {
        //         resolve(res.data)
        //     }).catch(err => {
        //         console.log(err)
        //         reject(res.data)
        //     })
        // })
        return getProductData();
    }
    changePack_m(el) {
        const that = this;
        let credit_subscribe = $(el).find('.credit_subscribe');
        let id = credit_subscribe.attr("data-id");
        let obj = that.packData.filter(item => item.id === id)[0];
        if (!obj) { return };
        that.m_actPack = obj;

        that.element.find('.credits_pack_item').removeClass('credits_pack_item_act');
        $(el).addClass('credits_pack_item_act');

        $(".m_credit_subscribe_credits").text(getCreditsText('Credits_p', {
            val: parseInt(obj.credit_num),
        }))

        $(".m_credit_subscribe_due").text('')

        $(".m_credit_subscribe_price").html(`<span>${obj.symbol}</span>${obj.price}`)
        const $listPrice = $(".m_credit_subscribe_list_price")
        if(!!obj.save){
            $listPrice.text(obj.symbol + '' + obj.save)
        }else{
            $listPrice.hide()
        }
        if(obj.save === obj.price){
            $listPrice.hide()
        }else{
            $listPrice.show()
        }

        if (that.mainObj.page !== 'pack') { return };
        // console.log(that.mainObj.page)
        //
        $('#credits_fiexd_container .credits_fiexd_num').text(
            getCreditsText('Credits', { val: obj.credit_num }, true)
        )
        $('#credits_fiexd_container .credits_fiexd_price').html(
            `<span>${obj.symbol}</span>${obj.price}`
        )
        $('#credits_fiexd_container .credits_price_each').text(
            getCreditsText('credit_price', { val: obj.symbol + '' + obj.ai_per_minute_dollar })
        )
        let saveStr = obj.save ? obj.symbol + '' + obj.save : "";
        $('#credits_fiexd_container .credits_fiexd_price_or').text(
            saveStr
        )

        if(obj.save === obj.price){
            $('#credits_fiexd_container .credits_fiexd_price_or').hide()
        }else{
            $('#credits_fiexd_container .credits_fiexd_price_or').show()
        }

        $('#credits_fiexd_container .credits_fiexd_submit').text(
            getCreditsText('Buy_Now')
        )
    }
}


class CreditsTableAndFAQ {
    constructor(elData, mainObj) {
        this.table_element = elData.tableDom;
        this.FAQ_element = elData.FAQDom;
        this.initEvent()
    }
    initEvent() {
        const that = this;
        this.FAQ_element.find('.credits_FAQs_question_icon').on('click', function () {
            let item = $(this).closest('.credits_FAQs_item');
            that.openQuestion_FAQ(item)
        })
        this.FAQ_element.find('.credits_FAQs_answer_text span').on('click', function () {
            window.open('https://www.vidqu.ai/video-translator.html')
        })
    }
    setTable(data) {

    }
    setFAQ(data) {

    }
    openQuestion_FAQ(item) {
        if (item.attr('class').includes('credits_FAQs_act')) {
            item.removeClass('credits_FAQs_act')
        } else {
            item.addClass('credits_FAQs_act')
        }
    }
}

class MainInit {
    constructor(el) {
        this.creditsCombo = null;
        this.creditsPack = null;
        this.creditsTableAndFAQ = null;
        this.element = el;
        this.page = '';
        this.init()
    }
    async init() {
        let data = await getProductData();
        console.log(data.is_subscript)
        if(data.is_subscript === 1){
            $(".credits_pack_combo").addClass('subscribe')
            this.creditsCombo = new CreditsCombo(this.element.find('.credits_combo_container'), this,data.product);
            // this.creditsCombo.element.removeClass('credits_container_loading');
            this.setPage();
            this.creditsCombo.initComboBtn();
        }else{
            this.creditsPack = new CreditsPack(this.element.find('.credits_pack_container'), this,data.product);
            // this.creditsPack.element.removeClass('credits_container_loading');
            this.setPage('pack');
            this.creditsPack.initPackBtn();
        }

        this.creditsTableAndFAQ = new CreditsTableAndFAQ({
            tableDom: this.element.find('.credits_table'),
            FAQDom: this.element.find('.credits_FAQs')
        }, this);
    }
    comboAndPackInitEnd(type = 'pack') {
        const that = this;
        if (type === this.page) {
            setTimeout(() => {
                that.showMobileSubmit();
            }, 500)
        }
    }
    setPage(page) {
        this.page = page
        if (page === 'pack') {
            this.element.find('#credits_subscribe_page').css('display', 'none');
            this.element.find('#credits_pack_page').css('display', 'block');
            this.element.find('#credits_pack_combo_mB').css('display', 'none');
        } else {
            this.element.find('#credits_pack_page').css('display', 'none')
            if(mobile_diversion === 'new'){
                this.element.find('#credits_pack_combo_mB').css('display', 'block');
                this.element.find('#credits_subscribe_page').css('display', 'none');
            }else{
                this.element.find('#credits_pack_combo_mB').css('display', 'none');
                this.element.find('#credits_subscribe_page').css('display', 'block');
            }
        }
    }
    showMobileSubmit() {
        let pageHeigh = ($('.credits_pack_combo')[0].getBoundingClientRect()).height;
        let clearObj = null
        window.addEventListener('resize', function () {
            clearTimeout(clearObj)
            clearObj = setTimeout(() => {
                pageHeigh = ($('.credits_pack_combo')[0].getBoundingClientRect()).height;
            }, 500)
        })
        window.addEventListener('scroll', function () {
            var scrollPosition = window.scrollY;
            if (scrollPosition >= pageHeigh) {
                $('#credits_fiexd_container').css({
                    bottom: '0rem'
                })
            } else {
                $('#credits_fiexd_container').css({
                    bottom: '-3rem'
                })
            }
        });
    }
}

function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return encodeURI(r[2]);
    return null;
  }

// 获取套餐 
function getProductData(){
    return new Promise((resolve, reject) => {
        let renew = getUrlParam("renew") || 0;
        fetchGet(`api/products/lists?action=vidqu_credits&lang=en${renew?"&renew=1": ""}`, TOOL_API).then(res => {
            resolve(res.data)
        }).catch(err => {
            console.log(err)
            reject(res.data)
        })
    })
}



// 获取地址参数
function getParameterByName(name) {
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    const results = regex.exec(window.location.search);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}


function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }


// 移动端样式分流
function mobile_diversionInit(){
    let diversion = '';
    if(!isMobileDevice()){
        window.mobile_diversion = diversion
        return ''
    }
    diversion = getCookie('mobile_diversion');

    // 使用老样式
    diversion = 'old'

    if(!diversion){
        // 分流50%
        // if(Math.round(Math.random())===1){
        //     setCookie('mobile_diversion', 'new', 30 * 12)
        //     diversion = 'new'
        // }else{
        //     setCookie('mobile_diversion', 'old', 30 * 12)
        //     diversion = 'old'
        // }
    }else{
        // 使用老样式
        setCookie('mobile_diversion', 'old', 30 * 12)

        // setCookie('mobile_diversion', diversion, 30 * 12)
    }

    let st = getCookie('st') || '';
    if(diversion === 'new'){
        if(!st.endsWith('_fsmb')){
            setCookie('st', st + '_fsmb')
        }
    }else{
        if(st.endsWith('_fsmb')){
            st = st.split('_fsmb')[0]
            setCookie('st', st );
        }
    }

    window.mobile_diversion = diversion
}

class planTooltip {
    static initScroll = false
    constructor(el, content) {
        this.$el = $(el);
        if(!this.$el.length) return

        this.content = content;
        this.init()
        planTooltip.initScrollEvent()
    }

    init() {
        const $tooltip = $('<div class="plan__tooltip"></div>');
        $tooltip.html(this.content);

        this.$el.on('mouseenter touchstart', () => {
            this.$el.parent().append($tooltip);
            const rect = this.$el.get(0).getBoundingClientRect();
            const tooltipWidth = $tooltip.outerWidth();
            const tooltipHeight = $tooltip.outerHeight();

            let tooltipX = rect.left + (rect.width / 2) - (tooltipWidth / 2);
            let tooltipY = rect.bottom + 8;

            const overflowXRight = tooltipX + tooltipWidth - window.innerWidth;
            if (overflowXRight > 0) {
                tooltipX -= overflowXRight;
            }

            if (tooltipX < 0) {
                tooltipX = 19;
            }

            const overflowYBottom = tooltipY + tooltipHeight - window.innerHeight;
            if (overflowYBottom > 0) {
                tooltipY -= overflowYBottom;
            }

            $tooltip.css({
                transform: `translate(${tooltipX}px, ${tooltipY}px)`
            });

            $tooltip.stop().fadeIn(100)
        })

        this.$el.on('mouseleave', () => {
            $tooltip.stop().fadeOut(100, () => $tooltip.remove());
        })
    }

    static initScrollEvent() {
        if(this.initScroll) return
        this.initScroll = true
        $(window).on("scroll", () => {
            requestAnimationFrame(() => {
                const $allTooltips = $(".plan__tooltip");
                if(!$allTooltips.length) return
                $allTooltips.fadeOut(100, () => $allTooltips.remove());
            })
        })
    }
}

$(function () {
    // credit_diversion = getCookie('credit_diversion')
    // if(!credit_diversion){
    //     if(Math.round(Math.random())===1){
    //         setCookie('credit_diversion', 'new', 30 * 12)
    //         credit_diversion = 'new'
    //     }else{
    //         setCookie('credit_diversion', 'old', 30 * 12)
    //         credit_diversion = 'old'
    //     }
    // }else{
    //     setCookie('credit_diversion', credit_diversion, 30 * 12)
    // }


    const localPathKey = 'LOCAL_PATH_STORAGE'
    const localPathJSON = localStorage.getItem(localPathKey)
    const localPath = localPathJSON ? JSON.parse(localPathJSON) : []
    const $tr = $(".credits_table_container tbody tr").slice(0, 4)
    const $swap = $("#credit_plan_info_swap")
    if(localPath.length){
        $tr.show()
        $swap.show()
        new planTooltip('#face_swap_info', getCreditsText('info2'))
    }else{
        $tr.remove()
        $swap.remove()
    }

    $(".credit-pay-dialog").on('click', '#success_pay', function() {
        const backPage = ['/face-swap.html', '/video-translator.html', '/multiple-face-swap.html']
        const prevPath = localStorage.getItem(window.PRICING_HISTORY_PAGE)
        localStorage.removeItem(window.PRICING_HISTORY_PAGE)
        if(backPage.includes(prevPath)){
            window.location.href = prevPath
        }else{
            window.location.href = '/credit-history.html'
        }
    })

    new planTooltip('#translation_info', getCreditsText('info1'))

    // 仅移动端样式分流
    mobile_diversionInit();
    let gtagMobilePlanB = ''
    if(isMobileDevice()){
        gtagMobilePlanB = mobile_diversion === 'new'?'b':''
    }

    let login_Modal = document.querySelector('my-component');
    login_Modal.addEventListener('loginsuccess', function (event) {
        location.reload()
    })

    $(".signout").click(() => {
        // 退出登录了
        setTimeout(()=>{
            location.reload()
        },50);
    });
    let mainObj = new MainInit($('.credits_combo_main_page'))
    if (getCookie("access_token")) {
        fetchPost('api/user/info',null,TOOL_API).then(res => {
             changeHeaderCredit(res.data.credit);
            if (getParameterByName("st") === "creditrenew") {
                gtag('event', 'show_creditprice_subscribe'+gtagMobilePlanB)
            } else {
                if (res.data.is_credit_subscription === 1) {
                    gtag('event', 'show_creditprice_purchase')
                } else {
                    gtag('event', 'show_creditprice_subscribe'+gtagMobilePlanB)
                }
            }
        })
    } else {
        gtag('event', 'show_creditprice_subscribe'+gtagMobilePlanB)
    }
});

// $(function () {
//     $('.head-portrait .appsigninbtn').click(function (e) {
//         e.stopPropagation()
//         e.preventDefault()
//     })
//     let toSignInNode = document.querySelector('.signinnavbtn.appsigninbtn')
//     let toSignUpNode = document.querySelector('.signupnavbtn.appsignupbtn')
//     toSignInNode.setAttribute('product-position', 'isTool-no-reloading')
//     toSignUpNode.setAttribute('product-position', 'isTool-no-reloading')
// })