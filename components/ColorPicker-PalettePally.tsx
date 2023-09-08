/**
 * @packageDocumentation
 * @module ColorPicker-PalettePally
 * @description
	"message": "モジュール 'chroma-js' の宣言ファイルが見つかりませんでした。'/Users/ai/dev/Asagiri/ColorPicker-PalettePally/pallett-pally/node_modules/chroma-js/chroma.js' は暗黙的に 'any' 型になります。\n  存在する場合は `npm i --save-dev @types/chroma-js` を試すか、`declare module 'chroma-js';` を含む新しい宣言 (.d.ts) ファイルを追加します",

}]
 */

import React, { SetStateAction, useEffect, useState } from "react"
import { Box, TextField, Button, Grid, styled, InputLabel } from "@mui/material"
import { SketchPicker } from "react-color"
import chroma from "chroma-js"

type ColorInputFieldProps = {
  color: string
  onChange: (newColor: string) => void
  initialColor: SetStateAction<never[]>
  newPalette: SetStateAction<never[]>
}

const shades = {
  main: 0,
  dark: -2,
  light: 1.25,
  lighter: 4,
}

const FlexBox = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const StyledInputLabel = styled(InputLabel)`
  && {
    transform: none !important;
    transition: none !important;
  }
`

function ColorInputField({ color, onChange }: ColorInputFieldProps) {
  return (
    <>
      <Box
        sx={{
          display: "block",
          pb: 2,
          overflow: "auto",
          maxWidth: "90vw",
        }}
      >
        <FlexBox
          sx={{
            mb: 1.5,
            gap: 1,
            border: "1px solid #f9f9fc",
          }}
        >
          <SketchPicker
            color={color}
            onChange={(updatedColor: { hex: any }) =>
              onChange(updatedColor.hex)
            }
          />
        </FlexBox>
        <StyledInputLabel shrink={false} htmlFor="hex-color" size="small">
          Hex Color
        </StyledInputLabel>
        <TextField
          id="hex-color"
          value={color}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChange(e.target.value)
          }
          size="small"
          sx={{ pl: 0 }}
        />
      </Box>
    </>
  )
}

function ColorPicker() {
  const [numColors, setNumColors] = useState(4)
  const [color, setColor] = useState([])
  const [palette, setPalette] = useState(null)

  useEffect(() => {
    const initialColor = Array.from(
      { length: numColors },
      (_, i) => chroma.hsl((i * 360) / numColors, 0.85, 0.5).hex() // 彩度を抑える
    )
    setColor(initialColor)
  }, [numColors])

  const handleGenerateClick = () => {
    const newPalette = color.map((c) => {
      const baseColor = chroma(c)
      const baseHSL = baseColor.hsl()
      const adjustedColors = Object.fromEntries(
        Object.entries(shades).map(([shade, adjustment]) => {
          if (shade === "main") {
            return [shade, baseColor.hex()] // mainカラーは元の色と一致させる
          }
          const [h, s, l] = baseHSL
          return [shade, chroma.hsl(h, s * 0.85, l + adjustment * 0.1).hex()]
        })
      )
      return adjustedColors
    })
    setPalette(newPalette)
  }

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <StyledInputLabel shrink={false} htmlFor="color-length">
          カラー数↓↑
        </StyledInputLabel>
        <TextField
          size="small"
          id="color-length"
          value={numColors}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const num = parseInt(e.target.value, 10)
            if (!isNaN(num) && num > 0) {
              setNumColors(num)
            }
          }}
          type="number"
          inputProps={{ min: 1, max: 24 }}
          fullWidth
          sx={{ mb: 1, width: 100, marginRight: 2 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleGenerateClick}
        >
          カラーパレット生成 / 再生成
        </Button>
      </Box>
      <FlexBox
        sx={{
          flexDirection: "columns",
          gap: 2,
          overflow: "auto",
          maxWidth: "90vw",
        }}
      >
        {Array.from({ length: numColors }, (_, i) => (
          <React.Fragment key={i}>
            <FlexBox sx={{ display: "block" }}>
              <b>Color {i + 1}</b>
              <ColorInputField
                color={color[i]}
                onChange={(newColor: any) => {
                  const colorsCopy = [...color]
                  colorsCopy[i] = newColor
                  setColor(colorsCopy)
                }}
              />
            </FlexBox>
          </React.Fragment>
        ))}
      </FlexBox>
      {palette && (
        <Grid container spacing={2} mt={2}>
          {palette.map((c: any, i: number) => (
            <Grid
              item
              xs={6}
              md={3}
              lg={2}
              key={i}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <b>Color {i + 1}</b>
              {/* Property 'entries' does not exist on type 'ObjectConstructor'. Do you need to change your target library? Try changing the 'lib' compiler option to 'es2017' or later. */}
              {Object.entries(c).map(([shade, color]) => (
                <>
                  <Box
                    m={1}
                    px={2}
                    key={shade}
                    sx={{
                      flexGrow: 1,
                      background: color,
                      borderRadius: "6px", // 角丸にするためにスタイル追加
                      color:
                        chroma(color).luminance() > 0.5 ? "black" : "white",
                    }}
                  >
                    <>
                      <Box p={1} sx={{ borderRedius: "6px" }}>
                        {shade}: {color}
                      </Box>
                    </>
                  </Box>
                </>
              ))}
            </Grid>
          ))}
        </Grid>
      )}
    </>
  )
}

export default ColorPicker
