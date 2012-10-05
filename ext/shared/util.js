var TS = TS || {};
TS.DEBUG = true;

function debug() {
  if (TS.DEBUG) {
    console.log.apply(console, arguments);
  }
}
