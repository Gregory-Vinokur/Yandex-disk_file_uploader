const env = typeof process !== 'undefined' ? process.env : import.meta.env

export const { VITE_CLIENT_ID: CLIENT_ID, VITE_REDIRECT_URI: REDIRECT_URI, VITE_BASE_PATH: BASE_PATH } = env