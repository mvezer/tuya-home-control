import App from './App';
import routes from './routes';

const app:App = new App({
    port: parseInt(process.env.SERVER_PORT, 10)
});

app.setupRoutes(routes);

app.start();
