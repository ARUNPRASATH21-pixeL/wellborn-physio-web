// ============================================================
// WELLBORN API SERVICE
// ADMIN AUTH + PROFILE + PASSWORD RESET + ALL API ENDPOINTS
// ============================================================

const BASE_URL =
  "https://wellborn-physio-website.onrender.com";

const normalizeBaseUrl = (url) =>
  String(url).replace(/\/+$/, "");

export const API_BASE_URL =
  normalizeBaseUrl(BASE_URL);

console.log("=================================");
console.log("Wellborn API Base URL:", API_BASE_URL);
console.log("=================================");


// ============================================================
// TIMEOUT
// ============================================================

const REQUEST_TIMEOUT = 30000;


// ============================================================
// TOKEN
// ============================================================

export const getToken = () => {
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
};


// ============================================================
// ADMIN ID
// ============================================================

export const getAdminId = () => {
  try {
    const id = localStorage.getItem("adminId");

    if (
      !id ||
      id === "undefined" ||
      id === "null"
    ) {
      return null;
    }

    return id;
  } catch {
    return null;
  }
};


// ============================================================
// AUTH HEADERS
// ============================================================

const getHeaders = ({
  json = true,
  authenticated = true,
} = {}) => {
  const headers = {};

  if (json) {
    headers["Content-Type"] = "application/json";
  }

  if (authenticated) {
    const token = getToken();

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
};


// ============================================================
// URL BUILDER
// ============================================================

const buildUrl = (endpoint) => {
  if (
    endpoint === undefined ||
    endpoint === null ||
    endpoint === ""
  ) {
    throw new Error(
      "API endpoint is undefined or empty."
    );
  }

  const value = String(endpoint).trim();

  if (!value) {
    throw new Error(
      "API endpoint is empty."
    );
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const cleanEndpoint =
    value.startsWith("/")
      ? value
      : `/${value}`;

  const finalUrl =
    `${API_BASE_URL}${cleanEndpoint}`;

  if (
    finalUrl.includes("/undefined") ||
    finalUrl.includes("undefined/")
  ) {
    console.error(
      "Invalid API URL:",
      finalUrl
    );

    throw new Error(
      "Invalid API URL: endpoint contains undefined."
    );
  }

  return finalUrl;
};


// ============================================================
// FETCH WITH TIMEOUT
// ============================================================

const fetchWithTimeout = async (
  url,
  options = {}
) => {
  const controller =
    new AbortController();

  const timeout =
    setTimeout(() => {
      controller.abort();
    }, REQUEST_TIMEOUT);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });

  } catch (error) {
    console.error(
      "Wellborn API FETCH ERROR:",
      error
    );

    if (
      error?.name === "AbortError"
    ) {
      throw new Error(
        "Request timed out. Please try again."
      );
    }

    if (
      error?.name === "TypeError" &&
      error?.message === "Failed to fetch"
    ) {
      throw new Error(
        "Unable to connect to Wellborn server. Please make sure the backend is running."
      );
    }

    throw error;

  } finally {
    clearTimeout(timeout);
  }
};


// ============================================================
// RESPONSE PARSER
// ============================================================

const parseResponse = async (
  response
) => {
  const contentType =
    response.headers.get(
      "content-type"
    ) || "";

  try {
    if (
      contentType.includes(
        "application/json"
      )
    ) {
      return await response.json();
    }

    const text =
      await response.text();

    return text || null;

  } catch (error) {
    console.error(
      "Response parsing error:",
      error
    );

    return null;
  }
};


// ============================================================
// ERROR MESSAGE
// ============================================================

const getErrorMessage = (
  data,
  status
) => {
  if (
    typeof data === "string" &&
    data.trim()
  ) {
    return data.trim();
  }

  if (
    data?.message &&
    typeof data.message === "string"
  ) {
    return data.message;
  }

  if (
    data?.error &&
    typeof data.error === "string"
  ) {
    return data.error;
  }

  if (
    data?.errorMessage &&
    typeof data.errorMessage === "string"
  ) {
    return data.errorMessage;
  }

  switch (status) {
    case 400:
      return "Invalid request.";

    case 401:
      return "Unauthorized. Please login again.";

    case 403:
      return "You do not have permission.";

    case 404:
      return "Requested resource was not found.";

    case 409:
      return "This request conflicts with existing data.";

    case 500:
      return "Server error. Please try again later.";

    default:
      return "Something went wrong. Please try again.";
  }
};


