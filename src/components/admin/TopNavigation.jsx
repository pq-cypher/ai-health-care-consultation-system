import { Menu } from 'lucide-react'
import { NavLink } from 'react-router-dom';
import fmcLogo from "../../assets/images/fmc-logo.png";

export default function TopNavigation({ toggleSidebar }) {
  return (
    <header className="w-full h-[60px] bg-white shadow-md px-4 flex items-center justify-between lg:justify-end sticky top-0 z-20">
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="block lg:hidden text-gray-700"
      >
        <Menu size={24} />
      </button>

      {/* Logo and title */}
      <div className="flex items-center space-x-3">
        <NavLink to={"/"} className="w-10 h-10"><img src={fmcLogo} alt="FMC Logo" className="w-full h-full object-cover" /></NavLink>
        <div className="text-left leading-tight">
          <h1 className="text-sm font-semibold">FMC Keffi</h1>
          <p className="text-xs text-gray-500">AI Health Care Consultation System</p>
        </div>
      </div>
    </header>
  )
}
