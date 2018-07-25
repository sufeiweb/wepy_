function wxPromisify(fn) {
  return function (obj = {}) {
    return new Promise((resolve, reject) => {
      obj.success = function (res) {
        wx.hideToast();
        console.log("response success: ");
        console.log(res.data);
        console.log("---request end---");
        resolve(res);
      };
      obj.fail = function (req) {
        console.log("request error: ");
        console.log(req);
        console.log("---request end---");
        reject(req);
      };
      fn(obj);
    })
  }
}

//无论promise对象最后状态如何都会执行
Promise.prototype.finally = function (callback) {
  let P = this.constructor;
  return this.then(
    value => P.resolve(callback()).then(() => value),
    reason => P.resolve(callback()).then(() => {
      throw reason
    })
  );
};

function wxRequest(url, token, data, type) {
  let datas = JSON.stringify(data);
  console.log("---request start---");
  console.log(`url: ${url}`);
  console.log("request type&data: ");
  console.log(`${type} : ${datas}`);
  wx.showToast({
    title: '加载中...',
    icon: "loading",
    duration: 10000
  });
  let wxtRequest = wxPromisify(wx.request);
  let header = {
    'Content-Type': 'application/json;charset=UTF-8'
  };
  if (token) {
    header = {
      'Content-Type': 'application/json;charset=UTF-8',
      "Authorization": token.type + ' ' + token.value
    }
  }
  return wxtRequest({
    url: url,
    method: type,
    data: datas,
    dataType: "json",
    header: header
  })
}

module.exports = {
  fetch: wxRequest
};
