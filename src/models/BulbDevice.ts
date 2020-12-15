import Joi from 'joi';
import BaseDevice from "./BaseDevice";

const BULB_MODES = [ 'white', 'colour' ];

export default class BulbDevice extends BaseDevice {
    protected _dspMap:Map<string, string> = new Map<string, string>([['20', 'isOn'], ['21', 'mode'], ['22', 'intensity'], ['24', 'rgb']]);

    private _statusSchema = Joi.object().keys({
        isOn: Joi.boolean().optional(),
        mode: Joi.string().optional().valid(...BULB_MODES),
        intensity: Joi.number().optional(),
        rgb: Joi.string().optional(),
    });

    get dpsMap():Map<string, string> {
        return this._dspMap;
    }

    get statusSchema():any {
        return this._statusSchema;
    }
}
