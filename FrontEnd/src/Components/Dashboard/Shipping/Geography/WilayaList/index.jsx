import {
  ChevronDown,
  ChevronRight,
  Edit3,
  MapPin,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import MunicipalityList from "../MunicipalityList";
import styles from "./styles.module.scss";

const WilayaList = ({
  provinces,
  municipalities,
  onAddWilaya,
  onAddMunicipality,
  onEditWilaya,
  onRemoveWilaya,
  onEditMunicipality,
  onRemoveMunicipality,
}) => {
  const [open, setOpen] = useState({});
  const [search, setSearch] = useState("");

  const toggle = (id) => {
    setOpen((current) => ({
      ...current,
      [id]: !current[id],
    }));
  };

  /* =======================================================
     SEARCH
  ======================================================= */

  const filteredProvinces = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return provinces;
    }

    return provinces.filter((province) => {
      /* Match Wilaya name */
      const matchesWilaya =
        province.name
          ?.toLowerCase()
          .includes(query);

      /* Match municipality name */
      const provinceMunicipalities =
        municipalities.filter(
          (municipality) =>
            municipality.province_id ===
            province.id
        );

      const matchesMunicipality =
        provinceMunicipalities.some(
          (municipality) =>
            municipality.commune_name
              ?.toLowerCase()
              .includes(query)
        );

      return (
        matchesWilaya ||
        matchesMunicipality
      );
    });
  }, [
    provinces,
    municipalities,
    search,
  ]);

  /* =======================================================
     AUTOMATICALLY OPEN SEARCH RESULTS
  ======================================================= */

  const getMunicipalities = (province) =>
    municipalities.filter(
      (municipality) =>
        municipality.province_id ===
        province.id
    );

  return (
    <div className={styles.wrap}>
      {/* =================================================
          HEADER
      ================================================= */}

      <div className={styles.head}>
        <div className={styles.headContent}>
          <h2>Geography</h2>

          <p>
            Manage the global Wilaya and
            municipality hierarchy used by
            shipping.
          </p>
        </div>

        <div className={styles.headActions}>
          <button
            type="button"
            className={styles.secondary}
            onClick={() =>
              onAddMunicipality(null)
            }
          >
            <Plus size={14} />

            <span>
              Add Municipality
            </span>
          </button>

          <button
            type="button"
            className={styles.primary}
            onClick={onAddWilaya}
          >
            <Plus size={14} />

            <span>Add Wilaya</span>
          </button>
        </div>
      </div>

      {/* =================================================
          SEARCH
      ================================================= */}

      <div className={styles.searchWrapper}>
        <Search
          size={16}
          className={styles.searchIcon}
        />

        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search Wilaya or municipality..."
          className={styles.searchInput}
        />

        {search && (
          <button
            type="button"
            className={styles.clearSearch}
            onClick={() =>
              setSearch("")
            }
            aria-label="Clear search"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* =================================================
          RESULTS INFO
      ================================================= */}

      {search && (
        <div className={styles.searchInfo}>
          <span>
            {filteredProvinces.length}{" "}
            {filteredProvinces.length === 1
              ? "Wilaya"
              : "Wilayas"}{" "}
            found
          </span>
        </div>
      )}

      {/* =================================================
          LIST
      ================================================= */}

      <div className={styles.list}>
        {filteredProvinces.length === 0 ? (
          <div className={styles.empty}>
            <span>
              No Wilaya or municipality matches
              your search.
            </span>

            <button
              type="button"
              onClick={() =>
                setSearch("")
              }
            >
              Clear search
            </button>
          </div>
        ) : (
          filteredProvinces.map(
            (province) => {
              const provinceMunicipalities =
                getMunicipalities(
                  province
                );

              /*
               * If searching and a municipality
               * matches, automatically show the
               * Wilaya's municipalities.
               */
              const query = search
                .trim()
                .toLowerCase();

              const hasMatchingMunicipality =
                query &&
                provinceMunicipalities.some(
                  (municipality) =>
                    municipality.commune_name
                      ?.toLowerCase()
                      .includes(query)
                );

              const isOpen =
                Boolean(
                  open[province.id]
                ) ||
                Boolean(
                  hasMatchingMunicipality
                );

              return (
                <div
                  className={`${styles.item} ${
                    isOpen
                      ? styles.itemOpen
                      : ""
                  }`}
                  key={province.id}
                >
                  {/* =====================================
                      WILAYA ROW
                  ===================================== */}

                  <div
                    className={styles.row}
                    onClick={() =>
                      toggle(
                        province.id
                      )
                    }
                  >
                    <div
                      className={
                        styles.rowLeft
                      }
                    >
                      <button
                        type="button"
                        className={
                          styles.chev
                        }
                        onClick={(
                          event
                        ) => {
                          event.stopPropagation();

                          toggle(
                            province.id
                          );
                        }}
                        aria-label={
                          isOpen
                            ? `Collapse ${province.name}`
                            : `Expand ${province.name}`
                        }
                      >
                        {isOpen ? (
                          <ChevronDown
                            size={16}
                          />
                        ) : (
                          <ChevronRight
                            size={16}
                          />
                        )}
                      </button>

                      <div
                        className={
                          styles.locationIcon
                        }
                      >
                        <MapPin
                          size={15}
                        />
                      </div>

                      <div
                        className={
                          styles.wilayaInfo
                        }
                      >
                        <strong>
                          {
                            province.name
                          }
                        </strong>

                        <span>
                          {
                            provinceMunicipalities.length
                          }{" "}
                          {provinceMunicipalities.length ===
                          1
                            ? "municipality"
                            : "municipalities"}
                        </span>
                      </div>
                    </div>

                    {/* =================================
                        WILAYA ACTIONS
                    ================================= */}

                    <div
                      className={
                        styles.wilayaActions
                      }
                    >
                      <button
                        type="button"
                        className={
                          styles.editWilaya
                        }
                        onClick={(
                          event
                        ) => {
                          event.stopPropagation();

                          onEditWilaya(
                            province
                          );
                        }}
                        aria-label={`Edit ${province.name}`}
                      >
                        <Edit3
                          size={14}
                        />
                      </button>

                      <button
                        type="button"
                        className={
                          styles.removeWilaya
                        }
                        onClick={(
                          event
                        ) => {
                          event.stopPropagation();

                          onRemoveWilaya(
                            province
                          );
                        }}
                        aria-label={`Remove ${province.name}`}
                      >
                        <Trash2
                          size={14}
                        />
                      </button>
                    </div>
                  </div>

                  {/* =====================================
                      MUNICIPALITIES
                  ===================================== */}

                  {isOpen && (
                    <div
                      className={
                        styles.children
                      }
                    >
                      <MunicipalityList
                        province={
                          province
                        }
                        municipalities={
                          provinceMunicipalities
                        }
                        onAdd={
                          onAddMunicipality
                        }
                        onEdit={
                          onEditMunicipality
                        }
                        onRemove={
                          onRemoveMunicipality
                        }
                      />
                    </div>
                  )}
                </div>
              );
            }
          )
        )}
      </div>
    </div>
  );
};

export default WilayaList;