import React from 'react'
import Head from "next/head";
import favicon from '../../../public/assets/images/brand-logos/favicon.ico';

const Seo = ({ title }) => {
  let i = `Ynex - ${title}`
  return (
    <Head>
      <title>{i}</title>
      <link href={favicon.src} rel="icon"></link>
      <meta name="description" content="Ynex - Nextjs Admin &amp; Dashboard Template" />
      <meta name="author" content="Spruko Technologies Private Limited" />
    </Head>
  )
}

export default Seo
