(function(global) {
  const API_PREFIX = "/api";
  const LOGIN_REDIRECT_PATH = "/login.html";

  function normalizeApiUrl(input) {
    if (typeof input !== "string") return input;

    if (/^https?:\/\//i.test(input)) {
      try {
        const parsed = new URL(input, window.location.origin);
        if (parsed.pathname.startsWith(API_PREFIX)) {
          return `${parsed.pathname}${parsed.search}${parsed.hash}`;
        }
        return input;
      } catch (error) {
        return input;
      }
    }

    if (input === API_PREFIX || input.startsWith(`${API_PREFIX}/`)) {
      return input;
    }

    if (input.startsWith("/")) {
      return `${API_PREFIX}${input}`;
    }

    return `${API_PREFIX}/${input}`;
  }

  async function fetchWithAuth(input, init = {}) {
    const token = localStorage.getItem("token");
    const headers = new Headers(init.headers || {});

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(normalizeApiUrl(input), {
      ...init,
      headers
    });

    if (response.status === 401) {
      window.location.href = LOGIN_REDIRECT_PATH;
    }

    return response;
  }

  global.fetchWithAuth = fetchWithAuth;
})(window);
