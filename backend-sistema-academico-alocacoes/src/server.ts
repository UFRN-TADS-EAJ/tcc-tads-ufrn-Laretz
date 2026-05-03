import {app} from './app';
import {env} from './env';

app.listen({
    host: '0.0.0.0',
    port: env.PORT,
}).then(() => {
    const baseUrl = `http://localhost:${env.PORT}`;
    console.log(`HTTP server running on ${baseUrl}`);
    console.log(`Swagger docs available at ${baseUrl}/docs`);
});