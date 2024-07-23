import { HooIconButton } from "./HooIconButton";

const DLG_ATTR_STATE = 'open';

export class Dialog extends HTMLDialogElement {

    _header: HTMLElement;
    _content: HTMLElement;
    _closeButton: HooIconButton;

    _firstFocusableElement: HTMLElement;
    _lastFocusableElement: HTMLElement;

    constructor(title: string, id: string) {

        super();


        this.id = id;
        this.classList.add('dlg');
        this.addEventListener('keydown', this.keyboardHandler)

        this._closeButton = new HooIconButton('icon-dismiss-filled', {
            ariaLabel: 'Close Dialog',
        })

        this._closeButton.addEventListener('click', this.changeState);

        this.innerHTML = `<div class='dlg-inner'>
                    <header class='dlg-header'><h2>${title}</h2></header>
                    <div class="dlg-content"></div>
                        </div>`;

        this._content = this.querySelector('.dlg-content') as HTMLElement;
        this._header = this.querySelector('.dlg-header') as HTMLElement;
        this._header.append(this._closeButton.Button);

    }

    private changeState = (event: Event) => {

        if (this.hasAttribute(DLG_ATTR_STATE)) {

            this.close();

        } else {

            this.show();

        }

    }

    private keyboardHandler(event: KeyboardEvent) {

        if (event.keyCode === 9) {
            //Rotate Focus
            if (event.shiftKey && document.activeElement === this._firstFocusableElement) {
                event.preventDefault();
                this._lastFocusableElement.focus();
            } else if (!event.shiftKey && document.activeElement === this._lastFocusableElement) {
                event.preventDefault();
                this._firstFocusableElement.focus();
            }
        }
    
    };

    appendContent(content: NodeListOf<ChildNode>) {

        const childNodes = Array.from(content);
        childNodes.forEach(item => this._content.appendChild(item));

    }


    public get content(): HTMLDialogElement {
        return this;
    }

}

customElements.define('pnp-lrdialog', Dialog, { extends: 'dialog' });