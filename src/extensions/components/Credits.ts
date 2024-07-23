/* eslint-disable */
const pkg = require('../../../package.json');
const yo = require('../../../.yo-rc.json');
/* eslint-enable */

import { IClientSideComponentManifest } from "@microsoft/sp-module-interfaces";
import { Icons } from "../common/IconService";
import { Dialog } from "./Dialog";
import { HooIconButton } from "./HooIconButton";

const thirdPartyLibs = [{
    "name": "hTWOo Core",
    "url": "https://lab.n8d.studio/htwoo/"
}, {
    "name": "hTWOo Icons",
    "url": "https://lab.n8d.studio/htwoo/htwoo-core/patterns/design-tokens-icon-overview/design-tokens-icon-overview.rendered.html"
}
]

export class Credits {

    private _dialog: Dialog;
    private _dialogContent: HTMLElement;

    private _manifest: IClientSideComponentManifest;

    constructor(manifest: IClientSideComponentManifest) {

        this._manifest = manifest;

        this._dialog = new Dialog('Credits', 'pnp-lr-credits');
        this._dialog.classList.add('pnp-lr-credits');

        this._dialogContent = document.createElement('div');

        this._dialogContent.append(this.generateMaintainer());
        this._dialogContent.append(this.generateProjectCore());

        if (this._dialogContent.hasChildNodes()) {

            this._dialog.appendContent(this._dialogContent.childNodes);
        }

    }

    private generateMaintainer() {

        const maintainer = document.createElement('section');
        maintainer.classList.add('pnp-lr-maintainer');

        const header = document.createElement('h3');
        header.textContent = "Maintainer";

        maintainer.append(header);

        const maintainerMenu = document.createElement('menu');
        maintainerMenu.classList.add("pnp-lr-authors");

        const maintainers = pkg.maintainers;

        for (const index in maintainers) {

            const curMaintainer = pkg.maintainers[index];

            const menuItem = document.createElement('li');
            menuItem.classList.add('pnp-lr-author');

            menuItem.innerHTML = `<a href='${curMaintainer.url}' class="pnp-lr-link">${curMaintainer.name}</a>`
            const iconGithub = new HooIconButton('icon-github', { ariaLabel: `Visit ${curMaintainer.name}` }, menuItem)
            console.debug(iconGithub);
            maintainerMenu.append(menuItem);

        }

        maintainer.append(maintainerMenu);

        return maintainer;

    }

    private generateProjectCore() {


        const coreProjectInfo = document.createElement('section');
        coreProjectInfo.classList.add('pnp-lr-projectinfo');

        const header = document.createElement('h3');
        header.textContent = "Project Informatio";

        const logo = Icons.getSVG('logo', 'pnp liver reloader', 'pnp-logo-grap');

        if (logo) {
            logo.classList.add('pnp-logo-graph');
            coreProjectInfo.append(logo);
        }

        const menu = document.createElement('menu');
        menu.classList.add('menu-credit')

        const menuItemVersion = document.createElement('li');
        menuItemVersion.classList.add('menu-credit-item');
        menuItemVersion.innerHTML = `<h3>PnP Live Reloader</h3><strong>Version:</strong> ${this._manifest.version}`;

        menu.append(menuItemVersion);

        const menuItemSPFxVersion = document.createElement('li');
        menuItemSPFxVersion.classList.add('menu-credit-item');
        menuItemSPFxVersion.innerHTML = `<strong>SPFx Version:</strong> ${yo['@microsoft/generator-sharepoint'].version}`;

        menu.append(menuItemSPFxVersion);

        const menuItemRepo = document.createElement('li');
        menuItemRepo.classList.add('menu-credit-item');
        menuItemRepo.innerHTML = `<strong>Repository:</strong><br><a href='${pkg.homepage}' target="_black">${pkg.homepage}</a>`;

        menu.append(menuItemRepo);

        const menuItemIssues = document.createElement('li');
        menuItemIssues.classList.add('menu-credit-item');

        const bugIcon = Icons.getSVG('icon-bug-filled', 'Report Icon');
        const bugView = Icons.getSVG('icon-text-bullet-list-square-search-filled', 'View Issues');

        menuItemIssues.innerHTML = `<strong>Issues:</strong><br>
            <menu class='menu-credit'>
                <li class='menu-credit-item'>
                    <a href='${pkg.issues}' target='_blank'>${bugView ? bugView?.outerHTML : ""}<span>View issues</span></a>
                </li>
                <li class='menu-credit-item'>
                    <a href='${pkg.issues}/new' target='_blank'>${bugIcon ? bugIcon?.outerHTML : ""}<span>Create Issue</span></a>
                </li>
            </menu>`;
        menu.append(menuItemIssues);

        coreProjectInfo.append(menu);

        const thirdPartyElement = document.createElement('section');
        thirdPartyElement.innerHTML = "<h3>3rd Party Libraries used:</h3>";

        const thirdPartyLinks = document.createElement('div');

        thirdPartyLibs.forEach( (library, index) => {

            const link = document.createElement('a');
            link.href = library.url;
            link.textContent = library.name;
            link.target = '_blank';

            if(index < thirdPartyLibs.length - 1){

                thirdPartyLinks.append(link);
                thirdPartyLinks.append(', ');
            
            } else {
            
                thirdPartyLinks.append(link)
            
            }
            
        })

        thirdPartyElement.append(thirdPartyLinks);

        coreProjectInfo.append(thirdPartyElement);

        return coreProjectInfo;

    }


    public get credits(): HTMLDialogElement {
        return this._dialog;
    }

}