import React, { useEffect, useState } from 'react'
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

function ColorInputField({ color, onChange }: ColorInputFieldProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <Box
      sx={{
        display: 'block',
        pb: 2,
        overflow: 'auto',
        maxWidth: '90vw',
      }}
    >
      <FlexBox
        sx={{
          mb: 1.5,
          gap: 1,
          border: '1px solid #f9f9fc',
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
      </FlexBox>
      <StyledInputLabel shrink={false} htmlFor='hex-color' size='small'>
        Hex Color
      </StyledInputLabel>
      <TextField
        id='hex-color'
        value={color}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange(e.target.value)
        }
        size='small'
        sx={{ pl: 0 }}
      />
    </Box>
  )
}

export default ColorInputField
