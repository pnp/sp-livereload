/* eslint-disable no-new */
import { IClientSideComponentManifest } from '@microsoft/sp-module-interfaces';
import { ILiveReloaderMessage } from '../common/ILiveReloaderMessage';
import { ILiveReloaderState } from '../common/ILiveReloaderState';
import { lrs } from '../common/LiveReloaderService';
import { LogDebug } from '../common/Logger';
import { AvailabilityState } from './AvailabilityState';
import { Branding } from './BrandingInfo';
import { Credits } from './Credits';
import { HMRInterceptor } from './HMRInterceptor';
import { HooIconButton } from './HooIconButton';
import { HooToggle } from './HooToggle';
import { QuickActions } from './QuickActions';

export default class LiveReloadBar {

    _LIVE_RELOAD_IDENTIFIER = "PnP-Live-Reload";
    // SPFx 1.21+ uses webpack-dev-server on port 4321
    _LIVE_RELOADER_SOCKET = "wss://localhost:4321/ws";
    // Legacy LiveReload server (SPFx < 1.21) - kept for reference
    _LIVE_RELOADER_SOCKET_LEGACY = "wss://localhost:35729/livereload.js?snipver=1";

    _mainfest!: IClientSideComponentManifest;
    _connection!: WebSocket;
    // Track webpack build hash to detect actual changes
    _currentHash: string | undefined = undefined;
    _isFirstHash = true;
    _pendingFullReload = false;

    _parentDom!: HTMLElement;
    _domContainer = new DocumentFragment();
    _stateAvailable!: HTMLOutputElement;
    _stateConnected!: HTMLOutputElement;
    _credits!: Credits;
    _branding!: Branding;
    _actionBar!: HTMLElement;
    _debugConnect!: HooIconButton;
    _debugDisconnect!: HooIconButton;
    _toggle!: HooToggle;
    _placementToggle!: HooToggle;
    _availability!: AvailabilityState;

    // v1.3 - HMR Interceptor properties
    _hmrInterceptor?: HMRInterceptor;
    _isModernMode = false;
    _pendingBadge!: HTMLElement;
    _applyButton!: HooIconButton;

    changeConnection = (_event: Event): void => {
        // Toggle the connected state
        lrs.connected = !lrs.connected;

        console.log('🔥 changeConnection: connected=', lrs.connected, 'modernMode=', this._isModernMode, 'interceptor=', !!this._hmrInterceptor);

        // In modern mode (1.22+), control HMR interceptor
        if (this._isModernMode && this._hmrInterceptor) {
            if (lrs.connected) {
                // Connected = let HMR updates through
                console.log('🔥 changeConnection: Enabling interceptor');
                this._hmrInterceptor.enable();
            } else {
                // Disconnected = intercept/buffer HMR updates
                console.log('🔥 changeConnection: Pausing interceptor, intercepted functions:', this._hmrInterceptor.interceptedFunctions);
                this._hmrInterceptor.pause();
            }
        } else {
            console.log('🔥 changeConnection: NOT in modern mode or no interceptor!');
        }

        // Sync UI with new state
        this.syncUI();
        this.connectLiveReload();
    }

    applyPendingUpdates = (_event: Event): void => {
        if (this._hmrInterceptor && this._hmrInterceptor.pendingCount > 0) {
            // Reconnect and reload to apply all accumulated changes
            this._hmrInterceptor.enable();
            lrs.connected = true;
            lrs.pendingCount = 0;
            // Reload page to get clean state with all latest code
            window.location.reload();
        }
    }

    changePlacement = (event: Event): void => {
        // Toggle between 'top' and 'bottom' placement
        lrs.placement = lrs.placement === 'top' ? 'bottom' : 'top';
        // Note: lrs.placement setter triggers window.location.reload()
    }

