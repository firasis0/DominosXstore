import styles from "./styles.module.scss";
import { useState, useEffect } from 'react';

import ProductCard from "./ProductCard";



export default function ProductGrid() {

  const [products,setProducts] = useState([])

  useEffect(() => {
    const fetchProducts = async () => {
      try{
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/shop`);

        if (!response.ok){
          throw new Error(`Server returned status ${response.status}`);
        }

        const result = await response.json();

        if(result.success) {
          setProducts(result.data);
        }else{
          throw new Error(result.message || "Failed to fetch products");
        }


      }catch(error){
          console.error("Error fetching dashboard products:", error);
      }
    }
    fetchProducts();
  },[]) 


    
  return (
    <section id="deals" className={styles.ProductGrid}>
      <div className={styles.ProductGrid__Container}>
        <div className={styles.ProductGrid__Grid}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      </div>
    </section>
  );
}