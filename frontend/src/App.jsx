import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from "./pages/Home/Home";
import Restaurants from "./pages/Home/Restaurants";
import ResDetails from "./pages/Home/ResDetails";
import Reservation from "./pages/Home/Reservation";
import About from "./pages/Home/About";
import Contact from "./pages/Home/Contact";
import Tours from "./pages/Home/Tours";
import TourDetail from "./components/TourDetail";

import AdminDashboard from "./pages/Admin/AdminDashboard";
import Partners from "./pages/Admin/Partners";
import PartnerReservations from "./pages/Admin/PartnerReservations";
import AdminPartnerTours from "./pages/Admin/AdminPartnerTours";
import Messages from "./pages/Admin/Messages";
import AdminSettings from "./pages/Admin/AdminSettings";
import Requests from "./pages/Admin/Requests";

import PartnerDashboard from "./pages/Partners/PartnerDashboard";
import PartnerMenu from "./pages/Partners/PartnerMenu";
import PartnerMessages from "./pages/Partners/PartnerMessages";
import PartnerSettings from "./pages/Partners/PartnerSettings";
import Reservations from "./pages/Partners/Reservations";
import ExperienceDetails from "./pages/Partners/ExperienceDetails";
import PromotionalNotifications from "./pages/Partners/PromotionalNotifications";

import SignIn from "./pages/Authentication/SignIn";
import SignUp from "./pages/Authentication/SignUp";
import ForgotPassword from "./pages/Authentication/ForgotPassword";

import NotFound from "./components/NotFound"; 

const App = () => {
    return (
        <Router>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            <Routes>
                {/* Home Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/restaurants" element={<Restaurants />} />
                <Route path="/restaurant-details" element={<ResDetails />} />
                <Route path="/tours" element={<Tours />} />
                <Route path="/tours/:id" element={<TourDetail />} />
                <Route path="/reservation" element={<Reservation />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />

                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/partners" element={<Partners />} />
                <Route path="/admin/requests" element={<Requests />} />
                <Route path="/admin/reservations" element={<PartnerReservations />} />
                <Route path="/admin/tours" element={<AdminPartnerTours />} />
                <Route path="/admin/messages" element={<Messages />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
                

                {/* Partner Routes */}
                <Route path="/partner/dashboard" element={<PartnerDashboard />} />
                <Route path="/partner/menu" element={<PartnerMenu />} />
                <Route path="/partner/reservations" element={<Reservations />} />
                <Route path="/partner/messages" element={<PartnerMessages />} />
                <Route path="/partner/settings" element={<PartnerSettings />} />
                <Route path="/experience/:id" element={<ExperienceDetails />} />
                <Route path="/partner/notifications" element={<PromotionalNotifications />} />

                {/* Authentication Routes */}
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* 404 Page */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
};

export default App;
