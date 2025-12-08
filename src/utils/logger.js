/**
 * Logs an informational message with timestamp and optional context
 * @param {string} message - Message to log
 * @param {Object} [context={}] - Additional context data to include
 * @returns {void}
 * @example
 * log('User created', { userId: 123 });
 * log('Server started');
 */
const log = (message, context = {}) => {
  const timestamp = new Date().toISOString();
  const contextStr = Object.keys(context).length
    ? ` ${JSON.stringify(context)}`
    : "";
  console.log(`[${timestamp}] ${message}${contextStr}`);
};

/**
 * Logs an error message with timestamp, context, and stack trace
 * @param {string} message - Error message to log
 * @param {Error|Object} [context={}] - Error object or context data
 * @param {string} [context.stack] - Stack trace if available
 * @returns {void}
 * @example
 * error('Database connection failed', new Error('Connection timeout'));
 * error('Invalid input', { field: 'email', value: 'invalid' });
 */
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