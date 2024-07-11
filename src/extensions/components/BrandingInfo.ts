const filterFonts = ['Segoe UI', 'Leelawadee', 'Fluent', 'Fabric', 'Shell'];


export class BrandingInfo {

  _registeredCustomFonts: Array<FontFace> = [];

  constructor(appendTo: HTMLElement) {

    // eslint-disable-next-line no-void
    void this.getRegisteredFonts();

  }

  async getRegisteredFonts(): Promise<void> {

    const fonts = await document.fonts as FontFaceSet;

    await this.getFonts(fonts);

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

}