import React, { useEffect, useState, memo } from 'react'
import { Box } from '@mui/material'
import { SketchPicker } from 'react-color'

type ColorInputFieldProps = {
  color: string
  onChange: (newColor: string) => void
}

const ColorInputField = memo(({ color, onChange }: ColorInputFieldProps) => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
      }}
    >
      <Box
        sx={{
          '> .sketch-picker': {
            width: 'auto !important',
            minWidth: '210px !important',
            maxWidth: '210px !important',
            boxShadow: 'none !important',
            backgroundColor: 'transparent !important',
            ' input': {
              width: '100% !important',
              padding: '0.25rem !important',
              fontSize: '14px !important',
              borderRadius: '2px !important',
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
          />
        )}
        <Box mt={1} ml={1}>
          main: {color}
        </Box>
      </Box>
    </Box>
  )
})

ColorInputField.displayName = 'ColorInputField'

export default ColorInputField
