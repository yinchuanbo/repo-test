var controllers = [];
var mulPhotoDownloadData = null;
function getFSMCreditsText(name, valData = {}, bool = false) {
  if (bool) {
    if (valData.val > 1) {
      name += "_p"; // 单复数
    }
  }
  let str = lan.faceSwapPop02[name];
  for (let key in valData) {
    const regex = new RegExp(`{{${key}}}`, "g");
    str = str.replace(regex, valData[key]);
  }
  // console.log(str)
  return str;
}

function getfsCreditsText(name, valData = {}, bool = false) {
  if (bool) {
    if (valData.val > 1) {
      name += "_p"; // 单复数
    }
  }
  let str = lan.faceSwapPop[name];
  for (let key in valData) {
    const regex = new RegExp(`{{${key}}}`, "g");
    str = str.replace(regex, valData[key]);
  }
  return str;
}

let multitextContentObj = lan;
function getMultiText(name, valData = {}, bool = false) {
  let str = lan[name];
  for (let key in valData) {
    const regex = new RegExp(`{{${key}}}`, "g");
    str = str.replace(regex, valData[key]);
  }
  // console.log(str)
  return str;
}
let show_ppriority = 0;
let textContentObj = lan.faceSwapPop01;

function setTextContentObj(name, valData = {}) {
  let str = textContentObj[name];
  for (let key in valData) {
    const regex = new RegExp(`{{${key}}}`, "g");
    str = str.replace(regex, valData[key]);
  }
  // console.log(str)
  return str;
}

function getNumberNow () {
  if (!multiAiFace) return 0;
  return multiAiFace.formdata.avatar_main_key.filter(el => el.main_part_key).length;
}


function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

function setmultitextContentObj(name, valData = {}) {
  let str = lan[name];
  for (let key in valData) {
    const regex = new RegExp(`{{${key}}}`, "g");
    str = str.replace(regex, valData[key]);
  }
  // console.log(str)
  return str;
}

var photo_task_id = null;
var canMultiFaceData = {};
var isShowBtnCredit = false;
window.multiphotoAiFaceChanging = {};

