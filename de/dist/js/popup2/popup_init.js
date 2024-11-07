//Poppy -window component packaging
var toolParams = {};
function ToolTip(params) {
  // console.error("tooltip");
  //Close 0 means removal element (remain) 1 indicates the closure element (display: none)
  let { title = "", type = "", content = "", btn = "", progressType = "", close = 0, contentClass="" } = params;
  if (type === "progress") {
    toolParams = params;
  }

  let length = document.getElementsByTagName("popup-lite2").length;
  type === "progress" ? (close = 1) : (close = 0);

  if (length > 0) {
    let popup = document.getElementById("mio_popup");
    if (popup.getAttribute("close") === "1" && close === 1) {
      popup.style.display = "block";
      return;
    } else {
      popup.removePopup()
    }
  }
  $("body").append(`
    <popup-lite2
      id="mio_popup"
      type="${type}"
      popup_title="${title}"
      content="${content}"
      close="${close}"
      btn="${btn}"
      progressType="${progressType}"
      contentClass="${contentClass}"
      >
    </popup-lite2>`);
  tooltipSupply(params);
  setTimeout(() => {
    toBindEvent(params);
  }, 50);
}

function ToolTips(params) {
  // console.error("tooltip");
  //Close 0 means removal element (remain) 1 indicates the closure element (display: none)
  let { title = "", type = "", content = "", btn = "", progressType = "", close = 0, contentClass="" } = params;
  if (type === "progress") {
    toolParams = params;
  }

  let length = document.getElementsByTagName("popup-lite2").length;
  type === "progress" ? (close = 1) : (close = 0);

  if (length > 0) {
    let popup = document.getElementById("mio_popup");
    if (popup.getAttribute("close") === "1" && close === 1) {
      popup.style.display = "block";
      return;
    } else {
      popup.removePopup()
    }
  }
  $("body").append(`
    <popup-lite2
      id="mio_popup"
      type="${type}"
      popup_title="${title}"
      content="${content}"
      close="${close}"
      btn="${btn}"
      progressType="${progressType}"
      contentClass="${contentClass}"
      >
    </popup-lite2>`);
  tooltipSupply(params);
  setTimeout(() => {
    toBindEvent(params);
  }, 50);
}

//Register to click OK button and the CLOSE button event
function toBindEvent(params) {
  let { type = "", callback = () => {} } = params;
  let popupBox = document.querySelector(".mio_popup");
  let popup = document.getElementById("mio_popup");
  popupBox.querySelector(".popup_close").onclick = function () {
    if (type === "progress") {
      popup.style.display = "none";
    } else {
      popup.removePopup().then(async () => {
        await callback();
      });
    }
  };
  popupBox.querySelector(".popup_btn").onclick = function () {
    if (type === "progress") {
      popup.style.display = "none";
    } else {
      popup.removePopup().then(async () => {
        await callback();
      });
    }
  };
}
//Use fetch to listen to download
function downloadFetch(url, name, sucessCallback, failedCallback, NoExistCallback) {
  fetch(url, {
    method: "GET",
    // mode: 'no-cors',
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch the resource. Status: " + response.status);
      }
      const contentLength = response.headers.get("Content-Length");
      const total = parseInt(contentLength, 10);
      let loaded = 0;
      const reader = response.body.getReader();
      return new ReadableStream({
        start(controller) {
          function pump() {
            return reader.read().then(({ done, value }) => {
              if (done) {
                controller.close();
                return;
              }
              loaded += value.length;
              const progress = Math.round((loaded / total) * 100);
              // barDom.style.width = `${progress}%`;
              if (progress < 100) {
                $(".popup_progress").attr("style", `width:${progress}%`);
                // showPop({
                //   type: "success",
                // });
              }
              controller.enqueue(value);
              return pump();
            });
          }
          return pump();
        },
      });
    })
    .then((stream) => new Response(stream))
    .then((response) => response.blob())
    .then((blob) => {
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = name;
      a.click();
      URL.revokeObjectURL(blobUrl);
      a.remove();
      sucessCallback();
    })
    .catch((error) => {
      console.log(error, "error");
      if (error.message.includes("404")) {
        NoExistCallback();
      } else {
        failedCallback();
      }
    });
}

//Download pop -up window supplement
function tooltipSupply(params) {
  let {
    type = "",
    progressType = "",
    url = "",
    name = "",
    clickHereClassname = "#mio_popup .downloadRepeat",
    clickHereFn = ()=>{},
    sucessCallback = ()=>{},
    failedCallback = ()=>{},
    NoExistCallback = ()=>{},
  } = params;
  if (progressType === "fetch") {
    downloadFetch(url, name, sucessCallback, failedCallback, NoExistCallback);
  }
  //If there are repeated downloads and use
  if (type === "success") {
    let span = document.querySelector(clickHereClassname);
    if (!span) return;
    span.addEventListener("click", function () {
      clickHereFn?.(span);
      ToolTip(toolParams);
    });
  }
}

//Use fetch to download
// ToolTip({
//   type: "progress",
//   content: combinerLanArr.downloadText,
//   progressType: "fetch",
//   url: res.data.url,
//   name: "vidnoz_Image_Combiner.png",
//SucessCallback, // Successful callback function
//failedCallback, // Failureback function
//NoexistCallback // The server recovers function after the server fails
// });

//Tooltip failed
// ToolTip({
//   type: "error",
//   title: combinerLanArr.failedTitle,
//   content: combinerLanArr.DownloadFileNoExist,
//   btn: combinerLanArr.OK,
//   callback:callback
// });

//Tooltip success
// ToolTip({
//   type: "success",
//   title: combinerLanArr.DownloadSuccess,
//   content: combinerLanArr.DownloadSuccessText,
//   btn: combinerLanArr.OK,
//   callback:callback
// });

//Tooltip fake inlet bar
// ToolTip({
//   type:"progress",
//   content:combinerLanArr.downloadText
// })

