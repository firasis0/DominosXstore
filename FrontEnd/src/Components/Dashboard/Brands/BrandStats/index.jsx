import styles from "./styles.module.scss";

const BrandStats = ({ brands }) => {
  const total = brands.length;

  const active = brands.filter(
    (brand) => brand.is_active
  ).length;

  const inactive = total - active;

  const stats = [
    {
      label: "Total Brands",
      value: total
    },
    {
      label: "Active",
      value: active
    },
    {
      label: "Inactive",
      value: inactive
    }
  ];

  return (
    <div className={styles.Stats}>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={styles.Stats__Card}
        >
          <span className={styles.Stats__Label}>
            {stat.label}
          </span>

          <strong className={styles.Stats__Value}>
            {stat.value}
          </strong>
        </div>
      ))}
    </div>
  );
};

export default BrandStats;