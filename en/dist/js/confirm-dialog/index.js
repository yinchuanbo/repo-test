const selfCommonComponents = jsonData["selfCommonComponents"]

class ConfirmDialog extends HTMLElement {
    constructor() {
        super()
        this.isCancel = this.getAttribute('isCancel') || 'true'
        this.isClose = this.getAttribute('isClose') || 'true'
        this.content = this.getAttribute('content') || ' ';
        this.cancelText = this.getAttribute('cancelText') || ''
        this.submitText = this.getAttribute('submitText') || ''
        this.submitType = this.getAttribute('submitType') || ''
        this.contentList = this.getAttribute('contentList') ? JSON.parse(this.getAttribute('contentList')) : []
        this.titleText = this.getAttribute('titleText')
        this.iconType = this.getAttribute('iconType') || '';
    }

    connectedCallback() {
        const isAiChat = location.href.includes("ai-girlfriend")
        this.innerHTML = `<div class="confirm-body-box confirm-dialogflex flex-item-center flex-center ${isAiChat?'aiChat':''}">
        <div class="confirm-body">
          <i class="close-btn bingClickBtn1" style="display:${this.isClose === 'true' ? 'block' : 'none'}"></i>
          <h3 class="${this.iconType ? this.iconType : ''}">${this.titleText}</h3>
          <p class="${this.titleText ? '' : 'big'}" style="display:${this.contentList.length ? 'none' : 'block'}" >${this.content}</p>
          <p style="display:${!this.contentList.length ? 'none' : 'block'}" >
            ${this.contentList.map((item, index) => {
            if (index === this.contentList.length - 1) {
                return this.contentList[index]
            } else {
                return `${this.contentList[index]}<br/>`
            }
        })}
          </p>
          <div class="btn-ground flex-end">
            <button style="display:${this.isCancel === 'true' ? 'block' : 'none'}" class="cancel-btn bingClickBtn2">
              ${this.cancelText ? this.cancelText : selfCommonComponents['cancel']}
            </button>
            <button class="bingClickBtn3 submit-btn ${this.submitType === 'delete' ? 'del' : ''}">
                ${this.submitText || (this.submitType === 'delete' ? selfCommonComponents['delete'] : selfCommonComponents['ok'])}
            </button>
          </div>
        </div>
      </div>`;

        setTimeout(() => {
            /*Bind some basic verification and rules*/
            this.firstUpdated();
            /*Clicks on the binding page*/
            this.toBindEvent();

            this.toBindCss();

        }, 1000)
    }

    submitMap = {
        delete: this.submitText || 'delete',
        ok: this.submitText || 'okk'
    }
    //Login-Dialog-Body class different pop-ups add-on-class name ACCOUNT Register Success Verify Reset-PWD LINK (203 status code return type and mailbox) Almost
    //There are three ways to return to login successfully
    firstUpdated() {
        this.shadowRootEl = document.querySelector('.confirm-body-box')
    }

