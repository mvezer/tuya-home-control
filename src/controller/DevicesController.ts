import { Request, Response } from 'express';
import Joi from 'joi';
import { DEVICE_TYPES } from '../models/BaseDevice';
import DeviceRepository from '../models/DeviceRepository';

const DEVICE_ADD_SCHEMA = Joi.object().keys({
    deviceId: Joi.string().required(),
    name: Joi.string().required(),
    key: Joi.string().required(),
    type: Joi.string().required().valid(...DEVICE_TYPES),
});

const DEVICE_UPDATE_SCHEMA = Joi.object().keys({
    name: Joi.string().optional(),
    groupId: Joi.string().optional()
});

export default class DevicesController {
    private deviceRepository:DeviceRepository;

    constructor(deviceRepository:DeviceRepository) {
        this.deviceRepository = deviceRepository;
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

    async update(req: Request, res: Response): Promise<void> {
        try {
            await DEVICE_UPDATE_SCHEMA.validateAsync(req.body);
        } catch (error) {
            res.status(400).json({ data: null, error: `Cannot update device: ${error.message}` });
            return;
        }

        if (!(await this.deviceRepository.getDeviceById(req.params.deviceId))) {
            res.status(404).json({ data: null, error: `Cannot update device: device does not exist!` });
            return;
        }

        try {
            await this.deviceRepository.updateDevice(req.params.deviceId, req.body);
        } catch (error:any) {
            res.status(500).json({ data: null, error: `Cannot update device: ${error.getMessage()}` });
            return;
        }

        res.status(200).json({ data: 'OK', error: null});
    }

    getAll(req: Request, res: Response): void {
        const data = this.deviceRepository
            .getAllDevices()
            .map(device => device.toObject());
        res.status(200).json({ data, error: null });
    }
}