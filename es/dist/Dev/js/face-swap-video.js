// 處理語言文件替換參數
function setTextContentObj(name, valData = {}) {
  let str = lan.faceSwapPop[name];
  for (let key in valData) {
    const regex = new RegExp(`{{${key}}}`, "g");
    str = str.replace(regex, valData[key]);
  }
  // console.log(str)
  return str;
}
let show_priority = 0;
let actTab = "tab_photo";
var videoPhotoDownloadData = null;
var video_task_id = null;
class UploadVideo {
  constructor(element, submit) {
    const that = this;
    this.element = element;
    this.videoSrc = "";
    this.videoCoverImgSrc = "";
    this.uploadFile = null;
    this.submit = submit;
    this.data = {
      loading: false,
    };
    // this.testUploadFilevideoDuration = null;
    this.demo_key = "";
    this.demo_coverImg = "";
    this.videoDuration = 0; // time
    this.videoLoading = true; //是否可以上传视频
    this.videoData = new Proxy(this.data, {
      set(target, prop, value) {
        target[prop] = value;
        if (prop === "loading") {
          if (!value) {
            that.element.find(".stepBox").removeClass("loading").find(".step_V").addClass("active");
            that.element.find(".step_loadingBox").hide();
            that.element.find(".btn_changer").show();
            that.element.find(".icon_video").show();
            $("#video_Face_swapper_container .spread_box_container").removeClass("uploading");
            if(that.uploadFile !== null){
              that.submit.isSubmit();
            }
          } else {
            $("#video_Face_swapper_container .change_video_btn").addClass("disabled");
            that.element.find(".stepBox").addClass("loading");
            that.element.find(".step_loadingBox").css("display", "flex");
            console.log("that.submit.submitData.isVideoSubmit", that.submit.submitData.isVideoSubmit);
            if (!that.submit.submitData.isVideoSubmit) {
              $("#video_Face_swapper_container .spread_box_container").addClass("uploading");
            }
          }
        }
        return true;
      },
      get(target, prop) {
        return target[prop];
      },
    });
  }

  // 监听文件拖入与点击选择文件
  initFace() {
    let input = $(".video_upload_input_step1");
    this.element.find(".stepBox").on("dragover", (e) => {
      e.preventDefault(); // 阻止默认行为
      e.stopPropagation();
      this.showDropMask(true);
      this.submit.imgContainer.showDropMask(false);
    });
    this.element.find(".uploader_loading_mask").on("dragleave", (e) => {
      e.preventDefault(); // 阻止默认行为
      e.stopPropagation();
      this.showDropMask(false);
    });
    this.element.find(".uploader_loading_mask").on("drop", (e) => {
      e.preventDefault(); // 阻止默认行为
      e.stopPropagation();
      this.showDropMask(false);
      this.submit.imgContainer.showDropMask(false);
      let file = e.originalEvent.dataTransfer.files[0];
      gtag("event", "up_faceswap_videostep1");
      this.uploadFileRule(file);
    });
    this.element.find(".step_V").on("click", () => {
      gtag("event", "up_faceswap_videostep1");
      input.click();
    });
    $("#video_Face_swapper_container .stepA .btn_changer").on("click", () => {
      gtag("event", "up_faceswap_videostep1");
      input.click();
    });
    input.on("change", () => {
      let file = input[0].files[0];
      this.uploadFileRule(file);
      setTimeout(() => {
        input[0].value = "";
      }, 500);
    });
    // this.element.find('.video_upload_rule_span').text(countryConfig[countryConfig.name].textRule)
  }
  // 显示拖入文件时的阴影样式
  showDropMask(bool) {
    if (this.loading) {
      return;
    }
    if (bool) {
      this.element.find(`.uploader_loading_mask`).show();
    } else {
      this.element.find(`.uploader_loading_mask`).hide();
    }
  }
  // 上传视频显示loading
  showUploading(bool) {
    console.log("showUploading", bool);
    this.videoData.loading = bool;
  }

  uploadFileRule(file, demo) {
    if (this.loading) {
      return;
    }
    if (demo?.demo_key) {
      this.demo_coverImg = demo.demo_coverImg;
      this.demo_key = demo.demo_key;
    } else {
      this.demo_key = "";
      this.demo_coverImg = "";
    }
    // const maxSizeInBytes = 1024 * 1024 * countryConfig[countryConfig.name].filesize_max; // 200 MB
    const maxSizeInBytes = 1024 * 1024 * userRuleConfig.limit; // 200 MB
    if (file) {
      console.log(file,'file')
      const fileName = file.name;
      const fileExtension = fileName.split(".").pop().toLowerCase();
      const allowedExtensions = ["m4v", "mp4", "mov", "webm", "gif"];
      const allowedMimeTypes = ["video/mp4", "video/quicktime", "video/webm", "image/gif"];
      this.submit.videoRandom = false;
      if (allowedExtensions.includes(fileExtension) || allowedMimeTypes.includes(file.type)) {
        // 在这里执行处理文件的代码
        if (file.size > maxSizeInBytes) {
          // 文件过大
          showMaximumFileSizeV();
        } else {
          if (file.type === "image/gif") {
            // gif
            this.uploadGifFile(file);
          } else {
            // this.submit.submitDisabled(true)
            // video
            this.uploadVideoRule(file);
          }
        }
      } else {
        // 上传格式错误
        this.value = ""; // 清除文件输入字段的值
        ToolTip({
          type: "error",
          title: textContentObj.Failed,
          content: setTextContentObj("support_formats_v"),
          btn: textContentObj.ok,
        });
      }
    }
  }
  async uploadGifFile(file) {
    const that = this;
    this.showUploading(true);
    this.submit.videoDemo.domeLoadDisabled(true); // 禁用底部demo

    const reader = new FileReader();
    reader.onload = function (e) {
      setTimeout(() => {
        that.videoDuration = userRuleConfig.duration;
        that.submit.uploadType = "gif";
        that.submit.PreviewVideoTool.setVideoOrGifSrc("gif", e.target.result);
        // that.element.find('#video_Face_swapper_container .step_V').css('display','');
        // that.element.find('.v_showVideo').css('display','none');
        $("#video_Face_swapper_container .step_V")[0].src = e.target.result;
        $(".video_img").addClass("active");
        that.showUploading(false);
        that.submit.videoDemo.domeLoadDisabled(false); // 禁用底部demo

        // that.getConsumeCredit(userRuleConfig.duration);

        that.submit.videoDemo.setCheckedDemo("video");
        that.submit.PreviewVideoTool.showVideoControls(false);
      }, 1000);
    };
    reader.readAsDataURL(file);
    this.uploadFile = file;
  }
  async uploadVideoRule(file) {
    console.log(file);
    const videoURL = await createObjectURLFun(file);
    console.log(videoURL);
    const video = document.getElementById("getLoadedDom_video");
    video.src = videoURL;
    const that = this;
    this.showUploading(true);
    this.submit.videoDemo.domeLoadDisabled(true); // 禁用底部demo

    video.addEventListener(
      "loadedmetadata",
      () => {
        const duration = video.duration;
        // that.getConsumeCredit(duration);
        // console.log(duration,countryConfig[countryConfig.name].duration)
        if (duration > userRuleConfig.duration && false) {
          // 视频过长
          setTimeout(() => {
            that.showUploading(false);

            let spanHtml = getfsCreditsText("Model_MaximumFile_span", {
              val: userRuleConfig.limit,
            });
            ToolTip({
              type: "error",
              title: textContentObj.Failed,
              content: spanHtml,
              btn: textContentObj.ok,
            });
          }, 1000);
        } else {
          setTimeout(() => {
            that.uploadFile = file;
            that.videoDuration = duration;
            that.setVideoFileSrc(videoURL);
            that.submit.videoDemo.setCheckedDemo("video");
            that.showUploading(false);
            that.submit.videoDemo.domeLoadDisabled(false); // 禁用底部demo
          }, 1000);
        }
      },
      { once: true }
    );
  }
  setVideoFileSrc(src) {
    const that = this;

    return new Promise(async (resolve, reject) => {
      that.submit.uploadType = "video";

      let coverImg = await that.submit.PreviewVideoTool.setVideoOrGifSrc("video", src);
      // this.element.find('#video_Face_swapper_container .step_V').css('display','none');
      // this.element.find('.v_showVideo').css('display','');
      URL.revokeObjectURL(that.videoSrc);
      that.videoSrc = src;
      that.videoCoverImgSrc = coverImg;
      that.element.find(".step_V")[0].src = coverImg;
      that.element.find(".video_img").addClass("active");

      that.submit.PreviewVideoTool.showVideoControls(false);
      resolve();
    });
  }

