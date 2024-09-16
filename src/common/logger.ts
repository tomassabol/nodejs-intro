import { type IncomingMessage } from "node:http";

export class Logger {
  debug(message: string, ...args: any) {
    console.log(`DEBUG: ${message}`, ...args);
  }

  info(message: string, ...args: any) {
    console.info(`INFO: ${message}`, ...args);
  }

  warn(message: string, ...args: any) {
    console.warn(`WARN: ${message}`, ...args);
  }

  error(message: string, ...args: any) {
    console.error(`ERROR: ${message}`, ...args);
  }

  critical(message: string, ...args: any) {
    console.error(`CRITICAL: ${message}`, ...args);
  }

  incomingMessage({ method, headers, url }: IncomingMessage) {
    console.log("Incoming message", { method, headers, url });
  }
}

export const logger = new Logger();
