import * as mongoose from 'mongoose';
import MongoDbHandler from '../handlers/MongoDbHandler';
import BaseDevice, {TDeviceData} from './BaseDevice';
import DeviceFactory from './DeviceFactory';
const DEVICE_TYPES = ['rgb_bulb', 'plug'];

const DeviceModel = mongoose.model('Device', new mongoose.Schema({
    deviceId: { type: String, required: true, unique: true },
    key: { type: String, required: true },
    type: { type: String, enum: DEVICE_TYPES, required: true },
    name: { type: String, required: true },
    groupId: { type: String, required: false }
}));

export default class DeviceRepository {
    private devices:Array<BaseDevice> = [];
    private _db:MongoDbHandler
    private _isInitialized:boolean = false;

    constructor() {
        this._db = new MongoDbHandler(
            process.env['MONGODB_URL'],
            parseInt(process.env['MONGODB_PORT'], 10),
            process.env['MONGODB_NAME'],
        );
    }

    async init():Promise<void> {
        try {
            await this._db.connect();
            (await this.loadAllFromDb()).map(device => this.initDevice(device), this);
        } catch (error: any) {
            console.error(`[DeviceRepository] ERROR in init: ${error.message}`);
        }

        this._isInitialized = true;
    }

    async initDevice(device:BaseDevice): Promise<void> {
        device.onData = this.onDeviceData.bind(this);
        await device.connect();
        this.devices.push(device);
    }

    async onDeviceData(handlerData:TDeviceData, error: any): Promise<void> {
        console.log(JSON.stringify(handlerData, null, 4));
    }

    async addDevice(newDeviceData:TDeviceData):Promise<void> {
        if (this.getDeviceById(newDeviceData.deviceId)) {
            throw new Error(`[DeviceRepository] ERROR: cannot add device, device (deviceId: $newDeviceData.deviceId}) already exists`);
        } else {
            const newDevice = DeviceFactory.fromObject(newDeviceData);
            await this.initDevice(newDevice);
            await (new DeviceModel(newDevice.toObject())).save();
        }
    }

    getDeviceById(deviceId:string):BaseDevice {
        return this.devices.find(device => device.deviceId === deviceId);
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
            console.error(`[DeviceRepository] ERROR in init: ${error.message}`);
        }

        return devices;
    }

    get isInitialized():boolean {
        return this._isInitialized;
    }
}
