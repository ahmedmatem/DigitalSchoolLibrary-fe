// Production uses the API on the same origin (the web server routes /api).
// For a separate API host, set its HTTPS /api URL here before building.
export const environment = {
  apiBaseUrl: '/api',
} as const;
