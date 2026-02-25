import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName
} from '@microsoft/sp-application-base';

import { lrs } from '../common/LiveReloaderService';
import LiveReloadBar from '../components/LiveReloadBar';

import { LogDebug, LogError } from '../common/Logger';
import styles from './PnPSpFxLiveReloaderApplicationCustomizer.module.scss';

import {
  IReadonlyTheme,
  ThemeChangedEventArgs,
  ThemeProvider
} from '@microsoft/sp-component-base';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IPnPSPFxLiveReloaderApplicationCustomizerProperties {
  // This is an example; replace with your own property
  Bottom: string;
  Top: string;
}

// SPFx v1.21+ uses /temp/build/manifests.js, earlier versions use /temp/manifests.js
const LIVE_RELOAD_CONNECTION_V121 = "//localhost:4321/temp/build/manifests.js";
const LIVE_RELOAD_CONNECTION_LEGACY = "//localhost:4321/temp/manifests.js";

/** A Custom Action which can be run during execution of a Client Side Application */
export default class PnPSPFxLiveReloaderApplicationCustomizer
  extends BaseApplicationCustomizer<IPnPSPFxLiveReloaderApplicationCustomizerProperties> {

  _themeProvider!: ThemeProvider;
  _themeVariant: IReadonlyTheme | undefined;
  _styles!: CSSStyleDeclaration;
  _placeholder: PlaceholderContent | undefined;
  _liveReloaderBar!: LiveReloadBar;

  private async checkLiveReloadStatus() {

    const connectionResponse = await this._checkConnection();
    // LogDebug('INIT LIVE RELOADER STATE\n\t', lrs, connectionResponse);

    if (connectionResponse && connectionResponse.status === 200) {
      lrs.state = { available: true, connected: lrs.connected, debugConnected: lrs.debugConnected, paused: lrs.paused, pendingCount: lrs.pendingCount, modernMode: lrs.modernMode };
    } else {
      lrs.state = { available: false, connected: false, debugConnected: false, paused: false, pendingCount: 0, modernMode: false };
    }

    return Promise.resolve();

  }

  private setCSSVariables(theming: any) {

    // request all key defined in theming
    const themingKeys = Object.keys(theming);


    if (!this._styles) {
      const styleElement = document.createElement('div');
      this._styles = styleElement.style;
    }

    // if we have the key
    if (themingKeys !== null) {

      // loop over it
      themingKeys.forEach(key => {
        // add CSS variable to style property of the web part
        this._styles.setProperty(`--${key}`, theming[key])

      });

      if (this._styles) {
        Object.assign(this._styles)
      }

    }

  }

  private async _checkConnection() {

    // LogDebug('Try to fetch live reload connection');

    // Try SPFx v1.21+ URL first, then fall back to legacy URL for older versions
    try {
      const liveReloadConnection = await fetch(LIVE_RELOAD_CONNECTION_V121) as Response;
      if (liveReloadConnection.ok) {
        return liveReloadConnection;
      }
    } catch {
      LogDebug('SPFx v1.21+ connection not available, trying legacy URL...');
    }

    // Fall back to legacy URL (SPFx < v1.21)
    try {
      const liveReloadConnection = await fetch(LIVE_RELOAD_CONNECTION_LEGACY) as Response;
      return liveReloadConnection;
    } catch {
      LogDebug('Connection not available');
      return null;
    }

  }

  private _renderStatusBar() {

    if (!this._placeholder) {

      // Use placement from localStorage (via lrs.placement), default is 'bottom'
      const placeholderName = lrs.placement === 'top' ? PlaceholderName.Top : PlaceholderName.Bottom;

      this._placeholder = this.context.placeholderProvider.tryCreateContent(
        placeholderName,
        { onDispose: this._onDispose }
      );

      // The extension should not assume that the expected placeholder is available.
      if (!this._placeholder) {

        LogDebug(`The expected placeholder (${lrs.placement}) was not found.`);

        return;

      }

      if (this._placeholder.domElement) {

        this._placeholder.domElement.setAttribute('style', this._styles.cssText);
        this._placeholder.domElement.classList.add(styles.pnpLiveReloader);

        this._liveReloaderBar = new LiveReloadBar(this._placeholder.domElement, this.context.manifest);

        this._liveReloaderBar.syncUI();

        this._placeholder.domElement.classList.add(styles.pnpLiveReloader);

      }
    }
  }

  private initThemes() {
    // Consume the new ThemeProvider service
    this._themeProvider = this.context.serviceScope.consume(ThemeProvider.serviceKey);

    // If it exists, get the theme variant
    this._themeVariant = this._themeProvider.tryGetTheme();

    // If there is a theme variant
    if (this._themeVariant) {

      // we set transfer semanticColors into CSS variables
      this.setCSSVariables(this._themeVariant.semanticColors);

      this.setCSSVariables(this._themeVariant.palette);

    }
  }

  public async onInit(): Promise<void> {

    // Init Themes
    this.initThemes();

    // Init Live Reloader State
    LogDebug("Current State :::", lrs.state);

    try {

      await this.checkLiveReloadStatus();
      this.context.placeholderProvider.changedEvent.add(this, this._renderStatusBar);

    } catch (e) {

      LogError('Debug Log', e);
      throw new Error(e instanceof Error ? e.message : String(e));

    }

    this._themeProvider.themeChangedEvent.add(this,  this.onThemeChanged);

    return Promise.resolve();

  }

  private onThemeChanged(args: ThemeChangedEventArgs): void {

    if (!args) {
      return;
    }

    if (args.theme) {

      this.setCSSVariables(args.theme.semanticColors);
      this.setCSSVariables(args.theme.palette);

      if(this._placeholder){
        this._placeholder.domElement.setAttribute('style', this._styles.cssText);
      }


    }

  }

  private _onDispose(): void {
    console.log('[HelloWorldApplicationCustomizer._onDispose] Disposed custom top and bottom placeholders.');
  }

}
