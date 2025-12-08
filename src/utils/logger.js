const log = (message, context = {}) => {
  const timestamp = new Date().toISOString();
  const contextStr = Object.keys(context).length
    ? ` ${JSON.stringify(context)}`
    : "";
  console.log(`[${timestamp}] ${message}${contextStr}`);
};

const error = (message, context = {}) => {
  const timestamp = new Date().toISOString();
  
  let stack;
  let otherContext = {};

  if (context instanceof Error) {
    stack = context.stack;
    otherContext = { message: context.message, name: context.name };
  } else if (typeof context === 'object') {
    ({ stack, ...otherContext } = context);
  } else {
    otherContext = { details: context };
  }

  let logMessage = `[${timestamp}] ERROR: ${message}`;

  if (Object.keys(otherContext).length) {
    logMessage += ` | Context: ${JSON.stringify(otherContext)}`;
  }

  if (stack) {
    logMessage += `\nStack Trace:\n${stack}`;
  }

  console.error(logMessage);
};

module.exports = {
  log,
  error,
};