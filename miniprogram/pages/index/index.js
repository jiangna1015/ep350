// pages/lanyatest/lanyatest.js
// var base = require('../../utils/base');  //路径可能做相应调整
const app = getApp();
//bluetoothService绑定事件
//BLUETOOTH_EVENT 事件名称
import bluetoothService, { BLUETOOTH_EVENT } from '../../services/bluetoothService';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    connected:false,
    language:'',
    show: false,
    info: "未初始化蓝牙适配器",
    connectedDeviceId: "",
    deviceId: "",
    services: "",
    servicesUUID: "0000ff00-0000-1000-8000-00805f9b34fb",
    serviceId: "",
    notifyCharacteristicsId: "",
    writeCharacteristicsId: "",
    sendmsg: "",
    systemInfo:'',
    activeKey:'1',
    steps: [
      {
        text: '步骤一',
        desc: '描述信息'
      },
      {
        text: '步骤二',
        desc: '描述信息'
      },
      {
        text: '步骤三',
        desc: '描述信息'
      },
      {
        text: '步骤四',
        desc: '描述信息'
      }
    ],
    a:[{b:1}]
  },
  chooseFile(){
    wx.downloadFile({
      url: '../../utils/files/hetong.pdf',
      filePath: wx.env.USER_DATA_PATH + '/temp.pdf',
      success: function(res) {
        wx.openDocument({
          filePath: res.filePath,
          success: function (res) {
          }
        })
      },fail: function(res){
      }
    })
  },
  onShareAppMessage(){
    let that =this;
    return {
      title: '简直走别拐弯', // 转发后 所显示的title
      path: '/pages/index/index', // 相对的路径
      success: (res)=>{    // 成功后要做的事情
        wx.getShareInfo({
          shareTicket: res.shareTickets[0],
          success: (res)=> { 
            that.setData({
              isShow:true
            }) 
           },
          fail: function (res) { },
          complete: function (res) { }
        })
      },
      fail: function (res) {
        // 分享失败
      }
    }
  },
  toRoute(e){
    app.toRoute(e)
  },
  showPopup() {
    this.setData({ show: true });
  },
  onClose() {
    this.setData({ show: false });
  },
  getSystemInfo(){
    try {
      const res = wx.getSystemInfoSync()
      this.setData({
        systemInfo:res.platform
      })
    } catch (e) {
      // Do something when catch error
    }
  },
  onShow(){
    this.setData({
      connected : app.globalData.connected
    })
  },
  onLoad: function () {
   //链接蓝牙
    bluetoothService.on(BLUETOOTH_EVENT.CONNECT_STATE_CHANGE, this.bluetoothConnectStateChange);
     // 登录页面切换中英文需要
    this.language = app.globalData.language
    if (app.globalData.base.getLanguage() == 'zh_CN') {
      this.setData({
        language: 'English',
      })
    } else {
      this.setData({
        language: '中文',
      })
    };
    this.setData({
      _t: app.globalData.base._t(), //翻译
    });
  },
  onUnload() {
    bluetoothService.off(BLUETOOTH_EVENT.CONNECT_STATE_CHANGE, this.bluetoothConnectStateChange);
  },
  bluetoothConnectStateChange(res){
    this.setData({connected : res.connected})
  },
  switchLanguage: function() {
    if (app.globalData.base.getLanguage() == 'zh_CN'){
      wx.setStorageSync('Language', 'en'); // 利用本地缓存存放用户中英文选项
    }else{
      wx.setStorageSync('Language', 'zh_CN');
    };
    // wx.navigateTo({
    //   url: 'index',
    // });
    this.onLoad();
  }
})
