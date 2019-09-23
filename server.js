
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
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

router(app)


//setInterval(notifications.generateNewNotifications,1 * 10 * 60 * 1000)

//
var server_port = process.env.PORT || 3000
app.listen(server_port);

console.log('KYT RESTful API server started on: ' + port);
