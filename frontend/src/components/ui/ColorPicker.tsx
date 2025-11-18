import { Sketch} from '@uiw/react-color';
import { useState } from 'react';

export default function ColorPicker() {
  const [hex, setHex] = useState("#fff");
  return (
    <Sketch
      color={hex}
      width={280} 
      onChange={(color) => {
        setHex(color.hex);
      }}
    />
  );
}