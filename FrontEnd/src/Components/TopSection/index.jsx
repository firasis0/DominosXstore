//Data: 
import HomeData from "../../../Data/HomeData.json"
//Components:
import FixedTopBar from '../../Components/TopSection/FixedTopBar'
import Banner from './Banner'
import Navbar from '../../Components/TopSection/Navbar'



export default function TopSection() {
  return (
    <>
        <FixedTopBar />
        <Navbar />
        <Banner bannerData={HomeData.TopSection.TopBanner.imgs} />
    </>
  )
}
