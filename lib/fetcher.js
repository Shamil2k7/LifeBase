export async function fetcher(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const err = new Error("Request failed");
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function apiRequest(url, method, body) {
  const res = await fetch(url, {
    method,
    headers: body instanceof FormData ? undefined : { "Content-Type": "application/json" },
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Request failed");
  }
  return res.json();
}
