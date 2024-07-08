import { ILiveReloaderSession, ILiveReloaderState } from "./ILiveReloaderState";
import { LogDebug } from "./Logger";

const SESSION_STORAGE_KEY = "pnp-live-reloader";

export interface ILiveReloaderService {
  available: boolean;
  connected: boolean;
  state: {available: boolean; connected: boolean; }
}

export class LiveReloaderService implements ILiveReloaderService {

    private _available?: boolean;
    private _connected?: boolean;

    constructor() {

        const storageItem = sessionStorage.getItem(SESSION_STORAGE_KEY);

        if (storageItem === null) {
            console.debug(' No storage entity found ');
        } else {
            const sessionSettings = JSON.parse(storageItem) as ILiveReloaderState;
            sessionSettings.available = false;
            LogDebug('Session Storage', sessionSettings);
            this.state = sessionSettings;
        }

    }

    private _updateSessionState(state: ILiveReloaderState): void {

        console.debug('SESSION STATE')
        const sessionState = {

            connected: state.connected

        } as ILiveReloaderSession;

        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionState));
        this._connected = state.connected;
        console.debug('SESSION STATE:::: ', this.state);
        console.debug(sessionStorage.getItem(SESSION_STORAGE_KEY));

    }

    get available(): boolean {

        if (this._available) {
            return this._available;
        } else {
            return false;
        }
    }

    set available(v: boolean) {
        this._available = v;
    }

    get connected(): boolean {
        if (this._connected) {
            return this._connected;
        } else {
            return false;
        }
    }

    set connected(v: boolean) {
        this._connected = v;
    }

    get state() {
        return {
            available: this.available,
            connected: this.connected
        }
    }

    set state(state: ILiveReloaderState) {

        LogDebug('UPDATING state ...', state);

        if (state.available) {

            this._available = state.available;

        }

        if (state.connected) {

            this._connected = state.connected;

        }

        this._updateSessionState(state);

    }

}

export const lrs = new LiveReloaderService();