class MultiAiFace {
  constructor(options) {
    var that = this;
    this.multimodel = options.multimodel;
    that.setMaskUnlockPriority();
    Object.setPrototypeOf(MultiAiFace.prototype, this.data());
    this.form = new Proxy(that.proxyData, {
      set(target, prop, value) {
        target[prop] = value;
        // 控制originimage元素的显示和隐藏
        if (target["originImage"]) {
          that.handleOriginImageExist();
        } else {
          $("#multiple_Face_swapper_container .multi_upload_before").show();
          $("#multiple_Face_swapper_container .multi_upload_after").hide();
          $("#multiple_Face_swapper_container .change_multi_face_btn").addClass(
            "disabled"
          );
        }
        if (!target["firstPicLoading"]) {
          $("#multiple_Face_swapper_container .multi_Input").removeClass(
            "disabled"
          );
          $("#multiple_Face_swapper_container .random_btn").removeClass(
            "disabled"
          );
        } else {
          $("#multiple_Face_swapper_container .multi_Input").addClass(
            "disabled"
          );
          $("#multiple_Face_swapper_container .random_btn").addClass(
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
      lastSuccessTaskid: null,
      taskid: null,
      imgList: [],
      mergeImgUrl: null, // 当前合成图片的路径
      mergeKey: null, // 当前合成图片的key
      changeFaceLoading: false, // 换脸的加载boolean
      canMultiFaceData: {}, // 是否可以换脸
      showCreditBannerBool: true,
      uploadFacesNumber: 0,
      costCoins: 0,
      formdata: {
        avatar_obey_key: null,
        get_face_id: null,
        watermark_type: 2,
        avatar_main_key: [],
      },
      itemLoading: [],
    };
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

  handleOriginImageExist() {
    $("#multiple_Face_swapper_container .multi_upload_before").hide();
    $("#multiple_Face_swapper_container .multi_upload_after").show();
    $("#multiple_Face_swapper_container .drag_loadbox").addClass("height160");
  }

  // 添加图片
  async addMultiImage({ addData = {}, file, callback, ourPicsIndex = null }) {
    // let { e, demoKey, demoSrc } = data;
    const demoKey = addData?.demoKey || undefined;
    // this.setLoadingStart(false)
    this.setFirstStart(true);
    showRemoveWatemark_btn(false);
    if (typeof file !== "string" && !this.checkFileType(file)) {
      return;
    }
    try {
      this.setLiLoading(true);
      // 文件类型的图片需要人脸检查
      if (typeof file !== "string") {
        var result = await this.checkFacePicMulti(file);
        if (result < 1) {
          $("#multiple_Face_swapper_container .multi_uploader_multi")[0].value =
            "";
          this.setFirstStart(false);
          this.setLiLoading(false);
          this.showModalAboutFaceNumber();
          return;
        }
      }
      this.showToolBtn(false);
      $("#multiple_Face_swapper_container .change_multi_face_btn").addClass(
        "disabled"
      );
      let finalFile, showUrl, imageType, suffix = file.type;
      if (demoKey) {
        // 处理类型是网络地址的图片
        finalFile = addData.demoSrc;
        showUrl = addData.demoSrc;
        this.formdata.avatar_obey_key = demoKey;
      } else {
        // 处理类型是文件类型的图片
        const { blog, res, imgType } = await this.uploadMultiImagePromise(file);
        this.formdata.avatar_obey_key = res.data.key;
        finalFile = blog;
        imageType = imgType;
        showUrl = URL.createObjectURL(finalFile);
      }
      this.mergeKey = null;
      var data = { file: finalFile, showUrl, suffix, demoKey };
      this.uploadFacesNumber = 0;
      showBtnCreditsMultiImage(false);
      // this.setLiLoading(false);
      callback && callback(data, imageType, ourPicsIndex);
    } catch (err) {
      console.error(err);
      let text = multitextContentObj.faceSwapPop01.upload_file_failed;
      if (window.userRuleConfig.credit) {
        text = multitextContentObj.faceSwapPop01.upload_file_failed_credits;
      }

      this.multimodel.errorMessage({
        conText: `
        <h1>${multitextContentObj.faceSwapPop01.processImageTitle}</h1>
        <p>${textContentObj.filereadfail}</p>
        `,
        btnText: multitextContentObj.OK,
      });
      // this.multimodel.errorMessage({
      //   conText: `
      //   <h1>${multitextContentObj.faceSwapPop01.processImageTitle}</h1>
      //   <p>${text}</p>
      //   `,
      //   btnText: multitextContentObj.OK,
      // });
      this.checkMultiChangeFaceStatus();
      this.multimodel.options.visible = true;
      $("#multiple_Face_swapper_container .multi_uploader_multi")[0].value = "";
      this.setFirstStart(false);
      this.setLiLoading(false);
    }
  }

  // 多人换脸获取人脸
  async addFindFacesTask(callback) {
    try {
      this.changeFaceLoading = true;
      let { data, code } = await fetchPost(
        "ai/ai-tool/add-task",
        {
          action: "multiple_get_face",
          param: {
            avatar_obey_key: this.formdata.avatar_obey_key,
          },
        },
        TOOL_API,
        {
          "X-TASK-VERSION": "2.0.0",
        }
      );
      if (code === 200) {
        // showBtnCreditsMultiImage(true);
        this.formdata.get_face_id = data.task_id;
        this.getFindFacesTask(callback);
      } else if (code === 3014) {
        this.changeFaceLoading = false;
        showMaximumM();
        this.checkMultiChangeFaceStatus();
        this.setFirstStart(false);
        this.setLiLoading(false);
      } else {
        this.changeFaceLoading = false;
        this.multimodel.errorMessage({
          conText: `
            <h1>${multitextContentObj.faceSwapPop01.processImageTitle}</h1>
          `,
          btnText: multitextContentObj.OK,
        });
        this.multimodel.options.visible = true;
        this.setFirstStart(false);
        this.setLiLoading(false);
        this.checkMultiChangeFaceStatus();
      }
    } catch (err) {
      this.changeFaceLoading = false;
      console.error(err);
    }
  }
  // 多人换脸获取人脸轮询任务
  async getFindFacesTask(callback) {
    const that = this;
    const id = this.formdata.get_face_id;
    if (!id) {
      this.changeFaceLoading = false;
      return;
    }
    fetchPost(`ai/tool/get-task`, { id },TOOL_API)
      .then((res) => {
        if (res.message.includes("no face")) {
          this.changeFaceLoading = false;
          // if (that.canMultiFaceData.data?.credit) {
          //   Target_Photo = multitextContentObj.Credits_failed_celebrity;
          // }
          this.multimodel.errorMessage({
            conText: `
            <h1>${multitextContentObj.faceSwapPop01.processImageTitle}</h1>
            <p>${multitextContentObj.NoFaceMulti}</p>
          `,
            btnText: multitextContentObj.OK,
          });
          this.multimodel.options.visible = true;
          this.setLoadingStart(false);
          this.setLoadingMaskTip(false);
          $("#multiple_Face_swapper_container .change_multi_face_btn").addClass(
            "disabled"
          );
          this.formdata.avatar_main_key = [];
          that.setMultipleListImgs();
          $("#multiple_Face_swapper_container .people_recognized_box").hide();
          return;
        }
        if (res.code !== 200) {
          this.changeFaceLoading = false;
          // ==================================
          let processImage = multitextContentObj.faceSwapPop01.processImage;
          // if (this.canMultiFaceData.data?.credit) {
          //   processImage = multitextContentObj.Credits_failed;
          // }
          this.multimodel.errorMessage({
            conText: `
            <h1>${multitextContentObj.faceSwapPop01.processImageTitle}</h1>
            <p>${processImage}</p>
          `,
            btnText: multitextContentObj.OK,
          });
          this.multimodel.options.visible = true;
          this.setLoadingStart(false);
          this.setLoadingMaskTip(false);
        }
        else {
          this.tryCount = 0;
          if (res.data.status === 0) {
            this.formdata.avatar_main_key = res.data.additional_data.map(
              (el) => ({
                obey_part_key: el.avatar_part_key,
                obey_part_url: el.avatar_part_url,
              })
            );
            that.setMultipleListImgs();
            callback?.();
            setTimeout(() => {
              this.changeFaceLoading = false;
              $(
                "#multiple_Face_swapper_container .people_recognized_box"
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
        this.changeFaceLoading = false;
        if (this.tryCount >= 3) {
          this.multimodel.errorMessage({
            conText: `
            <h1>${multitextContentObj.faceSwapPop01.processImageTitle}</h1>
            <p>${multitextContentObj.processImage}</p>
          `,
            btnText: multitextContentObj.OK,
          });
          this.multimodel.options.visible = true;
          this.setLoadingStart(false);
        }
        else {
          console.log("retrying");
          setTimeout(() => {
            this.getFinalImg(id);
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
      $("#multiple_Face_swapper_container .random_btn").addClass("disabled");
      this.setFirstStart(true);
      $(
        "#multiple_Face_swapper_container .change_multi_face_btn ._multi_step3_btn"
      ).text(multitextContentObj.Generating);
      $("#multiple_Face_swapper_container .multi-generating-animate").show();
      this.changeFaceLoading = true;
      $("#multiple_Face_swapper_container #mult_main_face_change_img").attr(
        "style",
        "filter: blur(5px) brightness(0.7)"
      );
      $("#multiple_Face_swapper_container .change_multi_face_btn").addClass(
        "disabled"
      );
      this.setLiLoading(true);
      $("#multiple_Face_swapper_container .loading_multi_box p").text(
        getMultiText("Loading2")
      );
      $("#multiple_Face_swapper_container .loading_multi_box").show();
      $("#multiple_Face_swapper_container .people_recognized_list").addClass(
        "inter_loading"
      );
      $(".high_quality_append_dom").attr("style", "pointer-events:none");
      // $("#multiple_Face_swapper_container .multi_people_list_loading").show();
    } else {
      this.setFirstStart(false);
      $("#multiple_Face_swapper_container .random_btn").removeClass("disabled");
      $(
        "#multiple_Face_swapper_container .change_multi_face_btn ._multi_step3_btn"
      ).text(multitextContentObj.step3_btn);
      $("#multiple_Face_swapper_container .multi-generating-animate").hide();
      $("#multiple_Face_swapper_container .change_multi_face_btn").removeClass(
        "disabled"
      );
      this.changeFaceLoading = false;
      this.setLiLoading(false);
      // $("#multiple_Face_swapper_container .multi_pics li").attr("style", "")
      $("#multiple_Face_swapper_container #mult_main_face_change_img").attr(
        "style",
        ""
      );
      $("#multiple_Face_swapper_container .loading_multi_box").hide();
      $("#multiple_Face_swapper_container .people_recognized_list").removeClass(
        "inter_loading"
      );
      $(".high_quality_append_dom").attr("style", "");
      // $("#multiple_Face_swapper_container .people_recognized_list").find("add_icon_close").show();
      // $("#multiple_Face_swapper_container .multi_people_list_loading").hide();
    }
  }

  setLiLoading = (flag) => {
    if (flag) {
      $("#multiple_Face_swapper_container .multi_pics li").attr(
        "style",
        "filter: blur(3px);pointer-events: none;"
      );
    } else {
      $("#multiple_Face_swapper_container .multi_pics li").attr("style", "");
    }
  };

  // 设置大图loading
  setBigImageStart = (flag) => {
    if (flag) {
      $("#multiple_Face_swapper_container #mult_main_face_change_img").attr(
        "style",
        "filter: blur(5px) brightness(0.7)"
      );
      $("#multiple_Face_swapper_container .loading_multi_box p").text(
        multitextContentObj.Loading
      );
      $("#multiple_Face_swapper_container .loading_multi_box").show();
    } else {
      $("#multiple_Face_swapper_container #mult_main_face_change_img").attr(
        "style",
        ""
      );
      $("#multiple_Face_swapper_container .loading_multi_box").hide();
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
      $("#multiple_Face_swapper_container .multi_upload_before").addClass(
        "loading"
      );
      $("#multiple_Face_swapper_container .multi_upload_after").addClass(
        "loading"
      );
      $("#multiple_Face_swapper_container .multi_Input").addClass("disabled");
      $("#multiple_Face_swapper_container .multi_Input .multi_uploader_btn_con")
        .removeClass("show_btn_con")
        .hide();
      $(
        "#multiple_Face_swapper_container .multi_Input .multi_uploader_btn_loading"
      ).show();
      $(
        "#multiple_Face_swapper_container .multi_uploader_btn .multi_uploader_btn_con"
      ).hide();
      $(
        "#multiple_Face_swapper_container .multi_uploader_btn .multi_uploader_btn_loading"
      ).show();
      $("#multiple_Face_swapper_container .people_recognized_list").addClass(
        "inter_loading"
      );
      // $("#multiple_Face_swapper_container .multi_people_list_loading").show();
      this.form.firstPicLoading = true;
      this.setBigImageStart(true);
    } else {
      $("#multiple_Face_swapper_container .multi_upload_before").removeClass(
        "loading"
      );
      $("#multiple_Face_swapper_container .multi_upload_after").removeClass(
        "loading"
      );
      $("#multiple_Face_swapper_container .multi_Input").removeClass(
        "disabled"
      );
      $("#multiple_Face_swapper_container .multi_Input .multi_uploader_btn_con")
        .show()
        .addClass("show_btn_con");
      $(
        "#multiple_Face_swapper_container .multi_Input .multi_uploader_btn_loading"
      ).hide();
      $(
        "#multiple_Face_swapper_container .multi_uploader_btn .multi_uploader_btn_loading"
      ).hide();
      $(
        "#multiple_Face_swapper_container .multi_uploader_btn .multi_uploader_btn_con"
      ).show();
      $("#multiple_Face_swapper_container .people_recognized_list").removeClass(
        "inter_loading"
      );
      // $("#multiple_Face_swapper_container .multi_people_list_loading").hide();
      this.form.firstPicLoading = false;
      this.setBigImageStart(false);
    }
  };

  checkMultiChangeFaceStatus = () => {
    if (!this.formdata.avatar_main_key.some((el) => el.main_part_key)) {
      $("#multiple_Face_swapper_container .change_multi_face_btn").addClass(
        "disabled"
      );
    } else {
      $(
        "#multiple_Face_swapper_container .change_multi_face_btn ._multi_step3_btn"
      ).text(multitextContentObj.step3_btn);
      $("#multiple_Face_swapper_container .multi-generating-animate").hide();
      $("#multiple_Face_swapper_container .change_multi_face_btn").removeClass(
        "disabled"
      );
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
    this.showToolBtn(false);
    // if (getCookie("access_token") && getCookie("user_info")) {
    //   await getInfo().catch((err) => console.log(err));
    // }
    const bool = await this.getCanSwapFaceBool();
    if (!bool) {
      this.setLoadingStart(false);
      return;
    }

    // console.log(this.canMultiFaceData);

    // this.setLoadingStart(true);
    const param = {
      ...this.formdata,
      avatar_main_key: this.formdata.avatar_main_key.filter(
        (el) => el.main_part_key
      ),
      is_hd: multicreditSystem?.is_hd,
    };
    fetchPost(
      "ai/ai-tool/add-task",
      {
        param,
        action: "multiple_face_swap",
      },
      TOOL_API,
      {
        "X-TASK-VERSION": "2.0.0",
      }
    )
      .then(async (res) => {
        if (res.code === 200) {
          showBtnCreditsMultiImage(true);
          if (res.data.is_wateremark === 1) {
            showRemoveWatemark_btn(true);
          } else {
            showRemoveWatemark_btn(false);
          }
          this.getFinalImg(res.data.task_id);
        } else if (res.code === 3014) {
          showMaximumM();
          this.checkMultiChangeFaceStatus();
          if (
            this.mergeKey ||
            $(
              "#multiple_Face_swapper_container #mult_main_face_change_img"
            ).attr("data-key") !== "multi_img"
          ) {
            this.showToolBtn(true, true);
          }
          this.setFirstStart(false);
          this.setLiLoading(false);
        } else if (res.code === 401) {
          this.multimodel.errorMessage({
            conText: multitextContentObj.loginFirst,
            btnText: multitextContentObj.OK,
          });
          this.multimodel.options.visible = true;
          this.setLoadingStart(false);
        } else if (res.code === 3001) {
          if (
            $(
              "#multiple_Face_swapper_container #mult_main_face_change_img"
            ).attr("data-key") !== "multi_img"
          ) {
            this.showToolBtn(true, true);
          }
          $(
            "#multiple_Face_swapper_container .multi_stpe3_upload .v_step3_btn_credits"
          ).show();
          multicreditSystem.showCreditBanner(false);
          showMaximumM();
          this.setLoadingStart(false);
        } else if (res.code === 3008) {
          showNotEnoughCreditsM();
        } else  {
          this.multimodel.errorMessage({
            conText: `
              <h1>${multitextContentObj.faceSwapPop01.errorUploadTitle}</h1>
              <p>${multitextContentObj.faceSwapPop01.errorUpload}</p>
            `,
            btnText: multitextContentObj.OK,
          });
          this.multimodel.options.visible = true;
          this.setLoadingStart(false);
        }
      })
      .catch((err) => {
        console.error(err);
        this.multimodel.errorMessage({
          conText: `
            <h1>${multitextContentObj.faceSwapPop01.errorUploadTitle}</h1>
            <p>${multitextContentObj.faceSwapPop01.errorUpload}</p>
          `,
          btnText: multitextContentObj.OK,
        });
        this.checkMultiChangeFaceStatus();
        this.multimodel.options.visible = true;
        this.setLoadingStart(false);
      });
  };

  // 检查文件类型
  checkFileType = (file) => {
    if (typeof file === "string") return true;
    var allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/octet-stream",
    ];
    var fileType = file.type;
    if (isMobileDevice() && file.size > 1024 * 1024 * 100) {
      this.multimodel.errorMessage({
        conText: `
          <h1>${multitextContentObj.faceSwapPop01.processImageTitle}</h1>
          <p>${getFSMCreditsText("toolarge", { val: 100 })}</p>
        `,
        btnText: textContentObj.ok,
      });
      this.multimodel.options.visible = true;
      this.setBigImageStart(false);
      this.setFirstStart(false);
      return false;
    }
    if (!allowedTypes.includes(fileType)) {
      this.multimodel.errorMessage({
        conText: `
          <h1>${multitextContentObj.faceSwapPop01.processImageTitle}</h1>
          <p>${multitextContentObj.faceSwapPop01.limit}</p>
        `,
        btnText: multitextContentObj.OK,
      });
      this.multimodel.options.visible = true;
      this.setBigImageStart(false);
      this.setFirstStart(false);
      $("#multiple_Face_swapper_container #multi_uploader")[0].value = "";
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
      $("#multiple_Face_swapper_container .multi_img_btns").attr(
        "style",
        `display: flex;`
      );
      $("#multiple_Face_swapper_container .my_files_tips").attr(
        "style",
        `display: flex;`
      );
      gtag("event","show_vidqmyfiles_imgtipsfile_m")
      // if (!notShowImage) {
      //   $("#multiple_Face_swapper_container #mult_main_face_change_img").attr("src", this.mergeImgUrl);
      // }
    } else {
      $("#multiple_Face_swapper_container .multi_img_btns").hide();
      $("#multiple_Face_swapper_container .my_files_tips").hide();
    }
  }

  // 轮询获取最后成功的图片（2秒一次）
  getFinalImg = (id) => {
    const that = this;
    this.showToolBtn(false);
    this.setLoadingStart(true);
    this.taskid = id;
    fetchPost(`ai/tool/get-task`, { id }, TOOL_API)
      .then(async (res) => {
        if (res.message.includes("nsfw")) {
          let nsfw_photo = multitextContentObj.nsfw_photo;
          if (that.canMultiFaceData.data?.credit) {
            nsfw_photo = multitextContentObj.faceSwapPop01.Credits_failed_nsfw;
          }
          this.multimodel.errorMessage({
            conText: `
              <h1>${multitextContentObj.faceSwapPop01.processImageTitle}</h1>
              <p>${nsfw_photo}</p>
            `,
            btnText: multitextContentObj.OK,
          });
          this.multimodel.options.visible = true;
          this.setLoadingStart(false);
          that.setLoadingMaskTip(false);
          if (
            $(
              "#multiple_Face_swapper_container #mult_main_face_change_img"
            ).attr("data-key") !== "multi_img"
          ) {
            this.showToolBtn(true, true);
          }
          return;
        }
        if (res.message.includes("celebrity")) {
          let Target_Photo = multitextContentObj.faceSwapPop01.Target_Photo;
          if (that.canMultiFaceData.data?.credit) {
            Target_Photo =
              multitextContentObj.faceSwapPop01.Credits_failed_celebrity;
          }
          this.multimodel.errorMessage({
            conText: `
              <h1>${multitextContentObj.faceSwapPop01.processImageTitle}</h1>
              <p>${Target_Photo}</p>
            `,
            btnText: multitextContentObj.OK,
          });
          this.multimodel.options.visible = true;
          this.setLoadingStart(false);
          that.setLoadingMaskTip(false);
          if (
            $(
              "#multiple_Face_swapper_container #mult_main_face_change_img"
            ).attr("data-key") !== "multi_img"
          ) {
            this.showToolBtn(true, true);
          }
          return;
        }
        if (res.message.includes("faces=")) {
          if (res.message.includes("faces=0")) {
            let Target_Photo = multitextContentObj.NoFaceMulti;
            if (that.canMultiFaceData.data?.credit) {
              Target_Photo =
                multitextContentObj.faceSwapPop01.Credits_failed_NoFaceMulti;
            }
            this.multimodel.errorMessage({
              conText: `
                <h1>${multitextContentObj.faceSwapPop01.processImageTitle}</h1>
                <p>${Target_Photo}</p>
              `,
              btnText: multitextContentObj.OK,
            });
            this.multimodel.options.visible = true;
            this.setLoadingStart(false);
            that.setLoadingMaskTip(false);
            if (
              $(
                "#multiple_Face_swapper_container #mult_main_face_change_img"
              ).attr("data-key") !== "multi_img"
            ) {
              this.showToolBtn(true, true);
            }
            return;
          }
          // if (res.message.split("faces=")?.[1] > 1) {
          //   if (that.canMultiFaceData.data?.credit) {
          //     Target_Photo = multitextContentObj.Credits_failed_celebrity;
          //   }
          //   this.multimodel.errorMessage({
          //     conText: `
          //       <h1>${multitextContentObj.faceSwapPop01.processImageTitle}</h1>
          //       <p>${multitextContentObj.faceSwapPop01.manyFace}</p>
          //     `,
          //     btnText: multitextContentObj.OK,
          //   });
          //   this.multimodel.options.visible = true;
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
          this.multimodel.errorMessage({
            conText: `
              <h1>${multitextContentObj.faceSwapPop01.processImageTitle}</h1>
              <p>${processImage}</p>
            `,
            btnText: multitextContentObj.OK,
          });
          this.multimodel.options.visible = true;
          this.setLoadingStart(false);
          that.setLoadingMaskTip(false);
        } else {
          if (res.data.wait?.show_wait === 1) {
            if (show_ppriority == 0) {
              gtag("event","show_mulfaceswap_imgpriority");
              show_ppriority++;
            }
            let { num, second } = res.data.wait;
            that.setLoadingMaskTip(true, { show_wait: 1, num, second });
          } else {
            that.setLoadingMaskTip(false);
          }
          this.tryCount = 0;
          if (res.data.status === 0) {
            mulPhotoDownloadData = await setDownloadData("multiple_face_swap", res);
            show_ppriority = 0;
            this.mergeImgUrl = res.data.additional_data?.merge_url;
            this.mergeKey = res.data.additional_data?.merge_key;
            setCookie("faceSwapTime_swap", Date.now(), 2);
            window.userRuleConfig.credit = res.data.credit;
            multicreditSystem.showCreditBanner({bool: true});
            multiVcreditSystem.showCreditBanner({bool: true});
            changeHeaderCredit(res.data.credit);
            $(
              "#multiple_Face_swapper_container #mult_main_face_change_img"
            ).attr("data-key", "");
            $(
              "#multiple_Face_swapper_container #mult_main_face_change_img"
            ).attr("src", this.mergeImgUrl);
            gtag("event","succ_mulfaceswap_imgswapbtn");
            this.lastSuccessTaskid = this.taskid;
            setTimeout(() => {
              this.setLoadingStart(false);
              $(
                "#multiple_Face_swapper_container .change_multi_face_btn"
              ).removeClass("disabled");
              this.showToolBtn(true);
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
          this.multimodel.errorMessage({
            conText: `
                <h1>${multitextContentObj.faceSwapPop01.processImageTitle}</h1>
                <p>${error}</p>
              `,
            btnText: multitextContentObj.OK,
          });
          this.multimodel.options.visible = true;
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
    $("#multiple_Face_swapper_container .multi_uploader_multi")[0].value = "";
    let word = multitextContentObj.NoFaceMulti;
    if (result && result > 1) {
      word = multitextContentObj.faceSwapPop01.manyFace;
    }
    this.multimodel.errorMessage({
      conText: `
        <h1>${multitextContentObj.faceSwapPop01.processImageTitle}</h1>
        <p>${word}</p>
      `,
      btnText: multitextContentObj.faceSwapPop01.replaceImg,
      btnClick: () => {
        if (clickType === "faces_recognized") {
          $("#multiple_Face_swapper_container #multi_uploader").click();
        } else {
          $("#multiple_Face_swapper_container .multi_uploader_multi").click();
        }
      },
    });
    this.multimodel.options.visible = true;
  };

  // 获取demo图片
  getImgList() {
    var that = this;
    fetchGet("ai/public/pic-example?action=multiple_face_swap&water_type=2")
      .then((res) => {
        if (res.code === 401) {
          this.multimodel.errorMessage({
            conText: multitextContentObj.loginFirst,
            btnText: multitextContentObj.OK,
          });
          this.multimodel.options.visible = true;
          $("#multiple_Face_swapper_container .multi_pics").html(
            multitextContentObj.loginFirst
          );
          return;
        }
        that.imgList = res.data;
        // $("#multiple_face_swapper_try .multi_pics").html("");
        // $("#multiple_face_swapper_try .multi_pics").addClass("img9_show");
        res.data.forEach((face, index) => {
          $("#multiple_face_swapper_try .photo-content-box .content-box").append(`
            <li><img src="${face.pic_url}" data-key="${face.pic_key}" data-index="${index + 1}"/></li> 
          `);
        });
        // 官方示例图片点击更换
        $("#multiple_face_swapper_try .photo-content-box .content-box li").each(function () {
          $(this).on("click", (e) => {
            var src = $(this).find("img").attr("src");
            var demoKey = $(this).find("img").attr("data-key");
            if (!src || that.changeFaceLoading) {
              return;
            }
            gtag("event","click_mulfaceswap_imgtpl");
            that.showToolBtn(false);
            that.addMultiImage({
              addData: {
                demoKey,
                demoSrc: src,
              },
              file: src,
              callback: (data, imageType, ourPicsIndex) => {
                var otherType = imageType === "width" ? "height" : "width";
                $(
                  "#multiple_Face_swapper_container #mult_main_face_change_img"
                ).attr("data-key", "multi_img");
                $("#multiple_Face_swapper_container .multi_img")
                  .find("img")
                  .attr("src", data.showUrl)
                  .removeClass(otherType)
                  .addClass(`${imageType}`);
                $(
                  "#multiple_Face_swapper_container #mult_main_face_change_img"
                ).attr("src", data.showUrl);
                that.form.originImage = data;
                that.addFindFacesTask(() => {
                  // this.setFirstStart(false);
                  if (!ourPicsIndex) {
                    $("#multiple_Face_swapper_container #multi_img").attr(
                      "data-index",
                      null
                    );
                  }
                  if (ourPicsIndex) {
                    $("#multiple_Face_swapper_container #multi_img").attr(
                      "data-index",
                      ourPicsIndex
                    );
                  }
                });
              },
              ourPicsIndex: $(this).index() + 1,
            });
          });
        });
      })
      .catch((error) => {
        console.error("fail", error);
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
    });
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
      await this.getCanSwapFaceData();
      if (getCookie("access_token")) {
        // 可以换脸时
        if (this.canMultiFaceData?.code === 200) {
          // 非主站VIP用户上次使用的credit并且没有credit了
          if (
            this.canMultiFaceData.data?.last_use_credit === 1 &&
            this.canMultiFaceData.data?.credit === 0
          ) {
            // 展示去水印充值弹窗
            let bool = await showRemoveWatermarkM();
            // 用户点击了去充值
            resolve(bool);
          }
          resolve(true);
        } else {
          if (this.canMultiFaceData.code === 3008) {
            showNotEnoughCreditsM();
            resolve(false);
            return;
          }
          showMaximumM();
          // 无法换脸 展示充值弹窗
          resolve(false);
        }
      } else {
        if (this.canMultiFaceData.code !== 200) {
          // 超出免费次数
          showMaximumM();
          resolve(false);
        } else {
          resolve(true);
        }
      }
    });
  }

  setLoadingMaskTip(bool, data = {}) {
    const { maskSpan, show_wait, num, second } = data;
    let dom = $("#multiple_Face_swapper_container #createTaskMaskPhoto");
    let domBack = $(
      "#multiple_Face_swapper_container #multiple_Face_swapper_container .v_mask_background"
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
      "#multiple_Face_swapper_container #createTaskMaskPhoto .v_mask_unlock_priority"
    ).on("click", (e) => {
      setSessionCookie(`st`, `mulcreditpriority`);
      gtag("event","click_mulfaceswap_imgpriority")
      // window.open(toolPicingUrl);
    });
  }

  // 设置检测出来的人脸
  setMultipleListImgs() {
    const that = this;
    const people_recognized_list = $(
      "#multiple_Face_swapper_container #people_recognized_list"
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
      $("#multiple_Face_swapper_container .people_recognized_item").each(
        function (el) {
          const index = $(this).index();
          const item = $(this);
          item.find(".add_icon_box").on("click", function () {
            that.multipleIndex = index;
            gtag("event","up_mulfaceswap_targetimg");
            $("#multiple_Face_swapper_container #multi_uploader").click();
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
              showBtnCreditsMultiImage(true);
            } else {
              showBtnCreditsMultiImage(false);
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
              that.multimodel.errorMessage({
                conText: `<h1>${textContentObj.processImageTitle}</h1>
              <p>${multitextContentObj.faceSwapPop01.onlyone}</p>`,
                btnText: multitextContentObj.OK,
              });
              that.multimodel.options.visible = true;
              return;
            }
            gtag("event","up_mulfaceswap_targetimg");
            that.multipleIndex = index;
            that.itemUploading(e.originalEvent.dataTransfer.files[0]);
          });
        }
      );
      // showBtnCreditsMultiImage(true);
    }
  }

  setCurrentImgLoading(flag, index) {
    const loadingList = this.itemLoading;
    if (flag) {
      loadingList[index] = true;
      $("#multiple_Face_swapper_container .people_recognized_item")
        .eq(index)
        .find(".add_icon_loading")
        .show();
      $("#multiple_Face_swapper_container .people_recognized_item")
        .eq(index)
        .find(".add_icon_close")
        .hide();
      $("#multiple_Face_swapper_container .people_recognized_item")
        .eq(index)
        .find(".add_icon")
        .hide();
      $("#multiple_Face_swapper_container .people_recognized_item")
        .eq(index)
        .find(".add_icon_img")
        .hide();
      $("#multiple_Face_swapper_container .change_multi_face_btn").addClass(
        "disabled"
      );
      $("#multiple_Face_swapper_container .people_recognized_item")
        .eq(index)
        .find(".add_icon_box")
        .addClass("disabled");
    } else {
      loadingList[index] = false;
      if (loadingList.some((e) => e === true) || this.form.firstPicLoading) {
        $("#multiple_Face_swapper_container .change_multi_face_btn").addClass(
          "disabled"
        );
      } else {
        $(
          "#multiple_Face_swapper_container .change_multi_face_btn"
        ).removeClass("disabled");
      }
      if (!this.formdata.avatar_main_key[index].main_part_key) {
        $("#multiple_Face_swapper_container .people_recognized_item")
          .eq(index)
          .find(".add_icon")
          .show();
      }
      $("#multiple_Face_swapper_container .people_recognized_item")
        .eq(index)
        .find(".add_icon_loading")
        .hide();
      $("#multiple_Face_swapper_container .people_recognized_item")
        .eq(index)
        .find(".add_icon_box")
        .removeClass("disabled");
    }
  }

  async itemUploading(file) {
    const loadingList = this.itemLoading;
    if (typeof file !== "string" && !this.checkFileType(file)) {
      $("#multiple_Face_swapper_container #multi_uploader")[0].value = "";
      return;
    }
    const item = $(
      "#multiple_Face_swapper_container .people_recognized_item .add_icon"
    ).eq(this.multipleIndex);
    const itemImg = $(
      "#multiple_Face_swapper_container .people_recognized_item .add_icon_img"
    ).eq(this.multipleIndex);
    const itemClose = $(
      "#multiple_Face_swapper_container .people_recognized_item .add_icon_close"
    ).eq(this.multipleIndex);
    const index = this.multipleIndex;
    if (!item) return;
    this.setCurrentImgLoading(true, index);
    var result = await this.checkFacePicMulti(file);
    // if (result !== 1) {
    //   $("#multiple_Face_swapper_container #multi_uploader")[0].value = "";
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
      // if (window.userRuleConfig.credit) {
      //   text = multitextContentObj.faceSwapPop01.upload_file_failed_credits;
      // }
      $("#multiple_Face_swapper_container #multi_uploader")[0].value = "";
      this.multimodel.errorMessage({
        conText: `
        <h1>${multitextContentObj.faceSwapPop01.processImageTitle}</h1>
        <p>${text}</p>
        `,
        btnText: multitextContentObj.OK,
      });
      this.multimodel.options.visible = true;
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
    $("#multiple_Face_swapper_container .change_multi_face_btn").removeClass(
      "disabled"
    );
    this.setCurrentImgLoading(false, index);
    $("#multiple_Face_swapper_container .people_recognized_item")
      .eq(index)
      .find(".add_icon_close")
      .show();
    $("#multiple_Face_swapper_container #multi_uploader")[0].value = "";
    showBtnCreditsMultiImage(true);
  }
  // 是否可以换脸
  async getCanSwapFaceData() {
    const that = this;
    return new Promise(async (resolve, reject) => {
      try {
        let resp = await fetchPost("ai/tool/can-face", {
          action: "multiple_face_swap",
        },TOOL_API);
        that.canMultiFaceData = resp;
        changeHeaderCredit(resp.data.credit)
      } catch (err) {
        console.error(err);
      }
      resolve();
    });
  }
  // async showSwapFaceBtnCredit(bool) {
  //   if (bool) {
  //     await this.getCanSwapFaceData();
  //     $(
  //       "#multiple_Face_swapper_container .multi_stpe3_upload .v_step3_btn_credits"
  //     ).hide();
  //     multicreditSystem.showCreditBanner(true);
  //     isShowBtnCredit = false;
  //     // if (getCookie("access_token")) {
  //     // 可以生成图片并且有余额
  //     if (
  //       this.canMultiFaceData.code === 200 &&
  //       this.canMultiFaceData.data?.credit !== 0
  //     ) {
  //       $(
  //         "#multiple_Face_swapper_container .multi_stpe3_upload .v_step3_btn_credits"
  //       ).show();
  //       isShowBtnCredit = true;
  //       multicreditSystem.showCreditBanner(false);
  //     }
  //     // 没有免费次数并且没有余额
  //     if (this.canMultiFaceData.code !== 200) {
  //       $(
  //         "#multiple_Face_swapper_container .multi_stpe3_upload .v_step3_btn_credits"
  //       ).show();
  //       isShowBtnCredit = true;
  //       multicreditSystem.showCreditBanner(false);
  //     }
  //     // }
  //   } else {
  //     $(
  //       "#multiple_Face_swapper_container .multi_stpe3_upload .v_step3_btn_credits"
  //     ).hide();
  //     multicreditSystem.showCreditBanner(true);
  //     isShowBtnCredit = false;
  //   }
  // }

  eventLoginsuccess() {
    const that = this;
    let login_Modal = document.querySelector("my-component");
    login_Modal.addEventListener("loginsuccess", async function (event) {
      await multiAiFace.getCanSwapFaceData();
      const num = that.formdata.avatar_main_key.filter(el => el.main_part_key)?.length;
      if (that.formdata?.avatar_main_key && num>0) {
        showBtnCreditsMultiImage(true);
      }
      isLogin(true);
      multicreditSystem.showCreditBanner({bool: true});
      multiVcreditSystem.showCreditBanner({bool: true});
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
      // showCreditBox();
    });
  }
}

class MutiModel {
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
      $("#multiple_Face_swapper_container #multi_change_face_modal").show();
    } else {
      $("#multiple_Face_swapper_container #multi_change_face_modal").hide();
    }
  }
  // 报错提示
  errorMessage({ conText, btnText, btnClick }) {
    // $("#multiple_Face_swapper_container .change_face_modal_content").attr("style", "width: 550px;");
    $("#multiple_Face_swapper_container .change_face_modal_content").html(`
      <div class="error_con">
          <div class="error_p">${conText}</div>
          </div>
      `);
    $("#multiple_Face_swapper_container .change_face_modal_btns").html(`
      <div class="change_face_modal_btn">${btnText}</div>
    `);
    $("#multiple_Face_swapper_container .change_face_modal_btn").on(
      "click",
      () => {
        if (btnClick) {
          btnClick();
        }
        $("#multiple_Face_swapper_container #multi_change_face_modal").hide();
      }
    );
  }
  // 下载提示
  downloadMessage() {
    $("#multiple_Face_swapper_container #multi_change_face_modal").attr(
      "style",
      "width: 550px;height: 125px"
    );
    $("#multiple_Face_swapper_container .change_face_modal_btns").hide();
    $("#multiple_Face_swapper_container .close_btn").hide();
    $("#multiple_Face_swapper_container .change_face_modal_content").html(`
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
          $("#multiple_Face_swapper_container .loading_prograss_con").attr(
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
      $("#multiple_Face_swapper_container .loading_prograss_con").attr(
        "style",
        `width: ${count}%`
      );
    }, 50);
  }
  // 下载成功
  downloadSuccess() {
    var that = this;
    $("#multiple_Face_swapper_container .change_face_modal_btns").show();
    $("#multiple_Face_swapper_container .close_btn").show();
    $("#multiple_Face_swapper_container #multi_change_face_modal").attr(
      "style",
      "padding: 20px 25px;"
    );
    $("#multiple_Face_swapper_container .change_face_modal_content").html(`
      <div class="download_con">
        <h1>${multitextContentObj.faceSwapPop01.downloadH1}</h1>
        <p class="download_con_p">${multitextContentObj.faceSwapPop01.downloadTips}</p>
      </div>
    `);
    $("#multiple_Face_swapper_container .change_face_modal_btns").html(`
      <div class="change_face_modal_btn">${multitextContentObj.faceSwapPop01.continue}</div>
    `);
    $("#multiple_Face_swapper_container .change_face_modal_btn").on(
      "click",
      () => {
        that.options.visible = false;
        $("#multiple_Face_swapper_container #multi_change_face_modal").hide();
      }
    );
    $("#multiple_Face_swapper_container .click_multi_me").on(
      "click",
      async function () {
        const resultBoll = await checkFileExpired(that.options.downloadUrl);
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
    $("#multiple_Face_swapper_container #multi_change_face_modal").attr(
      "style",
      ""
    );
    $("#multiple_Face_swapper_container .change_face_modal_btns").show();
    this.errorMessage({
      conText: `
        <h1>${multitextContentObj.faceSwapPop01.downloadError}</h1>
        <p>${multitextContentObj.faceSwapPop01.errorUpload}</p>
      `,
      btnText: multitextContentObj.OK,
    });
  }
}

class MutiCreditPhotoModel {
  constructor(el, data, type) {
    this.element = el;
    this.showModelIndex = 0;
    this.data = data;
    this.type = type;
    this.onloadMessage();
  }
  onloadMessage() {
    const that = this;
    this.element.find(".win_icon_close").click(() => {
      that.data.setLoadingStart(false);
      this.closeModel();
      if (this.showModelIndex === 4) {
        this.buttonClick1();
      }
    });
    this.element.find(".v_other_button").click(() => {
      this.buttonClick();
    });
    this.element.find(".v_other_button1").click(() => {
      this.buttonClick1();
    });
  }
  buttonClick() {}
  buttonClick1() {}
  showNotEnoughCredits(credits = 1) {
    this.showModelIndex = 1;
    if (this.type) {
      gtag("event","show_miofs_mulnocredit_mv");
    } else {
      gtag("event","show_miofs_mulnocredit");
    }
    const that = this;
    let title = getFSMCreditsText("Model_not_credits_title");

    let spanHtml = getFSMCreditsText(
      "Model_not_credit_span",
      { val: credits },
      true
    );
    let buttonText = getFSMCreditsText("Model_not_credits_btn");

    this.element.find(".v_message_icon_notCredits").css({
      display: "block",
    });
    this.buttonClick = function () {
      if (this.type) {
        gtag("event","click_miofs_mulnocredit_mv");
        setSessionCookie("st", "mulnocreditmv");
        if (multiAiFaceV.uploadFacesNumber > 3) {
          gtag("event","click_miofs_mulnocredit_10mv");
          setCookie("st", "mulnocreditm_10mv")
        } else {
          gtag("event","click_miofs_mulnocredit_3mv")
          setCookie("st", "mulnocreditm_3mv")
        }
      } else {
        if (getNumberNow() > 6) {
          gtag("event","click_miofs_mulnocredit_10m")
          setCookie("st", "mulnocreditm_10m")
        } else {
          gtag("event","click_miofs_mulnocredit_6m")
          setCookie("st", "mulnocreditm_6m")
        }
        gtag("event","click_miofs_mulnocredit");
        setSessionCookie("st", "mulnocredit");
      }
      // window.open(toolPicingUrl);
      that.data.setLoadingStart(false);
      setTimeout(() => {
        that.closeModel();
      }, 500);
    };
    this.showModel({ title, spanHtml, buttonText });
  }

  showModel(data) {
    let { title, spanHtml, buttonText, buttonText1 } = data;
    this.element.find(".v_error_title").text(title);
    this.element.find(".v_error_span").html(spanHtml);
    this.element.find(".v_button_text").text(buttonText);
    this.element.find(".v_button_text1").text(buttonText1);
    this.element.css({
      display: "block",
    });
  }
  closeModel() {
    this.element.css({
      display: "none",
    });
    this.element.find(".v_message_icon").css({
      display: "none",
    });
    this.element.find(".v_other_button1").css({
      display: "none",
    });
    this.showModelIndex = 0;
  }
}
var createMultiDialog = (src, multiAiFace) => {
  $("#large_multi_face_modal .large_multi_img").attr("src", src);
  if (multiAiFace.mergeImg.width > multiAiFace.mergeImg.height) {
    $("#large_multi_face_modal .large_multi_img")
      .removeClass("height")
      .addClass("width");
  } else {
    $("#large_multi_face_modal .large_multi_img")
      .removeClass("width")
      .addClass("height");
  }
  var element = document.querySelector(".large_multi_img");
  var style = window.getComputedStyle(element);
  // var width = parseFloat(style.width) || 600;
  $("#large_multi_face_modal .multi_img_btns").attr("style", `display: flex;`);
  // $("#large_multi_face_modal").find(".removeWatemark_btn").hide();
  $("#large_multi_face_modal").attr("style", "display: flex");
};

var muticreditsPhotoModel = null;

function showNotEnoughCreditsM(credits = 1) {
  gtag("event", "alert_mulfaceswap_imgnocredit");
  multicreditSystem.showCreditPopup({
    title: getfsCreditsText("Model_not_credits_title"),
    content: getfsCreditsText("Model_not_credit_span", { val: credits }, true),
    btn: getfsCreditsText("Model_not_credits_btn"),
    btnFn: () => {
      gtag("event", "click_mulfaceswap_imgnocredit");
      setCookie("st", "mulfsimgnocredit");
      // window.open(toolPicingUrl);
    },
    modalCoins: "notenough",
  });
}

// max times
function showMaximumM() {
  gtag("event","alert_mulfaceswap_imgmaxlimit");
  multicreditSystem.showCreditPopup({
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
      gtag("event","click_mulfaceswap_imgmaxlimit");
      // window.open(toolPicingUrl);
    },
    modalCoins: "timesmax",
  });
}

// watermark
function showRemoveWatermarkM() {
  return new Promise((resolve, reject) => {
    multicreditSystem.showCreditPopup({
      title: getfsCreditsText("Model_Remove_Watermark_title"),
      content: getfsCreditsText("Model_Remove_Watermark_span"),
      btn: getfsCreditsText("Model_Remove_Watermark_btn"),
      btnWater: getfsCreditsText("Model_Remove_Watermark_btn1"),
      btnWaterFn: () => {
        gtag("event", "click_faceswap_stock_m");
        resolve(true);
      },
      closeClick: () => {
        resolve(true);
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

function showRemoveWatemark_btn(bool) {
  if (bool) {
    $(
      "#multiple_Face_swapper_container #multiple_Face_swapper_container .removeWatemark_btn"
    ).show();
    $("#large_multi_face_modal .removeWatemark_btn").show();
    let parent = $(
      "#multiple_Face_swapper_container .removeWatemark_btn"
    ).parent();
    parent.addClass("img_btns_group2");
    let large = $("#large_multi_face_modal .multi_img_btns");
    large.addClass("img_btns2_r");
  } else {
    $(
      "#multiple_Face_swapper_container #multiple_Face_swapper_container .removeWatemark_btn"
    ).hide();
    $("#large_multi_face_modal .removeWatemark_btn").hide();
    let parent = $(
      "#multiple_Face_swapper_container .removeWatemark_btn"
    ).parent();
    parent.removeClass("img_btns_group2");
    let large = $("#large_multi_face_modal .multi_img_btns");
    large.removeClass("img_btns2_r");
  }
}

function tabbarItemClick() {
  // const faceSwapTab = $("#multiple_Face_swapper_container #face-swap-tab")[0];
  // faceSwapTab.scrollLeft = 130;
  $(".tab__bar_item").each(function () {
    const index = $(this).index();
    $(this).on("click", function (e) {
      $(".tab__bar_item").removeClass("active");
      $(this).addClass("active");
      $("#multiple_face_swapper_try").removeClass('photo video');
      if (index === 1) {
        gtag("event","click_mulfaceswap_videotab");
        $("#multiple_Face_swapper_container_v").show();
        $("#multiple_Face_swapper_container").hide();
        $("#multiple_face_swapper_try").addClass('video');
        setNewTag();
      }
      if (index === 0) {
        gtag("event","click_mulfaceswap_phototab");
        $("#multiple_Face_swapper_container_v").hide();
        $("#multiple_Face_swapper_container").show();
        $("#multiple_face_swapper_try").addClass('photo');
      }
    });
  });
}

const checkImg = new Image();

function checkFileExpired(url) {
  return new Promise((resolve, reject) => {
    checkImg.src = url;
    checkImg.onload = () => {
      resolve(true);
    };
    checkImg.onerror = () => {
      resolve(false);
    };
  });
}

// 设置按钮金币
function showBtnCreditsMultiImage(bool) {
  if (multiAiFace.canMultiFaceData.code === 200 && multiAiFace.canMultiFaceData?.data?.credit === 0) {
    return;
  }
  const num = multiAiFace.formdata.avatar_main_key.filter(el => el.main_part_key).length;
  multiAiFace.uploadFacesNumber = num;
  multicreditSystem.showBtnCredits({
    bool,
    credits: getCreditsFromVideoOrPic(multiAiFace, "image"),
    appendDom: $("#multiple_Face_swapper_container .change_multi_face_btn"),
    type: "image",
  });
}

function getCountryConfig() {
  return new Promise((resolve, reject) => {
    fetchPost("ai/tool/videoface-user", {}, TOOL_API)
      .then((res) => {
        if (res.code === 200) {
          window.userRuleConfig = res.data;
          initCreditsComponents();
          changeHeaderCredit(res.data.credit)
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

// var photoAiFaceChanging = null;
let btnLoading1 = false;
var multimodel = new MutiModel();
var multiAiFace = new MultiAiFace({ multimodel });
// photoAiFaceChanging = multiAiFace;
muticreditsPhotoModel = new MutiCreditPhotoModel(
  $("#multiple_Face_swapper_container .multi_credits_messageModel"),
  multiAiFace
);
window.multiphotoAiFaceChanging = multiAiFace;
$(document).ready(function () {
  // 第一张图片点击上传切换
  gtag("event","open_mulfaceswap_page");
  multiAiFace.eventLoginsuccess();
  multiAiFace.getImgList();
  multiAiFace.getCanSwapFaceData();
  setFsNewTag();
  setNewTag(true);
  tabbarItemClick();
  getCountryConfig();

  const appsigninbtn = $(".appsigninbtn");
  const signupfootbtn = $(".signupfootbtn");
  const appsignupbtn = $(".signupnavbtn");
  const appsignupbtn2 = $(".appsignupbtn");
  appsigninbtn.attr("product-position", "isTool-no-reloading");
  appsignupbtn.attr("product-position", "isTool-no-reloading");

  appsignupbtn2.attr("product-position", "isTool-no-reloading");
  $("#multiple_Face_swapper_container .multi_uploader_btn").on(
    "click",
    function (e) {
      e.stopPropagation();
      $("#multiple_Face_swapper_container .multi_uploader_multi").click();
    }
  );

  $("#multiple_Face_swapper_container .upload_step").on(
    "dragover",
    function (e) {
      e.preventDefault(); // 阻止默认行为
    }
  );

  $("#multiple_Face_swapper_container .multi_upload .can_drag_box").on(
    "dragenter",
    function (e) {
      e.preventDefault(); // 阻止默认行为
      if (multiAiFace.form.firstPicLoading) return;
      multiAiFace.setDragLoading("multi_upload", true);
      multiAiFace.setDragLoading("change_upload", false);
    }
  );

  $("#multiple_Face_swapper_container .multi_upload .uploader_loading_mask").on(
    "dragleave",
    function (e) {
      multiAiFace.setDragLoading("multi_upload", false);
    }
  );

  $("#multiple_Face_swapper_container .multi_upload .uploader_loading_mask").on(
    "dragenter",
    function (e) {
      e.preventDefault(); // 阻止默认行为
      if (multiAiFace.form.firstPicLoading) return;
      multiAiFace.setDragLoading("multi_upload", true);
    }
  );

  $("#multiple_Face_swapper_container .multi_upload .uploader_loading_mask").on(
    "dragover",
    function (e) {
      e.preventDefault(); // 阻止默认行为
      if (multiAiFace.form.firstPicLoading) return;
      multiAiFace.setDragLoading("multi_upload", true);
    }
  );

  $("#large_multi_face_modal").on("wheel", function (e) {
    e.preventDefault(); // 阻止默认行为
  });

  // 第一张点击上传
  $("#multiple_Face_swapper_container .multi_uploader_multi").on(
    "change",
    function (e) {
      gtag("event","up_mulfaceswap_img");
      if (!e.target.files || !e.target.files[0]) {
        return;
      }
      var len = e.target.files.length;
      if (len !== 1) {
        multiAiFace.multimodel.errorMessage({
          conText: `<h1>${textContentObj.processImageTitle}</h1>
          <p>${multitextContentObj.faceSwapPop01.onlyone}</p>`,
          btnText: multitextContentObj.OK,
        });
        multiAiFace.multimodel.options.visible = true;
        return;
      }
      var file = e.target.files[0];
      var el = $(this)[0];
      multiAiFace.addMultiImage({
        file,
        callback: (data, imageType, ourPicsIndex) => {
          el.value = "";
          let otherType = imageType === "width" ? "height" : "width";
          $("#multiple_Face_swapper_container #mult_main_face_change_img").attr(
            "data-key",
            "multi_img"
          );
          $("#multiple_Face_swapper_container .multi_img")
            .find("img")
            .attr("src", data.showUrl)
            .removeClass(otherType)
            .addClass(`${imageType}`);
          $("#multiple_Face_swapper_container #mult_main_face_change_img").attr(
            "src",
            data.showUrl
          );
          multiAiFace.form.originImage = data;
          multiAiFace.addFindFacesTask(() => {
            multiAiFace.showToolBtn(false);
            // this.setFirstStart(false);
            if (!ourPicsIndex) {
              $("#multiple_Face_swapper_container #multi_img").attr(
                "data-index",
                null
              );
            }
          });
        },
      });
    }
  );

  // 第一张拖拽上传
  $(
    "#multiple_Face_swapper_container .multi_upload .uploader_loading_mask, .multi_uploader_btn_con_mask"
  ).on("drop", function (e) {
    e.preventDefault();
    setDragStatus(false);
    multiAiFace.setDragLoading("multi_upload", false);
    if (multiAiFace.form.firstPicLoading) {
      return;
    }
    var len = e.originalEvent.dataTransfer.files.length;
    if (len !== 1) {
      multiAiFace.multimodel.errorMessage({
        conText: `<h1>${textContentObj.processImageTitle}</h1>
            <p>${multitextContentObj.faceSwapPop01.onlyone}</p>`,
        btnText: multitextContentObj.OK,
      });
      multiAiFace.multimodel.options.visible = true;
      return;
    }
    gtag("event","up_mulfaceswap_img");
    var file = e.originalEvent.dataTransfer.files[0];
    $("#multiple_Face_swapper_container .multi_upload").addClass(
      "loading_mask"
    );
    multiAiFace.addMultiImage({
      file,
      callback: (data, imageType, ourPicsIndex) => {
        let otherType = imageType === "width" ? "height" : "width";
        $("#multiple_Face_swapper_container #mult_main_face_change_img").attr(
          "data-key",
          "multi_img"
        );
        $("#multiple_Face_swapper_container .multi_img")
          .find("img")
          .attr("src", data.showUrl)
          .removeClass(otherType)
          .addClass(`${imageType}`);
        $("#multiple_Face_swapper_container #mult_main_face_change_img").attr(
          "src",
          data.showUrl
        );
        multiAiFace.form.originImage = data;
        multiAiFace.addFindFacesTask(() => {
          // this.setFirstStart(false);
          if (!ourPicsIndex) {
            $("#multiple_Face_swapper_container #multi_img").attr(
              "data-index",
              null
            );
          }
        });
      },
    });
  });

  // 第一张更改上传
  $("#multiple_Face_swapper_container .multi_Input").on("click", function (e) {
    e.stopPropagation();
    if (btnLoading1) {
      return;
    }
    btnLoading1 = true;
    setTimeout(() => {
      btnLoading1 = false;
    }, 2000);
    $("#multiple_Face_swapper_container .multi_uploader_multi").click();
  });

  $(
    "#multiple_Face_swapper_container .multi_Input .multi_uploader_btn_con_mask"
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

  $("#multiple_Face_swapper_container .multi_Input")
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
      $("#multiple_Face_swapper_container .multi_Input").removeClass(
        "draggable"
      );
      $("#multiple_Face_swapper_container .multi_Input").find("svg").show();
      $("#multiple_Face_swapper_container .multi_Input")
        .find(".change_image_text")
        .text(getMultiText("change_btn"));
    } else {
      $("#multiple_Face_swapper_container .multi_Input").addClass("draggable");
      $("#multiple_Face_swapper_container .multi_Input").find("svg").hide();
      $("#multiple_Face_swapper_container .multi_Input")
        .find(".change_image_text")
        .text(getMultiText("drag_btn"));
    }
  }

  // 点击去除水印按钮
  $("#large_multi_face_modal .removeWatemark_btn").on("click", function (e) {
    // window.open(toolPicingUrl);
  });

  // 点击去除水印按钮
  $("#large_multi_face_modal .removeWatemark_btn").on("click", function (e) {
    // window.open(toolPicingUrl);
  });

  // 对比按下显示原图
  $(
    "#large_multi_face_modal .compare_multi_btn, #multiple_Face_swapper_container .compare_multi_btn"
  ).on("pointerdown", function (e) {
    e.preventDefault();
    gtag("event","compare_mulfaceswap_imgres");
    if (multimodel.options.downloading || multiAiFace.changeFaceLoading) {
      return;
    }
    if (e.button === 2) {
      return;
    }
    // this.setPointerCapture(e.pointerId);
    if (multiAiFace.form?.originImage?.showUrl) {
      $("#multiple_Face_swapper_container #mult_main_face_change_img").attr(
        "src",
        multiAiFace.form?.originImage.showUrl
        // "https://pic3.zhimg.com/v2-36b1e06bfc2b8abb7748337b859bcd8c_b.jpg"
      );
      $("#large_multi_face_modal .large_multi_img").attr(
        "src",
        multiAiFace.form?.originImage.showUrl
      );
    }

    document.addEventListener("pointerup", function (e) {
      if (
        $("#multiple_Face_swapper_container #mult_main_face_change_img").attr(
          "data-key"
        )
      )
        return;
      stopCompare(e);
    });
  });

  // $("#large_multi_face_modal .compare_multi_btn").on("touchstart", (event) => {
  //   // 处理触摸移动事件
  //   console.log("touchstart", event)
  // });

  $(
    "#multiple_Face_swapper_container .share_multi_btn, #large_multi_face_modal .share_multi_btn"
  ).on("click", (event) => {
    gtag("event","share_mulfaceswap_imgres");
    // 处理触摸移动事件
    let shareDialogEl = document.querySelector("#shareDialogEl");
    shareDialogEl.changeTips({
      title: multitextContentObj.faceSwapPop01.share__Tile,
      content: getMultiText("share__box__text"),
    });
    function backParams(data) {
      return {
        id: multiAiFace.lastSuccessTaskid,
        key: data?.merge_key,
      };
    }
    shareDialogEl.showShare({
      url: multiAiFace.mergeImgUrl,
      action: "multiplefaceswapmioshare",
      imageKey: multiAiFace.mergeKey,
      text: getMultiText("share__text"),
      title: multitextContentObj.faceSwapPop01.share__Tile,
      id: multiAiFace.lastSuccessTaskid,
      task_id: multiAiFace.lastSuccessTaskid,
      btoaUrl: btoa(multiAiFace.mergeKey + "," + multiAiFace.lastSuccessTaskid),
      backParams,
    });
  });

  $(
    "#large_multi_face_modal .compare_multi_btn, #multiple_Face_swapper_container .compare_multi_btn"
  ).on("pointerleave", (e) => {
    // 处理触摸移动事件
    stopCompare(e);
  });

  // 对比弹起显示原图
  const stopCompare = function (e) {
    e.preventDefault();
    if (multimodel.options.downloading || multiAiFace.changeFaceLoading) {
      return;
    }
    if (e.button === 2) {
      return;
    }
    // this.releasePointerCapture(e.pointerId);
    $("#multiple_Face_swapper_container #mult_main_face_change_img").attr(
      "src",
      multiAiFace.mergeImgUrl
    );
    $("#large_multi_face_modal .large_multi_img").attr(
      "src",
      multiAiFace.mergeImgUrl
    );
    document.removeEventListener("pointerup", function (e) {
      stopCompare(e);
    });
  };

  // 禁用鼠标右键菜单
  $("#multiple_Face_swapper_container #mult_main_face_change_img").on(
    "contextmenu",
    (e) => {
      e.originalEvent.preventDefault();
    }
  );
  $("#large_multi_face_modal .large_multi_img width").on("contextmenu", (e) => {
    e.originalEvent.preventDefault();
  });
  // 查看大图
  $("#multiple_Face_swapper_container .large_multi_image").on(
    "click",
    function (e) {
      e.preventDefault();

      gtag("event","zoomin_mulfaceswap_imgres");
      if (multimodel.options.downloading || multiAiFace.changeFaceLoading) {
        return;
      }
      if (e.button === 2) {
        return;
      }
      createMultiDialog(multiAiFace.mergeImgUrl, multiAiFace);
    }
  );
  // 下载
  $(".download_multi_btn_p").on("click", async (e) => {
    e.preventDefault();
    gtag("event","download_mulfaceswap_imgres");
    if (multimodel.options.downloading || multiAiFace.changeFaceLoading) {
      return;
    }
    if (e.button === 2) {
      return;
    }
    if (!getCookie("access_token")) {
      // $("#multiple_Face_swapper_container .vocalRemover__modal").show();
      showLoginWindow({
        isReloading: false,
        wait: [multiAiFace.taskid],
        fn: async (data = null) => {
          if(data) {
            mulPhotoDownloadData = data;
          }
        },
      });
      return;
    }
    multimodel.options.downloading = true;
    multimodel.downloadMessage();
    multimodel.options.visible = true;
    
    if(!mulPhotoDownloadData) {
      mulPhotoDownloadData = await newDownloadFile(
        multiAiFace.taskid
      );
      return;
    }
    fetchPost("ai/source/get-access-url", {
      key: multiAiFace.mergeKey,
      action: "download",
      file_name: "Vidqu_faceswap.png",
    },TOOL_API)
      .then(async (res) => {
        if (res.code === 401) {
          multimodel.errorMessage({
            conText: multitextContentObj.loginFirst,
            btnText: multitextContentObj.OK,
          });
          multimodel.options.visible = true;
          multimodel.options.downloadType = 2;
          multimodel.options.downloading = false;
          return;
        }

        const resultBoll = await checkFileExpired(res.data.url);
        if (!resultBoll) {
          $("#multiple_Face_swapper_container #multi_change_face_modal").attr(
            "style",
            ""
          );
          $("#multiple_Face_swapper_container .change_face_modal_btns").show();
          multimodel.errorMessage({
            conText: `
                <h1>${multitextContentObj.faceSwapPop01.processImageTitle}</h1>
                <p>${multitextContentObj.expired_file}</p>
              `,
            btnText: multitextContentObj.OK,
          });
          multimodel.options.downloadType = 0;
          multimodel.options.downloading = false;
          multimodel.options.visible = true;
          return;
        } else {
          multimodel.options.downloadType = 1;
          multimodel.options.downloading = false;
          let link = document.createElement("a");
          multimodel.options.downloadUrl = res.data.url;
          link.href = res.data.url;
          link.download = "Vidqu_faceswap.png";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(link.href);
          gtag("event","dwsucc_miofs_res_m");
        }
      })
      .catch((error) => {
        multimodel.options.downloadType = 2;
        multimodel.options.downloading = false;
        console.error("fail", error);
      });
  });

  $("#multiple_Face_swapper_container #change_face_login").on(
    "click",
    function () {
      window.location.href =
        thGotoApplibraryUrl + "signup?page_name=face-swap&name=ai";
    }
  );

  $("#multiple_Face_swapper_container .modal__main_close").on(
    "click",
    function () {
      $("#multiple_Face_swapper_container .vocalRemover__modal").hide();
    }
  );

  // 关闭弹窗
  $("#multiple_Face_swapper_container .close_btn").on("click", function () {
    multimodel.options.visible = false;
    $("#multiple_Face_swapper_container #multi_change_face_modal").hide();
    $("#multiple_Face_swapper_container #multi_change_face_modal").hide();
    // $("#multiple_Face_swapper_container #multi_change_face_modal").find(".removeWatemark_btn").show();
  });

  $("#large_multi_face_modal .multi_close_btn").on("click", function () {
    $("#large_multi_face_modal").hide();
  });
  // 开始换脸
  $("#multiple_Face_swapper_container .change_multi_face_btn").on(
    "click",
    function (e) {
      gtag("event","click_mulfaceswap_imgswapbtn");
      if (getNumberNow() > 6) {
        gtag("event","succ_mulfaceswap_img10")
      } else {
        gtag("event","succ_mulfaceswap_img6")
      }
      multiAiFace.changeMultiFace($(this));
    }
  );

  $("#multiple_Face_swapper_container .face_swap_now").on("click", function () {
    scrollToPositions(".ai-change-face");
  });

  $("#multiple_Face_swapper_container .see_more_multi").on(
    "click",
    function () {
      // const exPics = $("#multiple_Face_swapper_container #ex_pics");
      const multi_pics = $("#multiple_Face_swapper_container .multi_pics");
      multi_pics.removeClass("hide_other_pics");
      // exPics.addClass("expand");
      $("#multiple_Face_swapper_container .see_more_multi").hide();
      $("#multiple_Face_swapper_container .fold_multi").show();
    }
  );

  $("#multiple_Face_swapper_container .fold_multi").on("click", function () {
    // const exPics = $("#multiple_Face_swapper_container #ex_pics");
    // exPics.removeClass("expand");
    const multi_pics = $("#multiple_Face_swapper_container .multi_pics");
    multi_pics.addClass("hide_other_pics");
    $("#multiple_Face_swapper_container .see_more_multi").show();
    $("#multiple_Face_swapper_container .fold_multi").hide();
  });

  $("#multiple_Face_swapper_container #multi_uploader").on(
    "change",
    async function (e) {
      if (!e.target.files || !e.target.files[0]) {
        return;
      }
      multiAiFace.itemUploading(e.target.files[0]);
    }
  );
  $("#multiple_Face_swapper_container .face_random_multi").on(
    "click",
    function () {
      gtag("event",`img_miofs_quickbtn_m`);
      const randomAifaceFn = randomchoice(multiAiFace.imgList);
      if (multiAiFace.imgList?.length === 0) return;
      if (multiAiFace.form.firstPicLoading || multiAiFace.changeFaceLoading)
        return;
      const randomItem = randomAifaceFn();
      multiAiFace.showToolBtn(false);
      multiAiFace.addMultiImage({
        addData: {
          demoKey: randomItem.pic_key,
          demoSrc: randomItem.pic_url,
        },
        file: randomItem.pic_url,
        callback: (data, imageType, ourPicsIndex) => {
          var otherType = imageType === "width" ? "height" : "width";
          $("#multiple_Face_swapper_container #mult_main_face_change_img").attr(
            "data-key",
            "multi_img"
          );
          $("#multiple_Face_swapper_container .multi_img")
            .find("img")
            .attr("src", data.showUrl)
            .removeClass(otherType)
            .addClass(`${imageType}`);
          $("#multiple_Face_swapper_container #mult_main_face_change_img").attr(
            "src",
            data.showUrl
          );
          multiAiFace.form.originImage = data;
          multiAiFace.addFindFacesTask(() => {
            // this.setFirstStart(false);
            if (!ourPicsIndex) {
              $("#multiple_Face_swapper_container #multi_img").attr(
                "data-index",
                null
              );
            }
            if (ourPicsIndex) {
              $("#multiple_Face_swapper_container #multi_img").attr(
                "data-index",
                ourPicsIndex
              );
            }
          });
        },
        ourPicsIndex: $(this).index() + 1,
      });
    }
  );
  
  $('#header_user').on('mouseenter',()=>{
    gtag("event", "show_mulfaceswap_profilepopover");
  })

  $('#header_user #go_credits').click(()=>{
    gtag("event", "click_mulfaceswap_profileaccount");
  })
  $('#header_user .signout').click(()=>{
    gtag("event", "click_mulfaceswap_profilesignout");
  })
});

const initScrollBarPos = () => {
  const listsDom = document.querySelector(
    ".recommende__article_swiper .swiper-wrapper"
  );
  listsDom.scrollTo(300, 0);
};
function setGtag(item) {
  if (item.className.includes("_compare")) {
    gtag("event", "upclick_miomfs_compare");
  } else if (item.className.includes("_one")) {
    gtag("event", "upclick_miomfs_one");
  } else if (item.className.includes("_two")) {
    gtag("event", "upclick_miomfs_two");
  } else if (item.className.includes("_three")) {
  } else if (item.className.includes("_four")) {
    gtag("event", "upclick_miomfs_four");
  } else if (item.className.includes("_step")) {
    gtag("event", "upclick_miomfs_step");
  } else if (item.className.includes("_scroll")) {
    gtag("event", "upclick_miomfs_scroll");
  }
}
$(function () {
  // if (getCookie("access_token")) {
  //   showCreditBox();
  // }
  $("#multiple_Face_swapper_container .head-portrait .appsigninbtn").click(
    function (e) {
      e.stopPropagation();
      e.preventDefault();
    }
  );

  $("#multiple_Face_swapper_container .swap_credit_btn_multiphoto").on(
    "click",
    function () {
      if (getCookie("access_token")) {
        setSessionCookie(`st`, `mulloggedcreditbanner`);
        gtag("event","logged_credit_mulbannerbtn");
      } else {
        setSessionCookie("st", "mulnotcreditbanner");
        gtag("event","notlogged_credit_mulbannerbtn");
      }
    }
  );
  // seo

  new Swiper(".seo_section1_swiper_continer", {
    initialSlide: 0,
    spaceBetween: 20,
    allowTouchMove: false,
    autoplay:
      judgeClient() != "pc"
        ? {
            delay: 6000,
            disableOnInteraction: false,
          }
        : false,
    speed: 800,
    slidesPerView: 1,

    navigation: {
      nextEl: ".swiper-button-next1",
      prevEl: ".swiper-button-prev1",
      disabledClass: "disabled",
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });
  const right_line_buttons = document.querySelectorAll(".right_line_button");
  const right_line_button_bigs = document.querySelectorAll(
    ".right_line_button_big"
  );
  right_line_button_bigs.forEach((el, i) => {
    el.onmousedown = function (event) {
      const right_line = el.parentNode.querySelector(".right_line");
      const right_imgB = el.parentNode.querySelector(".right_imgB");
      var shiftX =
        event.clientX - right_line_buttons[i].getBoundingClientRect().left;

      document.onmousemove = function (event) {
        var newLeft =
          event.clientX - shiftX - el.parentNode.getBoundingClientRect().left;
        const diffW = right_line_buttons[i].offsetWidth / 2;
        var rightEdge = el.parentNode.offsetWidth - diffW;
        if (newLeft < diffW) {
          newLeft = diffW;
        }
        if (newLeft > rightEdge) {
          newLeft = rightEdge;
        }

        right_line_buttons[i].style.left = newLeft + "px";
        el.style.left = newLeft + "px";
        right_line.style.left = newLeft + "px";
        right_imgB.style.width = newLeft + "px";
      };

      document.onmouseup = function () {
        document.onmousemove = null;
        document.onmouseup = null;
      };
    };
    el.ondragstart = function () {
      return false;
    };

    el.addEventListener("touchstart", function (event) {
      var touch = event.touches[0];
      const right_line = el.parentNode.querySelector(".right_line");
      const right_imgB = el.parentNode.querySelector(".right_imgB");
      var shiftX =
        touch.clientX - right_line_buttons[i].getBoundingClientRect().left;

      function moveAt(touch) {
        var newLeft =
          touch.clientX - shiftX - el.parentNode.getBoundingClientRect().left;

        const diffW = right_line_buttons[i].offsetWidth / 2;
        var rightEdge = el.parentNode.offsetWidth - diffW;
        if (newLeft < diffW) {
          newLeft = diffW;
        }
        if (newLeft > rightEdge) {
          newLeft = rightEdge;
        }

        right_line_buttons[i].style.left = newLeft + "px";
        el.style.left = newLeft + "px";
        right_line.style.left = newLeft + "px";
        right_imgB.style.width = newLeft + "px";
      }

      function onTouchMove(event) {
        moveAt(event.touches[0]);
      }

      // 移动按钮
      document.addEventListener("touchmove", onTouchMove);

      // 停止移动
      el.addEventListener("touchend", function () {
        document.removeEventListener("touchmove", onTouchMove);
        el.removeEventListener("touchend", onTouchEnd);
      });

      function onTouchEnd() {
        document.removeEventListener("touchmove", onTouchMove);
      }

      el.addEventListener("touchend", onTouchEnd);
    });

    el.ondragstart = function () {
      return false;
    };
  });
  if (judgeClient() == "pc") {
    new Swiper(".recommende__article_swiper", {
      width: 1088,
      slidesPerView: 4,
      spaceBetween: 16,
      speed: 800,
      // autoplay: {
      //   delay: 8000,
      //   disableOnInteraction: false,
      // },
      navigation: {
        nextEl: ".recommende__article .swiper-button-next",
        prevEl: ".recommende__article .swiper-button-prev",
        disabledClass: "disabled",
      },
    });
  }
  // FAQS
  const faqsTranslatorItems = document.querySelectorAll(
    ".faqs__translator_item"
  );
  function faqsTranslatorItemsClick() {
    for (let i = 0; i < faqsTranslatorItems.length; i++) {
      const item = faqsTranslatorItems[i];
      const header = item.querySelector(".faqs__translator_item-header");
      const body = item.querySelector(".faqs__translator_item-body");
      header.onclick = () => {
        const show =
          body.style.maxHeight === "0px" || body.style.maxHeight === "";
        body.style.maxHeight = show ? body.scrollHeight + "px" : "0";
        if (show) {
          header.classList.add("show");
        } else {
          header.classList.remove("show");
        }
      };
    }
  }
  faqsTranslatorItemsClick();
  // Play Around
  const seo_section4_items = document.querySelectorAll(".seo_section4_item");
  const seo_section4_item_bodys = document.querySelectorAll(
    ".seo_section4_item_body"
  );
  const seo_section4_h3s = document.querySelectorAll(".seo_section4_item h3");
  const seo_section4_imgs = document.querySelectorAll(".imgBox img");
  const section4Mobimgs = document.querySelectorAll(
    ".seo_section4_itemBox_mob .section4_img"
  );
  function clearBoxHeight() {
    seo_section4_item_bodys.forEach((el, i) => {
      el.style.maxHeight = "0";

      seo_section4_h3s[i].classList.remove("show");
      if (judgeClient() == "pc" && i < seo_section4_imgs.length) {
        seo_section4_imgs[i].style.zIndex = "0";
      } else {
        if (section4Mobimgs[i]) {
          section4Mobimgs[i].style.maxHeight = "0";
        }
      }
    });
  }
  function section4ItemsClick() {
    for (let i = 0; i < seo_section4_items.length; i++) {
      const item = seo_section4_items[i];
      const header = item.querySelector("h3");
      const body = item.querySelector(".seo_section4_item_body");
      header.onclick = () => {
        const show =
          body.style.maxHeight === "0px" || body.style.maxHeight === "";
        clearBoxHeight();
        body.style.maxHeight = show ? body.scrollHeight + "px" : "0";

        if (show) {
          header.classList.add("show");
        } else {
          header.classList.remove("show");
        }
        if (judgeClient() == "pc") {
          seo_section4_imgs[i].style.zIndex = "1";
        } else {
          section4Mobimgs[i - 4].style.maxHeight = show
            ? "calc(641 / 750 * 100vw)"
            : "0";
          section4Mobimgs[i - 4].style.marginTop = show
            ? "calc(38.5 / 750 * 100vw)"
            : "0";
        }
      };
    }
  }
  faqsTranslatorItemsClick();
  section4ItemsClick();
  const seo_buttons = document.querySelectorAll(".seo_button");
  [...seo_buttons].forEach((item) => {
    item.onclick = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
      setGtag(item);
    };
  });
  
    
  $("#multiple_Face_swapper_container .my_files_tips .myfiles_check_Now_btn").on("click", ()=>{
    gtag("event", "click_vidqmyfiles_imgtipsfile_m");
    if(!getCookie("access_token")){
      showLoginWindow({
        isReloading: false,
        wait: [multiAiFace.taskid],
        fn: async (data = null) => {
          if(data) {
            mulPhotoDownloadData = data;
          }
          window.open("/my-files.html");
        },
      });
    }else{
      window.open("/my-files.html");
    }
  })
});

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
