import figlet from 'figlet';
import App from './App';
import Logger from './handlers/Logger';
import {
    devicesRoute,
    groupsRoute,
    presetsRoute,
    mongoDbHandler,
    devicesRepository,
    groupsRepository,
    presetsRepository
} from './Dependencies';

const logger = new Logger('index');

const welcome = async () => {
    console.log(figlet.textSync('THC', 'Isometric1'));
    console.info('');
    console.info('---------= Tuya Home Control =----------');
    console.info('');
}

const init = async () => {
    try {
        await mongoDbHandler.connect();
        
        await Promise.all([
            devicesRepository.init(),
            groupsRepository.init(),
            presetsRepository.init()
        ]);
    } catch (error:any) {
        logger.critical(`init failed ${error.message}`);
        process.exit(1);
    }

    const app:App = new App({
        port: parseInt(process.env.SERVER_PORT, 10)
    });
    
    app.setupRoutes([ devicesRoute, groupsRoute, presetsRoute ]);

    app.start();
}

welcome();
init();
