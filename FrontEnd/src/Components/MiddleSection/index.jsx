import styles from "./styles.module.scss";
import Categories from "./Categories";
import Brands from "./Brands";
import BestDeals from "./BestDeals";
import Banner from "../TopSection/Banner";


import HomeData from "../../../Data/HomeData.json";

export default function MiddleSection() {
  return (
    <main className={styles.MiddleSection}>
      <Categories />
      <BestDeals />
      <Banner bannerData={HomeData.MiddleSection.MiddleBanner.imgs} />
      <Brands data = {HomeData.MiddleSection.marks} title= "Shop by Brand" />
      <BestDeals title = {"Recommended for you"} categoryId={1} />
    
    </main>
  );
}