// ============================================================
// HANDLE RESPONSE
// ============================================================

const handleResponse = async (
  response
) => {
  const data =
    await parseResponse(response);

  console.log(
    "Wellborn API Response:",
    response.status,
    data
  );

  if (!response.ok) {
    const error =
      new Error(
        getErrorMessage(
          data,
          response.status
        )
      );

    error.status =
      response.status;

    error.data =
      data;

    throw error;
  }

  return data;
};


// ============================================================
// COMMON REQUEST
// ============================================================

const request = async (
  endpoint,
  {
    method = "GET",
    data = undefined,
    authenticated = true,
  } = {}
) => {
  const url =
    buildUrl(endpoint);

  const options = {
    method,

    headers:
      getHeaders({
        json: true,
        authenticated,
      }),
  };

  if (
    data !== undefined &&
    data !== null
  ) {
    options.body =
      JSON.stringify(data);
  }

  console.log(
    `Wellborn API ${method}:`,
    url
  );

  const response =
    await fetchWithTimeout(
      url,
      options
    );

  return handleResponse(response);
};


// ============================================================
// GET
// ============================================================

export const getData = async (
  url
) => {
  return request(
    url,
    {
      method: "GET",
      authenticated: true,
    }
  );
};


// ============================================================
// PUBLIC GET
// ============================================================

export const getPublicData = async (
  url
) => {
  return request(
    url,
    {
      method: "GET",
      authenticated: false,
    }
  );
};


// ============================================================
// POST
// ============================================================

export const postData = async (
  url,
  data
) => {
  return request(
    url,
    {
      method: "POST",
      data,
      authenticated: true,
    }
  );
};


// ============================================================
// PUBLIC POST
// ============================================================

export const postPublicData = async (
  url,
  data
) => {
  return request(
    url,
    {
      method: "POST",
      data,
      authenticated: false,
    }
  );
};


// ============================================================
// PUT
// ============================================================

export const putData = async (
  url,
  data
) => {
  return request(
    url,
    {
      method: "PUT",
      data,
      authenticated: true,
    }
  );
};


// ============================================================
// PUBLIC PUT
// ============================================================

export const putPublicData = async (
  url,
  data
) => {
  return request(
    url,
    {
      method: "PUT",
      data,
      authenticated: false,
    }
  );
};


// ============================================================
// DELETE
// ============================================================

export const deleteData = async (
  url
) => {
  return request(
    url,
    {
      method: "DELETE",
      authenticated: true,
    }
  );
};


// ============================================================
// FORM DATA POST
// ============================================================

export const postFormData = async (
  url,
  formData,
  authenticated = true
) => {
  if (!(formData instanceof FormData)) {
    throw new Error(
      "postFormData requires a FormData object."
    );
  }

  const finalUrl =
    buildUrl(url);

  const headers = {};

  const token =
    getToken();

  if (
    authenticated &&
    token
  ) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  const response =
    await fetchWithTimeout(
      finalUrl,
      {
        method: "POST",
        headers,
        body: formData,
      }
    );

  return handleResponse(response);
};


// ============================================================
// FORM DATA PUT
// ============================================================

export const putFormData = async (
  url,
  formData,
  authenticated = true
) => {
  if (!(formData instanceof FormData)) {
    throw new Error(
      "putFormData requires a FormData object."
    );
  }

  const finalUrl =
    buildUrl(url);

  const headers = {};

  const token =
    getToken();

  if (
    authenticated &&
    token
  ) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  const response =
    await fetchWithTimeout(
      finalUrl,
      {
        method: "PUT",
        headers,
        body: formData,
      }
    );

  return handleResponse(response);
};


// ============================================================
// API ENDPOINTS
// ============================================================

