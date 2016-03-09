nsclserv = require('./ipserv.js');
var log4js = require('log4js');
/** SCL --------------------------------------------------------------------- */
var scl = {};
scl.host = nsclserv.ipnscl;
//scl.host = 'localhost';
scl.id = 'openmtc-nscl';

// mId config
scl.mid = {};
scl.mid.port = '14000';
scl.mid.ssl = {};
// scl.mid.ssl.key = './openmtc-NSCL/keys/mid-key.pem';
// scl.mid.ssl.cert = './openmtc-NSCL/keys/mid-cert.pem';

// dIa config
scl.dia = {};
scl.dia.port = '15000';
//scl.dia.network = '10.0.0.1/24';

// notification service
scl.notificationService = {};
scl.notificationService.port = '8081';
scl.notificationService.secret = 'openmtc';
scl.notificationService.contactResource = 'notificationService';

// misc
scl.sclBase = 'm2m';
//scl.secret = 'secret';
scl.contactResource = 'notify';
scl.personality = 'NSCL';

// capabilities
scl.capabilities = [
  './lib/capabilities/nrar'
];

/** DB ---------------------------------------------------------------------- */
var db = {};

db.driver = './db/mongodb';

// mongodb
db.host = nsclserv.ipnscl;
db.port = 27017;
db.dropDB = 'true';
db.database = 'm2m_nscl';

//sqlite
db.storage = 'nscl.db';
db.prefix = 'nscl_';

// Redis
db.redis = {};
db.redis.host = 'localhost';
db.redis.port = 6379;

/** LOGGING ----------------------------------------------------------------- */
var logging = {};

logging.logDir = '.';
logging.fileName = 'nscl.log';
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
  db: db,
  logging: logging,
  log4js: log4js
};