  async getConsumeCredit(duration) {
    let maxNum = duration / (userRuleConfig.duration || 10);
    let credits = Math.ceil(maxNum) * 5;

    if (!getCookie("access_token")) {
      this.submit.showBtnCredits(false, credits);
      if (duration > userRuleConfig.duration + 1) {
      } else {
          this.submit.videoDemo.showMoreVideoDuration(false)
      }
    } else {
      if (userRuleConfig.credit) {
        this.submit.showBtnCredits(true, credits);
      } else {
        let resp = await fetchPost(
          "ai/tool/can-face",
          {
            action: "video_face_changing",
            duration,
          },
          TOOL_API
        );
        if (resp.code === 200) {
          this.submit.showBtnCredits(false, credits);
        } else {
          this.submit.showBtnCredits(true, credits);
        }
      }
    }
    // fetchPost(
    //     "ai/tool/consume-credit-videoface",
    //     { duration},
    //     TOOL_API
    // ).then(res=>{
    //     console.log(res)
    // })
  }
}

class UploadImage {
  constructor(element, submit) {
    const that = this;
    this.element = element;
    this.imageSrc = "";
    this.uploadFile = null;
    this.data = {
      loading: false,
    };
    this.submit = submit;
    this.imageLoading = true; //是否可以上传图片
    this.photoData = new Proxy(this.data, {
      set(target, prop, value) {
        target[prop] = value;
        if (prop === "loading") {
          if (!value ) {
            that.element.find(".step_loadingBox").hide();
            that.element.find(".stepBox").removeClass("loading")
            if(that.uploadFile !== null){
              $("#video_Face_swapper_container .faceSwapProgress").text(textContentObj.Loading);
              that.element.find(".stepBox").find(".step_P").addClass("active");
              that.element.find(".btn_changer").show();
              that.element.find(".step_P")[0].src = that.imageSrc;
              that.submit.isSubmit();
            }

          } else {
            $("#video_Face_swapper_container .change_video_btn").addClass("disabled");
            that.element.find(".stepBox").addClass("loading");
            that.element.find(".step_loadingBox").css("display", "flex");
          }
        }

        return true;
      },
      get(target, prop) {
        return target[prop];
      },
    });
  }
  // 监听文件拖入与点击选择文件
  initFace() {
    const that = this;
    let input = $(".video_upload_input_step2");
    this.element.on("dragover", (e) => {
      e.preventDefault(); // 阻止默认行为
      this.showDropMask(true);
    });
    // // 拖入文件
    // this.element.find('.video_upload-container').on('dragenter', (e) => {
    //     e.preventDefault(); // 阻止默认行为
    //     e.stopPropagation();
    //     this.showDropMask(true)
    // });
    // 拖出文件
    this.element.find(".uploader_loading_mask").on("dragleave", (e) => {
      e.preventDefault(); // 阻止默认行为
      e.stopPropagation();
      this.showDropMask(false);
    });
    this.element.find(".uploader_loading_mask").on("drop", (e) => {
      e.preventDefault(); // 阻止默认行为
      e.stopPropagation();
      gtag("event", "up_faceswap_videostep2");
      this.showDropMask(false);
      let file = e.originalEvent.dataTransfer.files[0];
      that.uploadFileRule(file);
    });
    this.element.find(".step_P").on("click", (e) => {
      gtag("event", "up_faceswap_videostep2");
      input.click();
    });
    this.element.find(".btn_changer").on("click", (e) => {
      gtag("event", "up_faceswap_videostep2");
      input.click();
    });

    input.on("change", () => {
      let file = input[0].files[0];
      that.uploadFileRule(file);
      setTimeout(() => {
        input[0].value = "";
      }, 500);
    });
  }

