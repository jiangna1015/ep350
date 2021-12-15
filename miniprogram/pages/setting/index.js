// miniprogram/pages/setting/index.js
//设置页面
import bluetoothService, { BLUETOOTH_EVENT } from '../../services/bluetoothService';
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentValue:'',
    res:'',
    show: false,
    ble: true,
    ont:true,
    vfl:true,
    vInfo:'',
    autoOff:'0',
    minHour: 10,
    maxHour: 20,
    time:'2021/8/5 11:42',
    minDate: new Date(2000, 1, 1).getTime(),
    maxDate: new Date(2099, 12, 31).getTime(),
    currentDate: new Date().getTime(),
    timeJson:'',
    commons:{
      ble:'CloseBle',
      ont:'Set:OntCW',
      vfl:'Set:VFL',
      autoOff:'Set:AutoOff'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      _t: app.globalData.base._t(), //翻译
    });
    wx.setNavigationBarTitle({
      title: this.data._t['设置']
    })
    bluetoothService.on(BLUETOOTH_EVENT.DATA_RECEIVED, this.onReceive);

    bluetoothService.writeValue('COMMon:DCDEVice:GetSetting')
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
  onReceive(res){
    let that = this
    this.setData({
      res:that.data.res + res
    })
    if (res[res.length-1] ==  '\n') {
      bluetoothService.off(BLUETOOTH_EVENT.DATA_RECEIVED, this.onReceive);
      this.showDate(this.data.res)
    }
  },
  showDate(data){
    let str = data.slice(data.indexOf(':{') + 1,data.length-2)
    let json = JSON.parse(str);
    this.setData({
      ble:json.Ble_flag == 1,
      ont:json.OntCW_flag == 1,
      vfl:json.VFL_flag == 1,
      time:json.current_time,
      autoOff:json.AutoOff_flag + '',
      // vInfo:`${this.data._t['硬件版本']}:${json.Hardware}${this.data._t['软件版本']}:${json.Software} ${this.data._t['小程序版本']}:${app.globalData.version}`
     vInfo:` ${this.data._t['小程序版本']}:${app.globalData.version}`
    })
    bluetoothService.on(BLUETOOTH_EVENT.DATA_RECEIVED, this.changeValue);
  },
  changeValue(res) {
    if (res.slice(res.length-3,res.length-2) == 1) {
      this.setData({ [this.data.currentValue.currentTarget.dataset.id]: this.data.currentValue.detail });
    }
    bluetoothService.off(BLUETOOTH_EVENT.DATA_RECEIVED, this.changeValue);
  },
  onChange(e) {
    this.setData({currentValue:e})
    bluetoothService.on(BLUETOOTH_EVENT.DATA_RECEIVED, this.changeValue);
    if (e.currentTarget.dataset.id !== 'autoOff') {
      bluetoothService.writeValue('COMMon:DCDEVice:' + this.data.commons[e.currentTarget.dataset.id] + '=' + (e.detail?1:0))
    } else {
      bluetoothService.writeValue('COMMon:DCDEVice:' + this.data.commons[e.currentTarget.dataset.id] + '=' + e.detail)
    }
  },
  onTime(event) {
    this.setData({
      radio: event.detail,
    });
  },
  onInput(event) {
    this.setData({
      currentDate: event.detail,
    });
  },
  showPopup() {
    this.setData({ show: true });
  },
  confirm(e){
    this.setData({ time : this.formatter(e.detail),currentValue:e,show: false})
  },
   add0(m) {
     return m<10?'0'+m:m 
    },
   formatter(timestamp) {
    //shijianchuo是整数，否则要parseInt转换
    var time = new Date(timestamp);
    var y = time.getFullYear()-2000;
    var m = time.getMonth()+1;
    var d = time.getDate();
    var h = time.getHours();
    var mm = time.getMinutes();
    var s = time.getSeconds();
    let timeJson = `{Year:${y},Month:${m},Date:${d},Hour:${h},Minute:${mm},AM:0}`
    bluetoothService.writeValue('COMMon:DCDEVice:SetCurrentTime:'+ timeJson)
    return y+'-'+this.add0(m)+'-'+this.add0(d)+' '+this.add0(h)+':'+this.add0(mm)+':'+this.add0(s);
},
  onClose() {
    this.setData({ show: false });
  }
})