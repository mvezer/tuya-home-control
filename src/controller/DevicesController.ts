import { Request, Response } from 'express';
import BaseController from './BaseController';
import Joi from 'joi';
import BaseDevice, { DEVICE_TYPES } from '../models/BaseDevice';
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

export default class DevicesController extends BaseController {
    private deviceRepository:DeviceRepository;

    constructor(deviceRepository:DeviceRepository) {
        super();
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
            this.respondError(res, `Cannot add device: ${error.getMessage()}`);
            return;
        }

        this.respondOk(res);
    }

    async update(req: Request, res: Response): Promise<void> {
        try {
            await DEVICE_UPDATE_SCHEMA.validateAsync(req.body);
        } catch (error) {
            this.respondError(res, `Cannot update device: ${error.message}`, 400);
            return;
        }

        if (!this.deviceRepository.getDeviceById(req.params.deviceId)) {
            this.respondError(res, `Cannot update device: device does not exist!`, 404);
            return;
        }

        try {
            await this.deviceRepository.updateDevice(req.params.deviceId, req.body);
        } catch (error:any) {
            this.respondError(res, `Cannot update device: ${error.getMessage()}`);
            return;
        }

        this.respondOk(res);
    }

    async getDeviceStatus(req: Request, res: Response): Promise<void> {
        if (!this.deviceRepository.getDeviceById(req.params.deviceId)) {
            this.respondError(res, `Cannot update device: device does not exist!`, 404);
            return;
        }
        this.respondOk(res, this.deviceRepository.getDeviceById(req.params.deviceId).status);
    }

    async updatetDeviceStatus(req: Request, res: Response): Promise<void> {
        const device:BaseDevice = this.deviceRepository.getDeviceById(req.params.deviceId);
        if (!device) {
            this.respondError(res, `Cannot update device: device does not exist!`, 404);
            return;
        }

        try {
            await device.statusSchema.validateAsync(req.body);
        } catch (error) {
            res.status(400).json({ data: null, error: `Cannot update device status device: ${error.message}` });
            return;
        }

        device.setStatus(req.body);
        
        this.respondOk(res);
    }

    getAll(req: Request, res: Response): void {
        const data = this.deviceRepository
            .getAllDevices()
            .map(device => device.toObject());
        this.respondOk(res, data);
    }
}