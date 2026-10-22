import CategoriesDetails from "@/Components/CategoriesDetails"

import TopSection from "@/Components/About/TopSection";
import UploadedContentBanner from "@/Components/UploadedContentBanner";
import Footer from "@/Components/Footer";

export default function CategoriesDetailsPage() {
  return (
    <>
     <TopSection />
      <UploadedContentBanner pageName="categories" />
      <CategoriesDetails/>
      <Footer />
    
    </>
  )
}
