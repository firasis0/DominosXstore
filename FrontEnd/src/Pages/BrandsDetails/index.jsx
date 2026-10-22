import TopSection from "@/Components/About/TopSection";
import UploadedContentBanner from "@/Components/UploadedContentBanner";
import Footer from "@/Components/Footer";
import BrandsDetails from '@/Components/Brands';

export default function BrandsDetailsPage() {
  return (
    <>
     <TopSection />
      <UploadedContentBanner pageName="categories" />
      <BrandsDetails/>
      <Footer />
    
    </>
  )
}
