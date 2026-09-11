import { useMemo, useState } from "react";
import { Home, Building2, CheckCircle2 } from "lucide-react";

import algeriaData from "@/../Data/AlgeriaData.json";

import styles from "./styles.module.scss";

export default function OrderForm({ product }) {
  const [fullName, setFullName] = useState("");
  const [provinceId, setProvinceId] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryType, setDeliveryType] = useState("home");
  const [submitted, setSubmitted] = useState(false);

  const provinces = algeriaData.provinces ?? [];

  const selectedProvince = useMemo(
    () =>
      provinces.find(
        (item) => String(item.id) === String(provinceId)
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [provinceId]
  );

  const municipalities = selectedProvince?.municipalities ?? [];

  const deliveryPrice = selectedProvince?.delivery_price ?? 0;
  const productPrice = product?.price ?? 0;
  const total = productPrice + deliveryPrice;

  const handleProvinceChange = (event) => {
    setProvinceId(event.target.value);
    setMunicipality("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section className={styles.OrderForm} id="order-form" dir="rtl">
        <div className={styles.OrderForm__Success}>
          <CheckCircle2 size={40} />
          <h3>تم استلام طلبك بنجاح</h3>
          <p>سيتصل بك فريقنا قريبًا لتأكيد الطلب</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.OrderForm} id="order-form" dir="rtl">
      <div className={styles.OrderForm__Heading}>
        <h2>أطلب الآن</h2>
        <p>الدفع عند الاستلام</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Customer info */}
        <div className={styles.OrderForm__Field}>
          <label htmlFor="fullName">الإسم الكامل</label>
          <input
            id="fullName"
            type="text"
            required
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="أدخل إسمك الكامل"
          />
        </div>

        <div className={styles.OrderForm__Row}>
          <div className={styles.OrderForm__Field}>
            <label htmlFor="province">الولاية</label>
            <select
              id="province"
              required
              value={provinceId}
              onChange={handleProvinceChange}
            >
              <option value="" disabled>
                اختر الولاية
              </option>
              {provinces.map((province) => (
                <option key={province.id} value={province.id}>
                  {province.id} - {province.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.OrderForm__Field}>
            <label htmlFor="municipality">البلدية</label>
            <select
              id="municipality"
              required
              disabled={!provinceId}
              value={municipality}
              onChange={(event) => setMunicipality(event.target.value)}
            >
              <option value="" disabled>
                {provinceId ? "اختر البلدية" : "اختر الولاية أولاً"}
              </option>
              {municipalities.map((item) => (
                <option key={item.id} value={item.commune_name}>
                  {item.commune_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.OrderForm__Field}>
          <label htmlFor="phone">رقم الهاتف</label>
          <input
            id="phone"
            type="tel"
            required
            pattern="0[5-7][0-9]{8}"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="0555 12 34 56"
          />
        </div>

        {/* Delivery type */}
        <div className={styles.OrderForm__Delivery}>
          <span className={styles.OrderForm__Label}>
            طريقة التوصيل
          </span>

          <div className={styles.OrderForm__DeliveryOptions}>
            <label
              className={`${styles.OrderForm__DeliveryOption} ${
                deliveryType === "home"
                  ? styles.OrderForm__DeliveryOptionActive
                  : ""
              }`}
            >
              <input
                type="radio"
                name="delivery_type"
                value="home"
                checked={deliveryType === "home"}
                onChange={() => setDeliveryType("home")}
              />

              <Home size={20} />

              <span>توصيل للمنزل</span>

              {deliveryType === "home" && (
                <span className={styles.OrderForm__Check}>
                  ✓
                </span>
              )}
            </label>

            <label
              className={`${styles.OrderForm__DeliveryOption} ${
                deliveryType === "office"
                  ? styles.OrderForm__DeliveryOptionActive
                  : ""
              }`}
            >
              <input
                type="radio"
                name="delivery_type"
                value="office"
                checked={deliveryType === "office"}
                onChange={() => setDeliveryType("office")}
              />

              <Building2 size={20} />

              <span>توصيل للمكتب</span>

              {deliveryType === "office" && (
                <span className={styles.OrderForm__Check}>
                  ✓
                </span>
              )}
            </label>
          </div>
        </div>

        {/* Price summary */}
        <div className={styles.OrderForm__Summary}>
          <div className={styles.OrderForm__SummaryRow}>
            <span>سعر المنتج</span>
            <span>{productPrice.toLocaleString()} DA</span>
          </div>

          <div className={styles.OrderForm__SummaryRow}>
            <span>سعر التوصيل</span>
            <span>
              {provinceId ? `${deliveryPrice.toLocaleString()} DA` : "—"}
            </span>
          </div>

          <div className={styles.OrderForm__SummaryTotal}>
            <span>المجموع</span>
            <span>{total.toLocaleString()} DA</span>
          </div>
        </div>

        <button
          type="submit"
          className={styles.OrderForm__Submit}
        >
          أطلب الآن
        </button>
      </form>
    </section>
  );
}
