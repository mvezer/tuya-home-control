import figlet from 'figlet';
import App from './App';
import {
    devicesRoute,
    groupsRoute,
    presetsRoute,
    mongoDbHandler,
    devicesRepository,
    groupsRepository,
    presetsRepository
} from './Dependencies';

const welcome = async () => {
    console.log(figlet.textSync('THC', 'Isometric1'));
    console.info('');
    console.info('---------= Tuya Home Control =----------');
    console.info('');
}

const init = async () => {
    await mongoDbHandler.connect();
    
    await Promise.all([
        devicesRepository.init(),
        groupsRepository.init(),
        presetsRepository.init()
    ]);

    const app:App = new App({
        port: parseInt(process.env.SERVER_PORT, 10)
    });
    
    app.setupRoutes([ devicesRoute, groupsRoute, presetsRoute ]);

    app.start();
}

welcome();
init();
