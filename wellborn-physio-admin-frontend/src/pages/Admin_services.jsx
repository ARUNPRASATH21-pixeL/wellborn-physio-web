import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  API,
  getData,
  postFormData,
  putFormData,
  deleteData,
} from "../services/api";

import {
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Layers,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Upload,
  Camera,
  FileImage,
  ZoomIn,
  ZoomOut,
  Check,
} from "lucide-react";

/* =========================================================
   DEFAULT IMAGE
========================================================= */

const DEFAULT_IMAGE = "/assets/wellborn physio.jpg";

/* =========================================================
   EMPTY FORM
========================================================= */

const EMPTY = {
  serviceName: "",
  description: "",
  status: true,

  image: null,
  imagePreview: "",
  originalImage: "",
};

/* =========================================================
   VALIDATION
========================================================= */

const VALIDATION = {
  serviceNameMin: 2,
  serviceNameMax: 100,

  descriptionMin: 10,
  descriptionMax: 1000,

  maxFileSize: 5 * 1024 * 1024,
};

/* =========================================================
   IMAGE URL
========================================================= */

const getImageUrl = (image) => {
  if (!image) {
    return DEFAULT_IMAGE;
  }

  const value = String(image).trim();

  if (!value) {
    return DEFAULT_IMAGE;
  }

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  ) {
    return value;
  }

  if (value.startsWith("/")) {
    return `http://${window.location.hostname}:8080${value}`;
  }

  return `http://${window.location.hostname}:8080/${value}`;
};

/* =========================================================
   NORMALIZE SERVICE
========================================================= */

const normalizeService = (service = {}) => ({
  ...service,

  serviceId:
    service.serviceId ??
    service.id ??
    null,

  serviceName:
    service.serviceName ?? "",

  description:
    service.description ?? "",

  image:
    service.image ?? "",

  status:
    service.status === undefined ||
    service.status === null
      ? true
      : Boolean(service.status),
});

/* =========================================================
   NORMALIZE RESPONSE
========================================================= */

