import { Request, Response } from 'express';
import BaseController from './BaseController';
import Joi from 'joi';
import CombosRepository from '../models/combo/CombosRepository';
import PresetsController from './PresetsController';
import Logger from '../handlers/Logger';
import Combo from '../models/combo/Combo';
import PresetsRepository from '../models/preset/PresetsRepository';

const COMBO_ADD_SCHEMA = Joi.object().keys({
    name: Joi.string().required(),
    presets: Joi.array().optional(),
    icon: Joi.string().optional(),
});

const COMBO_UPDATE_SCHEMA = Joi.object().keys({
    name: Joi.string().optional(),
    presets: Joi.array().optional(),
    icon: Joi.string().optional(),
});

export default class CombosController extends BaseController {
    private combosRepository:CombosRepository;
    private presetsController:PresetsController;
    private presetsRepository:PresetsRepository;
    private logger:Logger;

    constructor(combosRepository:CombosRepository, presetsRepository:PresetsRepository, presetsController:PresetsController) {
        super();
        this.combosRepository = combosRepository;
        this.presetsRepository = presetsRepository;
        this.presetsController = presetsController;
        this.logger = new Logger('CombosController');
    }

    async add(req: Request, res: Response):Promise<void> {
        try {
            await COMBO_ADD_SCHEMA.validateAsync(req.body);
        } catch (error) {
            this.respondError(res, `Cannot add combo: ${error.message}`, 400);
            return;
        }

        let combo:Combo;

        try {
            combo = await this.combosRepository.add(req.body)
        } catch (error:any) {
            this.respondError(res, `Cannot add combo: ${error.message}`);
            return;
        }

        this.logger.info(`combo (id: ${combo.comboId}) has been  added`);

        this.respondOk(res, combo.toObject());
    }

    async update(req: Request, res: Response): Promise<void> {
        const { comboId } = req.params;

        try {
            await COMBO_UPDATE_SCHEMA.validateAsync(req.body);
        } catch (error) {
            this.respondError(res, `Cannot update combo: ${error.message}`, 400);
            return;
        }

        if (!this.combosRepository.getById(comboId)) {
            this.respondError(res, `combo does not exist!`, 404);
            return;
        }

        let combo:Combo;

        try {
            combo = await this.combosRepository.update(comboId, req.body);
        } catch (error:any) {
            this.respondError(res, `Cannot update combo: ${error.message}`);
            return;
        }

        this.logger.info(`preset (id: ${combo.comboId}) has been updated`);

        this.respondOk(res, combo.toObject());
    }

    async delete(req: Request, res: Response):Promise<void> {
        const { comboId } = req.params;

        try {
            await this.combosRepository.delete(comboId);
        } catch (error:any) {
            this.respondError(res, `Cannot delete combo! ${error.message}`);
            return;
        }

        this.logger.info(`combo (id: ${comboId}) has been deleted`);

        this.respondOk(res);
    }

    async apply(req: Request, res: Response):Promise<void> {
        const { comboId } = req.params;

        const combo:Combo = this.combosRepository.getById(comboId);

        if (!combo) {
            this.respondError(res, `combo does not exist!`, 404);
            return;
        }

        try {
            await Promise.all(combo.presets.map((presetId:string) => this.presetsController.applyPreset(presetId)));
        } catch (error: any) {
            this.respondError(res, `Cannot apply combo: ${error.message}`);
            return;
        }

        this.logger.info(`combo (id: ${combo.comboId}) has been applied`);

        this.respondOk(res);
    }

    async addPreset(req: Request, res: Response): Promise<void> {
        const { comboId, presetId } = req.params;

        if (!this.combosRepository.getById(comboId)) {
            this.respondError(res, `combo does not exist!`, 404);
            return;
        }

        if (!this.presetsRepository.getById(presetId)) {
            this.respondError(res, `preset does not exist!`, 404);
            return;
        }

        try {
            await this.combosRepository.addPreset(comboId, presetId);
        } catch (error: any) {
            this.respondError(res, `Cannot add preset to combo: ${error.message}`);
            return;
        }

        this.logger.info(`preset (id: ${presetId}) has been added to combo (is: ${comboId})`);

        this.respondOk(res);
    }

    async removePreset(req: Request, res: Response): Promise<void> {
        const { comboId, presetId } = req.params;

        if (!this.combosRepository.getById(comboId)) {
            this.respondError(res, `combo does not exist!`, 404);
            return;
        }

        try {
            await this.combosRepository.removePreset(comboId, presetId);
        } catch (error: any) {
            this.respondError(res, `preset cannot add remove from combo: ${error.message}`);
            return;
        }

        this.logger.info(`preset (id: ${presetId}) has been removed from combo (is: ${comboId})`);

        this.respondOk(res);
    }

    getPresets(req: Request, res: Response): void {
        const { comboId } = req.params;

        const combo:Combo = this.combosRepository.getById(comboId);

        if (!combo) {
            this.respondError(res, `combo does not exist!`, 404);
            return;
        }

        this.respondOk(res, combo.presets);
    }

    getAll(req: Request, res: Response): void {
        const data = this.combosRepository
            .getAll()
            .map(combo => combo.toObject());
        this.respondOk(res, data);
    }

    getById(req: Request, res: Response): void {
        const combo:Combo = this.combosRepository.getById(req.params.comboId);

        if (!combo) {
            this.respondError(res, `Cannot find combo!`, 404);
            return;
        }

        this.respondOk(res, combo.toObject());
    }
}