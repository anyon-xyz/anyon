// import fetch from "node-fetch";

export interface Error {
  error?: string;
}

export const mimeTypeToExtension: { [key: string]: "jpg" | "png" | "gif" } = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
};

const request = async <T extends Error>(
  endpoint: string,
  method: "POST" | "GET" = "GET",
  headers?: Record<string, string>
) => {
  const response = await fetch(endpoint, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });

  const data = (await response.json()) as T;

  if (response.ok) {
    return data;
  }
  return Promise.reject(
    new Error(
      data.error || `Error code ${response.status} - ${response.statusText}`
    )
  );
};

const requestBuffer = async (
  endpoint: string,
  method: "POST" | "GET" = "GET",
  headers?: Record<string, string>
) => {
  const response = await fetch(endpoint, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });

  const buffer = await response.arrayBuffer();
  const contentType = response.headers.get("Content-Type");

  return { buffer, contentType };
};

export { request, requestBuffer };
