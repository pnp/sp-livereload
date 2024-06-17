
export default class Logo{
        
    public static get UI(): string{
        
        const content = document.createElement('<div>');
        content.classList.add('pnp-lr-logo');
        content.innerText = `PnP Live Reloader`;
        
        return 'string';

    }

}