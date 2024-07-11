import { ILiveReloaderSession, ILiveReloaderState } from "./ILiveReloaderState";

const SESSION_STORAGE_KEY = "pnp-live-reloader";
const SESSION_DEBUG_CONNECTED = "spfx-debug";
const DEBUG_QUERY_STRING = "?debug=true&noredir=true&debugManifestsFile=https://localhost:4321/temp/manifests.js";

export interface ILiveReloaderService {
    available: boolean;
    connected: boolean;
    debugConnected: boolean;
    state: { available: boolean; connected: boolean; debugConnected: boolean }
}

export class LiveReloaderService implements ILiveReloaderService {

    private _available?: boolean;
    private _connected?: boolean;
    private _debugConnected: boolean;

    constructor() {

        const storageItem = sessionStorage.getItem(SESSION_STORAGE_KEY);
        const debugMode = sessionStorage.getItem(SESSION_DEBUG_CONNECTED);

        if (storageItem === null) {
            console.debug(' No storage entity found ');
        } else {
            const sessionSettings = JSON.parse(storageItem) as ILiveReloaderState;
            sessionSettings.available = false;
            this.state = sessionSettings;
        }

        if (debugMode !== null) {
            this._debugConnected = true;
        } else {
            this._debugConnected = false;
        }

    }

    private _updateSessionState(state: ILiveReloaderState): void {

        const sessionState = {

            connected: state.connected

        } as ILiveReloaderSession;

        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionState));
        this._connected = state.connected;

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
        const state = this.state;
        state.connected = v;
        this._updateSessionState(state);
        this._connected = v;
    }

    set debugConnected(v: boolean) {

        this._debugConnected = v;

        if (!v) {
            const sessionDebugItem = sessionStorage.getItem(SESSION_DEBUG_CONNECTED);
            if (sessionDebugItem) {
                sessionStorage.removeItem(SESSION_DEBUG_CONNECTED);
            }
            const refreshUrl = location.protocol + '//' + location.host + location.pathname;
            window.location.href = refreshUrl;
        } else {
            const refreshUrl = location.protocol + '//' + location.host + location.pathname+DEBUG_QUERY_STRING;
            window.location.href = refreshUrl;
        }
    }


    get debugConnected(): boolean {
        return this._debugConnected;
    }

    get state() {
        return {
            available: this.available,
            connected: this.connected,
            debugConnected: this.debugConnected
        }
    }

    set state(state: ILiveReloaderState) {

        if (state.available) {

            this._available = state.available;

        }

        if (state.connected) {

            this._connected = state.connected;

        }

        if (state.debugConnected) {

            this._debugConnected = state.debugConnected;

        }

        this._updateSessionState(state);

    }

}

export const lrs = new LiveReloaderService();