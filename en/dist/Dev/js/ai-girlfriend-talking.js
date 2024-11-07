let SOCKET;
let defaultUserAvatar = `/dist/img/aiFriend/icon_avatar.svg`;
const gfChattingLan = jsonData.aiGirlFriendChat;
const gfChattingJsLan = jsonData.aiGirlFriendChat.javascript;

class PromiseWait {
  constructor() {
    this.promise = new Promise((resolve) => {
      this.resolve = resolve;
    });
  }

  async wait() {
    return this.promise;
  }

  async finish() {
    this.resolve();
  }
}

class chatTooltip {
  $el = null;
  content = undefined;
  static initScroll = false;

  constructor(el, content) {
    this.$el = $(el);
    if (!this.$el.length) return;

    this.content = content;
    this.init();
    chatTooltip.initScrollEvent();
  }

  init() {
    const $tooltip = $('<div class="chat__tooltip"></div>');
    $tooltip.html(this.content);

    this.$el.on("mouseenter touchstart", () => {
      $("body").append($tooltip);
      const rect = this.$el.get(0).getBoundingClientRect();
      const tooltipWidth = $tooltip.outerWidth();
      const tooltipHeight = $tooltip.outerHeight();

      let tooltipX = rect.left + rect.width / 2 - tooltipWidth / 2;
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
        transform: `translate(${tooltipX}px, ${tooltipY}px)`,
      });

      $tooltip.stop().fadeIn(100);
    });

    this.$el.on("mouseleave", () => {
      $tooltip.stop().fadeOut(100, () => $tooltip.remove());
    });
  }

  static initScrollEvent() {
    if (this.initScroll) return;
    this.initScroll = true;
    $(window).on("scroll", () => {
      requestAnimationFrame(() => {
        const $allTooltips = $(".plan__tooltip");
        if (!$allTooltips.length) return;
        $allTooltips.fadeOut(100, () => $allTooltips.remove());
      });
    });
  }
}

class AiGirlfriendTalkingService {
  getMessageInfo(chat_id, page) {
    const params = new URLSearchParams({
      chat_id,
    });
    if (page > 0) {
      params.append("page", page.toString());
    }

    return fetchGet(`chat/user/get-message-info?${params.toString()}`);
  }

  getChatServer(data) {
    return fetchPost("chat/user/get-chat-server", data);
  }

  getRoleInfo(role_id, is_my_characters, my_characters_id) {
    const params = new URLSearchParams({
      id: role_id,
      is_my_characters,
    });
    if (my_characters_id && is_my_characters === 1) {
      params.append("my_characters_id", my_characters_id);
    }

    return fetchGet(`chat/user/get-role-info?${params.toString()}`);
  }

  putLike(roleId) {
    return fetchPost("chat/user/role-like", { role_id: roleId });
  }

  roleEdit(data) {
    return fetchPost("chat/user/role-edit", data);
  }

  getUploadUrl(data) {
    return fetchPost("ai/source/get-upload-url", data);
  }

  saveAudio(page, chatId, timestamp, path) {
    const data = {
      id: page,
      chat_id: chatId,
      task_timestamp: timestamp,
      path,
    };
    return fetchPost("chat/user/up-message", data);
  }

  getUploadFileUrl() {
    return fetchPost("ai/source/temp-upload-url", {
      file_name: "ai-girlfriend-audio.mp3",
    });
  }

  putUploadUrl(url, data) {
    return fetchPut(url, data);
  }

  putLog(data) {
    return fetchPost("chat/public/add-log", data);
  }

  getVoiceLimit() {
    return fetchGet("chat/user/get-voice-limit");
  }

  getAccessUrl(key) {
    return fetchPost("ai/source/get-access-url", {
      key,
      action: "browse",
    });
  }

  delChattingRecords(data, callback) {
    return fetchPost("chat/user/del-recent-chatting", data)
      .then(() => {
        callback?.();
      })
      .catch(function (res) {
        console.log("del-recent-chatting", res);
      });
  }

  getIdAllChat(role_id, page) {
    const params = new URLSearchParams();
    params.append("role_id", role_id);
    params.append("page_size", "10");
    params.append("page", page.toString());
    return fetchGet(`chat/message/list?${params}`);
  }

  getPersonaList(chatId) {
    const params = new URLSearchParams();
    params.append("chat_id", chatId);
    return fetchGet(`chat/user-sesid/persona-list?${params}`);
  }

  addPersona(title, about) {
    return fetchPost("chat/user-sesid/persona-add", { title, about });
  }

  editPersona(data, chatId) {
    const body = {
      id: data.id,
      title: data.title,
      about: data.about,
      is_default: data.is_default,
    };
    if (chatId) {
      body.chat_id = chatId;
    }
    return fetchPost("chat/user-sesid/persona-edit", body);
  }

  delPersona(id) {
    return fetchPost(`chat/user-sesid/persona-del`, { id });
  }

  getUserSetting() {
    return fetchGet("chat/user-sesid/seting-get")
      .then((res) => {
        if (res.code !== 200 || !res.data) return null;
        return res.data;
      })
      .catch((e) => {
        console.error("getUserSetting error", e);
        return null;
      });
  }

  setUserSetting(config) {
    return fetchPost("chat/user-sesid/seting-edit", {
      seting: JSON.stringify(config),
    });
  }
}

class AiGirlfriendTalking {
  service = new AiGirlfriendTalkingService();
  hasAudio = false;
  userConfig = this.userDefaultConfig();

  constructor() {
    this.boxPosition = {
      changeBtnLeft: {
        chattingContainer: {
          height: "64vh",
        },
        chattingBox: {
          left: ".8rem",
          right: "auto",
        },
        chatBgImg: {
          right: "0px",
          left: "auto",
        },
        changePhotoBtn: {
          right: ".8rem",
          left: "auto",
        },
      },
      changeBtnMiddle: {
        chattingContainer: {
          height: "340px",
        },
        chattingBox: {
          left: "calc(50% - 38.54vw / 2)",
          right: "auto",
        },
        chatBgImg: {
          right: "auto",
          left: "calc(50% - 661px / 2)",
        },

        changePhotoBtn: {
          right: "auto",
          left: ".8rem",
        },
      },
      changeBtnRight: {
        chattingContainer: {
          height: "64vh",
        },
        chattingBox: {
          left: "auto",
          right: ".8rem",
        },
        chatBgImg: {
          right: "auto",
          left: "0",
        },
        changePhotoBtn: {
          right: "auto",
          left: ".8rem",
        },
      },
    };

    this.updateAudioLimit();
    this.getUserConfig();
  }

  userDefaultConfig() {
    return {
      fullScreen: false,
      hideBackground: false,
      streaming: false,
      chat_id_persona_show: [],
    };
  }

  async getUserConfig() {
    try {
      const saveConfig =
        (await this.service.getUserSetting()) ?? this.userDefaultConfig();
      this.userConfig = Object.assign(this.userDefaultConfig(), saveConfig);
    } catch (e) {
      console.error("getUserSetting error", e);
    }
  }

  async setUserConfig() {
    try {
      await this.service.setUserSetting(this.userConfig);
    } catch (e) {
      console.error("setUserSetting error", e);
    }
  }

  data() {
    return {
      modelDOM: $("#AiChat"),
      userMessage: $("#userInputMsg").value, //输入框内容
    };
  }

  setSessionData() {
    sessionStorage.setItem(
      "repeatData",
      JSON.stringify({ path: "chat", data: this.aiData }),
    );
  }

  clearSessionData() {
    sessionStorage.removeItem("repeatData");
  }

  // status : new restart 打开chatloading
  async init(options, status) {
    gtag("event", `chat_aigirlfriend_${options.role_id}`);
    gtag("event", "enter_aigirlfriend_chatting");
    let that = this;
    // this.chatHeight = 0;
    this.loginPopup = null;
    this.isChat = false;
    this.socketClose = false;
    this.chatPage = -1;
    this.initHistory = true;
    this.isSyncingHistroy = false;
    this.isConnectingSocket = false;
    this.isOldSeverUrl = false;
    this.chatMap = new Map();
    this.helloTimer = null;
    this.promiseWaitMap = new Map();
    this.isChangeData = false;
    this.lastSendMsg = "";
    // this.getAiInfo(options.role_id,options.is_my_characters.my_characters_id)
    this.aiData = { ...options };
    this.aiAvatarImg = options?.head_portrait[0]?.url;
    this.bgImg =
      options.head_portrait_background.length > 0
        ? options.head_portrait_background[0]?.url
        : options.head_portrait[0]?.url;
    // this.bgImg =options.head_portrait[0]?.url;

    this.backImg = `url("${options.head_portrait_background[0]?.url || this.bgImg}")`;
    this.uploadAvatarChange = true;
    this.uploadbg = options.head_portrait_background[0]?.url || false;
    if (getCookie("user_info")) {
      this.userData = JSON.parse(getCookie("user_info"));
    }
    this.userAvatarImg = this.userData?.head_portrait || defaultUserAvatar;
    this.connectMsg = {
      user_id: this.userData?.id | "0",
      role_id: options.role_id + "",
      role_name: options.name,
      chat_id_name: "",
      chat_id: "",
      token: getCookie("SsToken"),
      language: "en",
    };
    this.connectMsg.user_id = this.connectMsg.user_id + "";

    this.uploadBlob = {
      changeAvatar: {},
      changeBg: {},
    };

    this.uploadStatus = false;
    this.isUserScrolling = false;
    this.replyKey = undefined;
    this.replyTimer = null;

    $(".chatting-container").empty(); //清空聊天框

    let currentPosition = "changeBtnMiddle";
    if (
      localStorage.getItem("user_info") &&
      localStorage.getItem("chattingPosition")
    )
      currentPosition = localStorage.getItem("chattingPosition");
    this.changePosition(currentPosition);

    if (this.userConfig.fullScreen) {
      $(".audio_btn.screen").addClass("active");
      this.changeScreen(true);
    } else {
      $(".audio_btn.screen").removeClass("active");
      this.changeScreen(false);
    }

    if (this.userConfig.streaming) {
      $(".audio_btn.streaming").addClass("active");
    } else {
      $(".audio_btn.streaming").removeClass("active");
    }

    if (this.userConfig.hideBackground) {
      $(".audio_btn.bg").addClass("active");
      this.changeBackground(true);
    } else {
      $(".audio_btn.bg").removeClass("active");
      this.changeBackground(false);
    }

    this.mobileInit();

    this.data().modelDOM.fadeIn();

    $("body").css({
      overflow: "hidden",
      position: "fixed",
    });
    this.setLoginTimer();
    $(".hidden-box #aiAvatarImg").attr("src", this.aiAvatarImg);
    $("#myAvatarImg").attr("src", this.userAvatarImg);

    let img = new Image();
    img.onload = function () {
      that.ratio = this.width / this.height;
      that.ratio.toFixed(2) > 1
        ? (that.boxPosition.changeBtnMiddle.chatBgImg.left = 0)
        : (that.boxPosition.changeBtnMiddle.chatBgImg.left =
            "calc(50% - 661px / 2)");
      let currentPosition = "changeBtnMiddle";
      if (
        localStorage.getItem("user_info") &&
        localStorage.getItem("chattingPosition")
      )
        currentPosition = localStorage.getItem("chattingPosition");
      const $chatBgImg = $("#chatBgImg");
      that.ratio.toFixed(2) > 1
        ? $chatBgImg.css({ width: "100vw", left: "0px" })
        : $chatBgImg.css({
            width: "661px",
            left: that.boxPosition[currentPosition].chatBgImg.left,
          });
    };
    img.src = this.bgImg;

    this.updateCharacter();
    try {
      await this.updateCharacterFunc(
        options.role_id,
        options.is_my_characters,
        options.my_characters_id,
      );

      let chatData = await this.getChatData("", status);

      if (!chatData) {
        return;
      }

      let headAvatar = getUrlVal("headAvatar");
      if (headAvatar) {
        let isExist = getUrlVal("form");
        await this.fromUndressFn(isExist, headAvatar);
      }
      this.isMyCharacterStatus = this.aiData.is_my_characters;
      this.aiData["toMyCharacter"] = false;

      this.connectChatting(chatData["server_url"]);
      this.getChatHistory();
      if ($(".chat_loading").hasClass("active")) {
        this.chatReLoading(false);
      }
    } catch (e) {
      console.error("init error", e);
    } finally {
      this.setSessionData();
    }
  }

  async updateAudioLimit() {
    const res = await this.service.getVoiceLimit();
    if (!!res.data) {
      this.hasAudio = res.data["sum_num"] > 0;
      $(".ai-gf-info-dialog-wrap .audio-limit-desc").text(
        t(gfChattingLan.audioLimitDesc, {
          sum_num: res.data["sum_num"],
        }),
      );
      if (res.data.area == "T3") $("#voicepool,.createMc_item.voice").toggle();
    } else {
      console.error("getVoiceLimit error", res);
    }
  }

