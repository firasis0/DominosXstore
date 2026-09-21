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

import BrandStats from "./BrandStats";
import BrandToolbar from "./BrandToolbar";
import BrandRow from "./BrandRow";
import BrandModal from "./BrandModal";
import BrandDeactivateDialog from "./BrandDeactivateDialog";
import BrandDeleteDialog from "./BrandDeleteDialog";
import SortableTableHead from "../SortableTableHead";

import { authFetch } from "../../../lib/authFetch";

import styles from "./styles.module.scss";

const Brands = () => {
  const [brands, setBrands] = useState([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);

  const [deactivateBrand, setDeactivateBrand] = useState(null);
  const [deleteBrand, setDeleteBrand] = useState(null);

  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await authFetch(
          "/dashboard/brands"
        );

        if (!response.ok) {
          throw new Error(
            `Response returned Status ${response.status}`
          );
        }

        const result = await response.json();

        if (result.success) {
          setBrands(result.data);
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    };

    fetchBrands();
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

  const filteredBrands = useMemo(() => {
    const filtered = brands.filter((brand) => {
      const matchesSearch = brand.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        status === "all" ||
        (status === "active" && brand.is_active) ||
        (status === "inactive" && !brand.is_active);

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
  }, [brands, search, status, sortConfig]);

  const handleAdd = () => {
    setEditingBrand(null);
    setModalOpen(true);
  };

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setModalOpen(true);
  };

  const handleSave = async (brandData) => {
    let imageUrl = editingBrand
      ? editingBrand.image_url
      : null;

    try {
      // Upload a new image if one was selected
      if (brandData.image_file) {
        const formData = new FormData();

        formData.append(
          "image",
          brandData.image_file
        );

        const imageResponse = await authFetch(
          "/dashboard/brands/images",
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

      // Add or edit brand
      const url = editingBrand
        ? `/dashboard/brands/${editingBrand.id}`
        : "/dashboard/brands";

      const method = editingBrand
        ? "PATCH"
        : "POST";

      const response = await authFetch(url, {
        method,
        body: JSON.stringify({
          name: brandData.name,
          image_url: imageUrl,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message);
      }

      // Update local brands state
      if (editingBrand) {
        setBrands((current) =>
          current.map((brand) =>
            brand.id === result.data.id
              ? result.data
              : brand
          )
        );
      } else {
        setBrands((current) => [
          result.data,
          ...current,
        ]);
      }

      setToast({
        type: "success",
        message: editingBrand
          ? "Brand updated successfully."
          : "Brand added successfully.",
      });

      setModalOpen(false);
      setEditingBrand(null);
    } catch (error) {
      setToast({
        type: "error",
        message: error.message,
      });
    }
  };

  const handleActivate = async (brand) => {
    try {
      const response = await authFetch(
        `/dashboard/brands/${brand.id}/toggle`,
        {
          method: "PATCH",
          body: JSON.stringify({
            is_active: true,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Error activating brand: ${response.status}`
        );
      }

      const result = await response.json();

      if (result.success) {
        setBrands((current) =>
          current.map((item) =>
            item.id === brand.id
              ? {
                  ...item,
                  is_active: true,
                }
              : item
          )
        );

        setToast({
          type: "success",
          message: `${brand.name} activated successfully.`,
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error(
        `Error activating the brand: ${error}`
      );

      setToast({
        type: "error",
        message: error.message,
      });
    }
  };

  const handleDeactivateRequest = (brand) => {
    setDeactivateBrand(brand);
  };

  const handleDeactivateConfirm = async () => {
    if (!deactivateBrand) return;

    try {
      const response = await authFetch(
        `/dashboard/brands/${deactivateBrand.id}/toggle`,
        {
          method: "PATCH",
          body: JSON.stringify({
            is_active: false,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Error deactivating brand: ${response.status}`
        );
      }

      const result = await response.json();

      if (result.success) {
        setBrands((current) =>
          current.map((item) =>
            item.id === deactivateBrand.id
              ? {
                  ...item,
                  is_active: false,
                  active_product_count: 0,
                }
              : item
          )
        );

        setDeactivateBrand(null);

        setToast({
          type: "success",
          message: "Brand deactivated successfully.",
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error(
        `Error deactivating the brand: ${error}`
      );

      setToast({
        type: "error",
        message: error.message,
      });
    }
  };

  const handleDeleteRequest = (brand) => {
    setDeleteBrand(brand);
  };

  const handleDelete = async (brand) => {
    try {
      const response = await authFetch(
        `/dashboard/brands/${brand.id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message);
      }

      setBrands((current) =>
        current.filter(
          (item) => item.id !== brand.id
        )
      );

      setToast({
        type: "success",
        message: "Brand deleted successfully.",
      });

      setDeleteBrand(null);
    } catch (error) {
      setToast({
        type: "error",
        message: error.message,
      });
    }
  };

  return (
    <section className={styles.Brands}>
      <div className={styles.Brands__Header}>
        <div>
          <p className={styles.Brands__Eyebrow}>
            Catalog management
          </p>

          <h1>Brands</h1>

          <p>
            Organize and manage the brands in your store.
          </p>
        </div>

        <button
          className={styles.Brands__AddButton}
          onClick={handleAdd}
        >
          <Plus size={18} />
          <span>Add Brand</span>
        </button>
      </div>

      <div className={styles.Brands__StatsWrap}>
        <BrandStats brands={brands} />
      </div>

      <div className={styles.Brands__TableCard}>
        <BrandToolbar
          search={search}
          setSearch={setSearch}
          status={status}
          setStatus={setStatus}
        />

        <div className={styles.Brands__TableWrap}>
          <Table className={styles.Brands__Table}>
            <TableHeader>
              <TableRow>
                <SortableTableHead
                  label="Brand"
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
                  className={styles.Brands__ActionsHead}
                >
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredBrands.length > 0 ? (
                filteredBrands.map((brand) => (
                  <BrandRow
                    key={brand.id}
                    brand={brand}
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
                    className={styles.Brands__Empty}
                  >
                    No brands found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className={styles.Brands__Footer}>
          <span>
            Showing {filteredBrands.length}{" "}
            {filteredBrands.length === 1
              ? "brand"
              : "brands"}
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
        <BrandModal
          brand={editingBrand}
          onClose={() => {
            setModalOpen(false);
            setEditingBrand(null);
          }}
          onSave={handleSave}
        />
      )}

      {deactivateBrand && (
        <BrandDeactivateDialog
          brand={deactivateBrand}
          onCancel={() => setDeactivateBrand(null)}
          onConfirm={handleDeactivateConfirm}
        />
      )}

      {deleteBrand && (
        <BrandDeleteDialog
          brand={deleteBrand}
          onCancel={() => setDeleteBrand(null)}
          onConfirm={() => handleDelete(deleteBrand)}
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

export default Brands;