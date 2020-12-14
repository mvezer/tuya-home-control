import express, { Application, Response } from 'express';
import {AddressInfo} from 'net';
import * as bodyParser from 'body-parser';
import { IRoute } from './routes/IRoute';

export type TAppConfig = {
    port: number
}

export default class App {
    private _port:number;
    private _app:Application;

    constructor(confidData:TAppConfig) {
        this._port = confidData.port;
        this._app = express();

        this.configure();
    }

    private configure() {
        this._app.use(bodyParser.json({
            limit: '50mb',
            verify(req: any, res, buf, encoding) {
                req.rawBody = buf;
            }
        }));
    }

    setupRoutes(routes:IRoute[]):void {
        routes.forEach(route => route.route(this._app));
    }

    start():void {
        const server = this._app.listen(this._port, () => {
            const {port, address} = server.address() as AddressInfo;
            console.info('Tuya Home Control is listening on:','http://' + address + ':'+port);
        });
    }
}

