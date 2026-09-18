//Data : 
import CategoriesData from '../../../Data/CategoriesData.json'

import TopSection from "@/Components/About/TopSection";
import Banner from "@/Components/TopSection/Banner";
import Categories from "@/Components/Categories";
import Footer from "@/Components/Footer";


export default function CategoriesPage() {
  return (
    <>
      <TopSection />
      <Banner bannerData={CategoriesData.banner.imgs}/>
      <Categories />
      <Footer />
    </>
  );
}