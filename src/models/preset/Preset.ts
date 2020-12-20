import * as crypto from 'crypto';

export type TPresetData = {
    name: string,
    presetId: string,
    groupId: string,
    status: any;
}

export default class Preset {
    private _name: string;
    private _presetId: string;
    private _groupId: string;
    private _status: any;

    static fromDbData(presetData: TPresetData):Preset {
        return new Preset(
            presetData.name,
            presetData.groupId,
            presetData.status,
            presetData.presetId
        );
    }

    static fromObject(presetData:{[index:string]:any}):Preset {
        return new Preset(
            presetData.name,
            presetData.groupId,
            presetData.status
        );
    }

    constructor(name: string, groupId: string, status:{[index:string]:any}, presetId: string = null) {
        this._name = name;
        this._groupId = groupId;
        this._status = status;
        this._presetId = presetId
            ? presetId
            : crypto.randomBytes(20).toString('hex');
    }

    get name():string {
        return this._name;
    }

    set name(newName:string) {
        this._name = newName;
    }

    get status():{[index:string]:any} {
        return this._status;
    }

    set status(newStatus:{[index:string]:any}) {
        this._status = newStatus;
    }

    get groupId():string {
        return this._groupId;
    }

    set groupId(newGroupId: string) {
        this._groupId = newGroupId;
    }

    get presetId():string {
        return this._presetId;
    }

    toObject():TPresetData {
        return {
            name: this._name,
            presetId:this._presetId,
            groupId: this._groupId,
            status: this._status
        }
    }
}