import jsonData from '/dist/lan/es6.js'
class BottomMessage extends HTMLElement {
    constructor() {
        super()
        this.text = this.getAttribute('text') || ''
        this.type = this.getAttribute('type') || 'success' //The default is a successful style error.
        this.showtime = this.getAttribute('showtime') || 3000 //The display time is 0 is the default 3 seconds of milliseconds to show the default 3 seconds
        this.timer = null
        
    }

    connectedCallback() {
        this.innerHTML = `<div class="bottom-message-box bottom-message flex-item-center ${this.type === 'error' ? 'ero' : this.type === 'btnmsg' ? 'btn-msg' : this.type === 'avatar' ? 'avatar' : ''}">
      <i class="icon-before"></i>
      <p class="text">${this.text}</p>
      <button class="bingClickBtn1">${jsonData.selfCommonComponents['undo']}</button>
      </div>`;

        setTimeout(() => {
            /*Bind some basic verification and rules*/
            this.firstUpdated();
            /*Clicks on the binding page*/
            this.toBindEvent();

            this.toBindCss();

        }, 10)
    }

    firstUpdated() {
        this.shadowRootEl = document.querySelector('.bottom-message-box');
        if (this.showtime !== 0) {
            this.timer = setTimeout(() => {
                if (this) {
                    this.shadowRootEl.style.display = 'none'
                    this.remove()
                }
            }, this.showtime)
        }

        setTimeout(() => {
            this.shadowRootEl.classList.add('on')
        }, 0)
    }

