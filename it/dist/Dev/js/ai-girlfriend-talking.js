let SOCKET
let defaultUserAvatar = `/dist/img/ai-chatting/icon_avatar.png`
const gfChattingLan = jsonData.aiGirlFriendChat.javascript
class AiGirlfriendTalking {
    unChangeKeyList = ["chat_id"]

    constructor() {
        this.boxPosition = {
            changeBtnLeft: {
                chattingContainer: {
                    height: "64vh"
                },
                chattingBox: {
                    left:".8rem",
                    right: "auto"
                },
                chatBgImg: {
                    right: "0px",
                    left: "auto"
                },
                changePhotoBtn: {
                    right: ".8rem",
                    left: "auto"
                }
            },
            changeBtnMiddle: {
                chattingContainer: {
                    height: "320px"
                },
                chattingBox: {
                    left:"calc(50% - 38.54vw / 2)",
                    right: "auto"
                },
                chatBgImg: {
                    right: "auto",
                    left: "calc(50% - 661px / 2)"
                },

                changePhotoBtn: {
                    right: "auto",
                    left: ".8rem"
                }
            },
            changeBtnRight: {
                chattingContainer: {
                    height: "64vh"
                },
                chattingBox: {
                    left:"auto",
                    right: ".8rem"
                },
                chatBgImg: {
                    right: "auto",
                    left: "0"
                },
                changePhotoBtn: {
                    right: "auto",
                    left: ".8rem"
                }
            }}
        this.isChat = false; //是否聊上天
    }
    data() {
        return {
            modelDOM: $("#AiChat"),
            userMessage: $("#userInputMsg").value, //输入框内容
        }
    }
    /**
     * 获取聊天历史记录
     */
    async getChatHistory() {
        if(this.isSyncingHistroy || !this.chatPage) return
        this.isSyncingHistroy = true

        const url = new URLSearchParams()
        url.append('chat_id', this.connectMsg.chat_id)
        if(this.chatPage && this.chatPage > 0) url.append('page', this.chatPage + '')
        const queryString = url.toString();

        await fetchGet(`chat/user/get-message-info?${queryString}`)
          .then(res=> {
            if(res.code === 200 && !!res.data) {
                this.isChat = true
                this.chatPage = res.data.page
                // res.data.list.reverse();

                const usefulData = res.data.list.filter((item) => {
                    return !!item.chat_content.content
                })
                if(usefulData.length < 5 && !!this.chatPage){
                    this.isSyncingHistroy = false
                    this.getChatHistory()
                    if(usefulData.length === 0) return
                }
                const $container = $('.chatting-container');
                const prevScrollTop = $container.scrollTop();
                const prevScrollHeight = $container[0].scrollHeight;
                $container.css('overflow-y', 'hidden')
                for(let item of usefulData) {
                    if(item.chat_content.role === "user") {
                        let newMyMsgDom = $('#myMessageBox')
                        this.showMessage(newMyMsgDom,item.chat_content.content,'.my-message-container',false,true)
                    } else {
                        let newAiMsgDom = $('#aiMessageBox')
                        this.showMessage(newAiMsgDom,item.chat_content.content,'.ai-message-container',true,true)
                    }
                }
                $container.css('overflow-y', 'auto')
                if(!this.initHistory) {
                    const newScrollHeight = $container[0].scrollHeight;
                    const changeHeight = newScrollHeight - prevScrollHeight;
                    $container.scrollTop(prevScrollTop + changeHeight);
                }else {
                    $container.scrollTop($container.prop('scrollHeight'));
                }
                this.initHistory = false
            }
        })
          .finally(() => {
            this.isSyncingHistroy = false
          })
    }
    /**
     * 获取聊天ID和服务器
     */
    getChatData(url = "") {
        let that = this
        return new Promise(resolve => {
            let data = {
                chat_id:this.aiData.chat_id,
                role_id:this.connectMsg.role_id,
                is_my_characters:this.aiData.is_my_characters,
                last_server_url: url
            }
            if(this.aiData.is_my_characters === 1) data['my_characters_id'] = this.aiData.my_characters_id
            fetchPost("chat/user/get-chat-server",data).then(res=> {
                if(res.code === 401) {
                    that.closeChat()
                    return false
                }
                // if(res.code === 6001) {
                //     $Popup({
                //         type:"error",
                //         content: "You already have a chat in progress..."
                //     })
                //     gtag("event","already_aigirlfriend_win")
                //     that.closeChat()
                //     return false
                // }
                if(res.data['is_old_server_url'] === 1) that['isOldSeverUrl'] = true
                this.socketUrl = res.data['server_url']
                this.connectMsg.chat_id = res.data.chat_id
                this.aiData.chat_id = res.data.chat_id
                this.connectMsg.chat_id_name = res.data.chat_id_name
                if(res.code === 200) {
                    resolve(res.data)
                } else  {
                    $Popup({
                        type:"error",
                        errorType: "normal"
                    })
                    resolve()
                }
            })
        })
    }

    /**
     * AI主动打招呼
     * @constructor
     */
    AiHello() {
        if(!this.sendHello) return false
        try {
            clearInterval(this.helloTimer)
        } catch {}
        let data = {
            ...this.connectMsg,
            request_type:50,
            chat_last_sep: 3234
        }

        this.helloTimer = setInterval(  () => {
            SOCKET.send(JSON.stringify(data))
            this.sendHello = false
            clearInterval(this.helloTimer)
        },1000 * 60 * 4)
    }

