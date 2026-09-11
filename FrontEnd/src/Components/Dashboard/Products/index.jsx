import { Fragment, useEffect, useMemo, useState } from "react";
import { ChevronDown, Plus, Trash2, X } from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Switch } from "@/Components/ui/switch";
import { Pagination } from "@/Components/ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/Components/ui/alert-dialog";

import ProductStats from "./ProductStats";
import ProductToolbar from "./ProductToolbar";
import ImageUploader from "./ImageUploader";
import styles from "./styles.module.scss";

const formatPrice = (price) => `${Number(price).toLocaleString("fr-DZ")} DA`;

const toImageObjects = (urls) =>
  (urls ?? []).map((url, index) => ({ id: `img-${index}-${url}`, url }));

const emptyForm = () => ({
  name: "",
  description: "",
  price: "",
  discount_price: "",
  category_id: "",
  brand_id: "",
  stock: "",
  is_on_sale: false,
  is_active: true,
  images: [],
});

const toDraft = (product) => ({
  name: product.name,
  description: product.description ?? "",
  price: product.price,
  discount_price: product.discount_price ?? "",
  category_id: String(product.category_id),
  brand_id: String(product.brand_id),
  stock: product.stock,
  is_on_sale: product.is_on_sale,
  is_active: product.is_active,
  images: toImageObjects(product.images),
});

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [status, setStatus] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [newProduct, setNewProduct] = useState(emptyForm);
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);
  const [draft, setDraft] = useState(emptyForm);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProducts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/dashboard/products`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Server returned status ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || "Failed to fetch products");
        }

        setProducts(result.data ?? []);
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          console.error("Error fetching dashboard products:", fetchError);
          setError("Unable to load products.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => controller.abort();
  }, []);

  const categoryOptions = useMemo(
    () => Array.from(new Map(products.map((product) => [product.category_id, { id: product.category_id, name: product.category_name }])).values()),
    [products]
  );
  const brandOptions = useMemo(
    () => Array.from(new Map(products.map((product) => [product.brand_id, { id: product.brand_id, name: product.brand_name }])).values()),
    [products]
  );

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = !category || String(product.category_id) === category;
        const matchesBrand = !brand || String(product.brand_id) === brand;
        const matchesStatus =
          !status ||
          (status === "active" && product.is_active) ||
          (status === "inactive" && !product.is_active) ||
          (status === "out-of-stock" && product.stock === 0);

        return matchesSearch && matchesCategory && matchesBrand && matchesStatus;
      }),
    [products, search, category, brand, status]
  );

  const toggleActive = (id, checked) => {
    setProducts((current) =>
      current.map((product) => (product.id === id ? { ...product, is_active: checked } : product))
    );
  };

  const toggleExpand = (product) => {
    if (expandedId === product.id) {
      setExpandedId(null);
      return;
    }

    setDraft(toDraft(product));
    setExpandedId(product.id);
  };

  const saveDraft = (id) => {
    setProducts((current) =>
      current.map((product) =>
        product.id === id
          ? {
              ...product,
              name: draft.name,
              description: draft.description,
              price: Number(draft.price),
              discount_price: draft.discount_price === "" ? null : Number(draft.discount_price),
              category_id: Number(draft.category_id),
              brand_id: Number(draft.brand_id),
              stock: Number(draft.stock),
              is_on_sale: draft.is_on_sale,
              is_active: draft.is_active,
              images: draft.images.map((image) => image.url),
            }
          : product
      )
    );

    setExpandedId(null);
  };

  const removeProduct = (id) => {
    setProducts((current) => current.filter((product) => product.id !== id));

    if (expandedId === id) {
      setExpandedId(null);
    }
  };

  const openAddModal = () => {
    setNewProduct(emptyForm());
    setAddOpen(true);
  };

  const createProduct = () => {
    const nextId = products.reduce((max, product) => Math.max(max, product.id), 0) + 1;

    setProducts((current) => [
      {
        id: nextId,
        name: newProduct.name,
        description: newProduct.description,
        price: Number(newProduct.price) || 0,
        discount_price: newProduct.discount_price === "" ? null : Number(newProduct.discount_price),
        category_id: Number(newProduct.category_id),
        brand_id: Number(newProduct.brand_id),
        stock: Number(newProduct.stock) || 0,
        is_on_sale: newProduct.is_on_sale,
        is_active: newProduct.is_active,
        created_at: new Date().toISOString(),
        images: newProduct.images.map((image) => image.url),
      },
      ...current,
    ]);

    setAddOpen(false);
  };

  return (
    <section className={styles.Products}>
      <div className={styles.Products__Header}>
        <div>
          <p className={styles.Products__Eyebrow}>Catalog management</p>
          <h1>Products</h1>
          <p>Manage the products in your store.</p>
        </div>

        <button className={styles.Products__AddButton} onClick={openAddModal}>
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
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className={styles.Products__Empty}>
                    No products match these filters.
                  </TableCell>
                </TableRow>
              ) : filteredProducts.map((product) => {
                const isExpanded = expandedId === product.id;

                return (
                  <Fragment key={product.id}>
                    {/* Row */}
                    <TableRow className={isExpanded ? styles.Products__RowExpanded : undefined}>
                      <TableCell>
                        <div className={styles.Products__Product}>
                          <div className={styles.Products__Image}>
                            <img src={product.images?.[0]} alt="" />
                          </div>

                          <div>
                            <strong>{product.name}</strong>
                            <span>
                              SKU-{String(product.id).padStart(4, "0")} · {product.brand_name || "No brand"}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>{product.category_name || "Uncategorized"}</TableCell>

                      <TableCell>
                        <div className={styles.Products__Price}>
                          <strong>{formatPrice(product.discount_price || product.price)}</strong>
                          {product.discount_price != null && <del>{formatPrice(product.price)}</del>}
                          {product.is_on_sale && <span className={styles.Products__SaleTag}>Sale</span>}
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className={product.stock <= 5 ? styles.StockLow : styles.Stock}>
                          {product.stock} {product.stock === 1 ? "unit" : "units"}
                        </span>
                      </TableCell>

                      <TableCell>
                        <Switch
                          checked={product.is_active}
                          onCheckedChange={(checked) => toggleActive(product.id, checked)}
                          aria-label={`${product.is_active ? "Deactivate" : "Activate"} ${product.name}`}
                        />
                      </TableCell>

                      <TableCell>
                        <div className={styles.Products__Actions}>
                          <button
                            type="button"
                            className={styles.Products__Edit}
                            onClick={() => toggleExpand(product)}
                            aria-label={`${isExpanded ? "Close" : "Edit"} ${product.name}`}
                            aria-expanded={isExpanded}
                          >
                            <ChevronDown size={16} className={isExpanded ? styles.Products__ChevronOpen : undefined} />
                            <span>Edit</span>
                          </button>

                          <AlertDialog>
                            <AlertDialogTrigger className={styles.Products__Delete} aria-label={`Remove ${product.name}`}>
                              <Trash2 size={16} />
                            </AlertDialogTrigger>

                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove this product?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  "{product.name}" will be removed from the catalog. This can't be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>

                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => removeProduct(product.id)}>
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Expanded edit panel */}
                    {isExpanded && (
                      <TableRow className={styles.Products__EditRow}>
                        <TableCell colSpan={6}>
                          <div className={styles.Products__EditPanel}>
                            <div className={styles.Products__EditField}>
                              <span>Photos</span>
                              <ImageUploader
                                images={draft.images}
                                onChange={(updater) =>
                                  setDraft((current) => ({ ...current, images: updater(current.images) }))
                                }
                                inputId={`edit-images-${product.id}`}
                              />
                            </div>

                            <div className={styles.Products__EditGrid}>
                              <label>
                                Product name
                                <input
                                  value={draft.name}
                                  onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                                />
                              </label>

                              <label>
                                Brand
                                <select
                                  value={draft.brand_id}
                                  onChange={(event) => setDraft((current) => ({ ...current, brand_id: event.target.value }))}
                                >
                                  {brandOptions.map((item) => (
                                    <option key={item.id} value={item.id}>
                                      {item.name}
                                    </option>
                                  ))}
                                </select>
                              </label>

                              <label>
                                Category
                                <select
                                  value={draft.category_id}
                                  onChange={(event) => setDraft((current) => ({ ...current, category_id: event.target.value }))}
                                >
                                  {categoryOptions.map((item) => (
                                    <option key={item.id} value={item.id}>
                                      {item.name}
                                    </option>
                                  ))}
                                </select>
                              </label>

                              <label>
                                Stock
                                <input
                                  type="number"
                                  min="0"
                                  value={draft.stock}
                                  onChange={(event) => setDraft((current) => ({ ...current, stock: event.target.value }))}
                                />
                              </label>

                              <label>
                                Price (DA)
                                <input
                                  type="number"
                                  min="0"
                                  value={draft.price}
                                  onChange={(event) => setDraft((current) => ({ ...current, price: event.target.value }))}
                                />
                              </label>

                              <label>
                                Discount price (DA)
                                <input
                                  type="number"
                                  min="0"
                                  placeholder="No discount"
                                  value={draft.discount_price}
                                  onChange={(event) => setDraft((current) => ({ ...current, discount_price: event.target.value }))}
                                />
                              </label>

                              <label className={styles.Products__EditSwitch}>
                                On sale
                                <Switch
                                  checked={draft.is_on_sale}
                                  onCheckedChange={(checked) => setDraft((current) => ({ ...current, is_on_sale: checked }))}
                                  aria-label="Toggle on sale"
                                />
                              </label>

                              <label className={styles.Products__EditSwitch}>
                                Active
                                <Switch
                                  checked={draft.is_active}
                                  onCheckedChange={(checked) => setDraft((current) => ({ ...current, is_active: checked }))}
                                  aria-label="Toggle active"
                                />
                              </label>

                              <label className={styles.Products__EditReadOnly}>
                                SKU / created
                                <span>
                                  SKU-{String(product.id).padStart(4, "0")} ·{" "}
                                  {new Date(product.created_at).toLocaleDateString("fr-DZ")}
                                </span>
                              </label>

                              <label className={styles.Products__EditDescription}>
                                Description
                                <textarea
                                  rows={3}
                                  value={draft.description}
                                  onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                                />
                              </label>
                            </div>

                            <div className={styles.Products__EditActions}>
                              <button type="button" onClick={() => setExpandedId(null)}>
                                Cancel
                              </button>

                              <button type="button" className={styles.Products__Save} onClick={() => saveDraft(product.id)}>
                                Save changes
                              </button>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>

          {!filteredProducts.length && <div className={styles.Products__Empty}>No products match these filters.</div>}
        </div>

        <div className={styles.Products__Footer}>
          <span>
            Showing {filteredProducts.length} of {products.length} products
          </span>

          <Pagination page={page} pageCount={Math.max(1, Math.ceil(filteredProducts.length / 10))} onPageChange={setPage} />

          <span>Updated just now</span>
        </div>
      </div>

      {addOpen && (
        <div className={styles.Products__ModalOverlay} onClick={() => setAddOpen(false)}>
          <div className={styles.Products__Modal} onClick={(event) => event.stopPropagation()}>
            <div className={styles.Products__ModalHeader}>
              <div>
                <span>Catalog</span>
                <h2>Add product</h2>
              </div>

              <button onClick={() => setAddOpen(false)} aria-label="Close add product dialog">
                <X size={18} />
              </button>
            </div>

            <div className={styles.Products__ModalBody}>
              <div className={styles.Products__EditField}>
                <span>Photos</span>
                <ImageUploader
                  images={newProduct.images}
                  onChange={(updater) =>
                    setNewProduct((current) => ({ ...current, images: updater(current.images) }))
                  }
                  inputId="new-product-images"
                />
              </div>

              <div className={styles.Products__FormGrid}>
                <label>
                  Product name
                  <input
                    placeholder="e.g. Wireless gaming mouse"
                    value={newProduct.name}
                    onChange={(event) => setNewProduct((current) => ({ ...current, name: event.target.value }))}
                  />
                </label>

                <label>
                  Brand
                  <select
                    value={newProduct.brand_id}
                    onChange={(event) => setNewProduct((current) => ({ ...current, brand_id: event.target.value }))}
                  >
                    {brandOptions.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Category
                  <select
                    value={newProduct.category_id}
                    onChange={(event) => setNewProduct((current) => ({ ...current, category_id: event.target.value }))}
                  >
                    {categoryOptions.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Stock
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newProduct.stock}
                    onChange={(event) => setNewProduct((current) => ({ ...current, stock: event.target.value }))}
                  />
                </label>

                <label>
                  Price (DA)
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newProduct.price}
                    onChange={(event) => setNewProduct((current) => ({ ...current, price: event.target.value }))}
                  />
                </label>

                <label>
                  Discount price (DA)
                  <input
                    type="number"
                    min="0"
                    placeholder="No discount"
                    value={newProduct.discount_price}
                    onChange={(event) => setNewProduct((current) => ({ ...current, discount_price: event.target.value }))}
                  />
                </label>

                <label className={styles.Products__EditSwitch}>
                  On sale
                  <Switch
                    checked={newProduct.is_on_sale}
                    onCheckedChange={(checked) => setNewProduct((current) => ({ ...current, is_on_sale: checked }))}
                    aria-label="Toggle on sale"
                  />
                </label>

                <label className={styles.Products__EditSwitch}>
                  Active
                  <Switch
                    checked={newProduct.is_active}
                    onCheckedChange={(checked) => setNewProduct((current) => ({ ...current, is_active: checked }))}
                    aria-label="Toggle active"
                  />
                </label>

                <label className={styles.Products__EditDescription}>
                  Description
                  <textarea
                    rows={3}
                    placeholder="Short product description..."
                    value={newProduct.description}
                    onChange={(event) => setNewProduct((current) => ({ ...current, description: event.target.value }))}
                  />
                </label>
              </div>
            </div>

            <div className={styles.Products__ModalActions}>
              <button onClick={() => setAddOpen(false)}>Cancel</button>
              <button className={styles.Products__Save} onClick={createProduct}>
                Save product
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
