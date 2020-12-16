import { Application, Request, Response } from "express";
import { IRoute } from "./IRoute";
import GroupsController from '../controller/GroupsController';

const BASE_URL = '/api/groups';

export default class GroupsRoute implements IRoute {
    private groupController:GroupsController;

    constructor(groupController:GroupsController) {
        this.groupController = groupController;
    }
    route(app:Application):void {
        app.get(BASE_URL, (req: Request, res: Response) => {
            this.groupController.getAll(req, res);
        });
        app.post(BASE_URL, (req: Request, res: Response) => {
            this.groupController.add(req, res);
        });

        app.get(`${BASE_URL}/:groupId`, (req: Request, res: Response) => {
            this.groupController.getById(req, res);
        });

        app.put(`${BASE_URL}/:groupId`, (req: Request, res: Response) => {
            this.groupController.update(req, res);
        });

        app.get(`${BASE_URL}/:groupId/devices`, (req: Request, res: Response) => {
            this.groupController.getDevicesByGroupId(req, res);
        });

        app.post(`${BASE_URL}/:groupId/devices/:deviceId`, (req: Request, res: Response) => {
            this.groupController.addDeviceToGroup(req, res);
        });

        app.delete(`${BASE_URL}/:groupId/devices/:deviceId`, (req: Request, res: Response) => {
            this.groupController.removeDeviceFromGroup(req, res);
        });

        app.put(`${BASE_URL}/:groupId/status`, (req: Request, res: Response) => {
            this.groupController.updateDeviceStatuses(req, res);
        });

    }
}

