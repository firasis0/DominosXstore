import styles from "./styles.module.scss";
import Categories from "./Categories";
import Brands from "./Brands";
import BestDeals from "./BestDeals";
import InventoryCarousel from "./InventoryCarousel";
import Banner from "../TopSection/Banner";


import HomeData from "../../../Data/HomeData.json";

export default function MiddleSection() {
  return (
    <main className={styles.MiddleSection}>
      <Categories />
      <BestDeals />
      <InventoryCarousel
        eyebrow="Built for your setup"
        title="Keyboards and desk essentials"
        mode="keyboards"
      />
      <InventoryCarousel
        eyebrow="Brand spotlight"
        title="GameSir favorites"
        mode="gamesir"
      />
      <InventoryCarousel
        eyebrow="Fresh from inventory"
        title="More gear worth discovering"
        mode="random"
      />
      <Banner bannerData={HomeData.MiddleSection.MiddleBanner.imgs} />
      <Brands data = {HomeData.MiddleSection.marks} title= "Shop by Brand" />    
    
    </main>
  );
}