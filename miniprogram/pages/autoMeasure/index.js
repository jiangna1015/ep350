// miniprogram/pages/autoMeasure/index1.js
//实施测量
import bluetoothService, { BLUETOOTH_EVENT } from '../../services/bluetoothService';
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    resData:'',
    btnDisabled:false,
    res:'',
    services:[],
    starting:false,
    gpon:{up:2.62,down:2.94},
    xgs:{up:-5.92,down:-8.63},
    num:99999,
    isPass:2,
    dBmFlag:2,
    unit:'dBm'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      _t: app.globalData.base._t(), //翻译
    });
    wx.setNavigationBarTitle({
      title: this.data._t['实时测量']
    })
    bluetoothService.on(BLUETOOTH_EVENT.DATA_RECEIVED, this.onReceive);
  },
  onUnload: function () {
    this.stopMeasure().then(res=>{
    }); 
    bluetoothService.off(BLUETOOTH_EVENT.DATA_RECEIVED, this.onReceive);
    bluetoothService.off(BLUETOOTH_EVENT.DATA_RECEIVED, this.onReceiveData);
  },
  //保存
  onSave(){
    if(this.data.resData){
      let str=this.data.resData.slice(this.data.resData.indexOf(',') + 1,this.data.resData.length);
      bluetoothService.writeValue(str)  .then(res => {
        console.log(res)
      }) .catch((e)=>{
        console.error(e)
      })
    }else{
      Toast.fail({message: '开始测试后才能保存哦' });
    }
  },
  //开始测试
  startMeasure(){
    this.setData({
      btnDisabled:true
    })
    bluetoothService.writeValue('COMMon:DCDEVice:StartRealTimeMeasure')
    .then(res => {
     
    })
    .catch((e)=>{
      console.error(e)
      this.setData({
        btnDisabled:false
      })
    })
  },
  //结束测试
  stopMeasure(){
    this.setData({
      btnDisabled:true
    })
    let that = this
    bluetoothService.off(BLUETOOTH_EVENT.DATA_RECEIVED, this.onReceive);
    bluetoothService.off(BLUETOOTH_EVENT.DATA_RECEIVED, this.onReceiveData);
    bluetoothService.on(BLUETOOTH_EVENT.DATA_RECEIVED, function (res) {
      if (res.indexOf('COMMon:DCDEVice:SET:1' > 0)) {
        that.setData({
          starting:false,
          btnDisabled:false
        })
      }
    });
    return bluetoothService.writeValue('COMMon:DCDEVice:StopRealTimeMeasure')
  },
  //切换单位
  transformationUnit(){
    if(this.data.resData){
    //dBmFlag单位信息(UNIT_DB:1, UNIT_DBM:2, UNIT_MW:3,UNIT_UW:4,UNIT_NW:5)
      if(this.data.dBmFlag=='2'){
        this.setData({
          dBmFlag:3,
          unit:'mW'
        })
      }else if(this.data.dBmFlag=='3'){
        this.setData({
          dBmFlag:4,
          unit:'uW'
        })
      }else if(this.data.dBmFlag=='4'){
        this.setData({
          dBmFlag:5,
          unit:'nW'
        })
      }else if(this.data.dBmFlag=='5'){
        this.setData({
          dBmFlag:2,
          unit:'dBm'
        })
      }
     let str= 'COMMon:DCDEVice:Set:dBmFlag = '+this.data.dBmFlag;
      bluetoothService.writeValue(str) .then(res => {
        console.log(res)
      }) .catch((e)=>{
        console.error(e)
      })
    }else{
      Toast.fail({message: '开始测试后才能切换单位哦' });
    }
  },
  onReceive(res){
    if (res.indexOf('StartRealTimeMeasure:1') > 0) {
      this.setData({ 
        starting:true,
        btnDisabled:false
      })
      bluetoothService.off(BLUETOOTH_EVENT.DATA_RECEIVED, this.onReceive);
      bluetoothService.on(BLUETOOTH_EVENT.DATA_RECEIVED, this.onReceiveData);
    }
  },
  update(data,that) {
    console.log(data)
    that.setData({
      resData:data,
      services:[]
    })
    let str = data.slice(data.indexOf(':{') + 1,data.length-2)
    let json = JSON.parse(str);
    let flag = json.service_flag;
    for (let i = 0; i < json.service_num; i++) {
      let obj = {up:{data:'',type:0,max:'',min:''},down:{data:'',type:0,max:'',min:''}}
      obj.name = json.service_name[i]
      obj.up.data = this.data.dBmFlag=='2'?json.dBm[i][0]:json.uint_data[i][0]
      obj.up.max = json.threshold[i][0]
      obj.up.min = json.threshold[i][1]
      obj.down.data =this.data.dBmFlag=='2'?json.dBm[i][1]:json.uint_data[i][1]
      obj.down.max=json.threshold[i][2]
      obj.down.min=json.threshold[i][3]
      if(obj.up.data<json.threshold[i][1]){
        obj.up.type=2
      }else if(obj.up.data>json.threshold[i][0]){
        obj.up.type=1
      }
      if(obj.down.data<json.threshold[i][3]){
        obj.down.type=2
      }else if(obj.down.data>json.threshold[i][2]){
        obj.down.type=1
      }
      let arr = that.data.services
      arr.push(obj)
      that.setData({
        services:arr,
        isPass:flag
      })
    }
    that.setData({res:''})
  },
  onReceiveData(res){
    let that = this
    this.setData({
      res:that.data.res + res
    })
    if (res[res.length-1] ==  '\n') {
      this.update(this.data.res,that)
    }
  },
  randomNum(max,min){
    var range = max - min;
    var rand = Math.random();
    var num = min + Math.round(rand * range);
    return num;
  }
})