var canMultiFaceData = {};
window.multiphotoAiFaceChanging = {};

function showMaximumFileSizeV() {
  multiVcreditSystem.showCreditPopup({
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

class MultiVideoAiFace {
  constructor(options) {
    var that = this;
    this.multimodelV = options.multimodelV;
    that.setMaskUnlockPriority();
    Object.setPrototypeOf(MultiVideoAiFace.prototype, this.data());
    this.form = new Proxy(that.proxyData, {
      set(target, prop, value) {
        target[prop] = value;
        // 控制originimage元素的显示和隐藏
        if (target["originImage"]) {
          $("#multiple_Face_swapper_container_v .multi_upload_before").hide();
          $("#multiple_Face_swapper_container_v .multi_upload_after").show();
          $("#multiple_Face_swapper_container_v .drag_loadbox").addClass("height160");
        } else {
          $("#multiple_Face_swapper_container_v .multi_upload_before").show();
          $("#multiple_Face_swapper_container_v .multi_upload_after").hide();
          $(
            "#multiple_Face_swapper_container_v .change_multi_face_btn"
          ).addClass("disabled");
        }
        if (!target["firstPicLoading"]) {
          $("#multiple_Face_swapper_container_v .multi_Input").removeClass(
            "disabled"
          );
          $("#multiple_Face_swapper_container_v .random_btn").removeClass(
            "disabled"
          );
        } else {
          $("#multiple_Face_swapper_container_v .multi_Input").addClass(
            "disabled"
          );
          $("#multiple_Face_swapper_container_v .random_btn").addClass(
            "disabled"
          );
        }
        return true;
      },
      get(target, prop) {
        return target[prop];
      },
    });
  }
  data() {
    return {
      mergeImg: {
        width: 0,
        height: 0,
      },
      proxyData: {
        originImage: null,
        firstPicLoading: false,
      },
      tryCount: 0,
      multipleIndex: null,
      delay: 2000,
      lastCall: 0,
      taskid: null,
      imgList: [],
      mergeImgUrl: null, // 当前合成图片的路径
      mergeKey: null, // 当前合成图片的key
      changeFaceLoading: false, // 换脸的加载boolean
      canMultiFaceData: {}, // 是否可以换脸
      showCreditBannerBool: true,
      uploadFacesNumber: 0,
      formdata: {
        avatar_obey_key: null,
        get_face_id: null,
        watermark_type: 2,
        avatar_main_key: [],
      },
      itemLoading: [],
    };
  }

  // 获取上传文件地址
  getUploadFileUrl = (suffix) => {
    let type = suffix;
    try {
      type = suffix.split("/")[1] || "png";
    } catch (e) {
      type = "png";
    }
    return fetchPost("ai/source/temp-upload-url", {
      file_name: "Vidnoz_AiFaceSwap_" + new Date().getTime() + "." + type,
    },TOOL_API);
  };

  // 通过上传地址传递文件
  uploadFile = ({ url, file }) => {
    return new Promise(async (resolve, reject) => {
      try {
        var res = await fetchPut(url, file, "");
        resolve(res);
      } catch (e) {
        console.error(e.message);
        reject(e);
      }
    });
  };

  // 设置加载步骤的文案
  setLoadingVideoText(step, num) {

    if(Number(num)<1)num = 0;

    if (step === 1) {
      $("#multiple_Face_swapper_container_v .loading_multi_box p").text(
        multitextContentObj.faceSwapPop01.Preparing_step
      );
    }
    if (step === 2) {
      $("#multiple_Face_swapper_container_v .loading_multi_box p").text(
        num + "% " + multitextContentObj.faceSwapPop01.Analyzing_setp
      );
    }
    if (step === 3) {
      $("#multiple_Face_swapper_container_v .loading_multi_box p").text(
        num + "% " + multitextContentObj.faceSwapPop01.Swapping_setp
      );
    }
  }

  // 添加视频
  async addMultiVideo({ addData = {}, file, callback }) {
    try {
      if (typeof file !== "string" && !this.checkVideoType(file)) return;
      if (!this.setLimit(file)) return;
      const demoKey = addData?.demoKey || undefined;
      const demoSrc = addData?.demoSrc || undefined;
      const demoDuration = addData?.demoDuration || undefined;
      const demoImgSrc = addData?.demoImgSrc || undefined;
      this.setFirstStart(true);
      let duration = userRuleConfig.duration; // 时长
      let showVideoUrl = null; // video地址
      let coverImg = showVideoUrl; // 小图地址
      let type = demoKey ? "video" : "gif";
      this.maintype = "video";
      // 视频类型需要获取第一帧
      if (file?.type?.includes("video")) {
        const info = await this.getVideoInfo(file);
        duration = info.duration;
        coverImg = info.coverImg;
        type = "video";
      }
      // if (duration > 60 * 120) {
      //   this.multimodelV.errorMessage({
      //     conText: `
      //       <h1>${textContentObj.processImageTitle}</h1>
      //       <p>${setTextContentObj("limit_min")}</p>
      //     `,
      //     btnText: textContentObj.ok,
      //   });
      //   this.multimodelV.options.visible = true;
      //   this.setFirstStart(false);
      //   return;
      // }
      this.duration = duration;
      this.setLiLoading(true);
      this.showToolBtn(false);
      $("#multiple_Face_swapper_container_v .change_multi_face_btn").addClass(
        "disabled"
      );
      if (demoKey) {
        // 处理类型是网络地址的视频
        coverImg = demoImgSrc;
        showVideoUrl = demoSrc;
        duration = demoDuration;
        this.formdata.avatar_obey_key = demoKey;
      } else {
        // 处理类型是文件类型的视频
        showVideoUrl = URL.createObjectURL(file);
        const res = await this.uploadMultiVideoPromise(file);
        this.formdata.avatar_obey_key = res.data.key;
      }
      // gif类型将自己变为第一帧
      if (type === "gif") {
        coverImg = URL.createObjectURL(file);
        $(".controls").hide();
      } else {
        $(".controls").attr("style", "display: flex");
      }
      var data = { file, showUrl: coverImg, duration, showVideoUrl };
      this.uploadFacesNumber = 0;
      this.addFindFacesTask(() => {
        this.form.originImage = data;
        $("#multiple_Face_swapper_container_v .multi_img")
          .find("#multi_img")
          .attr("src", data.showUrl);
        $("#multiple_Face_swapper_container_v .multi_img").addClass(
          "video_img"
        );
        this.showMultiVideo(type, showVideoUrl, coverImg);
        callback?.(data);
        showBtnCreditsMultiVideo(false);
        this.setLiLoading(false);
        this.setFirstStart(false);
      }, duration);
    } catch (error) {
      console.error(111)
      console.error(error)
      this.multimodelV.errorMessage({
        conText: `
        <h1>${textContentObj.errorUploadTitle}</h1>
        <p>${textContentObj.filereadfail}</p>
        `,
        btnText: textContentObj.ok,
      });
      this.multimodelV.options.visible = true;
      this.setFirstStart(false);
    }
  }

  ttsBlank(data) {
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

  formatTime = (seconds) => {
    if (seconds == 0) return "00:00";
    if (this.ttsBlank(seconds) || Number.isNaN(seconds)) return "00:00";
    let m = parseInt(seconds / 60);
    m = m < 10 ? "0" + m : m;
    var s = parseInt(seconds % 60);
    s = s < 10 ? "0" + s : s;
    return `${m}:${s}`;
  };

  progressMove(e) {
    let X = 0;
    if (!isMobileDevice()) {
      X = e.clientX;
    } else {
      X = e.targetTouches[0].pageX;
    }
    const progressBox = document.querySelector(".control_progress");
    const control_progress_innter = $(
      ".control_progress .control_progress_innter"
    );
    const left = progressBox.getBoundingClientRect().left;
    const width = progressBox.offsetWidth;
    let mX = X - left;
    let progressWidth;
    if (mX < 0) {
      progressWidth = 0;
    } else if (mX > width) {
      progressWidth = width;
    } else {
      progressWidth = mX;
    }
    control_progress_innter;
    // return progressWidth
  }

  // 设置视频事件
  setPlayControls(videodom, controls) {
    const that = this;
    const control_btn = controls.find(".control_btn");
    const control_time = controls.find(".control_time");
    const video = videodom[0];
    video.load();
    const videoOnLoaded = function () {
      videodom.off("click").on("click", function () {
        if (control_btn.hasClass("pause")) {
          video.pause();
        }else {
          video.play();
        }
      });
    };

    const videoOnEnded = function () {
      console.log("end");
      control_btn.removeClass("pause");
    };
    const videoOnplaying = function () {
      console.log("play");
      control_btn.addClass("pause");
    };
    const videoOnpuased = function () {
      console.log("pause");
      control_btn.removeClass("pause");
    };
    videodom.off("loadedmetadata").on("loadedmetadata", videoOnLoaded);
    videodom.off("ended").on("ended", videoOnEnded);
    videodom.off("playing").on("playing", videoOnplaying);
    videodom.off("pause").on("pause", videoOnpuased);
  }

  // 显示视频的gif或者video
  showMultiVideo(type = "video", showUrl, cover_url) {
    const video_preview_dom_multi = $("#video_preview_dom_multi"); // 大图视频显示
    const video_preview_dom_multi_box = $(".video_preview_dom_multi_box"); // 大图视频盒子
    const multi_video_con = $("#multi_video_con"); // 视频集合元素
    const multi_img_con = $("#multi_img_con"); // 图片集合元素
    const img_gif_node_multi = $("#img_gif_node_multi"); // 大图gif显示
    const large_multi_video = $("#large_multi_video"); // zoom视频显示
    if (type === "video") {
      video_preview_dom_multi.attr("src", showUrl);
      video_preview_dom_multi_box
        .find("#img_video_cover")
        .attr("src", cover_url);
      video_preview_dom_multi_box.show();
      // v_preview_playIcon_multi.show();
      img_gif_node_multi.hide();
    } else {
      img_gif_node_multi.attr("src", showUrl);
      img_gif_node_multi.show();
      video_preview_dom_multi_box.hide();
      // v_preview_playIcon_multi.hide();
    }
    multi_video_con.show();
    multi_img_con.hide();
    this.setPlayControls(video_preview_dom_multi, $(".multi_controls"));
    this.setPlayControls(large_multi_video, $(".large_multi_controls"));
  }

  // 获取上传视频地址
  getUploadVideoUrl = (suffix) => {
    let type = suffix;
    try {
      type = suffix.substring(suffix.lastIndexOf(".")) || "mp4";
    } catch (e) {
      type = "mp4";
    }
    return fetchPost("ai/source/temp-upload-url", {
      file_name: "Video Face Swap" + type,
    },TOOL_API);
  };

  // 上传文件类型视频流程
  uploadMultiVideoPromise(file) {
    return new Promise(async (resolve, reject) => {
      try {
        var res = await this.getUploadVideoUrl(file.name);
        this.uploadFile({ url: res.data.upload_url, file })
          .then((res1) => {
            resolve(res);
          })
          .catch((err) => reject(err));
      } catch (err) {
        console.log(err);
      }
    });
  }

  // 获取视频基本信息
  getVideoInfo(file) {
    return new Promise((resolve, reject) => {
      let videoURL = file;
      if (typeof file !== "string") {
        videoURL = URL.createObjectURL(file);
      }
      const video = document.getElementById("multi_video_dom");
      video.src = videoURL;
      video.addEventListener(
        "loadedmetadata",
        () => {
          setTimeout(async () => {
            const duration = video.duration;
            let coverImg = await getVideoCoverImage(video);
            resolve({ duration, coverImg });
          }, 200);
        },
        { once: true }
      );
      video.addEventListener(
        "error",
        (e) => {
          reject(e);
        },
        { once: true }
      );
    });
  }

  // 限制弹窗
  setLimit(file) {
    let bool = true;
    const maxSizeInBytes = 1024 * 1024 * window.userRuleConfig.limit; // 200 MB
    if (typeof file !== "string" && file.size > maxSizeInBytes) {
      gtag("event","alert_mulfaceswap_videomaxlimit")
      if(userRuleConfig?.is_subscriber === 1){
        this.multimodelV.errorMessage({
          conText: `
            <h1>${getFSMCreditsText("Model_MaximumFile_title")}</h1>
            <p>${getFSMCreditsText("Model_MaximumFile_span2", {
            val: window.userRuleConfig.limit,
          })}</p>
          `,
          btnText: textContentObj.ok,
        });
        this.multimodelV.options.visible = true;
      }else{
        showMaximumFileSizeV()
      }
      // isLogin(true);
      bool = false;
    }
    return bool;
  }

  // 多人换脸获取人脸
  async addFindFacesTask(callback, duration) {
    try {
      const param = {
        avatar_obey_key: this.formdata.avatar_obey_key,
        duration: Number(duration || 1),
      };
      if (!duration) delete param.duration;
      let { data, code } = await fetchPost(
        "ai/ai-tool/add-task",
        {
          action: "multiple_video_get_face",
          param,
        },
        TOOL_API,
        {
          "X-TASK-VERSION": "2.0.0",
        }
      );
      if (code === 200) {
        this.formdata.get_face_id = data.task_id;
        this.getFindFacesTask(callback);
      } else if (code === 3014) {
        showMaximumMV();
        this.checkMultiChangeFaceStatus();
        this.setFirstStart(false);
        this.setLiLoading(false);
      } else {
        this.multimodelV.errorMessage({
          conText: `
            <h1>${multitextContentObj.faceSwapPop01.processImageTitle}</h1>
          `,
          btnText: multitextContentObj.OK,
        });
        this.multimodelV.options.visible = true;
        this.setFirstStart(false);
        this.setLiLoading(false);
        this.checkMultiChangeFaceStatus();
      }
    } catch (err) {
      console.error(err);
    }
  }
  // 多人换脸获取人脸轮询任务
  async getFindFacesTask(callback) {
    const that = this;
    const id = this.formdata.get_face_id;
    if (!id) return;
    fetchPost(`ai/tool/get-task`, { id },TOOL_API)
      .then((res) => {
        if (res.message.includes("no face")) {
          // if (that.canMultiFaceData.data?.credit) {
          //   Target_Photo = multitextContentObj.Credits_failed_celebrity;
          // }
          this.multimodelV.errorMessage({
            conText: `
            <h1>${multitextContentObj.faceSwapPop01.processImageTitle}</h1>
            <p>${multitextContentObj.NoFaceMulti}</p>
          `,
            btnText: multitextContentObj.OK,
          });
          this.multimodelV.options.visible = true;
          this.setLoadingStart(false);
          this.setLoadingMaskTip(false);
          $(
            "#multiple_Face_swapper_container_v .change_multi_face_btn"
          ).addClass("disabled");
          this.formdata.avatar_main_key = [];
          that.setMultipleListImgs();
          $("#multiple_Face_swapper_container_v .people_recognized_box").hide();
          return;
        }
        if (res.code !== 200) {
          // ==================================
          let processImage = multitextContentObj.faceSwapPop01.processImage;
          // if (this.canMultiFaceData.data?.credit) {
          //   processImage = multitextContentObj.Credits_failed;
          // }
          this.multimodelV.errorMessage({
            conText: `
            <h1>${multitextContentObj.faceSwapPop01.processImageTitle}</h1>
            <p>${processImage}</p>
          `,
            btnText: multitextContentObj.OK,
          });
          this.multimodelV.options.visible = true;
          this.setLoadingStart(false);
          this.setLoadingMaskTip(false);
        } else {
          this.tryCount = 0;
          if (res.data.status === 0) {
            console.log(res.data);
            callback?.();
            this.formdata.avatar_main_key = res.data.additional_data.map(
              (el) => ({
                obey_part_key: el.avatar_part_key,
                obey_part_url: el.avatar_part_url,
              })
            );
            console.log(that);
            that.setMultipleListImgs();
            setTimeout(() => {
              $(
                "#multiple_Face_swapper_container_v .people_recognized_box"
              ).show();
              this.setFirstStart(false);
              this.setLiLoading(false);
            }, 1000);
          } else {
            setTimeout(() => {
              this.getFindFacesTask(callback);
            }, 2000);
          }
        }
      })
      .catch((err) => {
        console.error(err);
        if (this.tryCount >= 3) {
          this.multimodelV.errorMessage({
            conText: `
            <h1>${multitextContentObj.faceSwapPop01.processImageTitle}</h1>
            <p>${multitextContentObj.processImage}</p>
          `,
            btnText: multitextContentObj.OK,
          });
          this.multimodelV.options.visible = true;
          this.setLoadingStart(false);
        } else {
          console.log("retrying");
          setTimeout(() => {
            this.getFindFacesTask(callback);
            this.tryCount++;
          }, 5000);
        }
      });
  }

  urlToFile(url) {
    return new Promise((resolve, reject) => {
      fetch(url)
        .then((response) => response.blob())
        .then((blob) => {
          // 这里的 blob 对象就是转换后的结果
          resolve(blob);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  // 设置开始换脸的loading
  setLoadingStart(flag) {
    if (flag) {
      $("#multiple_Face_swapper_container_v .random_btn").addClass("disabled");
      this.setFirstStart(true);
      $(
        "#multiple_Face_swapper_container_v .change_multi_face_btn ._multi_step3_btn"
      ).text(multitextContentObj.Generating);
      $("#multiple_Face_swapper_container_v .multi-generating-animate").show();
      this.changeFaceLoading = true;
      $("#multiple_Face_swapper_container_v #mult_main_face_change_img").attr(
        "style",
        "filter: blur(5px) brightness(0.7)"
      );
      $("#multiple_Face_swapper_container_v .change_multi_face_btn").addClass(
        "disabled"
      );
      this.setLiLoading(true);
      // $("#multiple_Face_swapper_container_v .loading_multi_box p").text(
      //   getMultiText("Loading2")
      // );
      $("#multiple_Face_swapper_container_v .loading_multi_box").show();
      $("#multiple_Face_swapper_container_v .people_recognized_list").addClass(
        "inter_loading"
      );
      $(".high_quality_append_dom_multiv").attr("style", "pointer-events:none");
      // $("#multiple_Face_swapper_container_v .multi_people_list_loading").show();
    } else {
      this.setFirstStart(false);
      $("#multiple_Face_swapper_container_v .random_btn").removeClass(
        "disabled"
      );
      $(
        "#multiple_Face_swapper_container_v .change_multi_face_btn ._multi_step3_btn"
      ).text(multitextContentObj.step3_btn);
      $("#multiple_Face_swapper_container_v .multi-generating-animate").hide();
      $(
        "#multiple_Face_swapper_container_v .change_multi_face_btn"
      ).removeClass("disabled");
      this.changeFaceLoading = false;
      this.setLiLoading(false);
      // $("#multiple_Face_swapper_container_v .multi_pics li").attr("style", "")
      $("#multiple_Face_swapper_container_v #mult_main_face_change_img").attr(
        "style",
        ""
      );
      $("#multiple_Face_swapper_container_v .loading_multi_box").hide();
      $(
        "#multiple_Face_swapper_container_v .people_recognized_list"
      ).removeClass("inter_loading");
      $(".high_quality_append_dom_multiv").attr("style", "");
      // $("#multiple_Face_swapper_container_v .people_recognized_list").find("add_icon_close").show();
      // $("#multiple_Face_swapper_container_v .multi_people_list_loading").hide();
    }
  }

  setLiLoading = (flag) => {
    if (flag) {
      $("#multiple_Face_swapper_container_v .multi_pics li").attr(
        "style",
        "filter: blur(3px);pointer-events: none;"
      );
    } else {
      $("#multiple_Face_swapper_container_v .multi_pics li").attr("style", "");
    }
  };

  // 设置大图loading
  setBigImageStart = (flag) => {
    if (flag) {
      $("#multiple_Face_swapper_container_v #mult_main_face_change_img").attr(
        "style",
        "filter: blur(5px) brightness(0.7)"
      );
      $("#multiple_Face_swapper_container_v .loading_multi_box").show();
    } else {
      $("#multiple_Face_swapper_container_v #mult_main_face_change_img").attr(
        "style",
        ""
      );
      $("#multiple_Face_swapper_container_v .loading_multi_box").hide();
    }
  };

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

  // 设置第一张图换脸的loading
  setFirstStart = (flag) => {
    if (flag) {
      $("#multiple_Face_swapper_container_v .multi_upload_before").addClass(
        "loading"
      );
      $("#multiple_Face_swapper_container_v .multi_upload_after").addClass(
        "loading"
      );
      $("#multiple_Face_swapper_container_v .multi_Input").addClass("disabled");
      $(
        "#multiple_Face_swapper_container_v .multi_Input .multi_uploader_btn_con"
      )
        .removeClass("show_btn_con")
        .hide();
      $(
        "#multiple_Face_swapper_container_v .multi_Input .multi_uploader_btn_loading"
      ).show();
      $(
        "#multiple_Face_swapper_container_v .multi_uploader_btn .multi_uploader_btn_con"
      ).hide();
      $(
        "#multiple_Face_swapper_container_v .multi_uploader_btn .multi_uploader_btn_loading"
      ).show();
      $("#multiple_Face_swapper_container_v .people_recognized_list").addClass(
        "inter_loading"
      );
      $("#multi_video_con").addClass("loading");
      this.form.firstPicLoading = true;
      this.setBigImageStart(true);
    } else {
      $("#multiple_Face_swapper_container_v .multi_upload_before").removeClass(
        "loading"
      );
      $("#multiple_Face_swapper_container_v .multi_upload_after").removeClass(
        "loading"
      );
      $("#multiple_Face_swapper_container_v .multi_Input").removeClass(
        "disabled"
      );
      $(
        "#multiple_Face_swapper_container_v .multi_Input .multi_uploader_btn_con"
      )
        .show()
        .addClass("show_btn_con");
      $(
        "#multiple_Face_swapper_container_v .multi_Input .multi_uploader_btn_loading"
      ).hide();
      $(
        "#multiple_Face_swapper_container_v .multi_uploader_btn .multi_uploader_btn_loading"
      ).hide();
      $(
        "#multiple_Face_swapper_container_v .multi_uploader_btn .multi_uploader_btn_con"
      ).show();
      $(
        "#multiple_Face_swapper_container_v .people_recognized_list"
      ).removeClass("inter_loading");
      $("#multi_video_con").removeClass("loading");
      this.form.firstPicLoading = false;
      this.setBigImageStart(false);
    }
  };

  checkMultiChangeFaceStatus = () => {
    if (!this.formdata.avatar_main_key.some((el) => el.main_part_key)) {
      $("#multiple_Face_swapper_container_v .change_multi_face_btn").addClass(
        "disabled"
      );
    } else {
      $(
        "#multiple_Face_swapper_container_v .change_multi_face_btn ._multi_step3_btn"
      ).text(multitextContentObj.step3_btn);
      $("#multiple_Face_swapper_container_v .multi-generating-animate").hide();
      $(
        "#multiple_Face_swapper_container_v .change_multi_face_btn"
      ).removeClass("disabled");
      this.changeFaceLoading = false;
    }
  };

  // 换脸操作
  changeMultiFace = async () => {
    const that = this;
    if (this.changeFaceLoading) {
      return;
    }
    this.setLoadingStart(true);

    this.setLoadingVideoText(1);
    this.showToolBtn(false);
    const param = {
      ...this.formdata,
      avatar_main_key: this.formdata.avatar_main_key.filter(
        (el) => el.main_part_key
      ),
      is_hd: multiVcreditSystem?.is_hd,
      duration: that.duration,
    };
    if (!that.duration) delete param.duration;
    fetchPost(
      "ai/ai-tool/add-task",
      {
        param,
        action: "multiple_video_face_swap",
      },
      TOOL_API,
      {
        "X-TASK-VERSION": "2.0.0",
      }
    )
      .then(async (res) => {
        if (res.code === 200) {
          showBtnCreditsMultiVideo(true);
          this.getFinalImg(res.data.task_id);
        } else if (res.code===3008) {
          showNotEnoughCreditsMV(getCreditsFromVideoOrPic(multiAiFaceV, "video"));
          this.checkMultiChangeFaceStatus();
          this.setFirstStart(false);
          this.setLiLoading(false);
        } else if (res.code === 3014) {
          showMaximumMV();
          this.checkMultiChangeFaceStatus();
          if (
            this.mergeKey ||
            $(
              "#multiple_Face_swapper_container_v #mult_main_face_change_img"
            ).attr("data-key") !== "multi_img"
          ) {
            this.showToolBtn(true, true);
          }
          this.setFirstStart(false);
          this.setLiLoading(false);
        } else if (res.code === 401) {
          this.multimodelV.errorMessage({
            conText: multitextContentObj.loginFirst,
            btnText: multitextContentObj.OK,
          });
          this.multimodelV.options.visible = true;
          this.setLoadingStart(false);
        } else if (res.code === 3001) {
          if (
            $(
              "#multiple_Face_swapper_container_v #mult_main_face_change_img"
            ).attr("data-key") !== "multi_img"
          ) {
            this.showToolBtn(true, true);
          }
          $(
            "#multiple_Face_swapper_container .multi_stpe3_upload .v_step3_btn_credits"
          ).show();
          this.showCreditBannerV(false);
          showMaximumMV();
          this.setLoadingStart(false);
        } else {
          console.error(res);
          this.multimodelV.errorMessage({
            conText: `
              <h1>${multitextContentObj.faceSwapPop01.errorUploadTitle}</h1>
              <p>${multitextContentObj.faceSwapPop01.errorUpload}</p>
            `,
            btnText: multitextContentObj.OK,
          });
          this.multimodelV.options.visible = true;
          this.setLoadingStart(false);
        }
      })
      .catch((err) => {
        console.error(err);
        this.multimodelV.errorMessage({
          conText: `
            <h1>${multitextContentObj.faceSwapPop01.errorUploadTitle}</h1>
            <p>${multitextContentObj.faceSwapPop01.errorUpload}</p>
          `,
          btnText: multitextContentObj.OK,
        });
        this.checkMultiChangeFaceStatus();
        this.multimodelV.options.visible = true;
        this.setLoadingStart(false);
      });
  };

  // 检查文件类型
  checkFileType = (file, type) => {
    var allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/octet-stream",
    ];
    var fileType = file.type;

    var allowedNameTypes = ["jpeg", "png", "webp", "jpg"];
    let nameArr = file.name.split(".");
    var fileNameType = nameArr[nameArr.length - 1].toLowerCase();

    if (
      !allowedTypes.includes(fileType) ||
      !allowedNameTypes.includes(fileNameType)
    ) {
      this.multimodelV.errorMessage({
        conText: `
          <h1>${textContentObj.processImageTitle}</h1>
          <p>${textContentObj.limit}</p>
        `,
        btnText: textContentObj.ok,
      });
      this.multimodelV.options.visible = true;
      this.setBigImageStart(false);
      if (type === 1) {
        this.setFirstStart(false);
      }
      if (type === 2) {
        this.setSecondStart(false);
      }
      return false;
    }
    return true;
  };

  // 检查文件类型
  checkVideoType = (file) => {
    if (typeof file === "string") return true;
    var allowedTypes = [
      "video/mp4",
      "video/quicktime",
      "video/webm",
      "video/x-m4v",
      "image/gif",
      "application/octet-stream",
    ];
    if (isMacorIos()) {
      allowedTypes = allowedTypes.filter((e) => !e.includes("webm"));
    }
    var fileType = file.type;

    if (!allowedTypes.includes(fileType)) {
      let text = isMacorIos()
        ? multitextContentObj.faceSwapPop01.limitvios
        : multitextContentObj.faceSwapPop01.limitv;
      // if (type) {
      //   text = textContentObj.limit
      // }
      this.multimodelV.errorMessage({
        conText: `
          <h1>${multitextContentObj.faceSwapPop01.processImageTitle}</h1>
          <p>${text}</p>
        `,
        btnText: multitextContentObj.OK,
      });
      this.multimodelV.options.visible = true;
      this.setBigImageStart(false);
      this.setFirstStart(false);
      $("#multiple_Face_swapper_container_v #multi_uploader")[0].value = "";
      return false;
    }
    return true;
  };

  showToolBtn(flag) {
    if (flag) {
      var computedStyle = window.getComputedStyle(
        document.querySelector("#mult_main_face_change_img")
      );
      this.mergeImg = {
        width: computedStyle.getPropertyValue("width").split("px")[0],
        height: computedStyle.getPropertyValue("height").split("px")[0],
      };
      $("#multiple_Face_swapper_container_v .multi_img_btns").attr(
        "style",
        `display: flex;`
      );
      $("#multiple_Face_swapper_container_v .my_files_tips").attr(
        "style",
        `display: flex;`
      );
      gtag("event","show_vidqmyfiles_videotipsfile_mv");
      // if (!notShowImage) {
      //   $("#multiple_Face_swapper_container_v #mult_main_face_change_img").attr("src", this.mergeImgUrl);
      // }
    } else {
      $("#multiple_Face_swapper_container_v .multi_img_btns").hide();
      $("#multiple_Face_swapper_container_v .my_files_tips").hide();
    }
  }

  // 轮询获取最后成功的图片（2秒一次）
  getFinalImg = (id) => {
    const that = this;
    this.showToolBtn(false);
    this.setLoadingStart(true);
    this.taskid = id;
    fetchPost(`ai/tool/get-task`, { id }, TOOL_API)
      .then((res) => {
        if (res.message.includes("nsfw")) {
          let nsfw_photo = multitextContentObj.nsfw_photo;
          if (that.canMultiFaceData.data?.credit) {
            nsfw_photo = multitextContentObj.faceSwapPop01.Credits_failed_nsfw;
          }
          this.multimodelV.errorMessage({
            conText: `
              <h1>${multitextContentObj.faceSwapPop01.processImageTitle}</h1>
              <p>${nsfw_photo}</p>
            `,
            btnText: multitextContentObj.OK,
          });
          this.multimodelV.options.visible = true;
          this.setLoadingStart(false);
          that.setLoadingMaskTip(false);
          return;
        }
        if (res.message.includes("celebrity")) {
          let Target_Photo = multitextContentObj.faceSwapPop01.Target_Photo;
          if (that.canMultiFaceData.data?.credit) {
            Target_Photo =
              multitextContentObj.faceSwapPop01.Credits_failed_celebrity;
          }
          this.multimodelV.errorMessage({
            conText: `
              <h1>${multitextContentObj.faceSwapPop01.processImageTitle}</h1>
              <p>${Target_Photo}</p>
            `,
            btnText: multitextContentObj.OK,
          });
          this.multimodelV.options.visible = true;
          this.setLoadingStart(false);
          that.setLoadingMaskTip(false);
          return;
        }
        if (res.message.includes("faces=")) {
          if (res.message.includes("faces=0")) {
            let Target_Photo = multitextContentObj.NoFaceMulti;
            if (that.canMultiFaceData.data?.credit) {
              Target_Photo =
                multitextContentObj.faceSwapPop01.Credits_failed_NoFaceMulti;
            }
            this.multimodelV.errorMessage({
              conText: `
                <h1>${multitextContentObj.faceSwapPop01.processImageTitle}</h1>
                <p>${Target_Photo}</p>
              `,
              btnText: multitextContentObj.OK,
            });
            this.multimodelV.options.visible = true;
            this.setLoadingStart(false);
            that.setLoadingMaskTip(false);
            return;
          }
          // if (res.message.split("faces=")?.[1] > 1) {
          //   if (that.canMultiFaceData.data?.credit) {
          //     Target_Photo = multitextContentObj.Credits_failed_celebrity;
          //   }
          //   this.multimodelV.errorMessage({
          //     conText: `
          //       <h1>${multitextContentObj.faceSwapPop01.processImageTitle}</h1>
          //       <p>${multitextContentObj.faceSwapPop01.manyFace}</p>
          //     `,
          //     btnText: multitextContentObj.OK,
          //   });
          //   this.multimodelV.options.visible = true;
          //   this.setLoadingStart(false);
          //   that.setLoadingMaskTip(false);
          //   return;
          // }
        }
        if (res.code !== 200) {
          // ==================================
          let processImage = multitextContentObj.faceSwapPop01.processImage;
          if (this.canMultiFaceData.data?.credit) {
            processImage = multitextContentObj.faceSwapPop01.Credits_failed;
          }
          this.multimodelV.errorMessage({
            conText: `
              <h1>${multitextContentObj.faceSwapPop01.processImageTitle}</h1>
              <p>${processImage}</p>
            `,
            btnText: multitextContentObj.OK,
          });
          this.multimodelV.options.visible = true;
          this.setLoadingStart(false);
          that.setLoadingMaskTip(false);
        } else {
          if (res.data.wait?.show_wait === 1) {
            if (show_ppriority == 0) {
              gtag("event","show_mulfaceswap_videopriority");
              show_ppriority++;
            }
            let { num, second } = res.data.wait;
            that.setLoadingMaskTip(true, { show_wait: 1, num, second });
          } else {
            that.setLoadingMaskTip(false);
          }

          if (res.data.status === -1) {
            this.setLoadingVideoText(2, res.data.progress);
          }else if (res.data.status === -2) {
            this.setLoadingVideoText(3, res.data.progress);
          }
          this.tryCount = 0;
          if (res.data.status === 0) {
            show_ppriority = 0;
            this.mergeImgUrl = res.data.additional_data?.merge_url;
            this.mergeKey = res.data.additional_data?.merge_key;
            setCookie("faceSwapTime_swap", Date.now(), 2);
            window.userRuleConfig.credit = res.data.credit;
            this.showCreditBannerV(true);
            changeHeaderCredit(res.data.credit);
            gtag("event","succ_mulfaceswap_videoswapbtn");
            setTimeout(() => {
              this.setLoadingStart(false);
              $(
                "#multiple_Face_swapper_container_v .change_multi_face_btn"
              ).removeClass("disabled");
              $("#large_multi_face_v_modal #large_multi_video").attr(
                "src",
                res.data.additional_data?.merge_url
              );
              this.showMultiVideo(
                "video",
                res.data.additional_data?.merge_url,
                res.data.additional_data?.cover_url
              );
              $(".controls").attr("style", "display: flex");
              this.showToolBtn(true);
              this.setLoadingVideoText(1);
            }, 1000);
          } else {
            setTimeout(() => {
              this.getFinalImg(id);
            }, 2000);
          }
        }
      })
      .catch((err) => {
        console.error(err);
        if (this.tryCount >= 3) {
          let error = multitextContentObj.faceSwapPop01.processImage;
          if (this.canMultiFaceData.data?.credit) {
            error = multitextContentObj.faceSwapPop01.Credits_failed;
          }
          this.multimodelV.errorMessage({
            conText: `
                <h1>${multitextContentObj.faceSwapPop01.processImageTitle}</h1>
                <p>${error}</p>
              `,
            btnText: multitextContentObj.OK,
          });
          this.multimodelV.options.visible = true;
          this.setLoadingStart(false);
          this.setLoadingMaskTip(false);
        } else {
          console.log("retrying");
          setTimeout(() => {
            this.getFinalImg(id);
            this.tryCount++;
          }, 5000);
        }
      });
  };

  // 检测脸
  faceCheck = async ({ blobUrl = "" }) => {
    return new Promise((resolve, reject) => {
      var Img = new Image();
      Img.src = blobUrl;
      Img.onload = async () => {
        try {
          // const result = await faceapi.detectAllFaces(Img);
          const result = await faceapi.detectAllFaces(
            Img,
            new faceapi.SsdMobilenetv1Options()
          );
          if (result.length) {
            resolve(result.length);
          } else {
            const result2 = await faceapi.detectAllFaces(
              Img,
              new faceapi.TinyFaceDetectorOptions({
                inputSize: 416,
              })
            );
            resolve(result2.length);
          }
        } catch (error) {
          console.log(error);
          reject(error);
        }
      };
      Img.onerror = async () => {
        console.log(error);
        reject(error);
      };
    });
  };

  checkFacePicMulti = (file) => {
    return new Promise(async (resolve, reject) => {
      try {
        let blobUrl = file;
        if (typeof file !== "string") {
          blobUrl = URL.createObjectURL(file);
        }
        // var result = await this.faceCheck({ blobUrl });
        // console.log("faces num", result);
        resolve(1);
      } catch (e) {
        reject(e);
      }
    });
  };

  // 关于脸检测数量的弹窗
  showModalAboutFaceNumber = (result, clickType) => {
    $("#multiple_Face_swapper_container_v .multi_uploader_multi")[0].value = "";
    let word = multitextContentObj.NoFaceMulti;
    if (result && result > 1) {
      word = multitextContentObj.faceSwapPop01.manyFace;
    }
    this.multimodelV.errorMessage({
      conText: `
        <h1>${multitextContentObj.faceSwapPop01.processImageTitle}</h1>
        <p>${word}</p>
      `,
      btnText: multitextContentObj.faceSwapPop01.replaceImg,
      btnClick: () => {
        if (clickType === "faces_recognized") {
          $("#multiple_Face_swapper_container_v #multi_uploader").click();
        } else {
          $("#multiple_Face_swapper_container_v .multi_uploader_multi").click();
        }
      },
    });
    this.multimodelV.options.visible = true;
  };

  // 获取demo图片
  getImgList() {
    var that = this;
    fetchGet("ai/public/example?action=multiple_video_face_swap",TOOL_API, {
      "Request-Origin": "vidqu"
    })
      .then((res) => {
        if (res.code === 401) {
          this.multimodelV.errorMessage({
            conText: multitextContentObj.loginFirst,
            btnText: multitextContentObj.OK,
          });
          this.multimodelV.options.visible = true;
          $("#multiple_Face_swapper_container_v .multi_pics").html(
            multitextContentObj.loginFirst
          );
          return;
        }
        that.domain = res.data.domain;
        that.imgList = res.data.video;

        res.data.video.forEach((face, index) => {
          $("#multiple_face_swapper_try .video-content-box .content-box").append(`
            <li><img src="${that.domain + face.cover_key}" data-key="${face.video_key}" data-index="${index + 1}"/></li> 
          `);
        });

      })
      .catch((error) => {
        console.error("fail", error);
      });
  }

  resizeImageByFile(file) {
    var that = this;
    var maxSide = 1920;
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

  // 上传文件类型图片流程
  uploadMultiImagePromise(file) {
    return new Promise(async (resolve, reject) => {
      try {
        var res = await this.getUploadFileUrl(file.type);
        var { blog, imgType } = await this.resizeImageByFile(file);
        this.uploadFile({ url: res.data.upload_url, file: blog })
          .then((res1) => {
            resolve({ res, blog, imgType });
          })
          .catch((err) => reject(err));
      } catch (err) {
        console.log(err);
        reject(false);
      }
    });
  }

  getSourceUrl(key) {
    return fetchPost("ai/source/get-access-url", {
      key,
      file_name: "Vidnoz_AiFaceSwap_" + new Date().getTime() + ".png",
    },TOOL_API);
  }

  setDragLoading(classname, flag) {
    if (flag) {
      if (this.proxyData.originImage) {
        $(`.${classname} .can_drag_box`).addClass("blur");
      } else {
        $(`.${classname} .other_box`).addClass("blur");
      }
      $(`.${classname} .drag_loadbox`).show();
    } else {
      $(`.${classname} .other_box`).removeClass("blur");
      $(`.${classname} .can_drag_box`).removeClass("blur");
      $(`.${classname} .drag_loadbox`).hide();
    }
  }

  throttle(func, delay) {
    let lastCall = 0;
    return function (...args) {
      const now = new Date().getTime();
      if (now - lastCall >= delay) {
        func(...args);
        lastCall = now;
      }
    };
  }

  getCanSwapFaceBool() {
    return new Promise(async (resolve, reject) => {
      if (getCookie("access_token")) {
        // 可以换脸时
        if (this.canMultiFaceData?.code === 200) {
          // 非主站VIP用户上次使用的credit并且没有credit了
          if (
            this.canMultiFaceData.data?.last_use_credit === 1 &&
            this.canMultiFaceData.data?.credit === 0
          ) {
            // 展示去水印充值弹窗
            let bool = await showRemoveWatermarkMV();
            // 用户点击了去充值
            if (bool) {
              resolve(false);
            }
          }
          resolve(true);
        } else {
          if (this.canMultiFaceData.code === 3008) {
            showNotEnoughCreditsMV(getCreditsFromVideoOrPic(multiAiFaceV, "video"));
            resolve(false);
            return;
          }
          showMaximumMV();
          // 无法换脸 展示充值弹窗
          resolve(false);
        }
      } else {
        if (this.canMultiFaceData.code !== 200) {
          // 超出免费次数
          showMaximumMV();
          resolve(false);
        } else {
          resolve(true);
        }
      }
    });
  }

  setLoadingMaskTip(bool, data = {}) {
    const { maskSpan, show_wait, num, second } = data;
    let dom = $("#multiple_Face_swapper_container_v #createTaskMaskPhoto");
    let domBack = $(
      "#multiple_Face_swapper_container_v #multiple_Face_swapper_container .v_mask_background"
    );

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
          setTextContentObj(num > 1 ? "estimated_wait_times" : "estimated_wait_time", {
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

  setMaskUnlockPriority() {
    $(
      "#multiple_Face_swapper_container_v #createTaskMaskPhoto .v_mask_unlock_priority"
    ).on("click", (e) => {
      setSessionCookie(`st`, `mulcreditpriority`);
      gtag("event","click_mulfaceswap_videopriority")
      // window.open(toolPicingUrl);
    });
  }

  // 设置检测出来的人脸
  setMultipleListImgs() {
    const that = this;
    const people_recognized_list = $(
      "#multiple_Face_swapper_container_v #people_recognized_list"
    );
    if (people_recognized_list) {
      let domStr = "";
      people_recognized_list.html();
      that.itemLoading = [];
      this.formdata.avatar_main_key.forEach((person) => {
        that.itemLoading.push(false);
        domStr += `
          <div class="people_recognized_item">
            <img src="${person.obey_part_url}" />
            <div class="add_icon_box">
              <img class="add_icon_img" src="" style="display: none" />
              <img class="add_icon" src="/dist/img/face-swap/icon_add_i.svg" />
              <div class="add_icon_loading" style="display: none"></div>
              <div class="add_icon_change"></div>
            </div>
            <div class="add_icon_close" style="display: none"></div>
          </div>
        `;
      });
      people_recognized_list.html(domStr);
      // 单独给每一项添加点击和移除事件
      $("#multiple_Face_swapper_container_v .people_recognized_item").each(
        function (el) {
          const index = $(this).index();
          const item = $(this);
          item.find(".add_icon_box").on("click", function () {
            that.multipleIndex = index;
            gtag("event","up_mulfaceswap_targetvideo");
            $("#multiple_Face_swapper_container_v #multi_uploader").click();
          });
          item.find(".add_icon_close").on("click", function () {
            item.find(".add_icon").show();
            item.find(".add_icon_img").hide();
            item.find(".add_icon_close").hide();
            if (that.formdata.avatar_main_key[index]) {
              that.formdata.avatar_main_key[index].main_part_key = undefined;
            }
            that.checkMultiChangeFaceStatus();
            const num = that.formdata.avatar_main_key.filter(el => el.main_part_key)?.length;
            if (num > 0) {
              showBtnCreditsMultiVideo(true);
            } else {
              showBtnCreditsMultiVideo(false);
            }
          });
          item.on("dragover", function (e) {
            e.preventDefault();
            if (
              !item
                .find(".add_icon_loading")
                .attr("style")
                .includes("display: none")
            ) {
              return;
            }
            item.addClass("draggable");
          });
          item.on("dragenter", function (e) {
            e.preventDefault();
            if (
              !item
                .find(".add_icon_loading")
                .attr("style")
                .includes("display: none")
            ) {
              return;
            }
            item.addClass("draggable");
          });
          item.on("dragleave", function (e) {
            e.preventDefault();
            if (
              !item
                .find(".add_icon_loading")
                .attr("style")
                .includes("display: none")
            ) {
              return;
            }
            item.removeClass("draggable");
          });
          item.on("drop", function (e) {
            e.preventDefault();
            item.removeClass("draggable");
            if (
              !item
                .find(".add_icon_loading")
                .attr("style")
                .includes("display: none")
            ) {
              return;
            }
            var len = e.originalEvent.dataTransfer.files.length;
            if (len !== 1) {
              that.multimodelV.errorMessage({
                conText: `<h1>${textContentObj.processImageTitle}</h1>
              <p>${multitextContentObj.faceSwapPop01.onlyone}</p>`,
                btnText: multitextContentObj.OK,
              });
              that.multimodelV.options.visible = true;
              return;
            }
            gtag("event","up_mulfaceswap_targetvideo");
            that.multipleIndex = index;
            that.itemUploading(e.originalEvent.dataTransfer.files[0]);
          });
        }
      );
    }
  }

  setCurrentImgLoading(flag, index) {
    const loadingList = this.itemLoading;
    if (flag) {
      loadingList[index] = true;
      $("#multiple_Face_swapper_container_v .people_recognized_item")
        .eq(index)
        .find(".add_icon_loading")
        .show();
      $("#multiple_Face_swapper_container_v .people_recognized_item")
        .eq(index)
        .find(".add_icon_close")
        .hide();
      $("#multiple_Face_swapper_container_v .people_recognized_item")
        .eq(index)
        .find(".add_icon")
        .hide();
      $("#multiple_Face_swapper_container_v .people_recognized_item")
        .eq(index)
        .find(".add_icon_img")
        .hide();
      $("#multiple_Face_swapper_container_v .change_multi_face_btn").addClass(
        "disabled"
      );
      $("#multiple_Face_swapper_container_v .people_recognized_item")
        .eq(index)
        .find(".add_icon_box")
        .addClass("disabled");
    } else {
      loadingList[index] = false;
      if (loadingList.some((e) => e === true) || this.form.firstPicLoading) {
        $("#multiple_Face_swapper_container_v .change_multi_face_btn").addClass(
          "disabled"
        );
      } else {
        $(
          "#multiple_Face_swapper_container_v .change_multi_face_btn"
        ).removeClass("disabled");
      }
      if (!this.formdata.avatar_main_key[index].main_part_key) {
        $("#multiple_Face_swapper_container_v .people_recognized_item").eq(index).find(".add_icon").show();
      }
      $("#multiple_Face_swapper_container_v .people_recognized_item")
        .eq(index)
        .find(".add_icon_loading")
        .hide();
      $("#multiple_Face_swapper_container_v .people_recognized_item")
        .eq(index)
        .find(".add_icon_box")
        .removeClass("disabled");
    }
  }

  async itemUploading(file) {
    const loadingList = this.itemLoading;
    if (typeof file !== "string" && !this.checkFileType(file)) {
      return;
    }
    const item = $(
      "#multiple_Face_swapper_container_v .people_recognized_item .add_icon"
    ).eq(this.multipleIndex);
    const itemImg = $(
      "#multiple_Face_swapper_container_v .people_recognized_item .add_icon_img"
    ).eq(this.multipleIndex);
    const itemClose = $(
      "#multiple_Face_swapper_container_v .people_recognized_item .add_icon_close"
    ).eq(this.multipleIndex);
    const index = this.multipleIndex;
    console.log(this.multipleIndex);
    if (!item) return;
    this.setCurrentImgLoading(true, index);
    var result = await this.checkFacePicMulti(file);
    // if (result !== 1) {
    //   $("#multiple_Face_swapper_container_v #multi_uploader")[0].value = "";
    //   this.showModalAboutFaceNumber(result, "faces_recognized");
    //   this.setCurrentImgLoading(false, index);
    //   loadingList[index] = false;
    //   // 当前数组至少要有一张图片
    //   this.checkMultiChangeFaceStatus();
    //   // 之前有图片就用之前的
    //   if (this.formdata.avatar_main_key[index].main_part_key) {
    //     item.hide();
    //     itemClose.show();
    //     itemImg.show();
    //   } else {
    //     item.show();
    //     itemClose.hide();
    //     itemImg.hide();
    //   }
    //   return;
    // }
    // 上传当前target图片
    let uploadData = {};
    var finalFile, imageType, showUrl;
    try {
      uploadData = await this.uploadMultiImagePromise(file);
    } catch (e) {
      let text = multitextContentObj.faceSwapPop01.upload_file_failed;
      if (window.userRuleConfig.credit) {
        text = multitextContentObj.faceSwapPop01.upload_file_failed_credits;
      }
      this.multimodelV.errorMessage({
        conText: `
        <h1>${multitextContentObj.faceSwapPop01.processImageTitle}</h1>
        <p>${text}</p>
        `,
        btnText: multitextContentObj.OK,
      });
      this.multimodelV.options.visible = true;
      this.setCurrentImgLoading(false, index);
      this.checkMultiChangeFaceStatus();
      return;
    }
    const { blog, res, imgType } = uploadData;
    finalFile = blog;
    imageType = imgType;
    showUrl = URL.createObjectURL(finalFile);
    item.hide();
    itemImg.attr("src", showUrl);
    itemImg.show();
    console.log(res);
    this.formdata.avatar_main_key[index] = {
      ...this.formdata.avatar_main_key[index],
      main_part_key: res.data.key,
    };
    $("#multiple_Face_swapper_container_v .change_multi_face_btn").removeClass(
      "disabled"
    );
    this.setCurrentImgLoading(false, index);
    $("#multiple_Face_swapper_container_v .people_recognized_item")
      .eq(index)
      .find(".add_icon_close")
      .show();
    $("#multiple_Face_swapper_container_v #multi_uploader")[0].value = "";
    showBtnCreditsMultiVideo(true);
  }
  eventLoginsuccess() {
    const that = this;
    let login_Modal = document.querySelector("my-component");
    login_Modal.addEventListener("loginsuccess", async function (event) {
      await getCountryConfig()
      const num = that.formdata.avatar_main_key.filter(el => el.main_part_key)?.length;
      console.error(num, that.formdata?.avatar_main_key)
      if (that.formdata?.avatar_main_key && num>0) {
        showBtnCreditsMultiVideo(true);
      }
      // 设置高清按钮
      multiVcreditSystem.setHighQualityHtml(
        $(".high_quality_append_dom_multiv"),
        window.userRuleConfig?.is_subscriber !== 1,
        () => {
          gtag("event", "alert_faceswap_hd_v");
          showHdCredits({
            clickfn: () => {
              gtag("event", "click_faceswap_hd_v");
            },
            type: "multiv",
          });
        },
        "multiv"
      );
      // 设置高清按钮
      multicreditSystem.setHighQualityHtml(
        $(".high_quality_append_dom"),
        window.userRuleConfig?.is_subscriber !== 1,
        () => {
          gtag("event", "alert_faceswap_hd_m");
          showHdCredits({
            clickfn: () => {
              gtag("event", "click_faceswap_hd_m");
            },
            type: "multi",
          });
        },
        "multi"
      );
      that.showCreditBannerV(true)
      // showCreditBox();
    });
  }

  showCreditBannerV(bool) {
    this.showCreditBannerBool = bool;
    multiVcreditSystem.showCreditBanner({
      bool
    });
    multicreditSystem.showCreditBanner({bool});
  }
}

class MutiVideoModel {
  constructor() {
    var that = this;
    var options = {
      visible: false,
      type: "error",
      downloading: false,
      downloadUrl: null,
      downloadType: 0,
    };
    this.options = new Proxy(options, {
      set(target, prop, value) {
        target[prop] = value;
        switch (prop) {
          case "visible":
            that.controlVisible(value);
            break;
          default:
            break;
        }
        return true;
      },
      get(target, prop) {
        return target[prop];
      },
    });
  }
  controlVisible(bool) {
    if (bool) {
      $("#multiple_Face_swapper_container_v #multi_change_face_modal").show();
    } else {
      $("#multiple_Face_swapper_container_v #multi_change_face_modal").hide();
    }
  }
  // 报错提示
  errorMessage({ conText, btnText, btnClick }) {
    // $("#multiple_Face_swapper_container_v .change_face_modal_content").attr("style", "width: 550px;");
    $("#multiple_Face_swapper_container_v .change_face_modal_content").html(`
      <div class="error_con">
          <div class="error_p">${conText}</div>
          </div>
      `);
    $("#multiple_Face_swapper_container_v .change_face_modal_btns").html(`
      <div class="change_face_modal_btn">${btnText}</div>
    `);
    $("#multiple_Face_swapper_container_v .change_face_modal_btn").on(
      "click",
      () => {
        if (btnClick) {
          btnClick();
        }
        $("#multiple_Face_swapper_container_v #multi_change_face_modal").hide();
      }
    );
  }
  // 下载提示
  downloadMessage() {
    $("#multiple_Face_swapper_container_v #multi_change_face_modal").attr(
      "style",
      "width: 550px;height: 125px"
    );
    $("#multiple_Face_swapper_container_v .change_face_modal_btns").hide();
    $("#multiple_Face_swapper_container_v .close_btn").hide();
    $("#multiple_Face_swapper_container_v .change_face_modal_content").html(`
      <div class="download_multi_con">
        <p class="loading_download_title">${multitextContentObj.faceSwapPop01.downloading}</p>
        <div class="loading_prograss">
          <div class="loading_prograss_con"></div>
        </div>
      </div>
    `);
    let count = 0;
    var timer = setInterval(() => {
      count += 1;
      if (count >= 90) {
        count = 90;
        // clearInterval(timer);
      }
      if (!this.options.downloading) {
        $("#multiple_Face_swapper_container .close_btn").show();
        clearInterval(timer);
        if (this.options.downloadType === 1) {
          $("#multiple_Face_swapper_container_v .loading_prograss_con").attr(
            "style",
            `width: 100%`
          );
          setTimeout(() => {
            this.options.visible = false;
            this.downloadSuccess();
            this.options.visible = true;
          }, 500);
        } else if (this.options.downloadType === 2) {
          setTimeout(() => {
            this.options.visible = false;
            this.downloadError();
            this.options.visible = true;
          }, 500);
        }
        return;
      }
      $("#multiple_Face_swapper_container_v .loading_prograss_con").attr(
        "style",
        `width: ${count}%`
      );
    }, 50);
  }
  // 下载成功
  downloadSuccess() {
    var that = this;
    $("#multiple_Face_swapper_container_v .change_face_modal_btns").show();
    $("#multiple_Face_swapper_container_v .close_btn").show();
    $("#multiple_Face_swapper_container_v #multi_change_face_modal").attr(
      "style",
      "padding: 20px 25px;"
    );
    $("#multiple_Face_swapper_container_v .change_face_modal_content").html(`
      <div class="download_con">
        <h1>${multitextContentObj.faceSwapPop01.downloadH1}</h1>
        <p class="download_con_p">${multitextContentObj.faceSwapPop01.downloadTips}</p>
      </div>
    `);
    $("#multiple_Face_swapper_container_v .change_face_modal_btns").html(`
      <div class="change_face_modal_btn">${multitextContentObj.faceSwapPop01.continue}</div>
    `);
    $("#multiple_Face_swapper_container_v .change_face_modal_btn").on(
      "click",
      () => {
        that.options.visible = false;
        $("#multiple_Face_swapper_container_v #multi_change_face_modal").hide();
      }
    );
    $("#multiple_Face_swapper_container_v .click_multi_me").on(
      "click",
      async function () {
        const resultBoll = await checkVideoExpired(that.options.downloadUrl);
        if (!resultBoll) {
          that.errorMessage({
            conText: `
            <h1>${multitextContentObj.faceSwapPop01.processImageTitle}</h1>
            <p>${multitextContentObj.expired_file}</p>
          `,
            btnText: multitextContentObj.OK,
          });
          that.options.downloadType = 0;
          that.options.downloading = false;
          that.options.visible = true;
          return;
        }
        $(this).attr("href", that.options.downloadUrl);
        $(this).click();
      }
    );
  }
  // 下载失败
  downloadError() {
    $("#multiple_Face_swapper_container_v #multi_change_face_modal").attr(
      "style",
      ""
    );
    $("#multiple_Face_swapper_container_v .change_face_modal_btns").show();
    this.errorMessage({
      conText: `
        <h1>${multitextContentObj.faceSwapPop01.downloadError}</h1>
        <p>${multitextContentObj.faceSwapPop01.errorUpload}</p>
      `,
      btnText: multitextContentObj.OK,
    });
  }
}

// 设置按钮金币
function showBtnCreditsMultiVideo(bool) {
  const num = multiAiFaceV.formdata.avatar_main_key.filter(el => el.main_part_key).length;
  multiAiFaceV.uploadFacesNumber = num;
  multiVcreditSystem.showBtnCredits({
    bool,
    credits: getCreditsFromVideoOrPic(multiAiFaceV, "video"),
    appendDom: $("#multiple_Face_swapper_container_v .change_multi_face_btn"),
    type: "video",
  });
}

var createMultiDialogV = (src, multiAiFaceV) => {
  $("#large_multi_face_v_modal .large_multi_img").attr("src", src);
  var element = document.querySelector(".large_multi_img");
  // var width = parseFloat(style.width) || 600;
  $("#large_multi_face_v_modal .multi_img_btns").attr(
    "style",
    `display: flex;`
  );
  // $("#multiple_Face_swapper_container_v #large_multi_face_v_modal").find(".removeWatemark_btn").hide();
  $("#large_multi_face_v_modal").attr("style", "display: flex");
};


function showNotEnoughCreditsMV(credits = 1) {
  gtag("event", "alert_mulfaceswap_videonocredit");
  multiVcreditSystem.showCreditPopup({
    title: getfsCreditsText("Model_not_credits_title"),
    content: getfsCreditsText("Model_not_credit_span", { val: credits }, true),
    btn: getfsCreditsText("Model_not_credits_btn"),
    btnFn: () => {
      gtag("event", "click_mulfaceswap_videonocredit");
      setCookie("st", "mulfsvideonocredit");
      // window.open(toolPicingUrl);
    },
    modalCoins: "notenough",
  });
}

// max times
function showMaximumMV() {
  multiVcreditSystem.showCreditPopup({
    title: textContentObj.exceedTitle,
    content: getfsCreditsText(
      "Model_Maximum_span",
      {
        val: window?.userRuleConfig?.m_times,
      },
      true
    ),
    btn: getfsCreditsText("Model_Unlock_btn"),
    btnFn: () => {
      // window.open(toolPicingUrl);
    },
    modalCoins: "timesmax",
  });
}

// watermark
function showRemoveWatermarkMV() {
  return new Promise((resolve, reject) => {
    multiVcreditSystem.showCreditPopup({
      title: getfsCreditsText("Model_Remove_Watermark_title"),
      content: getfsCreditsText("Model_Remove_Watermark_span"),
      btn: getfsCreditsText("Model_Remove_Watermark_btn"),
      btnWater: getfsCreditsText("Model_Remove_Watermark_btn1"),
      btnWaterFn: () => {
        gtag("event", "click_faceswap_stock_m");
        resolve(true);
      },
      closeClick: () => {
        resolve(false);
      },
      btnFn: () => {
        // window.open(toolPicingUrl);
        setCookie("st", "removewatermark_m");
        gtag("event", "click_faceswap_no_m");
        resolve(false);
      },
      modalCoins: "watermarker",
    });
  });
}

var muticreditsPhotoModelV = null;

// var photoAiFaceChanging = null;
let btnLoading2 = false;
var multimodelV = new MutiVideoModel();
var multiAiFaceV = new MultiVideoAiFace({ multimodelV });
// photoAiFaceChanging = multiAiFaceV;
var muticreditsPhotoModelVModel = new MutiCreditPhotoModel(
  $("#multiple_Face_swapper_container_v .multi_credits_messageModel"),
  multiAiFaceV,
  2
);
window.muticreditsPhotoModelV = multiAiFaceV;
$(document).ready(function () {
  // 第一张图片点击上传切换
  gtag("event","show_miofs_multiphoto");
  multiAiFaceV.eventLoginsuccess();
  multiAiFaceV.getImgList();
  const appsigninbtn = $("#multiple_Face_swapper_container_v .appsigninbtn");
  const signupfootbtn = $("#multiple_Face_swapper_container_v .signupfootbtn");
  const appsignupbtn = $("#multiple_Face_swapper_container_v .signupnavbtn");
  const appsignupbtn2 = $("#multiple_Face_swapper_container_v .appsignupbtn");
  appsigninbtn.attr("product-position", "isTool-no-reloading");
  appsignupbtn.attr("product-position", "isTool-no-reloading");
  // appsigninbtn.on("click", function () {
  //   gtag("event","login_miofs_header");
  // });
  // appsignupbtn.on("click", function () {
  //   gtag("event","signup_miofs_header");
  // });
  // signupfootbtn.attr("onclick", `gtag("event","signup_miofs_footer");`);
  appsignupbtn2.attr("product-position", "isTool-no-reloading");
  $("#multiple_Face_swapper_container_v .multi_uploader_btn").on(
    "click",
    function (e) {
      e.stopPropagation();
      $("#multiple_Face_swapper_container_v .multi_uploader_multi").click();
    }
  );

  $("#multiple_Face_swapper_container_v .upload_step").on(
    "dragover",
    function (e) {
      e.preventDefault(); // 阻止默认行为
    }
  );
  $("#multiple_Face_swapper_container_v .can_drag_box").on(
    "dragenter",
    function (e) {
      e.preventDefault(); // 阻止默认行为
      if (multiAiFaceV.form.firstPicLoading) return;
      // if (e.target.className.includes("multi_upload") || e.target.className.includes("mask1")) return;
      multiAiFaceV.setDragLoading("multi_upload", true);
      multiAiFaceV.setDragLoading("change_upload", false);
    }
  );

  $(
    "#multiple_Face_swapper_container_v .multi_upload .uploader_loading_mask"
  ).on("dragleave", function (e) {
    // if (e.relatedTarget.className.includes("multi_upload") || e.relatedTarget.className.includes("mask1")) return;
    multiAiFaceV.setDragLoading("multi_upload", false);
  });

  $(
    "#multiple_Face_swapper_container_v .multi_upload .uploader_loading_mask"
  ).on("dragenter", function (e) {
    e.preventDefault(); // 阻止默认行为
    if (multiAiFaceV.form.firstPicLoading) return;
    // if (e.target.className.includes("change_upload") || e.target.className.includes("mask2")) return;
    multiAiFaceV.setDragLoading("multi_upload", true);
  });

  $(
    "#multiple_Face_swapper_container_v .multi_upload .uploader_loading_mask"
  ).on("dragover", function (e) {
    e.preventDefault(); // 阻止默认行为
    if (multiAiFaceV.form.firstPicLoading) return;
    // if (e.target.className.includes("change_upload") || e.target.className.includes("mask2")) return;
    multiAiFaceV.setDragLoading("multi_upload", true);
  });

  $("#large_multi_face_v_modal").on("wheel", function (e) {
    e.preventDefault(); // 阻止默认行为
  });

  // 第一张点击上传
  $("#multiple_Face_swapper_container_v .multi_uploader_multi").on(
    "change",
    function (e) {
      gtag("event","up_mulfaceswap_video");
      let files = e.target.files;
      let file = files[0];
      if (!files || !file) {
        return;
      }
      if (files.length !== 1) {
        multiAiFaceV.multimodelV.errorMessage({
          conText: `<h1>${textContentObj.processImageTitle}</h1>
          <p>${multitextContentObj.faceSwapPop01.onlyone}</p>`,
          btnText: multitextContentObj.OK,
        });
        multiAiFaceV.multimodelV.options.visible = true;
        return;
      }
      e.target.value = null;
      multiAiFaceV.addMultiVideo({
        file,
      });
    }
  );

  // 第一张拖拽上传
  $(
    "#multiple_Face_swapper_container_v .multi_upload .uploader_loading_mask, .multi_uploader_btn_con_mask"
  ).on("drop", function (e) {
    e.preventDefault();
    setDragStatus(false);
    multiAiFaceV.setDragLoading("multi_upload", false);
    if (multiAiFaceV.form.firstPicLoading) {
      return;
    }
    var len = e.originalEvent.dataTransfer.files.length;
    if (len !== 1) {
      multiAiFaceV.multimodelV.errorMessage({
        conText: `<h1>${textContentObj.processImageTitle}</h1>
            <p>${multitextContentObj.faceSwapPop01.onlyone}</p>`,
        btnText: multitextContentObj.OK,
      });
      multiAiFaceV.multimodelV.options.visible = true;
      return;
    }
    gtag("event","up_mulfaceswap_video");
    var file = e.originalEvent.dataTransfer.files[0];
    $("#multiple_Face_swapper_container_v .multi_upload").addClass(
      "loading_mask"
    );
    multiAiFaceV.addMultiVideo({
      file,
    });
  });

  // 第一张更改上传
  $("#multiple_Face_swapper_container_v .multi_Input").on(
    "click",
    function (e) {
      e.stopPropagation();
      if (btnLoading2) {
        return;
      }
      btnLoading2 = true;
      setTimeout(() => { 
        btnLoading2 = false;
      }, 2000);
      $("#multiple_Face_swapper_container_v .multi_uploader_multi").click();
    }
  );

  $(
    "#multiple_Face_swapper_container_v .multi_Input .multi_uploader_btn_con_mask"
  )
    .on("dragover", function (e) {
      e.preventDefault();
      setDragStatus(true);
    })
    .on("dragenter", function (e) {
      e.preventDefault();
      setDragStatus(true);
    })
    .on("dragleave", function (e) {
      e.preventDefault();
      setDragStatus(false);
    });

  $("#multiple_Face_swapper_container_v .multi_Input")
    .on("dragover", function (e) {
      e.preventDefault();
      setDragStatus(true);
    })
    .on("dragenter", function (e) {
      e.preventDefault();
      setDragStatus(true);
    });

  function setDragStatus(flag) {
    if (!flag) {
      $("#multiple_Face_swapper_container_v .multi_Input").removeClass(
        "draggable"
      );
      $("#multiple_Face_swapper_container_v .multi_Input").find("svg").show();
      $("#multiple_Face_swapper_container_v .multi_Input")
        .find(".change_image_text")
        .text(getMultiText("change_btn"));
    } else {
      $("#multiple_Face_swapper_container_v .multi_Input").addClass(
        "draggable"
      );
      $("#multiple_Face_swapper_container_v .multi_Input").find("svg").hide();
      $("#multiple_Face_swapper_container_v .multi_Input")
        .find(".change_image_text")
        .text(getMultiText("drag_btn"));
    }
  }

  // 点击去除水印按钮
  $(
    "#multiple_Face_swapper_container_v #multiple_Face_swapper_container .removeWatemark_btn"
  ).on("click", function (e) {
    // window.open(toolPicingUrl);
  });

  // 点击去除水印按钮
  $("#large_multi_face_v_modal .removeWatemark_btn").on("click", function (e) {
    // window.open(toolPicingUrl);
  });

  // 对比按下显示原图
  $("#multiple_Face_swapper_container_v .compare_multi_btn").on(
    "pointerdown",
    function (e) {
      e.preventDefault();
      gtag("event","contrast_miofs_res_m");
      if (multimodelV.options.downloading || multiAiFaceV.changeFaceLoading) {
        return;
      }
      if (e.button === 2) {
        return;
      }
      // this.setPointerCapture(e.pointerId);
      if (multiAiFaceV.form?.originImage?.showUrl) {
        $("#multiple_Face_swapper_container_v #mult_main_face_change_img").attr(
          "src",
          multiAiFaceV.form?.originImage.showUrl
          // "https://pic3.zhimg.com/v2-36b1e06bfc2b8abb7748337b859bcd8c_b.jpg"
        );
        $("#large_multi_face_v_modal .large_multi_img").attr(
          "src",
          multiAiFaceV.form?.originImage.showUrl
        );
      }

      document.addEventListener("pointerup", function (e) {
        if (
          $(
            "#multiple_Face_swapper_container_v #mult_main_face_change_img"
          ).attr("data-key")
        )
          return;
        stopCompare(e);
      });
    }
  );

  // $("#multiple_Face_swapper_container_v .compare_multi_btn").on("touchstart", (event) => {
  //   // 处理触摸移动事件
  //   console.log("touchstart", event)
  // });

  $("#multiple_Face_swapper_container_v .share_multi_btn").on(
    "click",
    (event) => {
      gtag("event","share_miofs_res_m");
      // 处理触摸移动事件
      let shareDialogEl = document.querySelector("#shareDialogEl");
      shareDialogEl.changeTips({
        title: multitextContentObj.faceSwapPop01.share__Tile,
        content: getMultiText("share__box__text"),
      });
      function backParams(data) {
        return {
          id: multiAiFaceV.taskid,
          key: data?.merge_key,
        };
      }
      shareDialogEl.showShare({
        url: multiAiFaceV.mergeImgUrl,
        action: "multiplefaceswapmioshare",
        imageKey: multiAiFaceV.mergeKey,
        text: getMultiText("share__text"),
        title: multitextContentObj.faceSwapPop01.share__Tile,
        id: multiAiFaceV.taskid,
        task_id: multiAiFaceV.taskid,
        btoaUrl: btoa(multiAiFaceV.mergeKey + "," + multiAiFaceV.taskid),
        backParams
      });
    }
  );

  $("#multiple_Face_swapper_container_v .compare_multi_btn").on(
    "pointerleave",
    (e) => {
      // 处理触摸移动事件
      stopCompare(e);
    }
  );

  // 对比弹起显示原图
  const stopCompare = function (e) {
    e.preventDefault();
    if (multimodelV.options.downloading || multiAiFaceV.changeFaceLoading) {
      return;
    }
    if (e.button === 2) {
      return;
    }
    // this.releasePointerCapture(e.pointerId);
    $("#multiple_Face_swapper_container_v #mult_main_face_change_img").attr(
      "src",
      multiAiFaceV.mergeImgUrl
    );
    $("#large_multi_face_v_modal .large_multi_img").attr(
      "src",
      multiAiFaceV.mergeImgUrl
    );
    document.removeEventListener("pointerup", function (e) {
      stopCompare(e);
    });
  };

  // 禁用鼠标右键菜单
  $("#multiple_Face_swapper_container_v #mult_main_face_change_img").on(
    "contextmenu",
    (e) => {
      e.originalEvent.preventDefault();
    }
  );
  $("#large_multi_face_v_modal .large_multi_img width").on(
    "contextmenu",
    (e) => {
      e.originalEvent.preventDefault();
    }
  );
  // 查看大图
  $("#multiple_Face_swapper_container_v .large_multi_image").on(
    "click",
    function (e) {
      e.preventDefault();
      gtag("event","zoomin_mulfaceswap_videores");
      if (multimodelV.options.downloading || multiAiFaceV.changeFaceLoading) {
        return;
      }
      if (e.button === 2) {
        return;
      }
      createMultiDialogV(multiAiFaceV.mergeImgUrl, multiAiFaceV);
    }
  );
  // 下载
  $(".download_multi_btn_v").on("click", async (e) => {
    e.preventDefault();
    gtag("event","download_mulfaceswap_videores");
    if (multimodelV.options.downloading || multiAiFaceV.changeFaceLoading) {
      return;
    }
    if (e.button === 2) {
      return;
    }
    if (!getCookie("access_token")) {
      // $("#multiple_Face_swapper_container_v .vocalRemover__modal").show();
      showLoginWindow({
        isReloading: false,
      });
      return;
    }
    multimodelV.options.downloading = true;
    multimodelV.downloadMessage();
    multimodelV.options.visible = true;
    fetchPost("ai/source/get-access-url", {
      key: multiAiFaceV.mergeKey,
      action: "download",
      file_name:
        "Vidqu_faceswap" +
        multiAiFaceV.mergeKey.substring(multiAiFaceV.mergeKey.lastIndexOf(".")),
    },TOOL_API)
      .then(async (res) => {
        if (res.code === 401) {
          multimodelV.errorMessage({
            conText: multitextContentObj.loginFirst,
            btnText: multitextContentObj.OK,
          });
          multimodelV.options.visible = true;
          multimodelV.options.downloadType = 2;
          multimodelV.options.downloading = false;
          return;
        }

        const resultBoll = await checkVideoExpired(res.data.url);
        if (!resultBoll) {
          $("#multiple_Face_swapper_container_v #multi_change_face_modal").attr(
            "style",
            ""
          );
          $(
            "#multiple_Face_swapper_container_v .change_face_modal_btns"
          ).show();
          multimodelV.errorMessage({
            conText: `
                <h1>${multitextContentObj.faceSwapPop01.processImageTitle}</h1>
                <p>${multitextContentObj.expired_file}</p>
              `,
            btnText: multitextContentObj.OK,
          });
          multimodelV.options.downloadType = 0;
          multimodelV.options.downloading = false;
          multimodelV.options.visible = true;
          return;
        } else {
          multimodelV.options.downloadType = 1;
          multimodelV.options.downloading = false;
          let link = document.createElement("a");
          multimodelV.options.downloadUrl = res.data.url;
          link.href = res.data.url;
          link.download = "Vidqu_faceswap.png";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(link.href);
          gtag("event","dwsucc_miofs_res_mv");
        }
      })
      .catch((error) => {
        multimodelV.options.downloadType = 2;
        multimodelV.options.downloading = false;
        console.error("fail", error);
      });
  });

  $("#multiple_Face_swapper_container_v #change_face_login").on(
    "click",
    function () {
      window.location.href =
        thGotoApplibraryUrl + "signup?page_name=face-swap&name=ai";
    }
  );

  $("#multiple_Face_swapper_container_v .modal__main_close").on(
    "click",
    function () {
      $("#multiple_Face_swapper_container_v .vocalRemover__modal").hide();
    }
  );

  // 关闭弹窗
  $("#multiple_Face_swapper_container_v .close_btn").on("click", function () {
    multimodelV.options.visible = false;
    $("#multiple_Face_swapper_container_v #multi_change_face_modal").hide();
    $("#multiple_Face_swapper_container_v #multi_change_face_modal").hide();
    // $("#multiple_Face_swapper_container_v #multi_change_face_modal").find(".removeWatemark_btn").show();
  });

  $("#large_multi_face_v_modal .multi_close_btn").on("click", function () {
    $("#large_multi_face_v_modal").hide();
    $("#large_multi_face_v_modal #large_multi_video")[0].pause();
  });

  // 开始换脸
  $("#multiple_Face_swapper_container_v .change_multi_face_btn").on(
    "click",
    function (e) {
      gtag("event","click_mulfaceswap_videoswapbtn");
      if (multiAiFaceV.uploadFacesNumber > 3) {
        gtag("event","succ_mulfaceswap_video10")
      } else {
        gtag("event","succ_mulfaceswap_video3")
      }
      multiAiFaceV.changeMultiFace($(this));
    }
  );

  $("#multiple_Face_swapper_container_v .face_swap_now").on(
    "click",
    function () {
      scrollToPositions(".ai-change-face");
    }
  );

  $("#multiple_Face_swapper_container_v .see_more_multi").on(
    "click",
    function () {
      // const exPics = $("#multiple_Face_swapper_container_v #ex_pics");
      const multi_pics = $("#multiple_Face_swapper_container_v .multi_pics");
      multi_pics.removeClass("hide_other_pics");
      // exPics.addClass("expand");
      $("#multiple_Face_swapper_container_v .see_more_multi").hide();
      $("#multiple_Face_swapper_container_v .fold_multi").show();
    }
  );

  $("#multiple_Face_swapper_container_v .fold_multi").on("click", function () {
    // const exPics = $("#multiple_Face_swapper_container_v #ex_pics");
    // exPics.removeClass("expand");
    const multi_pics = $("#multiple_Face_swapper_container_v .multi_pics");
    multi_pics.addClass("hide_other_pics");
    $("#multiple_Face_swapper_container_v .see_more_multi").show();
    $("#multiple_Face_swapper_container_v .fold_multi").hide();
  });

  $("#multiple_Face_swapper_container_v #multi_uploader").on(
    "change",
    async function (e) {
      if (!e.target.files || !e.target.files[0]) {
        return;
      }
      multiAiFaceV.itemUploading(e.target.files[0]);
    }
  );

  $("#multiple_face_swapper_try .video-content-box .content-box").on(
    "click",
    function (event) {
      let _imgEl = event.target
      if (_imgEl.tagName.toLowerCase() !== 'img') return false;
      gtag("event",`click_mulfaceswap_vidtpl`);
      const getUrl = (url) => multiAiFaceV.domain + url;
      if (multiAiFaceV.imgList?.length === 0) return;
      if (multiAiFaceV.form.firstPicLoading || multiAiFaceV.changeFaceLoading)
        return;
      const randomItem = multiAiFaceV.imgList[_imgEl.getAttribute('data-index')-1];
      multiAiFaceV.showToolBtn(false);
      multiAiFaceV.addMultiVideo({
        addData: {
          demoKey: randomItem.video_key,
          demoSrc: getUrl(randomItem.video_key),
          demoDuration: randomItem.duration,
          demoImgSrc: getUrl(randomItem.cover_key),
        },
        file: getUrl(randomItem.video_key),
        ourPicsIndex: $(this).index() + 1,
      });
    }
  );


  if(isMacorIos()){
    $("#multiple_Face_swapper_container_v .multi_upload_before h2")[0].innerText = multitextContentObj.video_tip_ios
  }
});

$(function () {
  // if (getCookie("access_token")) {
  //   showCreditBox();
  // }
  $("#multiple_Face_swapper_container_v .head-portrait .appsigninbtn").click(
    function (e) {
      e.stopPropagation();
      e.preventDefault();
    }
  );

  $("#multiple_Face_swapper_container_v .swap_credit_btn_multiphoto").on(
    "click",
    function () {
      if (getCookie("access_token")) {
        setSessionCookie(`st`, `mulloggedcreditbanner`);
      } else {
        setSessionCookie("st", "mulnotcreditbanner");
      }
    }
  );

  
  
  $("#multiple_Face_swapper_container_v .my_files_tips .myfiles_check_Now_btn").on("click", ()=>{
    gtag("event", "click_vidqmyfiles_videotipsfile_mv");
    if(!getCookie("access_token")){
      showLoginWindow({
        isReloading: false,
        fn: (data = null) => {
          window.open("/my-files.html");
        }
      });
    }else{
      window.open("/my-files.html");
    }
  })
  
});

function checkVideoExpired(url) {
  return new Promise((resolve, reject) => {
    const video = $("#multi_video_dom");
    video.attr("src", url);
    video.off("loadedmetadata").on("loadedmetadata", function () {
      resolve(true);
    });
    video.off("error").on("error", function () {
      resolve(false);
    });
  });
}

function photo_isSameDay() {
  let timestamp1 = Date.now();
  let timestamp2 = getCookie("faceSwapTime_swap");
  if (!timestamp2) {
    return false;
  }
  const date1 = new Date(timestamp1);
  const date2 = new Date(Number(timestamp2));

  // 获取日期的各个部分
  const year1 = date1.getFullYear();
  const month1 = date1.getMonth();
  const day1 = date1.getDate();

  const year2 = date2.getFullYear();
  const month2 = date2.getMonth();
  const day2 = date2.getDate();

  // 判断是否在同一天
  return year1 === year2 && month1 === month2 && day1 === day2;
}
