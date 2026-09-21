import { useState } from "react";
import styles from "./styles.module.scss";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import {
    Link,
    Navigate,
    useNavigate,
} from "react-router-dom";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:3002/api";

function hasValidToken() {
    const token = localStorage.getItem("token");

    if (!token) {
        return false;
    }

    try {
        const tokenParts = token.split(".");

        if (tokenParts.length !== 3) {
            localStorage.removeItem("token");
            return false;
        }

        const payload = JSON.parse(
            atob(
                tokenParts[1]
                    .replace(/-/g, "+")
                    .replace(/_/g, "/")
            )
        );

        if (
            !payload.exp ||
            payload.exp * 1000 <= Date.now()
        ) {
            localStorage.removeItem("token");
            return false;
        }

        return true;
    } catch (error) {
        console.error(
            "Session validation error:",
            error
        );

        localStorage.removeItem("token");

        return false;
    }
}

export default function Login() {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    /*
     * If the admin already has a valid token,
     * redirect them to the dashboard.
     */
    if (hasValidToken()) {
        return <Navigate to="/dashboard" replace />;
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setIsLoading(true);

        try {
            const response = await fetch(
                `${API_BASE_URL}/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Unable to sign in."
                );
            }

            localStorage.setItem(
                "token",
                data.token
            );

            navigate("/dashboard");
        } catch (error) {
            setError(
                error.message ||
                    "Unable to sign in."
            );
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className={styles.Login}>
            <Link
                to="/"
                className={styles.Login__Logo}
            >
                <img
                    src="/images/logo/dominos_logo.jpg"
                    alt="DOMINOS"
                />
            </Link>

            <div className={styles.Login__Card}>
                <div className={styles.Login__Header}>
                    <span
                        className={
                            styles.Login__Eyebrow
                        }
                    >
                        Welcome back
                    </span>

                    <h1
                        className={
                            styles.Login__Title
                        }
                    >
                        Sign in to DOMINOS
                    </h1>
                </div>

                <form
                    className={styles.Login__Form}
                    onSubmit={handleSubmit}
                >
                    <div
                        className={
                            styles.Login__Field
                        }
                    >
                        <label htmlFor="email">
                            Email address
                        </label>

                        <input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            autoComplete="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(
                                    event.target.value
                                )
                            }
                            required
                        />
                    </div>

                    <div
                        className={
                            styles.Login__Field
                        }
                    >
                        <div
                            className={
                                styles.Login__PasswordLabel
                            }
                        >
                            <label htmlFor="password">
                                Password
                            </label>

                            <Link to="/forgot-password">
                                Forgot password?
                            </Link>
                        </div>

                        <div
                            className={
                                styles.Login__PasswordWrapper
                            }
                        >
                            <input
                                id="password"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(
                                        event.target.value
                                    )
                                }
                                required
                            />

                            <button
                                type="button"
                                className={
                                    styles.Login__PasswordToggle
                                }
                                onClick={() =>
                                    setShowPassword(
                                        (previous) =>
                                            !previous
                                    )
                                }
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                {showPassword ? (
                                    <EyeOff />
                                ) : (
                                    <Eye />
                                )}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <p
                            className={
                                styles.Login__Error
                            }
                        >
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        className={
                            styles.Login__Submit
                        }
                        disabled={isLoading}
                    >
                        {isLoading
                            ? "Signing in..."
                            : "Sign in"}
                    </button>
                </form>

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