 
export function decodeJWT(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json   = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function isTokenValid(token) {
  if (!token) return false;
  const payload = decodeJWT(token);
  if (!payload?.exp) return true;                
  return Date.now() < payload.exp * 1000;
}

// ─── Auth Storage ─────────────────────────────────────────────────────────────
 
const TOKEN_KEY = "adminToken";
const USER_KEY  = "adminUser";
const ROLE_KEY  = "adminRole";

export const auth = {
  save(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY,  JSON.stringify(user));
    localStorage.setItem(ROLE_KEY,  user.role);
  },

  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ROLE_KEY);
  },

  getToken: () => localStorage.getItem(TOKEN_KEY),

  getUser: () => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
      return null;
    }
  },

  getRole: () => localStorage.getItem(ROLE_KEY),

  isAuthenticated: () => isTokenValid(localStorage.getItem(TOKEN_KEY)),
};

// ─── Role redirects ───────────────────────────────────────────────────────────
export const ROLE_REDIRECTS = {
  superadmin: "/dashboard/admin",
  editor:     "/dashboard/editor",
  author:     "/dashboard/author",
  // viewer has no admin panel access
};

// ─── Permission helpers ───────────────────────────────────────────────────────

 
export const canSetStatus = (role, targetStatus) => {
  if (role === "superadmin") return true;
  if (role === "editor") {
    return ["approved", "changes_requested", "rejected", "published"].includes(targetStatus);
  }
  if (role === "author") {
    return ["draft", "pending_review"].includes(targetStatus);
  }
  return false;
};
 
export const canDeleteBlog = (role, blog, currentUserId) => {
  if (role === "superadmin") return true;
  if (role === "editor") return blog?.author?.role !== "superadmin";
  if (role === "author") {
    const isOwner =
      blog?.author?._id === currentUserId ||
      blog?.author?._id?.toString() === currentUserId?.toString();
    return isOwner && blog?.status === "draft";
  }
  return false;
};

 
export const canEditBlog = (role, blog, currentUserId) => {
  if (role === "superadmin" || role === "editor") return true;
  if (role === "author") {
    const isOwner =
      blog?.author?._id === currentUserId ||
      blog?.author?._id?.toString() === currentUserId?.toString() ||
      blog?.author === currentUserId;
    return isOwner && ["draft", "changes_requested"].includes(blog?.status);
  }
  return false;
};
