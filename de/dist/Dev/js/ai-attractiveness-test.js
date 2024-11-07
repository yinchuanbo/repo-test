var TOOL_API =
  location.host.includes("vidqu.ai") && !location.host.includes("test")
    ? "https://tool-api.vidqu.ai/"
    : "https://tool-api-test.vidqu.ai/";
let attractivenessObj;
const textContentObj = jsonData.aiAttractivenessTest.javascript;
function getMultiText(name, valData = {}, bool = false) {
  let str = textContentObj[name];
  for (let key in valData) {
    const regex = new RegExp(`{{${key}}}`, "g");
    str = str.replace(regex, valData[key]);
  }
  // console.log(str)
  return str;
}

function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

function setTextContentObj(name, valData = {}) {
  let str = textContentObj[name];
  for (let key in valData) {
    const regex = new RegExp(`{{${key}}}`, "g");
    str = str.replace(regex, valData[key]);
  }
  // console.log(str)
  return str;
}

// PUT方法封装
var fetchPut = function (url, data, headers = {}) {
  return new Promise((resolve, reject) => {
    fetch(url, {
      method: "PUT",
      headers,
      body: data,
    })
      .then((response) => {
        if (response.status === 200) {
          resolve(response.status)
        } else {
          reject('image upload failed in put!');
        }
      })
      .catch((err) => reject(err));
  });
};

// POST方法封装
var fetchPost = (url, data, headers = {}) => {
  return new Promise((resolve, reject) => {
    fetch(TOOL_API + url, {
      method: "POST",
      headers: {
        ...{
          "Content-Type": "application/json",
          "Request-Origin": "vidqu",
          "Request-language": "de",
          Authorization: "Bearer " + getCookie("access_token") || "",
        },
        ...headers,
      },
      body: JSON.stringify(data),
    })
      .then((response) => resolve(response.json()))
      .catch((err) => reject(err));
  });
};

function parseStr(str = "") {
  try {
    return JSON.parse(str);
  } catch (error) {
    return str;
  }
}

// GET方法封装
var fetchGet = function (url, headers = {}) {
  return new Promise((resolve, reject) => {
    fetch(TOOL_API + url, {
      method: "GET",
      headers: {
        ...{
          "Content-Type": "application/json",
          "Request-Origin": "vidqu",
          "Request-language": "de",
          Authorization: "Bearer " + getCookie("access_token") || "",
        },
        ...headers,
      },
    })
      .then((response) => resolve(response.json()))
      .catch((err) => reject(err));
  });
};

var photo_task_id = null;
var canMultiFaceData = {};
var userRuleConfig = {}

