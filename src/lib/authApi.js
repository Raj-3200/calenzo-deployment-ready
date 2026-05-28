export async function loginAdmin(email, password) {
  void email
  void password
  throw new Error('Use Clerk sign-in at /admin/login.')
}

export async function getAdminSession() {
  return { ok: false, user: null, expires_at: null }
}

export async function logoutAdmin() {
  if (typeof window !== 'undefined') {
    window.location.assign('/')
  }
}
