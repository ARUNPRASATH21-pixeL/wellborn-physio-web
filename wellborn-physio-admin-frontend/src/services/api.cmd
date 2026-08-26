const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8080";
// ============================================================
// LOGOUT
// ============================================================

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("adminId");
  localStorage.removeItem("name");
  localStorage.removeItem("email");
  localStorage.removeItem("role");
  localStorage.removeItem("auth");

  sessionStorage.removeItem("adminSignup");
  sessionStorage.removeItem("signupToken");
  sessionStorage.removeItem("passwordToken");

  return true;
};