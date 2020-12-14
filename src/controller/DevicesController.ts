import { Request, Response } from 'express';
import Joi from 'joi';
import {DEVICE_TYPES, TDeviceData} from '../models/BaseDevice';
import DeviceFactory from '../models/DeviceFactory';
import DeviceRepository from '../models/DeviceRepository';

const DEVICE_ADD_SCHEMA = Joi.object().keys({
    deviceId: Joi.string().required(),
    name: Joi.string().required(),
    key: Joi.string().required(),
    type: Joi.string().required().valid(...DEVICE_TYPES),
})

export default class DevicesController {
    private deviceRepository:DeviceRepository;

    constructor() {
        this.deviceRepository = new DeviceRepository();
        this.deviceRepository.init();
    }

    async add(req: Request, res: Response):Promise<void> {
        try {
            await DEVICE_ADD_SCHEMA.validateAsync(req.body);
        } catch (error) {
            res.status(400).json({ data: null, error: `Cannot add device: ${error.message}` });
            return;
        }

        try {
            await this.deviceRepository.addDevice(req.body)
        } catch (error:any) {
            res.status(500).json({ data: null, error: `Cannot add device: ${error.getMessage()}` });
            return;
        }

        res.status(200).json({ data: 'OK', error: null});
    }
}