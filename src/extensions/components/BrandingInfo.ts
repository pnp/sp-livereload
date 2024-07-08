const filterFonts = ['Segoe UI', 'Leelawadee', 'Fluent', 'Fabric', 'Shell'];


export class BrandingInfo {

    _registeredCustomFonts: Array<FontFace> = [];

    constructor(appendTo: HTMLElement) {

        this.getRegisteredFonts();

    }

    async getRegisteredFonts(): Promise<void> {

        const fonts = await document.fonts as FontFaceSet;

        console.debug(fonts);

        await this.getFonts(fonts);
        
        console.debug('Registerd Font:::: ', this._registeredCustomFonts)

    }

    async getFonts(fonts: FontFaceSet) {

        let promises : FontFace[] = [];

        fonts.forEach(font => promises.push(font));
          
        const data = await Promise.all(promises);

        for(let i = 0; i< data.length; i++){

            if (!filterFonts.some(fontName => data[i].family.includes(fontName))) {
                this._registeredCustomFonts.push(data[i]);
            }
        }

    }

}