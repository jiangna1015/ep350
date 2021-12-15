// logs.jsl
//历史数据页面
const util = require('../../utils/util.js')
const wxPromise = require('../../utils/wxpromise')
import bluetoothService, { BLUETOOTH_EVENT } from '../../services/bluetoothService';
const app = getApp();
Page({
  data: {
    res:'',
    logs: [],
    load:true,
    passNum:0,
    noState:0,
    circleValue:0,
  },
  checkDetails(e){
    wx.navigateTo({
      //目的页面地址
      url: `../logDetails/index?index=${e.currentTarget.dataset.index}`,
      success: function(res){
      },fail(e){
      }
  })
  },
onLoad() {
    this.setData({
      load:true,
      _t: app.globalData.base._t()//翻译
    });
    wx.setNavigationBarTitle({
      title: this.data._t['历史数据']
    });

    bluetoothService.on(BLUETOOTH_EVENT.DATA_RECEIVED, this.onReceive);

    bluetoothService.writeValue('COMMon:DCDEVice:GetFiles?')
    .then(res => {
      // 这是成功
    })
    .catch((e)=>{
      // 这是失败
    })
  },
  onUnload() {
    bluetoothService.off(BLUETOOTH_EVENT.DATA_RECEIVED, this.onReceive);
    bluetoothService.stopDiscovery().catch((e)=>{
      console.error(e)
    })
  },
  onReceive(res) {
    let that = this
    this.setData({
      res:that.data.res + res,
    })
    if (res[res.length-1] ==  '\n') {
      this.setData({
        load:false
      })
      this.showDate(this.data.res)
    }
  },
  showDate(data){
    let str = data.slice(data.indexOf(':{')+1,data.length-1)
    let datas = JSON.parse(str);
    let json =datas.logs;
    app.globalData.sn=datas.sn[0];
    json.map((item)=>{
      item.service_flag == 0?this.setData({passNum:this.data.passNum++}):false
    })
    this.setData({logs:json})
    app.globalData.logs = json
    this.setData({circleValue:((this.data.passNum.length-1)/(this.data.logs.length-1))*100});
  },
  async getInfo(){
    let a = await wxPromise.app.characteristicValue('123')
  }
})
