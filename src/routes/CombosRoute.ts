import { Application, Request, Response } from "express";
import { IRoute } from "./IRoute";
import CombosController from '../controller/CombosController';

const BASE_URL = '/api/combos';

export default class CombosRoute implements IRoute {
    private combosController:CombosController;

    constructor(combosController:CombosController) {
        this.combosController = combosController;
    }
    route(app:Application):void {
        app.get(BASE_URL, (req: Request, res: Response) => {
            this.combosController.getAll(req, res);
        });
        app.post(BASE_URL, (req: Request, res: Response) => {
            this.combosController.add(req, res);
        });
        app.get(`${BASE_URL}/:comboId`, (req: Request, res: Response) => {
            this.combosController.getById(req, res);
        });
        app.put(`${BASE_URL}/:comboId`, (req: Request, res: Response) => {
            this.combosController.update(req, res);
        });
        app.delete(`${BASE_URL}/:comboId`, (req: Request, res: Response) => {
            this.combosController.delete(req, res);
        });
        app.put(`${BASE_URL}/:comboId/apply`, (req: Request, res: Response) => {
            this.combosController.apply(req, res);
        });
        app.post(`${BASE_URL}/:comboId/presets`, (req: Request, res: Response) => {
            this.combosController.getPresets(req, res);
        });
        app.post(`${BASE_URL}/:comboId/presets/:presetId`, (req: Request, res: Response) => {
            this.combosController.addPreset(req, res);
        });
        app.delete(`${BASE_URL}/:comboId/presets/:presetId`, (req: Request, res: Response) => {
            this.combosController.removePreset(req, res);
        });
    }
}

