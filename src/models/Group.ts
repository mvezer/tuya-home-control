import * as crypto from 'crypto';

export type TGroupData = {
    name: string,
    groupId: string
}

export default class Group {
    private _name: string;
    private _groupId: string;

    static fromDbData(groupData: TGroupData):Group {
        return (new Group(groupData.name, groupData.groupId));
    }

    constructor(name: string, groupId: string = null) {
        this._name = name;
        this._groupId = groupId
            ? groupId
            : this._groupId = crypto.randomBytes(20).toString('hex');
    }

    get name():string {
        return this._name;
    }

    set name(newName:string) {
        this._name = newName;
    }

    get groupId():string {
        return this._groupId;
    }

    toObject():TGroupData {
        return {
            name: this._name,
            groupId: this._groupId
        }
    }
}