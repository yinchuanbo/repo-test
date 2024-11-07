var winRef = null,
  tryTimes = 0;
var evt = document.createEvent("HTMLEvents");
evt.initEvent("input", true, true);
class AiGirlFriend {
  constructor() {
    var that = this;
    this.proxy = new Proxy(this.data(), {
      set(target, prop, value) {
        if (prop === "editMcType") {
          that.oldEditType = that.editMcType;
        }
        setTimeout(async () => {
          if (prop === "mc_Avatar") {
            if (target["mc_Avatar"]) {
              $(".createMc_container .avatar").addClass("has");
              $(".avatar .addImage span").text(jsonAiGirlFriend.createMc.avatar_btnAdd);
            } else {
              $(".createMc_container .avatar").removeClass("has");
              $(".avatar .addImage span").text(jsonAiGirlFriend.createMc.avatar_btnSet);
            }
          }
          if (prop === "mc_Background") {
            if (target["mc_Background"]) {
              $(".createMc_container .background").addClass("has");
              $(".background .addImage span").text(jsonAiGirlFriend.createMc.background_btnAdd);
            } else {
              $(".createMc_container .background").removeClass("has");
              $(".background .addImage span").text(jsonAiGirlFriend.createMc.background_btnSet);
            }
          } else if (prop === "mc_Desc") {
            $(".whiteMeOut").val(value);
          } else if (prop === "mc_Name") {
            $(".createMC_name").val(value);
          } else if (prop === "mc_Gender") {
            $(".createMC_gender").val(value);
          } else if (prop === "mc_Persona") {
            $(".createMC_persona").val(value);
          } else if (prop === "mc_Greeting") {
            $(".createMC_Greeting").val(value);
          } else if (prop === "mc_Scenario") {
            $(".createMC_Scenario").val(value);
          } else if (prop === "mc_Dialogue") {
            $(".createMC_Dialogue").val(value);
          } else if (prop === "mc_visibility") {
            $(".createMc_select .select_content").text(value);
            $(`.createMc_select .select_list_item`).removeClass("active");
            $(`.createMc_select .select_list_item[data-type='${value}']`).addClass("active");
          } else if (prop === "mc_Categories") {
            let text = "",
              tip =
                value.length > 1 ? jsonAiGirlFriend.createMc.Categories_tips : jsonAiGirlFriend.createMc.Categories_tip;
            text = tip.replace("%ss", value.length);
            $(".checkNum").text(text);
            $(".createMc_radio").prop("checked", false);
            $(".createMc_radio").each(function () {
              const res = $(this).attr("value");
              value.forEach((item) => {
                item == res ? $(this).prop("checked", true) : "";
              });
            });
          } else if (prop === "editMcType") {
            // open create
            if (value) {
              $("#myCharacters").click();
              $(".myCharacters_Box,.noFoundMc,.Mycharacters_loading").hide();
              $(".createMyCharacter_Box").show();
              $(".createBtn").addClass("active");
              $(".myCharactersBox .classify").hide();
              if (value === "create") {
                gtag("event", "show_aigirlfriend_create");
                $(".createMc_container").removeClass("editStart");
              } else {
                gtag("event", "show_aigirlfriend_edit");
                $(".createMc_container").addClass("editStart");
              }
            } else {
              $(".myCharactersBox .classify").show();
              that.composeClassify($(".myCharactersBox"));
            }
          } else if (prop === "homeTag") {
            that.initCharacters();
          } else if (prop === "mcTag" || prop === "primary") {
            that.GetMyCharacters();
          }
          // Verify that it can be published or created
          // if (that.editMcType === "create") {
          //   // if (that.mc_Avatar && that.mc_Name && that.mc_Desc) {
          //   //   $("#createMc").removeClass("disabled");
          //   // } else {
          //   //   $("#createMc").addClass("disabled");
          //   // }
          // } else if (that.editMcType === "edit") {
          //   if (
          //     that.mc_Avatar &&
          //     that.mc_Desc &&
          //     that.mc_Persona &&
          //     that.mc_visibility &&
          //     that.mc_Categories.length != 0 &&
          //     that.mc_Greeting &&
          //     that.mc_Scenario
          //   ) {
          //     $("#editMc").removeClass("disabled");
          //   } else {
          //     $("#editMc").addClass("disabled");
          //   }
          // }

          if (prop == "tab" || prop == "CharactersCount" || prop == "MyCharactersCount") {
            that.pageProcess();
          }
        }, 10);
        target[prop] = value;
        return true;
      },
      get(target, prop) {
        return target[prop];
      },
    });
    Object.setPrototypeOf(AiGirlFriend.prototype, this.proxy);
    this.access_token = getCookie("access_token") ? getCookie("access_token") : "";
    // 如果登录状态下sort有值则选择其
    if (getCookie("aiGirlSort") && this.access_token) {
      const sort = getCookie("aiGirlSort");
      this.sort = sort;
      const target = $(`.character_select .select_list_item[data-sort='${sort}']`);
      $(`.character_select .select_list_item[data-sort]`).removeClass("active");
      target.addClass("active");
      target.parents(".select_list").siblings(".select_content").text(target.text());
      if (this.sort == "top") {
        $(".select_time").css("display", "flex");
      }
    }
    // 监听页面关闭事件
    $(window).bind("beforeunload", function () {
      this.access_token = getCookie("access_token") ? getCookie("access_token") : "";

      if (!this.access_token) {
        setCookie("aiGirlSort", "");
      }
    });
    // this.init();
  }
  data() {
    return {
      access_token: "",
      charactersList: [], //所有的聊天对象
      mycharactersList: [], //我的聊天对象
      recentCharacters: [], //最近的聊天对象
      sort: "",
      sort_time: "",
      tab: "all", //all my
      isLoading: false, // all loading
      isMyLoading: false, // my loading
      isLike: false, //是否选择自己喜爱
      num: 0, //当前所有聊天对象请求次数（防止loading提前结束）
      numMy: 0, //当前所有聊天对象请求次数（防止loading提前结束）
      CharactersPage: 0, //当所有聊天对象页面数
      MyCharactersPage: 0, //我的聊天页数
      CharactersCount: 0, //当所有聊天对象总页面数
      MyCharactersCount: 0, //我的聊天总页数
      editMcType: "", //打开编辑后状态 create edit 空为没有打开
      classifys: [], //分类
      homeTag: [],
      mcTag: [],
      primary: "",
      // 编辑创建角色 参数
      mc_Avatar: "",
      mc_Name: "",
      mc_Desc: "",
      mc_Gender: "",
      mc_Background: "",
      mc_Persona: "",
      mc_visibility: jsonAiGirlFriend.classifySelect.Public,
      mc_Categories: [],
      mc_Greeting: "",
      mc_Scenario: "",
      mc_Dialogue: "",
      my_characters_id: 0,
      head_portrait: [],
      head_portrait_background: [],
      mc_roleId: "",
      is_draft: false, //是否草稿
      oldRoleInfo: {}, //之前角色数据
      isUploadAvatar: false, //是否上传图片
      isUploadBackground: false,
    };
  }
  async init() {
      // 初始化所有的聊天对象
      await this.initCharacters();
      // 分页处理
      this.pageProcess();
      // 初始化我的聊天对象
      this.GetMyCharacters();
      // 初始化最近聊天对象
      this.GetRecentChatting();
      // 获取所有的分类
      this.GetClassify();
      // 注册全局点击事件
      this.clickFn();
      // 注册登录和退出登录回调事件
      this.eventLoginsuccess();
      // 对brieft的出现进行整理
      this.composeBrief();
  }
  // 初始化所有的聊天对象
  async initCharacters(clear = true) {
    this.num++;
    this.isShowCharacterLoading(true, !clear);
    let that = this;
    let sort = this.sort ? this.sort : "hot";
    clear ? (this.CharactersPage = 0) : this.CharactersPage++;
    try {
      const res = await fetchGet(
        `chat/user/get-role-list?sort=${sort}&sort_time=${this.sort_time}&is_like=${this.isLike ? 1 : 2}&page=${
          this.CharactersPage
        }&tag=${this.homeTag.join(",")}`
      );
      // console.log(res, "initCharacters");
      if (res.code === 200) {
        let data = res.data.list;

        this.CharactersCount = res.data.page_count;
        let itemHtml = "";
        let i = 0;
        data.forEach((item, index) => {
          i >= 6 ? (i = 1) : i++;
          let tag = item.json?.tag.split(",");
          itemHtml += `<div class="characters_item" data-indexId="${item.id}" data-id="${item.role_id}">
          <div class="headPortrait">
            <img src="${item.head_portrait[0]?.url}" alt="" class="avatar">
            <div class="share_icon">
              <img src="/dist/img/aiGirlFriend/btn_more_normal.svg" />
            </div>
            <div class="head_shareBox">
            ${
              item.is_self == 1
                ? `<div class="editInbox" >
                <div class="icon"></div>${jsonAiGirlFriend.edit}
              </div>`
                : ""
            }
              <div class="shareInbox">
                <div class="icon"></div>${jsonAiGirlFriend.Share}
              </div>
            </div>
            <div class="chat_info">
              <img src="/dist/img/aiGirlFriend/icon_chat.svg" alt="">
              <span>${formatNumber(item.msg_num)}</span>
            </div>
          </div>
          <div class="character_info">
            <div class="character_name">${item.name}</div>
            <div class="infoBox">
              <div class="info_l">
                <div class="like_icon ${item.is_like === 1 ? "active" : ""}" data-likes="${item.like_num}"></div>
                <span class="num">${formatNumber(item.like_num)}</span>
                <div class="like_num">${item.like_num > 1 ? jsonAiGirlFriend.likes : jsonAiGirlFriend.like}</div>
               </div>
              <div class="info_r">
                <button class="chatNow">${jsonAiGirlFriend.chatNow}</button>
              </div>
            </div>
          </div>
          <div class="brief_hover"></div>
          <div class="brief">
            <div class="brief_top">
              <img class="brief_avatar" src="${item.head_portrait[0]?.url}"/>
              <div class="tagBox">
                <div class="brief_tag" style="display:${tag.length > 1 && tag[tag.length - 2] ? "block" : "none"}">${
            tag[tag.length - 2]
          }</div>
                <div class="brief_tag" style="display:${tag.length > 0 && tag[tag.length - 1] ? "block" : "none"}">${
            tag[tag.length - 1]
          }</div>
              </div>
            </div>
            <div class="brief_name">${item.json.Character_name}</div>
            <div class="brief_created">${item.json.Created}</div>
            <div class="brief_des">${item.json.Character_des}</div>
          </div>
        </div>`;
        });
        if (clear) {
          this.charactersList = data;
          $(".characters").html(itemHtml);
        } else {
          this.charactersList = [...this.charactersList, ...data];
          $(".characters").append(itemHtml);
        }
      }
      this.num--;
      this.isShowCharacterLoading(false);
    } catch (err) {
      this.num--;
      this.isShowCharacterLoading(false);
      console.log(err, "error Failed to initialize all characters");
    }
  }
  // 初始化我的聊天对象
  async GetMyCharacters(clear = true) {
    try {
      this.numMy++;
      this.isShowMyCharacterLoading(true, !clear);
      clear ? (this.MyCharactersPage = 0) : this.MyCharactersPage++;
      const res = await fetchGet(
        `chat/user/get-role-list?type=my_characters&page=${this.MyCharactersPage}&tag=${this.mcTag.join(
          ","
        )}&role_type=${this.primary.toLowerCase()}`
      );
      if (res.code === 200) {
        let data = res.data.list;

        this.MyCharactersCount = res.data.page_count;
        let initHtml = "";
        let i = 0;
        const isEdit = $(".edit:not(.recent)").hasClass("active");
        data.forEach((item, index) => {
          i >= 6 ? (i = 1) : i++;
          let tag = item.json?.tag.split(",");
          initHtml += `<div class="myCharacters_item" data-indexId="${item.id}" data-id="${
            item.role_id
          }" data-status="${item.status}">
                        <div class="headPortrait">
                          <img src="${item.head_portrait[0]?.url}" alt="" class="avatar" />
                          <div class="share_icon" style="display: ${isEdit ? "none" : "flex"};">
                            <img src="/dist/img/aiGirlFriend/btn_more_normal.svg" />
                          </div> 
                          <div class="lock_icon" style="display:${item.type == 2 ? "block" : "none"}"></div>
                          <div class="head_shareBox">
                            <div class="editInbox">
                              <div class="icon"></div>${jsonAiGirlFriend.edit}
                            </div>
                            ${
                              item.status == 1 && item.type != 2
                                ? `<div class="shareInbox" style="display:">
                              <div class="icon"></div>${jsonAiGirlFriend.Share}
                            </div>`
                                : ""
                            }
                          </div>
                          <div class="deleteChat ${isEdit ? "active" : ""}">
                            <img src="/dist/img/aiGirlFriend/btn_close_big_normal.svg" alt="" class="" />
                          </div>
                        </div>
                        
                        <div class="character_info">
                          <div class="character_name">${item.name}</div>
                          <div class="infoBox">
                            <div class="info_l">
                              <div class="like_icon ${item.is_like === 1 ? "active" : ""}"" data-likes="${
            item.like_num
          }" style="display:${item.status != 4 ? "block" : "none"}"></div>
                                    </div>
                            <div class="info_r">
                            ${
                              item.status != 4
                                ? `<button class="chatNow">${jsonAiGirlFriend.chatNow}</button>`
                                : `<button class="editDraft"><div class="icon"></div>${jsonAiGirlFriend.edit}</button>`
                            }
                            </div>
                          </div>
                        </div>
                        <div class="brief_hover"></div>
                        <div class="brief">
                          <div class="brief_top">
                            <img class="brief_avatar" src="${item.head_portrait[0]?.url}"/>
                            <div class="tagBox">
                              <div class="brief_tag" style="display:${
                                tag.length > 1 && tag[tag.length - 2] ? "block" : "none"
                              }">${tag[tag.length - 2]}</div>
                                    <div class="brief_tag" style="display:${
                                      tag.length > 0 && tag[tag.length - 1] ? "block" : "none"
                                    }">${tag[tag.length - 1]}</div>
                          </div>
                        </div>
                        <div class="brief_name">${item.json.Character_name}</div>
                        <div class="brief_created">${item.json.Created}</div>
                        <div class="brief_des">${item.json.Character_des}</div>
                      </div>
                      </div>`;
        });
        if (clear) {
          this.mycharactersList = data;
          $(".myCharacters").html(initHtml);
        } else {
          this.mycharactersList = [...this.mycharactersList, ...data];
          $(".myCharacters").append(initHtml);
        }
        this.numMy--;
        this.isShowMyCharacterLoading(false);
      }
    } catch (err) {
      this.numMy--;
      this.isShowMyCharacterLoading(false);
      console.log(err, "error Failed to initialize my chat partner");
    }
  }
  // 初始化最近聊天对象
  async GetRecentChatting() {
    try {
      const res = await fetchGet(`chat/user/get-role-list?type=recent_chatting`);
      if (res.code === 200) {
        let data = res.data.list;
        if (data.length > 0) {
          const isEdit = $(".edit.recent").hasClass("active");
          $(".Recent_hr").css("display", "flex");
          $(".RecentChatting").css("display", "flex");
          this.recentCharacters = data;
          let initHtml = "";
          data.forEach((item, index) => {
            initHtml += `<div class="Recent_item" data-index="${index}" data-id="${item.chat_id}">
                          <img src="${item.head_portrait[0]?.url}" alt="" class="recent_head_port"/>
                          <div class="name">${item.name}</div>
                          <div class="deleteChat recent ${isEdit ? "active" : ""}" style="display: ${
              isEdit ? "flex" : "none"
            };">
                            <img src="/dist/img/aiGirlFriend/btn_close_normal.svg" alt="" class="" />
                          </div>
                        </div>`;
          });
          $(".RecentChattingBox").html(initHtml);
          setTimeout(() => {
            this.composeRecent();
          }, 200);
        } else {
          $(".Recent_hr").hide();
          $(".RecentChatting").hide();
          $(".RecentChattingBox").html("");
          $(".edit.recent").removeClass("active").text(jsonAiGirlFriend.edit);
        }
      }
    } catch (err) {
      console.log(err, "error Failed to initialize recentCharacters");
    }
  }
  // 获取分类
  async GetClassify() {
    try {
      const res = await fetchGet(`chat/user/get-setting?type=tag`);
      if (res.code === 200) {
        let data = res.data;
        if (data.length > 0) {
          this.classifys = data;
          let initHtml = `<div class="classify_item active" data-tag=''>${jsonAiGirlFriend.AllCharacters}</div>`;
          let categoriesHtml = "";
          data.forEach((item) => {
            initHtml += `<div class="classify_item" data-tag='${item}'>${item}</div>`;
            categoriesHtml += `<div class="check_item">
                                <input type="checkbox" value="${item}" class="createMc_radio" />
                                <label for="${item}">${item}</label>
                              </div>`;
          });
          $(".classify_box_container").append(initHtml);
          $(".createMc_checkbox").html(categoriesHtml);
          setTimeout(() => {
            this.composeClassify($(".SegmentBox"));
            this.composeClassify($(".myCharactersBox"));
          }, 200);
        }
      }
    } catch (err) {
      console.log(err, "error Failed to initialize classify");
    }
  }
  // 创建角色配置信息
  async GetSettingInfo(id) {
    while (true) {
      try {
        let res = await fetchPost(`ai/tool/get-task`, { id });
        if (res.code === 200) {
          if (res.data.status === 0) {
            const data = res.data.additional_data;
            this.mc_Dialogue = data.example_chat;
            this.mc_Greeting = data.greeting;
            this.mc_Persona = data.persona;
            this.mc_Scenario = data.scenario;
            $(".createMC_persona").val(this.mc_Persona).get(0).dispatchEvent(evt);
            $(".createMC_Greeting").val(this.mc_Greeting).get(0).dispatchEvent(evt);
            $(".createMC_Scenario").val(this.mc_Scenario).get(0).dispatchEvent(evt);
            $(".createMC_Dialogue").val(this.mc_Dialogue).get(0).dispatchEvent(evt);
            this.editMcType = "edit";
            return;
          }
        } else {
          if (tryTimes <= 3) {
            console.log("try repeat1 -", tryTimes);
            tryTimes++;
            setTimeout(() => {
              this.GetSettingInfo(id);
            }, 3000);
            return;
          } else {
            $Popup({
              title: jsonAiGirlFriend.failedMsg.normalTitle,
              content: jsonAiGirlFriend.failedMsg.generateError,
              type: "error",
            });
            return;
          }
        }
      } catch (err) {
        console.log(err, "error");
        if (tryTimes <= 3) {
          console.log("try repeat2 -", tryTimes);
          tryTimes++;
          setTimeout(() => {
            this.GetSettingInfo(id);
          }, 3000);
          return;
        } else {
          $Popup({
            title: jsonAiGirlFriend.failedMsg.normalTitle,
            content: jsonAiGirlFriend.failedMsg.generateError,
            type: "error",
          });
          return;
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  // 创建任务（角色配置）
  async addTaskGetSettingInfo() {
    try {
      const res = await fetchPost(`ai/ai-tool/add-task`, {
        action: "aichat_role_generate",
        param: {
          type: 2,
          name: this.mc_Name,
          description: this.mc_Desc,
        },
      });
      tryTimes = 0;
      if (res.code != 200) {
        $Popup({
          title: jsonAiGirlFriend.failedMsg.normalTitle,
          content: jsonAiGirlFriend.failedMsg.generateError,
          type: "error",
        });
        return;
      }
      await this.GetSettingInfo(res.data.task_id);
    } catch (err) {
      $Popup({
        title: jsonAiGirlFriend.failedMsg.normalTitle,
        content: jsonAiGirlFriend.failedMsg.generateError,
        type: "error",
      });
      console.log(err, "error get-task");
    }
  }

  //get role info
  async GetRoleInfo(id, is_my_characters = 2, my_characters_id = 0) {
    try {
      const res = await fetchGet(
        `chat/user/get-role-info?id=${id}&is_my_characters=${is_my_characters}&my_characters_id=${my_characters_id}`
      );
      if (res.code === 200) {
        let data = res.data;
        this.my_characters_id = data.my_characters_id;
        this.mc_Avatar = data.head_portrait[0].url;
        this.mc_Name = data.name;
        this.mc_Desc = data.json.Character_des;
        this.mc_Background = data.head_portrait_background[0]?.url;
        this.mc_Persona = data.persona;
        this.mc_Gender = data.json.gender;
        this.is_draft = data.status == 4 ? true : false;
        this.mc_visibility =
          data.type == 1 ? jsonAiGirlFriend.classifySelect.Public : jsonAiGirlFriend.classifySelect.Private;
        this.mc_Categories = data.json.tag.length > 0 ? data.json.tag.split(",") : [];
        this.mc_Greeting = data.role_content.greeting.toString();
        this.mc_Scenario = data.role_content["scene description"];
        this.mc_Dialogue = data.role_content.context;
        this.head_portrait = data.head_portrait;
        this.head_portrait_background = data.head_portrait_background;
        this.mc_roleId = data.role_id;
        $("#createMC_background_img").attr("src", data.head_portrait_background[0]?.url);
        $("#createMC_avatar_img").attr("src", data.head_portrait[0]?.url);

        $(".whiteMeOut").val(this.mc_Desc).get(0).dispatchEvent(evt);
        $(".createMC_name").val(this.mc_Name).get(0).dispatchEvent(evt);
        $(".createMC_gender").val(this.mc_Gender).get(0).dispatchEvent(evt);
        $(".createMC_persona").val(this.mc_Persona).get(0).dispatchEvent(evt);
        $(".createMC_Greeting").val(this.mc_Greeting).get(0).dispatchEvent(evt);
        $(".createMC_Scenario").val(this.mc_Scenario).get(0).dispatchEvent(evt);
        $(".createMC_Dialogue").val(this.mc_Dialogue).get(0).dispatchEvent(evt);

        this.oldRoleInfo = {
          role_id: this.mc_roleId,
          name: this.mc_Name,
          type: this.mc_visibility,
          is_draft: this.is_draft,
          tag: this.mc_Categories.join(","),
          description: this.mc_Desc,
          persona: this.mc_Persona,
          scene: this.mc_Scenario,
          greeting: this.mc_Greeting,
          context: this.mc_Dialogue,
          head_portrait: JSON.stringify(this.head_portrait),
          head_portrait_background: JSON.stringify(this.head_portrait_background),
        };
      }
    } catch (err) {
      console.log(err, "error get role info");
    }
  }
  // ai generate description
  async GetAiDesc(callback = () => {}) {
    try {
      const res = await fetchGet(`chat/user/get-setting?type=role`);
      if (res.code === 200) {
        let data = res.data;
        const randomAifaceFn = randomchoice(data);
        $(".whiteMe").val(randomAifaceFn().description);
        callback?.();
      }
    } catch (err) {
      console.log(err, "error get role info");
    }
  }
  // role create or update
  async roleEdit(successBack = () => {}, errorBack = () => {}) {
    try {
      let type;
      if (this.mc_visibility == jsonAiGirlFriend.classifySelect.Public) {
        type = 1;
        gtag("event", "public_aigirlfriend_edit");
      } else {
        type = 2;
        gtag("event", "private_aigirlfriend_edit");
      }
      let is_draft = this.is_draft ? 1 : 2;
      let head_portrait = this.head_portrait,
        head_portrait_background = this.head_portrait_background;
      delete head_portrait.url;
      delete head_portrait_background.url;
      const data = {
        role_id: this.mc_roleId,
        my_characters_id: this.my_characters_id,
        name: this.mc_Name.trim(),
        type,
        is_draft,
        persona: this.mc_Persona.trim(),
        gender: this.mc_Gender.trim(),
        tag: this.mc_Categories.join(","),
        description: this.mc_Desc.trim(),
        scene: this.mc_Scenario.trim(),
        greeting: this.mc_Greeting.trim(),
        context: this.mc_Dialogue.trim(),
        head_portrait: JSON.stringify(head_portrait),
        head_portrait_background: JSON.stringify(head_portrait_background),
      };
      const res = await fetchPost(`chat/user/role-edit`, data, {}, false);
      if (res.code == 401) {
        gtag("event", "alert_aigirlfriend_loginwinedit");
        let bootLogin = $Popup({
          title: jsonAiGirlFriend.createMc.bootLoginTitle,
          content: jsonAiGirlFriend.createMc.bootLoginDesc,
          closeBtn: jsonAiGirlFriend.login,
          applyBtn: jsonAiGirlFriend.createMc.NotNow,
          autoClose: false,
          exist: "bootLogin",
          onClose: () => {
            gtag("event", "login_aigirlfriend_loginwinedit");
            bootLogin.close();
            showLoginWindow({
              fn: () => {
                gtag("evet", "succ_aigirlfriend_loginwinedit");
              },
            });
          },
          onApply: () => {
            gtag("event", "notnow_aigirlfriend_loginwindit");
            bootLogin.close();
            this.closeCD();
            this.clearInput();
            this.editMcType = '';
          },
          topCloseFn: () => {
            gtag("event", "close_aigirlfriend_loginwinedit");
          },
        });
        errorBack?.();
      } else if (res.code === 200) {
        successBack?.();
      } else {
        if (this.is_draft) {
          $Popup({
            title: jsonAiGirlFriend.failedMsg.normalTitle,
            content: jsonAiGirlFriend.failedMsg.draftSaveError,
            type: "error",
          });
        } else {
          $Popup({
            title: jsonAiGirlFriend.failedMsg.normalTitle,
            content: jsonAiGirlFriend.failedMsg.publishError,
            type: "error",
          });
        }
        errorBack?.();
      }
    } catch (err) {
      console.log(errorBack, "error");
      if (this.is_draft) {
        $Popup({
          title: jsonAiGirlFriend.failedMsg.normalTitle,
          content: jsonAiGirlFriend.failedMsg.draftSaveError,
          type: "error",
        });
      } else {
        $Popup({
          title: jsonAiGirlFriend.failedMsg.normalTitle,
          content: jsonAiGirlFriend.failedMsg.publishError,
          type: "error",
        });
      }
      errorBack?.();
      console.log(err, " create or edit role error");
    }
  }
  // 添加最近聊天
  addRecentChatting(obj) {
    console.log(obj, "addRecentChatting");
    const chatID = obj.chat_id;
    const index = this.recentCharacters.findIndex((item) => item.chat_id == chatID);
    const isEdit = $(".edit.recent").hasClass("active");
    let initHtml = "";
    if (index != -1) {
      $(".RecentChattingBox").children().eq(index).insertBefore($(".RecentChattingBox").children().eq(0));
      $(`.Recent_item`).eq(0).find(".recent_head_port").attr("src", obj.head_portrait[0]?.url);
      $(`.Recent_item`).eq(0).find(".name").text(obj.name);
      this.recentCharacters.splice(index, 1);
      this.recentCharacters.unshift(obj);
    } else {
      // 没有添加一个
      initHtml = `<div class="Recent_item" data-id="${obj.chat_id}">
        <img src="${obj.head_portrait[0]?.url}" alt="" class='recent_head_port'/>
        <div class="name">${obj.name}</div>
        <div class="deleteChat recent ${isEdit ? "active" : ""}" style="display: ${isEdit ? "flex" : "none"};">
          <img src="/dist/img/aiGirlFriend/btn_close_normal.svg" alt="" class="" />
        </div>
      </div>`;
      $(".RecentChattingBox").prepend(initHtml);
      this.recentCharacters.unshift(obj);
    }
    $(".Recent_hr").css("display", "flex");
    $(".RecentChatting").css("display", "flex");
    setTimeout(() => {
      this.composeRecent();
    }, 500);
  }
  //注册点击事件
  clickFn() {
    let that = this;
    // 列表开启与关闭
    $(".chatSelect").click(function () {
      const isActive = $(this).hasClass("active");
      if (!isActive) {
        $(this).children(".select_list").slideDown();
        $(this).addClass("active");
        $(this).siblings(".chatSelect").children(".select_list").slideUp();
      } else {
        $(this).children(".select_list").slideUp();
        $(this).removeClass("active");
      }
    });

    // 选择日期选择和top选择
    $(".select_list_item").click(function () {
      const sort_time = $(this).data("sort_time");
      const sort = $(this).data("sort");
      const visibility = $(this).data("type");
      const primary = $(this).data("primary");
      if ($(this).parents("#select_sort_time").length != 0) {
        that.sort_time = sort_time;
      }
      if ($(this).parents("#select_sort").length != 0) {
        that.sort = sort;
        sort == "top" ? $(".select_time").css("display", "flex") : $(".select_time").hide();
      }
      if (!ttsBlank(visibility)) {
        that.mc_visibility = visibility;
      }
      if ($(this).parents(".classify").length != 0) {
        that.composeClassify($(".myCharactersBox"));
        that.primary = primary;
        switch (primary) {
          case "":
            gtag("event", "all_aigirlfriend_filter");
            break;
          case jsonAiGirlFriend.classifySelect.Public:
            gtag("event", "public_aigirlfriend_filter");
            break;
          case jsonAiGirlFriend.classifySelect.Private:
            gtag("event", "private_aigirlfriend_filter");
            break;
          case jsonAiGirlFriend.classifySelect.Draft:
            gtag("event", "draft_aigirlfriend_filter");
            break;
        }
      }
      // 打点
      if (Object.keys($(this).data())[0] === "sort" && $(this).parents(".character_select").length != 0) {
        if (getCookie("access_token")) {
          setCookie("aiGirlSort", sort);
        } else {
          setCookie("aiGirlSort", "");
        }
        switch (true) {
          case sort == "top":
            gtag("event", "top_aigirlfriend_hfilter");
            break;
          case sort == "hot":
            gtag("event", "hot_aigirlfriend_hfilter");
            break;
        }
      } else {
        switch (true) {
          case sort_time == "day":
            gtag("event", "top_aigirlfriend_hdayfilter");
            break;
          case sort_time == "week":
            gtag("event", "top_aigirlfriend_hweekfilter");
            break;
          case sort_time == "month":
            gtag("event", "top_aigirlfriend_hmonthfilter");
            break;
          case sort_time == "year":
            gtag("event", "top_aigirlfriend_hyearfilter");
            break;
          case sort_time == "":
            gtag("event", "top_aigirlfriend_halltimefilter");
            break;
        }
      }

      $(this).addClass("active");
      $(this).siblings(".select_list_item").removeClass("active");
      $(this).parents(".select_list").siblings(".select_content").text($(this).text());
      if ($(this).parents(".createMyCharacter_Box ").length == 0) {
        $(".description")[0].scrollIntoView({ behavior: "smooth", block: "start", inline: "end" });
      }
      that.initCharacters();
    });

    // 是否选择喜爱的
    $(".heart").click(function () {
      $(".Characters_hr")[0].scrollIntoView({ behavior: "instant", block: "start", inline: "end" });
      $(this).hasClass("active")
        ? (that.isLike = false)
        : ((that.isLike = true), gtag("event", "like_aigirlfriend_hfilter"));
      $(this).toggleClass("active");
      that.initCharacters();
    });

    //切换home和mycharachers
    $(".Segment_item").click(function () {
      $(".Segment_item").removeClass("active");
      $("body")[0].scrollIntoView({ behavior: "instant", inline: "nearest" });
      $(this).addClass("active");
      if ($(this).attr("id") === "myCharacters") {
        gtag("event", "click_aigirlfriend_mytab");
        that.tab = "my";
        $(".myCharactersBox").show();
        $(".SegmentBox").hide();
        // 对分类进行排序
        that.composeClassify($(".myCharactersBox"));
      } else {
        gtag("event", "click_aigirlfriend_htab");
        that.tab = "all";
        $(".SegmentBox").show();
        $(".myCharactersBox").hide();
        that.composeRecent();
        // 对分类进行排序
        that.composeClassify($(".SegmentBox"));
      }
    });

    //点击edit按钮
    $(".edit").click(function () {
      if ($(this).hasClass("active")) {
        $(this).removeClass("active");
        $(this).text(jsonAiGirlFriend.edit);
        $(this).hasClass("recent")
          ? ($(".Recent_item .deleteChat").removeClass("active").hide(), gtag("event", "click_aigirlfriend_hrctedit"))
          : ($(".myCharacters_item .deleteChat").removeClass("active").hide(),
            gtag("event", "click_aigirlfriend_mycedit"),
            $(".myCharacters_item .share_icon").css("display", "flex"));
      } else {
        $(this).addClass("active");
        $(this).text(jsonAiGirlFriend.Done);
        $(this).hasClass("recent")
          ? ($(".Recent_item .deleteChat").addClass("active").css("display", "flex"),
            gtag("event", "click_aigirlfriend_hrctedit"))
          : ($(".myCharacters_item .deleteChat").addClass("active").show(),
            gtag("event", "click_aigirlfriend_mycedit"),
            $(".myCharacters_item .share_icon").hide());
      }
    });

    // 点击创建开始创建我的角色
    $(".createMc").click(function () {
      that.editMcType = "create";
      if ($(this).hasClass("createBtn")) {
        gtag("event", "click_aigirlfriend_create");
      } else {
        gtag("event", "click_aigirlfriend_nodatacreate");
      }
    });

    // back and discard
    $(".create_back_box,.mc_btn.discard").click(function () {
      if (that.editMcType == "edit") {
        if ($(this).hasClass("discard")) {
          gtag("event", "discard_aigirlfriend_edit");
        } else {
          gtag("event", "back_aigirlfriend_edit");
        }
        // if there is no token to login
        if (!getCookie("access_token")) {
          gtag("event", "alert_aigirlfriend_loginwinedit");
          const bootLogin = $Popup({
            title: jsonAiGirlFriend.createMc.bootLoginTitle,
            content: jsonAiGirlFriend.createMc.bootLoginDesc,
            closeBtn: jsonAiGirlFriend.login,
            applyBtn: jsonAiGirlFriend.createMc.NotNow,
            autoClose: false,
            exist: "bootLogin",
            onClose: () => {
              gtag("event", "login_aigirlfriend_loginwinedit");
              bootLogin.close();
              showLoginWindow({
                fn: () => {
                  gtag("evet", "succ_aigirlfriend_loginwinedit");
                },
              });
            },
            onApply: async () => {
              gtag("event", "notnow_aigirlfriend_loginwindit");
              bootLogin.close();
              await that.closeCD();
              that.clearInput();
              that.editMcType = "";
            },
            topCloseFn: () => {
              gtag("event", "close_aigirlfriend_loginwinedit");
            },
          });
        } else {
          // Is it the same as the original data,if not to pop up save draft
          let data = {
            role_id: that.mc_roleId,
            name: that.mc_Name,
            type: that.mc_visibility,
            is_draft: that.is_draft,
            tag: that.mc_Categories.join(","),
            description: that.mc_Desc,
            scene: that.mc_Scenario,
            persona: that.mc_Persona,
            greeting: that.mc_Greeting,
            context: that.mc_Dialogue,
            head_portrait: JSON.stringify(that.head_portrait),
            head_portrait_background: JSON.stringify(that.head_portrait_background),
          };
          const isSame = areObjectsEqual(data, that.oldRoleInfo);
          if (isSame) {
            that.closeCD();
            that.clearInput();
            that.editMcType = "";
          } else {
            const toSave = $Popup({
              title: jsonAiGirlFriend.toSaveTitle,
              content: jsonAiGirlFriend.toSaveDesc,
              closeBtn: jsonAiGirlFriend.save,
              applyBtn: jsonAiGirlFriend.createMc.NotNow,
              autoClose: false,
              exist: "bootLogin",
              onClose: () => {
                toSave.loading.start();
                that.is_draft = true;
                that.editDraftUpload(
                  () => {
                    toSave.close();
                    that.editMcType = "";
                  },
                  () => {
                    toSave.close();
                  }
                );
              },
              onApply: () => {
                toSave.close();
                that.closeCD();
                that.clearInput();
                that.editMcType = "";
              },
            });
          }
        }
      } else {
        that.closeCD();
        that.clearInput();
        that.editMcType = "";
      }
    });

    // create role
    $("#createMc").click(async function () {
      let isPass = true;
      if (!that.mc_Avatar) {
        $(".erorrTip[data-type='avatar']").find(".image_error").text(jsonAiGirlFriend.createMc.avatar_not);
        $(".erorrTip[data-type='avatar']").css("visibility", "visible");
        isPass = false;
      } else {
        $(".erorrTip[data-type='avatar']").css("visibility", "hidden");
      }
      if (!that.mc_Name || $(`.maxLength[data-input='name'] span`).text() == 0) {
        $(".erorrTip[data-type='name']").css("visibility", "visible");
        isPass = false;
      } else {
        $(".erorrTip[data-type='name']").css("visibility", "hidden");
      }
      if (!that.mc_Desc || $(`.maxLength[data-input='description'] span`).text() == 0) {
        $(".erorrTip[data-type='description']").css("visibility", "visible");
        isPass = false;
      } else {
        $(".erorrTip[data-type='description']").css("visibility", "hidden");
      }
      if (!isPass) return;
      gtag("event", "click_aigirlfriend_aicreate");

      that.oldRoleInfo = {
        role_id: that.mc_roleId,
        name: that.mc_Name,
        type: that.mc_visibility,
        is_draft: that.is_draft,
        tag: that.mc_Categories.join(","),
        description: that.mc_Desc,
        scene: that.mc_Scenario,
        greeting: that.mc_Greeting,
        persona: that.persona,
        context: that.mc_Dialogue,
        head_portrait: JSON.stringify(that.head_portrait),
        head_portrait_background: JSON.stringify(that.head_portrait_background),
      };
      $(this).addClass("loading");
      $(".createMc_item,.create_back_box").addClass("loading");
      await that.addTaskGetSettingInfo();
      $(this).removeClass("loading");
      $(".createMc_item,.create_back_box").removeClass("loading");
    });

    // edit role
    $("#editMc").click(async function () {
      gtag("event", "publish_aigirlfriend_edit");

      let isPass = true;
      if (!that.mc_Avatar) {
        $(".erorrTip[data-type='avatar']").find(".image_error").text(jsonAiGirlFriend.createMc.avatar_not);
        $(".erorrTip[data-type='avatar']").css("visibility", "visible");
        isPass = false;
      } else {
        $(".erorrTip[data-type='avatar']").css("visibility", "hidden");
      }
      if (!that.mc_Name || $(`.maxLength[data-input='name'] span`).text() == 0) {
        $(".erorrTip[data-type='name']").css("visibility", "visible");
        isPass = false;
      } else {
        $(".erorrTip[data-type='name']").css("visibility", "hidden");
      }
      if (!that.mc_Persona || $(`.maxLength[data-input='persona'] span`).text() == 0) {
        $(".erorrTip[data-type='persona']").css("visibility", "visible");
        isPass = false;
      } else {
        $(".erorrTip[data-type='persona']").css("visibility", "hidden");
      }
      if (!that.mc_Desc || $(`.maxLength[data-input='description'] span`).text() == 0) {
        $(".erorrTip[data-type='description']").css("visibility", "visible");
        isPass = false;
      } else {
        $(".erorrTip[data-type='description']").css("visibility", "hidden");
      }
      if (that.mc_Categories.length == 0) {
        $(".erorrTip[data-type='Categories']").css("visibility", "visible");
        isPass = false;
      } else {
        $(".erorrTip[data-type='Categories']").css("visibility", "hidden");
      }
      if (!that.mc_Greeting || $(`.maxLength[data-input='Greeting'] span`).text() == 0) {
        $(".erorrTip[data-type='Greeting']").css("visibility", "visible");
        isPass = false;
      } else {
        $(".erorrTip[data-type='Greeting']").css("visibility", "hidden");
      }
      if (!that.mc_Scenario || $(`.maxLength[data-input='Scenario'] span`).text() == 0) {
        $(".erorrTip[data-type='Scenario']").css("visibility", "visible");
        isPass = false;
      } else {
        $(".erorrTip[data-type='Scenario']").css("visibility", "hidden");
      }
      if (!isPass) return;
      if (!getCookie("access_token")) {
        gtag("event", "alert_aigirlfriend_loginwinedit");
        const bootLogin = $Popup({
          title: jsonAiGirlFriend.createMc.bootLoginTitle,
          content: jsonAiGirlFriend.createMc.bootLoginDesc,
          closeBtn: jsonAiGirlFriend.login,
          applyBtn: jsonAiGirlFriend.createMc.NotNow,
          autoClose: false,
          exist: "bootLogin",
          onClose: () => {
            gtag("event", "login_aigirlfriend_loginwinedit");
            bootLogin.close();
            showLoginWindow({
              fn: () => {
                gtag("evet", "succ_aigirlfriend_loginwinedit");
              },
            });
          },
          onApply: () => {
            gtag("event", "notnow_aigirlfriend_loginwindit");
            that.editMcType = '';
            bootLogin.close();
            that.closeCD();
          },
          topCloseFn: () => {
            gtag("event", "close_aigirlfriend_loginwinedit");
          },
        });
        return;
      }
      that.is_draft = false;
      $(this).addClass("loading");
      const fn = () => $(this).removeClass("loading");
      await that.editDraftUpload(fn, fn, "all");
    });

    // save drafts
    $("#draftMc").click(async function () {
      gtag("event", "draft_aigirlfriend_edit");
      if (!getCookie("access_token")) {
        gtag("event", "alert_aigirlfriend_loginwinedit");
        const bootLogin = $Popup({
          title: jsonAiGirlFriend.createMc.bootLoginTitle,
          content: jsonAiGirlFriend.createMc.bootLoginDesc,
          closeBtn: jsonAiGirlFriend.login,
          applyBtn: jsonAiGirlFriend.createMc.NotNow,
          autoClose: false,
          exist: "bootLogin",
          onClose: () => {
            gtag("event", "login_aigirlfriend_loginwinedit");
            bootLogin.close();
            showLoginWindow({
              fn: () => {
                gtag("evet", "succ_aigirlfriend_loginwinedit");
              },
            });
          },
          onApply: () => {
            gtag("event", "notnow_aigirlfriend_loginwindit");
            bootLogin.close();
            that.closeCD();
          },
          topCloseFn: () => {
            gtag("event", "close_aigirlfriend_loginwinedit");
          },
        });
        return;
      }
      that.is_draft = true;
      $(this).addClass("loading");
      const fn = () => $(this).removeClass("loading");
      await that.editDraftUpload(fn, fn, "draft");
    });

    // 上传图片
    $(".addImage").click(function () {
      if ($(this).parents(".avatar").length != 0) {
        $("#createMC_avatar").click();
      } else {
        $("#createMC_background").click();
      }
    });
    $("#createMC_avatar").on("change", async function (e) {
      that.isUploadAvatar = true;
      that.uploadImage($(".avatar"), e, this, "avatar", () => {
        $(this).val("");
      });
    });
    $("#createMC_background").on("change", async function (e) {
      that.isUploadBackground = true;
      that.uploadImage($("#background"), e, this, "background", () => {
        $(this).val("");
      });
    });
    // 删除图片
    $(".delete_image").click(function () {
      // 头像
      if ($(this).parents(".avatar").length != 0) {
        that.mc_Avatar = "";
      } else {
        that.mc_Background = "";
      }
    });
    //createCharacter des white me
    $(".writeMe").click(function () {
      gtag("event", "show_aigirlfriend_aiwrite");
      let createPop = $Popup({
        type: "createMC",
        title: jsonAiGirlFriend.createMc.writeMe_title,
        content: $(".whiteMeContent").html(),
        closeBtn: jsonAiGirlFriend.createMc.Generate,
        applyBtn: jsonAiGirlFriend.createMc.Apply,
        autoClose: false,
        exist: "exist",
        onClose: () => {
          gtag("event", "generate_aigirlfriend_aiwrite");
          createPop.loading.start();
          that.GetAiDesc(() => {
            createPop.loading.end();
          });
        },
        onApply: () => {
          gtag("event", "apply_aigirlfriend_aiwrite");
          const text = $(".createMC .whiteMe").val();
          let length = text.length;
          if (length > 0) {
            that.mc_Desc = text;
            createPop.close();
          }
        },
      });
    });
    // 1.3 输入验证
    $(".whiteMe,.whiteMeOut").on("input", function () {
      const res = that.inputCharacter($(this), 500, "description");
      if ($(this).hasClass("whiteMeOut")) {
        that.mc_Desc = res;
      }
    });
    $(".createMC_name").on("input", function () {
      const res = that.inputCharacter($(this), 30, "name");
      that.mc_Name = res;
    });
    $(".createMC_gender").on("input", function () {
      const res = that.inputCharacter($(this), 30, "gender");
      that.mc_Gender = res;
    });
    $(".createMC_persona").on("input", function () {
      const res = that.inputCharacter($(this), 500, "persona");
      that.mc_Persona = res;
    });
    $(".createMC_Greeting").on("input", function () {
      const res = that.inputCharacter($(this), 330, "Greeting");
      that.mc_Greeting = res;
    });
    $(".createMC_Scenario").on("input", function () {
      const res = that.inputCharacter($(this), 500, "Scenario");
      that.mc_Scenario = res;
    });
    $(".createMC_Dialogue").on("input", function () {
      const res = that.inputCharacter($(this), 700, "Dialogue");
      that.mc_Dialogue = res;
    });

    // 事件委托
    $("body").on("mouseup", async function (e) {
      const target = $(e.target);
      const isAllChild = target.parents(".characters_item").length != 0 || target.hasClass("characters_item");
      const isMyChild = target.parents(".myCharacters_item").length != 0 || target.hasClass("myCharacters_item");
      let resIndex;
      if (isAllChild) {
        let id = target.parents(".characters_item").attr("data-indexid");
        resIndex = that.charactersList.findIndex((item) => parseInt(item.id) == parseInt(id));
      }
      if (isMyChild) {
        let id = target.parents(".myCharacters_item").attr("data-indexid");
        let itemIndex = that.mycharactersList.findIndex((item) => parseInt(item.id) == parseInt(id));
        resIndex = itemIndex >= 0 ? itemIndex : resIndex;
      }
      // 抬起select
      if (target.parents(".chatSelect").length == 0 && !target.hasClass("chatSelect")) {
        $(".chatSelect").removeClass("active").children(".select_list").slideUp();
      }
      if (target.parents(".head_shareBox").length == 0) {
        $(".head_shareBox").hide();
      }

      // console.log(target,'target')
      if (target.hasClass("like_icon")) {
        //点赞取消与否
        const id = target.parents(".characters_item").data("id") || target.parents(".myCharacters_item").data("id");
        const deleteChat = target.parents(".myCharacters_item").find(".deleteChat");
        // 判断是否打开了编辑模式 myCharacter
        if (deleteChat.length != 0 && deleteChat.hasClass("active")) {
          return;
        }
        if (target.parents(".characters_item").length != 0) {
          let num = target.data("likes");
          if (target.hasClass("active")) {
            num > 0 ? num-- : (num = 0);
            target.siblings(".num").text(formatNumber(num));
            target.siblings(".like_num").text(num > 1 ? jsonAiGirlFriend.likes : jsonAiGirlFriend.like);
            target.data("likes", num);
            that.charactersList[resIndex].is_like = 2;
          } else {
            num++;
            target.siblings(".num").text(formatNumber(num));
            target.siblings(".like_num").text(num > 1 ? jsonAiGirlFriend.likes : jsonAiGirlFriend.like);
            target.data("likes", num);
            gtag("event", "click_aigirlfriend_hlikebtn");
            that.charactersList[resIndex].is_like = 1;
          }
        } else {
          if (!target.hasClass("active")) {
            gtag("event", "click_aigirlfriend_myclikebtn");
            that.mycharactersList[resIndex].is_like = 1;
          } else {
            that.mycharactersList[resIndex].is_like = 2;
          }
        }
        target.toggleClass("active");
        that.changeLike(id);
        return;
      } else if (target.parents(".share_icon").length != 0) {
        //打开分享弹窗
        const shareBox = target.parents(".share_icon").siblings(".head_shareBox");
        shareBox.hasClass("active") ? shareBox.removeClass("active").hide() : shareBox.addClass("active").show();
        return;
      } else if (target.hasClass("shareInbox")) {
        if (isAllChild) {
          gtag("event", "click_aigirlfriend_hshare");
          //点击分享按钮
          const res = that.charactersList[resIndex];
          that.showShare(res.role_id, res.head_portrait[0].value);
        } else {
          gtag("event", "click_aigirlfriend_mycshare");
          //点击分享按钮
          const res = that.mycharactersList[resIndex];
          that.showShare(res.role_id, res.head_portrait[0].value);
        }
        $(".head_shareBox").hide();
        return;
      } else if (target.hasClass("editInbox")) {
        that.editMcType = "edit";
        $("body")[0].scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
        if (target.parents(".characters_item").length != 0) {
          gtag("event", "click_aigirlfriend_hedit");
          const res = that.charactersList[resIndex];
          await that.GetRoleInfo(res.role_id, 1, res.my_chat_id);
        } else {
          gtag("event", "click_aigirlfriend_mycchatedit");
          const res = that.mycharactersList[resIndex];
          await that.GetRoleInfo(res.role_id, 1, res.my_characters_id);
        }
        return;
      } else if (target.hasClass("classify_item")) {
        $(".description")[0].scrollIntoView({ behavior: "smooth", block: "start", inline: "end" });
        //点击分类
        const isHome = target.parents(".SegmentBox").length != 0;
        const tag = target.data("tag");
        if (ttsBlank(tag)) {
          if (isHome) {
            that.homeTag = [];
            gtag("event", `htag_aigirlfriend_allcharacters`);
            $(".SegmentBox .classify_item").removeClass("active");
            $(".SegmentBox .classify_item").eq(0).addClass("active");
          } else {
            that.mcTag = [];
            gtag("event", `mytag_aigirlfriend_allcharacters`);
            $(".myCharactersBox .classify_item").removeClass("active");
            $(".myCharactersBox .classify_item").eq(0).addClass("active");
          }
        } else {
          if (isHome) {
            $(".SegmentBox .classify_item").eq(0).removeClass("active");
            let index = that.homeTag.findIndex((item) => item === tag);
            if (index !== -1) {
              that.homeTag.splice(index, 1);
            } else {
              that.homeTag.push(tag);
              let tagEve = target.attr("data-tag");
              tagEve = tagEve.replace(/\s+/g, "").toLowerCase();
              gtag("event", `htag_aigirlfriend_${tagEve}`);
            }
            const arr = that.homeTag;
            that.homeTag = arr;
            if (that.homeTag.length == 0) {
              $(".SegmentBox .classify_item").eq(0).addClass("active");
            }
          } else {
            $(".myCharactersBox .classify_item").eq(0).removeClass("active");
            let index = that.mcTag.findIndex((item) => item === tag);
            if (index !== -1) {
              that.mcTag.splice(index, 1);
            } else {
              that.mcTag.push(tag);
              let tagEve = target.attr("data-tag");
              tagEve = tagEve.replace(/\s+/g, "").toLowerCase();
              gtag("event", `mytag_aigirlfriend_${tagEve}`);
            }
            const arr = that.mcTag;
            that.mcTag = arr;
            if (that.mcTag.length == 0) {
              $(".myCharactersBox .classify_item").eq(0).addClass("active");
            }
          }
          target.toggleClass("active");
        }

        return;
      } else if (target.hasClass("createMc_radio")) {
        // click create input radio button
        setTimeout(() => {
          const isChecked = target.is(":checked");
          if (isChecked) {
            that.mc_Categories.push(target.attr("value"));
          } else {
            const value = target.attr("value");
            const index = that.mc_Categories.findIndex((item) => item == value);
            that.mc_Categories.splice(index, 1);
          }
          const arr = that.mc_Categories;
          that.mc_Categories = arr;
          let text = "",
            tip =
              that.mc_Categories.length > 1
                ? jsonAiGirlFriend.createMc.Categories_tips
                : jsonAiGirlFriend.createMc.Categories_tip;
          text = tip.replace("%ss", that.mc_Categories.length);
          $(".checkNum").text(text);
        }, 5);
        return;
      } else if (target.parents(".deleteChat").length != 0) {
        // 删除按钮
        let deletePop;
        if (target.parents(".deleteChat").hasClass("recent")) {
          gtag("event", "click_aigirlfriend_hrctdelete");
          const chat_id = target.parents(".Recent_item").attr("data-id");
          deletePop = $Popup({
            title: jsonAiGirlFriend.deleteRecentTitle,
            content: jsonAiGirlFriend.deleteRecentText,
            closeBtn: jsonAiGirlFriend.Delete,
            otherBtns: `<button class="cannel">${jsonAiGirlFriend.Cancel}</button>`,
            autoClose: false,
            exist: "deletePop",
            onClose: () => {
              gtag("event", "del_aigirlfriend_hrctdelete");
              deletePop.loading.start();
              that.deleteChat(chat_id, async () => {
                await that.GetRecentChatting();
                deletePop.close();
              });
            },
          });
          $(".modal .cannel").click(() => {
            gtag("event", "cancel_aigirlfriend_hrctdelete");
            deletePop.close();
          });
        } else {
          gtag("event", "click_aigirlfriend_mycdelete");
          const my_characters_id = that.mycharactersList[resIndex].my_characters_id;
          deletePop = $Popup({
            title: jsonAiGirlFriend.deleteMyChatTitle,
            content: jsonAiGirlFriend.deleteMyChatText,
            closeBtn: jsonAiGirlFriend.Delete,
            otherBtns: `<button class="cannel">${jsonAiGirlFriend.Cancel}</button>`,
            autoClose: false,
            exist: "deletePop",
            onClose: () => {
              gtag("event", "del_aigirlfriend_mycdelete");
              deletePop.loading.start();
              that.deleteMyChat(my_characters_id, async () => {
                await that.GetMyCharacters();
                await that.GetRecentChatting();
                deletePop.close();
              });
            },
          });
          $(".modal .cannel").click(() => {
            gtag("event", "cancel_aigirlfriend_mycdelete");
            deletePop.close();
          });
        }
      } else if (target.parents(".characters_item").length != 0) {
        if (target.hasClass("chatNow")) {
          gtag("event", "click_aigirlfriend_hchatbtn");
        } else {
          gtag("event", "click_aigirlfriend_hcard");
        }
        //点击charactrers
        aiChatting.init(that.charactersList[resIndex]);
        return;
      } else if (target.parents(".myCharacters_item").length != 0) {
        //点击myCharacters
        if (target.hasClass("chatNow")) {
          gtag("event", "click_aigirlfriend_mycchatbtn");
        } else {
          gtag("event", "click_aigirlfriend_myccard");
        }
        // 如果选中了删除模式 return
        if (target.parents(".myCharacters_item").find(".deleteChat").hasClass("active")) return;
        const mc_item = target.parents(".myCharacters_item");
        let status = mc_item.attr("data-status");
        if (status != 4) {
          aiChatting.init(that.mycharactersList[resIndex]);
        } else {
          // is Draft
          gtag("event", "click_aigirlfriend_myccardedit");
          that.editMcType = "edit";
          let res = that.mycharactersList[resIndex];
          await that.GetRoleInfo(res.role_id, 1, res.my_characters_id);
        }
        return;
      } else if (target.parents(".Recent_item").length != 0) {
        if (target.parents(".Recent_item").find(".deleteChat").hasClass("active")) return;
        gtag("event", "click_aigirlfriend_hrctcard");
        //点击最近聊天
        const id = target.parents(".Recent_item").attr("data-id");
        const index = that.recentCharacters.findIndex((item) => item.chat_id == id);
        console.log(that.recentCharacters[index], "that.recentCharacters[index]");
        aiChatting.init(that.recentCharacters[index]);
        return;
      }
    });

    $(".view,.viewMore,.back").click(function () {
      $(".Recent_item,.RecentChattingBox").css("transform", `translateX(0px)`);
      if ($(this).hasClass("active")) {
        $(".view").text(jsonAiGirlFriend.view);
        $(this).removeClass("active");
        $(".RecentChatting").removeClass("viewAll");
        that.composeRecent();
        $(".viewMore").removeClass("active");
      } else {
        $(".view").text(jsonAiGirlFriend.viewLess);
        $(this).addClass("active");
        $(".btn_left,.btn_right").hide();
        $(".RecentChatting").addClass("viewAll");
        $(".back").addClass("active");
      }
    });
  }
  async editDraftUpload(callback, erorrback, type) {
    $(".createMc_item,.create_back_box").addClass("loading");
    try {
      if (this.isUploadAvatar) {
        const res_Avatar = await uploadImagePromise(this.mc_Avatar);
        this.head_portrait = [
          {
            key: "head_portrait",
            url: res_Avatar.res.data.access_url,
            value: res_Avatar.res.data.key,
          },
        ];
      }
      if (this.isUploadBackground) {
        const res_Background = await uploadImagePromise(this.mc_Background);
        this.head_portrait_background = [
          {
            key: "head_portrait_background",
            url: res_Background.res.data.access_url,
            value: res_Background.res.data.key,
          },
        ];
      }
    } catch (err) {
      erorrback?.();
      $(".createMc_item,.create_back_box").removeClass("loading");
    }

    await this.roleEdit(
      () => {
        callback?.();
        $(".createMc_item,.create_back_box").removeClass("loading");
        if (type == "all") {
          $(".myCharactersBox .classify_select .select_list_item").removeClass("active");
          $(".myCharactersBox .classify_select .select_list_item").eq(0).addClass("active");
          $(".myCharactersBox .classify_select .select_content").text(jsonAiGirlFriend.classifySelect.All);
          this.primary = "";
        } else if (type == "draft") {
          $(".myCharactersBox .classify_select .select_list_item").removeClass("active");
          $(".myCharactersBox .classify_select .select_list_item").eq(3).addClass("active");
          $(".myCharactersBox .classify_select .select_content").text(jsonAiGirlFriend.classifySelect.Draft);
          this.primary = jsonAiGirlFriend.classifySelect.Draft;
        }
        $(".classify_box_container .classify_item").removeClass("active");
        $(".SegmentBox .classify_item").eq(0).addClass("active");
        $(".myCharactersBox .classify_item").eq(0).addClass("active");
        this.homeTag = [];
        this.mcTag = [];
        this.clearInput();
        this.closeCD();
        this.editMcType = "";
      },
      () => {
        erorrback?.();
        $(".createMc_item,.create_back_box").removeClass("loading");
      }
    );
  }

  // 是否显示展示所有聊天对象界面的loading isAdd 表示是否在原来基础上添加
  isShowCharacterLoading(bool, isAdd = false) {
    if (bool && isAdd) {
      $(".characters_loading").show();
      return;
    }
    if (bool || this.num != 0) {
      $(".noFound").hide();
      $(".characters").hide();
      $(".characters_loading").show();
    } else {
      this.isLoading = bool;
      if (this.charactersList.length == 0) {
        $(".noFound").show();
      } else {
        $(".characters").show();
      }
      $(".characters_loading").hide();
    }
  }
  // 是否显示展示我的聊天对象界面的loading
  isShowMyCharacterLoading(bool, isAdd = false) {
    console.log("isShowMyCharacterLoading", bool, isAdd, this.editMcType == "", this.editMcType);
    if (this.editMcType != "") {
      $(".Mycharacters_loading").hide();
      return;
    }
    if (bool && isAdd) {
      $(".Mycharacters_loading").show();
      return;
    }
    if (bool || this.numMy != 0) {
      $(".noFoundMc").hide();
      $(".myCharacters_Box").hide();
      $(".Mycharacters_loading").show();
    } else {
      this.isMyLoading = bool;
      if (this.mycharactersList.length == 0) {
        $(".noFoundMc").show();
      } else {
        $(".myCharacters_Box").show();
      }
      if ($(".createBtn").hasClass("active")) {
        $(".myCharacters_Box,.noFoundMc").hide();
      }
      // $(".edit:not(.recent)").removeClass("active").text(jsonAiGirlFriend.edit);
      $(".Mycharacters_loading").hide();
    }
  }
  //切换点赞
  changeLike(id) {
    fetchPost("chat/user/role-like", { role_id: id }).catch(function (res) {
      console.log("role-like", res);
    });
  }
  //删除最近聊天
  deleteChat(chat_id, callback) {
    fetchPost("chat/user/del-recent-chatting", { chat_id })
      .then(() => {
        callback?.();
      })
      .catch(function (res) {
        console.log("del-recent-chatting", res);
      });
  }
  // delete myCharacter
  deleteMyChat(id, callback) {
    fetchPost("chat/user/del-my-characters", { my_characters_id: id })
      .then(() => {
        callback?.();
      })
      .catch(function (res) {
        console.log("del-my-characters", res);
      });
  }

  // 最近聊天排版
  composeRecent() {
    const that = this;
    const parentWidth = $(".RecentChatting").width();
    const itemWidth = $(".Recent_item").width();
    const marginRight = $(".Recent_item").css("margin-right");
    // 处理mobile排序
    const container = $(".RecentChatting");
    const content = $(".RecentChattingBox");
    content.css("transform", `translateX(0px)`);
    let allWidth = (itemWidth + parseFloat(marginRight)) * $(".Recent_item").length;
    // 运动距离
    let moveDistance = 0;
    let preMove = (itemWidth + 16) * 3;
    isShowBtnLR(moveDistance, -(allWidth - parentWidth));
    // console.log("RecentChatting",allWidth,parentWidth)
    $(".btn_right").click(function () {
      if (Math.abs(moveDistance - preMove) >= allWidth - parentWidth) {
        moveDistance = -(allWidth - parentWidth);
      } else {
        moveDistance -= preMove;
      }
      content.css("transform", `translateX(${moveDistance}px)`);
      transformBtn(moveDistance, -(allWidth - parentWidth));
    });

    $(".btn_left").click(function () {
      if (moveDistance + preMove > 0) {
        moveDistance = 0;
      } else {
        moveDistance += preMove;
      }
      content.css("transform", `translateX(${moveDistance}px)`);
      transformBtn(moveDistance, -(allWidth - parentWidth));
    });
    // 处理最近聊天mobile端滑动效果
    if (allWidth > parentWidth && userModel != "pc") {
      $(".viewMore").css("visibility", "visible");
      // 内联样式置空
      $(".back").css("display", "");
    } else {
      $(".viewMore").css("visibility", "hidden");
      $(".back").hide();
      container.off();
    }
  }

  // 分类排版
  composeClassify(parent) {
    const that = this;
    const content = parent.find(".classify_item");
    const parentWidth = parent.find(".classify_box_container").width();
    const leftBtn = parent.find(".classify_btn_left");
    const rightBtn = parent.find(".classify_btn_right");
    content.css("transform", `translateX(0px)`);

    let allWidth = 0;
    parent.find(".classify_item").each(function () {
      let width = 0;
      width += $(this).width();
      width += parseFloat($(this).css("margin-right"));
      width += parseFloat($(this).css("padding-right"));
      width += parseFloat($(this).css("padding-left"));
      width += parseFloat($(this).css("border-width")) * 2;
      allWidth += width;
    });
    // console.log(allWidth, parentWidth, userModel, "parentWidth");
    // 运动距离
    let moveDistance = 0;
    let preMove = 300;
    if (allWidth > parentWidth && userModel == "pc") {
      transformBtn(moveDistance, -(allWidth - parentWidth), leftBtn, rightBtn);
    }

    rightBtn.click(function () {
      if (Math.abs(moveDistance - preMove) >= allWidth - parentWidth) {
        moveDistance = -(allWidth - parentWidth);
      } else {
        moveDistance -= preMove;
      }
      content.css("transform", `translateX(${moveDistance}px)`);
      transformBtn(moveDistance, -(allWidth - parentWidth), leftBtn, rightBtn);
    });

    leftBtn.click(function () {
      if (moveDistance + preMove > 0) {
        moveDistance = 0;
      } else {
        moveDistance += preMove;
      }
      content.css("transform", `translateX(${moveDistance}px)`);
      transformBtn(moveDistance, -(allWidth - parentWidth), leftBtn, rightBtn);
    });
  }

  // 对brief出现的方向排序
  composeBrief() {
    const that = this;
    $("body").on("mouseover", function (e) {
      const target = $(e.target);
      // console.log(target,'target composeBrief')
      if (userModel != "pc") return;
      if (
        target.parents(".characters_item").length != 0 ||
        target.hasClass("characters_item") ||
        target.parents(".myCharacters_item").length != 0 ||
        target.hasClass("myCharacters_item")
      ) {
        let brief, character_item, index;
        if (target.parents(".characters_item").length != 0) {
          brief = target.parents(".characters_item").find(".brief");
          character_item = target.parents(".characters_item");
          index = that.charactersList.findIndex(
            (item) => parseInt(item.id) == parseInt(character_item.attr("data-indexid"))
          );
        } else if (target.parents(".myCharacters_item").length != 0) {
          brief = target.parents(".myCharacters_item").find(".brief");
          character_item = target.parents(".myCharacters_item");
          index = that.mycharactersList.findIndex(
            (item) => parseInt(item.id) == parseInt(character_item.attr("data-indexid"))
          );
        } else {
          brief = target.find(".brief");
          character_item = target;
        }

        brief.removeClass("brief_left");
        const sectionWidth = $(".aiGirlFriend").width();
        const character_Width = character_item.width();
        // 当前第几个
        index++;
        // 一行最多显示数 目前
        const maxParty = Math.floor(sectionWidth / character_Width);
        // 获取当前在左还是右 大于0.5为右边所以brief显示在左边
        const dir = Number.isInteger(index / maxParty) ? 1 : (index / maxParty) % 1;
        if (dir > 0.5) {
          brief.addClass("brief_left");
        }
        // console.log(index,sectionWidth,character_Width,dir,index / maxParty, "brief composeBrief 111");
      }
    });
  }

  //分享弹窗与处理
  showShare(id, value) {
    gtag("event", "share_aigirlfriend_winshow");
    $Popup({
      title: $(".sharePop .shareTitle").html(),
      content: $(".sharePop .shareBox").html(),
      type: "share",
    });
    let shareLink =
      TOOL_API +
      `chat/user/share?s=` +
      btoa(value + "," + window.location.origin + window.location.pathname + "?openShare=" + id + "," + "en");

    $('meta[name="twitter:image"]').attr("content", value);
    $("meta[property='og:image']").attr("content", value);

    $(".shareIco.x").click(() => {
      gtag("event", "share_aigirlfriend_tw");
      openWindow(
        `https://twitter.com/intent/tweet?url=${shareLink}?play_source=Twitter&text=${encodeURIComponent(
          jsonAiGirlFriend.shareText
        )}`
      );
    });
    $(".shareIco.facebook").click(() => {
      gtag("event", "share_aigirlfriend_fb");
      openWindow(
        `https://www.facebook.com/sharer.php?u=${shareLink}?play_source=Facebook&text=${encodeURIComponent(
          jsonAiGirlFriend.shareText
        )}`
      );
      $("meta[property='og:url']").attr("content", shareLink);
    });
    $(".shareIco.Link").click(() => {
      gtag("event", "share_aigirlfriend_link");
      copyText(window.location.origin + window.location.pathname + "?openShare=" + id);
      try {
        ToolTip({
          text: "Copied successfully",
        });
      } catch (err) {
        ToolTip({
          text: "Copied failed",
        });
      }
    });
  }
  // 处理登录和退出登录回调
  eventLoginsuccess() {
    const that = this;
    let login_Modal = document.querySelector("my-component");
    login_Modal.addEventListener("loginsuccess", async function (event) {
      isLogin(true);
      await that.initCharacters();
      that.GetMyCharacters();
      that.GetRecentChatting();
    });
    $(".signout").on("click", async function () {
      await that.initCharacters();
      that.GetMyCharacters();
      that.GetRecentChatting();
    });
  }
  // 处理输入字符
  inputCharacter(that, maxlength, type) {
    const maxCharacters = maxlength - 1;
    let text = that.val(),
      aiLen = 0,
      startLenth = 0;
    if (type == "name") {
      text = text.replace(/[/*&\\%$#@]/g, "");
      // console.log(text,'name');
    }
    let str = "";
    for (const char of text) {
      str += char;
      startLenth++;
      // aiLen = str.match(/\S/g).length;
      aiLen = str.trim().length;
      if (aiLen > maxCharacters) {
        break;
      }
    }
    if (aiLen >= maxlength) {
      $(`.maxLength[data-input='${type}']`).addClass("error");
    } else {
      $(`.maxLength[data-input='${type}']`).removeClass("error");
    }
    if (aiLen > maxCharacters) {
      aiLen = maxlength;
    }
    $(`.maxLength[data-input='${type}'] span`).text(aiLen);
    that.val(text.substring(0, startLenth));
    return text.substring(0, startLenth);
  }
  // 统一处理初步上传流程
  async uploadImage(parent, e, that, type, callback) {
    const res = this;
    if (!e.target.files || !e.target.files[0]) {
      console.log("there is no file");
      callback?.();
      return;
    }
    let file = that.files[0];
    if (!checkFileType(file)) {
      parent.siblings(".erorrTip").find(".image_error").text(jsonAiGirlFriend.imageNoSupported);
      parent.siblings(".erorrTip").css("visibility", "visible");
      $(that).val(null);
      callback?.();
      return false;
    }
    // 图片大小验证
    if (file?.size > 100 * 1024 * 1024) {
      parent.siblings(".erorrTip").find(".image_error").text(jsonAiGirlFriend.imageSizeError);
      parent.siblings(".erorrTip").css("visibility", "visible");
      $(that).val(null);
      callback?.();
      return false;
    }
    let { blog } = await resizeImageByFile(file);
    let url = URL.createObjectURL(blog);
    var img = new Image();
    img.src = url;
    img.onload = function () {
      var height = this.naturalHeight;
      var width = this.naturalWidth;
      if (type === "background") {
        if (height < 128 || width < 128) {
          parent.siblings(".erorrTip").find(".image_error").text(jsonAiGirlFriend.backGround_Error);
          parent.siblings(".erorrTip").css("visibility", "visible");
          return false;
        } else {
          res.mc_Background = file;
          $("#createMC_background_img").attr("src", url);
        }
      } else {
        if (height < 32 || width < 32) {
          parent.siblings(".erorrTip").find(".image_error").text(jsonAiGirlFriend.avatar_error);
          parent.siblings(".erorrTip").css("visibility", "visible");
          return false;
        } else {
          res.mc_Avatar = file;
          $("#createMC_avatar_img").attr("src", url);
        }
      }
      parent.siblings(".erorrTip").css("visibility", "hidden");
    };
    img.error = function () {
      console.log("Error image loading");
    };
    callback?.();
  }
  // 清除所有输入内容
  clearInput() {
    this.mc_Avatar = "";
    this.mc_Name = "";
    this.mc_Desc = "";
    this.mc_Gender = "";
    this.mc_Background = "";
    this.mc_Persona = "";
    this.mc_visibility = jsonAiGirlFriend.classifySelect.Public;
    this.mc_Categories = [];
    this.mc_Greeting = "";
    this.mc_Scenario = "";
    this.mc_Dialogue = "";
    this.head_portrait = [];
    this.head_portrait_background = [];
    this.isUploadAvatar = false;
    this.isUploadBackground = false;
    this.oldRoleInfo = {};
    this.my_characters_id = 0;
    this.is_draft = false;
    this.mc_roleId = "";
    $(".maxLength span").text(0);
    $(".erorrTip").css("visibility", "hidden");
  }
  // close character edit
  async closeCD() {
    $(".createBtn").removeClass("active");
    $(".createMyCharacter_Box").hide();
    $("#myCharacters").click();
    // init my characters
    $("body")[0].scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
    setTimeout(async () => {
      await this.GetMyCharacters();
      // init all characters
      this.initCharacters();
      this.GetRecentChatting();
    }, 10);
  }
  // Paging processing
  pageProcess() {
    const that = this;
    $(window).off("scroll");
    const isAll = "all" == this.tab;
    let page, count;
    if (isAll) {
      page = this.CharactersPage + 1;
      count = this.CharactersCount;
    } else {
      page = this.MyCharactersPage + 1;
      count = this.MyCharactersCount;
    }
    if (page >= count || this.editMcType != "") return;
    console.log("pageProcess");
    $(window).on("scroll", function (e) {
      let offsetY = $(".hr_pagePorgress").offset().top + parseFloat($(".hr_pagePorgress").css("padding-bottom"));
      let scrollY = window.scrollY + $(window).height();
      if (scrollY >= offsetY) {
        $(".hr_pagePorgress")[0].scrollIntoView({ behavior: "instant", inline: "end", block: "end" });
        if (isAll) {
          !that.isLoading ? that.initCharacters(false) : "";
          that.isLoading = true;
        } else {
          !that.isMyLoading ? that.GetMyCharacters(false) : "";
          that.isMyLoading = true;
        }
      }
    });
  }
}

function ToolTip(params) {
  const { text = "", type = "", showtime = "" } = params;
  $("body").append(`
    <bottom-message
      text="${text}"
      type="${type}"
      showtime="${showtime}"
      >
    </bottom-message>`);
}
// 处理一开始是否显示左右按钮
function isShowBtnLR(moveDistance, removeDistance) {
  const parentWidth = $(".RecentChatting").width();
  const itemWidth = $(".Recent_item").width();
  const marginRight = $(".Recent_item").css("margin-right");
  let allWidth = (itemWidth + parseFloat(marginRight)) * $(".Recent_item").length;
  if (allWidth > parentWidth && userModel == "pc") {
    $(".view").show();
    if ($(".view").hasClass("active")) {
      $(".btn_left,.btn_right").hide();
    } else {
      transformBtn(moveDistance, removeDistance);
    }
  } else {
    $(".btn_left,.btn_right,.view").hide();
  }
}
// 处理PC端滑动过程中是否显示左右按钮
// moveDistance 当前移动距离，removeDistance 可移动距离
function transformBtn(moveDistance, removeDistance, leftBtn = $(".btn_left"), rightBtn = $(".btn_right")) {
  // if($(".SegmentBox").css("display") == "none") return false;
  if (moveDistance == 0) {
    leftBtn.hide();
  } else {
    leftBtn.css("display", "flex");
  }

  if (moveDistance == removeDistance) {
    rightBtn.hide();
  } else {
    rightBtn.css("display", "flex");
  }
}

function copyText(text) {
  const textToCopy = text;
  const tempInput = document.createElement("input");
  tempInput.value = textToCopy;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand("copy");
  document.body.removeChild(tempInput);
}

function openWindow(url) {
  if (winRef && !winRef.closed) {
    winRef.location.href = url;
  } else {
    window.open(url);
  }
}

function formatNumber(num) {
  if (num < 1000) {
    return `${num}`;
  } else if (num < 1000000) {
    const numInK = num / 1000;
    if (Number.isInteger(numInK)) {
      return `${numInK.toFixed(0)}K`;
    } else {
      const decimal = numInK.toFixed(1);
      return decimal.endsWith(".0") ? `${numInK.toFixed(0)}K` : `${decimal}K`;
    }
  } else {
    const numInM = num / 1000000;
    if (Number.isInteger(numInM)) {
      return `${numInM.toFixed(0)}M`;
    } else {
      const decimal = numInM.toFixed(1);
      return decimal.endsWith(".0") ? `${numInM.toFixed(0)}M` : `${decimal}M`;
    }
  }
}

// check file type
checkFileType = (file, type) => {
  var allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/octet-stream"];
  var fileType = file.type;
  var allowedNameTypes = ["jpeg", "png", "webp", "jpg"];
  let nameArr = file.name.split(".");
  var fileNameType = nameArr[nameArr.length - 1].toLowerCase();

  if (!allowedTypes.includes(fileType) || !allowedNameTypes.includes(fileNameType)) {
    return false;
  }
  return true;
};

$(document).ready(function () {
  console.log(
    `%cCurrent version: V${currentVersion}`,
    "color: red;font-size: 24px;font-weight: bold;text-decoration: underline;"
  );
  // let data = {"id":211,"role_id":211,"name":"Julie","json":{"tag":"drama,gender:Female","Created":"Created Dec 24, 2023","Character_des":"You always had a thing for Marianabut she has a boyfriend so youdecided to be just friends. Yourcollege friend Mariana is goingthrough a bad argument between hisboyfriend. Looking for comfort, shecomes over to your apartmentcrying.","head_portrait":"","Character_name":"Wolf girl stepmom","Character_author":"by Mitchell"},"like_num":12,"msg_num":148,"type":1,"head_portrait":[{"kay":"head_portrait","value":"https://static.vidnoz.com/ai_girlfriend/Kaida.jpeg","url":"https://static.vidnoz.com/ai_girlfriend/Kaida.jpeg"}],"my_characters_id":0,"head_portrait_background":[],"is_like":2,"is_my_characters":2,"chat_id":""}
  window.aiChatting = new AiGirlfriendTalking();
  window.aiGirlFriend = new AiGirlFriend();
  aiChatting.bindEvent(); //事件绑定
  let shareId = getUrlVal("openShare");
  let fun = async () => {
    await aiGirlFriend.init();

    if (shareId) aiChatting.getAiInfo(shareId, 2, "");

    // aiChatting.init(data)
    let access_token = getCookie("access_token") ? getCookie("access_token") : "";
    if (!access_token) {
      gtag("event", "open_aigirlfriend_page");
    }
    window.addEventListener("resize", function () {
      aiGirlFriend.composeRecent();
    });
  };
  fun();
});
