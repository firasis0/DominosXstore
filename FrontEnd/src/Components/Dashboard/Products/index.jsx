import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Pagination } from "@/Components/ui/pagination";
import Toast from "@/Components/ui/toast";

import ProductStats from "./ProductStats";
import ProductToolbar from "./ProductToolbar";
import ProductRow from "./ProductRow";
import AddProductModal from "./AddProductModal";
import styles from "./styles.module.scss";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // Toolbar filter state
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const [addOpen, setAddOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [toast, setToast] = useState(null);

  const API_BASE_URL=import.meta.env.VITE_API_BASE_URL;
  useEffect(() => {
    

    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`${API_BASE_URL}/dashboard/products`)

        if (!response.ok) {
          throw new Error(`Server returned status ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          setProducts(result.data);
        }else{
          throw new Error(result.message || "Failed to fetch products");
        }

       
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          console.error("Error fetching dashboard products:", fetchError);
          setError("Unable to load products.");
        }
      } finally {
          setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  //Fetching Categories :
  useEffect(() => {
    const fetchCategories = async () => {
      try{
          const response = await fetch(`${API_BASE_URL}/dashboard/categories`)

          if(!response.ok){
            throw new Error(`Response returned Status ${response.status}`);
          }

          const result = await response.json();

          if(result.success){
            setCategories(result.data);
            console.log(result.data)
          }else{
            throw new Error(result.message);
          }

      }catch(error){
        console.error("Error fetching categoties !", error)
      }
    }
    fetchCategories();
  },[])

  //Fetching Brands : 
    useEffect(() => {
    const fetchBrands = async () => {
      try{
          const response = await fetch(`${API_BASE_URL}/dashboard/brands`)

          if(!response.ok){
            throw new Error(`Response returned Status ${response.status}`);
          }

          const result = await response.json();

          if(result.success){
            setBrands(result.data);
            console.log(result.data)
          }else{
            throw new Error(result.message);
          }

      }catch(error){
        console.error("Error fetching brands !", error)
      }
    }
    fetchBrands();
  },[])

  const categoryOptions = categories.map((category) => ({
    id : category.id,
    name : category.name,
    image_url : category.image_url,
    is_active : category.is_active
  }))

  const brandOptions = brands.map((brand) => ({
    id : brand.id,
    name : brand.name,
    image_url : brand.image_url,
    is_active : brand.is_active
  }))

  const filteredProducts = products.filter((product) => {
  const matchesSearch =
    product.name.toLowerCase().includes(search.toLowerCase());

  const matchesCategory =
    category === "" ||
    String(product.category_id) === category;

  const matchesBrand =
    brand === "" ||
    String(product.brand_id) === brand;

  const matchesStatus =
    status === "" ||
    (status === "active" && product.is_active) ||
    (status === "inactive" && !product.is_active) ||
    (status === "out-of-stock" && product.stock === 0);

  return (
    matchesSearch &&
    matchesCategory &&
    matchesBrand &&
    matchesStatus
  );
});

  //Handle the switch active/deactivate toggle
  const handleToggleActive = async (id, checked) => {
    try{
      const response = await fetch(`${API_BASE_URL}/dashboard/products/${id}/active`,
        {
          method : "PATCH",
          headers: {
            "Content-type": "application/json",
          },
          body : JSON.stringify({
            is_active: checked,
          }),
        }
      )
      const result = await response.json();

      if(!response.ok || !result.success) {
        throw new Error (
          result.message || "Failed to update product status"
        );
      }
      setProducts((current) => 
        current.map((product) => 
          product.id === id 
      ? {
        ...product,
        is_active: result.data.is_active,
      } : product
    ));
    }catch(error){
      console.error("Error updating product status:", error);
    setError("Unable to update product status.");
    }
  };

 //Handles the edit 
  const handleSaveProduct = async (id, updatedFields) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/dashboard/products/${id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedFields),
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message || "Failed to update product"
            );
        }

        setProducts((current) =>
            current.map((product) =>
                product.id === id
                    ? result.data
                    : product
            )
        );

        setExpandedId(null);

        setToast({
            type: "success",
            message: "Product updated successfully.",
        });
    } catch (error) {
        console.error("Error updating product:", error);

        setToast({
            type: "warning",
            message:
                error.message ||
                "Unable to update product.",
        });
    }
};

  // TODO: call your API (e.g. DELETE /dashboard/products/:id).
  const handleRemoveProduct = async (id) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/dashboard/products/${id}`,
            {
                method: "DELETE",
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message || "Failed to delete product"
            );
        }

        if (result.action === "deleted") {
            setProducts((current) =>
                current.filter((product) => product.id !== id)
            );

            setToast({
                type: "success",
                message: "Product deleted successfully.",
            });
        }

        if (result.action === "deactivated") {
            setProducts((current) =>
                current.map((product) =>
                    product.id === id
                        ? {
                              ...product,
                              is_active: false,
                          }
                        : product
                )
            );

            setToast({
                type: "info",
                message:
                    "This product has existing orders, so it was deactivated instead of deleted.",
            });
        }

        if (expandedId === id) {
            setExpandedId(null);
        }
    } catch (error) {
        console.error("Error deleting product:", error);

        setToast({
            type: "warning",
            message:
                error.message || "Unable to remove product.",
        });
    }
};

  // TODO: call your API (e.g. POST /dashboard/products) then update state from the response.
  const handleCreateProduct = async (newFields) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/dashboard/products`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newFields),
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message || "Failed to create product"
            );
        }

        setProducts((current) => [
            result.data,
            ...current,
        ]);

        setAddOpen(false);

    } catch (error) {
        console.error("Error creating product:", error);
        setError("Unable to create product.");
    }
};

//handling the toast alert :
useEffect(() => {
    if (!toast) {
        return;
    }

    const timer = setTimeout(() => {
        setToast(null);
    }, 4000);

    return () => clearTimeout(timer);
}, [toast]);

  return (
    <section className={styles.Products}>
      <div className={styles.Products__Header}>
        <div>
          <p className={styles.Products__Eyebrow}>Catalog management</p>
          <h1>Products</h1>
          <p>Manage the products in your store.</p>
        </div>

        <button className={styles.Products__AddButton} onClick={() => setAddOpen(true)}>
          <Plus size={18} />
          <span>Add Product</span>
        </button>
      </div>

      <div className={styles.Products__StatsWrap}>
        <ProductStats products={products} />
      </div>

      <div className={styles.Products__TableCard}>
        <ProductToolbar
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          brand={brand}
          setBrand={setBrand}
          status={status}
          setStatus={setStatus}
          categories={categoryOptions}
          brands={brandOptions}
        />

        <div className={styles.Products__TableWrap}>
          <Table className={styles.Products__Table}>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Active</TableHead>
                <TableHead aria-label="Actions" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className={styles.Products__Loading}>
                    Loading products...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} className={styles.Products__Empty}>
                    {error}
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
  <TableRow>
    <TableCell
      colSpan={6}
      className={styles.Products__Empty}
    >
      No products yet.
    </TableCell>
  </TableRow>
) : filteredProducts.length === 0 ? (
  <TableRow>
    <TableCell
      colSpan={6}
      className={styles.Products__Empty}
    >
      No products match your filters.
    </TableCell>
  </TableRow>
) : (
                filteredProducts.map((product) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    isExpanded={expandedId === product.id}
                    onToggleExpand={() => setExpandedId(expandedId === product.id ? null : product.id)}
                    onToggleActive={handleToggleActive}
                    onSave={handleSaveProduct}
                    onRemove={handleRemoveProduct}
                    categoryOptions={categoryOptions}
                    brandOptions={brandOptions}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className={styles.Products__Footer}>
          <span>Showing {products.length} products</span>

          <Pagination page={page} pageCount={1} onPageChange={setPage} />

          <span>Updated just now</span>
        </div>
      </div>

      {addOpen && (
        <AddProductModal
          categoryOptions={categoryOptions}
          brandOptions={brandOptions}
          onClose={() => setAddOpen(false)}
          onCreate={handleCreateProduct}
        />
      )}
{toast && (
    <Toast
        type={toast.type}
        message={toast.message}
        onClose={() => setToast(null)}
    />
)}

    </section>
  );
}
