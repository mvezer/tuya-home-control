import * as mongoose from 'mongoose';
import Group, {TGroupData} from './Group';

const GroupModel = mongoose.model('Group', new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    groupId: { type: String, required: true, unique: true },
}));

export default class GroupsRepository {
    private groups:Array<Group> = [];
    private _isInitialized:boolean = false;

    async init():Promise<void> {
        try {
            this.groups = await this.loadAllFromDb();
        } catch (error: any) {
            console.error(`[DeviceRepository] ERROR in init: ${error.message}`);
        }

        this._isInitialized = true;
    }

    async add(name:string):Promise<Group> {
        const newGroup = new Group(name);
        this.groups.push(newGroup);
        await (new GroupModel(newGroup.toObject())).save();

        return newGroup;
    }

    getGroupByName(name:string):Group {
        return this.groups.find(group => group.name === name);
    }

    getGroupById(groupId:string):Group {
        return this.groups.find(group => group.groupId === groupId);
    }

    async update(groupId: string, updateGroupData:object):Promise<void> {
        const group:Group = this.getGroupById(groupId);
        for (let [k, v] of Object.entries(updateGroupData)) {
            switch (k) {
                case 'name':
                    group.name = v;
                    break;
            }
        }
        await GroupModel.updateOne({ groupId}, updateGroupData);
    }

    async delete(groupId: string):Promise<void> {
        await GroupModel.deleteOne({ groupId });
    }

    getAllGroups():Array<Group> {
        return this.groups;
    }

    async loadAllFromDb():Promise<Group[]> {
        let groups:Array<Group> = [];
        try {
            groups = (await GroupModel.find())
                .map(groupDocument => Group.fromDbData({
                    groupId: groupDocument.get('groupId'),
                    name: groupDocument.get('name'),
                })
            );
        } catch (error: any) {
            console.error(`[GroupRepository] ERROR in init: ${error.message}`);
        }

        return groups;
    }

    get isInitialized():boolean {
        return this._isInitialized;
    }
}
