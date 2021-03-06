import DevicesRoute from './routes/DevicesRoute';
import GroupsRoute from './routes/GroupsRoute';
import PresetsRoute from './routes/PresetsRoute';
import CombosRoute from './routes/CombosRoute';
import DevicesController from './controller/DevicesController';
import GroupsController from './controller/GroupsController';
import PresetsController from './controller/PresetsController';
import CombosController from './controller/CombosController';
import DevicesRepository from './models/device/DevicesRepository';
import GroupsRepository from './models/group/GroupsRepository';
import PresetsRepository from './models/preset/PresetsRepository';
import CombosRepository from './models/combo/CombosRepository';
import MongoDbHandler from './handlers/MongoDbHandler';

export const devicesRepository:DevicesRepository = new DevicesRepository();
export const devicesController:DevicesController = new DevicesController(devicesRepository);

export const groupsRepository:GroupsRepository = new GroupsRepository();
export const groupsController:GroupsController = new GroupsController(groupsRepository, devicesRepository);

export const presetsRepository:PresetsRepository = new PresetsRepository();
export const presetsController:PresetsController = new PresetsController(presetsRepository, groupsRepository, groupsController);

export const combosRepository:CombosRepository = new CombosRepository();
export const combosController:CombosController = new CombosController(combosRepository, presetsRepository, presetsController);

export const devicesRoute:DevicesRoute = new DevicesRoute(devicesController);
export const groupsRoute:GroupsRoute =new GroupsRoute(groupsController);
export const presetsRoute:PresetsRoute = new PresetsRoute(presetsController);
export const combosRoute:CombosRoute = new CombosRoute(combosController);

export const mongoDbHandler:MongoDbHandler = new MongoDbHandler(
    process.env['MONGODB_URL'],
    parseInt(process.env['MONGODB_PORT'], 10),
    process.env['MONGODB_NAME'],
);