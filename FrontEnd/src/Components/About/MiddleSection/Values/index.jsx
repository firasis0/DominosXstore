import styles from "./styles.module.scss";

import {
  ShieldCheck,
  Zap,
  Gamepad2,
} from "lucide-react";

const values = [
  {
    id: 1,
    icon: ShieldCheck,
    title: "Quality",
    text: "Gaming gear selected for reliability, durability, and everyday use.",
  },
  {
    id: 2,
    icon: Zap,
    title: "Performance",
    text: "Equipment designed to keep up when every movement matters.",
  },
  {
    id: 3,
    icon: Gamepad2,
    title: "Gamers",
    text: "A store built around the people who spend their time playing.",
  },
];

export default function Values() {
  return (
    <section className={styles.Values}>
      <div className={styles.Values__Container}>

        <div className={styles.Values__Header}>
          <span className={styles.Values__Eyebrow}>
            What We Stand For
          </span>

          <h2 className={styles.Values__Title}>
            More than just gaming gear.
          </h2>

          <p className={styles.Values__Description}>
            We believe the right equipment should feel like an
            extension of the way you play.
          </p>
        </div>

        <div className={styles.Values__Grid}>
          {values.map((value) => {
            const Icon = value.icon;

            return (
              <article
                key={value.id}
                className={styles.Value}
              >
                <div className={styles.Value__Icon}>
                  <Icon />
                </div>

                <h3 className={styles.Value__Title}>
                  {value.title}
                </h3>

                <p className={styles.Value__Text}>
                  {value.text}
                </p>
              </article>
            );
          })}
        </div>

      </div>
    </section>
  );
}