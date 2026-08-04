import { createTheme, alpha } from '@mui/material/styles';

const darkPalette = {
  mode: 'dark',
  primary: {
    main: '#00BFA6',
    light: '#5DF2D6',
    dark: '#008E76',
    contrastText: '#0A1929',
  },
  secondary: {
    main: '#7C4DFF',
    light: '#B47CFF',
    dark: '#3F1DCB',
    contrastText: '#FFFFFF',
  },
  error: {
    main: '#FF5252',
    light: '#FF867F',
    dark: '#C50E29',
  },
  warning: {
    main: '#FFB74D',
    light: '#FFE97D',
    dark: '#C88719',
  },
  success: {
    main: '#66BB6A',
    light: '#98EE99',
    dark: '#338A3E',
  },
  info: {
    main: '#29B6F6',
    light: '#73E8FF',
    dark: '#0086C3',
  },
  background: {
    default: '#0A1929',
    paper: '#0D2137',
  },
  text: {
    primary: '#E3E8EF',
    secondary: '#94A3B8',
    disabled: '#546E7A',
  },
  divider: alpha('#94A3B8', 0.12),
};

const lightPalette = {
  mode: 'light',
  primary: {
    main: '#00897B',
    light: '#4DB6AC',
    dark: '#00695C',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#651FFF',
    light: '#A255FF',
    dark: '#4615B2',
    contrastText: '#FFFFFF',
  },
  error: {
    main: '#E53935',
    light: '#EF5350',
    dark: '#C62828',
  },
  warning: {
    main: '#FB8C00',
    light: '#FFA726',
    dark: '#EF6C00',
  },
  success: {
    main: '#43A047',
    light: '#66BB6A',
    dark: '#2E7D32',
  },
  info: {
    main: '#039BE5',
    light: '#29B6F6',
    dark: '#0277BD',
  },
  background: {
    default: '#F0F4F8',
    paper: '#FFFFFF',
  },
  text: {
    primary: '#1A2027',
    secondary: '#546E7A',
    disabled: '#90A4AE',
  },
  divider: alpha('#1A2027', 0.08),
};

