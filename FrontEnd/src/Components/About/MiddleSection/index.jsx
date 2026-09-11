import styles from "./styles.module.scss";

import OurStory from "./OurStory";
import Values from "./Values";
import Connect from "./Connect";

export default function MiddleSection() {
  return (
    <section className={styles.MiddleSection}>
      <OurStory />
      <Connect />
      <Values />
    </section>
  );
}