  transtoBlob = ({ b64data, contentType = "image/png" }) => {
    contentType = contentType || "";
    let sliceSize = 1024;
    let byteCharacters = atob(b64data.split(",")[1]);
    let bytesLength = byteCharacters.length;
    let slicesCount = Math.ceil(bytesLength / sliceSize);
    let byteArrays = new Array(slicesCount);

    for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
      let begin = sliceIndex * sliceSize;
      let end = Math.min(begin + sliceSize, bytesLength);

      let bytes = new Array(end - begin);
      for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
        bytes[i] = byteCharacters[offset].charCodeAt(0);
      }
      byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    return new Blob(byteArrays, { type: contentType });
  };
  checkFileType(files) {
    const selectedFiles = files;
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const fileName = file.name;
      const fileExtension = fileName.split(".").pop().toLowerCase();

      // 允许的文件扩展名
      const allowedExtensions = ["png", "jpg", "webp", "jpeg"];

      if (!allowedExtensions.includes(fileExtension)) {
        // 不允许上传的文件类型，给出错误提示或其他处理
        // alert('只允许上传 .png、.jpg、.jpeg 和 .webp 格式的文件。');
        // 清除文件选择
        return false;
      }
    }
    return true;
  }
  async uploadFileRule(file) {
    if (this.loading || !file) {
      return;
    }
    if (!this.checkFileType([file])) {
      // 格式错误
      ToolTip({
        type: "error",
        title: textContentObj.Failed,
        content: setTextContentObj("support_formats_p"),
        btn: textContentObj.ok,
      });
      return;
    }
    let imgWidthSrc = await this.imgMinWidth(file);

    // 开启loading
    this.submit.videoDemo.domeLoadDisabled(true); // 禁用底部demo

    this.showUploading(true);
    this.submit.imageRandom = false;
    // 人脸检测
    let faceobj = await this.detectionFace(imgWidthSrc);
    if (faceobj.status !== 1) {
      let errStr = "";
      switch (faceobj.status) {
        case 0:
          errStr = setTextContentObj("No_face");
          break;
        case 2:
          errStr = setTextContentObj("Mutiple_face");
          break;
        case 3:
          errStr = setTextContentObj("face_small");
          break;
      }
      ToolTip({
        type: "error",
        title: textContentObj.Failed,
        content: errStr,
        btn: textContentObj.ok,
      });
    } else {
      // 图片正常
      URL.revokeObjectURL(this.imageSrc);
      this.uploadFile = file;
      this.imageSrc = imgWidthSrc;
      // this.submit.videoDemo.setCheckedDemo('photo')
    }
    this.showUploading(false);
    this.submit.videoDemo.domeLoadDisabled(false); // 禁用底部demo
  }
  detectionFace(src) {
    // status:  0 没检测到人脸，1 检测到一个人脸，2检测到多个人脸，3 检测的人脸太小
    return new Promise((resolve, reject) => {
      // 避免图像还未呈现就卡在faceapi
      setTimeout(() => {
        let imgDom = new Image();
        imgDom.src = src;
        console.log(src);
        imgDom.onload = function () {
          try {
            faceapi
              .detectAllFaces(
                imgDom,
                new faceapi.TinyFaceDetectorOptions({
                  inputSize: 416,
                })
              )
              .then((res) => {
                console.log(res);
                let obj = {};
                if (res.length === 1) {
                  obj.status = 1;
                  obj.box = res[0].box;
                  resolve(obj);
                } else if (res.length > 1) {
                  obj.status = 2;
                  resolve(obj);
                } else {
                  faceapi.detectAllFaces(imgDom, new faceapi.SsdMobilenetv1Options()).then((res) => {
                    console.log(res);
                    if (res.length === 1) {
                      obj.status = 1;
                      obj.box = res[0].box;
                    } else if (res.length > 1) {
                      obj.status = 2;
                    } else {
                      obj.status = 0;
                    }
                    resolve(obj);
                  });
                }
              });
          } catch (e) {
            console.log("err", e);
            reject(e);
          }
        };
      }, 50);
    });
  }
  async imgMinWidth(file) {
    const minWidth = 512;
    const url = await createObjectURLFun(file);
    return new Promise((resolve) => {
      const image = new Image();
      image.src = url;
      image.onload = function () {
        const width = this.width;
        const height = this.height;
        // if (width < minWidth || height < minWidth) {
        //     resolve(false)
        // } else {
        resolve(url);
        // }
      };
    });
  }
  resizeImageByFile(file) {
    var that = this;
    var maxSide = 1080;
    return new Promise((resolve, reject) => {
      var reader = new FileReader();
      reader.onloadend = () => {
        let img = new Image();
        img.onload = () => {
          let canvas = document.createElement("canvas");
          let ctx = canvas.getContext("2d");
          let maxDimension = Math.max(img.width, img.height);
          if (maxDimension > maxSide) {
            let scaleFactor = maxSide / maxDimension;
            canvas.width = img.width * scaleFactor;
            canvas.height = img.height * scaleFactor;
          } else {
            canvas.width = img.width;
            canvas.height = img.height;
          }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          var base64 = canvas.toDataURL();
          var blob = that.transtoBlob({
            b64data: base64,
            contentType: "image/png",
          });
          let imgType = "width";
          if (canvas.width < canvas.height) {
            imgType = "height";
          }
          resolve({ blog: blob, imgType });
        };
        img.onerror = () => {
          reject(new Error("Image load failed"));
        };
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  // 显示拖入文件时的阴影样式
  showDropMask(bool) {
    if (this.loading) {
      return;
    }
    if (bool) {
      this.element.find(`.uploader_loading_mask`).show();
    } else {
      this.element.find(`.uploader_loading_mask`).hide();
    }
  }
  // 上传图片显示loading
  showUploading(bool) {
    this.photoData.loading = bool;
  }
  // 图片上传完成时显示的样式
  showImageChange(bool) {
    // if (bool) {
    //     this.element.find('.step_P')[0].src = this.imageSrc;
    //     this.element.find('.step_P').removeClass("loading").addClass("active");
    //     this.element.find('.step_loadingBox').hide()
    //     this.element.find(".btn_changer").show();
    //     this.submit.isSubmit()
    // } else {
    //     this.element.find('.step_P').addClass("loading");
    //     this.element.find('.step_loadingBox').css("display", "flex");
    // }
  }
}

class SubmitFaceSwap {
  constructor(element) {
    const that = this;
    this.element = element;
    this.disabled = true;
    this.videoContainer = null;
    this.imgContainer = null;
    this.PreviewVideoTool = null;
    this.clearTimeout = null;
    this.initGtag = false;
    this.initGtag2 = false;
    this.task_id = null; // 创建任务成功的id
    this.swapCredits = 0;
    this.isShowControl = false;
    this.uploadType = ""; //vidoe gif
    this.videoRandom = false; //video是否为random生成
    this.imageRandom = false; //image是否为random生成
    this.timerLoading = null; //定时器
    this.task_credits = false; // 该任务是否花费金币创建w
    this.data = {
      isVideoSubmit: false,
    };
    this.submitData = new Proxy(this.data, {
      set(target, prop, value) {
        if (prop === "isVideoSubmit") {
          if (value) {
            setTimeout(() => {
              $(".v_preview_playIcon").fadeOut();
            }, 100);
            that.element.find("#v_swap_face_Now").addClass("submit");
            $("#video_Face_swapper_container .spread_box_container").addClass("loading");
            $("#video_Face_swapper_container .change_video_btn .submit_text").text(textContentObj.Swapping_setp);
            that.setLoadingStep(true);
            $(".high_quality_append_dom_video").css("pointer-events", "none")
          } else {
            if (that.uploadType != "gif") {
              $(".v_preview_playIcon").fadeIn();
            }
            $("#video_Face_swapper_container .change_video_btn .submit_text").text(textContentObj.step3_btn);
            $("#video_Face_swapper_container .spread_box_container").removeClass("loading");
            that.element.find("#v_swap_face_Now").removeClass("submit");
            $(".high_quality_append_dom_video").css("pointer-events", "auto")
          }
        }
        target[prop] = value;
        return true;
      },
      get(target, prop) {
        return target[prop];
      },
    });
  }
  async initFace() {
    this.videoContainer = new UploadVideo($("#video_Face_swapper_container .stepA"), this);
    this.creditModel = new CreditsMessageModel();
    this.videoContainer.initFace();
    this.imgContainer = new UploadImage($("#video_Face_swapper_container .stepB"), this);
    this.PreviewVideoTool = new PreviewVideoTool($("#video_Face_swapper_container .spread_box"), this);
    this.videoDemo = new VideoDemo($("#v_face_swap_Demo"), this);
    this.PreviewVideoTool.initFace();
    this.imgContainer.initFace();
    this.showBtnCredits(false);
    this.setMaskUnlockPriority();
    this.element.find("#v_swap_face_Now").on("click", async () => {
      gtag("event", "click_faceswap_videostep3");
      this.PreviewVideoTool.video_preview_dom.pause();
      // this.PreviewVideoTool.showVideoControls(false) // 关闭分享下载按钮
      // this.PreviewVideoTool.setLoadingText(setTextContentObj('Preparing_step'))
      if (this.disabled) {
        return;
      }
      this.faceSwapLoading(true); // button文字loading动效
      this.videoDemo.domeLoadDisabled(true); // 禁用底部demo
      // this.submitDisabled(true) // 禁用提交按钮
      this.videoContainer.showUploading(true); // 开启video按钮loading
      this.imgContainer.showUploading(true); // 开启img按钮loading
      this.PreviewVideoTool.showControls ? (this.isShowControl = true) : (this.isShowControl = false); //生成之前是否开启了分析下载按钮
      this.PreviewVideoTool.showVideoControls(false);
      getCountryConfig()
        .then(() => {
          this.submitFun();
        })
        .catch(() => {
          this.videoContainer.showUploading(false); // 关闭video按钮loading
          this.imgContainer.showUploading(false); // 关闭img按钮loading
          // this.submitDisabled(false) // 禁用提交按钮
          this.faceSwapLoading(false); // button文字loading动效
          this.videoDemo.domeLoadDisabled(false); // 禁用底部demo
          if (this.isShowControl) {
            this.PreviewVideoTool.showVideoControls(true);
          }
        });
    });
  }
  async setLoadingStep({ step, createTask }) {
    const that = this;
    let stepTime = createTask?.data?.progress;
    let status = createTask?.data?.status;
    let text = setTextContentObj("loading_text");
    if (!step || step === 0) {
      that.PreviewVideoTool.setLoadingText(text);
      return;
    }
    if (step == 1) {
      text = setTextContentObj("Preparing_step");
      that.PreviewVideoTool.setLoadingText(text);
      return;
    }
    // -1状态排队
    if (status == -1) {
      text = "% " + setTextContentObj("Analyzing_setp");
    }
    // -2 换脸中
    if (status == -2) {
      text = "% " + setTextContentObj("Swapping_step");
    }
    that.PreviewVideoTool.setLoadingText(parseInt(stepTime) + text);
  }

  submitDisabled(bool) {
    if (bool) {
      this.element.find(".video_upload_button").css({
        opacity: 0.4,
        "pointer-events": "none",
      });
      this.element.find(".video_upload_button img").hide();
      this.disabled = true;
    } else {
      this.element.find(".video_upload_button").css({
        opacity: 1,
        "pointer-events": "auto",
      });
      this.element.find(".video_upload_button img").show();
      this.disabled = false;
    }
  }
  async submitFun() {
    const that = this;
    // 上传文件 创建任务
    let createTask = await this.uploadFile({
      videoFile: this.videoContainer.uploadFile,
      imgFile: this.imgContainer.uploadFile,
    });
    console.log(createTask);

    if (createTask.bool) {
      // 任务创建成功
      if (
        window.userRuleConfig.is_subscriber !== 1
        && this.videoContainer.videoDuration
        && this.videoContainer.videoDuration > userRuleConfig.duration + 1
      ) {
        this.videoDemo.showMoreVideoDuration(true)
      } else {
        this.videoDemo.showMoreVideoDuration(false)
      }
      // 更新视频显示 （注意判断是否为gif）
      let gifOrVideoType = createTask.data.additional_data.merge_key.includes(".gif") ? "gif" : "video";
      let coverImg = await this.PreviewVideoTool.setVideoOrGifSrc(
        gifOrVideoType,
        createTask.data.additional_data.merge_url,
        createTask.data.additional_data.cover_url
      );

      this.task_id = createTask.data.id;

      let type = createTask.data.additional_data.merge_key.split(".");
      type = type[type.length - 1];

      // 更新下载地址
      this.PreviewVideoTool.downloadData = {
        key: createTask.data.additional_data.merge_key,
        coverImg,
        type: type,
        url: createTask.data.additional_data.merge_url,
      };

      this.videoContainer.videoCoverImgSrc = createTask.data.additional_data.cover_url;
      gtag("event", "succ_faceswap_videoswapbtn");

      // 开启分享与下载按钮zoomin_miofs_videores
      this.PreviewVideoTool.showVideoControls(true);
    } else {
      // 任务创建失败
      if (createTask?.data?.code == "3005") {
        showMaximumV();
        // 超出次数了
      } else if (createTask?.data?.code == "3008") {
        showNotEnoughCreditsVideo(that.swapCredits);
        // 超出次数了
      } else {
        if (createTask?.message?.includes("faces=0") || createTask?.message?.includes("no face")) {
          // 视频中没有人脸
          let textTips = textContentObj.No_face
          if (that.task_credits) {
            textTips = textContentObj.Credits_failed_no_face
          }
          ToolTip({
            type: "error",
            title: textContentObj.Failed,
            content: textTips,
            btn: textContentObj.ok,
          });
        } else if (createTask?.message?.includes("celebrity")) {
          let textTips = textContentObj.celebrity
          if (that.task_credits) {
            textTips = textContentObj.Credits_failed_celebrity
          }
          // 不符合要求
          ToolTip({
            type: "error",
            title: textContentObj.Failed,
            content: textTips,
            btn: textContentObj.ok,
          });
        } else if (createTask?.message?.includes("faces=")) {
          let textTips = textContentObj.Mutiple_face
          if (that.task_credits) {
            textTips = textContentObj.Credits_failed_multi_face
          }
          //检测到多张脸
          ToolTip({
            type: "error",
            title: textContentObj.Failed,
            content: textTips,
            btn: textContentObj.ok,
          });
        } else {
          let textTips = textContentObj.processImage
          if (that.task_credits) {
            textTips = textContentObj.Credits_failed
          }
          ToolTip({
            type: "error",
            title: textContentObj.Failed,
            content: textTips,
            btn: textContentObj.ok,
          });
          console.log(createTask.message);
        }
      }
      if (this.isShowControl) {
        this.PreviewVideoTool.showVideoControls(true);
      }
    }

    this.setLoadingStep({ step: 0 });
    // 恢复为加载状态前
    this.videoContainer.showUploading(false);
    this.imgContainer.showUploading(false);
    // this.submitDisabled(false)
    this.videoDemo.domeLoadDisabled(false); // 禁用底部demo
    this.faceSwapLoading(false); // button文字loading动效
  }
  async uploadFile(data) {
    console.log(data, this.videoRandom, this.imageRandom, "uploadFile");
    let { videoFile, imgFile } = data;
    let videoName, imgName;
    if (this.videoRandom) {
      videoName = videoFile?.video_url.split(".").pop() || "mp4";
    } else {
      videoName = videoFile?.name.split(".").pop() || "mp4";
    }
    if (this.imageRandom) {
      imgName = imgFile?.pic_url.split(".").pop() || "jpg";
    } else {
      imgName = imgFile?.name.split(".").pop() || "jpg";
    }
    const that = this;
    that.setLoadingStep({ step: 1 });

    return new Promise(async (resolve, reject) => {
      // 获取上传地址
      let videoUploadUrlData, imgUploadUrlData;
      try {
        if (!this.videoRandom) {
          videoUploadUrlData = await fetchPost(
            "ai/source/temp-upload-url",
            { file_name: "vidqu_faceswap." + videoName },
            TOOL_API
          );
        }
        if (!this.imageRandom) {
          imgUploadUrlData = await fetchPost(
            "ai/source/temp-upload-url",
            { file_name: "vidqu_faceswap." + imgName },
            TOOL_API
          );
        }
      } catch (err) {
        // 获取上传地址失败
        console.log("获取上传地址失败", err);
        resolve({
          bool: false,
        });
        return;
      }

      if (!this.videoRandom) {
        await this.testUploadFile(videoUploadUrlData.data.upload_url, videoFile, resolve);
      }
      if (!this.imageRandom) {
        await this.testUploadFile(imgUploadUrlData.data.upload_url, imgFile, resolve);
      }

      let accessfile;
      if (!this.videoRandom) {
        accessfile = await getFileUrlRequest(videoUploadUrlData.data.access_url);
      }
      if (!this.imageRandom) {
        accessfile = await getFileUrlRequest(imgUploadUrlData.data.access_url);
      }
      if (!this.videoRandom || !this.imageRandom) {
        if (!accessfile) {
          // 上传文件失败
          console.log("failed ", imgUploadUrlData);
          resolve({
            bool: false,
            type: "upload",
          });
          return;
        } else {
          // 上传文件成功
          console.log("success ", imgUploadUrlData);
        }
      }

      // 创建任务
      let createTask;
      let duration = that.videoContainer.videoDuration;

      try {
        createTask = await that.createTaskFun({
          video_key: that.videoRandom ? videoFile.video_key : videoUploadUrlData.data.key,
          avatar_key: that.imageRandom ? imgFile.pic_key : imgUploadUrlData.data.key,
          // demo_key: that.videoRandom ? videoFile.video_key : that.videoContainer.demo_key ? that.videoContainer.demo_key : null,
          duration,
          size: that.videoRandom ? videoFile.size : videoFile.size,
        });
      } catch (err) {
        // 创建任务失败
        console.log("创建任务失败", err);
        resolve({
          bool: false,
          message: err.message,
          data: err,
        });
        return;
      }
      resolve(createTask);
    });
  }
  // 创建任务
  async createTaskFun(data) {
    let { video_key, avatar_key, demo_key, duration, size } = data;
    const that = this;
    return new Promise(async (resolve, reject) => {
      let createTask = await fetchPost(
        "ai/tool/video-face-changing",
        {
          video_key,
          avatar_key,
          demo_key, //可选
          duration,
          size,
          watertype: 5,
          is_hd: videocreditSystem?.is_hd,
        },
        TOOL_API,
        {
          "X-TASK-VERSION": "2.0.0",
        }
      );
      if (createTask.code === 200) {
        video_task_id = createTask.data.task_id;
        let data = await that.intervalGetTask(createTask.data.task_id);
        userRuleConfig.credit = createTask.data.credit;
        show_priority = 0;
        changeHeaderCredit(userRuleConfig.credit)
        resolve(data);
      } else {
        reject(createTask);
      }
    });
  }

  setMaskUnlockPriority() {
    $("#createTaskMaskVideo .v_mask_unlock_priority").on("click", (e) => {
      gtag("event", "click_faceswap_videopriority");
      setCookie(`st`, `fsvideocreditpriority`)
      // window.open(toolPicingUrl);
    });
  }
  setLoadingMaskTip(bool, data = {}) {
    const { maskSpan, show_wait, num, second } = data;
    let dom = $("#createTaskMaskVideo");
    let domBack = $("#video_Face_swapper_container .v_mask_background");
    if (bool) {
      if (show_wait === 1) {
        dom.find(".v_mask_content2").show();
        let time = second;
        let timeStr = "wait_minutes";
        if (second > 60) {
          time = Math.ceil(second / 60);
        } else {
          timeStr = "wait_seconds";
        }

        dom.find(".v_mask_content2 .v_mask_span").html(
          setTextContentObj(`estimated_wait_time${num > 1 ? "s" : ""}`, {
            val: num,
            val2: time,
            val3: setTextContentObj(timeStr),
          })
        );
      } else {
        dom.find(".v_mask_content2").hide();
      }
      dom.show();
      domBack.show();
    } else {
      dom.hide();
      domBack.hide();
    }
  }

  isSubmit() {
    if (this.videoContainer.uploadFile !== null && this.imgContainer.uploadFile !== null) {
      this.videoContainer.getConsumeCredit(this.videoContainer.videoDuration)
      this.element.find(".change_video_btn").removeClass("disabled");
      this.disabled = false;
    }
  }

  // 轮询进度
  intervalGetTask(id) {
    let num = 3;
    return new Promise((resolve) => {
      let intervalFun = setInterval(() => {
        fetchPost(`ai/tool/get-task`, { id }, TOOL_API)
          .then(async (res) => {
            if (res.code === 200) {
              this.setLoadingStep({ step: 2, createTask: res });
              if (res.data.wait?.show_wait === 1) {
                if (show_priority == 0) {
                  show_priority++;
                  gtag("event", "show_faceswap_videopriority");
                }
                let { num, second } = res.data.wait;
                this.setLoadingMaskTip(true, { show_wait: 1, num, second });
              } else {
                this.setLoadingMaskTip(false);
              }
              if (res.data.status === 0) {
                videoPhotoDownloadData = await setDownloadData("video_face_changing", res)
                setCookie("faceSwapTime_swap", Date.now(), 2);
                clearInterval(intervalFun);
                showCreditBannerP(true)
                resolve({
                  bool: true,
                  data: res.data,
                });
              }
            } else {
              this.setLoadingMaskTip(false);
              clearInterval(intervalFun);
              resolve({
                bool: false,
                message: res.message,
              });
            }
          })
          .catch((err) => {
            num--;
            if (num === 0) {
              clearInterval(intervalFun);
              resolve({
                bool: false,
                message: err,
              });
            }
          });
      }, 3000);
    });
  }
  // 上传文件
  async testUploadFile(url, file, resolve) {
    try {
      await fetchPut(url, file, "");
    } catch (err) {
      // 上传文件失败
      console.log("failed upload file", err);
      resolve({
        bool: false,
        message: "exception_occurred",
      });
      return;
    }
  }

  setInitGtag(type) {
    if (type === "tab_video") {
      if (!this.initGtag) {
        this.initGtag = true;
      }
    } else {
      if (!this.initGtag2) {
        this.initGtag2 = true;
      }
    }
  }

  faceSwapLoading(bool) {
    this.submitData.isVideoSubmit = bool;
  }

  showBtnCredits(bool, credits) {
    this.swapCredits = credits;
    this.task_credits = bool;
    videocreditSystem.showBtnCredits({
      bool,
      credits: credits,
      appendDom: $("#video_Face_swapper_container .change_video_btn"),
      type: "video",
    });
  }
  
  eventLoginsuccess() {
    const that = this;
    let login_Modal = document.querySelector("my-component");
    login_Modal.addEventListener("loginsuccess", function (event) {
      // 配置服务器国家梯队处理
      getCountryConfig().then((config) => {
        userRuleConfig = config;
        // that.videoDemo.setTabs();
        if (that.videoContainer.uploadFile) {
          that.videoContainer.getConsumeCredit(
            that.videoContainer.videoDuration
          );
        } else {
          showCreditBannerP(true);
        }
        isLogin(true)
      });
    });
  }
}

class PreviewVideoTool {
  constructor(element, submit) {
    this.element = element;
    this.submit = submit;
    this.video_preview_dom = this.element.find("#video_preview_dom")[0];
    this.video_larger_preview_dom = $("#v_preview_larger_video")[0];
    this.gif_larger_preview_dom = $("#v_preview_larger_gif")[0];
    this.downloadData = null;
    this.showControls = false;
  }
  initFace() {
    const that = this;
    this.element.find(".zoomIn").on("click", () => {
      // 查看大图
      this.pauseVideoPreview();
      gtag("event", "zoomin_faceswap_videores");
      this.showPreviewVideo(true);
    });
    // 大图关闭弹窗
    $("#large_modal.video_large .close_large").on("click", function () {
      this.showPreviewVideo(false);
      this.pauseLargerVideoPreview();
    });
    this.element.find(".download").on("click", () => {
      // 下载
      this.downloadVideo();
    });
    // this.element.find('#v_controls_Download2').on('click', (e) => {
    //     // 下载
    //     e.originalEvent.stopPropagation()
    //     this.downloadVideo();
    // });
    this.element.find(".v_preview_playIcon").fadeOut();
    this.element.find(".v_preview_playIcon").on("click", (e) => {
      // 播放
      this.playerVideoPreview();
      e.originalEvent.stopPropagation();
    });
    this.element.find("#video_preview_dom").on("click", (e) => {
      // 暂停
      this.pauseVideoPreview();
      e.originalEvent.stopPropagation();
    });
    // 禁用右键菜单
    this.element.find("#video_preview_dom").on("contextmenu", (e) => {
      e.originalEvent.preventDefault();
    });
    $("#v_preview_larger_video").on("contextmenu", (e) => {
      e.originalEvent.preventDefault();
    });
    $(".v_preview_larger_playIcon").on("click", (e) => {
      // 播放
      this.playerLargerVideoPreview();
      e.originalEvent.stopPropagation();
    });

    // 缓冲与重新播放
    // const waitingIcon = this.element.find(".v_preview_waitIcon");
    // this.video_preview_dom.addEventListener("waiting", function () {
    //   waitingIcon.css("display","none");
    // });
    // this.video_preview_dom.addEventListener("playing", function () {
    //   waitingIcon.css("display","flex");
    // });

    // 放大后的视频缓冲与重新播放
    const waitLargerIcon = this.element.find(".video_preview_larger .v_preview_waitingIcon");
    this.video_larger_preview_dom.addEventListener("waiting", function () {
      waitLargerIcon.fadeIn();
    });
    this.video_larger_preview_dom.addEventListener("playing", function () {
      waitLargerIcon.fadeOut();
    });

    $("#v_preview_larger_video").on("click", (e) => {
      // 暂停
      this.pauseLargerVideoPreview();
      waitLargerIcon.fadeOut();
      e.originalEvent.stopPropagation();
    });
    // 分享的视频缓冲与重新播放
    const waitShareIcon = $("#shareDialogEl").find(".v_preview_waitingIcon");
    const shareVideoDom = $("#shareDialogEl").find(".preview-video-box .show-video")[0];
    shareVideoDom.addEventListener("waiting", function () {
      waitShareIcon.fadeIn();
    });
    shareVideoDom.addEventListener("playing", function () {
      waitShareIcon.fadeOut();
    });
    shareVideoDom.addEventListener("pause", function () {
      waitShareIcon.fadeOut();
    });

    const playIcon = this.element.find(".v_preview_playIcon");
    this.video_preview_dom.addEventListener("pause", function () {
      // 播放暂停
      // console.log('播放暂停')
      playIcon.fadeIn();
      // waitingIcon.fadeOut();
    });
    this.video_preview_dom.addEventListener("play", function () {
      playIcon.fadeOut();
    });

    this.element.find("#createTaskMask .v_mask_unlock_priority").on("click", (e) => {
      // window.open(toolPicingUrl);
    });
    this.showVideoControls(false);
  }
  showShareDom() {
    console.log("showShareDom");
    let videoObj = this.submit.videoContainer;
    this.videoSrc = "";
    this.videoCoverImgSrc = "";
    console.log(this.submit.videoContainer);

    shareFun({
      url: this.downloadData.url,
      text: setTextContentObj("share_text_v"),
      imageKey: this.downloadData.key,
      title: setTextContentObj("share_title_v"),
      content: setTextContentObj("share_title_centent"),
    });
  }
  setLoadingText(text) {
    let loadingDom = this.element.find(".loading_box");
    loadingDom.find(".faceSwapProgress").text(text);
  }
  playerVideoPreview() {
    const that = this;
    // 开始播放
    const playIcon = this.element.find(".v_preview_playIcon");
    playIcon.fadeOut();
    this.video_preview_dom.play();
  }
  playerLargerVideoPreview() {
    // 开始播放
    const playIcon = $(".v_preview_larger_playIcon");
    playIcon.fadeOut();
    this.video_larger_preview_dom.play();
    this.video_larger_preview_dom.addEventListener(
      "pause",
      function () {
        // 播放暂停
        // console.log('播放暂停')
        playIcon.fadeIn();
      },
      { once: true }
    );
  }
  pauseVideoPreview() {
    // 暂停播放
    if (!this.video_preview_dom.paused) {
      this.video_preview_dom.pause();
    }
  }
  pauseLargerVideoPreview() {
    // 暂停播放
    if (!this.video_larger_preview_dom.paused) {
      this.video_larger_preview_dom.pause();
    }
  }
  // loading
  setLoading(bool) {
    if (bool) {
      this.element.find(".video_dom_container").css("filter", "blur(4px)");
      this.element.find(".preview_upload_loading").css("display", "flex");
    } else {
      this.element.find(".video_dom_container").css("filter", "");
      this.element.find(".preview_upload_loading").css("display", "none");
    }
  }
  // 设置src
  setVideoOrGifSrc(type, src, coverImg) {
    const that = this;
    return new Promise((resolve, reject) => {
      if (type === "video") {
        //
        let videoNode = this.element.find(".video_node")[0];

        const poster = coverImg || that.submit.videoContainer.videoCoverImgSrc;
        if (poster) {
          that.element.find(".img_gif_node")[0].src = poster;
          that.element.find(".video_node").css("display", "none");
          that.element.find(".img_gif_node").css("display", "");
        }
        videoNode.addEventListener(
          "loadedmetadata",
          async function () {
            setTimeout(async () => {
              that.element.find(".video_node").css("display", "");
              that.element.find(".img_gif_node").css("display", "none");
              if (coverImg) {
                resolve(coverImg);
              } else {
                let res = await getVideoCoverImage(videoNode);
                that.element.find(".img_gif_node")[0].src = res;
                resolve(res);
              }
            }, 200);
          },
          { once: true }
        );

        videoNode.src = src;
        videoNode.load();
        this.video_larger_preview_dom.src = src;
        this.video_larger_preview_dom.load();
        $(this.gif_larger_preview_dom).hide();
        $(this.video_larger_preview_dom).show();
        this.element.find(".v_preview_playIcon").fadeIn();
        $(".v_preview_larger_playIcon").fadeIn();
        if (coverImg) {
          resolve(coverImg);
        }
      } else if (type === "gif") {
        this.element.find(".video_node").css("display", "none");
        this.element.find(".img_gif_node").css("display", "");
        this.element.find(".img_gif_node")[0].src = src;
        this.gif_larger_preview_dom.src = src;
        $(this.gif_larger_preview_dom).show();
        $(this.video_larger_preview_dom).hide();

        this.element.find(".v_preview_playIcon").fadeOut();
        $(".v_preview_larger_playIcon").fadeOut();

        //
        this.element.find(".img_gif_node")[0].onload = function () {
          resolve();
        };
      }
    });
  }
  // 显示视频下载与分享等
  showVideoControls(bool) {
    let f_bool = this.showControls;
    this.showControls = bool;
    if (bool) {
      $("#video_Face_swapper_container .spread_box_controls").css("visibility", "visible");
      $("#video_Face_swapper_container .my_files_tips").css("visibility", "visible");
      gtag("event","show_vidqmyfiles_videotipsfile");
      // this.element.find('.v_preview_playIcon').addClass('v_preview_playIcon_show_btn')
      // this.element.find('.preview_upload_loading').addClass('preview_upload_loading_show_btn')
      // this.element.find('.video_controls_hidn').show();
    } else {
      $("#video_Face_swapper_container .spread_box_controls").css("visibility", "hidden");
      $("#video_Face_swapper_container .my_files_tips").css("visibility", "hidden");

      // this.element.find('.video_controls_hidn').hide();
      // this.element.find('.v_preview_playIcon').removeClass('v_preview_playIcon_show_btn')
      // this.element.find('.preview_upload_loading').removeClass('preview_upload_loading_show_btn')
    }
    return f_bool;
  }
  // 放大显示
  showPreviewVideo(bool) {
    if (bool) {
      $("#v_preview_larger_video")[0].currentTime = 0;
      $("#large_modal").addClass("video_large").fadeIn();
      $("#large_modal.video_large .download").on("click", async (e) => {
        this.downloadVideo();
      });
    } else {
      $("#large_modal").fadeOut().removeClass("video_large");
      $("#large_modal .download").off("click");
    }
  }
  // 点击下载
  async downloadVideo() {
    if (!getCookie("access_token")) {
      showLoginWindow({
        isReloading: false,
        wait: [video_task_id],
        fn: async(data = null) => {
          if(data) {
            videoPhotoDownloadData = data;
          }
        }
      });
      return;
    }
    if(!videoPhotoDownloadData) {
      videoPhotoDownloadData = await newDownloadFile(this.submit.task_id);
      return;
    }
    const that = this;
    gtag("event", "download_faceswap_videores");
    let { key,type } = this.downloadData;
    var sucessCallback = () => {
      ToolTip({
        type: "success",
        title: textContentObj.Download_success,
        content: textContentObj.Download_sucess_text,
        btn: textContentObj.ok,
      });
    };
    var failedCallback = () => {
      ToolTip({
        type: "error",
        title: textContentObj.Failed,
        content: textContentObj.downloadError,
        btn: textContentObj.ok,
      });
    };
    var NoExistCallback = () => {
      ToolTip({
        type: "error",
        title: textContentObj.failedTitle,
        content: textContentObj.file_download_exist,
        btn: textContentObj.ok,
      });
    };
    await fetchPost(
      "ai/source/get-access-url",
      {
        key: key,
        action: "download",
        file_name: "Vidqu_faceswap."+(type === "bin" ? "mp4" : type)
      },
      TOOL_API
    )
      .then((res) => {
        ToolTip({
          type: "progress",
          content: textContentObj.downloading,
          progressType: "fetch",
          url: res.data.url,
          name: "Vidqu_faceswap."+ type,
          sucessCallback,
          failedCallback,
          NoExistCallback,
        });
      })
      .catch((err) => {
        ToolTip({
          type: "error",
          title: textContentObj.errorNetworkTitle,
          content: textContentObj.errorNetwork,
          btn: textContentObj.ok,
        });
      });
  }
}

class CreditsMessageModel {
  showNotEnoughCredits() {
    ToolTip({
      type: "error",
      title: textContentObj.Failed,
      content: getfsCreditsText("Model_not_credit_span", { val: credits }),
      btn: textContentObj.ok,
    });
  }
  showMaximum() {
    gtag("event", "alert_faceswap_videomaxlimit");
    let spanHtml = getfsCreditsText(
      "Model_Maximum_span",
      {
        val: userRuleConfig.v_times,
      },
      true
    );
    ToolTip({
      type: "error",
      title: textContentObj.exceedTitle,
      content: spanHtml,
      btn: textContentObj.ok,
    });
  }
  showMaximumFileSize() {
    let spanHtml = getfsCreditsText("Model_MaximumFile_span", {
      val: userRuleConfig.limit,
    });
    ToolTip({
      type: "error",
      title: textContentObj.Failed,
      content: spanHtml,
      btn: textContentObj.ok,
    });
  }
}

class TabsChange {
  constructor(element, tabs, submit) {
    this.element = element;
    this.tabs = tabs;
    this.submit = submit;
    this.actTab = "tab_photo";
  }
  initFace() {
    const that = this;
    that.changeTabs("tab_photo");
    this.element.find(".faceSwap_tab").click(function () {
      // that.element.find('.tab__bar_item').removeClass('active');
      // $(this).addClass("active")
      let key = $(this).attr("tabName");
      if (key == "tab_multiple") return;
      that.changeTabs(key);
    });
  }
  changeTabs(key) {
    this.actTab = key;
    actTab = key;
    this.element.find(".faceSwap_tab").removeClass("active");
    let tabEl = this.element.find(".faceSwap_tab");
    for (let i = 0; i < tabEl.length; i++) {
      let el = tabEl[i];
      if ($(el).attr("tabName") === key) {
        $(el).addClass("active");
      }
    }

    this.tabs["tab_all"].forEach((el) => {
      el.hide();
    });
    this.tabs[key].dom.forEach((element) => {
      element.show();
    });
    if (key === "tab_video") {
      if (userRuleConfig.countrycode === "T1") {
        $(".our_pics li[data-type='video'][data-vp='v']").show();
      }
      $(".our_pics li[data-type='video'][data-vp='p']").show();
      $(".our_pics li[data-type='photo']").hide();
      this.submit.setInitGtag("tab_video");
      gtag("event", "click_faceswap_videotab");
    } else if (key === "tab_multiple") {
      gtag("event", "click_faceswap_multitab");
    } else {
      $(".our_pics li[data-type='photo']").show();
      $(".our_pics li[data-type='video']").hide();
      this.submit.setInitGtag("tab_photo");
      gtag("event", "click_faceswap_phototab");
    }
  }
}

class VideoDemo {
  constructor(element, submit) {
    this.submit = submit;
    this.element = element;
    this.demoType = "video";
    this.checkedDemo = {};
    this.demoObj = {
      video: {},
      photo: {},
    };
    this.extendDurationEl = $('#video_Face_swapper_container .video_extend_duration');
    this.initFace();
    this.showMoreVideoDuration(false)
  }
  initFace() {
    // const that = this;
    // const tabs = this.element.find(".v_demo_tab");
    const extendOpenBtn = this.extendDurationEl.find('.v_other_button')
    // tabs.on('click', function () {
    //     tabs.removeClass('act_tab')
    //     // 切换tab
    //     that.demoType = $(this).attr("tebName")
    //     $(this).addClass("act_tab")
    //     that.element.find('.our_pics2').css("display", 'none')
    //     if (that.demoType === 'video') {
    //         that.element.find('.v_video_demo').css("display", 'flex')
    //         that.element.find('.demo_act_span_v').css("display", '')
    //         that.element.find('.demo_act_span_p').css("display", 'none')

    //     } else {
    //         that.element.find('.v_photo_demo').css("display", 'flex')
    //         that.element.find('.demo_act_span_v').css("display", 'none')
    //         that.element.find('.demo_act_span_p').css("display", '')
    //     }
    // })

    extendOpenBtn.on('click', function () {
        //
        // window.open(toolPicingUrl)
        console.log('Extend Video duration')
    })
    this.getVideoOrImgDemo();
    // setTimeout(()=>{
    //     that.setTabs()
    // },100)
  }
  setTabs() {
    if (userRuleConfig.countrycode !== "T1") {
      this.element.find(".v_demo_photoTab").click();
      this.element.find(".v_demo_videoTab").css("display", "none");
    }
  }
  setCheckedDemo(type, data) {
    const that = this;
    return new Promise(async (resolve, reject) => {
      if (!data) {
        that.checkedDemo[type] = {};
        resolve();
        return;
      }
      let { key, url, cover_url, f_key } = data;
      if (type === "video") {
        that.checkedDemo.video = {
          key,
          cover_url,
          url,
          f_key, // 为主服务器的文件key
        };

        that.submit.videoContainer.showUploading(true);
        that.submit.videoContainer.videoDuration = 15;
        that.submit.videoContainer.uploadFile = null;
        await that.submit.videoContainer.setVideoFileSrc(that.checkedDemo.video.url);
        // that.submit.submitDisabled(true)
        setTimeout(() => {
          that.submit.videoContainer.showUploading(false);
          that.submit.PreviewVideoTool.showVideoControls(false);
          resolve();
        }, 2000);
      } else if (type === "photo") {
        that.checkedDemo.photo = {
          key,
          url,
          f_key, // 为主服务器的文件key
        };

        that.submit.imgContainer.imageSrc = url;
        that.submit.imgContainer.uploadFile = null;
        // that.submit.imgContainer.submit.setDisabled();
        that.submit.PreviewVideoTool.showVideoControls(false);
        resolve();
      } else {
        that.checkedDemo = {};
        resolve();
      }
    });
  }

  domeLoadDisabled(bool) {
    if (bool) {
      $('.our_pics li[data-type="video"]').css({
        filter: "brightness(0.5)",
        "pointer-events": " none",
      });
      $('.our_pics li[data-type="video"]').css({
        filter: "brightness(0.5)",
        "pointer-events": " none",
      });
    } else {
      $('.our_pics li[data-type="video"]').css({
        filter: "",
        "pointer-events": "",
      });
      $('.our_pics li[data-type="video"]').css({
        filter: "",
        "pointer-events": "",
      });
    }
  }

  changeDemoLoading(bool, type) {
    if (type === "video") {
      if (bool) {
        $('.our_pics li[data-type="video"]').css({
          filter: "brightness(0.5)",
          "pointer-events": " none",
        });
      } else {
        $('.our_pics li[data-type="video"]').css({
          filter: "",
          "pointer-events": "",
        });
      }
    } else {
      if (bool) {
        $('.our_pics li[data-type="video"]').css({
          filter: "brightness(0.5)",
          "pointer-events": " none",
        });
      } else {
        $('.our_pics li[data-type="video"]').css({
          filter: "",
          "pointer-events": "",
        });
      }
    }
  }

  async downloadVideoDemoFile(data) {
    const that = this;
    return new Promise(async (resolve, reject) => {
      // 下载demo文件；并保存文件key值
      let { url, f_key, cover_url } = data;
      if (!that.demoObj.video[f_key]) {
        // 下载
        let data = await srcToFile(url, "video");
        if (data) {
          if (data?.code === 200) {
            that.demoObj.video[f_key] = {
              key: data.data.key,
              url,
              cover_url,
              f_key,
            };

            await that.setCheckedDemo("video", that.demoObj.video[f_key]);
            resolve();
          } else {
            console.error(data);
            resolve();
          }
        } else {
          console.error(data);
          resolve();
        }
      } else {
        // 直接换上
        await that.setCheckedDemo("video", that.demoObj.video[f_key]);
        resolve();
      }
    });
  }
  async downloadPhotoDemoFile(data) {
    const that = this;
    return new Promise(async (resolve, reject) => {
      // 下载demo文件；并保存文件key值
      let { url, f_key } = data;
      if (!that.demoObj.photo[f_key]) {
        // 下载
        let data = await srcToFile(url, "photo");
        if (data) {
          if (data?.code === 200) {
            that.demoObj.photo[f_key] = {
              key: data.data.key,
              url,
              f_key,
            };
            that.setCheckedDemo("photo", that.demoObj.photo[f_key]);
          } else {
            console.error(data);
          }
        } else {
          console.error(data);
        }
      } else {
        // 直接换上
        that.setCheckedDemo("photo", that.demoObj.photo[f_key]);
      }
      resolve();
    });
  }

  async getVideoOrImgDemo() {
    const that = this;
    document.querySelector(".our_pics").addEventListener("click", function (event) {
      const target = event.target.parentNode;
      if (target.getAttribute("data-type") != "video") return;
      if (target.getAttribute("data-vp") === "p") {
        that.submit.imageRandom = true;
        that.submit.PreviewVideoTool.showVideoControls(false);
        that.submit.imgContainer.showUploading(true);

        let url = target.getAttribute("pic-url");
        let key = target.getAttribute("pic-key");

        that.changeDemoLoading(true, "photo");

        that.submit.imgContainer.uploadFile = {
          pic_key: key,
          pic_url: url,
        };
        that.submit.imgContainer.imageSrc = url;
        that.submit.imgContainer.element.find(".step_P")[0].src = url;
        $(".head_portrait_container").addClass("active");
        that.changeDemoLoading(false, "photo");
        // let index = target.getAttribute('photo-index')
        gtag("event", `clickvid_faceswap_imgtpl`);
        that.submit.imgContainer.showUploading(false);
      } else {
        that.submit.videoRandom = true;
        that.submit.PreviewVideoTool.showVideoControls(false);

        let url = target.getAttribute("video-url");
        let key = target.getAttribute("video-key");
        let cover_url = target.getAttribute("cover-url");
        let duration = target.getAttribute("video-duration");
        let size = target.getAttribute("video-size");

        that.changeDemoLoading(true, "video");
        that.submit.videoContainer.showUploading(true);

        that.submit.videoContainer.videoDuration = duration;
        that.submit.videoContainer.uploadFile = {
          cover_url,
          video_key: key,
          video_url: url,
          size,
          duration,
        };
        that.submit.PreviewVideoTool.setVideoOrGifSrc("video", url, cover_url);
        $("#video_Face_swapper_container .step_V")[0].src = cover_url;
        $(".video_img").addClass("active");
        let typeSuffix = key.split(".")[1];
        let filetype = "video/" + typeSuffix;
        if (filetype !== "video/mp4" || filetype !== "video/webm") {
          filetype = "video/quicktime";
        }
        that.changeDemoLoading(false, "video");
        that.submit.videoContainer.showUploading(false);
        // let index = $(this).attr('video-index')
        gtag("event", `clickvid_faceswap_vidtpl`);
      }
    });
  }

  showMoreVideoDuration(bool) {
    if (bool) {
      if (userRuleConfig.credit == 0) {
        this.element.hide();
        this.extendDurationEl.find(".v_duration_content").html(
          setTextContentObj("More_duration_span", {
            val: userRuleConfig.duration,
          })
        );
        this.extendDurationEl.show();
      }
    } else {
      this.element.show();
      this.extendDurationEl.hide();
    }
  }
}

// max filesize
function showMaximumFileSizeV() {
  videocreditSystem.showCreditPopup({
    title: getfsCreditsText("Model_MaximumFile_title"),
    content: getfsCreditsText(userRuleConfig?.is_subscriber === 1 ? "Model_MaximumFile_span2" : "Model_MaximumFile_span", {
      val: userRuleConfig.limit,
    }),
    btn: getfsCreditsText(userRuleConfig?.is_subscriber === 1 ? "ok" : "Model_Unlock_btn"),
    btnFn: () => {
      if (userRuleConfig?.is_subscriber !== 1) {
        // window.open(toolPicingUrl);
      }
    },
    isnotNeedPay: userRuleConfig?.is_subscriber === 1,
    modalCoins: "filemax",
  });
}

// max times
function showMaximumV() {
  gtag("event", "alert_faceswap_videomaxlimit");
  videocreditSystem.showCreditPopup({
    title: textContentObj.exceedTitle,
    content: getfsCreditsText(
      "Model_Maximum_span",
      {
        val: userRuleConfig.v_times,
      },
      true
    ),
    btn: getfsCreditsText("Model_Unlock_btn"),
    btnFn: () => {
      gtag("event", "click_faceswap_videomaxlimit");
      setCookie(`st`, `fsvideomaxlimit`)
      // window.open(toolPicingUrl);
    },
    modalCoins: "timesmax",
  });
}

// 截取视频第一帧
async function getVideoCoverImage(videoElement) {
  // videoElement.setAttribute("crossOrigin", "anonymous"); //设置图片跨域访问
  return new Promise((resolve, reject) => {
    videoElement.play();
    setTimeout(() => {
      videoElement.pause();
    }, 100);
    setTimeout(() => {
      try {
        // 创建一个 Canvas 元素
        let canvas = document.createElement("canvas");
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        // 获取 Canvas 2D 上下文
        let context = canvas.getContext("2d");
        // 将视频的当前帧绘制到 Canvas 上
        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        // 获取 Canvas 上的图像数据
        let imageDataURL = canvas.toDataURL("image/jpeg");
        resolve(imageDataURL);
      } catch (err) {
        console.log("获取第一帧失败");
        resolve("");
      }
    }, 500);
  });
}
// src地址转为file文件，用于重新上传
async function srcToFile(src, type, key) {
  let filetypeArr = type === "video" ? [".m4v", ".mp4", ".mov", ".webm"] : [".jpg", ".png", ".webp", ".jpeg"];

  let typeArr = filetypeArr.filter((item) => key.includes(item));
  console.log(filetypeArr, key, typeArr);
  let typeSuffix = typeArr[0].split(".")[1];

  let typeStr = "." + typeSuffix;
  let filetype = type === "video" ? "video/" + typeSuffix : "image/" + typeSuffix;
  if (type === "video" && (filetype !== "video/mp4" || filetype !== "video/webm")) {
    filetype = "video/quicktime";
  }
  return new Promise(async (resolve, reject) => {
    let blob = await videoSrcConvertToBlob(src, filetype);
    let file = await blobUrlToFile(blob, {
      filename: "vidqu_faceswap",
      type: filetype,
    });
    console.log(file);
    resolve(file);
  });
}
// src地址转为file文件，用于重新上传
async function srcToFile2(src, type) {
  let typeStr = type === "video" ? ".mp4" : ".jpg";
  let filetype = type === "video" ? "video/mp4" : "image/jpg";
  return new Promise(async (resolve, reject) => {
    let blob = await videoSrcConvertToBlob(src, filetype);
    let file = await blobUrlToFile(blob, {
      filename: "test",
      type: filetype,
    });

    let imgUploadUrlData = await fetchPost("ai/source/temp-upload-url", { file_name: "vidqu_faceswap" }, TOOL_API);
    if (imgUploadUrlData.data?.upload_url) {
      let imgUploadUrl = imgUploadUrlData.data.upload_url;
      try {
        await fetchPut(imgUploadUrl, file, "");
        resolve(imgUploadUrlData);
      } catch (error) {
        console.log(error);
        resolve(null);
      }
    } else {
      console.log(imgUploadUrlData);
      resolve(null);
    }
  });
}

function videoSrcConvertToBlob(src, type = "video/mp4") {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", src, true);
    xhr.responseType = "blob";

    xhr.onload = function (e) {
      if (this.status == 200) {
        let blob = new Blob([this.response], { type });
        let blobUrl = URL.createObjectURL(blob);
        resolve(blobUrl);
      }
    };
    xhr.send();
  });
}
function blobUrlToFile(blobUrl, fileData) {
  return new Promise((resolve, reject) => {
    let { filename, type } = fileData;
    fetch(blobUrl)
      .then((response) => response.blob()) // 将响应转换为 Blob
      .then((blob) => {
        // 创建一个新的 File 对象，可以指定文件名和文件类型
        let file = new File([blob], filename, { type });
        resolve(file);
        console.log("File object:", file);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
}

function shareFun(data) {
  // let {url,imageKey,text,title} = data
  let shareDialogEl = document.querySelector("#shareDialogEl");
  shareDialogEl.changeTips({
    title: data.title,
    content: data.content,
  });
  shareDialogEl.showShare({
    url: data.url,
    action: "videofacechangingshare",
    imageKey: data.imageKey,
    text: data.text,
    title: data.title,
  });
}

function getCountryConfig() {
  return new Promise((resolve, reject) => {
    fetchPost("ai/tool/videoface-user", {}, TOOL_API)
      .then((res) => {
        if (res.code === 200) {
          userRuleConfig = res.data;
          initCreditsComponents();
          if (actTab === "tab_video") {
            window.faceSwapTab.changeTabs(actTab)
          }
          changeHeaderCredit(res.data.credit);
          resolve(res.data);
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
        console.error(err)
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

// 获取地址参数
function getParameterByName(name) {
  name = name.replace(/[\[\]]/g, "\\$&");
  const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
  const results = regex.exec(window.location.search);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function video_swap_init() {
  let tabsContainer = {
    tab_all: [$("#photo_Face_swapper_container"), $("#video_Face_swapper_container")],
    tab_photo: {
      dom: [$("#photo_Face_swapper_container")],
    },
    tab_video: {
      dom: [$("#video_Face_swapper_container")],
    },
  };
  let aiFaceChangingV = new SubmitFaceSwap($("#video_Face_swapper_container .step_C"));
  window.aiFaceVideo = aiFaceChangingV;
  aiFaceChangingV.initFace();
  aiFaceChangingV.eventLoginsuccess();
  let tabsContol = new TabsChange($(".faceSwap_tabBox"), tabsContainer, aiFaceChangingV);
  tabsContol.initFace();
  // 配置服务器国家梯队处理
  getCountryConfig();
  // if (getCookie("access_token")) {
  //   fetchGet("ai/credit/user-credit-info", TOOL_API);
  // }

  if (getParameterByName("openTab") === "videofaceSwap") {
    tabsContol.changeTabs("tab_video");
  }
  return tabsContol;
}

function setCookie(e, t, o) {
  var n = new Date();
  n.setDate(n.getDate() + o);
  var a = location.hostname.includes(".vidqu.ai") ? ".vidqu.ai" : location.hostname,
    i = encodeURIComponent(t) + (null == o ? "" : ";expires=" + n.toUTCString()) + ";path=/;domain=" + a;
  document.cookie = e + "=" + i;
}

function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function createObjectURLFun(file) {
  // const blob = new Blob([file],{type: file.type})
  const url = URL.createObjectURL(file);
  // const url = webkitURL.createObjectURL(file);

  // if(isMobileDevice()){
  //     setTimeout(()=>{
  //         URL.revokeObjectURL(url)
  //     },2000)
  // }
  return url;
}
function createFileUrl(file) {
  let type = file.type;
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (event) {
      const base64data = event.target.result;
      resolve(base64data);
    };
    reader.readAsDataURL(file);
  });
}

function getFileUrlRequest(fileURL) {
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", fileURL, true);
    xhr.send();
    xhr.addEventListener("readystatechange", processRequest, false);

    function processRequest(e) {
      if (xhr.readyState == 2) {
        let fileSize = xhr.getResponseHeader("Content-Length");
        if (fileSize && fileSize / 1024 > 1) {
          resolve(true);
        } else {
          resolve(false);
        }
        xhr.abort();
      }
    }
  });
}


// not enough
function showNotEnoughCreditsVideo(credits = 1) {
  gtag("event", "alert_faceswap_videonocredit")
  videocreditSystem.showCreditPopup({
    title: getfsCreditsText("Model_not_credits_title"),
    content: getfsCreditsText("Model_not_credit_span", { val: credits }, true),
    btn: getfsCreditsText("Model_not_credits_btn"),
    btnFn: () => {
      gtag("event", "click_faceswap_videonocredit")
      setCookie("st", "fsvideonocredit");
      // window.open(toolPicingUrl);
    },
    modalCoins: "notenough",
  });
}

$(window).ready(function () {
  window.faceSwapTab = video_swap_init();
  
  $("#video_Face_swapper_container .my_files_tips .myfiles_check_Now_btn").on("click", ()=>{
    gtag("event", "click_vidqmyfiles_videotipsfile");
    
    if (!getCookie("access_token")) {
      showLoginWindow({
        isReloading: false,
        wait: [video_task_id],
        fn: async(data = null) => {
          if(data) {
            videoPhotoDownloadData = data;
          }
          window.open("/my-files.html");
        }
      });
    }else{
      window.open("/my-files.html");
    }
  })
});
