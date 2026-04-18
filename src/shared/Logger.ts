import { Container, Token } from 'dioma';

type Message = {
  level: 'info' | 'error' | 'warn';
  message: string;
  timestamp: string;
};

export type LoggerLevel = 'info' | 'error' | 'warn';
const levels: LoggerLevel[] = ['info', 'error', 'warn'];

/* eslint-disable no-console */
const consoleByLevel: Record<LoggerLevel, (...args: unknown[]) => void> = {
  info: console.log,
  error: console.error,
  warn: console.warn,
};
/* eslint-enable no-console */

export class Logger {
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
    // Only log if the current level's priority is less than or equal to the message level's priority
    const currentLevelIndex = levels.indexOf(this.level);
    const messageLevelIndex = levels.indexOf(level);
    if (messageLevelIndex < currentLevelIndex) {
      return;
    }

    const logFn = consoleByLevel[level] ?? consoleByLevel.info;
    logFn(message);
  }

  getMessages() {
    return this.messages;
  }

  getPrefixedLog = (prefix: string) => (message: string, level?: LoggerLevel) =>
    this.log(`${prefix}: ${message}`, level);

  /**
   * Clears all stored log messages
   */
  clearMessages() {
    this.messages = [];
  }
}

export const loggerToken = new Token<Logger>('logger');

export const registerLogger = (container: Container) => {
  container.register({ token: loggerToken, value: new Logger() });
};
