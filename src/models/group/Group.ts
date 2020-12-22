import * as crypto from 'crypto';

export type TGroupData = {
    name: string,
    groupId: string,
    devices: Array<string>
}

export default class Group {
    private _name: string;
    private _groupId: string;
    private _devices: Array<string>;

    constructor(name: string, devices: Array<string> = [], groupId: string = null) {
        this._name = name;
        this._devices = devices;
        this._groupId = groupId
            ? groupId
            : this._groupId = crypto.randomBytes(20).toString('hex');
    }

    get name():string {
        return this._name;
    }

    set name(newName:string) {
        this._name = newName;
    }

    get groupId():string {
        return this._groupId;
    }

    get devices():Array<string> {
        return this._devices;
    }

    set devices(newDevices: Array<string>) {
        this._devices = newDevices;
    }

    toObject():TGroupData {
        return {
            name: this.name,
            groupId: this.groupId,
            devices: this.devices
        }
    }
}