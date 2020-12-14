import BaseDevice from "./BaseDevice";

export default class PlugDevice extends BaseDevice {
    protected _dspMap:Map<string, string> = new Map<string, string>([['1', 'isOn']]);

    get dpsMap():Map<string, string> {
        return this._dspMap;
    }
}