import { ArrowUpRight, Check, FileText, ShieldCheck, Truck, Undo2 } from "lucide-react";
import { Link } from "react-router-dom";
import FixedTopBar from "@/Components/TopSection/FixedTopBar";
import Navbar from "@/Components/TopSection/Navbar";
import Footer from "@/Components/Footer";
import styles from "./styles.module.scss";

const policyLinks = [
  { id: "terms", label: "Terms & Conditions", icon: FileText },
  { id: "shipping", label: "Shipping & Delivery", icon: Truck },
  { id: "returns", label: "Returns & Refunds", icon: Undo2 },
  { id: "privacy", label: "Privacy Policy", icon: ShieldCheck },
];

function PolicySection({ id, number, title, intro, children }) {
  return (
    <section className={styles.PolicySection} id={id}>
      <div className={styles.PolicySection__Heading}>
        <span className={styles.PolicySection__Number}>{number}</span>
        <div>
          <p className={styles.PolicySection__Eyebrow}>DOMINOS policy</p>
          <h2>{title}</h2>
        </div>
      </div>
      <div className={styles.PolicySection__Body}>
        <p className={styles.PolicySection__Intro}>{intro}</p>
        {children}
      </div>
    </section>
  );
}

function Points({ items }) {
  return (
    <ul className={styles.Points}>
      {items.map((item) => (
        <li key={item}>
          <Check aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function PoliciesPage() {
  return (
    <div className={styles.PoliciesPage}>
      <FixedTopBar />
      <Navbar />

      <main>
        <header className={styles.PoliciesHero}>
          <div className={styles.PoliciesHero__Meta}>
            <span>Customer care</span>
            <span>Last updated · September 2026</span>
          </div>
          <p className={styles.PoliciesHero__Kicker}>The DOMINOS standard</p>
          <h1>Good gear.<br /><em>Clear terms.</em></h1>
          <p className={styles.PoliciesHero__Summary}>
            Everything you need to know about shopping with DOMINOS, from checkout to delivery, returns, and the way we protect your information.
          </p>
        </header>

        <div className={styles.PoliciesLayout}>
          <aside className={styles.PolicyIndex}>
            <p className={styles.PolicyIndex__Label}>On this page</p>
            <nav aria-label="Policy sections">
              {policyLinks.map(({ id, label, icon: Icon }) => (
                <a href={`#${id}`} key={id}>
                  <Icon aria-hidden="true" />
                  <span>{label}</span>
                  <ArrowUpRight aria-hidden="true" />
                </a>
              ))}
            </nav>
            <div className={styles.PolicyIndex__Note}>
              <span>Need a hand?</span>
              <Link to="/about#contact">Contact our team <ArrowUpRight aria-hidden="true" /></Link>
            </div>
          </aside>

          <div className={styles.PolicyContent}>
            <PolicySection id="terms" number="01" title="Terms & Conditions" intro="These terms help keep every DOMINOS order straightforward, fair, and secure. By using our website, you agree to the following conditions.">
              <h3>Shopping with DOMINOS</h3>
              <p>You must provide accurate information when creating an account or placing an order. Product descriptions, prices, availability, and promotions may change without notice. An order is confirmed once you receive our order confirmation message.</p>
              <h3>Account and payment</h3>
              <p>You are responsible for keeping your account details secure. Payments are processed through approved payment providers, and we do not store complete card details. We may cancel an order where a payment cannot be verified or an item is unavailable.</p>
              <h3>Using our content</h3>
              <p>All DOMINOS branding, imagery, copy, and website content belong to DOMINOS or our partners. You may use the site for personal shopping only and must not copy, resell, or misuse its content.</p>
            </PolicySection>

            <PolicySection id="shipping" number="02" title="Shipping & Delivery" intro="We work to get your setup to you quickly and in excellent condition. Delivery estimates are shown at checkout and begin once your order is confirmed.">
              <h3>Delivery essentials</h3>
              <Points items={["Orders are dispatched on business days after payment verification.", "Delivery times vary by destination, stock status, and carrier capacity.", "You will receive tracking details when your package leaves our warehouse.", "Please check your parcel at delivery and report visible damage promptly."]} />
              <h3>When delivery takes longer</h3>
              <p>Unexpected carrier delays, weather, public holidays, or incomplete address details can affect an estimated date. If tracking has not moved for three business days, contact us with your order number so we can investigate.</p>
            </PolicySection>

            <PolicySection id="returns" number="03" title="Returns & Refunds" intro="Changed your mind? We aim to make returns uncomplicated. Start your request within 14 days of delivery, provided the product meets the conditions below.">
              <h3>Eligible returns</h3>
              <Points items={["The item is unused and in its original condition.", "All original packaging, accessories, manuals, and seals are included.", "The product is not custom-made, digital-only, or marked as final sale.", "You have proof of purchase and the return request is approved first."]} />
              <h3>Refund process</h3>
              <p>Once your return reaches us, we inspect it and email you with the result. Approved refunds are sent to the original payment method within 5 to 10 business days. Original delivery charges are refundable only when the item is faulty or we sent the wrong product. Return shipping for a change of mind may be deducted from the refund.</p>
            </PolicySection>

            <PolicySection id="privacy" number="04" title="Privacy Policy" intro="Your trust matters. This policy explains what information DOMINOS collects, why we use it, and the choices you have over it.">
              <h3>What we collect</h3>
              <p>We may collect your name, contact details, delivery address, order history, and information you provide when contacting support. We also receive limited technical information, such as device and browser details, to keep the site reliable.</p>
              <h3>How we use it</h3>
              <p>We use your information to process orders, arrange delivery, provide support, prevent fraud, improve our store, and send marketing only where you have given permission. We share necessary details with trusted payment, delivery, and technology partners who help us provide these services.</p>
              <h3>Your choices</h3>
              <p>You can ask to access, correct, or delete your personal information, or unsubscribe from marketing at any time. To make a privacy request, contact us through our <Link to="/about#contact">contact page</Link>.</p>
            </PolicySection>

            <div className={styles.PolicyClosing}>
              <span className={styles.PolicyClosing__Mark}>D</span>
              <div>
                <p>Questions about a policy?</p>
                <Link to="/about#contact">We are here to help <ArrowUpRight aria-hidden="true" /></Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}