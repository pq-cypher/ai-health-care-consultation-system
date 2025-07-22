import { Loader, LogOut, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import fmcLogo from "../../assets/images/fmc-logo.png";
import { Home, Search, SquarePen, PlusSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SideNavigation({ isOpen, closeSidebar }) {
  let [isLoggingOut, setIsLoggingOut] = useState(false);
  let navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const navItems = [
    { name: 'Dashboard', icon:Home, path: '/admin/dashboard' },
    { name: 'View Medical Professionals', icon:Search, path: '/admin/view-medical-professionals' },
    { name: 'Edit Medical Professional', icon:SquarePen, path: '/admin/edit-medical-professional' },
    { name: 'Add Medical Professional', icon:PlusSquare, path: '/admin/add-medical-professional' },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      const response = await fetch(
        `/api/admin-logout.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
        }
      );

      // Check if response is ok
      if (!response.ok) {
        alert("An error occurred, Try again");
        let errorMessage = `Server error: ${response.status}`;
        throw new Error(errorMessage);
      }

      // Parse response
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Failed to parse response JSON:", parseError);
        alert("An error occurred, Try again");
        throw new Error("Invalid response format from server.");
      }

      // Validate response structure
      if (typeof data !== "object" || data === null) {
        throw new Error("Invalid response format from server.");
      }

      if (data.success === true) {
        navigate("/admin-login");
      } else {
        // Handle server-side failure
        const errorMsg = data.message || "Failed to logout";
        throw new Error(errorMsg);
      }
    } catch (err) {
      setIsLoggingOut(false);
      console.error("Failed to logout:", err);
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={()=>{!isLoggingOut&&closeSidebar()}}
        ></div>
      )}

      <aside
        className={`fixed top-0 left-0 h-full bg-white z-40 w-3/4 max-w-xs transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:block lg:w-[300px] shadow-md`}
      >
        {/* Close button (mobile only) */}
        <div className="flex justify-end px-3 h-[60px] lg:w-[calc(100%+10px)] bg-white border-b border-gray-100 lg:border-none">
          <button onClick={()=>{!isLoggingOut&&closeSidebar()}} className='lg:hidden'>
            <X size={24} />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex flex-col px-5 pt-4 space-y-2">
          {navItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-start gap-2 py-2 rounded transition-all duration-200 text-sm ${
                  isActive
                    ? 'text-green-600 font-medium'
                    : 'text-gray-700 hover:scale-105'
                }`
              }
              onClick={()=>{!isLoggingOut&&closeSidebar()}}
            >
              <item.icon size={14}/>
              {item.name}
            </NavLink>
          ))}
          <button onClick={handleLogout} className={`flex items-center justify-start gap-2 py-2 rounded transition-all duration-200 text-sm text-red-500 hover:scale-105`}>
            <LogOut size={14}/>Logout {isLoggingOut && <Loader className={`animate-spin`} />}
          </button>
        </nav>

        {/* Logo at the bottom */}
        <div className="mt-auto px-4 pt-6 flex justify-center">
          <img src={fmcLogo} alt="FMC Logo" className="w-[130px] h-auto" />
        </div>
      </aside>
    </>
  )
}
