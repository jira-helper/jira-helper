import { Container, Token } from 'dioma';

type Message = {
  level: 'info' | 'error' | 'warn';
  message: string;
  timestamp: string;
};

export type LoggerLevel = 'info' | 'error' | 'warn';
const levels: LoggerLevel[] = ['info', 'error', 'warn'];

class Logger {
  private messagesSize: number = 2000;

  private messages: Message[] = [];

  private level: LoggerLevel = 'error';

  setLevel(level: LoggerLevel) {
    this.level = level;
  }

  log(message: string, level: LoggerLevel = 'info') {
    this.messages.push({ message, level, timestamp: new Date().toISOString() });
    if (this.messages.length > this.messagesSize) {
      this.messages = this.messages.slice(-this.messagesSize);
    }

    if (!(levels.indexOf(level) >= levels.indexOf(this.level))) {
      return;
    }

    switch (level) {
      case 'info':
        // eslint-disable-next-line no-console
        console.log(message);
        break;
      case 'error':
        // eslint-disable-next-line no-console
        console.error(message);
        break;
      case 'warn':
        // eslint-disable-next-line no-console
        console.warn(message);
        break;
      default:
        // eslint-disable-next-line no-console
        console.log(message);
        break;
    }
  }

  getMessages() {
    return this.messages;
  }

  getPrefixedLog = (prefix: string) => (message: string, level?: LoggerLevel) =>
    this.log(`${prefix}: ${message}`, level);
}

export const loggerToken = new Token<Logger>('logger');

export const registerLogger = (container: Container) => {
  container.register({ token: loggerToken, value: new Logger() });
};