    /**
     * 处理undress跳转函数
     */
    async changeAvatarFn() {
        // let isExist = localStorage.getItem(`${this.aiData.role_id}_undress`)

        let isExist = getUrlVal("form")


        let that = this
        let headAvata =  getUrlVal("headAvatar")

        if(headAvata) {
            let avatarKey = atob(getUrlVal("avatarKey"))
            let imgUrl = atob(headAvata)
            let uploadData = {
                role_id: this.aiData.role_id,
                my_characters_id: this.aiData.is_my_characters === 1 ? this.aiData.my_characters_id : 0,
                name: this.aiData.name,
                // type: this.aiData.type,
                is_draft: 2,
                tag: this.aiData.json.tag ?? '',
                persona: this.aiData.persona ?? '',
                gender: this.aiData.json.gender ?? '',
                description: this.aiData.json["Character_des"] ?? '',
                scene: this.aiData["role_content"]["scene description"],
                greeting: this.aiData["role_content"].greeting,
                context: this.aiData["role_content"].context,
                chat_id: this.connectMsg.chat_id,
                head_portrait: JSON.stringify([{key: "head_portrait",value: avatarKey,is_temp:1}]),
                head_portrait_background: JSON.stringify(this.aiData.head_portrait_background),
            }

            this.aiData.head_portrait = [{key: "head_portrait",value: imgUrl,url:imgUrl}]
            that.aiAvatarImg = imgUrl
            this.aiData.status = 2
            this.updateCharacter()
            $(".chatting-share").hide()
            that.aiData.is_my_characters = 1
            that.bgImg = ""
            this.changeBgAvatar()
            if(!isExist) return false

            const res = await fetchPost("chat/user/role-edit",uploadData);
            if(res.code === 200) {
                aiGirlFriend.GetRecentChatting()
                this.aiData["toMyCharacter"] = true
                history.pushState(null, null, `/ai-girlfriend.html?openShare=${getUrlVal("openShare")}&headAvatar=${headAvata}&avatarKey=${btoa(avatarKey)}`);
                this.aiData['my_characters_id'] = res.data.my_characters_id
                this.aiData.role_id = res.data.role_id
                this.aiData.is_my_characters = 1
            }
            if(res.code === 401) that.closeChat()

            const newInfo = await this.getAiDetails(this.aiData.role_id,this.aiData.is_my_characters,this.aiData.my_characters_id)
            for (const key in newInfo) {
                if (newInfo.hasOwnProperty(key) && (!this.aiData[key] || !this.unChangeKeyList.includes(key))) {
                    this.aiData[key] = newInfo[key];
                }
            }
            this.updateCharacter()
        }
    }
    mobileInit() {
        if(window.innerWidth < 1200) {
            $("#changePhotoBtn").text("Change Photo")

            let rightRem
            this.aiData.is_my_characters === 1 ? rightRem = "1.4rem" : rightRem = "1.92rem"
            $(".change-photo-btn").css({
                left: "auto",
                right: rightRem
            })
        }
    }
    async init(options) {
        gtag("event", `chat_aigirlfriend_${options.role_id}`);
        this.errorPopup = $Popup({type:"error",errorType:"network"})
        this.errorPopup.close()
        this.isChat = false
        let that = this
        this.socketClose = false
        this.chatPage = -1
        this.initHistory = true
        this.isSyncingHistroy = false
        gtag("event", "enter_aigirlfriend_chatting");
        // this.getAiInfo(options.role_id,options.is_my_characters.my_characters_id)
        this.aiData = options
        this.aiAvatarImg = options?.head_portrait[0]?.url
        this.bgImg =
            options.head_portrait_background.length > 0
                ? options.head_portrait_background[0]?.url
                : options.head_portrait[0]?.url;
        // this.bgImg =options.head_portrait[0]?.url;

        this.backImg = `url("${options.head_portrait_background[0]?.url || this.bgImg}")`
        this.uploadAvatarChange = true
        this.uploadbg = options.head_portrait_background[0]?.url || false
        if(getCookie("user_info")) this.userData = JSON.parse(getCookie("user_info"))
        // this.userData = null
        this.userAvatarImg = this.userData?.head_portrait || defaultUserAvatar
        this.connectMsg = {
            "user_id": this.userData?.id | "0",
            "role_id": options.role_id + "",
            "role_name": options.name,
            "chat_id_name": "",
            "chat_id": "",
            "token": getCookie("SsToken"),
        }
        this.connectMsg.user_id = this.connectMsg.user_id + ""

        this.uploadBlob = {
            changeAvatar: {},
            changeBg: {}
        }

        this.sendHello = true
        this.uploadStatus = false

        $('.chatting-container').empty(); //清空聊天框

        // this.getIsLike()

        let currentPosition = "changeBtnMiddle"
        if(localStorage.getItem("user_info") && localStorage.getItem("chattingPosition")) currentPosition = localStorage.getItem("chattingPosition")
        this.changePosition(currentPosition)
        this.mobileInit()

        this.data().modelDOM.fadeIn()


        $("body").css({
            "overflow":"hidden",
            "position": "fixed"
        })
        this.loginTimer = setInterval(()=> {
            this.showLoginPopup()
        },1000 * 60 * 5)
        $(".hidden-box #aiAvatarImg").attr("src",this.aiAvatarImg)
        $("#myAvatarImg").attr("src",this.userAvatarImg)
        $(".chat-bg-img, .ai-chat-box").css("background-image",this.backImg)
        let img = new Image()
        img.onload = function() {
            that.ratio = this.width / this.height;
            that.ratio.toFixed(2) > 1 ? that.boxPosition.changeBtnMiddle.chatBgImg.left = 0 : that.boxPosition.changeBtnMiddle.chatBgImg.left = "calc(50% - 661px / 2)"
            let currentPosition = "changeBtnMiddle"
            if(localStorage.getItem("user_info") && localStorage.getItem("chattingPosition")) currentPosition = localStorage.getItem("chattingPosition")
            const $chatBgImg = $("#chatBgImg")
            that.ratio.toFixed(2) > 1
              ? $chatBgImg.css({"width":"100vw","left": "0px"})
              : $chatBgImg.css({"width":"661px","left": that.boxPosition[currentPosition].chatBgImg.left})
        ;
        }
        img.src = this.bgImg
        this.updateCharacter()
        let aiDetailsByServer = await this.getAiDetails(options.role_id,options.is_my_characters,options.my_characters_id)
        for (const key in aiDetailsByServer) {
            if (aiDetailsByServer.hasOwnProperty(key) && (!this.aiData[key] || !this.unChangeKeyList.includes(key))) {
                this.aiData[key] = aiDetailsByServer[key];
            }
        }
        this.updateCharacter()
        // this.aiData.is_like = aiDetailsByServer.is_like
        if(aiDetailsByServer.is_like === 1) {
            $(".no-like-icon").hide()
            $(".like-icon").show()
        } else {
            $(".no-like-icon").show()
            $(".like-icon").hide()
        }

        // this.openChangeHandle()
        let chatData = await this.getChatData()
        await this.changeAvatarFn()

        this.getChatHistory()
        this.isMyCharacterStatus = this.aiData.is_my_characters
        this.aiData["toMyCharacter"] = false

        // chatData.server_url = "ws://192.168.8.163:5000"
        this.connectChatting(chatData['server_url'])  //连接聊天服务器




        this.AiHello()
    }

