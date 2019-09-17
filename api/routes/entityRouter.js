'use strict';

module.exports = (app,db) => {
  var entityController = require('../controllers/entityController');
  var authController = require('../controllers/authController');

  // todoList Routes
  app.route('/api/entities').get(authController.validateJwtToken,entityController.allEntities);

  app.route('/api/entity/:id').get(authController.validateJwtToken,entityController.getEntity);

  app.route('/api/aroundme/:lat/:long/:distance').get(authController.validateJwtToken,entityController.getEntityGeoRadius);

  app.route('/api/dailynotifications').get(authController.validateJwtToken,entityController.dailyNotifications);

  app.route('/api/auth/login').post(
              [
                authController.validateUserCredentials,
                authController.generateToken,
                authController.updateLogin,
                authController.trackloging,
                authController.sendResult]);

  app.route('/api/auth/register').post(
              [ authController.checkDuplicate,
                authController.createUser,
                authController.getUserById,
                authController.generateToken,
                authController.updateLogin,
                authController.trackloging,
                authController.sendResult]);

  app.route('/api/auth/logout').post(
              [ authController.logout,
                authController.updateLogin,
                authController.trackloging,
                function(req,res){res.status(200).send("Logged out!!!")}]);

  app.route('/api/auth/user/:id').get(
              [ authController.validateJwtToken,
                authController.getUserById,
                authController.sendResult]);

};
