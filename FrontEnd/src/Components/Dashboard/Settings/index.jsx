import { useEffect, useState } from "react";
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

import { authFetch } from "../../../lib/authFetch.js";

export default function Settings() {
    const [
        showCurrentPassword,
        setShowCurrentPassword,
    ] = useState(false);

    const [
        showNewPassword,
        setShowNewPassword,
    ] = useState(false);

    const [
        showConfirmPassword,
        setShowConfirmPassword,
    ] = useState(false);

    const [
        currentEmail,
        setCurrentEmail,
    ] = useState("");

    const [
        newEmail,
        setNewEmail,
    ] = useState("");

    const [
        currentPassword,
        setCurrentPassword,
    ] = useState("");

    const [
        newPassword,
        setNewPassword,
    ] = useState("");

    const [
        confirmPassword,
        setConfirmPassword,
    ] = useState("");

    const [
        loadingAccount,
        setLoadingAccount,
    ] = useState(true);

    const [
        savingAccount,
        setSavingAccount,
    ] = useState(false);

    const [
        changingPassword,
        setChangingPassword,
    ] = useState(false);

    const [
        accountMessage,
        setAccountMessage,
    ] = useState("");

    const [
        accountError,
        setAccountError,
    ] = useState("");

    const [
        passwordMessage,
        setPasswordMessage,
    ] = useState("");

    const [
        passwordError,
        setPasswordError,
    ] = useState("");

    useEffect(() => {
        const controller =
            new AbortController();

        const loadAccount = async () => {
            try {
                setLoadingAccount(true);
                setAccountError("");

                const response =
                    await authFetch(
                        "/dashboard/settings/account",
                        {
                            signal:
                                controller.signal,
                        }
                    );

                const data =
                    await response.json();

                if (
                    !response.ok ||
                    !data.success
                ) {
                    throw new Error(
                        data.message ||
                            "Failed to load account information."
                    );
                }

                const account =
                    data.data?.account;

                if (account?.email) {
                    setCurrentEmail(
                        account.email
                    );
                }
            } catch (error) {
                if (
                    error.name ===
                    "AbortError"
                ) {
                    return;
                }

                console.error(
                    "Load account settings error:",
                    error
                );

                setAccountError(
                    error.message ||
                        "Failed to load account information."
                );
            } finally {
                if (
                    !controller.signal
                        .aborted
                ) {
                    setLoadingAccount(
                        false
                    );
                }
            }
        };

        loadAccount();

        return () => {
            controller.abort();
        };
    }, []);

    const handleAccountSubmit = async (
        event
    ) => {
        event.preventDefault();

        setAccountMessage("");
        setAccountError("");

        if (
            !currentEmail.trim()
        ) {
            setAccountError(
                "Current email is required."
            );
            return;
        }

        if (!newEmail.trim()) {
            setAccountError(
                "New email is required."
            );
            return;
        }

        const current =
            currentEmail
                .trim()
                .toLowerCase();

        const next =
            newEmail
                .trim()
                .toLowerCase();

        if (current === next) {
            setAccountError(
                "The new email must be different from the current email."
            );
            return;
        }

        setSavingAccount(true);

        try {
            const response =
                await authFetch(
                    "/dashboard/settings/account",
                    {
                        method: "PUT",
                        body: JSON.stringify(
                            {
                                currentEmail:
                                    current,
                                newEmail:
                                    next,
                            }
                        ),
                    }
                );

            const data =
                await response.json();

            if (
                !response.ok ||
                !data.success
            ) {
                throw new Error(
                    data.message ||
                        "Failed to update email address."
                );
            }

            setCurrentEmail(
                data.data?.account
                    ?.email || next
            );

            setNewEmail("");

            setAccountMessage(
                "Email address updated successfully."
            );
        } catch (error) {
            console.error(
                "Update account settings error:",
                error
            );

            setAccountError(
                error.message ||
                    "Failed to update email address."
            );
        } finally {
            setSavingAccount(false);
        }
    };

    const handlePasswordSubmit =
        async (event) => {
            event.preventDefault();

            setPasswordMessage("");
            setPasswordError("");

            if (!currentPassword) {
                setPasswordError(
                    "Current password is required."
                );
                return;
            }

            if (!newPassword) {
                setPasswordError(
                    "New password is required."
                );
                return;
            }

            if (
                newPassword.length < 8
            ) {
                setPasswordError(
                    "New password must be at least 8 characters long."
                );
                return;
            }

            if (
                newPassword !==
                confirmPassword
            ) {
                setPasswordError(
                    "New password and confirmation do not match."
                );
                return;
            }

            setChangingPassword(
                true
            );

            try {
                const response =
                    await authFetch(
                        "/dashboard/settings/password",
                        {
                            method: "PUT",
                            body: JSON.stringify(
                                {
                                    currentPassword,
                                    newPassword,
                                }
                            ),
                        }
                    );

                const data =
                    await response.json();

                if (
                    !response.ok ||
                    !data.success
                ) {
                    throw new Error(
                        data.message ||
                            "Failed to update password."
                    );
                }

                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");

                setPasswordMessage(
                    "Password updated successfully."
                );
            } catch (error) {
                console.error(
                    "Update password error:",
                    error
                );

                setPasswordError(
                    error.message ||
                        "Failed to update password."
                );
            } finally {
                setChangingPassword(
                    false
                );
            }
        };

    const handleLogout = () => {
        localStorage.removeItem(
            "token"
        );

        window.location.href = "/";
    };

    return (
        <div
            className={
                styles.SettingsPage
            }
        >
            <Sidebar activeItem="Settings" />

            <div
                className={
                    styles.SettingsPage__Main
                }
            >
                <main
                    className={
                        styles.Settings
                    }
                >
                    <div
                        className={
                            styles.Settings__Header
                        }
                    >
                        <div>
                            <span
                                className={
                                    styles.Settings__Eyebrow
                                }
                            >
                                Dashboard
                                configuration
                            </span>

                            <h1>
                                Settings
                            </h1>

                            <p>
                                Manage your
                                account,
                                password and
                                dashboard
                                session.
                            </p>
                        </div>
                    </div>

                    <div
                        className={
                            styles.Settings__Layout
                        }
                    >
                        <aside
                            className={
                                styles.Settings__Navigation
                            }
                        >
                            <a href="#account">
                                <User
                                    size={17}
                                />
                                <span>
                                    Account
                                </span>
                            </a>

                            <a href="#password">
                                <Lock
                                    size={17}
                                />
                                <span>
                                    Password
                                </span>
                            </a>

                            <a href="#session">
                                <LogOut
                                    size={17}
                                />
                                <span>
                                    Session
                                </span>
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
                                        <User
                                            size={18}
                                        />
                                    </div>

                                    <div>
                                        <h2>
                                            Account
                                        </h2>

                                        <p>
                                            Change
                                            the
                                            email
                                            address
                                            used
                                            to
                                            access
                                            the
                                            dashboard.
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
                                        <label htmlFor="current-email">
                                            Current
                                            email
                                            address
                                        </label>

                                        <input
                                            id="current-email"
                                            type="email"
                                            value={
                                                currentEmail
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setCurrentEmail(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            placeholder="Current email address"
                                            disabled={
                                                loadingAccount ||
                                                savingAccount
                                            }
                                            autoComplete="email"
                                        />
                                    </div>

                                    <div
                                        className={
                                            styles.Settings__Field
                                        }
                                    >
                                        <label htmlFor="new-email">
                                            New email
                                            address
                                        </label>

                                        <input
                                            id="new-email"
                                            type="email"
                                            value={
                                                newEmail
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setNewEmail(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            placeholder="Enter new email address"
                                            disabled={
                                                loadingAccount ||
                                                savingAccount
                                            }
                                            autoComplete="email"
                                        />
                                    </div>

                                    {accountError && (
                                        <div
                                            className={
                                                styles.Settings__Error
                                            }
                                        >
                                            {
                                                accountError
                                            }
                                        </div>
                                    )}

                                    {accountMessage && (
                                        <div
                                            className={
                                                styles.Settings__Success
                                            }
                                        >
                                            {
                                                accountMessage
                                            }
                                        </div>
                                    )}

                                    <div
                                        className={
                                            styles.Settings__Actions
                                        }
                                    >
                                        <button
                                            type="submit"
                                            disabled={
                                                loadingAccount ||
                                                savingAccount
                                            }
                                        >
                                            <Save
                                                size={
                                                    15
                                                }
                                            />

                                            {savingAccount
                                                ? "Saving..."
                                                : "Save changes"}
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
                                        <Lock
                                            size={18}
                                        />
                                    </div>

                                    <div>
                                        <h2>
                                            Password
                                        </h2>

                                        <p>
                                            Change
                                            the
                                            password
                                            used
                                            to
                                            access
                                            the
                                            dashboard.
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
                                            Current
                                            password
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
                                                onChange={(
                                                    event
                                                ) =>
                                                    setCurrentPassword(
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                                placeholder="Enter current password"
                                                autoComplete="current-password"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowCurrentPassword(
                                                        (
                                                            value
                                                        ) =>
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
                                                    <EyeOff
                                                        size={
                                                            17
                                                        }
                                                    />
                                                ) : (
                                                    <Eye
                                                        size={
                                                            17
                                                        }
                                                    />
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
                                            New
                                            password
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
                                                value={
                                                    newPassword
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setNewPassword(
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                                placeholder="Enter new password"
                                                autoComplete="new-password"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowNewPassword(
                                                        (
                                                            value
                                                        ) =>
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
                                                    <EyeOff
                                                        size={
                                                            17
                                                        }
                                                    />
                                                ) : (
                                                    <Eye
                                                        size={
                                                            17
                                                        }
                                                    />
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
                                            Confirm
                                            new
                                            password
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
                                                onChange={(
                                                    event
                                                ) =>
                                                    setConfirmPassword(
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                                placeholder="Confirm new password"
                                                autoComplete="new-password"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowConfirmPassword(
                                                        (
                                                            value
                                                        ) =>
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
                                                    <EyeOff
                                                        size={
                                                            17
                                                        }
                                                    />
                                                ) : (
                                                    <Eye
                                                        size={
                                                            17
                                                        }
                                                    />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {passwordError && (
                                        <div
                                            className={
                                                styles.Settings__Error
                                            }
                                        >
                                            {
                                                passwordError
                                            }
                                        </div>
                                    )}

                                    {passwordMessage && (
                                        <div
                                            className={
                                                styles.Settings__Success
                                            }
                                        >
                                            {
                                                passwordMessage
                                            }
                                        </div>
                                    )}

                                    <div
                                        className={
                                            styles.Settings__Actions
                                        }
                                    >
                                        <button
                                            type="submit"
                                            disabled={
                                                changingPassword
                                            }
                                        >
                                            <Save
                                                size={
                                                    15
                                                }
                                            />

                                            {changingPassword
                                                ? "Updating..."
                                                : "Update password"}
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
                                        <LogOut
                                            size={18}
                                        />
                                    </div>

                                    <div>
                                        <h2>
                                            Session
                                        </h2>

                                        <p>
                                            Sign
                                            out
                                            of
                                            the
                                            administrator
                                            dashboard
                                            on
                                            this
                                            device.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className={
                                        styles.Settings__Logout
                                    }
                                    onClick={
                                        handleLogout
                                    }
                                >
                                    <LogOut
                                        size={15}
                                    />
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