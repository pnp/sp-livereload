import ThemeColors from "../common/ThemeColors";
import { Dialog } from "./Dialog";

const filterFonts = ['Segoe UI', 'Leelawadee', 'Fluent', 'Fabric', 'Shell'];


export class Branding {

  private _dialog: Dialog;
  private _dialogContent: HTMLElement;
  private _themeInfo: HTMLElement;

  private _registeredCustomFonts: Array<FontFace> = [];

  constructor() {

    this._dialog = new Dialog('Branding Information', 'pnp-lr-brandinfo');
    this._dialog.classList.add('pnp-lr-brandinfo');

    const content: HTMLElement | null = this._dialog.querySelector('.dlg-content');

    if (!content) {
      console.error(`Dialog Content couldn't found`)
      return;
    }

    this._dialogContent = content;


    // this._dialog.append(this._dialogContent);

    this.getThemeColors();

    // this.allResources();

    // eslint-disable-next-line no-void
    void this.getRegisteredFonts();

  }

  // private allResources() {

  //   const entries = window.performance.getEntriesByType('resource');
  //   entries.filter(item => {

  //     if (item.name.toLowerCase().indexOf('gotham') !== -1) {
  //       console.debug(item.name);
  //     }
  //   })
  //   console.debug('RESOURCES ::::: ', entries);

  // }

  private async getRegisteredFonts(): Promise<void> {

    const fonts = await document.fonts as FontFaceSet;

    await this.getFonts(fonts);

    if (this._registeredCustomFonts.length !== 0) {

      const fontContent = document.createElement('section');
      fontContent.classList.add('pnp-lr-fonts');
      fontContent.innerHTML = '<h3>Fonts registed on the page</h3>';

      const fontMenu = document.createElement('ul');
      fontMenu.classList.add('pnp-lr-fontmenu');

      for (let i = 0; i < this._registeredCustomFonts.length; i++) {

        const curFont = this._registeredCustomFonts[i];

        const fontMenuItem = document.createElement('li');
        fontMenuItem.textContent = curFont.family;
        fontMenuItem.style.fontFamily = curFont.family;

        fontMenu.append(fontMenuItem);

        // const compStyles = window.getComputedStyle(fontMenuItem);

      }

      fontContent.append(fontMenu)

      this._dialogContent.append(fontContent);

    }



  }

  async getFonts(fonts: FontFaceSet) {

    const promises: FontFace[] = [];

    fonts.forEach(font => promises.push(font));

    const data = await Promise.all(promises);

    for (let i = 0; i < data.length; i++) {

      if (!filterFonts.some(fontName => data[i].family.includes(fontName))) {
        this._registeredCustomFonts.push(data[i]);
      }
    }

  }

  private getThemeColors() {

    this._themeInfo = document.createElement('section');
    this._themeInfo.innerHTML = '<h3>Theme Colors</h3>';

    const themeColors = ThemeColors.theme;
    const themeColorKeys: string[] = Object.keys(themeColors);

    const themeColorMenu = document.createElement('menu');
    themeColorMenu.classList.add('theme-colors');
    const colorIds: string[] = [];

    themeColorKeys.forEach(item => {

      const itemId = themeColors[item].name.replace(/ /g, '');
      colorIds.push(itemId);

      const menuItem = document.createElement('li');
      const menuItemButton = document.createElement('button');
      menuItem.append(menuItemButton);
      menuItemButton.id = itemId;
      menuItemButton.classList.add('color-swatch');
      menuItemButton.style.background = themeColors[item].value;
      menuItemButton.innerHTML = `<span class='visually-hidden'>${themeColors[item].name}</span>`;
      menuItemButton.ariaLabel = `${themeColors[item].name} - Click for more details`;
      menuItemButton.addEventListener('click', this.showColorInformation);

      themeColorMenu.append(menuItem);

    })

    const themeColorOutput = document.createElement('output');
    themeColorOutput.classList.add('color-swatch-output');
    themeColorOutput.id = 'theme-color-desc';
    themeColorOutput.textContent = "Pick color to show informaiton";
    themeColorOutput.setAttribute('for', colorIds.join(' '))

    themeColorMenu.append(themeColorOutput);

    const neutralsColors = ThemeColors.neutrals;
    const neutralsKeys: string[] = Object.keys(neutralsColors);

    const neutralsColorMenu = document.createElement('menu');
    neutralsColorMenu.classList.add('theme-colors');

    const neutralsIds: string[] = [];

    neutralsKeys.forEach(item => {

      const itemId = neutralsColors[item].name.replace(/ /g, '');
      neutralsIds.push(itemId);

      const menuItem = document.createElement('li');
      const menuItemButton = document.createElement('button');
      menuItem.append(menuItemButton);

      menuItemButton.classList.add('color-swatch');
      menuItemButton.id = itemId;
      menuItemButton.style.background = neutralsColors[item].value;
      menuItemButton.innerHTML = `<span class='visually-hidden'>${neutralsColors[item].name}</span>`;
      menuItemButton.ariaLabel = `${neutralsColors[item].name} - Click for more details`
      menuItemButton.addEventListener('click', this.showColorInformation);

      neutralsColorMenu.append(menuItem);

    })

    const neutralsColorOutput = document.createElement('output');
    neutralsColorOutput.classList.add('color-swatch-output');
    neutralsColorOutput.id = 'neutral-color-desc';
    neutralsColorOutput.textContent = "Pick color to show informaiton";
    neutralsColorOutput.setAttribute('for', neutralsIds.join(' '));

    neutralsColorMenu.append(neutralsColorOutput);

    const inBetweenHeadling = document.createElement('h3');
    inBetweenHeadling.textContent = "Neutral Colors";

    this._themeInfo.append(themeColorMenu);
    this._themeInfo.append(inBetweenHeadling);
    this._themeInfo.append(neutralsColorMenu);

    this._dialogContent.append(this._themeInfo);

  }

  private showColorInformation = (event: Event) => {

    if (event.target) {

      const curentTarget = event.target as HTMLElement;

      const outputElement = this._dialogContent.querySelector(`[for*='${curentTarget.id}']`) as HTMLElement;

      if (outputElement) {

        if (curentTarget.textContent) {

          const compStyle = window.getComputedStyle(curentTarget);

          outputElement.innerHTML = `<span class='visually-hidden'>Current selected Color:</span>${curentTarget.textContent} / ${compStyle.getPropertyValue('background-color')} / ${curentTarget.style.background}`;

        }

      }

    }

  }

  public get Info(): HTMLDialogElement {
    return this._dialog;
  }

}