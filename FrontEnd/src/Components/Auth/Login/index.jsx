import { useState } from "react";

import styles from "./styles.module.scss";

import {
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";

import { Link } from "react-router-dom";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={styles.Login}>
      {/* Logo */}
      <Link to="/" className={styles.Login__Logo}>
        <img
          src="/images/logo/dominos_logo.jpg"
          alt="DOMINOS"
        />
      </Link>

      {/* Form */}
      <div className={styles.Login__Card}>
        <div className={styles.Login__Header}>
          <span className={styles.Login__Eyebrow}>
            Welcome back
          </span>

          <h1 className={styles.Login__Title}>
            Sign in to DOMINOS
          </h1>

          
        </div>

        <form className={styles.Login__Form}>
          {/* Email */}
          <div className={styles.Login__Field}>
            <label htmlFor="email">
              Email address
            </label>

            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className={styles.Login__Field}>
            <div className={styles.Login__PasswordLabel}>
              <label htmlFor="password">
                Password
              </label>

              <Link to="/forgot-password">
                Forgot password?
              </Link>
            </div>

            <div className={styles.Login__PasswordWrapper}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
              />

              <button
                type="button"
                className={styles.Login__PasswordToggle}
                onClick={() =>
                  setShowPassword((previous) => !previous)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          {/* Remember */}
          <label className={styles.Login__Remember}>
            <input type="checkbox" />
            <span>Remember me</span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            className={styles.Login__Submit}
          >
            Sign in
          </button>
        </form>

       
        {/* Back */}
        <Link
          to="/"
          className={styles.Login__Back}
        >
          <ArrowLeft />
          Back to store
        </Link>
      </div>
    </div>
  );
}