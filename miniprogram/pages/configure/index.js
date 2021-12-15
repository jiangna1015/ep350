// miniprogram/pages/configure/index1.js
//标识页面
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    task:'',
    operator:'',
    customer:'',
    company:'',
    position:'',
    optical:'',
    connector:'',
    message:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.setData({
      _t: app.globalData.base._t(), //翻译
    });
    let c = app.globalData.configure
    this.setData({
      task:c.task,
      operator:c.operator,
      customer:c.customer,
      company:c.company,
      position:c.position,
      optical:c.optical,
      connector:c.connector,
      message:c.message
    })
    wx.setNavigationBarTitle({
      title: this.data._t['标识']
    })
  },
  onChange(e) {
    // event.detail 为当前输入的值
    this.setData({
      [e.currentTarget.dataset.id]:e.detail
    })
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    app.globalData.configure = {
      task:this.data.task,
      operator:this.data.operator,
      customer:this.data.customer,
      company:this.data.company,
      position:this.data.position,
      optical:this.data.optical,
      connector:this.data.connector,
      message:this.data.message
    }
  }
})