// miniprogram/pages/logDetails/index1.js
//历史数据子页面
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    time:'2021.8.8',
    isPass:false,
    unit:'dBm',
    log:{
      dBm: [-15, -17.01, -15, -62.48, "", ""],
      file_index: 0,
      high_low: [4, 4, 4, 4, "", ""],
      service_flag: 2,
      service_name: ["GPON", "XGS", ""],
      service_num: 2,
      wave: [1310, 1490, 1270, 1578, "", ""],
      unit:'dBm'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      _t: app.globalData.base._t(), //翻译
      currentIndex:options.index
    });
    wx.setNavigationBarTitle({
      title: this.data._t['记录详情']
    })
    this.reloadLog(app.globalData.logs[options.index])
  },
  openImg(){
    let that = this
    wx.navigateTo({
      url: `../createImg/index?index=${that.data.currentIndex}`
    })
  },
reloadLog(log){
  if(log.dBm_flag==3){
    this.setData({
      unit:'mW'
    })
  }else if(log.dBm_flag==4){
    this.setData({
      unit:'uW'
    })
  }else if(log.dBm_flag==5){
    this.setData({
      unit:'nW'
    })
  }
  if(log.dBm_flag!==2){
    log.dBm=log.uint_data;
  }
  let serviceData = []
  for (let i = 0; i < log.service_name.length; i++) {
    this.setData({file_name:log.file_name})
    this.setData({isPass:log.service_flag == 0?true:false}) 
    this.setData({time:log.save_time})
    if (log.service_name[i] !== '') {
      let _log = {
        dBm:{up:log.dBm[i*2],down:log.dBm[i*2+1]},
        type:{up:log.high_low[i*2],down:log.high_low[i*2+1]},
        service_name:log.service_name[i],
        threshold:{up:{max:log.threshold[i][0],min:log.threshold[i][1]},down:{max:log.threshold[i][2],min:log.threshold[i][3]}},
        time:log.save_time,
        wavelength:[log.wave[i*2],log.wave[i*2+1]],
        unit:this.data.unit
      }
      serviceData.push(_log)
    }
  }
  app.globalData.logDetail = serviceData
  this.setData({serviceData})
},
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})