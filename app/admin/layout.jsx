export default async function AdminLayout({ children }) {
  // Allow access to /admin/login without requiring a session
  // Other admin routes will be handled by (protected) layout

  return children;
}
