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
import { resolveStoreImageUrl } from "../lib/storeData.js";

const StoreBrandingContext = createContext(null);
const DEFAULT_BRANDING = {
    name: "DOMINOS STORE",
    logoUrl: null,
};

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
                    setBranding(DEFAULT_BRANDING);
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

        const resolvedLogoUrl = resolveStoreImageUrl(branding.logoUrl);

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
            logoUrl: resolveStoreImageUrl(branding.logoUrl),
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
