/** openmtc module */
var openmtc = require('openmtc');

/** configuration file for GSCL */
var nscl = openmtc.config_nscl.scl;

/** dIa interface */
var XIA = openmtc.interfaces.xIa;

/** maps primitives to http */
var HttpAdapter = openmtc.transport.http.client;

/** HTTP client for dIa interface  */
var httpHandler = new HttpAdapter();

/** event emitter */
var events = require('events');

/** system functions */
var util = require('util');

/** logging */
var logger = openmtc.config_nscl.log4js.getLogger('[NIP]');

/**
 * Constructor for Network Interworking Proxy (NIP)
 * @param appId
 * @constructor
 */
var NIP = function (appId) {
  'use strict';

  events.EventEmitter.call(this);

  // application ID
  this.appId = appId;

  // dIa interface
  this.dIaClient = new XIA(nscl.dia.uri, httpHandler);

  // registered flag
  this.registered = false;

  // searchStrings (used for discovery)
  this.searchStrings = [];

  // containers
  this.containers = [];

  // requestingEntity
  this.requestingEntity = '';

  // return this to chain events later
  return this;
};

/** inherit vom EventEmitter */
util.inherits(NIP, events.EventEmitter);

NIP.prototype.addContainer = function (containerID, options) {
  'use strict';
  var self, container;
  self = this;

  container = {
    id: containerID,
    maxNrOfInstances: options.maxNrOfInstances
  };

  if (options === undefined) {
    options = {};
  }

  if (options.maxNrOfInstances !== undefined) {
    container.maxNrOfInstances = options.maxNrOfInstances;
  }

  if (options.accessRightID) {
    container.accessRightID = options.accessRightID;
  }

  if (this.registered) {
    // create CONTAINER
    return this.dIaClient.requestIndication('CREATE', null, nscl.dia.uri +
      '/applications/' + this.appId + '/containers', {container: container});
  }

  return self.emit('NOT_REGISTERED');
};

NIP.prototype.findContainer = function (containerID) {
  'use strict';
  var self = this;

  if (this.registered) {
    // create CONTAINER
    return this.dIaClient.requestIndication('RETRIEVE', null, nscl.dia.uri +
      '/applications/' + this.appId + '/containers/' + containerID);
  }

  return self.emit('NOT_REGISTERED');
};

NIP.prototype.removeContainer = function (containerID) {
  'use strict';
  var self = this;

  if (this.registered) {
    return this.dIaClient.requestIndication('DELETE', null, nscl.dia.uri +
      '/applications/' + this.appId + '/containers/' + containerID);
  }

  return self.emit('NOT_REGISTERED');
};

NIP.prototype.subscribe = function (resource, contactURI) {
  'use strict';
  var self = this;

  if (this.registered) {
    console.log('subscribe ....');
    return this.dIaClient.requestIndication('CREATE', null, resource +
      '/subscriptions',
      {
        subscription: {
          contact: contactURI
        }
      });
  }

  return self.emit('NOT_REGISTERED');
};

NIP.prototype.addSearchString = function (searchString) {
  'use strict';

  this.searchStrings.push(searchString);
};

NIP.prototype.removeSearchString = function (searchString) {
  'use strict';

  // remove searchString from searchStrings
  var index = this.searchStrings.indexOf(searchString); // Find the index
  if (index !== -1) {
    this.searchStrings.splice(index, 1);
  }
};

NIP.prototype.getAccessRightID = function () {
  'use strict';

  return this.accessRightID;
};

NIP.prototype.setAccessRightID = function (accessRightID) {
  'use strict';

  if (accessRightID === '') {
    delete this.accessRightID;
  } else {
    this.accessRightID = accessRightID;
  }
};

NIP.prototype.insertAccessRight = function (accessRight) {
  'use strict';
  var self = this;

  if (this.registered) {
    return this.dIaClient.requestIndication('CREATE', null, nscl.dia.uri +
      '/applications/' + this.appId + '/accessRights',
      {accessRight: accessRight});
  }

  return self.emit('NOT_REGISTERED');
};

/**
 * register at GSCL, create APPLICATION resource
 */
NIP.prototype.register = function () {
  'use strict';
  var self, app;
  self = this;

  this.dIaClient.requestIndication('CREATE', null, nscl.dia.uri +
    '/applications',
    {
      application: {
        appId: this.appId,
        //aPoc: 'http://localhost:1334',
        //aPocPaths: { aPocPath: ['(/public);(/restricted)'] },
        searchStrings: {
          searchString: this.searchStrings
        },
        accessRightID: this.accessRightID
      }
    })
    .on('STATUS_CREATED', function (data) {
      if (data) {
        // TODO: check data if something changed
        logger.debug(data);
      }
      logger.info('APP REGISTERED');
      self.registered = true;
      self.requestingEntity = nscl.dia.uri + '/applications/' + self.appId;
      self.emit('REGISTERED');
    }).on("ERROR", function(data) {
      if (data == 409) {
        logger.info("App already exists. Assuming that's fine.'");
      self.registered = true;
      self.requestingEntity = nscl.dia.uri + '/applications/' + self.appId;
      self.emit('REGISTERED');
      }
      else
        logger.error("Error creating app: " + data);
      
    });
};

/**
 * register at GSCL, create APPLICATION resource
 */
NIP.prototype.deregister = function () {
  'use strict';

  var self = this;
  this.dIaClient.requestIndication('DELETE', null, nscl.dia.uri +
    '/applications/' + this.appId)
    .on('STATUS_OK', function () {
      //logger.info('APP DEREGISTERED');
      self.registered = false;
      self.emit('DEREGISTERED');
    });
};

NIP.prototype.pushData = function (containerID, data) {
  'use strict';
  var self = this;

  if (this.registered) {
    //logger.debug('store data in container %s ', containerID);
    //logger.debug(data);

    return this.dIaClient.requestIndication('CREATE', null, nscl.dia.uri +
      '/applications/' + this.appId +
      '/containers/' + containerID + '/contentInstances',
      {
        contentInstance: {
          content: {
            $t: new Buffer(JSON.stringify(data)).toString('base64'),
            contentType: 'application/json'
          }
        }
      });
  }

  return self.emit('NOT_REGISTERED');
};

NIP.prototype.getData = function (containerID) {
  'use strict';
  var self = this;

  if (this.registered) {
    //logger.debug('retrieve data from container %s ', containerID);

    return this.dIaClient.requestIndication('RETRIEVE', null, nscl.dia.uri +
      '/applications/' + this.appId + '/containers/' + containerID +
      '/contentInstances');
  }

  return self.emit('NOT_REGISTERED');
};

NIP.prototype.getRequestingEntity = function () {
  'use strict';

  return this.requestingEntity;
};

module.exports = NIP;
