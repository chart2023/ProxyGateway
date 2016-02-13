var log4js = require('log4js');
/** SCL --------------------------------------------------------------------- */
var scl = {};

scl.host = '161.200.90.71';
//scl.host = '192.168.1.5';
scl.id = 'openmtc-gscl';

// mId config
scl.mid = {};
scl.mid.port = '4000';
scl.mid.ssl = {};
//scl.mid.ssl.key = './openmtc-GSCL/keys/mid-key.pem';
//scl.mid.ssl.cert = './openmtc-GSCL/keys/mid-cert.pem';

// dIa config
scl.dia = {};
scl.dia.port = '5000';
//scl.dia.network = '10.0.0.1/24';

// notification service
scl.notificationService = {};
scl.notificationService.contactResource = 'notificationService';
scl.notificationService.port = '5000';
scl.notificationService.secret = 'openmtc';

// websocket channels
scl.notificationService.ws = {};
scl.notificationService.ws.endpoint =
  'http://' + scl.host + ':' + scl.notificationService.port;

// misc
scl.sclBase = 'm2m';
//scl.secret = 'secret';
scl.contactResource = 'notify';
scl.registerInterval = '1000000';
scl.personality = 'GSCL';

// capabilities
scl.capabilities = [
  './lib/capabilities/grar',
  './lib/capabilities/ggc'
];

scl.gc = {};
scl.gc.communicationChannelManager = '';
//scl.gc.communicationChannelManager = './CommunicationChannelManager';
scl.gc.deferredRequestHandler = "DeferredRequestHandler";

/** HOST_SCL ---------------------------------------------------------------- */
var hostScl = {};

hostScl.host = '161.200.90.85';
//hostScl.host = '192.168.1.36';
hostScl.id = 'openmtc-nscl';
hostScl.port = '14000';
hostScl.sclBase = 'm2m';
//hostScl.secret = 'secret';

// DON'T CHANGE THIS
// TODO: uri should not include sclBase
hostScl.hostUri = 'http://' + hostScl.host + ':' + hostScl.port;
hostScl.uri = hostScl.hostUri + '/' + hostScl.sclBase;

/** DB ---------------------------------------------------------------------- */
var db  = {};

db.driver = './db/mongodb';

// mongodb
db.host = 'localhost';
//db.host = '192.168.1.5';
db.port = 27017;
db.dropDB = 'true';
db.database = 'm2m_gscl';

// sqlite
db.storage = 'gscl.db';
db.prefix = 'gscl_';

/** LOGGING ----------------------------------------------------------------- */
var logging = {};

logging.logDir = '.';
logging.fileName = 'gscl.log';
logging.maxLogSize = 20480;
logging.backups = '0';
logging.pollInterval = 15;
logging.globalLogLevel = 'DEBUG';

//NapatK 20141020

// DON'T CHANGE THIS
// why not actually?
log4js.configure({
  'appenders': [
    {
      type: 'console',
      category: '[gscl]'
    },
    {
      type: 'console',
      category: '[nscl]'
    },
    {
      type: 'console',
      category: '[method]'
    },
    {
      type: 'console',
      category: '[transport]'
    },
    {
      type: 'console',
      category: '[database]'
    },
    {
      type: 'console',
      category: '[controller]'
    },
    {
      type: 'console',
      category: '[http]'
    },
    {
      type: 'console',
      category: '[https]'
    },
    {
      type: 'console',
      category: '[gip]'
    },
    {   //rev.v1 for NIP created by napatk 01-07-2014
      type: 'console',
      category: '[nip]'
    },
    {
      type: 'console',
      category: '[app]'
    },
    {
      type: 'console',
      category: '[xIa]'
    },
    {
      type: 'file',
      filename: logging.fileName,
      maxLogSize: logging.maxLogSize,
      backups: logging.backups,
      pollInterval: logging.pollInterval,
      category: '[gscl]'
    },
    {
      type: 'file',
      filename: logging.fileName,
      maxLogSize: logging.maxLogSize,
      backups: logging.backups,
      pollInterval: 15,
      category: '[nscl]'
    },
    {
      type: 'file',
      filename: logging.fileName,
      maxLogSize: logging.maxLogSize,
      backups: logging.backups,
      pollInterval: logging.pollInterval,
      category: '[method]'
    },
    {
      type: 'file',
      filename: logging.fileName,
      maxLogSize: logging.maxLogSize,
      backups: logging.backups,
      pollInterval: logging.pollInterval,
      category: '[transport]'
    },
    {
      type: 'file',
      filename: logging.fileName,
      maxLogSize: logging.maxLogSize,
      backups: logging.backups,
      pollInterval: logging.pollInterval,
      category: '[database]'
    },
    {
      type: 'file',
      filename: logging.fileName,
      maxLogSize: logging.maxLogSize,
      backups: logging.backups,
      pollInterval: logging.pollInterval,
      category: '[controller]'
    },
    {
      type: 'file',
      filename: logging.fileName,
      maxLogSize: logging.maxLogSize,
      backups: logging.backups,
      pollInterval: logging.pollInterval,
      category: '[http]'
    },
    {
      type: 'file',
      filename: logging.fileName,
      maxLogSize: logging.maxLogSize,
      backups: logging.backups,
      pollInterval: logging.pollInterval,
      category: '[https]'
    },
    {
      type: 'file',
      filename: logging.fileName,
      maxLogSize: logging.maxLogSize,
      backups: logging.backups,
      pollInterval: logging.pollInterval,
      category: '[gip]'
    },
    {   //rev.v1 for NIP created by napatk 01-07-2014
      type: 'file',
      filename: logging.fileName,
      maxLogSize: logging.maxLogSize,
      backups: logging.backups,
      pollInterval: logging.pollInterval,
      category: '[nip]'
    },
    {
      type: 'file',
      filename: logging.fileName,
      maxLogSize: logging.maxLogSize,
      backups: logging.backups,
      pollInterval: logging.pollInterval,
      category: '[app]'
    },
    {
      type: 'file',
      filename: logging.fileName,
      maxLogSize: logging.maxLogSize,
      backups: logging.backups,
      pollInterval: logging.pollInterval,
      category: '[xIa]'
    }
  ],
  replaceConsole: false
}, {cwd: logging.logDir});
log4js.setGlobalLogLevel(logging.globalLogLevel);
// DON'T CHANGE THIS
// TODO: pull this out of config
scl.uri = 'http://' + scl.host + ':' + scl.port + '/' + scl.sclBase;
scl.mid.uri = 'http://' + scl.host + ':' + scl.mid.port + '/' + scl.sclBase;
scl.dia.uri = 'http://' + scl.host + ':' + scl.dia.port + '/' + scl.sclBase;
scl.hostURI = 'http://' + scl.host + ':' + scl.port;
scl.mid.hostUri = 'http://' + scl.host + ':' + scl.mid.port;
scl.dia.hostUri = 'http://' + scl.host + ':' + scl.dia.port;
scl.contactURI = scl.mid.uri + '/' + scl.contactResource;
/** EXPORT ------------------------------------------------------------------ */
module.exports = {
  scl: scl,
  Hostscl: hostScl,
  db: db,
  logging: logging,
  log4js: log4js
};