export const getTheme = (mode = 'dark') => {
  const palette = mode === 'dark' ? darkPalette : lightPalette;
  const isDark = mode === 'dark';

  return createTheme({
    palette,
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
      h1: {
        fontSize: '2.25rem',
        fontWeight: 700,
        letterSpacing: '-0.02em',
        lineHeight: 1.2,
      },
      h2: {
        fontSize: '1.875rem',
        fontWeight: 700,
        letterSpacing: '-0.01em',
        lineHeight: 1.3,
      },
      h3: {
        fontSize: '1.5rem',
        fontWeight: 600,
        letterSpacing: '-0.01em',
        lineHeight: 1.3,
      },
      h4: {
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: '1.1rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 600,
        lineHeight: 1.5,
      },
      subtitle1: {
        fontSize: '0.95rem',
        fontWeight: 500,
        lineHeight: 1.5,
      },
      subtitle2: {
        fontSize: '0.85rem',
        fontWeight: 500,
        lineHeight: 1.5,
      },
      body1: {
        fontSize: '0.938rem',
        lineHeight: 1.6,
      },
      body2: {
        fontSize: '0.85rem',
        lineHeight: 1.6,
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
        fontSize: '0.875rem',
        letterSpacing: '0.02em',
      },
      caption: {
        fontSize: '0.75rem',
        lineHeight: 1.5,
        color: palette.text.secondary,
      },
      overline: {
        fontSize: '0.7rem',
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      },
    },
    shape: {
      borderRadius: 12,
    },
    shadows: [
      'none',
      isDark
        ? '0px 1px 3px rgba(0,0,0,0.4), 0px 1px 2px rgba(0,0,0,0.3)'
        : '0px 1px 3px rgba(0,0,0,0.08), 0px 1px 2px rgba(0,0,0,0.06)',
      isDark
        ? '0px 3px 6px rgba(0,0,0,0.4), 0px 2px 4px rgba(0,0,0,0.3)'
        : '0px 3px 6px rgba(0,0,0,0.07), 0px 2px 4px rgba(0,0,0,0.05)',
      isDark
        ? '0px 6px 12px rgba(0,0,0,0.4)'
        : '0px 6px 12px rgba(0,0,0,0.08)',
      isDark
        ? '0px 10px 20px rgba(0,0,0,0.5)'
        : '0px 10px 20px rgba(0,0,0,0.1)',
      ...Array(20).fill(isDark
        ? '0px 12px 28px rgba(0,0,0,0.5)'
        : '0px 12px 28px rgba(0,0,0,0.12)'),
    ],
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarWidth: 'thin',
            scrollbarColor: isDark
              ? '#1E3A5F #0A1929'
              : '#B0BEC5 #F0F4F8',
            '&::-webkit-scrollbar': {
              width: 8,
              height: 8,
            },
            '&::-webkit-scrollbar-track': {
              background: isDark ? '#0A1929' : '#F0F4F8',
            },
            '&::-webkit-scrollbar-thumb': {
              background: isDark ? '#1E3A5F' : '#B0BEC5',
              borderRadius: 4,
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: isDark ? '#2A5080' : '#90A4AE',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: '8px 20px',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: isDark
                ? '0 4px 12px rgba(0, 191, 166, 0.3)'
                : '0 4px 12px rgba(0, 137, 123, 0.25)',
            },
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: isDark
                ? '0 4px 12px rgba(0, 191, 166, 0.3)'
                : '0 4px 12px rgba(0, 137, 123, 0.25)',
            },
          },
          outlined: {
            borderWidth: '1.5px',
            '&:hover': {
              borderWidth: '1.5px',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: isDark
              ? alpha('#132F4C', 0.7)
              : '#FFFFFF',
            backdropFilter: isDark ? 'blur(20px)' : 'none',
            border: `1px solid ${isDark ? alpha('#5DF2D6', 0.08) : alpha('#000', 0.06)}`,
            borderRadius: 16,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              border: `1px solid ${isDark ? alpha('#5DF2D6', 0.15) : alpha('#00897B', 0.15)}`,
              boxShadow: isDark
                ? '0 8px 32px rgba(0, 191, 166, 0.1)'
                : '0 8px 32px rgba(0, 0, 0, 0.08)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            fontSize: '0.75rem',
            borderRadius: 8,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 10,
              transition: 'all 0.2s ease',
              '& fieldset': {
                borderColor: isDark ? alpha('#94A3B8', 0.2) : alpha('#000', 0.15),
                transition: 'all 0.2s ease',
              },
              '&:hover fieldset': {
                borderColor: isDark ? alpha('#00BFA6', 0.4) : alpha('#00897B', 0.4),
              },
              '&.Mui-focused fieldset': {
                borderColor: isDark ? '#00BFA6' : '#00897B',
                borderWidth: 2,
              },
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
            backgroundColor: isDark ? '#0D2137' : '#FFFFFF',
            border: `1px solid ${isDark ? alpha('#5DF2D6', 0.1) : alpha('#000', 0.08)}`,
            backgroundImage: 'none',
          },
        },
      },
      MuiDataGrid: {
        styleOverrides: {
          root: {
            border: 'none',
            borderRadius: 12,
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: isDark ? alpha('#132F4C', 0.8) : '#F5F5F5',
              borderBottom: `1px solid ${isDark ? alpha('#5DF2D6', 0.1) : alpha('#000', 0.08)}`,
            },
            '& .MuiDataGrid-cell': {
              borderBottom: `1px solid ${isDark ? alpha('#5DF2D6', 0.05) : alpha('#000', 0.05)}`,
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: isDark ? alpha('#00BFA6', 0.04) : alpha('#00897B', 0.04),
            },
            '& .MuiDataGrid-row:nth-of-type(even)': {
              backgroundColor: isDark ? alpha('#132F4C', 0.3) : alpha('#F0F4F8', 0.5),
            },
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? '#071322' : '#FFFFFF',
            borderRight: `1px solid ${isDark ? alpha('#5DF2D6', 0.08) : alpha('#000', 0.06)}`,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            margin: '2px 8px',
            padding: '8px 12px',
            transition: 'all 0.2s ease',
            '&.Mui-selected': {
              backgroundColor: isDark ? alpha('#00BFA6', 0.12) : alpha('#00897B', 0.1),
              color: isDark ? '#5DF2D6' : '#00897B',
              '&:hover': {
                backgroundColor: isDark ? alpha('#00BFA6', 0.18) : alpha('#00897B', 0.15),
              },
              '& .MuiListItemIcon-root': {
                color: isDark ? '#5DF2D6' : '#00897B',
              },
            },
            '&:hover': {
              backgroundColor: isDark ? alpha('#00BFA6', 0.06) : alpha('#00897B', 0.05),
            },
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: 8,
            fontSize: '0.75rem',
            fontWeight: 500,
            backgroundColor: isDark ? '#1E3A5F' : '#37474F',
            padding: '6px 12px',
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            fontSize: '0.875rem',
            fontWeight: 600,
          },
        },
      },
    },
  });
};

export default getTheme;
