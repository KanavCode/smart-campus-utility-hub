const DEFAULT_API_BASE_URL = 'http://localhost:5000/api';

const normalizeUrl = (value: string) => value.replace(/\/+$/, '');

const stripApiSuffix = (value: string) => value.replace(/\/api$/i, '');

export const getApiBaseUrl = () => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;
  return normalizeUrl(apiBaseUrl);
};

export const getBackendBaseUrl = () => {
  const explicitBaseUrl = import.meta.env.VITE_AUTH_BASE_URL;
  if (explicitBaseUrl) {
    return normalizeUrl(explicitBaseUrl);
  }

  const apiBaseUrl = getApiBaseUrl();
  return stripApiSuffix(apiBaseUrl);
};

export const buildBackendUrl = (path: string) => {
  const baseUrl = getBackendBaseUrl();

  if (!path) {
    return baseUrl;
  }

  if (!baseUrl) {
    return path.startsWith('/') ? path : `/${path}`;
  }

  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};
