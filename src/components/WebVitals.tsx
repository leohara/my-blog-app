"use client";

import { useEffect } from "react";

import { initWebVitals } from "@/lib/utils/web-vitals";

export function WebVitals() {
  useEffect(() => {
    initWebVitals();
  }, []);

  return null;
}