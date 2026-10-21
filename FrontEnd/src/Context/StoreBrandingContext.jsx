/* eslint-disable react-refresh/only-export-components */
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import { API_BASE_URL } from "../lib/authFetch.js";

const StoreBrandingContext = createContext(null);
const DEFAULT_BRANDING = {
    name: "DOMINOS STORE",
    logoUrl: null,
};

const API_SERVER_URL = API_BASE_URL.replace(/\/api\/?$/, "");

function resolveLogoUrl(logoUrl) {
    if (!logoUrl) {
        return null;
    }

    if (/^https?:\/\//i.test(logoUrl)) {
        return logoUrl;
    }

    if (logoUrl.startsWith("/uploads/")) {
        return `${API_SERVER_URL}${logoUrl}`;
    }

    return logoUrl;
}

export function StoreBrandingProvider({ children }) {
    const [branding, setBranding] = useState(DEFAULT_BRANDING);

    useEffect(() => {
        const controller = new AbortController();

        const loadBranding = async () => {
            try {
                const response = await fetch(
                    `${API_BASE_URL}/content/branding`,
                    { signal: controller.signal }
                );
                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(
                        data.message || "Failed to load store branding."
                    );
                }

                if (data.data?.branding) {
                    setBranding(data.data.branding);
                }
            } catch (error) {
                if (error.name !== "AbortError") {
                    console.error("Load store branding error:", error);
                }
            }
        };

        loadBranding();

        return () => controller.abort();
    }, []);

    useEffect(() => {
        document.title = branding.name;

        document.head.querySelectorAll("meta[content]").forEach((element) => {
            element.content = element.content.replace(
                /DOMINOS STORE/gi,
                branding.name
            );
        });

        let favicon = document.head.querySelector(
            'link[rel="icon"][data-store-branding]'
        );

        const resolvedLogoUrl = resolveLogoUrl(branding.logoUrl);

        if (resolvedLogoUrl) {
            if (!favicon) {
                favicon = document.createElement("link");
                favicon.rel = "icon";
                favicon.dataset.storeBranding = "true";
                document.head.appendChild(favicon);
            }

            favicon.href = resolvedLogoUrl;
        } else {
            favicon?.remove();
        }
    }, [branding]);

    const updateBranding = useCallback((nextBranding) => {
        setBranding(nextBranding);
    }, []);

    const value = useMemo(
        () => ({
            name: branding.name || DEFAULT_BRANDING.name,
            logoUrl: resolveLogoUrl(branding.logoUrl),
            updateBranding,
        }),
        [branding, updateBranding]
    );

    return (
        <StoreBrandingContext.Provider value={value}>
            {children}
        </StoreBrandingContext.Provider>
    );
}

export function useStoreBranding() {
    const context = useContext(StoreBrandingContext);

    if (!context) {
        throw new Error(
            "useStoreBranding must be used inside StoreBrandingProvider"
        );
    }

    return context;
}
