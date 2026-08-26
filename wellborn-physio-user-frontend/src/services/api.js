// src/services/api.js
// Updated API configuration with correct /api prefixes matching Spring Boot controllers

import axios from 'axios';


const BASE_URL = import.meta.env.VITE_API_URL || 'https://wellborn-physio-website.onrender.com';

// API endpoints
export const API = {
  // ==========================================
  // AUTHENTICATION
  // ==========================================
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGIN: '/auth/login',
  AUTH_LOGOUT: '/auth/logout',

  // ==========================================
  // USER MANAGEMENT
  // ==========================================
  USER_PROFILE: '/user/profile',
  USER_UPDATE: '/user/update',

  // ==========================================
  // APPOINTMENTS
  // ==========================================
  APPOINTMENT_BOOK: '/appointment/book',
  APPOINTMENT_BOOKED_TIMES: '/appointment/booked-times',
  APPOINTMENT_GET_ALL: '/appointment/getall',
  APPOINTMENT_GET_BY_ID: (id) => `/appointment/get/${id}`,
  APPOINTMENT_UPDATE: (id) => `/appointment/update/${id}`,
  APPOINTMENT_DELETE: (id) => `/appointment/delete/${id}`,

  // ==========================================
  // CONTACTS
  // ==========================================
  CONTACT_SAVE: '/contact/save',
  CONTACT_GET_ALL: '/contact/getall',
  CONTACT_GET_BY_ID: (id) => `/contact/get/${id}`,
  CONTACT_DELETE: (id) => `/contact/delete/${id}`,

  // ==========================================
  // DOCTORS
  // ==========================================
  DOCTOR_GET_ALL: '/doctor/getall',
  DOCTOR_GET_BY_ID: (id) => `/doctor/get/${id}`,
  DOCTOR_ADD: '/doctor/add',
  DOCTOR_UPDATE: (id) => `/doctor/update/${id}`,
  DOCTOR_DELETE: (id) => `/doctor/delete/${id}`,

  // ==========================================
  // SERVICES
  // ==========================================
  SERVICE_GET_ALL: '/service/getall',
  SERVICE_GET_BY_ID: (id) => `/service/get/${id}`,
  SERVICE_ADD: '/service/add',
  SERVICE_UPDATE: (id) => `/service/update/${id}`,
  SERVICE_DELETE: (id) => `/service/delete/${id}`,

  // ==========================================
  // REVIEWS
  // ==========================================
  REVIEW_SAVE: '/review/save',
  REVIEW_GET_APPROVED: '/review/approved',
  REVIEW_GET_ALL: '/review/getall',
  REVIEW_UPDATE: (id) => `/review/update/${id}`,
  REVIEW_DELETE: (id) => `/review/delete/${id}`,

  // ==========================================
  // 🔴 FCM & NOTIFICATIONS
  // ==========================================
  FCM_SAVE_TOKEN: '/fcm/token',         // POST - Save FCM token
  FCM_DELETE_TOKEN: '/fcm/token',       // DELETE - Remove FCM token
  NOTIFICATION_SEND: '/notifications/send', // POST - Send notification
  NOTIFICATION_GET_ALL: '/notifications/getall', // GET - Get all notifications
};

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Add JWT token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('authToken');
      if (
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/admin/login'
      ) {
        window.location.href = '/login';
      }
    } else if (status === 403) {
      console.error(
        '403 Forbidden:',
        error.config?.method?.toUpperCase(),
        error.config?.url
      );
    }
    return Promise.reject(error);
  }
);

/**
 * Generic GET request
 */
export const getData = async (url, config = {}) => {
  try {
    const response = await axiosInstance.get(url, config);
    return response;
  } catch (error) {
    console.error(`GET ${url} failed:`, error);
    throw error;
  }
};

/**
 * Generic POST request
 */
export const postData = async (url, data = {}, config = {}) => {
  try {
    const response = await axiosInstance.post(url, data, config);
    return response;
  } catch (error) {
    console.error(`POST ${url} failed:`, error);
    throw error;
  }
};

/**
 * Generic PUT request
 */
export const putData = async (url, data = {}, config = {}) => {
  try {
    const response = await axiosInstance.put(url, data, config);
    return response;
  } catch (error) {
    console.error(`PUT ${url} failed:`, error);
    throw error;
  }
};

/**
 * Generic DELETE request
 */
export const deleteData = async (url, config = {}) => {
  try {
    const response = await axiosInstance.delete(url, config);
    return response;
  } catch (error) {
    console.error(`DELETE ${url} failed:`, error);
    throw error;
  }
};

/**
 * FCM specific functions
 */

/**
 * Save FCM token to backend
 * @param {string} token - FCM device token
 * @param {string} role - User role (USER or ADMIN)
 */
export const saveFCMToken = async (token, role = 'USER') => {
  try {
    const response = await postData(API.FCM_SAVE_TOKEN, {
      token: token,
      role: role
    });
    console.log('✅ FCM token saved:', response);
    return response;
  } catch (error) {
    console.error('❌ Error saving FCM token:', error);
    throw error;
  }
};

/**
 * Delete FCM token from backend
 * @param {string} token - FCM device token to delete
 */
export const deleteFCMToken = async (token) => {
  try {
    const response = await deleteData(API.FCM_DELETE_TOKEN, {
      data: { token: token }
    });
    console.log('✅ FCM token deleted:', response);
    return response;
  } catch (error) {
    console.error('❌ Error deleting FCM token:', error);
    throw error;
  }
};

/**
 * Send notification to user (requires authorization)
 * @param {string} token - Target device token
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} type - Notification type
 */
export const sendNotification = async (token, title, message, type = 'GENERAL') => {
  try {
    const response = await postData(API.NOTIFICATION_SEND, {
      token: token,
      title: title,
      message: message,
      type: type
    });
    console.log('✅ Notification sent:', response);
    return response;
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    throw error;
  }
};

export default axiosInstance;