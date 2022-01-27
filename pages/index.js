import { Heading, Page, Button, TextField, Spinner, Toast, Frame } from "@shopify/polaris";
import React, { useState, useCallback } from "react"
import SideBar from '../components/SideBar'
import styles from './index.module.scss'

const Index = () => { 

  const [asin, setAsin] = useState("")
  const [loading, setLoading] = useState(false)
  const [active, setActive] = useState(false);

  const toggleActive = useCallback(() => setActive((active) => !active), []);

  const addProduct = async () => {
    
    if(asin == "")
      return

    setLoading(true)

    await fetch('http://localhost:8081/api/product?asin=' + asin)
    .then(response => response.json())
    .then(data => {
      setAsin("")
      setLoading(false)
      setActive(true)
      console.log("products =", data)
    })    
  }

  const toastMarkup = active ? (
    <Toast content="Product Added!" onDismiss={toggleActive} />
  ) : null;

  return(
    <div className={styles.container}>
      <SideBar/>
      <Frame>
        <Page>
          <Heading>From Amazon</Heading>
          <TextField
            value={asin}
            onChange={(value) => {
              console.log(value)
              setAsin(value)
            }}
            label="ASIN"
            type="text"
            helpText={
              <span>
                Enter asin to add pleasea
              </span>
            }
          />
          {loading ? <Spinner accessibilityLabel="loading" size="small" />: <Button onClick={addProduct}>Add product</Button>}
          {toastMarkup}
        </Page>
      </Frame>
    </div>
  );
}

export default Index;
