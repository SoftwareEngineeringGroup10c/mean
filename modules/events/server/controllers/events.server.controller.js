'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  fs = require('fs'),
  mongoose = require('mongoose'),
  Events = mongoose.model('Event'),
  multer = require('multer'),
  config = require(path.resolve('./config/config')),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');
  // User = mongoose.model('User');
/**
 * Create a Events
 */
exports.create = function (req, res) {
  var event = new Events(req.body);
  event.user = req.user;
  event.banner = event.user.eventImageURL;
  
  event.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(event);
    }
  });
};

/**
 * Show the current Events
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var event = req.event ? req.event.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  event.isCurrentUserOwner = req.user && event.user && event.user._id.toString() === req.user._id.toString();

  res.jsonp(event);
};

/**
 * Update an Events
 */
exports.update = function (req, res) {
  var event = req.event;

  event = _.extend(event, req.body);

  event.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(event);
    }
  });
};

/**
 * Delete an Events
 */
exports.delete = function (req, res) {
  var event = req.event;

  event.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(event);
    }
  });
};

/**
 * List of Eventss
 */
exports.list = function (req, res) {
  Events.find().sort('-created').populate('user', 'displayName').exec(function (err, events) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(events);
    }
  });
};

exports.changeEventPicture = function (req, res) {
  var event = req.event;
  var user = req.user;
  var message = null;
  var upload = multer(config.uploads.eventUpload).single('newEventPicture');
  var eventUploadFileFilter = require(path.resolve('./config/lib/multer')).eventUploadFileFilter;
  // Filtering to upload only images
  upload.fileFiler = eventUploadFileFilter;
  if (user) {
    upload(req, res, function (uploadError) {
      if(uploadError) {
        // event.banner = user.eventImageURL;
        return res.status(400).send({
          message: 'Error occurred while uploading event banner'
        });
      } else {
        event.banner = config.uploads.eventUpload.dest + req.file.filename;

        event.save(function (saveError) {
          if (saveError) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(saveError)
            });
          } else {
            req.login(user, function (err) {
              if (err) {
                res.status(400).send(err);
              } else {
                res.json(user);
              }
            });
          }
        });
      }
    });
  } else {
    res.status(400).send({
      message: 'User is not signed in'
    });
  }
};
/**
 * Events middleware
 */
exports.eventByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Events is invalid'
    });
  }

  Events.findById(id).populate('user', 'displayName').exec(function (err, event) {
    if (err) {
      return next(err);
    } else if (!event) {
      return res.status(404).send({
        message: 'No Events with that identifier has been found'
      });
    }
    req.event = event;
    next();
  });
};
