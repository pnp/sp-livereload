import { LogDebug } from "../common/Logger";

export interface IHooToggle {
  labelActive: string,
  labelInactive: string,
}

export interface IToggleProps {
  tabIndex: number
}

export class HooToggle {

  _ID: string;
  _component: HTMLElement;
  _inputToggle: HTMLInputElement;
  _inputLabel: HTMLLabelElement;
  _inputStateActive: HTMLOutputElement;
  _inputStateInactive: HTMLOutputElement;

  constructor(labels: IHooToggle, appendTo: HTMLElement, props?: IToggleProps) {

    if (!appendTo) {
      throw new Error("I don't know where to append it to the DOM");
    }

    const domParser = new DOMParser();

    this._generateID();

    const domControls = domParser.parseFromString(`<div class="hoo-toggle">
            <input type="checkbox" class="hoo-toggle-cb" name="toggleName" id="toggle-44">
            <label for= "toggle-44" class="hoo-toggle-label"> 
                <output class= "hoo-toggle-slider"></output>
                <output class="hoo-toggle-checked">On</output><output class= "hoo-toggle-unchecked">Off</output>
            </label>
        </div>`, "text/html");

    const input: HTMLInputElement | null = domControls.querySelector('.hoo-toggle-cb');

    if(input && props?.tabIndex){
      input.tabIndex = props.tabIndex;
    }

    if (input) {
      this._inputToggle = input as HTMLInputElement;
      this._inputToggle.id = this._ID;
    }
    LogDebug(input);

    const toggleLabel = domControls.querySelector('.hoo-toggle-label');
    if (toggleLabel) {
      this._inputLabel = toggleLabel as HTMLLabelElement;
      this._inputLabel.setAttribute('for', this._ID);
    }
    LogDebug(toggleLabel);

    const lblInactive = domControls.querySelector('.hoo-toggle-unchecked');
    if (lblInactive) {
      this._inputStateInactive = lblInactive as HTMLOutputElement;
      this._inputStateInactive.textContent = labels.labelInactive;
    }
    LogDebug(lblInactive);

    const lblActive = domControls.querySelector('.hoo-toggle-checked');
    if (lblInactive) {
      this._inputStateActive = lblActive as HTMLOutputElement;
      this._inputStateActive.textContent = labels.labelActive;
    }
    LogDebug(lblActive);
    LogDebug(domControls);

    appendTo.append(domControls.body.firstChild as Node);

  }

  _generateID() {
    this._ID = 'hoo-toggle-' + Math.floor(Math.random() * 10000);
  }

  get enabled(): boolean {
    return !this._inputToggle.disabled;
  }

  set enabled(value: boolean) {
    this._inputToggle.disabled = !value;
  }

  get checked(): boolean {
    return this._inputToggle.checked;
  }

  set checked(value: boolean) {
    this._inputToggle.checked = value;
  }

  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLInputElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void {

    this._inputToggle.addEventListener(type, listener, options);

  }
}