/**
 * Utility to handle dynamic project colors throughout the application
 */

// Almacena el último color para poder recuperarlo
let lastUsedColor = '#0284c7';

/**
 * Convert hex color to HSL components and set CSS variables
 * @param hexColor - Hex color string (e.g., "#ff0000")
 */
export const setProjectColor = (hexColor: string = '#0284c7'): void => {
  // Default to a nice blue if no color provided
  const color = hexColor || lastUsedColor || '#0284c7';
  lastUsedColor = color; // Guarda el último color usado
  
  // Convert hex to RGB
  const r = parseInt(color.slice(1, 3), 16) / 255;
  const g = parseInt(color.slice(3, 5), 16) / 255;
  const b = parseInt(color.slice(5, 7), 16) / 255;
  
  // Find min and max RGB values
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  
  // Calculate lightness
  let l = (max + min) / 2;
  
  // Calculate saturation
  let s = 0;
  if (max !== min) {
    s = l > 0.5 
      ? (max - min) / (2 - max - min) 
      : (max - min) / (max + min);
  }
  
  // Calculate hue
  let h = 0;
  if (max !== min) {
    if (max === r) {
      h = ((g - b) / (max - min)) % 6;
    } else if (max === g) {
      h = (b - r) / (max - min) + 2;
    } else {
      h = (r - g) / (max - min) + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  
  // Adjust saturation and lightness for better contrast
  // Make very dark colors lighter and very light colors darker
  if (l < 0.2) {
    l = 0.2 + (l * 0.5);
  } else if (l > 0.8) {
    l = 0.8 - ((1 - l) * 0.5);
  }
  
  // Make very low saturation colors more saturated
  if (s < 0.2) {
    s = 0.2 + (s * 2);
  }
  
  // Round values for CSS
  const hRounded = Math.round(h);
  const sRounded = Math.round(s * 100);
  const lRounded = Math.round(l * 100);
  
  // Set CSS variables
  document.documentElement.style.setProperty('--color-project-hue', hRounded.toString());
  document.documentElement.style.setProperty('--color-project-saturation', `${sRounded}%`);
  document.documentElement.style.setProperty('--color-project-lightness', `${lRounded}%`);
  
  console.log(`Set project color HSL: ${hRounded}, ${sRounded}%, ${lRounded}%`);
  
  // Create and set color scale (we're not setting these as CSS vars for performance)
  const colorScale = generateColorScale(hRounded, sRounded, lRounded);
  
  // Set each shade as a CSS variable
  Object.entries(colorScale).forEach(([shade, hslValues]) => {
    document.documentElement.style.setProperty(`--color-project-${shade}`, hslValues);
  });
}

/**
 * Generate a full color scale from a base HSL value
 */
function generateColorScale(h: number, s: number, l: number) {
  return {
    '50': `${h}, ${s}%, 97%`,
    '100': `${h}, ${s}%, 94%`,
    '200': `${h}, ${s}%, 86%`,
    '300': `${h}, ${s}%, 74%`,
    '400': `${h}, ${s}%, 60%`,
    '500': `${h}, ${s}%, 48%`,
    '600': `${h}, ${s}%, 39%`,
    '700': `${h}, ${s}%, 32%`,
    '800': `${h}, ${s}%, 27%`,
    '900': `${h}, ${s}%, 22%`,
    '950': `${h}, ${s}%, 16%`,
  };
}

/**
 * Reset project color to default primary blue
 * Ahora permite personalizar el color de reset
 */
export const resetProjectColor = (defaultColor: string = '#0284c7'): void => {
  setProjectColor(defaultColor);
}

// Función para almacenar un color por defecto para secciones específicas
export const setDefaultColorForSection = (section: string, color: string): void => {
  window.localStorage.setItem(`default-${section}-color`, color);
}

export default {
  setProjectColor,
  resetProjectColor,
  setDefaultColorForSection
};
