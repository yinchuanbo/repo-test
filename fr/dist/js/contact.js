let submit=!1,maxCharacters=500;$(window).ready((function(){$("#content").on("input",(function(){let t=$("#content").val();t.trim().length>maxCharacters&&$("#content").val(t.substring(0,maxCharacters))})),$(".submit").click((function(){if(submit)return;submit=!0;let t=$("#subject").val().trim(),e=$("#email").val(),r=$("#content").val().trim();const o=jsonData.popupTip;if(""==t){let t={title:o.errorTitle,type:"error",content:o.errorTextB,btn:o.ok,callback:()=>{submit=!1}};return void ToolTip(t)}if(!/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(e)){let t={title:o.errorTitle,type:"error",content:o.errorTextA,btn:o.ok,callback:()=>{submit=!1}};return void ToolTip(t)}if(""==r||r.length<20){let t={title:o.errorTitle,type:"error",content:o.errorTextMessage,btn:o.ok,callback:()=>{submit=!1}};return void ToolTip(t)}fetchPost("transmit-email",{subject:t,email:e,content:r,action:"vidqu"},TOOL_API).then((t=>{let e={};200==t.code?(e={title:o.sucessTitle,type:"success",content:o.successText,btn:o.ok,callback:()=>{submit=!1}},$("#subject,#email,#content").val("")):e={title:o.errorTitle,type:"error",content:o.errorTextC,btn:o.ok,callback:()=>{submit=!1}},ToolTip(e)})).catch((t=>{let e={title:o.errorTitle,type:"error",content:o.errorTextC,btn:o.ok,callback:()=>{submit=!1}};ToolTip(e),console.log(t,"error")}))}))}));