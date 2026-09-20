import { useState } from "react";
import {
    User,
    Lock,
    LogOut,
    Save,
    Eye,
    EyeOff,
} from "lucide-react";

import Sidebar from "../Sidebar";
import styles from "./styles.module.scss";

export default function Settings() {
    const [showCurrentPassword, setShowCurrentPassword] =
        useState(false);

    const [showNewPassword, setShowNewPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [email, setEmail] = useState("");

    const [currentPassword, setCurrentPassword] =
        useState("");

    const [newPassword, setNewPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const handleAccountSubmit = (event) => {
        event.preventDefault();

        console.log("Account settings:", {
            email,
        });
    };

    const handlePasswordSubmit = (event) => {
        event.preventDefault();

        if (newPassword !== confirmPassword) {
            return;
        }

        console.log("Password change requested.");
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/admin/login";
    };

    return (
        <div className={styles.SettingsPage}>
            <Sidebar activeItem="Settings" />

            <div className={styles.SettingsPage__Main}>
                <main className={styles.Settings}>
                    <div className={styles.Settings__Header}>
                        <div>
                            <span
                                className={
                                    styles.Settings__Eyebrow
                                }
                            >
                                Dashboard configuration
                            </span>

                            <h1>Settings</h1>

                            <p>
                                Manage your account, password and
                                dashboard session.
                            </p>
                        </div>
                    </div>

                    <div className={styles.Settings__Layout}>
                        <aside
                            className={
                                styles.Settings__Navigation
                            }
                        >
                            <a href="#account">
                                <User size={17} />
                                <span>Account</span>
                            </a>

                            <a href="#password">
                                <Lock size={17} />
                                <span>Password</span>
                            </a>

                            <a href="#session">
                                <LogOut size={17} />
                                <span>Session</span>
                            </a>
                        </aside>

                        <div
                            className={
                                styles.Settings__Content
                            }
                        >
                            <section
                                id="account"
                                className={
                                    styles.Settings__Card
                                }
                            >
                                <div
                                    className={
                                        styles.Settings__CardHeader
                                    }
                                >
                                    <div
                                        className={
                                            styles.Settings__CardIcon
                                        }
                                    >
                                        <User size={18} />
                                    </div>

                                    <div>
                                        <h2>Account</h2>

                                        <p>
                                            Manage your administrator
                                            account information.
                                        </p>
                                    </div>
                                </div>

                                <form
                                    className={
                                        styles.Settings__Form
                                    }
                                    onSubmit={
                                        handleAccountSubmit
                                    }
                                >
                                    <div
                                        className={
                                            styles.Settings__Field
                                        }
                                    >
                                        <label htmlFor="admin-email">
                                            Email address
                                        </label>

                                        <input
                                            id="admin-email"
                                            type="email"
                                            value={email}
                                            onChange={(event) =>
                                                setEmail(
                                                    event.target.value
                                                )
                                            }
                                            placeholder="admin@example.com"
                                        />
                                    </div>

                                    <div
                                        className={
                                            styles.Settings__Actions
                                        }
                                    >
                                        <button type="submit">
                                            <Save size={15} />
                                            Save changes
                                        </button>
                                    </div>
                                </form>
                            </section>

                            <section
                                id="password"
                                className={
                                    styles.Settings__Card
                                }
                            >
                                <div
                                    className={
                                        styles.Settings__CardHeader
                                    }
                                >
                                    <div
                                        className={
                                            styles.Settings__CardIcon
                                        }
                                    >
                                        <Lock size={18} />
                                    </div>

                                    <div>
                                        <h2>Password</h2>

                                        <p>
                                            Change the password used to
                                            access the dashboard.
                                        </p>
                                    </div>
                                </div>

                                <form
                                    className={
                                        styles.Settings__Form
                                    }
                                    onSubmit={
                                        handlePasswordSubmit
                                    }
                                >
                                    <div
                                        className={
                                            styles.Settings__Field
                                        }
                                    >
                                        <label htmlFor="current-password">
                                            Current password
                                        </label>

                                        <div
                                            className={
                                                styles.Settings__Password
                                            }
                                        >
                                            <input
                                                id="current-password"
                                                type={
                                                    showCurrentPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                value={
                                                    currentPassword
                                                }
                                                onChange={(event) =>
                                                    setCurrentPassword(
                                                        event.target
                                                            .value
                                                    )
                                                }
                                                placeholder="Enter current password"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowCurrentPassword(
                                                        (value) =>
                                                            !value
                                                    )
                                                }
                                                aria-label={
                                                    showCurrentPassword
                                                        ? "Hide password"
                                                        : "Show password"
                                                }
                                            >
                                                {showCurrentPassword ? (
                                                    <EyeOff size={17} />
                                                ) : (
                                                    <Eye size={17} />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div
                                        className={
                                            styles.Settings__Field
                                        }
                                    >
                                        <label htmlFor="new-password">
                                            New password
                                        </label>

                                        <div
                                            className={
                                                styles.Settings__Password
                                            }
                                        >
                                            <input
                                                id="new-password"
                                                type={
                                                    showNewPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                value={newPassword}
                                                onChange={(event) =>
                                                    setNewPassword(
                                                        event.target
                                                            .value
                                                    )
                                                }
                                                placeholder="Enter new password"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowNewPassword(
                                                        (value) =>
                                                            !value
                                                    )
                                                }
                                                aria-label={
                                                    showNewPassword
                                                        ? "Hide password"
                                                        : "Show password"
                                                }
                                            >
                                                {showNewPassword ? (
                                                    <EyeOff size={17} />
                                                ) : (
                                                    <Eye size={17} />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div
                                        className={
                                            styles.Settings__Field
                                        }
                                    >
                                        <label htmlFor="confirm-password">
                                            Confirm new password
                                        </label>

                                        <div
                                            className={
                                                styles.Settings__Password
                                            }
                                        >
                                            <input
                                                id="confirm-password"
                                                type={
                                                    showConfirmPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                value={
                                                    confirmPassword
                                                }
                                                onChange={(event) =>
                                                    setConfirmPassword(
                                                        event.target
                                                            .value
                                                    )
                                                }
                                                placeholder="Confirm new password"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowConfirmPassword(
                                                        (value) =>
                                                            !value
                                                    )
                                                }
                                                aria-label={
                                                    showConfirmPassword
                                                        ? "Hide password"
                                                        : "Show password"
                                                }
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff size={17} />
                                                ) : (
                                                    <Eye size={17} />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div
                                        className={
                                            styles.Settings__Actions
                                        }
                                    >
                                        <button type="submit">
                                            <Save size={15} />
                                            Update password
                                        </button>
                                    </div>
                                </form>
                            </section>

                            <section
                                id="session"
                                className={`${styles.Settings__Card} ${styles.Settings__Danger}`}
                            >
                                <div
                                    className={
                                        styles.Settings__CardHeader
                                    }
                                >
                                    <div
                                        className={
                                            styles.Settings__DangerIcon
                                        }
                                    >
                                        <LogOut size={18} />
                                    </div>

                                    <div>
                                        <h2>Session</h2>

                                        <p>
                                            Sign out of the administrator
                                            dashboard on this device.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className={
                                        styles.Settings__Logout
                                    }
                                    onClick={handleLogout}
                                >
                                    <LogOut size={15} />
                                    Sign out
                                </button>
                            </section>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}