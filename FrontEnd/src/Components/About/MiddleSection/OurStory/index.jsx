import styles from "./styles.module.scss";

export default function OurStory() {
  return (
    <section className={styles.OurStory}>
      <div className={styles.OurStory__Container}>

        <div id="ourStory" className={styles.OurStory__ImageWrapper}>
          <img
            src="/images/AboutPage/dominos_insta.jpg"
            alt="Gaming setup"
            className={styles.OurStory__Image}
          />
        </div>

        <div  className={styles.OurStory__Content}>
          <span className={styles.OurStory__Eyebrow}>
            Our Story
          </span>

          <h2 className={styles.OurStory__Title}>
            Built around gaming.
            <br />
            Driven by quality.
          </h2>

          <p className={styles.OurStory__Text}>
            DOMINOS was created for gamers who want better gear
            without unnecessary complexity. We bring together
            gaming equipment that combines performance, quality,
            and design.
          </p>

          <p className={styles.OurStory__Text}>
            From the mouse in your hand to the headset on your
            desk, every piece of equipment should make your
            gaming experience better.
          </p>

          <a
            href="/shop"
            className={styles.OurStory__Button}
          >
            Explore our shop
            <span>→</span>
          </a>
        </div>

      </div>
    </section>
  );
}