type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private isProduction = process.env.NODE_ENV === 'production';

  private formatMessage(level: LogLevel, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  info(message: string, data?: any) {
    if (this.isProduction) return;
    console.info(this.formatMessage('info', message), data || '');
  }

  warn(message: string, data?: any) {
    console.warn(this.formatMessage('warn', message), data || '');
  }

  error(message: string, data?: any) {
    // Di sini bisa ditambahkan integrasi Sentry/LogRocket di masa depan
    console.error(this.formatMessage('error', message), data || '');
  }

  debug(message: string, data?: any) {
    if (this.isProduction) return;
    console.debug(this.formatMessage('debug', message), data || '');
  }
}

export const logger = new Logger();
