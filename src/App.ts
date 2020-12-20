import express, { Application } from 'express';
import {AddressInfo} from 'net';
import Logger from './handlers/Logger';

import * as bodyParser from 'body-parser';
import { IRoute } from './routes/IRoute';

export type TAppConfig = {
    port: number
}

export default class App {
    private _port:number;
    private _app:Application;
    private logger:Logger;

    constructor(configdData:TAppConfig) {
        this._port = configdData.port;
        this._app = express();

        this.logger = new Logger('server');

        this.configure();
    }

    private configure() {
        this._app.use(bodyParser.json());
    }

    setupRoutes(routes:IRoute[]):void {
        routes.forEach(route => route.route(this._app));
    }

    async start():Promise<void> {
        const server = this._app.listen(this._port, () => {
            const {port, address} = server.address() as AddressInfo;
            this.logger.info(`started, listening on http://${address}:${port}`);
        });
    }
}

