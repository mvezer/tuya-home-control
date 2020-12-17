import { Application, Request, Response } from "express";
import { IRoute } from "./IRoute";
import PresetsController from '../controller/PresetsController';

const BASE_URL = '/api/presets';

export default class PresetsRoute implements IRoute {
    private presetsController: PresetsController;

    constructor(presetsController:PresetsController) {
        this.presetsController = presetsController;
    }
    route(app:Application):void {
        app.get(BASE_URL, (req: Request, res: Response) => {
            this.presetsController.getAll(req, res);
        });
        app.post(BASE_URL, (req: Request, res: Response) => {
            this.presetsController.add(req, res);
        });
        app.put(`${BASE_URL}/:presetId`, (req: Request, res: Response) => {
            this.presetsController.update(req, res);
        });
        app.get(`${BASE_URL}/:presetId`, (req: Request, res: Response) => {
            this.presetsController.getById(req, res);
        });
        app.put(`${BASE_URL}/:presetId/apply`, (req: Request, res: Response) => {
            this.presetsController.apply(req, res);
        });

    }
}

