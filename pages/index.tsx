import type { NextPage } from 'next'
// import Head from "next/head"
// import Image from "next/image"
import styles from '../src/styles/Home.module.css'
import ColorPicker from '../src/components/ColorPicker'
import { Typography } from '@mui/material'

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      {/* 
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head> 
      */}
      <Typography
        variant='h3'
        component='h1'
        gutterBottom
        sx={{
          fontFamily: 'futura',
          margin: '0 0 16px 0',
          transform: 'rotate(-90deg)',
          position: 'absolute',
          top: '4.2em',
          left: '-2em',
          color: 'tomato',
        }}
      >
        - Pallet Pally -
      </Typography>
      <ColorPicker />
    </div>
  )
}

export default Home
