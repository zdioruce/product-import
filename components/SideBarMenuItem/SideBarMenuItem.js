import styles from './SideBarMenuItem.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState, useCallback } from "react"
import Link from 'next/link'

export default function SideBarMenuItem({title, icon, active, href}) {  
  return (
    <Link href={href}>
      <a className={styles.container}>
        <FontAwesomeIcon icon={icon}/>
        <span>{title}</span>
      </a>
    </Link>
    
  )
}