class Attractiveness {
  constructor(options) {
    // var that = this;
    Object.setPrototypeOf(Attractiveness.prototype, this.data());
    const proxyData = this.data().proxyData;
    Object.setPrototypeOf(Attractiveness.prototype.form, this.form(proxyData));
  }
  // 需要用到的参数
  data() {
    return {
      mergeImg: {
        width: 0,
        height: 0,
      },
      proxyData: {
        originImage: null,
        firstPicLoading: false,
        formdata: {
          is_fun: 1,
          is_smartness: 2,
          is_confidence: 1,
          is_attractiveness: 1,
          is_trustworthiness: 2,
          is_approachability: 2,
        },
      },
      isInitFace: false,
      imgSize: 0,
      imgWidth: 0,
      imgHeight: 0,
      tryCount: 0,
      multipleIndex: null,
      multicountryConfig: {},
      finalImage: {
        finalImageUrl: null,
        finalImageKey: null,
      },
      isDemo: null,
      attractiveList: [],
      delay: 2000,
      lastCall: 0,
      taskid: null,
      imgList: [],
      showurl: null,
      mergeImgUrl: null, // 当前合成图片的路径
      mergeKey: null, // 当前合成图片的key
      changeFaceLoading: false, // 换脸的加载boolean
      canMultiFaceData: {}, // 是否可以换脸
      showCreditBannerBool: true,
      itemLoading: [],
      result6list: [],
      showObject: [
        "Fun",
        "Smartness",
        "Confidence",
        "Trustworthiness",
        "Attractiveness",
        "Approachability",
      ], // 6项打分映射字段
      resultData: {}
    };
  }
  // 需要双向绑定的参数
  form(proxyData) {
    const that = this;
    return new Proxy(proxyData, {
      set(target, prop, value) {
        target[prop] = value;
        // 控制originimage元素的显示和隐藏
        if (target["originImage"]) {
          that.handleOriginImageExist();
        } else {
          $(".multi_upload_before").show();
          $(".multi_upload_after").hide();
          $(".change_multi_face_btn").addClass("disabled");
        }
        // 大图loading
        if (!target["firstPicLoading"]) {
          $(".multi_Input").removeClass("disabled");
        } else {
          $(".multi_Input").addClass("disabled");
        }
        // 控制attractive复选框状态
        if (target["formdata"]) {
          for (const [key, val] of Object.entries(value)) {
            if (val == 1) {
              $(`#${key}`).addClass("active");
            } else {
              $(`#${key}`).removeClass("active");
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

  // 初始化检测脸数的方法
  initFace = async () => {
    var MODEL_URL = "/dist/js/weights";
    const res = await faceapi.loadTinyFaceDetectorModel(MODEL_URL);
    await faceapi.loadSsdMobilenetv1Model(MODEL_URL);
    this.isInitFace = true
    // await faceapi.loadSsdMobilenetv1Model(MODEL_URL);
  };

  // 获取上传文件地址
  getUploadFileUrl = (suffix, url = "temp") => {
    let type = suffix;
    try {
      type = suffix.split("/")[1] || "png";
    } catch (e) {
      type = "png";
    }
    return fetchPost(`ai/source/${url}-upload-url`,
      {
        file_name: "Vidnoz_AI_Attractiveness_Test." + type,
      },
    );
  };

  // 通过上传地址传递文件
  uploadFile = ({ url, file }) => {
    return new Promise(async (resolve, reject) => {
      try {
        var res = await fetchPut(url, file);
        resolve(res);
      } catch (e) {
        console.error(e.message);
        reject(e);
      }
    });
  };

  handleOriginImageExist() {
    $(".multi_upload_before").hide();
    $(".multi_upload_after").show();
    $(".people_recognized_box").show();
    $(".change_multi_face_btn").removeClass("disabled");
  }

  // 添加图片
  async addImage({ addData = {}, file, callback, ourPicsIndex = null }) {
    // let { e, demoKey, demoSrc } = data;
    const that = this;
    const demoKey = addData?.demoKey || undefined;
    $(".change_multi_face_btn").addClass("disabled")
    this.setFirstStart(true);
    if (typeof file !== "string" && !this.checkFileType(file)) {
      return;
    }
    if ((file.size > 100 * 1024 * 1024) && isMobileDevice()) {
      ToolTip({
        type: "error",
        title: textContentObj.processImageTitle,
        content: textContentObj.toolarge,
        btn: textContentObj.ok,
      });
      this.setFirstStart(false);
      $(".multi_uploader_multi")[0].value = "";
      return;
    }
    try {
      this.setLiLoading(true);
      // 文件类型的图片需要人脸检查
      if (typeof file !== "string") {
        var result = await this.checkFacePicMulti(file);
        if (result !== 1) {
          $(".multi_uploader_multi")[0].value = "";
          this.setFirstStart(false);
          this.setLiLoading(false);
          this.showModalAboutFaceNumber(result);
          return;
        }
      }
      this.showToolBtn(false);
      $(".change_multi_face_btn").addClass("disabled");
      $(".img_url").show();
      $("#final_img_url").hide();
      let finalFile,
        showUrl,
        imageType,
        suffix = file.type;
      if (demoKey) {
        // 处理类型是网络地址的图片
        finalFile = addData.demoSrc;
        showUrl = addData.demoSrc;
        this.showurl = showUrl;
        this.isDemo = {
          url: showUrl,
          key: demoKey
        }
      } else {
        gtag("event", "upload_attracttest_img");
        // 处理类型是文件类型的图片
        var { blog, imgType } = await this.resizeImageByFile(file);
        finalFile = blog;
        imageType = imgType;
        showUrl = URL.createObjectURL(finalFile);
        this.showurl = finalFile;
        this.isDemo = null;
      }
      var data = { file: finalFile, showUrl, suffix, demoKey };
      this.setLiLoading(false);
      $("#main_final_img").attr("src", showUrl);
      $(".change_multi_face_btn").removeClass("disabled")
      callback && callback(data, imageType, ourPicsIndex);
    } catch (err) {
      console.error(err);
      ToolTip({
        type: "error",
        title: textContentObj.errorUploadTitle,
        content: textContentObj.errorUpload,
        btn: textContentObj.ok,
      });
      $(".multi_uploader_multi")[0].value = "";
      this.setFirstStart(false);
      this.setLiLoading(false);
    }
  }

  // 设置开始换脸的loading
  setLoadingStart(flag) {
    if (flag) {
      this.setFirstStart(true);
      $("#final_img_url").hide();
      $(".img_url").show();
      $(".change_multi_face_btn ._multi_step3_btn").text(
        textContentObj.swapping
      );
      $(".multi-generating-animate").show();
      this.changeFaceLoading = true;
      $("#main_face_change_img").attr("style", "filter: blur(5px)");
      $(".change_multi_face_btn").addClass("disabled");
      this.setLiLoading(true);
      $(".loading_multi_box p").text(getMultiText("Loading2"));
      $(".loading_multi_box").show();
      $(".loading_multi_box").find('.imgloading').hide()
      $(".loading_multi_box").find('.submitLoadingbox').show()
      $(".people_recognized_list").addClass("inter_loading");
      $(".step2").addClass("loading");
      $(".multi_upload").addClass("loading_mask");
    } else {
      this.setFirstStart(false);
      $(".change_multi_face_btn ._multi_step3_btn").text(
        textContentObj.step3_btn
      );
      $(".multi-generating-animate").hide();
      $(".change_multi_face_btn").removeClass("disabled");
      this.changeFaceLoading = false;
      this.setLiLoading(false);
      // $(".multi_pics li").attr("style", "")
      $("#main_face_change_img").attr("style", "");
      $(".loading_multi_box").hide();
      $(".people_recognized_list").removeClass("inter_loading");
      $(".step2").removeClass("loading");
      $(".multi_upload").removeClass("loading_mask");
    }
  }

  setLiLoading = (flag) => {
    if (flag) {
      $(".multi_pics li").attr(
        "style",
        "filter: blur(3px);pointer-events: none;"
      );
    } else {
      $(".multi_pics li").attr("style", "");
    }
  };

  // 设置大图loading
  setBigImageStart = (flag) => {
    if (flag) {
      $("#main_face_change_img").attr("style", "filter: blur(5px)");
      $(".loading_multi_box p").text(textContentObj.multiLoading);
      $(".loading_multi_box").show();
      $(".loading_multi_box").find('.imgloading').show()
      $(".loading_multi_box").find('.submitLoadingbox').hide()
    } else {
      $("#main_face_change_img").attr("style", "");
      $(".loading_multi_box").hide();
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
      $(".multi_upload_before .multi_uploader_btn").attr('style', 'background-color: #281FAE !important;');
      $(".multi_upload_before").addClass("loading");
      $(".multi_upload_after").addClass("loading");
      $(".multi_Input").addClass("disabled");
      $(".multi_Input .multi_uploader_btn_con").hide();
      $(".multi_Input .multi_uploader_btn_loading").show();
      $(".multi_uploader_btn .multi_uploader_btn_con").hide();
      $(".multi_uploader_btn .multi_uploader_btn_loading").show();
      $(".people_recognized_list").addClass("inter_loading");
      $(".multi_upload_before").find(".divImgback").hide();
      this.form.firstPicLoading = true;
      this.setBigImageStart(true);
    } else {
      $(".multi_upload_before").removeClass("loading");
      $(".multi_upload_after").removeClass("loading");
      $(".multi_Input").removeClass("disabled");
      $(".multi_Input .multi_uploader_btn_con").show();
      $(".multi_Input .multi_uploader_btn_loading").hide();
      $(".multi_uploader_btn .multi_uploader_btn_loading").hide();
      $(".multi_uploader_btn .multi_uploader_btn_con").show();
      $(".people_recognized_list").removeClass("inter_loading");
      $(".multi_upload_before").find(".divImgback").show();
      this.form.firstPicLoading = false;
      this.setBigImageStart(false);
    }
  };

  // 显示结果
  setFinalresult = function (data) {
    const that = this;
    $(".img_url").hide();
    const demoData = data || {
      key: "demo/user_id/20230629/649d5d969d11f.png",
      url: "",
      face_score: 60,
      age: 18,
      Fun: 70,
      Smartness: 70,
      Confidence: 60,
      Attractiveness: 50,
      Trustworthiness: 50,
      Approachability: 90,
    };
    if (demoData?.url) {
      $("#main_final_img").attr("src", demoData.url)
    }
    if (isMobileDevice()) {
      $("#score_prograss").hide();
      $("#score_prograss_m").show();
    } else {
      $("#score_prograss_m").hide();
      $("#score_prograss").show();
    }
    // 设置6项打分
    this.setScoreList(demoData);
    this.setEvaluates();
    // 设置face_score动画
    this.playAnime(demoData);
    $(".final_img_url").css("display", "flex");
    $(".change_multi_face_btn").addClass("disabled");
    if (getCookie("user_info") && parseStr(getCookie("user_info"))?.usertype === "vip") {
      $("#water_marker").hide();
    }
    setTimeout(async () => {
      try {
        await that.loadImage(demoData.url);
        const final_img_url = document.getElementById("final_img_url");
        $("#final_img_url_large").html(final_img_url.cloneNode(true))
        // 截图上传 特殊处理
        html2canvas(final_img_url, {
          useCORS: true,
          scale: 2,
          backgroundColor: "Transparent"
        }).then(async function (canvas) {
          const url = canvas.toDataURL();
          const blob = await that.transtoBlob({
            b64data: url,
            contentType: "image/png",
          })
          const { data } = await that.uploadImagePromise(blob, 'get');
          that.finalImage = {
            finalImageKey: data.key,
            finalImageUrl: data.access_url
          };
          const imgdata = await computedParams(that.finalImage.finalImageUrl);
          that.imgSize = imgdata.imgSize
          that.imgWidth = imgdata.imgWidth
          that.imgHeight = imgdata.imgHeight
          that.showToolBtn(true);
          that.setLoadingStart(false);
        }).catch(err => {
          console.error(err);
          let processImage = textContentObj.processImage;
          ToolTip({
            type: "error",
            title: textContentObj.processImageTitle,
            content: processImage,
            btn: textContentObj.ok,
          });
          $(".change_multi_face_btn").removeClass("disabled");
          that.setFirstStart(false);
          that.setLoadingStart(false);
        })
      } catch (err) {
        console.error(err.message);
        let processImage = textContentObj.processImage;
        ToolTip({
          type: "error",
          title: textContentObj.processImageTitle,
          content: processImage,
          btn: textContentObj.ok,
        });
        $(".change_multi_face_btn").removeClass("disabled");
        that.setFirstStart(false);
        that.setLoadingStart(false);
      }
    }, 2000);
  };

  loadImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.crossOrigin = "Anonymous";

      img.onload = () => {
        resolve(img);
      };

      img.onerror = function () {
        const msg = "Image load error: " + url;

        reject(new Error(msg));
      };

      img.src = url;
    });
  };
  svgToPng = async (image64) => {
    const image = await this.loadImage(image64);
    return this.imageToPng(image);
  };
  imageToPng = (image) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = image.width * 2;
    canvas.height = image.height * 2;
    ctx.drawImage(image, 0, 0, image.width * 2, image.height * 2);
    return canvas.toDataURL("image/png", 1);
  };

  // 测试操作
  startTest = async () => {
    const that = this;
    if (this.changeFaceLoading) {
      return;
    }
    this.setLoadingStart(true);
    this.showToolBtn(false);
    let data = {}
    try {
      if (typeof that.showurl == "string" && that.isDemo) {
        data = that.isDemo;
      } else {
        const resdata = await this.uploadImagePromise(that.showurl);
        data = resdata.data
      }
    } catch (err) {
      ToolTip({
        type: "error",
        title: textContentObj.processImageTitle,
        content: textContentObj.failed_des11,
        btn: textContentObj.ok,
      });
      this.setLoadingStart(false);
    }
    // this.showToolBtn(false);
    fetchPost(
      "ai/ai-tool/add-task",
      {
        param: {
          ...that.form.formdata,
          key: data.key,
        },
        action: "ai_attractiveness_test",
      },
      {
        "X-TASK-VERSION": "2.0.0",
      }
    )
      .then(async (res) => {
        // this.taskid = res.data.task_id;
        // return;
        if (res.code === 200) {
          this.getFinalImg(res.data.task_id);
        } else if (res.code === 401) {
          ToolTip({
            type: "error",
            content: textContentObj.loginFirst,
            btn: textContentObj.ok,
          });
          this.setLoadingStart(false);
        } else if (res.code === 3002) {
          // if (this.finalImage.finalImageKey) {
          //   this.showToolBtn(true, true);
          //   $("#final_img_url").attr("style", "display: flex");
          //   $(".img_url").hide();
          // }
          that.showMaximum();
          this.setLoadingStart(false);
          this.setLiLoading(false);
          let imgUrl = $("#multi_img").attr('src')
          $('.main_face_change_img').attr('src', imgUrl)
        } else {
          ToolTip({
            type: "error",
            title: textContentObj.errorUploadTitle,
            content: textContentObj.errorUpload,
            btn: textContentObj.ok,
          });
          this.setLoadingStart(false);
        }
      })
      .catch((err) => {
        console.error(err);
        ToolTip({
          type: "error",
          title: textContentObj.errorUploadTitle,
          content: textContentObj.errorUpload,
          btn: textContentObj.ok,
        });
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

    if (!allowedTypes.includes(fileType)) {
      ToolTip({
        type: "error",
        title: textContentObj.processImageTitle,
        content: textContentObj.limit,
        btn: textContentObj.ok,
      });
      this.setBigImageStart(false);
      this.setFirstStart(false);
      // $('.multi_uploader_btn_con').text(jsonData.aiAttractivenessTest.click_upload)
      return false;
    }
    return true;
  };

  showToolBtn(flag) {
    if (flag) {
      var computedStyle = window.getComputedStyle(
        document.querySelector("#main_face_change_img")
      );
      this.mergeImg = {
        width: computedStyle.getPropertyValue("width").split("px")[0],
        height: computedStyle.getPropertyValue("height").split("px")[0],
      };
      $(".multi_img_btns").attr(
        "style",
        `width: ${this.mergeImg.width > 600 ? 600 : this.mergeImg.width
        }px; display: flex;`
      );
      // if (!notShowImage) {
      //   $("#main_face_change_img").attr("src", this.mergeImgUrl);
      // }
    } else {
      $(".multi_img_btns").hide();
    }
  }

  // 轮询获取最后成功的图片（2秒一次）
  getFinalImg = (id) => {
    const that = this;
    this.showToolBtn(false);
    this.setLoadingStart(true);
    this.taskid = id;
    fetchPost(
      `ai/tool/get-task`,
      {
        id,
      }
    )
      .then((res) => {
        if (res.message.includes("face=0")) {
          ToolTip({
            type: "error",
            title: textContentObj.processImageTitle,
            content: textContentObj.NoFaceMulti,
            btn: textContentObj.ok,
          });
          this.setLoadingStart(false);
          return;
        }
        if (res.message.includes("face>1")) {
          ToolTip({
            type: "error",
            title: textContentObj.processImageTitle,
            content: textContentObj.manyFace,
            btn: textContentObj.ok,
          });
          this.setLoadingStart(false);
          return;
        }
        if (res.code !== 200) {
          let processImage = textContentObj.processImage;
          ToolTip({
            type: "error",
            title: textContentObj.processImageTitle,
            content: processImage,
            btn: textContentObj.ok,
          });
          this.setLoadingStart(false);
        } else {
          this.tryCount = 0;
          if (res.data.status === 0) {
            // this.mergeImgUrl = res.data.additional_data?.merge_url;
            this.setFinalresult(res.data.additional_data);
            // $("#main_face_change_img").attr("data-key", "");
            // $("#main_face_change_img").attr("src", this.mergeImgUrl);
            gtag("event", "succ_attracttest_btn");
          } else {
            setTimeout(() => {
              this.getFinalImg(id);
            }, 3000);
          }
        }
      })
      .catch((err) => {
        console.error(err);
        if (this.tryCount >= 3) {
          ToolTip({
            type: "error",
            title: textContentObj.errorUploadTitle,
            content: textContentObj.errorUpload,
            btn: textContentObj.ok,
          });
          this.setLoadingStart(false);
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
      Img.onerror = async (error) => {
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
        var result = await this.faceCheck({ blobUrl });
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  };

  // 关于脸检测数量的弹窗
  showModalAboutFaceNumber = (result) => {
    $(".multi_uploader_multi")[0].value = "";
    let word = textContentObj.NoFaceMulti;
    if (result && result > 1) {
      word = textContentObj.manyFace;
    }
    ToolTip({
      type: "error",
      title: textContentObj.processImageTitle,
      content: word,
      btn: textContentObj.ok,
    });
  };

  // 上传文件类型图片流程
  uploadImagePromise(file, url) {
    return new Promise(async (resolve, reject) => {
      try {
        var res = await this.getUploadFileUrl(file.type, url);
        this.uploadFile({ url: res.data.upload_url, file })
          .then((res1) => {
            resolve({ data: res.data });
          })
          .catch((err) => reject(err));

      } catch (err) {
        console.log(err);
        reject(err)
      }
    });
  }

  getSourceUrl(key) {
    return jqAjaxPromise(`ai/source/get-access-url`, {
      key,
      file_name: "Vidnoz_AI_Attractiveness_Test.png",
    },
    );
  }

  setDragLoading(classname, flag) {
    if (flag) {
      $(`.${classname} .other_box`).addClass("blur");
      $(`.${classname} .drag_loadbox`).show();
    } else {
      $(`.${classname} .other_box`).removeClass("blur");
      $(`.${classname} .drag_loadbox`).hide();
    }
  }
  // 渲染特征复选框列表
  setAttractiveList() {
    let html = "";
    this.attractiveList.forEach((e) => {
      html += `
        <div class="test_item ${e.is_default === 1 ? "active" : ""}" id="${e.key
        }" key="${e.key}">
          <block class="choose_checkbox"><i class="go_right"></i></block>
          ${e.name}
        </div>
      `;
    });
    $(".test_box").html(html);
    $(".step").removeClass("loading");
    this.bindAttractiveCheckbox();
  }

  // 渲染评分各项列表
  setScoreList(data) {
    let html = "";
    this.result6list = [];
    for (const item of this.showObject) {
      if (data[item] > 0) {
        this.result6list.push({ name: item, value: data[item] });
      }
    }
    this.result6list.forEach((e) => {
      html += `
        <li>
          <p>${getMultiText(e.name)}</p>
          <div class="score_li_prograss">
            <div class="score_li_prograss_con" id="${e.name}">
              <span>${e.value}%</span>
            </div>
          </div>
        </li>
      `;
    });
    // if (this.result6list.length <= 3) {
    //   $("#score_ul").addClass("one_col");
    // } else {
    //   $("#score_ul").removeClass("one_col");
    // }
    $("#score_ul").html(html);
  }

  // 绑定特征复选框事件
  bindAttractiveCheckbox() {
    const that = this;
    $(".test_item").each(function () {
      $(this).on("click", function () {
        const id = $(this).attr("id");
        const key = $(this).attr("key");
        const lowid = id.toLowerCase().split("is_")?.[1];
        gtag("event", `${lowid}_attracttest_test`);
        const form = that.form.formdata;
        const len = Object.values(form).filter((e) => e == 1).length;
        if (form[key] == 1) {
          // 保证至少存在一个选中
          if (len <= 1) return;
          form[key] = 2;
          that.form.formdata = form;
        } else {
          form[key] = 1;
          that.form.formdata = form;
        }
      });
    });
  }

  // 播放动画
  playAnime(data) {
    const score = data.face_score;
    const age = data.age;
    const circle = $(".circle_prograss");
    const circleText = $(".test_score span");
    const age_prediction = $(".age_prediction span");
    let start = 0;
    let num = (score / 100) * 190;
    // 半圆进度动画
    // const timer = setInterval(() => {
    //   if (start > num) {
    //     clearInterval(timer);
    //   }
    //   start++;
    // }, 10);
    circle.attr(`stroke-dasharray`, `${num} 190`);
    // 数字升起动画
    // const timer2 = setInterval(() => {
    //   start++;
    //   circleText.text(start);
    //   if (start >= score) {
    //     clearInterval(timer2);
    //   }
    // }, 10);
    circleText.text(score);
    // 年龄升起动画
    // const timer3 = setInterval(() => {
    //   start++;
    //   if (start >= age) {
    //     clearInterval(timer3);
    //   }
    // }, 10);
    age_prediction.text(age);
    // 6项打分动画
    this.result6list.forEach((el) => {
      $(`#${el.name}`).css("width", `${el.value}%`);
    });
  }

  // 设置评语
  setEvaluates() {
    const evaluates = getMultiText("evaluates");
    const list = [...this.result6list];
    list.sort(function (a, b) {
      return b.value - a.value;
    });
    const max = list[0];
    const len = list.filter((el) => el.value === max); // 最大项的个数
    const randomIcon = this.getRandomNum(1, 29); // 随即图标
    let randomtext = this.getRandomNum(1, 10); // 随即图标

    let maxItem = list.find((el) => el.name === max.name); // 最大项的名称

    if (len > 1) {
      randomtext = this.getRandomNum(1, 50); // 随即图标
    }

    $(".face_score_text").html(`
      ${evaluates[`${maxItem.name}${randomtext}`]}
      <img src="/dist/img/ai-attractiveness-test/icon/icon${randomIcon}.svg" />
    `);
  }

  getRandomNum = (Min, Max) => {
    const Range = Max - Min + 1;
    const Rand = Math.random();
    return Min + Math.floor(Rand * Range);
  };

  // 获取配置参数
  getPublicOptions() {
    const that = this;
    fetchGet("ai/public/options?type=ai-attractiveness-test&country=de").then(res => {
      that.attractiveList = res.data.test_type;
      that.imgList = res.data.demos_vidqu;
      $(".multi_pics").html("");
      $(".multi_pics").addClass("img9_show");
      // if (that.imgList.length <= 4) {
      $(".see_more_multi").hide();
      $(".fold_multi").hide();
      // }
      res.data.demos_vidqu.forEach((face, index) => {
        $(".multi_pics").append(`
          <li>
            <img src="${face.image_url}" data-key="${face.key}" data-index="${index + 1
          }" />
          </li>
        `);
      });
      // 官方示例图片点击更换
      $(".multi_pics li").each(function () {
        $(this).on("click", (e) => {
          gtag("event", "select_attracttest_photo");
          var src = $(this).find("img").attr("src");
          var demoKey = $(this).find("img").attr("data-key");
          if (!src || that.changeFaceLoading) {
            return;
          }
          that.showToolBtn(false);
          that.addImage({
            addData: {
              demoKey,
              demoSrc: src,
            },
            file: src,
            callback: (data, imageType, ourPicsIndex) => {
              that.setFirstStart(false);
              var otherType = imageType === "width" ? "height" : "width";
              $("#main_face_change_img").attr("data-key", "multi_img");
              $(".multi_img")
                .find("img")
                .attr("src", data.showUrl)
                .removeClass(otherType)
                .addClass(`${imageType}`);
              that.form.originImage = data;
              $("#main_face_change_img").attr("src", data.showUrl);
              // this.setFirstStart(false);
              if (!ourPicsIndex) {
                $("#multi_img").attr("data-index", null);
              }
              if (ourPicsIndex) {
                $("#multi_img").attr("data-index", ourPicsIndex);
              }
            },
            ourPicsIndex: $(this).index() + 1,
          });
        });
      });
      that.setAttractiveList()
    })
  }

  // 最大限制弹窗
  showMaximum() {
    let title = getMultiText("Model_Maximum_title");
    gtag("event", "alert_attracttest_maxlimit")
    let spanHtml = getMultiText(
      "exceed",
      {
        val: userRuleConfig?.countrycode === 'T1' ? 5 : userRuleConfig?.countrycode === 'T2' ? 5 : 3,
      },
      true
    );
    ToolTip({
      type: "error",
      title,
      content: spanHtml,
      btn: textContentObj.ok,
    });
  }
}

function getCountryConfig(message) {
  return new Promise((resolve, reject) => {
    fetchPost(
      // "ai/tool/video-facechanging-country-code",
      "ai/tool/videoface-user",
      {},
    ).then(res => {
      if (res.code === 200) {
        resolve(res.data);
      } else {
        reject(res);
      }
    })
  })
}

var createMultiDialog = (src, attractiveness) => {
  $("#large_multi_face_modal .large_multi_img").attr("src", src);
  if (attractiveness.mergeImg.width > attractiveness.mergeImg.height) {
    $("#large_multi_face_modal .large_multi_img")
      .removeClass("height")
      .addClass("width");
  } else {
    $("#large_multi_face_modal .large_multi_img")
      .removeClass("width")
      .addClass("height");
  }
  // var element = document.querySelector(".large_multi_img");
  // var style = window.getComputedStyle(element);
  // var width = parseFloat(style.width) || 600;
  $("#large_multi_face_modal .multi_img_btns").attr(
    "style",
    `width: 800px; display: flex;justify-content: flex-end;`
  );
  // $("#large_multi_face_modal").find(".removeWatemark_btn").hide();
  $("#large_multi_face_modal").attr("style", "display: flex");
};

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

function computedParams(url) {
  return new Promise(async (resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'blob';

    xhr.onload = function () {
      if (xhr.status === 200) {
        const blob = xhr.response;
        const reader = new FileReader();
        reader.onload = function () {
          let computedImg = new Image();
          computedImg.crossOrigin = "Anonymous"
          computedImg.src = url;
          computedImg.onload = function () {
            const imgWidth = computedImg.width;
            const imgHeight = computedImg.height;
            const arrayBuffer = reader.result;
            const sizeInBytes = arrayBuffer.byteLength;
            const sizeInKb = sizeInBytes
            computedImg = null;
            resolve({ imgSize: sizeInKb, imgWidth, imgHeight });
          }
        };
        reader.onerror = function () {
          reject(new Error('Failed to read image data'));
        };
        reader.readAsArrayBuffer(blob);
      } else {
        reject(new Error('Failed to load image'));
      }
    };

    xhr.onerror = function () {
      reject(new Error('Failed to load image'));
    };

    xhr.send();
  })
}

(function () {
  let btnLoading1 = false;
  window.attractiveness = new Attractiveness();
  attractivenessObj = attractiveness
  $(document).ready(function () {
    gtag("event", "open_attracttest_page");
    attractiveness.getPublicOptions();
    // attractiveness.setFinalresult();
    getCountryConfig().then(config => {
      userRuleConfig = config;
    })
    attractiveness.initFace()
    const appsigninbtn = $(".appsigninbtn");
    const signupfootbtn = $(".signupfootbtn");
    const appsignupbtn = $(".signupnavbtn");
    const appsignupbtn2 = $(".appsignupbtn");
    appsigninbtn.attr("product-position", "isTool-no-reloading");
    appsignupbtn.attr("product-position", "isTool-no-reloading");
    appsignupbtn2.attr("product-position", "isTool-no-reloading");
    appsigninbtn.on("click", function () {
      gtag("event", "login_attracttest_header");
    });
    appsignupbtn.on("click", function () {
      gtag("event", "signup_attracttest_header");
    });
    signupfootbtn.attr(
      "onclick",
      `gtag('event', 'signup_attracttest_footer');`
    );
    $(".multi_uploader_btn").on("click", function (e) {
      e.stopPropagation();
      $(".multi_uploader_multi").click();
    });

    $(".upload_step").on("dragover", function (e) {
      e.preventDefault(); // 阻止默认行为
    });

    $(".multi_upload").on("dragenter", function (e) {
      // $('.multi_uploader_btn_con').text(jsonData.aiAttractivenessTest.DragText)
      e.preventDefault(); // 阻止默认行为
      if (attractiveness.proxyData.originImage) return;
      // if (e.target.className.includes("multi_upload") || e.target.className.includes("mask1")) return;
      attractiveness.setDragLoading("multi_upload", true);
      attractiveness.setDragLoading("change_upload", false);
    });

    $(".multi_upload .drag_loadbox").on("dragleave", function (e) {
      // $('.multi_uploader_btn_con').text(jsonData.aiAttractivenessTest.click_upload)
      // if (e.relatedTarget.className.includes("multi_upload") || e.relatedTarget.className.includes("mask1")) return;
      attractiveness.setDragLoading("multi_upload", false);
    });

    $(".change_upload").on("dragenter", function (e) {
      e.preventDefault(); // 阻止默认行为
      if (attractiveness.proxyData.originImage) return;
      // if (e.target.className.includes("change_upload") || e.target.className.includes("mask2")) return;
      attractiveness.setDragLoading("change_upload", true);
      attractiveness.setDragLoading("multi_upload", false);
    });

    $(".change_upload .drag_loadbox").on("dragleave", function (e) {
      // if (e.relatedTarget.className.includes("change_upload") || e.relatedTarget.className.includes("mask2")) return;
      attractiveness.setDragLoading("change_upload", false);
    });

    $("#large_multi_face_modal").on("wheel", function (e) {
      e.preventDefault(); // 阻止默认行为
    });

    // 第一张点击上传
    $(".multi_uploader_multi").on("change", async function (e) {
      if (!e.target.files || !e.target.files[0]) {
        return;
      }
      $('.multi_uploader_btn').css('background', '#281FAE !important')
      if (!attractiveness.isInitFace) {
        await attractiveness.initFace();
      }
      var file = e.target.files[0];
      var el = $(this)[0];
      attractiveness.addImage({
        file,
        callback: (data, imageType, ourPicsIndex) => {
          el.value = "";
          attractiveness.setFirstStart(false);
          attractiveness.showToolBtn(false);
          let otherType = imageType === "width" ? "height" : "width";
          $("#main_face_change_img").attr("data-key", "multi_img");
          $(".multi_img")
            .find("img")
            .attr("src", data.showUrl)
            .removeClass(otherType)
            .addClass(`${imageType}`);
          attractiveness.form.originImage = data;
          $("#main_face_change_img").attr("src", data.showUrl);
          // this.setFirstStart(false);
          if (!ourPicsIndex) {
            $("#multi_img").attr("data-index", null);
          }
        },
      });
    });

    // 第一张拖拽上传
    $(".multi_upload .uploader_loading_mask, .multi_Input").on(
      "drop",
      function (e) {
        e.preventDefault();
        setDragStatus(false);
        attractiveness.setDragLoading("multi_upload", false);
        if (attractiveness.form.firstPicLoading) {
          return;
        }
        var file = e.originalEvent.dataTransfer.files[0];
        attractiveness.addImage({
          file,
          callback: (data, imageType, ourPicsIndex) => {
            attractiveness.setFirstStart(false);
            attractiveness.showToolBtn(false);
            let otherType = imageType === "width" ? "height" : "width";
            $("#main_face_change_img").attr("data-key", "multi_img");
            $(".multi_img")
              .find("img")
              .attr("src", data.showUrl)
              .removeClass(otherType)
              .addClass(`${imageType}`);
            attractiveness.form.originImage = data;
            $("#main_face_change_img").attr("src", data.showUrl);
            // this.setFirstStart(false);
            if (!ourPicsIndex) {
              $("#multi_img").attr("data-index", null);
            }
          },
        });
      }
    );

    // 第一张更改上传
    $(".multi_Input").on("click", function (e) {
      e.stopPropagation();
      if (btnLoading1) {
        return;
      }
      btnLoading1 = true;
      setTimeout(() => {
        btnLoading1 = false;
      }, 2000);
      $(".multi_uploader_multi").click();
    });

    $(".multi_Input")
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

    function setDragStatus(flag) {
      if (!flag) {
        $(".multi_Input").removeClass("draggable");
        $(".multi_Input").find("svg").show();
        $(".multi_Input")
          .find(".change_image_text")
          .text(getMultiText("change_btn"));
      } else {
        $(".multi_Input").addClass("draggable");
        $(".multi_Input").find("svg").hide();
        $(".multi_Input")
          .find(".change_image_text")
          .text(getMultiText("drag_btn"));
      }
    }

    // 对比按下显示原图
    $(".compare_multi_btn").on("pointerdown", function (e) {
      e.preventDefault();
      if (attractiveness.changeFaceLoading) {
        return;
      }
      if (e.button === 2) {
        return;
      }
      // this.setPointerCapture(e.pointerId);
      if (attractiveness.form?.originImage?.showUrl) {
        $("#main_face_change_img").attr(
          "src",
          attractiveness.form?.originImage.showUrl
          // "https://pic3.zhimg.com/v2-36b1e06bfc2b8abb7748337b859bcd8c_b.jpg"
        );
        $("#large_multi_face_modal .large_multi_img").attr(
          "src",
          attractiveness.form?.originImage.showUrl
        );
      }

      document.addEventListener("pointerup", function (e) {
        if ($("#main_face_change_img").attr("data-key")) return;
        stopCompare(e);
      });
    });

    // $(".compare_multi_btn").on("touchstart", (event) => {
    //   // 处理触摸移动事件
    //   console.log("touchstart", event)
    // });

    $(".share_multi_btn").on("click", (event) => {
      // 处理触摸移动事件
      gtag("event", "share_attracttest_res");
      let shareDialogEl = document.querySelector("#shareDialogEl");
      function genBtoaUrl(obj = {}) {
        const src = `${attractiveness.taskid},${obj?.img_key || attractiveness.finalImage.finalImageKey},en,get`;
        return btoa(src);
      }
      shareDialogEl.changeTips({
        title: textContentObj.share__Tile,
        content: getMultiText("share__box__text"),
      });
      function backParams() {
        return {
          id: attractiveness.taskid,
          key: attractiveness.finalImage.finalImageKey,
        };
      }
      shareDialogEl.showShare({
        url: attractiveness.finalImage.finalImageUrl,
        action: "aiattractivenesstestshare",
        imageKey: attractiveness.finalImage.finalImageKey,
        text: getMultiText("share__text"),
        title: textContentObj.share__Tile,
        id: attractiveness.taskid,
        task_id: attractiveness.taskid,
        btoaUrl: btoa(attractiveness.finalImage.finalImageKey + "," + getPreferredLanguage()),
        // genBtoaUrl,
        backParams
      });
    });

    $(".compare_multi_btn").on("pointerleave", (e) => {
      // 处理触摸移动事件
      stopCompare(e);
    });

    // 对比弹起显示原图
    const stopCompare = function (e) {
      e.preventDefault();
      if (attractiveness.changeFaceLoading) {
        return;
      }
      if (e.button === 2) {
        return;
      }
      // this.releasePointerCapture(e.pointerId);
      $("#main_face_change_img").attr("src", attractiveness.mergeImgUrl);
      $("#large_multi_face_modal .large_multi_img").attr(
        "src",
        attractiveness.mergeImgUrl
      );
      document.removeEventListener("pointerup", function (e) {
        stopCompare(e);
      });
    };

    // 禁用鼠标右键菜单
    $("#main_face_change_img").on("contextmenu", (e) => {
      e.originalEvent.preventDefault();
    });
    $("#large_multi_face_modal .large_multi_img width").on(
      "contextmenu",
      (e) => {
        e.originalEvent.preventDefault();
      }
    );
    // 查看大图
    $(".large_multi_image").on("click", function (e) {
      e.preventDefault();

      if (attractiveness.changeFaceLoading) {
        return;
      }
      if (e.button === 2) {
        return;
      }
      createMultiDialog(attractiveness.mergeImgUrl, attractiveness);
    });

    function successFn(url) {
      ToolTip({
        type: "success",
        title: textContentObj.downloadH1,
        content: textContentObj.downloadTips_multi,
        btn: textContentObj.continue,
        clickHereFn: (span) => {
          span.setAttribute("href", url);
          span.click();
          // window.location.href = url;
          setTimeout(() => successFn(url), 300)
        }
      });
    }
    const computedImg = new Image();
    function computedParams(url) {
      return new Promise(async (resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'blob';

        xhr.onload = function () {
          if (xhr.status === 200) {
            const blob = xhr.response;
            const reader = new FileReader();
            reader.onload = function () {
              computedImg.crossOrigin = "Anonymous"
              computedImg.src = url;
              computedImg.onload = function () {
                const imgWidth = computedImg.width;
                const imgHeight = computedImg.height;
                const arrayBuffer = reader.result;
                const sizeInBytes = arrayBuffer.byteLength;
                const sizeInKb = sizeInBytes
                resolve({ imgSize: sizeInKb, imgWidth, imgHeight });
              }
            };
            reader.onerror = function () {
              reject(new Error('Failed to read image data'));
            };
            reader.readAsArrayBuffer(blob);
          } else {
            reject(new Error('Failed to load image'));
          }
        };

        xhr.onerror = function () {
          reject(new Error('Failed to load image'));
        };

        xhr.send();
      })
    }
    async function newDownload() {
      $(".download_multi_btn").addClass('downDisabled')
      // if (downData) {
      //   attractiveness.finalImage.finalImageKey = downData.merge_key;
      // }
      ToolTip({
        type: "progress",
        content: textContentObj.downloading,
        contentClass: "downloading",
      });
      try {
        fetchPost(
          "ai/source/get-access-url",
          {
            key: attractiveness.finalImage.finalImageKey,
            action: "download",
            file_name: "Vidqu_attractivenesstest.png",
          },
        )
          .then(async (res) => {
            if (res.code === 200) {
              const bool = await checkFileExpired(res.data.url);
              if (!bool) {
                ToolTip({
                  type: "error",
                  title: textContentObj.processImageTitle,
                  content: textContentObj.expired_file,
                  btn: textContentObj.ok,
                });
                return;
              }
              let link = document.createElement("a");
              link.href = res.data.url;
              link.download = "Vidqu_attractivenesstest.png";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(link.href);
              successFn(res.data.url)
            } else {
              ToolTip({
                type: "error",
                title: textContentObj.downloadError,
                content: textContentObj.failed_des10,
                btn: textContentObj.ok,
              });
            }
          })
          .catch((error) => {
            console.error(error);
            ToolTip({
              type: "error",
              title: textContentObj.downloadError,
              content: textContentObj.failed_des10,
              btn: textContentObj.ok,
            });
          });
      } catch (e) {
        console.error(e);
        ToolTip({
          type: "error",
          title: textContentObj.downloadError,
          content: textContentObj.failed_des10,
          btn: textContentObj.ok,
        });
      }
    }
    // 下载
    $(".download_multi_btn").on("click", async (e) => {
      e.preventDefault();
      gtag("event", "download_attracttest_res");
      if (attractiveness.changeFaceLoading) {
        return;
      }
      if (e.button === 2) {
        return;
      }
      newDownload()
    });

    var winRef

    $(".click_attractive_me").on("click", function () {
      ToolTip({
        type: "success",
        title: textContentObj.downloadH1,
        content: textContentObj.downloadTips_multi,
        btn: textContentObj.continue,
      });
    });

    $("#change_face_login").on("click", function () {
      window.location.href =
        thGotoApplibraryUrl + "signup?page_name=face-swap&name=ai";
    });

    $(".modal__main_close").on("click", function () {
      $(".vocalRemover__modal").hide();
    });

    // 关闭弹窗
    $(".close_btn").on("click", function () {
      $("#large_multi_face_modal").hide();
      $("#large_multi_face_modal").find(".removeWatemark_btn").show();
    });

    $(".multi_close_btn").on("click", function () {
      $("#large_multi_face_modal").hide();
    });

    // 开始测试验证
    $(".change_multi_face_btn").on("click", function (e) {
      gtag("event", "click_attracttest_btn");
      attractiveness.startTest($(this));
    });

    $(".face_swap_now").on("click", function () {
      scrollToPositions(".ai-change-face");
    });

    $("#multi_uploader").on("change", async function (e) {
      if (!e.target.files || !e.target.files[0]) {
        return;
      }
      attractiveness.itemUploading(e.target.files[0]);
    });
  });
})();

$('.line-wrapper-left-box-item').hover(function (e) {
  $('.line-wrapper-left-box-item').removeClass('active')
  const alt = $(this).attr('data-alt')
  const url = $(this).attr('data-url')
  $(this).addClass('active')
  $('.line-wrapper-right').find('img').attr('src', url).attr('alt', alt)
})

// var certifySwiper = new Swiper('#certify .swiper-container-mycircle', {
//   watchSlidesProgress: true,
//   slidesPerView: 'auto',
//   centeredSlides: true,
//   loop: true,
//   autoplay:true,
//   loopedSlides: 5,
//   navigation: {
//     nextEl: ".swiper-button-next",
//     prevEl: ".swiper-button-prev",
//   },
//   on: {
//     slideChange: function(){

//     },
//     progress: function(progress) {
//       for (let i = 0; i < this.slides.length; i++) {
//         var slide = this.slides.eq(i);
//         var slideProgress = this.slides[i].progress;
//         var modify = 1;
//         if (Math.abs(slideProgress) > 1) {
//           modify = (Math.abs(slideProgress) - 1) * 0.05 + 1;
//         }
//         let translate = slideProgress * modify * 990 + 'px';
//         let scale = 1 - Math.abs(slideProgress) / 8;
//         let zIndex = 999 - Math.abs(Math.round(10 * slideProgress));
//         slide.transform('translateX(' + translate + ') scale(' + scale + ')');
//         slide.css('zIndex', zIndex);
//         slide.css('opacity', 1);
//         if (Math.abs(slideProgress) > 3) {
//           slide.css('opacity', 0);
//         }
//       }
//     },
//     setTransition: function(transition) {
//       for (var i = 0; i < this.slides.length; i++) {
//         var slide = this.slides.eq(i)
//         slide.transition(transition);
//       }

//     }

//   }

// })

$('.wrapper-faq-mob-item-main').click(function () {
  faqHover(this, false)
});

$('.title-p').click(function () {
  faqHover(this, true)
});
const faqHover = (it, isPc) => {
  let parent, desc, icon, main
  isPc ? parent = '.hover-p' : parent = '.wrapper-faq-mob-item'
  isPc ? desc = '.hover-desc' : desc = '.wrapper-faq-mob-item-desc'
  isPc ? icon = '.arrow-img' : icon = '.wrapper-faq-mob-item-icon'
  isPc ? main = '.title-p' : main = '.wrapper-faq-mob-item-main'
  var $faqItem = $(it).parent(parent);
  var $img = $(it).parent(parent).children(main).children('img');
  if (!$faqItem.hasClass('active')) {
    $(`${parent}.active`).removeClass('active')
      .find(desc).slideUp(300);
    $(`${icon}.transfor-180`).removeClass('transfor-180')
    $faqItem.addClass('active').find(desc).slideDown(300);
    $img.addClass('transfor-180')
  } else {
    $faqItem.removeClass('active').find(desc).slideUp(300);
    $img.removeClass('transfor-180')
  }
}

// var work_swiper_blog_video = new Swiper(".workSwiper-blog", {
//   speed: 800,
//   slidesPerView: 4,
//   autoplay: {
//     delay: 8000,
//     disableOnInteraction: false
//   },
//   navigation: {
//     nextEl: '.swiper-button-next',
//     prevEl: '.swiper-button-prev',
//     disabledClass: 'button-disabled',
//   },

// });
// var mySwiper_blog_m_video = new Swiper('.swiper-container-m', {
//   autoplay: {
//     delay: 8000,
//     disableOnInteraction: false
//   },
//   roundLengths: true,
//   initialSlide: 2,
//   speed: 600,
//   slidesPerView: "auto",
//   centeredSlides: true,
//   followFinger: false,
// })

// const swiperT_video= new Swiper(
//     ".swiper-container",
//     !isMobile()
//         ? {
//           slidesPerView: 3,
//           spaceBetween: 0,
//         }
//         : {
//           slidesPerView: 1,
//           spaceBetween: 0,
//         }
// );
$(".to-top").click(async function () {
  $("html,body").animate({ scrollTop: "0px" }, 100);
})
$(".test-btn").click(async function () {
  $("html,body").animate({ scrollTop: "0px" }, 100);
  await new Promise((resolve) => setTimeout(resolve, 500));
  fetch($(this).prev().attr('src'))
    .then(response => response.blob())
    .then(blob => {
      const fileName = 'image.jpg';
      const file = new File([blob], fileName, { type: 'image/jpeg' });
      attractivenessObj.setFirstStart(true);
      attractivenessObj.addImage({
        file,
        callback: async (data, imageType, ourPicsIndex) => {
          let otherType = imageType === "width" ? "height" : "width";
          $("#main_face_change_img").attr("data-key", "multi_img");
          $(".multi_img")
            .find("img")
            .attr("src", data.showUrl)
            .removeClass(otherType)
            .addClass(`${imageType}`);
          attractivenessObj.form.originImage = data;
          $("#main_face_change_img").attr("src", data.showUrl);
          await new Promise((resolve) => setTimeout(resolve, 3000));
          attractivenessObj.setFirstStart(false);
          if (!ourPicsIndex) {
            $("#multi_img").attr("data-index", null);
          }
        },
      });
    });
});
// var swipermob = new Swiper(".mobSwiper", {
//   slidesPerView: 1,
//   spaceBetween: 0,
//   pagination: {
//     el: ".swiper-pagination-mobswiper",
//     clickable: true,
//   },
// });
// var swipermobmobPink = new Swiper(".mobPink", {
//   slidesPerView: 1,
//   spaceBetween: 10,
//   pagination: {
//     el: ".swiper-pagination-mobPink",
//     clickable: true,
//   },
// });
$(document).ready(function () {
  // $('.multi_upload_before .multi_uploader_btn').mouseenter(function () {
  //   if ($(window).width() < 1200) {
  //     return
  //   }
  //   $(this).find('.show1').addClass('imgnone')
  //   $(this).find('.show2').removeClass('imgnone')
  // }).mouseleave(function () {
  //   $(this).find('.show2').addClass('imgnone')
  //   $(this).find('.show1').removeClass('imgnone')
  // })
  // $('.multi_upload_after .multi_Input').mouseenter(function () {
  //   if ($(window).width() < 1200) {
  //     return
  //   }
  //   $(this).find('.show1').addClass('imgnone')
  //   $(this).find('.show2').removeClass('imgnone')
  //   $(this).find('.change_image_text').css('color', '#281FAE')
  // }).mouseleave(function () {
  //   $(this).find('.show2').addClass('imgnone')
  //   $(this).find('.show1').removeClass('imgnone')
  //   $(this).find('.change_image_text').css('color', '#fff')
  // })
});