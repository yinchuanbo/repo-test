let env = location.host.includes("www.vidqu.ai") ? "pro" : "dev",
  isPro = env === "pro",lan = jsonData.aiImageGenerate.javascript;

function chickIsNotWork(){
  if(!navigator.onLine){
    $Popup({type: "error", errorType: "network"});
    return false;
  }else {
    return true;
  }
}

function getGeneratePromptRand(data) {
  return _$$.getComm("generate/prompt/rand", data).catch(()=>{
    if(!chickIsNotWork()) return false;
    $Popup({type: "error", errorType: "normal"});
  })
}

function getTaskList({page}) {
  return _$$.getComm("generate/image/history-task?page=" + page);
}

function postCreateTask(data) {
  return _$$.postComm("generate/image/create-task", data).catch(()=>{
    if(!chickIsNotWork()) return false;
    $Popup({type: "error", errorType: "normal"});
  })
}

let taskTimer = {};
function getTaskState(id) {
  return _$$.getComm("generate/image/task-state?task_id=" + id)
}

function postDeleteTask(data) {
  return _$$.postComm("generate/image/delete-task", data)
}

function postDeleteImage(data) {
  return _$$.postComm("generate/image/delete", data)
}

function postRetryTask(data) {
  return _$$.postComm("generate/image/retry-task", data)
}

function getImageParams({id, task_id}) {
  let str = ""
  if (id && task_id) {
    str = str + "id=" + id + '&task_id=' + task_id;
  } else if (id) {
    str = str + "id=" + id;
  } else if(task_id){
    str = str + "task_id=" + task_id;
  }
  return _$$.getComm("generate/image/params?" + str,)
}

function reloadImage(img) {
  // 记录重试次数，防止无限重试
  if (!img.retryCount) {
    img.retryCount = 0;
  }

  img.retryCount++;

  // 设置重试上限，例如 3 次
  if (img.retryCount <= 3) {
    // 使用 setTimeout 来增加加载间隔
    setTimeout(() => {
      img.src = img.src; // 重新加载同一张图片
    }, 2000); // 1 秒后重试
  } else {
    console.error('Image failed to load after 3 attempts:', img.src);
  }
}

class aiImageGenerate {
  constructor() {
    this.setInfoId = null;
    this.disabled = true;
    this.zoomInBoxEl = $(`.zoom-in-box`)[0];
    this.aiImageGeneratorBoxEl = $(`.ai-image-generatorBox`)[0];
    this.quantityBoxEl = $(`.ai-image-generatorBox .image-quantity-box`);
    this.modeBoxEl = $(`.ai-image-generatorBox .image-mode-box`);
    this.sizeBoxEl = $(`.ai-image-generatorBox .image-size-box`);
    this.generateBtnEl = $(`.ai-image-generatorBox .prompts-box .generate-btn`)[0];
    this.mGenerateBtnEl = $(`.ai-image-generatorBox .m-magic-box .m-generate-btn`)[0];
    this.promptsBoxEl =$(`.ai-image-generatorBox .prompts-box`)[0]
    this.infoImageEl = $(`.ai-image-generatorBox .info-img`)[0];
    this.infoMessageNameEl = $(`.ai-image-generatorBox .info-message-name`)[0];
    this.showContentBoxEl = $(`.ai-image-generatorBox .show-content-box`)[0];
    this.generationHistoryBoxEl = $(`.ai-image-generatorBox .generation-history-box`)[0];
    this.setInfoBoxBoxEl = $(`.ai-image-generatorBox .set-info-box`)[0];
    this.noDataBoxEl = $(`.ai-image-generatorBox .no-data-box`)[0];
    this.privateBoxEl = $(`.basic-settings-box .private-mode-box input`)[0];
    this.privateModeIconEl = $(`.ai-image-generatorBox .private-mode-box .private-mode-icon`)[0];
    this.promptsNumberEl = $(`.ai-image-generatorBox .generate-btn-box .txt-num`)[0];
    this.mPromptsNumberEl = $(`.ai-image-generatorBox .m-prompts-box .m-txt-num`)[0];

    this.negativePromptsTextareaEl = $(`.ai-image-generatorBox .negative-prompts-value-textarea`)[0];
    this.negativePromptsNumberEl = $(`.ai-image-generatorBox .negative-prompts-value-number`)[0];


    this.promptsTextareaTextEl = $(`.ai-image-generatorBox .prompts-textarea-text`)[0];
    this.promptsTextareaEl = $(`.ai-image-generatorBox .prompts-textarea`)[0];
    this.generationHistoryContentBoxEl = $(`.ai-image-generatorBox .generation-history-content-box`)[0];

    this.backTopEl = $(`.ai-image-generatorBox .back-top-icon`)[0];

    this.mPromptsTextareaTextEl = $(`.ai-image-generatorBox .m-prompts-textarea-text`)[0];
    this.mPromptsTextareaEl = $(`.ai-image-generatorBox .m-prompts-textarea`)[0];

    this.generateSelect1 = null;
    this.generateSelect2 = null;
    this.generateSelect3 = null;

    this.pageNum = 1;
    this.pageCount = 1;
    this.negativePromptsMaxLength = 500;
    this.negativePromptsTextareaValue = "";

    this.dataLoading = false;

    this.initTimer = 0;

    this.objImageSizeMap = {
      "1": [
        {value: "512 X 512 [ 1 : 1 ]", key: "512X512"},
        {value: "384 X 512 [ 3 : 4 ]", key: "384X512"},
        {value: "288 X 512 [ 9 : 16 ]", key: "288X512"},
        {value: "512 X 384 [ 4 : 3 ]", key: "512X384"},
        {value: "512 X 288 [ 16 : 9 ]", key: "512X288"},
      ],
      "2": [
        {value: "768 X 768 [ 1 : 1 ]", key: "768X768"},
        {value: "576 X 768 [ 3 : 4 ]", key: "576X768"},
        {value: "432 X 768 [ 9 : 16 ]", key: "432X768"},
        {value: "768 X 576 [ 4 : 3 ]", key: "768X576"},
        {value: "768 X 432 [ 16 : 9 ]", key: "768X432"},
      ],
      "3": [
        {value: "1024 X 1024 [ 1 : 1 ]", key: "1024X1024"},
        {value: "768 X 1024  [ 3 : 4 ]", key: "768X1024"},
        {value: "576 X 1024 [ 9 : 16 ]", key: "576X1024"},
        {value: "1024 X 768 [ 4 : 3 ]", key: "1024X768"},
        {value: "1024 X 576 [ 16 : 9 ]", key: "1024X576"},
      ]
    };
    this.list2 = [
      {value: lan.jsText1, key: "1"},
      {value: lan.jsText2, key: "2"},
      {value: lan.jsText3, key: "3"},
    ];
    this.list1 = [
      {value: 1, key: "1"},
      {value: 2, key: "2"},
      {value: 3, key: "3"},
      {value: 4, key: "4"},
    ];

    this.modelId = null;
    this.imageQuantityValue = null;
    this.imageModeValue = null;
    this.imageSizeValue = null;
    this.privateValue = false;
    this.promptsTextareaValue = "";
    this.magicLoading = false;
    this.modelLogo = null;
    this.modelName = null;

    this.showContentList = [];

    this.taskTimerList = [];
    this.isLoading = false;

    this.zoomInImageId = null;
    this.zoomInImageSrc = null;

    this.isScroll = false;
    // setCookie("access_token", "P4eLk04BxzOTXNsDx6j95YoIIInw_9gd_1726651063");
    gtag("event", "open_generator_page")
    this.init();
  }

