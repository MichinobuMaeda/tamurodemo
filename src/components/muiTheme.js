/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import getMuiTheme from 'material-ui/styles/getMuiTheme'
import { teal600, teal800 } from 'material-ui/styles/colors';

const muiTheme = getMuiTheme({
//   fontFamily: 'Roboto, sans-serif',
  palette: {
    primary1Color: teal600 /* cyan500 */,
    primary2Color: teal800 /* cyan700 */,
//     primary3Color: grey400,
//     accent1Color: pinkA200,
//     accent2Color: grey100,
//     accent3Color: grey500,
//     textColor: darkBlack,
//     alternateTextColor: white,
//     canvasColor: white,
//     borderColor: grey300,
//     disabledColor: fade(darkBlack, 0.3),
    pickerHeaderColor: teal600 /* cyan500 */,
//     clockCircleColor: fade(darkBlack, 0.07),
//     shadowColor: fullBlack,
  },
//   appBar: {
//     height: 50,
//   },
})

export default muiTheme
