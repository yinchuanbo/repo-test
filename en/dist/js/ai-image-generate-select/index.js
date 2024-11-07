import jsonData from '/dist/lan/es6.js'

class GenerateSelect extends HTMLElement {
  constructor() {
    super()
    this.isOpenItem = false;
    this.title = this.getAttribute('title');
    this.activeKey = this.getAttribute('activeKey');
    this.list = JSON.parse(this.getAttribute('list'));
  }

  connectedCallback() {
    let _show = this.list[0].value;
    this.list.forEach((item) => {
      if (item.key === this.activeKey) _show = item.value;
    })

    this.innerHTML = `
        <div class="generate-select-box">
            <div class="select-box-info-box">
                <div class="select-box-title">${this.title}</div>
                <div class="select-box-value">${_show}</div>
            </div>
            <div class="select-box-item-box">
                ${this.list.map(item => `
                    <div class="select-box-item ${this.activeKey === item.key ? 'active' : ''}" key="${item.key}">${item.value}</div>
                `).join('')}
            </div>
        </div>`;

    setTimeout(() => {
      this.firstUpdated();
      this.toBindEvent();
      this.toBindCss();
    }, 10)
  }

  firstUpdated() {
    this.shadowRootEl = this.querySelector('.generate-select-box');
  }

  toBindCss() {
    const existingStyleTag = document.querySelector('style[data-component="generate-select"]');
    if (existingStyleTag) {
      return;
    }

    const css = `.generate-select-box{
  position: relative;
}

.generate-select-box .select-box-info-box{
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px 0 16px;
  height: 49px;
  color: rgba(255, 255, 255, 0.9);
  font: normal normal normal 12px/15px Sora;
  background: rgba(193, 210, 255, 0.1) 0% 0% no-repeat padding-box;
  border-radius: 6px;
  cursor: pointer;
}

.generate-select-box .select-box-info-box .select-box-value{
  display: flex;
  align-items: center;
}

.generate-select-box .select-box-info-box .select-box-value::after{
  margin-left: 16px;
  content: '';
  width: 12px;
  height: 12px;
  background-image:  url("/dist/js/ai-image-generate-select/img/btn_arrow-down_normal.svg");
}

.generate-select-box .select-box-info-box .select-box-value:hover::after{
  background-image:  url("/dist/js/ai-image-generate-select/img/btn_arrow-down_normal_active.svg");
}

.generate-select-box .select-box-info-box .select-box-value.open::after{
   transform: rotate(180deg);
}

.generate-select-box .select-box-item-box{
  display: none;
  position: absolute;
  top: 40px;
  right: 12px;
  padding: 8px;
  width: 148px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background-color: rgba(7, 12, 20, 0.3);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 9px;
  opacity: 1;
  z-index: 9;
}

.generate-select-box .select-box-item-box .select-box-item{
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  font: normal normal normal 12px/15px Sora;
  border-radius: 5px;
  color: #FFFFFF;
  cursor: pointer;
}

.generate-select-box .select-box-item-box .select-box-item.active,.generate-select-box .select-box-item-box .select-box-item:hover{
  background-color: rgba(193, 210, 255, 0.12);
}
`;
    const styleTag = document.createElement('style');
    styleTag.type = 'text/css';
    styleTag.dataset.component = 'generate-select';
    if (styleTag.styleSheet) {
      styleTag.styleSheet.cssText = css;  // For IE
    } else {
      styleTag.appendChild(document.createTextNode(css));  // For other browsers
    }
    document.head.appendChild(styleTag);
  }

  toBindEvent() {
    this.shadowRootEl.querySelector('.select-box-info-box').onclick = this.changeOpen.bind(this);
    this.shadowRootEl.querySelector('.select-box-item-box').onclick = this.selectItem.bind(this);

    document.addEventListener('click',(e)=>{
      if(e.target !== this && !this.shadowRootEl.contains(e.target)){
        this.isOpenItem = false;
        this.shadowRootEl.querySelector('.select-box-item-box').style.display = '';
        this.shadowRootEl.querySelector('.select-box-value').classList.remove('open');
      }
    })
  }

  changeOpen() {
    if (!this.isOpenItem) {
      this.isOpenItem = true;
      this.shadowRootEl.querySelector('.select-box-item-box').style.display = 'block';
      this.shadowRootEl.querySelector('.select-box-value').classList.add('open');
    } else {
      this.isOpenItem = false;
      this.shadowRootEl.querySelector('.select-box-item-box').style.display = '';
      this.shadowRootEl.querySelector('.select-box-value').classList.remove('open');
    }
  }

  selectItem(e) {
    if (this.isOpenItem && e.target.classList.contains('select-box-item')) {
      Array.from(this.shadowRootEl.querySelectorAll('.select-box-item')).forEach((item) => {
        item.classList.remove('active');
        if (item === e.target) {
          item.classList.add('active');
        }
      })

      let key = e.target.getAttribute('key');
      const event = new CustomEvent('selectItem', {detail: {key: key}});

      this.list.some((item)=>{
        if(item.key === key){
          this.shadowRootEl.querySelector('.select-box-value').innerText = item.value;
          return true
        }
      })
      this.changeOpen();
      this.dispatchEvent(event);
    }
  }

  changeShowItem(){
    let _show = this.list[0].value;
    this.list.forEach((item) => {
      if (item.key === this.activeKey) _show = item.value;
    })
    this.innerHTML = `
        <div class="generate-select-box">
            <div class="select-box-info-box">
                <div class="select-box-title">${this.title}</div>
                <div class="select-box-value">${_show}</div>
            </div>
            <div class="select-box-item-box">
                ${this.list.map(item => `
                    <div class="select-box-item ${this.activeKey === item.key ? 'active' : ''}" key="${item.key}">${item.value}</div>
                `).join('')}
            </div>
        </div>`;

    setTimeout(() => {
      this.firstUpdated();
      this.toBindEvent();
    }, 10)
  }
}

// 注册自定义组件
customElements.define('generate-select', GenerateSelect);
