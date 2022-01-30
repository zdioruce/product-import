import styles from './SideBar.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faUpload, faBoxes } from '@fortawesome/free-solid-svg-icons'
import { Popover, ActionList } from "@shopify/polaris";
import React, { useState, useCallback } from "react"
import SingleProductModal from "../SingleProductModal/SingleProductModal"
import SideBarMenuItem from "../SideBarMenuItem/SideBarMenuItem"
import { useRouter } from 'next/router';

export default function SideBar() {

  const router = useRouter();
  const [active, setActive] = useState(false);
  const [productID, setProductID] = useState('');
  const [singleProductActive, setSingleProductActive] = useState(false);

  const toggleActive = useCallback(() => setActive((active) => !active), []);

  const handleImportedAction = useCallback(
    () => {
      setSingleProductActive(!singleProductActive)
      setActive(!active)
    },
    [singleProductActive, active],
  );

  const handleExportedAction = useCallback(
    () => console.log('Exported action'),
    [],
  );

  const handleSingleProduct = useCallback(() => { 
    setSingleProductActive(!singleProductActive)
   
    console.log(productID)
    if(productID.length > 0){
      
      router.push({
        pathname: '/predraft/[asin]',
        query: { asin: productID }
      })  

      setProductID('')
    }
  }, [singleProductActive]);

  const handleChangeProductID = useCallback((value) => setProductID(value), []);

  const activator = (
    <button className={styles.btn} onClick={toggleActive}>
      <FontAwesomeIcon icon={faPlus} className={styles.icon}/>
      <span>Add Products</span>
    </button>
  );

  return (
    <div className={styles.container}>
      <div className={styles.app_title}></div>
      <div className={styles.bottom}>
        <div className={styles.add_products}>            
            <Popover
              active={active}
              activator={activator}
              autofocusTarget="first-node"
              onClose={toggleActive}
            >
              <ActionList
                actionRole="menuitem"
                items={[
                  {
                    content: 'Single Product',
                    onAction: handleImportedAction,
                  },
                  {
                    content: 'Multiple Products',
                    onAction: handleExportedAction,
                  },
                ]}
              />
            </Popover>
        </div>
      </div>  
      <SideBarMenuItem
        title="Products"
        icon={faBoxes}
        active={true}
        href="/products"
      />
      <SideBarMenuItem
        title="Drafts"
        icon={faUpload}
        active={false}
        href="/drafts"
      />
      <SingleProductModal
        open={singleProductActive}
        value={productID}
        onClose={handleSingleProduct}
        onChange={handleChangeProductID}
      />
    </div>
  )
}
