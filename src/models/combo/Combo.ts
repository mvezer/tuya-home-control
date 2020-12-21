import * as crypto from 'crypto';

export default class Combo {
    private _name:string;
    private _presets:Array<string>;
    private _comboId:string;
    private _icon:string;

    constructor(name:string, icon: string = null, presets:Array<string> = [], comboId:string = null) {
        this._name = name;
        this._icon = icon;
        this._presets = presets || [];
        this._comboId = comboId
            ? comboId
            : crypto.randomBytes(20).toString('hex');
    }

    get name():string {
        return this._name;
    }

    set name(newName: string) {
        this._name = newName;
    }

    get presets():Array<string> {
        return this._presets;
    }

    set presets(newPresets: Array<string>) {
        this._presets = newPresets;
    }

    get comboId():string {
        return this._comboId;
    }

    set icon(newIcon: string) {
        this._icon = newIcon;
    }

    get icon(): string {
        return this._icon;
    }

    hasPreset(presetToFind: string): boolean {
        return !!this._presets.find(p => p === presetToFind);
    }

    addPreset(newPreset:string):boolean {
        if (!this.hasPreset(newPreset)) {
            this._presets.push(newPreset);

            return true;
        }

        return false;
    }

    removePreset(presetToRemove: string):boolean {
        if (this.hasPreset) {
            this._presets = this._presets.filter(p => p !== presetToRemove);

            return true;
        }

        return false;
    }

    toObject(): { [index:string]:any } {
        return {
            name: this.name,
            icon: this.icon,
            comboId: this.comboId,
            presets: this.presets
        }
    }
}