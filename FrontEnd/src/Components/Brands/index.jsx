import styles from './styles.module.scss'
import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import ProductGrid from './ProductGrid'
import { fetchStoreBrands, resolveStoreImageUrl } from '@/lib/storeData'

export default function BrandsDetails() {
  const { name } = useParams()
  const navigate = useNavigate()
  const [brand, setBrand] = useState(null)

  useEffect(() => {
    fetchStoreBrands()
      .then((data) => setBrand(data.find((item) => item.name === name)))
      .catch((error) => console.error('Error fetching brand:', error))
  }, [name])

  useEffect(() => {
    if (!brand) return

    requestAnimationFrame(() => {
      document.getElementById('brand-detail-header')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }, [brand])

  if (!brand) return null
  


  return (
    <div>
      <button onClick={() => navigate(-1)} className={styles.BackBtn}>
        ← Back
      </button>

      <div className={styles.CategoryDetailHeader}>
        <span id="brand-detail-header" className={styles.CategoryDetailHeader__Eyebrow}>Brand Collection</span>
      </div>

      <div className={styles.Category_wrapper_container}>
        <div className={styles.Category__ImageWrapper}>
          <img
            src={resolveStoreImageUrl(brand.image_url)}
            alt={brand.name}
            className={styles.Category__Image}
          />
        </div>
        <p className={styles.CategoryDetailHeader__Subtitle}>Browse all available products in this Brand</p>
        <h3 className={styles.CategoryDetailHeader__Title}>{brand.name}</h3>
      </div>

      <ProductGrid id={brand.id} />
    </div>
  )
}