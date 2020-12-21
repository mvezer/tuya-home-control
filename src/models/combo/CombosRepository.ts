import * as mongoose from 'mongoose';
import Combo from './Combo';
import Logger from '../../handlers/Logger';

const ComboModel = mongoose.model('Combo', new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    comboId: { type: String, required: true, unique: true },
    icon: { type: String, optional: true },
    presets: { type: Array, optional: true },
}));

export default class CombosRepository {
    private combos:Array<Combo> = [];
    private _isInitialized: boolean;
    private logger:Logger;

    constructor() {
        this._isInitialized = false;
        this.logger = new Logger('CombosRepository');
    }

    async init(): Promise<void> {
        try {
            this.combos = await this.loadAllFromDb();
        } catch (error: any) {
            this.logger.error(`init: ${error.message}`);
        }

        this._isInitialized = true;
    }

    async add(comboData:{[index:string]:any}): Promise<Combo> {
        const newCombo = new Combo(comboData.name, comboData.icon || null, comboData.presets || []);

        this.combos.push(newCombo);
        await (new ComboModel(newCombo.toObject())).save();

        return newCombo;
    }

    async update(comboId: string, updateComboData:{[index:string]:any}): Promise<Combo> {
        const combo:Combo = this.getById(comboId);
        for (const [k, v] of Object.entries(updateComboData)) {
            switch (k) {
                case 'name':
                    combo.name = v;
                    break;
                case 'presets':
                    combo.presets = v;
                    break;
                case 'icon':
                    combo.icon = v;
                    break;
            }
        }
        await ComboModel.updateOne({comboId}, updateComboData);

        return combo;
    }

    async addPreset(comboId: string, presetId: string): Promise<Combo> {
        const combo:Combo = this.getById(comboId);
        if (combo.addPreset(presetId)) {
            await ComboModel.updateOne({comboId}, combo.toObject());

            return combo;
        }

        return null;
    }

    async removePreset(comboId: string, presetId: string): Promise<Combo> {
        const combo:Combo = this.getById(comboId);
        if (combo.removePreset(presetId)) {
            await ComboModel.updateOne({comboId}, combo.toObject());

            return combo;
        }

        return null;
    }

    async delete(comboId: string):Promise<void> {
        this.combos = this.combos.filter(c => c.comboId !== comboId);
        await ComboModel.deleteOne({ comboId });
    }

    async loadAllFromDb(): Promise<Combo[]> {
        let combos:Array<Combo> = [];
        try {
            combos = (await ComboModel.find())
                .map(comboDocument => new Combo(
                    comboDocument.get('name'),
                    comboDocument.get('comboId'),
                    comboDocument.get('presets')
                )            );
        } catch (error: any) {
            this.logger.error(`loading combos failed: ${error.message}`);
        }

        return combos;
    }

    getAll():Array<Combo> {
        return this.combos;
    }

    getById(comboId: string): Combo {
        return (this.combos.find(c => c.comboId === comboId));
    }

    getByName(comboName: string): Combo {
        return (this.combos.find(c => c.name === comboName));
    }

    get isInitialized():boolean {
        return this._isInitialized;
    }
}