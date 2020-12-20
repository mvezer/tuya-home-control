import { Request, Response } from 'express';
import BaseController from "./BaseController";
import Joi from 'joi';
import GroupsRepository from "../models/group/GroupsRepository";
import DevicesRepository from '../models/device/DevicesRepository';
import Group from '../models/group/Group';
import BaseDevice from '../models/device/BaseDevice';
import Logger from '../handlers/Logger';

const GROUP_ADD_SCHEMA = Joi.object().keys({
    name: Joi.string().required(),
});

const GROUP_UPDATE_SCHEMA = Joi.object().keys({
    name: Joi.string().optional(),
});

export default class GroupsController extends BaseController {
    private groupRepository:GroupsRepository;
    private deviceRepository:DevicesRepository;
    private logger:Logger;

    constructor(groupRepository:GroupsRepository, deviceRepository:DevicesRepository) {
        super();
        this.groupRepository = groupRepository;
        this.deviceRepository = deviceRepository;
        this.logger = new Logger('GroupsController');
    }

    async add(req: Request, res: Response):Promise<void> {
        try {
            await GROUP_ADD_SCHEMA.validateAsync(req.body);
        } catch (error) {
            this.respondError(res, `Cannot add group: ${error.message}`, 400);
            return;
        }

        const { name } = req.body;

        if (this.groupRepository.getGroupByName(name)) {
            this.respondError(res, `Cannot add group, because the name "${name}" is already registered`, 400);
            return;
        }

        let newGroup:Group;
        try {
            newGroup = await this.groupRepository.add(req.body.name);
        } catch (error:any) {
            this.respondError(res, `Cannot add group: ${error.message}`);
            return;
        }

        this.logger.info(`group (${name}) registered`);

        this.respondOk(res, newGroup.toObject());
    }

    async update(req: Request, res: Response): Promise<void> {
        const { groupId } = req.params;

        try {
            await GROUP_UPDATE_SCHEMA.validateAsync(req.body);
        } catch (error) {
            this.respondError(res, `Cannot update group: ${error.message}`, 400);
            return;
        }

        if (!this.groupRepository.getGroupById(groupId)) {
            this.respondError(res, `Cannot update group: group does not exist!`, 404);
            return;
        }

        try {
            await this.groupRepository.update(groupId, req.body);
        } catch (error:any) {
            this.respondError(res, `Cannot update group: ${error.message}`);
            return;
        }

        this.logger.info(`group (id: ${groupId}) has been updated`);

        this.respondOk(res);
    }

    async delete(req: Request, res: Response): Promise<void> {
        const { groupId } = req.params;
        
        if (!this.groupRepository.getGroupById(groupId)) {
            this.respondError(res, `Cannot delete group: group does not exist!`, 404);
            return;
        }
        const devicesInGroup:Array<BaseDevice> = this.deviceRepository.getDevicesByGroupId(groupId);
        try {
            await Promise.all(
                devicesInGroup.map(device => this.deviceRepository.updateDevice(device.deviceId, { groupId: null }))
            );
            this.groupRepository.delete(groupId);
        } catch (error:any) {
            this.respondError(res, `Cannot delete group: ${error.message}`);
            return;
        }

        this.logger.info(`group (id: ${groupId}) has been deleted`);

        this.respondOk(res);
    }

    getAll(req: Request, res: Response): void {
        const data = this.groupRepository
            .getAllGroups()
            .map(group => group.toObject());
        this.respondOk(res, data);
    }

    getById(req: Request, res: Response): void {
        const group = this.groupRepository.getGroupById(req.params.groupId);
        if (!group) {
            this.respondError(res, `Group does not exist!`, 404);
            return;
        }
        
        this.respondOk(res, group.toObject());
    }

    getDevicesByGroupId(req: Request, res: Response): void {
        const { groupId } = req.params;

        if (!this.groupRepository.getGroupById(groupId)) {
            this.respondError(res, `Group does not exist!`, 404);
            return;
        }

        this.respondOk(res, this.deviceRepository.getDevicesByGroupId(groupId));
    }

    async addDeviceToGroup(req: Request, res: Response): Promise<void> {
        const { groupId, deviceId } = req.params;

        if (!this.groupRepository.getGroupById(groupId)) {
            this.respondError(res, `Group does not exist!`, 404);
            return;
        }

        if (!this.deviceRepository.getDeviceById(deviceId)) {
            this.respondError(res, `Device does not exist!`, 404);
            return;
        }
        try {
            this.deviceRepository.updateDevice(deviceId, { groupId });
        } catch (error:any) {
            this.respondError(res, `Cannot update device: ${error.message}`, 500);
            return;
        }

        this.logger.info(`device (id: ${deviceId}) added to group (${groupId})`);

        this.respondOk(res, this.deviceRepository.getDeviceById(deviceId).toObject());
    }

    async removeDeviceFromGroup(req: Request, res: Response): Promise<void> {
        const { groupId, deviceId } = req.params;

        if (!this.groupRepository.getGroupById(groupId)) {
            this.respondError(res, `Group does not exist!`, 404);
            return;
        }

        const device:BaseDevice = this.deviceRepository.getDeviceById(deviceId);
        if (!device) {
            this.respondError(res, `Device does not exist!`, 404);
            return;
        }

        if (device.groupId !== req.params.groupId) {
            this.respondError(res, `Device ${deviceId} is not in group ${groupId}`, 500);
            return;
        }

        try {
            this.deviceRepository.updateDevice(deviceId, { groupId: null });
        } catch (error:any) {
            this.respondError(res, `Cannot update device: ${error.message}`, 500);
            return;
        }

        this.logger.info(`device (id: ${deviceId}) removed from group (${groupId})`);

        this.respondOk(res, this.deviceRepository.getDeviceById(deviceId).toObject());
    }

    async updateDeviceStatuses(req: Request, res: Response): Promise<void> {
        const { groupId } = req.params;

        if (!this.groupRepository.getGroupById(groupId)) {
            this.respondError(res, `Group does not exist!`, 404);
            return;
        }
        
        try {
            await this.applyDeviceStatusUpdate(groupId, req.body);
        } catch (error: any) {
            this.respondError(res, `Cannot update device: ${error.message}`, 500);
            return;
        }

        this.logger.info(`goup (${groupId}) status has been updated (data: ${req.body})`);

        this.respondOk(res);
    }

    async applyDeviceStatusUpdate(groupId: string, status: {[index: string]: any}):Promise<void> {
        const devices:Array<BaseDevice> = this.deviceRepository.getDevicesByGroupId(groupId);
        Promise.all(devices.map(device => {
            const validationResult = device.statusSchema.options({ stripUnknown: true }).validate(status)
            device.setStatus(validationResult.value);
        }));
    }
}