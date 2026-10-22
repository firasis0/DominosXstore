import FixedTopBar from "../../Components/TopSection/FixedTopBar";
import UploadedContentBanner from "@/Components/UploadedContentBanner";
import Navbar from "../../Components/TopSection/Navbar";

export default function TopSection() {
    return (
        <>
            <FixedTopBar />

            <Navbar />

            <UploadedContentBanner pageName="home" />
        </>
    );
}