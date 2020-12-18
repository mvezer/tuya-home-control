import * as mongoose from 'mongoose';
import Preset from './Preset';

const PresetModel = mongoose.model('Preset', new mongoose.Schema({
    presetId: { type: String, required: true, unique: true },
    groupId: { type: String, required: true },
    name: { type: String, required: true, unique: true },
    status: { type: Object, required: true }
}));

export default class PresetsRepository {
    private presets:Array<Preset> = [];

    private _isInitialized:boolean = false;

    async init():Promise<void> {
        this.presets = await this.loadAllFromDb();

        this._isInitialized = true;
    }

    getById(presetId: string): Preset {
        return this.presets.find(preset => preset.presetId === presetId);
    }

    async add(newPresetData:any):Promise<Preset> {
        if (this.getById(newPresetData.presetId)) {
            throw new Error(`[PresetRepository] ERROR: cannot add preset, preset already exists`);

            return null;

        } 

        const newPreset = Preset.fromObject(newPresetData);
        await (new PresetModel(newPreset.toObject())).save();
        this.presets.push(newPreset);

        return newPreset;
    }

    async update(presetId: string, updatePresetData:object):Promise<Preset> {
        const preset:Preset = this.getById(presetId);
        for (let [k, v] of Object.entries(updatePresetData)) {
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
        let devices:Array<Preset> = [];
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
            console.error(`[PresetRepository] ERROR in init: ${error.message}`);
        }

        return this.presets;
    }

    get isInitialized():boolean {
        return this._isInitialized;
    }
}
