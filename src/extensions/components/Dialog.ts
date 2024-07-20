import { HooIconButton } from "./HooIconButton";

const DLG_ATTR_STATE = 'open';

export class Dialog extends HTMLDialogElement {

    _header: HTMLElement;
    _content: HTMLElement;
    _closeButton: HooIconButton;

    constructor(title: string, id: string) {

        super();

        this.id = id;
        this.classList.add('dlg');

        this._closeButton = new HooIconButton('icon-dismiss-filled', {
            ariaLabel: 'Close Dialog',
        })

        this._closeButton.addEventListener('click', this.changeState);
        
        this.innerHTML = `<div class='dlg-inner'>
                    <header class='dlg-header'><h2>${ title }</h2></header>
                    <div class="dlg-content"></div>
                        </div>`;

                        
        console.debug(this.outerHTML);
        
        this._content = this.querySelector('.dlg-content') as HTMLElement;
        this._header = this.querySelector('.dlg-header') as HTMLElement;
        this._header.append(this._closeButton.Button);

        console.debug(this._content);

    }

    private changeState = (event: Event) => {

        if(this.hasAttribute(DLG_ATTR_STATE)){

            this.close();

        } else {

            this.show();

        }

    }

    appendContent(content: NodeListOf<ChildNode>) {

        const childNodes = Array.from(content);
        childNodes.forEach(item => this._content.appendChild(item));

    }


    public get content(): HTMLDialogElement {
        return this;
    }

}

customElements.define('pnp-lrdialog', Dialog, { extends: 'dialog' });