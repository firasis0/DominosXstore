import styles from "./styles.module.scss";

import AboutData from "../../../../../Data/AboutData.json";

import { FaTiktok, FaInstagram } from "react-icons/fa";
import { SiGmail } from "react-icons/si";
import { ArrowUpRight } from "lucide-react";

const socialLinks = AboutData.MiddleSection.socialLinks;

const socialIcons = {
  tiktok: FaTiktok,
  instagram: FaInstagram,
  email: SiGmail,
};

export default function Connect() {
  return (
    <section className={styles.Connect}>
      <div className={styles.Connect__Container}>

        <div id="contact" className={styles.Connect__Header}>
          <span className={styles.Connect__Eyebrow}>
            Stay Connected
          </span>

          <h2 className={styles.Connect__Title}>
            Let&apos;s connect.
          </h2>

          <p className={styles.Connect__Description}>
            Follow DOMINOS, discover new gear, and stay up to date
            with everything happening in the gaming world.
          </p>
        </div>

        <div className={styles.Connect__Grid}>
          {socialLinks.map((social) => {
            const Icon = socialIcons[social.type];

            return (
              <a
                key={social.id}
                href={social.href}
                target={
                  social.type === "email"
                    ? undefined
                    : "_blank"
                }
                rel={
                  social.type === "email"
                    ? undefined
                    : "noopener noreferrer"
                }
                className={styles.SocialCard}
              >
                <div className={styles.SocialCard__Top}>
                  <div className={styles.SocialCard__Icon}>
                    {Icon && <Icon />}
                  </div>

                  <ArrowUpRight
                    className={styles.SocialCard__Arrow}
                  />
                </div>

                <div className={styles.SocialCard__Info}>
                  <span className={styles.SocialCard__Name}>
                    {social.name}
                  </span>

                  <span className={styles.SocialCard__Username}>
                    {social.username}
                  </span>
                </div>
              </a>
            );
          })}
        </div>

      </div>
    </section>
  );
}