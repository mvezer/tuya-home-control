import { Application, Request, Response } from "express";
import { IRoute } from "./IRoute";
import GroupsController from '../controller/GroupsController';

const BASE_URL = '/api/groups';

export default class GroupsRoute implements IRoute {
    private groupsController:GroupsController;

    constructor(groupsController:GroupsController) {
        this.groupsController = groupsController;
    }
    route(app:Application):void {
        app.get(BASE_URL, (req: Request, res: Response) => {
            this.groupsController.getAll(req, res);
        });
        app.post(BASE_URL, (req: Request, res: Response) => {
            this.groupsController.add(req, res);
        });

        app.get(`${BASE_URL}/:groupId`, (req: Request, res: Response) => {
            this.groupsController.getById(req, res);
        });

        app.put(`${BASE_URL}/:groupId`, (req: Request, res: Response) => {
            this.groupsController.update(req, res);
        });

        app.delete(`${BASE_URL}/:groupId`, (req: Request, res: Response) => {
            this.groupsController.delete(req, res);
        });

        app.get(`${BASE_URL}/:groupId/devices`, (req: Request, res: Response) => {
            this.groupsController.getDevicesByGroupId(req, res);
        });

        app.post(`${BASE_URL}/:groupId/devices/:deviceId`, (req: Request, res: Response) => {
            this.groupsController.addDeviceToGroup(req, res);
        });

        app.delete(`${BASE_URL}/:groupId/devices/:deviceId`, (req: Request, res: Response) => {
            this.groupsController.removeDeviceFromGroup(req, res);
        });

        app.put(`${BASE_URL}/:groupId/status`, (req: Request, res: Response) => {
            this.groupsController.updateDeviceStatuses(req, res);
        });

    }
}

