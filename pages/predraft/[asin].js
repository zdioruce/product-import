import { 
  Page,
  Heading,
  SkeletonPage,   
  Layout,
  Card, 
  SkeletonThumbnail,
  SkeletonBodyText, 
  SkeletonDisplayText,
  TextContainer } from "@shopify/polaris";
import React, { useEffect } from "react"
import styles from './styles.module.scss'
import { useRouter } from 'next/router'

const PreDraft = () => { 

  const router = useRouter()
  const { asin } = router.query

  useEffect(() => {
    async function fetchData() {
      await fetch('http://localhost:8081/api/product?asin=' + asin)
      .then(response => response.json())
      .then(data => {
        console.log("products =", data)
      })   
    }

    fetchData();
  })

  return(
    <div className={styles.container}>
      <Page>
        <Heading>Add new product</Heading>
          <SkeletonThumbnail size="medium" />                       
          <SkeletonBodyText lines={2}/>
          <SkeletonDisplayText size="extraLarge" />
          <SkeletonDisplayText size="extraLarge" />     
      </Page>
    </div>
  );
}

export default PreDraft;
