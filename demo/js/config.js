/*$.cookie("accesstoken",'TOKEN3109');
$.cookie('role','2');
$.cookie('userid','3109');*/

//小西西开发
$.cookie("accesstoken",'R5B713156U509E2024KB2D05E01I7617A8C0P0MF4448V0ZFFFFFFFFFFFFFFFFWDF3F5972F61');
$.cookie('role','2');
$.cookie('userid','3418');
//小西西调试
// $.cookie("accesstoken",'R58EDFC64U50753066KB2D625FDI8D11A8C0MF4487W28968987');
// $.cookie('role','3');
// $.cookie('userid','1000071');
//小西西运营
// $.cookie("accesstoken",'R58F6FBB4U507AF023KB2D06C01I8D11A8C0MF4338W13743211');
// $.cookie('role','2');
// $.cookie('userid','100701');

// JavaScript Document
var accessAddr = top.globalDnsConfigVar.accessAddr;
var dtvAddr = top.globalDnsConfigVar.dtvAddr;
var slaveAddr = top.globalDnsConfigVar.slaveAddr;
var homedsAddr = top.globalDnsConfigVar.homedsAddr;
var ajaxReqUrl = accessAddr;
var rightReqUrl = accessAddr;
var homePageUrl = top.globalDnsConfigVar.homePageAddr;
var userid = $.cookie("userid") || 0;
var accesstoken = $.cookie("accesstoken") || "";
var role = $.cookie("role") || 0; //1:超级管理员  2：系统管理员  3：普通用户
var system_id = 7; //当前子系统id
var system_name = "终端用户管理系统权限";
var imgReqUrl = top.globalDnsConfigVar.slaveAddr;
var domainUrl = top.globalDnsConfigVar.uCookieDomain;
var regioncode = 440000; //区域码 广东省
var citycode = 440300; //城市代码 深圳市
//显示当前位置信息
function showLocationTitle(_str) {
    if (_str) {
        $(".currentPositon").html("权限管理" + _str);
    } else {
        $(".currentPositon").html("权限管理");
    }
}

function initHeadImage() {
    if (usrInfoVal.icon_url && usrInfoVal.icon_url["100x100"]) {
        $("#headImg").attr("src", usrInfoVal.icon_url["100x100"]);
    } else {
        if (usrInfoVal.gender == 2) $("#headImg").attr("src", homePageUrl + "/pubFile/img/avatar0.jpg");
        else $("#headImg").attr("src", homePageUrl + "/pubFile/img/avatar1.jpg");
    }
}

//打开弹出框页面
function openPopupWindow(_url) {
    $("#popupFrame").attr("src", _url);
    $("#popupWin").fadeIn(100);
}

//关闭弹出框页面
function closePopupWindow() {
    $("#popupWin").fadeOut(100);
}

//回调主框架中rightFrame操作方法
function popupCallback(_obj) {
    $("#mainFrame")[0].contentWindow.mainFrameCallback(_obj);
}

//回调主框架中mainFrame操作方法
function mainCallback(_obj) {
    $("#mainFrame")[0].contentWindow.mainCallback(_obj);
}

//获取rightFrame中的数据
function getRightFrameData(_str) {
    return $("#mainFrame")[0].contentWindow.getRightFrameData(_str);
}

//设置rightFrame中的数据
function setRightFrameData(_str, _val) {
    $("#mainFrame")[0].contentWindow.setRightFrameData(_str, _val);
}

//获取mainFrame中的数据
function getMainFrameData(_str) {
    return $("#mainFrame")[0].contentWindow.getMainFrameData(_str);
}

function mainFrameReload() {
    window.frames["mainFrame"].location.reload();
}

/*统一ajax请求入口
 **data：传递json对象格式
 */
function ajaxReqAction(successCallback, failCallback, reqUrl, data, type, dataType, ajaxUrl) {
    $.ajax({
        url: (ajaxUrl ? ajaxUrl : accessAddr) + reqUrl, //ajax request url
        type: type ? type : "get", //get or post(default get)
        data: (type && type.toLowerCase() == "post") ? JSON.stringify(data) : data, //post方式，采用字符串数据类型传递
        cache: false,
        dataType: dataType ? dataType : "JSON", //(default JSON)
        error: function(e) {
            if (console) console.debug("服务器请求异常！");
            failCallback(e); //服务器异常回调
        },
        success: function(data) {
            successCallback(data); //服务器请求完成回调
        }
    });
}

function getUrlParams(_key, _url) {
    if (typeof(_url) == "object") {
        _url = _url.location.href;
    } else {
        _url = (typeof(_url) == "undefined" || _url == null || _url == "") ? window.location.href : _url;
    }
    if (_url.indexOf("?") == -1) {
        return "";
    }
    var params = [];
    _url = _url.split("?")[1].split("&");
    for (var i = 0, len = _url.length; i < len; i++) {
        params = _url[i].split("=");
        if (params[0] == _key) {
            return params[1];
        }
    }
    return "";
}

