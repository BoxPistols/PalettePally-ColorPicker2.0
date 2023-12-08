import React, { useEffect, useState, memo } from 'react'
import { Box, TextField, styled, InputLabel } from '@mui/material'
import { SketchPicker } from 'react-color'

type ColorInputFieldProps = {
  color: string
  onChange: (newColor: string) => void
}

const FlexBox = styled(Box)`
  display: flex;
  align-items: center;
`

const StyledInputLabel = styled(InputLabel)`
  && {
    transform: none !important;
    transition: none !important;
  }
`

// HEX値が有効なカラーかどうかをチェックする関数
const isValidHex = (hex: any) => /^#([0-9A-F]{3}){1,2}$/i.test(hex)

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
              // border: 'none !important',
              // boxShadow: 'none !important',
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
      {/* <StyledInputLabel shrink={false} htmlFor='hex-color' size='small'>
        Hex Color
      </StyledInputLabel> */}
      {/* <TextField
        id='hex-color'
        value={color}
        onChange={(e) => onChange(e.target.value)}
        size='small'
        sx={{ pl: 0 }}
      /> */}
    </Box>
  )
})

ColorInputField.displayName = 'ColorInputField'

export default ColorInputField
