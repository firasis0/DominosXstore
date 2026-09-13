import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    Home,
    Building2,
    CheckCircle2,
    Minus,
    Plus,
} from "lucide-react";

import algeriaData from "@/../Data/AlgeriaData.json";
import deliveryData from "@/../Data/DeliveryOfficesData.json";

import styles from "./styles.module.scss";

export default function OrderForm({ product }) {
    const [fullName, setFullName] = useState("");
    const [provinceId, setProvinceId] = useState("");
    const [municipalityId, setMunicipalityId] =
        useState("");
    const [phone, setPhone] = useState("");

    const [deliveryType, setDeliveryType] =
        useState("home");

    const [officeId, setOfficeId] = useState("");

    const [quantity, setQuantity] = useState(1);

    const [submitted, setSubmitted] =
        useState(false);

    const provinces =
        algeriaData.provinces ?? [];

    const offices =
        deliveryData.offices ?? [];

    const prices =
        deliveryData.prices ?? [];

    /*
     * --------------------------------------------------
     * Selected province
     * --------------------------------------------------
     */

    const selectedProvince = useMemo(
        () =>
            provinces.find(
                (item) =>
                    String(item.id) ===
                    String(provinceId)
            ),
        [provinceId, provinces]
    );

    /*
     * --------------------------------------------------
     * Municipalities
     * --------------------------------------------------
     */

    const municipalities =
        selectedProvince?.municipalities ?? [];

    /*
     * --------------------------------------------------
     * Selected municipality
     * --------------------------------------------------
     */

    const selectedMunicipality = useMemo(
        () =>
            municipalities.find(
                (item) =>
                    String(item.id) ===
                    String(municipalityId)
            ),
        [municipalityId, municipalities]
    );

    /*
     * --------------------------------------------------
     * ZR price for selected province
     * --------------------------------------------------
     */

    const selectedPrice = useMemo(
        () =>
            prices.find(
                (item) =>
                    item.provider_id ===
                        "zr-express" &&
                    String(item.province_id) ===
                        String(provinceId) &&
                    item.is_active
            ),
        [prices, provinceId]
    );

    /*
     * --------------------------------------------------
     * ZR offices for selected province
     *
     * Priority:
     *
     * 1. Office in selected municipality
     * 2. Otherwise every office in province
     * --------------------------------------------------
     */

    const availableOffices = useMemo(() => {
        if (!provinceId) {
            return [];
        }

        const provinceOffices =
            offices.filter(
                (office) =>
                    office.provider_id ===
                        "zr-express" &&
                    String(office.province_id) ===
                        String(provinceId) &&
                    office.is_active &&
                    office.is_stop_desk
            );

        if (!municipalityId) {
            return provinceOffices;
        }

        const municipalityOffices =
            provinceOffices.filter(
                (office) =>
                    String(
                        office.municipality_id
                    ) ===
                    String(municipalityId)
            );

        /*
         * If the selected municipality has a
         * ZR office, only show those offices.
         *
         * Otherwise show every ZR office
         * available in the province.
         */
        return municipalityOffices.length > 0
            ? municipalityOffices
            : provinceOffices;
    }, [
        provinceId,
        municipalityId,
        offices,
    ]);

    /*
     * --------------------------------------------------
     * Does selected province have an office?
     * --------------------------------------------------
     */

    const hasOfficeDelivery =
        availableOffices.length > 0;

    /*
     * --------------------------------------------------
     * Delivery price
     *
     * IMPORTANT:
     *
     * Price depends on:
     * province + delivery type
     *
     * NOT on selected office.
     * --------------------------------------------------
     */

    const deliveryPrice = useMemo(() => {
        if (!selectedPrice) {
            return 0;
        }

        if (deliveryType === "office") {
            return selectedPrice.office_price ?? 0;
        }

        return selectedPrice.home_price ?? 0;
    }, [
        selectedPrice,
        deliveryType,
    ]);

    /*
     * --------------------------------------------------
     * Product price
     * --------------------------------------------------
     */

    const hasDiscount =
        product?.is_on_sale &&
        product?.discount_price != null;

    const productPrice = hasDiscount
        ? product.discount_price
        : product.price;

    /*
     * --------------------------------------------------
     * Total
     * --------------------------------------------------
     */

    const total =
        productPrice * quantity +
        deliveryPrice;

    /*
     * --------------------------------------------------
     * Stock
     * --------------------------------------------------
     */

    const isOutOfStock =
        !product || product.stock <= 0;

    /*
     * --------------------------------------------------
     * Province change
     * --------------------------------------------------
     */

    const handleProvinceChange = (event) => {
        const value = event.target.value;

        setProvinceId(value);

        setMunicipalityId("");
        setOfficeId("");
    };

    /*
     * --------------------------------------------------
     * Municipality change
     * --------------------------------------------------
     */

    const handleMunicipalityChange = (event) => {
        const value = event.target.value;

        setMunicipalityId(value);
        setOfficeId("");
    };

    /*
     * --------------------------------------------------
     * Delivery type change
     * --------------------------------------------------
     */

    const handleDeliveryTypeChange = (type) => {
        setDeliveryType(type);

        /*
         * Office selection only matters
         * when office delivery is selected.
         */
        if (type === "home") {
            setOfficeId("");
        }
    };

    /*
     * --------------------------------------------------
     * Quantity
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
            Math.max(current - 1, 1)
        );
    };

    /*
     * --------------------------------------------------
     * Submit
     * --------------------------------------------------
     *
     * For now this still simulates success.
     *
     * Later this object becomes the POST /orders
     * payload.
     * --------------------------------------------------
     */

    const handleSubmit = (event) => {
        event.preventDefault();

        if (isOutOfStock || submitted) {
            return;
        }

        /*
         * Prevent office orders without
         * a selected office.
         */
        if (
            deliveryType === "office" &&
            !officeId
        ) {
            return;
        }

        const orderData = {
            product_id: product.id,
            quantity,

            customer: {
                full_name: fullName,
                phone,
            },

            province_id: Number(provinceId),
            municipality_id:
                Number(municipalityId),

            delivery_type: deliveryType,

            office_id:
                deliveryType === "office"
                    ? officeId
                    : null,

            product_price: productPrice,
            delivery_price: deliveryPrice,
            total,
        };

        console.log(
            "Order payload:",
            orderData
        );

        setSubmitted(true);
    };

    /*
     * --------------------------------------------------
     * Render
     * --------------------------------------------------
     */

    return (
        <>
            {!submitted && (
                <section
                    className={styles.OrderForm}
                    id="order-form"
                    dir="rtl"
                >
                    <div
                        className={
                            styles.OrderForm__Heading
                        }
                    >
                        <h2>أطلب الآن</h2>
                        <p>الدفع عند الاستلام</p>
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
                                        quantity <= 1
                                    }
                                    aria-label="Decrease quantity"
                                >
                                    <Minus size={16} />
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
                                    <Plus size={16} />
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
                            onSubmit={handleSubmit}
                        >
                            {/* -------------------------
                                CUSTOMER
                            ------------------------- */}

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
                                    value={fullName}
                                    onChange={(event) =>
                                        setFullName(
                                            event.target
                                                .value
                                        )
                                    }
                                    placeholder="أدخل إسمك الكامل"
                                />
                            </div>

                            {/* -------------------------
                                LOCATION
                            ------------------------- */}

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
                                    >
                                        <option
                                            value=""
                                            disabled
                                        >
                                            اختر الولاية
                                        </option>

                                        {provinces.map(
                                            (province) => (
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
                                            !provinceId
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
                                            (item) => (
                                                <option
                                                    key={
                                                        item.id
                                                    }
                                                    value={
                                                        item.id
                                                    }
                                                >
                                                    {
                                                        item.commune_name
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>
                            </div>

                            {/* -------------------------
                                PHONE
                            ------------------------- */}

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
                                    value={phone}
                                    onChange={(event) =>
                                        setPhone(
                                            event.target
                                                .value
                                        )
                                    }
                                    placeholder="0555 12 34 56"
                                />
                            </div>

                            {/* -------------------------
                                DELIVERY TYPE
                            ------------------------- */}

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

                                <div
                                    className={
                                        styles.OrderForm__DeliveryOptions
                                    }
                                >
                                    {/* HOME */}

                                    <label
                                        className={`
                                            ${styles.OrderForm__DeliveryOption}
                                            ${
                                                deliveryType ===
                                                "home"
                                                    ? styles.OrderForm__DeliveryOptionActive
                                                    : ""
                                            }
                                        `}
                                    >
                                        <input
                                            type="radio"
                                            name="delivery_type"
                                            value="home"
                                            checked={
                                                deliveryType ===
                                                "home"
                                            }
                                            onChange={() =>
                                                handleDeliveryTypeChange(
                                                    "home"
                                                )
                                            }
                                        />

                                        <Home size={20} />

                                        <span>
                                            توصيل للمنزل
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
                                    </label>

                                    {/* OFFICE */}

                                    <label
                                        className={`
                                            ${styles.OrderForm__DeliveryOption}
                                            ${
                                                deliveryType ===
                                                "office"
                                                    ? styles.OrderForm__DeliveryOptionActive
                                                    : ""
                                            }
                                        `}
                                    >
                                        <input
                                            type="radio"
                                            name="delivery_type"
                                            value="office"
                                            checked={
                                                deliveryType ===
                                                "office"
                                            }
                                            onChange={() =>
                                                handleDeliveryTypeChange(
                                                    "office"
                                                )
                                            }
                                            disabled={
                                                provinceId &&
                                                !hasOfficeDelivery
                                            }
                                        />

                                        <Building2
                                            size={20}
                                        />

                                        <span>
                                            توصيل للمكتب
                                        </span>

                                        {deliveryType ===
                                            "office" && (
                                            <span
                                                className={
                                                    styles.OrderForm__Check
                                                }
                                            >
                                                ✓
                                            </span>
                                        )}
                                    </label>
                                </div>

                                {/* NO OFFICE */}

                                {provinceId &&
                                    !hasOfficeDelivery && (
                                        <p
                                            className={
                                                styles.OrderForm__DeliveryMessage
                                            }
                                        >
                                            لا يوجد مكتب
                                            ZR Express
                                            متاح في هذه
                                            الولاية.
                                            اختر التوصيل
                                            للمنزل.
                                        </p>
                                    )}
                            </div>

                            {/* -------------------------
                                ZR OFFICE
                            ------------------------- */}

                            {deliveryType ===
                                "office" &&
                                hasOfficeDelivery && (
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
                                            onChange={(
                                                event
                                            ) =>
                                                setOfficeId(
                                                    event
                                                        .target
                                                        .value
                                                )
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
                                                        }
                                                    </option>
                                                )
                                            )}
                                        </select>

                                        {selectedMunicipality &&
                                            availableOffices.some(
                                                (
                                                    office
                                                ) =>
                                                    String(
                                                        office.municipality_id
                                                    ) ===
                                                    String(
                                                        municipalityId
                                                    )
                                            ) && (
                                                <small
                                                    className={
                                                        styles.OrderForm__OfficeHint
                                                    }
                                                >
                                                    يوجد مكتب
                                                    ZR Express
                                                    في بلديتك
                                                </small>
                                            )}

                                        {selectedMunicipality &&
                                            availableOffices.length >
                                                0 &&
                                            !availableOffices.some(
                                                (
                                                    office
                                                ) =>
                                                    String(
                                                        office.municipality_id
                                                    ) ===
                                                    String(
                                                        municipalityId
                                                    )
                                            ) && (
                                                <small
                                                    className={
                                                        styles.OrderForm__OfficeHint
                                                    }
                                                >
                                                    لا يوجد
                                                    مكتب في
                                                    بلديتك،
                                                    يمكنك
                                                    اختيار
                                                    أي مكتب
                                                    متاح في
                                                    الولاية.
                                                </small>
                                            )}
                                    </div>
                                )}

                            {/* -------------------------
                                SUMMARY
                            ------------------------- */}

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

                                <div
                                    className={
                                        styles.OrderForm__SummaryRow
                                    }
                                >
                                    <span>
                                        سعر التوصيل
                                    </span>

                                    <span>
                                        {provinceId
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

                            {/* -------------------------
                                SUBMIT
                            ------------------------- */}

                            <button
                                type="submit"
                                className={
                                    styles.OrderForm__Submit
                                }
                                disabled={
                                    isOutOfStock ||
                                    (deliveryType ===
                                        "office" &&
                                        !officeId)
                                }
                            >
                                أطلب الآن
                            </button>
                        </form>
                    )}
                </section>
            )}

            {/* -------------------------
                SUCCESS
            ------------------------- */}

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
                            <CheckCircle2 size={58} />
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