    toBindCss() {
        const css = `
.flex-center {
    display: flex;
    justify-content: center;
}        
 
 .flex-end {
    display: flex;
    justify-content: flex-end;
  }
        
.flex-item-center {
    display: flex;
    align-items: center;
}

.confirm-body-box.confirm-dialogflex {
    position: fixed;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    z-index: 9999;
    background-color: rgba(0, 0, 0, 0.4);
}

.confirm-body-box .confirm-body {
    width: 518px;
    min-height: 204px;
    background-color: rgba(255, 255, 255, 1);
    border-radius: 8px;
    padding: 24px 24px 0 66px;
    position: relative;
    box-sizing: border-box;
    padding-bottom: 24px;
}

.confirm-body-box .close-btn {
    display: block;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    position: absolute;
    top: 20px;
    right: 20px;
    background-image: url('/dist/js/confirm-dialog/images/window_close.svg');
    cursor: pointer;
    background-size: 24px 24px;
    background-repeat: no-repeat;
    background-position: center;
    z-index: 1;
}

.confirm-body-box .close-btn:hover {
    background-color: rgba(140, 140, 151, 0.2);
}

.confirm-body-box h3 {
    font: normal normal normal 16px/26px Sora;
    color: rgba(51, 51, 51, 1);
    position: relative;
    padding-right: 32px;
    user-select: none;
}

.confirm-body-box h3::before {
    content: '';
    display: block;
    background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAABHNCSVQICAgIfAhkiAAAAlpJREFUSEu9Vr1VwzAQlmIKOsIEwARkA8gEwASEjkBB/HBoSVoCzzSQkjABZgKSCYAJgAlIKngPbPGdbQX/SJZNgYpYse/uu5/vTuLsnxY34ZydXTVqNWuDMbHNGG/gWY90+BT7Jzy9IPAnJyeH2OuXFsh1h6u+z90IoNQaWRbr23b7VSWtBLq4GLaEYDelzGeEOGd7x8ftUVY3BzQYDHsQPv0LiNSBk/1ut91L2kgBlYjkDUbC1MAZqtW6zqFsZHOgqCbsRaUI4xMhgk624KQTBOwS37dUeqjZmqzZHAjReCoFeHaPnM8JQca/voJ6EhTpHkMOzMytW8dpt8IM0E9E4dqjyau0M/zJsj6atm1PXdet+/7ie5F+CDQYXHc4Jyrn1jM8Qu8wpqqfEMLudg8u6fv5+ZBqt5K1IGViIF3o1JQsZo/oYL+aNIRUN8GucTEQm0BmMwSCN2RwSRW67l2SVajRJv4/qGX51HH2lyWQqAAyw7RoOc6B91tfCyByNOUtIf3wI4qoApDYqQJC9pNAZVP3BqWwTlG6+F1RJHFsM+jUDWRIp4EalwobA+l6J6UkdUz0zib8Fcke0UsYiNlYXN0UvYsatgJJlKJyDM1HEAhBnu4aDN9a1if1E8MkGOOhHaqxnfQIopdFQ1WCpxv0mk5ckEG7ZoimkRuqJG46JjIjh0bPkQ5Ge0xIBfPBx9GoYXOG7FMt48EnlUyRFaULkXRKHeXSSFyzXgmCSBUQhfUqXU6SHhPg93d41dqGt3RkyOE7Q4pwxRLewgL3dADSlvFeV5CmSp9+ANcOMCokQ5sXAAAAAElFTkSuQmCC');
    width: 26px;
    height: 26px;
    position: absolute;
    top: 0;
    left: -42px;
}

.confirm-body-box h3.hint::before {
    background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAABHNCSVQICAgIfAhkiAAAAgFJREFUSEutVktSwkAUnMDGnXoC4wmUExhOoDdQd1BupEjYCltIVcqFshRPIJ7AeAK5gXACdecmwX7DTJjEJDNjSVWgyPSbfq9fz8dhlp8oivYopNfrfdqEOjpwGN6fMeacAufhcQv4Jf7H67UzD4LOc91clUSTydRzHHYjCHT50DgI2SgIunEZuJQIJENBYkKQwyBu2O93R8XAX0RhOJ0BdG7NkA+Y+X73Un2VIzKoZAV5qC8MmVO/DqoSEjIO5XhGJHryUlPJV7P57Uq3kfuSZIdId2vI2rJnKlGMLE+qiZyF73da6jhkXuD/UU1yMSRscwXoS1j4SdcXBOWkBtFaFwMJeVWCyMwAaZq2BoMrqoKNx3fHjUbjTUeE8VskeC2JSOvKxsrJZHY2KgC7BNGhJNJKQJOrTjJwaFYsSe5E0dRNEvZuIAFBHhF0sanITG7Cwq37IOI2/TAhQkWvaKxHWFSkcel2Rk4ksjOSjrDSeSaOk1RcOkFkZAbC0l6WpvjZbLgmnxWIXCt7m8xaglHtzc8c7YIVFfHNEv16MCHOLVjT5tqaQcXbbKq8AJymqJ56tZ7rKlIXuO0xoZs7G688JiTCZiHWsGYLW2L+/SgvVlJLJMzh4ZfuDjVn1LYmajzhrS4nqiTi5CUD0FPc4Vd4NwcJrlvltx9tRVX6//UC+QPVxOqVLvGicgAAAABJRU5ErkJggg==');
}

.confirm-body-box h3.tips::before {
    background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAABHNCSVQICAgIfAhkiAAAAoNJREFUSEu9lj1IW1EUx89NXKsdikNBiBBwENv4sZguyZapiYuLg3EQjFNDnnPtbEI6BFMQ2ih00cHEKVuy2NFWikMxYEDooC0YnVI0t+fc90Ge5r574+CFlxd459zf+9/zv+c+Bk80mIqTzxcDd3csjnERvAIAPGTmsB/408Sr7vfzSjqdov/SIQWZAHiPmUnVy1jPS34/fJABe4Ky2c0EgO8Lvv1zTYgVxq4AOkuGsVq+n/cAlMsVk5wDQh4/GIOlTCZV6p7BBTKVsH0dxMjIS2i1buD6+kYSzue6lTkgq+jfdZYrHJ6B2dkZaLfbUCjIxLMrNMmkXTMHlM0WSeqijppo9A1MTU0g6B9sbX0VQMnYNoyUMJMAWQ4704HYMePjY2LZzs9/e6ahE0dJlQBtbGy+Y4zldUAEoOvi4g/U69+UKZzz9Nra6kcBQqeV0Wm0KT0HAWKxqBOTy31SpQA6sIIOTAgQ1od2+WuvLHLZ8PALGBx85tSnUPisBFEHMYyVSRvEVRkEoJosLy8IWKPRhEqlqkoTz9EQKMxUpARRHAEIRKNarcHJya++Qcqloxmnp19BJBIWk5Ot5ZvVxT9GRaG+zBCPxyAYDMDl5V/Y2dnTUuMyg669M5kVMfnR0U+o1Q7FUqpUueyts2HJdfPzbwVod/dAOPD09EwJcm1YyxAlvEtbkN3fKJZUkBlUXQFD3S2Iki1VZIqhXosfDI46m5UgjYayY7VQTehBUzVV6R8TaidIjgk78UkOPhtmKaOa9VxGDzUtPM+SWke5PYlVs3Uvg9wDbmNN1vv6OOmegIC3tzzh87EIdvgAPrOb7zFuxmanw+sDA6z86M8tdbH7i/gP+UEVKoE0NREAAAAASUVORK5CYII=');
}

.confirm-body-box h3.right::before {
    background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAABHNCSVQICAgIfAhkiAAAAhNJREFUSEu9lk1SwjAUx5OWcXAlNxBOIJ7AcgL1BOIS3NChsJU1H1M2ylK4gZ7AegLhBJYb1JXMQFvfqw0kkBZSHTuTgZkk7/c+/i8JJf/00UM43e5DWde1yzAkRViPAz+XUuL6fvDSbt9N99lJBQ0GoyoYv+eMJ9lzCQk7llWfJC2QgmzbLvj+8StsLu/zdGve0fXFtWma3va+HRCmSdN0hBQUIfFy6gWBX9lOpwCKI/nIDmGuUU/Xv0p8ZAKo3x9hUc+yRbKzy7GsWmWNZn/iwj9lhMzifYKToMrbZrM2xrl1RBANKIecZgDNQAAG7vP9vLOVEReiKq1BPwLQ3rNCWC16vccGpdTm7QRBcI7CiCLq9UYdCBP7ReWLImGQpNSHYWi2WvVhBIK0YR5vFCgHQWJ7E0hflUXkQEQXEhAWuQjjhJtTgRA4Wd5arZqRBooMLpdHRagfFhlhShB0TgDJUgcLKuAJAgiKhVJtmMstrvbVRJIVIXUSMciPEjSk0nOCGJLlvQtTgaBTgrxj5bnwK2nYDUwVAvbmoDgU0+ZkSDdCPVDlGNLQUGgBIj2C4qj+7FBlamOOSa6JPKaQ7xuVINjaT2iNYuI1waTM9U0mCAjASL34mFW8AFer/HPCaZEIx3TxvcYvPORx0pGrUeDNwakOu3tknhz83ILj34BRjp9cqCgXVDiF4fz6uZWlQEl7vgFIvi8qsyUD+wAAAABJRU5ErkJggg==');
}

.confirm-body-box p {
    padding-top: 6px;
    font: normal normal normal 14px/19px Sora;
    color: rgba(109, 113, 122, 1);
    min-height: 75px;
    max-width: 400px;
}
.confirm-body-box p >a{
    font: normal normal normal 14px/19px Sora;
    color: rgba(139, 61, 255, 1);
    text-decoration: underline;
    cursor: pointer;
}
.confirm-body-box p >a:hover{
    color: #d254ff;
}

.confirm-body-box p.big {
    min-height: 100px;
    padding-top: 4px;
}

.confirm-body-box .btn-ground {
    gap: 24px;
    margin-top: 24px;
}

.confirm-body-box .btn-ground button {
    border: unset;
    outline: none;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 120px;
    height: 40px;
    border-radius: 6px;
    cursor: pointer;
    padding: 0 10px;
    box-sizing: border-box;
}

.confirm-body-box .cancel-btn {
    background: rgba(30, 30, 46, 0.1);
    font: normal normal normal 14px/19px Sora;
    color: rgba(30, 30, 46, 1);
}

.confirm-body-box .cancel-btn:hover {
    background: rgba(30, 30, 46, 0.2);
}

.confirm-body-box .submit-btn {
    margin-top: 0;
    background: #0E45F5;
    font: normal normal normal 14px/19px Sora;
    color: rgba(255, 255, 255, 1);
}

.confirm-body-box .submit-btn:hover {
    background: #0E45F5;
}

.confirm-body-box.aiChat .submit-btn {
    margin-top: 0;
    background: #F597E8;
    font: normal normal normal 14px/19px Sora;
    color: #21242C;
}

.confirm-body-box.aiChat .submit-btn:hover {
    background: #F8B7EF;
}
.confirm-body-box .submit-btn.del {
    background: rgba(235, 51, 88, 1);
}

.confirm-body-box .submit-btn.del:hover {
    background: rgba(255, 80, 115, 1);
}

.confirm-body-box .submit-btn.loading {
    text-indent: -99999px;
    /* font-size:0; */
}

.confirm-body-box .submit-btn.loading:after {
    content: '';
    font-size: 8px;
    width: 1em;
    height: 1em;
    border-radius: 50%;
    position: relative;
    display: block;
    animation: flash-black 1.5s ease-out infinite alternate;
}
@media (max-width: 768px){
    .confirm-body-box .confirm-body{
        max-width: 90vw;
        padding: 20px 20px 24px 66px;
    }
    .confirm-body-box p{
        padding-right:35px;
    }
    .confirm-body-box .close-btn{
        top:17px;
    }
}
`;

        const styleTag = document.createElement('style');
        styleTag.type = 'text/css';

        if (styleTag.styleSheet) {
            styleTag.styleSheet.cssText = css;  // For IE
        } else {
            styleTag.appendChild(document.createTextNode(css));  // For other browsers
        }

        document.head.appendChild(styleTag);
    }

