var controllers = [];
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

let facecheckphotoBool = false;
let textContentObj = lan.faceSwapPop;
let show_ppriority_img = 0;
var photoDownloadData = null;
class AiFace {
  constructor(options) {
    var that = this;
    this.imgObjs = {
      firstPicLoading: false, // 第一张图片上传的loading
      secondPicLoading: false, // 第二张图片上传的loading
      originImage: {}, //第一张图片数据
      changeImage: {}, //第二张图片数据
      isSubmit: false, //是否开始生成
    }; // 当前表单的数据
    this.mergeImg = {
      width: 0,
      height: 0,
    };
    this.tryCount = 0;
    this.countryConfig = {};
    this.delay = 2000;
    this.lastCall = 0;
    this.taskid = null;
    this.imgList = [];
    this.isShowTool = false; //是否展示分享按钮（当前）
    this.mergeImgUrl = null; // 当前合成图片的路径
    this.mergeKey = null; // 当前合成图片的key
    this.lastType = 2; // 当前最后一次操作的step 1代表step1  2代表step2
    this.canFaceSwap = {}; // 是否可以换脸
    this.timerLoading = null;
    this.photoFirstRandom = false; //step1 图片是否随机生成
    this.photoSecondRandom = false; //step2 图片是否随机生成
    this.loadingImage = "/dist/img/face-swap/btn_loading.png";
    showBtnCreditsImage(false);
    this.form = new Proxy(that.imgObjs, {
      set(target, prop, value) {
        target[prop] = value;
        // console.log(target, that, "target");
        function isCanSubmit(){
          if (!checkNullObj(target["originImage"]) && !checkNullObj(target["changeImage"])) {
            showBtnCreditsImage(true);
            $("#photo_Face_swapper_container .change_face_btn").removeClass("disabled");
            if(target["isSubmit"]){
              $("#photo_Face_swapper_container .change_face_btn").addClass("submit");
              $("#photo_Face_swapper_container .change_face_btn .submit_text").text(textContentObj.Swapping_setp)
            }else{
              $("#photo_Face_swapper_container .change_face_btn").removeClass("submit");
              $("#photo_Face_swapper_container .change_face_btn .submit_text").text(textContentObj.step3_btn)
            }
          }
        }

        //第一张图片上传
        if (prop === "firstPicLoading") {
          if (value) {
            $("#photo_Face_swapper_container .faceSwapProgress").text(textContentObj.Loading)
            $("#photo_Face_swapper_container .change_face_btn").addClass("disabled");
            $("#photo_Face_swapper_container .spread_box_controls").css("visibility", "hidden");
            $("#photo_Face_swapper_container .my_files_tips").css("visibility", "hidden");
            $("#photo_Face_swapper_container .stepA .stepBox").addClass("loading");
            $("#photo_Face_swapper_container .stepA .step_loadingBox").css("display", "flex");
            $("#photo_Face_swapper_container .spread_box_container").addClass("uploading");
            that.setLiLoading(true);
          } else {
            $("#photo_Face_swapper_container .stepA .stepBox").removeClass("loading");
            $("#photo_Face_swapper_container .stepA .step_loadingBox").hide();
            $("#photo_Face_swapper_container .spread_box_container").removeClass("uploading");
            that.setLiLoading(false);
            isCanSubmit()
          }
        }

        //第二张图片上传
        if (prop === "secondPicLoading") {
          if (value) {
            
            $("#photo_Face_swapper_container .change_face_btn").addClass("disabled");
            $("#photo_Face_swapper_container .stepB .stepBox").addClass("loading");
            $("#photo_Face_swapper_container .stepB .step_loadingBox").css("display", "flex");
            that.setLiLoading(true);
          } else {
            $("#photo_Face_swapper_container .stepB .stepBox").removeClass("loading");
            $("#photo_Face_swapper_container .stepB .step_loadingBox").hide();
            that.setLiLoading(false);
            isCanSubmit()
          }
        }

        //生成中
        if (prop === "isSubmit") {
          if (value) {
            $("#photo_Face_swapper_container .stepA .stepBox").addClass("loading");
            $("#photo_Face_swapper_container .stepA .step_loadingBox").css("display", "flex");
            $("#photo_Face_swapper_container .stepB .stepBox").addClass("loading");
            $("#photo_Face_swapper_container .stepB .step_loadingBox").css("display", "flex");
            $("#photo_Face_swapper_container .spread_box_controls").css("visibility", "hidden");
            $("#photo_Face_swapper_container .my_files_tips").css("visibility", "hidden");
            $("#photo_Face_swapper_container .spread_box_container").addClass("loading");
            that.setBigImageStart(true, 1);
            that.setLiLoading(true);
            isCanSubmit()
          } else {
            $("#photo_Face_swapper_container .spread_box_container").removeClass("loading");
            $("#photo_Face_swapper_container .stepA .stepBox").removeClass("loading");
            $("#photo_Face_swapper_container .stepA .step_loadingBox").hide();
            $("#photo_Face_swapper_container .stepB .stepBox").removeClass("loading");
            $("#photo_Face_swapper_container .stepB .step_loadingBox").hide();
            that.setBigImageStart(false);
            that.setLiLoading(false);
            isCanSubmit()
            const key = $("#photo_Face_swapper_container .spread_image").attr("data-key");
            if(key !== "origin_img"){
            $("#photo_Face_swapper_container .spread_box_controls").css("visibility", "visible");
            $("#photo_Face_swapper_container .my_files_tips").css("visibility", "visible");
            gtag("event","show_vidqmyfiles_imgtipsfile");
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
  // initImg() {
  //   const that = this;
  //   that.setLoadingStart(true);
  //   const originImage = JSON.parse(localStorage.getItem("originImage"));
  //   const changeImage = JSON.parse(localStorage.getItem("changeImage"));
  //   const task_id = localStorage.getItem("faceswap_taskid");

  //   return new Promise((resolve, reject) => {
  //     const firstGet = that.getSourceUrl(originImage.key);
  //     const secondGet = that.getSourceUrl(changeImage.key);
  //     Promise.all([firstGet, secondGet, that.getFinalImg(task_id)]).then(res => {
  //       console.log(res)
  //       // res.forEach(async el => {
  //       //   const { blog, imgType } = await this.resizeImageByUrl(el.data.url);
  //       // })
  //     })
  //   })
  // }
  resizeImageByFile(file) {
    console.log("resizeImageByFile");
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
          console.log("blog post", blob);
          resolve({ blog: blob, imgType });
        };
        img.onerror = () => {
          console.log("resizeImageByFile error image", img.src);
          reject(new Error("Image load failed"));
        };
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  resizeImageByUrl(imgUrl) {
    var that = this;
    var maxSide = 1080;
    return new Promise((resolve, reject) => {
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
      img.src = imgUrl;
    });
  }

  // 初始化检测脸数的方法
  initFace = async function () {
    var MODEL_URL = "/dist/js/weights";
    const res = await faceapi.loadTinyFaceDetectorModel(MODEL_URL);
    await faceapi.loadSsdMobilenetv1Model(MODEL_URL);
    console.log(res);
    facecheckphotoBool = true;
    // await faceapi.loadSsdMobilenetv1Model(MODEL_URL);
  };

  // 获取上传文件地址
  getUploadFileUrl = (suffix, isRun) => {
    let type = suffix;
    try {
      type = suffix.split("/")[1];
    } catch (e) {
      type = "png";
    }
    return new Promise(async (resolve, reject) => {
      try {
        if (isRun) {
          resolve({ code: 200 });
        } else {
          var res = await fetchPost("ai/source/temp-upload-url", { file_name: "vidqu_faceswap." + type }, TOOL_API);
          resolve(res);
        }
      } catch (e) {
        console.error(e.message);
        reject(e);
      }
    });
  };

  // 通过上传地址传递文件
  uploadFile = (data, isRun) => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("isRun", isRun);

        if (isRun) {
          resolve(200);
        } else {
          var res = await fetchPut(data.upload_url, data.file, "");
          resolve(res);
        }
      } catch (e) {
        console.error(e.message);
        reject(e);
      }
    });
  };

  getBothUploadUrl({ firstType, secondType }) {
    var that = this;
    return new Promise(function (resolve, reject) {
      try {
        var firstGet = that.getUploadFileUrl(firstType, that.photoFirstRandom);
        var secondGet = that.getUploadFileUrl(secondType, that.photoSecondRandom);

        Promise.all([firstGet, secondGet])
          .then((urls) => {
            if (!urls || urls.some((e) => e.code !== 200)) {
              ToolTip({
                type: "error",
                title: textContentObj.errorNetworkTitle,
                content: textContentObj.errorNetwork,
                btn: textContentObj.ok,
              });

              $(".origin_uploader")[0].value = "";
              $(".change_uploader")[0].value = "";
              that.form.isSubmit = false;
            } else {
              if (!that.photoFirstRandom) {
                that.form.originImage = Object.assign(that.form.originImage, urls[0]?.data);
              }
              if (!that.photoSecondRandom) {
                that.form.changeImage = Object.assign(that.form.changeImage, urls[1]?.data);
              }
              resolve(urls);
            }
          })
          .catch((err) => {
            ToolTip({
              type: "error",
              title: textContentObj.Failed,
              content: textContentObj.exception_occurred,
              btn: textContentObj.ok,
            });

            $(".origin_uploader")[0].value = "";
            $(".change_uploader")[0].value = "";
            that.form.isSubmit = false;
          });
      } catch (e) {
        ToolTip({
          type: "error",
          title: textContentObj.Failed,
          content: textContentObj.exception_occurred,
          btn: textContentObj.ok,
        });

        $(".origin_uploader")[0].value = "";
        $(".change_uploader")[0].value = "";
        that.form.isSubmit = false;
      }
    });
  }

  // 添加图片
  addImage = async (e, file, type, callback, ...other) => {
    const that = this;
    function failout() {
      if (type === 1) {
        $(".origin_uploader")[0].value = "";
        that.form.firstPicLoading = false;
      } else {
        $(".change_uploader")[0].value = "";
        that.form.secondPicLoading = false;
      }
      const key = $("#photo_Face_swapper_container .spread_image").attr("data-key");
      if (that.mergeKey || key !== "origin_img") {
        $("#photo_Face_swapper_container .spread_box_controls").css("visibility", "visible");
        $("#photo_Face_swapper_container .my_files_tips").css("visibility", "visible");
        gtag("event","show_vidqmyfiles_imgtipsfile");
      }
    }

    console.log("addImage",type,file);
    this.setLiLoading(true);
    if (typeof file !== "string" && !this.checkFileType(file, type)) {
      this.setLiLoading(false);
      return;
    }
    if (type === 1) {
      this.form.firstPicLoading = true;
      // this.photoFirstRandom = false;
      // showRemoveWatemark_btn(false)
    }
    if (type === 2) {
      this.form.secondPicLoading = true;
      // this.photoSecondRandom = false;
    }
      // 添加file对象类型的文件
    if ((typeof file !== "string" && this.checkFileType(file, type)) || typeof file === "string") {
      try {
        if (typeof file !== "string") {
          await aiFaceChanging.initFace();
          var result;
          await this.resizeImageByFile(file)
            .then(async ({ blog, imgType }) => {
              console.log("then");
              result = await this.faceCheck({
                blobUrl: URL.createObjectURL(blog),
              });
            })
            .catch(async () => {
              console.log("catch");
              result = await this.faceCheck({
                blobUrl: URL.createObjectURL(file),
              });
            });

          if (result > 1) {
            ToolTip({
              type: "error",
              title: textContentObj.Failed,
              content: textContentObj.manyFace,
              btn: textContentObj.ok,
            });
            failout();
            return;
          }
          if (result <= 0) {
            ToolTip({
              type: "error",
              title: textContentObj.Failed,
              content: textContentObj.NoFace,
              btn: textContentObj.ok,
            });
            failout();
            return;
          }
        } 
        // var res = await this.getUploadFileUrl(file);
        await this.getCanSwapFaceData();
        let finalFile,
          showUrl,
          imageType,
          suffix = file.type;
        if (typeof file === "string") {
          var blob = await this.urlToFile(file);
          var { blog, imgType } = await this.resizeImageByUrl(URL.createObjectURL(blob));
          finalFile = blog;
          imageType = imgType;
          showUrl = URL.createObjectURL(blob);
        } else {
          var { blog, imgType } = await this.resizeImageByFile(file);
          finalFile = blog;
          imageType = imgType;
          showUrl = URL.createObjectURL(finalFile);
        }
        var data = { file: finalFile, showUrl, suffix };

        if (type === 1) {
          this.form.originImage = data;
          console.log(this.form.originImage, "data");
          // $(".origin_Input .origin_uploader_btn_con").text(
          //   getfsCreditsText("ChangePhoto")
          // );
          $("#photo_Face_swapper_container .spread_image").attr({"src": data.showUrl})
          this.form.firstPicLoading = false;
        } else {
          this.form.changeImage = data;
          // $(".change_Input .origin_uploader_btn_con").text(
          //   getfsCreditsText("ChangePhoto")
          // );
          this.form.secondPicLoading = false;
        }
        this.setLiLoading(false);
        this.lastType = type;
        type == 1 && (this.photoFirstRandom = false);
        type == 2 && (this.photoSecondRandom = false);
        callback && callback(data, imageType, other);
      } catch (err) {
        console.error(err);

        ToolTip({
          type: "error",
          title: textContentObj.Failed,
          content: textContentObj.file_not_exist,
          btn: textContentObj.ok,
        });
        failout();
      }
    }
  };

  async imgMinWidth(file) {
    const minWidth = 512;
    const url = await createObjectURLFun(file);
    return new Promise((resolve) => {
      const image = new Image();
      image.src = url;
      image.onload = function () {
        const width = this.width;
        const height = this.height;
        if (width < minWidth || height < minWidth) {
          resolve(false);
        } else {
          resolve(url);
        }
      };
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

  setLiLoading = (flag) => {
    if (flag) {
      $(".our_pics li[data-type='photo']").css({
        filter: "brightness(0.5)",
        "pointer-events": "none",
      });
    } else {
      $(".our_pics li[data-type='photo']").css({
        filter: "none",
        "pointer-events": "auto",
      });
    }
  };

  // 设置大图loading
  setBigImageStart = (flag, type = 1) => {
    let i = 0;
    if (flag) {
      if (type === 1) {
        $("#photo_Face_swapper_container .loading_box p .faceSwapProgress").text(textContentObj.Preparing_step);
      } else {
        if (this.timerLoading) {
          window.clearInterval(this.timerLoading);
          this.timerLoading = null;
        }
        this.timerLoading = setInterval(() => {
          if (i < 98) {
            i++;
            $("#photo_Face_swapper_container .loading_box p .faceSwapProgress").text(i + "% " + textContentObj.Swapping_setp);
          }
        }, 100);
      }
      $(".high_quality_append_dom_photo").css("pointer-events", "none")
    } else {
      $(".high_quality_append_dom_photo").css("pointer-events", "auto")
      window.clearInterval(this.timerLoading);
      this.timerLoading = null;
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

  isShowToolBtn (){

  }

  // 换脸操作
  changeFace = async () => {
    const that = this;
    if (!(await this.getCanSwapFaceBool())) {
      this.form.isSubmit = false;
      return;
    }
    try {
      var res = await this.uploadImagePromise();
      if (res.some((e) => e !== 200)) {
        return false;
      }
    } catch (e) {
      ToolTip({
        type: "error",
        title: textContentObj.Failed,
        content: textContentObj.errorUploadText1,
        btn: textContentObj.ok,
      });
      this.form.isSubmit = false;
      return false;
    }
    this.setBigImageStart(true, 2);
    fetchPost(
      "ai/tool/face-changing",
      {
        avatar_obey_key: this.form.originImage?.key,
        avatar_main_key: this.form.changeImage?.key,
        watertype: 5,
        is_hd: photocreditSystem?.is_hd,
      },
      TOOL_API,
      {
        "X-TASK-VERSION": "2.0.0",
      }
    )
      .then(async (res) => {
        if (res.code === 200) {
          showBtnCreditsImage(true);
          if (res.data.is_wateremark === 1) {
            showRemoveWatemark_btn(true)
          } else {
            showRemoveWatemark_btn(false)
          }
          this.getFinalImg(res.data.task_id);
        } else if (res.code === 401) {
          console.log("log error");
          ToolTip({
            type: "error",
            title: textContentObj.errorNetworkTitle,
            content: textContentObj.errorNetwork,
            btn: textContentObj.ok,
          });
          this.form.isSubmit = false;
        } else if (res.code === 3001) {
          const config = await that.getCountryConfig();
          showMaximum();
          this.form.isSubmit = false;
          showBtnCreditsImage(true);
        } else {
          ToolTip({
            type: "error",
            title: textContentObj.errorNetworkTitle,
            content: textContentObj.errorNetwork,
            btn: textContentObj.ok,
          });
          this.form.isSubmit = false;

        }
      })
      .catch((err) => {
        ToolTip({
          type: "error",
          title: textContentObj.errorNetworkTitle,
          content: textContentObj.errorNetwork,
          btn: textContentObj.ok,
        });
        this.form.isSubmit = false;

      });
  };

  // 检查文件类型
  checkFileType = (file, type) => {
    var allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/octet-stream"];
    var fileType = file.type;

    var allowedNameTypes = ["jpeg", "png", "webp", "jpg"];
    let nameArr = file.name.split(".");
    var fileNameType = nameArr[nameArr.length - 1].toLowerCase();

    if (!allowedTypes.includes(fileType) || !allowedNameTypes.includes(fileNameType)) {
      ToolTip({
        type: "error",
        title: textContentObj.Failed,
        content: textContentObj.limit,
        btn: textContentObj.ok,
      });
      if (type === 1) {
        this.form.firstPicLoading = false;
      }
      if (type === 2) {
        this.form.secondPicLoading = false;
      }
      return false;
    }
    return true;
  };

  // 轮询获取最后成功的图片（2秒一次）
  getFinalImg = (id) => {
    this.taskid = id;
    const that = this;
    fetchPost(`ai/tool/get-task`, { id }, TOOL_API)
      .then(async (res) => {
        if(res.data.wait?.show_wait === 1){
          if (show_ppriority_img == 0) {
            show_ppriority_img ++;
            gtag("event", "show_faceswap_imgpriority")
          }
          let { num, second } = res.data.wait; 
          that.setLoadingMaskTip(true,{show_wait: 1,num, second})
        }
        if (res.message.includes("nsfw")) {
          let nsfw_photo = textContentObj.pornographyMsg
          if(that.canFaceSwap.data?.credit){
            nsfw_photo = textContentObj.Credits_failed_nsfw
          }
          ToolTip({
            type: "error",
            title: textContentObj.Failed,
            content: nsfw_photo,
            btn: textContentObj.ok,
          });
          this.form.isSubmit = false;
          this.setLoadingMaskTip(false)
          return;
        }
        if (res.code !== 200) {
          if (res.message.includes("faces=0") || res.message.includes("no face")) {
            let textTips = textContentObj.No_face
            if(that.canFaceSwap.data?.credit){
              textTips = textContentObj.Credits_failed_no_face
            }
            // 视频中没有人脸
            ToolTip({
              type: "error",
              title: textContentObj.Failed,
              content: textTips,
              btn: textContentObj.ok,
            });
          } else if (res.message.includes("celebrity")) {
            let textTips = textContentObj.celebrity
            if(that.canFaceSwap.data?.credit){
              textTips = textContentObj.Credits_failed_celebrity
            }
            // 不符合要求
            ToolTip({
              type: "error",
              title: textContentObj.Failed,
              content: textTips,
              btn: textContentObj.ok,
            });
          } else if (res.message.includes("faces=")) {
            let textTips = textContentObj.Mutiple_face
            if(that.canFaceSwap.data?.credit){
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
            if(that.canFaceSwap.data?.credit){
              textTips = textContentObj.Credits_failed
            }
            ToolTip({
              type: "error",
              title: textContentObj.Failed,
              content: textTips,
              btn: textContentObj.ok,
            });
          }
          console.log(res, "error task");
          this.form.isSubmit = false;
          this.setLoadingMaskTip(false)
        } else {
          this.tryCount = 0;
          if (res.data.status === 0) {
            gtag("event", "succ_faceswap_imgswapbtn");
            show_ppriority_img = 0;
            setCookie("faceSwapTime_swap", Date.now(), 2);
            this.mergeImgUrl = res.data.additional_data?.merge_url;
            this.mergeKey = res.data.additional_data?.merge_key;
            userRuleConfig.credit = res.data.credit;
            changeHeaderCredit(userRuleConfig.credit)
            $("#photo_Face_swapper_container .spread_image").attr("data-key", "");
            $("#photo_Face_swapper_container .spread_image").attr("src", this.mergeImgUrl);
            $(".larger_img").attr("src", this.mergeImgUrl);
            localStorage.setItem("faceswap_taskid", id);
            localStorage.setItem("originImage", JSON.stringify(this.form.originImage));
            localStorage.setItem("changeImage", JSON.stringify(this.form.changeImage));
            showCreditBannerP(true);
            photoDownloadData = await setDownloadData("face_changing", res);
            setTimeout(() => {
              this.form.isSubmit = false;
              this.setLoadingMaskTip(false)
            }, 1000);
          } else {
            setTimeout(() => {
              this.getFinalImg(id);
            }, 2000);
          }
        }
      })
      .catch((err) => {
        if (this.tryCount >= 3) {
          ToolTip({
            type: "error",
            title: textContentObj.Failed,
            content: textContentObj.processImage,
            btn: textContentObj.ok,
          });
          this.form.isSubmit = false;
          this.setLoadingMaskTip(false)
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
          const result2 = await faceapi.detectAllFaces(Img, new faceapi.SsdMobilenetv1Options());
          if (result2.length) {
            resolve(result2.length);
          } else {
            const result = await faceapi.detectAllFaces(
              Img,
              new faceapi.TinyFaceDetectorOptions({
                inputSize: 416,
              })
            );
            resolve(result.length);
          }
        } catch (error) {
          console.log(error);
          reject(error);
        }
      };
      Img.onerror = async (error) => {
        console.log(error);
        reject(error);
      };
    });
  };
  checkFacePic = (file, type) => {
    return new Promise(async (resolve, reject) => {
      try {
        let blobUrl = file;
        if (typeof file !== "string") {
          blobUrl = URL.createObjectURL(file);
        }
        var result = await this.faceCheck({ blobUrl });
        if (result === 1) {
          resolve(true);
        } else {
          $(".origin_uploader")[0].value = "";
          $(".change_uploader")[0].value = "";
          let word = textContentObj.NoFace;
          if (result >= 2) {
            word = textContentObj.manyFace;
          }
          ToolTip({
            type: "error",
            title: textContentObj.Failed,
            content: word,
            btn: textContentObj.ok,
          });
          resolve(false);
        }
      } catch (e) {
        reject(e);
      }
    });
  };
  //demo
  getImgList() {
    var that = this;
    const photo_demo = fetchGet("ai/public/example?action=face_changing", TOOL_API)
      .then((res) => {
        if (res.code === 401) {
          ToolTip({
            type: "error",
            title: textContentObj.errorNetworkTitle,
            content: textContentObj.errorNetwork,
            btn: textContentObj.ok,
          });
          return;
        }
        let arr = res.data.photo;
        let domain = res.data.domain;
        arr.forEach((face, index) => {
          if (index >= 6) return;
          $(".our_pics").append(`
            <li data-type="photo" style="display:none">
              <img src="${domain + face}"  data-key="${face}" data-index="${index + 1}"/>
            </li>
          `);
        });
        // 官方示例图片点击更换
        $(".our_pics li[data-type='photo']").each(function () {
          $(this).on("click", (e) => {
            var src = $(this).find("img").attr("src");
            var demoKey = $(this).find("img").attr("data-key");
            var file = $(this).find("img").attr("src");
            let index = 3 - that.lastType;
            if (!src) {
              return;
            }
            gtag("event", "clickimg_faceswap_imgtpl");

            if (index === 1) {
              that.form.firstPicLoading = true;

              // $(".origin_Input .origin_uploader_btn_con").text(getfsCreditsText("ChangePhoto"));
              that.form.originImage = file;
              that.photoFirstRandom = true;

              that.form.originImage = {};
              that.form.originImage.key = demoKey;
              that.form.originImage.showUrl = src;
              that.form.originImage.suffix = demoKey.split(".")[1] == "png" ? "image/png" : "image/jpeg";

              $("#photo_Face_swapper_container .spread_image").attr("src", src);
              $("#photo_Face_swapper_container .spread_image").attr("data-key", "origin_img");
              $("#photo_Face_swapper_container .stepA .stepBox .step_P")
                .addClass("active")
                .attr("src", src)
                .removeClass("width")
                .removeClass("height");
              $("#photo_Face_swapper_container .stepA .stepBox .btn_changer").show();
              that.form.firstPicLoading = false;
            } else {
              that.form.secondPicLoading = true;
              // $(".change_Input .origin_uploader_btn_con").text(getfsCreditsText("ChangePhoto"));

              that.form.changeImage = file;
              that.photoSecondRandom = true;

              that.form.changeImage = {};
              that.form.changeImage.key = demoKey;
              that.form.changeImage.showUrl = src;
              that.form.changeImage.suffix = demoKey.split(".")[1] == "png" ? "image/png" : "image/jpeg";

              $("#photo_Face_swapper_container .stepB .stepBox .step_P")
                .addClass("active")
                .attr("src", src)
                .removeClass("width")
                .removeClass("height");
              $("#photo_Face_swapper_container .stepB .stepBox .btn_changer").show();
              that.form.secondPicLoading = false;
            }
            that.lastType = index;
          });
        });


      })
      .catch((error) => {
        ToolTip({
          type: "error",
          title: textContentObj.Failed,
          content: textContentObj.errorText,
          btn: textContentObj.ok,
        });
        console.error("fail", error);
      });
      const video_demo = fetchGet("ai/public/example?action=video_face_changing", TOOL_API)
      .then((res) => {
        if (res.code === 401) {
          ToolTip({
            type: "error",
            title: textContentObj.errorNetworkTitle,
            content: textContentObj.errorNetwork,
            btn: textContentObj.ok,
          });
          return;
        }
        let domain = res.data.domain;
        let imgHtml = ``;
        let videoHtml = ``;
        res.data.video_tartget_photo.forEach((item, index) => {
          if (index < 3) {
          imgHtml += `
              <li style="display:none" data-type="video" data-vp="p" photo-index="${
                index + 1
              }" pic-key="${item}"  pic-url="${
                domain + item
          }"> <img src="${domain + item}"> </li> `;
          }
        });
        res.data.video.forEach((item, index) => {
          if (index >= 3) return;
          videoHtml += `
          <li style="display:none" data-vp="v" data-type="video" video-index="${
            index + 1
          }" video-key="${item.video_key}" video-size="${
            item.size
          }" cover-url="${domain + item.cover_key}" video-duration="${
            item.duration
          }" video-url="${domain +item.video_key}">
           <img src="${domain + item.cover_key}">
           <img class="v_photo_demo_playIcon" src="/dist/img/face-swap/icon_small_video.png" alt="">
           </li>
          `;
        });
        $(".our_pics").append(videoHtml);
        $(".our_pics").append(imgHtml);
      })
      Promise.all([video_demo,photo_demo]).then(()=>{
        let tabName = $(".faceSwap_tab.active").attr("tabName");
        if (tabName === "tab_video") {
          $(".our_pics li[data-type='video']").show();
        } else {
          $(".our_pics li[data-type='photo']").show();
        }
      })
  }

  //本地上传一次
  uploadImagePromise() {
    return new Promise(async (resolve, reject) => {
      try {
        await this.getBothUploadUrl({
          firstFile: this.form.originImage.file,
          secondFile: this.form.changeImage.file,
          firstType: this.form.originImage.suffix,
          secondType: this.form.changeImage.suffix,
        });
        var uploadFirst = this.uploadFile(this.form.originImage, this.photoFirstRandom);
        var uploadSecond = this.uploadFile(this.form.changeImage, this.photoSecondRandom);
        Promise.all([uploadFirst, uploadSecond])
          .then((res) => {
            resolve(res);
          })
          .catch((err) => reject(err));
      } catch (err) {
        console.log(err);
        reject();
      }
    });
  }

  getSourceUrl(key) {
    return fetchPost(
      "ai/source/get-access-url",
      {
        key,
        file_name: "vidqu_faceswap.png",
      },
      TOOL_API
    );
  }

  setDragLoading(classname, flag) {
    console.log(classname, flag, "setDragLoading");
    if (flag) {
      $(`${classname} .uploader_loading_mask`).show();
    } else {
      $(`${classname} .uploader_loading_mask`).hide();
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

  getCountryConfig() {
    const that = this;
    return new Promise((resolve, reject) => {
      fetchGet("ai/tool/facechanging-country-code", TOOL_API)
        .then((res) => {
          if (res.code === 200) {
            that.countryConfig = res.data;
            resolve(res.data);
          } else {
            ToolTip({
              type: "error",
              title: textContentObj.errorNetworkTitle,
              content: textContentObj.errorNetwork,
              btn: textContentObj.ok,
            });
            reject("error");
          }
        })
        .catch(() => {
          ToolTip({
            type: "error",
            title: textContentObj.errorNetworkTitle,
            content: textContentObj.errorNetwork,
            btn: textContentObj.ok,
          });
          reject("error");
        });
    });
  }

  getCanSwapFaceBool() {
    return new Promise(async (resolve, reject) => {
      await this.getCanSwapFaceData()
      if (getCookie("access_token")) {
        // 可以换脸时
        if (this.canFaceSwap.code === 200) {
          // 非主站VIP用户
          if (this.canFaceSwap.data?.last_use_credit == 1 && this.canFaceSwap.data?.credit === 0) {
            // 展示去水印充值弹窗
            let bool = await showRemoveWatermark();
            // 用户点击了去充值
            resolve(bool);
          }
        } else {
          if (this.canFaceSwap.code === 3008) {
            showNotEnoughCredits();
          } else {
            showMaximum();
          }
          // 无法换脸 展示充值弹窗
          resolve(false);
        }
      } else {
        if (this.canFaceSwap.code !== 200) {
          // 超出免费次数
          showMaximum();
          resolve(false);
        }
      }
      resolve(true);
    });
  }
  // 是否可以换脸
  async getCanSwapFaceData() {
    const that = this;
    return new Promise(async (resolve, reject) => {
      try {
        let resp = await fetchPost(
          "ai/tool/can-face",
          {
            action: "face_changing",
          },
          TOOL_API
        );
        that.canFaceSwap = resp;
        let credit = that.canFaceSwap.data?.credit || 0;
        userRuleConfig.credit = credit;
        changeHeaderCredit(credit)
      } catch (err) {
        console.error(err);
      }
      resolve();
    });
  }

  eventLoginsuccess() {
    const that = this;
    this.getCanSwapFaceData();
    let login_Modal = document.querySelector("my-component");
    login_Modal.addEventListener("loginsuccess", async function (event) {
      await that.getCanSwapFaceData()
      if (!checkNullObj(that.form["originImage"]) && !checkNullObj(that.form["changeImage"])) {
        showBtnCreditsImage(true);
      }
      isLogin(true)
    });
  }

  setLoadingMaskTip(bool, data = {}) {
    const { maskSpan, show_wait, num, second } = data;
    let dom = $("#createTaskMaskPhoto");
    let domBack = $("#photo_Face_swapper_container .v_mask_background");
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
          setTextContentObj("estimated_wait_time", {
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
    $("#createTaskMaskPhoto .v_mask_unlock_priority").on("click", (e) => {
      gtag("event", "click_faceswap_imgpriority");
      // window.open(toolPicingUrl);
      setCookie(`st`, `fsimgcreditpriority`)
    });
  }
}

class CreditPhotoModel {
  constructor() {}

  showNotEnoughCredits() {
    ToolTip({
      type: "error",
      title: textContentObj.Failed,
      content: getfsCreditsText("Model_not_credit_span", { val: credits }),
      btn: textContentObj.ok,
    });
  }
  showMaximum() {
    gtag("event", "alert_faceswap_imgmaxlimit");
    let spanHtml = getfsCreditsText(
      "Model_Maximum_span",
      {
        val: userRuleConfig.p_times,
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
  showRemoveWatermark() {
    ToolTip({
      type: "error",
      title: textContentObj.Failed,
      content: getfsCreditsText("Model_Remove_Watermark_btn"),
      btn: textContentObj.ok,
    });
  }
}

//判断对象是否为空
function checkNullObj(obj) {
  if (Object.keys(obj).length === 0) {
    return true;
  }
  return false;
}

var creditsPhotoModel = null;

var setDropdown = (name, num = 1) => {
  let res = num === 1 ? aiFaceChanging.form.firstPicLoading : aiFaceChanging.form.secondPicLoading;
  $(`${name} .stepBox`).on("dragover", function (e) {
    e.preventDefault(); // 阻止默认行为
  });
  //图片拖拽A
  $(`${name} .stepBox`).on("dragenter", function (e) {
    e.preventDefault(); // 阻止默认行为
    if (res) {
      return;
    }
    aiFaceChanging.setDragLoading(`${name} .stepBox`, true);
  });

  $(`${name} .uploader_loading_mask`).on("dragleave", function (e) {
    if (res) {
      return;
    }
    aiFaceChanging.setDragLoading(`${name} .stepBox`, false);
  });
};

function showCreditBannerP (bool = true) {
  photocreditSystem.showCreditBanner({ bool, showcallback: () => {
    gtag("event", "show_faceswap_imgbanner");
  } });
  videocreditSystem.showCreditBanner({ bool, showcallback: () => {
    gtag("event", "show_faceswap_videobanner");
  } });
}

// max times
function showMaximum() {
  gtag("event", "alert_faceswap_imgmaxlimit");
  photocreditSystem.showCreditPopup({
    title: textContentObj.exceedTitle,
    content: getfsCreditsText(
      "Model_Maximum_span",
      {
        val: userRuleConfig.p_times,
      },
      true
    ),
    btn: getfsCreditsText("Model_Unlock_btn"),
    btnFn: () => {
      gtag("event", "click_faceswap_imgmaxlimit");
      // window.open(toolPicingUrl);
    },
    modalCoins: "timesmax",
  });
}

// show btn credits
function showBtnCreditsImage(bool) {
  if (aiFaceChanging?.canFaceSwap?.code === 200 && aiFaceChanging?.canFaceSwap?.data?.credit === 0) {
    return;
  }
  photocreditSystem.showBtnCredits({
    bool,
    credits: 1,
    appendDom: $("#photo_Face_swapper_container .change_face_btn"),
    type: "image",
  });
}

function showRemoveWatemark_btn(bool) {
  if (bool) {
    $("#photo_Face_swapper_container .removeWatemark_btn").show();
    $("#large_face_modal .removeWatemark_btn").show();
    let parent = $("#photo_Face_swapper_container .removeWatemark_btn").parent();
    parent.addClass("img_btns_group2");
    let large = $("#large_face_modal .img_btns");
    large.addClass("img_btns2_r");
  } else {
    $("#photo_Face_swapper_container .removeWatemark_btn").hide();
    $("#large_face_modal .removeWatemark_btn").hide();
    let parent = $("#photo_Face_swapper_container .removeWatemark_btn").parent();
    parent.removeClass("img_btns_group2");
    let large = $("#large_face_modal .img_btns");
    large.removeClass("img_btns2_r");
  }
}

// not enough
function showNotEnoughCredits(credits = 1) {
  gtag("event", "alert_faceswap_imgnocredit")
  photocreditSystem.showCreditPopup({
    title: getfsCreditsText("Model_not_credits_title"),
    content: getfsCreditsText("Model_not_credit_span", { val: credits }, true),
    btn: getfsCreditsText("Model_not_credits_btn"),
    btnFn: () => {
      gtag("event", "click_faceswap_imgnocredit")
      setCookie("st", "fsimgnocredit");
      // window.open(toolPicingUrl);
    },
    modalCoins: "notenough",
  });
}

// watermark
function showRemoveWatermark() {
  return new Promise((resolve, reject) => {
    photocreditSystem.showCreditPopup({
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

async function download(){
  if (!getCookie("access_token")) {
    showLoginWindow({
      isReloading: false,
      wait: [aiFaceChanging.taskid],
      fn: async (data = null) => {
        if(data) {
          photoDownloadData = data;
        }
      },
    });
    return;
  }

  if(!photoDownloadData) {
    photoDownloadData = await newDownloadFile(
      aiFaceChanging.taskid
    );
    return;
  }

  gtag("event", "download_faceswap_imgres");
  var sucessCallback = () => {
    ToolTip({
      type: "downloadsuccess",
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
      title: textContentObj.Failed,
      content: textContentObj.file_download_exist,
      btn: textContentObj.ok,
    });
  };
  await fetchPost(
    "ai/source/get-access-url",
    {
      key: aiFaceChanging.mergeKey,
      action: "download",
      file_name: "Vidqu_faceswap.png",
    },
    TOOL_API
  )
    .then((res) => {
      ToolTip({
        type: "progress",
        content: textContentObj.downloading,
        progressType: "fetch",
        url: res.data.url,
        name: "Vidqu_faceswap.png",
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

var aiFaceChanging = new AiFace();
var photoAiFaceChanging = aiFaceChanging;
$(document).ready(function () {
  window.aiFaceChanging = aiFaceChanging;
  creditsPhotoModel = new CreditPhotoModel();
  gtag("event", "open_faceswap_page");
  // 初始化检测脸数的方法
  aiFaceChanging.initFace();
  //出初始化demo
  aiFaceChanging.getImgList();
  aiFaceChanging.eventLoginsuccess();
  aiFaceChanging.setMaskUnlockPriority();
  setFsNewTag(true);
  //第一张图片点击上传
  $("#photo_Face_swapper_container .stepA .stepBox img").on("click", function (e) {
    e.stopPropagation();
    if ($(this).hasClass("active")) return;
    gtag("event", "up_faceswap_imgstep1");
    $(".origin_uploader").click();
  });
  $("#photo_Face_swapper_container .stepA .stepBox .btn_changer").on("click", function (e) {
    e.stopPropagation();
    if ($(this).hasClass("active")) return;
    gtag("event", "up_faceswap_imgstep1");
    $(".origin_uploader").click();
  });

  // 第二张图片点击上传
  $("#photo_Face_swapper_container .stepB .stepBox img").on("click", function (e) {
    e.stopPropagation();
    if ($(this).hasClass("active")) return;
    gtag("event", "up_faceswap_imgstep2");
    $(".change_uploader").click();
  });
  $("#photo_Face_swapper_container .stepB .stepBox .btn_changer").on("click", function (e) {
    e.stopPropagation();
    if ($(this).hasClass("active")) return;
    gtag("event", "up_faceswap_imgstep2");
    $(".change_uploader").click();
  });

  setDropdown("#photo_Face_swapper_container .stepA", 1);
  setDropdown("#photo_Face_swapper_container .stepB", 2);

  // 阻止大屏下滚动默认行为
  $("#large_face_modal").on("wheel", function (e) {
    e.preventDefault();
  });

  // 第一张点击上传 input
  $(".origin_uploader").on("change", function (e) {
    if (!e.target.files || !e.target.files[0]) {
      return;
    }
    var len = e.target.files.length;
    if (len !== 1) {
      ToolTip({
        type: "error",
        title: textContentObj.Failed,
        content: textContentObj.onlyone,
        btn: textContentObj.ok,
      });
      return;
    }
    var file = e.target.files[0];
    var el = $(this)[0];
    console.log(file, el, "file");
    aiFaceChanging.addImage(e, file, 1, (data, imageType) => {
      let otherType = imageType === "width" ? "height" : "width";
      $("#photo_Face_swapper_container .spread_image").attr("data-key", "origin_img");
      $("#photo_Face_swapper_container .stepA .stepBox .step_P")
        .addClass("active")
        .attr("src", data.showUrl)
        .removeClass(otherType)
        .addClass(`${imageType}`);
      $("#photo_Face_swapper_container .stepA .stepBox .btn_changer").show();
      el.value = "";
    });
  });

  // 第二张点击上传 input
  $(".change_uploader").on("change", function (e) {
    if (!e.target.files || !e.target.files[0]) {
      return;
    }
    var len = e.target.files.length;
    if (len !== 1) {
      ToolTip({
        type: "error",
        title: textContentObj.Failed,
        content: textContentObj.onlyone,
        btn: textContentObj.ok,
      });

      return;
    }
    var file = e.target.files[0];
    var el = $(this)[0];
    aiFaceChanging.addImage(e, file, 2, (data, imageType) => {
      let otherType = imageType === "width" ? "height" : "width";
      $("#photo_Face_swapper_container .stepB .stepBox .step_P")
        .addClass("active")
        .attr("src", data.showUrl)
        .removeClass(otherType)
        .addClass(`${imageType}`);
      $("#photo_Face_swapper_container .stepB .stepBox .btn_changer").show();
      el.value = "";
    });
  });

  // 第一张拖拽上传
  $("#photo_Face_swapper_container .stepA .uploader_loading_mask").on("drop", function (e) {
    e.preventDefault();
    aiFaceChanging.setDragLoading("#photo_Face_swapper_container .stepA", false);
    if (aiFaceChanging.form.firstPicLoading) {
      return;
    }
    gtag("event", "up_faceswap_imgstep1");

    var len = e.originalEvent.dataTransfer.files.length;
    if (len !== 1) {
      ToolTip({
        type: "error",
        title: textContentObj.Failed,
        content: textContentObj.onlyone,
        btn: textContentObj.ok,
      });
      return;
    }
    var file = e.originalEvent.dataTransfer.files[0];
    $(".origin_upload").addClass("loading_mask");
    aiFaceChanging.addImage(e, file, 1, (data, imageType) => {
      let otherType = imageType === "width" ? "height" : "width";
      $("#photo_Face_swapper_container .spread_image").attr("data-key", "origin_img");
      $("#photo_Face_swapper_container .stepA .stepBox .step_P")
        .addClass("active")
        .attr("src", data.showUrl)
        .removeClass(otherType)
        .addClass(`${imageType}`);
      $("#photo_Face_swapper_container .stepA .stepBox .btn_changer").show();
    });
  });

  // 第二张拖拽上传
  $("#photo_Face_swapper_container .stepB .uploader_loading_mask").on("drop", function (e) {
    e.preventDefault();
    aiFaceChanging.setDragLoading("#photo_Face_swapper_container .stepB ", false);
    if (aiFaceChanging.form.secondPicLoading) {
      return;
    }
    gtag("event", "up_faceswap_imgstep2");
    var len = e.originalEvent.dataTransfer.files.length;
    if (len !== 1) {
      ToolTip({
        type: "error",
        title: textContentObj.Failed,
        content: textContentObj.onlyone,
        btn: textContentObj.ok,
      });
      return;
    }
    var file = e.originalEvent.dataTransfer.files[0];
    aiFaceChanging.addImage(e, file, 2, (data, imageType) => {
      let otherType = imageType === "width" ? "height" : "width";
      $("#photo_Face_swapper_container .stepB .stepBox .step_P")
        .addClass("active")
        .attr("src", data.showUrl)
        .removeClass(otherType)
        .addClass(`${imageType}`);
      $("#photo_Face_swapper_container .stepB .stepBox .btn_changer").show();
    });
  });

  // 点击去除水印按钮
  $("#photo_Face_swapper_container .removeWatemark_btn").on("click", function (e) {
    // window.open(toolPicingUrl); 
  });

  // 点击去除水印按钮
  $("#large_face_modal .removeWatemark_btn").on("click", function (e) {
    // window.open(toolPicingUrl);
  });

  // 对比按下显示原图
  $("#photo_Face_swapper_container .contrast,#large_modal .contrast").on("pointerdown", function (e) {
    e.preventDefault();

    if (e.button === 2 ) {
      return;
    }
    gtag("event", "compare_faceswap_imgres");
    // this.setPointerCapture(e.pointerId);
    if (aiFaceChanging.form?.originImage?.showUrl) {
      $("#photo_Face_swapper_container .spread_image").attr(
        "src",
        aiFaceChanging.form?.originImage.showUrl
        // "https://pic3.zhimg.com/v2-36b1e06bfc2b8abb7748337b859bcd8c_b.jpg"
      );
      $("#large_modal .larger_img").attr("src", aiFaceChanging.form?.originImage.showUrl);
    }

    document.addEventListener("pointerup", function (e) {
      if ($("#photo_Face_swapper_container .spread_image").attr("data-key")) return;
      stopCompare(e);
    });
  });

  // $(".compare_btn").on("touchstart", (event) => {
  //   // 处理触摸移动事件
  //   console.log("touchstart", event)
  // });

  $("#photo_Face_swapper_container .share,#large_modal .share").on("click", (event) => {
    gtag("event", "share_faceswap_imgres");
    // 处理触摸移动事件
    let shareDialogEl = document.querySelector("#shareDialogEl");
    function backParams(obj = {}){
      return{
        id:aiFaceChanging.taskid,
        key:obj?.merge_key,
      }        
    }
    shareDialogEl.changeTips({
      title: textContentObj.share_title_v,
      content: textContentObj.share_title_centent,
    });
    shareDialogEl.showShare({
      url: aiFaceChanging.mergeImgUrl,
      action: "ismarttafaceshare",
      imageKey: aiFaceChanging.mergeKey,
      text: textContentObj.share__text,
      title: textContentObj.share__Tile,
      id: aiFaceChanging.taskid,
      lan:questLanguage,
      backParams,
      task_id:aiFaceChanging.taskid,
    });
  });

  $(".compare_btn").on("pointerleave", (e) => {
    // 处理触摸移动事件
    stopCompare(e);
  });

  // 对比弹起显示原图
  const stopCompare = function (e) {
    console.error("stopCompare")
    e.preventDefault();
    const state = $("#photo_Face_swapper_container .spread_box_controls").css("visibility")
    if (e.button === 2 ) {
      return;
    }
    // this.releasePointerCapture(e.pointerId);
    $("#photo_Face_swapper_container .spread_image").attr("src", aiFaceChanging.mergeImgUrl);
    $("#large_modal .larger_img").attr("src", aiFaceChanging.mergeImgUrl);
    document.removeEventListener("pointerup", function (e) {
      stopCompare(e);
    });
  };

  // 查看大图
  $("#photo_Face_swapper_container .zoomIn").on("click", function (e) {
    e.preventDefault();
    if (e.button === 2) {
      return;
    }
    gtag("event", "zoomin_faceswap_imgres");
    $("#large_modal").addClass("photo_large").show();
    $("#large_modal.photo_large .download").on("click",  (e) => {
      e.preventDefault();
      if (e.button === 2) {
        return;
      }
      download()
    });
  
  });

  // 下载
  $("#photo_Face_swapper_container .download").on("click", async (e) => {
    e.preventDefault();

    if (e.button === 2) {
      return;
    }
    await download()

  });

  $(".modal__main_close").on("click", function () {
    $(".vocalRemover__modal").hide();
  });

  // 大图关闭弹窗
  $("#large_modal .close_large").on("click", function () {
    $("#large_modal").hide().removeClass("photo_large").removeClass("video_large");
    $("#large_modal .download").off("click");
  });
  // 开始换脸
  $(".change_face_btn").on("click", function (e) {
    gtag("event", "click_faceswap_imgstep3");
    let that = aiFaceChanging;
    that.form.isSubmit = true;
    that
      .getCountryConfig()
      .then(() => {
        that.changeFace($(this));
      })
      .catch(() => {
        that.form.isSubmit = false;
      });
  });

  $(".face_swap_now").on("click", function () {
    scrollToPositions(".ai-change-face");
  });

  $('#header_user').on('mouseenter',()=>{
    gtag("event", "show_faceswap_profilepopover");
  })

  $('#header_user #go_credits').click(()=>{
    gtag("event", "click_faceswap_profileaccount");
  })
  $('#header_user .signout').click(()=>{
    gtag("event", "click_faceswap_profilesignout");
  })
  // const tabs = $("#tabs-buttons_section3");

  // // swiper1
  // tabs.children(".tab_title").each(function (index) {
  //   $(this).on("click", function (event) {
  //     const target = event.target;
  //     if (target.classList.contains("active-tab")) return;
  //     target.parentElement
  //       .querySelector(".active-tab")
  //       .classList.remove("active-tab");
  //     target.classList.add("active-tab");
  //     tabContent.slideTo(index);
  //   });
  // });

  // const tabContent = new Swiper("#tabs-content", {
  //   slidesPerView: 1,
  //   noSwiping: true,
  //   autoplay: {
  //     delay: 8000,
  //     disableOnInteraction: false,
  //   },
  //   pagination: {
  //     el: '.swiper-pagination',
  //     clickable: true,
  //   },
  //   on: {
  //     slideChangeTransitionStart: function(){
  //       const activeIndex = (this.activeIndex);
  //       tabs.children(".tab_title").removeClass("active-tab");
  //       tabs.children(".tab_title").eq(activeIndex).addClass("active-tab");
  //     },
  //   },
  // });

  // const work_swiper_blog = new Swiper(".workSwiper-blog", {
  //   speed: 800,
  //   slidesPerView: 4,
  //   autoplay: {
  //     delay: 8000,
  //     disableOnInteraction: false,
  //   },
  //   navigation: {
  //     nextEl: ".swiper-button-next",
  //     prevEl: ".swiper-button-prev",
  //     disabledClass: "button-disabled",
  //   },
  // });

  // const work_swiper_blog_m = new Swiper(".workSwiper-blog_m", {
  //   autoplay: {
  //     delay: 8000,
  //     disableOnInteraction: false,
  //   },
  //   spaceBetween: 30,
  //   roundLengths: true,
  //   initialSlide: 2,
  //   speed: 600,
  //   slidesPerView: 1,
  //   centeredSlides: true,
  //   followFinger: false,
  // });

  // const seo_section4 = $(".seo_section4_menu");
  // seo_section4.children(".menuItem").each(function (e) {
  //   const thisDom = $(this);
  //   $(this)
  //     .children("h3")
  //     .on("click", function (event) {
  //       if (thisDom.hasClass("active")) {
  //         thisDom.removeClass("active");
  //       } else {
  //         thisDom.siblings().removeClass("active");
  //         thisDom.addClass("active");
  //       }
  //     });
  // });

  
    
  $("#photo_Face_swapper_container .my_files_tips .myfiles_check_Now_btn").on("click", ()=>{
    gtag("event", "click_vidqmyfiles_imgtipsfile");
    if(!getCookie("access_token")){
      showLoginWindow({
        isReloading: false,
        wait: [aiFaceChanging.taskid],
        fn: async (data = null) => {
          if(data) {
            photoDownloadData = data;
          }
          window.open("/my-files.html");
        },
      });
    }else{
      window.open("/my-files.html");
    }
  })
});
