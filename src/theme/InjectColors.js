// injectColors.js
import { colors } from './theme';

export const injectColorsIntoCSS = () => {
  const root = document.documentElement;

  Object.keys(colors).forEach((key) => {
    root.style.setProperty(`--${key}`, colors[key]);
  });
};
