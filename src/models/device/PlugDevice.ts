import Joi from 'joi';
import BaseDevice from "./BaseDevice";

export default class PlugDevice extends BaseDevice {
    protected _dspMap:Map<string, string> = new Map<string, string>([['1', 'isOn']]);

    private _statusSchema = Joi.object().keys({
        isOn: Joi.boolean().optional(),
    });

    get dpsMap():Map<string, string> {
        return this._dspMap;
    }

    get statusSchema():any {
        return this._statusSchema;
    }
}