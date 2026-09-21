const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:3002/api"
).replace(/\/+$/, "");

export async function authFetch(
    path,
    options = {}
) {
    const token =
        localStorage.getItem("token");

    const headers = new Headers(
        options.headers || {}
    );

    /*
     * JSON requests get Content-Type automatically.
     *
     * FormData must NOT receive a manually defined
     * Content-Type because the browser adds the
     * multipart boundary automatically.
     */
    if (
        !headers.has("Content-Type") &&
        options.body &&
        !(options.body instanceof FormData)
    ) {
        headers.set(
            "Content-Type",
            "application/json"
        );
    }

    if (token) {
        headers.set(
            "Authorization",
            `Bearer ${token}`
        );
    }

    const url =
        `${API_BASE_URL}${path}`;

    console.log(
        "AUTH FETCH:",
        url
    );

    const response =
        await fetch(
            url,
            {
                ...options,
                headers,
            }
        );

    console.log(
        "AUTH FETCH RESPONSE:",
        response.status,
        response.url
    );

    if (response.status === 401) {
        localStorage.removeItem("token");

        window.location.href =
            "/login";

        throw new Error(
            "Your session has expired."
        );
    }

    return response;
}

export {
    API_BASE_URL,
};