import { Application, Request, Response } from "express";
import { IRoute } from "./IRoute";
import DevicesController from '../controller/DevicesController';

const BASE_URL = '/api/devices';

export default class DevicesRoute implements IRoute {
    private devicesController: DevicesController;

    constructor(devicesController:DevicesController) {
        this.devicesController = devicesController;
    }
    route(app:Application):void {
        app.get(BASE_URL, (req: Request, res: Response) => {
            this.devicesController.getAll(req, res);
        });
        app.post(BASE_URL, (req: Request, res: Response) => {
            this.devicesController.add(req, res);
        });

        app.put(`${BASE_URL}/:deviceId`, (req: Request, res: Response) => {
            this.devicesController.update(req, res);
        });

        app.get(`${BASE_URL}/:deviceId/status`, (req: Request, res: Response) => {
            this.devicesController.getDeviceStatus(req, res);
        });

        app.put(`${BASE_URL}/:deviceId/status`, (req: Request, res: Response) => {
            this.devicesController.updatetDeviceStatus(req, res);
        });
    }
}

