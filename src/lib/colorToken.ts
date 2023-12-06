// base https://mui.com/material-ui/customization/color/
import { pink, blue, amber, grey } from '@mui/material/colors'

export const colorData = {
  // チャートカラー
  chart: {
    blue: {
      50: blue[50],
      200: blue[200],
    },
    pink: {
      200: pink[200],
    },
  },
  // 共通ユーティリティカラー
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  // Mui テーマカラー
  primary: {
    main: '#196DC8',
    dark: '#0D6DA1',
    light: '#4D8FD1',
    lighter: '#E7F2FD',
  },
  secondary: {
    main: '#696881',
    dark: '#424242',
    light: '#757575',
    lighter: '#FAFAFA',
  },
  error: {
    main: '#D32F2F',
    dark: '#C62828',
    light: '#E57373',
    lighter: '#FFEBEE',
  },
  success: {
    main: '#4CAF50',
    dark: '#388E3C',
    light: '#81C784',
    lighter: '#E8F5E9',
  },
  warning: {
    main: '#F57C00',
    dark: '#EF6C00',
    light: '#FFB74D',
    lighter: '#FFF3E0',
  },
  info: {
    main: '#10c8e0',
    dark: '#0d9cb7',
    light: '#4dd0e1',
    lighter: '#e0f7fa',
  },
  text: {
    primary: '#223354',
    secondary: '#4A515E',
    disabled: '#9e9e9e',
    white: '#ffffff', // option
  },
  divider: '#E0E0E0',
  background: {
    default: '#FFFFFF',
    paper: '#FFFFFF',
  },
  common: {
    black: '#000000',
    white: '#ffffff',
  },
  // ===== 独自のキーを追加 =====
  surface: {
    background: '#fafbfc',
    backgroundDark: '#616161',
    backgroundDisabled: '#e0e0e0',
  },
  icon: {
    white: '#ffffff',
    light: grey[600],
    dark: grey[700],
    action: amber[400],
    disabled: grey[500],
  },
}

/* ===== Examples =====
styled-componentsを使う場合
const StyledComponent = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
}));

useThemeフックを使う場合
function SomeComponent() {
  const theme = useTheme();
  return <Box sx={{ backgroundColor: theme.palette.primary.main }}>Hello</Box>;
}
*/

//  ===== CSS Variables =====
/** CSS化する場合の生成コード
let cssVars = ':root {\n';
for (const [key, value] of Object.entries(colorData)) {
  if (typeof value === 'string') {
    cssVars += `  --${key}: ${value};\n`;
  } else {
    for (const [subKey, subValue] of Object.entries(value)) {
      cssVars += `  --${key}-${subKey}: ${subValue};\n`;
    }
  }
}
cssVars += '}';

console.log(cssVars);
*/
