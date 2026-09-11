import { useParams } from "react-router-dom";

import productsData from "@/../Data/ProductsData.json";

import Breadcrumbs from "./Breadcrumbs";
import Gallery from "./Gallery";
import Info from "./Info";
import OrderForm from "./OrderForm";

import styles from "./styles.module.scss";

export default function ProductDetails() {
  const { id } = useParams();

  const products = productsData.products ?? productsData;

  const product = products.find(
    (item) => item.id === Number(id)
  );

  if (!product) {
    return (
      <main className={styles.ProductDetails}>
        <div className={styles.ProductDetails__NotFound}>
          <h1>Product not found</h1>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.ProductDetails}>
      <div className={styles.ProductDetails__Container}>
        <Breadcrumbs product={product} />

        <div className={styles.ProductDetails__Top}>
          <Gallery product={product} />

          <div className={styles.ProductDetails__Info}>
            <Info product={product} />
            <OrderForm product={product} />
          </div>
        </div>
      </div>
    </main>
  );
}