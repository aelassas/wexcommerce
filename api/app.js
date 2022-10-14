import app from './server.js';
import fs from 'fs';
import https from 'https';

const PORT = parseInt(process.env.SC_PORT) || 4000;
const HTTPS = process.env.SC_HTTPS.toLocaleLowerCase() === 'true';
const PRIVATE_KEY = process.env.SC_PRIVATE_KEY;
const CERTIFICATE = process.env.SC_CERTIFICATE;

if (HTTPS) {
    https.globalAgent.maxSockets = Infinity;
    const privateKey = fs.readFileSync(PRIVATE_KEY, 'utf8');
    const certificate = fs.readFileSync(CERTIFICATE, 'utf8');
    const credentials = { key: privateKey, cert: certificate };
    const httpsServer = https.createServer(credentials, app);

    httpsServer.listen(PORT, () => {
        console.log('HTTPS server is running on Port:', PORT);
    });
} else {
    app.listen(PORT, () => {
        console.log('HTTP server is running on Port:', PORT);
    });
}
