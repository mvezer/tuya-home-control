import { Request, Response } from 'express';
import BaseController from './BaseController';
import Joi from 'joi';
import BaseDevice, { DEVICE_TYPES } from '../models/device/BaseDevice';
import DevicesRepository from '../models/device/DevicesRepository';

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
    private deviceRepository:DevicesRepository;

    constructor(deviceRepository:DevicesRepository) {
        super();
        this.deviceRepository = deviceRepository;
    }

    async add(req: Request, res: Response):Promise<void> {
        try {
            await DEVICE_ADD_SCHEMA.validateAsync(req.body);
        } catch (error) {
            this.respondError(res, `Cannot add device: ${error.message}`, 400);
            return;
        }

        try {
            await this.deviceRepository.addDevice(req.body)
        } catch (error) {
            this.respondError(res, `Cannot add device: ${error.getMessage()}`);
            return;
        }

        this.respondOk(res);
    }

    async update(req: Request, res: Response): Promise<void> {
        const { deviceId } = req.params;

        try {
            await DEVICE_UPDATE_SCHEMA.validateAsync(req.body);
        } catch (error) {
            this.respondError(res, `Cannot update device: ${error.message}`, 400);
            return;
        }

        if (!this.deviceRepository.getDeviceById(deviceId)) {
            this.respondError(res, `Cannot update device: device does not exist!`, 404);
            return;
        }

        try {
            await this.deviceRepository.updateDevice(deviceId, req.body);
        } catch (error) {
            this.respondError(res, `Cannot update device: ${error.getMessage()}`);
            return;
        }

        this.respondOk(res);
    }

    async getDeviceStatus(req: Request, res: Response): Promise<void> {
        const { deviceId } = req.params;

        if (!this.deviceRepository.getDeviceById(deviceId)) {
            this.respondError(res, `Cannot update device: device does not exist!`, 404);
            return;
        }

        this.respondOk(res, this.deviceRepository.getDeviceById(deviceId).status);
    }

    async updatetDeviceStatus(req: Request, res: Response): Promise<void> {
        const { deviceId } = req.params;

        const device:BaseDevice = this.deviceRepository.getDeviceById(deviceId);
        if (!device) {
            this.respondError(res, `Cannot update device: device does not exist!`, 404);
            return;
        }

        try {
            await device.statusSchema.validateAsync(req.body);
        } catch (error) {
            this.respondError(res, `Cannot update device status: ${error.message}`, 400);
            return;
        }

        device.setStatus(req.body);
        
        this.respondOk(res);
    }

    async delete(req: Request, res: Response):Promise<void> {
        const { deviceId } = req.params;

        try {
            await this.deviceRepository.deleteDevice(deviceId);
        } catch (error:any) {
            this.respondError(res, `Cannot delete device! ${error.message}`);
            return;
        }

        this.respondOk(res);
    }

    getAll(req: Request, res: Response): void {
        const data = this.deviceRepository
            .getAllDevices()
            .map(device => device.toObject());
        this.respondOk(res, data);
    }
}