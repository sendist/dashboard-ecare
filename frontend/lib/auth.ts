export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
}

interface LoginPayload {
  email: string
  password: string
}

async function parseError(response: Response): Promise<string> {
  try {
    const body = await response.json()
    if (typeof body?.message === "string") {
      return body.message
    }
    if (Array.isArray(body?.message) && body.message.length > 0) {
      return body.message.join(", ")
    }
  } catch {
    // no-op, fallback below
  }
  return `Request failed (${response.status})`
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await fetch("/api/auth/me", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(await parseError(response))
  }

  return response.json()
}

export async function login(payload: LoginPayload): Promise<AuthUser> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(await parseError(response))
  }

  return response.json()
}

export async function logout(): Promise<void> {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error(await parseError(response))
  }
}