    toBindEvent() {
        this.shadowRootEl.querySelector('.bingClickBtn1').onclick = (e) => {
            this.closeConfirm(e)
        };

        this.shadowRootEl.querySelector('.bingClickBtn2').onclick = (e) => {
            this.cnacelFun(e)
        };

        this.shadowRootEl.querySelector('.bingClickBtn3').onclick = (e) => {
            this.submitFun(e)
        };
    }

    closeConfirm(e) {
        e && e.stopPropagation()
        this.dispatchEvent(new CustomEvent('closebtnclick'))
        this.remove()
    }

    cnacelFun(e) {
        e && e.stopPropagation()
        this.dispatchEvent(new CustomEvent('cancale'))
        this.closeConfirm()
    }

    submitFun(e) {
        e && e.stopPropagation()
        this.dispatchEvent(new CustomEvent('submit'))
        if (this.submitType !== 'delete') {
            this.closeConfirm()
        } else {
            this.shadowRoot.querySelector('.close-btn').style.pointerEvents = 'none'
            this.shadowRoot.querySelector('.cancel-btn').style.pointerEvents = 'none'
            this.shadowRoot.querySelector('.submit-btn').style.pointerEvents = 'none'
            const width = this.shadowRoot.querySelector('.submit-btn').offsetWidth
            this.shadowRoot.querySelector('.submit-btn').style.width = width + 'px'
            this.shadowRoot.querySelector('.submit-btn').classList.add('loading')
        }
    }

}

//Register a custom component
customElements.define('confirm-dialog', ConfirmDialog);