export const API = {

  // ==========================================================
  // ADMIN LOGIN
  // ==========================================================

  ADMIN_LOGIN:
    "/auth/admin/login",


  // ==========================================================
  // ADMIN PROFILE
  // ==========================================================

  ADMIN_GET:
    "/admin/get",

  ADMIN_UPDATE:
    "/admin/update",

  ADMIN_CHANGE_PASSWORD:
    "/admin/change-password",

  ADMIN_DELETE:
    "/admin/delete",


  // ==========================================================
  // ADMIN FORGOT PASSWORD
  // ==========================================================

  ADMIN_RESET_SEND_OTP:
    "/admin/forgot-password/send-otp",

  ADMIN_RESET_VERIFY_OTP:
    "/admin/forgot-password/verify-otp",

  ADMIN_RESET_PASSWORD:
    "/admin/forgot-password/reset",


  // ==========================================================
  // ADMIN SIGNUP
  // ==========================================================

  ADMIN_SIGNUP_EMAIL_STATUS:
    "/auth/admin/signup/email-status",

  ADMIN_SIGNUP_START:
    "/auth/admin/signup/start",

  ADMIN_SIGNUP_VERIFY_OTP:
    "/auth/admin/signup/verify-otp",

  ADMIN_SIGNUP_RESEND_OTP:
    "/auth/admin/signup/resend-otp",

  ADMIN_SIGNUP_VERIFY_SECRET:
    "/auth/admin/signup/verify-secret",

  ADMIN_SIGNUP_COMPLETE:
    "/auth/admin/signup/complete",


  // ==========================================================
  // DOCTORS
  // ==========================================================

  DOCTOR_GET_ALL:
    "/doctor/getall",

  DOCTOR_GET_BY_ID:
    "/doctor/get",

  DOCTOR_ADD:
    "/doctor/add",

  DOCTOR_UPDATE:
    "/doctor/update",

  DOCTOR_DELETE:
    "/doctor/delete",

  DOCTOR_TOGGLE_STATUS:
    "/doctor/toggle-status",


  // ==========================================================
  // SERVICES
  // ==========================================================

  SERVICE_GET_ALL:
    "/service/getall",

  SERVICE_GET_BY_ID:
    "/service/get",

  SERVICE_ADD:
    "/service/add",

  SERVICE_UPDATE:
    "/service/update",

  SERVICE_DELETE:
    "/service/delete",

  SERVICE_TOGGLE_STATUS:
    "/service/toggle-status",


  // ==========================================================
  // APPOINTMENTS
  // ==========================================================

  APPOINTMENT_BOOK:
    "/appointment/book",

  APPOINTMENT_GET_ALL:
    "/appointment/getall",

  APPOINTMENT_GET_BY_ID:
    "/appointment/get",

  APPOINTMENT_UPDATE:
    "/appointment/update",

  APPOINTMENT_DELETE:
    "/appointment/delete",


  // ==========================================================
  // CONTACT
  // ==========================================================

  CONTACT_SAVE:
    "/contact/save",

  CONTACT_GET_ALL:
    "/contact/getall",

  CONTACT_GET_BY_ID:
    "/contact/get",

  CONTACT_DELETE:
    "/contact/delete",


  // ==========================================================
  // REVIEWS
  // ==========================================================

  REVIEW_SAVE:
    "/review/save",

  REVIEW_GET_ALL:
    "/review/getall",

  REVIEW_APPROVED:
    "/review/approved",

  REVIEW_UPDATE:
    "/review/update",

  REVIEW_DELETE:
    "/review/delete",


  // ==========================================================
  // USERS
  // ==========================================================

  USER_GET_ALL:
    "/user/getall",

  USER_GET_BY_ID:
    "/user/get",

  USER_UPDATE:
    "/user/update",

  USER_DELETE:
    "/user/delete",


  // ==========================================================
  // DASHBOARD
  // ==========================================================

  DASHBOARD:
    "/dashboard",
};


// ============================================================
// ADMIN URL HELPERS
// ============================================================

