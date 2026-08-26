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
  Stethoscope,
  Phone,
  Mail,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Upload,
  FileImage,
  Camera,
  Award,
  ZoomIn,
  ZoomOut,
  Move,
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
  doctorName: "",
  qualification: "",
  specialization: "",
  experience: "",
  phone: "",
  email: "",
  status: "Active",
  image: null,
  imagePreview: "",
  originalImage: "",
};

/* =========================================================
   VALIDATION RULES
========================================================= */

const VALIDATION_RULES = {
  doctorName: {
    required: true,
    min: 3,
    max: 60,
    pattern: /^[A-Za-z][A-Za-z\s.'-]*$/,
    message:
      "Doctor name must contain letters and spaces only.",
  },

  qualification: {
    required: true,
    min: 2,
    max: 100,
    pattern: /^[A-Za-z0-9\s.,()&+/-]+$/,
    message: "Enter a valid qualification.",
  },

  specialization: {
    required: true,
    min: 2,
    max: 100,
    pattern: /^[A-Za-z0-9\s.,()&+/-]+$/,
    message: "Enter a valid specialization.",
  },

  experience: {
    required: true,
    min: 1,
    max: 30,
    pattern:
      /^(fresher|0|[1-9]\d*)(\+)?(\.\d{1,2})?\s*([A-Za-z\s/+-]*)$/i,
    message:
      "Enter Fresher, 5, 5+ Years, 2 years or custom experience text.",
  },

  phone: {
    required: true,
    pattern: /^[6-9]\d{9}$/,
    message:
      "Enter a valid 10-digit Indian mobile number.",
  },

  email: {
    required: true,
    pattern:
      /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
    message: "Enter a valid email address.",
  },
};

/* =========================================================
   NORMALIZE DOCTOR
========================================================= */

const normalize = (d = {}) => ({
  ...d,

  doctorId:
    d.doctorId ??
    d.id ??
    null,

  doctorName:
    d.doctorName ?? "",

  qualification:
    d.qualification ?? "",

  specialization:
    d.specialization ?? "",

  experience:
    d.experience ?? "",

  phone:
    d.phone ?? "",

  email:
    d.email ?? "",

  image:
    d.image ?? "",

  status:
    d.status === false || String(d.status).toLowerCase() === "inactive" || String(d.status).toLowerCase() === "false"
      ? "Inactive"
      : "Active",
});

/* =========================================================
   NORMALIZE RESPONSE
========================================================= */

const normalizeResponse = (res) => {
  const data = Array.isArray(res)
    ? res
    : Array.isArray(res?.data)
    ? res.data
    : Array.isArray(res?.content)
    ? res.content
    : res?.data
    ? [res.data]
    : res && typeof res === "object"
    ? [res]
    : [];

  return data.map(normalize);
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
    value.startsWith("data:") ||
    value.startsWith("blob:")
  ) {
    return value;
  }

  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  if (value.startsWith("/")) {
    return `http://${window.location.hostname}:8080${value}`;
  }

  return `http://${window.location.hostname}:8080/${value}`;
};

/* =========================================================
   EXPERIENCE
========================================================= */

