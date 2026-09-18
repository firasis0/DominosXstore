// import styles from './styles.module.scss'
import CategoriesData from '../../../Data/CategoriesData.json'

import TopSection from "@/Components/About/TopSection";
import Banner from "@/Components/TopSection/Banner";
import Footer from "@/Components/Footer";
import BrandsDetails from '@/Components/Brands';

export default function BrandsDetailsPage() {
  return (
    <>
     <TopSection />
      <Banner bannerData={CategoriesData.banner.imgs}/>
      <BrandsDetails/>
      <Footer />
    
    </>
  )
}
