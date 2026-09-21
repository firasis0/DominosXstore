import { useEffect, useMemo, useState } from "react";
import { authFetch } from "../../../lib/authFetch";

import Toast from "@/Components/ui/toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/Components/ui/alert-dialog";

import ProviderCard from "./ProviderCard";
import ProviderStats from "./ProviderStats";
import ProviderToolbar from "./ProviderToolbar";
import ShippingTree from "./ShippingTree";

import ProviderModal from "./ProviderModal";
import PricingModal from "./PricingModal";
import CommuneModal from "./CommuneModal";
import OfficeModal from "./OfficeModal";

import WilayaModal from "./Geography/WilayaModal";
import WilayaList from "./Geography/WilayaList";
import MunicipalityModal from "./Geography/MunicipalityModal";

import MunicipalityPickerModal from "./MunicipalityPickerModal";
import Sidebar from "../Sidebar";

import styles from "./styles.module.scss";

/* =========================================================
   SHIPPING
========================================================= */

const Shipping = () => {
  /* =======================================================
     MAIN VIEW
  ======================================================= */

  const [view, setView] = useState("providers");

  /* =======================================================
     DATA
  ======================================================= */

  const [providers, setProviders] = useState([]);
  const [providersLoading, setProvidersLoading] =
    useState(true);
  const [providersError, setProvidersError] =
    useState("");

  const [provinces, setProvinces] =
    useState([]);

  const [municipalities, setMunicipalities] =
    useState([]);

  const [zones, setZones] = useState([]);
  const [zonesLoading, setZonesLoading] = useState(true);
  const [zonesError, setZonesError] = useState("");

  const [offices, setOffices] = useState([]);
  const [officesLoading, setOfficesLoading] = useState(true);
  const [officesError, setOfficesError] = useState("");

  /* =======================================================
     GEOGRAPHY LOADING
  ======================================================= */

  const [geographyLoading, setGeographyLoading] =
    useState(true);

  const [geographyError, setGeographyError] =
    useState("");

  /* =======================================================
     GEOGRAPHY API
  ======================================================= */

  const geographyApi = async (
    endpoint,
    options = {}
  ) => {
    const response = await authFetch(endpoint, options);

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message ||
          "Something went wrong."
      );
    }

    return result;
  };

  /* =======================================================
     LOAD GEOGRAPHY
  ======================================================= */

  const refreshGeography = async () => {
    try {
      setGeographyError("");

      const result = await geographyApi(
        "/dashboard/shipping/geography"
      );

      setProvinces(
        result.data?.provinces || []
      );

      setMunicipalities(
        result.data?.municipalities || []
      );
    } catch (error) {
      console.error(
        "Error loading geography:",
        error
      );

      setGeographyError(
        error.message ||
          "Unable to load geography."
      );
    }
  };

  /* =======================================================
     LOAD PROVIDERS + GEOGRAPHY
  ======================================================= */

  const refreshProviders = async () => {
    try {
      setProvidersError("");

      const result = await geographyApi(
        "/dashboard/shipping/providers"
      );

      setProviders(result.data || []);
    } catch (error) {
      console.error(
        "Error loading shipping providers:",
        error
      );

      setProvidersError(
        error.message ||
          "Unable to load shipping providers."
      );
    }
  };


  const refreshZones = async () => {
    setZonesLoading(true);

    try {
      setZonesError("");

      const result = await geographyApi(
        "/dashboard/shipping/zones"
      );

      setZones(result.data || []);
    } catch (error) {
      console.error(
        "Error loading shipping zones:",
        error
      );

      setZonesError(
        error.message ||
          "Unable to load shipping zones."
      );
    } finally {
      setZonesLoading(false);
    }
  };

  const refreshOffices = async () => {
    setOfficesLoading(true);

    try {
      setOfficesError("");

      const result = await geographyApi(
        "/dashboard/shipping/offices"
      );

      setOffices(result.data || []);
    } catch (error) {
      console.error(
        "Error loading delivery offices:",
        error
      );

      setOfficesError(
        error.message ||
          "Unable to load delivery offices."
      );
    } finally {
      setOfficesLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setGeographyLoading(true);
        setProvidersLoading(true);

        await Promise.all([
          refreshGeography(),
          refreshProviders(),
          refreshZones(),
          refreshOffices(),
        ]);
      } finally {
        setGeographyLoading(false);
        setProvidersLoading(false);
      }
    };

    loadData();
  }, []);

  /* =======================================================
     PROVIDER FILTERS
  ======================================================= */

  const [search, setSearch] = useState("");
  const [status, setStatus] =
    useState("all");

  /* =======================================================
     SELECTED PROVIDER
  ======================================================= */

  const [selectedProviderId, setSelectedProviderId] =
    useState(null);

  /* =======================================================
     MODALS
  ======================================================= */

  const [providerModal, setProviderModal] =
    useState(null);

  const [wilayaModal, setWilayaModal] =
    useState(null);

  const [pricingModal, setPricingModal] =
    useState(null);

  const [communeModal, setCommuneModal] =
    useState(null);

  const [officeModal, setOfficeModal] =
    useState(null);

  const [
    geoMunicipalityModal,
    setGeoMunicipalityModal,
  ] = useState(null);

  const [
    municipalityPicker,
    setMunicipalityPicker,
  ] = useState(null);
