import App from './App';
import routes from './routes';
import SingletonHandler from './handlers/SingletonHandler';
import MongoDbHandler from './handlers/MongoDbHandler';
import DevicesRoute from './routes/DeviceRoute';
import DeviceRepository from './models/DeviceRepository';
import DevicesController from './controller/DevicesController';
import figlet from 'figlet';


const init = async () => {
    console.log(figlet.textSync('THC', 'Isometric1'));
    console.info('---------= Tuya Home Control =----------');
    console.info('');
    await SingletonHandler.getInstance('MongoDbHandler').connect();
    await SingletonHandler.getInstance('DeviceRepository').init();

    app.setupRoutes([ SingletonHandler.getInstance('DevicesRoute') ]);
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

}

registerSingletons();
init()

const app:App = new App({
    port: parseInt(process.env.SERVER_PORT, 10)
});

app.start();
