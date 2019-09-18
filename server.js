
var Entity = require('./api/models/entityModel') //created model loading here
var bodyParser = require('body-parser')
var router = require('./api/routes/entityRouter')
var notifications = require('./features/notifications')
const morgan = require('morgan');

var express = require('express'),

  app = express(),
  port = process.env.PORT || 3000;



const winston = require('winston')
const consoleTransport = new winston.transports.Console()
const myWinstonOptions = {
    transports: [consoleTransport]
}
const logger = new winston.createLogger(myWinstonOptions)

function logRequest(req, res, next) {
    logger.info(req.url)
    next()
}
app.use(logRequest)

function logError(err, req, res, next) {
    logger.error(err)
    next()
}
app.use(logError)
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

router(app)


//setInterval(notifications.generateNewNotifications,1 * 10 * 60 * 1000)

//app.listen(port);
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

app.listen(server_port, server_ip_address, function () {
  console.log( "Listening on " + server_ip_address + ", port " + server_port )
});

console.log('KYT RESTful API server started on: ' + port);