  /**
   * 获取聊天历史记录
   */
  async getChatHistory() {
    if (this.isSyncingHistroy || !this.chatPage) return;
    if (!this.aiData.chat_id || !this.connectMsg.chat_id) return;
    this.isSyncingHistroy = true;

    try {
      const res = await this.service.getMessageInfo(
        this.connectMsg.chat_id,
        this.chatPage,
      );
      if (res.code === 200 && !!res.data) {
        this.isChat = true;
        history.replaceState(null, "", `/ai-girlfriend.html?chat`);
        const page = res.data.page;
        // res.data.list.reverse();

        let usefulData = res.data.list?.filter((item) => {
          return !!item.chat_content.content;
        });
        if (ttsBlank(usefulData)) {
          usefulData = [];
        }
        if (usefulData?.length === 0 && !!this.chatPage) {
          this.isSyncingHistroy = false;
          this.chatPage = page;
          await this.getChatHistory();
          return;
        }

        const $container = $(".chatting-container");
        const prevScrollTop = $container.scrollTop();
        const prevScrollHeight = $container[0].scrollHeight;
        $container.css("overflow-y", "hidden");
        for (let item of usefulData) {
          if (typeof item.chat_content.content === "string") {
            if (item.chat_content.role === "user") {
              let newMyMsgDom = $("#myMessageBox");
              this.showMessage(
                newMyMsgDom,
                item.chat_content.content,
                ".my-message-container",
                true,
                item,
              );
            } else {
              let newAiMsgDom = $("#aiMessageBox");
              this.showMessage(
                newAiMsgDom,
                item.chat_content.content,
                ".ai-message-container",
                true,
                item,
              );
            }
          }
        }
        $container.css("overflow-y", "auto");
        if (!this.initHistory) {
          const newScrollHeight = $container[0].scrollHeight;
          const changeHeight = newScrollHeight - prevScrollHeight;
          $container.scrollTop(prevScrollTop + changeHeight);
        } else {
          $container.scrollTop($container.prop("scrollHeight"));
        }
        this.initHistory = false;
        this.chatPage = page;

        if (usefulData.length < 5 && !!page) {
          this.isSyncingHistroy = false;
          await this.getChatHistory();
        } else {
          if (this.chatMap.size < 2) return;
          const res = this.chatMap.entries();
          const firstMsg = res.next().value;
          const nextMsg = res.next().value;
          if (
            firstMsg[1].sendUser == "assistant" &&
            nextMsg[1].sendUser == "user"
          ) {
            $(".ai-message-box").eq(-2).find(".rechat").show();
            let data = {
              ...this.connectMsg,
              chat_content: nextMsg[1].content,
              request_type: 20,
              chat_action: "",
              UserSendTime: new Date().getTime(),
            };
            this.UserSendTime = data.UserSendTime;
            this.lastMessage = JSON.stringify(data);
          }
        }
      }
    } catch (e) {
      console.error("getChatHistory error", e);
    } finally {
      this.isSyncingHistroy = false;
    }
  }

  /**
   * 获取聊天ID和服务器
   */
  async getChatData(url = "", status = "") {
    const params = {
      chat_id: this.aiData.chat_id,
      role_id: this.connectMsg.role_id,
      is_my_characters: this.aiData.is_my_characters,
      last_server_url: url,
      is_new: status ? 1 : 2,
    };
    if (this.aiData.is_my_characters === 1)
      params["my_characters_id"] = this.aiData.my_characters_id;
    const res = await this.service.getChatServer(params);
    if (res.code === 401) {
      await this.closeChat();
      return false;
    }
    if(res.data == null){
      $Popup({
        title: jsonData.aiGirlFriend.errorTitle,
        content: jsonData.aiGirlFriendChat.notChatServer,
        exist: "serverError",
      });
      return false;
    }
    if (res.code !== 200 || !res.data) {
      console.error("getChatData error", res.message);
      $Popup({
        type: "error",
        errorType: "normal",
      });
      return false;
    }
    const data = res.data;

    if (data["is_old_server_url"] && data["is_old_server_url"] === 1) {
      this.isOldSeverUrl = true;
    }

    this.socketUrl = data["server_url"];
    this.connectMsg.chat_id = data.chat_id;
    this.aiData.chat_id = data.chat_id;
    this.connectMsg.chat_id_name = data.chat_id_name;

    this.setSessionData();

    return data;
  }

  /**
   * AI主动打招呼
   * @constructor
   */
  AiHello() {
    const data = {
      ...this.connectMsg,
      request_type: 50,
      chat_last_sep: 3234,
    };
    clearTimeout(this.helloTimer);
    this.helloTimer = setTimeout(
      () => {
        SOCKET.send(JSON.stringify(data));
      },
      1000 * 60 * 4,
    );
  }

  /**
   * 处理undress跳转函数
   */
  async fromUndressFn(isExist, headAvatar) {
    let avatarKey = atob(getUrlVal("avatarKey"));
    let imgUrl = atob(headAvatar);
    let uploadData = {
      role_id: this.aiData.role_id,
      my_characters_id:
        this.aiData.is_my_characters === 1 ? this.aiData.my_characters_id : 0,
      name: this.aiData.name,
      // type: this.aiData.type,
      is_draft: 2,
      tag: this.aiData.json.tag ?? "",
      persona: this.aiData.persona ?? "",
      gender: this.aiData.json.gender ?? "",
      description: this.aiData.json["Character_des"] ?? "",
      scene: this.aiData["role_content"]["scene description"],
      greeting: this.aiData["role_content"].greeting,
      context: this.aiData["role_content"].context,
      chat_id: this.connectMsg.chat_id,
      head_portrait: JSON.stringify([
        { key: "head_portrait", value: avatarKey, is_temp: 1 },
      ]),
      head_portrait_background: JSON.stringify(
        this.aiData.head_portrait_background,
      ),
    };

    this.aiData.head_portrait = [
      { key: "head_portrait", value: imgUrl, url: imgUrl },
    ];
    this.aiAvatarImg = imgUrl;
    this.aiData.status = 2;
    this.updateCharacter();
    $(".chatting-share").hide();
    this.aiData.is_my_characters = 1;
    this.bgImg = "";
    this.changeBgAvatar();
    if (!isExist) return;

    const res = await this.service.roleEdit(uploadData);
    if (res.code === 200) {
      aiGirlFriend.GetRecentChatting();
      this.aiData["toMyCharacter"] = true;
      history.pushState(
        null,
        null,
        `/ai-girlfriend.html?openShare=${getUrlVal("openShare")}&headAvatar=${headAvatar}&avatarKey=${btoa(avatarKey)}`,
      );
      this.aiData["my_characters_id"] = res.data.my_characters_id;
      this.aiData.role_id = res.data.role_id;
      this.aiData.is_my_characters = 1;
      this.isChangeData = true;
    }
    if (res.code === 401) {
      await this.closeChat();
      return;
    }

    await this.updateCharacterFunc(
      this.aiData.role_id,
      this.aiData.is_my_characters,
      this.aiData.my_characters_id,
    );

    this.setSessionData();
  }

  mobileInit() {
    if (window.innerWidth < 1200) {
      $("#changePhotoBtn").text("Change Photo");

      let rightRem;
      this.aiData.is_my_characters === 1
        ? (rightRem = "1.4rem")
        : (rightRem = "1.92rem");
      $(".change-photo-btn").css({
        left: "auto",
        right: rightRem,
      });
    }
  }

  updateCharacter() {
    $(".chatting-count").text(formatNumber(this.aiData["msg_num"]));
    $(".ai-chat-gf-avatar, .ai-gf-info-dialog-avatar").attr(
      "src",
      this.aiAvatarImg,
    );
    $(".ai-gf-info-dialog-birthday").text(this.aiData.json["Created"]);
    $(".ai-gf-info-dialog-desc").text(this.aiData.json["Character_des"]);
    $(".ai-chat-gf-name, .ai-gf-info-dialog-name").text(this.aiData.name);
    this.toggleShareBtn(this.aiData.status === 1 && this.aiData.type === 1);
    const chatDialogTags = this.aiData.json.tag
      .split(",")
      .filter((t) => t !== "")
      .map((t) => {
        return `<div class="ai-gf-info-dialog-tag">${t}</div>`;
      });
    $(".ai-gf-info-dialog-tags").html(chatDialogTags.join(""));

    if (this.aiData.is_like === 1) {
      $(".no-like-icon").hide();
      $(".like-icon").show();
    } else {
      $(".no-like-icon").show();
      $(".like-icon").hide();
    }
  }

