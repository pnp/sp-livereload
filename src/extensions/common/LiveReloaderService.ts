import { ILiveReloaderSession, ILiveReloaderState } from "./ILiveReloaderState";

const SESSION_STORAGE_KEY = "pnp-live-reloader";
const SESSION_DEBUG_CONNECTED = "pnp-lr-debug";
const PLACEMENT_STORAGE_KEY = "pnp-live-reloader-placement";
// SPFx v1.21+ uses /temp/build/manifests.js
const DEBUG_QUERY_STRING = "?debug=true&noredir=true&debugManifestsFile=https://localhost:4321/temp/build/manifests.js";

export type PlacementPosition = 'top' | 'bottom';

export interface ILiveReloaderService {
    available: boolean;
    connected: boolean;
    debugConnected: boolean;
    placement: PlacementPosition;
    // v1.3 - HMR Interceptor properties
    paused: boolean;
    pendingCount: number;
    modernMode: boolean;
    state: ILiveReloaderState;
}

export class LiveReloaderService implements ILiveReloaderService {

    private _available?: boolean;
    private _connected?: boolean;
    private _debugConnected: boolean;
    private _placement: PlacementPosition;
    // v1.3 - HMR Interceptor properties
    private _paused = false;
    private _pendingCount = 0;
    private _modernMode = false;

    constructor() {

        const storageItem = sessionStorage.getItem(SESSION_STORAGE_KEY);
        const debugMode = sessionStorage.getItem(SESSION_DEBUG_CONNECTED);
        const placementItem = localStorage.getItem(PLACEMENT_STORAGE_KEY);

        if (storageItem === null) {
            console.debug(' No storage entity found ');
        } else {
            const sessionSettings = JSON.parse(storageItem) as ILiveReloaderSession;
            // Restore paused state from session
            if (sessionSettings.paused !== undefined) {
                this._paused = sessionSettings.paused;
            }
            // Restore connected state
            if (sessionSettings.connected !== undefined) {
                this._connected = sessionSettings.connected;
            }
        }

        if (debugMode !== null) {
            this._debugConnected = true;
        } else {
            this._debugConnected = false;
        }

        // Initialize placement from localStorage, default to 'bottom'
        if (placementItem === 'top' || placementItem === 'bottom') {
            this._placement = placementItem;
        } else {
            this._placement = 'bottom';
        }

    }

    private _updateSessionState(state: ILiveReloaderState): void {

        const sessionState = {
            connected: state.connected,
            paused: state.paused
        } as ILiveReloaderSession;

        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionState));
        this._connected = state.connected;
        this._paused = state.paused;

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

        // Clear SPFx component manifest caches that cause "page stuck" when switching
        // debug mode. Preserve only the placement preference from localStorage.
        const placement = localStorage.getItem(PLACEMENT_STORAGE_KEY);
        localStorage.clear();
        if (placement) {
            localStorage.setItem(PLACEMENT_STORAGE_KEY, placement);
        }
        sessionStorage.clear();

        if (!v) {
            // Reset connected state so the toggle starts as OFF on the non-debug page
            this.connected = false;
            const refreshUrl = location.protocol + '//' + location.host + location.pathname;
            window.location.href = refreshUrl;
        } else {
            sessionStorage.setItem(SESSION_DEBUG_CONNECTED, 'true');
            const refreshUrl = location.protocol + '//' + location.host + location.pathname+DEBUG_QUERY_STRING;
            window.location.href = refreshUrl;
        }
    }


    get debugConnected(): boolean {
        return this._debugConnected;
    }

    get placement(): PlacementPosition {
        return this._placement;
    }

    set placement(v: PlacementPosition) {
        this._placement = v;
        localStorage.setItem(PLACEMENT_STORAGE_KEY, v);
        // Reload the page to apply the new placement
        window.location.reload();
    }

    // v1.3 - HMR Interceptor properties

    get paused(): boolean {
        return this._paused;
    }

    set paused(v: boolean) {
        this._paused = v;
        const state = this.state;
        state.paused = v;
        this._updateSessionState(state);
    }

    get pendingCount(): number {
        return this._pendingCount;
    }

    set pendingCount(v: number) {
        this._pendingCount = v;
    }

    get modernMode(): boolean {
        return this._modernMode;
    }

    set modernMode(v: boolean) {
        this._modernMode = v;
    }

    get state(): ILiveReloaderState {
        return {
            available: this.available,
            connected: this.connected,
            debugConnected: this.debugConnected,
            paused: this.paused,
            pendingCount: this.pendingCount,
            modernMode: this.modernMode
        }
    }

    set state(state: ILiveReloaderState) {

        if (state.available !== undefined) {
            this._available = state.available;
        }

        if (state.connected !== undefined) {
            this._connected = state.connected;
        }

        if (state.debugConnected !== undefined) {
            this._debugConnected = state.debugConnected;
        }

        if (state.paused !== undefined) {
            this._paused = state.paused;
        }

        if (state.pendingCount !== undefined) {
            this._pendingCount = state.pendingCount;
        }

        if (state.modernMode !== undefined) {
            this._modernMode = state.modernMode;
        }

        this._updateSessionState(state);

    }

}

export const lrs = new LiveReloaderService();