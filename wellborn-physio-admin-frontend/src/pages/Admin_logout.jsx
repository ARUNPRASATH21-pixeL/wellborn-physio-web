import React, { useEffect } from "react";
import { logout } from "../services/api";

const pageHtml = `
<div class="min-h-screen w-full flex items-center justify-center transition-colors duration-300">
  <div class="dark:bg-[#0d1b2a] bg-white rounded-3xl shadow-2xl p-10 w-[450px] text-center border dark:border-white/[0.07] border-slate-100">
    <div class="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
      <i class="fa-solid fa-circle-check text-green-600 dark:text-green-400 text-5xl"></i>
    </div>
    <h1 class="text-4xl font-bold mt-6 text-gray-800 dark:text-white">
      Logged Out
    </h1>
    <p class="text-gray-600 dark:text-slate-400 mt-4">
      You have successfully logged out from the Admin Panel.
    </p>
    <div class="mt-8">
      <a class="inline-block bg-blue-700 hover:bg-blue-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg" href="/admin/login">
        <i class="fa-solid fa-right-to-bracket mr-2"></i>
        Login Again
      </a>
    </div>
  </div>
</div>
`;

const pageCss = "";

export default function Admin_logout() {
  useEffect(() => { 
    logout(); 
  }, []);

  useEffect(() => {
    const style = document.createElement("style");
    style.dataset.page = "Admin_logout";
    style.textContent = pageCss;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  // Check if dark mode is active in localStorage to toggle the wrapper class
  const isDark = localStorage.getItem("wellborn-theme") === "dark";

  return (
    <div 
      className={isDark ? "dark bg-[#06111f] min-h-screen" : "bg-slate-50 min-h-screen"}
      dangerouslySetInnerHTML={{ __html: pageHtml }} 
    />
  );
}