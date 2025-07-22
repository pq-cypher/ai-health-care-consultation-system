import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAdminAuth } from '../../utils/checkAdminAuth';

export default function RequireAdminAuth({ children }) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      const isLoggedIn = await checkAdminAuth();
      if (!isLoggedIn) {
        navigate('/admin-login');
      } else {
        setChecking(false);
      }
    })();
  }, []);

  if (checking) return <p>Checking admin session...</p>;

  return children;
}
