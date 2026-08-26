import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function UserEffects() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = pathname.includes("appointment")
      ? "Book Appointment | Wellborn Physio"
      : pathname.includes("contact")
      ? "Contact | Wellborn Physio"
      : "Wellborn Physio";
  }, [pathname]);
  return null;
}
