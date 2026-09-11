// import styles from './styles.module.scss'
import CategoriesDetails from "@/Components/CategoriesDetails"
import CategoriesData from '../../../Data/CategoriesData.json'

import TopSection from "@/Components/About/TopSection";
import Banner from "@/Components/TopSection/Banner";
import Footer from "@/Components/Footer";

export default function CategoriesDetailsPage() {
  return (
    <>
     <TopSection />
      <Banner bannerData={CategoriesData.banner.imgs}/>
      <CategoriesDetails/>
      <Footer />
    
    </>
  )
}
