import { Application, Request, Response } from "express";
import { IRoute } from "./IRoute";
import DevicesController from '../controller/DevicesController';

class DevicesRoute implements IRoute {
    private devicesController: DevicesController;

    constructor() {
        this.devicesController = new DevicesController();
    }
    route(app:Application):void {
        app.get('/api/devices', (req: Request, res: Response) => {
            res.status(200).json({ data: 'OK', error: null });
        });
        app.post('/api/devices', (req: Request, res: Response) => {
            this.devicesController.add(req, res);
        });
    }
}

export default new DevicesRoute();