  init() {
    const _this = this;
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);

    this.setInfoId = params.get('setInfoId') || null;
    this.dataLoading = true;
    getImageParams({id: this.setInfoId}).then((res) => {
      if (res.code === 200) {
        this.aiImageGeneratorBoxEl.classList.remove("dataLoading")
        this.dataLoading = false;
        this.remixItem(res.data);
      }
    })

    const list1Json = JSON.stringify(this.list1);
    this.generateSelect1 = $(`<generate-select title="${lan.jsText4}" activeKey="${this.imageQuantityValue}" list='${list1Json}'></generate-select>`);
    this.generateSelect1.on('selectItem', (e) => {
      gtag("event", "change_generator_quantity")
      this.imageQuantityValue = e.originalEvent.detail.key;
    });
    this.quantityBoxEl.append(this.generateSelect1)

    const list2Json = JSON.stringify(this.list2);
    this.generateSelect2 = $(`<generate-select title="${lan.jsText5}" activeKey="${this.imageModeValue}" list='${list2Json}'></generate-select>`);
    this.generateSelect2.on('selectItem', (e) => {
      gtag("event", "change_generator_mode")
      let _key = e.originalEvent.detail.key;
      this.imageModeValue = _key;
      this.imageSizeValue = this.generateSelect3[0].activeKey = this.objImageSizeMap[_key][0].key;
      this.generateSelect3[0].list = this.objImageSizeMap[_key];
      this.generateSelect3[0].changeShowItem()
    });
    this.modeBoxEl.append(this.generateSelect2)

    const list3Json = JSON.stringify(this.objImageSizeMap[this.list2[0].key]);
    this.generateSelect3 = $(`<generate-select title="${lan.jsText6}" activeKey='${this.imageSizeValue}' list='${list3Json}'></generate-select>`);
    this.generateSelect3.on('selectItem', (e) => {
      gtag("event", "change_generator_size")
      this.imageSizeValue = e.originalEvent.detail.key;
    });
    this.sizeBoxEl.append(this.generateSelect3)

    this.privateBoxEl.addEventListener('change', (e) => {
      gtag("event", "change_generator_private")
      this.privateValue = e.target.checked;
    });


    $(`.ai-image-generatorBox .prompts-box`)[0].addEventListener('click', (e) => {
      let _el = e.target;
      if (_el.classList.contains('prompts-box')) {
        this.promptsTextareaEl.focus();
      }
    });

    this.backTopEl.addEventListener('click', (e) => {
      this.backTopEl.style.display = "";
      if(isMobileDevice()){
        this.isScroll = true;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(()=>{
          this.isScroll = false;
        },1000)
      }else {
        this.generationHistoryContentBoxEl.scrollTop = 0;
      }
    });

    let isPromptsComposing = false;
    this.promptsTextareaEl.addEventListener('compositionstart', () => {
      isPromptsComposing = true;
    });
    this.promptsTextareaEl.addEventListener('compositionend', (e) => {
      isPromptsComposing = false;
      this.changePrompts(e.target)
    });
    this.promptsTextareaEl.addEventListener('input', (e) => {
      if (!isPromptsComposing) {
        this.changePrompts(e.target)
      }
    });

    let isPromptsComposing1 = false;
    this.mPromptsTextareaEl.addEventListener('compositionstart', () => {
      isPromptsComposing1 = true;
    });
    this.mPromptsTextareaEl.addEventListener('compositionend', (e) => {
      isPromptsComposing1 = false;
      this.changePrompts(e.target)
    });
    this.mPromptsTextareaEl.addEventListener('input', (e) => {
      if (!isPromptsComposing1) {
        this.changePrompts(e.target)
      }
    });


    setTimeout(() => {
      this.changeWindow()
    }, 10)

    window.addEventListener('resize', this.changeWindow.bind(this))
    document.addEventListener('click', this.selfAllClick.bind(this));

    this.generationHistoryContentBoxEl.addEventListener('click', (e) => {
      setTimeout(() => {
        this.generationClick(e)
      }, 0)
    });

