import { ILiveReloaderState } from "../common/ILiveReloaderState";

export class AvailablityState {

    _state: ILiveReloaderState;
    _indicator: HTMLElement;

    constructor(state: ILiveReloaderState, parentDom: HTMLElement){

        this._state = state;
        this.createIndicator(parentDom);

    }

    createIndicator(parentDom: HTMLElement){

        let domParser = new DOMParser();
        
        let doc = domParser.parseFromString(`
            <div class='alert-indicator'>
            </div>
            `, "text/html")

        this._indicator = doc.querySelector('.alert-indicator') as HTMLElement;

        if(this._state){

            this._state.available ? this._indicator.classList.add('ready') : this._indicator.classList.remove('ready');

        }

        parentDom.append(this._indicator);

    }

    setState(state: ILiveReloaderState){
        this._state = state;
    }

}