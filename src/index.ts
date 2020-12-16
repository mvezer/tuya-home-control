import App from './App';
import routes from './routes';
import SingletonHandler from './handlers/SingletonHandler';
import MongoDbHandler from './handlers/MongoDbHandler';
import DevicesRoute from './routes/DevicesRoute';
import GroupsRoute from './routes/GroupsRoute';
import DeviceRepository from './models/DeviceRepository';
import DevicesController from './controller/DevicesController';
import figlet from 'figlet';
import GroupRepository from './models/GroupRepository';
import GroupsController from './controller/GroupsController';


const init = async () => {
    console.log(figlet.textSync('THC', 'Isometric1'));
    console.info('---------= Tuya Home Control =----------');
    console.info('');
    await SingletonHandler.getInstance('MongoDbHandler').connect();
    await Promise.all([
        SingletonHandler.getInstance('DeviceRepository').init(),
        SingletonHandler.getInstance('GroupRepository').init()
    ]);

    app.setupRoutes([
        SingletonHandler.getInstance('DevicesRoute'),
        SingletonHandler.getInstance('GroupsRoute')
    ]);
}

const registerSingletons = () => {
    SingletonHandler.register('MongoDbHandler', new MongoDbHandler(
        process.env['MONGODB_URL'],
        parseInt(process.env['MONGODB_PORT'], 10),
        process.env['MONGODB_NAME'],
    ));

    const deviceRepository:DeviceRepository = SingletonHandler.register('DeviceRepository', new DeviceRepository());
    const devicesController = SingletonHandler.register('DevicesController', new DevicesController(deviceRepository));
    SingletonHandler.register('DevicesRoute', new DevicesRoute(devicesController));

    const groupRepository:GroupRepository = SingletonHandler.register('GroupRepository', new GroupRepository());
    const groupsController = SingletonHandler.register('GroupsController', new GroupsController(groupRepository, deviceRepository));
    SingletonHandler.register('GroupsRoute', new GroupsRoute(groupsController));
}

registerSingletons();
init()

const app:App = new App({
    port: parseInt(process.env.SERVER_PORT, 10)
});

app.start();
