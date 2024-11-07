let textContentObj = lan.faceSwapPop;
class MyFiles {
  constructor() {
    this.listData = [];
    this.selectArr = [];
    this.previewData = {};
    (this.pageData = {
      pageSize: 28, // set page number to default
      page: 1,
      type: 0,
      name: "",
      total: 0,
      count: 0,
    }),
      (this.limitFirstShow = true);
    this.selectData = {};
  }

  init() {
    if (!getCookie("access_token")) {
      window.location.href = "/";
      return;
    }
    this.bindEvents();
    this.getList();
    $("#searchMyfileInput").hide();
    setTimeout(()=>{
      $("#searchMyfileInput").show();
      $("#searchMyfileInput").val('');
    },1000)
    // this.getFromPage();
  }

  getFromPage() {
    const params = new URLSearchParams(window.location.search);
    const fromValue = params.get("from");
    $("#fromPage").text(fromValue);
  }
  getCardValue(dom, value) {
    return $(dom).closest(".template-card").data(value);
  }

  generatePagination(pageCount) {
    let self = this;
    const $pages = $(".pages");
    $pages.empty();
    if (pageCount < 2) {
      $(".pagination-box").hide();
      return;
    } else {
      $(".pagination-box").show();
    }

    const maxPagesToShow = 5;
    const halfMaxPages = Math.floor(maxPagesToShow / 2);
    let startPage, endPage;

    if (pageCount <= maxPagesToShow) {
      startPage = 1;
      endPage = pageCount;
    } else {
      if (self.pageData.page <= halfMaxPages) {
        startPage = 1;
        endPage = maxPagesToShow;
      } else if (self.pageData.page + halfMaxPages >= pageCount) {
        startPage = pageCount - maxPagesToShow + 1;
        endPage = pageCount;
      } else {
        startPage = self.pageData.page - halfMaxPages;
        endPage = self.pageData.page + halfMaxPages;
      }
    }

    if (endPage > pageCount) {
      endPage = pageCount;
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      const $pageItem = $("<li>", {
        class: "page-item",
        text: i,
      });
      $pageItem.on("click", function () {
        self.goToPage(i);
      });
      $pages.append($pageItem);
    }

    // Show pagination box
    $(".pagination-box").show();
    self.updatePagination();
  }

  goToPage(page) {
    let self = this;
    if (page < 1 || page > this.pageData.total) return;
    this.pageData.page = page;
    this.getList();
    self.updatePagination();
    console.log("Current page:", this.pageData.page);
  }

  updatePagination() {
    let self = this;
    $(".page-item").removeClass("active");
    $(".page-item")
      .filter(function () {
        return $(this).text() == self.pageData.page;
      })
      .addClass("active");

    self.pageData.page === 1 ? $(".prev-page").addClass("disabled") : $(".prev-page").removeClass("disabled");
    self.pageData.page === self.pageData.total
      ? $(".next-page").addClass("disabled")
      : $(".next-page").removeClass("disabled");
  }

