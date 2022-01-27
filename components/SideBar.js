import styles from './SideBar.module.scss'

export default function SideBar() {
  return (
    <div className={styles.container}>
      <div className={styles.app_title}></div>
      <div className={styles.bottom}>
        <div className={styles.add_products}>
            <button className={styles.btn}>
                <span>Add Products</span>
            </button>
        </div>
      </div>
    </div>
  )
}
