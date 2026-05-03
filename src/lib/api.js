const defaultOptions = {
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
};

export async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers ?? {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message ?? "Request failed.");
  }

  return data;
}
