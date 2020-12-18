import BaseDevice, { TDeviceData} from "./BaseDevice";
import BulbDevice from "./BulbDevice";
import PlugDevice from "./PlugDevice";

export default class DeviceFactory {
    public static fromObject(deviceData: TDeviceData): BaseDevice {
        switch (deviceData.type) {
            case 'rgb_bulb': return new BulbDevice(deviceData);
            case 'plug': return new PlugDevice(deviceData);
        }
    }
}