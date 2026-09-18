import styles from './styles.module.scss'

//components:
import TopSection from "../../Components/TopSection"
import MiddleSection from "../../Components/MiddleSection"
import Footer from "../../Components/Footer"

export default function Home() {
  return (
    <div>
      <section className={styles.TopSection}>
        <TopSection />
        <MiddleSection />
        <Footer />
      </section>
    </div>
  )
}
