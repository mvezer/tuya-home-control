import * as mongoose from 'mongoose';
import BaseDevice, {TDeviceData} from './BaseDevice';
import DeviceFactory from './DeviceFactory';
import Logger from '../../handlers/Logger';

const DEVICE_TYPES = ['rgb_bulb', 'plug'];

const DeviceModel = mongoose.model('Device', new mongoose.Schema({
    deviceId: { type: String, required: true, unique: true },
    key: { type: String, required: true },
    type: { type: String, enum: DEVICE_TYPES, required: true },
    name: { type: String, required: true },
    groupId: { type: String, required: false }
}));

export default class DevicesRepository {
    private devices:Array<BaseDevice> = [];
    private _isInitialized:boolean;
    private logger:Logger;

    constructor() {
        this.logger = new Logger('DevicesRepository');
        this._isInitialized = false;
    }

    async init():Promise<void> {
        try {
            (await this.loadAllFromDb()).map(device => this.initDevice(device), this);
        } catch (error: any) {
            this.logger.error(`init failed: ${error.message}`);
        }

        this._isInitialized = true;
    }

    async initDevice(device:BaseDevice): Promise<void> {
        await device.connect();
        this.devices.push(device);
    }

    async addDevice(newDeviceData:TDeviceData):Promise<BaseDevice> {
        if (this.getDeviceById(newDeviceData.deviceId)) {
            throw new Error(`cannot add device, device (deviceId: $newDeviceData.deviceId}) already exists`);
            return null;
        }

        const newDevice = DeviceFactory.fromObject(newDeviceData);
        await this.initDevice(newDevice);
        await (new DeviceModel(newDevice.toObject())).save();
        
        return newDevice;
    }

    async updateDevice(deviceId: string, updateDeviceData:{[index:string]:any}):Promise<BaseDevice> {
        const device:BaseDevice = this.getDeviceById(deviceId);
        for (const [k, v] of Object.entries(updateDeviceData)) {
            switch (k) {
                case 'name':
                    device.name = v;
                    break;
                case 'groupId':
                    device.groupId = v;
                    break;
            }
        }
        await DeviceModel.updateOne({ deviceId}, updateDeviceData);

        return device;
    }

    async deleteDevice(deviceId: string):Promise<void> {
        const device = this.getDeviceById(deviceId);
        if (device) {
            await device.disconnect();
            this.devices = this.devices.filter(d => d.deviceId !== deviceId );
            await DeviceModel.deleteOne({ deviceId });
        }
    }

    getAllDevices():Array<BaseDevice> {
        return this.devices;
    }

    getDeviceById(deviceId:string):BaseDevice {
        return this.devices.find(device => device.deviceId === deviceId);
    }

    getDevicesByGroupId(groupId:string):Array<BaseDevice> {
        return this.devices.filter(device => device.groupId === groupId) || [];
    }

    async loadAllFromDb():Promise<BaseDevice[]> {
        let devices:Array<BaseDevice> = [];
        try {
            devices = (await DeviceModel.find())
                .map(deviceDocument => DeviceFactory.fromObject({
                    deviceId: deviceDocument.get('deviceId'),
                    name: deviceDocument.get('name'),
                    key: deviceDocument.get('key'),
                    type: deviceDocument.get('type'),
                    status: {},
                    groupId: deviceDocument.get('groupId'),
                    isConnected: false
                })
            );
        } catch (error: any) {
            this.logger.error(`cannot load devices: ${error.message}`);
        }

        return devices;
    }

    get isInitialized():boolean {
        return this._isInitialized;
    }
}
