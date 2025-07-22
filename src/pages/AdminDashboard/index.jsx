import { NavLink } from 'react-router-dom'

export default function AdminDashboard() {
  return (
    <div className="flex flex-col items-center justify-start flex-nowrap max-w-[500px] mx-auto mt-8 px-4">
      <h1 className="text-center text-2xl font-bold mb-4 text-gray-800 uppercase">
        Welcome Admin
      </h1>

      <p className="text-center text-[15px] text-[#444] leading-relaxed mb-6">
        This is the Admin Dashboard for the <font className={`font-[600]`}>AI Health Care Consultation System</font>. Here, you can manage medical professionals who assist users through AI-powered health consultations. Use the navigation menu or the button below to get started.
      </p>

      <NavLink
        to="/admin/view-medical-professionals"
        className="inline-block border-2 border-green-600 text-[#444] font-[600] px-6 py-2 rounded-full hover:scale-105 transition-transform duration-200"
      >
        View Medical Professionals
      </NavLink>
    </div>
  )
}
