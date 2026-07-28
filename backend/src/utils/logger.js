const levels = {
  info: '\x1b[36m[INFO]\x1b[0m',
  warn: '\x1b[33m[WARN]\x1b[0m',
  error: '\x1b[31m[ERROR]\x1b[0m',
};

function timestamp() {
  return new Date().toISOString();
}

module.exports = {
  info: (msg) => console.log(`${levels.info} ${timestamp()} - ${msg}`),
  warn: (msg) => console.warn(`${levels.warn} ${timestamp()} - ${msg}`),
  error: (msg) => console.error(`${levels.error} ${timestamp()} - ${msg}`),
};
