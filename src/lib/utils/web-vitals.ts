/**
 * Web Vitals tracking for performance monitoring
 */

interface Metric {
  name: string;
  value: number;
  delta: number;
  id: string;
  entries: PerformanceEntry[];
}

/**
 * Log Web Vitals metrics to console in development
 */
function logMetric(metric: Metric) {
  if (process.env.NODE_ENV === "development") {
    // Color-coded console logs for different metrics
    const colors = {
      CLS: "#FFA500", // Orange
      FCP: "#32CD32", // LimeGreen
      LCP: "#FF1493", // DeepPink
      TTFB: "#9370DB", // MediumPurple
      INP: "#FFD700", // Gold (replaced FID)
    };

    const color = colors[metric.name as keyof typeof colors] || "#808080";

    console.log(
      `%c[${metric.name}] %c${metric.value.toFixed(2)}ms %c(Δ ${metric.delta.toFixed(2)}ms)`,
      `color: ${color}; font-weight: bold;`,
      `color: ${color};`,
      "color: #666;"
    );
  }
}

/**
 * Report Web Vitals metrics
 * In production, this would send to an analytics service
 */
export function reportWebVitals(metric: Metric) {
  // Log in development
  logMetric(metric);

  // In production, send to analytics
  if (process.env.NODE_ENV === "production") {
    // Example: Send to analytics endpoint
    // fetch("/api/analytics", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     metric: metric.name,
    //     value: metric.value,
    //     delta: metric.delta,
    //     id: metric.id,
    //     timestamp: Date.now(),
    //   }),
    // });
  }
}

/**
 * Initialize Web Vitals tracking
 * This should be called once in the app
 */
export async function initWebVitals() {
  if (typeof window === "undefined") return;

  try {
    const { onCLS, onFCP, onLCP, onTTFB, onINP } = await import("web-vitals");

    // Core Web Vitals
    onCLS(reportWebVitals);
    onINP(reportWebVitals); // INP replaced FID in Web Vitals v3+
    onLCP(reportWebVitals);

    // Additional metrics
    onFCP(reportWebVitals);
    onTTFB(reportWebVitals);

    if (process.env.NODE_ENV === "development") {
      console.log("%c✅ Web Vitals tracking initialized", "color: #4CAF50; font-weight: bold;");
    }
  } catch (error) {
    console.error("Failed to initialize Web Vitals:", error);
  }
}

/**
 * Get current performance metrics
 */
export function getCurrentMetrics() {
  if (typeof window === "undefined" || !window.performance) return null;

  const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
  
  return {
    // Navigation timing
    dns: navigation.domainLookupEnd - navigation.domainLookupStart,
    tcp: navigation.connectEnd - navigation.connectStart,
    ttfb: navigation.responseStart - navigation.requestStart,
    download: navigation.responseEnd - navigation.responseStart,
    domInteractive: navigation.domInteractive - navigation.fetchStart,
    domComplete: navigation.domComplete - navigation.fetchStart,
    loadComplete: navigation.loadEventEnd - navigation.fetchStart,
    
    // Memory usage (if available)
    memory: "memory" in performance && typeof (performance as Record<string, unknown>).memory === "object" ? {
      usedJSHeapSize: Math.round(((performance as Record<string, unknown>).memory as Record<string, number>).usedJSHeapSize / 1048576),
      totalJSHeapSize: Math.round(((performance as Record<string, unknown>).memory as Record<string, number>).totalJSHeapSize / 1048576),
      limit: Math.round(((performance as Record<string, unknown>).memory as Record<string, number>).jsHeapSizeLimit / 1048576),
    } : null,
  };
}