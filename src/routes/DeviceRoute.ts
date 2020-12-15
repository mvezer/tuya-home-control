import { Application, Request, Response } from "express";
import { IRoute } from "./IRoute";
import DevicesController from '../controller/DevicesController';

export default class DevicesRoute implements IRoute {
    private devicesController: DevicesController;

    constructor(devicesController:DevicesController) {
        this.devicesController = devicesController;
    }
    route(app:Application):void {
        app.get('/api/devices', (req: Request, res: Response) => {
            this.devicesController.getAll(req, res);
        });
        app.post('/api/devices', (req: Request, res: Response) => {
            this.devicesController.add(req, res);
        });

        app.put('/api/devices/:deviceId', (req: Request, res: Response) => {
            this.devicesController.update(req, res);
        });
    }
}

