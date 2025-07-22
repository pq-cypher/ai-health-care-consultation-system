import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import TopNavigation from '../components/admin/TopNavigation'
import SideNavigation from '../components/admin/SideNavigation'
import RequireAdminAuth from "../components/admin/RequireAdminAuth";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const closeSidebar = () => setSidebarOpen(false)

  return (
    <RequireAdminAuth>
      <div className="flex h-screen bg-white overflow-hidden">
        {/* Sidebar */}
        <SideNavigation isOpen={sidebarOpen} closeSidebar={closeSidebar} />

        {/* Main content */}
        <div className="w-full overflow-y-auto">
          <TopNavigation toggleSidebar={toggleSidebar} />
          <main className="p-5 w-full">
            <Outlet />
          </main>
        </div>
      </div>
    </RequireAdminAuth>
  )
}
