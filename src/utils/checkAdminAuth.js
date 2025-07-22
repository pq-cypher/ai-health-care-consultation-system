export async function checkAdminAuth() {
  const response = await fetch(`/api/check-admin-auth.php`, {
    credentials: 'include',
  });
  const data = await response.json();
  return data.logged_in;
}