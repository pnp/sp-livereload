import { ILiveReloaderMessage } from '../common/ILivereloaderMessage';
import { LiveReloaderState } from '../common/LiveReloaderState';
import { LogDebug } from '../common/Logger';
import { AvailablityState } from './AvailabilityState';
import { BrandingInfo } from './BrandingInfo';
import { HooToggle } from './HooToggle';

export default class LiveReloadBar {

    _LIVE_RELOAD_IDENTIFIER = "PnP-Live-Reload";
    _LIVE_RELOADER_SOCKET = "https://localhost:35729/livereload.js?snipver=1";
    _LIVE_RELOADER_SOCKET_ALERT = "https://localhost:35729/changed";

    _connection: WebSocket;

    _parentDom: HTMLElement;
    _domContainer = new DocumentFragment();
    _stateAvailable: HTMLOutputElement;
    _stateConnected: HTMLOutputElement;
    _liveReloaderState: LiveReloaderState;
    _toggle: HooToggle;
    _avalibility: AvailablityState;

    changeConnection = (event: Event): void => {
        this.setState({ available: this._liveReloaderState.available, connected: !this._liveReloaderState.connected });
        this.connectLiveReload();
    }

    private connectLiveReload() {
        // create a new <script> element
        if (this._liveReloaderState.available) {


            if (!this._connection) {
                this._connection = new WebSocket(this._LIVE_RELOADER_SOCKET);
            }

            try {
                this._connection.addEventListener('open', (event) => {
                    LogDebug('Web Socket Event ::: OPEN', event)
                })
                this._connection.addEventListener('message', (event) => {
                    if (event.data) {
                        const msgCommand = JSON.parse(event.data) as ILiveReloaderMessage;
                        if (this._liveReloaderState.state.connected && msgCommand.command && msgCommand.command === 'reload') {
                            window.location.reload();
                        }
                        LogDebug('MESSAGE COMMAND::::', msgCommand);
                    }
                    LogDebug('Web Socket Event ::: Message', event)
                })
            } catch (error) {

                LogDebug('Failed to connect')

            }

        }

    }

    constructor(state: LiveReloaderState, parentElement: HTMLElement) {

        this._liveReloaderState = state;

        console.debug('------', this._liveReloaderState, state);

        this._parentDom = parentElement;
        this.updateUI(state);
        this.connectLiveReload();
        new BrandingInfo(parentElement);

    }

    updateUI(state: LiveReloaderState) {

        const section: HTMLElement = document.createElement('section') as HTMLElement;
        Object.assign(section, {
            classList: 'pnp-lr-base'
        })
        this._domContainer.appendChild(section);

        this._avalibility = new AvailablityState(this._liveReloaderState, section);

        this._toggle = new HooToggle({ labelInactive: "Disconnected", labelActive: "Connected" }, section);
        this._toggle.addEventListener('click', this.changeConnection);

        

        this.setState(state);

        this._parentDom.append(this._domContainer);


    }

    get UI(): HTMLElement {

        if (!this._domContainer) {
            throw Error("LiveReloarderBar cannot be found");
        }

        return this._domContainer.firstChild as HTMLElement;

    }

    setState(state: LiveReloaderState, callback?: () => void) {

        console.debug(state, this._liveReloaderState);

        this._liveReloaderState.state = state;

        if (this._liveReloaderState.available !== undefined) {
            this._toggle.enabled = this._liveReloaderState.available;
            this._avalibility.available = this._liveReloaderState.available;
        }

        if (this._liveReloaderState.connected !== undefined) {
            this._toggle.checked = this._liveReloaderState.connected;
        }

        // // this._liveReloaderState.setState(state);
        // if (callback) {

        //     callback();
        // }

    }

}