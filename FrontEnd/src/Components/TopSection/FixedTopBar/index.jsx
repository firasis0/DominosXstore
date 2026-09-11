import styles from './styles.module.scss'

//Data :
import HomeData from '../../../../Data/HomeData.json'

export default function FixedTopBar() {
  return (
    <div>
      <div className={styles.fixedTopBar}>
        <h3>{HomeData.TopSection.fixedTopBar.text}</h3>
      </div>
    </div>
  )
}
