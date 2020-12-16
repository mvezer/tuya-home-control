import { request, Request, Response } from 'express';
import BaseController from "./BaseController";
import Joi from 'joi';
import GroupRepository from "../models/GroupRepository";
import DeviceRepository from '../models/DeviceRepository';
import Group from '../models/Group';
import BaseDevice from '../models/BaseDevice';

const GROUP_ADD_SCHEMA = Joi.object().keys({
    name: Joi.string().required(),
});

const GROUP_UPDATE_SCHEMA = Joi.object().keys({
    name: Joi.string().optional(),
});

export default class GroupsController extends BaseController {
    private groupRepository:GroupRepository;
    private deviceRepository:DeviceRepository;

    constructor(groupRepository:GroupRepository, deviceRepository:DeviceRepository) {
        super();
        this.groupRepository = groupRepository;
        this.deviceRepository = deviceRepository;
    }

    async add(req: Request, res: Response):Promise<void> {
        try {
            await GROUP_ADD_SCHEMA.validateAsync(req.body);
        } catch (error) {
            res.status(400).json({ data: null, error: `Cannot add group: ${error.message}` });
            return;
        }

        const { name } = req.body;

        if (this.groupRepository.getGroupByName(name)) {
            res.status(400).json({ data: null, error: `Cannot add group, because the name "${name}" is already registered` });
            return;
        }

        let newGroup:Group;
        try {
            newGroup = await this.groupRepository.add(req.body.name);
        } catch (error:any) {
            this.respondError(res, `Cannot add group: ${error.message}`);
            return;
        }

        this.respondOk(res, newGroup.toObject());
    }

    async update(req: Request, res: Response): Promise<void> {
        try {
            await GROUP_UPDATE_SCHEMA.validateAsync(req.body);
        } catch (error) {
            this.respondError(res, `Cannot update group: ${error.message}`, 400);
            return;
        }

        if (!this.groupRepository.getGroupById(req.params.groupId)) {
            this.respondError(res, `Cannot update group: group does not exist!`, 404);
            return;
        }

        try {
            await this.groupRepository.update(req.params.groupId, req.body);
        } catch (error:any) {
            this.respondError(res, `Cannot update group: ${error.getMessage()}`);
            return;
        }

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
        if (!this.groupRepository.getGroupById(req.params.groupId)) {
            this.respondError(res, `Group does not exist!`, 404);
            return;
        }

        this.respondOk(res, this.deviceRepository.getDevicesByGroupId(req.params.groupId));
    }

    async addDeviceToGroup(req: Request, res: Response): Promise<void> {
        if (!this.groupRepository.getGroupById(req.params.groupId)) {
            this.respondError(res, `Group does not exist!`, 404);
            return;
        }

        if (!this.deviceRepository.getDeviceById(req.params.deviceId)) {
            this.respondError(res, `Device does not exist!`, 404);
            return;
        }
        try {
            this.deviceRepository.updateDevice(req.params.deviceId, { groupId: req.params.groupId });
        } catch (error:any) {
            this.respondError(res, `Cannot update device: ${error.message}`, 500);
            return;
        }

        this.respondOk(res, this.deviceRepository.getDeviceById(req.params.deviceId).toObject());
    }

    async removeDeviceFromGroup(req: Request, res: Response): Promise<void> {
        if (!this.groupRepository.getGroupById(req.params.groupId)) {
            this.respondError(res, `Group does not exist!`, 404);
            return;
        }

        const device:BaseDevice = this.deviceRepository.getDeviceById(req.params.deviceId);
        if (!device) {
            this.respondError(res, `Device does not exist!`, 404);
            return;
        }

        if (device.groupId != req.params.groupId) {
            this.respondError(res, `Device ${req.params.deviceId} is not in group ${req.params.groupId}`, 500);
            return;
        }

        try {
            this.deviceRepository.updateDevice(req.params.deviceId, { groupId: null });
        } catch (error:any) {
            this.respondError(res, `Cannot update device: ${error.message}`, 500);
            return;
        }

        this.respondOk(res, this.deviceRepository.getDeviceById(req.params.deviceId).toObject());
    }

    async updateDeviceStatuses(req: Request, res: Response): Promise<void> {
        if (!this.groupRepository.getGroupById(req.params.groupId)) {
            this.respondError(res, `Group does not exist!`, 404);
            return;
        }

        const devices:Array<BaseDevice> = this.deviceRepository.getDevicesByGroupId(req.params.groupId);
        try {
            Promise.all(devices.map(device => {
                const res = device.statusSchema.options({ stripUnknown: true }).validate(req.body)
                device.setStatus(res.value);
            }));
        } catch (error: any) {
            this.respondError(res, `Cannot update device: ${error.message}`, 500);
            return;
        }

        this.respondOk(res);
    }
}