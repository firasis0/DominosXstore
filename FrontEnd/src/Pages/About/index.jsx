import TopSection from "@/Components/About/TopSection";
import UploadedContentBanner from "@/Components/UploadedContentBanner";
import Footer from "@/Components/Footer";
import MiddleSection from "@/Components/About/MiddleSection";

export default function About() {
    return (
        <div>
            <TopSection />

            <UploadedContentBanner pageName="about" />

            <MiddleSection />

            <Footer />
        </div>
    );
}