    this.zoomInBoxEl.addEventListener('click', (e) => {
      setTimeout(() => {
        let _el = e.target;
        if (_el.classList.contains('share-icon')) {
          renderShare({image_id: this.zoomInImageId});
        }

        if (_el.classList.contains('download_icon')) {
          this.toDownload(this.zoomInImageSrc);
        }

        if (_el.classList.contains('close_icon') || _el.classList.contains('zoom-in-box')) {
          this.zoomInBoxEl.style.display = ''
        }
      }, 0)
    });

    this.setInfoBoxBoxEl.addEventListener('click', (e) => {
      setTimeout(() => {
        this.setInfoClick(e)
      }, 0)
    });

    let isComposing = false;
    this.negativePromptsTextareaEl.addEventListener('compositionstart', () => {
      isComposing = true;
    });
    this.negativePromptsTextareaEl.addEventListener('compositionend', (e) => {
      isComposing = false;
      this.changeNegativePrompts(e.target)
    });
    this.negativePromptsTextareaEl.addEventListener('input', (e) => {
      if (!isComposing) {
        this.changeNegativePrompts(e.target)
      }
    });


    $(`.ai-image-generatorBox .prompts-box .magic-icon`)[0].addEventListener('click', magicFn);
    $(`.ai-image-generatorBox .m-magic-box .m-magic-icon`)[0].addEventListener('click', magicFn);

    function magicFn(e){
      if (_this.magicLoading) return;
      gtag("event", "click_generator_aiprompts")
      let _el = e.target;
      _this.magicLoading = true;
      _el.classList.add("loading");
      getGeneratePromptRand().then((res) => {
        _this.magicLoading = false;
        _el.classList.remove("loading");
        if (res.code === 200) {
          _this.generateBtnEl.classList.remove('disable');
          _this.mGenerateBtnEl.classList.remove('disable');
          _this.changeAllPromptsTextarea(res.data.prompt);
          _this.promptsNumberEl.innerText = res.data.prompt.length + '/' + 2000;
          _this.mPromptsNumberEl.innerText = res.data.prompt.length + '/' + 2000;
        }
      }).catch((err) => {
        this.magicLoading = false;
        _el.classList.remove("loading");
      })
    }


    this.generateBtnEl.addEventListener('click', generateFn);
    this.mGenerateBtnEl.addEventListener('click', generateFn);

    function generateFn(e){
      if (_this.promptsTextareaValue.trim() === "" || _this.isLoading) {
        return false;
      }
      gtag("event", "click_generator_gen")
      let selfItem = {
        modelId: _this.modelId,
        quantity: Number(_this.imageQuantityValue),
        mode: Number(_this.imageModeValue),
        width: Number(_this.imageSizeValue.split("X")[0]),
        height: Number(_this.imageSizeValue.split("X")[1]),
        display: !_this.privateValue,
        prompt: _this.promptsTextareaValue.trim(),
        negative_prompt: _this.negativePromptsTextareaValue.trim(),
      };

      _this.isLoading = true;
      _this.generateBtnEl.classList.add('disable');
      _this.mGenerateBtnEl.classList.add('disable');

      _this.generateBtnEl.innerHTML = _this.mGenerateBtnEl.innerHTML = `${lan.jsText7}<span>.</span><span>.</span><span>.</span>`;

      postCreateTask(selfItem).then((res) => {
        _this.isLoading = false;
        _this.generateBtnEl.classList.remove('disable');
        _this.mGenerateBtnEl.classList.remove('disable');

        _this.generateBtnEl.innerHTML = _this.mGenerateBtnEl.innerHTML = lan.jsText8;

        if (res.code === 200) {
          _this.changeAllPromptsTextarea("")
          _this.promptsNumberEl.style.color =  _this.mPromptsNumberEl.style.color = "";
          _this.promptsNumberEl.style.opacity = _this.mPromptsNumberEl.style.opacity = ""
          _this.promptsNumberEl.innerText = _this.mPromptsNumberEl.innerText = '0/' + 2000;
          _this.generateBtnEl.classList.add('disable');
          _this.mGenerateBtnEl.classList.add('disable');
          selfItem.task_id = res.data.task_id;
          selfItem.isUpdate = true;
          selfItem.status = 1;
          selfItem.deleted = 0;
          selfItem.modelLogo = _this.modelLogo;
          selfItem.modelName = _this.modelName;
          _this.showContentList.unshift(selfItem);
          _this.showAllContent();
        }else if(res.code === 3017){
          gtag("event", "alert_generator_maxlimit")
          $Popup({type: "limit",errorType: "limit", limits: res.message });
        }else {
          gtag("event", "alert_generator_failed")
        }
      }).catch(() => {
        gtag("event", "alert_generator_failed")
        _this.isLoading = false;
        _this.generateBtnEl.classList.remove('disable');
        _this.mGenerateBtnEl.classList.remove('disable');

        _this.generateBtnEl.innerHTML = _this.mGenerateBtnEl.innerHTML = lan.jsText8;
      })
    }

    this.privateModeIconEl.addEventListener("mouseover", (e) => {
      if(isMobileDevice()) return false;
      let _tipsEl = e.target.parentNode.querySelector('.private-mode-icon-bubble');
      _tipsEl.style.display = 'flex'
    });
    this.privateModeIconEl.addEventListener("mouseout", (e) => {
      if(isMobileDevice()) return false;
      let _tipsEl = e.target.parentNode.querySelector('.private-mode-icon-bubble');
      _tipsEl.style.display = ''
    });

    this.privateModeIconEl.addEventListener("click", (e) => {
      let _tipsEl = e.target.parentNode.querySelector('.private-mode-icon-bubble');
      if (_tipsEl.style.display === '') {
        _tipsEl.style.display = 'flex'
      } else {
        _tipsEl.style.display = ''
      }
    })