  bindEvent() {
    let that = this;

    // 判读用户输入字符
    $("#userInputMsg").on("input", function () {
      let textLength = $(this).val().length;
      // this.style.height = 'auto';
      window.innerWidth > 1200
        ? (this.style.height = this.scrollHeight + "px")
        : (this.style.height = this.scrollHeight / 100 + 0.5 + "rem");
      if (textLength === 0 || textLength < 37) {
        window.innerWidth > 1200
          ? (this.style.height = "46px")
          : (this.style.height = ".88rem");
      }

      // $('#userInputMsg').scrollTop($('#userInputMsg')[0].scrollHeight);

      const $sendBtn = $(".send-btn");
      textLength !== 0 && !/^\s*$/.test($(this).val())
        ? $sendBtn.removeClass("disable")
        : $sendBtn.addClass("disable");
    });

    // 绑定退出聊天click事件
    $("#backIcon, #closeIcon").on("click", function () {
      let id = $(this).attr("id");
      if (id === "backIcon") {
        gtag("event", "back_aigirlfriend_chatting");
      } else {
        gtag("event", "close_aigirlfriend_chatting");
      }
      that.closeChat("click");
    });

    $(".chatting-container").on("click", ".audio-button", function (e) {
      const $audioButton = $(e.currentTarget);
      gtag("event", "click_aigirlfriend_voice");
      that.toggleAudioBtn($audioButton, !$audioButton.hasClass("active"));
    });

    //发送聊天信息绑定
    $("#sendMsg").on("click", () => {
      this.sendMessage();
      $("#userInputMsg").trigger("focus");
    });

    //输入回车键发送消息
    $(".ai-chat-box textarea").on("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        this.sendMessage();
      }
    });

    //更换聊天框位置事件绑定
    $("#editIcon").on("click", () => {
      $(".change-position-box").toggle();
    });

    $(document).on("click", function (event) {
      const $target = $(event.target);
      if (
        !$target.closest("#editIcon").length &&
        !$target.closest(".change-position-box").length
      ) {
        $(".change-position-box").hide();
      }
      if (
        !$target.closest(".right-button-box-m-dropdown").length &&
        !$target.closest(".right-button-box-m-dropdown-menu").length
      ) {
        that.toggleGFDropdown(false);
      }

      if ($target.closest(".ai-gf-persona-more").length === 0) {
        $(".ai-gf-persona-pop").fadeOut(160);
      }
    });

    $(".change-btns-box .change-btn").on("click", function () {
      let id = $(this).attr("id");
      let gtagEvent = {
        changeBtnLeft: "left_aigirlfriend_pos",
        changeBtnMiddle: "mid_aigirlfriend_pos",
        changeBtnRight: "right_aigirlfriend_pos",
      };
      gtag("event", gtagEvent[id]);
      that.changePosition(id);
      $(".change-position-box").hide();
    });

    //更换AI背景头像绑定
    $("#changePhotoBtn").on("click", () => {
      gtag("event", "click_aigirlfriend_changephoto");

      this.openChangeHandle();
    });

    // 点击喜欢绑定
    $(".chatting-like").on("click", async function () {
      that.isChangeData = true;
      try {
        that.toggleLikeBtn();
        const res = await that.service.putLike(that.aiData.role_id);
        if (res.code === 200) {
          if ($(this).closest(".ai-gf-info-dialog").length > 0) {
            gtag("event", "like_aigirlfriend_view");
          } else if (that.aiData.is_like === 1) {
            gtag("event", "like_aigirlfriend_chatting");
          }
        } else {
          $Popup({ type: "error", errorType: "network" });
          that.toggleLikeBtn();
        }
      } catch (e) {
        console.error("like error", e);
        $Popup({ type: "error", errorType: "network" });
        that.toggleLikeBtn();
      }
    });

    $(".discord-box").on("click", () => {
      gtag("event", "discord_aigirlfriend_chatting");
    });

    $(".chatting-share").on("click", (e) => {
      if ($(e.target).closest(".ai-gf-info-dialog").length > 0) {
        gtag("event", "share_aigirlfriend_view");
      } else {
        gtag("event", "share_aigirlfriend_chatting");
        $(".chatting-setting").removeClass("active");
      }
      aiGirlFriend.showShare(
        this.aiData.role_id,
        this.aiData.head_portrait[0].value,
      );
    });

    $(".ai-chat-gf-view").on("click", () => {
      this.toggleGFInfoDialog(true, ".ai-gf-info-dialog");
    });

    $(".chatting-all").on("click", () => {
      gtag("event", "allchat_aigirlfriend_chatting");
      this.toggleGFInfoDialog(true, ".ai-gf-all-dialog");
      this.clearRoleIdAllChats();
      this.updateRoleIdAllChats();
    });

    $(".ai-gf-info-dialog-close, .ai-gf-info-dialog-bg").on("click", () => {
      const $wrapper = $(".ai-gf-info-dialog-wrap");
      if ($wrapper.find(".ai-gf-persona-dialog").is(":visible")) {
        this.openSavePopup(true);
        return;
      }

      this.toggleGFInfoDialog(false);
    });

    $(".right-button-box-m-dropdown").on("click", () => {
      const currentStatus = $(".right-button-box-m-dropdown-menu").is(
        ":visible",
      );
      this.toggleGFDropdown(!currentStatus);
    });

    const $chattingContainer = $("#chattingContainer");
    $chattingContainer.on("scroll", (e) => {
      if ($(e.currentTarget).scrollTop() === 0) {
        this.getChatHistory();
      }
    });
    $chattingContainer.on("wheel touchmove", (e) => {
      e.stopPropagation();
      this.isUserScrolling = true;
    });

    $(".chatting-newChat").click(async function () {
      if (that.isSyncingHistroy) return;
      gtag("event", "newchat_aigirlfriend_chatting");
      await that.closeChat(false, "new");
      that.aiData.chat_id = undefined;
      that.connectMsg = null;
      that.init(that.aiData, "new");
    });

    $(".chatting-restart").click(function () {
      if (that.isSyncingHistroy) return;
      gtag("event", "restartchat_aigirlfriend_chatting");
      let bootLogin = $Popup({
        title: jsonData.aiGirlFriendChat.restartTitle,
        content: jsonData.aiGirlFriendChat.restartText,
        closeBtn: jsonData.aiGirlFriendChat.resetChat,
        applyBtn: jsonAiGirlFriend.Cancel,
        autoClose: false,
        exist: "bootLogin",
        onClose: () => {
          bootLogin.loading.start();
          aiGirlFriend.deleteChat(that.aiData.chat_id, async () => {
            bootLogin.close();
            await that.closeChat(false, "restart");
            await aiGirlFriend.GetRecentChatting();
            delete that.aiData.chat_id;
            that.init(that.aiData, "restart");
          });
        },
        onApply: () => {
          bootLogin.close();
        },
        topCloseFn: () => {
          bootLogin.close();
        },
      });
    });

    $(".audio_btn").click(function () {
      $(this).toggleClass("active");
      if ($(this).hasClass("screen")) {
        gtag("event", "fullscreen_aigirlfriend_chatting");
        if ($(this).hasClass("active")) {
          that.userConfig.fullScreen = true;
          that.changeScreen(true);
        } else {
          that.userConfig.fullScreen = false;
          that.changeScreen(false);
        }
      } else if ($(this).hasClass("bg")) {
        gtag("event", "hidebackground_aigirlfriend_chatting");
        if ($(this).hasClass("active")) {
          that.userConfig.hideBackground = true;
          that.changeBackground(true);
        } else {
          that.userConfig.hideBackground = false;
          that.changeBackground(false);
        }
      } else if ($(this).hasClass("streaming")) {
        gtag("event", "enablestreaming_aigirlfriend_chatting");
        that.userConfig.streaming = !!$(this).hasClass("active");
      }

      that.debounceUserConfig();
    });

    $("body").on("mouseup", async function (e) {
      const target = $(e.target);

      const isClickChatSetting = $(".chat-btn-setting")[0].contains(e.target);
      if (
        target.hasClass("chat-btn-setting") ||
        target.hasClass("chat-btn-icon")
      ) {
        gtag("event", "chatsettings_aigirlfriend_chatting");
      }

      const $audioBtn = $(".audio_btn");
      if (
        !$audioBtn[0].contains(e.target) &&
        !$audioBtn[1].contains(e.target) &&
        !$audioBtn[2].contains(e.target)
      ) {
        if (isClickChatSetting) {
          $(".chat-btn-setting").toggleClass("active");
        } else {
          $(".chat-btn-setting").removeClass("active");
        }
      }
      $(".setting_box").hide();
      // setting box
      if (target.hasClass("msgSetting")) {
        gtag("event", "click_aigirlfriend_msgsettings");
        let res = target.hasClass("my") ? "my" : "ai";
        $(".ai-message-box,.my-message-box").css("z-index", "");
        target.parents(`.${res}-message-box`).css("z-index", 1);
        target.children(".setting_box").show();
      } else if (target.hasClass("setting_copy")) {
        target.parents(".setting_box").hide();
        let parent = target.parents(".chatOperation");
        let isAi = parent.data("sender") == "assistant" ? "ai" : "my";
        target.parents(`.${isAi}-message-box`).css("z-index", "");
        const msgDom = target.parents(`.${isAi}-message-box`).find(".chat_msg");
        copyText(msgDom.text());
      } else if (target.hasClass("setting_delete")) {
        let parent = target.parents(".chatOperation");
        let isCheckTime = parent.data("ischecktime");
        if (!isCheckTime) return;
        let isAi = parent.data("sender") == "assistant" ? "ai" : "my";
        let data = {
          chat_id: that.aiData.chat_id,
          role: parent.data("sender"),
          task_timestamp: parent.data("timestamp"),
        };
        // delete chatting records
        that.service.delChattingRecords(data);
        target.parents(`.${isAi}-message-box`).remove();
      } else {
        $(".ai-message-box,.my-message-box").css("z-index", "");
        $(".ai-message-box,.my-message-box").find(".setting_box").hide();
      }

      if (target.hasClass("rechat")) {
        gtag("event", "click_aigirlfriend_rechat");
        let parent = target.parents(".chatOperation");
        let isCheckTime = parent.data("ischecktime");
        if (!isCheckTime) return;
        let isAi = parent.data("sender") == "assistant" ? "ai" : "my";
        let task_timestamp = parent.data("timestamp");
        let data = {
          chat_id: that.aiData.chat_id,
          role: "assistant",
          task_timestamp,
        };
        let UserData = {
          chat_id: that.aiData.chat_id,
          role: "user",
          task_timestamp,
        };
        target.parents(`.${isAi}-message-box`).remove();
        that.setChatLoading(true);
        // delete chatting records
        await that.service.delChattingRecords(data);
        await that.service.delChattingRecords(UserData);
        if (!SOCKET) {
          that.disconnectMessage = that.lastMessage;
        } else {
          if (SOCKET.readyState === WebSocket.OPEN) {
            SOCKET.send(that.lastMessage);
          } else if (SOCKET.readyState === WebSocket.CLOSED) {
            that.disconnectMessage = that.lastMessage;
            that.connectChatting(that.socketUrl);
          } else {
            that.disconnectMessage = that.lastMessage;
          }
        }
        const dom = $(`.chatOperation[data-timestamp="${task_timestamp}"]`);
        dom.attr("data-timestamp", that.UserSendTime);
      }
    });

    this.bindAiReplyEvent();
    this.bindUserPersonaEvent();
    this.bindRoleIdAllChatsEvent();
  }

  debounceUserConfig = debounce(() => {
    this.setUserConfig();
  }, 600);

  clearReplyList() {
    this.replyKey = undefined;
    clearTimeout(this.replyTimer);
    $(".ai-reply-wrapper").removeClass("show loading");
    $(".ai-reply-list").empty();
  }

  setReplyTimer() {
    const $wrapper = $(".ai-reply-wrapper");
    $wrapper.addClass("loading");
    clearTimeout(this.replyTimer);
    this.replyTimer = setTimeout(() => {
      this.replyKey = undefined;
      $wrapper.removeClass("loading");
    }, 60 * 1000);
  }

  bindAiReplyEvent() {
    const $wrapper = $(".ai-reply-wrapper");

    $(".ai-reply-btn > img").on("click", () => {
      gtag("event", "click_aigirlfriend_aireply");
      if ($(".ai-reply-list li").length === 0) {
        this.refreshAiReply();
      }
      $wrapper.addClass("show");
    });

    $(".ai-reply-close").on("click", () => {
      this.clearReplyList();
    });

    $(".ai-reply-title > img").on("click", () => {
      this.refreshAiReply();
    });

    $(".ai-reply-list").on("click", "li", (e) => {
      const $target = $(e.currentTarget);
      $target.siblings().removeClass("checked");
      $target.addClass("checked");
      const text = $target.find("p").text();
      $("#userInputMsg").val(text).trigger("input").trigger("focus");
    });
  }

  refreshAiReply() {
    if (this.replyKey) return;
    let UserSendTime = new Date().getTime();
    let data = {
      ...this.connectMsg,
      chat_content: "1",
      request_type: 60,
      chat_action: "",
      UserSendTime,
    };
    this.replyKey = UserSendTime;
    this.setReplyTimer();
    this.sendOtherMessage(data);
  }

  _personaList = [];

  get personaList() {
    return this._personaList;
  }

  set personaList(list) {
    this._personaList = list;
    this.renderPersonaList(list);
  }

  getCopyPersonaList() {
    return this.personaList.map((item) => ({ ...item }));
  }

  async getPersonaList(chatId) {
    if (!chatId) return;
    try {
      const listData = await this.service.getPersonaList(chatId);
      if (listData.code === 200) {
        this.personaList = listData.data?.reverse() ?? [];
      } else {
        console.error("getPersonaList error", listData.message);
      }
    } catch (e) {
      console.error("getPersonaList error", e);
    }
  }

  renderPersonaList(list) {
    const $addBtn = $(".add-new-persona");
    if (list.length >= 3) {
      $addBtn.addClass("disabled");
    } else {
      $addBtn.removeClass("disabled");
    }

    if (list.length === 0) return;
    let html = "";
    list.forEach((item) => {
      const safeTitle =
        item.title !== gfChattingLan.newPersonaTitle
          ? escapeHtml(item.title)
          : item.title;
      const safeAbout = item.about ? escapeHtml(item.about) : "";

      html += `
        <div class="ai-gf-persona-item" data-id="${item.id ?? ""}">
          <div class="ai-gf-persona-radio"></div>
          <div class="ai-gf-persona-name-wrapper">
            <div class="ai-gf-persona-name">${safeTitle}</div>
            ${safeAbout ? `<div class="ai-gf-persona-desc">${safeAbout}</div>` : ""}
          </div>
          ${
            list.length > 1 || !item.id.includes("new")
              ? `
          <div class="ai-gf-persona-more">
            <img src="/dist/img/ai-chatting/btn_more.svg" alt="">
            <div class="ai-gf-persona-pop">
              ${
                !item.id.includes("new")
                  ? `
               <div class="ai-gf-persona-pop-item default">
                <img src="/dist/img/ai-chatting/icon_user.svg" alt="" class="item_icon" />
                <span>${gfChattingLan.default}</span>
              </div>`
                  : ""
              }
              <div class="ai-gf-persona-pop-item del">
                <img src="/dist/img/ai-chatting/icon_del.svg" alt="" class="item_icon" />
                <span>${gfChattingLan.delete}</span>
              </div>
            </div>
          </div>`
              : ""
          }
          <img class="ai-gf-persona-set" src="/dist/img/ai-chatting/icon_arrow_pink.svg" alt="">
        </div>
        `;
    });

    $(".ai-gf-persona-list").html(html);
    const chatDefaultIndex = list.findIndex((v) => v["chat_is_default"] === 1);
    const defaultIndex = list.findIndex((v) => v["is_default"] === 1);
    $(".ai-gf-persona-item")
      .eq(
        chatDefaultIndex !== -1
          ? chatDefaultIndex
          : defaultIndex !== -1
            ? defaultIndex
            : 0,
      )
      .trigger("click");
  }

  clearPersona() {
    this.personaList = [];
    $(".ai-gf-persona-list").empty();

    $(".ai-gf-persona-edit-title").text(gfChattingLan.newPersona);
    $(".ai-gf-persona-input").val("");

    $(".ai-gf-persona-list-wrapper").addClass("active");
    $(".ai-gf-persona-edit").removeClass("active");

    $(".ai-gf-persona-save").addClass("disabled");
  }

  openSavePopup(close = false) {
    const $saveBtn = $(".ai-gf-persona-save");
    const $input = $("input.ai-gf-persona-input");

    const changeTab = () => {
      const $textarea = $("textarea.ai-gf-persona-input");

      $input.val("");
      $textarea.val("");

      $input.trigger("input");
      $textarea.trigger("input");

      $(".ai-gf-persona-list-wrapper").addClass("active");
      $(".ai-gf-persona-edit").removeClass("active");
    };

    if ($saveBtn.hasClass("disabled")) {
      close && this.toggleGFInfoDialog(false);
      changeTab();
      return;
    }

    const content = `
      <div style="font-family: 'Roboto',serif;font-size: 14px;color: rgba(255,253,245,1)">${gfChattingLan.personaSaveContent}</div>
      <div style="font-family: 'Roboto',serif;font-size: 14px;color: rgba(255,253,245,0.6)">${gfChattingLan.persona}: ${escapeHtml($input.val().trim())}</div>
    `;
    const otherBtn = `
    <div class='login-popup-close-btn'>${gfChattingLan.dontSave}</div>
    `;
    const personaPop = $Popup({
      title: gfChattingLan.confirmSave,
      content: content,
      closeBtn: gfChattingLan.save,
      otherBtns: otherBtn,
      exist: "personaPopup",
      addBorderRadius: true,
      autoClose: false,
      onClose: () => {
        personaPop.loading.start();
        $saveBtn.trigger("click");
        const timer = setInterval(() => {
          if (!$saveBtn.hasClass("loading")) {
            personaPop.loading.end();
            personaPop.close();
            close && this.toggleGFInfoDialog(false);
            changeTab();
            clearInterval(timer);
          }
        }, 500);
      },
    });

    personaPop.modal.find(".login-popup-close-btn").on("click", () => {
      personaPop.close();
      close && this.toggleGFInfoDialog(false);
      changeTab();
    });
  }

  bindUserPersonaEvent() {
    new chatTooltip(".persona-tips", gfChattingLan.personaTip);
    new chatTooltip(".about-yourself-tips", gfChattingLan.tellAboutYourselfTip);

    const $wrapper = $(".ai-gf-persona-dialog");
    const $listWrapper = $(".ai-gf-persona-list-wrapper");
    const $editWrapper = $(".ai-gf-persona-edit");

    const $switch = $(".ai-gf-persona-switch-btn");
    const $addBtn = $(".add-new-persona");
    const $applyBtn = $(".ai-gf-persona-apply");
    const $saveBtn = $(".ai-gf-persona-save");

    const $personaList = $(".ai-gf-persona-list");

    const $textarea = $("textarea.ai-gf-persona-input");
    const $input = $("input.ai-gf-persona-input");

    let isSyncing = false;

    const syncing = (status) => {
      isSyncing = status;
      if (status) {
        $wrapper.addClass("syncing");
        $saveBtn.addClass("disabled");
        $applyBtn.addClass("disabled");
      } else {
        $wrapper.removeClass("syncing");
      }
    };

    const delItem = (id) => {
      if (!id.includes("new")) {
        try {
          this.service.delPersona(id);
        } catch (e) {
          console.error("delPersona error");
        }
      }

      const currentList = this.getCopyPersonaList().filter(
        (item) => item.id !== id,
      );
      this.personaList = currentList;
      if (currentList.length === 0) {
        $addBtn.trigger("click");
      }
    };

    const setDefault = (id) => {
      if (id.includes("new")) return;
      let setDefaultItem = null;

      this.personaList = this.getCopyPersonaList().map((item) => {
        if (item.id === id) {
          setDefaultItem = item;
          item.is_default = 1;
        } else {
          item.is_default = 2;
        }
        return item;
      });

      try {
        this.service.editPersona(setDefaultItem);
      } catch (e) {
        console.error("setDefault error");
      }
    };

    const changePersonaInfo = (id) => {
      const isNew = id.includes("new");
      let data = null;
      this.personaList.forEach((v) => {
        if (v.id === id) {
          v["chat_is_default"] = 1;
          data = v;
        } else {
          v["chat_is_default"] = 2;
        }
      });
      if (!data) return;
      $(".ai-gf-persona-edit-title").text(
        isNew ? gfChattingLan.newPersona : data.title,
      );
      $("input.ai-gf-persona-input").val(isNew ? "" : data.title);
      $("textarea.ai-gf-persona-input").val(isNew ? "" : data.about);

      $textarea.trigger("input");
      $input.trigger("input");
    };

    let newIndex = 1;
    $addBtn.on("click", (e) => {
      if (this.personaList.length >= 3) return;
      this.personaList = [
        ...this.getCopyPersonaList(),
        {
          id: "new-" + newIndex,
          title: gfChattingLan.newPersonaTitle,
          about: "",
          is_default: 2,
        },
      ];

      newIndex++;
    });

    $(".chatting-persona").on("click", async () => {
      const listSet = new Set(this.userConfig["chat_id_persona_show"]);
      if (listSet.has(this.aiData.chat_id)) {
        $switch.addClass("active");
        $applyBtn.removeClass("disabled");
      } else {
        $switch.removeClass("active");
        $applyBtn.addClass("disabled");
      }

      try {
        this.toggleGFInfoDialog(true, ".ai-gf-persona-dialog");
        gtag("event", "userpersona_aigirlfriend_chatting");

        if (this.personaList.length !== 0) return;
        await this.getPersonaList(this.aiData.chat_id);
        if (this.personaList.length === 0) {
          $addBtn.trigger("click");
        }
      } catch (e) {
        $Popup({ type: "error", errorType: "network" });
        console.error("getPersonaList error", e);
      }
    });

    $personaList.on("click", ".ai-gf-persona-item", (e) => {
      const $target = $(e.currentTarget);
      const id = $target.data("id");
      $target.addClass("active").siblings().removeClass("active");

      const listSet = new Set(this.userConfig["chat_id_persona_show"]);
      if (listSet.has(this.aiData.chat_id)) {
        if (id.includes("new")) {
          $applyBtn.addClass("disabled");
        } else {
          $applyBtn.removeClass("disabled");
        }
      }
      changePersonaInfo(id);
    });

    $personaList.on("click", ".ai-gf-persona-more", (e) => {
      e.stopPropagation();
    });

    $personaList.on("click", ".ai-gf-persona-more > img", (e) => {
      e.stopPropagation();
      const $item = $(e.currentTarget).closest(".ai-gf-persona-item");
      const $pop = $item.find(".ai-gf-persona-pop");
      $(".ai-gf-persona-pop").not($pop).fadeOut(160);
      $pop.fadeToggle(160);
    });

    $personaList.on("click", ".ai-gf-persona-set", (e) => {
      $listWrapper.removeClass("active");
      $editWrapper.addClass("active");
    });

    $personaList.on("click", ".ai-gf-persona-pop-item", (e) => {
      e.stopPropagation();
      const $item = $(e.currentTarget);
      const type = $item.hasClass("default") ? "default" : "del";
      const id = $item.closest(".ai-gf-persona-item").data("id");
      switch (type) {
        case "default":
          setDefault(id);
          break;
        case "del":
          delItem(id);
          break;
      }
    });

    $(".ai-gf-persona-edit-back").on("click", () => {
      this.openSavePopup();
    });

    const $textCount = $(".ai-gf-persona-count");

    let isComposing = false;

    $textarea.on("compositionstart", function () {
      isComposing = true;
    });
    $textarea.on("compositionend", function () {
      isComposing = false;
      $(this).trigger("input");
    });

    $textarea.on("input change", () => {
      if (isComposing) return;
      const maxCount = 1024;
      const info = this.personaList.find(
        (item) => $(".ai-gf-persona-item.active").data("id") === item.id,
      ).about;

      let value = $textarea.val().replace(/^\s+$/g, "");
      $textarea.val(value);

      if (value.length >= maxCount) {
        $textarea.val(value.slice(0, maxCount));
        $textCount.addClass("error");
      } else {
        $textCount.removeClass("error");
      }

      value = $textarea.val();
      if (!!value.length && !!$input.val().trim() && value !== info) {
        $saveBtn.removeClass("disabled");
      } else {
        $saveBtn.addClass("disabled");
      }
      $textCount.text(`${value.length}/${maxCount}`);
    });

    $input.on("input change", () => {
      let value = $input.val().trim();
      const info = this.personaList.find(
        (item) => $(".ai-gf-persona-item.active").data("id") === item.id,
      ).title;
      if (!!value.length && !!$textarea.val().trim() && value !== info) {
        $saveBtn.removeClass("disabled");
      } else {
        $saveBtn.addClass("disabled");
      }
    });

    $saveBtn.on("click", async () => {
      if (isSyncing) return;
      syncing(true);
      $saveBtn.addClass("loading");
      const title = $input.val().trim();
      const about = $textarea.val().trim();

      const activeItem = $(".ai-gf-persona-item.active");
      const id = activeItem.data("id");
      const isNew = id.includes("new");
      const index = activeItem.index();

      try {
        const res = isNew
          ? await this.service.addPersona(title, about)
          : await this.service.editPersona({
              id,
              title,
              about,
              is_default: this.personaList.find((v) => v.id === id).is_default,
            });

        if (res.code !== 200) {
          $Popup({ type: "error", errorType: "network" });
          return;
        }

        const data = res.data;
        if (isNew) {
          const changeData = data[0];
          const newList = this.getCopyPersonaList();
          newList[index] = changeData;
          this.personaList = newList;
        } else {
          this.personaList = this.getCopyPersonaList().map((item) => {
            if (item.id === id) {
              item.title = title;
              item.about = about;
            }
            return item;
          });
        }

        $(".ai-gf-persona-item").eq(index).trigger("click");
      } catch (e) {
        $Popup({ type: "error", errorType: "network" });
        console.error("savePersona error", e);
      } finally {
        syncing(false);
        $saveBtn.removeClass("loading");
      }
    });

    $applyBtn.on("click", async () => {
      if (isSyncing) return;
      syncing(true);

      $applyBtn.addClass("loading");
      const defaultItem = this.personaList.find(
        (item) => item["chat_is_default"] === 1,
      );
      try {
        if (defaultItem && !defaultItem.id.includes("new")) {
          const res = await this.service.editPersona(
            { ...defaultItem, is_default: "1" },
            this.connectMsg.chat_id,
          );
          if (res.code !== 200) {
            $Popup({ type: "error", errorType: "network" });
            console.error("applyPersona error", res.message);
            return;
          }

          this.toggleGFInfoDialog(false);
        }
      } catch (e) {
        $Popup({ type: "error", errorType: "network" });
        console.error("applyPersona error", e);
      } finally {
        syncing(false);
        $applyBtn.removeClass("loading");
      }
    });

    $switch.on("click", () => {
      const listSet = new Set(this.userConfig["chat_id_persona_show"]);
      if (listSet.has(this.aiData.chat_id)) {
        listSet.delete(this.aiData.chat_id);
        $switch.removeClass("active");
        $applyBtn.addClass("disabled");
      } else {
        listSet.add(this.aiData.chat_id);
        $switch.addClass("active");
        $applyBtn.removeClass("disabled");
      }
      if ($(".ai-gf-persona-item.active").attr("data-id").includes("new")) {
        $applyBtn.addClass("disabled");
      }
      this.userConfig["chat_id_persona_show"] = Array.from(listSet);
      this.debounceUserConfig();
    });
  }

  changePosition(id) {
    this.currentPosition = id;
    getCookie("user_info")
      ? localStorage.setItem("chattingPosition", id)
      : localStorage.removeItem("chattingPosition");
    let jqId = "#" + id;
    $(jqId).addClass("change-active").siblings().removeClass("change-active");

    let position = this.boxPosition;
    for (let key in position[id]) {
      let dom = `#${key}`;
      for (let cssKey in position[id][key]) {
        if (key == "chattingContainer") {
          this.chatHeight = position[id][key][cssKey];
        } else {
          $(dom).css(cssKey, position[id][key][cssKey]);
        }
      }
    }
    let container = $(".chatting-container");
    container.scrollTop(container.prop("scrollHeight"));
  }

  isMobile() {
    return window.innerWidth < 1200;
  }

  toggleGFInfoDialog(status, dialog) {
    const $dialog = $(".ai-gf-info-dialog-wrap");
    $dialog.children("div").not(".ai-gf-info-dialog-bg").hide();
    if (dialog) $dialog.find(dialog).show();
    if (!this.isMobile()) {
      status ? $dialog.fadeIn(160) : $dialog.fadeOut(160);
    } else {
      status
        ? $dialog.show(0, () => $dialog.addClass("active"))
        : $dialog.removeClass("active").hide();
    }
    if (status) {
      switch (dialog) {
        case ".ai-gf-info-dialog":
          gtag("event", "show_aigirlfriend_view");
          break;
      }
    }
  }

  toggleGFDropdown(status) {
    const $dropdown = $(".right-button-box-m-dropdown-menu");
    if (!this.isMobile()) {
      status ? $dropdown.fadeIn(160) : $dropdown.fadeOut(160);
    } else {
      status ? $dropdown.slideDown(160) : $dropdown.slideUp(160);
    }
  }

  toggleShareBtn(status) {
    const $shareBtn = $(".chatting-share");
    status ? $shareBtn.show() : $shareBtn.hide();
  }

  toggleLikeBtn() {
    const status = this.aiData.is_like !== 1;
    this.aiData.is_like = status ? 1 : 2;
    const likeIcon = $(".like-icon");
    const notLikeIcon = $(".no-like-icon");
    if (status) {
      likeIcon.show();
      notLikeIcon.hide();
    } else {
      likeIcon.hide();
      notLikeIcon.show();
    }

    this.setSessionData();
  }

  roleIdAllChatsPage = 0;
  roleIdTotalPage = 0;
  isLoadingRoleIdAllChats = false;

  bindRoleIdAllChatsEvent() {
    const $list = $(".ai-gf-all-list");
    $list.on("scroll", (e) => {
      if (
        this.roleIdAllChatsPage >= this.roleIdTotalPage &&
        this.roleIdAllChatsPage !== 0
      )
        return;
      const $target = $(e.currentTarget);
      if (
        $target.scrollTop() + $target.innerHeight() >=
        $target[0].scrollHeight
      ) {
        this.updateRoleIdAllChats();
      }
    });

    $list.on("click", ".ai-gf-all-item-del", (e) => {
      const $item = $(e.currentTarget).closest(".ai-gf-all-item");
      const chatId = $item.attr("data-id");
      const deletePop = $Popup({
        title: jsonAiGirlFriend.deleteRecentTitle,
        content: jsonAiGirlFriend.deleteRecentText,
        closeBtn: jsonAiGirlFriend.Delete,
        otherBtns: `<button class="cannel">${jsonAiGirlFriend.Cancel}</button>`,
        autoClose: false,
        exist: "deletePop",
        onClose: () => {
          deletePop.loading.start();
          aiGirlFriend.deleteChat(chatId, async () => {
            try {
              if (chatId === this.aiData.chat_id) this.closeChat();
              await aiGirlFriend.GetRecentChatting();
              $item.remove();
              deletePop.close();
              if ($list.find(".ai-gf-all-item").length === 0) $list.empty();
            } catch (e) {
              console.error("deleteChat error", e);
            }
          });
        },
      });
      deletePop.modal.find(".cannel").on("click", () => {
        deletePop.close();
      });
    });
  }

  clearRoleIdAllChats() {
    $(".ai-gf-all-list").empty();
    this.roleIdAllChatsPage = 0;
    this.roleIdTotalPage = 0;
    this.isLoadingRoleIdAllChats = false;
  }

  async updateRoleIdAllChats() {
    const $allChatTitle = $(".ai-gf-all-title");
    const $allChatList = $(".ai-gf-all-list");

    $allChatTitle.text(`${gfChattingLan.allChatsWith} "${this.aiData.name}"`);

    function formatRelativeTime(dateString) {
      if (!dateString) return "+";

      const givenDate = new Date(MSK2UTC(dateString));
      const now = new Date();

      const diffInSeconds = (now.getTime() - givenDate.getTime()) / 1000;
      const timePoint = givenDate.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      });

      const userLanguage = navigator.language || navigator.languages[0];

      if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} ${gfChattingLan[minutes > 1 ? "minutesAgo" : "minuteAgo"]}+${timePoint}`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} ${gfChattingLan[hours > 1 ? "hoursAgo" : "hourAgo"]}+${timePoint}`;
      } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} ${gfChattingLan[days > 1 ? "daysAgo" : "dayAgo"]}+${timePoint}`;
      } else {
        if (userLanguage.startsWith("en")) {
          const day = givenDate.getDate();
          const month = givenDate.toLocaleString("en-US", { month: "long" });
          const year = givenDate.getFullYear();
          return `${day} ${month}, ${year}+${timePoint}`;
        } else {
          return `${givenDate.toLocaleDateString(undefined, {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}+${timePoint}`;
        }
      }
    }

    try {
      if (this.isLoadingRoleIdAllChats) return;
      if (
        this.roleIdAllChatsPage >= this.roleIdTotalPage &&
        this.roleIdAllChatsPage !== 0
      )
        return;
      this.isLoadingRoleIdAllChats = true;

      const res = await this.service.getIdAllChat(
        this.aiData.role_id,
        this.roleIdAllChatsPage,
      );
      if (res.code !== 200 || !res.data) {
        console.error("updateRoleIdAllChats error", res.message);
        return;
      }
      const list = res.data.list;
      if (list.length === 0 && !this.roleIdAllChatsPage) {
        $allChatList.empty();
        return;
      }

      this.roleIdAllChatsPage = res.data.page;
      this.roleIdTotalPage = res.data["page_count"];

      let html = "";
      list.forEach((item) => {
        const time = formatRelativeTime(item.message.task_timestamp).split("+");
        const content = Array.isArray(item.message)
          ? ""
          : item.message.chat_content.content.replace(/\*(.*?)\*/g, "");

        html += `
          <li class="ai-gf-all-item" data-id="${item.chat_id}">
            <img class="ai-gf-all-item-avatar" src="${item.head_portrait[0].url}" alt="avatar">
            <svg class="ai-gf-all-item-del" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="14" height="14" viewBox="0 0 14 14">
              <defs>
                <clipPath>
                  <rect id="Rectangle_32155" data-name="Rectangle 32155" width="14" height="14" transform="translate(1396 423)" fill="#fff" stroke="#707070" stroke-width="1"/>
                </clipPath>
              </defs>
              <g id="btn_del_hover" transform="translate(-1396 -423)">
                <path id="Path_2030" data-name="Path 2030" d="M7,1123h4m-8,2H15m-1.333,0-.468,7.013a4.889,4.889,0,0,1-.332,1.98,2,2,0,0,1-.866.807,4.876,4.876,0,0,1-1.995.2H7.994A4.876,4.876,0,0,1,6,1134.8a2,2,0,0,1-.866-.807,4.889,4.889,0,0,1-.332-1.98L4.333,1125m3.333,3v3.333M10.333,1128v3.333" transform="translate(1394 -699)" fill="none" stroke="#eef3ff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
              </g>
            </svg>

            <div class="ai-gf-all-item-info">
              <div class="ai-gf-all-item-time">${time[0]}</div>
              <div class="ai-gf-all-item-time">${time[1]}</div>
              <div class="ai-gf-all-item-msg">${content}</div>
            </div>
          </li>
        `;
      });

      $allChatList.append(html);
    } catch (e) {
      console.error("updateAllChat error", e);
    } finally {
      this.isLoadingRoleIdAllChats = false;
    }
  }

  async closeChat(isClick, status = "") {
    let fn = async () => {
      this.toggleGFInfoDialog(false);
      $(".change-position-box").hide();
      $("body").css({
        "overflow-y": "auto",
        position: "static",
      });
      history.pushState(null, null, "/ai-girlfriend.html");
      clearInterval(this.loginTimer);
      clearInterval(this.heartTimer);
      clearInterval(this.disconnectTimer);
      clearTimeout(this.helloTimer);
      this.clearTimeoutAudioQueue();
      this.clearPromiseWait();
      this.clearRoleIdAllChats();
      this.clearReplyList();
      this.clearPersona();
      this.clearSessionData();
      this.changePopup = null;
      this.loginPopup = null;
      const $userInputMsg = $("#userInputMsg");
      $userInputMsg.val("");
      window.innerWidth > 1200
        ? $userInputMsg.css("height", "46px")
        : $userInputMsg.css("height", ".88rem");

      const $chattingContainer = $(".chatting-container");
      $chattingContainer.find("audio").off("play pause ended");
      $chattingContainer.empty(); //清空聊天框
      // let data = {
      //     ...this.connectMsg,
      //     "request_type": 30,
      // }
      $Popup().closeAll();
      if (status) {
        this.chatReLoading(true);
      } else {
        this.data().modelDOM.fadeOut();
      }

      // SOCKET.send(JSON.stringify(data));
      this.socketClose = true;
      SOCKET?.close();

      if (this.isChat && status != "restart") {
        let obj = { ...this.aiData };
        aiGirlFriend.addRecentChatting(obj);
      }
      this.isChat = false;
      let historyParam = "home";
      if (aiGirlFriend.tab == "my") {
        historyParam = "my-characters";
      } else if (aiGirlFriend.tab == "voice") {
        historyParam = "voice-pool";
      }
      history.replaceState(null, "", `/ai-girlfriend.html?${historyParam}`);
      aiGirlFriend.resetAll = this.isChangeData;
      aiGirlFriend.resetMy = this.isChangeData;
      await aiGirlFriend.initCharacters(true);
      aiGirlFriend.GetMyCharacters(true);
    };
    if (isClick) {
      this.showLoginPopup(async () => {
        await fn();
      });
    } else {
      await fn();
    }
  }

  lastMessage = null;

  connectChatting(url, status) {
    if (this.socketClose || !url || this.isConnectingSocket) return;
    this.isConnectingSocket = true;
    let initHandshake = false;
    // lei zong ip：
    // url = "ws://192.168.8.163:5000";
    SOCKET = new WebSocket(url);
    SOCKET.binaryType = "arraybuffer";
    let data = {
      ...this.connectMsg,
      chat_last_sep: 3234,
      request_type: this.isOldSeverUrl ? 11 : 10,
      chat_action: "",
      UserSendTime: new Date().getTime(),
    };
    this.UserSendTime = data.UserSendTime;
    this.isOldSeverUrl = false;

    let heart = {
      ...this.connectMsg,
      request_type: 40,
    };

    clearInterval(this.heartTimer);
    this.heartTimer = setInterval(() => {
      if (SOCKET.readyState === WebSocket.OPEN)
        SOCKET.send(JSON.stringify(heart));
    }, 1000 * 40);

    SOCKET.onopen = () => {
      this.isConnectingSocket = false;
      this.disconnectTimer = setTimeout(
        () => {
          SOCKET.close();
        },
        1000 * 5 * 60,
      );

      SOCKET.send(JSON.stringify(data));
    };

    SOCKET.onmessage = async (event) => {
      this.wssResponse = JSON.parse(event.data);
      if (!initHandshake) {
        initHandshake = true;

        this.AiHello();

        if (this.sendOtherQueue.length) {
          setTimeout(() => {
            while (this.sendOtherQueue.length > 0) {
              const data = JSON.parse(this.sendOtherQueue.shift());
              SOCKET.send(JSON.stringify(Object.assign(data, this.connectMsg)));
            }
          }, 1000);
        }

        if (this.disconnectMessage) {
          setTimeout(() => {
            const data = JSON.parse(this.disconnectMessage);
            SOCKET.send(JSON.stringify(Object.assign(data, this.connectMsg)));
            this.disconnectMessage = "";
          }, 1000);
        }
      }

      const errorStatus = [300, 7001, 7002];
      if (errorStatus.includes(this.wssResponse.status)) {
        let data = {
          ...this.connectMsg,
          error_msg: this.wssResponse?.error_info,
          versions: currentVersion,
          time_stamp: this.wssResponse?.time_stamp ?? "",
          wss: this.socketUrl,
          wssResponse: this.wssResponse,
        };
        this.service.putLog(data);
      }
      if (!this.wssResponse["next_time"]) {
        clearTimeout(this.disconnectTimer);
        this.disconnectTimer = setTimeout(
          () => {
            SOCKET.close();
          },
          1000 * 5 * 60,
        );
      }

      if (this.wssResponse.status === 300 || this.wssResponse.status === 500) {
        SOCKET.close();

        this.disconnectMessage = this.lastMessage;
        let reconnect = await this.getChatData(url);
        if (!reconnect) {
          return;
        }
        this.connectChatting(reconnect["server_url"]);
        return;
      }

      if (this.wssResponse.status === 6001) {
        // $Popup({
        //     type:"error",
        //     content: "You already have a chat in progress..."
        // })
        gtag("event", "already_aigirlfriend_win");
        this.closeChat();
        return;
      }

      if (this.wssResponse.status === 7001) {
        console.error("audio error", {
          time_stamp: this.wssResponse.time_stamp,
          message: this.wssResponse["error_info"],
        });
        this.deleteTimeoutAudioQueue(this.wssResponse.time_stamp);
        $(`[data-id="${this.wssResponse.time_stamp}"]`).removeClass("active");
        return;
      }

      if (this.wssResponse.status === 7002) {
        console.error("audio service error", {
          time_stamp: this.wssResponse.time_stamp,
          message: this.wssResponse["error_info"],
        });
        this.deleteTimeoutAudioQueue(this.wssResponse.time_stamp);
        $(`[data-id="${this.wssResponse.time_stamp}"]`).removeClass("active");
        return;
      }

      if (this.wssResponse.status === 21) {
        this.assemblyAudioChunk(this.wssResponse);
        return;
      }

      if (
        this.wssResponse.status === 200 &&
        this.replyKey &&
        this.wssResponse.UserSendTime === this.replyKey
      ) {
        const $replyWrapper = $(".ai-reply-wrapper");

        const replyArr = this.wssResponse.chat_content.filter(Boolean);
        if (replyArr.length) {
          const $replyList = $(".ai-reply-list");
          $replyList.empty();
          let html = "";
          replyArr.forEach((item) => {
            html += `
               <li>
                 <p>${item}</p>
                 <div class="ai-reply-checkbox"></div>
               </li>`;
          });

          $replyList.html(html);
        }
        $replyWrapper.removeClass("loading");
        clearTimeout(this.replyTimer);
        this.replyKey = undefined;
        return;
      }

      // if(this.wssResponse.code !== 200) return false
      let content = this.wssResponse?.chat_content;
      let newAiMsgDom = $("#aiMessageBox");
      this.showMessage(
        newAiMsgDom,
        content,
        ".ai-message-container",
        false,
        this.wssResponse,
      );
    };
    SOCKET.onerror = (error) => {
      this.isConnectingSocket = false;
      console.error("socket error", error);
    };

    SOCKET.onclose = async (event) => {
      this.isConnectingSocket = false;
      if (!event.wasClean && !this.socketClose) {
        let reconnect = await this.getChatData(url);
        if (!reconnect) return;
        this.connectChatting(reconnect["server_url"]);
      }
    };
  }

  // /**
  //  * 本地缓存聊天记录，需要时再打开
  //  * @param id 聊天的role_id
  //  * @param role 需要缓存的角色 自己：user  AI：ai
  //  * @param content 需要缓存的聊天记录
  //  */
  // setChatHistory(id,role,content) {
  // closeFn()
  // showLoginWindow({
  //     fn: () => {
  //         chatLogin();
  //     },
  // });
  //
  // isLogin(false)

  // if (sessionStorage.getItem(id)) {
  //     var historyArr = JSON.parse(sessionStorage.getItem(id));
  // } else {
  //     var historyArr = [];
  // }
  // let data = {role, content}
  // historyArr.push(data)
  // sessionStorage.setItem(id, JSON.stringify(historyArr));
  // }

  lottiePlayerAudioLoading = $("#audio-loading-icon").clone();

  setChatLoading(isOpen) {
    let that = this;
    let container = $(".chatting-container");
    if (isOpen) {
      container.append(`
        <div class="ai-message-box item loading">
          <div class="img-container">
            <img src="${this.aiAvatarImg}" alt="" id="aiAvatarImg" class="aiAvatarImg" />
          </div>
          <div class="ai-message-container loading">
            <div class="chatting-loading-new">
              <span class="relative wh-8 w-2 animate-typing rounded-full bg-typing bouncing-element"></span>
              <span class="animation-delay-200 relative wh-8 w-2 animate-typing rounded-full bg-typing bouncing-element"></span>
              <span class="animation-delay-400 relative wh-8 w-2 animate-typing rounded-full bg-typing bouncing-element"></span>
            </div>
          </div>
        </div>
      `);

      this.chatLoadingTime = 0;
      this.loadingChatTimer = setInterval(() => {
        $(".chatting-loading").css(
          "background-position-x",
          that.chatLoadingTime + "px",
        );
        that.chatLoadingTime = that.chatLoadingTime + 8;
      }, 200);
    } else {
      clearInterval(this.loadingChatTimer);
      this.loadingChatTimer = null;
      this.chatLoadingTime = 0;
      $(".ai-message-box.item.loading").remove();
    }
  }

  chatReLoading(isStart) {
    isStart
      ? $(".chat_loading").addClass("active")
      : $(".chat_loading").removeClass("active");
  }

  setRmoveRecords(data) {
    if (!data || ttsBlank(data.UserSendTime)) return;
    const dom = $(`.chatOperation[data-timestamp="${data.UserSendTime}"]`);
    if (dom.length != 0) {
      dom.attr("data-timestamp", data.time_stamp ?? data.task_timestamp);
      dom.attr("data-isCheckTime", true);
    }
  }

  async showMessage(dom, msg, textDom, isHistory, data, sendTime) {
    if (!msg) return;
    let newAiMsgDom = dom.clone().removeAttr("id");
    let transMsg, transHTML;
    let $container = $(".chatting-container");
    onlyText(msg)
      ? (transMsg = msg.replace(/\*(.*?)\*/g, '<p style="margin:0">$1</p>'))
      : (transMsg = msg.replace(/\*(.*?)\*/g, "<p>$1</p>"));
    if (textDom === ".ai-message-container") {
      const timestamp = data.time_stamp ?? data.task_timestamp;
      this.chatMap.set(timestamp, {
        content: msg,
        timestamp,
        sendUser: "assistant",
        page: this.chatPage > -1 && isHistory ? this.chatPage : "",
        audioChunk: [],
        audioUrl: "",
        audioPath: data.chat_content.path ?? "",
      });
      this.lottiePlayerAudioLoading.removeAttr("id");
      $(".rechat").hide();
      transHTML = `<div class="chatOperation" data-timestamp='${timestamp}' data-sender='assistant' data-isCheckTime='true'>
                    <div class="chatName">${this.aiData.name}</div>
                    <div class="chatTools">
                      <div class="rechat" style="display:${isHistory ? "none" : "block"}"></div>
                      <div class="msgSetting ai">
                        <div class="setting_box">
                          <div class="setting_copy">
                            <img src="/dist/img/ai-chatting/icon_copy_black.svg"/>
                            ${jsonData.aiGirlFriendChat.copy}
                          </div>
                          <div class="setting_delete">
                            <img src="/dist/img/ai-chatting/icon_del.svg"/>
                            ${jsonData.aiGirlFriendChat.delete}
                          </div>
                        </div>
                      </div>
                      ${
                        !onlyText(msg) && this.hasAudio
                          ? `<div class="audio-button" data-id="${timestamp}">
                        <div class="audio-play-icon"></div>
                          <img src="/dist/img/ai-chatting/icon_loading.svg" class="audio-loading-icon"/>
                        <lottie-player style="display: none" src="/dist/img/ai-chatting/audio-loading.json"
                          background="transparent" speed="1" loop autoplay>
                        </lottie-player>
                        <audio src="" data-path="${data.chat_content.path ? "loading" : ""}"></audio>
                      </div>`
                          : ""
                      }
                    </div>
                  </div>
                  <div class="chat_msg"></div>
                  `;
      newAiMsgDom.find(textDom).html(transHTML);
      const $chatContent = newAiMsgDom.find(textDom).find(".chat_msg");
      if (this.userConfig.streaming && !isHistory) {
        const tagExp = /(<\/?p[^>]*>)/g;
        const charArr = transMsg.split(tagExp).filter(Boolean);
        let isInTag = false;
        let currentParagraph = null;
        let contentIndex = 0;

        this.isUserScrolling = false;

        const scrollToBottom = () => {
          if (!this.isUserScrolling) {
            $container.scrollTop($(".chatting-container")[0].scrollHeight);
          }
        };

        const displayNextCharacter = (char, index) => {
          if (index <= char.length) {
            setTimeout(() => {
              if (isInTag && currentParagraph) {
                currentParagraph.text(char.substring(0, index));
              } else {
                $chatContent.html(
                  `${$chatContent.html()}${char.charAt(index - 1)}`,
                );
              }

              scrollToBottom();
              displayNextCharacter(char, index + 1);
            }, 16);
          } else {
            processNextSegment();
          }
        };

        const processNextSegment = () => {
          if (contentIndex < charArr.length) {
            const char = charArr[contentIndex++];
            if (tagExp.test(char)) {
              isInTag = !isInTag;
              if (isInTag) {
                currentParagraph = $(char + "</p>").appendTo($chatContent);
              }
              processNextSegment();
            } else {
              displayNextCharacter(char, 0);
            }
          }
        };

        processNextSegment();
      } else {
        $chatContent.html(transMsg);
      }
    } else {
      const timestamp = sendTime ?? data.time_stamp ?? data.task_timestamp;
      this.chatMap.set("user" + timestamp, {
        content: msg,
        timestamp,
        sendUser: "user",
        page: this.chatPage > -1 && isHistory ? this.chatPage : "",
        audioChunk: [],
        audioUrl: "",
        audioPath: data?.chat_content?.path ?? "",
      });
      let name = jsonData.aiGirlFriendChat.User;
      if (getCookie("access_token")) {
        const userInfo = JSON.parse(getCookie("user_info"));
        name = userInfo.first_name + " " + userInfo.last_name;
        name = name === " " ? userInfo.email.split("@")[0] : name;
      }
      transHTML = `<div class="chatOperation" data-timestamp='${timestamp}' data-isCheckTime='${isHistory}' data-sender='user'>
                    <div class="chatName">${name}</div>
                    <div class="chatTools">
                      <div class="msgSetting my">
                        <div class="setting_box">
                          <div class="setting_copy">
                            <img src="/dist/img/ai-chatting/icon_copy_black.svg"/>
                            ${jsonData.aiGirlFriendChat.copy}
                          </div>
                          <div class="setting_delete">
                            <img src="/dist/img/ai-chatting/icon_del.svg"/>
                            ${jsonData.aiGirlFriendChat.delete}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="chat_msg">
                  ${transMsg}
                  </div>
                  `;
      newAiMsgDom.find(textDom).html(transHTML);
    }

    this.setChatLoading(false);
    if (isHistory) {
      $container.prepend(newAiMsgDom);
    } else {
      $container.append(newAiMsgDom);
      if (textDom === ".my-message-container") {
        this.setChatLoading(true);
      }
      $container.scrollTop($container.prop("scrollHeight"));
    }
    this.setRmoveRecords(data);

    if (textDom === ".ai-message-container") {
      const $audio = newAiMsgDom.find(textDom).find("audio");
      const $audioButton = $audio.parent(".audio-button");
      if ($audio.length) {
        $audio.on("play", () => {
          $audioButton.addClass("active");
        });
        $audio.on("pause", () => {
          $audioButton.removeClass("active");
        });
        $audio.on("ended", () => {
          $audioButton.removeClass("active");
        });
      }
    }

    function onlyText(s) {
      const pattern = /^\*[^*]+\*$/;
      return pattern.test(s);
    }
  }

  sendMessage() {
    gtag("event", "click_aigirlfriend_send");
    this.clearReplyList();
    const $userInputMsg = $("#userInputMsg");
    let message = $userInputMsg.val();
    if (!message || /^\s*$/.test(message)) return false;
    message = message.replace(/[(（](.*?)[)）]/g, "*$1*");
    let UserSendTime = new Date().getTime();
    let data = {
      ...this.connectMsg,
      chat_content: message,
      request_type: 20,
      chat_action: "",
      UserSendTime,
    };
    this.UserSendTime = data.UserSendTime;
    try {
      let newMyMsgDom = $("#myMessageBox");
      this.showMessage(
        newMyMsgDom,
        message,
        ".my-message-container",
        false,
        {},
        UserSendTime,
      );
      if (!SOCKET) {
        this.disconnectMessage = JSON.stringify(data);
      } else {
        if (SOCKET.readyState === WebSocket.OPEN) {
          this.AiHello();
          SOCKET.send(JSON.stringify(data));
        } else if (SOCKET.readyState === WebSocket.CLOSED) {
          this.disconnectMessage = JSON.stringify(data);
          this.connectChatting(this.socketUrl);
        } else {
          this.disconnectMessage = JSON.stringify(data);
        }
      }
    } catch (e) {
      console.warn(e);
      this.disconnectMessage = JSON.stringify(data);
    }

    let height;
    window.innerWidth < 1200 ? (height = ".88rem") : (height = "46px");
    $userInputMsg.css("height", height);

    this.lastMessage = JSON.stringify(data);
    $userInputMsg.val("");
    $(".send-btn").addClass("disable");
  }

  /**
   * 保存角色名字、头像背景信息
   * @returns {Promise<void>}
   */
  async saveCharacter() {
    gtag("event", "save_aigirlfriend_changephoto");
    // let error = $Popup({type: "error",errorType: "network"})
    const $characterNameInput = $("#characterNameInput");
    $characterNameInput.prop("disabled", true);

    function isBlob(obj) {
      return obj instanceof Blob;
    }

    let obj = {
      changeAvatar: "aiAvatarImg",
      changeBg: "bgImg",
    };
    let uploadObj = {
      changeAvatar: "head_portrait",
      changeBg: "head_portrait_background",
    };
    let uploadUrl;

    const name = $characterNameInput.val() + "";

    let uploadData = {
      role_id: this.aiData.role_id,
      my_characters_id:
        this.aiData.is_my_characters === 1 ? this.aiData.my_characters_id : 0,
      name: name.trim(),
      // type: this.aiData.type,
      is_draft: 2,
      tag: this.aiData.json.tag ?? "",
      persona: this.aiData.persona ?? "",
      gender: this.aiData.json.gender ?? "",
      description: this.aiData.json["Character_des"],
      scene: this.aiData["role_content"]["scene description"],
      greeting: this.aiData["role_content"].greeting,
      context: this.aiData["role_content"].context,
      chat_id: this.connectMsg.chat_id,
      head_portrait_background: !this.uploadbg
        ? "[]"
        : JSON.stringify(this.aiData.head_portrait_background),
    };

    try {
      let resKey;
      this.changePopup.loading.start();
      for (let key in this.uploadBlob) {
        if (isBlob(this.uploadBlob[key])) {
          await this.service
            .getUploadUrl({ file_name: `${key}.png` })
            .then((res) => {
              uploadUrl = res.data["upload_url"];
              resKey = res.data.key;
              this[obj[key]] = res.data["access_url"];
              if (obj[key] === "bgImg") {
                // this.bgImg =
                this.aiData.head_portrait_background = [];
                this.aiData.head_portrait_background.push({
                  key: "head_portrait_background",
                  url: res.data["access_url"],
                  value: resKey,
                });
              } else {
                this.aiData["changeAvatarUrl"] = res.data["access_url"];
              }
            })
            .catch((_) => {
              $Popup({
                type: "error",
                errorType: "network",
              });
            });

          await this.service
            .putUploadUrl(uploadUrl, this.uploadBlob[key])
            .then((res) => {
              if (res === 200) {
                uploadData[uploadObj[key]] = JSON.stringify([
                  { key: uploadObj[key], value: resKey },
                ]);
              }
            });
        }
      }
      //上传图片
      if (
        uploadData.head_portrait_background === undefined &&
        !this.aiData.head_portrait_background[0]?.url
      )
        uploadData["head_portrait_background"] = "[]";

      if (uploadData.head_portrait === undefined)
        uploadData["head_portrait"] = JSON.stringify(this.aiData.head_portrait);

      if (getUrlVal("avatarKey")) {
        let url = atob(getUrlVal("headAvatar"));
        let avatarKey = atob(getUrlVal("avatarKey"));
        let head = JSON.parse(uploadData.head_portrait);
        if (head[0].value === url) {
          head[0].value = avatarKey;
          head[0].is_temp = 1;
          delete head[0].url;
          uploadData["head_portrait"] = JSON.stringify(head);
        }
      }

      const res = await this.service.roleEdit(uploadData);
      if (res.code === 401) {
        this.closeChat();
        return;
      }
      if (res.code !== 200) {
        $Popup({
          type: "error",
          errorType: "normal",
        });
        $characterNameInput.prop("disabled", false);
        this.changePopup.loading.end();
        return;
      }
      this.isChangeData = true;
      this.aiData.name = uploadData.name;
      this.aiData.head_portrait = JSON.parse(uploadData.head_portrait);
      this.aiData.head_portrait[0]["url"] = this.aiData.changeAvatarUrl;
      this.aiData["is_my_characters"] = 1;
      if (this.isMyCharacterStatus === 2) this.aiData["toMyCharacter"] = true;
      this.aiData["my_characters_id"] = res.data.my_characters_id;
      this.aiData.role_id = res.data.role_id;
      this.aiData.status = 2;
      if (uploadData.head_portrait_background === "[]") {
        this.bgImg = "";
        this.aiData.head_portrait_background = [];
      }
      let container = $(".chatting-container");
      container.scrollTop(
        container.prop("scrollHeight") - container.height() - 10,
      );
      // this.getAiInfo(this.aiData.id,this.aiData['is_my_characters'],this.aiData['my_characters_id'])
      this.changePopup.close();

      if (!this.aiData.head_portrait[0].url)
        this.aiData.head_portrait[0].url = this.aiAvatarImg;
      this.updateCharacter();

      $characterNameInput.prop("disabled", false);
      this.changePopup.loading.end();
      this.changePopup = null;
      this.aiData.name = uploadData.name;
      this.changeBgAvatar();

      await this.updateCharacterFunc(
        this.aiData.role_id,
        this.aiData.is_my_characters,
        this.aiData.my_characters_id,
      );
    } catch (e) {
      $Popup({ type: "error", errorType: "network" });
      this.changePopup.loading.end();
      this.changePopup = null;
    } finally {
      this.setSessionData();
    }
  }

  async assemblyAudioChunk(data) {
    const chat = this.chatMap.get(data.time_stamp);
    const type = "audio/mpeg";

    this.deleteTimeoutAudioQueue(data.time_stamp);

    chat.audioChunk[data["curr_id"] - 1] = binaryStringToBlob(
      data["file_data"],
      type,
    );
    if (data["curr_id"] === data["max_len"]) {
      const $audio = $(`[data-id="${data.time_stamp}"]`);
      let url = "";
      let blob = null;
      try {
        blob = new Blob(Array.from(chat.audioChunk), { type: type });
        url = URL.createObjectURL(blob);
        chat["audioUrl"] = url;
        $audio.find("audio").attr("src", url);

        const promiseWait = this.promiseWaitMap.get(data.time_stamp);
        if (promiseWait) {
          this.deletePromiseWait(data.time_stamp);
        }
      } catch (e) {
        console.error("assembly audio error", e);
        chat.audioChunk = [];
        $audio.removeClass("active loading");
      }

      try {
        await this.saveAudio(
          chat.page,
          this.connectMsg.chat_id,
          data.time_stamp,
          blob,
        );
      } catch (e) {
        console.error("save audio error", e);
      }
    }

    function binaryStringToBlob(binaryString, mimeType) {
      const byteCharacters = atob(binaryString);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: mimeType });
    }
  }

  async saveAudio(page, chatId, timestamp, blob) {
    const urlRes = await this.service.getUploadFileUrl();
    const url = urlRes.data["upload_url"];
    const key = urlRes.data["key"];
    await this.service.putUploadUrl(url, blob);
    return this.service.saveAudio(page, chatId, timestamp, key);
  }

  sendOtherQueue = [];

  sendOtherMessage(data) {
    const json = JSON.stringify(data);
    if (!SOCKET) {
      this.sendOtherQueue.push(json);
      return;
    }
    if (SOCKET.readyState === WebSocket.OPEN) {
      SOCKET.send(json);
    } else {
      this.connectChatting(this.socketUrl);
      this.sendOtherQueue.push(json);
    }
  }

  getHistoryAudioQueueSet = new Set();

  async getHistoryAudio(timestamp, key) {
    this.getHistoryAudioQueueSet.add(timestamp);
    const res = await this.service.getAccessUrl(key);
    const url = res.data["static_url"] || res.data["url"];
    const $audioButton = $(`[data-id="${timestamp}"]`);
    const $audio = $audioButton.find("audio");
    $audio.attr("data-path", "loaded");
    $audio.attr("src", url);
    this.getHistoryAudioQueueSet.delete(timestamp);
  }

  timeoutAudioQueueMap = new Map();

  setTimeoutAudioQueue(timestamp) {
    if (this.timeoutAudioQueueMap.has(timestamp)) {
      clearTimeout(this.timeoutAudioQueueMap.get(timestamp));
    }
    this.timeoutAudioQueueMap.set(
      timestamp,
      setTimeout(() => {
        this.timeoutAudioQueueMap.delete(timestamp);
        this.deletePromiseWait(timestamp);
        $(`[data-id="${timestamp}"]`).removeClass("loading");
        console.error("generate audio timeout, timestamp:", timestamp);
      }, 3000 * 10),
    );
  }

  deleteTimeoutAudioQueue(timestamp) {
    if (this.timeoutAudioQueueMap.has(timestamp)) {
      clearTimeout(this.timeoutAudioQueueMap.get(timestamp));
      this.timeoutAudioQueueMap.delete(timestamp);
    }
  }

  clearTimeoutAudioQueue() {
    for (let [_, value] of this.timeoutAudioQueueMap) {
      clearTimeout(value);
    }
    this.timeoutAudioQueueMap.clear();
  }

  deletePromiseWait(timestamp) {
    const promiseWait = this.promiseWaitMap.get(timestamp);
    if (promiseWait) {
      promiseWait.finish();
      this.promiseWaitMap.delete(timestamp);
    }
  }

  clearPromiseWait() {
    for (let [_, value] of this.promiseWaitMap) {
      value.finish();
    }
    this.promiseWaitMap.clear();
  }

  lastAudioId = undefined;

  async toggleAudioBtn($el, status) {
    const closeOtherAudio = () => {
      const $audioBtnList = $(".audio-button").not($el);
      $audioBtnList.removeClass("active");
      $audioBtnList.find("audio").each((_, el) => {
        if ($(el).attr("src") !== "") {
          el.pause();
          el.currentTime = 0;
        }
      });
    };

    closeOtherAudio();

    const $audio = $el.find("audio");
    const audio = $audio.get(0);
    const src = $audio.attr("src");
    const path = $audio.attr("data-path");
    const timestamp = $el.attr("data-id");
    const mapData = this.chatMap.get(timestamp);
    if (status) {
      this.lastAudioId = timestamp;
      if ($el.hasClass("loading")) return;
      if (src === "" && path === "") {
        $el.addClass("loading");
        try {
          if (this.timeoutAudioQueueMap.has(timestamp)) {
            return;
          }

          const res = await this.service.getVoiceLimit();
          if (res.code !== 200) {
            console.error("getVoiceLimit error:", res);
            $el.removeClass("loading");
            return;
          }

          const { is_use: isUse } = res.data;
          if (isUse !== 1) {
            gtag("event", "limit_aigirlfriend_voice");
            this.toggleGFInfoDialog(true, ".ai-gf-audio-limit-dialog");
            $el.removeClass("loading");
            return;
          }

          const content = mapData.content;
          const text = content.replace(/\*.*?\*/g, "");

          const req = {
            request_type: 21,
            chat_content: text.trim(),
            time_stamp: timestamp,
            chat_id: this.connectMsg.chat_id,
            token: getCookie("SsToken"),
          };

          this.sendOtherMessage(req);
          this.setTimeoutAudioQueue(timestamp);

          const promiseWait = new PromiseWait();
          this.promiseWaitMap.set(timestamp, promiseWait);

          await promiseWait.wait();

          if ($audio.attr("src") === "") {
            $el.removeClass("loading");
            return;
          }

          if ($el.hasClass("loading")) {
            $el.removeClass("loading");
            if (this.lastAudioId === timestamp) {
              closeOtherAudio();
              audio.play().catch((e) => {
                $el.removeClass("active");
                console.error("audio play error by ws:", e);
              });
            }
          }
          return;
        } catch (e) {
          console.error("toggleAudioBtn error:", e);
          $el.removeClass("loading");
          return;
        } finally {
          this.deletePromiseWait(timestamp);
        }
      }
      if (src === "" && path === "loading") {
        $el.addClass("loading");
        if (this.getHistoryAudioQueueSet.has(timestamp)) {
          return;
        }
        await this.getHistoryAudio(timestamp, mapData.audioPath);
        $el.removeClass("loading");
        if (this.lastAudioId === timestamp) {
          closeOtherAudio();
          audio.play().catch((e) => {
            $el.removeClass("active");
            console.error("audio play error by history:", e);
          });
        }
        return;
      }
      if (!!src) {
        audio.play().catch((_) => {
          $audio.attr("data-path", "");
          $audio.attr("src", "");
          this.toggleAudioBtn($el, true);
        });
      }
    } else {
      $el.removeClass("active");
      if (src !== "") {
        audio.pause();
      }
    }
  }

  setLoginTimer() {
    if (this.loginTimer) clearTimeout(this.loginTimer);
    this.loginTimer = setTimeout(
      () => {
        this.showLoginPopup();
      },
      1000 * 60 * 5,
    );
  }

  showLoginPopup(fn = function () {}) {
    $("#userInputMsg").trigger("blur");
    if (!getCookie("access_token") && !this.loginPopup) {
      gtag("event", "alert_aigirlfriend_loginwin");
      this.loginPopup = $Popup({
        title: gfChattingJsLan.loginTitle,
        content: gfChattingJsLan.loginContent,
        closeBtn: gfChattingJsLan.loginBtn,
        otherBtns: gfChattingJsLan.loginOtherBtn,
        exist: "chatLoginPopup",
        addBorderRadius: true,
        onClose: () => {
          this.loginPopup = null;
          this.setLoginTimer();
          gtag("evet", "login_aigirlfriend_loginwin");
          showLoginWindow({
            fn: () => {
              gtag("evet", "succ_aigirlfriend_loginwin");
              chatLogin();
            },
          });
        },
        topCloseFn: () => {
          this.setLoginTimer();
          gtag("evet", "close_aigirlfriend_loginwin");
          this.loginPopup = null;
        },
      });
      this.loginPopup.modal.find(".login-popup-close-btn").on("click", () => {
        gtag("evet", "notnow_aigirlfriend_loginwin");
        this.loginPopup.close();
        this.loginPopup = null;
        this.setLoginTimer();
        fn();
      });
    } else {
      fn();
    }
  }

  changeBgAvatar() {
    let that = this;
    $(".aiAvatarImg").each(function () {
      $(this).attr("src", that.aiAvatarImg);
    });

    $(".ai-name").each(function () {
      $(this).text(that.aiData.name);
    });

    let img = new Image();
    img.onload = function () {
      let bgImg = that.bgImg || that.aiAvatarImg;

      that.ratio = this.width / this.height;
      that.ratio.toFixed(2) > 1
        ? (that.boxPosition.changeBtnMiddle.chatBgImg.left = 0)
        : (that.boxPosition.changeBtnMiddle.chatBgImg.left =
            "calc(50% - 661px / 2)");
      const $chatBgImg = $("#chatBgImg");
      that.ratio.toFixed(2) > 1
        ? $chatBgImg.css({ width: "100vw", left: "0px" })
        : $chatBgImg.css({
            width: "661px",
            left: that.boxPosition[that.currentPosition || "changeBtnMiddle"]
              .chatBgImg.left,
          });
      if ($(".audio_btn.bg").hasClass("active")) {
        that.changeBackground(true);
      } else {
        that.changeBackground(false);
      }
    };
    img.src = that.bgImg || that.aiAvatarImg;
  }

  hideShowImgBox(bindId, action) {
    let obj = {
      avatarImgBox: {
        id: "#avatarText",
        iconId: "#avatarIcon",
        imgUrlObj: "uploadAvatar",
        blob: "changeAvatar",
        showFn: () => {
          gtag("event", "upload_aigirlfriend_avatar");
          this.uploadAvatarChange = true;
          if ($("#characterNameInput").val().length > 0)
            this.changePopup.enableCloseBtn();
        },
        hideFn: () => {
          this.uploadAvatarChange = false;
          this.changePopup.disableCloseBtn();
          gtag("event", "del_aigirlfriend_avatar");
        },
      },
      bgImgBox: {
        id: "#bgText",
        iconId: "#bgIcon",
        imgUrlObj: "uploadBg",
        blob: "changeBg",
        showFn: () => {
          gtag("event", "upload_aigirlfriend_bg");
          this.uploadbg = true;
        },
        hideFn: () => {
          // this.uploadStatus = true
          // gtag("event", "del_aigirlfriend_bg")
          this.uploadbg = false;
        },
      },
    };

    let id = "#" + bindId;

    let fn = {
      hide: () => {
        $(id).hide();
        $(obj[bindId].id).text(gfChattingJsLan.changePopBtnSpanSet);
        $(obj[bindId].iconId).attr(
          "src",
          "/dist/img/ai-chatting/btn_add_small.png",
        );
        this[obj[bindId].imgUrlObj] = false;
        this.uploadBlob[obj[bindId].blob] = {};
        obj[bindId].hideFn();
      },
      show: () => {
        $(id).show();
        $(obj[bindId].id).text(gfChattingJsLan.changePopBtnSpanAddNew);
        this[obj[bindId].imgUrlObj] = true;
        $(obj[bindId].iconId).attr(
          "src",
          "/dist/img/ai-chatting/btn_add_normal.png",
        );
        obj[bindId].showFn();
      },
    };

    fn[action]();
  }

  openChangeHandle() {
    let that = this;
    let domFn;
    this.uploadStatus = false;

    this.changePopup = $Popup({
      title: gfChattingJsLan.changePopTitle,
      content: `<div class="change-photo-box">
          <div class="change-avatar-box">
             <div>${gfChattingJsLan.changePopName}</div>
             <div class="name-input-box">
             <input type="text" id="characterNameInput" maxlength="100">
           </div>
            <div>${gfChattingJsLan.changePopAvatar}</div>
            <div class="avatar-box">
              <div class="avatar-img changeAvatarImg" id="avatarImgBox">
                <img src="/dist/img/ai-chatting/btn_close_small.png" id="closeAvatarIcon" class="close-icon" bindId="avatarImgBox" alt="close button" />

                <img src="" alt="" id="changeAvatarImg" class="changeAvatarImg" />
              </div>
              <div class="replace-img-btn" id="changeAvatarId" fn="changeAvatar">
                <div class="replace-btm-container">
                  <img src="dist/img/ai-chatting/btn_add_normal.png" alt="" id="avatarIcon" class="img-icon" />
                  <div class="change-btn-text" id="avatarTextBox">${gfChattingJsLan.changePopBtn}</div>
                </div>
              </div>             
            </div>
            
              <div class="avatar-tip-box">
                <img src="/dist/img/ai-chatting/icon_tip.png" alt="tip icon">
                <span class="tip-text" id="avatarTip">${gfChattingJsLan.changePopSupport}</span>
              </div>

            <div class="change-bg-title">${gfChattingJsLan.changePopBgDesc}</div>
            <div class="change-bg-sub">${gfChattingJsLan.changePopRecommend}</div>
            <div class="avatar-box">
              <div class="avatar-img" id="bgImgBox">
                <img src="/dist/img/ai-chatting/btn_close_small.png" id="closeBgIcon" class="close-icon" bindId="bgImgBox" alt="close icon"/>
                <img src="" alt="" id="changeBgImg" class="changeBgImg" />
              </div>
              <div class="replace-img-btn" id="changeBgId" fn="changeBg">
                <div class="replace-btm-container">
                  <img src="dist/img/ai-chatting/btn_add_normal.png" alt="" id="bgIcon" class="img-icon" />
                  <div  class="change-btn-text" id="bgTextBox">${gfChattingJsLan.changePopBgBtn}</div>
                </div>
              </div>
            </div>
            
            <div class="bg-tip-box">
                <img src="/dist/img/ai-chatting/icon_tip.png" alt="tip icon">
                <span class="tip-text" id="bgTip">${gfChattingJsLan.changePopBgSupport}</span>
           </div>

            <input type="file" name="file" id="fileInput" style="display: none"   accept="image/jpeg, image/png, image/webp">
          </div>
        </div>`,
      closeBtn: gfChattingJsLan.changePopCloseBtn,
      otherBtns: gfChattingJsLan.changePopOtherBtn,
      autoClose: false,
      topCloseFn: function () {
        this.uploadBlob = {
          changeAvatar: {},
          changeBg: {},
        };
        this.uploadStatus = false;
        gtag("event", "close_aigirlfriend_changephoto");
      },
      onClose: () => {
        this.uploadStatus ? this.saveCharacter() : this.changePopup.close();
      },
      exist: "change",
    });

    $("#changeOtherBtn")
      .off("click")
      .on("click", () => {
        that.uploadBlob = {
          changeAvatar: {},
          changeBg: {},
        };

        gtag("event", "discard_aigirlfriend_changephoto");
        that.uploadStatus = false;
        that.changePopup.close();
      });

    const $characterNameInput = $("#characterNameInput");

    $characterNameInput.val(this.aiData.name);

    $characterNameInput.off("input").on("input", function () {
      let maxLength = 50;
      let text = $(this).val();

      let forbiddenChars = /[/*&\\%$#@]/g;
      if (forbiddenChars.test(text)) {
        $(this).val(text.replace(forbiddenChars, ""));
      }

      text = $(this).val();
      let textLength = text.length;

      if (textLength > maxLength) {
        $(this).val(text.substring(0, maxLength));
        textLength = maxLength;
      }

      that.uploadStatus = true;
      if (textLength === 0) {
        that.changePopup.closeButton.disable();
      } else if (that.uploadAvatarChange) {
        that.changePopup.closeButton.enable();
      }
    });

    this.aiAvatarImg
      ? $("#changeAvatarImg").attr("src", this.aiAvatarImg)
      : that.hideShowImgBox("avatarImgBox", "hide");
    const $changeBgImg = $("#changeBgImg");
    this.aiData.head_portrait_background.length && this.bgImg
      ? $changeBgImg.attr("src", this.bgImg)
      : that.hideShowImgBox("bgImgBox", "hide");

    $changeBgImg.attr("src", this.bgImg);

    //每次打开时需要重新绑定，在bindEvent绑定关闭popup会失效

    // --------------------
    $("#closeAvatarIcon,#closeBgIcon")
      .off("click")
      .on("click", function () {
        that.uploadStatus = true;
        let bindId = $(this).attr("bindId");
        if (bindId === "bgImgBox") gtag("event", "del_aigirlfriend_bg");
        that.hideShowImgBox(bindId, "hide");
      });
    // --------------------

    $(".replace-img-btn")
      .off("click")
      .on("click", function () {
        domFn = $(this).attr("fn");
        $("#fileInput").trigger("click");
      });

    $("#fileInput")
      .off("change")
      .on("change", async function () {
        let imgBlob;

        const errorDom = {
          changeAvatar: {
            text: "#avatarTip",
            box: ".avatar-tip-box",
          },
          changeBg: {
            text: "#bgTip",
            box: ".bg-tip-box",
          },
        };
        const domIcon = {
          changeAvatar: {
            icon: "#avatarIcon",
            text: "#avatarTextBox",
          },
          changeBg: {
            icon: "#bgIcon",
            text: "#bgTextBox",
          },
        };

        let loadingId = domIcon[domFn].icon;
        let loadingText = domIcon[domFn].text;
        let domBox = errorDom[domFn].box;
        let domText = errorDom[domFn].text;

        let loadingStart = () => {
          $(loadingId).attr("src", "/dist/img/ai-chatting/icon_loading.svg");
          $(loadingId).addClass("popup-loading");
          $(loadingText).html(gfChattingJsLan.changePopUploading);
        };

        let loadingEnd = () => {
          $(loadingId).removeClass("popup-loading");
          $(loadingId).attr("src", "dist/img/ai-chatting/btn_add_normal.png");

          let originText = {
            changeAvatar: gfChattingJsLan.changePopBtn,
            changeBg: gfChattingJsLan.changePopBgBtn,
          };
          $(loadingText).html(originText[domFn]);
        };

        const fn = {
          changeAvatar: (url) => {
            const img = new Image();
            img.onload = function () {
              const height = this.naturalHeight;
              const width = this.naturalWidth;
              if (height < 32 || width < 32) {
                $("#avatarTip").text(gfChattingJsLan.changePopAvatarError);
                $(".avatar-tip-box").css("visibility", "visible");
              } else {
                that.uploadStatus = true;
                $(".changeAvatarImg").attr("src", url);
                that.hideShowImgBox(bindBox[domFn], "show");
              }
            };
            img.src = URL.createObjectURL(imgBlob);
            $(domBox).css("visibility", "hidden");
          },
          changeBg: (url) => {
            const img = new Image();
            img.onload = function () {
              const height = this.naturalHeight;
              const width = this.naturalWidth;

              if (height < 128 || width < 128) {
                $("#bgTip").text(gfChattingJsLan.changePopBgError);
                $(".bg-tip-box").css("visibility", "visible");
              } else {
                that.uploadStatus = true;
                that.bgImg = url;
                $(".changeBgImg").attr("src", that.bgImg);
                that.hideShowImgBox(bindBox[domFn], "show");
              }
            };
            img.src = URL.createObjectURL(imgBlob);
            $(domBox).css("visibility", "hidden");
          },
        };
        // 显示的盒子dom
        let bindBox = {
          changeAvatar: "avatarImgBox",
          changeBg: "bgImgBox",
        };

        let file = this.files[0];
        const suffix = file.name.split(".").pop().toLowerCase();

        if (
          !/^(image\/(jpg|jpeg|png|webp))$/.test(file.type) ||
          !/^jpg|jpeg|png|webp$/.test(suffix)
        ) {
          $(domText).text(gfChattingJsLan.changePopSupport);
          $(domBox).css("visibility", "visible");
          $(this).val(null);
          return false;
        }

        // 图片大小验证
        if (file?.size > 100 * 1024 * 1024) {
          $(domText).text(gfChattingJsLan.changePopMaxError);
          $(domBox).css("visibility", "visible");
          $(this).val(null);
          return false;
        }

        // 图片上传loading效果
        loadingStart();

        let { blog } = await resizeImageByFile(file);

        if (blog) {
          let url = URL.createObjectURL(blog);
          that.uploadBlob[domFn] = blog;
          imgBlob = blog;
          fn[domFn](url);
        } else {
          $(domText).text(gfChattingJsLan.changePopSupport);
          $(domBox).css("visibility", "visible");
        }
        $(this).val(null);

        // loading结束
        loadingEnd();
      });
  }

  async getAiDetails(roleId, isMyCharacter, my_characters_id) {
    try {
      const res = await this.service.getRoleInfo(
        roleId,
        isMyCharacter,
        my_characters_id,
      );
      if (res.code === 200) {
        return res.data;
      }

      $Popup({ type: "error", errorType: "normal", addBorderRadius: true });
      console.error("get-role-info", res.data.message);
    } catch (e) {
      $Popup({ type: "error", errorType: "normal", addBorderRadius: true });
    }
  }

  async getAiInfo(roleId, isMyCharacter, my_characters_id) {
    try {
      const data = await this.getAiDetails(
        roleId,
        isMyCharacter,
        my_characters_id,
      );
      if (!!data) {
        this.init(data);
      } else {
        $Popup({ type: "error", errorType: "normal", addBorderRadius: true });
      }
    } catch (e) {
      $Popup({ type: "error", errorType: "normal", addBorderRadius: true });
    }
  }

  async updateCharacterFunc(roleId, isMyCharacter, my_characters_id) {
    const unChangeKeyList = ["chat_id"];

    try {
      const newInfo = await this.getAiDetails(
        roleId,
        isMyCharacter,
        my_characters_id,
      );
      for (const key in newInfo) {
        if (
          newInfo.hasOwnProperty(key) &&
          (!this.aiData[key] || !unChangeKeyList.includes(key))
        ) {
          this.aiData[key] = newInfo[key];
        }
      }
      this.updateCharacter();
    } catch (e) {
      console.error("update character error:", e);
    }
  }

  changeScreen(isFull) {
    if (isFull) {
      if (userModel == "pc") {
        $("#changeBtnMiddle").click();
        $("#chattingContainer").css("height", "80vh");
      } else {
        $("#chattingContainer").css("height", "70vh");
      }
      $("#editIcon").hide();
      $(".chatting-container").addClass("fullscreen");
      // $(".mask-to-transparent").css("mask-image", "none");
    } else {
      $("#editIcon").show();
      $(".chatting-container").removeClass("fullscreen");
      $("#chattingContainer").css("height", this.chatHeight);
      $("#chattingContainer").scrollTop(
        $("#chattingContainer").prop("scrollHeight"),
      );
      // $(".mask-to-transparent").css("mask-image", "");
    }
  }

  changeBackground(isShow) {
    if (isShow) {
      $("#AiChat,#chatBgImg").css({
        "background-image": `none`,
        "background-color": "#151820",
      });
    } else {
      let src = this.bgImg || this.aiAvatarImg;
      $("#AiChat,#chatBgImg").css({
        "background-image": `url("${src}")`,
        "background-color": "transparent",
      });
    }
  }
}

function MSK2UTC(timestamp) {
  if (timestamp.includes("UTC")) {
    return new Date(timestamp.replace("UTC", "T") + "Z").getTime();
  } else {
    const standardizedTimestamp = timestamp.includes("T")
      ? timestamp
      : timestamp.replace(" ", "T") + ".000";
    return new Date(standardizedTimestamp + "+03:00").getTime();
  }
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function t(text, params = {}) {
  if (!text) return "";
  if (Object.keys(params).length === 0) return text;

  for (const key in params) {
    text = text.replace(new RegExp(`{{${key}}}`, "g"), params[key]);
  }
  return text;
}

function getUrlVal(val) {
  const url = window.location.href;
  if (!url.includes("?")) return false;
  const queryString = url.split("?")[1];
  const queryParams = queryString.split("&");
  const params = {};
  queryParams.forEach(function (param) {
    const keyValue = param.split("=");
    const key = decodeURIComponent(keyValue[0]);
    params[key] = decodeURIComponent(keyValue[1]);
  });

  return params[val];
}

/**
 * 解决IOS textarea placeholder 消失问题
 */
if (!("placeholder" in document.createElement("input"))) {
  $("input[placeholder],textarea[placeholder]").each(function () {
    const that = $(this),
      text = that.attr("placeholder");
    if (that.val() === "") {
      that.val(text).addClass("placeholder");
    }
    that
      .focus(function () {
        if (that.val() === text) {
          that.val("").removeClass("placeholder");
        }
      })
      .blur(function () {
        if (that.val() === "") {
          that.val(text).addClass("placeholder");
        }
      })
      .closest("form")
      .submit(function () {
        if (that.val() === text) {
          that.val("");
        }
      });
  });
}
