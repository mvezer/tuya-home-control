import { Request, Response } from 'express';
import BaseController from './BaseController';
import Joi from 'joi';
import BaseDevice, { DEVICE_TYPES } from '../models/device/BaseDevice';
import DevicesRepository from '../models/device/DevicesRepository';
import Logger from '../handlers/Logger';

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
    private logger:Logger;

    constructor(deviceRepository:DevicesRepository) {
        super();
        this.deviceRepository = deviceRepository;
        this.logger = new Logger('DevicesController');
    }

    async add(req: Request, res: Response):Promise<void> {
        try {
            await DEVICE_ADD_SCHEMA.validateAsync(req.body);
        } catch (error) {
            this.respondError(res, `Cannot add device: ${error.message}`, 400);
            return;
        }

        let newDevice:BaseDevice;

        try {
            newDevice = await this.deviceRepository.addDevice(req.body)
        } catch (error) {
            this.respondError(res, `Cannot add device: ${error.getMessage()}`);
            return;
        }

        this.logger.info(`device (${newDevice.toString()}) has been added`);

        this.respondOk(res);
    }

    async update(req: Request, res: Response): Promise<void> {
        const { deviceId } = req.params;

        try {
            await DEVICE_UPDATE_SCHEMA.validateAsync(req.body);
        } catch (error) {
            this.respondError(res, `Cannot update device: ${error.message}`, 400);
            this.logger.error(`cannot update device (id: ${deviceId}): ${error.message}`);
            return;
        }

        if (!this.deviceRepository.getDeviceById(deviceId)) {
            this.respondError(res, `Cannot update device: device does not exist!`, 404);
            this.logger.error(`cannot update device (id: ${deviceId}): device does not exist!`);
            return;
        }

        let updatedDevice:BaseDevice;
        try {
            updatedDevice = await this.deviceRepository.updateDevice(deviceId, req.body);
        } catch (error) {
            this.respondError(res, `Cannot update device: ${error.message}`);
            this.logger.error(`cannot update device (id: ${deviceId}): ${error.message}`);
            return;
        }

        this.logger.info(`device (${updatedDevice.toString()}) has been updated`);

        this.respondOk(res);
    }

    async getDeviceStatus(req: Request, res: Response): Promise<void> {
        const { deviceId } = req.params;

        if (!this.deviceRepository.getDeviceById(deviceId)) {
            this.respondError(res, `cannot get device status: device does not exist!`, 404);
            this.logger.error(`cannot get device status (id: ${deviceId}): device does not exist`);
            return;
        }

        this.respondOk(res, this.deviceRepository.getDeviceById(deviceId).status);
    }

    async updatetDeviceStatus(req: Request, res: Response): Promise<void> {
        const { deviceId } = req.params;

        const device:BaseDevice = this.deviceRepository.getDeviceById(deviceId);
        if (!device) {
            this.respondError(res, `Cannot update device status: device does not exist!`, 404);
            this.logger.error(`cannot update device status (id: ${deviceId}): device does not exist`);
            return;
        }

        try {
            await device.statusSchema.validateAsync(req.body);
        } catch (error) {
            this.respondError(res, `Cannot update device status: ${error.message}`, 400);
            this.logger.error(`cannot update device status (id: ${deviceId}): ${error.message}`);
            return;
        }

        device.setStatus(req.body);

        this.logger.info(`device (${device.toString()}) status has been updated to: ${device.status}`);
        
        this.respondOk(res);
    }

    async delete(req: Request, res: Response):Promise<void> {
        const { deviceId } = req.params;

        try {
            await this.deviceRepository.deleteDevice(deviceId);
        } catch (error:any) {
            this.respondError(res, `Cannot delete device! ${error.message}`);
            this.logger.error(`cannot delete device (id: ${deviceId}): ${error.message}`);
            return;
        }

        this.logger.info(`device (id: ${deviceId}) has been deleted`);

        this.respondOk(res);
    }

    getAll(req: Request, res: Response): void {
        const data = this.deviceRepository
            .getAllDevices()
            .map(device => device.toObject());
        this.respondOk(res, data);
    }
}