    window.addEventListener('scroll', ()=>{
      if(this.isScroll || !isMobileDevice()) return false;

      if(window.scrollY > 100){
        this.backTopEl.style.display = "flex";
      }else {
        this.backTopEl.style.display = "";
      }
    });

    this.generationHistoryContentBoxEl.addEventListener('scroll', (e) => {
      const el = e.target;
      const distanceToBottom = el.scrollHeight - (el.scrollTop + el.clientHeight);
      if(el.scrollTop < 600){
        this.backTopEl.style.display = "";
      }else {
        this.backTopEl.style.display = "flex";
      }

      if (distanceToBottom <= 50 && this.pageCount > this.pageNum && !this.isLoading) {

        this.pageNum++
        this.isLoading = true;
        for (let i = 0; i < 2; i++) {
          const loadingItem = document.createElement('div');
          loadingItem.className = 'image-loading-box';
          loadingItem.innerHTML = `<div class="loading-top"></div>
                                      <div class="loading-bottom">
                                        <div class="loading-bottom-img"></div>
                                        <div class="loading-bottom-img"></div>
                                        <div class="loading-bottom-img"></div>
                                        <div class="loading-bottom-img"></div>
                                      </div>`
          this.generationHistoryContentBoxEl.appendChild(loadingItem);
        }

        getTaskList({page: this.pageNum}).then((_res) => {
          this.isLoading = false;
          if (_res.code === 200 && _res.data.list.length > 0) {
            this.pageCount = _res.data.pageCount;
            this.pageNum = _res.data.page;
            this.showContentList = [...this.showContentList, _res.data.list];

            this.generationHistoryContentBoxEl.querySelectorAll(`.image-loading-box`).forEach(el => el.remove());
            _res.data.list.forEach((_item) => {
              const generationItem = document.createElement('div');
              generationItem.className = 'generation-item';
              generationItem.setAttribute('task_id', _item.task_id || _item.id)
              let imageElements = '';
              _item.images.forEach((imgItem) => {
                imageElements += `<div class="item-image" data-image-id="${imgItem.id}">
                            <img crossorigin="anonymous" src="${imgItem.url}" onerror="reloadImage(this)" alt="">
                            <div class="MShow show-mobile-btn"></div>
                            <div class="img-tools">
                                <div class="MShow img-tools-zoomIn"></div>
                                <div class="img-tools-download"></div>
                                <div class="img-tools-share"></div>
                                <div class="img-tools-delete"></div>
                            </div>
                        </div>`
              })
              generationItem.innerHTML = this.getGenerationItemHtml(_item, imageElements);
              this.generationHistoryContentBoxEl.appendChild(generationItem);
            })

          }
        }).catch(() => {
          this.isLoading = false;
        })
      }
    });


    this.getFirstHFN();

