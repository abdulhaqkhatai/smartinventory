import React, { useState, useMemo } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { SnackbarProvider } from 'notistack';
import { getTheme } from './theme/theme';
import store from './store/store';
import { getRoutes } from './routes';
import DashboardLayout from './layouts/DashboardLayout';

const App = () => {
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('themeMode') || 'dark';
  });

  const theme = useMemo(() => getTheme(themeMode), [themeMode]);

  const toggleTheme = () => {
    setThemeMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('themeMode', next);
      return next;
    });
  };

  const router = useMemo(
    () => getRoutes(DashboardLayout, themeMode, toggleTheme),
    [themeMode]
  );

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          autoHideDuration={3000}
          dense
        >
          <RouterProvider router={router} />
        </SnackbarProvider>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
