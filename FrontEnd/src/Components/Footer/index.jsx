import { Link } from "react-router-dom";
import styles from "./styles.module.scss";



const shopLinks = [
  { name: "All Products", href: "/shop#shop" },
  { name: "Gaming Mouse", href: "/categories/Gaming%20Mouse#category-detail-header" },
  { name: "Keyboards", href: "/categories/Keyboards#category-detail-header" },
  { name: "Headsets", href: "/categories/Headsets#category-detail-header" },
  { name: "Controllers", href: "/categories/Controllers#category-detail-header" },
  { name: "Best Deals", href: "/shop?onSale=true#shop" },
];

const supportLinks = [
  { name: "Contact Us", href: "/about#contact" },
  { name: "Shipping & Delivery", href: "/policies#shipping" },
  { name: "Returns & Refunds", href: "/policies#returns" },
  
];

const companyLinks = [
  { name: "About DOMINOS", href: "/about" },
  { name: "Our Story", href: "/about#ourStory" },
  { name: "Privacy Policy", href: "/policies#privacy" },
  { name: "Terms & Conditions", href: "/policies#terms" },
];

const date = new Date()
const currentYear = date.getFullYear()

export default function Footer() {
  return (
    <footer className={styles.Footer}>
      <div className={styles.Footer__Container}>

        {/* ==============================
            MAIN FOOTER
        ============================== */}

        <div className={styles.Footer__Main}>

          {/* Brand */}
          <div className={styles.Footer__Brand}>
            <Link to="/" className={styles.Footer__Logo}>
              <img
                src="/images/logo/dominos_logo.jpg"
                alt="DOMINOS"
              />
            </Link>

            <p className={styles.Footer__Description}>
              Your destination for gaming gear.
              Discover the equipment you need to
              play better, compete harder, and enjoy
              every game.
            </p>

           
          </div>


          {/* Shop */}
          <div className={styles.Footer__Column}>
            <h3>Shop</h3>

            <nav>
              {shopLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>


          {/* Support */}
          <div className={styles.Footer__Column}>
            <h3>Support</h3>

            <nav>
              {supportLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>


          {/* Company */}
          <div className={styles.Footer__Column}>
            <h3>Company</h3>

            <nav>
              {companyLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>


          

        </div>


        {/* ==============================
            BOTTOM FOOTER
        ============================== */}

        <div className={styles.Footer__Bottom}>

          <p>
            © {currentYear} powerd by <a className={styles.feeqra} href="https://feeqra.com/">Feeqra</a> All rights reserved.
          </p>

          <div className={styles.Footer__BottomLinks}>
            <Link href="/policies#privacy">
              Privacy
            </Link>

            <Link href="/policies#terms">
              Terms
            </Link>

            <Link key='socials' to="/about#contact">
              Contact
            </Link>
          </div>

        </div>

      </div>
    </footer>
  );
}