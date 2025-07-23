import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAdminAuth } from '../../utils/checkAdminAuth';
import { Loader } from 'lucide-react';

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

  if (checking) return (
    <div className={`w-full h-dvh max-h-dvh flex items-center justify-center`}>
        <Loader className={`size-[150px] text-green-900 animate-spin`}/>
    </div>
  );

  return children;
}
