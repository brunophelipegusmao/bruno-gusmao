"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function useEventPopup() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/site-settings`)
      .then((res) => (res.ok ? res.json() : { eventPopupEnabled: false }))
      .then((data) => setEnabled(Boolean(data.eventPopupEnabled)))
      .catch(() => setEnabled(false))
      .finally(() => setLoading(false));
  }, []);

  return { enabled, loading };
}
