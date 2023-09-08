import type { NextPage } from "next"
// import Head from "next/head"
// import Image from "next/image"
import styles from "../src/styles/Home.module.css"
import ColorPicker from "../src/components/ColorPicker"
import { Typography } from "@mui/material"

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
      <Typography variant="h1" component="h1" gutterBottom sx={{
        fontFamily: "Noto Sans JP"
      }}>
        Hello Pallet Pally
      </Typography>
      <ColorPicker />
    </div>
  )
}

export default Home
