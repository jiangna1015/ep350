import { EventEmitter } from 'events';
import Toast from '../miniprogram_npm/@vant/weapp/toast/toast';
const app = getApp();

export const BLUETOOTH_EVENT = {
  DEVICE_FOUND: 'DEVICE_FOUND',
  DATA_RECEIVED: 'DATA_RECEIVED',
  CONNECT_STATE_CHANGE:'CONNECT_STATE_CHANGE',
};
export const STATUS = {
  IDLE: 'IDLE',
  PENDING: 'PENDING',
  DONE: 'DONE'
}

export class ConnectedDevice {

  deviceId = '';
  serviceId = '';
  readCharacteristic = '';
  writeCharacteristic = '';
  notifyCharacteristic = '';

  markAsConnected(
    deviceId,
    serviceId,
    readCharacteristic,
    writeCharacteristic,
    notifyCharacteristic,
  ) {
    this.deviceId = deviceId;
    this.serviceId = serviceId;
    this.readCharacteristic = readCharacteristic;
    this.writeCharacteristic = writeCharacteristic;
    this.notifyCharacteristic = notifyCharacteristic;
  }

};
//通过这个类来确定下一步应该干什么
class BluetoothService extends EventEmitter {

  isOpened = false;
  isDiscovering = false;
  connectStatus = STATUS.IDLE;

  isDeviceFoundAttached = false;
  isReadAttached = false;
  isConnectStateChangeAttached = false;

  foundDevicesList = [];
  connectedDevice = new ConnectedDevice();

  get connected() {
    return this.connectStatus === STATUS.DONE;
  }
  get readable() {
    return this.connected && this.connectedDevice.readCharacteristic;
  }
  get writable() {
    return this.connected && this.connectedDevice.writeCharacteristic;
  }
  get notifiable() {
    return this.connected && this.connectedDevice.notifyCharacteristic;
  }

  async openBluetooth() {
    if (!this.isOpened) {
      await wx.openBluetoothAdapter();
      this.isOpened = true;
    }
  }

  async closeBluetooth() {
    if (this.isOpened) {
      await this.stopDiscovery();
      await wx.closeBluetoothAdapter();
      this.isOpened = false;
    }
  }

  async startDiscovery() {
    if (!this.isDiscovering) {
      await this.openBluetooth();
      await wx.startBluetoothDevicesDiscovery({
        allowDuplicatesKey: false
      });
      this.isDiscovering = true;
      this.foundDevicesList = [];
    }

    if (!this.isDeviceFoundAttached) {
      wx.onBluetoothDeviceFound(({ devices  }) => {
        devices.forEach(d => {
          const idx = this.foundDevicesList.findIndex(fd => fd.deviceId === d.deviceId);
          if (idx === -1) {
            this.foundDevicesList.push(d);
          } else {
            this.foundDevicesList[idx] = d;
          }
        });
        this.emit(BLUETOOTH_EVENT.DEVICE_FOUND, this.foundDevicesList);
      });
      this.isDeviceFoundAttached = true;
    }
  }

  async stopDiscovery() {
    if (this.isDiscovering) {
      await wx.stopBluetoothDevicesDiscovery();
      this.isDiscovering = false;
    }
  }
  async getConnectedDevice() {
    if (this.connected) {
      return new Promise((resolve,reject)=>{
        wx.getConnectedBluetoothDevices({
          services: [app.globalData.serviceId],
          success (res) {
            resolve(res)
          },fail(f){
            reject(f)
          }
        })
      })
    }
  }
  async connect(deviceId) {
    if (this.connectStatus === STATUS.PENDING) {
      throw new Error('another connection is in progress.');
    }

    this.connectStatus = STATUS.PENDING;
    try {
      if (this.connected) {
        await this.disconnect();
      }

      await wx.createBLEConnection({ deviceId });
      const { services } = await wx.getBLEDeviceServices({ deviceId });
      const serviceId = app.globalData.serviceId = services.find(s => s.isPrimary)?.uuid;

      if (!serviceId) {
        throw new Error('no primary service');
      }

      const { characteristics } = await wx.getBLEDeviceCharacteristics({ deviceId, serviceId });
      const writable = characteristics.find(c => c.properties.write);
      const notifiable = characteristics.find(c => c.properties.notify || c.properties.indicate);

      if (notifiable) { 
        await wx.notifyBLECharacteristicValueChange({
          deviceId,
          serviceId,
          characteristicId: notifiable.uuid,
          state: true,
        });
      }

      if (!this.isReadAttached) {
        wx.onBLECharacteristicValueChange(({ characteristicId, value }) => {
          const v = ab2str(value);
          this.emit(BLUETOOTH_EVENT.DATA_RECEIVED, v);
        });
        this.isReadAttached = true;
      }

      if (!this.isConnectStateChangeAttached) {
        wx.onBLEConnectionStateChange((res) => {
          this.emit(BLUETOOTH_EVENT.CONNECT_STATE_CHANGE, res);
          app.globalData.connected = res.connected
        });
        this.isConnectStateChangeAttached = true;
      }

      this.connectStatus = STATUS.DONE;
      this.connectedDevice.markAsConnected(deviceId, serviceId, notifiable?.uuid, writable?.uuid, notifiable?.uuid);
    } catch(err) {
      this.connectStatus = STATUS.IDLE;
      throw err;
    }

    return this.connectedDevice;
  }

  async disconnect() {
    if (!this.connected) {
      return;
    }

    await wx.closeBLEConnection({ deviceId: this.connectedDevice.deviceId });
    this.connectedDevice.markAsDisconnected();
  }

  async writeValue(value,loop) {
    if (!app.globalData.connected) {
      Toast.fail('请连接设备！');
    }
    if (!loop) {
      value = value + '\n'
    }
    if (this.writable) {
      return wx.writeBLECharacteristicValue({
        characteristicId: this.connectedDevice.writeCharacteristic,
        deviceId: this.connectedDevice.deviceId,
        serviceId: this.connectedDevice.serviceId,
        value: str2ab(value),
      });
    }
  }

}

//数据转换
function str2ab(str) {
  var buf = new ArrayBuffer(str.length); // 每个字符占用2个字节
  var bufView = new Uint8Array(buf);
  for (var i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
};

function ab2str(buf) {
  let unit8Arr = new Uint8Array(buf);
  let encodedString = String.fromCharCode.apply(null, unit8Arr),
    decodedString = decodeURIComponent(escape((encodedString))); //没有这一步中文会乱码
    return decodedString;
};

export default new BluetoothService();
