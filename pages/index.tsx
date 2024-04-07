import type { NextPage } from 'next'
// import Head from "next/head"
// import Image from "next/image"
import styles from '../src/styles/Home.module.css'
import ColorPicker from '../src/components/ColorPicker'
import { Typography } from '@mui/material'
import { deepOrange } from '@mui/material/colors'

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
        component='h1'
        gutterBottom
        sx={{
          fontSize: '24px',
          margin: '0 0 24px 0',
          lineHeight: '1.15',
          fontWeight: 'bold',
          letterSpacing: '0.05em',
          color: deepOrange[500],
          // WebkitTextStroke: '2px #33c',
          // TextStroke: '2px #33c',
        }}
      >
        Pallet Pally
      </Typography>
      <ColorPicker />
    </div>
  )
}

export default Home
