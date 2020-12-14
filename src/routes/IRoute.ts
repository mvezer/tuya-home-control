import { Application } from "express";

export interface IRoute {
    route(app:Application):void;
}