import TopSection from "@/Components/About/TopSection";
import UploadedContentBanner from "@/Components/UploadedContentBanner";
import Categories from "@/Components/Categories";
import Footer from "@/Components/Footer";

export default function CategoriesPage() {
    return (
        <>
            <TopSection />
            <UploadedContentBanner pageName="categories" />
            <Categories />
            <Footer />
        </>
    );
}