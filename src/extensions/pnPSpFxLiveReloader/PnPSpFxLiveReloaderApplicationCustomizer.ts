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

const LIVE_RELOAD_CONNECTION = "//localhost:4321/temp/manifests.js";

/** A Custom Action which can be run during execution of a Client Side Application */
export default class PnPSPFxLiveReloaderApplicationCustomizer
  extends BaseApplicationCustomizer<IPnPSPFxLiveReloaderApplicationCustomizerProperties> {

  _themeProvider: ThemeProvider;
  _themeVariant: IReadonlyTheme | undefined;
  _styles: CSSStyleDeclaration;
  _bottomPlaceholder: PlaceholderContent | undefined;
  _liveReloaderBar: LiveReloadBar;

  private async checkLiveReloadStatus() {

    const connectionResponse = await this._checkConnection();
    // LogDebug('INIT LIVE RELOADER STATE\n\t', lrs, connectionResponse);

    if (connectionResponse && connectionResponse.status === 200) {
      lrs.state = { available: true, connected: lrs.connected, debugConnected: false };
    } else {
      lrs.state = { available: false, connected: false, debugConnected: false };
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

    try {

      const liveReloadConnection = await fetch(LIVE_RELOAD_CONNECTION) as Response;

      // LogDebug('---- 🚀 LIVE CONNECTION::::', liveReloadConnection, liveReloadConnection.status, liveReloadConnection.statusText);

      return liveReloadConnection;

    } catch {

      LogDebug(' Connection not available ');
      return null;
    }

  }

  private _renderStatusBar() {

    if (!this._bottomPlaceholder) {

      this._bottomPlaceholder = this.context.placeholderProvider.tryCreateContent(
        PlaceholderName.Bottom,
        { onDispose: this._onDispose }
      );

      // The extension should not assume that the expected placeholder is available.
      if (!this._bottomPlaceholder) {

        LogDebug("The expected placeholder (Bottom) was not found.");

        return;

      }

      if (this.properties) {
        let bottomString: string = this.properties.Bottom;
        if (!bottomString) {
          bottomString = "(Bottom property was not defined.)";
        }

        if (this._bottomPlaceholder.domElement) {

          this._bottomPlaceholder.domElement.setAttribute('style', this._styles.cssText);
          this._bottomPlaceholder.domElement.classList.add(styles.pnpLiveReloader);

          this._liveReloaderBar = new LiveReloadBar(this._bottomPlaceholder.domElement, this.context.manifest);

          this._liveReloaderBar.setState();

          this._bottomPlaceholder.domElement.classList.add(styles.pnpLiveReloader);

        }
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
      throw new Error(e.message);

    }

    this._themeProvider.themeChangedEvent.add(this,  this.onThemeChanged);

    return Promise.resolve();

  }

  private onThemeChanged(args: ThemeChangedEventArgs): void {


    console.debug(args);

    if (!args) {
      return;
    }

    if (args.theme) {

      this.setCSSVariables(args.theme.semanticColors);
      this.setCSSVariables(args.theme.palette);

      if(this._bottomPlaceholder){
        this._bottomPlaceholder.domElement.setAttribute('style', this._styles.cssText);
      }


    }

  }

  private _onDispose(): void {
    console.log('[HelloWorldApplicationCustomizer._onDispose] Disposed custom top and bottom placeholders.');
  }

}
