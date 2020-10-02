import colors from 'vuetify/lib/util/colors'

export const theme = {
  dark: false,
  themes: {
    light: {
      primary: colors.indigo.lighten1, // Default: '#1976D2' blue darken-2
      secondary: '#424242', // Default: '#424242' grey darken-3
      accent: '#82B1FF', // Default: '#82B1FF' blue accent-1
      error: colors.red.accent3, // Default: '#FF5252' red accent-2
      info: colors.teal, // Default: '#2196F3' blue
      success: '#4CAF50', // Default: '#4CAF50' green
      warning: '#FB8C00', // Default: '#FB8C00' orange darken-1
      theme1: colors.lime.lighten4,
      theme1r: colors.lime.darken4,
      theme2: colors.lightGreen.lighten4,
      theme2r: colors.lightGreen.darken4,
      menu: colors.lightGreen.darken2,
      'menu-item': colors.lightGreen.darken4,
      h2: colors.lightGreen.darken3,
      h3: colors.lime.darken4,
      title: colors.lightGreen.darken3,
      deleted: colors.blueGrey.lighten4
    },
    dark: {
      primary: colors.indigo.lighten4, // Default: '#2196F3' blue
      secondary: colors.grey.lighten2, // Default: '#424242' grey darken-3
      accent: '#FF4081', // Default: '#FF4081' pink accent-2
      error: colors.red.accent1, // Default: '#FF5252' red accent-2
      info: colors.teal.lighten3, // Default: '#2196F3' blue
      success: '#4CAF50', // Default: '#4CAF50' green
      warning: '#FB8C00', // Default: '#FB8C00' orange darken-1
      theme1: colors.lime.darken4,
      theme1r: colors.lime.lighten4,
      theme2: colors.lightGreen.darken4,
      theme2r: colors.lightGreen.lighten4,
      menu: colors.lightGreen.lighten2,
      'menu-item': colors.lightGreen.lighten4,
      h2: colors.lightGreen.lighten3,
      h3: colors.lime.lighten4,
      title: colors.lightGreen.lighten3,
      deleted: colors.blueGrey.darken3
    }
  }
}
