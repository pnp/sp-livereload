import { ILiveReloaderSession, ILiveReloaderState } from "./ILiveReloaderState";
import { LogDebug } from "./Logger";

const SESSION_STORAGE_KEY = "pnp-live-reloader";

export class LiveReloaderState {

    private _available?: boolean;
    private _connected?: boolean;

    constructor() {

        const storageItem = sessionStorage.getItem(SESSION_STORAGE_KEY);

        if (storageItem === null) {
            console.debug(' NOOOTTTHING ');
        } else {
            const sessionSettiings = JSON.parse(storageItem) as ILiveReloaderState;
            sessionSettiings.available = false;
            LogDebug('Session Storage', sessionSettiings);
            this.state = sessionSettiings;
        }

    }

    private updateSessionState(state: ILiveReloaderState): void {

        console.debug('SESSSION STATE')
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

        this.updateSessionState(state);

    }

}