import { Icons } from "../common/IconService";

const domParser = new DOMParser();

interface IHooIconButtonProps {
    ariaLabel?: string
}


export class HooIconButton {

    private _iconButton: HTMLButtonElement;

    constructor(iconName: string, props?: IHooIconButtonProps, parentElement?: HTMLElement) {

        const doc = domParser.parseFromString(`
            <button class="hoo-buttonicon">
            </button>
            `, 'text/html');

        this._iconButton = doc.querySelector('.hoo-buttonicon') as HTMLButtonElement;
        const currentIcon = Icons.getSVG(iconName);

        if (currentIcon) {
            if (props && props.ariaLabel) {
                this._iconButton.append(currentIcon);
            } else {
                this._iconButton.append(currentIcon);
            }
        }

        parentElement?.append(this._iconButton);

    }


    public get Button(): HTMLButtonElement {
        return this._iconButton
    }

    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLInputElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void {

        this._iconButton.addEventListener(type, listener, options);

    }

}