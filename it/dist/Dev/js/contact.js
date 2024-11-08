import {getHeaders} from "@js/api.js";
console.log("getHeaders", getHeaders());

let submit = false;
let maxCharacters = 500;
$(window).ready(function () {
  $("#content").on("input", function () {
    let text = $("#content").val();
    if (text.trim().length > maxCharacters) {
      $("#content").val(text.substring(0, maxCharacters));
    }
  });

  $(".submit").click(function () {
    if (submit) return;
    submit = true;
    let subject = $("#subject").val().trim();
    let email = $("#email").val();
    let content = $("#content").val().trim();

    let emailReg =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    const tip = jsonData.popupTip;
    if (subject == "") {
      let params = {
        title: tip.errorTitle,
        type: "error",
        content: tip.errorTextB,
        btn: tip.ok,
        callback: () => {
          submit = false;
        },
      };
      ToolTip(params);

      return;
    }
    if (!emailReg.test(email)) {
      let params = {
        title: tip.errorTitle,
        type: "error",
        content: tip.errorTextA,
        btn: tip.ok,
        callback: () => {
          submit = false;
        },
      };
      ToolTip(params);
      return;
    }
    if (content == "" || content.length < 20) {
      let params = {
        title: tip.errorTitle,
        type: "error",
        content: tip.errorTextMessage,
        btn: tip.ok,
        callback: () => {
          submit = false;
        },
      };
      ToolTip(params);
      return;
    }

    let data = { subject, email, content, action: "vidqu" };
    fetchPost("transmit-email", data, TOOL_API)
      .then((res) => {
        let params = {};
        if (res.code == 200) {
          params = {
            title: tip.sucessTitle,
            type: "success",
            content: tip.successText,
            btn: tip.ok,
            callback: () => {
              submit = false;
            },
          };
          $("#subject,#email,#content").val("");
        } else {
          params = {
            title: tip.errorTitle,
            type: "error",
            content: tip.errorTextC,
            btn: tip.ok,
            callback: () => {
              submit = false;
            },
          };
        }
        ToolTip(params);
      })
      .catch((err) => {
        let params = {
          title: tip.errorTitle,
          type: "error",
          content: tip.errorTextC,
          btn: tip.ok,
          callback: () => {
            submit = false;
          },
        };
        ToolTip(params);
        console.log(err, "error");
      });
  });
});
