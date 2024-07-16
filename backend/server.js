const http = require('http')
const app = require('./app')

const port = 4000
app.set('port', port)

const errorHandler = (error) => {
    if (error.syscall !== 'listen') {
        throw error
    }
    const address = server.address()
    const bind =
        typeof address === 'string' ? 'pipe ' + address : 'port: ' + port
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges.')
            process.exit(1)
            break
        case 'EADDRINUSE':
            console.error(bind + ' is already in use.')
            process.exit(1)
            break
        default:
            throw error
    }
}

const server = http.createServer(app)

server.on('error', errorHandler)

// Permet de savoir si le server écoute sur un port TCP/HTTP ou UNIX/LINUX
// server.on('listening', () => {
//     const address = server.address()
//     const bind =
//         typeof address === 'string' ? 'pipe ' + address : 'port ' + port
//     console.log('Listening on ' + bind)
// })

server.listen(port)
