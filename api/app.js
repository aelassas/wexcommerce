import app from './server.js'
import fs from 'fs/promises'
import https from 'https'

const PORT = parseInt(process.env.WC_PORT) || 4000
const HTTPS = process.env.WC_HTTPS.toLocaleLowerCase() === 'true'
const PRIVATE_KEY = process.env.WC_PRIVATE_KEY
const CERTIFICATE = process.env.WC_CERTIFICATE

if (HTTPS) {
    https.globalAgent.maxSockets = Infinity
    const privateKey = await fs.readFile(PRIVATE_KEY, 'utf8')
    const certificate = await fs.readFile(CERTIFICATE, 'utf8')
    const credentials = { key: privateKey, cert: certificate }
    const httpsServer = https.createServer(credentials, app)

    httpsServer.listen(PORT, async () => {
        console.log('HTTPS server is running on Port:', PORT)
    })
} else {
    app.listen(PORT, async () => {
        console.log('HTTP server is running on Port:', PORT)
    })
}
