interface IThemeColors {
  theme: {
    [key: string]: {
      name: string;
      value: string;
    };
  };
  neutrals: {
    [key: string]: {
      name: string;
      value: string;
    };
  };
}

const themeColors: IThemeColors = {
    theme: {
        theme100: {
            name: 'Theme Lighter Alt',
            value: 'var(--themeLighterAlt)'
        },
        theme200: {
            name: 'Theme Lighter',
            value: 'var(--themeLighter)'
        },
        theme300: {
            name: 'Theme Light',
            value: 'var(--themeLight)'
        },
        theme400: {
            name: 'Theme Tertiary',
            value: 'var(--themeTertiary)'
        },
        theme500: {
            name: 'Theme Secondary',
            value: 'var(--themeSecondary)'
        },
        theme600: {
            name: 'Theme Primary',
            value: 'var(--themePrimary)'
        },
        theme700: {
            name: 'Theme Dark Alt',
            value: 'var(--themeDarkAlt)'
        },
        theme800: {
            name: 'Theme Dark',
            value: 'var(--themeDark)'
        },
        theme900: {
            name: 'Theme Darker',
            value: 'var(--themeDarker)'
        }
    },
    neutrals: {
        neutrals000: { name: 'White', value: 'var(--white)' },
        neutrals050: { name: 'Neutrals Lighter Alt', value: 'var(--neutralLighterAlt)' },
        neutrals100: { name: 'Neutral Light', value: 'var(--neutralLighter)' },
        neutrals200: { name: 'Neutral Light', value: 'var(--neutralLight)' },
        neutrals250: { name: 'Neutral Quaternary Alt', value: 'var(--neutralQuaternaryAlt)' },
        neutrals300: { name: 'Neutral Quaternary', value: 'var(--neutralQuaternary)' },
        neutrals350: { name: 'Neutral Tertiary Alt', value: 'var(--neutralTertiaryAlt)' },
        neutrals400: { name: 'Neutral Tertiary', value: 'var(--neutralTertiary)' },
        neutrals450: { name: 'Neutral Secondary Alt', value: 'var(--neutralSecondaryAlt)' },
        neutrals500: { name: 'Neutral Secondary', value: 'var(--neutralSecondary)' },
        neutrals600: { name: 'Neutral Primary Alt', value: 'var(--neutralPrimaryAlt)' },
        neutrals700: { name: 'Neutral Primary', value: 'var(--neutralPrimary)' },
        neutrals800: { name: 'Neutral Dark', value: 'var(--neutralDark)' },
        neutrals900: { name: 'Black', value: 'var(--black)' }
    }
}

const ThemeColors = themeColors;

export default ThemeColors;