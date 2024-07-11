const domParser = new DOMParser();

export class QuickActions {

    _container: HTMLElement;

    constructor(parentElement: HTMLElement) {

        const partialDoc = domParser.parseFromString(`
            <div class="pnp-lr-actions">
            
            </div>`, 'text/html');

        this._container = partialDoc.body.firstChild as HTMLElement;

        parentElement.append(this._container);

    }


    public get Container() {
        return this._container
    }

    append(parentElement: HTMLElement) {

        parentElement.append(this._container);

    }


}