let textContentObj=lan.faceSwapPop;class MyFiles{constructor(){this.listData=[],this.selectArr=[],this.previewData={},this.pageData={pageSize:28,page:1,type:0,name:"",total:0,count:0},this.limitFirstShow=!0,this.selectData={}}init(){getCookie("access_token")?(this.bindEvents(),this.getList(),$("#searchMyfileInput").hide(),setTimeout((()=>{$("#searchMyfileInput").show(),$("#searchMyfileInput").val("")}),500)):window.location.href="/"}getFromPage(){const e=new URLSearchParams(window.location.search).get("from");$("#fromPage").text(e)}getCardValue(e,t){return $(e).closest(".template-card").data(t)}generatePagination(e){let t=this;const i=$(".pages");if(i.empty(),e<2)return void $(".pagination-box").hide();$(".pagination-box").show();const a=Math.floor(2.5);let n,o;e<=5?(n=1,o=e):t.pageData.page<=a?(n=1,o=5):t.pageData.page+a>=e?(n=e-5+1,o=e):(n=t.pageData.page-a,o=t.pageData.page+a),o>e&&(o=e,n=Math.max(1,o-5+1));for(let e=n;e<=o;e++){const a=$("<li>",{class:"page-item",text:e});a.on("click",(function(){t.goToPage(e)})),i.append(a)}$(".pagination-box").show(),t.updatePagination()}goToPage(e){e<1||e>this.pageData.total||(this.pageData.page=e,this.getList(),this.updatePagination(),console.log("Current page:",this.pageData.page))}updatePagination(){let e=this;$(".page-item").removeClass("active"),$(".page-item").filter((function(){return $(this).text()==e.pageData.page})).addClass("active"),1===e.pageData.page?$(".prev-page").addClass("disabled"):$(".prev-page").removeClass("disabled"),e.pageData.page===e.pageData.total?$(".next-page").addClass("disabled"):$(".next-page").removeClass("disabled")}getList(){$(".operation-box").hide(),this.selectArr=[],$(".no-content").hide(),$(".template").children().not(".no-content").remove(),this.loadSkeleton();let e=this;fetchGet(`ai/asset/vidqu-list?pageSize=${e.pageData.pageSize}&page=${e.pageData.page}&type=${e.pageData.type}&name=${e.pageData.name}`).then((t=>{if(200!==t.code)return void e.showError();if(0===t.data.list.length)return gtag("event","show_vidqmyfiles_tipsvidfs"),$(".no-content").show(),0==e.pageData.type&&""==e.pageData.name&&1==e.pageData.page?($(".go-to-create").show(),$(".title-right").css("pointer-events","none"),$(".filter-input").css("pointer-events","none"),$(".no-results").hide()):($(".go-to-create").hide(),$(".no-results").show()),$(".template").children().not(".no-content").remove(),$("#dataTotal").text(t.data.total),void $(".pagination-box").hide();$(".title-right").css("pointer-events",""),$(".filter-input").css("pointer-events",""),$(".no-content").hide(),$(".template").children().not(".no-content").remove(),this.checkMemory(t.data.memory),$("#dataTotal").text(t.data.total),this.pageData.total=t.data.pageCount,e.generatePagination(t.data.pageCount);let i=t.data.list;e.listData=i;var a=$(".template");i.forEach((function(t){let i,n,o="",s="",l="";2===t.type?(i=t.cover,n=function(e){let t=Math.floor(e/60),i=e%60;return`${String(t).padStart(2,"0")}:${String(i).padStart(2,"0")}`}(t.duration),o='<img src="/dist/img/my-files/icon_video_play.svg" class="play-icon">'):(i=t.url,n=`${t.width}X${t.height}`,s='<img src="/dist/img/my-files/icon_share.svg" id="shareIcon" class="btn-icon">',l=`\n                        <div class="item item-share">\n                            <img src="/dist/img/my-files/icon_win_Share.svg" class="item-icon">\n                            <div class="item-text">${e.getLangJson("share")}</div>\n                        </div>\n                    `);var d=`\n                <div class="template-card" data-id="${t.id}" data-url="${t.url}" data-name="${t.name}" data-type="${t.type}"\n                    data-ext="${t.ext}" data-urlkey="${t.url_key}" data-taskId="${t.task_id}" data-key="${t.url_key}" data-cover="${t.cover}"\n                >\n                    <div class="template-card-bg">\n                        ${o}\n                        <img src="${i}" >\n                        <div class="template-card-bg-tag">\n                            <div class="tag-left">${t.ext}</div>\n                            <div class="tag-right">${n}</div>\n                        </div>\n                        <svg id="downloadIconM" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="30" height="30" viewBox="0 0 30 30" class="card-download m-show">\n                            <defs>\n                            <clipPath id="clip-path">\n                                <rect id="_1" data-name="1" width="20" height="20" transform="translate(0)" stroke="#707070" stroke-width="1"/>\n                            </clipPath>\n                            </defs>\n                            <g id="icon_download" transform="translate(-596 -301)">\n                            <rect id="" data-name=" 31971" width="30" height="30" rx="5" transform="translate(596 301)" fill="#fff" opacity="0.797"/>\n                            <g id="icon_download-2" data-name="icon_download" transform="translate(601 306)">\n                                <g id="icon_download-3" data-name="icon_download" clip-path="url(#clip-path)">\n                                <path id="_1-2" data-name="1" d="M16.494,8.123l-3.642,3.642V.516a.839.839,0,0,0-1.678,0V11.765L7.533,8.123A.839.839,0,0,0,6.347,9.309l5.074,5.074a.817.817,0,0,0,.275.182l.013,0a.818.818,0,0,0,.612,0l.013,0a.864.864,0,0,0,.275-.182l5.074-5.074a.84.84,0,0,0-1.188-1.186Zm1.428,6.589H6.1a.839.839,0,1,0,0,1.678H17.922a.839.839,0,0,0,0-1.678Z" transform="translate(-1.981 0.967)"/>\n                                </g>\n                            </g>\n                            </g>\n                        </svg>\n                      \n                        <div class="custom-radio">\n                            <div class="checkmark"></div>\n                        </div>\n                        <div class="more-container">\n                            <div class="more-btn">\n                                <div class="circle"></div><div class="circle"></div><div class="circle"></div>\n                                <div class="dropdown-menu">\n                                    <div class="item item-preview">\n                                        <img src="/dist/img/my-files/icon_win_Preview.svg" class="item-icon">\n                                        <div class="item-text">${e.getLangJson("preview")}</div>\n                                    </div>\n                                    ${l}\n                                    <div class="item item-download">\n                                        <img src="/dist/img/my-files/icon_win_download.svg" class="item-icon">\n                                        <div class="item-text">${e.getLangJson("download")}</div>\n                                    </div>\n                                    <div class="item item-rename">\n                                        <img src="/dist/img/my-files/icon_win_Rename.svg" class="item-icon">\n                                        <div class="item-text">${e.getLangJson("rename")}</div>\n                                    </div>\n                                    <div class="item item-delete">\n                                        <img src="/dist/img/my-files/icon_win_delete.svg" class="item-icon">\n                                        <div class="item-text">${e.getLangJson("delete")}</div>\n                                    </div>\n                                </div>\n                            </div>\n                        </div>\n                    </div>\n                    <div class="template-bottom-box">\n                        <div class="template-des">\n                            <div class="template-name" tabindex="0">${t.name}</div>\n                            <input  maxlength="100" type="text" class="name-input hidden" value="${t.name}">     \n                            <div class="template-date">${e.someTimeAgo(t.created_at)}</div>\n                        </div>\n                        <div class="template-icon-box pc-show">\n                            ${s}\n                            <img src="/dist/img/my-files/icon_download.svg" id="downloadIcon" class="btn-icon">\n                        </div>\n\n                        <div class="more-btn-m m-show">\n                            <div></div>\n                            <div></div>\n                            <div></div>\n                        </div>\n                    </div>\n                </div>\n                `;a.append(d)})),this.cardBindEvents()}))}someTimeAgo(e){let t=new Date(1e3*e).getTime(),i=((new Date).getTime()-t)/1e3,a="";return a=i<=60?this.getLangJson("someTimeAgo_s"):i/60<=60?this.getLangJson("someTimeAgo_m",{val:parseInt(i/60)}):i/3600<=24?this.getLangJson("someTimeAgo_h",{val:parseInt(i/3600)}):i/3600<=48?this.getLangJson("Yesterday"):i/3600<=720?this.getLangJson("someTimeAgo_d",{val:parseInt(i/3600/24)}):moment(t).format("MMM D, YYYY"),a}getLangJson(e,t={},i=!1){if(i){let i=t.val;if("string"==typeof i){let e=i.replace(/,/g,"");i=parseFloat(e)}1!==i&&(e+="_p")}let a=jsonData.myFiles[e];for(let e in t){const i=new RegExp(`{{${e}}}`,"g");a=a.replace(i,t[e])}return a}checkMemory(e){const t=5242880;e<t?(gtag("event","show_vidqmyfiles_tipslimited"),$(".limit-tips").css("display","flex"),$(".limit-text-left").css("color","#DA7F3B"),$(".limit-text-left").text(jsonData.myFiles.limitText2)):e>=t&&e<=20971520?(gtag("event","show_vidqmyfiles_tipslimited_a"),$(".limit-text-left").css("color","#000"),$(".limit-tips").css("display","flex"),$(".limit-text-left").text(jsonData.myFiles.limitText1)):$(".limit-tips").hide()}loadSkeleton(){const e=$(".template");for(let t=0;t<12;t++){const t=$("<div>",{class:"skeleton-container"}).append($("<div>",{class:"skeleton"}),$("<div>",{class:"skeleton-row"}).append($("<div>",{class:"skeleton-item",style:"width: 301px; height: 14px;"}),$("<div>",{class:"skeleton-item",style:"width: 261px; height: 14px;"})));e.append(t)}}bindEvents(){let e=this;$(".share-Twitter").click((function(){gtag("event","share_vidqmyfiles_tw")})),$(".share-Facebook").click((function(){gtag("event","share_vidqmyfiles_fb")})),$(".share-link").click((function(){gtag("event","share_vidqmyfiles_link")})),$(".limit-button").click((function(){let e="You are nearing maximum storage capacity."==$(".limit-text-left").text();gtag("event",e?"cilck_vidqmyfiles_tipslimited_a":"cilck_vidqmyfiles_tipslimited"),setCookie("st","myfiletips"),window.open("/ai-tool-pricing.html","_blank")})),$(".operation-cancel").on("click",(function(){$(".operation-box").addClass("hidden").fadeOut(300,(function(){$(this).removeClass("hidden")})),$(".custom-radio").removeClass("selected"),e.selectArr=[],e.updateOperationBox()})),$(".icon-close").click((function(){$(".video-container").empty();document.getElementById("video");$(".preview-large-box").hide()})),$(".filter-select").on("click",(function(e){e.stopPropagation(),$(".filter-dropdown-menu").toggle()})),$(".filter-dropdown-menu-m .item").on("click",(function(t){t.stopPropagation();const i=Number($(this).data("value"));e.pageData.type=i,e.getList(),$(".filter-dropdown-menu-m .item").removeClass("active"),$(this).addClass("active"),$(".filter-dropdown-menu-box").hide()})),$(".filter-select-m").on("click",(function(e){e.stopPropagation(),$(".filter-dropdown-menu-m").hide(),$(".filter-dropdown-menu-box").show(),$(".filter-dropdown-menu-m").slideDown()})),$(document).on("click",(function(){$(".filter-dropdown-menu-box").hide()})),$(".cancel-btn,.more-dropdown-menu-m .item").on("click",(function(){$(".more-operation-box").hide()})),$(document).on("click",(function(){$(".filter-dropdown-menu").hide()})),$(".filter-dropdown-menu").on("click",(function(e){e.stopPropagation()})),$(".filter-dropdown-menu .item").on("click",(function(){const t=Number($(this).data("value"));$("#filterText").text($(this).text()).css("color","#202124"),$(".filter-dropdown-menu").hide(),e.pageData.type=t,e.getList()}));const t=function(e,t){let i;return function(...a){clearTimeout(i),i=setTimeout((()=>e.apply(this,a)),t)}}((function(){var t=$("#searchMyfileInput").val();e.pageData.name=t,e.getList()}),300);$("#searchMyfileInput").on("input",t),$(".next-page").on("click",(function(){e.pageData.page<e.pageData.total&&e.goToPage(e.pageData.page+1)})),$(".prev-page").on("click",(function(){e.pageData.page>1&&e.goToPage(e.pageData.page-1)})),$(".go-to-btn").click((function(){gtag("event","cilck_vidqmyfiles_tipsvidfs"),window.location.href="/face-swap.html"}))}playVideo(){let e=this;const t=document.getElementById("video"),i=document.getElementById("play-btn"),a=document.getElementById("progress-container"),n=document.getElementById("progress"),o=document.getElementById("time-display");function s(e){const t=Math.floor(e/60),i=Math.floor(e%60);return`${String(t).padStart(2,"0")}:${String(i).padStart(2,"0")}`}function l(){t.paused?i.src="/dist/img/my-files/icon_video_play.svg":i.src="/dist/img/my-files/icon_video_pause.svg"}t.addEventListener("loadedmetadata",(()=>{o.textContent=`00:00/${s(t.duration)}`})),i.addEventListener("click",(()=>{t.paused?t.play().catch((t=>{console.error("Error playing video:",t),t.includes("media was removed from the document.")||e.showError()})):t.pause()})),t.addEventListener("timeupdate",(function(){const e=t.currentTime,i=t.duration,a=e/i*100;n.style.width=`${a}%`,o.textContent=`${s(e)}/${s(i)}`})),t.addEventListener("play",l),t.addEventListener("pause",l),a.addEventListener("click",(e=>{const i=a.clientWidth,n=e.offsetX,o=t.duration;t.currentTime=n/i*o})),t.addEventListener("ended",(()=>{i.src="/dist/img/my-files/icon_video_play.svg"})),t.addEventListener("error",(e=>{console.error("Video load error:",e)}))}deleteData(e){let t=this;if(1===e.length)fetchPost("ai/asset/vidqu-del",{id:e[0].id},TOOL_API).then((e=>{$("#mio_popup").remove(),$(".operation-box").hide(),200===e.code?t.getList():t.showError()})).catch((e=>{t.showError()}));else{const e=t.selectArr.reduce(((e,t)=>{const i=Object.keys(t).filter((e=>e.toLowerCase().includes("id"))).map((e=>t[e]));return e.concat(i)}),[]);fetchPost("ai/asset/vidqu-batch-del",{ids:e},TOOL_API).then((e=>{$("#mio_popup").remove(),$(".operation-box").hide(),t.selectArr=[],200===e.code?t.getList():t.showError()})).catch((e=>{t.showError()}))}}showError(){ToolTipPop({type:"error",title:jsonData.myFiles.Failed,content:jsonData.myFiles.failed_text1,btn:jsonData.myFiles.OK})}isMobile(){return/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)}async downloadFiles(e){return new Promise((async(t,i)=>{let a=this;const n=document.getElementById("downloadBatch"),o=document.querySelector(".loading-animation");n.style.display="none",o.style.display="inline-block",o.style.opacity="0.5",o.style.pointerEvents="none",gtag("event","download_vidqmyfiles_res");try{if(e.length>1){const i=new JSZip,a=e[0].name,n=new Set;for(const t of e){const{id:e,ext:a,urlkey:o,url_key:s}=t;let l=t.name,d=`${l}.${a}`;if(n.has(d)){let e=1;for(;n.has(`${l}(${e}).${a}`);)e++;d=`${l}(${e}).${a}`}n.add(d);const r=await fetchPost("ai/source/get-access-url",{key:o||s,action:"download",file_name:d},TOOL_API),c=await fetch(r.data.url),p=await c.blob();i.file(d,p)}i.generateAsync({type:"blob"}).then((function(e){const t=document.createElement("a");t.href=URL.createObjectURL(e),t.download=`${a}.zip`,document.body.appendChild(t),t.click(),document.body.removeChild(t)})),t()}else{const{url:i,name:n,ext:o,urlkey:s,url_key:l}=e[0],d=`${n}.${o}`;try{const e=await fetchPost("ai/source/get-access-url",{key:s||l,action:"download",file_name:d},TOOL_API);if(200===e.code){if(!await getFileUrlRequest(e.data.url))return void ToolTipPop({type:"error",title:jsonData.myFiles.Failed,content:jsonData.myFiles.downloadError,btn:jsonData.myFiles.OK})}const t=document.createElement("a");t.href=e.data.url,t.download=d,document.body.appendChild(t),t.click(),document.body.removeChild(t)}catch(e){a.showError()}t()}}catch(e){console.log(e.message,2222)}finally{n.style.display="inline-block",o.style.display="none",o.style.opacity="1",o.style.pointerEvents="auto"}}))}handleNameChange(e,t,i){$(i).attr("data-name",t);let a=this.listData.find((t=>t.id===e));a&&(a.name=t),fetchPost("ai/asset/vidqu-edit",{id:e,name:t},TOOL_API).then((e=>{console.log(e)}))}cardBindEvents(){let e=this;$(".more-container").hover((function(){$(this).find(".dropdown-menu").show()}),(function(){$(this).find(".dropdown-menu").hide()})),$(".template-name").on("click",(function(){const t=$(this),i=t.siblings(".name-input");t.addClass("hidden"),i.removeClass("hidden").focus(),i[0].select();const a=t.text().trim();i.off("blur").on("blur",(function(){let n=i.val().trim();(""===n||n===a||/^\s*$/.test(n)||n.length>100)&&(n=a),t.text(n).removeClass("hidden"),i.addClass("hidden"),t.closest(".template-card").removeData("name"),e.handleNameChange(t.closest(".template-card").data("id"),n,t.closest(".template-card"))})),i.off("keydown").on("keydown",(function(e){"Enter"===e.key&&i.blur()})),i.off("input").on("input",(function(e){this.value=this.value.replace(/[^\p{L}\p{N}\s]/gu,"")}))})),$(".more-btn-m").click((function(){var t=$(this).closest(".template-bottom-box").find(".template-name").text();e.selectData={id:e.getCardValue(this,"id"),url:e.getCardValue(this,"url"),name:t,ext:e.getCardValue(this,"ext"),urlkey:e.getCardValue(this,"urlkey"),taskId:e.getCardValue(this,"taskid"),dom:this},1==e.getCardValue(this,"type")?$(".item-share").show():$(".item-share").hide(),$(".more-dropdown-menu-m").hide(),$(".more-operation-box").show(),$(".more-dropdown-menu-m").slideDown()})),$(".item-rename").on("click",(function(t){gtag("event","cilck_vidqmyfiles_rename"),t.stopPropagation();let i=$(this).closest(".template-card");e.isMobile()&&(i=$(e.selectData.dom).closest(".template-card"));let a=i.find(".template-name"),n=i.find(".name-input");const o=a.text().trim();a.addClass("hidden"),n.removeClass("hidden").focus(),n[0].select(),n.off("blur").on("blur",(function(){let t=n.val().trim();(""===t||t===o||/^\s*$/.test(t)||t.length>100)&&(console.log("error!"),t=o),a.text(t).removeClass("hidden"),n.addClass("hidden"),t!==o&&(i.removeData("name"),e.handleNameChange(i.data("id"),t,i))})),n.off("keydown").on("keydown",(function(e){"Enter"===e.key&&n.blur()})),n.off("input").on("input",(function(e){this.value=this.value.replace(/[^\p{L}\p{N}\s]/gu,"")}))})),$(".preview-share").click((function(t){t.preventDefault(),gtag("event","share_vidqmyfiles_res"),shareDialogEl.changeTips({title:e.getLangJson("share_title",{val:e.previewData.name}),content:e.getLangJson("share_content")}),shareDialogEl.showShare({url:e.previewData.url,action:"",imageKey:e.previewData.urlkey,id:e.previewData.taskId,text:textContentObj.share__text,task_id:e.previewData.taskId,btoaUrl:btoa(e.previewData.urlkey+","+getPreferredLanguage()),backParams:function(t){return{id:e.previewData.taskId,key:t.merge_key}}})})),$(".preview-download").off("click").click((function(){e.downloadFiles([e.previewData])})),$("more-container").click((function(e){e.stopImmediatePropagation()})),$(".item-preview").click((function(){gtag("event","click_vidqmyfiles_preview")})),$(".template-card-bg").click((function(){gtag("event","show_vidqmyfiles_fileprofile")})),$(".item-preview,.template-card-bg").click((function(t){if(gtag("event","show_vidqmyfiles_preview"),t.stopPropagation(),$(".dropdown-menu").hide(),e.previewData={cover:e.getCardValue(this,"cover"),url:e.getCardValue(this,"url"),name:$(this).closest(".template-card").find(".template-name").text(),ext:e.getCardValue(this,"ext"),urlkey:e.getCardValue(this,"urlkey"),taskId:e.getCardValue(this,"taskid")},e.isMobile()&&"template-card-bg"!==$(this).attr("class")&&(e.previewData=e.selectData),"png"===e.previewData.ext)$(".preview-img").attr("src",e.previewData.url),$(".video-container").hide(),$(".img-container").show(),$(".preview-share").show();else{const t=`\n                <div class="controls">                   \n                    <img src="/dist/img/my-files/icon_video_play.svg" id="play-btn" class="play-btn" alt="Play">\n                    <div class="progress-container" id="progress-container">\n                        <div class="progress" id="progress"></div>\n                    </div>\n                    <div class="time-display" id="time-display">00:00/${$(this).closest(".template-card").find(".tag-right").text()}</div>\n                </div>\n                <video id="video" src="${e.previewData.url}" poster="${e.previewData.cover}" style="width: 568px; height: 307px;"></video>\n                `;$(".video-container").append(t),$(".video-container").show(),$(".img-container").hide(),$(".preview-share").hide(),e.playVideo()}$(".preview-large-box").css("display","flex")})),$("#downloadBatch").off("click").click((async function(){await e.downloadFiles(e.selectArr),$(".operation-box").addClass("hidden").fadeOut(300,(function(){$(this).removeClass("hidden")})),$(".custom-radio").removeClass("selected"),e.selectArr=[],e.updateOperationBox()})),$("#shareIcon,.item-share").click((function(t){t.stopPropagation(),gtag("event","share_vidqmyfiles_res");let i=document.querySelector("#shareDialogEl"),a=e.getCardValue(this,"taskid"),n=e.getCardValue(this,"url"),o=e.getCardValue(this,"urlkey"),s=e.getCardValue(this,"ext");var l=$(this).closest(".template-bottom-box").find(".template-name").text()||$(this).closest(".template-card").find(".template-name").text();e.isMobile()&&(a=e.selectData.taskId,n=e.selectData.url,o=e.selectData.urlkey,s=e.selectData.ext,l=e.selectData.name);i.changeTips({title:e.getLangJson("share_title",{val:l}),content:e.getLangJson("share_content")}),i.showShare({url:n,action:"",imageKey:o,id:a,title:"",text:textContentObj.share__text,task_id:a,btoaUrl:btoa(o+","+getPreferredLanguage()),backParams:function(e){return{id:a,key:e.merge_key}}})})),$(".item-download,#downloadIcon,#downloadIconM").off("click").click((async function(t){$(this).css({pointerEvents:"none"}),t.stopPropagation();let i=$(this).attr("id"),a={url:e.getCardValue(this,"url"),name:e.getCardValue(this,"name"),ext:e.getCardValue(this,"ext"),urlkey:e.getCardValue(this,"key")};e.isMobile()&&"downloadIconM"!==i&&(a=e.selectData),await e.downloadFiles([a]),$(this).css({pointerEvents:""})})),$(".item-delete").click((function(t){t.stopPropagation(),gtag("event","click_vidqmyfiles_delete");var i=e.getCardValue(this,"id");e.isMobile()&&(i=e.selectData.id),gtag("event","show_vidqmyfiles_confirm"),ToolTipPop({secondBtn:e.getLangJson("Delete"),type:"error",title:e.getLangJson("Delete"),content:e.getLangJson("cannotReversed"),btn:e.getLangJson("Cancel")}),e.secondPopupBtn({btnText:jsonData.myFiles.delete,callback:()=>{gtag("event","click_vidqmyfiles_confirm"),$(".second-btn").css({display:"flex","justify-content":"center","align-items":"center","pointer-events":"none"}).empty().html(' <img src="/dist/img/my-files/icon_loading.svg" id="loadingAnimation" style="height:24px;width:24px">'),$(".mio_popup").css("pointer-events","none"),e.deleteData([{id:i}])}})})),$("#deleteBatch").off("click").click((()=>{gtag("event","show_vidqmyfiles_confirm"),ToolTipPop({secondBtn:e.getLangJson("Delete"),type:"error",title:e.getLangJson("Delete"),content:e.getLangJson("cannotReversed"),btn:e.getLangJson("Cancel")}),e.secondPopupBtn({btnText:jsonData.myFiles.delete,callback:()=>{gtag("event","click_vidqmyfiles_confirm"),$(".second-btn").css({display:"flex","justify-content":"center","align-items":"center","pointer-events":"none"}).empty().html(' <img src="/dist/img/my-files/icon_loading.svg" id="loadingAnimation" style="height:24px;width:24px">'),e.deleteData(e.selectArr)}})})),$(".custom-radio").on("click",(function(t){t.stopPropagation();let i=$(this).closest(".template-card").data("id");$(this).toggleClass("selected"),$(this).hasClass("selected")?e.selectArr.push(e.listData.find((e=>e.id===i))):e.selectArr=e.selectArr.filter((e=>e.id!==i)),e.updateOperationBox()}))}updateOperationBox(){let e;e=this.selectArr.length<2?"file":"files",$("#filesNumber").text(this.selectArr.length+" "+e),this.selectArr.length>0?$(".operation-box").show():$(".operation-box").hide()}secondPopupBtn(e){let{btnText:t,callback:i}=e,a=`<div class="second-btn">${t}</div>`;$(".popup_box .mio_popup .popup_container").after(a),$(".popup_box .mio_popup .second-btn").one("click",(function(t){i({e:t,data:e})}))}}window.ToolTipPop=ToolTip;var ToolTip=function(e){const{text:t="",type:i="",showtime:a=""}=e;$("body").append(`\n      <bottom-message\n        text="${t}"\n        type="${i}"\n        showtime="${a}"\n        >\n      </bottom-message>`)};function getFileUrlRequest(e){return new Promise(((t,i)=>{var a=new XMLHttpRequest;a.open("GET",e,!0),a.send(),a.addEventListener("readystatechange",(function(e){if(2==a.readyState){let e=a.getResponseHeader("Content-Length");t(!!(e&&e/1024>1)),a.abort()}}),!1)}))}$((function(){initLoginDialog(),gtag("event","open_vidqmyfiles_page"),(new MyFiles).init()}));