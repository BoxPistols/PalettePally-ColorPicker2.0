import React, { ChangeEvent, useEffect, useState } from "react"
import { Box, TextField, Button, styled, InputLabel } from "@mui/material"
import chroma from "chroma-js"
import ColorInputField from "./ColorInputField"
import PaletteGrid from "./PaletteGrid"
import DialogBox from "./DialogBox"
import { getCurrentFormattedDate, downloadJSON } from "./utils"

type ColorInputFieldProps = {
  color: string
  onChange: (newColor: string) => void
}

type PaletteType = { [colorName: string]: { [shade: string]: string } }[]

const shades = {
  main: 0,
  dark: -2,
  light: 1.25,
  lighter: 4,
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

function ColorPicker() {
  const [numColors, setNumColors] = useState(4)
  const [color, setColor] = useState<string[]>([])
  const [palette, setPalette] = useState<
    { [colorName: string]: { [shade: string]: string } }[] | null
  >(null)
  const [colorNames, setColorNames] = useState(
    Array.from({ length: numColors }, (_, i) => `color${i + 1}`)
  )

  const [showDialog, setShowDialog] = useState(false)
  const [dialogContent, setDialogContent] = useState("")
  useEffect(() => {
    if (numColors > color.length) {
      const additionalColors = Array.from(
        { length: numColors - color.length },
        (_, i) =>
          chroma.hsl(((i + color.length) * 360) / numColors, 0.8, 0.45).hex()
      )

      setColor((prevColors) => [...prevColors, ...additionalColors])
      setColorNames((prevNames) => [
        ...prevNames,
        ...Array.from(
          { length: additionalColors.length },
          (_, i) => `color${i + prevNames.length + 1}`
        ),
      ])
    } else if (numColors < color.length) {
      setColor((prevColors) => prevColors.slice(0, numColors))
      setColorNames((prevNames) => prevNames.slice(0, numColors))
    }
  }, [color.length, numColors])

  const handleGenerateClick = () => {
    const newPalette = color.map((c, idx) => {
      const baseColor = chroma(c)
      const baseHSL = baseColor.hsl()

      const adjustedColors = Object.fromEntries(
        Object.entries(shades).map(([shade, adjustment]) => {
          if (shade === "main") {
            return [shade, baseColor.hex()]
          }
          const [h, s, l] = baseHSL
          return [shade, chroma.hsl(h, s * 0.8, l + adjustment * 0.1).hex()]
        })
      )

      return { [colorNames[idx]]: adjustedColors }
    })
    setPalette(newPalette)
  }

  const handleColorNameChange = (index: number, newName: string) => {
    const newColorNames = [...colorNames]
    newColorNames[index] = newName
    setColorNames(newColorNames)
  }

  const exportToJson = () => {
    const data = {
      colors: color,
      names: colorNames,
      palette: palette,
    }
    setDialogContent(JSON.stringify(data, null, 2))
    setShowDialog(true)
  }

  const importFromJson = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target !== null) {
          const data = JSON.parse(e.target.result as string)
          setColor(data.colors)
          setColorNames(data.names)
          setPalette(data.palette)
          setNumColors(data.colors.length)
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <>
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between" }}>
        <Box mt={-2}>
          <StyledInputLabel shrink={false} htmlFor="color-length">
            カラー数↓↑
          </StyledInputLabel>
          <TextField
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
            size="small"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleGenerateClick}
          >
            カラーパレット生成 / 再生成
          </Button>
        </Box>

        <Box>
          <Button
            variant="contained"
            color="secondary"
            onClick={exportToJson}
            size="small"
            sx={{ mr: 2, px: 1.5, py: 0.5 }}
          >
            Export JSON
          </Button>
          <input type="file" onChange={importFromJson} />
        </Box>
      </Box>

      <FlexBox
        sx={{
          flexDirection: "row",
          gap: 2,
          overflow: "auto",
          maxWidth: "90vw",
        }}
      >
        {Array.from({ length: numColors }, (_, i) => (
          <React.Fragment key={i}>
            <FlexBox sx={{ display: "block" }}>
              <TextField
                value={colorNames[i]}
                onChange={(e) => handleColorNameChange(i, e.target.value)}
                size="small"
              />
              <ColorInputField
                color={color[i]}
                onChange={(newColor) => {
                  const colorsCopy = [...color]
                  colorsCopy[i] = newColor
                  setColor(colorsCopy)
                }}
              />
            </FlexBox>
          </React.Fragment>
        ))}
      </FlexBox>

      {palette && <PaletteGrid palette={palette} colorNames={colorNames} />}

      <DialogBox
        showDialog={showDialog}
        closeDialog={() => setShowDialog(false)}
        dialogContent={dialogContent}
        downloadJSON={() => downloadJSON(JSON.parse(dialogContent))}
      />
    </>
  )
}

export default ColorPicker