export const adminUrl = {

  get: (id) => {
    if (
      id === undefined ||
      id === null ||
      String(id).trim() === ""
    ) {
      throw new Error(
        "Admin ID is missing."
      );
    }

    return (
      `${API.ADMIN_GET}/${encodeURIComponent(id)}`
    );
  },


  update: (id) => {
    if (
      id === undefined ||
      id === null ||
      String(id).trim() === ""
    ) {
      throw new Error(
        "Admin ID is missing."
      );
    }

    return (
      `${API.ADMIN_UPDATE}/${encodeURIComponent(id)}`
    );
  },


  changePassword: (id) => {
    if (
      id === undefined ||
      id === null ||
      String(id).trim() === ""
    ) {
      throw new Error(
        "Admin ID is missing."
      );
    }

    return (
      `${API.ADMIN_CHANGE_PASSWORD}/${encodeURIComponent(id)}`
    );
  },


  delete: (id) => {
    if (
      id === undefined ||
      id === null ||
      String(id).trim() === ""
    ) {
      throw new Error(
        "Admin ID is missing."
      );
    }

    return (
      `${API.ADMIN_DELETE}/${encodeURIComponent(id)}`
    );
  },
};


// ============================================================
// DOCTOR URL HELPERS
// ============================================================

export const doctorUrl = {

  get: (id) =>
    `${API.DOCTOR_GET_BY_ID}/${encodeURIComponent(id)}`,

  update: (id) =>
    `${API.DOCTOR_UPDATE}/${encodeURIComponent(id)}`,

  delete: (id) =>
    `${API.DOCTOR_DELETE}/${encodeURIComponent(id)}`,

  toggleStatus: (id) =>
    `${API.DOCTOR_TOGGLE_STATUS}/${encodeURIComponent(id)}`,
};


// ============================================================
// SERVICE URL HELPERS
// ============================================================

export const serviceUrl = {

  get: (id) =>
    `${API.SERVICE_GET_BY_ID}/${encodeURIComponent(id)}`,

  update: (id) =>
    `${API.SERVICE_UPDATE}/${encodeURIComponent(id)}`,

  delete: (id) =>
    `${API.SERVICE_DELETE}/${encodeURIComponent(id)}`,

  toggleStatus: (id) =>
    `${API.SERVICE_TOGGLE_STATUS}/${encodeURIComponent(id)}`,
};


// ============================================================
// APPOINTMENT URL HELPERS
// ============================================================

export const appointmentUrl = {

  get: (id) =>
    `${API.APPOINTMENT_GET_BY_ID}/${encodeURIComponent(id)}`,

  update: (id) =>
    `${API.APPOINTMENT_UPDATE}/${encodeURIComponent(id)}`,

  delete: (id) =>
    `${API.APPOINTMENT_DELETE}/${encodeURIComponent(id)}`,
};


// ============================================================
// CONTACT URL HELPERS
// ============================================================

export const contactUrl = {

  get: (id) =>
    `${API.CONTACT_GET_BY_ID}/${encodeURIComponent(id)}`,

  delete: (id) =>
    `${API.CONTACT_DELETE}/${encodeURIComponent(id)}`,
};


// ============================================================
// REVIEW URL HELPERS
// ============================================================

export const reviewUrl = {

  update: (id) =>
    `${API.REVIEW_UPDATE}/${encodeURIComponent(id)}`,

  delete: (id) =>
    `${API.REVIEW_DELETE}/${encodeURIComponent(id)}`,
};


// ============================================================
// USER URL HELPERS
// ============================================================

export const userUrl = {

  get: (id) =>
    `${API.USER_GET_BY_ID}/${encodeURIComponent(id)}`,

  update: (id) =>
    `${API.USER_UPDATE}/${encodeURIComponent(id)}`,

  delete: (id) =>
    `${API.USER_DELETE}/${encodeURIComponent(id)}`,
};


// ============================================================
// SAVE AUTH
// ============================================================