/* =======================================================
     FEEDBACK
  ======================================================= */

  const [toast, setToast] = useState(null);
  const [confirmation, setConfirmation] = useState(null);


useEffect(() => {
  if (!toast) {
    return;
  }

  const timer = setTimeout(() => {
    setToast(null);
  }, 4000);

  return () => clearTimeout(timer);
}, [toast]);

const showSuccess = (message) => {
  setToast({
    type: "success",
    message,
  });
};

const showError = (message) => {
  setToast({
    type: "warning",
    message,
  });
};



  /* =======================================================
     FILTER PROVIDERS
  ======================================================= */

  const filteredProviders = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return providers.filter((provider) => {
      const matchesSearch =
        !query ||
        provider.name
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        status === "all" ||
        (status === "active" &&
          provider.is_active) ||
        (status === "inactive" &&
          !provider.is_active);

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    providers,
    search,
    status,
  ]);

  /* =======================================================
     SELECTED PROVIDER
  ======================================================= */

  const selectedProvider =
    providers.find(
      (item) =>
        item.id === selectedProviderId
    ) || null;

  /* =======================================================
     PROVIDER ZONES
  ======================================================= */

  const providerZones =
    selectedProvider
      ? zones.filter(
          (zone) =>
            zone.provider_id ===
            selectedProvider.id
        )
      : [];

  /* =======================================================
     ASSIGNED MUNICIPALITIES
  ======================================================= */

  const assignedMunicipalityIds = useMemo(() => {
    const ids = providerZones.flatMap((zone) =>
      municipalities
        .filter(
          (municipality) =>
            municipality.province_id === zone.province_id
        )
        .map((municipality) => municipality.id)
    );

    return [...new Set(ids)];
  }, [providerZones, municipalities]);

  /* =======================================================
     OPEN PROVIDER MANAGEMENT
  ======================================================= */

  const openManage = (provider) => {
    setSelectedProviderId(
      provider.id
    );

    setView("manage");
  };

  /* =======================================================
     PROVIDERS API
  ======================================================= */

  const saveProvider = async (payload) => {
    try {
      const isEditing = Boolean(providerModal?.id);

      const result = await geographyApi(
        `/dashboard/shipping/providers${
          isEditing ? `/${providerModal.id}` : ""
        }`,
        {
          method: isEditing ? "PUT" : "POST",
          body: JSON.stringify({
            name: payload.name,
            logo_url: payload.logo_url || null,
          }),
        }
      );

      if (isEditing) {
        setProviders((current) =>
          current.map((provider) =>
            provider.id === result.data.id
              ? {
                  ...provider,
                  ...result.data,
                }
              : provider
          )
        );

        showSuccess(
          "Provider updated successfully."
        );
      } else {
        setProviders((current) => [
          result.data,
          ...current,
        ]);

        showSuccess(
          "Provider added successfully."
        );
      }

      setProviderModal(null);
    } catch (error) {
      console.error(
        "Error saving shipping provider:",
        error
      );

      showError(
        error.message ||
          "Unable to save shipping provider."
      );
    }
  };

  /* =======================================================
     TOGGLE PROVIDER
  ======================================================= */

  const toggleProvider = (id) => {
    const provider = providers.find(
      (item) => item.id === id
    );

    if (!provider) return;

    const nextStatus = !provider.is_active;

    const updateProviderStatus = async () => {
      try {
        const result = await geographyApi(
          `/dashboard/shipping/providers/${id}/toggle`,
          {
            method: "PATCH",
            body: JSON.stringify({
              is_active: nextStatus,
            }),
          }
        );

        setProviders((current) =>
          current.map((item) =>
            item.id === id
              ? {
                  ...item,
                  ...result.data,
                }
              : item
          )
        );

        showSuccess(
          nextStatus
            ? "Provider activated successfully."
            : "Provider deactivated successfully."
        );
      } catch (error) {
        console.error(
          "Error updating provider status:",
          error
        );

        showError(
          error.message ||
            "Unable to update provider status."
        );
      }
    };

    if (provider.is_active) {
      setConfirmation({
        title: "Deactivate provider?",
        description: `Are you sure you want to deactivate ${provider.name}? Existing coverage will remain unchanged.`,
        confirmLabel: "Deactivate",
        variant: "destructive",
        onConfirm: updateProviderStatus,
      });

      return;
    }

    updateProviderStatus();
  };

  /* =======================================================
     REMOVE PROVIDER
  ======================================================= */

  const removeProvider = (provider) => {
    if (!provider) return;

    setConfirmation({
      title: "Remove shipping provider?",
      description: `Are you sure you want to remove "${provider.name}"? This action is only allowed when the provider has no shipping zones.`,
      confirmLabel: "Remove provider",
      variant: "destructive",

      onConfirm: async () => {
        try {
          await geographyApi(
            `/dashboard/shipping/providers/${provider.id}`,
            {
              method: "DELETE",
            }
          );

          setProviders((current) =>
            current.filter(
              (item) => item.id !== provider.id
            )
          );

          if (
            selectedProviderId === provider.id
          ) {
            setSelectedProviderId(null);
            setView("providers");
          }

          showSuccess(
            `${provider.name} was removed successfully.`
          );
        } catch (error) {
          console.error(
            "Error removing shipping provider:",
            error
          );

          showError(
            error.message ||
              "Unable to remove shipping provider."
          );
        }
      },
    });
  };

  /* =======================================================
     TOGGLE SHIPPING ZONE
  ======================================================= */

  const toggleZone = (id) => {
    const zone = zones.find(
      (item) => item.id === id
    );

    if (!zone) return;

    const province = provinces.find(
      (item) => item.id === zone.province_id
    );

    const updateZoneStatus = async () => {
      try {
        const result = await geographyApi(
          `/dashboard/shipping/zones/${id}/toggle`,
          {
            method: "PATCH",
            body: JSON.stringify({
              is_active: !zone.is_active,
            }),
          }
        );

        setZones((items) =>
          items.map((item) =>
            item.id === id
              ? { ...item, ...result.data }
              : item
          )
        );

        showSuccess(
          `${province?.name || "Wilaya"} coverage ${
            result.data.is_active
              ? "activated"
              : "deactivated"
          }.`
        );
      } catch (error) {
        console.error(
          "Error updating shipping zone status:",
          error
        );

        showError(
          error.message ||
            "Unable to update Wilaya coverage."
        );
      }
    };

    if (zone.is_active) {
      setConfirmation({
        title: "Deactivate Wilaya coverage?",
        description: `Are you sure you want to deactivate ${
          province?.name || "this Wilaya"
        } coverage?`,
        confirmLabel: "Deactivate",
        variant: "destructive",
        onConfirm: updateZoneStatus,
      });

      return;
    }

    updateZoneStatus();
  };

  /* =======================================================
     TOGGLE DELIVERY OFFICE
  ======================================================= */

  const toggleOffice = (id) => {
    const office = offices.find(
      (item) => item.id === id
    );

    if (!office) return;

    const updateOfficeStatus = async () => {
      try {
        const result = await geographyApi(
          `/dashboard/shipping/offices/${id}/toggle`,
          {
            method: "PATCH",
            body: JSON.stringify({
              is_active: !office.is_active,
            }),
          }
        );

        setOffices((items) =>
          items.map((item) =>
            item.id === id
              ? { ...item, ...result.data }
              : item
          )
        );

        showSuccess(
          `${office.name} ${
            result.data.is_active
              ? "activated"
              : "deactivated"
          }.`
        );
      } catch (error) {
        console.error(
          "Error updating delivery office status:",
          error
        );

        showError(
          error.message ||
            "Unable to update delivery office."
        );
      }
    };

    if (office.is_active) {
      setConfirmation({
        title: "Deactivate delivery office?",
        description: `Are you sure you want to deactivate ${office.name}?`,
        confirmLabel: "Deactivate",
        variant: "destructive",
        onConfirm: updateOfficeStatus,
      });

      return;
    }

    updateOfficeStatus();
  };

  /* =======================================================
     ADD / EDIT WILAYA COVERAGE
  ======================================================= */

  const saveWilaya = async (payload) => {
    try {
      const zone = wilayaModal?.zone;
      const isEditing = Boolean(zone?.id);

      const result = await geographyApi(
        `/dashboard/shipping/zones${
          isEditing ? `/${zone.id}` : ""
        }`,
        {
          method: isEditing ? "PUT" : "POST",
          body: JSON.stringify({
            provider_id:
              payload.provider_id ||
              wilayaModal?.provider?.id,
            province_id: payload.province_id,
            office_price: Number(
              payload.office_price || 0
            ),
            home_price: Number(
              payload.home_price || 0
            ),
          }),
        }
      );

      if (isEditing) {
        setZones((items) =>
          items.map((item) =>
            item.id === result.data.id
              ? { ...item, ...result.data }
              : item
          )
        );

        showSuccess(
          "Wilaya coverage updated successfully."
        );
      } else {
        setZones((items) => [
          ...items,
          result.data,
        ]);

        showSuccess(
          "Wilaya coverage added successfully."
        );
      }

      setWilayaModal(null);
    } catch (error) {
      console.error(
        "Error saving Wilaya coverage:",
        error
      );

      showError(
        error.message ||
          "Unable to save Wilaya coverage."
      );
    }
  };

  /* =======================================================
     EDIT PRICING
  ======================================================= */

  const savePricing = async (payload) => {
    try {
      const result = await geographyApi(
        `/dashboard/shipping/zones/${payload.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            office_price: Number(
              payload.office_price || 0
            ),
            home_price: Number(
              payload.home_price || 0
            ),
          }),
        }
      );

      setZones((items) =>
        items.map((item) =>
          item.id === result.data.id
            ? { ...item, ...result.data }
            : item
        )
      );

      setPricingModal(null);

      showSuccess(
        "Shipping pricing updated successfully."
      );
    } catch (error) {
      console.error(
        "Error updating shipping pricing:",
        error
      );

      showError(
        error.message ||
          "Unable to update shipping pricing."
      );
    }
  };

  /* =======================================================
     PROVIDER MUNICIPALITY
  ======================================================= */

  const saveCommune = async (payload) => {
    try {
      const municipality =
        communeModal?.municipality;

      if (!municipality?.id) {
        showError(
          "Select an existing municipality to edit."
        );
        return;
      }

      await geographyApi(
        `/dashboard/shipping/geography/municipalities/${municipality.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            province_id: payload.province_id,
            commune_name: payload.commune_name,
          }),
        }
      );

      await refreshGeography();
      setCommuneModal(null);

      showSuccess(
        "Municipality updated successfully."
      );
    } catch (error) {
      console.error(
        "Error updating municipality:",
        error
      );

      showError(
        error.message ||
          "Unable to update municipality."
      );
    }
  };

  /* =======================================================
     ASSIGN MUNICIPALITY
  ======================================================= */

  const assignMunicipality = () => {
    setMunicipalityPicker(null);

    showError(
      "Municipalities are covered automatically by the provider Wilaya coverage."
    );
  };

  /* =======================================================
     DELIVERY OFFICE
  ======================================================= */

  const saveOffice = async (payload) => {
    try {
      const office = officeModal?.office;
      const isEditing = Boolean(office?.id);

      const result = await geographyApi(
        `/dashboard/shipping/offices${
          isEditing ? `/${office.id}` : ""
        }`,
        {
          method: isEditing ? "PUT" : "POST",
          body: JSON.stringify({
            shipping_zone_id:
              payload.shipping_zone_id ||
              officeModal?.zone?.id,
            municipality_id:
              payload.municipality_id ||
              officeModal?.municipality?.id,
            name: payload.name,
            address: payload.address || null,
          }),
        }
      );

      if (isEditing) {
        setOffices((items) =>
          items.map((item) =>
            item.id === result.data.id
              ? { ...item, ...result.data }
              : item
          )
        );

        showSuccess(
          "Delivery office updated successfully."
        );
      } else {
        setOffices((items) => [
          ...items,
          result.data,
        ]);

        showSuccess(
          "Delivery office added successfully."
        );
      }

      setOfficeModal(null);
    } catch (error) {
      console.error(
        "Error saving delivery office:",
        error
      );

      showError(
        error.message ||
          "Unable to save delivery office."
      );
    }
  };

  /* =======================================================
     ADD WILAYA
  ======================================================= */

  const addProvince = async (
    name
  ) => {
    const trimmedName =
      name.trim();

    if (!trimmedName) return;

    try {
      await geographyApi(
        "/dashboard/shipping/geography/provinces",
        {
          method: "POST",
          body: JSON.stringify({
            name: trimmedName,
          }),
        }
      );

      await refreshGeography();

      showSuccess(
        "Wilaya added successfully."
      );
    } catch (error) {
      console.error(
        "Error adding Wilaya:",
        error
      );

      showError(
        error.message ||
          "Unable to add Wilaya."
      );
    }
  };

  /* =======================================================
     EDIT WILAYA
  ======================================================= */

  const updateProvince = async (
    province
  ) => {
    const trimmedName =
      province.name.trim();

    if (!trimmedName) return;

    try {
      await geographyApi(
        `/dashboard/shipping/geography/provinces/${province.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            name: trimmedName,
          }),
        }
      );

      await refreshGeography();

      showSuccess(
        "Wilaya updated successfully."
      );
    } catch (error) {
      console.error(
        "Error updating Wilaya:",
        error
      );

      showError(
        error.message ||
          "Unable to update Wilaya."
      );
    }
  };

  /* =======================================================
     REMOVE WILAYA
  ======================================================= */

 const removeProvince = async (province) => {
  if (!province) return;

  setConfirmation({
    title: "Remove Wilaya?",
    description: `Are you sure you want to remove "${province.name}"? This is only possible if the Wilaya has no municipalities or shipping zones.`,
    confirmLabel: "Remove Wilaya",
    variant: "destructive",

    onConfirm: async () => {
      try {
        await geographyApi(
          `/dashboard/shipping/geography/provinces/${province.id}`,
          {
            method: "DELETE",
          }
        );

        await refreshGeography();

        showSuccess(
          `${province.name} was removed successfully.`
        );
      } catch (error) {
        console.error("Error removing Wilaya:", error);

        showError(
          error.message || "Unable to remove Wilaya."
        );
      }
    },
  });
};

  /* =======================================================
     ADD / EDIT MUNICIPALITY
  ======================================================= */

  const saveGeoMunicipality =
    async (payload) => {
      try {
        const municipality =
          geoMunicipalityModal?.municipality;

        if (municipality?.id) {
          await geographyApi(
            `/dashboard/shipping/geography/municipalities/${municipality.id}`,
            {
              method: "PUT",
              body: JSON.stringify({
                province_id:
                  payload.province_id,
                commune_name:
                  payload.commune_name,
              }),
            }
          );

          showSuccess(
            "Municipality updated successfully."
          );
        } else {
          await geographyApi(
            "/dashboard/shipping/geography/municipalities",
            {
              method: "POST",
              body: JSON.stringify({
                province_id:
                  payload.province_id,
                commune_name:
                  payload.commune_name,
              }),
            }
          );

          showSuccess(
            "Municipality added successfully."
          );
        }

        await refreshGeography();

        setGeoMunicipalityModal(
          null
        );
      } catch (error) {
        console.error(
          "Error saving municipality:",
          error
        );

        showError(
          error.message ||
            "Unable to save municipality."
        );
      }
    };

  /* =======================================================
     REMOVE MUNICIPALITY
  ======================================================= */

  const removeGeoMunicipality = async (province, municipality) => {
    if (!province || !municipality) return;

    setConfirmation({
      title: "Remove municipality?",
      description: `Are you sure you want to remove "${municipality.commune_name}" from ${province.name}? This removes the municipality from the global geography.`,
      confirmLabel: "Remove municipality",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await geographyApi(
            `/dashboard/shipping/geography/municipalities/${municipality.id}`,
            { method: "DELETE" }
          );
          await refreshGeography();
          showSuccess(`${municipality.commune_name} was removed from ${province.name}.`);
        } catch (error) {
          console.error("Error removing municipality:", error);
          showError(error.message || "Unable to remove municipality.");
        }
      },
    });
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className={
        styles.dashboardLayout
      }
    >
      <Sidebar activeItem="Shipping" />

      <main
        className={
          styles.dashboardMain
        }
      >
        <section
          className={styles.page}
        >
          {/* =================================================
              HEADER
          ================================================= */}

          <div
            className={
              styles.header
            }
          >
            <div>
              <span
                className={
                  styles.eyebrow
                }
              >
                Dashboard
              </span>

              <h1>
                Shipping Management
              </h1>

              <p>
                Manage providers, Wilaya
                coverage, pricing,
                municipalities and delivery
                offices.
              </p>
            </div>

            <div
              className={
                styles.headerActions
              }
            >
              {view ===
              "manage" ? (
                <button
                  className={
                    styles.secondaryButton
                  }
                  onClick={() =>
                    setView(
                      "providers"
                    )
                  }
                >
                  ← Providers
                </button>
              ) : (
                <button
                  className={
                    styles.primaryButton
                  }
                  onClick={() =>
                    setProviderModal(
                      {}
                    )
                  }
                >
                  + Add Provider
                </button>
              )}
            </div>
          </div>

          {/* =================================================
              FEEDBACK
          ================================================= */}

          {toast && (
            <Toast
              type={toast.type}
              message={toast.message}
              onClose={() => setToast(null)}
            />
          )}

          {/* =================================================
              TABS
          ================================================= */}

          <div
            className={
              styles.tabs
            }
          >
            <button
              className={
                view !==
                "geography"
                  ? styles.activeTab
                  : ""
              }
              onClick={() =>
                setView(
                  "providers"
                )
              }
            >
              Shipping Providers
            </button>

            <button
              className={
                view ===
                "geography"
                  ? styles.activeTab
                  : ""
              }
              onClick={() =>
                setView(
                  "geography"
                )
              }
            >
              Geography
            </button>
          </div>

          {/* =================================================
              PROVIDERS
          ================================================= */}

          {view ===
            "providers" && (
            <>
              <ProviderStats
                providers={
                  providers
                }
                zones={zones}
                municipalities={
                  municipalities
                }
                offices={offices}
              />

              <ProviderToolbar
                search={search}
                status={status}
                onSearch={setSearch}
                onStatus={setStatus}
              />

              {providersLoading ? (
                <div className={styles.empty}>
                  Loading shipping providers...
                </div>
              ) : providersError ? (
                <div className={styles.empty}>
                  <p>{providersError}</p>

                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={async () => {
                      setProvidersLoading(true);
                      await refreshProviders();
                      setProvidersLoading(false);
                    }}
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <>
                  <div
                    className={
                      styles.providerGrid
                    }
                  >
                    {filteredProviders.map(
                      (provider) => (
                        <ProviderCard
                          key={provider.id}
                          provider={provider}
                          zones={zones}
                          municipalities={
                            municipalities
                          }
                          offices={offices}
                          onManage={() =>
                            openManage(provider)
                          }
                          onEdit={() =>
                            setProviderModal(provider)
                          }
                          onToggle={() =>
                            toggleProvider(provider.id)
                          }
                          onRemove={() =>
                            removeProvider(provider)
                          }
                        />
                      )
                    )}
                  </div>

                  {!filteredProviders.length && (
                    <div
                      className={
                        styles.empty
                      }
                    >
                      No shipping providers match
                      your filters.
                    </div>
                  )}
                </>
              )}

            </>
          )}

          {/* =================================================
              PROVIDER MANAGEMENT
          ================================================= */}

          {view ===
            "manage" &&
            selectedProvider && (
              <>
                {(zonesLoading || officesLoading) && (
                  <div className={styles.empty}>
                    {zonesLoading && officesLoading
                      ? "Loading shipping coverage and delivery offices..."
                      : zonesLoading
                        ? "Loading shipping coverage..."
                        : "Loading delivery offices..."}
                  </div>
                )}

                {!zonesLoading &&
                  !officesLoading &&
                  (zonesError || officesError) && (
                    <div className={styles.empty}>
                      {zonesError && <p>{zonesError}</p>}
                      {officesError && <p>{officesError}</p>}

                      <button
                        type="button"
                        className={styles.primaryButton}
                        onClick={async () => {
                          await Promise.all([
                            refreshZones(),
                            refreshOffices(),
                          ]);
                        }}
                      >
                        Retry
                      </button>
                    </div>
                  )}

                {!zonesLoading &&
                  !officesLoading &&
                  !zonesError &&
                  !officesError && (
                    <ShippingTree
                      provider={
                        selectedProvider
                      }
                provinces={
                  provinces
                }
                municipalities={
                  municipalities
                }
                assignedMunicipalityIds={
                  assignedMunicipalityIds
                }
                zones={
                  providerZones
                }
                offices={
                  offices
                }
                onAddWilaya={() =>
                  setWilayaModal(
                    {
                      provider:
                        selectedProvider,
                    }
                  )
                }
                onEditPricing={(
                  zone
                ) =>
                  setPricingModal(
                    {
                      provider:
                        selectedProvider,
                      zone,
                    }
                  )
                }
                onEditWilaya={(
                  zone
                ) =>
                  setWilayaModal(
                    {
                      provider:
                        selectedProvider,
                      zone,
                    }
                  )
                }
                onToggleZone={
                  toggleZone
                }
                onAddMunicipality={(
                  province,
                  zone
                ) =>
                  setMunicipalityPicker(
                    {
                      provider:
                        selectedProvider,
                      province,
                      zone,
                    }
                  )
                }
                onEditMunicipality={(
                  province,
                  municipality
                ) =>
                  setCommuneModal(
                    {
                      provider:
                        selectedProvider,
                      province,
                      municipality,
                    }
                  )
                }
                onAddOffice={(
                  zone,
                  municipality
                ) =>
                  setOfficeModal(
                    {
                      provider:
                        selectedProvider,
                      zone,
                      municipality,
                    }
                  )
                }
                onEditOffice={(
                  zone,
                  municipality,
                  office
                ) =>
                  setOfficeModal(
                    {
                      provider:
                        selectedProvider,
                      zone,
                      municipality,
                      office,
                    }
                  )
                }
                onToggleOffice={
                  toggleOffice
                }
                    />
                  )}
              </>
            )}

          {/* =================================================
              GEOGRAPHY
          ================================================= */}

          {view ===
            "geography" && (
            <>
              {geographyLoading && (
                <div
                  className={
                    styles.empty
                  }
                >
                  Loading geography...
                </div>
              )}

              {!geographyLoading &&
                geographyError && (
                  <div
                    className={
                      styles.empty
                    }
                  >
                    <p>
                      {
                        geographyError
                      }
                    </p>

                    <button
                      type="button"
                      className={
                        styles.primaryButton
                      }
                      onClick={async () => {
                        setGeographyLoading(
                          true
                        );

                        await refreshGeography();

                        setGeographyLoading(
                          false
                        );
                      }}
                    >
                      Retry
                    </button>
                  </div>
                )}

              {!geographyLoading &&
                !geographyError && (
                  <WilayaList
                    provinces={
                      provinces
                    }
                    municipalities={
                      municipalities
                    }
                    onAddWilaya={() =>
                      setWilayaModal(
                        {
                          geographyOnly:
                            true,
                        }
                      )
                    }
                    onEditWilaya={(
                      province
                    ) =>
                      setWilayaModal(
                        {
                          geographyOnly:
                            true,
                          province,
                        }
                      )
                    }
                    onRemoveWilaya={
                      removeProvince
                    }
                    onAddMunicipality={(
                      province
                    ) =>
                      setGeoMunicipalityModal(
                        {
                          province,
                        }
                      )
                    }
                    onEditMunicipality={(
                      province,
                      municipality
                    ) =>
                      setGeoMunicipalityModal(
                        {
                          province,
                          municipality,
                        }
                      )
                    }
                    onRemoveMunicipality={
                      removeGeoMunicipality
                    }
                  />
                )}
            </>
          )}

          {/* =================================================
              PROVIDER MODAL
          ================================================= */}

          {providerModal && (
            <ProviderModal
              provider={
                providerModal.id
                  ? providerModal
                  : null
              }
              onClose={() =>
                setProviderModal(
                  null
                )
              }
              onSave={
                saveProvider
              }
            />
          )}

          {/* =================================================
              PROVIDER WILAYA COVERAGE MODAL
          ================================================= */}

          {wilayaModal &&
            !wilayaModal.geographyOnly && (
              <WilayaModal
                provider={
                  wilayaModal.provider
                }
                provinces={
                  provinces
                }
                existingZones={
                  zones
                }
                zone={
                  wilayaModal.zone ||
                  null
                }
                onClose={() =>
                  setWilayaModal(
                    null
                  )
                }
                onSave={
                  saveWilaya
                }
              />
            )}

          {/* =================================================
              GLOBAL WILAYA MODAL
          ================================================= */}

          {wilayaModal?.geographyOnly && (
            <WilayaModal
              geographyOnly
              province={
                wilayaModal.province ||
                null
              }
              provinces={
                provinces
              }
              onClose={() =>
                setWilayaModal(
                  null
                )
              }
              onSave={async (
                payload
              ) => {
                if (
                  wilayaModal.province
                ) {
                  await updateProvince(
                    {
                      ...wilayaModal.province,
                      ...payload,
                    }
                  );
                } else {
                  await addProvince(
                    payload.name
                  );
                }

                setWilayaModal(
                  null
                );
              }}
            />
          )}

          {/* =================================================
              PRICING MODAL
          ================================================= */}

          {pricingModal && (
            <PricingModal
              provider={
                pricingModal.provider
              }
              wilaya={provinces.find(
                (item) =>
                  item.id ===
                  pricingModal
                    .zone
                    .province_id
              )}
              zone={
                pricingModal.zone
              }
              onClose={() =>
                setPricingModal(
                  null
                )
              }
              onSave={
                savePricing
              }
            />
          )}

          {/* =================================================
              PROVIDER MUNICIPALITY MODAL
          ================================================= */}

          {communeModal && (
            <CommuneModal
              province={
                communeModal.province
              }
              municipality={
                communeModal.municipality ||
                null
              }
              onClose={() =>
                setCommuneModal(
                  null
                )
              }
              onSave={
                saveCommune
              }
            />
          )}

          {/* =================================================
              OFFICE MODAL
          ================================================= */}

          {officeModal && (
            <OfficeModal
              provider={
                officeModal.provider
              }
              municipality={
                officeModal.municipality
              }
              office={
                officeModal.office ||
                null
              }
              shippingZoneId={
                officeModal.zone.id
              }
              onClose={() =>
                setOfficeModal(
                  null
                )
              }
              onSave={
                saveOffice
              }
            />
          )}

          {/* =================================================
              GLOBAL MUNICIPALITY MODAL
          ================================================= */}

          {geoMunicipalityModal && (
            <MunicipalityModal
              province={
                geoMunicipalityModal.province
              }
              provinces={
                provinces
              }
              municipality={
                geoMunicipalityModal
                  .municipality ||
                null
              }
              onClose={() =>
                setGeoMunicipalityModal(
                  null
                )
              }
              onSave={
                saveGeoMunicipality
              }
            />
          )}

          {/* =================================================
              PROVIDER MUNICIPALITY PICKER
          ================================================= */}

          {municipalityPicker && (
            <MunicipalityPickerModal
              province={
                municipalityPicker.province
              }
              municipalities={municipalities.filter(
                (municipality) =>
                  municipality.province_id ===
                    municipalityPicker
                      .province.id &&
                  !assignedMunicipalityIds.includes(
                    municipality.id
                  )
              )}
              onClose={() =>
                setMunicipalityPicker(
                  null
                )
              }
              onSave={
                assignMunicipality
              }
            />
          )}
          {confirmation && (
            <AlertDialog
              open={Boolean(confirmation)}
              onOpenChange={(open) => {
                if (!open) setConfirmation(null);
              }}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{confirmation.title}</AlertDialogTitle>
                  <AlertDialogDescription>{confirmation.description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className={
                      confirmation.variant === "destructive"
                        ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        : ""
                    }
                    onClick={async () => {
                      await confirmation.onConfirm();
                      setConfirmation(null);
                    }}
                  >
                    {confirmation.confirmLabel || "Confirm"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

        </section>
      </main>
    </div>
  );
};

export default Shipping;