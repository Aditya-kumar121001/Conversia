import { Sketch } from '@uiw/react-color';

interface ColorPickerProps {
  color: string;
  onChange: (hex: string) => void;
}

export default function ColorPicker({ color, onChange }: ColorPickerProps) {
  const validTheme = color && typeof color === 'string' ? color : '#000000';
  
  return (
    <Sketch
      color={validTheme}
      width={300}
      onChange={(color) => {
        // Ensure we always get a valid hex color
        if (color && color.hex) {
          onChange(color.hex);
        }
      }}
    />
  );
}