    private connectLiveReload() {

        // In modern mode (1.22+), we don't create a WebSocket
        // We rely on the HMR interceptor instead
        if (this._isModernMode) {
            LogDebug('Modern mode: Using HMR interceptor, skipping WebSocket');
            return;
        }

        // Legacy mode: create WebSocket connection
        if (lrs.available) {

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

                        // Legacy LiveReload format (SPFx < 1.21)
                        // Only reload if connected
                        if (lrs.state.connected && msgCommand.command === 'reload') {
                            window.location.reload();
                        }

                        // Webpack-dev-server format (SPFx 1.21+)
                        // Handle hot update signal - try HMR first before full reload
                        if (msgCommand.type === 'hot' && lrs.state.connected) {
                            LogDebug('🔥 Hot update signal received, attempting HMR...');
                            this.tryHotUpdate();
                        }

                        // Track hash to know current state
                        if (msgCommand.type === 'hash' && typeof msgCommand.data === 'string') {
                            const newHash = msgCommand.data;
                            LogDebug('Hash message received. Connected state:', lrs.state.connected);

                            if (this._isFirstHash) {
                                // Store initial hash, don't reload
                                this._currentHash = newHash;
                                this._isFirstHash = false;
                                LogDebug('Initial hash stored:', this._currentHash);
                            } else if (this._currentHash !== newHash) {
                                // Hash changed - update stored hash
                                LogDebug('Hash changed from', this._currentHash, 'to', newHash, '| Connected:', lrs.state.connected);
                                this._currentHash = newHash;
                                // Note: Don't reload here - wait for 'ok' message after hot update attempt
                            }
                        }

                        // 'ok' means build succeeded - if we get here and HMR didn't handle it, do full reload
                        if (msgCommand.type === 'ok' && lrs.state.connected && !this._isFirstHash) {
                            // Check if HMR is still processing
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const mod = module as any;
                            const hmrStatus = mod.hot?.status?.() || 'unknown';

                            if (hmrStatus === 'idle') {
                                // HMR finished or wasn't applicable - check if we need full reload
                                if (this._pendingFullReload) {
                                    LogDebug('🔄 HMR not applicable, falling back to full reload');
                                    this._pendingFullReload = false;
                                    window.location.reload();
                                }
                            } else {
                                LogDebug('🔥 HMR status:', hmrStatus, '- waiting for completion');
                            }
                        }
                        LogDebug('MESSAGE COMMAND ::::', msgCommand);
                    }
                    LogDebug('Web Socket Event ::: Message', event)
                })
            } catch {

                LogDebug('Failed to connect')

            }

        }

    }

    private checkHMRSupport(): void {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mod = module as any;

        if (mod.hot) {
            LogDebug('🔥 HMR is available!', mod.hot);
            LogDebug('🔥 HMR status:', mod.hot.status ? mod.hot.status() : 'unknown');

            // Listen for HMR status changes
            if (mod.hot.addStatusHandler) {
                mod.hot.addStatusHandler((status: string) => {
                    LogDebug('🔥 HMR status changed:', status);

                    // If HMR fails or is aborted, trigger full reload
                    if (status === 'abort' || status === 'fail') {
                        LogDebug('🔥 HMR ' + status + ' - will fall back to full reload');
                        this._pendingFullReload = true;
                    }

                    // If HMR succeeded, clear pending reload flag
                    if (status === 'idle' && !this._pendingFullReload) {
                        LogDebug('🔥 HMR completed successfully - no full reload needed');
                    }
                });
            }
        } else {
            LogDebug('❌ HMR is NOT available - module.hot is undefined');
        }
    }

    private tryHotUpdate(): void {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mod = module as any;

        if (!mod.hot) {
            LogDebug('❌ HMR not available, falling back to full reload');
            this._pendingFullReload = true;
            return;
        }

        const status = mod.hot.status();
        if (status !== 'idle') {
            LogDebug('🔥 HMR busy (status: ' + status + '), skipping');
            return;
        }

        // Attempt to check and apply hot updates
        mod.hot.check(true)
            .then((updatedModules: string[] | null) => {
                if (!updatedModules) {
                    LogDebug('🔥 No modules to update');
                    this._pendingFullReload = true;
                    return;
                }

                if (updatedModules.length === 0) {
                    LogDebug('🔥 All modules up to date');
                    return;
                }

                LogDebug('🔥 Hot update applied successfully!', updatedModules);
                LogDebug('🔥 Updated modules:', updatedModules.length);

                // HMR succeeded - no need for full reload
                this._pendingFullReload = false;
            })
            .catch((err: Error) => {
                LogDebug('🔥 HMR check/apply failed:', err.message);
                LogDebug('🔥 Falling back to full reload');
                this._pendingFullReload = true;

                // Trigger reload on next 'ok' message or immediately if status is idle
                if (mod.hot.status() === 'idle') {
                    window.location.reload();
                }
            });
    }

    constructor(parentElement: HTMLElement, manifest: IClientSideComponentManifest) {

        this._parentDom = parentElement;
        this._mainfest = manifest;
        this.updateUI(lrs.state);

        // Initialize based on detected SPFx version
        this.detectAndInitialize().catch(err => LogDebug('Initialization error:', err));

    }

    /**
     * Detect SPFx version and initialize the appropriate mode
     */
    private async detectAndInitialize(): Promise<void> {
        const version = await this.detectSPFxVersion();
        this._isModernMode = this.isVersion122OrHigher(version);
        lrs.modernMode = this._isModernMode;

        // Update credits panel with the runtime-detected version
        this._credits.updateSPFxVersion(version);

        console.log('🔥 detectAndInitialize: SPFx version=', version, 'modernMode=', this._isModernMode);

        if (this._isModernMode) {
            // Modern mode (1.22+): Use HMR interceptor, no custom WebSocket
            // HMR is always available in 1.22+
            this._hmrInterceptor = new HMRInterceptor();
            this._hmrInterceptor.install((count) => {
                LogDebug('🔥 HMR callback: pending count =', count);
                this.updatePendingBadge(count);
            });

            // Rescan periodically to catch webpackHotUpdate* functions that appear later
            // webpack may create these functions after initial page load
            let rescanCount = 0;
            const rescanInterval = setInterval(() => {
                rescanCount++;
                if (this._hmrInterceptor) {
                    const before = this._hmrInterceptor.interceptedFunctions.length;
                    this._hmrInterceptor.rescan();
                    const after = this._hmrInterceptor.interceptedFunctions.length;
                    LogDebug('🔥 HMR Rescan #' + rescanCount + ': before=' + before + ', after=' + after);
                    if (after > before) {
                        LogDebug('🔥 HMR Interceptor: Found', after - before, 'new functions:', this._hmrInterceptor.interceptedFunctions);
                    }
                    // Stop rescanning after finding functions or after 20 rescans (10 seconds)
                    if (after > 0 || rescanCount >= 20) {
                        LogDebug('🔥 HMR Rescan: Stopping. Found', after, 'functions');
                        clearInterval(rescanInterval);
                    }
                }
            }, 500);

            // Stop rescanning after 15 seconds regardless
            setTimeout(() => {
                LogDebug('🔥 HMR Rescan: Timeout reached');
                clearInterval(rescanInterval);
            }, 15000);

            // In modern mode, default to connected (HMR flows through)
            // unless user explicitly disconnected in a previous session
            // Note: lrs.connected comes from session storage
            if (lrs.connected) {
                this._hmrInterceptor.enable();
            } else {
                this._hmrInterceptor.pause();
            }

            this.syncUI();
        } else {
            // Legacy mode: Use WebSocket approach
            this.connectLiveReload();
        }

        // Check HMR support
        this.checkHMRSupport();
    }

    /**
     * Detect SPFx version by fetching package.json from webpack-dev-server
     */
    private async detectSPFxVersion(): Promise<string | null> {
        try {
            const response = await fetch('https://localhost:4321/package.json');
            if (!response.ok) {
                LogDebug('Failed to fetch package.json:', response.status);
                return null;
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const pkg = await response.json() as any;

            // Check for SPFx build tools version
            const spBuildWeb = pkg.devDependencies?.['@microsoft/sp-build-web'];
            const spfxHeftPlugins = pkg.devDependencies?.['@microsoft/spfx-heft-plugins'];
            const spAppBase = pkg.dependencies?.['@microsoft/sp-application-base'];

            // Return the most relevant version found
            return spfxHeftPlugins || spBuildWeb || spAppBase || null;
        } catch (error) {
            LogDebug('Could not detect SPFx version (webpack-dev-server may not be running):', error);
            return null;
        }
    }

    /**
     * Check if the detected version is 1.22.0 or higher
     */
    private isVersion122OrHigher(version: string | null): boolean {
        if (!version) return false;

        // Remove any leading ^ or ~ from the version
        const cleanVersion = version.replace(/^[\^~]/, '');

        // Parse the version
        const match = cleanVersion.match(/^(\d+)\.(\d+)\.(\d+)/);
        if (!match) return false;

        const major = parseInt(match[1], 10);
        const minor = parseInt(match[2], 10);

        // Check if >= 1.22.0
        if (major > 1) return true;
        if (major === 1 && minor >= 22) return true;

        return false;
    }

    /**
     * Update the pending badge with the current count
     */
    private updatePendingBadge(count: number): void {
        lrs.pendingCount = count;

        // In modern mode: show badge only when disconnected (interceptor paused) and has pending
        // In legacy mode: show badge when paused and has pending
        const isIntercepting = this._isModernMode ? !lrs.connected : lrs.paused;

        if (this._pendingBadge) {
            if (count > 0 && isIntercepting) {
                this._pendingBadge.textContent = count.toString();
                this._pendingBadge.style.display = 'inline-flex';
            } else {
                this._pendingBadge.style.display = 'none';
            }
        }

        // Show/hide apply button based on pending count and interceptor state
        if (this._applyButton) {
            if (count > 0 && isIntercepting) {
                this._applyButton.Button.style.display = 'inline-flex';
            } else {
                this._applyButton.Button.style.display = 'none';
            }
        }
    }

    logo(): Node {
        const logo = document.createElement('h2');
        logo.textContent = "PnP Live Reloader";
        logo.classList.add('pnp-lr-logo');

        return logo;
    }

    private showBrandingInformation = (event: MouseEvent) =>{

         if(!this._branding.Info.hasAttribute('open')){
            this._branding.Info.show();
         } else {
            this._branding.Info.close();
         }
    }

    updateUI(state: ILiveReloaderState) {

        const section: HTMLElement = document.createElement('section') as HTMLElement;
        Object.assign(section, {
            classList: 'pnp-lr-base'
        })
        this._domContainer.appendChild(section);

        section.append(this.logo());
        const actionBar = new QuickActions(section);

        const brandingInfo = new HooIconButton('icon-paint-bucket-filled', { ariaLabel: 'Show Branding and Design Information' }, actionBar.Container);
        brandingInfo.addEventListener('click', this.showBrandingInformation);

        this._branding = new Branding();
        this._parentDom.prepend(this._branding.Info);

        // Show plug icon based on debugConnected state
        // Toggles the debug manifest URL (?debug=true&noredir=true&debugManifestsFile=...)
        if (lrs.debugConnected) {
            this._debugConnect = new HooIconButton('icon-plug-connected-filled', { ariaLabel: 'Debug Connected' }, actionBar.Container);
            this._debugConnect.addEventListener('click', _evt => {
                lrs.debugConnected = false;
            });
        } else {
            this._debugDisconnect = new HooIconButton('icon-plug-disconnected-filled', { ariaLabel: 'Debug Disconnected' }, actionBar.Container);
            this._debugDisconnect.addEventListener('click', _evt => {
                lrs.debugConnected = true;
            });
        }

        section.append(actionBar.Container);

        this._availability = new AvailabilityState(lrs, section);

        // v1.3 - Connection toggle with pending badge
        // In modern mode (1.22+): Connected = HMR active, Disconnected = HMR intercepted
        // In legacy mode: Connected = WebSocket active, Disconnected = no reload
        const connectionContainer = document.createElement('div');
        connectionContainer.classList.add('pnp-lr-connection-container');
        section.append(connectionContainer);

        this._toggle = new HooToggle({ labelInactive: "Disconnected", labelActive: "Connected" }, connectionContainer, { tabIndex: -1 });
        this._toggle.addEventListener('click', this.changeConnection);
        this._toggle.enabled = lrs.connected;

        // Pending badge (shown next to Connected toggle when updates are buffered)
        this._pendingBadge = document.createElement('span');
        this._pendingBadge.classList.add('pnp-lr-pending-badge');
        this._pendingBadge.style.display = 'none';
        connectionContainer.append(this._pendingBadge);

        // Apply button (appears when disconnected with pending updates)
        this._applyButton = new HooIconButton('icon-checkmark-filled', { ariaLabel: 'Apply pending updates' }, connectionContainer);
        this._applyButton.addEventListener('click', this.applyPendingUpdates);
        this._applyButton.Button.style.display = 'none';
        this._applyButton.Button.classList.add('pnp-lr-apply-btn');

        this._placementToggle = new HooToggle({ labelInactive: "Footer", labelActive: "Header" }, section, { tabIndex: -1 });
        this._placementToggle.addEventListener('click', this.changePlacement);
        this._placementToggle.checked = lrs.placement === 'top';
        // Set hover tooltip to show opposite action
        this._placementToggle._inputToggle.title = lrs.placement === 'top' ? 'Toggle to Footer' : 'Toggle to Header';

        const lrActionCredit = document.createElement('div');
        lrActionCredit.classList.add('pnp-lr-actions');
        section.append(lrActionCredit);

        const creditsButton = new HooIconButton('icon-info-filled', { ariaLabel: 'Show / Hide Credits' }, lrActionCredit);

        this._credits = new Credits(this._mainfest);
        this._parentDom.prepend(this._credits.credits);

        creditsButton.addEventListener('click', () => {

            console.debug(this._credits.credits, this._credits.credits.hasAttribute('open'));

            if (this._credits.credits.hasAttribute('open')) {
            
                this._credits.credits.close();
            
            } else {
            
                this._credits.credits.show();
            
            }

        })


        this.syncUI();

        this._parentDom.append(this._domContainer);


    }

    get UI(): HTMLElement {

        if (!this._domContainer) {
            throw Error("LiveReloarderBar cannot be found");
        }

        return this._domContainer.firstChild as HTMLElement;

    }

    syncUI() {
        // Sync UI elements with current state (don't modify state here)
        if (lrs.available !== undefined) {
            this._toggle.enabled = lrs.available;
            this._availability.available = lrs.available;
        }

        // Sync toggle with current connected state
        // In modern mode: connected = HMR active, disconnected = HMR intercepted
        this._toggle.checked = lrs.connected;

        // Update pending badge
        this.updatePendingBadge(lrs.pendingCount);
    }

}