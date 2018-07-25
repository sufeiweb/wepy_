// const ORIGIN_NAME = 'https://cloud.gemii.cc/lizcloud/api';//生产环境
// const ORIGIN_NAME = 'http://dev.gemii.cc:58080/lizcloud/api'; //开发模式
const ORIGIN_NAME = 'http://test.gemii.cc:58080/lizcloud/api' //测试模式

const USER_LOGIN = ORIGIN_NAME + '/basis-api/noauth/';//授权绑定，用户登录1
const TOKEN = ORIGIN_NAME + '/uaa/oauth/token?';//获取token

const api = {
  // ENV:'DEV',//开发环境
  ENV:'TEST',//开发环境
  // ENV:'PRO',//开发环境
  SECRET: "bGl6LXlvdWxpLXd4OnNlY3JldA==", //base64加密liz-youli-wx:secret 栗子集市
  APP_ID: 'wx655b79f74ee85585', //APPID 栗子集市

  authLogin: USER_LOGIN + 'wdwd/loadUserAuthorizeWechat', //获取unionID
  getSmallPro: ORIGIN_NAME + '/basis-api/noauth/oauth/login/smallpro',//获取oppenid
  getToken: TOKEN + 'grant_type=password&password=&username=', //获取token
  refreshToken: TOKEN + 'grant_type=refresh_token&refresh_token=', //刷新token
  uploadImg: ORIGIN_NAME + '/gridfs-api/noauth/media',//上传图片

  templateNews: ORIGIN_NAME + '/basis-api/authsec/oauth/user/formId',//小程序推送模板消息 authsec
  templateNew: ORIGIN_NAME + '/basis-api/noauth/oauth/user/formId',//小程序推送模板消息 noauth

  changeSOL: ORIGIN_NAME + '/e-goods-api/noauth/support/shortTolong?shortId=',//短id转长id
};

export default api;
