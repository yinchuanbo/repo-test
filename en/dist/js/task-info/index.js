import jsonData from '/dist/lan/es6.js'

class taskInfo extends HTMLElement {
  constructor() {
    super()
    this.aimItem = "";
    this.taskId = "";
    this.sizeList = {
      "512X512": "512X512 [1 : 1]",
      "384X512": "384X512 [3 : 4]",
      "288X512": "288X512 [9 : 16]",
      "512X384": "512X384 [4 : 3]",
      "512X288": "512X288 [16 : 9]",
      "768X768": "768X768 [1 : 1]",
      "576X768": "576X768 [3 : 4]",
      "432X768": "432X768 [9 : 16]",
      "768X576": "768X576 [4 : 3]",
      "768X432": "768X432 [16 : 9]",
      "1024X1024": "1024X1024 [1 : 1]",
      "768X1024": "768X1024 [3 : 4]",
      "576X1024": "576X1024 [9 : 16]",
      "1024X768": "1024X768 [4 : 3]",
      "1024X576": "1024X576 [16 : 9]",
    };
    this.callBack = null;
  }

  connectedCallback() {
    this.toRunHtml();

    setTimeout(() => {
      this.firstUpdated();
      this.toBindEvent();
      this.toBindCss();
    }, 10)
  }

  firstUpdated() {
    this.shadowRootEl = this.querySelector('.taskInfoBox');
  }

  toBindCss() {
    const existingStyleTag = document.querySelector('style[data-component="task-info"]');
    if (existingStyleTag) {
      return;
    }

    const link = document.createElement('link');
    link.dataset.component = 'task-info';
    link.rel = 'stylesheet';
    link.href = "/dist/js/task-info/task-info.css";
    document.head.appendChild(link);
  }

  toBindEvent() {
    this.shadowRootEl.addEventListener('click', (e) => {
      if(e.target.className === "taskInfoBox"){
        this.hideOverlay();
      }

      let _key = e.target.getAttribute('data-key');
      switch (_key){
        case 'close':
          this.hideOverlay();
          break;
        case 'taskId':
          _$$.copyText(this.taskId);
          ToolTip({text: "Copied successfully"})
          break;
        case 'prompt':
          if(this.aimItem?.prompt.trim() === "") return false;
          _$$.copyText(this.aimItem?.prompt);
          ToolTip({text: "Copied successfully"})
          break;
        case 'negative_prompt':
          if(this.aimItem?.negative_prompt.trim() === "") return false;
          _$$.copyText(this.aimItem?.negative_prompt);
          ToolTip({text: "Copied successfully"})
          break;
        case 'remix':
          this.callBack&&this.callBack(this.aimItem);
          this.hideOverlay();
          break;
      }
    })
  }

  toRunHtml(isShow=false) {
    let _show = isShow ? 'display: flex' : '';
    let _img = this.aimItem?.model?.logo ? `<img class="modelImage" src="${this.aimItem?.model?.logo}" alt="">` : '';
    let _private = this.aimItem.display ? `<div class="privateItem">${lan.jsText20}</div>` : `<div class="privateItem private">${lan.jsText21}</div>`;
    this.innerHTML = `<div class="taskInfoBox" style="${_show}">
    <div class="taskInfoContentBox">
        <div class="taskInfoTitle">
            ${lan.jsText22}
            <div class="icon" data-key="close"></div>
        </div>
        <div class="taskInfoNoLoadingBox">
            <div class="labelItem">
             <div class="labelItemLeft">${lan.jsText23}</div>
             <div class="labelItemRight">
                ${this.taskId}
                <div class="copy" data-key="taskId"></div>
             </div>
         </div>
            <div class="labelItem">
             <div class="labelItemLeft">${lan.jsText24}</div>
             <div class="labelItemRight">
                ${_private}
             </div>
         </div>
            <div class="labelItem">
             <div class="labelItemLeft">Model</div>
             <div class="labelItemRight">
                ${_img}
                <div style="max-width: 100%;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;" title="${this.aimItem?.model?.name}">${this.aimItem?.model?.name}</div>
             </div>
         </div>
            <div class="labelItem">
             <div class="labelItemLeft">${lan.jsText25}</div>
             <div class="labelItemRight">
                ${this.aimItem?.quantity}
             </div>
         </div>
            <div class="labelItem">
             <div class="labelItemLeft">${lan.jsText26}</div>
             <div class="labelItemRight">
                ${this.sizeList[this.aimItem?.width+'X'+this.aimItem?.height]}
             </div>
         </div>
            <div class="labelItem">
             <div class="labelItemLeft" style="align-self: flex-start">
                ${lan.jsText27}
                <div class="copy MShow" data-key="prompt"></div>
             </div>
             <div class="labelItemRight">
                <div class="generationBox">
                    <span class="w100">${this.aimItem?.prompt || " "}</span>
                    <div class="copy pcShow" data-key="prompt"></div>
                </div>
             </div>
         </div>
            <div class="labelItem">
             <div class="labelItemLeft" style="align-self: flex-start">
                ${lan.jsText28}
                 <div class="copy MShow" data-key="negative_prompt"></div>
             </div>
             <div class="labelItemRight">
                <div class="generationBox">
                    <span class="w100">${this.aimItem?.negative_prompt || " "}</span>
                    <div class="copy pcShow" data-key="negative_prompt"></div>
                </div>
             </div>
         </div>
            <div class="remixBtn" data-key="remix">${lan.jsText29}</div>
        </div>
        <div class="taskInfoLoadingBox"></div>
    </div>
    </div>`;
  }

  showOverlay(item,taskId) {
    this.aimItem = item;
    this.taskId = taskId;
    this.shadowRootEl.querySelector('.taskInfoContentBox').classList.remove("loading")
    this.toRunHtml(true);
    setTimeout(() => {
      this.firstUpdated();
      this.toBindEvent();
    }, 10)
  }

  showLoading() {
    this.shadowRootEl.style.display = 'flex';
    document.body.classList.add('no-scroll');
    this.shadowRootEl.querySelector('.taskInfoContentBox').classList.add("loading")
  }

  hideOverlay() {
    this.shadowRootEl.style.display = 'none';
    document.body.classList.remove('no-scroll');
  }

  bindCallBack(callBack) {
    this.callBack = callBack;
  }

}

customElements.define('task-info', taskInfo);
