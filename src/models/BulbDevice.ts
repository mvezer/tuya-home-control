import BaseDevice from "./BaseDevice";

export default class BulbDevice extends BaseDevice {

    protected _dspMap:Map<string, string> = new Map<string, string>([['20', 'isOn'], ['21', 'mode'], ['22', 'intensity'], ['24', 'rgb']]);

    get dpsMap():Map<string, string> {
        return this._dspMap;
    }
    
}