    toBindCss() {
        const css = `
        .flex-item-center {
    display: flex;
    align-items: center;
}
        
.bottom-message{
      position: fixed;
      left: 50%;
      bottom: 0;
      transform:translateX(-50%);
      padding:12px 20px 12px 16px;
      background-color: rgba(202, 239, 223, 1);
      border-radius:6px;
      height:44px;
      box-sizing: border-box;
      opacity:0;
      transition: bottom 0.3s,opacity 0.3s;
      z-index:9999
     }
     .bottom-message.on{
      bottom: 50px;
      opacity:1;
     }
     .icon-before{
      background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABHNCSVQICAgIfAhkiAAAAd5JREFUOE+1VMFRwlAQ3R+cAU5iBWIFQAUExgI8oidSAVgBUIFQQXJSvFmAQjowdAAVwA2YkXzfkvzwE5PgQTPDZMj+ffve2/0rKOcx7buKkOWaENLkY1IKV4rtwrXeNllpIi1wa3dMn8hGrJqRuDSIrHdr6ibjMUBmZFBxQCT6OLjA2zFIeioxKCTq4NpFvIb32Kf9SGccATJYgYpzeUyg0cyaDvPsaNsdjg8ECh5o31KgEWDbvh+jYs8no+Faz14emIqZ9kPdIP8TSiYz64VV0REw9Gz+G2bJQoopPG2xNUdAfFzitYFMlnv2YWYFOjQ/rNdJmM+KLpF/I4JGlNYg+wjakJ3/BDIPUCNWigDsglz55NPuSii5inIenA6GZFM1QscQygNUixrUsjsO/rj45sQbEDDTwTiuq0wFRBEX55r4WQyaxexU7GRbquSwIoNieGkIf+DRT2YKMCY5qykJ0EVSpu51rClqbDDxa4xBQz8YgvYBNs5bCLCIx6YCe6r/M9gByz+8elrro0aA/ihvJtW44UzM35T1Veau9niL4LDjS8PjpcrgvGwN4fP17AZbSUx82g5T15fOJhwDHurrDJYr3Kzu2QWbTOYuX1Cpju1tgs2Gl+0X7by8jn8DjYAp7HwZtcsAAAAASUVORK5CYII=');
      width: 20px;
      height: 20px;
      flex-shrink:0;
     }
     .bottom-message .text{
      font: normal normal normal 14px/19px Sora;
      color: rgba(66, 159, 88, 1);;
      padding-left: 8px;
      white-space: nowrap;
     }
     .bottom-message button{
      margin-left:90px;
      border-radius:4px;
      background:rgba(139, 61, 255, 1);
      text-align: center;
      height:32px;
      font: normal normal normal 14px/32px Sora;
      color: rgba(255, 255, 255, 1);
      padding:0 23px;
      border:unset;
      outline:none;
      display: none;
      cursor:pointer;
     }
     .bottom-message button:hover{
      background:rgba(155, 87, 255, 1);
     }
     .bottom-message.ero{
      background:rgba(255, 225, 233, 1);
     }
     .bottom-message.ero .icon-before{
      background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABHNCSVQICAgIfAhkiAAAAg9JREFUOE+1lT1S21AQx3dlPRmqQEMLOYHFTA4gbpAbxDkBUECDNcgj0yQF5gQxN8gN8AEyE/kGpE2DO7CfrJf/yn7Os7AFBWjGs5Lf7m8/tWKquQwlO7nvtQriSNQ8MkM/L0ZMyXiTGa87ePTTyGP+QWQO1hvyfWHM1+08HlbPV4ASkVbepSE+geIIcmCMyayhOGLmkMm0cd6C7CtddN2Il0CBTVXjDoohGeo28zipK8fETxNiuoROFujZkYUugVOV9g3RMZN3GOiLrA5mz6bqKjRU/AbkJtCxZAUfuOY1o7vXRFZ1ZCMtDB1JaUrgRKX3EOOmjkNrMAnSz7j/1JzGHRfypHonHvHQzQL2yIg/NHXnIy9q94AGnG7pTt8B9hDxBXL4Duj5wvEA8ktVV5ygQdeo5S7bdG3IbjSI8hugZwKF3BMYfrfIRLq8vFwG2xpAae1MLqFz82cw+dPN8mWgSss0S5yTvhvhCrA25f+wW8D+2vRtTS10JeVNTbGFdtN0anrldn+lKYvuydg8oI6H1qsMbUEmcjtf6gZpD+IXgD+t7nxsaAf2B+8z2OLpTV89p/VD3LdkDrAcum4nq/fOchhhoKNny8FCtWoksiTwnEEOGlhfslTlXJbtrFxf1MajyBulZ8na9eVGsBgDmb/9DVH+wZvVfnHBVo1lpJ78RugRRYZ5LMt2K59ldZ+AfzIBPqDminRuAAAAAElFTkSuQmCC');
     }
     .bottom-message.ero .text{
        color: rgba(249, 5, 131, 1);
     }
     .bottom-message.btn-msg{
      padding:12px 8px 12px 16px;
      background:rgba(244, 236, 255, 1);
     }
     .bottom-message.btn-msg .icon-before{
      background: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCI+CiAgPGRlZnM+CiAgICA8Y2xpcFBhdGggaWQ9ImNsaXAtcGF0aCI+CiAgICAgIDxyZWN0IGlkPSJSZWN0YW5nbGVfMjI1NCIgZGF0YS1uYW1lPSJSZWN0YW5nbGUgMjI1NCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg3OTggODM2KSIgZmlsbD0iI2ZmZiIgc3Ryb2tlPSIjOGIzZGZmIiBzdHJva2Utd2lkdGg9IjEiLz4KICAgIDwvY2xpcFBhdGg+CiAgPC9kZWZzPgogIDxnIGlkPSJwcm9tcHRfaGludCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTc5OCAtODM2KSIgY2xpcC1wYXRoPSJ1cmwoI2NsaXAtcGF0aCkiPgogICAgPGcgaWQ9InZ1ZXNheF9saW5lYXJfaW5mby1jaXJjbGUiIGRhdGEtbmFtZT0idnVlc2F4L2xpbmVhci9pbmZvLWNpcmNsZSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTE4Mi43OTYgMTEwOC43OTYpIHJvdGF0ZSgxODApIj4KICAgICAgPGcgaWQ9ImluZm8tY2lyY2xlIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgzNjYgMjU0KSI+CiAgICAgICAgPHBhdGggaWQ9IlZlY3RvciIgZD0iTTguOCwxNy41OTJBOC44LDguOCwwLDEsMCwwLDguOCw4LjgyMiw4LjgyMiwwLDAsMCw4LjgsMTcuNTkyWiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOGIzZGZmIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iMS41Ii8+CiAgICAgICAgPHBhdGggaWQ9IlZlY3Rvci0yIiBkYXRhLW5hbWU9IlZlY3RvciIgZD0iTTAsMFY0LjQiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDguNzk2IDUuMjc4KSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOGIzZGZmIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iMS41Ii8+CiAgICAgICAgPHBhdGggaWQ9IlZlY3Rvci0zIiBkYXRhLW5hbWU9IlZlY3RvciIgZD0iTTAsMEguMDA4IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg4Ljc5MSAxMi4zMTQpIiBmaWxsPSJub25lIiBzdHJva2U9IiM4YjNkZmYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgICAgIDwvZz4KICAgIDwvZz4KICA8L2c+Cjwvc3ZnPgo=');
     }
     .bottom-message.btn-msg .text{
        color: rgba(139, 61, 255, 1);
     }
     .bottom-message.btn-msg button{
        display:block;
     }
     .bottom-message.avatar{
      position:absolute;
      background-color: rgba(232, 182, 83, 1);
     }
     .bottom-message.avatar.on{
      bottom: 20px;
      opacity:1;

     }
     .bottom-message.avatar .icon-before{
      background: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCI+CiAgPGRlZnM+CiAgICA8Y2xpcFBhdGggaWQ9ImNsaXAtcGF0aCI+CiAgICAgIDxyZWN0IGlkPSJSZWN0YW5nbGVfMTcxNCIgZGF0YS1uYW1lPSJSZWN0YW5nbGUgMTcxNCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg4NDAgNTg5KSIgZmlsbD0iI2ZmZiIgc3Ryb2tlPSIjNzA3MDcwIiBzdHJva2Utd2lkdGg9IjEiLz4KICAgIDwvY2xpcFBhdGg+CiAgPC9kZWZzPgogIDxnIGlkPSJ0aXBzX3doaXRlIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtODQwIC01ODkpIiBjbGlwLXBhdGg9InVybCgjY2xpcC1wYXRoKSI+CiAgICA8cGF0aCBpZD0iUGF0aF83MDAxIiBkYXRhLW5hbWU9IlBhdGggNzAwMSIgZD0iTTczLjQ4MSw2NGE5LjUsOS41LDAsMSwxLTYuNywyLjc4M0E5LjQ1Nyw5LjQ1NywwLDAsMSw3My40ODEsNjRaTTc0LjksNjkuODIxYTEuMywxLjMsMCwwLDAsLjkxLS4zMjksMS4yNSwxLjI1LDAsMCwwLDAtMS43NTYsMS40LDEuNCwwLDAsMC0xLjgsMCwxLjI1MywxLjI1MywwLDAsMCwwLDEuNzU2LDEuMjczLDEuMjczLDAsMCwwLC44ODkuMzI5Wm0uMjU1LDcuNjE5YzAtLjA4NS4wMDctLjIuMDIxLS4zMzlhMS45MzEsMS45MzEsMCwwLDAsMC0uNGwtMS4xMjIsMS4yOWExLjQ4MiwxLjQ4MiwwLDAsMS0uMzQ5LjMuMzc1LjM3NSwwLDAsMS0uMzA3LjA2NC4yNjcuMjY3LDAsMCwxLS4xNjktLjNsMS44NjItNS44NjJhMS4yMTksMS4yMTksMCwwLDAtMS4xNDItMS41MjQsMy4wODIsMy4wODIsMCwwLDAtMS42MTkuNjI1LDYuMSw2LjEsMCwwLDAtMS41MzUsMS41MzR2LjMxOGExLjkzLDEuOTMsMCwwLDAsMCwuNGwxLjEyMi0xLjI5MWExLjQ4MSwxLjQ4MSwwLDAsMSwuMzQ5LS4zLjMzOS4zMzksMCwwLDEsLjI4Ni0uMDYzLjI2My4yNjMsMCwwLDEsLjE0OC4zMzlsLTEuODQyLDUuODQxYTEuMDUyLDEuMDUyLDAsMCwwLC4xNDkuOTQyLDEuNiwxLjYsMCwwLDAsMS4wMzcuNTYsMi43ODksMi43ODksMCwwLDAsMS43NzgtLjYxMyw2LjgyMSw2LjgyMSwwLDAsMCwxLjMzNC0xLjUyM2gwWiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNzc2LjUxOSA1MjUuNTE5KSIgZmlsbD0iI2ZmZiIvPgogIDwvZz4KPC9zdmc+Cg==');
     }
     .bottom-message.avatar .text{
      color:rgba(255, 255, 255, 1);
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
        this.shadowRootEl.querySelector('.bingClickBtn1').onclick = this.submitFun.bind(this);
    }

    submitFun() {
        clearTimeout(this.timer)
        this.remove()
        this.dispatchEvent(
            new CustomEvent('btnclick')
        )
    }
}

//Register a custom component
customElements.define('bottom-message', BottomMessage);
