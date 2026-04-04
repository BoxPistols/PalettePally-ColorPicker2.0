import { Box } from '@mui/material';
import React, { useEffect, useState, memo } from 'react';

import { SketchPicker } from 'react-color';

type ColorInputFieldProps = {
  color: string;
  onChange: (newColor: string) => void;
};

const ColorInputField = memo(({ color, onChange }: ColorInputFieldProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Box
      sx={{
        '> .sketch-picker': {
          width: '100% !important',
          minWidth: '0 !important',
          maxWidth: '100% !important',
          boxSizing: 'border-box',
          boxShadow: 'none !important',
          backgroundColor: 'transparent !important',
          padding: '0 !important',
          ' .saturation-white': {
            borderRadius: '6px',
          },
          ' input': {
            width: '100% !important',
            padding: '0.2rem !important',
            fontSize: '12px !important',
            borderRadius: '3px !important',
            textAlign: 'center !important',
            '&:focus': {
              boxShadow: 'none !important',
            },
          },
        },
      }}
    >
      {isMounted && (
        <SketchPicker
          color={color}
          onChange={(updatedColor: { hex: string }) =>
            onChange(updatedColor.hex)
          }
          width='100%'
        />
      )}
    </Box>
  );
});

ColorInputField.displayName = 'ColorInputField';

export default ColorInputField;
