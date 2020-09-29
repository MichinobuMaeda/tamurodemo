import colors from 'vuetify/lib/util/colors'

export const theme = {
  dark: false,
  themes: {
    light: {
      primary: '#1976D2', // Default: '#1976D2'
      secondary: '#424242', // Default: '#424242'
      accent: '#82B1FF', // Default: '#82B1FF'
      error: '#FF5252', // Default: '#FF5252'
      info: '#2196F3', // Default: '#2196F3'
      success: '#4CAF50', // Default: '#4CAF50'
      warning: '#FB8C00', // Default: '#FB8C00'
      theme1: colors.lime.lighten4,
      theme1r: colors.lime.darken4,
      theme2: colors.lightGreen.lighten4,
      theme2r: colors.lightGreen.darken4,
      menu: colors.lightGreen.darken2,
      'menu-item': colors.lightGreen.darken4,
      h2: colors.lightGreen.darken3,
      h3: colors.lime.darken4,
      title: colors.lightGreen.darken4,
      deleted: colors.grey.lighten2
    },
    dark: {
      primary: '#2196F3', // Default: '#2196F3'
      secondary: '#BDBDBD', // Default: '#424242'
      accent: '#FF4081', // Default: '#FF4081'
      error: '#FF5252', // Default: '#FF5252'
      info: '#2196F3', // Default: '#2196F3'
      success: '#4CAF50', // Default: '#4CAF50'
      warning: '#FB8C00', // Default: '#FB8C00'
      theme1: colors.lime.darken4,
      theme1r: colors.lime.lighten4,
      theme2: colors.lightGreen.darken4,
      theme2r: colors.lightGreen.lighten4,
      menu: colors.lightGreen.lighten2,
      'menu-item': colors.lightGreen.lighten4,
      h2: colors.lightGreen.lighten3,
      h3: colors.lime.lighten4,
      title: colors.lightGreen.lighten4,
      deleted: colors.grey.darken2
    }
  }
}
