const log = (message) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
};

const error = (message, err) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ${message}`, err);
}

module.exports = {
  log,
    error
};