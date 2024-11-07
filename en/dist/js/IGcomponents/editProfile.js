
function initProFile () {
  const that = this;
  var jsonIGpopup = jsonData.IGpopup.editUser;
  this.clearUserData = () => {
    $(".erorrTip[data-type='editUser_lastName']").css("visibility", "hidden");
    $(".erorrTip[data-type='editUserAvatar']").css("visibility", "hidden");
    $(".erorrTip[data-type='editUser_firstName']").css("visibility", "hidden");
    $(".select_content").text(jsonIGpopup.classifySelect.All);
    this.editUser_Avatar = "";
    this.editUserAge = 0;
    this.editUser_firstName = "";
    this.editUser_lastName = "";
    this.isUploadUserAvatar = false;
  }
  this.userInfoUpdate = async (callback, errorCallback) => {
    let head_portrait = "";
    if (this.isUploadUserAvatar) {
      const file = this.editUser_Avatar;
      const formData = new FormData();
      formData.append("file", file);

      await fetchPostNormal("file-upload", formData, interHost, {})
        .then((res) => {
          if (res.code != 200) {
            errorCallback?.();
            $Popup({
              title: jsonIGpopup.failedMsg.normalTitle,
              content: jsonIGpopup.errorDesc,
              type: "error",
            });
          } else {
            head_portrait = res.data.url;
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
    let setProfile = {
      head_portrait: head_portrait ? head_portrait : this.editUser_Avatar,
      first_name: this.editUser_firstName,
      last_name: this.editUser_lastName,
      age: this.editUserAge,
    };
    fetchPostNormal("api/user/set-user-info", setProfile, interHost)
      .then((res) => {
        if (res.code != 200) {
          errorCallback?.();
          $Popup({
            title: jsonIGpopup.failedMsg.normalTitle,
            content: jsonIGpopup.errorDesc,
            type: "error",
          });
        } else {
          console.log(res, "res");
          callback?.();
        }
      })
      .catch((error) => {
        console.error(error);

        errorCallback?.();
        $Popup({
          title: jsonIGpopup.failedMsg.normalTitle,
          content: jsonIGpopup.failedMsg.generateError,
          type: "error",
        });
      });
  }
  
  this.getUserData = () => {
    if (getCookie("user_info")) {
      const email = JSON.parse(getCookie("user_info"))["email"];
      $(".editUser_email").val(email);
    }
    fetchPostNormal("api/user/get-profile", {}, interHost)
      .then((res) => {
        if (res.code == 200) {
          $(".editUser_email").val(res.data.email);
          if (res.data.head_portrait) {
            $(".editUser #edit_user_avatar").attr("src", res.data.head_portrait);
            $(".editUser .avatar").addClass("has");
          }
          $(".editUser_lastName").val(res.data.last_name);
          this.editUser_Avatar = res.data.head_portrait;
          this.editUser_lastName = res.data.last_name;
          let name = res.data.first_name + res.data.last_name;
          if (ttsBlank(name)) {
            this.editUser_firstName = res.data.email.split("@")[0];
          } else {
            this.editUser_firstName = res.data.first_name;
          }
          $(".editUser_firstName").val(this.editUser_firstName);
          this.editUserAge = res.data.age;
          $(".modal.editUser .addImage span").text(jsonIGpopup.avatar_btnSet);
          $(".select_content").text(res.data.age);
        }
      })
      .catch(() => {
        console.error("get user data error");
      });
  }
  
  this.inputCharacter = (that, maxlength, type) => {
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
  this.clickUserEvent = () => {
    const that = this;
    $(".editUser_firstName,.editUser_lastName,.chatSelect,.select_list_item, .delete_image").off();
    $(".editUser_firstName").on("input", function () {
      const res = that.inputCharacter($(this), 30, "editUser_firstName");
      that.editUser_firstName = res;
    });
    $(".editUser_lastName").on("input", function () {
      const res = that.inputCharacter($(this), 30, "editUser_lastName");
      that.editUser_lastName = res;
    });
    $(".chatSelect").on("click", function () {
      const dom = $(this);
      const isActive = dom.hasClass("active");
      if (!isActive) {
        dom.children(".select_list").slideDown();
        dom.addClass("active");
        dom.siblings(".chatSelect").children(".select_list").slideUp();
      } else {
        dom.children(".select_list").slideUp();
        dom.removeClass("active");
      }
    })
    $(".select_list_item").on("click", function () {
      const target = $(this);
      target.addClass("active");
      target.siblings(".select_list_item").removeClass("active");
      target.parents(".select_list").siblings(".select_content").text(target.text());
      that.editUserAge = target.data("age");
    })
    $(".delete_image").on("click", function (e) {
      that.editUser_Avatar = "";
      $(".modal #edit_user_avatar").attr("src", "");
      $(".modal .avatar").removeClass("has");
    })
  }
  this.checkFileType = (file, type) => {
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
  this.uploadImage = async (parent, e, that, type, callback) => {
    const res = this;
    if (!e.target.files || !e.target.files[0]) {
      console.log("there is no file");
      callback?.();
      return;
    }
    let file = that.files[0];
    if (!this.checkFileType(file)) {
      parent.siblings(".erorrTip").find(".image_error").text(jsonIGpopup.imageNoSupported);
      parent.siblings(".erorrTip").css("visibility", "visible");
      $(that).val(null);
      callback?.();
      return false;
    }
    if (file?.size > 100 * 1024 * 1024) {
      parent.siblings(".erorrTip").find(".image_error").text(jsonIGpopup.imageSizeError);
      parent.siblings(".erorrTip").css("visibility", "visible");
      $(that).val(null);
      callback?.();
      return false;
    }
    let { blog } = await resizeImageByFile(file);
    let url = URL.createObjectURL(blog);
    var img = new Image();
    img.src = url;
    console.log(url, "url");
    img.onload = function () {
      var height = this.naturalHeight;
      var width = this.naturalWidth;
      if (type === "background") {
        if (height < 128 || width < 128) {
          parent.siblings(".erorrTip").find(".image_error").text(jsonIGpopup.backGround_Error);
          parent.siblings(".erorrTip").css("visibility", "visible");
          return false;
        } else {
          res.mc_Background = file;
          $("#createMC_background_img").attr("src", url);
        }
      } else {
        if (height < 32 || width < 32) {
          parent.siblings(".erorrTip").find(".image_error").text(jsonIGpopup.avatar_error);
          parent.siblings(".erorrTip").css("visibility", "visible");
          return false;
        } else {
          if (type == "avatar") {
            res.mc_Avatar = file;
            $("#createMC_avatar_img").attr("src", url);
          } else {
            res.editUser_Avatar = file;
            $(".editUser #edit_user_avatar").attr("src", url);
          }
        }
      }
      parent.siblings(".erorrTip").css("visibility", "hidden");
    };
    img.error = function () {
      console.log("Error image loading");
    };
    callback?.();
  }
  $("#editUserAvatar").on("change", function (e) {
    that.isUploadUserAvatar = true;
    that.uploadImage($(".modal.editUser .avatar"), e, this, "editAvatar", () => {
      $(this).val("");
      $(".modal.editUser .image_item").show();
      $(".modal.editUser .addImage span").text(jsonIGpopup.avatar_btnAdd);
    });
  });
}