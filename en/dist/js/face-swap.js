var controllers=[];function getfsCreditsText(e,t={},a=!1){a&&t.val>1&&(e+="_p");let o=lan.faceSwapPop[e];for(let e in t){const a=new RegExp(`{{${e}}}`,"g");o=o.replace(a,t[e])}return o}let facecheckphotoBool=!1,textContentObj=lan.faceSwapPop,show_ppriority_img=0;var photoDownloadData=null;class AiFace{constructor(e){var t=this;this.imgObjs={firstPicLoading:!1,secondPicLoading:!1,originImage:{},changeImage:{},isSubmit:!1},this.mergeImg={width:0,height:0},this.tryCount=0,this.countryConfig={},this.delay=2e3,this.lastCall=0,this.taskid=null,this.imgList=[],this.isShowTool=!1,this.mergeImgUrl=null,this.mergeKey=null,this.lastType=2,this.canFaceSwap={},this.timerLoading=null,this.photoFirstRandom=!1,this.photoSecondRandom=!1,this.loadingImage="/dist/img/face-swap/btn_loading.png",showBtnCreditsImage(!1),this.form=new Proxy(t.imgObjs,{set(e,a,o){function n(){checkNullObj(e.originImage)||checkNullObj(e.changeImage)||(showBtnCreditsImage(!0),$("#photo_Face_swapper_container .change_face_btn").removeClass("disabled"),e.isSubmit?($("#photo_Face_swapper_container .change_face_btn").addClass("submit"),$("#photo_Face_swapper_container .change_face_btn .submit_text").text(textContentObj.Swapping_setp)):($("#photo_Face_swapper_container .change_face_btn").removeClass("submit"),$("#photo_Face_swapper_container .change_face_btn .submit_text").text(textContentObj.step3_btn)))}if(e[a]=o,"firstPicLoading"===a&&(o?($("#photo_Face_swapper_container .faceSwapProgress").text(textContentObj.Loading),$("#photo_Face_swapper_container .change_face_btn").addClass("disabled"),$("#photo_Face_swapper_container .spread_box_controls").css("visibility","hidden"),$("#photo_Face_swapper_container .my_files_tips").css("visibility","hidden"),$("#photo_Face_swapper_container .stepA .stepBox").addClass("loading"),$("#photo_Face_swapper_container .stepA .step_loadingBox").css("display","flex"),$("#photo_Face_swapper_container .spread_box_container").addClass("uploading"),t.setLiLoading(!0)):($("#photo_Face_swapper_container .stepA .stepBox").removeClass("loading"),$("#photo_Face_swapper_container .stepA .step_loadingBox").hide(),$("#photo_Face_swapper_container .spread_box_container").removeClass("uploading"),t.setLiLoading(!1),n())),"secondPicLoading"===a&&(o?($("#photo_Face_swapper_container .change_face_btn").addClass("disabled"),$("#photo_Face_swapper_container .stepB .stepBox").addClass("loading"),$("#photo_Face_swapper_container .stepB .step_loadingBox").css("display","flex"),t.setLiLoading(!0)):($("#photo_Face_swapper_container .stepB .stepBox").removeClass("loading"),$("#photo_Face_swapper_container .stepB .step_loadingBox").hide(),t.setLiLoading(!1),n())),"isSubmit"===a)if(o)$("#photo_Face_swapper_container .stepA .stepBox").addClass("loading"),$("#photo_Face_swapper_container .stepA .step_loadingBox").css("display","flex"),$("#photo_Face_swapper_container .stepB .stepBox").addClass("loading"),$("#photo_Face_swapper_container .stepB .step_loadingBox").css("display","flex"),$("#photo_Face_swapper_container .spread_box_controls").css("visibility","hidden"),$("#photo_Face_swapper_container .my_files_tips").css("visibility","hidden"),$("#photo_Face_swapper_container .spread_box_container").addClass("loading"),t.setBigImageStart(!0,1),t.setLiLoading(!0),n();else{$("#photo_Face_swapper_container .spread_box_container").removeClass("loading"),$("#photo_Face_swapper_container .stepA .stepBox").removeClass("loading"),$("#photo_Face_swapper_container .stepA .step_loadingBox").hide(),$("#photo_Face_swapper_container .stepB .stepBox").removeClass("loading"),$("#photo_Face_swapper_container .stepB .step_loadingBox").hide(),t.setBigImageStart(!1),t.setLiLoading(!1),n();"origin_img"!==$("#photo_Face_swapper_container .spread_image").attr("data-key")&&($("#photo_Face_swapper_container .spread_box_controls").css("visibility","visible"),$("#photo_Face_swapper_container .my_files_tips").css("visibility","visible"),gtag("event","show_vidqmyfiles_imgtipsfile"))}return!0},get:(e,t)=>e[t]})}resizeImageByFile(e){console.log("resizeImageByFile");var t=this;return new Promise(((a,o)=>{var n=new FileReader;n.onloadend=()=>{let e=new Image;e.onload=()=>{let o=document.createElement("canvas"),n=o.getContext("2d"),i=Math.max(e.width,e.height);if(i>1080){let t=1080/i;o.width=e.width*t,o.height=e.height*t}else o.width=e.width,o.height=e.height;n.drawImage(e,0,0,o.width,o.height);var r=o.toDataURL(),s=t.transtoBlob({b64data:r,contentType:"image/png"});let c="width";o.width<o.height&&(c="height"),console.log("blog post",s),a({blog:s,imgType:c})},e.onerror=()=>{console.log("resizeImageByFile error image",e.src),o(new Error("Image load failed"))},e.src=n.result},n.onerror=o,n.readAsDataURL(e)}))}resizeImageByUrl(e){var t=this;return new Promise(((a,o)=>{let n=new Image;n.onload=()=>{let e=document.createElement("canvas"),o=e.getContext("2d"),i=Math.max(n.width,n.height);if(i>1080){let t=1080/i;e.width=n.width*t,e.height=n.height*t}else e.width=n.width,e.height=n.height;o.drawImage(n,0,0,e.width,e.height);var r=e.toDataURL(),s=t.transtoBlob({b64data:r,contentType:"image/png"});let c="width";e.width<e.height&&(c="height"),a({blog:s,imgType:c})},n.onerror=()=>{o(new Error("Image load failed"))},n.src=e}))}initFace=async function(){var e="/dist/js/weights";const t=await faceapi.loadTinyFaceDetectorModel(e);await faceapi.loadSsdMobilenetv1Model(e),console.log(t),facecheckphotoBool=!0};getUploadFileUrl=(e,t)=>{let a=e;try{a=e.split("/")[1]}catch(e){a="png"}return new Promise((async(e,o)=>{try{if(t)e({code:200});else e(await fetchPost("ai/source/temp-upload-url",{file_name:"vidqu_faceswap."+a},TOOL_API))}catch(e){console.error(e.message),o(e)}}))};uploadFile=(e,t)=>new Promise((async(a,o)=>{try{if(console.log("isRun",t),t)a(200);else a(await fetchPut(e.upload_url,e.file,""))}catch(e){console.error(e.message),o(e)}}));getBothUploadUrl({firstType:e,secondType:t}){var a=this;return new Promise((function(o,n){try{var i=a.getUploadFileUrl(e,a.photoFirstRandom),r=a.getUploadFileUrl(t,a.photoSecondRandom);Promise.all([i,r]).then((e=>{!e||e.some((e=>200!==e.code))?(ToolTip({type:"error",title:textContentObj.errorNetworkTitle,content:textContentObj.errorNetwork,btn:textContentObj.ok}),$(".origin_uploader")[0].value="",$(".change_uploader")[0].value="",a.form.isSubmit=!1):(a.photoFirstRandom||(a.form.originImage=Object.assign(a.form.originImage,e[0]?.data)),a.photoSecondRandom||(a.form.changeImage=Object.assign(a.form.changeImage,e[1]?.data)),o(e))})).catch((e=>{ToolTip({type:"error",title:textContentObj.Failed,content:textContentObj.exception_occurred,btn:textContentObj.ok}),$(".origin_uploader")[0].value="",$(".change_uploader")[0].value="",a.form.isSubmit=!1}))}catch(e){ToolTip({type:"error",title:textContentObj.Failed,content:textContentObj.exception_occurred,btn:textContentObj.ok}),$(".origin_uploader")[0].value="",$(".change_uploader")[0].value="",a.form.isSubmit=!1}}))}addImage=async(e,t,a,o,...n)=>{const i=this;function r(){1===a?($(".origin_uploader")[0].value="",i.form.firstPicLoading=!1):($(".change_uploader")[0].value="",i.form.secondPicLoading=!1);const e=$("#photo_Face_swapper_container .spread_image").attr("data-key");(i.mergeKey||"origin_img"!==e)&&($("#photo_Face_swapper_container .spread_box_controls").css("visibility","visible"),$("#photo_Face_swapper_container .my_files_tips").css("visibility","visible"),gtag("event","show_vidqmyfiles_imgtipsfile"))}if(console.log("addImage",a,t),this.setLiLoading(!0),"string"==typeof t||this.checkFileType(t,a)){if(1===a&&(this.form.firstPicLoading=!0),2===a&&(this.form.secondPicLoading=!0),"string"!=typeof t&&this.checkFileType(t,a)||"string"==typeof t)try{if("string"!=typeof t){var s;if(await aiFaceChanging.initFace(),await this.resizeImageByFile(t).then((async({blog:e,imgType:t})=>{console.log("then"),s=await this.faceCheck({blobUrl:URL.createObjectURL(e)})})).catch((async()=>{console.log("catch"),s=await this.faceCheck({blobUrl:URL.createObjectURL(t)})})),s>1)return ToolTip({type:"error",title:textContentObj.Failed,content:textContentObj.manyFace,btn:textContentObj.ok}),void r();if(s<=0)return ToolTip({type:"error",title:textContentObj.Failed,content:textContentObj.NoFace,btn:textContentObj.ok}),void r()}await this.getCanSwapFaceData();let e,i,d,_=t.type;if("string"==typeof t){var c=await this.urlToFile(t),{blog:l,imgType:p}=await this.resizeImageByUrl(URL.createObjectURL(c));e=l,d=p,i=URL.createObjectURL(c)}else{var{blog:l,imgType:p}=await this.resizeImageByFile(t);e=l,d=p,i=URL.createObjectURL(e)}var g={file:e,showUrl:i,suffix:_};1===a?(this.form.originImage=g,console.log(this.form.originImage,"data"),$("#photo_Face_swapper_container .spread_image").attr({src:g.showUrl}),this.form.firstPicLoading=!1):(this.form.changeImage=g,this.form.secondPicLoading=!1),this.setLiLoading(!1),this.lastType=a,1==a&&(this.photoFirstRandom=!1),2==a&&(this.photoSecondRandom=!1),o&&o(g,d,n)}catch(e){console.error(e),ToolTip({type:"error",title:textContentObj.Failed,content:textContentObj.file_not_exist,btn:textContentObj.ok}),r()}}else this.setLiLoading(!1)};async imgMinWidth(e){const t=await createObjectURLFun(e);return new Promise((e=>{const a=new Image;a.src=t,a.onload=function(){const a=this.width,o=this.height;e(!(a<512||o<512)&&t)}}))}urlToFile(e){return new Promise(((t,a)=>{fetch(e).then((e=>e.blob())).then((e=>{t(e)})).catch((e=>{a(e)}))}))}setLiLoading=e=>{e?$(".our_pics li[data-type='photo']").css({filter:"brightness(0.5)","pointer-events":"none"}):$(".our_pics li[data-type='photo']").css({filter:"none","pointer-events":"auto"})};setBigImageStart=(e,t=1)=>{let a=0;e?(1===t?$("#photo_Face_swapper_container .loading_box p .faceSwapProgress").text(textContentObj.Preparing_step):(this.timerLoading&&(window.clearInterval(this.timerLoading),this.timerLoading=null),this.timerLoading=setInterval((()=>{a<98&&(a++,$("#photo_Face_swapper_container .loading_box p .faceSwapProgress").text(a+"% "+textContentObj.Swapping_setp))}),100)),$(".high_quality_append_dom_photo").css("pointer-events","none")):($(".high_quality_append_dom_photo").css("pointer-events","auto"),window.clearInterval(this.timerLoading),this.timerLoading=null)};transtoBlob=({b64data:e,contentType:t="image/png"})=>{t=t||"";let a=1024,o=atob(e.split(",")[1]),n=o.length,i=Math.ceil(n/a),r=new Array(i);for(let e=0;e<i;++e){let t=e*a,i=Math.min(t+a,n),s=new Array(i-t);for(let e=t,a=0;e<i;++a,++e)s[a]=o[e].charCodeAt(0);r[e]=new Uint8Array(s)}return new Blob(r,{type:t})};isShowToolBtn(){}changeFace=async()=>{const e=this;if(await this.getCanSwapFaceBool()){try{if((await this.uploadImagePromise()).some((e=>200!==e)))return!1}catch(e){return ToolTip({type:"error",title:textContentObj.Failed,content:textContentObj.errorUploadText1,btn:textContentObj.ok}),this.form.isSubmit=!1,!1}this.setBigImageStart(!0,2),fetchPost("ai/tool/face-changing",{avatar_obey_key:this.form.originImage?.key,avatar_main_key:this.form.changeImage?.key,watertype:5,is_hd:photocreditSystem?.is_hd},TOOL_API,{"X-TASK-VERSION":"2.0.0"}).then((async t=>{if(200===t.code)showBtnCreditsImage(!0),1===t.data.is_wateremark?showRemoveWatemark_btn(!0):showRemoveWatemark_btn(!1),this.getFinalImg(t.data.task_id);else if(401===t.code)console.log("log error"),ToolTip({type:"error",title:textContentObj.errorNetworkTitle,content:textContentObj.errorNetwork,btn:textContentObj.ok}),this.form.isSubmit=!1;else if(3001===t.code){await e.getCountryConfig();showMaximum(),this.form.isSubmit=!1,showBtnCreditsImage(!0)}else ToolTip({type:"error",title:textContentObj.errorNetworkTitle,content:textContentObj.errorNetwork,btn:textContentObj.ok}),this.form.isSubmit=!1})).catch((e=>{ToolTip({type:"error",title:textContentObj.errorNetworkTitle,content:textContentObj.errorNetwork,btn:textContentObj.ok}),this.form.isSubmit=!1}))}else this.form.isSubmit=!1};checkFileType=(e,t)=>{var a=e.type;let o=e.name.split(".");var n=o[o.length-1].toLowerCase();return!(!["image/jpeg","image/png","image/webp","application/octet-stream"].includes(a)||!["jpeg","png","webp","jpg"].includes(n))||(ToolTip({type:"error",title:textContentObj.Failed,content:textContentObj.limit,btn:textContentObj.ok}),1===t&&(this.form.firstPicLoading=!1),2===t&&(this.form.secondPicLoading=!1),!1)};getFinalImg=e=>{this.taskid=e;const t=this;fetchPost("ai/tool/get-task",{id:e},TOOL_API).then((async a=>{if(1===a.data.wait?.show_wait){0==show_ppriority_img&&(show_ppriority_img++,gtag("event","show_faceswap_imgpriority"));let{num:e,second:o}=a.data.wait;t.setLoadingMaskTip(!0,{show_wait:1,num:e,second:o})}if(a.message.includes("nsfw")){let e=textContentObj.pornographyMsg;return t.canFaceSwap.data?.credit&&(e=textContentObj.Credits_failed_nsfw),ToolTip({type:"error",title:textContentObj.Failed,content:e,btn:textContentObj.ok}),this.form.isSubmit=!1,void this.setLoadingMaskTip(!1)}if(200!==a.code){if(a.message.includes("faces=0")||a.message.includes("no face")){let e=textContentObj.No_face;t.canFaceSwap.data?.credit&&(e=textContentObj.Credits_failed_no_face),ToolTip({type:"error",title:textContentObj.Failed,content:e,btn:textContentObj.ok})}else if(a.message.includes("celebrity")){let e=textContentObj.celebrity;t.canFaceSwap.data?.credit&&(e=textContentObj.Credits_failed_celebrity),ToolTip({type:"error",title:textContentObj.Failed,content:e,btn:textContentObj.ok})}else if(a.message.includes("faces=")){let e=textContentObj.Mutiple_face;t.canFaceSwap.data?.credit&&(e=textContentObj.Credits_failed_multi_face),ToolTip({type:"error",title:textContentObj.Failed,content:e,btn:textContentObj.ok})}else{let e=textContentObj.processImage;t.canFaceSwap.data?.credit&&(e=textContentObj.Credits_failed),ToolTip({type:"error",title:textContentObj.Failed,content:e,btn:textContentObj.ok})}console.log(a,"error task"),this.form.isSubmit=!1,this.setLoadingMaskTip(!1)}else this.tryCount=0,0===a.data.status?(gtag("event","succ_faceswap_imgswapbtn"),show_ppriority_img=0,setCookie("faceSwapTime_swap",Date.now(),2),this.mergeImgUrl=a.data.additional_data?.merge_url,this.mergeKey=a.data.additional_data?.merge_key,userRuleConfig.credit=a.data.credit,changeHeaderCredit(userRuleConfig.credit),$("#photo_Face_swapper_container .spread_image").attr("data-key",""),$("#photo_Face_swapper_container .spread_image").attr("src",this.mergeImgUrl),$(".larger_img").attr("src",this.mergeImgUrl),localStorage.setItem("faceswap_taskid",e),localStorage.setItem("originImage",JSON.stringify(this.form.originImage)),localStorage.setItem("changeImage",JSON.stringify(this.form.changeImage)),showCreditBannerP(!0),photoDownloadData=await setDownloadData("face_changing",a),setTimeout((()=>{this.form.isSubmit=!1,this.setLoadingMaskTip(!1)}),1e3)):setTimeout((()=>{this.getFinalImg(e)}),2e3)})).catch((t=>{this.tryCount>=3?(ToolTip({type:"error",title:textContentObj.Failed,content:textContentObj.processImage,btn:textContentObj.ok}),this.form.isSubmit=!1,this.setLoadingMaskTip(!1)):(console.log("retrying"),setTimeout((()=>{this.getFinalImg(e),this.tryCount++}),5e3))}))};faceCheck=async({blobUrl:e=""})=>new Promise(((t,a)=>{var o=new Image;o.src=e,o.onload=async()=>{try{const e=await faceapi.detectAllFaces(o,new faceapi.SsdMobilenetv1Options);if(e.length)t(e.length);else{const e=await faceapi.detectAllFaces(o,new faceapi.TinyFaceDetectorOptions({inputSize:416}));t(e.length)}}catch(e){console.log(e),a(e)}},o.onerror=async e=>{console.log(e),a(e)}}));checkFacePic=(e,t)=>new Promise((async(t,a)=>{try{let a=e;"string"!=typeof e&&(a=URL.createObjectURL(e));var o=await this.faceCheck({blobUrl:a});if(1===o)t(!0);else{$(".origin_uploader")[0].value="",$(".change_uploader")[0].value="";let e=textContentObj.NoFace;o>=2&&(e=textContentObj.manyFace),ToolTip({type:"error",title:textContentObj.Failed,content:e,btn:textContentObj.ok}),t(!1)}}catch(e){a(e)}}));getImgList(){var e=this;const t=fetchGet("ai/public/example?action=face_changing",TOOL_API).then((t=>{if(401===t.code)return void ToolTip({type:"error",title:textContentObj.errorNetworkTitle,content:textContentObj.errorNetwork,btn:textContentObj.ok});let a=t.data.photo,o=t.data.domain;a.forEach(((e,t)=>{t>=6||$(".our_pics").append(`\n            <li data-type="photo" style="display:none">\n              <img src="${o+e}"  data-key="${e}" data-index="${t+1}"/>\n            </li>\n          `)})),$(".our_pics li[data-type='photo']").each((function(){$(this).on("click",(t=>{var a=$(this).find("img").attr("src"),o=$(this).find("img").attr("data-key"),n=$(this).find("img").attr("src");let i=3-e.lastType;a&&(gtag("event","clickimg_faceswap_imgtpl"),1===i?(e.form.firstPicLoading=!0,e.form.originImage=n,e.photoFirstRandom=!0,e.form.originImage={},e.form.originImage.key=o,e.form.originImage.showUrl=a,e.form.originImage.suffix="png"==o.split(".")[1]?"image/png":"image/jpeg",$("#photo_Face_swapper_container .spread_image").attr("src",a),$("#photo_Face_swapper_container .spread_image").attr("data-key","origin_img"),$("#photo_Face_swapper_container .stepA .stepBox .step_P").addClass("active").attr("src",a).removeClass("width").removeClass("height"),$("#photo_Face_swapper_container .stepA .stepBox .btn_changer").show(),e.form.firstPicLoading=!1):(e.form.secondPicLoading=!0,e.form.changeImage=n,e.photoSecondRandom=!0,e.form.changeImage={},e.form.changeImage.key=o,e.form.changeImage.showUrl=a,e.form.changeImage.suffix="png"==o.split(".")[1]?"image/png":"image/jpeg",$("#photo_Face_swapper_container .stepB .stepBox .step_P").addClass("active").attr("src",a).removeClass("width").removeClass("height"),$("#photo_Face_swapper_container .stepB .stepBox .btn_changer").show(),e.form.secondPicLoading=!1),e.lastType=i)}))}))})).catch((e=>{ToolTip({type:"error",title:textContentObj.Failed,content:textContentObj.errorText,btn:textContentObj.ok}),console.error("fail",e)})),a=fetchGet("ai/public/example?action=video_face_changing",TOOL_API).then((e=>{if(401===e.code)return void ToolTip({type:"error",title:textContentObj.errorNetworkTitle,content:textContentObj.errorNetwork,btn:textContentObj.ok});let t=e.data.domain,a="",o="";e.data.video_tartget_photo.forEach(((e,o)=>{o<3&&(a+=`\n              <li style="display:none" data-type="video" data-vp="p" photo-index="${o+1}" pic-key="${e}"  pic-url="${t+e}"> <img src="${t+e}"> </li> `)})),e.data.video.forEach(((e,a)=>{a>=3||(o+=`\n          <li style="display:none" data-vp="v" data-type="video" video-index="${a+1}" video-key="${e.video_key}" video-size="${e.size}" cover-url="${t+e.cover_key}" video-duration="${e.duration}" video-url="${t+e.video_key}">\n           <img src="${t+e.cover_key}">\n           <img class="v_photo_demo_playIcon" src="/dist/img/face-swap/icon_small_video.png" alt="">\n           </li>\n          `)})),$(".our_pics").append(o),$(".our_pics").append(a)}));Promise.all([a,t]).then((()=>{"tab_video"===$(".faceSwap_tab.active").attr("tabName")?$(".our_pics li[data-type='video']").show():$(".our_pics li[data-type='photo']").show()}))}uploadImagePromise(){return new Promise((async(e,t)=>{try{await this.getBothUploadUrl({firstFile:this.form.originImage.file,secondFile:this.form.changeImage.file,firstType:this.form.originImage.suffix,secondType:this.form.changeImage.suffix});var a=this.uploadFile(this.form.originImage,this.photoFirstRandom),o=this.uploadFile(this.form.changeImage,this.photoSecondRandom);Promise.all([a,o]).then((t=>{e(t)})).catch((e=>t(e)))}catch(e){console.log(e),t()}}))}getSourceUrl(e){return fetchPost("ai/source/get-access-url",{key:e,file_name:"vidqu_faceswap.png"},TOOL_API)}setDragLoading(e,t){console.log(e,t,"setDragLoading"),t?$(`${e} .uploader_loading_mask`).show():$(`${e} .uploader_loading_mask`).hide()}throttle(e,t){let a=0;return function(...o){const n=(new Date).getTime();n-a>=t&&(e(...o),a=n)}}getCountryConfig(){const e=this;return new Promise(((t,a)=>{fetchGet("ai/tool/facechanging-country-code",TOOL_API).then((o=>{200===o.code?(e.countryConfig=o.data,t(o.data)):(ToolTip({type:"error",title:textContentObj.errorNetworkTitle,content:textContentObj.errorNetwork,btn:textContentObj.ok}),a("error"))})).catch((()=>{ToolTip({type:"error",title:textContentObj.errorNetworkTitle,content:textContentObj.errorNetwork,btn:textContentObj.ok}),a("error")}))}))}getCanSwapFaceBool(){return new Promise((async(e,t)=>{if(await this.getCanSwapFaceData(),getCookie("access_token"))if(200===this.canFaceSwap.code){if(1==this.canFaceSwap.data?.last_use_credit&&0===this.canFaceSwap.data?.credit){e(await showRemoveWatermark())}}else 3008===this.canFaceSwap.code?showNotEnoughCredits():showMaximum(),e(!1);else 200!==this.canFaceSwap.code&&(showMaximum(),e(!1));e(!0)}))}async getCanSwapFaceData(){const e=this;return new Promise((async(t,a)=>{try{let t=await fetchPost("ai/tool/can-face",{action:"face_changing"},TOOL_API);e.canFaceSwap=t;let a=e.canFaceSwap.data?.credit||0;userRuleConfig.credit=a,changeHeaderCredit(a)}catch(e){console.error(e)}t()}))}eventLoginsuccess(){const e=this;this.getCanSwapFaceData(),document.querySelector("my-component").addEventListener("loginsuccess",(async function(t){await e.getCanSwapFaceData(),checkNullObj(e.form.originImage)||checkNullObj(e.form.changeImage)||showBtnCreditsImage(!0),isLogin(!0)}))}setLoadingMaskTip(e,t={}){const{maskSpan:a,show_wait:o,num:n,second:i}=t;let r=$("#createTaskMaskPhoto"),s=$("#photo_Face_swapper_container .v_mask_background");if(e){if(1===o){r.find(".v_mask_content2").show();let e=i,t="wait_minutes";i>60?e=Math.ceil(i/60):t="wait_seconds",r.find(".v_mask_content2 .v_mask_span").html(setTextContentObj("estimated_wait_time",{val:n,val2:e,val3:setTextContentObj(t)}))}else r.find(".v_mask_content2").hide();r.show(),s.show()}else r.hide(),s.hide()}setMaskUnlockPriority(){$("#createTaskMaskPhoto .v_mask_unlock_priority").on("click",(e=>{gtag("event","click_faceswap_imgpriority"),setCookie("st","fsimgcreditpriority")}))}}class CreditPhotoModel{constructor(){}showNotEnoughCredits(){ToolTip({type:"error",title:textContentObj.Failed,content:getfsCreditsText("Model_not_credit_span",{val:credits}),btn:textContentObj.ok})}showMaximum(){gtag("event","alert_faceswap_imgmaxlimit");let e=getfsCreditsText("Model_Maximum_span",{val:userRuleConfig.p_times},!0);ToolTip({type:"error",title:textContentObj.exceedTitle,content:e,btn:textContentObj.ok})}showMaximumFileSize(){let e=getfsCreditsText("Model_MaximumFile_span",{val:userRuleConfig.limit});ToolTip({type:"error",title:textContentObj.Failed,content:e,btn:textContentObj.ok})}showRemoveWatermark(){ToolTip({type:"error",title:textContentObj.Failed,content:getfsCreditsText("Model_Remove_Watermark_btn"),btn:textContentObj.ok})}}function checkNullObj(e){return 0===Object.keys(e).length}var creditsPhotoModel=null,setDropdown=(e,t=1)=>{let a=1===t?aiFaceChanging.form.firstPicLoading:aiFaceChanging.form.secondPicLoading;$(`${e} .stepBox`).on("dragover",(function(e){e.preventDefault()})),$(`${e} .stepBox`).on("dragenter",(function(t){t.preventDefault(),a||aiFaceChanging.setDragLoading(`${e} .stepBox`,!0)})),$(`${e} .uploader_loading_mask`).on("dragleave",(function(t){a||aiFaceChanging.setDragLoading(`${e} .stepBox`,!1)}))};function showCreditBannerP(e=!0){photocreditSystem.showCreditBanner({bool:e,showcallback:()=>{gtag("event","show_faceswap_imgbanner")}}),videocreditSystem.showCreditBanner({bool:e,showcallback:()=>{gtag("event","show_faceswap_videobanner")}})}function showMaximum(){gtag("event","alert_faceswap_imgmaxlimit"),photocreditSystem.showCreditPopup({title:textContentObj.exceedTitle,content:getfsCreditsText("Model_Maximum_span",{val:userRuleConfig.p_times},!0),btn:getfsCreditsText("Model_Unlock_btn"),btnFn:()=>{gtag("event","click_faceswap_imgmaxlimit")},modalCoins:"timesmax"})}function showBtnCreditsImage(e){200===aiFaceChanging?.canFaceSwap?.code&&0===aiFaceChanging?.canFaceSwap?.data?.credit||photocreditSystem.showBtnCredits({bool:e,credits:1,appendDom:$("#photo_Face_swapper_container .change_face_btn"),type:"image"})}function showRemoveWatemark_btn(e){if(e){$("#photo_Face_swapper_container .removeWatemark_btn").show(),$("#large_face_modal .removeWatemark_btn").show(),$("#photo_Face_swapper_container .removeWatemark_btn").parent().addClass("img_btns_group2"),$("#large_face_modal .img_btns").addClass("img_btns2_r")}else{$("#photo_Face_swapper_container .removeWatemark_btn").hide(),$("#large_face_modal .removeWatemark_btn").hide(),$("#photo_Face_swapper_container .removeWatemark_btn").parent().removeClass("img_btns_group2"),$("#large_face_modal .img_btns").removeClass("img_btns2_r")}}function showNotEnoughCredits(e=1){gtag("event","alert_faceswap_imgnocredit"),photocreditSystem.showCreditPopup({title:getfsCreditsText("Model_not_credits_title"),content:getfsCreditsText("Model_not_credit_span",{val:e},!0),btn:getfsCreditsText("Model_not_credits_btn"),btnFn:()=>{gtag("event","click_faceswap_imgnocredit"),setCookie("st","fsimgnocredit")},modalCoins:"notenough"})}function showRemoveWatermark(){return new Promise(((e,t)=>{photocreditSystem.showCreditPopup({title:getfsCreditsText("Model_Remove_Watermark_title"),content:getfsCreditsText("Model_Remove_Watermark_span"),btn:getfsCreditsText("Model_Remove_Watermark_btn"),btnWater:getfsCreditsText("Model_Remove_Watermark_btn1"),btnWaterFn:()=>{gtag("event","click_faceswap_stock_m"),e(!0)},closeClick:()=>{e(!0)},btnFn:()=>{setCookie("st","removewatermark_m"),gtag("event","click_faceswap_no_m"),e(!1)},modalCoins:"watermarker"})}))}async function download(){if(getCookie("access_token"))if(photoDownloadData){gtag("event","download_faceswap_imgres");var e=()=>{ToolTip({type:"downloadsuccess",title:textContentObj.Download_success,content:textContentObj.Download_sucess_text,btn:textContentObj.ok})},t=()=>{ToolTip({type:"error",title:textContentObj.Failed,content:textContentObj.downloadError,btn:textContentObj.ok})},a=()=>{ToolTip({type:"error",title:textContentObj.Failed,content:textContentObj.file_download_exist,btn:textContentObj.ok})};await fetchPost("ai/source/get-access-url",{key:aiFaceChanging.mergeKey,action:"download",file_name:"Vidqu_faceswap.png"},TOOL_API).then((o=>{ToolTip({type:"progress",content:textContentObj.downloading,progressType:"fetch",url:o.data.url,name:"Vidqu_faceswap.png",sucessCallback:e,failedCallback:t,NoExistCallback:a})})).catch((e=>{ToolTip({type:"error",title:textContentObj.errorNetworkTitle,content:textContentObj.errorNetwork,btn:textContentObj.ok})}))}else photoDownloadData=await newDownloadFile(aiFaceChanging.taskid);else showLoginWindow({isReloading:!1,wait:[aiFaceChanging.taskid],fn:async(e=null)=>{e&&(photoDownloadData=e)}})}var aiFaceChanging=new AiFace,photoAiFaceChanging=aiFaceChanging;$(document).ready((function(){window.aiFaceChanging=aiFaceChanging,creditsPhotoModel=new CreditPhotoModel,gtag("event","open_faceswap_page"),aiFaceChanging.initFace(),aiFaceChanging.getImgList(),aiFaceChanging.eventLoginsuccess(),aiFaceChanging.setMaskUnlockPriority(),setFsNewTag(!0),$("#photo_Face_swapper_container .stepA .stepBox img").on("click",(function(e){e.stopPropagation(),$(this).hasClass("active")||(gtag("event","up_faceswap_imgstep1"),$(".origin_uploader").click())})),$("#photo_Face_swapper_container .stepA .stepBox .btn_changer").on("click",(function(e){e.stopPropagation(),$(this).hasClass("active")||(gtag("event","up_faceswap_imgstep1"),$(".origin_uploader").click())})),$("#photo_Face_swapper_container .stepB .stepBox img").on("click",(function(e){e.stopPropagation(),$(this).hasClass("active")||(gtag("event","up_faceswap_imgstep2"),$(".change_uploader").click())})),$("#photo_Face_swapper_container .stepB .stepBox .btn_changer").on("click",(function(e){e.stopPropagation(),$(this).hasClass("active")||(gtag("event","up_faceswap_imgstep2"),$(".change_uploader").click())})),setDropdown("#photo_Face_swapper_container .stepA",1),setDropdown("#photo_Face_swapper_container .stepB",2),$("#large_face_modal").on("wheel",(function(e){e.preventDefault()})),$(".origin_uploader").on("change",(function(e){if(e.target.files&&e.target.files[0])if(1===e.target.files.length){var t=e.target.files[0],a=$(this)[0];console.log(t,a,"file"),aiFaceChanging.addImage(e,t,1,((e,t)=>{let o="width"===t?"height":"width";$("#photo_Face_swapper_container .spread_image").attr("data-key","origin_img"),$("#photo_Face_swapper_container .stepA .stepBox .step_P").addClass("active").attr("src",e.showUrl).removeClass(o).addClass(`${t}`),$("#photo_Face_swapper_container .stepA .stepBox .btn_changer").show(),a.value=""}))}else ToolTip({type:"error",title:textContentObj.Failed,content:textContentObj.onlyone,btn:textContentObj.ok})})),$(".change_uploader").on("change",(function(e){if(e.target.files&&e.target.files[0])if(1===e.target.files.length){var t=e.target.files[0],a=$(this)[0];aiFaceChanging.addImage(e,t,2,((e,t)=>{let o="width"===t?"height":"width";$("#photo_Face_swapper_container .stepB .stepBox .step_P").addClass("active").attr("src",e.showUrl).removeClass(o).addClass(`${t}`),$("#photo_Face_swapper_container .stepB .stepBox .btn_changer").show(),a.value=""}))}else ToolTip({type:"error",title:textContentObj.Failed,content:textContentObj.onlyone,btn:textContentObj.ok})})),$("#photo_Face_swapper_container .stepA .uploader_loading_mask").on("drop",(function(e){if(e.preventDefault(),aiFaceChanging.setDragLoading("#photo_Face_swapper_container .stepA",!1),!aiFaceChanging.form.firstPicLoading)if(gtag("event","up_faceswap_imgstep1"),1===e.originalEvent.dataTransfer.files.length){var t=e.originalEvent.dataTransfer.files[0];$(".origin_upload").addClass("loading_mask"),aiFaceChanging.addImage(e,t,1,((e,t)=>{let a="width"===t?"height":"width";$("#photo_Face_swapper_container .spread_image").attr("data-key","origin_img"),$("#photo_Face_swapper_container .stepA .stepBox .step_P").addClass("active").attr("src",e.showUrl).removeClass(a).addClass(`${t}`),$("#photo_Face_swapper_container .stepA .stepBox .btn_changer").show()}))}else ToolTip({type:"error",title:textContentObj.Failed,content:textContentObj.onlyone,btn:textContentObj.ok})})),$("#photo_Face_swapper_container .stepB .uploader_loading_mask").on("drop",(function(e){if(e.preventDefault(),aiFaceChanging.setDragLoading("#photo_Face_swapper_container .stepB ",!1),!aiFaceChanging.form.secondPicLoading)if(gtag("event","up_faceswap_imgstep2"),1===e.originalEvent.dataTransfer.files.length){var t=e.originalEvent.dataTransfer.files[0];aiFaceChanging.addImage(e,t,2,((e,t)=>{let a="width"===t?"height":"width";$("#photo_Face_swapper_container .stepB .stepBox .step_P").addClass("active").attr("src",e.showUrl).removeClass(a).addClass(`${t}`),$("#photo_Face_swapper_container .stepB .stepBox .btn_changer").show()}))}else ToolTip({type:"error",title:textContentObj.Failed,content:textContentObj.onlyone,btn:textContentObj.ok})})),$("#photo_Face_swapper_container .removeWatemark_btn").on("click",(function(e){})),$("#large_face_modal .removeWatemark_btn").on("click",(function(e){})),$("#photo_Face_swapper_container .contrast,#large_modal .contrast").on("pointerdown",(function(t){t.preventDefault(),2!==t.button&&(gtag("event","compare_faceswap_imgres"),aiFaceChanging.form?.originImage?.showUrl&&($("#photo_Face_swapper_container .spread_image").attr("src",aiFaceChanging.form?.originImage.showUrl),$("#large_modal .larger_img").attr("src",aiFaceChanging.form?.originImage.showUrl)),document.addEventListener("pointerup",(function(t){$("#photo_Face_swapper_container .spread_image").attr("data-key")||e(t)})))})),$("#photo_Face_swapper_container .share,#large_modal .share").on("click",(e=>{gtag("event","share_faceswap_imgres");let t=document.querySelector("#shareDialogEl");t.changeTips({title:textContentObj.share_title_v,content:textContentObj.share_title_centent}),t.showShare({url:aiFaceChanging.mergeImgUrl,action:"ismarttafaceshare",imageKey:aiFaceChanging.mergeKey,text:textContentObj.share__text,title:textContentObj.share__Tile,id:aiFaceChanging.taskid,lan:questLanguage,backParams:function(e={}){return{id:aiFaceChanging.taskid,key:e?.merge_key}},task_id:aiFaceChanging.taskid})})),$(".compare_btn").on("pointerleave",(t=>{e(t)}));const e=function(t){console.error("stopCompare"),t.preventDefault();$("#photo_Face_swapper_container .spread_box_controls").css("visibility");2!==t.button&&($("#photo_Face_swapper_container .spread_image").attr("src",aiFaceChanging.mergeImgUrl),$("#large_modal .larger_img").attr("src",aiFaceChanging.mergeImgUrl),document.removeEventListener("pointerup",(function(t){e(t)})))};$("#photo_Face_swapper_container .zoomIn").on("click",(function(e){e.preventDefault(),2!==e.button&&(gtag("event","zoomin_faceswap_imgres"),$("#large_modal").addClass("photo_large").show(),$("#large_modal.photo_large .download").on("click",(e=>{e.preventDefault(),2!==e.button&&download()})))})),$("#photo_Face_swapper_container .download").on("click",(async e=>{e.preventDefault(),2!==e.button&&await download()})),$(".modal__main_close").on("click",(function(){$(".vocalRemover__modal").hide()})),$("#large_modal .close_large").on("click",(function(){$("#large_modal").hide().removeClass("photo_large").removeClass("video_large"),$("#large_modal .download").off("click")})),$(".change_face_btn").on("click",(function(e){gtag("event","click_faceswap_imgstep3");let t=aiFaceChanging;t.form.isSubmit=!0,t.getCountryConfig().then((()=>{t.changeFace($(this))})).catch((()=>{t.form.isSubmit=!1}))})),$(".face_swap_now").on("click",(function(){scrollToPositions(".ai-change-face")})),$("#header_user").on("mouseenter",(()=>{gtag("event","show_faceswap_profilepopover")})),$("#header_user #go_credits").click((()=>{gtag("event","click_faceswap_profileaccount")})),$("#header_user .signout").click((()=>{gtag("event","click_faceswap_profilesignout")})),$("#photo_Face_swapper_container .my_files_tips .myfiles_check_Now_btn").on("click",(()=>{gtag("event","click_vidqmyfiles_imgtipsfile"),getCookie("access_token")?window.open("/my-files.html"):showLoginWindow({isReloading:!1,wait:[aiFaceChanging.taskid],fn:async(e=null)=>{e&&(photoDownloadData=e),window.open("/my-files.html")}})}))}));