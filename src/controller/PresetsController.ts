import { Request, Response } from 'express';
import BaseController from './BaseController';
import Joi from 'joi';
import Preset from '../models/Preset';
import PresetRepository from '../models/PresetRepository';
import GroupRepository from '../models/GroupRepository';
import GroupsController from './GroupsController';

const PRESET_ADD_SCHEMA = Joi.object().keys({
    groupId: Joi.string().required(),
    name: Joi.string().required(),
    status: Joi.object().required(),
});

const PRESET_UPDATE_SCHEMA = Joi.object().keys({
    groupId: Joi.string().optional(),
    name: Joi.string().optional(),
    status: Joi.object().optional(),
});

export default class PresetsController extends BaseController {
    private presetRepository:PresetRepository;
    private groupRepository:GroupRepository;
    private groupsController:GroupsController;

    constructor(presetRepository:PresetRepository, groupRepository:GroupRepository, groupsController:GroupsController) {
        super();
        this.presetRepository = presetRepository;
        this.groupRepository = groupRepository;
        this.groupsController = groupsController;
    }

    async add(req: Request, res: Response):Promise<void> {
        try {
            await PRESET_ADD_SCHEMA.validateAsync(req.body);
        } catch (error) {
            this.respondError(res, `Cannot add preset: ${error.message}`, 400);
            return;
        }

        if (!this.groupRepository.getGroupById(req.body.groupId)) {
            this.respondError(res, `Cannot add preset, group does not exist!`, 404);
            return;
        }

        try {
            await this.presetRepository.add(req.body)
        } catch (error:any) {
            this.respondError(res, `Cannot add preset: ${error.getMessage()}`);
            return;
        }

        this.respondOk(res);
    }

    async update(req: Request, res: Response): Promise<void> {
        const { presetId } = req.params;

        try {
            await PRESET_UPDATE_SCHEMA.validateAsync(req.body);
        } catch (error) {
            this.respondError(res, `Cannot update preset: ${error.message}`, 400);
            return;
        }

        if (!this.presetRepository.getById(presetId)) {
            this.respondError(res, `Preset does not exist!`, 404);
            return;
        }

        if (Object.prototype.hasOwnProperty.call(req.body, 'groupId') && !this.groupRepository.getGroupById(req.body.groupId)) {
            this.respondError(res, `Group does not exist!`, 404);
            return;
        }

        try {
            await this.presetRepository.update(presetId, req.body);
        } catch (error:any) {
            this.respondError(res, `Cannot update preset: ${error.message}`);
            return;
        }

        this.respondOk(res);
    }

    async delete(req: Request, res: Response):Promise<void> {
        const { presetId } = req.params;

        try {
            await this.presetRepository.delete(presetId);
        } catch (error:any) {
            this.respondError(res, `Cannot delete preset! ${error.message}`);
            return;
        }

        this.respondOk(res);
    }

    async apply(req: Request, res: Response):Promise<void> {
        const { presetId } = req.params;

        const preset:Preset = this.presetRepository.getById(presetId);

        if (!preset) {
            this.respondError(res, `Preset does not exist!`, 404);
            return;
        }

        try {
            await this.groupsController.applyDeviceStatusUpdate(preset.groupId, preset.status);
        } catch (error: any) {
            this.respondError(res, `Cannot apply preset: ${error.message}`);
            return;
        }

        this.respondOk(res);
    }

    getAll(req: Request, res: Response): void {
        const data = this.presetRepository
            .getAll()
            .map(preset => preset.toObject());
        this.respondOk(res, data);
    }

    getById(req: Request, res: Response): void {
        const preset:Preset = this.presetRepository.getById(req.params.presetId);

        if (!preset) {
            this.respondError(res, `Cannot find preset!`, 404);
            return;
        }

        this.respondOk(res, preset.toObject());
    }
}