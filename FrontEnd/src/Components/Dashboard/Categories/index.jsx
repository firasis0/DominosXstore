import { useMemo, useState, useEffect } from "react";
import { Plus } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";

import { Pagination } from "@/Components/ui/pagination";
import Toast from "@/Components/ui/toast";

import CategoryStats from "./CategoryStats";
import CategoryToolbar from "./CategoryToolbar";
import CategoryRow from "./CategoryRow";
import CategoryModal from "./CategoryModal";
import CategoryDeactivateDialog from "./CategoryDeactivateDialog";
import CategoryDeleteDialog from "./CategoryDeleteDialog";
import SortableTableHead from "../SortableTableHead";

import { authFetch } from "../../../lib/authFetch";

import styles from "./styles.module.scss";

const Categories = () => {
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [deactivateCategory, setDeactivateCategory] = useState(null);
  const [deleteCategory, setDeleteCategory] = useState(null);

  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await authFetch(
          "/dashboard/categories"
        );

        if (!response.ok) {
          throw new Error(
            `Response returned Status ${response.status}`
          );
        }

        const result = await response.json();

        if (result.success) {
          setCategories(result.data);
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        console.error(
          "Error fetching categories:",
          error
        );
      }
    };

    fetchCategories();
  }, []);

  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key &&
        current.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  const filteredCategories = useMemo(() => {
    const filtered = categories.filter((category) => {
      const matchesSearch = category.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        status === "all" ||
        (status === "active" && category.is_active) ||
        (status === "inactive" && !category.is_active);

      return matchesSearch && matchesStatus;
    });

    if (!sortConfig.key) return filtered;

    return [...filtered].sort((left, right) => {
      const leftValue = left[sortConfig.key];
      const rightValue = right[sortConfig.key];

      const comparison =
        typeof leftValue === "string"
          ? leftValue.localeCompare(rightValue)
          : Number(leftValue || 0) -
            Number(rightValue || 0);

      return sortConfig.direction === "asc"
        ? comparison
        : -comparison;
    });
  }, [categories, search, status, sortConfig]);

  const handleAdd = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const handleSave = async (categoryData) => {
    let imageUrl = editingCategory
      ? editingCategory.image_url
      : null;

    try {
      if (categoryData.image_file) {
        const formData = new FormData();

        formData.append(
          "image",
          categoryData.image_file
        );

        const imageResponse = await authFetch(
          "/dashboard/categories/images",
          {
            method: "POST",
            body: formData,
          }
        );

        const imageResult =
          await imageResponse.json();

        if (
          !imageResponse.ok ||
          !imageResult.success
        ) {
          throw new Error(imageResult.message);
        }

        imageUrl = imageResult.data.url;
      }

      const url = editingCategory
        ? `/dashboard/categories/${editingCategory.id}`
        : "/dashboard/categories";

      const method = editingCategory
        ? "PATCH"
        : "POST";

      const response = await authFetch(url, {
        method,
        body: JSON.stringify({
          name: categoryData.name,
          image_url: imageUrl,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message);
      }

      if (editingCategory) {
        setCategories((current) =>
          current.map((category) =>
            category.id === result.data.id
              ? result.data
              : category
          )
        );
      } else {
        setCategories((current) => [
          result.data,
          ...current,
        ]);
      }

      setToast({
        type: "success",
        message: editingCategory
          ? "Category updated successfully."
          : "Category added successfully.",
      });

      setModalOpen(false);
      setEditingCategory(null);
    } catch (error) {
      setToast({
        type: "error",
        message: error.message,
      });
    }
  };

  const handleActivate = async (category) => {
    try {
      const response = await authFetch(
        `/dashboard/categories/${category.id}/toggle`,
        {
          method: "PATCH",
          body: JSON.stringify({
            is_active: true,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Error activating category: ${response.status}`
        );
      }

      const result = await response.json();

      if (result.success) {
        setCategories((current) =>
          current.map((item) =>
            item.id === category.id
              ? {
                  ...item,
                  is_active: true,
                }
              : item
          )
        );

        setToast({
          type: "success",
          message: `${category.name} activated successfully.`,
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error(
        `Error activating the category: ${error}`
      );

      setToast({
        type: "error",
        message: error.message,
      });
    }
  };

  const handleDeactivateRequest = (category) => {
    setDeactivateCategory(category);
  };

  const handleDeactivateConfirm = async () => {
    if (!deactivateCategory) return;

    try {
      const response = await authFetch(
        `/dashboard/categories/${deactivateCategory.id}/toggle`,
        {
          method: "PATCH",
          body: JSON.stringify({
            is_active: false,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Error deactivating category: ${response.status}`
        );
      }

      const result = await response.json();

      if (result.success) {
        setCategories((current) =>
          current.map((item) =>
            item.id === deactivateCategory.id
              ? {
                  ...item,
                  is_active: false,
                  active_product_count: 0,
                }
              : item
          )
        );

        setDeactivateCategory(null);

        setToast({
          type: "success",
          message:
            "Category deactivated successfully.",
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error(
        `Error deactivating the category: ${error}`
      );

      setToast({
        type: "error",
        message: error.message,
      });
    }
  };

  const handleDeleteRequest = (category) => {
    setDeleteCategory(category);
  };

  const handleDelete = async (category) => {
    try {
      const response = await authFetch(
        `/dashboard/categories/${category.id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message);
      }

      setCategories((current) =>
        current.filter(
          (item) => item.id !== category.id
        )
      );

      setToast({
        type: "success",
        message: "Category deleted successfully.",
      });

      setDeleteCategory(null);
    } catch (error) {
      setToast({
        type: "error",
        message: error.message,
      });
    }
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
            Organize and manage the categories in your
            store.
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
                <SortableTableHead
                  label="Category"
                  sortKey="name"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />

                <SortableTableHead
                  label="Products"
                  sortKey="product_count"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />

                <SortableTableHead
                  label="Status"
                  sortKey="is_active"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />

                <TableHead
                  className={
                    styles.Categories__ActionsHead
                  }
                >
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
                    onDeactivate={
                      handleDeactivateRequest
                    }
                    onDelete={handleDeleteRequest}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className={
                      styles.Categories__Empty
                    }
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

      {deleteCategory && (
        <CategoryDeleteDialog
          category={deleteCategory}
          onCancel={() => setDeleteCategory(null)}
          onConfirm={() =>
            handleDelete(deleteCategory)
          }
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