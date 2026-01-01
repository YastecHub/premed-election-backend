type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private level: LogLevel = 'info';

  constructor() {
    const envLevel = process.env.LOG_LEVEL?.toLowerCase() as LogLevel;
    if (['debug', 'info', 'warn', 'error'].includes(envLevel)) {
      this.level = envLevel;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    return levels[level] >= levels[this.level];
  }

  private log(level: LogLevel, message: string, ...args: any[]) {
    if (!this.shouldLog(level)) return;
    const timestamp = new Date().toISOString();
    console[level === 'debug' ? 'log' : level](`[${timestamp}] [${level.toUpperCase()}]`, message, ...args);
  }

  debug(message: string, ...args: any[]) { this.log('debug', message, ...args); }
  info(message: string, ...args: any[]) { this.log('info', message, ...args); }
  warn(message: string, ...args: any[]) { this.log('warn', message, ...args); }
  error(message: string, ...args: any[]) { this.log('error', message, ...args); }
}

export const logger = new Logger();