// pages/testConfigure/index.js
//测试配置
import bluetoothService, { BLUETOOTH_EVENT } from '../../services/bluetoothService';
const app = getApp();
Page({
  /**
   * 组件的属性列表
   */

  
  /**
   * 组件的初始数据
   */
  data:{
    servers:[{server:'GPON',num:'1 service'},{server:'GPON+XGS-PON',num:'2 service'},{server:'GPON+NG-PON2',num:'2 service'},{server:'1G+10G:1G+10G',num:'EPON services'},{server:'GPON+ALT-PON',num:'2 service'},{server:'GPON+RFoG',num:'2 service'},],
    serversR:[{server:'GPON',num:'1 service'},{server:'GPON+XGS-PON+RF',num:'3 service'},{server:'GPON+NG-PON2+RF',num:'3 service'},{server:'EPON Services+RF',num:'2 services'},{server:'GPON+RFoG',num:'2 service'},],
    serversData:[],
    type:''
  },
  checkDetails(e){
    let that = this
      wx.navigateTo({
        //目的页面地址
        url: `../testConfigureDetail/index?index=${e.currentTarget.dataset.index}&type=${that.__data__.type}`,
        success: function(res){
        },fail(e){
        }
    })
  },
   /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options+'options')
    this.setData({
      _t: app.globalData.base._t(), //翻译
    });
    wx.setNavigationBarTitle({
      title: this.data._t['测试配置']
    })
    bluetoothService.on(BLUETOOTH_EVENT.DATA_RECEIVED, this.onReceive);
    bluetoothService.writeValue('COMMon:DCDEVice:GetServiceSetting')
    .then(res => {
      // 这是成功
    })
    .catch((e)=>{
      // 这是失败
    })
  },
  onUnload() {
    bluetoothService.off(BLUETOOTH_EVENT.DATA_RECEIVED, this.onReceive);
  },
  onReceive(res) {
    let that = this
    this.setData({
      res:that.data.res + res
    })
    if (res[res.length-1] ==  '\n') {
      this.showData(this.data.res)
      bluetoothService.off(BLUETOOTH_EVENT.DATA_RECEIVED, this.onReceive);
    }
  },
  showData(data){
    let str = data.slice(data.indexOf(':{')+1,data.length-1)
    let datas = JSON.parse(str);
    this.setData({
      type:datas.type
    })
    if(datas.type=='EP350'){
      this.setData({
        serversData:this.data.servers
      })
      
    }else{
      this.setData({
        serversData:this.data.serversR
      })
    }
  }
})
