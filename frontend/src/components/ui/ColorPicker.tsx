import { Sketch } from '@uiw/react-color';

interface ColorPickerProps {
  theme: string;
  onChange: (hex: string) => void;
}

export default function ColorPicker({ theme, onChange }: ColorPickerProps) {
  return (
    <Sketch
      color={theme}
      width={280}
      onChange={color => {
        onChange(color.hex);
      }}
    />
  );
}