import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    Home,
    Building2,
    CheckCircle2,
    Minus,
    Plus,
    LoaderCircle,
} from "lucide-react";

import styles from "./styles.module.scss";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL;

const getServerBaseUrl = () => {
    return API_BASE_URL.replace(
        /\/api\/?$/,
        ""
    );
};

const getImageUrl = (url) => {
    if (!url) {
        return "";
    }

    if (
        url.startsWith("http://") ||
        url.startsWith("https://")
    ) {
        return url;
    }

    return `${getServerBaseUrl()}${url}`;
};

export default function OrderForm({
    product,
    selectedVariants,
}) {
    /*
     * --------------------------------------------------
     * CUSTOMER
     * --------------------------------------------------
     */

    const [fullName, setFullName] =
        useState("");

    const [phone, setPhone] =
        useState("");

    /*
     * --------------------------------------------------
     * GEOGRAPHY
     * --------------------------------------------------
     */

    const [provinces, setProvinces] =
        useState([]);

    const [provinceId, setProvinceId] =
        useState("");

    const [municipalityId, setMunicipalityId] =
        useState("");

    const [loadingGeography, setLoadingGeography] =
        useState(true);

    const [geographyError, setGeographyError] =
        useState("");

    /*
     * --------------------------------------------------
     * SHIPPING
     * --------------------------------------------------
     */

    const [providers, setProviders] =
        useState([]);

    const [loadingShipping, setLoadingShipping] =
        useState(false);

    const [shippingError, setShippingError] =
        useState("");

    /*
     * --------------------------------------------------
     * CUSTOMER SHIPPING SELECTION
     * --------------------------------------------------
     */

    const [deliveryType, setDeliveryType] =
        useState("");

    const [selectedProviderId, setSelectedProviderId] =
        useState("");

    const [officeId, setOfficeId] =
        useState("");

    /*
     * --------------------------------------------------
     * OFFICE WARNING
     * --------------------------------------------------
     */

    const [officeWarning, setOfficeWarning] =
        useState("");

    /*
     * --------------------------------------------------
     * ORDER
     * --------------------------------------------------
     */

    const [quantity, setQuantity] =
        useState(1);

    const [submitted, setSubmitted] =
        useState(false);

    const [submitting, setSubmitting] =
        useState(false);

    const [submitError, setSubmitError] =
        useState("");

    /*
     * --------------------------------------------------
     * FETCH GEOGRAPHY
     * --------------------------------------------------
     */

useEffect(() => {
    const fetchGeography = async () => {
        try {
            setLoadingGeography(true);
            setGeographyError("");

            const response = await fetch(
                `${API_BASE_URL}/shipping/geography`
            );

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch geography: ${response.status}`
                );
            }

            const result = await response.json();

            console.log("GEOGRAPHY API RESULT:", result);

            const provincesData =
                Array.isArray(result?.data?.provinces)
                    ? result.data.provinces
                    : [];

            const municipalitiesData =
                Array.isArray(result?.data?.municipalities)
                    ? result.data.municipalities
                    : [];

            const municipalitiesByProvince = new Map();

            for (const municipality of municipalitiesData) {
                const provinceId =
                    municipality.province_id ??
                    municipality.provinceId;

                if (provinceId == null) {
                    continue;
                }

                const key = String(provinceId);

                if (!municipalitiesByProvince.has(key)) {
                    municipalitiesByProvince.set(key, []);
                }

                municipalitiesByProvince.get(key).push({
                    id:
                        municipality.id ??
                        municipality.municipality_id,

                    name:
                        municipality.name ??
                        municipality.commune_name ??
                        municipality.municipality_name,
                });
            }

            const normalizedProvinces = provincesData.map(
                (province) => {
                    const provinceId =
                        province.id ??
                        province.province_id;

                    return {
                        id: provinceId,

                        name:
                            province.name ??
                            province.province_name,

                        municipalities:
                            municipalitiesByProvince.get(
                                String(provinceId)
                            ) ?? [],
                    };
                }
            );

            console.log(
                "NORMALIZED PROVINCES:",
                normalizedProvinces
            );

            setProvinces(normalizedProvinces);
        } catch (error) {
            console.error(
                "Error loading geography:",
                error
            );

            setGeographyError(
                "Failed to load provinces and municipalities."
            );

            setProvinces([]);
        } finally {
            setLoadingGeography(false);
        }
    };

    fetchGeography();
}, []);
    /*
     * --------------------------------------------------
     * SELECTED PROVINCE
     * --------------------------------------------------
     */

    const selectedProvince = useMemo(() => {
        return provinces.find(
            (province) =>
                String(
                    province.id
                ) ===
                String(
                    provinceId
                )
        );
    }, [
        provinces,
        provinceId,
    ]);

    /*
     * --------------------------------------------------
     * MUNICIPALITIES
     * --------------------------------------------------
     */

    const municipalities =
        selectedProvince?.municipalities ??
        [];

    /*
     * --------------------------------------------------
     * SELECTED MUNICIPALITY
     * --------------------------------------------------
     */

    const selectedMunicipality =
        useMemo(() => {
            return municipalities.find(
                (municipality) =>
                    String(
                        municipality.id
                    ) ===
                    String(
                        municipalityId
                    )
            );
        }, [
            municipalities,
            municipalityId,
        ]);

    /*
     * --------------------------------------------------
     * FETCH SHIPPING OPTIONS
     * --------------------------------------------------
     */

    useEffect(() => {
        if (
            !provinceId ||
            !municipalityId
        ) {
            return;
        }

        const controller =
            new AbortController();

        const fetchShippingOptions =
            async () => {
                try {
                    setLoadingShipping(
                        true
                    );

                    setShippingError("");

                    const params =
                        new URLSearchParams({
                            province_id:
                                String(
                                    provinceId
                                ),

                            municipality_id:
                                String(
                                    municipalityId
                                ),
                        });

                    const response =
                        await fetch(
                            `${API_BASE_URL}/shipping/options?${params.toString()}`,
                            {
                                signal:
                                    controller.signal,
                            }
                        );

                    const result =
                        await response.json();

                    if (
                        !response.ok ||
                        !result.success
                    ) {
                        throw new Error(
                            result.message ||
                                "Failed to load shipping options."
                        );
                    }

                    if (
                        controller.signal
                            .aborted
                    ) {
                        return;
                    }

                    setProviders(
                        result.data
                            ?.providers ??
                            []
                    );

                    /*
                     * New location means the
                     * previous shipping selection
                     * is no longer valid.
                     */

                    setDeliveryType(
                        ""
                    );

                    setSelectedProviderId(
                        ""
                    );

                    setOfficeId("");

                    setOfficeWarning("");
                } catch (error) {
                    if (
                        error.name ===
                        "AbortError"
                    ) {
                        return;
                    }

                    console.error(
                        "Error fetching shipping options:",
                        error
                    );

                    setShippingError(
                        error.message ||
                            "Unable to load shipping options."
                    );

                    setProviders([]);

                    setDeliveryType(
                        ""
                    );

                    setSelectedProviderId(
                        ""
                    );

                    setOfficeId("");

                    setOfficeWarning("");
                } finally {
                    if (
                        !controller.signal
                            .aborted
                    ) {
                        setLoadingShipping(
                            false
                        );
                    }
                }
            };

        fetchShippingOptions();

        return () => {
            controller.abort();
        };
    }, [
        provinceId,
        municipalityId,
    ]);

    /*
     * --------------------------------------------------
     * ACTIVE PROVIDERS
     * --------------------------------------------------
     *
     * The backend already filters:
     *
     * sp.is_active = true
     * sz.is_active = true
     *
     * So everything here is real active DB data.
     */

    const activeProviders =
        providers;

    /*
     * --------------------------------------------------
     * SHIPPING AVAILABILITY
     * --------------------------------------------------
     *
     * The backend only returns providers that are
     * active and have an active shipping zone for
     * the selected province.
     *
     * If no providers are returned, the selected
     * province/municipality cannot currently be
     * served by any available shipping provider.
     */

    const hasShippingProviders =
        activeProviders.length > 0;

    const shippingUnavailable =
        !loadingShipping &&
        Boolean(provinceId) &&
        Boolean(municipalityId) &&
        !hasShippingProviders;

    /*
     * --------------------------------------------------
     * DOES ANY PROVIDER HAVE OFFICE DELIVERY?
     * --------------------------------------------------
     */

    const hasAnyOfficeDelivery =
        activeProviders.some(
            (provider) =>
                provider.office_available
        );

    /*
     * --------------------------------------------------
     * SELECTED PROVIDER
     * --------------------------------------------------
     */

    const selectedProvider = useMemo(() => {
        return activeProviders.find(
            (provider) =>
                String(
                    provider.provider_id
                ) ===
                String(
                    selectedProviderId
                )
        );
    }, [
        activeProviders,
        selectedProviderId,
    ]);

    /*
     * --------------------------------------------------
     * SELECTED PROVIDER OFFICES
     * --------------------------------------------------
     */

    const availableOffices =
        selectedProvider?.offices ??
        [];

    /*
     * --------------------------------------------------
     * SELECTED OFFICE
     * --------------------------------------------------
     */

    const selectedOffice =
        useMemo(() => {
            return availableOffices.find(
                (office) =>
                    String(
                        office.id
                    ) ===
                    String(
                        officeId
                    )
            );
        }, [
            availableOffices,
            officeId,
        ]);

    /*
     * --------------------------------------------------
     * DELIVERY PRICE
     * --------------------------------------------------
     */

    const deliveryPrice =
        deliveryType === "home"
            ? Number(
                  selectedProvider
                      ?.home_price ??
                      0
              )
            : deliveryType ===
              "office"
            ? Number(
                  selectedProvider
                      ?.office_price ??
                      0
              )
            : 0;

    /*
     * --------------------------------------------------
     * PRODUCT PRICE
     * --------------------------------------------------
     */

    const hasDiscount =
        product?.is_on_sale &&
        product?.discount_price !=
            null;

    const productPrice = hasDiscount
        ? Number(
              product.discount_price
          )
        : Number(
              product?.price ?? 0
          );

    /*
     * --------------------------------------------------
     * TOTAL
     * --------------------------------------------------
     */

    const productsTotal =
        productPrice * quantity;

    const total =
        productsTotal +
        deliveryPrice;

    /*
     * --------------------------------------------------
     * STOCK
     * --------------------------------------------------
     */

    const isOutOfStock =
        !product ||
        product.stock <= 0;

    /*
     * --------------------------------------------------
     * PROVINCE CHANGE
     * --------------------------------------------------
     */

    const handleProvinceChange = (
        event
    ) => {
        const value =
            event.target.value;

        setProvinceId(value);

        setMunicipalityId("");

        setDeliveryType("");

        setSelectedProviderId("");

        setOfficeId("");

        setProviders([]);

        setShippingError("");

        setOfficeWarning("");
    };

    /*
     * --------------------------------------------------
     * MUNICIPALITY CHANGE
     * --------------------------------------------------
     */

    const handleMunicipalityChange = (
        event
    ) => {
        const value =
            event.target.value;

        setMunicipalityId(value);

        setDeliveryType("");

        setSelectedProviderId("");

        setOfficeId("");

        setProviders([]);

        setShippingError("");

        setOfficeWarning("");
    };

    /*
     * --------------------------------------------------
     * DELIVERY TYPE
     * --------------------------------------------------
     */

    const handleDeliveryTypeChange = (
        type
    ) => {
        /*
         * If office delivery is unavailable,
         * don't allow the selection.
         */

        if (
            type === "office" &&
            !hasAnyOfficeDelivery
        ) {
            setOfficeWarning(
                "التوصيل إلى المكتب غير متاح في هذه الولاية حالياً، لا يوجد أي مكتب نشط لشركات التوصيل المتاحة."
            );

            return;
        }

        setDeliveryType(type);

        setSelectedProviderId("");

        setOfficeId("");

        setOfficeWarning("");
    };

    /*
     * --------------------------------------------------
     * PROVIDER
     * --------------------------------------------------
     */

    const handleProviderChange = (
        providerId
    ) => {
        setSelectedProviderId(
            String(providerId)
        );

        setOfficeId("");

        setOfficeWarning("");
    };

    /*
     * --------------------------------------------------
     * OFFICE
     * --------------------------------------------------
     */

    const handleOfficeChange = (
        event
    ) => {
        setOfficeId(
            event.target.value
        );

        setOfficeWarning("");
    };

    /*
     * --------------------------------------------------
     * QUANTITY
     * --------------------------------------------------
     */

    const increaseQuantity = () => {
        setQuantity((current) =>
            Math.min(
                current + 1,
                product.stock
            )
        );
    };

    const decreaseQuantity = () => {
        setQuantity((current) =>
            Math.max(
                current - 1,
                1
            )
        );
    };

    /*
     * --------------------------------------------------
     * SUBMIT
     * --------------------------------------------------
     */

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (
            isOutOfStock ||
            submitted ||
            submitting ||
            loadingShipping
        ) {
            return;
        }

        setSubmitError("");

        if (
            !fullName.trim() ||
            !phone.trim()
        ) {
            setSubmitError(
                "يرجى إدخال الإسم الكامل ورقم الهاتف."
            );
            return;
        }

        if (
            !provinceId ||
            !municipalityId
        ) {
            setSubmitError(
                "يرجى اختيار الولاية والبلدية."
            );
            return;
        }

        if (!deliveryType) {
            setOfficeWarning(
                "يرجى اختيار طريقة التوصيل."
            );
            return;
        }

        if (!selectedProvider) {
            setOfficeWarning(
                "يرجى اختيار شركة التوصيل."
            );
            return;
        }

        if (
            deliveryType === "office" &&
            !selectedOffice
        ) {
            setOfficeWarning(
                "يرجى اختيار مكتب الاستلام."
            );
            return;
        }

        const orderData = {
            product_id: Number(product.id),
            quantity: Number(quantity),

            customer: {
                full_name: fullName.trim(),
                phone: phone.trim(),
            },

            province_id: Number(provinceId),
            municipality_id: Number(municipalityId),

            delivery_type: deliveryType,

            shipping_provider_id: Number(
                selectedProvider.provider_id
            ),

            shipping_zone_id: Number(
                selectedProvider.shipping_zone_id
            ),

            delivery_office_id:
                deliveryType === "office"
                    ? Number(selectedOffice.id)
                    : null,

            variants: selectedVariants ?? {},
        };

        try {
            setSubmitting(true);
            setSubmitError("");
            setOfficeWarning("");

            console.log(
                "Creating order:",
                orderData
            );

            const response = await fetch(
                `${API_BASE_URL}/orders`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify(
                        orderData
                    ),
                }
            );

            const result =
                await response.json();

            if (
                !response.ok ||
                !result.success
            ) {
                throw new Error(
                    result.message ||
                        "Failed to create order."
                );
            }

            console.log(
                "Order created successfully:",
                result
            );

            setSubmitted(true);
        } catch (error) {
            console.error(
                "Error creating order:",
                error
            );

            setSubmitError(
                error.message ||
                    "حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى."
            );
        } finally {
            setSubmitting(false);
        }
    };

    /*
     * --------------------------------------------------
     * RENDER
     * --------------------------------------------------
     */

    return (
        <>
            {!submitted && (
                <section
                    className={
                        styles.OrderForm
                    }
                    id="order-form"
                    dir="rtl"
                >
                    <div
                        className={
                            styles.OrderForm__Heading
                        }
                    >
                        <h2>
                            أطلب الآن
                        </h2>

                        <p>
                            الدفع عند الاستلام
                        </p>
                    </div>

                    {!isOutOfStock && (
                        <div
                            className={
                                styles.OrderForm__Quantity
                            }
                        >
                            <span
                                className={
                                    styles.OrderForm__Label
                                }
                            >
                                الكمية
                            </span>

                            <div
                                className={
                                    styles.OrderForm__QuantityControl
                                }
                            >
                                <button
                                    type="button"
                                    onClick={
                                        decreaseQuantity
                                    }
                                    disabled={
                                        quantity <=
                                        1
                                    }
                                    aria-label="Decrease quantity"
                                >
                                    <Minus
                                        size={
                                            16
                                        }
                                    />
                                </button>

                                <span>
                                    {quantity}
                                </span>

                                <button
                                    type="button"
                                    onClick={
                                        increaseQuantity
                                    }
                                    disabled={
                                        quantity >=
                                        product.stock
                                    }
                                    aria-label="Increase quantity"
                                >
                                    <Plus
                                        size={
                                            16
                                        }
                                    />
                                </button>
                            </div>
                        </div>
                    )}

                    {isOutOfStock ? (
                        <div
                            className={
                                styles.OrderForm__OutOfStock
                            }
                        >
                            نفذ المخزون
                        </div>
                    ) : (
                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >
                            <div
                                className={
                                    styles.OrderForm__Field
                                }
                            >
                                <label htmlFor="fullName">
                                    الإسم الكامل
                                </label>

                                <input
                                    id="fullName"
                                    type="text"
                                    required
                                    value={
                                        fullName
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setFullName(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder="أدخل إسمك الكامل"
                                />
                            </div>

                            <div
                                className={
                                    styles.OrderForm__Row
                                }
                            >
                                <div
                                    className={
                                        styles.OrderForm__Field
                                    }
                                >
                                    <label htmlFor="province">
                                        الولاية
                                    </label>

                                    <select
                                        id="province"
                                        required
                                        value={
                                            provinceId
                                        }
                                        onChange={
                                            handleProvinceChange
                                        }
                                        disabled={
                                            loadingGeography
                                        }
                                    >
                                        <option
                                            value=""
                                            disabled
                                        >
                                            {loadingGeography
                                                ? "جاري تحميل الولايات..."
                                                : "اختر الولاية"}
                                        </option>

                                        {provinces.map(
                                            (
                                                province
                                            ) => (
                                                <option
                                                    key={
                                                        province.id
                                                    }
                                                    value={
                                                        province.id
                                                    }
                                                >
                                                    {
                                                        province.id
                                                    }{" "}
                                                    -{" "}
                                                    {
                                                        province.name
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                <div
                                    className={
                                        styles.OrderForm__Field
                                    }
                                >
                                    <label htmlFor="municipality">
                                        البلدية
                                    </label>

                                    <select
                                        id="municipality"
                                        required
                                        disabled={
                                            !provinceId ||
                                            loadingGeography
                                        }
                                        value={
                                            municipalityId
                                        }
                                        onChange={
                                            handleMunicipalityChange
                                        }
                                    >
                                        <option
                                            value=""
                                            disabled
                                        >
                                            {provinceId
                                                ? "اختر البلدية"
                                                : "اختر الولاية أولاً"}
                                        </option>

                                        {municipalities.map(
                                            (
                                                municipality
                                            ) => (
                                                <option
                                                    key={
                                                        municipality.id
                                                    }
                                                    value={
                                                        municipality.id
                                                    }
                                                >
                                                    {
                                                        municipality.name
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>
                            </div>

                            {geographyError && (
                                <p
                                    className={
                                        styles.OrderForm__DeliveryMessage
                                    }
                                >
                                    {
                                        geographyError
                                    }
                                </p>
                            )}

                            <div
                                className={
                                    styles.OrderForm__Field
                                }
                            >
                                <label htmlFor="phone">
                                    رقم الهاتف
                                </label>

                                <input
                                    id="phone"
                                    type="tel"
                                    required
                                    pattern="0[5-7][0-9]{8}"
                                    value={
                                        phone
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setPhone(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder="0555 12 34 56"
                                />
                            </div>

                            {provinceId &&
                                municipalityId && (
                                    <>
                                        <div
                                            className={
                                                styles.OrderForm__Delivery
                                            }
                                        >
                                            <span
                                                className={
                                                    styles.OrderForm__Label
                                                }
                                            >
                                                طريقة التوصيل
                                            </span>

                                            {loadingShipping ? (
                                                <div
                                                    className={
                                                        styles.OrderForm__DeliveryMessage
                                                    }
                                                >
                                                    <LoaderCircle
                                                        size={16}
                                                    />

                                                    جاري تحميل خيارات التوصيل...
                                                </div>
                                            ) : shippingUnavailable ? (
                                                <div
                                                    className={
                                                        styles.OrderForm__DeliveryMessage
                                                    }
                                                >
                                                    لا يوجد أي مزود توصيل متاح حالياً لهذه الولاية. يرجى اختيار ولاية أخرى متاحة للتوصيل.
                                                </div>
                                            ) : (
                                                <div
                                                    className={
                                                        styles.OrderForm__DeliveryOptions
                                                    }
                                                >
                                                    <button
                                                        type="button"
                                                        className={`
                                                            ${styles.OrderForm__DeliveryOption}
                                                            ${
                                                                deliveryType ===
                                                                "home"
                                                                    ? styles.OrderForm__DeliveryOptionActive
                                                                    : ""
                                                            }
                                                        `}
                                                        onClick={() =>
                                                            handleDeliveryTypeChange(
                                                                "home"
                                                            )
                                                        }
                                                    >
                                                        <Home
                                                            size={
                                                                20
                                                            }
                                                        />

                                                        <span>
                                                            توصيل
                                                            للمنزل
                                                        </span>

                                                        {deliveryType ===
                                                            "home" && (
                                                            <span
                                                                className={
                                                                    styles.OrderForm__Check
                                                                }
                                                            >
                                                                ✓
                                                            </span>
                                                        )}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className={`
                                                            ${styles.OrderForm__DeliveryOption}
                                                            ${
                                                                deliveryType ===
                                                                "office"
                                                                    ? styles.OrderForm__DeliveryOptionActive
                                                                    : ""
                                                            }
                                                            ${
                                                                !hasAnyOfficeDelivery
                                                                    ? styles.OrderForm__DeliveryOptionDisabled
                                                                    : ""
                                                            }
                                                        `}
                                                        onClick={() =>
                                                            handleDeliveryTypeChange(
                                                                "office"
                                                            )
                                                        }
                                                    >
                                                        <Building2
                                                            size={
                                                                20
                                                            }
                                                        />

                                                        <span>
                                                            توصيل
                                                            للمكتب
                                                        </span>

                                                        {!hasAnyOfficeDelivery && (
                                                            <small>
                                                                غير
                                                                متاح
                                                            </small>
                                                        )}

                                                        {deliveryType ===
                                                            "office" &&
                                                            hasAnyOfficeDelivery && (
                                                                <span
                                                                    className={
                                                                        styles.OrderForm__Check
                                                                    }
                                                                >
                                                                    ✓
                                                                </span>
                                                            )}
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {officeWarning && (
                                            <p
                                                className={
                                                    styles.OrderForm__DeliveryMessage
                                                }
                                            >
                                                {
                                                    officeWarning
                                                }
                                            </p>
                                        )}

                                        {shippingError && (
                                            <p
                                                className={
                                                    styles.OrderForm__DeliveryMessage
                                                }
                                            >
                                                {
                                                    shippingError
                                                }
                                            </p>
                                        )}
                                    </>
                                )}

                            {deliveryType &&
                                activeProviders.length >
                                    0 && (
                                    <div
                                        className={
                                            styles.OrderForm__Delivery
                                        }
                                    >
                                        <span
                                            className={
                                                styles.OrderForm__Label
                                            }
                                        >
                                            شركة التوصيل
                                        </span>

                                        <div
                                            className={
                                                styles.OrderForm__DeliveryOptions
                                            }
                                        >
                                            {activeProviders
                                                .filter(
                                                    (
                                                        provider
                                                    ) =>
                                                        deliveryType ===
                                                            "home"
                                                            ? provider.home_available
                                                            : provider.office_available
                                                )
                                                .map(
                                                    (
                                                        provider
                                                    ) => (
                                                        <button
                                                            type="button"
                                                            key={
                                                                provider.provider_id
                                                            }
                                                            className={`
                                                                ${styles.OrderForm__DeliveryOption}
                                                                ${
                                                                    String(
                                                                        selectedProviderId
                                                                    ) ===
                                                                    String(
                                                                        provider.provider_id
                                                                    )
                                                                        ? styles.OrderForm__DeliveryOptionActive
                                                                        : ""
                                                                }
                                                            `}
                                                            onClick={() =>
                                                                handleProviderChange(
                                                                    provider.provider_id
                                                                )
                                                            }
                                                        >
                                                            {provider.provider_logo ? (
                                                                <img
                                                                    src={getImageUrl(
                                                                        provider.provider_logo
                                                                    )}
                                                                    alt=""
                                                                    className={
                                                                        styles.OrderForm__ProviderLogo
                                                                    }
                                                                />
                                                            ) : (
                                                                <Building2
                                                                    size={
                                                                        20
                                                                    }
                                                                />
                                                            )}

                                                            <span>
                                                                {
                                                                    provider.provider_name
                                                                }
                                                            </span>

                                                            <strong>
                                                                {deliveryType ===
                                                                "home"
                                                                    ? Number(
                                                                          provider.home_price
                                                                      ).toLocaleString()
                                                                    : Number(
                                                                          provider.office_price
                                                                      ).toLocaleString()}{" "}
                                                                DA
                                                            </strong>

                                                            {String(
                                                                selectedProviderId
                                                            ) ===
                                                                String(
                                                                    provider.provider_id
                                                                ) && (
                                                                <span
                                                                    className={
                                                                        styles.OrderForm__Check
                                                                    }
                                                                >
                                                                    ✓
                                                                </span>
                                                            )}
                                                        </button>
                                                    )
                                                )}
                                        </div>
                                    </div>
                                )}

                            {deliveryType ===
                                "office" &&
                                selectedProvider && (
                                    <div
                                        className={
                                            styles.OrderForm__Field
                                        }
                                    >
                                        <label htmlFor="office">
                                            مكتب الاستلام
                                        </label>

                                        <select
                                            id="office"
                                            required
                                            value={
                                                officeId
                                            }
                                            onChange={
                                                handleOfficeChange
                                            }
                                        >
                                            <option
                                                value=""
                                                disabled
                                            >
                                                اختر مكتب
                                                الاستلام
                                            </option>

                                            {availableOffices.map(
                                                (
                                                    office
                                                ) => (
                                                    <option
                                                        key={
                                                            office.id
                                                        }
                                                        value={
                                                            office.id
                                                        }
                                                    >
                                                        {
                                                            office.name
                                                        }{" "}
                                                        —{" "}
                                                        {
                                                            office.municipality_name
                                                        }
                                                        {office.is_local
                                                            ? " — في بلديتك"
                                                            : ""}
                                                    </option>
                                                )
                                            )}
                                        </select>

                                        {selectedOffice && (
                                            <small
                                                className={
                                                    styles.OrderForm__OfficeHint
                                                }
                                            >
                                                {selectedOffice.is_local
                                                    ? `مكتب ${selectedOffice.name} متوفر في بلديتك ${selectedMunicipality?.name ?? ""}`
                                                    : `لا يوجد مكتب لهذا المزود في بلديتك، تم اختيار مكتب متاح في ولاية ${selectedProvince?.name ?? ""}`}
                                            </small>
                                        )}
                                    </div>
                                )}

                            

                            {submitError && (
                                <p
                                    className={
                                        styles.OrderForm__DeliveryMessage
                                    }
                                    role="alert"
                                >
                                    {submitError}
                                </p>
                            )}

                            <div
                                className={
                                    styles.OrderForm__Summary
                                }
                            >
                                <div
                                    className={
                                        styles.OrderForm__SummaryRow
                                    }
                                >
                                    <span>
                                        سعر المنتج
                                    </span>

                                    <span>
                                        {productPrice.toLocaleString()}{" "}
                                        DA
                                    </span>
                                </div>

                                <div
                                    className={
                                        styles.OrderForm__SummaryRow
                                    }
                                >
                                    <span>
                                        الكمية
                                    </span>

                                    <span>
                                        {quantity}
                                    </span>
                                </div>

                                {selectedProvider && (
                                    <div
                                        className={
                                            styles.OrderForm__SummaryRow
                                        }
                                    >
                                        <span>
                                            شركة التوصيل
                                        </span>

                                        <span>
                                            {
                                                selectedProvider.provider_name
                                            }
                                        </span>
                                    </div>
                                )}

                                {selectedProvider && (
                                    <div
                                        className={
                                            styles.OrderForm__SummaryRow
                                        }
                                    >
                                        <span>
                                            طريقة التوصيل
                                        </span>

                                        <span>
                                            {deliveryType ===
                                            "home"
                                                ? "للمنزل"
                                                : "للمكتب"}
                                        </span>
                                    </div>
                                )}

                                {deliveryType ===
                                    "office" &&
                                    selectedOffice && (
                                        <div
                                            className={
                                                styles.OrderForm__SummaryRow
                                            }
                                        >
                                            <span>
                                                مكتب الاستلام
                                            </span>

                                            <span>
                                                {
                                                    selectedOffice.name
                                                }
                                            </span>
                                        </div>
                                    )}

                                <div
                                    className={
                                        styles.OrderForm__SummaryRow
                                    }
                                >
                                    <span>
                                        سعر المنتج
                                        الإجمالي
                                    </span>

                                    <span>
                                        {productsTotal.toLocaleString()}{" "}
                                        DA
                                    </span>
                                </div>

                                <div
                                    className={
                                        styles.OrderForm__SummaryRow
                                    }
                                >
                                    <span>
                                        سعر التوصيل
                                    </span>

                                    <span>
                                        {selectedProvider
                                            ? `${deliveryPrice.toLocaleString()} DA`
                                            : "—"}
                                    </span>
                                </div>

                                <div
                                    className={
                                        styles.OrderForm__SummaryTotal
                                    }
                                >
                                    <span>
                                        المجموع
                                    </span>

                                    <span>
                                        {total.toLocaleString()}{" "}
                                        DA
                                    </span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className={
                                    styles.OrderForm__Submit
                                }
                                disabled={
                                    isOutOfStock ||
                                    loadingShipping ||
                                    submitting ||
                                    shippingUnavailable ||
                                    !selectedProvider ||
                                    !deliveryType ||
                                    (deliveryType ===
                                        "office" &&
                                        !selectedOffice)
                                }
                            >
                                {submitting
                                    ? "جاري إرسال الطلب..."
                                    : "أطلب الآن"}
                            </button>
                        </form>
                    )}
                </section>
            )}

            {submitted && (
                <div
                    className={
                        styles.OrderForm__SuccessOverlay
                    }
                    dir="rtl"
                    role="status"
                    aria-live="polite"
                >
                    <div
                        className={
                            styles.OrderForm__SuccessPopup
                        }
                    >
                        <div
                            className={
                                styles.OrderForm__SuccessIcon
                            }
                        >
                            <CheckCircle2
                                size={58}
                            />
                        </div>

                        <h3>
                            تم استلام طلبك بنجاح
                        </h3>

                        <p>
                            شكراً لطلبك، سيتصل بك فريقنا
                            قريباً لتأكيد الطلب.
                        </p>

                        <span
                            className={
                                styles.OrderForm__SuccessNote
                            }
                        >
                            الدفع عند الاستلام
                        </span>

                        <Link
                            to="/shop"
                            className={
                                styles.OrderForm__ShopButton
                            }
                        >
                            تصفح منتجات أخرى
                        </Link>
                    </div>
                </div>
            )}
        </>
    );
}