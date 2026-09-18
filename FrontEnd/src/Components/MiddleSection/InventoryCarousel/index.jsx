import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Autoplay from "embla-carousel-autoplay";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/Components/ui/carousel";
import { fetchStoreProducts, resolveStoreImageUrl } from "@/lib/storeData";

import styles from "./styles.module.scss";

const getProductsForMode = (products, mode) => {
  if (mode === "keyboards") {
    return products.filter((product) =>
      `${product.category_name} ${product.name}`.toLowerCase().includes("keyboard")
    );
  }

  if (mode === "gamesir") {
    return products.filter((product) =>
      product.brand_name?.toLowerCase().includes("gamesir")
    );
  }

  return [...products].sort(() => Math.random() - 0.5).slice(0, 10);
};

const InventoryCarousel = ({ eyebrow, title, mode }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchStoreProducts()
      .then(setProducts)
      .catch((error) => console.error("Error fetching inventory carousel:", error));
  }, []);

  const selectedProducts = useMemo(
    () => getProductsForMode(products, mode),
    [products, mode]
  );

  const pages = [];
  for (let index = 0; index < selectedProducts.length; index += 5) {
    pages.push(selectedProducts.slice(index, index + 5));
  }

  if (!selectedProducts.length) return null;

  return (
    <section className={styles.CarouselSection}>
      <div className={styles.CarouselSection__Container}>
        <div className={styles.CarouselSection__Header}>
          <div>
            <span className={styles.CarouselSection__Eyebrow}>{eyebrow}</span>
            <h2 className={styles.CarouselSection__Title}>{title}</h2>
          </div>
          <Link to="/shop#shop" className={styles.CarouselSection__Link}>
            View all <span aria-hidden="true">-&gt;</span>
          </Link>
        </div>

        <Carousel
          opts={{ align: "start", loop: pages.length > 1 }}
          plugins={[Autoplay({ delay: 5200, stopOnInteraction: true })]}
        >
          <CarouselContent>
            {pages.map((page, pageIndex) => (
              <CarouselItem key={pageIndex}>
                <div className={styles.CarouselSection__Grid}>
                  {page.map((product) => {
                    const price = product.discount_price ?? product.price;

                    return (
                      <Link
                        key={product.id}
                        to={`/shop/${product.id}`}
                        className={styles.Product}
                      >
                        <div className={styles.Product__ImageWrapper}>
                          {product.is_on_sale && (
                            <span className={styles.Product__Badge}>Sale</span>
                          )}
                          <img
                            src={resolveStoreImageUrl(product.images?.[0])}
                            alt={product.name}
                            className={styles.Product__Image}
                          />
                        </div>
                        <span className={styles.Product__Brand}>
                          {product.brand_name || "Dominos Store"}
                        </span>
                        <h3 className={styles.Product__Name}>{product.name}</h3>
                        <span className={styles.Product__Price}>
                          {Number(price).toLocaleString()} DA
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {pages.length > 1 && (
            <>
              <CarouselPrevious className={styles.CarouselSection__Previous} />
              <CarouselNext className={styles.CarouselSection__Next} />
            </>
          )}
        </Carousel>
      </div>
    </section>
  );
};

export default InventoryCarousel;
