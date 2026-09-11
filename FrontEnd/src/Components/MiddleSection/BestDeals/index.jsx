import styles from "./styles.module.scss";

import { Link } from "react-router-dom";
import ProductsData from "../../../../Data/ProductsData.json";

import Autoplay from "embla-carousel-autoplay";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/Components/ui/carousel";

export default function BestDeals({ title, categoryId }) {
  const saleProducts = ProductsData.products.filter(
    (product) =>
      product.is_on_sale &&
      (categoryId ? product.category_id === categoryId : true)
  );

  if (saleProducts.length === 0) {
    return null;
  }

  const pages = [];

  for (let i = 0; i < saleProducts.length; i += 5) {
    pages.push(saleProducts.slice(i, i + 5));
  }

  return (
    <section className={styles.BestDeals}>
      <div className={styles.BestDeals__Container}>

        {/* Header */}
        <div className={styles.BestDeals__Header}>
          <div>
            <span className={styles.BestDeals__Subtitle}>
              Limited Offers
            </span>

            <h2 className={styles.BestDeals__Title}>
              {title || "Best Deals"}
            </h2>
          </div>

          <Link
            to="/shop#deals"
            className={styles.BestDeals__ViewAll}
          >
            View all deals →
          </Link>
        </div>

        {/* Carousel */}
        <Carousel
          className={styles.BestDeals__Carousel}
          opts={{
            align: "start",
            loop: pages.length > 1,
          }}
          plugins={[
            Autoplay({
              delay: 5000,
              stopOnInteraction: false,
            }),
          ]}
        >
          <CarouselContent className={styles.BestDeals__Content}>

            {pages.map((page, pageIndex) => (
              <CarouselItem
                key={pageIndex}
                className={styles.BestDeals__Page}
              >
                <div className={styles.BestDeals__Grid}>
                  {page.map((product) => {
                    const currentPrice =
                      product.discount_price ?? product.price;

                    return (
                      <article
                        key={product.id}
                        className={styles.Product}
                      >
                        <Link
                          to={`/product/${product.id}`}
                          className={styles.Product__Link}
                        >
                          {/* Image */}
                          <div className={styles.Product__ImageWrapper}>
                            <span className={styles.Product__SaleBadge}>
                              Sale
                            </span>

                            <img
                              src={product.images?.[0]}
                              alt={product.name}
                              className={styles.Product__Image}
                            />
                          </div>

                          {/* Information */}
                          <div className={styles.Product__Info}>
                            <h3 className={styles.Product__Name}>
                              {product.name}
                            </h3>

                            <div className={styles.Product__Prices}>
                              <span className={styles.Product__Price}>
                                {currentPrice.toLocaleString()} DA
                              </span>

                              {product.discount_price != null && (
                                <span className={styles.Product__OldPrice}>
                                  {product.price.toLocaleString()} DA
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      </article>
                    );
                  })}
                </div>
              </CarouselItem>
            ))}

          </CarouselContent>

          {pages.length > 1 && (
            <>
              <CarouselPrevious
                className={styles.BestDeals__Previous}
              />

              <CarouselNext
                className={styles.BestDeals__Next}
              />
            </>
          )}
        </Carousel>

        {/* Page indicators */}
        {pages.length > 1 && (
          <div className={styles.BestDeals__Dots}>
            {pages.map((_, index) => (
              <span
                key={index}
                className={styles.BestDeals__Dot}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
