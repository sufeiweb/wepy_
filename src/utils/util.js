let wxUploadFile = require('./uploadFile');
let AuthProvider = require('./AuthProvider');
let wxRequest = require('./wxRequest');
import API from './api';


console.log(API.ENV);

/**
 *
 * @param str 打印日志
 * @param type 环境 D开发,T测试,P/ 生产
 * @constructor
 */
function Log(str,type) {
  switch (API.ENV){
    case "DEV"://开发
      showLog(str,type);
      break;
    case "TEST"://测试
      showLog(str,type);
      break;
    case "PRO"://生产
      showLog(str,type);
      break;
  }
}

function showLog(str,type) {
  switch (type){
    case "D":
      console.log("开发调试：");
      console.log(str);
      break;
    case "T":
      console.log("测试辅助：");
      console.log(str);
      break;
    case "P":
    default:
      console.log("生产辅助：");
      console.log(str);
      break;
  }
}
/*
* 页面跳转函数
* @param path 跳转路径 部分可携带参数
* @param type 跳转类型
* @param num 是否为返回上级
*/
function pageGo(path, type, num) {
  if (num) {
    wx.navigateBack({
      delta: path
    })
  } else {
    switch (type) {
      case 1:
        wx.navigateTo({
          url: path
        });
        break;
      case 2:
        wx.redirectTo({
          url: path
        });
        break;
      case 3:
        wx.reLaunch({
          url: path
        });
        break;
      case 4:
        wx.switchTab({
          url: path
        });
        break;
      default:
        break
    }
  }
}

/**
 * 分享集成函数
 * @param title 分享的标题F
 * @param path 分享的页面路径
 * @param imageUrl 分享出去要显示的图片
 * @param callback 分享后的回调
 * @returns {{title: *, path: *, imageUrl: *, success: success, complete: complete}}
 */
function openShare(title, path, imageUrl, callback) {
  return {
    title: title,
    path: path,
    imageUrl: imageUrl,
    success: function (res) {
      wx.showToast({
        title: '分享成功',
        icon: 'success',
        duration: 3000
      })
    },
    complete: function (req) {
      callback(req)
    }
  }
}

/**
 *  错误全局提示
 * @param that
 * @param str
 * @param timer
 * @constructor
 */
function ErrorTips(that, str, timer) {
  that.stop = true;
  that.popErrorMsg = str;
  that.$apply();
  hideErrorTips(that, timer);
}

function hideErrorTips(that, timer) {
  let fadeOutTimeout = setTimeout(() => {
    that.popErrorMsg = null
    that.$apply();
    clearTimeout(fadeOutTimeout);
  }, timer);
}

/**
 * 全局复制函数
 * @param str1 需要复制的文字
 * @param str2 提示文字
 */
function copyText(str1, str2) {
  wx.setClipboardData({
    data: str1,
    success: res => {
      console.log(res);
      successShowText(str2)
    }
  })
}

function successShowText(str) {
  wx.showToast({
    title: str,
    icon: 'success',
    duration: 3000
  })
}

function formatZero(str) {
  return str < 10 ? '0' + str : str;
}

function formatTime(time) {
  var leave1 = time % (24 * 3600)
  var hours = Math.floor(leave1 / 3600)
  //计算相差分钟数
  var leave2 = leave1 % 3600       //计算小时数后剩余的秒数
  var minutes = Math.floor(leave2 / 60)
  //计算相差秒数
  var leave3 = leave2 % 60
  var seconds = leave3
  return formatZero(hours) + ":" + formatZero(minutes) + ":" + formatZero(seconds)
}

/**
 * 上传图片得到url地址
 * @param imgUrl
 * @param callback
 */
function downloadImg(imgUrl, callback) {
  AuthProvider.getAccessToken().then(token => {
    return wxUploadFile.uploadFile(API.uploadImg, imgUrl, token);
  }).then(result => {
    let resData = JSON.parse(result.data);
    callback(resData.resultContent);
  })
}

/**
 * 获取openId
 * @param {*} code
 * @param {*} appid
 */
function getOpenId(code, appid) {
  let url = API.getSmallPro + `?code=${code}&appId=${appid}`;
  wxRequest.fetch(url, null, null, 'GET').then(res => {
    "use strict";
    console.log(res);
    if (res.data.resultCode === '100') {
      wx.setStorageSync('openid', res.data.resultContent.openId);
    }
  })
}

/**
 * 发送formid
 * @param e
 */
