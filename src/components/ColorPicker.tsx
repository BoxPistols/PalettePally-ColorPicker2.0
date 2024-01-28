import React, { ChangeEvent, useCallback, useEffect, useState } from 'react'
import { Box, TextField, Button, styled, InputLabel } from '@mui/material'
import chroma from 'chroma-js'
import ColorInputField from './ColorInputField'
import PaletteGrid from './PaletteGrid'
import DialogBox from './DialogBox'
import { downloadJSON } from './utils'

const shades = {
  main: 0,
  dark: -1,
  light: 1,
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
  const [dialogContent, setDialogContent] = useState('')

  // 調整されたカラーを一時保存するための状態
  const [adjustedColors, setAdjustedColors] = useState<string[]>([])

  const isValidHex = (hex: never) => /^#([0-9A-F]{3}){1,2}$/i.test(hex)
  // useEffect を更新
  useEffect(() => {
    // カラー数が増えた場合、新しいカラーを追加
    if (numColors > color.length) {
      const additionalColors = Array.from(
        { length: numColors - color.length },
        () => generateRandomColor(color.concat(adjustedColors) as never[])
      )
      setColor([...color, ...additionalColors])
      setAdjustedColors([...adjustedColors, ...additionalColors])

      // 新しいカラー名を追加（既存の名前は維持）
      setColorNames(oldNames => {
        return [
          ...oldNames,
          ...Array.from(
            { length: numColors - oldNames.length },
            (_, i) => `color${oldNames.length + i + 1}`
          ),
        ]
      })
    } else {
      // カラー数が減少した場合、既存のカラーと名前を削減
      setColor(oldColors => oldColors.slice(0, numColors))
      setColorNames(oldNames => oldNames.slice(0, numColors))
    }
  }, [numColors, color, adjustedColors])

  // カラーピッカーの初期色を生成する関数
  const generateInitialColors = useCallback((num: number) => {
    return Array.from({ length: num }, (_, i) => {
      // 色相環の開始を赤色 (0度) とする
      const hue = i * (360 / num)
      return chroma.hsl(hue, 0.8, 0.5).hex() // 明度を0.5に設定して赤色を含める
    })
  }, [])

  // カラーピッカーのリセット処理
  const handleReset = useCallback(() => {
    const initialColors = generateInitialColors(numColors)
    setColor(initialColors)
    setAdjustedColors([...initialColors]) // adjustedColorsも更新する
    // ...他にリセットが必要なstateがあればここで設定
  }, [generateInitialColors, numColors])

  // コンポーネントのマウント時に一度だけリセット処理を実行
  useEffect(() => {
    handleReset()
  }, [handleReset])

  // 新しい色を生成する関数
  function generateRandomColor(existingColors: never[]) {
    let newHue: number
    do {
      newHue = Math.floor(Math.random() * 360)
    } while (
      existingColors.some(
        color => Math.abs(chroma(color).hsl()[0] - newHue) < 30
      )
    )
    const saturation = 0.9 // 彩度
    const lightness = 0.5 // 明度
    return chroma.hsl(newHue, saturation, lightness).hex()
  }

  // カラーピッカーとカラーネームの変更が反映されるようにする
  useEffect(() => {
    const newPalette = color.map((c, idx) => {
      const baseColor = chroma(c)
      const baseHSL = baseColor.hsl()

      return {
        [colorNames[idx]]: Object.fromEntries(
          Object.entries(shades).map(([shade, adjustment]) => {
            if (shade === 'main') {
              return [shade, baseColor.hex()]
            }
            const [h, s, l] = baseHSL
            return [shade, chroma.hsl(h, s * 0.8, l + adjustment * 0.1).hex()]
          })
        ),
      }
    })

    setPalette(newPalette)
  }, [color, colorNames])

  // カラーネーム変更時のハンドラ
  const handleColorNameChange = (index: number, newName: string) => {
    const newNames = [...colorNames]
    newNames[index] = newName
    setColorNames(newNames)
  }

  // カラーピッカーでの変更が反映されるようにする
  const handleColorChange = (index: number, newColor: string) => {
    // HEX値の形式が正しいか検証
    if (!isValidHex(newColor as never) && newColor !== '#') return

    // カラー配列の更新
    const newColors = [...color]
    newColors[index] = newColor
    setColor(newColors)
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
      reader.onload = e => {
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
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Box mt={-2}>
          <StyledInputLabel shrink={false} htmlFor='color-length'>
            カラー数↓↑
          </StyledInputLabel>
          <TextField
            id='color-length'
            value={numColors}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const num = parseInt(e.target.value, 10)
              if (!isNaN(num) && num > 0) {
                setNumColors(num)
              }
            }}
            type='number'
            inputProps={{ min: 1, max: 24 }}
            fullWidth
            sx={{ mb: 1, width: 100, marginRight: 2 }}
            size='small'
          />
          <Button
            variant='contained'
            color='secondary'
            onClick={() => handleReset()}
          >
            リセット
          </Button>
        </Box>

        <Box>
          <Button
            variant='contained'
            color='secondary'
            onClick={exportToJson}
            size='small'
            sx={{ mr: 2, px: 1.5, py: 0.5 }}
          >
            Export JSON
          </Button>
          <input type='file' onChange={importFromJson} />
        </Box>
      </Box>
      <FlexBox
        sx={{
          flexDirection: 'row',
          gap: 2,
          overflow: 'auto',
          // maxWidth: '90vw',
        }}
      >
        {color.map((c, index) => (
          <Box key={index}>
            <FlexBox sx={{ display: 'block' }}>
              <TextField
                value={colorNames[index]}
                onChange={e => handleColorNameChange(index, e.target.value)}
                size='small'
              />
              <ColorInputField
                color={c}
                onChange={newColor => handleColorChange(index, newColor)}
              />
            </FlexBox>
          </Box>
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
