import styles from "./styles.module.scss";

const CategoryStats = ({ categories }) => {
  const total = categories.length;

  const active = categories.filter(
    (category) => category.is_active
  ).length;

  const inactive = total - active;

  const stats = [
    {
      label: "Total Categories",
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

export default CategoryStats;