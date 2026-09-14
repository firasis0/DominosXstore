import styles from './styles.module.scss'
import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import ProductGrid from './ProductGrid'
import { fetchStoreCategories, resolveStoreImageUrl } from '@/lib/storeData'

export default function CategoriesDetails() {
  const { name } = useParams()
  const navigate = useNavigate()
  const [category, setCategory] = useState(null)

  useEffect(() => {
    fetchStoreCategories()
      .then((data) => setCategory(data.find((item) => item.name === name)))
      .catch((error) => console.error('Error fetching category:', error))
  }, [name])

  useEffect(() => {
    if (!category) return

    requestAnimationFrame(() => {
      document.getElementById('category-detail-header')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }, [category])

  if (!category) return null
  
 

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
            src={resolveStoreImageUrl(category.image_url)}
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