export const saveAuth = (
  authData
) => {

  if (!authData) {
    return false;
  }

  console.log(
    "Saving auth:",
    authData
  );

  const token =
    authData.token ||
    authData.accessToken ||
    authData.jwt;

  const adminId =
    authData.adminId ??
    authData.id ??
    authData.admin?.adminId ??
    authData.admin?.id;

  const adminName =
    authData.adminName ||
    authData.name ||
    authData.admin?.adminName ||
    authData.admin?.name;

  const email =
    authData.email ||
    authData.admin?.email;

  const role =
    authData.role ||
    authData.admin?.role;


  if (token) {
    localStorage.setItem(
      "token",
      String(token)
    );
  }


  if (
    adminId !== undefined &&
    adminId !== null &&
    String(adminId).trim() !== ""
  ) {
    localStorage.setItem(
      "adminId",
      String(adminId)
    );
  }


  if (adminName) {
    localStorage.setItem(
      "name",
      String(adminName)
    );

    localStorage.setItem(
      "adminName",
      String(adminName)
    );
  }


  if (email) {
    localStorage.setItem(
      "email",
      String(email)
    );
  }


  if (role) {
    localStorage.setItem(
      "role",
      String(role)
    );
  }


  const finalAuth = {
    ...authData,

    ...(token
      ? { token }
      : {}),

    ...(adminId !== undefined &&
    adminId !== null
      ? {
          adminId:
            String(adminId),
        }
      : {}),
  };


  localStorage.setItem(
    "auth",
    JSON.stringify(finalAuth)
  );

  return true;
};


// ============================================================
// GET AUTH
// ============================================================

export const getAuth = () => {
  try {
    const raw =
      localStorage.getItem("auth");

    if (!raw) {
      return null;
    }

    return JSON.parse(raw);

  } catch (error) {
    console.error(
      "Unable to read auth:",
      error
    );

    return null;
  }
};


// ============================================================
// CLEAR AUTH
// ============================================================

export const clearAuth = () => {

  const keys = [
    "token",
    "adminId",
    "adminName",
    "name",
    "email",
    "role",
    "auth",
  ];

  keys.forEach((key) => {
    localStorage.removeItem(key);
  });
};


// ============================================================
// LOGOUT
// ============================================================

export const logout = () => {

  clearAuth();

  sessionStorage.removeItem(
    "adminSignup"
  );

  sessionStorage.removeItem(
    "signupToken"
  );

  sessionStorage.removeItem(
    "passwordToken"
  );

  sessionStorage.removeItem(
    "resetToken"
  );

  sessionStorage.removeItem(
    "resetEmail"
  );

  console.log(
    "Wellborn admin logged out."
  );

  return true;
};


// ============================================================
// AUTH CHECK
// ============================================================

export const isAuthenticated = () => {

  const token =
    getToken();

  return Boolean(
    token &&
    token.trim()
  );
};


// ============================================================
// ADMIN CHECK
// ============================================================

export const isAdmin = () => {

  const role =
    localStorage.getItem("role");

  if (!role) {
    return false;
  }

  const normalizedRole =
    role
      .trim()
      .toUpperCase();

  return (
    normalizedRole === "ADMIN" ||
    normalizedRole === "ROLE_ADMIN"
  );
};


// ============================================================
// ADMIN PROFILE GET
// ============================================================

export const getAdminProfile = async () => {

  const adminId =
    getAdminId();

  if (!adminId) {
    throw new Error(
      "Admin session not found. Please login again."
    );
  }

  return getData(
    adminUrl.get(adminId)
  );
};


// ============================================================
// ADMIN PROFILE UPDATE
// ============================================================

export const updateAdminProfile = async (
  data
) => {

  const adminId =
    getAdminId();

  if (!adminId) {
    throw new Error(
      "Admin session not found. Please login again."
    );
  }

  return putData(
    adminUrl.update(adminId),
    data
  );
};


// ============================================================
// ADMIN CHANGE PASSWORD
// ============================================================

export const changeAdminPassword = async (
  data
) => {

  const adminId =
    getAdminId();

  if (!adminId) {
    throw new Error(
      "Admin session not found. Please login again."
    );
  }

  if (!data) {
    throw new Error(
      "Password data is required."
    );
  }

  return putData(
    adminUrl.changePassword(adminId),
    data
  );
};


// ============================================================
// ADMIN DELETE
// ============================================================