function formSubmitAuther(e) {
  let params = {
    "appId": API.APP_ID,
    "formId": e.detail.formId,
    "openId": wx.getStorageSync('openId')
  };
  AuthProvider.getAccessToken().then(token => {
    wx.request({
      url: API.templateNews,
      data: params,
      method: 'POST',
      header: {
        'Content-Type': 'application/json;charset=UTF-8',
        "Authorization": 'bearer ' + token //base64加密liz-youli-wx:secret
      },
      success: function (e) {
        console.log('发送成功')
      }
    })
  })

}

function formSubmitNuther(e) {
  let params = {
    "appId": API.APP_ID,
    "formId": e.detail.formId,
    "openId": wx.getStorageSync('openId')
  };
  wx.request({
    url: API.templateNew,
    data: params,
    method: 'POST',
    header: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    success: function (e) {
      console.log('发送成功')
    }
  })

}

/**
 * 倒计时
 * @param that
 * @param total_micro_second
 */
var count_down = function (that, total_micro_second) {
  if (total_micro_second <= 1) {
    that.countTime = "重新获取";
    that.countTimeState = true;
    that.$apply();
    // timeout则跳出递归
    return;
  }
  // 渲染倒计时时钟
  that.countTime = formatZero(date_format(total_micro_second)) + 's后重试';
  that.countTimeState = false;
  that.$apply();
  setTimeout(function () {
    // 放在最后--
    total_micro_second -= 10;
    count_down(that, total_micro_second);
  }, 10)
}

// 时间格式化输出，如03:25:19 86。每10ms都会调用一次
var date_format = function (micro_second) {
  // 秒数
  var second = Math.floor(micro_second / 1000);
  // 小时位
  var hr = Math.floor(second / 3600);
  // 分钟位
  var min = Math.floor((second - hr * 3600) / 60);
  // 秒位
  var sec = (second - hr * 3600 - min * 60); // equal to => var sec = second % 60;
  // 毫秒位，保留2位
  var micro_sec = Math.floor((micro_second % 1000) / 10);
  return sec;
}

/**
 * 验证手机号码
 * @param str
 * @returns {boolean}
 */
function verifyPhone(str) {
  let myreg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
  return myreg.test(str);
}

/*获取当前页url*/
function getCurrentPageUrl() {
  var pages = getCurrentPages() //获取加载的页面
  var currentPage = pages[pages.length - 1] //获取当前页面的对象
  var url = currentPage.route //当前页面url
  return url
}

/*获取当前页带参数的url*/
function getCurrentPageUrlWithArgs() {
  var pages = getCurrentPages() //获取加载的页面
  var currentPage = pages[pages.length - 1] //获取当前页面的对象
  var url = currentPage.route //当前页面url
  var options = currentPage.options //如果要获取url中所带的参数可以查看options

  //拼接url的参数
  var urlWithArgs = url + '?'
  for (var key in options) {
    var value = options[key]
    urlWithArgs += key + '=' + value + '&'
  }
  urlWithArgs = urlWithArgs.substring(0, urlWithArgs.length - 1)
  return urlWithArgs
}
/**
 *
 * @param time 团购倒计时
 */
function countDownTime(time) {
  var leave1 = time % (24 * 3600)
  var leaves = Math.floor(time / (24 * 3600));
  var hours = Math.floor(leave1 / 3600) + leaves * 24;
  //计算相差分钟数
  var leave2 = leave1 % 3600       //计算小时数后剩余的秒数
  var minutes = Math.floor(leave2 / 60)
  //计算相差秒数
  var leave3 = leave2 % 60
  var seconds = leave3
  if (hours < 0 || minutes < 0 || seconds < 0) {
    return '00:00:00'
  }
  return formatZero(hours) + ':' + formatZero(minutes) + ':' + formatZero(seconds)
}
module.exports = {
  pageGo: pageGo,
  openShare: openShare,
  ErrorTips: ErrorTips,
  copyText: copyText,
  formatZero: formatZero,
  downloadImg: downloadImg,
  successShowText: successShowText,
  getOpenId: getOpenId,
  formatTime: formatTime,
  formSubmitAuther: formSubmitAuther,
  formSubmitNuther: formSubmitNuther,
  count_down: count_down,
  verifyPhone: verifyPhone,
  getCurrentPageUrl: getCurrentPageUrl,
  getCurrentPageUrlWithArgs: getCurrentPageUrlWithArgs,
  countDownTime: countDownTime,
  Log:Log
};
