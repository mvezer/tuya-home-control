import * as mongoose from 'mongoose';
import Preset from './Preset';
import Logger from '../../handlers/Logger';

const PresetModel = mongoose.model('Preset', new mongoose.Schema({
    presetId: { type: String, required: true, unique: true },
    groupId: { type: String, required: true },
    name: { type: String, required: true, unique: true },
    status: { type: Object, required: true }
}));

export default class PresetsRepository {
    private presets:Array<Preset> = [];
    private _isInitialized:boolean;
    private logger:Logger;

    constructor() {
        this._isInitialized = false;
        this.logger = new Logger('PresetsRepository');
    }

    async init():Promise<void> {
        this.presets = await this.loadAllFromDb();

        this._isInitialized = true;
    }

    getById(presetId: string): Preset {
        return this.presets.find(preset => preset.presetId === presetId);
    }

    async add(newPresetData: {[ index:string]: any }):Promise<Preset> {
        if (this.getById(newPresetData.presetId)) {
            throw new Error(`cannot add preset, preset already exists`);

            return null;
        }

        const newPreset = Preset.fromObject(newPresetData);
        await (new PresetModel(newPreset.toObject())).save();
        this.presets.push(newPreset);

        return newPreset;
    }

    async update(presetId: string, updatePresetData:{ [index:string] : any}):Promise<Preset> {
        const preset:Preset = this.getById(presetId);
        for (const [k, v] of Object.entries(updatePresetData)) {
            switch (k) {
                case 'name':
                    preset.name = v;
                    break;
                case 'groupId':
                    preset.groupId = v;
                    break;
                case 'status':
                    preset.status = v;
                    break;
            }
        }
        await PresetModel.updateOne({ presetId }, updatePresetData);

        return preset;
    }

    async delete(presetId: string):Promise<void> {
        await PresetModel.deleteOne({ presetId });
    }

    getAll():Array<Preset> {
        return this.presets;
    }

    async loadAllFromDb():Promise<Preset[]> {
        try {
            this.presets = (await PresetModel.find())
                .map(presetDocument => Preset.fromDbData({
                    presetId: presetDocument.get('presetId'),
                    name: presetDocument.get('name'),
                    status: presetDocument.get('status'),
                    groupId: presetDocument.get('groupId'),
                })
            );
        } catch (error: any) {
            this.logger.error(`cannot load presets ${error.message}`);
        }

        return this.presets;
    }

    get isInitialized():boolean {
        return this._isInitialized;
    }
}