export const deleteAdminAccount = async () => {

  const adminId =
    getAdminId();

  if (!adminId) {
    throw new Error(
      "Admin session not found."
    );
  }

  return deleteData(
    adminUrl.delete(adminId)
  );
};


// ============================================================
// ADMIN EMAIL STATUS
// ============================================================

export const checkAdminEmailStatus = async (
  email
) => {

  const normalizedEmail =
    String(email || "")
      .trim()
      .toLowerCase();

  if (!normalizedEmail) {
    throw new Error(
      "Email is required."
    );
  }

  return request(
    `${API.ADMIN_SIGNUP_EMAIL_STATUS}?email=${encodeURIComponent(
      normalizedEmail
    )}`,
    {
      method: "GET",
      authenticated: false,
    }
  );
};


// ============================================================
// ADMIN SIGNUP - START
// ============================================================

export const startAdminSignup = async ({
  adminName,
  phone,
  email,
}) => {

  return request(
    API.ADMIN_SIGNUP_START,
    {
      method: "POST",
      authenticated: false,

      data: {
        adminName:
          String(
            adminName || ""
          ).trim(),

        phone:
          String(
            phone || ""
          ).trim(),

        email:
          String(
            email || ""
          )
            .trim()
            .toLowerCase(),
      },
    }
  );
};


// ============================================================
// ADMIN SIGNUP - VERIFY OTP
// ============================================================

export const verifyAdminSignupOtp = async ({
  email,
  otp,
}) => {

  return request(
    API.ADMIN_SIGNUP_VERIFY_OTP,
    {
      method: "POST",
      authenticated: false,

      data: {
        email:
          String(
            email || ""
          )
            .trim()
            .toLowerCase(),

        otp:
          String(
            otp || ""
          ).trim(),
      },
    }
  );
};


// ============================================================
// ADMIN SIGNUP - RESEND OTP
// ============================================================

export const resendAdminSignupOtp = async (
  email
) => {

  return request(
    API.ADMIN_SIGNUP_RESEND_OTP,
    {
      method: "POST",
      authenticated: false,

      data: {
        email:
          String(
            email || ""
          )
            .trim()
            .toLowerCase(),
      },
    }
  );
};


// ============================================================
// ADMIN SIGNUP - VERIFY SECRET
// ============================================================

export const verifyAdminSignupSecret = async ({
  signupToken,
  secretCode,
}) => {

  return request(
    API.ADMIN_SIGNUP_VERIFY_SECRET,
    {
      method: "POST",
      authenticated: false,

      data: {
        signupToken:
          String(
            signupToken || ""
          ).trim(),

        secretCode:
          String(
            secretCode || ""
          ).trim(),
      },
    }
  );
};


// ============================================================
// ADMIN SIGNUP - COMPLETE
// ============================================================

export const completeAdminSignup = async ({
  signupToken,
  password,
  confirmPassword,
}) => {

  return request(
    API.ADMIN_SIGNUP_COMPLETE,
    {
      method: "POST",
      authenticated: false,

      data: {
        signupToken:
          String(
            signupToken || ""
          ).trim(),

        password:
          String(
            password || ""
          ),

        confirmPassword:
          String(
            confirmPassword || ""
          ),
      },
    }
  );
};


// ============================================================
// ADMIN PASSWORD RESET
// ============================================================
// FLOW:
//
// FORGOT PASSWORD
//       ↓
// ENTER EMAIL
//       ↓
// SEND OTP
//       ↓
// VERIFY OTP
//       ↓
// resetToken
//       ↓
// RESET PASSWORD
//       ↓
// LOGIN
//
// ALL RESET APIs ARE PUBLIC.
// NO LOGIN TOKEN REQUIRED.
// ============================================================


// ============================================================
// PASSWORD RESET - SEND OTP
//
// BACKEND:
//
// POST /admin/forgot-password/send-otp?email=...
// ============================================================

