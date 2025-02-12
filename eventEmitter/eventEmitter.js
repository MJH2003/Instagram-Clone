const EventEmitter2 = require("eventemitter2");
const emitter = new EventEmitter2({
  wildcard: true,
});

module.exports = emitter;
