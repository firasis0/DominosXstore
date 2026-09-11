import styles from './styles.module.scss'
import BrandsData from '../../../Data/BrandsData.json'
import { useParams, useNavigate } from 'react-router-dom'
import ProductGrid from './ProductGrid'

export default function BrandsDetails() {
  const { name } = useParams()
  const navigate = useNavigate()
  const brand = BrandsData.brands.find(item => item.name === name)
  


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
            src={brand.image_url}
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