export const requestAdminPasswordReset = async (
  email
) => {

  const normalizedEmail =
    String(email || "")
      .trim()
      .toLowerCase();

  if (!normalizedEmail) {
    throw new Error(
      "Email is required."
    );
  }

  const endpoint =
    `${API.ADMIN_RESET_SEND_OTP}` +
    `?email=${encodeURIComponent(
      normalizedEmail
    )}`;

  const response =
    await request(
      endpoint,
      {
        method: "POST",
        authenticated: false,
      }
    );

  return response;
};


// ============================================================
// PASSWORD RESET - VERIFY OTP
//
// BACKEND:
//
// POST /admin/forgot-password/verify-otp
// ?email=...
// &otp=...
//
// EXPECTED RESPONSE:
//
// {
//   "status": true,
//   "message": "OTP verified successfully",
//   "resetToken": "...."
// }
// ============================================================

export const verifyAdminPasswordResetOtp = async ({
  email,
  otp,
}) => {

  const normalizedEmail =
    String(email || "")
      .trim()
      .toLowerCase();

  const cleanOtp =
    String(otp || "").trim();

  if (!normalizedEmail) {
    throw new Error(
      "Email is required."
    );
  }

  if (!/^\d{6}$/.test(cleanOtp)) {
    throw new Error(
      "OTP must contain exactly 6 digits."
    );
  }

  const endpoint =
    `${API.ADMIN_RESET_VERIFY_OTP}` +
    `?email=${encodeURIComponent(
      normalizedEmail
    )}` +
    `&otp=${encodeURIComponent(
      cleanOtp
    )}`;

  const response =
    await request(
      endpoint,
      {
        method: "POST",
        authenticated: false,
      }
    );

  if (
    response?.status === true &&
    response?.resetToken
  ) {
    sessionStorage.setItem(
      "resetToken",
      String(response.resetToken)
    );

    sessionStorage.setItem(
      "resetEmail",
      normalizedEmail
    );
  }

  return response;
};


// ============================================================
// PASSWORD RESET - RESET PASSWORD
//
// BACKEND:
//
// POST /admin/forgot-password/reset
//
// PARAMETERS:
//
// email
// resetToken
// newPassword
// confirmPassword
// ============================================================

export const confirmAdminPasswordReset = async ({
  email,
  resetToken,
  password,
  confirmPassword,
}) => {

  const normalizedEmail =
    String(
      email ||
      sessionStorage.getItem("resetEmail") ||
      ""
    )
      .trim()
      .toLowerCase();

  const cleanToken =
    String(
      resetToken ||
      sessionStorage.getItem("resetToken") ||
      ""
    ).trim();

  const newPassword =
    String(
      password || ""
    );

  const newConfirmPassword =
    String(
      confirmPassword || ""
    );


  // ----------------------------------------------------------
  // VALIDATION
  // ----------------------------------------------------------

  if (!normalizedEmail) {
    throw new Error(
      "Email is required."
    );
  }

  if (!cleanToken) {
    throw new Error(
      "Reset authorization token is required."
    );
  }

  if (!newPassword) {
    throw new Error(
      "New password is required."
    );
  }

  if (!newConfirmPassword) {
    throw new Error(
      "Confirm password is required."
    );
  }

  if (
    newPassword !==
    newConfirmPassword
  ) {
    throw new Error(
      "Passwords do not match."
    );
  }


  // ----------------------------------------------------------
  // RESET PASSWORD REQUEST
  // ----------------------------------------------------------

  const endpoint =
    `${API.ADMIN_RESET_PASSWORD}` +
    `?email=${encodeURIComponent(
      normalizedEmail
    )}` +
    `&resetToken=${encodeURIComponent(
      cleanToken
    )}` +
    `&newPassword=${encodeURIComponent(
      newPassword
    )}` +
    `&confirmPassword=${encodeURIComponent(
      newConfirmPassword
    )}`;


  const response =
    await request(
      endpoint,
      {
        method: "POST",
        authenticated: false,
      }
    );


  // ----------------------------------------------------------
  // RESET TOKEN IS ONE-TIME USE
  // ----------------------------------------------------------

  sessionStorage.removeItem(
    "resetToken"
  );

  sessionStorage.removeItem(
    "resetEmail"
  );


  return response;
};


// ============================================================
// DEFAULT EXPORT
// ============================================================

export default API;