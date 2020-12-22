import Logger from '../../handlers/Logger';
const TuyaDevice = require('tuyapi');  // eslint-disable-line @typescript-eslint/no-var-requires


export const DEVICE_TYPES = ['rgb_bulb', 'plug'];
export const TICK_TIMEOUT = 10;
export const HEARTBEAT_TIMEOUT = 15;

export type TDeviceData = {
    deviceId: string,
    key: string,
    name: string,
    type: string,
    isConnected: boolean,
    status: any,
}

export default abstract class BaseDevice {
    private _name: string;
    private _deviceId: string;
    private _key: string;
    private _type: string;
    private _status:{ [index:string] : string };
    private _tuyaDevice:any;
    private _lastHeartbeat:number;
    private _firstConnectAttempt:boolean;
    private _heartBeatTimeout:any;
    private logger:Logger;

    private _onData:(handlerData:TDeviceData, error: any) => void;
    private _onError:(handlerData:TDeviceData, error: any) => void;
    private _onConnected:(handlerData:TDeviceData, error: any ) => void;
    private _onDisconnected:(handlerData:TDeviceData, error: any) => void;

    constructor(deviceData:TDeviceData) {
        this._deviceId = deviceData.deviceId;
        this._name = deviceData.name;
        this._key = deviceData.key;
        this._type = deviceData.type;
        this._status = {};
        this._firstConnectAttempt = true;
        this.logger = new Logger(deviceData.type === 'plug' ? 'PlugDevice' : 'RGBbulbDevice');
    }

    public async connect(): Promise<void> {
        this._tuyaDevice = new TuyaDevice({ id: this._deviceId, key: this._key });
        this.logger.info(`${this.logger.surround(this.toString())} connecting...`);

        this._tuyaDevice.on('connected', this.handleConnected.bind(this));
        this._tuyaDevice.on('disconnected', this.handleDisconnected.bind(this));
        this._tuyaDevice.on('data', this.handleData.bind(this));
        this._tuyaDevice.on('error', this.handleError.bind(this));
        this._tuyaDevice.on('heartbeat', this.handleHeartbeat.bind(this));

        try {
            await this._tuyaDevice.find();
            await this._tuyaDevice.connect();
        } catch (error:any) {
            this.logger.error(`${this.logger.surround(this.toString())} connection failed: ${error}`);
        } finally {
            if (this._firstConnectAttempt) {
                this._firstConnectAttempt = false;
                setTimeout(this.tick.bind(this), TICK_TIMEOUT * 1000);
            }
        }
    }

    public async disconnect(): Promise<void> {
        if (this.isConnected) {
            await this._tuyaDevice.disconnect();
            this._tuyaDevice.removeAllListeners();
        }

        if (this._heartBeatTimeout) {
            clearTimeout(this._heartBeatTimeout);
        }
    }

    private handleConnected() {
        this.logger.info(`${this.logger.surround(this.toString())} connected`);
        if (this._onConnected) {
            this._onConnected(this.toObject(), null);
        }
    }

    private handleDisconnected() {
        this.logger.info(`${this.logger.surround(this.toString())} disconnected`);
        if (this._onDisconnected) {
            this._onDisconnected(this.toObject(), null);
        }
    }

    private handleError(error:any) {
        this.logger.error(`${this.logger.surround(this.toString())} ${error}`);
        if (this._onError) {
            this._onError(this.toObject(), error);
        }
    }

    private async handleData(data:any) {
        this.logger.info(`${this.logger.surround(this.toString())} data received`);
        
        let dps = {};

        try {
            dps = data['dps'];

            this.updateStatusFromDPS(dps);

            if (this._onData) {
                await this._onData(this.toObject(), null);
            }

        } catch (error: any) {
            this.logger.error(`${this.logger.surround(this.toString())} parse error: ${error},\n     data: ${data}`);
        }
    }

    private handleHeartbeat():void {
        this._lastHeartbeat = Math.floor(Date.now()/1000);
    }

    private tick():void {
        const currentTimestamp = Math.floor(Date.now()/1000);

        if (!this.isConnected || (currentTimestamp - this._lastHeartbeat) > HEARTBEAT_TIMEOUT) {
            this.connect();
        }

        this._heartBeatTimeout = setTimeout(this.tick.bind(this), TICK_TIMEOUT * 1000);
    }

    private updateStatusFromDPS(dps:{[index:string]:any}): void {
        for (const [dpsKey, dpsValue] of Object.entries(dps)) {
            if (this.dpsMap.has(dpsKey)) {
                this._status[this.dpsMap.get(dpsKey)] = dpsValue;
            }
        }
    }

    private getDPSkey(statusKey: string): string {
        const res = [...this.dpsMap.entries()]
            .filter((dpsEntry) => dpsEntry[1] === statusKey);

        return res && res.length ? res[0][0] : null;
    }

    get status(): { [index:string]:string } {
        return this._status;
    }

    async setStatus(newStatus: { [index:string]:string }):Promise<void> {
        const dpsDto:{ [index:string]:string } = {}
        for (const [statusKey, statusValue] of Object.entries(newStatus)) {
            const dpsKey = this.getDPSkey(statusKey);
            if (null !== dpsKey) {
                this._status[statusKey] = statusValue;
                dpsDto[dpsKey] = statusValue;
            }
        }

        if (this.isConnected && {} !== dpsDto) {
            try {
                await this._tuyaDevice.set({ multiple: true, data: dpsDto });
                this.logger.info(`${this.logger.surround(this.toString())} status set to: ${newStatus}`);
            } catch (error: any) {
                this.logger.error(`${this.logger.surround(this.toString())} could not set status: ${error}`)
            }
        }
    }

    get name(): string {
        return this._name;
    }

    set name(newName: string) {
        this._name;
    }

    get type(): string {
        return this._type;
    }

    get key(): string {
        return this._key;
    }

    get deviceId(): string {
        return this._deviceId;
    }

    get isConnected(): boolean {
        return this._tuyaDevice && this._tuyaDevice.isConnected();
    }

    get onData():(handlerData:TDeviceData, error: any) => void {
        return this._onData;
    }

    set onData(handlerFunction: (handlerData:TDeviceData, error: any) => void) {
        this._onData = handlerFunction;
    }

    abstract get dpsMap():Map<string, string>;

    abstract get statusSchema():any;

    toString(fullData = false):string {
        if (!fullData) {
            return `${this.name} (${this.deviceId})`;
        }

        return `name: ${this.name}\ntype: ${this.type}\nid: ${this.deviceId}\nkey: ${this.key}`;
    }

    toObject():TDeviceData {
        return {
            deviceId: this.deviceId,
            name: this.name,
            key: this.key,
            type: this.type,
            isConnected: this.isConnected,
            status: this.status,
        };
    }

}