  getList() {
    $(".operation-box").hide();
    this.selectArr = [];
    $(".no-content").hide();
    $(".template").children().not(".no-content").remove();
    this.loadSkeleton();

    let self = this;
    fetchGet(
      `ai/asset/vidqu-list?pageSize=${self.pageData.pageSize}&page=${self.pageData.page}&type=${self.pageData.type}&name=${self.pageData.name}`
    ).then((res) => {
      if (res.code !== 200) {
        self.showError();
        return;
      }

      if (res.data.list.length === 0) {
        gtag("event", "show_vidqmyfiles_tipsvidfs");
        $(".no-content").show();
        if (self.pageData.type == 0 && self.pageData.name == "" && self.pageData.page == 1) {
          $(".go-to-create").show();
          $(".title-right").css("pointer-events", "none");
          $(".filter-input").css("pointer-events", "none");
          $(".no-results").hide();
        } else {
          $(".go-to-create").hide();
          $(".no-results").show();
        }
        $(".template").children().not(".no-content").remove();
        $("#dataTotal").text(res.data.total);
        $(".pagination-box").hide();
        return;
      }
      $(".title-right").css("pointer-events", "");
      $(".filter-input").css("pointer-events", "");
      $(".no-content").hide();
      $(".template").children().not(".no-content").remove();

      this.checkMemory(res.data.memory);
      $("#dataTotal").text(res.data.total);
      this.pageData.total = res.data.pageCount;
      self.generatePagination(res.data.pageCount);
      let list = res.data.list;
      self.listData = list;
      var $templateContainer = $(".template");

      list.forEach(function (item) {
        let imageUrl;
        let displayText;
        let playIcon = "";
        let shareIconHtml = "";
        let itemShareHtml = "";

        if (item.type === 2) {
          imageUrl = item.cover;
          displayText = formatDuration(item.duration);
          playIcon = `<img src="/dist/img/my-files/icon_video_play.svg" class="play-icon">`;
        } else {
          imageUrl = item.url;
          displayText = `${item.width}X${item.height}`;
          shareIconHtml = `<img src="/dist/img/my-files/icon_share.svg" id="shareIcon" class="btn-icon">`;
          itemShareHtml = `
                        <div class="item item-share">
                            <img src="/dist/img/my-files/icon_win_Share.svg" class="item-icon">
                            <div class="item-text">${self.getLangJson('share')}</div>
                        </div>
                    `;
        }

        var cardHtml = `
                <div class="template-card" data-id="${item.id}" data-url="${item.url}" data-name="${
          item.name
        }" data-type="${item.type}"
                    data-ext="${item.ext}" data-urlkey="${item.url_key}" data-taskId="${item.task_id}" data-key="${
          item.url_key
        }" data-cover="${item.cover}"
                >
                    <div class="template-card-bg">
                        ${playIcon}
                        <img src="${imageUrl}" >
                        <div class="template-card-bg-tag">
                            <div class="tag-left">${item.ext}</div>
                            <div class="tag-right">${displayText}</div>
                        </div>
                        <svg id="downloadIconM" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="30" height="30" viewBox="0 0 30 30" class="card-download m-show">
                            <defs>
                            <clipPath id="clip-path">
                                <rect id="_1" data-name="1" width="20" height="20" transform="translate(0)" stroke="#707070" stroke-width="1"/>
                            </clipPath>
                            </defs>
                            <g id="icon_download" transform="translate(-596 -301)">
                            <rect id="" data-name=" 31971" width="30" height="30" rx="5" transform="translate(596 301)" fill="#fff" opacity="0.797"/>
                            <g id="icon_download-2" data-name="icon_download" transform="translate(601 306)">
                                <g id="icon_download-3" data-name="icon_download" clip-path="url(#clip-path)">
                                <path id="_1-2" data-name="1" d="M16.494,8.123l-3.642,3.642V.516a.839.839,0,0,0-1.678,0V11.765L7.533,8.123A.839.839,0,0,0,6.347,9.309l5.074,5.074a.817.817,0,0,0,.275.182l.013,0a.818.818,0,0,0,.612,0l.013,0a.864.864,0,0,0,.275-.182l5.074-5.074a.84.84,0,0,0-1.188-1.186Zm1.428,6.589H6.1a.839.839,0,1,0,0,1.678H17.922a.839.839,0,0,0,0-1.678Z" transform="translate(-1.981 0.967)"/>
                                </g>
                            </g>
                            </g>
                        </svg>
                      
                        <div class="custom-radio">
                            <div class="checkmark"></div>
                        </div>
                        <div class="more-container">
                            <div class="more-btn">
                                <div class="circle"></div><div class="circle"></div><div class="circle"></div>
                                <div class="dropdown-menu">
                                    <div class="item item-preview">
                                        <img src="/dist/img/my-files/icon_win_Preview.svg" class="item-icon">
                                        <div class="item-text">${self.getLangJson('preview')}</div>
                                    </div>
                                    ${itemShareHtml}
                                    <div class="item item-download">
                                        <img src="/dist/img/my-files/icon_win_download.svg" class="item-icon">
                                        <div class="item-text">${self.getLangJson('download')}</div>
                                    </div>
                                    <div class="item item-rename">
                                        <img src="/dist/img/my-files/icon_win_Rename.svg" class="item-icon">
                                        <div class="item-text">${self.getLangJson('rename')}</div>
                                    </div>
                                    <div class="item item-delete">
                                        <img src="/dist/img/my-files/icon_win_delete.svg" class="item-icon">
                                        <div class="item-text">${self.getLangJson('delete')}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="template-bottom-box">
                        <div class="template-des">
                            <div class="template-name" tabindex="0">${item.name}</div>
                            <input  maxlength="100" type="text" class="name-input hidden" value="${item.name}">     
                            <div class="template-date">${self.someTimeAgo(item.created_at)}</div>
                        </div>
                        <div class="template-icon-box pc-show">
                            ${shareIconHtml}
                            <img src="/dist/img/my-files/icon_download.svg" id="downloadIcon" class="btn-icon">
                        </div>

                        <div class="more-btn-m m-show">
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>
                    </div>
                </div>
                `;
        $templateContainer.append(cardHtml);
      });

      this.cardBindEvents();

      function formatDuration(seconds) {
        let minutes = Math.floor(seconds / 60);
        let remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
      }
    });
  }
  someTimeAgo(time) {
    //* 1000 back -end used in seconds are units
    let oldTime = new Date(time * 1000).getTime();
    let thatTime = new Date().getTime();
    let s = (thatTime - oldTime) / 1000;
    let timeStr = "";
    if (s <= 60) {
      timeStr = this.getLangJson("someTimeAgo_s");
    } else if (s / 60 <= 60) {
      timeStr = this.getLangJson("someTimeAgo_m", { val: parseInt(s / 60) });
    } else if (s / 3600 <= 24) {
      timeStr = this.getLangJson("someTimeAgo_h", { val: parseInt(s / 3600) });
    } else if (s / 3600 <= 24 * 2) {
      timeStr = this.getLangJson("Yesterday");
    } else if (s / 3600 <= 24 * 30) {
      timeStr = this.getLangJson("someTimeAgo_d", { val: parseInt(s / 3600 / 24) });
    } else {
      timeStr = moment(oldTime).format("MMM D, YYYY");
    }
    return timeStr;
  }

