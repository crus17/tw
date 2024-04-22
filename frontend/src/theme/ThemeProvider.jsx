// ThemeProvider.js
import { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types'
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { darkTheme, lightTheme } from './Theme';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};

export const ThemeProvider = ({ children }) => {

  const storedUser = localStorage.getItem('user');
  let parsedUser;
  if (storedUser) {
    try {
      parsedUser = JSON.parse(storedUser);
    } catch (error) {
      localStorage.clear('user')
    }
  }
  const [isDarkMode, setDarkMode] = useState(parsedUser?.preferences.darkMode)
  const toggleDarkMode = ()=> setDarkMode(prev => !prev)
  

  const themeValues = {
    theme: isDarkMode ? darkTheme : lightTheme,
    isDarkMode,
    toggleDarkMode,
  };


  return (
    <ThemeContext.Provider value={themeValues}>
      <StyledThemeProvider theme={themeValues.theme}>
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
    children: PropTypes.object
}