    updateCharacter() {
        $(".chatting-count").text(formatNumber(this.aiData["msg_num"]))
        $(".ai-chat-gf-avatar, .ai-gf-info-dialog-avatar").attr("src",this.aiAvatarImg)
        $(".ai-gf-info-dialog-birthday").text(this.aiData.json["Created"])
        $(".ai-gf-info-dialog-desc").text(this.aiData.json["Character_des"])
        $(".ai-chat-gf-name, .ai-gf-info-dialog-name").text(this.aiData.name)
        this.toggleShareBtn(this.aiData.status === 1 && this.aiData.type === 1)
        const chatDialogTags = this.aiData.json.tag
          .split(',')
          .filter((t) => t !== '')
          .map((t) => {
              return `<div class="ai-gf-info-dialog-tag">${t}</div>`
          })
        $('.ai-gf-info-dialog-tags').html(chatDialogTags.join(''))
    }

    bindEvent() {
        let that = this
        //分享click event

        // 判读用户输入字符
        $('#userInputMsg').off('input').on('input', function() {
            let textLength = $(this).val().length;
            // this.style.height = 'auto';
            window.innerWidth > 1200 ? this.style.height = this.scrollHeight  +'px' : this.style.height = this.scrollHeight/100 + 0.5 + "rem"
            if(textLength === 0 || textLength < 37) {
                window.innerWidth > 1200 ? this.style.height = '46px' : this.style.height = ".88rem"
            }

            // $('#userInputMsg').scrollTop($('#userInputMsg')[0].scrollHeight);


            const $sendBtn = $(".send-btn")
            textLength !== 0 && !/^\s*$/.test($(this).val())
                ? $sendBtn.removeClass("disable")
                : $sendBtn.addClass("disable")
        });


        // 绑定退出聊天click事件
        $('#backIcon, #closeIcon').off("click").on('click', function() {
            let id = $(this).attr('id');
            if (id === 'backIcon') { gtag("event", "back_aigirlfriend_chatting") } else { gtag("event", "close_aigirlfriend_chatting")}
            that.closeChat("click")
        });



        //发送聊天信息绑定
        $("#sendMsg").off("click").on('click', ()=> {
            this.sendMessage()
            $("#userInputMsg").trigger('focus');

        });

        //输入回车键发送消息
        $('.ai-chat-box textarea').off("keydown").on('keydown', (event)=> {
            if(event.key === 'Enter'){
                event.preventDefault();
                this.sendMessage()
            }
        });

        //更换聊天框位置事件绑定
        $("#editIcon").off("click").on('click', ()=> {
            $('.change-position-box').toggle()
        })
        $(document).on('click', function(event) {
            const $target = $(event.target);
            if (!$target.closest('#editIcon').length && !$target.closest('.change-position-box').length) {
                $('.change-position-box').hide();
            }
            if(!$target.closest('.right-button-box-m-dropdown').length && !$target.closest('.right-button-box-m-dropdown-menu').length) {
                that.toggleGFDropdown(false)
            }
        });
        $('.change-btns-box .change-btn').off("click").on('click', function() {
            let id = $(this).attr("id")
            let gtagEvent = {
                changeBtnLeft: "left_aigirlfriend_pos",
                changeBtnMiddle: "mid_aigirlfriend_pos",
                changeBtnRight: "right_aigirlfriend_pos"
            }
            gtag("event",gtagEvent[id])
            that.changePosition(id)
            $('.change-position-box').hide()
        });

        //更换AI背景头像绑定
        $('#changePhotoBtn').off("click").on('click', ()=> {
            gtag("event", "click_aigirlfriend_changephoto")

            this.openChangeHandle()
        })


        // 点击喜欢绑定
        $(".chatting-like").off("click").on('click', function() {
            aiGirlFriend.changeLike(that.aiData.role_id)
            $(".no-like-icon").toggle()
            $(".like-icon").toggle()
            if($(this).closest('.ai-gf-info-dialog').length > 0) {
                gtag("event", "like_aigirlfriend_view")
            }else if($(this).find('img[style="display: block;"]').attr("class") === "like-icon"){
                gtag("event", "like_aigirlfriend_chatting")
            }
            that.aiData.is_like === 1 ?that.aiData.is_like = 2 : that.aiData.is_like = 1
        })


        $(".discord-box").off("click").on('click', ()=> {
            gtag("event", "discord_aigirlfriend_chatting")
        } )

        $(".chatting-share").off("click").on('click', (e)=>{
            if($(e.target).closest('.ai-gf-info-dialog').length > 0) {
                gtag("event", "share_aigirlfriend_view")
            }else{
                gtag("event", "share_aigirlfriend_chatting")
            }
            aiGirlFriend.showShare(this.aiData.role_id,this.aiData.head_portrait[0].value)
        })

        $('.ai-chat-gf-view').off("click").on('click', () => {
            this.toggleGFInfoDialog(true)
        })

        $('.ai-gf-info-dialog-close, .ai-gf-info-dialog-bg').off("click").on('click', () => {
            this.toggleGFInfoDialog(false)
        })

        $('.right-button-box-m-dropdown').off("click").on('click', () => {
            const currentStatus = $('.right-button-box-m-dropdown-menu').is(':visible')
            this.toggleGFDropdown(!currentStatus)
        })

        $('#chattingContainer').off("scroll").on('scroll', function() {
            if($(this).scrollTop() === 0) {
                that.getChatHistory()
            }
        })
    }
    changePosition(id) {
        this.currentPosition = id
        getCookie('user_info') ? localStorage.setItem("chattingPosition",id) : localStorage.removeItem("chattingPosition")
        let jqId = "#" + id
        $(jqId).addClass('change-active').siblings().removeClass('change-active');

        let position = this.boxPosition
        for(let key in position[id]) {
            let dom = `#${key}`
            for(let cssKey in position[id][key]) {
                $(dom).css(cssKey,position[id][key][cssKey])
            }
        }
        let container = $('.chatting-container');
        container.scrollTop(container.prop('scrollHeight'));
    }
    isMobile(){
      return window.innerWidth < 1200
    }
    toggleGFInfoDialog(status) {
        const $dialog = $(".ai-gf-info-dialog-wrap")
        if(!this.isMobile()){
            status ?
            $dialog.fadeIn(160) :
            $dialog.fadeOut(160)
        } else {
            status ?
            $dialog.show(0, () => $dialog.addClass('active')) :
            $dialog.removeClass('active').hide()
        }
        if(status) gtag('event', 'show_aigirlfriend_view')
    }
    toggleGFDropdown(status) {
        const $dropdown = $(".right-button-box-m-dropdown-menu")
        if(!this.isMobile()){
           status ?
                $dropdown.fadeIn(160) :
                $dropdown.fadeOut(160)
        }else{
            status ?
                $dropdown.slideDown(160) :
                $dropdown.slideUp(160)
        }
    }
    toggleShareBtn(status) {
        const $shareBtn = $('.chatting-share')
        status ? $shareBtn.show() : $shareBtn.hide()
    }
    async closeChat(isClick) {
        let fn = async () => {
            this.toggleGFInfoDialog(false)
            $(".change-position-box").hide()
            $("body").css({
                "overflow-y":"auto",
                "position": "static",
            })
            history.pushState(null, null, '/ai-girlfriend.html');
            clearInterval(this.loginTimer)
            clearInterval(this.heartTimer)
            clearInterval(this.helloTimer)
            clearInterval(this.disconnectTimer)
            const $userInputMsg = $("#userInputMsg")
            $userInputMsg.val('')
            window.innerWidth > 1200
              ? $userInputMsg.css("height", "46px")
              : $userInputMsg.css("height", ".88rem")
            $('.chatting-container').empty(); //清空聊天框
            // let data = {
            //     ...this.connectMsg,
            //     "request_type": 30,
            // }
            $('div.modal').remove();

            this.data().modelDOM.fadeOut()

            // SOCKET.send(JSON.stringify(data));
            this.socketClose = true;
            SOCKET?.close()

            if(this.isChat){
                aiGirlFriend.addRecentChatting(this.aiData)
            }
            // aiGirlFriend.GetRecentChatting()
            await aiGirlFriend.initCharacters()
            aiGirlFriend.GetMyCharacters()

        }
        if(isClick) {
            this.showLoginPopup(async()=>{
                fn()
            })
        } else {
            fn()
        }

    }
    lastMessage = null
    connectChatting(url) {
        if(this.socketClose) return false
        let that = this
        SOCKET = new WebSocket(url)
        let data = {
        ...this.connectMsg,
        "chat_last_sep": 3234,
        "request_type":this.isOldSeverUrl ? 11 : 10,
        "chat_action": ""
        }
        this.isOldSeverUrl = false

        let heart = {
            ...this.connectMsg,
            "request_type": 40,
        }



        this.heartTimer = setInterval(()=> {
            if (SOCKET.readyState === WebSocket.OPEN) SOCKET.send(JSON.stringify(heart))
        },1000 * 40 )

        SOCKET.onopen = ()=> {
            this.disconnectTimer = setTimeout(()=> {
                SOCKET.close()
            }, 1000 * 5 * 60)
            SOCKET.send(JSON.stringify(data));
            if(this.disconnectMessage)  {
                setTimeout(()=> {
                    SOCKET.send(this.disconnectMessage);
                    this.disconnectMessage = ""
                },1000)
            }
        };
 
        SOCKET.onmessage = async (event)=> {
            this.wssResponse = JSON.parse(event.data)
            if(!this.wssResponse['next_time']) {
                clearTimeout(this.disconnectTimer)
                this.disconnectTimer = setTimeout(()=> {
                    SOCKET.close()
                }, 1000 * 5 * 60)
            }

            if(this.wssResponse.status === 300) {
                SOCKET.close()
                this.disconnectMessage = this.lastMessage
                let reconnect = await that.getChatData(url)
                that.connectChatting(reconnect?.server_url)
                return false
            }

            if(this.wssResponse.status === 6001) {
                // $Popup({
                //     type:"error",
                //     content: "You already have a chat in progress..."
                // })
                gtag("event","already_aigirlfriend_win")
                that.closeChat()
                return false
            }
            // if(this.wssResponse.code !== 200) return false
            let content = JSON.parse(event.data)?.chat_content
            let newAiMsgDom = $('#aiMessageBox')
            this.showMessage(newAiMsgDom,content,'.ai-message-container')
            // this.setChatHistory(this.aiData.role_id,"ai",content)
        };
        SOCKET.onerror = async function(error) {
            console.error(error,"error")
        };

        SOCKET.onclose = async function(event) {
            if (!event.wasClean) {
                let reconnect = await that.getChatData(url)
                that.connectChatting(reconnect?.server_url)
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

    showMessage(dom,msg,textDom,formHistory,isHistory) {
        if(!msg) return
        let newAiMsgDom = dom.clone().removeAttr('id');
        onlyText(msg) ? msg = msg.replace(/\*(.*?)\*/g, '<p style="margin:0">($1)</p>') : msg = msg.replace(/\*(.*?)\*/g, '<p>($1)</p>')
        if(textDom === ".ai-message-container") msg = `<div class="ai-name">${this.aiData.name}</div>` + msg
        newAiMsgDom.find(textDom).html(msg);

        let container = $('.chatting-container');
        if(isHistory) {
            container.prepend(newAiMsgDom)
        }else {
            container.append(newAiMsgDom)
            container.scrollTop(container.prop('scrollHeight'));
        }

        if(textDom === ".ai-message-container" && !formHistory) {
            newAiMsgDom.find(textDom).html(`<div class="chatting-loading"></div>`)
            let time = 0
            const timer = setInterval(()=> {
                $(".chatting-loading").css("background-position-x",time+"px")
                time = time + 8
            },200)
            setTimeout(()=> {
                newAiMsgDom.find(textDom).html(msg);
                container.scrollTop(container.prop('scrollHeight'));
                clearInterval(timer)
                time = 0
            },800)
        }

        function onlyText(s) {
            const pattern = /^\*[^*]+\*$/;
            return pattern.test(s);
        }
    }
    sendMessage() {
        gtag("event", "click_aigirlfriend_send")
        this.AiHello()
        const $userInputMsg = $("#userInputMsg")
        let message = $userInputMsg.val()
        if(!message || /^\s*$/.test(message)) return false
        message = message.replace(/[(（](.*?)[)）]/g, '*$1*');

        let data = {
            ...this.connectMsg,
            "chat_content": message,
            "request_type": 20,
            "chat_action": ""
        }

        try {
            let newMyMsgDom = $('#myMessageBox')
            this.showMessage(newMyMsgDom,message,'.my-message-container')

            if (SOCKET.readyState === WebSocket.OPEN) {
                SOCKET.send(JSON.stringify(data));
            } else if(SOCKET.readyState === WebSocket.CLOSED){
                this.disconnectMessage = JSON.stringify(data)
                this.connectChatting(this.socketUrl)
            }else{
                this.disconnectMessage = JSON.stringify(data)
            }
        } catch (e) {
            console.warn(e);
            this.disconnectMessage = JSON.stringify(data)
        }

        let height
        window.innerWidth < 1200 ? height = ".88rem" : height = "46px"
        $userInputMsg.css('height',height)

        this.lastMessage = JSON.stringify(data)
        $userInputMsg.val("")
        $(".send-btn").addClass("disable")

        // this.setChatHistory(this.aiData.id,"user",message)
    }

    /**
     * 保存角色名字、头像背景信息
     * @returns {Promise<void>}
     */
    async saveCharacter() {
        gtag("event", "save_aigirlfriend_changephoto")
        // let error = $Popup({type: "error",errorType: "network"})
        const $characterNameInput = $("#characterNameInput")
        $characterNameInput.prop("disabled", true);

        function isBlob(obj) {
            return obj instanceof Blob;
        }
        let obj = {
            changeAvatar: "aiAvatarImg",
            changeBg: "bgImg"
        }
        let uploadObj = {
            changeAvatar: "head_portrait",
            changeBg: "head_portrait_background"
        }
        let uploadUrl

        const name = $characterNameInput.val() + ""

        let uploadData = {
            role_id :  this.aiData.role_id,
            my_characters_id: this.aiData.is_my_characters === 1 ? this.aiData.my_characters_id : 0,
            name: name.trim(),
            // type: this.aiData.type,
            is_draft: 2,
            tag: this.aiData.json.tag ?? '',
            persona: this.aiData.persona ?? '',
            gender: this.aiData.json.gender ?? '',
            description: this.aiData.json["Character_des"],
            scene: this.aiData["role_content"]["scene description"],
            greeting: this.aiData["role_content"].greeting,
            context: this.aiData["role_content"].context,
            chat_id: this.connectMsg.chat_id,
            head_portrait_background: !this.uploadbg
              ? "[]"
              : JSON.stringify(this.aiData.head_portrait_background)
        }

        try {
            let resKey
            this.changePopup.loading.start()
            for(let key in this.uploadBlob) {
                if(isBlob(this.uploadBlob[key])) {
                    await fetchPost(
                        "ai/source/get-upload-url",
                        {file_name: `${key}.png`},
                    ).then(res=> {
                        uploadUrl = res.data.upload_url
                        resKey = res.data.key
                        this[obj[key]] = res.data['access_url']
                        if(obj[key] === "bgImg") {
                            // this.bgImg =
                            this.aiData.head_portrait_background = []
                            this.aiData.head_portrait_background.push({
                                key: "head_portrait_background",
                                url: res.data['access_url'],
                                value: resKey
                            })
                        } else {
                            this.aiData["changeAvatarUrl"] = res.data['access_url']
                        }
                    }).catch(_ => {
                        $Popup({
                            type: "error",
                            errorType: "network",
                            });
                    });



                    await fetchPut(uploadUrl,this.uploadBlob[key]).then(res=> {
                        if(res === 200) {
                            uploadData[uploadObj[key]] = JSON.stringify([{key: uploadObj[key], value: resKey}])
                        }
                    })



                }
            }
            //上传图片
            if(uploadData.head_portrait_background === undefined && !this.aiData.head_portrait_background[0]?.url)
                uploadData['head_portrait_background'] = "[]"

            if(uploadData.head_portrait === undefined) uploadData['head_portrait'] = JSON.stringify(this.aiData.head_portrait)

            if(getUrlVal("avatarKey")) {
                let url = atob(getUrlVal("headAvatar"))
                let avatarKey = atob(getUrlVal("avatarKey"))
                let head = JSON.parse(uploadData.head_portrait)
                if(head[0].value === url) {
                    head[0].value = avatarKey
                    head[0].is_temp = 1
                    delete head[0].url
                    uploadData['head_portrait'] = JSON.stringify(head)
                }
            }

            const res = await fetchPost("chat/user/role-edit",uploadData)
            if(res.code === 401){
                this.closeChat()
                return
            }
            if(res.code !== 200) {
                $Popup({
                    type: "error",
                    errorType: "normal",
                })
                setTimeout( ()=> {
                    $(".error").find("button").text("OK")
                },10)
                $("#characterNameInput").prop("disabled", false);
                this.changePopup.loading.end()
                return
            }
            this.aiData.name = uploadData.name
            this.aiData.head_portrait = JSON.parse(uploadData.head_portrait)
            this.aiData.head_portrait[0]["url"] = this.aiData.changeAvatarUrl
            this.aiData['is_my_characters'] = 1
            if(this.isMyCharacterStatus === 2) this.aiData["toMyCharacter"] = true
            this.aiData['my_characters_id'] = res.data.my_characters_id
            this.aiData.role_id = res.data.role_id
            this.aiData.status = 2
            if(uploadData.head_portrait_background === "[]") {
                this.bgImg = ""
                this.aiData.head_portrait_background = []
            }
            let container = $('.chatting-container');
            container.scrollTop(container.prop('scrollHeight') - container.height() - 10)
            // this.getAiInfo(this.aiData.id,this.aiData['is_my_characters'],this.aiData['my_characters_id'])
            this.changePopup.close()

            if(!this.aiData.head_portrait[0].url) this.aiData.head_portrait[0].url = this.aiAvatarImg
            this.updateCharacter()

            $("#characterNameInput").prop("disabled", false);
            this.changePopup.loading.end()
            this.aiData.name = uploadData.name
            this.changeBgAvatar()

            const newInfo = await this.getAiDetails(this.aiData.role_id,this.aiData.is_my_characters,this.aiData.my_characters_id)
            for (const key in newInfo) {
                if (newInfo.hasOwnProperty(key) && (!this.aiData[key] || !this.unChangeKeyList.includes(key))) {
                    this.aiData[key] = newInfo[key];
                }
            }
            this.updateCharacter()
        } catch (e) {
            this.errorPopup.show()
            setTimeout( ()=> {
                $(".error .closeModal").text("OK")
            },10)
            $(".error .closeModal").off("click").on('click', ()=> {
                this.errorPopup.close()
            });
            $(".error .title-right").off("click").on('click', ()=> {
                this.errorPopup.close()
            });

            this.changePopup.loading.end()
        }




    }

    loginPopup = null
    showLoginPopup(fn=function () {}) {
        if(this.loginPopup) return false
        $("#userInputMsg").trigger('blur');
        if(!getCookie('access_token')) {
            gtag("event", "alert_aigirlfriend_loginwin")
            this.loginPopup =$Popup({
                title: gfChattingLan.loginTitle,
                content: gfChattingLan.loginContent,
                closeBtn: gfChattingLan.loginBtn,
                otherBtns: gfChattingLan.loginOtherBtn,
                exist: gfChattingLan.loginExist,
                addBorderRadius: true,
                onClose: ()=> {
                    this.loginPopup = null
                    gtag("evet","login_aigirlfriend_loginwin")
                    showLoginWindow({
                        fn: () => {
                            gtag("evet","succ_aigirlfriend_loginwin")
                            chatLogin();
                        },
                    });
                }
            })
            const _this = this
            $(".login-popup-close-btn,.title-right").off("click").on('click', function() {
                $(this).attr("class") === "title-right" ? gtag("evet","close_aigirlfriend_loginwin") : gtag("evet","notnow_aigirlfriend_loginwin")
                _this.loginPopup.close()
                _this.loginPopup = null
                if($(this).attr("class") === "login-popup-close-btn") fn()
            })
        } else {
            fn()
        }
    }
    changeBgAvatar() {
        let that = this
        $('.aiAvatarImg').each(function() {
            $(this).attr('src', that.aiAvatarImg);
        });

        $('.ai-name').each(function() {
            $(this).text(that.aiData.name);
        });


        let img = new Image()
        img.onload = function() {
            let bgImg = that.bgImg || that.aiAvatarImg

            that.ratio = this.width / this.height;
            that.ratio.toFixed(2) > 1 ? that.boxPosition.changeBtnMiddle.chatBgImg.left = 0 : that.boxPosition.changeBtnMiddle.chatBgImg.left = "calc(50% - 661px / 2)"
            const $chatBgImg = $("#chatBgImg")
            that.ratio.toFixed(2) > 1
              ? $chatBgImg.css({"width":"100vw","left": "0px"})
              : $chatBgImg.css({"width":"661px","left": that.boxPosition[that.currentPosition || "changeBtnMiddle"].chatBgImg.left});
            $(".chat-bg-img, .ai-chat-box").css("background-image",`url("${bgImg}")`)
        }
        img.src = this.bgImg || that.aiAvatarImg
    }
    hideShowImgBox(bindId,action) {
        let obj = {
            avatarImgBox: {
                id:"#avatarText",
                iconId: "#avatarIcon",
                imgUrlObj: "uploadAvatar",
                blob: "changeAvatar",
                showFn: ()=> {
                    gtag("event", "upload_aigirlfriend_avatar")
                    this.uploadAvatarChange = true
                    if($("#characterNameInput").val().length > 0) this.changePopup.enableCloseBtn()
                },
                hideFn: ()=> {
                    this.uploadAvatarChange = false
                    this.changePopup.disableCloseBtn()
                    gtag("event", "del_aigirlfriend_avatar")
                }
            },
            bgImgBox: {
                id:"#bgText",
                iconId: "#bgIcon",
                imgUrlObj: "uploadBg",
                blob: "changeBg",
                showFn: ()=> {
                    gtag("event", "upload_aigirlfriend_bg")
                    this.uploadbg = true
                },
                hideFn: ()=> {
                    // this.uploadStatus = true
                    // gtag("event", "del_aigirlfriend_bg")
                    this.uploadbg = false
                }
            }
        }

        let id = "#" + bindId


        let fn = {
            hide:()=> {
                $(id).hide()
                $(obj[bindId].id).text(gfChattingLan.changePopBtnSpanSet)
                $(obj[bindId].iconId).attr("src","/dist/img/ai-chatting/btn_add_small.png")
                this[obj[bindId].imgUrlObj] = false
                this.uploadBlob[obj[bindId].blob] = {}
                obj[bindId].hideFn()
            },
            show: ()=> {
                $(id).show()
                $(obj[bindId].id).text(gfChattingLan.changePopBtnSpanAddNew)
                this[obj[bindId].imgUrlObj] = true
                $(obj[bindId].iconId).attr("src","/dist/img/ai-chatting/btn_add_normal.png")
                obj[bindId].showFn()
            }
        }

        fn[action]()

    }
    openChangeHandle() {
        let that = this
        let domFn
        this.uploadStatus = false


        this.changePopup = $Popup({
            title: gfChattingLan.changePopTitle,
            content: `<div class="change-photo-box">
          <div class="change-avatar-box">
             <div>${gfChattingLan.changePopName}</div>
             <div class="name-input-box">
             <input type="text" id="characterNameInput" maxlength="100">
           </div>
            <div>${gfChattingLan.changePopAvatar}</div>
            <div class="avatar-box">
              <div class="avatar-img changeAvatarImg" id="avatarImgBox">
                <img src="/dist/img/ai-chatting/btn_close_small.png" id="closeAvatarIcon" class="close-icon" bindId="avatarImgBox"/>

                <img src="" alt="" id="changeAvatarImg" class="changeAvatarImg" />
              </div>
              <div class="replace-img-btn" id="changeAvatarId" fn="changeAvatar">
                <div class="replace-btm-container">
                  <img src="dist/img/ai-chatting/btn_add_normal.png" alt="" id="avatarIcon" class="img-icon" />
                  <div class="change-btn-text" id="avatarTextBox">${gfChattingLan.changePopBtn}</div>
                </div>
              </div>             
            </div>
            
              <div class="avatar-tip-box">
                <img src="/dist/img/ai-chatting/icon_tip.png">
                <span class="tip-text" id="avatarTip">${gfChattingLan.changePopSupport}</span>
              </div>

            <div class="change-bg-title">${gfChattingLan.changePopBgDesc}</div>
            <div class="change-bg-sub">${gfChattingLan.changePopRecommend}</div>
            <div class="avatar-box">
              <div class="avatar-img" id="bgImgBox">
                <img src="/dist/img/ai-chatting/btn_close_small.png" id="closeBgIcon" class="close-icon" bindId="bgImgBox"/>
                <img src="" alt="" id="changeBgImg" class="changeBgImg" />
              </div>
              <div class="replace-img-btn" id="changeBgId" fn="changeBg">
                <div class="replace-btm-container">
                  <img src="dist/img/ai-chatting/btn_add_normal.png" alt="" id="bgIcon" class="img-icon" />
                  <div  class="change-btn-text" id="bgTextBox">${gfChattingLan.changePopBgBtn}</div>
                </div>
              </div>
            </div>
            
            <div class="bg-tip-box">
                <img src="/dist/img/ai-chatting/icon_tip.png">
                <span class="tip-text" id="bgTip">${gfChattingLan.changePopBgSupport}</span>
           </div>

            <input type="file" name="file" id="fileInput" style="display: none"   accept="image/jpeg, image/png, image/webp">
          </div>
        </div>`,
            closeBtn: gfChattingLan.changePopCloseBtn,
            otherBtns: gfChattingLan.changePopOtherBtn,
            autoClose:false,
            topCloseFn: function () {
                this.uploadBlob = {
                    changeAvatar: {},
                    changeBg: {}
                }
                that.uploadStatus = false
                gtag("event", "close_aigirlfriend_changephoto")
            },
            onClose: ()=> {

                this.uploadStatus ?this.saveCharacter() : this.changePopup.close();
            },
            exist: 'change'
    });




        $("#changeOtherBtn").off("click").on('click',()=> {
            this.uploadBlob = {
                changeAvatar: {},
                changeBg: {}
            }

            gtag("event", "discard_aigirlfriend_changephoto")
            that.uploadStatus = false;
            this.changePopup.close()
        })





        $("#characterNameInput").val(this.aiData.name)

        $('#characterNameInput').off("input").on('input', function() {
            let maxLength = 50;
            let text = $(this).val();

            let forbiddenChars = /[/*&\\%$#@]/g;
            if (forbiddenChars.test(text)) {
                $(this).val(text.replace(forbiddenChars, ''));
            }

            text = $(this).val();
            let textLength = text.length;

            if (textLength > maxLength) {
                $(this).val(text.substring(0, maxLength));
                textLength = maxLength;
            }

            that.uploadStatus = true
            if(textLength === 0) {
                that.changePopup.closeButton.disable()
            } else if(that.uploadAvatarChange){
                that.changePopup.closeButton.enable()
            }

        });

        this.aiAvatarImg ? $("#changeAvatarImg").attr("src",this.aiAvatarImg) :that.hideShowImgBox('avatarImgBox','hide')
        const $changeBgImg = $("#changeBgImg")
        this.aiData.head_portrait_background.length && this.bgImg
            ? $changeBgImg.attr("src",this.bgImg)
            : that.hideShowImgBox('bgImgBox','hide')

        $changeBgImg.attr("src",this.bgImg)


        //每次打开时需要重新绑定，在bindEvent绑定关闭popup会失效



        // --------------------
        $("#closeAvatarIcon,#closeBgIcon").off("click").on('click',function () {
            that.uploadStatus = true
            let bindId = $(this).attr("bindId")
            if(bindId === "bgImgBox") gtag("event","del_aigirlfriend_bg")
            that.hideShowImgBox(bindId,"hide")
        })
        // --------------------



        $(".replace-img-btn").off("click").on('click', function () {
            domFn = $(this).attr("fn")
            $("#fileInput").trigger('click')
        })

        $("#fileInput").off("change").on("change",async function () {
            let imgBlob


            const errorDom = {
                changeAvatar: {
                    text: '#avatarTip',
                    box: '.avatar-tip-box'
                },
                changeBg: {
                    text: '#bgTip',
                    box: '.bg-tip-box'
                },
            }
            const domIcon = {
                changeAvatar: {
                    icon: "#avatarIcon",
                    text: "#avatarTextBox"
                },
                changeBg:{
                    icon: "#bgIcon",
                    text: "#bgTextBox"
                }
            }

            let loadingId = domIcon[domFn].icon
            let loadingText = domIcon[domFn].text
            let domBox = errorDom[domFn].box
            let domText = errorDom[domFn].text

            let loadingStart = ()  => {
                $(loadingId).attr("src", "/dist/img/ai-chatting/icon_loading.svg")
                $(loadingId).addClass("popup-loading")
                $(loadingText).html(gfChattingLan.changePopUploading)

            }

            let loadingEnd = () => {
                $(loadingId).removeClass("popup-loading")
                $(loadingId).attr("src", "dist/img/ai-chatting/btn_add_normal.png")

                let originText = {
                    changeAvatar: gfChattingLan.changePopBtn,
                    changeBg: gfChattingLan.changePopBgBtn,
                }
                $(loadingText).html(originText[domFn])
            }


            const fn = {
                changeAvatar: (url)=> {
                    const img = new Image();
                    img.onload = function() {
                        const height = this.naturalHeight;
                        const width = this.naturalWidth;
                        if (height < 32 || width < 32) {
                            $("#avatarTip").text(gfChattingLan.changePopAvatarError)
                            $(".avatar-tip-box").css("visibility","visible")
                        } else {
                            that.uploadStatus = true
                            $(".changeAvatarImg").attr("src",url)
                            that.hideShowImgBox(bindBox[domFn],"show")
                        }
                    }
                    img.src = URL.createObjectURL(imgBlob);
                    $(domBox).css("visibility", "hidden");
                },
                changeBg: (url)=> {
                    const img = new Image();
                    img.onload = function() {
                        const height = this.naturalHeight;
                        const width = this.naturalWidth;

                        if (height < 128 || width < 128) {
                            $("#bgTip").text(gfChattingLan.changePopBgError)
                            $(".bg-tip-box").css("visibility","visible")
                        } else {
                            that.uploadStatus = true
                            that.bgImg = url
                            $(".changeBgImg").attr("src",that.bgImg)
                            that.hideShowImgBox(bindBox[domFn],"show")
                        }
                    };
                    img.src = URL.createObjectURL(imgBlob);
                    $(domBox).css("visibility", "hidden");

                }
            }
            // 显示的盒子dom
            let bindBox = {
                changeAvatar: "avatarImgBox",
                changeBg: "bgImgBox"
            }

            let file = this.files[0];
            const suffix = file.name.split('.').pop().toLowerCase()

            if (
              (!/^(image\/(jpg|jpeg|png|webp))$/.test(file.type)) ||
              (!/^jpg|jpeg|png|webp$/.test(suffix))
            ) {
                $(domText).text(gfChattingLan.changePopSupport)
                $(domBox).css("visibility","visible")
                $(this).val(null);
                return false
            }



            // 图片大小验证
            if (file?.size > 100 * 1024 * 1024) {
                $(domText).text(gfChattingLan.changePopMaxError)
                $(domBox).css("visibility","visible")
                $(this).val(null);
                return false
            }

            // 图片上传loading效果
            loadingStart()


            let {blog} = await resizeImageByFile(file)

            if(blog) {
                let url = URL.createObjectURL(blog)
                that.uploadBlob[domFn] = blog
                imgBlob = blog
                fn[domFn](url)
            } else {
                $(domText).text(gfChattingLan.changePopSupport)
                $(domBox).css("visibility","visible")
            }
            $(this).val(null);

            // loading结束
            loadingEnd()
        })
    }

    async getAiInfo(roleId,isMyCharacter,my_characters_id) {
        return new Promise( async (resolve, reject) => {
            let url = `chat/user/get-role-info?id=${roleId}&is_my_characters=${isMyCharacter}`
            if(isMyCharacter === 1) url += `&my_characters_id=${my_characters_id}`
            await fetchGet(url).then(res=> {
                res.code === 200 ? this.init(res.data) : $Popup({type:"error",errorType:"normal",addBorderRadius: true})
                if(res.code !== 200) console.error(res.data.message,"get-role-info")
                resolve()
            })
        })
    }

    getAiDetails(roleId,isMyCharacter,my_characters_id) {
        return new Promise( async (resolve, reject) => {
            let url = `chat/user/get-role-info?id=${roleId}&is_my_characters=${isMyCharacter}`
            if(isMyCharacter === 1) url += `&my_characters_id=${my_characters_id}`
            await fetchGet(url).then(res=> {
                res.code === 200 ? resolve(res.data) : $Popup({type:"error",errorType:"normal",addBorderRadius: true})
                if(res.code !== 200) console.error(res.data.message,"get-role-info")
            })
        })
    }

}

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', options);
    return `Created ${formattedDate}`;
}


function getUrlVal(val) {
    const url = window.location.href;
    if(!url.includes("?")) return false
    const queryString = url.split('?')[1];
    const queryParams = queryString.split('&');
    const params = {};
    queryParams.forEach(function(param) {
        const keyValue = param.split('=');
        const key = decodeURIComponent(keyValue[0]);
        params[key] = decodeURIComponent(keyValue[1]);
    });

    return params[val];
}

/**
 * 解决IOS textarea placeholder 消失问题
 */
if (!('placeholder' in document.createElement('input'))) {
    $('input[placeholder],textarea[placeholder]').each(function () {
        var that = $(this),
            text = that.attr('placeholder');
        if (that.val() === "") {
            that.val(text).addClass('placeholder');
        }
        that.focus(function () {
            if (that.val() === text) {
                that.val("").removeClass('placeholder');
            }
        }).blur(function () {
            if (that.val() === "") {
                that.val(text).addClass('placeholder');
            }
        }).closest('form').submit(function () {
            if (that.val() === text) {
                that.val('');
            }
        });
    });
}

$(function(){
    // console.log(`%cCurrent version: V${currentVersion}`, 'color: red;font-size: 24px;font-weight: bold;text-decoration: underline;')

    // // let data = {"id":211,"role_id":211,"name":"Julie","json":{"tag":"drama,gender:Female","Created":"Created Dec 24, 2023","Character_des":"You always had a thing for Marianabut she has a boyfriend so youdecided to be just friends. Yourcollege friend Mariana is goingthrough a bad argument between hisboyfriend. Looking for comfort, shecomes over to your apartmentcrying.","head_portrait":"","Character_name":"Wolf girl stepmom","Character_author":"by Mitchell"},"like_num":12,"msg_num":148,"type":1,"head_portrait":[{"kay":"head_portrait","value":"https://static.vidnoz.com/ai_girlfriend/Kaida.jpeg","url":"https://static.vidnoz.com/ai_girlfriend/Kaida.jpeg"}],"my_characters_id":0,"head_portrait_background":[],"is_like":2,"is_my_characters":2,"chat_id":""}
    // window.aiChatting = new AiGirlfriendTalking()
    // let shareId = getUrlVal("openShare")
    // // let isMyCharacter
    // // let headAvata =  getUrlVal("headAvatar")
    // if(shareId) aiChatting.getAiInfo(shareId,2,"")

})
