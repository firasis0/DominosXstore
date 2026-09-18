// import styles from './styles.module.scss'

//Data :
import AboutData from '../../../Data/AboutData.json'

//Components :
import TopSection from "@/Components/About/TopSection"
import Banner from "@/Components/TopSection/Banner";
import Footer from '@/Components/Footer';
import MiddleSection from '@/Components/About/MiddleSection';

export default function About() {
  return (
    <div>
      <TopSection/>
      <Banner bannerData={AboutData.TopBanner.imgs} />
      <MiddleSection/>

      <Footer/>
    </div>
  )
}
