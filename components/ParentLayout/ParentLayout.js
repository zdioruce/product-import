import styles from './ParentLayout.module.scss'
import React, { useState, useCallback } from "react"
import SideBar from '@components/SideBar/SideBar'

export default function ParentLayout({ children }) {
  
  return (
    <div className={styles.container}>
      <SideBar/>
      {children}
     </div>
  )
}
