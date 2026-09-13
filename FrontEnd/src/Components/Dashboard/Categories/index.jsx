import { useMemo, useState, useEffect } from "react";
import { Plus } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/Components/ui/table";

import { Pagination } from "@/Components/ui/pagination";
import Toast from "@/Components/ui/toast";

import CategoryStats from "./CategoryStats";
import CategoryToolbar from "./CategoryToolbar";
import CategoryRow from "./CategoryRow";
import CategoryModal from "./CategoryModal";
import CategoryDeactivateDialog from "./CategoryDeactivateDialog";

import styles from "./styles.module.scss";



const Categories = () => {
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [deactivateCategory, setDeactivateCategory] = useState(null);

  const [toast, setToast] = useState(null);
  const API_BASE_URL=import.meta.env.VITE_API_BASE_URL;
  
  //Fetch Categories :  
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

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const matchesSearch = category.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        status === "all" ||
        (status === "active" && category.is_active) ||
        (status === "inactive" && !category.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [categories, search, status]);

  const handleAdd = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const handleSave = (categoryData) => {
    if (editingCategory) {
      setCategories((current) =>
        current.map((category) =>
          category.id === editingCategory.id
            ? {
                ...category,
                ...categoryData
              }
            : category
        )
      );

      setToast({
        type: "success",
        message: "Category updated successfully."
      });
    } else {
      const newCategory = {
        id: Date.now(),
        name: categoryData.name,
        image_url: categoryData.image_url || "",
        is_active: true,
        product_count: 0,
        active_product_count: 0
      };

      setCategories((current) => [newCategory, ...current]);

      setToast({
        type: "success",
        message: "Category created successfully."
      });
    }

    setModalOpen(false);
    setEditingCategory(null);
  };

  const handleActivate = (category) => {
    setCategories((current) =>
      current.map((item) =>
        item.id === category.id
          ? {
              ...item,
              is_active: true
            }
          : item
      )
    );

    setToast({
      type: "success",
      message: `${category.name} activated successfully.`
    });
  };

  const handleDeactivateRequest = (category) => {
    setDeactivateCategory(category);
  };

  const handleDeactivateConfirm = () => {
    if (!deactivateCategory) return;

    const affectedProducts =
      deactivateCategory.active_product_count;

    setCategories((current) =>
      current.map((category) =>
        category.id === deactivateCategory.id
          ? {
              ...category,
              is_active: false,
              active_product_count: 0
            }
          : category
      )
    );

    setDeactivateCategory(null);

    setToast({
      type: "success",
      message:
        affectedProducts > 0
          ? `${deactivateCategory.name} and ${affectedProducts} active ${
              affectedProducts === 1 ? "product" : "products"
            } were deactivated.`
          : `${deactivateCategory.name} was deactivated successfully.`
    });
  };

  return (
    <section className={styles.Categories}>
      <div className={styles.Categories__Header}>
        <div>
          <p className={styles.Categories__Eyebrow}>
            Catalog management
          </p>

          <h1>Categories</h1>

          <p>
            Organize and manage the categories in your store.
          </p>
        </div>

        <button
          className={styles.Categories__AddButton}
          onClick={handleAdd}
        >
          <Plus size={18} />
          <span>Add Category</span>
        </button>
      </div>

      <div className={styles.Categories__StatsWrap}>
        <CategoryStats categories={categories} />
      </div>

      <div className={styles.Categories__TableCard}>
        <CategoryToolbar
          search={search}
          setSearch={setSearch}
          status={status}
          setStatus={setStatus}
        />

        <div className={styles.Categories__TableWrap}>
          <Table className={styles.Categories__Table}>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className={styles.Categories__ActionsHead}>
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <CategoryRow
                    key={category.id}
                    category={category}
                    onEdit={handleEdit}
                    onActivate={handleActivate}
                    onDeactivate={handleDeactivateRequest}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className={styles.Categories__Empty}
                  >
                    No categories found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className={styles.Categories__Footer}>
          <span>
            Showing {filteredCategories.length}{" "}
            {filteredCategories.length === 1
              ? "category"
              : "categories"}
          </span>

          <Pagination
            page={page}
            pageCount={1}
            onPageChange={setPage}
          />

          <span>Updated just now</span>
        </div>
      </div>

      {modalOpen && (
        <CategoryModal
          category={editingCategory}
          onClose={() => {
            setModalOpen(false);
            setEditingCategory(null);
          }}
          onSave={handleSave}
        />
      )}

      {deactivateCategory && (
        <CategoryDeactivateDialog
          category={deactivateCategory}
          onCancel={() => setDeactivateCategory(null)}
          onConfirm={handleDeactivateConfirm}
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
};

export default Categories;