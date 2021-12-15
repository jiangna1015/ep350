// app.js
// var base = require('./utils/base');  //路径可能做相应调整
// const _ = base._; //翻译函数
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    if (this.globalData.base.getLanguage() == 'zh_CN') {
      this.globalData.language = 'English'
    } else {
      this.globalData.language = '中文'
    };
    this.globalData._t = this.globalData.base._t()
  },
  globalData: {
    version:'V1.0.2',
    logs:[],
    sn:'135896',
    connected:false,
    userInfo: null,
    language:'中文',
    logDetail:[],
    base:require('./utils/base'),
    _t:'',
    deviceId:'',
    serviceId:'',
    characteristicId:'',
    notifyCharacteristicsId:'',
    configure:{
      task:'',
      operator:'',
      customer:'',
      company:'',
      position:'',
      optical:'',
      connector:'',
      message:''
    }
  },
  toRoute(e){
    let toUrl = e.currentTarget.dataset.url
    wx.navigateTo({
      //目的页面地址
      url: `../${toUrl}/index`,
      success: function(res){
      },fail(e){
      }
  })
  },
})
