import { Request, Response } from 'express';
import BaseController from './BaseController';
import Joi from 'joi';
import Preset from '../models/preset/Preset';
import PresetsRepository from '../models/preset/PresetsRepository';
import GroupsRepository from '../models/group/GroupsRepository';
import GroupsController from './GroupsController';
import Logger from '../handlers/Logger';

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
    private presetRepository:PresetsRepository;
    private groupRepository:GroupsRepository;
    private groupsController:GroupsController;
    private logger:Logger;

    constructor(presetRepository:PresetsRepository, groupRepository:GroupsRepository, groupsController:GroupsController) {
        super();
        this.presetRepository = presetRepository;
        this.groupRepository = groupRepository;
        this.groupsController = groupsController;
        this.logger = new Logger('PresetRepository');
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

        let preset:Preset;

        try {
            preset = await this.presetRepository.add(req.body)
        } catch (error:any) {
            this.respondError(res, `Cannot add preset: ${error.getMessage()}`);
            return;
        }

        this.logger.info(`preset (id: ${preset.presetId}) has been  added`);

        this.respondOk(res, preset.toObject());
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

        let preset:Preset;

        try {
            preset = await this.presetRepository.update(presetId, req.body);
        } catch (error:any) {
            this.respondError(res, `Cannot update preset: ${error.message}`);
            return;
        }

        this.logger.info(`preset (id: ${preset.presetId}) has been updated`);

        this.respondOk(res, preset.toObject());
    }

    async delete(req: Request, res: Response):Promise<void> {
        const { presetId } = req.params;

        try {
            await this.presetRepository.delete(presetId);
        } catch (error:any) {
            this.respondError(res, `Cannot delete preset! ${error.message}`);
            return;
        }

        this.logger.info(`preset (id: ${presetId}) has been deleted`);

        this.respondOk(res);
    }

    async apply(req: Request, res: Response):Promise<void> {
        const { presetId } = req.params;

        let preset:Preset;
        
        try {
            preset = await this.applyPreset(presetId);
        } catch (error:any) {
            this.respondError(res, `Cannot apply preset: ${error.message}`);
        }

        this.logger.info(`preset (id: ${preset.presetId}) has been applied`);

        this.respondOk(res);
    }

    public async applyPreset(presetId:string):Promise<Preset> {
        const preset:Preset = this.presetRepository.getById(presetId);

        if (!preset) {
            throw new Error('preset does not exist');
        }

        await this.groupsController.applyDeviceStatusUpdate(preset.groupId, preset.status);

        return preset;
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