export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function apiRequest(endpoint, options = {}) {
  const {
    method = 'GET',
    body,
    headers = {},
    credentials = 'include',
    timeoutMs = 12000,
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      credentials,
      headers,
      body,
      signal: controller.signal,
    });

    const rawText = await response.text();
    let data = null;

    if (rawText) {
      try {
        data = JSON.parse(rawText);
      } catch {
        data = rawText;
      }
    }

    if (!response.ok) {
      const message =
        (data && data.error) ||
        (typeof data === 'string' && data) ||
        `Request failed with status ${response.status}`;
      throw new ApiError(message, response.status, data);
    }

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }

    if (error instanceof ApiError) {
      throw error;
    }

    throw new Error('Unable to connect to the server. Please check if backend is running.');
  } finally {
    clearTimeout(timeoutId);
  }
}

export function extractErrorMessage(error, fallback = 'Something went wrong') {
  if (!error) {
    return fallback;
  }

  if (typeof error === 'string') {
    return error;
  }

  return error.message || fallback;
}
