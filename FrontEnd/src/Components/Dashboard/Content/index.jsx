import { useState } from "react";

import styles from "./styles.module.scss";

import About from "./About";
import Home from "./Home";
import Categories from "./Categories";

export default function Content() {
    const [activePage, setActivePage] = useState("about");

    return (
        <section className={styles.Content}>
            <div className={styles.Content__Header}>
                <div>
                    <span className={styles.Content__Eyebrow}>
                        Website management
                    </span>

                    <h1 className={styles.Content__Title}>
                        Content
                    </h1>

                    <p className={styles.Content__Description}>
                        Manage the visual content and website sections of your store.
                    </p>
                </div>
            </div>

            <div className={styles.Content__Layout}>
                <aside className={styles.Content__Navigation}>
                    <button
                        type="button"
                        className={`${styles.Content__NavigationItem} ${
                            activePage === "home"
                                ? styles.Content__NavigationItemActive
                                : ""
                        }`}
                        onClick={() => setActivePage("home")}
                    >
                        <span className={styles.Content__NavigationDot} />

                        <div>
                            <strong>Home</strong>
                            <span>Home page content</span>
                        </div>
                    </button>

                    <button
                        type="button"
                        className={`${styles.Content__NavigationItem} ${
                            activePage === "about"
                                ? styles.Content__NavigationItemActive
                                : ""
                        }`}
                        onClick={() => setActivePage("about")}
                    >
                        <span className={styles.Content__NavigationDot} />

                        <div>
                            <strong>About</strong>
                            <span>About page content</span>
                        </div>
                    </button>

                    <button
                        type="button"
                        className={`${styles.Content__NavigationItem} ${
                            activePage === "categories"
                                ? styles.Content__NavigationItemActive
                                : ""
                        }`}
                        onClick={() => setActivePage("categories")}
                    >
                        <span className={styles.Content__NavigationDot} />

                        <div>
                            <strong>Categories</strong>
                            <span>Categories page content</span>
                        </div>
                    </button>
                </aside>

                <div className={styles.Content__Page}>
                    {activePage === "home" && <Home />}

                    {activePage === "about" && <About />}

                    {activePage === "categories" && <Categories />}
                </div>
            </div>
        </section>
    );
}