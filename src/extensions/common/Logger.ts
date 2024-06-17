
export enum LogLevel {
    Debug = 0,
    Info = 1,
    Warning = 2,
    Error = 3,
    Fatal = 4,
    None = 5,
}

export interface ILogger {
    log(level: LogLevel, ...data: any[]): void;
}

export class Logger {

    static LOG_STRING_PREFIX: string = "💫 Live Reload Bar ::: \n\t";

    /**
     * Logs the provided data to the console with a prefix.
     *
     * @param data - The data to be logged.
     */
    static log(logLevel: LogLevel, data: any[]): void {

        data.unshift(Logger.LOG_STRING_PREFIX);

        if (logLevel === LogLevel.Error) {
            console.error(...data);
        } else {
            console.group(...data);
            console.groupEnd();
        }

    }

    static debug(...data: any[]): void {
        Logger.log(LogLevel.Debug, data);
    }
    static error(...data: any[]): void {
        Logger.log(LogLevel.Error, data);
    }

}

export const LogDebug = Logger.debug;
export const LogError = Logger.error;