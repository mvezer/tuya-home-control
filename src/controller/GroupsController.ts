import { Request, Response } from 'express';
import BaseController from "./BaseController";
import Joi from 'joi';
import GroupsRepository from "../models/group/GroupsRepository";
import DevicesRepository from '../models/device/DevicesRepository';
import Group from '../models/group/Group';
import Logger from '../handlers/Logger';

const GROUP_ADD_SCHEMA = Joi.object().keys({
    name: Joi.string().required(),
    devices: Joi.array().optional(),
});

const GROUP_UPDATE_SCHEMA = Joi.object().keys({
    name: Joi.string().optional(),
    devices: Joi.array().optional(),
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

        const { name, devices } = req.body;

        if (this.groupRepository.getGroupByName(name)) {
            this.respondError(res, `Cannot add group, because the name "${name}" is already registered`, 400);
            return;
        }

        let newGroup:Group;
        try {
            newGroup = await this.groupRepository.add(name, devices || []);
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
            this.respondError(res, `group does not exist!`, 404);
            return;
        }

        try {
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

        const group = this.groupRepository.getGroupById(groupId);

        if (!group) {
            this.respondError(res, `Group does not exist!`, 404);
            return;
        }

        this.respondOk(res, group.devices);
    }

    async addDeviceToGroup(req: Request, res: Response): Promise<void> {
        const { groupId } = req.params;

        const group = this.groupRepository.getGroupById(groupId);

        if (!group) {
            this.respondError(res, `Group does not exist!`, 404);
            return;
        }

        const deviceIds = [];

        if (Object.prototype.hasOwnProperty.call(req.params, 'deviceId')) {
            deviceIds.push(req.params.deviceId);
        }

        if (req.body && Object.prototype.hasOwnProperty.call(req.body, 'devices')) {
            deviceIds.push(req.body.devices);
        }

        deviceIds.forEach(deviceId => {
            if (group.devices.includes(deviceId)) {
                this.respondError(res, `device (id: ${deviceId}) already exists in group`, 400);
                return;
            }

            if (!this.deviceRepository.getDeviceById(deviceId)) {
                this.respondError(res, `Device does not exist!`, 404);
                return;
            }

            group.devices.push(deviceId);
        });

        try {
            await this.groupRepository.update(groupId, req.body);
        } catch (error:any) {
            this.respondError(res, `Cannot update group: ${error.message}`);
            return;
        }

        this.logger.info(`device(s) added to group (id: ${groupId})`);

        this.respondOk(res, group.toObject());
    }

    async removeDeviceFromGroup(req: Request, res: Response): Promise<void> {
        const { groupId } = req.params;

        const group = this.groupRepository.getGroupById(groupId);

        if (!group) {
            this.respondError(res, `Group does not exist!`, 404);
            return;
        }

        const deviceIds = [];

        if (Object.prototype.hasOwnProperty.call(req.params, 'deviceId')) {
            deviceIds.push(req.params.deviceId);
        }

        if (req.body && Object.prototype.hasOwnProperty.call(req.body, 'devices')) {
            deviceIds.push(req.body.devices);
        }
        
        group.devices = deviceIds.filter(id => !group.devices.includes(id));

        try {
            await this.groupRepository.update(groupId, req.body);
        } catch (error:any) {
            this.respondError(res, `Cannot update group: ${error.message}`);
            return;
        }

        this.logger.info(`device(s) removed from group (id: ${groupId})`);

        this.respondOk(res, group.toObject());
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
        Promise.all(
            this.groupRepository.getGroupById(groupId)
                .devices
                .map(deviceId => {
                    const device = this.deviceRepository.getDeviceById(deviceId);
                    const validationResult = device.statusSchema.options({ stripUnknown: true }).validate(status);
                    device.setStatus(validationResult.value);
                })
        );
    }
}