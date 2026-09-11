import styles from './styles.module.scss'
import CategoriesData from '../../../Data/CategoriesData.json'
import { useParams, useNavigate } from 'react-router-dom'
import ProductGrid from './ProductGrid'

export default function CategoriesDetails() {
  const { name } = useParams()
  const navigate = useNavigate()
  const category = CategoriesData.categories.find(item => item.name === name)
  
 

  return (
    <div>
      <button onClick={() => navigate(-1)} className={styles.BackBtn}>
        ← Back
      </button>

      <div className={styles.CategoryDetailHeader}>
        <span id="category-detail-header" className={styles.CategoryDetailHeader__Eyebrow}>Category Collection</span>
      </div>

      <div className={styles.Category_wrapper_container}>
        <div className={styles.Category__ImageWrapper}>
          <img
            src={category.image_url}
            alt={category.name}
            className={styles.Category__Image}
          />
        </div>
        <p className={styles.CategoryDetailHeader__Subtitle}>Browse all available products in this category</p>
        <h3 className={styles.CategoryDetailHeader__Title}>{category.name}</h3>
      </div>

      <ProductGrid categoryId={category.id} />
    </div>
  )
}