function errorCodeTips(_code, _tips) {
    switch (_code) {
        case 7156: //是指 系统中某些表情不能编辑
            return "此分类不可编辑！";
            break;
        case 7182:
            return "已有提交记录，不能编辑！";
            break;
        case 7186:
            return "此分类已发布！";
            break;
        case 7151:
            return "当前栏目下已有此分类！";
            break;
        case 7159:
            return "重复隐藏或还原操作！";
            break;
        case 7160:
            return "父类已隐藏，子分类不能隐藏和还原操作！";
            break;
        case 10523:
            return "新建权限包和已存在的重复！";
            break;
        default:
            if (_tips) return _tips;
            else return "未知错误！";
            break;
    }
}
var tipsInfo = "";

function getTipsInfo() {
    return tipsInfo;
}

function openPopupTips(_tips, _type) {
    if (_type) { //错误码
        tipsInfo = errorCodeTips(_tips);
    } else {
        tipsInfo = _tips;
    }
    $("#popupTipsFrame").attr("src", "alert.html");
    $("#popupTips").fadeIn(100);
}
//关闭弹出框页面
function closePopupTips() {
    $("#popupTips").fadeOut(100);
}
//将秒转成日期格式
function secondsToDataTime(_str) {
    var d = new Date(_str * 1000);
    var year = d.getFullYear();
    var month = d.getMonth() + 1;
    if (month < 10) month = "0" + month;
    var day = d.getDate();
    if (day < 10) day = "0" + day;
    var hour = d.getHours();
    if (hour < 10) hour = "0" + hour;
    var minute = d.getMinutes();
    if (minute < 10) minute = "0" + minute;
    var second = d.getSeconds();
    if (second < 10) second = "0" + second;
    return year + "年" + month + "月" + day + "日 " + hour + ":" + minute;
}
//将秒转成定时时间格式
function secondsToDataTiming(_str) {
    var d = new Date(_str * 1000);
    var year = d.getFullYear();
    var month = d.getMonth() + 1;
    if (month < 10) month = "0" + month;
    var day = d.getDate();
    if (day < 10) day = "0" + day;
    var hour = d.getHours();
    if (hour < 10) hour = "0" + hour;
    var minute = d.getMinutes();
    if (minute < 10) minute = "0" + minute;
    var second = d.getSeconds();
    if (second < 10) second = "0" + second;
    return day + "日" + hour + "时" + minute + "分" + second + "秒";
}
var jQueryAjax = $.ajax;
$.ajax = function(_url, _option) {    
    //如果只传入一个参数的情况
    if (arguments.length == 1) {
        _option = _url;
        _url = _option.url;
    }
    var type = (_option.type || "GET").toUpperCase(),
        async = typeof _option.async !== "undefined" ? _option.async : true,
        timeout = typeof _option.timeout !== "undefined" ? _option.timeout : 30000,
        data = _option.data || {},
        onSuccess = _option.success || function() {},
        onError = _option.error || function() {},
        onComplete = _option.complete || function() {},
        onBeforeSend = _option.beforeSend || function() {};

    return jQueryAjax($.extend(_option, {
        url: _url,
        type: type,
        async: async,
        timeout: timeout,
        data: data,
        dataType: "json", //跨域访问必须
        success: function(res) {
            if (res.ret != 0) { //请求失败
                if (res.ret == 9021 || res.ret == 9022) { //token过期
                    $.removeCookie("userid", {
                        path: "/",
                        domain: domainUrl
                    });
                    $.removeCookie("accesstoken", {
                        path: "/",
                        domain: domainUrl
                    });
                    $.removeCookie("role", {
                        path: "/",
                        domain: domainUrl
                    });
                    $.alert({
                        msg: "请重新登录！",
                        img: "img/info.png",
                        callback: function() {
                            top.location.href = homePageUrl + "/login.html";
                        }
                    });
                } else if (res.ret == 10577) {
                    $.alert({
                        msg: '没有权限',
                        img: 'img/info.png'
                    });
                } else if (res.ret == 9715 && top.globalDnsConfigVar.operator !== 'dalian') {
                    $.alert({
                        msg: '帐户余额不足',
                        img: 'img/info.png'
                    });
                } else {
                    onError(res);
                }
            } else {
                onSuccess(res);
            }
        },
        error: function(res) {
            if (res.statusText == "timeout") {
                $.alert({
                    msg: '请求超时',
                    img: 'img/info.png'
                });
            } else {
                window.setTimeout(logout, 1000)
                $.alert({
                    msg: '服务器异常',
                    img: 'img/info.png'
                });
            }
        },
        complete: onComplete,
        beforeSend: onBeforeSend
    }));
};
//从url中获取指定参数的值
function getUrlArgs(name, url) {
    url = typeof url == 'undefined' ? window.location.href : url;
    var flag = new RegExp(".*\\b" + name + "\\b(\\s*=([^&]+)).*", "gi").test(url);
    if (flag) {
        return RegExp.$2;
    } else {
        return "";
    }
}

function isEmptyObject(_obj) {
    for (var i in _obj) {
        return false;
    }
    return true;
}
/**
 * [getStrLength 获取字符串的长度，ASCII字符为一个长度单位，非ASCII字符为两个长度单位]
 * @param  str [要获取长度的字符串]
 */
function getStrLength(str) {
    if (typeof(str) == "undefined") return 0;
    return str.replace(/[^\x00-\xff]/g, "aa").length;
}