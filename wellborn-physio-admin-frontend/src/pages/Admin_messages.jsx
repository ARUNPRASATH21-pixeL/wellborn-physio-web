import React, { useEffect, useMemo, useState, useRef } from "react";

import {
  API,
  getData,
  putData,
  deleteData,
} from "../services/api";

import {
  Search,
  Trash2,
  Phone,
  Inbox,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  CheckCheck,
  Reply,
  MessageCircle,
  Send,
  X,
  Calendar,
  Mail,
} from "lucide-react";

/* =========================================================
   ADMIN MESSAGES - PROFILE MODAL WITH EMAIL RESTORED
========================================================= */

export default function Admin_messages() {
  const messageListRef = useRef(null);
  const chatBodyRef = useRef(null);

  /* =======================================================
     THEME
  ======================================================= */

  const [darkMode, setDarkMode] = useState(() => {
    try {
      return document.documentElement.classList.contains(
        "wellborn-admin-dark"
      );
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;

    const updateTheme = () => {
      setDarkMode(
        root.classList.contains("wellborn-admin-dark")
      );
    };

    updateTheme();

    const observer = new MutationObserver(() => {
      updateTheme();
    });

    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  /* =======================================================
     STATE
  ======================================================= */

  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const [selectedMessage, setSelectedMessage] = useState(null);
  const [mobileView, setMobileView] = useState("list");

  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Profile Modal State
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const [toast, setToast] = useState(null);

  const showToast = (title, text, type = "success") => {
    setToast({ title, text, type });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  /* =======================================================
     LOAD & SORT MESSAGES
  ======================================================= */

  const loadMessages = async () => {
    try {
      setLoading(true);

      const response = await getData(
        API.CONTACT_GET_ALL
      );

      const list = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
        ? response.data
        : [];

      const sorted = list.sort((a, b) => {
        const statusA = getStatus(a);
        const statusB = getStatus(b);

        if (statusA === "NEW" && statusB !== "NEW") return -1;
        if (statusA !== "NEW" && statusB === "NEW") return 1;

        return getTimestamp(b) - getTimestamp(a);
      });

      setMessages(sorted);
    } catch (error) {
      console.error("Messages loading error:", error);
      setMessages([]);
      showToast("Load Failed", "Unable to load messages.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  /* =======================================================
     FILTER & SEARCH
  ======================================================= */

  const filteredMessages = useMemo(() => {
    const text = search.trim().toLowerCase();

    return messages.filter((item) => {
      const status = getStatus(item);
      const matchesStatus =
        statusFilter === "ALL" || status === statusFilter;

      if (!matchesStatus) return false;
      if (!text) return true;

      return [
        getName(item),
        getEmail(item),
        getPhone(item),
        getSubject(item),
        getMessage(item),
        status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(text);
    });
  }, [messages, search, statusFilter]);

  /* =======================================================
     OPEN CHAT & MARK AS READ
  ======================================================= */

  const openChat = async (message) => {
    if (!message) return;

    const id = getMessageId(message);

    setSelectedMessage(message);
    setReplyText("");
    setMobileView("chat");

    if (!id) return;

    if (getStatus(message) !== "NEW") {
      return;
    }

    try {
      const readEndpoint = API.CONTACT_READ ? `${API.CONTACT_READ}/${id}` : `http://${window.location.hostname}:8080/contact/read/${id}`;
      const updated = await putData(readEndpoint);

      const finalUpdated = updated?.data || updated || { ...message, status: "READ" };

      setSelectedMessage(finalUpdated);

      setMessages((previous) =>
        previous.map((item) =>
          getMessageId(item) === id
            ? { ...item, ...finalUpdated, status: "READ" }
            : item
        )
      );

      showToast("Message Read", `Conversation marked as read.`);
    } catch (error) {
      console.error("Mark as read error:", error);
      setMessages((previous) =>
        previous.map((item) =>
          getMessageId(item) === id ? { ...item, status: "READ" } : item
        )
      );
    }
  };

  const backToMessages = () => {
    setSelectedMessage(null);
    setReplyText("");
    setMobileView("list");
  };

  /* =======================================================
     WHATSAPP REPLY
  ======================================================= */

  const getWhatsAppNumber = (phone) => {
    if (!phone) return "";
    let number = String(phone).trim().replace(/\D/g, "");
    if (number.length === 10) number = `91${number}`;
    return number.length >= 10 ? number : "";
  };

  const openWhatsApp = (message, text) => {
    if (!message) return;

    const phone = getWhatsAppNumber(getPhone(message));
    if (!phone) {
      showToast("Invalid Phone", "WhatsApp phone number is missing.", "error");
      return;
    }

    const cleanText = String(text || "").trim();
    if (!cleanText) {
      showToast("Empty Message", "Please type a reply first.", "error");
      return;
    }

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(cleanText)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const handleSendReply = async () => {
    const text = replyText.trim();
    if (!text || !selectedMessage) return;

    const id = getMessageId(selectedMessage);
    if (!id) return;

    try {
      setSendingReply(true);

      const repliedEndpoint = API.CONTACT_REPLIED ? `${API.CONTACT_REPLIED}/${id}` : `http://${window.location.hostname}:8080/contact/replied/${id}`;
      await putData(repliedEndpoint);

      const updatedMessage = {
        ...selectedMessage,
        status: "REPLIED",
      };

      setSelectedMessage(updatedMessage);

      setMessages((previous) =>
        previous.map((item) =>
          getMessageId(item) === id ? updatedMessage : item
        )
      );

      showToast("WhatsApp Redirect", "Opening WhatsApp with your reply...");
      openWhatsApp(updatedMessage, text);
      setReplyText("");
    } catch (error) {
      console.error("Reply error:", error);
      showToast("Action Failed", error?.message || "Unable to send reply.", "error");
    } finally {
      setSendingReply(false);
    }
  };

  /* =======================================================
     DELETE MESSAGE
  ======================================================= */

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    const id = getMessageId(deleteTarget);
    if (id == null) return;

    try {
      setDeletingId(id);

      const deleteEndpoint = API.CONTACT_DELETE ? `${API.CONTACT_DELETE}/${id}` : `http://${window.location.hostname}:8080/contact/delete/${id}`;
      await deleteData(deleteEndpoint);

      setMessages((previous) =>
        previous.filter((item) => getMessageId(item) !== id)
      );

      if (selectedMessage && getMessageId(selectedMessage) === id) {
        setSelectedMessage(null);
        setMobileView("list");
      }

      setDeleteTarget(null);
      showToast("Deleted", "Message permanently removed.");
    } catch (error) {
      console.error("Delete error:", error);
      showToast("Delete Failed", "Could not delete message.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  /* =======================================================
     STYLES
  ======================================================= */

  const containerBg = darkMode ? "bg-[#05070d] text-slate-100" : "bg-[#f5f7fb] text-slate-900";
  const cardBg = darkMode ? "border-slate-800 bg-slate-900 shadow-xl" : "border-slate-200 bg-white shadow-md";
  const inputBg = darkMode ? "border-slate-700 bg-slate-800 text-white placeholder:text-slate-500" : "border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400";

  return (
    <div className={`min-h-screen w-full overflow-x-hidden ${containerBg}`}>
      
      {/* TOAST NOTIFICATION */}
      <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[30000] w-[calc(100%-24px)] max-w-[420px] transition-all duration-500 transform pointer-events-none ${
        toast ? "translate-y-0 opacity-100 scale-100" : "-translate-y-12 opacity-0 pointer-events-none scale-95"
      }`}>
        {toast && (
          <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/95 px-4 py-3.5 shadow-2xl backdrop-blur-2xl text-white">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 text-base">
              {toast.type === "error" ? "⚠️" : "✨"}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black tracking-wide">{toast.title}</p>
              <p className="text-[10px] text-slate-300 font-medium mt-0.5 truncate">{toast.text}</p>
            </div>
            <button 
              type="button" 
              onClick={() => setToast(null)} 
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition"
            >
              <X size={13} />
            </button>
          </div>
        )}
      </div>

      <main className="relative z-10 mx-auto w-full max-w-[1450px] min-w-0 px-2.5 pb-5 pt-4 min-[380px]:px-3 sm:px-5 sm:pt-5 lg:px-7 lg:pt-6">
        
        {/* HEADER SECTION */}
        <section className={`mb-4 rounded-2xl border p-3.5 sm:p-4 ${cardBg}`}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500">
                <MessageCircle size={21} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-500">
                  Admin Control
                </p>
                <h1 className="text-xl font-black sm:text-2xl">
                  Messages
                </h1>
                <p className="text-[11px] text-slate-500 sm:text-xs">
                  Manage patient conversations and inquiries
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className={`rounded-xl border px-3 py-1.5 text-xs font-black ${darkMode ? "border-slate-700 bg-slate-800 text-cyan-400" : "border-slate-200 bg-slate-100 text-cyan-600"}`}>
                Total: {messages.length}
              </div>
            </div>
          </div>
        </section>

        {/* WORKSPACE */}
        <section className={`relative flex h-[calc(100vh-170px)] min-h-[480px] w-full overflow-hidden rounded-2xl border p-2 sm:p-3 ${darkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white shadow-lg"}`}>
          
          <div className={`relative flex h-full w-full overflow-hidden rounded-xl border ${darkMode ? "border-slate-800 bg-slate-900" : "border-slate-100 bg-white"}`}>
            
            {/* SIDEBAR LIST */}
            <aside className={`${mobileView === "chat" ? "hidden lg:flex" : "flex"} w-full shrink-0 flex-col h-full border-r lg:w-[380px] ${darkMode ? "border-slate-800" : "border-slate-200"}`}>
              
              <div className={`shrink-0 border-b p-3 space-y-2 sm:p-4 ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
                <div className="relative w-full">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search messages..."
                    className={`h-10 w-full rounded-xl border pl-9 pr-3 text-xs outline-none focus:border-cyan-500 ${inputBg}`}
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] font-bold">
                  {["ALL", "NEW", "READ", "REPLIED"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`rounded-lg px-2.5 py-1 transition ${
                        statusFilter === st
                          ? "bg-cyan-500 text-white shadow-sm"
                          : darkMode ? "bg-slate-800 text-slate-400 hover:bg-slate-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div ref={messageListRef} className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
                {loading ? (
                  <ConversationLoading darkMode={darkMode} />
                ) : filteredMessages.length === 0 ? (
                  <EmptyConversation darkMode={darkMode} />
                ) : (
                  filteredMessages.map((message) => (
                    <ConversationItem
                      key={getMessageId(message)}
                      message={message}
                      darkMode={darkMode}
                      selected={selectedMessage && getMessageId(selectedMessage) === getMessageId(message)}
                      onClick={() => openChat(message)}
                    />
                  ))
                )}
              </div>
            </aside>

            {/* CHAT WINDOW */}
            <div className={`${mobileView === "list" ? "hidden lg:flex" : "flex"} min-w-0 flex-1 flex-col h-full overflow-hidden`}>
              {selectedMessage ? (
                <ChatWindow
                  message={selectedMessage}
                  darkMode={darkMode}
                  replyText={replyText}
                  setReplyText={setReplyText}
                  sendingReply={sendingReply}
                  onBack={backToMessages}
                  onDelete={() => setDeleteTarget(selectedMessage)}
                  onSend={handleSendReply}
                  onWhatsApp={() => openWhatsApp(selectedMessage, replyText)}
                  onOpenProfile={() => setProfileModalOpen(true)}
                  chatBodyRef={chatBodyRef}
                />
              ) : (
                <WelcomeChat darkMode={darkMode} />
              )}
            </div>

          </div>
        </section>

      </main>

      {/* =================================================
          PROFILE MODAL (EMAIL RESTORED)
      ================================================= */}
      {profileModalOpen && selectedMessage && (
        <div className="fixed inset-0 z-[20000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className={`w-full max-w-sm rounded-[28px] border p-6 text-center shadow-2xl relative ${darkMode ? "border-slate-700 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-900"}`}>
            
            <button
              type="button"
              onClick={() => setProfileModalOpen(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/10 hover:bg-black/20 transition"
            >
              <X size={16} />
            </button>

            {/* BIG DP INITIALS */}
            <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl text-2xl font-black shadow-inner ${darkMode ? "bg-cyan-500/25 text-cyan-300" : "bg-cyan-100 text-cyan-700"}`}>
              {getInitials(getName(selectedMessage))}
            </div>

            <h3 className="text-base font-black">
              {getName(selectedMessage)}
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              Patient Contact Details
            </p>

            <div className={`mt-5 space-y-3 rounded-2xl border p-4 text-left text-xs ${darkMode ? "border-slate-800 bg-slate-950" : "border-slate-100 bg-slate-50"}`}>
              <div className="flex items-center gap-3">
                <Phone size={15} className="text-cyan-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] text-slate-400 uppercase font-bold">Phone Number</p>
                  <p className="font-semibold truncate">{getPhone(selectedMessage)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail size={15} className="text-cyan-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] text-slate-400 uppercase font-bold">Email Address</p>
                  <p className="font-semibold truncate">{getEmail(selectedMessage)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar size={15} className="text-cyan-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] text-slate-400 uppercase font-bold">Received Date</p>
                  <p className="font-semibold truncate">{getFullDate(selectedMessage)} • {getTime(selectedMessage)}</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setProfileModalOpen(false);
                openWhatsApp(selectedMessage, "Hello!");
              }}
              className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-xs font-black text-white shadow-lg active:scale-95 transition"
            >
              <MessageCircle size={16} /> Open WhatsApp Chat
            </button>

          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm">
          <div className={`w-full max-w-sm rounded-3xl border p-5 text-center shadow-2xl ${darkMode ? "border-slate-700 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-900"}`}>
            <div className="mx-auto flex h-13 w-13 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
              <AlertTriangle size={25} />
            </div>
            <h3 className="mt-3 text-base font-black">Delete Message?</h3>
            <p className="mt-1.5 text-xs text-slate-500">This action cannot be undone.</p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className={`h-10 flex-1 rounded-xl text-xs font-black ${darkMode ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-700"}`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deletingId !== null}
                className="h-10 flex-1 rounded-xl bg-rose-600 text-xs font-black text-white"
              >
                {deletingId !== null ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/* =========================================================
   CONVERSATION ITEM
========================================================= */

function ConversationItem({ message, darkMode, selected, onClick }) {
  const status = getStatus(message);
  const isNew = status === "NEW";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex w-full items-center gap-3 border-b px-3.5 py-3.5 my-1.5 rounded-xl text-left transition ${
        selected
          ? darkMode ? "bg-cyan-500/15" : "bg-cyan-50"
          : darkMode ? "hover:bg-slate-800/60 border-slate-800/40" : "hover:bg-slate-50 border-slate-100"
      }`}
    >
      {selected && (
        <span className="absolute left-0 top-0 h-full w-1 rounded-r-full bg-cyan-500" />
      )}

      <div className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xs font-black ${darkMode ? "bg-cyan-500/20 text-cyan-300" : "bg-cyan-100 text-cyan-700"}`}>
        {getInitials(getName(message))}
        {isNew && (
          <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
        )}
      </div>

      <div className="min-w-0 flex-1 pr-1">
        <div className="flex items-center justify-between gap-1">
          <h3 className={`truncate text-xs font-black ${isNew ? (darkMode ? "text-white" : "text-slate-900") : (darkMode ? "text-slate-300" : "text-slate-700")}`}>
            {getName(message)}
          </h3>
          <span className="shrink-0 text-[9px] font-semibold text-slate-400">
            {getTime(message)}
          </span>
        </div>

        <div className="mt-1 flex items-center gap-1">
          {status === "READ" && <CheckCheck size={13} className="shrink-0 text-cyan-500" />}
          {status === "REPLIED" && <Reply size={13} className="shrink-0 text-emerald-500" />}
          <p className={`truncate text-[11px] ${isNew ? (darkMode ? "text-slate-200 font-bold" : "text-slate-900 font-bold") : "text-slate-400"}`}>
            {getMessage(message)}
          </p>
        </div>
      </div>
    </button>
  );
}

/* =========================================================
   CHAT WINDOW
========================================================= */

function ChatWindow({
  message,
  darkMode,
  replyText,
  setReplyText,
  sendingReply,
  onBack,
  onDelete,
  onSend,
  onWhatsApp,
  onOpenProfile,
  chatBodyRef,
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      
      {/* HEADER */}
      <div className={`flex shrink-0 items-center justify-between border-b px-3 py-2.5 sm:px-4 ${darkMode ? "border-slate-800 bg-slate-900/90" : "border-slate-200 bg-white"}`}>
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1 pr-2">
          <button
            type="button"
            onClick={onBack}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl lg:hidden ${darkMode ? "text-slate-300 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-100"}`}
          >
            <ArrowLeft size={16} />
          </button>

          {/* DP CLICKABLE */}
          <div 
            onClick={onOpenProfile}
            className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl text-[10px] font-black cursor-pointer hover:opacity-80 transition ${darkMode ? "bg-cyan-500/20 text-cyan-300" : "bg-cyan-100 text-cyan-700"}`}
            title="View Patient Profile"
          >
            {getInitials(getName(message))}
          </div>

          {/* NAME CLICKABLE */}
          <div onClick={onOpenProfile} className="min-w-0 flex-1 overflow-hidden cursor-pointer group">
            <p
              style={{ fontSize: "11px", fontWeight: "800", lineHeight: "1.2" }}
              className={`truncate group-hover:underline ${darkMode ? "text-white" : "text-slate-900"}`}
            >
              {getName(message)}
            </p>
            <p
              style={{ fontSize: "9px" }}
              className="text-slate-400 truncate mt-0.5 leading-none"
            >
              {getPhone(message)} • Tap for info
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onWhatsApp}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-green-500 hover:bg-green-500/10 transition"
            title="Open WhatsApp"
          >
            <MessageCircle size={16} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-rose-500 hover:bg-rose-500/10 transition"
            title="Delete Message"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* CHAT BODY */}
      <div ref={chatBodyRef} className={`flex-1 overflow-y-auto p-4 sm:p-6 ${darkMode ? "bg-[#05070d]" : "bg-[#f4f7fb]"}`}>
        <div className="mb-4 flex justify-center">
          <span className={`rounded-full border px-3 py-1 text-[9px] font-bold ${darkMode ? "border-slate-800 bg-slate-900 text-slate-400" : "border-slate-200 bg-white text-slate-500"}`}>
            {getFullDate(message)}
          </span>
        </div>

        <div className="mb-4 flex justify-start">
          <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl rounded-tl-sm border p-4 shadow-sm ${darkMode ? "border-slate-800 bg-slate-900 text-slate-200" : "border-slate-200 bg-white text-slate-800"}`}>
            <p className="text-xs leading-relaxed whitespace-pre-wrap break-words">
              {getMessage(message)}
            </p>
            <div className="mt-2 flex items-center justify-end gap-1.5 text-[9px] text-slate-400">
              <span>{getTime(message)}</span>
              <span>•</span>
              <span className="font-semibold text-cyan-500">{getStatus(message)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER REPLY */}
      <div className={`shrink-0 border-t p-3 sm:p-4 ${darkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}>
        <div className={`flex items-end gap-2 rounded-2xl border p-1.5 ${darkMode ? "border-slate-700 bg-slate-950" : "border-slate-200 bg-slate-50"}`}>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            rows={1}
            placeholder="Type a WhatsApp reply..."
            className={`max-h-28 min-h-[40px] w-full flex-1 resize-none rounded-xl bg-transparent px-3 py-2 text-xs font-medium outline-none ${darkMode ? "text-white placeholder:text-slate-600" : "text-slate-800 placeholder:text-slate-400"}`}
          />
          <button
            type="button"
            onClick={onSend}
            disabled={sendingReply || !replyText.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md active:scale-95 disabled:opacity-40 transition"
          >
            {sendingReply ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </div>

    </div>
  );
}

/* =========================================================
   WELCOME CHAT & HELPERS
========================================================= */

function WelcomeChat({ darkMode }) {
  return (
    <div className={`hidden flex-1 flex-col items-center justify-center p-6 text-center lg:flex ${darkMode ? "bg-[#05070d]" : "bg-[#f5f7fb]"}`}>
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-500">
        <MessageCircle size={36} />
      </div>
      <h2 className="text-lg font-black">Select a Conversation</h2>
      <p className="mt-1 max-w-sm text-xs text-slate-500">
        Choose a patient message from the left sidebar to view details and reply directly via WhatsApp.
      </p>
    </div>
  );
}

function EmptyConversation({ darkMode }) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center p-6 text-center">
      <div className={`mb-3 flex h-14 w-14 items-center justify-center rounded-2xl ${darkMode ? "bg-slate-800 text-slate-500" : "bg-slate-100 text-slate-400"}`}>
        <Inbox size={24} />
      </div>
      <h3 className="text-xs font-black">No messages found</h3>
      <p className="mt-1 text-[10px] text-slate-400">Inquiries will appear here once received.</p>
    </div>
  );
}

function ConversationLoading({ darkMode }) {
  return (
    <div className="space-y-2 p-3">
      {[1, 2, 3, 4, 5].map((item) => (
        <div key={item} className={`flex items-center gap-3 rounded-2xl p-3 animate-pulse ${darkMode ? "bg-slate-900" : "bg-white"}`}>
          <div className={`h-11 w-11 shrink-0 rounded-2xl ${darkMode ? "bg-slate-800" : "bg-slate-100"}`} />
          <div className="flex-1 space-y-2">
            <div className={`h-3 w-28 rounded ${darkMode ? "bg-slate-800" : "bg-slate-100"}`} />
            <div className={`h-2.5 w-40 rounded ${darkMode ? "bg-slate-800" : "bg-slate-100"}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

function getMessageId(m) { return m?.contactId ?? m?.id ?? m?.messageId; }
function getName(m) { return m?.name ?? m?.fullName ?? m?.patientName ?? "Unknown User"; }
function getEmail(m) { return m?.email ?? m?.emailAddress ?? "—"; }
function getPhone(m) { return m?.phone ?? m?.mobile ?? m?.phoneNumber ?? "—"; }
function getMessage(m) { return m?.message ?? m?.description ?? m?.content ?? "No message content"; }
function getStatus(m) { return (m?.status ?? "NEW").toString().toUpperCase(); }
function getTimestamp(m) {
  const val = m?.createdAt ?? m?.date ?? m?.submittedAt;
  const t = new Date(val).getTime();
  return Number.isNaN(t) ? 0 : t;
}
function getTime(m) {
  const val = m?.createdAt ?? m?.date ?? m?.submittedAt;
  try {
    const d = new Date(val);
    return Number.isNaN(d.getTime()) ? "--:--" : d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  } catch { return "--:--"; }
}
function getFullDate(m) {
  const val = m?.createdAt ?? m?.date ?? m?.submittedAt;
  try {
    const d = new Date(val);
    return Number.isNaN(d.getTime()) ? "Today" : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return "Today"; }
}
function getInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}