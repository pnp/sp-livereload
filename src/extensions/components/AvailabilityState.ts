import { ILiveReloaderState } from "../common/ILiveReloaderState";

export class AvailabilityState {

  _state: ILiveReloaderState;
  _container: HTMLDivElement;
  _indicator: HTMLElement;
  _label: HTMLLabelElement;

  constructor(state: ILiveReloaderState, parentDom: HTMLElement) {

    this._state = state;
    this.createIndicator(parentDom);

  }

  createIndicator(parentDom: HTMLElement) {

    const domParser = new DOMParser();

    const doc = domParser.parseFromString(`
            <div class='status'>
                <div class='status-indicator'>
                </div>
                <label class="status-label"></label>
            </div>
            `, "text/html")

    this._container = doc.body.firstChild as HTMLDivElement;
    this._indicator = doc.querySelector('.status-indicator') as HTMLElement;
    this._label = doc.querySelector('.status-label') as HTMLLabelElement;
    this._label.textContent = this._state.available ? 'Available' : 'Not Available'

    if (this._state) {

      if (this._state.available) { this._indicator.classList.add('ready') } else { this._indicator.classList.remove('ready') }

    }

    parentDom.append(this._container);

  }


  public get available(): boolean {
    return this._state.available;
  }

  public set available(v: boolean) {
    this._state.available = v;
  }

  setState(state: ILiveReloaderState) {
    this._state = state;
  }

}