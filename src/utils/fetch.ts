import fetch from "node-fetch";

const request = async <T>(
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
    new Error(`Error code ${response.status} - ${response.statusText}`)
  );
};

export { request };
