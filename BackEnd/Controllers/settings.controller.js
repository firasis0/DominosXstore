import bcrypt from "bcrypt";
import pool from "../DB/db.js";

export async function getAccount(req, res) {
    try {
        const result = await pool.query(
            `
            SELECT
                id,
                email,
                is_active,
                created_at
            FROM admin_users
            WHERE id = $1
            `,
            [req.admin.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Administrator account not found.",
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                account: result.rows[0],
            },
        });
    } catch (error) {
        console.error(
            "Get account settings error:",
            error
        );

        return res.status(500).json({
            message: "Internal server error.",
        });
    }
}

export async function updateAccount(req, res) {
    try {
        const {
            currentEmail,
            newEmail,
        } = req.body;

        if (
            !currentEmail ||
            !currentEmail.trim() ||
            !newEmail ||
            !newEmail.trim()
        ) {
            return res.status(400).json({
                message:
                    "Current email and new email are required.",
            });
        }

        const normalizedCurrentEmail =
            currentEmail.trim().toLowerCase();

        const normalizedNewEmail =
            newEmail.trim().toLowerCase();

        if (
            normalizedCurrentEmail ===
            normalizedNewEmail
        ) {
            return res.status(400).json({
                message:
                    "The new email must be different from the current email.",
            });
        }

        /*
         * Get the authenticated administrator.
         */
        const adminResult =
            await pool.query(
                `
                SELECT
                    id,
                    email
                FROM admin_users
                WHERE id = $1
                `,
                [req.admin.id]
            );

        if (adminResult.rows.length === 0) {
            return res.status(404).json({
                message:
                    "Administrator account not found.",
            });
        }

        const admin =
            adminResult.rows[0];

        /*
         * Verify the current email.
         */
        if (
            admin.email.toLowerCase() !==
            normalizedCurrentEmail
        ) {
            return res.status(401).json({
                message:
                    "Current email is incorrect.",
            });
        }

        /*
         * Make sure another admin isn't
         * already using the new email.
         */
        const emailCheck =
            await pool.query(
                `
                SELECT id
                FROM admin_users
                WHERE email = $1
                  AND id <> $2
                `,
                [
                    normalizedNewEmail,
                    req.admin.id,
                ]
            );

        if (emailCheck.rows.length > 0) {
            return res.status(409).json({
                message:
                    "This email address is already in use.",
            });
        }

        const result =
            await pool.query(
                `
                UPDATE admin_users
                SET email = $1
                WHERE id = $2
                RETURNING
                    id,
                    email,
                    is_active,
                    created_at
                `,
                [
                    normalizedNewEmail,
                    req.admin.id,
                ]
            );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message:
                    "Administrator account not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Email address updated successfully.",
            data: {
                account:
                    result.rows[0],
            },
        });
    } catch (error) {
        console.error(
            "Update account settings error:",
            error
        );

        return res.status(500).json({
            message:
                "Internal server error.",
        });
    }
}

export async function updatePassword(req, res) {
    try {
        const {
            currentPassword,
            newPassword,
        } = req.body;

        if (
            !currentPassword ||
            !newPassword
        ) {
            return res.status(400).json({
                message:
                    "Current password and new password are required.",
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                message:
                    "New password must be at least 8 characters long.",
            });
        }

        const result = await pool.query(
            `
            SELECT
                id,
                password_hash
            FROM admin_users
            WHERE id = $1
            `,
            [req.admin.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Administrator account not found.",
            });
        }

        const admin = result.rows[0];

        const passwordMatches =
            await bcrypt.compare(
                currentPassword,
                admin.password_hash
            );

        if (!passwordMatches) {
            return res.status(401).json({
                message:
                    "Current password is incorrect.",
            });
        }

        const samePassword =
            await bcrypt.compare(
                newPassword,
                admin.password_hash
            );

        if (samePassword) {
            return res.status(400).json({
                message:
                    "New password must be different from the current password.",
            });
        }

        const passwordHash =
            await bcrypt.hash(
                newPassword,
                12
            );

        await pool.query(
            `
            UPDATE admin_users
            SET password_hash = $1
            WHERE id = $2
            `,
            [
                passwordHash,
                req.admin.id,
            ]
        );

        return res.status(200).json({
            success: true,
            message:
                "Password updated successfully.",
        });
    } catch (error) {
        console.error(
            "Update password error:",
            error
        );

        return res.status(500).json({
            message: "Internal server error.",
        });
    }
}