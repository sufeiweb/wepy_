const wxRequest = require('./wxRequest');
import API from './api';

function onLogin() {
  let url = API.getToken + 'unionid_' + wx.getStorageSync('unionId') + '_type_2';
  let token = API.SECRET;
  return wxRequest.fetch(url, { type: "Basic", value: token }, {}, "POST").then(res => {
    saveTokens(res.data.access_token, res.data.refresh_token, res.data.expires_in);
    return res.data.access_token
  }).catch(req => {
    console.log(req);
    return 'error'
  })
}

function setWait() {
  wx.removeStorageSync('access_token');
}

function saveTokens(access_token, refresh_token, expires_in) {
  wx.setStorageSync('access_token', access_token);
  wx.setStorageSync('refresh_token', refresh_token);
  let exp = new Date();
  let expires_ins = exp.getTime() + expires_in * 1000 - 30000;
  wx.setStorageSync('expires_in', expires_ins);
}

function onRefreshToken() {
  setWait();
  let token = API.SECRET;
  let url = API.refreshToken + wx.getStorageSync('refresh_token');
  return wxRequest.fetch(url, { type: 'Basic', value: token }, '', 'POST').then((res) => {
    if (res.data.access_token) {
      saveTokens(res.data.access_token, res.data.refresh_token, res.data.expires_in);
      return res.data.access_token;
    } else {
      return onLogin().then(res => {
        return res
      });
    }
  }).catch(req => {
    if (wx.getStorageSync('refresh_token') !== null) {
      return onLogin().then(res => {
        return res
      });
    }
  })
}

function getAccessToken() {
  var date = new Date();
  var dt = date.getTime();
  var expires_in = wx.getStorageSync('expires_in');
  if (!wx.getStorageSync('access_token') || !wx.getStorageSync('expires_in') || !wx.getStorageSync('refresh_token')) {
    return onLogin().then(res => {
      return res
    });
  } else {
    if ((!expires_in || dt >= expires_in) && wx.getStorageSync('access_token')) {
      return onRefreshToken();
    } else if (!wx.getStorageSync('access_token')) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(wx.getStorageSync('access_token'))
        }, 2000)
      })
    } else {
      return new Promise((resolve, reject) => {
        resolve(wx.getStorageSync('access_token'))
      })
    }
  }
}
module.exports = {
  onLogin: onLogin,
  getAccessToken: getAccessToken
};