    document.querySelector("my-component").addEventListener("loginsuccess", () => {
      this.getFirstHFN();
    })
  }

  getFirstHFN(){
    this.pageNum = 1;
    this.generationHistoryContentBoxEl.innerHTML = `<lottie-player src="/dist/img/IGhome/loading.json" background="transparent" speed="1" style="width: 160px; height: 160px;" loop autoplay class="lottie-loading"></lottie-player>`;
    getTaskList({page: this.pageNum}).then((_res) => {
      this.initTimer = 0;
      if (_res.code === 200 && _res.data.list.length > 0) {
        this.showContentList = _res.data.list;
        this.pageCount = _res.data.pageCount;
        this.pageNum = _res.data.page;
      }
      this.showAllContent(true);
    }).catch((error)=>{
      this.initTimer++
      if(this.initTimer < 4 ){
        setTimeout(()=>{
          this.getFirstHFN();
        },3000)
      }else {
        this.initTimer = 0;
      }
    })
  }

  showAllContent(isFirst = false) {
    if (this.showContentList.length > 0) {
      this.generationHistoryBoxEl.style.display = "";
      this.noDataBoxEl.style.display = "none";
    } else {
      this.generationHistoryBoxEl.style.display = "none";
      this.noDataBoxEl.style.display = "";
      return false
    }
    if (this.generationHistoryContentBoxEl.querySelector('.lottie-loading')) {
      this.generationHistoryContentBoxEl.innerHTML = '';
    }

    let allItemList = $(`.ai-image-generatorBox .generation-history-content-box .generation-item`).toArray();

    this.showContentList.forEach((item) => {
      let hasEl = null;
      let hasKey = allItemList.some((labelItem) => {
        if (Number(labelItem.getAttribute('task_id')) === item.task_id || Number(labelItem.getAttribute('task_id')) === item.id) {
          if (item?.isUpdate) hasEl = labelItem;
          return true
        } else {
          return false
        }
      })

      if (!hasKey) {
        this.addLabelItem(item, isFirst);
      } else if (hasEl) {
      }
    })

  }

  addLabelItem(item, isFirst) {
    const generationItem = document.createElement('div');
    generationItem.className = 'generation-item';
    generationItem.setAttribute('task_id', item.task_id || item.id)

    let imageElements = '';
    for (let i = 0; i < (item.quantity-item.deleted); i++) {
      if (item?.images && item?.images[i]) {
        imageElements += `<div class="item-image" data-image-id="${item.images[i].id}">
                            <img crossorigin="anonymous" src="${item.images[i].url}" onerror="reloadImage(this)" alt="">
                            <div class="MShow show-mobile-btn"></div>
                            <div class="img-tools">
                                <div class="MShow img-tools-zoomIn"></div>
                                <div class="img-tools-download"></div>
                                <div class="img-tools-share"></div>
                                <div class="img-tools-delete"></div>
                            </div>
                        </div>`
      } else if(item.status === 1){
        imageElements += `<div class="item-image generating">
                            <div class="generating-icon"></div>
                            <div class="generating-value">0%</div>
                        </div>`;
      }
    }

    generationItem.innerHTML = this.getGenerationItemHtml(item, imageElements);

    if (isFirst) {
      this.generationHistoryContentBoxEl.appendChild(generationItem);
    } else {
      const firstChild = this.generationHistoryContentBoxEl.firstChild;
      this.generationHistoryContentBoxEl.insertBefore(generationItem, firstChild);
    }

    let timerItem = {
      task_id: item.task_id || item.id,
      el: generationItem,
      quantity: item.quantity,
      deleted: item.deleted
    };

    if (item.quantity !== item?.images?.length && item.status === 1) {
      generationItem.classList.add('disable');
      generationItem.classList.add('generating');
      taskTimer[item.task_id] = 0;
      timerItem.timer = setInterval(() => {
        this.getTaskStateFn(timerItem);
      }, 5000)
    }

    this.taskTimerList.push(timerItem)
  }

  getTaskStateFn(item) {
    let _el = item.el;
    let imgList = _el.querySelectorAll(".item-image");
    let imageElements = '';
    getTaskState(item.task_id).then((res) => {
      if (res.code === 200 && res.data.status !== 1) {
        res.data.progress.forEach((progressValue, index) => {
          if (progressValue === 100 && res.data.images[index]?.url && !imgList[index].querySelector(".img-tools")) {

            this.showContentList.some((_selfItem)=>{
              if(_selfItem.task_id === item.task_id){
                _selfItem.images = res.data.images;
                return true
              }
            })

            imgList[index].classList.remove('generating');
            imgList[index].setAttribute('data-image-id',res.data.images[index].id)
            imgList[index].innerHTML = `<img crossorigin="anonymous" src="${res.data.images[index].url}" onerror="reloadImage(this)" alt="">
                                        <div class="MShow show-mobile-btn"></div>
                                        <div class="img-tools">
                                            <div class="MShow img-tools-zoomIn"></div>
                                            <div class="img-tools-download"></div>
                                            <div class="img-tools-share"></div>
                                            <div class="img-tools-delete"></div>
                                        </div>`
          } else if (imgList[index].querySelector(".generating-value")) {
            imgList[index].querySelector(".generating-value").innerText = progressValue + "%"
          }
        })
        if (res.data.status === 0 && item.timer) {
          delete taskTimer[item.task_id];
          _el.classList.remove('disable');
          _el.classList.remove('generating');
          clearInterval(item.timer);
        }
      }
      else if (res.data.status === 1) {
        for (let i = 0; i < (item.quantity - item.deleted); i++) {
          imgList[i].classList.remove('generating');
          imgList[i].classList.add('failed');
          if (!!res.data?.images && !!res.data?.images[i]) {
            imgList[i].classList.remove('failed');
            imgList[i].setAttribute('data-image-id',res.data.images[i].id)
            imageElements = `<img crossorigin="anonymous" src="${res.data.images[i].url}" onerror="reloadImage(this)" alt="">
                            <div class="MShow show-mobile-btn"></div>
                            <div class="img-tools">
                                <div class="MShow img-tools-zoomIn"></div>
                                <div class="img-tools-download"></div>
                                <div class="img-tools-share"></div>
                                <div class="img-tools-delete"></div>
                            </div>`
          }
          else {
            imageElements = `<div class="failed-text">${lan.jsText9}</div>
                            <div class="failed-retry-btn">${lan.jsText10}</div>`;
          }
          imgList[i].innerHTML = imageElements;
        }
        gtag("event", "alert_generator_failed")
        _el.classList.remove('generating');
        clearInterval(item.timer);
      }
    }).catch(()=>{
      taskTimer[item.task_id] = taskTimer[item.task_id] + 1;
      if( taskTimer[item.task_id] < 5 ) return false;
      for (let i = 0; i < (item.quantity - item.deleted); i++) {
        imgList[i].classList.remove('generating');
        imgList[i].classList.add('failed');
        imageElements = `<div class="failed-text">${lan.jsText9}</div>
                            <div class="failed-retry-btn">${lan.jsText10}</div>`;
        imgList[i].innerHTML = imageElements;
      }
      gtag("event", "alert_generator_failed")
      _el.classList.remove('disable');
      _el.classList.remove('generating');
      clearInterval(item.timer);
      delete taskTimer[item.task_id];
      if(!chickIsNotWork()) return false;
      $Popup({type: "error", errorType: "normal"});
    })
  }

  changeNegativePrompts(el) {
    let str = el.value;
    this.negativePromptsNumberEl.style.color = ""
    this.negativePromptsNumberEl.style.opacity = ""

    const allowedPattern = /[@#￥$%&*]+$/;
    if (allowedPattern.test(str)) {
      str = str.replace(/[@#$￥%&*]/g, '');
      el.value = str;
    }

    if (str.length >= this.negativePromptsMaxLength) {
      this.negativePromptsNumberEl.style.color = "red"
      this.negativePromptsNumberEl.style.opacity = "1"
      str = str.substring(0, this.negativePromptsMaxLength);
    }
    this.negativePromptsTextareaValue = el.value = str;

    this.negativePromptsNumberEl.innerText = str.length + '/' + this.negativePromptsMaxLength;
  }

  changePrompts(_el) {
    let text = _el.value;

    this.promptsNumberEl.style.color = this.mPromptsNumberEl.style.color = ""
    this.promptsNumberEl.style.opacity = this.mPromptsNumberEl.style.opacity = ""

    if (text.trim() === "") {
      this.generateBtnEl.classList.add('disable');
      this.mGenerateBtnEl.classList.add('disable');
    } else {
      this.generateBtnEl.classList.remove('disable');
      this.mGenerateBtnEl.classList.remove('disable');
    }

    const allowedPattern = /[@#$￥%&*]+$/;
    if (allowedPattern.test(text)) {
      text = text.replace(/[@#$￥%&*]/g, '');
      _el.value = text;
    }

    const remainingChars = 2000 - text.length;
    if (remainingChars <= 0) {
      this.promptsNumberEl.style.color = this.mPromptsNumberEl.style.color =  "red"
      this.promptsNumberEl.style.opacity = this.mPromptsNumberEl.style.opacity = "1"
      text = text.slice(0, 2000);
      _el.value = text;
    }

    this.changeAllPromptsTextarea(text)

    this.promptsNumberEl.innerText = this.mPromptsNumberEl.innerText = text.length + '/' + 2000;

    if(!isMobileDevice()){
      this.generationHistoryContentBoxEl.style.height = this.showContentBoxEl.offsetHeight - this.promptsBoxEl.offsetHeight - 81 + 'px'
    }
  }

  changeAllPromptsTextarea(str){
    this.promptsTextareaValue =
    this.mPromptsTextareaTextEl.innerHTML = this.mPromptsTextareaEl.value =
    this.promptsTextareaTextEl.innerText = this.promptsTextareaEl.value = str;
  }

  getGenerationItemHtml(item, imageElements) {
    let aimStr = "";
    let imageSize = "";
    let date = this.runDate(item.created_at || new Date().valueOf());
    switch (item.width + 'X' + item.height) {
      case '384X512':
      case '576X768':
      case '768X1024':
        imageSize = "size34"
        break;
      case '288X512':
      case '432X768':
      case '576X1024':
        imageSize = "size916"
        break;
      case '512X384':
      case '768X576':
      case '1024X768':
        imageSize = "size43"
        break;
      case '512X288':
      case '768X432':
      case '1024X576':
        imageSize = "size169"
        break;
    }

    aimStr = `<div class="item-tools">
        <div class="item-tools-reuse-icon">
          <div class="item-tools-reuse-tips">${lan.jsText11}</div>
        </div>
        <div class="item-tools-text-box close">
          <div class="item-tools-text">${item.prompt}</div>
          <div class="item-tools-text-copy"></div>
          <div class="item-tools-text-up"></div>
        </div>
        <div class="item-tools-model-box">
          <img src="${item.modelLogo || item.model.logo}" alt="">
            <span>${item.modelName || item.model.name}</span>
        </div>
        <div style="display: flex;align-items: center">
            <div class="item-tools-time-box">${ date }</div>
            <div class="item-tools-more-box">
                <div class="item-tools-more-btn"></div>
                <div class="item-tools-more-btn-box">
                    <div class="self-more-btn view">${lan.jsText12}</div>
                    <div class="self-more-btn share">${lan.jsText13}</div>
                    <div class="self-more-btn delete">${lan.jsText14}</div>
                </div>
            </div>
        </div>
      </div>
      <div class="item-image-box ${imageSize}">
        ${imageElements}
      </div>`

    return aimStr;
  }

  changeWindow() {
    this.showContentBoxEl.style.height = this.setInfoBoxBoxEl.offsetHeight + 'px';
  }

  selfAllClick(e) {
    this.closeOpen(e);
  }

  setInfoClick(e) {
    let _el = e.target;
    if (_el.classList.contains('open-self-btn')) {
      if(this.dataLoading) return false;
      gtag("event", "click_generator_advanced")
      $(`.ai-image-generatorBox .advanced-settings-box`)[0].classList.toggle("open")
    }

    if (_el.classList.contains('reset-defaults-btn')) {
      gtag("event", "click_generator_default")
      this.imageQuantityValue = this.generateSelect1[0].activeKey = this.list1[0].key;
      this.generateSelect1[0].list = this.list1;
      this.generateSelect1[0].changeShowItem()

      this.imageModeValue = this.generateSelect2[0].activeKey = this.list2[0].key;
      this.generateSelect2[0].list = this.list2;
      this.generateSelect2[0].changeShowItem()

      this.imageSizeValue = this.generateSelect3[0].activeKey = this.objImageSizeMap[this.list2[0].key][0].key;
      this.generateSelect3[0].list = this.objImageSizeMap[this.list2[0].key];
      this.generateSelect3[0].changeShowItem()

      this.privateBoxEl.checked = false;
      this.privateValue = false;

      this.negativePromptsTextareaValue = this.negativePromptsTextareaEl.value = ""
      this.negativePromptsNumberEl.innerText = '0/' + this.negativePromptsMaxLength;
      this.negativePromptsNumberEl.style.color = "";
    }

    if (_el.classList.contains('info-switch-btn')) {
      if(this.dataLoading) return false;
      gtag("event", "click_generator_switchbtn")

      $ModelSelector.showModelSelector(true);
      let _this = this;

      $("model-selector").off("getModelSelectorParams").on("getModelSelectorParams", function (e) {
        _this.modelId = e.originalEvent.detail.id;
        _this.modelName = _this.infoMessageNameEl.title = _this.infoMessageNameEl.innerText = e.originalEvent.detail.name;
        _this.modelLogo = _this.infoImageEl.src = e.originalEvent.detail.logo;
        $("model-selector")[0].showModelSelector(false);
      });
    }
  }

  generationClick(e) {
    if (this.isLoading) return false;
    let _el = e.target;

    if (_el.classList.contains('item-tools-more-btn')) {
      let _boxEl = _el.parentNode.querySelector(".item-tools-more-btn-box");
      if (_boxEl.style.display === '') {
        _boxEl.style.display = "block";
      } else {
        _boxEl.style.display = "";
      }
    }

    if (_el.classList.contains('self-more-btn')) {
      let taskEl = this.byClassNameGetEl(_el, "generation-item");
      let aimTaskId = Number(taskEl.getAttribute('task_id'));
      if (_el.classList.contains('view')) {
        this.toView(Number(aimTaskId));
      } else if (_el.classList.contains('delete')) {
        gtag("event", "click_generator_delbtn")
        this.toDeleteTask(aimTaskId, taskEl);
      } else if (_el.classList.contains('share')) {
        gtag("event", "click_generator_sharebtn")
        renderShare({task_id: aimTaskId});
      }
    }

    if (_el.classList.contains('item-tools-text-up')) {
      gtag("event", "click_generator_togglebtn")
      _el.parentNode.classList.toggle("close")
    }

    if (_el.classList.contains('item-tools-text-copy')) {
      gtag("event", "click_generator_copybtn")
      this.toCopy(_el);
    }

    if (_el.classList.contains('item-tools-reuse-icon')) {
      gtag("event", "click_generator_reusebtn")
      let str = _el.parentNode.querySelector(".item-tools-text").innerText;
      this.generateBtnEl.classList.remove('disable');
      this.mGenerateBtnEl.classList.remove('disable');
      this.promptsNumberEl.innerText = this.mPromptsNumberEl.innerText = str.length + '/' + 2000;
      this.promptsNumberEl.style.color = this.mPromptsNumberEl.style.color = str.length < 2000 ? "" : "red";
      this.promptsNumberEl.style.opacity = this.mPromptsNumberEl.style.opacity = str.length < 2000 ? "" : "1";

      this.changeAllPromptsTextarea(str)
    }

    if (_el.classList.contains('img-tools-download')) {
      gtag("event", "download_generator_img")
      let imageUrl = _el.parentNode.parentNode.querySelector("img").src;
      this.toDownload(imageUrl);
    }

    if (_el.classList.contains('img-tools-share')) {
      gtag("event", "share_generator_img")
      let id = Number(_el.parentNode.parentNode.getAttribute('data-image-id'));
      renderShare({image_id: id});
    }

    if (_el.classList.contains('show-mobile-btn')) {
      let toolEl = _el.parentNode.querySelector('.img-tools');
      if(_el.classList.contains('open')){
        _el.classList.remove('open')
        toolEl.classList.remove('open')
      }else{
        _el.classList.add('open')
        toolEl.classList.add('open')
      }
    }

    if (_el.classList.contains('img-tools-delete')) {
      let imageEl = _el.parentNode.parentNode;
      if(imageEl.classList.contains('failed')){
        return false;
      }
      gtag("event", "del_generator_img")
      let deletePopup = $Popup({
        title: lan.jsText15,
        content: lan.jsText16,
        closeBtn: lan.jsText14,
        applyBtn: lan.jsText17,
        autoClose: false,
        exist: "taskDeletePopup",
        onClose: () => {
          deletePopup.loading.start();
          let _imgId = Number(imageEl.getAttribute('data-image-id'));
          postDeleteImage({id: _imgId}).then((res) => {
            if (res.code === 200) {
              let taskEl = this.byClassNameGetEl(_el, "generation-item")
              let aimTaskId = Number(taskEl.getAttribute('task_id'));

              this.showContentList.some((_item, index) => {
                if (_item.id === aimTaskId || _item.task_id === aimTaskId) {
                  _item.deleted++
                  _item.images.some((_imgItem, _imgIndex) => {
                    if (_imgItem.id === _imgId) {
                      _item.images.splice(_imgIndex, 1);
                      return true
                    }
                  })

                  if (_item.images.length === 0 && _item.deleted === _item.quantity ) {
                    taskEl.remove();
                    this.showContentList.splice(index, 1);

                    setTimeout(()=>{
                      if (this.showContentList.length === 0) {
                        this.getFirstHFN();
                      }
                    },100)
                  }
                  return true;
                }
              })
              imageEl.remove();
              deletePopup.close();
            }
          }).catch((error)=>{
            deletePopup.close()
            if(!chickIsNotWork()) return false;
            $Popup({type: "error", errorType: "normal"});
          })
        },
        onApply: () => {
          deletePopup.close()
        },
      });
    }
    if (_el.classList.contains('failed-retry-btn')) {
      let taskEl = this.byClassNameGetEl(_el, "generation-item");
      let aimTaskId = Number(taskEl.getAttribute('task_id'));
      this.isLoading = true;
      postRetryTask({id: aimTaskId}).then((res) => {
        if (res.code === 200) {
          this.taskTimerList.some((item) => {
            if (item.task_id === aimTaskId) {
              let imageElements = '';
              for (let i = 0; i < (item.quantity - item.deleted); i++) {
                imageElements += `<div class="item-image generating">
                            <div class="generating-icon"></div>
                            <div class="generating-value">0%</div>
                        </div>`;
              }

              taskEl.querySelector('.item-image-box').innerHTML = imageElements;

              item.timer = setInterval(() => {
                this.getTaskStateFn(item);
              }, 5000)
              return true
            }
          })
        }
        this.isLoading = false;
      }).catch((err) => {
        this.isLoading = false;
        if(!chickIsNotWork()) return false;
        $Popup({type: "error", errorType: "normal"});
      })
    }

    if (!_el.classList.contains('failed-retry-btn') &&
      !_el.classList.contains('img-tools-delete') &&
      !_el.classList.contains('img-tools-share') &&
      !_el.classList.contains('show-mobile-btn') &&
      !_el.classList.contains('img-tools-download')) {
      let imageEl = _el.parentNode
      if(_el.classList.contains('img-tools-zoomIn')){
        imageEl = _el.parentNode.parentNode
      }
      let id = Number(imageEl.getAttribute('data-image-id'));
      if(id){
        gtag("event", "view_generator_img")
        this.zoomInImageId = id;
        this.zoomInImageSrc = this.zoomInBoxEl.querySelector('.zoom-in-image').src = imageEl.querySelector('img').src;
        this.zoomInBoxEl.style.display = 'block'
      }
    }
  }

  toView(taskId) {
    gtag("event", "click_generator_viewinfobtn")
    $(`#task-info`)[0].showLoading();
    $(`#task-info`)[0].bindCallBack((item) => {
      gtag("event", "click_generator_tryitbtn")
      this.remixItem(item);
      this.generationHistoryContentBoxEl.scrollTop = 0;
    });
    getImageParams({task_id: taskId}).then((res) => {
      if (res.code === 200) {
        gtag("event", "show_generator_viewinfo")
        $(`#task-info`)[0].showOverlay(res.data, taskId);
      } else {
        ToolTip({text: "", type: 'error'})
      }
    }).catch((err) => {
      $(`#task-info`)[0].hideOverlay();
      if(!chickIsNotWork()) return false;
      $Popup({type: "error", errorType: "normal"});
    })
  }

  toDownload(imageUrl) {
    if(!getCookie("access_token")){
      showLeadLogin("download");
    }else {
      fetch(imageUrl)
        .then(response => response.blob())
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          // 创建下载链接
          const a = document.createElement('a');
          a.href = url;
          a.download = lan.jsText18;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        })
        .catch(error => {
          console.error('There has been a problem with your fetch operation:', error);
        });
    }
  }
  remixItem(item) {
    this.modelId = item.model_id;
    this.modelLogo = this.infoImageEl.src = item.model?.logo;
    this.modelName = this.infoMessageNameEl.title = this.infoMessageNameEl.innerText = item.model?.name;
    this.imageQuantityValue = this.generateSelect1[0].activeKey = "" + item.quantity;
    this.generateSelect1[0].list = this.list1;
    this.generateSelect1[0].changeShowItem();

    this.imageModeValue = this.generateSelect2[0].activeKey = "" + item.mode;
    this.generateSelect2[0].list = this.list2;
    this.generateSelect2[0].changeShowItem();

    this.imageSizeValue = this.generateSelect3[0].activeKey = item.width + 'X' + item.height;
    this.generateSelect3[0].list = this.objImageSizeMap[item.mode];
    this.generateSelect3[0].changeShowItem();

    this.privateBoxEl.checked = this.privateValue = !item.display;

    this.negativePromptsTextareaValue = this.negativePromptsTextareaEl.value = item.negative_prompt;
    this.negativePromptsNumberEl.innerText = item.negative_prompt.length + '/' + this.negativePromptsMaxLength;


    let _text = item.prompt.trim();
    const remainingChars = 2000 - item.prompt.length;
    this.promptsNumberEl.style.color = this.mPromptsNumberEl.style.color = remainingChars <= 0 ? "red" : ""
    this.promptsNumberEl.style.opacity = this.mPromptsNumberEl.style.opacity = remainingChars <= 0 ? "1" : ""
    if (remainingChars <= 0) {
      _text = item.prompt.slice(0, 2000);
    }
    if (_text !== "") {
      this.generateBtnEl.classList.remove('disable');
      this.mGenerateBtnEl.classList.remove('disable');
    }

    this.changeAllPromptsTextarea(_text)
    this.promptsNumberEl.innerText = this.mPromptsNumberEl.innerText = item.prompt.length + '/' + 2000;
  }

  toDeleteTask(id, taskEl) {
    let deletePopup = $Popup({
      title: lan.jsText15,
      content: lan.jsText16,
      closeBtn: lan.jsText14,
      applyBtn: lan.jsText17,
      autoClose: false,
      exist: "taskDeletePopup",
      onClose: () => {
        deletePopup.loading.start();
        postDeleteTask({id}).then((res) => {
          if (res.code === 200) {
            deletePopup.close()
            taskEl.remove();
            this.showContentList.some((_item, index) => {
              if (_item.id === id || _item.task_id === id) {
                this.showContentList.splice(index, 1);

                setTimeout(()=>{
                  if (this.showContentList.length === 0) {
                    this.getFirstHFN();
                  }
                },100)
                return true;
              }
            })
          }
        }).catch(()=>{
          deletePopup.close()
          if(!chickIsNotWork()){
            return false
          }
          $Popup({type: "error", errorType: "normal"});
        })
      },
      onApply: () => {
        deletePopup.close()
      },
    });
  }

  runDate(date){
    const utcDate = new Date(date);
    const year = utcDate.getFullYear();
    const month = String(utcDate.getMonth() + 1).padStart(2, '0');
    const day = String(utcDate.getDate()).padStart(2, '0');
    const hours = String(utcDate.getHours()).padStart(2, '0');
    const minutes = String(utcDate.getMinutes()).padStart(2, '0');
    const seconds = String(utcDate.getSeconds()).padStart(2, '0');

    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
  }

  toCopy(_el) {
    let str = _el.parentNode.querySelector(".item-tools-text").innerText;
    _$$.copyText(str);
    ToolTip({text: lan.jsText19})
  }

  closeOpen(e) {
    let itemToolsMoreElList = $(`.generation-item .item-tools-more-btn-box`).toArray();
    itemToolsMoreElList.forEach((item) => {
      item.style.display = "";
    })

    if (e.target.classList.contains('self-more-btn') || e.target.classList.contains('item-tools-more-btn-box')) {
      itemToolsMoreElList.forEach((item) => {
        if (this.byClassNameGetEl(e.target, "item-tools-more-btn-box") === item) {
          item.style.display = "";
        }
      })
    }

    if (!e.target.classList.contains('private-mode-icon')) {
      this.privateModeIconEl.style.display = ''
    }
  }

  byClassNameGetEl(el, className) {
    if (el.classList.contains('ai-image-generatorBox')) return null;

    if (el.classList.contains(className)) {
      return el
    } else {
      return this.byClassNameGetEl(el.parentNode, className)
    }
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this.changeWindow);
    document.removeEventListener('click', this.selfClick);
  }
}

$(window).ready(function () {
  window.aiImageGenerate = new aiImageGenerate();
  $(".back_history").on("click", function () {
    showLeadLogin("back");
  })
});