const isFresherExperience = (experience) => {
  return (
    String(experience ?? "")
      .trim()
      .toLowerCase() === "fresher"
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function Admin_doctors() {

  /* =======================================================
     THEME
  ======================================================= */

  const [darkMode, setDarkMode] = useState(() =>
    document.documentElement.classList.contains(
      "wellborn-admin-dark"
    )
  );

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

  const [doctors, setDoctors] = useState([]);

  const [form, setForm] = useState({
    ...EMPTY,
  });

  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [message, setMessage] = useState(null);

  // Image Cropper Modal State
  const [cropperOpen, setCropperOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState("");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const fileInputRef = useRef(null);
  const previewCanvasRef = useRef(null);

  /* =======================================================
     STABLE AUTO-DISMISS MESSAGE TOAST
  ======================================================= */

  const showMessage = (title, text) => {
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
    }, 3200); // Stable for 3.2 seconds
    return () => clearTimeout(timer);
  }, [message]);

  /* =======================================================
     LOAD
  ======================================================= */

  const loadDoctors = async () => {
    try {
      setLoading(true);

      const res = await getData(
        API.DOCTOR_GET_ALL
      );

      setDoctors(
        normalizeResponse(res)
      );
    } catch (err) {
      console.error(
        "Doctor load error:",
        err
      );

      setDoctors([]);

      showMessage(
        "Load Failed",
        err?.message ||
          "Unable to load doctors."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  /* =======================================================
     VALIDATION
  ======================================================= */

  const validateField = (
    name,
    value
  ) => {
    const val =
      String(value ?? "").trim();

    const rule =
      VALIDATION_RULES[name];

    if (!rule) return "";

    const labels = {
      doctorName: "Doctor name",
      qualification: "Qualification",
      specialization: "Specialization",
      experience: "Experience",
      phone: "Phone number",
      email: "Email",
    };

    if (
      rule.required &&
      !val
    ) {
      return `${
        labels[name] ||
        "This field"
      } is required.`;
    }

    if (
      rule.min &&
      val.length < rule.min
    ) {
      return `Minimum ${rule.min} characters required.`;
    }

    if (
      rule.max &&
      val.length > rule.max
    ) {
      return `Maximum ${rule.max} characters allowed.`;
    }

    if (
      name === "experience" &&
      val
    ) {
      if (
        val.toLowerCase() ===
        "fresher"
      ) {
        return "";
      }

      if (
        rule.pattern &&
        !rule.pattern.test(val)
      ) {
        return rule.message;
      }

      const numberMatch =
        val.match(
          /^\s*(\d+(?:\.\d+)?)/
        );

      if (numberMatch) {
        const number =
          parseFloat(
            numberMatch[1]
          );

        if (
          !Number.isNaN(number) &&
          (number < 0 ||
            number > 60)
        ) {
          return "Experience must be between 0 and 60 years.";
        }
      }

      return "";
    }

    if (
      rule.pattern &&
      !rule.pattern.test(val)
    ) {
      return rule.message;
    }

    return "";
  };

  const validateForm = () => {
    const newErrors = {};

    Object.keys(
      VALIDATION_RULES
    ).forEach((field) => {
      const error =
        validateField(
          field,
          form[field]
        );

      if (error) {
        newErrors[field] =
          error;
      }
    });

    if (
      form.image &&
      form.image instanceof File
    ) {
      if (
        !form.image.type.startsWith(
          "image/"
        )
      ) {
        newErrors.image =
          "Please select a valid image.";
      }

      if (
        form.image.size >
        5 * 1024 * 1024
      ) {
        newErrors.image =
          "Image size must be less than 5 MB.";
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
     FIELD CHANGE
  ======================================================= */

  const handleFieldChange = (
    name,
    value
  ) => {
    let newValue = value;

    if (name === "phone") {
      newValue = value
        .replace(/\D/g, "")
        .slice(0, 10);
    }

    if (name === "experience") {
      newValue = value.slice(0, 30);
    }

    if (name === "doctorName") {
      newValue = value.slice(0, 60);
    }

    if (name === "qualification") {
      newValue = value.slice(0, 100);
    }

    if (name === "specialization") {
      newValue = value.slice(0, 100);
    }

    if (name === "email") {
      newValue = value.slice(0, 150);
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
     FRESHER
  ======================================================= */

  const setFresher = () => {
    handleFieldChange(
      "experience",
      "Fresher"
    );

    setErrors((prev) => ({
      ...prev,
      experience: "",
    }));
  };

  /* =======================================================
     IMAGE CHANGE & CROPPER TRIGGER
  ======================================================= */

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        image: "Only JPG, JPEG, PNG or WEBP images are allowed.",
      }));
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        image: "Image size must be less than 5 MB.",
      }));
      e.target.value = "";
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

    e.target.value = "";
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
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
      canvas.height = 700;

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
        const croppedFile = new File([blob], "doctor-cropped.jpg", {
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
        showMessage("Photo Adjusted", "Doctor photo successfully centered and adjusted.");
      }, "image/jpeg", 0.9);
    };
  };

  /* =======================================================
     REMOVE IMAGE
  ======================================================= */

  const removeSelectedImage = () => {
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

    setForm((prev) => {
      if (
        editId &&
        prev.image instanceof File
      ) {
        return {
          ...prev,
          image:
            prev.originalImage ||
            "",
          imagePreview:
            prev.originalImage
              ? getImageUrl(
                  prev.originalImage
                )
              : "",
        };
      }

      return {
        ...prev,
        image: null,
        imagePreview: "",
      };
    });

    setErrors((prev) => ({
      ...prev,
      image: "",
    }));
  };

  /* =======================================================
     ADD
  ======================================================= */

  const openAdd = () => {
    setEditId(null);

    setForm({
      ...EMPTY,
    });

    setErrors({});

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setOpen(true);
  };

  /* =======================================================
     EDIT
  ======================================================= */

  const openEdit = (doctor) => {
    const d =
      normalize(doctor);

    if (d.doctorId == null) {
      showMessage(
        "Unable to Edit",
        "Doctor ID is missing."
      );

      return;
    }

    setEditId(
      d.doctorId
    );

    setForm({
      doctorName:
        d.doctorName,

      qualification:
        d.qualification,

      specialization:
        d.specialization,

      experience:
        d.experience,

      phone:
        d.phone,

      email:
        d.email,

      status:
        d.status,

      image:
        d.image || "",

      originalImage:
        d.image || "",

      imagePreview:
        d.image
          ? getImageUrl(
              d.image
            )
          : "",
    });

    setErrors({});

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setOpen(true);
  };

  /* =======================================================
     CLOSE
  ======================================================= */

  const closeModal = () => {
    if (saving) return;

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
      fileInputRef.current.value = "";
    }
  };

  /* =======================================================
     FORM DATA
  ======================================================= */

  const buildFormData = () => {
    const formData =
      new FormData();

    formData.append(
      "doctorName",
      form.doctorName.trim()
    );

    formData.append(
      "qualification",
      form.qualification.trim()
    );

    formData.append(
      "specialization",
      form.specialization.trim()
    );

    formData.append(
      "experience",
      form.experience.trim()
    );

    formData.append(
      "phone",
      form.phone.trim()
    );

    formData.append(
      "email",
      form.email
        .trim()
        .toLowerCase()
    );

    const isStatusActive = form.status === "Active" || form.status === true;
    formData.append("status", isStatusActive ? "true" : "false");

    if (
      form.image &&
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

    if (!validateForm()) {
      showMessage(
        "Validation Failed",
        "Please correct the highlighted fields."
      );

      return;
    }

    setConfirm({
      type: "save",

      title: editId
        ? "Update Doctor?"
        : "Add Doctor?",

      text: editId
        ? "Do you want to update this doctor's information?"
        : "Do you want to add this doctor?",
    });
  };

  /* =======================================================
     SAVE
  ======================================================= */

  const saveDoctor = async () => {
    const currentId = editId;

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
          `${API.DOCTOR_UPDATE}/${currentId}`,
          formData
        );
      } else {
        await postFormData(
          API.DOCTOR_ADD,
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

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await loadDoctors();

      showMessage(
        currentId != null
          ? "Doctor Updated"
          : "Doctor Added",

        currentId != null
          ? "Doctor information updated successfully."
          : "Doctor added successfully."
      );
    } catch (err) {
      console.error(
        "Save doctor error:",
        err
      );

      showMessage(
        "Save Failed",
        err?.message ||
          "Unable to save doctor."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const remove = (id) => {
    if (id == null) {
      showMessage(
        "Delete Failed",
        "Doctor ID is missing."
      );

      return;
    }

    setConfirm({
      type: "delete",
      id,
      title: "Delete Doctor?",
      text:
        "This action cannot be undone.",
    });
  };

  const deleteDoctor = async () => {
    const id =
      confirm?.id;

    if (id == null) return;

    try {
      setConfirm(null);
      setDeleting(id);

      await deleteData(
        `${API.DOCTOR_DELETE}/${id}`
      );

      setDoctors((prev) =>
        prev.filter(
          (d) =>
            d.doctorId !== id
        )
      );

      showMessage(
        "Doctor Deleted",
        "Doctor deleted successfully."
      );
    } catch (err) {
      console.error(
        "Delete error:",
        err
      );

      showMessage(
        "Delete Failed",
        err?.message ||
          "Unable to delete doctor."
      );
    } finally {
      setDeleting(null);
    }
  };

  /* =======================================================
     SEARCH
  ======================================================= */

  const q =
    search
      .trim()
      .toLowerCase();

  const filtered =
    doctors.filter(
      (d) =>
        [
          d.doctorName,
          d.qualification,
          d.specialization,
          d.experience,
          d.phone,
          d.email,
          d.status,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q)
    );

  /* =======================================================
     STYLES
  ======================================================= */

  const card =
    darkMode
      ? "border-slate-800 bg-slate-900 shadow-xl"
      : "border-slate-200 bg-white shadow-md";

  const input =
    darkMode
      ? "border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
      : "border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400";

  /* =======================================================
     RETURN
  ======================================================= */

  return (
    <div
      className={`
        min-h-screen
        w-full
        overflow-x-hidden
        ${
          darkMode
            ? "bg-[#05070d] text-slate-100"
            : "bg-[#f5f7fb] text-slate-900"
        }
      `}
    >

      <main
        className="
          relative
          z-10
          mx-auto
          w-full
          max-w-[1450px]
          min-w-0
          px-2.5
          pb-5
          pt-4
          min-[380px]:px-3
          sm:px-5
          sm:pt-5
          lg:px-7
          lg:pt-6
        "
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <section
          className={`
            mb-4
            rounded-2xl
            border
            p-3.5
            sm:p-4
            ${card}
          `}
        >
          <div
            className="
              flex
              flex-col
              gap-3
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >

            <div
              className="
                flex
                min-w-0
                items-center
                gap-3
              "
            >
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-cyan-500/10
                  text-cyan-500
                "
              >
                <Stethoscope size={21} />
              </div>

              <div className="min-w-0">

                <p className="
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-emerald-500
                ">
                  Admin Control
                </p>

                <h1 className="
                  text-xl
                  font-black
                  sm:text-2xl
                ">
                  Doctors
                </h1>

                <p className="
                  text-[11px]
                  text-slate-500
                  sm:text-xs
                ">
                  Manage doctors and professional information
                </p>

              </div>
            </div>

            <div
              className="
                flex
                w-full
                flex-col
                gap-2
                sm:flex-row
                lg:w-auto
              "
            >

              <div
                className="
                  relative
                  flex-1
                  sm:w-[240px]
                "
              >
                <Search
                  size={15}
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search doctors..."
                  className={`
                    h-10
                    w-full
                    rounded-xl
                    border
                    pl-9
                    pr-3
                    text-xs
                    outline-none
                    focus:border-cyan-500
                    ${input}
                  `}
                />
              </div>

              <button
                type="button"
                onClick={openAdd}
                className="
                  flex
                  h-10
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-cyan-600
                  px-4
                  text-xs
                  font-black
                  text-white
                  transition
                  hover:bg-cyan-500
                  active:scale-95
                "
              >
                <Plus size={16} />
                Add Doctor
              </button>

            </div>
          </div>
        </section>

        {/* =================================================
            OVERVIEW
        ================================================= */}

        <div
          className="
            mb-3
            flex
            items-center
            justify-between
            gap-2
          "
        >

          <div className="flex items-center gap-2">
            <Activity
              size={16}
              className="text-cyan-500"
            />

            <h2 className="
              text-sm
              font-black
              sm:text-base
            ">
              Doctor Overview
            </h2>
          </div>

          <div
            className={`
              rounded-lg
              border
              px-2.5
              py-1
              text-[10px]
              font-bold
              ${
                darkMode
                  ? "border-slate-800 bg-slate-900 text-slate-300"
                  : "border-slate-200 bg-white text-slate-600"
              }
            `}
          >
            {filtered.length} Doctor
            {filtered.length !== 1
              ? "s"
              : ""}
          </div>

        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        {loading ? (
          <LoadingCards
            darkMode={darkMode}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            darkMode={darkMode}
          />
        ) : (
          <div
            className="
              grid
              grid-cols-1
              gap-3.5
              sm:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-4
            "
          >
            {filtered.map(
              (doctor) => (
                <DoctorCard
                  key={
                    doctor.doctorId
                  }
                  doctor={doctor}
                  darkMode={
                    darkMode
                  }
                  onEdit={
                    openEdit
                  }
                  onDelete={
                    remove
                  }
                  deleting={
                    deleting
                  }
                />
              )
            )}
          </div>
        )}

      </main>

      {/* =================================================
          ADD / EDIT MODAL
      ================================================= */}

      {open && (
        <Modal
          title={
            editId
              ? "Edit Doctor"
              : "Add Doctor"
          }
          close={closeModal}
          darkMode={darkMode}
        >
          <form
            onSubmit={submit}
            noValidate
            className="space-y-3"
          >

            <FormInput
              name="doctorName"
              label="Doctor Name"
              value={
                form.doctorName
              }
              error={
                errors.doctorName
              }
              darkMode={
                darkMode
              }
              inputClass={
                input
              }
              onChange={
                handleFieldChange
              }
              validateField={
                validateField
              }
              setErrors={
                setErrors
              }
              required
              placeholder="Enter Doctor Name"
              maxLength={60}
            />

            <FormInput
              name="qualification"
              label="Qualification"
              value={
                form.qualification
              }
              error={
                errors.qualification
              }
              darkMode={
                darkMode
              }
              inputClass={
                input
              }
              onChange={
                handleFieldChange
              }
              validateField={
                validateField
              }
              setErrors={
                setErrors
              }
              required
              placeholder="Example: BPT, MPT"
              maxLength={100}
            />

            <FormInput
              name="specialization"
              label="Specialization"
              value={
                form.specialization
              }
              error={
                errors.specialization
              }
              darkMode={
                darkMode
              }
              inputClass={
                input
              }
              onChange={
                handleFieldChange
              }
              validateField={
                validateField
              }
              setErrors={
                setErrors
              }
              required
              placeholder="Example: Orthopaedic Physiotherapy"
              maxLength={100}
            />

            <ExperienceInput
              value={
                form.experience
              }
              error={
                errors.experience
              }
              darkMode={
                darkMode
              }
              inputClass={
                input
              }
              onChange={
                handleFieldChange
              }
              setFresher={
                setFresher
              }
              validateField={
                validateField
              }
              setErrors={
                setErrors
              }
            />

            <FormInput
              name="phone"
              label="Phone"
              value={
                form.phone
              }
              error={
                errors.phone
              }
              darkMode={
                darkMode
              }
              inputClass={
                input
              }
              onChange={
                handleFieldChange
              }
              validateField={
                validateField
              }
              setErrors={
                setErrors
              }
              required
              placeholder="Example: 9876543210"
              maxLength={10}
            />

            <FormInput
              name="email"
              label="Email"
              value={
                form.email
              }
              error={
                errors.email
              }
              darkMode={
                darkMode
              }
              inputClass={
                input
              }
              onChange={
                handleFieldChange
              }
              validateField={
                validateField
              }
              setErrors={
                setErrors
              }
              required
              placeholder="Example: doctor@gmail.com"
              type="email"
              maxLength={150}
            />

            {/* DOCTOR IMAGE UPLOAD */}
            <DoctorImageUpload
              form={form}
              errors={errors}
              darkMode={darkMode}
              editId={editId}
              fileInputRef={
                fileInputRef
              }
              openFilePicker={
                openFilePicker
              }
              handleImageChange={
                handleImageChange
              }
              removeSelectedImage={
                removeSelectedImage
              }
            />

            {/* STATUS SELECTOR */}
            <div>
              <label
                className={`
                  mb-1.5
                  block
                  text-xs
                  font-bold
                  ${
                    darkMode
                      ? "text-slate-300"
                      : "text-slate-600"
                  }
                `}
              >
                Status
                <span className="ml-1 text-rose-500">*</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleFieldChange("status", "Active")}
                  className={`
                    h-10
                    rounded-xl
                    text-xs
                    font-black
                    transition
                    ${
                      form.status === "Active"
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                        : darkMode
                        ? "bg-slate-800 text-slate-400 hover:bg-slate-700"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }
                  `}
                >
                  Active
                </button>

                <button
                  type="button"
                  onClick={() => handleFieldChange("status", "Inactive")}
                  className={`
                    h-10
                    rounded-xl
                    text-xs
                    font-black
                    transition
                    ${
                      form.status === "Inactive"
                        ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                        : darkMode
                        ? "bg-slate-800 text-slate-400 hover:bg-slate-700"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }
                  `}
                >
                  Inactive
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="
                mt-3
                flex
                h-10
                w-full
                items-center
                justify-center
                rounded-xl
                bg-cyan-600
                text-xs
                font-black
                text-white
                transition
                hover:bg-cyan-500
                active:scale-[.98]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {saving
                ? editId
                  ? "Updating..."
                  : "Uploading..."
                : editId
                ? "Update Doctor"
                : "Save Doctor"}
            </button>

          </form>
        </Modal>
      )}

      {/* =================================================
          IMAGE CROPPER / ADJUSTER MODAL
      ================================================= */}

      {cropperOpen && (
        <div className="fixed inset-0 z-[10010] flex items-center justify-center bg-black/80 p-3 backdrop-blur-md">
          <div className={`w-full max-w-md rounded-3xl border p-4 shadow-2xl ${darkMode ? "border-slate-700 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-900"}`}>
            
            <div className="flex items-center justify-between pb-3">
              <div>
                <h3 className="text-sm font-black">Adjust Photo Position</h3>
                <p className="text-[10px] text-slate-400">Drag to center face & use slider to zoom</p>
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
              className="relative mx-auto h-64 w-full overflow-hidden rounded-2xl border border-cyan-500/40 bg-slate-950 cursor-grab active:cursor-grabbing touch-none"
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
              <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-cyan-400/60 rounded-xl m-4 flex items-center justify-center">
                <div className="bg-black/40 px-2 py-1 rounded text-[9px] text-cyan-300 font-bold backdrop-blur-sm">
                  Keep face inside box
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

      {/* =================================================
          CONFIRM
      ================================================= */}

      {confirm && (
        <ConfirmPopup
          data={confirm}
          darkMode={darkMode}
          cancel={() =>
            setConfirm(null)
          }
          confirm={
            confirm.type ===
            "delete"
              ? deleteDoctor
              : saveDoctor
          }
        />
      )}

      {/* =================================================
          TOP-CENTER SLIDE-IN (FROM RIGHT TO LEFT) GLASS TOAST
      ================================================= */}

      <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[25000] w-[calc(100%-24px)] max-w-[420px] transition-all duration-500 transform pointer-events-none ${
        message ? "translate-y-0 opacity-100 scale-100 animate-slideInRight" : "-translate-y-12 opacity-0 pointer-events-none scale-95"
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

    </div>
  );
}

/* =========================================================
   EXPERIENCE INPUT
========================================================= */

function ExperienceInput({
  value,
  error,
  darkMode,
  inputClass,
  onChange,
  setFresher,
  validateField,
  setErrors,
}) {

  const isFresher =
    String(value || "")
      .trim()
      .toLowerCase() ===
    "fresher";

  const handleBlur = () => {
    const validationError =
      validateField(
        "experience",
        value
      );

    setErrors((prev) => ({
      ...prev,
      experience:
        validationError,
    }));
  };

  return (
    <div>

      <div className="
        mb-1.5
        flex
        items-center
        justify-between
        gap-2
      ">

        <label
          className={`
            text-xs
            font-bold
            ${
              darkMode
                ? "text-slate-300"
                : "text-slate-600"
            }
          `}
        >
          Experience
          <span className="ml-1 text-rose-500">
            *
          </span>
        </label>

        <button
          type="button"
          onClick={setFresher}
          className={`
            rounded-lg
            px-2.5
            py-1
            text-[9px]
            font-black
            transition
            active:scale-95
            ${
              isFresher
                ? "bg-emerald-500 text-white"
                : darkMode
                ? "bg-slate-800 text-emerald-400"
                : "bg-emerald-50 text-emerald-600"
            }
          `}
        >
          {isFresher
            ? "✓ Fresher"
            : "Set Fresher"}
        </button>

      </div>

      <input
        name="experience"
        type="text"
        value={value}
        onChange={(e) =>
          onChange(
            "experience",
            e.target.value
          )
        }
        onBlur={handleBlur}
        placeholder="Example: 5+ Years or Fresher"
        maxLength={30}
        autoComplete="off"
        className={`
          h-10
          w-full
          rounded-xl
          border
          px-3
          text-xs
          outline-none
          transition
          focus:ring-2
          ${
            error
              ? "border-rose-500 bg-rose-50/50 text-rose-900 focus:ring-rose-500/10"
              : `focus:border-cyan-500 focus:ring-cyan-500/10 ${inputClass}`
          }
        `}
      />

      {!error && (
        <p className="
          mt-1
          text-[9px]
          text-slate-400
        ">
          Example: 5, 5+ Years, 2.5 Years or Fresher
        </p>
      )}

      {error && (
        <p className="
          mt-1.5
          flex
          items-center
          gap-1
          text-[10px]
          font-semibold
          text-rose-500
        ">
          <AlertTriangle size={11} />
          {error}
        </p>
      )}

    </div>
  );
}

/* =========================================================
   IMAGE UPLOAD
========================================================= */

function DoctorImageUpload({
  form,
  errors,
  darkMode,
  editId,
  fileInputRef,
  openFilePicker,
  handleImageChange,
  removeSelectedImage,
}) {

  const isNewFile =
    form.image instanceof File;

  const hasPreview =
    Boolean(
      form.imagePreview
    );

  return (
    <div>

      <div className="
        mb-1.5
        flex
        items-center
        justify-between
        gap-2
      ">

        <label
          className={`
            text-xs
            font-bold
            ${
              darkMode
                ? "text-slate-300"
                : "text-slate-600"
            }
          `}
        >
          Doctor Image

          <span className="
            ml-1
            text-[9px]
            font-medium
            text-slate-400
          ">
            Optional
          </span>
        </label>

        {isNewFile && (
          <span className="
            rounded-full
            bg-emerald-500/10
            px-2
            py-1
            text-[8px]
            font-black
            text-emerald-500
          ">
            NEW PHOTO
          </span>
        )}

      </div>

      <div
        className={`
          relative
          overflow-hidden
          rounded-2xl
          border
          ${
            errors.image
              ? "border-rose-500"
              : darkMode
              ? "border-slate-700 bg-slate-800"
              : "border-slate-200 bg-slate-50"
          }
        `}
      >

        {hasPreview ? (
          <div>

            <div className="relative">

              <img
                key={
                  form.imagePreview
                }
                src={
                  form.imagePreview
                }
                alt="Doctor preview"
                className="
                  h-48
                  w-full
                  object-cover
                  object-top
                  sm:h-52
                "
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

              <div className="
                absolute
                left-2.5
                top-2.5
                flex
                items-center
                gap-1.5
                rounded-full
                bg-black/60
                px-2
                py-1
                text-[9px]
                font-bold
                text-white
                backdrop-blur-md
              ">
                <FileImage size={11} />

                {isNewFile
                  ? "New Photo"
                  : "Current Photo"}
              </div>

            </div>

            <div
              className={`
                p-2.5
                ${
                  darkMode
                    ? "bg-slate-900"
                    : "bg-white"
                }
              `}
            >

              <div className="
                flex
                items-center
                gap-2
              ">

                <div className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-cyan-500/10
                  text-cyan-500
                ">
                  <FileImage size={15} />
                </div>

                <div className="
                  min-w-0
                  flex-1
                ">
                  <p
                    className={`
                      truncate
                      text-[10px]
                      font-black
                      ${
                        darkMode
                          ? "text-white"
                          : "text-slate-800"
                      }
                    `}
                  >
                    {isNewFile
                      ? form.image.name
                      : "Current doctor image"}
                  </p>

                  <p className="
                    mt-0.5
                    text-[9px]
                    text-slate-400
                  ">
                    {isNewFile
                      ? `${(
                          form.image.size /
                          1024 /
                          1024
                        ).toFixed(2)} MB`
                      : "Existing uploaded image"}
                  </p>
                </div>

              </div>

              <div className="
                mt-2
                grid
                grid-cols-2
                gap-2
              ">

                <button
                  type="button"
                  onClick={
                    openFilePicker
                  }
                  className="
                    flex
                    h-9
                    items-center
                    justify-center
                    gap-1.5
                    rounded-xl
                    bg-cyan-600
                    text-[10px]
                    font-black
                    text-white
                    transition
                    hover:bg-cyan-500
                  "
                >
                  {editId ? (
                    <Pencil size={12} />
                  ) : (
                    <Upload size={12} />
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
                  className={`
                    flex
                    h-9
                    items-center
                    justify-center
                    gap-1.5
                    rounded-xl
                    text-[10px]
                    font-black
                    ${
                      darkMode
                        ? "bg-slate-800 text-slate-300"
                        : "bg-slate-100 text-slate-600"
                    }
                  `}
                >
                  <X size={12} />

                  {isNewFile
                    ? "Cancel Photo"
                    : "Remove"}
                </button>

              </div>

            </div>

          </div>
        ) : (

          <button
            type="button"
            onClick={
              openFilePicker
            }
            className="
              flex
              w-full
              flex-col
              items-center
              justify-center
              px-5
              py-7
              text-center
            "
          >

            <div className="
              mb-2.5
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              bg-cyan-50
              text-cyan-600
            ">
              <Upload size={24} />
            </div>

            <p
              className={`
                text-xs
                font-black
                ${
                  darkMode
                    ? "text-white"
                    : "text-slate-800"
                }
              `}
            >
              Upload Doctor Photo
            </p>

            <p className="
              mt-1
              text-[10px]
              text-slate-500
            ">
              Select photo from your device
            </p>

            <div className="
              mt-3
              flex
              items-center
              gap-1.5
              rounded-xl
              bg-cyan-600
              px-4
              py-2
              text-[10px]
              font-black
              text-white
            ">
              <Upload size={12} />
              Choose File
            </div>

            <div className="
              mt-2.5
              flex
              items-center
              gap-1.5
              text-[9px]
              text-slate-400
            ">
              <Camera size={11} />
              Gallery or Camera
            </div>

          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          capture="environment"
          className="hidden"
          onChange={
            handleImageChange
          }
        />

      </div>

      <div className="
        mt-1
        flex
        items-center
        justify-between
        gap-2
      ">
        <p className="
          text-[9px]
          text-slate-400
        ">
          JPG, PNG, WEBP • Max 5 MB
        </p>

        {isNewFile && (
          <p className="
            shrink-0
            text-[9px]
            font-bold
            text-emerald-500
          ">
            Ready
          </p>
        )}
      </div>

      {errors.image && (
        <p className="
          mt-1.5
          flex
          items-center
          gap-1
          text-[10px]
          font-semibold
          text-rose-500
        ">
          <AlertTriangle size={11} />
          {errors.image}
        </p>
      )}

    </div>
  );
}

/* =========================================================
   FORM INPUT
========================================================= */

function FormInput({
  name,
  label,
  value,
  error,
  darkMode,
  inputClass,
  onChange,
  validateField,
  setErrors,
  required,
  placeholder,
  type = "text",
  maxLength,
}) {

  const handleBlur = () => {
    const validationError =
      validateField(
        name,
        value
      );

    setErrors((prev) => ({
      ...prev,
      [name]:
        validationError,
    }));
  };

  return (
    <div>

      <label
        className={`
          mb-1.5
          block
          text-xs
          font-bold
          ${
            darkMode
              ? "text-slate-300"
              : "text-slate-600"
          }
        `}
      >
        {label}

        {required && (
          <span className="ml-1 text-rose-500">
            *
          </span>
        )}
      </label>

      <input
        name={name}
        type={type}
        value={value}
        maxLength={maxLength}
        onChange={(e) =>
          onChange(
            name,
            e.target.value
          )
        }
        onBlur={
          handleBlur
        }
        placeholder={placeholder}
        autoComplete="off"
        className={`
          h-10
          w-full
          rounded-xl
          border
          px-3
          text-xs
          outline-none
          transition
          focus:ring-2
          ${
            error
              ? "border-rose-500 bg-rose-50/50 text-rose-900 focus:ring-rose-500/10"
              : `focus:border-cyan-500 focus:ring-cyan-500/10 ${inputClass}`
          }
        `}
      />

      {error && (
        <p className="
          mt-1.5
          flex
          items-center
          gap-1
          text-[10px]
          font-semibold
          text-rose-500
        ">
          <AlertTriangle size={11} />
          {error}
        </p>
      )}

    </div>
  );
}

/* =========================================================
   DOCTOR CARD
   MICRO COMPACT
========================================================= */

function DoctorCard({
  doctor: d,
  darkMode,
  onEdit,
  onDelete,
  deleting,
}) {

  const isActive =
    d.status === undefined ||
    d.status === null ||
    String(d.status)
      .toLowerCase() ===
      "active" ||
    d.status === true;

  const fresher =
    isFresherExperience(
      d.experience
    );

  return (
    <article
      className={`
        overflow-hidden
        rounded-[22px]
        border
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:shadow-lg
        ${
          darkMode
            ? "border-slate-800 bg-slate-900/95"
            : "border-slate-200/90 bg-white"
        }
      `}
    >

      <div className="p-3">

        {/* STATUS */}

        <div className="
          mb-2.5
          flex
          items-center
          justify-between
          gap-2
        ">

          <span
            className={`
              inline-flex
              items-center
              gap-1.5
              rounded-full
              px-2
              py-1
              text-[9px]
              font-black
              ${
                isActive
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-rose-500/10 text-rose-500"
              }
            `}
          >
            <span
              className={`
                h-1.5
                w-1.5
                rounded-full
                ${
                  isActive
                    ? "bg-emerald-500"
                    : "bg-rose-500"
                }
              `}
            />

            {isActive
              ? "Active"
              : "Inactive"}
          </span>

          {!fresher && (
            <span className="
              inline-flex
              max-w-[55%]
              items-center
              gap-1
              truncate
              rounded-full
              bg-cyan-500/10
              px-2
              py-1
              text-[9px]
              font-extrabold
              text-cyan-600
              dark:text-cyan-400
            ">
              <Award
                size={10}
                className="shrink-0"
              />

              <span className="truncate">
                {d.experience}
              </span>
            </span>
          )}

        </div>

        {/* IMAGE */}

        <div className="
          relative
          overflow-hidden
          rounded-[18px]
          border
          border-slate-200/70
          bg-slate-100
          shadow-inner
          dark:border-slate-800
          dark:bg-slate-800/50
        ">

          <img
            key={`${d.doctorId}-${d.image || "default"}`}
            src={getImageUrl(
              d.image
            )}
            alt={
              d.doctorName ||
              "Doctor"
            }
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
            className="
              h-40
              w-full
              object-cover
              object-top
              sm:h-44
            "
          />

        </div>

        {/* DETAILS */}

        <div
          className={`
            mt-2.5
            rounded-[17px]
            border
            p-3
            ${
              darkMode
                ? "border-slate-800 bg-slate-950/80"
                : "border-slate-200/60 bg-slate-50/90"
            }
          `}
        >

          {/* NAME */}

          <div className="
            flex
            min-w-0
            items-center
            gap-2
          ">

            <div
              className={`
                flex
                h-6
                w-6
                shrink-0
                items-center
                justify-center
                rounded-lg
                ${
                  darkMode
                    ? "bg-cyan-500/10 text-cyan-400"
                    : "bg-cyan-50 text-cyan-600"
                }
              `}
            >
              <Stethoscope size={12} />
            </div>

            <p
              className={`
                min-w-0
                flex-1
                truncate
                text-xs
                font-black
                ${
                  darkMode
                    ? "text-white"
                    : "text-slate-900"
                }
              `}
            >
              {d.doctorName ||
                "Unknown Doctor"}
            </p>

          </div>

          {/* QUALIFICATION */}

          <div className="
            mt-1.5
            flex
            min-w-0
            items-center
            gap-2
          ">

            <div
              className={`
                flex
                h-5
                w-5
                shrink-0
                items-center
                justify-center
                rounded-md
                ${
                  darkMode
                    ? "bg-violet-500/10 text-violet-400"
                    : "bg-violet-50 text-violet-600"
                }
              `}
            >
              <FileImage size={10} />
            </div>

            <p
              className={`
                min-w-0
                flex-1
                truncate
                text-[10px]
                font-bold
                ${
                  darkMode
                    ? "text-slate-300"
                    : "text-slate-700"
                }
              `}
            >
              {d.qualification ||
                "Qualification"}
            </p>

          </div>

          {/* SPECIALIZATION */}

          <div className="
            mt-1
            flex
            min-w-0
            items-center
            gap-2
          ">

            <div
              className={`
                flex
                h-5
                w-5
                shrink-0
                items-center
                justify-center
                rounded-md
                ${
                  darkMode
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-emerald-50 text-emerald-600"
                }
              `}
            >
              <Activity size={10} />
            </div>

            <p
              className={`
                min-w-0
                flex-1
                truncate
                text-[10px]
                font-semibold
                ${
                  darkMode
                    ? "text-slate-300"
                    : "text-slate-600"
                }
              `}
            >
              {d.specialization ||
                "Specialization"}
            </p>

          </div>

          {/* CONTACT */}

          <div
            className={`
              mt-2.5
              border-t
              pt-2
              ${
                darkMode
                  ? "border-slate-800"
                  : "border-slate-200/60"
              }
            `}
          >

            <div className="
              flex
              min-w-0
              items-center
              gap-2
            ">
              <Phone
                size={10}
                className="
                  shrink-0
                  text-cyan-500
                "
              />

              <span
                className={`
                  min-w-0
                  flex-1
                  truncate
                  text-[9px]
                  font-medium
                  ${
                    darkMode
                      ? "text-slate-400"
                      : "text-slate-600"
                  }
                `}
              >
                {d.phone ||
                  "Not available"}
              </span>
            </div>

            <div className="
              mt-1
              flex
              min-w-0
              items-center
              gap-2
            ">
              <Mail
                size={10}
                className="
                  shrink-0
                  text-cyan-500
                "
              />

              <span
                className={`
                  min-w-0
                  flex-1
                  truncate
                  text-[9px]
                  font-medium
                  ${
                    darkMode
                      ? "text-slate-400"
                      : "text-slate-600"
                  }
                `}
              >
                {d.email ||
                  "Not available"}
              </span>
            </div>

          </div>

        </div>

        {/* ACTIONS */}

        <div className="
          mt-2.5
          flex
          gap-2
        ">

          <button
            type="button"
            onClick={() =>
              onEdit(d)
            }
            className={`
              flex
              h-9
              flex-1
              items-center
              justify-center
              gap-1.5
              rounded-xl
              text-[10px]
              font-black
              transition
              active:scale-95
              ${
                darkMode
                  ? "bg-slate-800 text-white hover:bg-slate-700"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }
            `}
          >
            <Pencil size={12} />
            Edit
          </button>

          <button
            type="button"
            onClick={() =>
              onDelete(
                d.doctorId
              )
            }
            disabled={
              deleting ===
              d.doctorId
            }
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-rose-200
              bg-rose-50
              text-rose-600
              transition
              active:scale-95
              disabled:opacity-50
              dark:border-rose-900/40
              dark:bg-rose-950/40
              dark:text-rose-400
            "
          >
            {deleting ===
            d.doctorId ? (
              <span className="
                h-3
                w-3
                animate-spin
                rounded-full
                border-2
                border-current
                border-t-transparent
              " />
            ) : (
              <Trash2 size={12} />
            )}
          </button>

        </div>

      </div>

    </article>
  );
}

/* =========================================================
   MODAL
========================================================= */

function Modal({
  title,
  close,
  children,
  darkMode,
}) {

  useEffect(() => {
    const oldOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        oldOverflow;
    };
  }, []);

  return (
    <div
      className="
        fixed
        inset-0
        z-[9999]
        flex
        items-center
        justify-center
        bg-black/60
        p-3
        backdrop-blur-md
      "
      style={{
        paddingTop:
          "max(12px, env(safe-area-inset-top))",

        paddingBottom:
          "max(12px, env(safe-area-inset-bottom))",

        paddingLeft:
          "max(12px, env(safe-area-inset-left))",

        paddingRight:
          "max(12px, env(safe-area-inset-right))",
      }}
    >

      <div
        className={`
          flex
          max-h-[92dvh]
          w-full
          max-w-lg
          flex-col
          overflow-hidden
          rounded-[25px]
          border
          shadow-2xl
          ${
            darkMode
              ? "border-slate-700 bg-slate-900"
              : "border-slate-200 bg-white"
          }
        `}
      >

        <div className="
          flex
          justify-center
          pt-2
          sm:hidden
        ">
          <div
            className={`
              h-1
              w-10
              rounded-full
              ${
                darkMode
                  ? "bg-slate-600"
                  : "bg-slate-300"
              }
            `}
          />
        </div>

        <div className="
          flex
          items-center
          justify-between
          gap-3
          px-4
          py-3.5
          sm:px-5
        ">

          <div className="min-w-0">

            <h2
              className={`
                text-lg
                font-black
                ${
                  darkMode
                    ? "text-white"
                    : "text-slate-900"
                }
              `}
            >
              {title}
            </h2>

            <p className="
              mt-0.5
              text-[10px]
              text-slate-500
            ">
              Enter doctor information
            </p>

          </div>

          <button
            type="button"
            onClick={close}
            className={`
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-xl
              ${
                darkMode
                  ? "bg-slate-800 text-slate-300"
                  : "bg-slate-100 text-slate-600"
              }
            `}
          >
            <X size={16} />
          </button>

        </div>

        <div className="
          min-h-0
          flex-1
          overflow-y-auto
          px-4
          pb-5
          sm:px-5
        ">
          {children}
        </div>

      </div>
    </div>
  );
}

/* =========================================================
   CONFIRM POPUP
========================================================= */

function ConfirmPopup({
  data,
  darkMode,
  cancel,
  confirm,
}) {

  const isDelete =
    data.type ===
    "delete";

  return (
    <div className="
      fixed
      inset-0
      z-[10000]
      flex
      items-center
      justify-center
      bg-black/60
      p-3
      backdrop-blur-sm
    ">

      <div
        className={`
          w-full
          max-w-sm
          rounded-3xl
          border
          p-5
          text-center
          shadow-2xl
          ${
            darkMode
              ? "border-slate-700 bg-slate-900"
              : "border-slate-200 bg-white"
          }
        `}
      >

        <div
          className={`
            mx-auto
            flex
            h-13
            w-13
            items-center
            justify-center
            rounded-2xl
            ${
              isDelete
                ? "bg-rose-500/10 text-rose-500"
                : "bg-cyan-500/10 text-cyan-500"
            }
          `}
        >
          {isDelete ? (
            <AlertTriangle size={25} />
          ) : (
            <CheckCircle2 size={25} />
          )}
        </div>

        <h3 className="
          mt-3
          text-base
          font-black
        ">
          {data.title}
        </h3>

        <p className="
          mt-1.5
          text-xs
          leading-5
          text-slate-500
        ">
          {data.text}
        </p>

        <div className="
          mt-4
          flex
          gap-2
        ">

          <button
            type="button"
            onClick={cancel}
            className={`
              h-10
              flex-1
              rounded-xl
              text-xs
              font-black
              ${
                darkMode
                  ? "bg-slate-800 text-white"
                  : "bg-slate-100 text-slate-700"
              }
            `}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={confirm}
            className={`
              h-10
              flex-1
              rounded-xl
              text-xs
              font-black
              text-white
              ${
                isDelete
                  ? "bg-rose-600"
                  : "bg-cyan-600"
              }
            `}
          >
            {isDelete
              ? "Delete"
              : "Confirm"}
          </button>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyState({
  darkMode,
}) {

  return (
    <div
      className={`
        flex
        min-h-[260px]
        flex-col
        items-center
        justify-center
        rounded-2xl
        border
        border-dashed
        p-5
        text-center
        ${
          darkMode
            ? "border-slate-700 bg-slate-900"
            : "border-slate-200 bg-white"
        }
      `}
    >

      <div
        className={`
          mb-3
          flex
          h-13
          w-13
          items-center
          justify-center
          rounded-2xl
          ${
            darkMode
              ? "bg-slate-800 text-slate-400"
              : "bg-slate-100 text-slate-400"
          }
        `}
      >
        <Stethoscope size={23} />
      </div>

      <h3 className="
        text-sm
        font-black
      ">
        No doctors found
      </h3>

      <p className="
        mt-1
        text-xs
        text-slate-500
      ">
        Try another search or add a new doctor.
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
    <div
      className="
        grid
        grid-cols-1
        gap-3.5
        sm:grid-cols-2
        lg:grid-cols-3
        xl:grid-cols-4
      "
    >

      {[1, 2, 3, 4, 5, 6].map(
        (x) => (
          <div
            key={x}
            className={`
              h-[330px]
              animate-pulse
              rounded-[22px]
              border
              ${
                darkMode
                  ? "border-slate-700 bg-slate-900"
                  : "border-slate-200 bg-white"
              }
            `}
          />
        )
      )}

    </div>
  );
}