const normalizeResponse = (response) => {
  const data = Array.isArray(response)
    ? response
    : Array.isArray(response?.data)
    ? response.data
    : Array.isArray(response?.content)
    ? response.content
    : response?.data
    ? [response.data]
    : response &&
      typeof response === "object"
    ? [response]
    : [];

  return data.map(normalizeService);
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function Admin_services() {
  /* =======================================================
     DARK MODE
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
        root.classList.contains(
          "wellborn-admin-dark"
        )
      );
    };

    updateTheme();

    const observer =
      new MutationObserver(updateTheme);

    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  /* =======================================================
     STATE
  ======================================================= */

  const [services, setServices] =
    useState([]);

  const [form, setForm] =
    useState({ ...EMPTY });

  const [errors, setErrors] =
    useState({});

  const [editId, setEditId] =
    useState(null);

  const [open, setOpen] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(null);

  const [confirm, setConfirm] =
    useState(null);

  const [message, setMessage] =
    useState(null);

  /* =======================================================
     IMAGE CROPPER / ADJUSTER STATE
  ======================================================= */

  const [cropperOpen, setCropperOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState("");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  /* =======================================================
     FILE INPUT
  ======================================================= */

  const fileInputRef =
    useRef(null);

  const cameraInputRef =
    useRef(null);

  const previewCanvasRef = useRef(null);

  /* =======================================================
     MESSAGE (WITH STABLE AUTO-DISMISS)
  ======================================================= */

  const showMessage = (
    title,
    text
  ) => {
    setMessage({
      title,
      text,
    });
  };

  const closeMessage = () => {
    setMessage(null);
  };

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      setMessage(null);
    }, 3200);
    return () => clearTimeout(timer);
  }, [message]);

  /* =======================================================
     LOAD SERVICES
  ======================================================= */

  const loadServices = async () => {
    try {
      setLoading(true);

      const response =
        await getData(
          API.SERVICE_GET_ALL
        );

      setServices(
        normalizeResponse(response)
      );
    } catch (error) {
      console.error(
        "Service loading error:",
        error
      );

      setServices([]);

      showMessage(
        "Load Failed",
        error?.message ||
          "Unable to load services."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  /* =======================================================
     VALIDATE IMAGE
  ======================================================= */

  const validateImage = (
    file
  ) => {
    if (!file) {
      return "Please select an image.";
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      return (
        "Only JPG, JPEG, PNG or WEBP " +
        "images are allowed."
      );
    }

    if (
      file.size >
      VALIDATION.maxFileSize
    ) {
      return (
        "Image size must be less than 5 MB."
      );
    }

    return "";
  };

  /* =======================================================
     IMAGE CHANGE & CROPPER TRIGGER
  ======================================================= */

  const handleImageChange = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const imageError =
      validateImage(file);

    if (imageError) {
      setErrors((prev) => ({
        ...prev,
        image: imageError,
      }));

      event.target.value = "";

      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setRawImageSrc(reader.result);
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setCropperOpen(true);
    };
    reader.readAsDataURL(file);

    event.target.value = "";
  };

  /* =======================================================
     CROPPER MOUSE / TOUCH EVENTS
  ======================================================= */

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  /* =======================================================
     APPLY CROP & GENERATE FILE
  ====================================================== */

  const applyCrop = () => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = rawImageSrc;

    img.onload = () => {
      canvas.width = 600;
      canvas.height = 400; // Aspect ratio for service cards

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();

      ctx.translate(canvas.width / 2 + pan.x, canvas.height / 2 + pan.y);
      ctx.scale(zoom, zoom);
      ctx.drawImage(
        img,
        -img.width / 2,
        -img.height / 2
      );
      ctx.restore();

      canvas.toBlob((blob) => {
        if (!blob) return;
        const croppedFile = new File([blob], "service-cropped.jpg", {
          type: "image/jpeg",
        });

        const previewUrl = URL.createObjectURL(blob);

        setForm((prev) => {
          if (
            prev.imagePreview &&
            prev.imagePreview.startsWith("blob:")
          ) {
            URL.revokeObjectURL(prev.imagePreview);
          }
          return {
            ...prev,
            image: croppedFile,
            imagePreview: previewUrl,
          };
        });

        setErrors((prev) => ({ ...prev, image: "" }));
        setCropperOpen(false);
        showMessage("Photo Adjusted", "Service photo successfully centered and adjusted.");
      }, "image/jpeg", 0.9);
    };
  };

  /* =======================================================
     OPEN FILE PICKER
  ======================================================= */

  const openFilePicker = () => {
    if (saving) {
      return;
    }

    fileInputRef.current?.click();
  };

  /* =======================================================
     CAMERA
  ======================================================= */

  const openCamera = () => {
    if (saving) {
      return;
    }

    cameraInputRef.current?.click();
  };

  /* =======================================================
     REMOVE IMAGE
  ======================================================= */

  const removeSelectedImage = () => {
    if (saving) {
      return;
    }

    if (
      form.imagePreview &&
      form.imagePreview.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        form.imagePreview
      );
    }

    if (
      editId &&
      form.image instanceof File
    ) {
      setForm((prev) => ({
        ...prev,

        image:
          prev.originalImage || "",

        imagePreview:
          prev.originalImage
            ? getImageUrl(
                prev.originalImage
              )
            : "",
      }));

      setErrors((prev) => ({
        ...prev,
        image: "",
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,

      image: null,
      imagePreview: "",
    }));

    setErrors((prev) => ({
      ...prev,
      image: "",
    }));
  };

  /* =======================================================
     OPEN ADD
  ======================================================= */

  const openAdd = () => {
    setEditId(null);

    setForm({
      ...EMPTY,
    });

    setErrors({});

    if (fileInputRef.current) {
      fileInputRef.current.value =
        "";
    }

    if (cameraInputRef.current) {
      cameraInputRef.current.value =
        "";
    }

    setOpen(true);
  };

  /* =======================================================
     OPEN EDIT
  ======================================================= */

  const openEdit = (
    service
  ) => {
    const s =
      normalizeService(service);

    if (s.serviceId == null) {
      showMessage(
        "Unable to Edit",
        "Service ID is missing."
      );

      return;
    }

    setEditId(
      s.serviceId
    );

    setForm({
      serviceName:
        s.serviceName,

      description:
        s.description,

      status:
        s.status,

      image:
        s.image || "",

      originalImage:
        s.image || "",

      imagePreview:
        s.image
          ? getImageUrl(
              s.image
            )
          : "",
    });

    setErrors({});

    if (fileInputRef.current) {
      fileInputRef.current.value =
        "";
    }

    if (cameraInputRef.current) {
      cameraInputRef.current.value =
        "";
    }

    setOpen(true);
  };

  /* =======================================================
     CLOSE MODAL
  ======================================================= */

  const closeModal = () => {
    if (saving) {
      return;
    }

    if (
      form.imagePreview &&
      form.imagePreview.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        form.imagePreview
      );
    }

    setOpen(false);

    setEditId(null);

    setForm({
      ...EMPTY,
    });

    setErrors({});

    if (fileInputRef.current) {
      fileInputRef.current.value =
        "";
    }

    if (cameraInputRef.current) {
      cameraInputRef.current.value =
        "";
    }
  };

  /* =======================================================
     VALIDATE FIELD
  ======================================================= */

  const validateField = (
    field,
    value
  ) => {
    const val =
      String(value ?? "").trim();

    if (
      field === "serviceName"
    ) {
      if (!val) {
        return (
          "Service name is required."
        );
      }

      if (
        val.length <
        VALIDATION.serviceNameMin
      ) {
        return (
          `Service name must be at least ${VALIDATION.serviceNameMin} characters.`
        );
      }

      if (
        val.length >
        VALIDATION.serviceNameMax
      ) {
        return (
          `Service name must not exceed ${VALIDATION.serviceNameMax} characters.`
        );
      }
    }

    if (
      field === "description"
    ) {
      if (!val) {
        return (
          "Description is required."
        );
      }

      if (
        val.length <
        VALIDATION.descriptionMin
      ) {
        return (
          `Description must be at least ${VALIDATION.descriptionMin} characters.`
        );
      }

      if (
        val.length >
        VALIDATION.descriptionMax
      ) {
        return (
          `Description must not exceed ${VALIDATION.descriptionMax} characters.`
        );
      }
    }

    return "";
  };

  /* =======================================================
     FIELD CHANGE
  ======================================================= */

  const handleFieldChange = (
    name,
    value
  ) => {
    let newValue = value;

    if (
      name === "serviceName"
    ) {
      newValue =
        value.slice(
          0,
          VALIDATION.serviceNameMax
        );
    }

    if (
      name === "description"
    ) {
      newValue =
        value.slice(
          0,
          VALIDATION.descriptionMax
        );
    }

    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    if (errors[name]) {
      const error =
        validateField(
          name,
          newValue
        );

      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  /* =======================================================
     FULL VALIDATION
  ======================================================= */

  const validateForm = () => {
    const newErrors = {};

    const serviceNameError =
      validateField(
        "serviceName",
        form.serviceName
      );

    if (serviceNameError) {
      newErrors.serviceName =
        serviceNameError;
    }

    const descriptionError =
      validateField(
        "description",
        form.description
      );

    if (descriptionError) {
      newErrors.description =
        descriptionError;
    }

    if (editId == null) {
      if (
        !(
          form.image instanceof
          File
        )
      ) {
        newErrors.image =
          "Please select a service image.";
      }
    }

    if (editId != null) {
      if (
        form.image instanceof
        File
      ) {
        const error =
          validateImage(
            form.image
          );

        if (error) {
          newErrors.image =
            error;
        }
      } else if (
        !form.imagePreview
      ) {
        newErrors.image =
          "Service image is required.";
      }
    }

    setErrors(newErrors);

    return (
      Object.keys(
        newErrors
      ).length === 0
    );
  };

  /* =======================================================
     BUILD FORM DATA
  ========================================================= */

  const buildFormData = () => {
    const formData =
      new FormData();

    formData.append(
      "serviceName",
      form.serviceName.trim()
    );

    formData.append(
      "description",
      form.description.trim()
    );

    formData.append(
      "status",
      String(
        Boolean(form.status)
      )
    );

    if (
      form.image instanceof File
    ) {
      formData.append(
        "image",
        form.image
      );
    }

    return formData;
  };

  /* =======================================================
     SUBMIT
  ======================================================= */

  const submit = (e) => {
    e.preventDefault();

    if (saving) {
      return;
    }

    if (!validateForm()) {
      showMessage(
        "Validation Failed",
        "Please correct the highlighted fields."
      );

      return;
    }

    setConfirm({
      type: "save",

      title:
        editId != null
          ? "Update Service?"
          : "Add Service?",

      text:
        editId != null
          ? "Do you want to update this service?"
          : "Do you want to add this service?",
    });
  };

  /* =======================================================
     SAVE SERVICE
  ======================================================= */

  const saveService =
    async () => {
      const currentId =
        editId;

      if (!validateForm()) {
        setConfirm(null);

        showMessage(
          "Validation Failed",
          "Please correct all highlighted fields."
        );

        return;
      }

      try {
        setConfirm(null);

        setSaving(true);

        const formData =
          buildFormData();

        if (
          currentId != null
        ) {
          await putFormData(
            `${API.SERVICE_UPDATE}/${currentId}`,
            formData
          );
        } else {
          await postFormData(
            API.SERVICE_ADD,
            formData
          );
        }

        if (
          form.imagePreview &&
          form.imagePreview.startsWith(
            "blob:"
          )
        ) {
          URL.revokeObjectURL(
            form.imagePreview
          );
        }

        setOpen(false);

        setEditId(null);

        setForm({
          ...EMPTY,
        });

        setErrors({});

        if (
          fileInputRef.current
        ) {
          fileInputRef.current.value =
            "";
        }

        if (
          cameraInputRef.current
        ) {
          cameraInputRef.current.value =
            "";
        }

        await loadServices();

        showMessage(
          currentId != null
            ? "Service Updated"
            : "Service Added",

          currentId != null
            ? "Service updated successfully."
            : "Service added successfully."
        );
      } catch (error) {
        console.error(
          "Service save error:",
          error
        );

        showMessage(
          "Save Failed",
          error?.message ||
            "Unable to save service."
        );
      } finally {
        setSaving(false);
      }
    };

  /* =======================================================
     DELETE
  ======================================================= */

  const remove = (
    serviceId
  ) => {
    if (serviceId == null) {
      showMessage(
        "Delete Failed",
        "Service ID is missing."
      );

      return;
    }

    setConfirm({
      type: "delete",
      id: serviceId,
      title: "Delete Service?",
      text:
        "This action cannot be undone.",
    });
  };

  /* =======================================================
     DELETE SERVICE
  ======================================================= */

  const deleteService =
    async () => {
      const id =
        confirm?.id;

      if (id == null) {
        return;
      }

      try {
        setConfirm(null);

        setDeleting(id);

        await deleteData(
          `${API.SERVICE_DELETE}/${id}`
        );

        setServices(
          (prev) =>
            prev.filter(
              (service) =>
                service.serviceId !==
                id
            )
        );

        showMessage(
          "Service Deleted",
          "Service deleted successfully."
        );
      } catch (error) {
        console.error(
          "Delete service error:",
          error
        );

        showMessage(
          "Delete Failed",
          error?.message ||
            "Unable to delete service."
        );
      } finally {
        setDeleting(null);
      }
    };

  /* =======================================================
     SEARCH
  ======================================================= */

  const searchText =
    search
      .trim()
      .toLowerCase();

  const filteredServices =
    services.filter(
      (service) => {
        if (!searchText) {
          return true;
        }

        return (
          String(
            service.serviceName
          )
            .toLowerCase()
            .includes(
              searchText
            ) ||
          String(
            service.description
          )
            .toLowerCase()
            .includes(
              searchText
            )
        );
      }
    );

  /* =======================================================
     RETURN
  ======================================================= */

  return (
    <div
      className={`relative min-h-screen w-full transition-colors duration-300 ${
        darkMode
          ? "bg-slate-950 text-slate-100"
          : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* =================================================
          TOP-CENTER SLIDE-IN (FROM RIGHT TO LEFT) GLASS TOAST
      ================================================= */}
      <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[25000] w-[calc(100%-24px)] max-w-[420px] transition-all duration-500 transform pointer-events-none ${
        message ? "translate-y-0 opacity-100 scale-100" : "-translate-y-12 opacity-0 pointer-events-none scale-95"
      }`}>
        {message && (
          <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3.5 shadow-2xl backdrop-blur-2xl text-white">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 text-base">
              {message.title.includes("Failed") || message.title.includes("Unable") || message.title.includes("Validation") ? "⚠️" : "✨"}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black tracking-wide">{message.title}</p>
              <p className="text-[10px] text-slate-300 font-medium mt-0.5 truncate">{message.text}</p>
            </div>
            <button 
              type="button" 
              onClick={closeMessage} 
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition"
            >
              <X size={13} />
            </button>
          </div>
        )}
      </div>

      <main
        className="
          relative
          z-10
          mx-auto
          w-full
          max-w-[1500px]
          min-w-0

          pt-[16px]

          px-2.5
          pb-4

          min-[380px]:pt-[18px]
          min-[380px]:px-3

          sm:pt-[22px]
          sm:px-5
          sm:pb-6

          lg:pt-[26px]
          lg:px-8
        "
      >
        <section
          className={`mb-4 w-full overflow-hidden rounded-2xl border p-3 sm:mb-6 sm:p-6 ${
            darkMode
              ? "border-slate-700 bg-slate-900 shadow-lg"
              : "border-slate-200 bg-white shadow-sm"
          }`}
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border sm:h-12 sm:w-12 ${
                  darkMode
                    ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                    : "border-cyan-100 bg-cyan-50 text-cyan-600"
                }`}
              >
                <Layers size={22} />
              </div>

              <div>
                <div className="mb-1 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />

                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      darkMode
                        ? "text-emerald-400"
                        : "text-emerald-600"
                    }`}
                  >
                    Admin Control
                  </span>
                </div>

                <h1 className="text-lg font-black sm:text-2xl">
                  Services
                </h1>
              </div>
            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
              <div className="relative w-full sm:w-[260px]">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search services..."
                  className={`h-10 w-full rounded-xl border pl-9 pr-3 text-xs font-medium outline-none sm:h-11 sm:text-sm ${
                    darkMode
                      ? "border-slate-700 bg-slate-800 text-white focus:border-cyan-500"
                      : "border-slate-200 bg-slate-50 text-slate-900 focus:border-cyan-500"
                  }`}
                />
              </div>

              <button
                type="button"
                onClick={openAdd}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 text-xs font-bold text-white transition hover:bg-cyan-700 active:scale-95 sm:h-11 sm:w-auto sm:text-sm"
              >
                <Plus size={18} />
                Add Service
              </button>
            </div>
          </div>
        </section>

        <div className="mb-4 flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${
              darkMode
                ? "bg-cyan-500/10 text-cyan-400"
                : "bg-cyan-50 text-cyan-600"
            }`}
          >
            <Layers size={16} />
          </div>

          <h2 className="text-lg font-black">
            Service Overview
          </h2>
        </div>

        {loading ? (
          <LoadingCards
            darkMode={darkMode}
          />
        ) : filteredServices.length ===
          0 ? (
          <EmptyState
            darkMode={darkMode}
          />
        ) : (
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {filteredServices.map(
              (service) => (
                <ServiceCard
                  key={
                    service.serviceId
                  }
                  service={service}
                  onEdit={
                    openEdit
                  }
                  onDelete={
                    remove
                  }
                  deleting={
                    deleting ===
                    service.serviceId
                  }
                  darkMode={
                    darkMode
                  }
                />
              )
            )}
          </div>
        )}
      </main>

      {open && (
        <ServiceModal
          editId={editId}
          form={form}
          errors={errors}
          darkMode={darkMode}
          saving={saving}
          close={closeModal}
          submit={submit}
          handleFieldChange={
            handleFieldChange
          }
          openFilePicker={
            openFilePicker
          }
          openCamera={
            openCamera
          }
          handleImageChange={
            handleImageChange
          }
          removeSelectedImage={
            removeSelectedImage
          }
          fileInputRef={
            fileInputRef
          }
          cameraInputRef={
            cameraInputRef
          }
        />
      )}

      {/* =================================================
          IMAGE CROPPER / ADJUSTER MODAL
      ================================================= */}

      {cropperOpen && (
        <div className="fixed inset-0 z-[10010] flex items-center justify-center bg-black/80 p-3 backdrop-blur-md">
          <div className={`w-full max-w-md rounded-3xl border p-4 shadow-2xl ${darkMode ? "border-slate-700 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-900"}`}>
            
            <div className="flex items-center justify-between pb-3">
              <div>
                <h3 className="text-sm font-black">Adjust Service Photo</h3>
                <p className="text-[10px] text-slate-400">Drag to center & use slider to zoom</p>
              </div>
              <button
                type="button"
                onClick={() => setCropperOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-500/10"
              >
                <X size={14} />
              </button>
            </div>

            {/* CROP PREVIEW WINDOW */}
            <div 
              className="relative mx-auto h-52 w-full overflow-hidden rounded-2xl border border-cyan-500/40 bg-slate-950 cursor-grab active:cursor-grabbing touch-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {rawImageSrc && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <img
                    src={rawImageSrc}
                    alt="Crop preview"
                    style={{
                      transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                      transition: isDragging ? "none" : "transform 0.1s ease-out",
                      maxWidth: "none",
                      maxHeight: "none",
                    }}
                    className="h-full w-full object-contain"
                  />
                </div>
              )}

              {/* CENTER GUIDE FRAME */}
              <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-cyan-400/60 rounded-xl m-3 flex items-center justify-center">
                <div className="bg-black/40 px-2 py-1 rounded text-[9px] text-cyan-300 font-bold backdrop-blur-sm">
                  Keep focus inside box
                </div>
              </div>
            </div>

            {/* ZOOM CONTROLS */}
            <div className="mt-4 flex items-center gap-3">
              <ZoomOut size={16} className="text-slate-400" />
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <ZoomIn size={16} className="text-slate-400" />
            </div>

            <canvas ref={previewCanvasRef} className="hidden" />

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setCropperOpen(false)}
                className="h-10 flex-1 rounded-xl bg-slate-500/10 text-xs font-black transition hover:bg-slate-500/20"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyCrop}
                className="h-10 flex-1 rounded-xl bg-cyan-600 text-xs font-black text-white transition hover:bg-cyan-500 flex items-center justify-center gap-1.5"
              >
                <Check size={14} /> Crop & Apply
              </button>
            </div>

          </div>
        </div>
      )}

      {confirm && (
        <ConfirmModal
          confirm={confirm}
          close={() =>
            setConfirm(null)
          }
          save={saveService}
          deleteService={
            deleteService
          }
          saving={saving}
          deleting={
            deleting ===
            confirm.id
          }
          darkMode={darkMode}
        />
      )}
    </div>
  );
}

/* =========================================================
   SERVICE MODAL
========================================================= */

function ServiceModal({
  editId,
  form,
  errors,
  darkMode,
  saving,
  close,
  submit,
  handleFieldChange,
  openFilePicker,
  openCamera,
  handleImageChange,
  removeSelectedImage,
  fileInputRef,
  cameraInputRef,
}) {
  useEffect(() => {
    const old =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        old;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center overflow-hidden bg-black/55 p-2 backdrop-blur-md sm:items-center sm:p-5"
      style={{
        paddingTop:
          "max(12px, env(safe-area-inset-top))",
        paddingBottom:
          "max(12px, env(safe-area-inset-bottom))",
      }}
    >
      <div
        className={`relative my-auto flex max-h-[94dvh] w-full max-w-[520px] flex-col overflow-hidden rounded-[22px] border shadow-2xl sm:rounded-[28px] ${
          darkMode
            ? "border-white/10 bg-[#17181c]/95 text-white"
            : "border-white/80 bg-[#f7f7f9]/95 text-[#111]"
        }`}
      >
        <div
          className={`border-b px-3 py-3 sm:px-6 sm:py-4 ${
            darkMode
              ? "border-white/10 bg-[#17181c]/90"
              : "border-black/5 bg-[#f7f7f9]/90"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`text-[11px] font-semibold uppercase tracking-wider ${
                  darkMode
                    ? "text-cyan-400"
                    : "text-cyan-600"
                }`}
              >
                Service Management
              </p>

              <h2 className="mt-0.5 text-lg font-bold sm:text-xl">
                {editId != null
                  ? "Edit Service"
                  : "Add Service"}
              </h2>
            </div>

            <button
              type="button"
              onClick={close}
              disabled={saving}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black/[0.06]"
            >
              <X size={19} />
            </button>
          </div>
        </div>

        <form
          onSubmit={submit}
          noValidate
          className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 sm:px-6 sm:py-5"
        >
          <IOSField
            label="Service Name"
            error={
              errors.serviceName
            }
            darkMode={darkMode}
          >
            <input
              value={
                form.serviceName
              }
              maxLength={
                VALIDATION.serviceNameMax
              }
              onChange={(e) =>
                handleFieldChange(
                  "serviceName",
                  e.target.value
                )
              }
              placeholder="Enter service name"
              className={iosInput(
                darkMode,
                errors.serviceName
              )}
            />

            <Counter
              value={
                form.serviceName
              }
              max={
                VALIDATION.serviceNameMax
              }
              darkMode={darkMode}
            />
          </IOSField>

          <IOSField
            label="Description"
            error={
              errors.description
            }
            darkMode={darkMode}
          >
            <textarea
              rows={5}
              maxLength={
                VALIDATION.descriptionMax
              }
              value={
                form.description
              }
              onChange={(e) =>
                handleFieldChange(
                  "description",
                  e.target.value
                )
              }
              placeholder="Enter service description"
              className={`${iosInput(
                darkMode,
                errors.description
              )} min-h-[120px] resize-none py-3.5`}
            />

            <Counter
              value={
                form.description
              }
              max={
                VALIDATION.descriptionMax
              }
              darkMode={darkMode}
            />
          </IOSField>

          <ServiceImageUpload
            form={form}
            errors={errors}
            editId={editId}
            darkMode={darkMode}
            openFilePicker={
              openFilePicker
            }
            openCamera={
              openCamera
            }
            handleImageChange={
              handleImageChange
            }
            removeSelectedImage={
              removeSelectedImage
            }
            fileInputRef={
              fileInputRef
            }
            cameraInputRef={
              cameraInputRef
            }
            saving={saving}
          />

          <IOSField
            label="Status"
            error={errors.status}
            darkMode={darkMode}
          >
            <div
              className={`flex overflow-hidden rounded-2xl border p-1 ${
                darkMode
                  ? "border-white/10 bg-white/[0.05]"
                  : "border-black/[0.06] bg-black/[0.04]"
              }`}
            >
              <button
                type="button"
                onClick={() =>
                  handleFieldChange(
                    "status",
                    true
                  )
                }
                className={`h-11 flex-1 rounded-xl text-xs font-bold sm:text-sm ${
                  form.status ===
                  true
                    ? "bg-cyan-500 text-white"
                    : "text-slate-500"
                }`}
              >
                ACTIVE
              </button>

              <button
                type="button"
                onClick={() =>
                  handleFieldChange(
                    "status",
                    false
                  )
                }
                className={`h-11 flex-1 rounded-xl text-xs font-bold sm:text-sm ${
                  form.status ===
                  false
                    ? "bg-red-500 text-white"
                    : "text-slate-500"
                }`}
              >
                INACTIVE
              </button>
            </div>
          </IOSField>

          <div className="mt-5 flex gap-2 sm:gap-3">
            <button
              type="button"
              onClick={close}
              disabled={saving}
              className="h-11 flex-1 rounded-xl bg-black/[0.06] text-xs font-bold sm:h-12 sm:rounded-2xl sm:text-sm"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="h-11 flex-[1.3] rounded-xl bg-cyan-500 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 sm:h-12 sm:rounded-2xl sm:text-sm"
            >
              {saving
                ? "Saving..."
                : editId != null
                ? "Update Service"
                : "Save Service"}
            </button>
          </div>

          <div
            style={{
              height:
                "env(safe-area-inset-bottom)",
            }}
          />
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   SERVICE IMAGE UPLOAD
========================================================= */

function ServiceImageUpload({
  form,
  errors,
  editId,
  darkMode,
  openFilePicker,
  openCamera,
  handleImageChange,
  removeSelectedImage,
  fileInputRef,
  cameraInputRef,
  saving,
}) {
  const isNewFile =
    form.image instanceof File;

  const hasPreview =
    Boolean(
      form.imagePreview
    );

  return (
    <div className="mb-5 min-w-0">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label
          className={`text-xs font-bold ${
            darkMode
              ? "text-slate-300"
              : "text-slate-600"
          }`}
        >
          Service Image

          <span className="ml-1 text-[10px] font-medium text-slate-400">
            *
          </span>
        </label>

        {isNewFile && (
          <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[9px] font-black text-emerald-500">
            NEW PHOTO
          </span>
        )}
      </div>

      <div
        className={`relative overflow-hidden rounded-2xl border ${
          errors.image
            ? "border-rose-500"
            : darkMode
            ? "border-slate-700 bg-slate-800"
            : "border-slate-200 bg-slate-50"
        }`}
      >
        {hasPreview ? (
          <div>
            <div className="relative">
              <img
                src={
                  form.imagePreview
                }
                alt="Service preview"
                className="h-52 w-full object-cover object-center sm:h-60"
                onError={(e) => {
                  if (
                    e.currentTarget
                      .dataset
                      .fallback !==
                    "true"
                  ) {
                    e.currentTarget.dataset.fallback =
                      "true";

                    e.currentTarget.src =
                      DEFAULT_IMAGE;
                  }
                }}
              />

              <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1.5 text-[10px] font-bold text-white backdrop-blur-md">
                <FileImage
                  size={12}
                />

                {isNewFile
                  ? "New Photo"
                  : "Current Photo"}
              </div>
            </div>

            <div
              className={`p-3 ${
                darkMode
                  ? "bg-slate-900"
                  : "bg-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500">
                  <FileImage
                    size={17}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-xs font-black ${
                      darkMode
                        ? "text-white"
                        : "text-slate-800"
                    }`}
                  >
                    {isNewFile
                      ? form.image
                          .name
                      : "Current service image"}
                  </p>

                  <p className="mt-0.5 text-[10px] text-slate-400">
                    {isNewFile
                      ? `${(
                          form.image
                            .size /
                          1024 /
                          1024
                        ).toFixed(
                          2
                        )} MB`
                      : "Existing uploaded image"}
                  </p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={
                    openFilePicker
                  }
                  disabled={saving}
                  className="flex h-10 items-center justify-center gap-2 rounded-xl bg-cyan-600 text-xs font-black text-white transition hover:bg-cyan-500 disabled:opacity-50"
                >
                  {editId ? (
                    <Pencil
                      size={14}
                    />
                  ) : (
                    <Upload
                      size={14}
                    />
                  )}

                  {editId
                    ? "Change Photo"
                    : "Change Image"}
                </button>

                <button
                  type="button"
                  onClick={
                    removeSelectedImage
                  }
                  disabled={saving}
                  className={`flex h-10 items-center justify-center gap-2 rounded-xl text-xs font-black disabled:opacity-50 ${
                    darkMode
                      ? "bg-slate-800 text-slate-300"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <X size={14} />

                  {isNewFile
                    ? "Cancel Photo"
                    : "Remove"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-5 py-8 text-center">
            <button
              type="button"
              onClick={
                openFilePicker
              }
              disabled={saving}
              className="flex w-full flex-col items-center justify-center text-center disabled:opacity-50"
            >
              <div
                className={`mb-3 flex h-16 w-16 items-center justify-center rounded-2xl ${
                  darkMode
                    ? "bg-cyan-500/10 text-cyan-400"
                    : "bg-cyan-50 text-cyan-600"
                }`}
              >
                <Upload
                  size={28}
                />
              </div>

              <p
                className={`text-sm font-black ${
                  darkMode
                    ? "text-white"
                    : "text-slate-800"
                }`}
              >
                Upload Files
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Select service photo from your device
              </p>

              <div className="mt-4 flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 text-xs font-black text-white">
                <Upload
                  size={14}
                />

                Choose File
              </div>

              <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-400">
                <Camera
                  size={12}
                />

                On mobile, you can choose from Gallery or Camera
              </div>
            </button>

            <button
              type="button"
              onClick={
                openCamera
              }
              disabled={saving}
              className={`mx-auto mt-3 flex h-10 items-center justify-center gap-2 rounded-xl px-5 text-xs font-black transition disabled:opacity-50 ${
                darkMode
                  ? "bg-slate-800 text-slate-200"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              <Camera
                size={15}
              />

              Open Camera
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={
            handleImageChange
          }
        />

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          capture="environment"
          className="hidden"
          onChange={
            handleImageChange
          }
        />
      </div>

      <div className="mt-1.5 flex items-center justify-between gap-2">
        <p className="text-[10px] text-slate-400">
          JPG, JPEG, PNG or WEBP • Maximum 5 MB
        </p>

        {isNewFile && (
          <p className="shrink-0 text-[10px] font-bold text-emerald-500">
            Ready to upload
          </p>
        )}
      </div>

      {errors.image && (
        <p className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-rose-500">
          <AlertTriangle
            size={12}
          />

          {errors.image}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   FIELD
========================================================= */

function IOSField({
  label,
  children,
  error,
  darkMode,
}) {
  return (
    <div className="mb-5">
      <label
        className={`mb-2 block px-1 text-[12px] font-semibold ${
          darkMode
            ? "text-slate-300"
            : "text-slate-600"
        }`}
      >
        {label}

        <span className="ml-1 text-red-500">
          *
        </span>
      </label>

      {children}

      {error && (
        <div className="mt-1.5 flex items-start gap-1.5 px-1">
          <AlertTriangle
            size={13}
            className="mt-[1px] shrink-0 text-red-500"
          />

          <p className="text-[11px] font-medium leading-4 text-red-500">
            {error}
          </p>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   COUNTER
========================================================= */

function Counter({
  value,
  max,
  darkMode,
}) {
  return (
    <div
      className={`mt-1 flex justify-end px-1 text-[10px] ${
        darkMode
          ? "text-slate-500"
          : "text-slate-400"
      }`}
    >
      {value.length}/{max}
    </div>
  );
}

/* =========================================================
   INPUT STYLE
========================================================= */

function iosInput(
  darkMode,
  error
) {
  return `w-full rounded-xl border px-3 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:ring-2 sm:rounded-2xl sm:px-4 sm:text-[15px] ${
    error
      ? "border-red-500 focus:ring-red-500/20"
      : darkMode
      ? "border-white/10 bg-white/[0.06] text-white focus:border-cyan-400 focus:ring-cyan-500/20"
      : "border-black/[0.07] bg-white text-[#111] shadow-sm focus:border-cyan-400 focus:ring-cyan-500/20"
  }`;
}

/* =========================================================
   SERVICE CARD
========================================================= */

function ServiceCard({
  service,
  onEdit,
  onDelete,
  deleting,
  darkMode,
}) {
  const active =
    Boolean(service.status);

  return (
    <article
      className={`flex w-full flex-col overflow-hidden rounded-[18px] border sm:rounded-2xl ${
        darkMode
          ? "border-slate-700 bg-slate-900"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="relative h-[190px] w-full overflow-hidden bg-slate-100 sm:h-[160px] lg:h-[180px]">
        <img
          src={
            service.image
              ? getImageUrl(
                  service.image
                )
              : DEFAULT_IMAGE
          }
          alt={
            service.serviceName ||
            "Service"
          }
          loading="lazy"
          className="h-full w-full object-cover object-top"
          onError={(e) => {
            if (
              e.currentTarget
                .dataset
                .fallback !== "true"
            ) {
              e.currentTarget.dataset.fallback =
                "true";

              e.currentTarget.src =
                DEFAULT_IMAGE;
            }
          }}
        />

        <div className="absolute right-3 top-3">
          <StatusBadge
            active={active}
            darkMode={darkMode}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-2.5 sm:px-4 sm:pb-4">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-cyan-600">
          Service
        </p>

        <h3
          className={`line-clamp-2 min-h-[42px] text-base font-black leading-5 ${
            darkMode
              ? "text-white"
              : "text-[#001738]"
          }`}
        >
          {service.serviceName ||
            "Unnamed Service"}
        </h3>

        <p
          className={`mb-1 mt-0 text-[10px] font-bold uppercase tracking-wider ${
            darkMode
              ? "text-cyan-400"
              : "text-cyan-600"
          }`}
        >
          Description
        </p>

        <p
          className={`line-clamp-4 text-sm leading-relaxed ${
            darkMode
              ? "text-slate-400"
              : "text-[#5b6e82]"
          }`}
        >
          {service.description ||
            "No description available."}
        </p>

        <div className="mt-auto flex w-full gap-2 pt-4 sm:gap-3 sm:pt-5">
          <button
            type="button"
            onClick={() =>
              onEdit(service)
            }
            className={`flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl px-2 text-xs font-bold transition active:scale-95 sm:h-11 sm:text-sm ${
              darkMode
                ? "bg-slate-800 text-white hover:bg-slate-700"
                : "bg-[#f1f4f9] text-[#001738] hover:bg-slate-200"
            }`}
          >
            <Pencil
              size={15}
            />

            Edit
          </button>

          <button
            type="button"
            onClick={() =>
              onDelete(
                service.serviceId
              )
            }
            disabled={deleting}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border sm:h-11 sm:w-11 ${
              darkMode
                ? "border-red-500/30 bg-red-500/10 text-red-400"
                : "border-red-200 bg-[#fff5f5] text-[#e03131]"
            }`}
          >
            {deleting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Trash2
                size={18}
              />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   STATUS
========================================================= */

function StatusBadge({
  active,
  darkMode,
}) {
  if (active) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
          darkMode
            ? "border-emerald-500/50 bg-slate-900/80 text-emerald-400"
            : "border-emerald-200 bg-white/95 text-[#0ca678]"
        }`}
      >
        <CheckCircle2
          size={12}
        />

        ACTIVE
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
        darkMode
          ? "border-red-500/50 bg-slate-900/80 text-red-400"
          : "border-red-200 bg-white/95 text-[#e03131]"
      }`}
    >
      <XCircle
        size={12}
      />

      INACTIVE
    </span>
  );
}

/* =========================================================
   CONFIRM MODAL
========================================================= */

function ConfirmModal({
  confirm,
  close,
  save,
  deleteService,
  saving,
  deleting,
  darkMode,
}) {
  const isDelete =
    confirm.type ===
    "delete";

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-3 backdrop-blur-xl">
      <div
        className={`w-full max-w-sm rounded-[24px] border p-5 shadow-2xl sm:rounded-[28px] sm:p-6 ${
          darkMode
            ? "border-white/10 bg-[#17181c]"
            : "border-white bg-[#f7f7f9]"
        }`}
      >
        <div className="mb-4 flex justify-center">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-full ${
              isDelete
                ? "bg-red-100 text-red-600"
                : "bg-cyan-100 text-cyan-600"
            }`}
          >
            {isDelete ? (
              <AlertTriangle
                size={30}
              />
            ) : (
              <CheckCircle2
                size={30}
              />
            )}
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-xl font-black">
            {confirm.title}
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            {confirm.text}
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={close}
            disabled={
              saving ||
              deleting
            }
            className="h-11 flex-1 rounded-xl bg-slate-100 text-sm font-bold text-slate-900 sm:h-12 sm:rounded-2xl"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={
              isDelete
                ? deleteService
                : save
            }
            disabled={
              saving ||
              deleting
            }
            className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-bold text-white sm:h-12 sm:rounded-2xl ${
              isDelete
                ? "bg-red-600"
                : "bg-cyan-600"
            }`}
          >
            {saving ||
            deleting ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : isDelete ? (
              <>
                <Trash2
                  size={17}
                />
                Delete
              </>
            ) : (
              <>
                <CheckCircle2
                  size={17}
                />
                Confirm
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  darkMode,
}) {
  return (
    <div
      className={`flex min-h-[300px] w-full flex-col items-center justify-center rounded-3xl border border-dashed p-6 text-center ${
        darkMode
          ? "border-slate-700 bg-slate-900"
          : "border-slate-300 bg-white"
      }`}
    >
      <div
        className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
          darkMode
            ? "bg-slate-800 text-slate-400"
            : "bg-slate-100 text-slate-500"
        }`}
      >
        <Layers size={28} />
      </div>

      <h3 className="text-lg font-black">
        No services found
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        Add a new service to get started.
      </p>
    </div>
  );
}

/* =========================================================
   LOADING
========================================================= */

function LoadingCards({
  darkMode,
}) {
  return (
    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      {[1, 2, 3, 4].map(
        (item) => (
          <div
            key={item}
            className={`h-[350px] animate-pulse rounded-3xl border ${
              darkMode
                ? "border-slate-700 bg-slate-900"
                : "border-slate-200 bg-white"
            }`}
          />
        )
      )}
    </div>
  );
}