  //Language
  getLangJson(name, valData = {}, bool = false) {
    if (bool) {
      let num = valData.val;
      if (typeof num === "string") {
        let strWithoutCommas = num.replace(/,/g, "");
        num = parseFloat(strWithoutCommas);
      }

      if (num !== 1) {
        name += "_p"; //Single multiple
      }
    }
    let str = jsonData.myFiles[name];
    for (let key in valData) {
      const regex = new RegExp(`{{${key}}}`, "g");
      str = str.replace(regex, valData[key]);
    }
    // console.log(str)
    return str;
  }

  checkMemory(bytes) {
    const fiveMB = 5 * 1024 * 1024;
    const twentyMB = 20 * 1024 * 1024;
    if (bytes < fiveMB) {
      gtag("event", "show_vidqmyfiles_tipslimited");

      $(".limit-tips").css("display", "flex");
      $(".limit-text-left").css("color", "#DA7F3B");
      $(".limit-text-left").text(jsonData.myFiles.limitText2);
    } else if (bytes >= fiveMB && bytes <= twentyMB) {
      gtag("event", "show_vidqmyfiles_tipslimited_a");
      $(".limit-text-left").css("color", "#000");
      $(".limit-tips").css("display", "flex");
      $(".limit-text-left").text(jsonData.myFiles.limitText1);
    } else {
      $(".limit-tips").hide();
    }
  }
  loadSkeleton() {
    const numItems = 12;
    const $template = $(".template");

    for (let i = 0; i < numItems; i++) {
      const $skeleton = $("<div>", { class: "skeleton-container" }).append(
        $("<div>", { class: "skeleton" }),
        $("<div>", { class: "skeleton-row" }).append(
          $("<div>", { class: "skeleton-item", style: "width: 301px; height: 14px;" }),
          $("<div>", { class: "skeleton-item", style: "width: 261px; height: 14px;" })
        )
      );
      $template.append($skeleton);
    }
  }
  bindEvents() {
    let self = this;
    $(".share-Twitter").click(function () {
      gtag("event", "share_vidqmyfiles_tw");
    });
    $(".share-Facebook").click(function () {
      gtag("event", "share_vidqmyfiles_fb");
    });
    $(".share-link").click(function () {
      gtag("event", "share_vidqmyfiles_link");
    });

    $(".limit-button").click(function () {
      let isNearLimit = $(".limit-text-left").text() == "You are nearing maximum storage capacity.";
      let gtagVal = isNearLimit ? "cilck_vidqmyfiles_tipslimited_a" : "cilck_vidqmyfiles_tipslimited";
      gtag("event", gtagVal);
      setCookie("st", "myfiletips");
      window.open("/ai-tool-pricing.html", "_blank");
    });
    $(".operation-cancel").on("click", function () {
      $(".operation-box")
        .addClass("hidden")
        .fadeOut(300, function () {
          $(this).removeClass("hidden");
        });

      $(".custom-radio").removeClass("selected");
      self.selectArr = [];
      self.updateOperationBox();
    });

    $(".icon-close").click(function () {
      $(".video-container").empty();
      const video = document.getElementById("video");
      $(".preview-large-box").hide();
    });
    $(".filter-select").on("click", function (e) {
      e.stopPropagation();
      $(".filter-dropdown-menu").toggle();
    });

    $(".filter-dropdown-menu-m .item").on("click", function (e) {
      e.stopPropagation();
      const value = Number($(this).data("value"));
      self.pageData.type = value;
      self.getList();
      $(".filter-dropdown-menu-m .item").removeClass("active");
      $(this).addClass("active");
      $(".filter-dropdown-menu-box").hide();
    });

    $(".filter-select-m").on("click", function (e) {
      e.stopPropagation();
      $(".filter-dropdown-menu-m").hide();

      $(".filter-dropdown-menu-box").show();
      $(".filter-dropdown-menu-m").slideDown();
    });

    $(document).on("click", function () {
      // $('.more-operation-box').hide();
      $(".filter-dropdown-menu-box").hide();
    });

    $(".cancel-btn,.more-dropdown-menu-m .item").on("click", function () {
      $(".more-operation-box").hide();
    });

    $(document).on("click", function () {
      $(".filter-dropdown-menu").hide();
    });

    $(".filter-dropdown-menu").on("click", function (e) {
      e.stopPropagation();
    });
    $(".filter-dropdown-menu .item").on("click", function () {
      const value = Number($(this).data("value"));
      $("#filterText").text($(this).text()).css("color", "#202124");
      $(".filter-dropdown-menu").hide();
      self.pageData.type = value;
      self.getList();
    });
    function debounce(func, delay) {
      let timer;
      return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), delay);
      };
    }

    const handleInputDebounced = debounce(function () {
      var inputValue = $("#searchMyfileInput").val();
      self.pageData.name = inputValue;
      self.getList();
    }, 300);

    $("#searchMyfileInput").on("input", handleInputDebounced);

    $(".next-page").on("click", function () {
      if (self.pageData.page < self.pageData.total) {
        self.goToPage(self.pageData.page + 1);
      }
    });

    $(".prev-page").on("click", function () {
      if (self.pageData.page > 1) {
        self.goToPage(self.pageData.page - 1);
      }
    });

    $(".go-to-btn").click(function () {
      gtag("event", "cilck_vidqmyfiles_tipsvidfs");
      window.location.href = "/face-swap.html";
    });
  }

  playVideo() {
    let self = this;
    const video = document.getElementById("video");
    const playBtn = document.getElementById("play-btn");
    const progressContainer = document.getElementById("progress-container");
    const progress = document.getElementById("progress");
    const timeDisplay = document.getElementById("time-display");

    // Format time to mm:ss
    function formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }

    // Update progress bar and time display
    function updateUI() {
      const currentTime = video.currentTime;
      const duration = video.duration;

      const percent = (currentTime / duration) * 100;
      progress.style.width = `${percent}%`;
      timeDisplay.textContent = `${formatTime(currentTime)}/${formatTime(duration)}`;
    }

    // Handle video metadata loading
    video.addEventListener("loadedmetadata", () => {
      timeDisplay.textContent = `00:00/${formatTime(video.duration)}`;
    });

    // Update play button icon based on play/pause state
    function updatePlayButton() {
      if (video.paused) {
        playBtn.src = "/dist/img/my-files/icon_video_play.svg";
      } else {
        playBtn.src = "/dist/img/my-files/icon_video_pause.svg";
      }
    }

    playBtn.addEventListener("click", () => {
      if (video.paused) {
        video.play().catch((error) => {
          console.error("Error playing video:", error);
          if (!error.includes("media was removed from the document.")) {
            self.showError();
          }
        });
      } else {
        video.pause();
      }
    });

    video.addEventListener("timeupdate", updateUI);

    // Listen for play and pause events to update the icon
    video.addEventListener("play", updatePlayButton);
    video.addEventListener("pause", updatePlayButton);

    // Seek video when progress bar is clicked
    progressContainer.addEventListener("click", (e) => {
      const width = progressContainer.clientWidth;
      const clickX = e.offsetX;
      const duration = video.duration;

      video.currentTime = (clickX / width) * duration;
    });

    video.addEventListener("ended", () => {
      playBtn.src = "/dist/img/my-files/icon_video_play.svg";
    });

    video.addEventListener("error", (e) => {
      console.error("Video load error:", e);
    });
  }

  deleteData(idArr) {
    let self = this;
    if (idArr.length === 1) {
      fetchPost("ai/asset/vidqu-del", { id: idArr[0].id }, TOOL_API)
        .then((res) => {
          $("#mio_popup").remove();
          $(".operation-box").hide();
          if (res.code === 200) {
            self.getList();
          } else {
            self.showError();
          }
        })
        .catch((err) => {
          self.showError();
        });
    } else {
      const ids = self.selectArr.reduce((acc, obj) => {
        const idValues = Object.keys(obj)
          .filter((key) => key.toLowerCase().includes("id"))
          .map((key) => obj[key]);
        return acc.concat(idValues);
      }, []);

      fetchPost("ai/asset/vidqu-batch-del", { ids }, TOOL_API)
        .then((res) => {
          $("#mio_popup").remove();
          $(".operation-box").hide();
          self.selectArr = [];
          if (res.code === 200) {
            self.getList();
          } else {
            self.showError();
          }
        })
        .catch((err) => {
          self.showError();
        });
    }
  }

  showError() {
    ToolTipPop({
      type: "error",
      title: jsonData.myFiles.Failed,
      content: jsonData.myFiles.failed_text1,
      btn: jsonData.myFiles.OK,
    });
  }
  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  async downloadFiles(files) {
    return new Promise(async (resolve, reject) => {
      let self = this;
      const downloadButton = document.getElementById("downloadBatch");
      const loadingAnimation = document.querySelector(".loading-animation");

      // Hide download button and show loading animation
      downloadButton.style.display = "none";
      loadingAnimation.style.display = "inline-block";
      loadingAnimation.style.opacity = "0.5"; // Make loading semi-transparent
      loadingAnimation.style.pointerEvents = "none"; // Disable clicking on loading animation

      gtag("event", "download_vidqmyfiles_res");

      try {
        if (files.length > 1) {
          const zip = new JSZip();
          const firstFileName = files[0].name; // Get the first file's name
          const fileNameSet = new Set(); // Track unique file names

          for (const file of files) {
            const { id, ext, urlkey, url_key } = file;
            let name = file.name;
            let fileName = `${name}.${ext}`;

            if (fileNameSet.has(fileName)) {
              let count = 1;
              while (fileNameSet.has(`${name}(${count}).${ext}`)) {
                count++;
              }
              fileName = `${name}(${count}).${ext}`;
            }
            fileNameSet.add(fileName); // Add the file name to the Set

            const res = await fetchPost(
              "ai/source/get-access-url",
              {
                key: urlkey || url_key,
                action: "download",
                file_name: fileName,
              },
              TOOL_API
            );

            const response = await fetch(res.data.url);
            const blob = await response.blob();

            zip.file(fileName, blob);
          }

          zip.generateAsync({ type: "blob" }).then(function (content) {
            const a = document.createElement("a");
            a.href = URL.createObjectURL(content);
            a.download = `${firstFileName}.zip`; // first file name set to zip name
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          });
          resolve();
        } else {
          const { url, name, ext, urlkey, url_key } = files[0];
          const fileName = `${name}.${ext}`;

          try {
            const res = await fetchPost(
              "ai/source/get-access-url",
              {
                key: urlkey || url_key,
                action: "download",
                file_name: fileName,
              },
              TOOL_API
            );
            if(res.code === 200){
              let bool = await getFileUrlRequest(res.data.url);
              if(!bool){
                // file not found
                ToolTipPop({
                  type: "error",
                  title: jsonData.myFiles.Failed,
                  content: jsonData.myFiles.downloadError,
                  btn: jsonData.myFiles.OK,
                });
                return;
              }
            }
            const a = document.createElement("a");
            a.href = res.data.url;
            a.download = fileName;

            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          } catch (err) {
            self.showError();
          }
          resolve();
        }
      } catch (error) {
        console.log(error.message, 2222);
        // self.showError();
      } finally {
        // Show download button and hide loading animation
        downloadButton.style.display = "inline-block";
        loadingAnimation.style.display = "none";
        loadingAnimation.style.opacity = "1"; //
        loadingAnimation.style.pointerEvents = "auto"; //
      }
    });
  }

  handleNameChange(id, name, dom) {
    $(dom).attr("data-name", name);
    let file = this.listData.find((item) => item.id === id);
    if (file) file.name = name;

    fetchPost("ai/asset/vidqu-edit", { id, name }, TOOL_API).then((res) => {
      console.log(res);
    });
  }

  cardBindEvents() {
    let self = this;
    $(".more-container").hover(
      function () {
        $(this).find(".dropdown-menu").show();
      },
      function () {
        $(this).find(".dropdown-menu").hide();
      }
    );
    $(".template-name").on("click", function () {
      const $this = $(this);
      const $input = $this.siblings(".name-input");

      $this.addClass("hidden");
      $input.removeClass("hidden").focus();
      $input[0].select();

      const oldName = $this.text().trim();

      $input.off("blur").on("blur", function () {
        let newName = $input.val().trim();

        if (newName === "" || newName === oldName || /^\s*$/.test(newName) || newName.length > 100) {
          newName = oldName;
        }

        $this.text(newName).removeClass("hidden");
        $input.addClass("hidden");
        $this.closest(".template-card").removeData("name");
        self.handleNameChange($this.closest(".template-card").data("id"), newName, $this.closest(".template-card"));
      });

      $input.off("keydown").on("keydown", function (e) {
        if (e.key === "Enter") {
          $input.blur();
        }
      });
      $input.off("input").on("input", function (e) {
        // this.value = this.value.replace(/[^a-zA-Z0-9\s]/g, '');
        this.value = this.value.replace(/[^\p{L}\p{N}\s]/gu, '');
      });
    });

    $(".more-btn-m").click(function () {
      var templateName = $(this).closest(".template-bottom-box").find(".template-name").text();
      self.selectData = {
        id: self.getCardValue(this, "id"),
        url: self.getCardValue(this, "url"),
        name: templateName,
        ext: self.getCardValue(this, "ext"),
        urlkey: self.getCardValue(this, "urlkey"),
        taskId: self.getCardValue(this, "taskid"),
        dom: this,
      };
      self.getCardValue(this, "type") == 1 ? $(".item-share").show() : $(".item-share").hide();
      $(".more-dropdown-menu-m").hide();
      $(".more-operation-box").show();
      $(".more-dropdown-menu-m").slideDown();
    });

    $(".item-rename").on("click", function (event) {
      gtag("event", "cilck_vidqmyfiles_rename");
      event.stopPropagation();

      let $card = $(this).closest(".template-card");
      if (self.isMobile()) $card = $(self.selectData.dom).closest(".template-card");
      let $nameElement = $card.find(".template-name");
      let $input = $card.find(".name-input");

      const oldName = $nameElement.text().trim();

      $nameElement.addClass("hidden");
      $input.removeClass("hidden").focus();

      $input[0].select();

      $input.off("blur").on("blur", function () {
        let newName = $input.val().trim();

        if (newName === "" || newName === oldName || /^\s*$/.test(newName) || newName.length > 100) {
          console.log("error!");
          newName = oldName;
        }

        $nameElement.text(newName).removeClass("hidden");
        $input.addClass("hidden");

        if (newName !== oldName) {
          $card.removeData("name");
          self.handleNameChange($card.data("id"), newName, $card);
        }
      });

      $input.off("keydown").on("keydown", function (e) {
        if (e.key === "Enter") {
          $input.blur();
        }
      });
      
      $input.off("input").on("input", function (e) {
        // this.value = this.value.replace(/[^a-zA-Z0-9\s]/g, '');
        this.value = this.value.replace(/[^\p{L}\p{N}\s]/gu, '');
      });
    });

    $(".preview-share").click(function (e) {
      e.preventDefault();
      gtag("event", "share_vidqmyfiles_res");
      shareDialogEl.changeTips({
        title: self.getLangJson('share_title',{val: self.previewData.name}) ,
        content: self.getLangJson('share_content'),
      });
      function backParams(data) {
        return {
          id: self.previewData.taskId,
          key: data.merge_key,
        };
      }
      shareDialogEl.showShare({
        url: self.previewData.url,
        action: "",
        imageKey: self.previewData.urlkey,
        id: self.previewData.taskId,
        
        text: textContentObj.share__text,
        task_id: self.previewData.taskId,
        btoaUrl: btoa(self.previewData.urlkey + "," + getPreferredLanguage()),
        // genBtoaUrl,
        backParams,
      });
    });

    $(".preview-download")
      .off("click")
      .click(function () {
        self.downloadFiles([self.previewData]);
      });
    $("more-container").click(function (event) {
      event.stopImmediatePropagation();
    });
    // open the preview dialog

    $(".item-preview").click(function () {
      gtag("event", "click_vidqmyfiles_preview");
    });
    $(".template-card-bg").click(function () {
      gtag("event", "show_vidqmyfiles_fileprofile");
    });
    $(".item-preview,.template-card-bg").click(function (event) {
      gtag("event", "show_vidqmyfiles_preview");
      event.stopPropagation();
      $(".dropdown-menu").hide();
      self.previewData = {
        cover: self.getCardValue(this, "cover"),
        url: self.getCardValue(this, "url"),
        name: $(this).closest(".template-card").find(".template-name").text(),
        ext: self.getCardValue(this, "ext"),
        urlkey: self.getCardValue(this, "urlkey"),
        taskId: self.getCardValue(this, "taskid"),
      };
      if (self.isMobile() && $(this).attr("class") !== "template-card-bg") self.previewData = self.selectData;
      if (self.previewData.ext === "png") {
        $(".preview-img").attr("src", self.previewData.url);
        $(".video-container").hide();
        $(".img-container").show();
        $(".preview-share").show();
      } else {
        const videoContent = `
                <div class="controls">                   
                    <img src="/dist/img/my-files/icon_video_play.svg" id="play-btn" class="play-btn" alt="Play">
                    <div class="progress-container" id="progress-container">
                        <div class="progress" id="progress"></div>
                    </div>
                    <div class="time-display" id="time-display">00:00/${$(this)
                      .closest(".template-card")
                      .find(".tag-right")
                      .text()}</div>
                </div>
                <video id="video" src="${self.previewData.url}" poster="${
          self.previewData.cover
        }" style="width: 568px; height: 307px;"></video>
                `;

        $(".video-container").append(videoContent);
        $(".video-container").show();
        $(".img-container").hide();
        $(".preview-share").hide();
        self.playVideo();
      }

      $(".preview-large-box").css("display", "flex");
    });

    $("#downloadBatch")
      .off("click")
      .click(async function () {
        await self.downloadFiles(self.selectArr);
        $(".operation-box")
          .addClass("hidden")
          .fadeOut(300, function () {
            $(this).removeClass("hidden");
          });

        $(".custom-radio").removeClass("selected");
        self.selectArr = [];
        self.updateOperationBox();
      });

    $("#shareIcon,.item-share").click(function (event) {
      event.stopPropagation();
      gtag("event", "share_vidqmyfiles_res");

      let shareDialogEl = document.querySelector("#shareDialogEl");
      let taskId = self.getCardValue(this, "taskid");
      let url = self.getCardValue(this, "url");
      let urlkey = self.getCardValue(this, "urlkey");
      let ext = self.getCardValue(this, "ext");
      // let name = self.getCardValue(this,"name");
      // let name = $(this).closest(".template-name").text()
      var name =
        $(this).closest(".template-bottom-box").find(".template-name").text() ||
        $(this).closest(".template-card").find(".template-name").text();

      if (self.isMobile()) {
        taskId = self.selectData.taskId;
        url = self.selectData.url;
        urlkey = self.selectData.urlkey;
        ext = self.selectData.ext;
        name = self.selectData.name;
      }
      let action = "";
      // ext == "png" ? (action = "aiattractivenesstestshare") : (action = "texttovideo");
      shareDialogEl.changeTips({
        title: self.getLangJson('share_title',{val: name}) ,
        content: self.getLangJson('share_content'),
      });
      function backParams(data) {
        return {
          id: taskId,
          key: data.merge_key,
        };
      }

      shareDialogEl.showShare({
        url,
        action,
        imageKey: urlkey,
        id: taskId,
        title: "",
        text: textContentObj.share__text,task_id: taskId,
        btoaUrl: btoa(urlkey + "," + getPreferredLanguage()),
        // genBtoaUrl,
        backParams,
      });
    });

    $(".item-download,#downloadIcon,#downloadIconM")
      .off("click")
      .click(async function (event) {
        $(this).css({
            pointerEvents: 'none'
        })
        event.stopPropagation();
        let thisId = $(this).attr("id");
        let data = {
          url: self.getCardValue(this, "url"),
          name: self.getCardValue(this, "name"),
          ext: self.getCardValue(this, "ext"),
          urlkey: self.getCardValue(this, "key"),
        };
        if (self.isMobile() && thisId !== "downloadIconM") {
          data = self.selectData;
        }
        await self.downloadFiles([data]);
        $(this).css({
            pointerEvents: ''
        })
      });
    $(".item-delete").click(function (event) {
      event.stopPropagation();
      gtag("event", "click_vidqmyfiles_delete");

      var id = self.getCardValue(this, "id");

      if (self.isMobile()) id = self.selectData.id;
      gtag("event", "show_vidqmyfiles_confirm");

      ToolTipPop({
        secondBtn: self.getLangJson('Delete'),
        type: "error",
        title: self.getLangJson('Delete'),
        content: self.getLangJson('cannotReversed'),
        btn: self.getLangJson('Cancel'), 
      });
      self.secondPopupBtn({
        btnText: jsonData.myFiles.delete,
        callback: () => {
          gtag("event", "click_vidqmyfiles_confirm");
          $(".second-btn")
            .css({
              display: "flex",
              "justify-content": "center",
              "align-items": "center",
              "pointer-events": "none",
            })
            .empty()
            .html(
              ` <img src="/dist/img/my-files/icon_loading.svg" id="loadingAnimation" style="height:24px;width:24px">`
            );
          // self.deleteData([{id}])
          $(".mio_popup").css("pointer-events", "none");

          self.deleteData([{ id }]);
        },
      });
    });

    $("#deleteBatch")
      .off("click")
      .click(() => {
        gtag("event", "show_vidqmyfiles_confirm");

        ToolTipPop({
          secondBtn: self.getLangJson('Delete'),
          type: "error",
          title: self.getLangJson('Delete'),
          content: self.getLangJson('cannotReversed'),
          btn: self.getLangJson('Cancel'), 
        });
        self.secondPopupBtn({
          btnText: jsonData.myFiles.delete,
          callback: () => {
            gtag("event", "click_vidqmyfiles_confirm");
            $(".second-btn")
              .css({
                display: "flex",
                "justify-content": "center",
                "align-items": "center",
                "pointer-events": "none",
              })
              .empty()
              .html(` <img src="/dist/img/my-files/icon_loading.svg" id="loadingAnimation" style="height:24px;width:24px">`);
            // self.deleteData([{id}])

            self.deleteData(self.selectArr);
          },
        });
      });

    $(".custom-radio").on("click", function (event) {
      event.stopPropagation();
      let cardId = $(this).closest(".template-card").data("id");
      $(this).toggleClass("selected");

      if ($(this).hasClass("selected")) {
        self.selectArr.push(self.listData.find((item) => item.id === cardId));
      } else {
        self.selectArr = self.selectArr.filter((item) => item.id !== cardId);
      }

      self.updateOperationBox();
    });
  }

  updateOperationBox() {
    let word;
    this.selectArr.length < 2 ? (word = "file") : (word = "files");
    $("#filesNumber").text(this.selectArr.length + " " + word);
    if (this.selectArr.length > 0) {
      $(".operation-box").show();
    } else {
      $(".operation-box").hide();
    }
  }

  secondPopupBtn(data) {
    let { btnText, callback } = data;
    // jsonData.myFiles.delete
    let html = `<div class="second-btn">${btnText}</div>`;
    $(".popup_box .mio_popup .popup_container").after(html);
    $(".popup_box .mio_popup .second-btn").one("click", function (e) {
      callback({
        e,
        data,
      });
    });
  }
}
window.ToolTipPop = ToolTip;
var ToolTip= function(params) {
    const { text = '', type = '', showtime = '' } = params
    $('body').append(`
      <bottom-message
        text="${text}"
        type="${type}"
        showtime="${showtime}"
        >
      </bottom-message>`)
  }

function getFileUrlRequest(fileURL) {
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", fileURL, true);
    xhr.send();
    xhr.addEventListener("readystatechange", processRequest, false);

    function processRequest(e) {
      if (xhr.readyState == 2) {
        // console.log(xhr.getResponseHeader('Content-Length'))
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

$(function () {
  // setCookie("access_token", "LklCMNJCnzHPIlrFxga48nQaQWboOALZ_1725865903")
  initLoginDialog();
  gtag("event", "open_vidqmyfiles_page");
  let myFiles = new MyFiles();
  myFiles.init();
  
});
