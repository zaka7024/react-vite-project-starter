(function() {
  const originalConsole = {
    log: console.log.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
    info: console.info.bind(console),
    debug: console.debug.bind(console),
  };

  const serializeArg = (arg) => {
    if (arg === undefined) return 'undefined';
    if (arg === null) return 'null';
    if (arg instanceof Error) {
      return `${arg.name}: ${arg.message}\n${arg.stack || ''}`;
    }
    if (typeof arg === 'object') {
      try {
        return JSON.stringify(arg, null, 2);
      } catch (e) {
        return String(arg);
      }
    }
    return String(arg);
  };

  ['log', 'warn', 'error', 'info', 'debug'].forEach(method => {
    console[method] = function(...args) {
      originalConsole[method](...args);
      
      window.parent.postMessage({
        type: 'console-log',
        level: method,
        message: args.map(serializeArg).join(' '),
        timestamp: Date.now()
      }, '*');
    };
  });
  
  window.addEventListener('error', (event) => {
    window.parent.postMessage({
      type: 'console-log',
      level: 'error',
      message: `${event.message} at ${event.filename}:${event.lineno}:${event.colno}`,
      timestamp: Date.now()
    }, '*');
  });

  window.addEventListener('unhandledrejection', (event) => {
    window.parent.postMessage({
      type: 'console-log',
      level: 'error',
      message: `Unhandled Promise Rejection: ${serializeArg(event.reason)}`,
      timestamp: Date.now()
    }, '*');
  });
})();
