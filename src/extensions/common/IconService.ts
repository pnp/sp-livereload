// eslint-disable-next-line 
const ICON_FILE_PATH = require('../assets/icons.svg');
// const TEMPLATE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" class="hoo-icon-svg" viewBox="0 0 32 32" aria-hidden="true">
//                         <title>{{ title }}</title>
//                         <use href="../../images/icons.svg"></use>
//                         </svg>`
const TEMPLATE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" class="hoo-icon-svg" viewBox="0 0 32 32" aria-hidden="true">
                        <title>{{ title }}</title>
                        </svg>`;
// const assetFolder = '../assets/';

const domParser = new DOMParser();

interface Icon {
    name: string;
    path: string;
    // eslint-disable-next-line
    viewBox?: string | null;
    type?: string | undefined
}

class IconService {
    // eslint-disable-next-line
    svgIcons: Document;
    icons: Icon[] = [];
    // eslint-disable-next-line
    allIconNames: string[] = [];

    async _loadIcons() {

        try {

            const iconsRsponse = await fetch(ICON_FILE_PATH);

            if (iconsRsponse) {

                const iconsContent = await iconsRsponse.text();
                console.debug('loading icons');
                if (iconsContent) {

                    this.svgIcons = domParser.parseFromString(iconsContent, "image/svg+xml");

                    const allSymbols = this.svgIcons.querySelectorAll('symbol');

                    allSymbols.forEach(symbol => {

                        console.debug(symbol.id, symbol.getAttribute('viewBox'))

                        const icon: Icon = {
                            name: symbol.id,
                            path: symbol.innerHTML,
                            viewBox: symbol.getAttribute('viewBox'),
                            type: symbol.dataset.icontype
                        }


                        // console.debug(symbol.getRootNode(), assetFolder)
                        // const xrefs = symbol.firstElementChild?.getElementsByTagNameNS('http://www.w3.org/2000/svg', 'image');

                        // if (xrefs && xrefs.length !== 0) {

                        //     console.debug('XREF:::', xrefs, assetFolder);

                        //     for (let i = 0; i < xrefs.length; i++) {

                        //         let currenXRef = xrefs[i] as SVGImageElement;

                        //         debugger;                                
                        //         try {
                        //             console.debug('--- ENTER');
                        //             Object.assign({
                        //                 href: {
                        //                     animVal: '../assets/pnp-live-reloader-1.png',
                        //                     baseVal: '../assets/pnp-live-reloader-1.png'
                        //                 }
                        //             }, currenXRef);
                        //             console.debug('--- EXIT');
                        //         } catch (error) {

                        //             console.debug(error);

                        //         }
                        //         // currenXRef.href.animVal = require(assetFolder+'/'+currenXRef.href);
                        //         // Object.assign({
                        //         //     "href":{
                        //         //         "animVal": 
                        //         //     }
                        //         // })
                        //         console.debug('XLLLLLLLL---- ', currenXRef);

                        //     };

                        // }

                        // } catch (e) {
                        //     console.debug('Nothing found', e)
                        // }

                        this.icons.push(icon);
                        this.allIconNames.push(symbol.id);

                    });

                }

            }

        } catch {
            console.log('Some Error Happened');
        }

    }


    public getSVG(v: string, svgTitle?: string, classNames?: string) {

        if (this.allIconNames.indexOf(v) !== -1) {

            const icon = this.icons.filter(item => {

                return item.name === v;

            })

            if (icon.length === 1) {

                const curIcon = icon[0];

                const svgtemplate = domParser.parseFromString(TEMPLATE_SVG, "image/svg+xml");

                if (svgtemplate && svgtemplate.documentElement) {

                    const svgIcon = svgtemplate.documentElement;

                    const path = domParser.parseFromString(curIcon.path, "image/svg+xml");

                    if (path && path.documentElement) {

                        svgIcon.append(path.documentElement)

                    }
                    if(curIcon.viewBox){

                        svgIcon.setAttribute('viewBox', curIcon.viewBox)

                    }

                    if (svgTitle) {

                        const elemTitle = svgIcon.querySelector('title');

                        if (elemTitle) {
                            elemTitle.textContent = svgTitle;
                        }

                    } else {
                        const elemTitle = svgIcon.querySelector('title');
                        elemTitle?.remove();
                    }

                    if(classNames){
                        svgIcon.classList.add(classNames);
                    }

                    return svgIcon;

                }


            }

        } else {
            console.debug(`Icon ${v} not found`);
        }

    }


}

const _icons = new IconService();
await _icons._loadIcons();

export const Icons = _icons;