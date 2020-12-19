import moment from 'moment';
import chalk from 'chalk';

export const LOG_LEVELS = {
    'DEBUG': 'debug',
    'INFO': 'info',
    'WARNING': 'warning',
    'ERROR': 'error',
    'CRITICAL': 'critical'
};

export default class Logger {
    private _prefix:string;
    private _separator:string;
    private _displayLogLevel:boolean ;

    constructor(prefix: string, displayLogLevel = true, separator = '  ') {
        this._prefix = prefix;
        this._separator = separator;
        this._displayLogLevel = displayLogLevel;
    }

    public surround(str: string, startTag = '[', endTag = ']'): string {
        return str && str.length ? `${startTag}${str}${endTag}` : '';
    }

    get timestamp(): string {
        return moment().format('YYYY.MM.DD HH:mm:ss');
    }

    private createLogStr(message: string, logLevel: string): string {
        return `${this.surround(this.timestamp)}${this.surround(this._displayLogLevel ? logLevel.toUpperCase() : '')}${this._separator}${this.surround(this._prefix)}${this._separator}${message}`;
    }

    private colorText(message: string, logLevel: string): string {
        let result: string = message;

        if (logLevel === LOG_LEVELS.DEBUG) {
            result = chalk.white(message);
        } else if (logLevel === LOG_LEVELS.INFO) {
            result = chalk.green(message);
        } else if (logLevel === LOG_LEVELS.WARNING) {
            result = chalk.yellow(message);
        } else if (logLevel === LOG_LEVELS.ERROR) {
            result = chalk.red(message);
        } else if (logLevel === LOG_LEVELS.CRITICAL) {
            result = chalk.bgRed(message);
        }

        return result;
    }

    log(message:string, logLevel = LOG_LEVELS.INFO): void {
        console.log(
            this.colorText(
                this.createLogStr(message, logLevel),
                logLevel)
        );
    }

    info(message:string): void {
        console.info(
            this.colorText(
                this.createLogStr(message, LOG_LEVELS.INFO),
                LOG_LEVELS.INFO)
        );
    }

    warn(message:string): void {
        console.warn(
            this.colorText(
                this.createLogStr(message, LOG_LEVELS.WARNING),
                LOG_LEVELS.WARNING)
        );
    }

    error(message:string): void {
        console.error(
            this.colorText(
                this.createLogStr(message, LOG_LEVELS.ERROR),
                LOG_LEVELS.ERROR)
        );
    }

    critical(message:string): void {
        console.error(
            this.colorText(
                this.createLogStr(message, LOG_LEVELS.CRITICAL),
                LOG_LEVELS.CRITICAL)
        );
    }

    debug(message:string): void {
        console.debug(
            this.colorText(
                this.createLogStr(message, LOG_LEVELS.DEBUG),
                LOG_LEVELS.DEBUG)
        );
    }
}