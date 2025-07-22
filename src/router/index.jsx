import { Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Home from "../pages/Home";
import ChatBot from "../pages/ChatBot";
import AdminLogin from "../pages/AdminLogin";
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/AdminDashboard";
import ViewMedicalProfessionals from "../pages/ViewMedicalProfessionals";
import EditMedicalProfessional from "../pages/EditMedicalProfessional";
import AddMedicalProfessional from "../pages/AddMedicalProfessional";

export default function App(){
    return(
        <AnimatePresence mode="wait">
            <Routes>
                <Route index element={<Home />}/>
                <Route path="/" element={<Home />} />
                <Route path="chat" element={<ChatBot />} />
                <Route path="admin-login" element={<AdminLogin />} />
                    <Route path="admin" element={<AdminLayout />} >
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="view-medical-professionals" element={<ViewMedicalProfessionals />} />
                    <Route path="edit-medical-professional" element={<EditMedicalProfessional />} />
                    <Route path="add-medical-professional" element={<AddMedicalProfessional />} />
                </Route>
            </Routes>
        </AnimatePresence>
    );
}