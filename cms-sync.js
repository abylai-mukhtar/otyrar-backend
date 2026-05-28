/* CMS backend sync for admin/public pages */
(function cmsSyncBootstrap() {
  const API_BASE = "/api";
  const CMS_KEYS = [
    "otyrar_news",
    "otyrar_gallery",
    "otyrar_heritage",
    "otyrar_science",
    "otyrar_director",
    "otyrar_qa",
    "otyrar_contact",
    "otyrar_documents",
  ];

  let isHydrating = false;
  let syncTimer = null;

  function getToken() {
    return localStorage.getItem("otyrar_token");
  }

  async function api(path, options = {}) {
    const token = getToken();
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      throw new Error(payload.error || `HTTP ${res.status}`);
    }
    return res.json().catch(() => ({}));
  }

  function collectContentFromLocalStorage() {
    const content = {};
    CMS_KEYS.forEach((key) => {
      const raw = localStorage.getItem(key);
      if (!raw) {
        return;
      }
      try {
        content[key] = JSON.parse(raw);
      } catch {
        content[key] = raw;
      }
    });
    return content;
  }

  function hydrateLocalStorage(content) {
    isHydrating = true;
    try {
      CMS_KEYS.forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(content, key)) {
          localStorage.setItem(key, JSON.stringify(content[key]));
        }
      });
    } finally {
      isHydrating = false;
    }
    window.dispatchEvent(new Event("cms:hydrated"));
  }

  async function pushContentToServer() {
    if (!getToken()) {
      return;
    }
    const content = collectContentFromLocalStorage();
    await api("/content", {
      method: "PUT",
      body: JSON.stringify({ content }),
    });
  }

  function scheduleSync() {
    if (isHydrating || !getToken()) {
      return;
    }
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => {
      pushContentToServer().catch(() => {
        // Network or auth issues should not block local editing flow.
      });
    }, 250);
  }

  const originalSetItem = localStorage.setItem.bind(localStorage);
  localStorage.setItem = function patchedSetItem(key, value) {
    originalSetItem(key, value);
    if (CMS_KEYS.includes(key)) {
      scheduleSync();
    }
  };

  window.adminLogin = async function adminLogin(event) {
    if (event && event.preventDefault) {
      event.preventDefault();
    }
    const user = document.getElementById("admin-user")?.value?.trim();
    const pass = document.getElementById("admin-pass")?.value;
    const err = document.getElementById("login-error");
    if (err) {
      err.textContent = "";
    }
    try {
      const payload = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ user, pass }),
      });
      localStorage.setItem("otyrar_token", payload.token);
      sessionStorage.setItem("otyrar_auth", "1");
      window.location.href = "dashboard.html";
    } catch (error) {
      if (err) {
        err.textContent = "Логин немесе пароль қате!";
      }
    }
  };

  window.checkAuth = function checkAuth() {
    if (!getToken()) {
      window.location.href = "index.html";
      return;
    }
    api("/content")
      .then((payload) => {
        if (payload?.content) {
          hydrateLocalStorage(payload.content);
        }
      })
      .catch(() => {
        localStorage.removeItem("otyrar_token");
        sessionStorage.removeItem("otyrar_auth");
        window.location.href = "index.html";
      });
  };

  window.adminLogout = function adminLogout() {
    api("/auth/logout", { method: "POST" }).catch(() => {});
    localStorage.removeItem("otyrar_token");
    sessionStorage.removeItem("otyrar_auth");
    window.location.href = "index.html";
  };

  window.addEventListener("cms:hydrated", () => {
    window.renderNewsTable && window.renderNewsTable();
    window.renderGalleryGrid && window.renderGalleryGrid();
    window.renderHeritage && window.renderHeritage();
    window.renderSci && window.renderSci();
    window.renderQA && window.renderQA();
    window.loadDirector && window.loadDirector();
    window.loadContact && window.loadContact();
    window.loadDocumentsEditor && window.loadDocumentsEditor();
    window.updateDashboard && window.updateDashboard();
  });

  // Public pages can render newest content from backend.
  window.fetchPublicCmsContent = async function fetchPublicCmsContent() {
    const payload = await api("/public/content", { method: "GET" });
    return payload?.content || null;
  };
})();
