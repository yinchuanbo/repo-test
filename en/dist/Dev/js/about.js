import {getHeaders} from "@js/api.js";
console.log("getHeaders", getHeaders());

let isSubmit = true
// POST
var TOOL_API =
    location.host.includes("vidqu.ai") && !location.host.includes("test")
        ? "https://tool-api.vidqu.ai/"
        : "https://tool-api-test.vidqu.ai/";
function fetchPost(url, data = {}, headers = {}) {
    return new Promise((resolve, reject) => {
        fetch(TOOL_API + url, {
            method: "POST",
            headers: {
                ...{
                    "Content-Type": "application/json",
                    "X-TASK-VERSION": "2.0.0",
                    "Request-Origin": "vidqu",
                },
                ...headers,
            },
            body: JSON.stringify(data),
        })
            .then((response) => {
                resolve(response.json())
            })
            .catch((err) => reject(err));
    });
}

function ToolTip(params) {
    const { text = '', type = '', showtime = '',bottom = '330px' } = params
    $('body').append(`
    <bottom-message
      text="${text}"
      type="${type}"
      bottom="${bottom}"
      showtime="${showtime}"
      >
    </bottom-message>`)
}


//校验邮箱格式
function validateEmail(email) {
    var emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
}
$(window).ready(function () {
    $(".btn").click(async () => {
        let obj = {
            email: $('.mail').val(),
            subject: $('.name').val(),
            content: $('.message').val(),
            action: 'vidqu' //vidqu vidwud
        }
        if (obj.subject === '') {
            $('.name').addClass('borderRedpx')
            return
        } else if (obj.email === '' || !validateEmail(obj.email)) {
            $('.mail').addClass('borderRedpx')
            return
        } else if (obj.content === '' || obj.content.length < 20) {
            $('.messagebox').addClass('borderRedpx')
            return
        }
        if (!isSubmit) {
            return
        }
        $('.loading-svg').show()
        $('.btn').addClass('disabled').find('p').hide()
        try {
            let res = await fetchPost('transmit-email', obj, {})
            $('.loading-svg').hide()
            $('.btn').removeClass('disabled').find('p').show()
            if (res.code === 200) {
                ToolTip({
                    text: "Submitted Successfully"
                })
            }else {
                ToolTip({
                    text: 'Failed',
                    type:'error'
                })
            }
        }catch(err) {
            $('.loading-svg').hide()
            $('.btn').removeClass('disabled').find('p').show()
            ToolTip({
                text: 'Failed',
                type:'error'
            })
        }
    })
    $('.message').focus(() => {
        $('.messagebox').removeClass('borderRedpx')
    })
    $('.name').focus(() => {
        $('.name').removeClass('borderRedpx')
    })
    $('.mail').focus(() => {
        $('.mail').removeClass('borderRedpx')
    })
})