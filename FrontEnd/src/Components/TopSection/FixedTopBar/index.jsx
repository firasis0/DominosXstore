import styles from './styles.module.scss'

const ANNOUNCEMENT =
  "⚡ NOUVEAU — LIVRAISON 7J/7 | MÊME LE VENDREDI Vos équipements gaming livrés tous les jours"

export default function FixedTopBar() {
  return (
    <div>
      <div className={styles.fixedTopBar}>
        <h3>{ANNOUNCEMENT}</h3>
      </div>
    </div>
  )
}
