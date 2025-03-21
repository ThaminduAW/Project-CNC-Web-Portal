import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Restaurants from "./pages/Home/Restaurants";
import Reservation from "./pages/Home/Reservation";
import About from "./pages/Home/About";
import Contact from "./pages/Home/Contact";
import Events from "./pages/Home/Events";

import AdminDashboard from "./pages/Admin/AdminDashboard";
import Partners from "./pages/Admin/Partners";
import PartnerReservations from "./pages/Admin/PartnerReservations";
import AdminPartnerEvents from "./pages/Admin/AdminPartnerEvents";
import Messages from "./pages/Admin/Messages";
import AdminSettings from "./pages/Admin/AdminSettings";

import PartnerDashboard from "./pages/Partners/PartnerDashboard";
import PartnerEvents from "./pages/Partners/PartnerEvents";
import Menu from "./pages/Partners/Menu";
import PartnerMessages from "./pages/Partners/PartnerMessages";
import PartnerSettings from "./pages/Partners/PartnerSettings";

import SignIn from "./pages/Authentication/SignIn";
import SignUp from "./pages/Authentication/SignUp";

import NotFound from "./components/NotFound"; 

const App = () => {
    return (
        <Router>
            <Routes>
                {/* Home Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/restaurants" element={<Restaurants />} />
                <Route path="/events" element={<Events />} />
                <Route path="/reservation" element={<Reservation />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />

                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/partners" element={<Partners />} />
                <Route path="/admin/reservations" element={<PartnerReservations />} />
                <Route path="/admin/events" element={<AdminPartnerEvents />} />
                <Route path="/admin/messages" element={<Messages />} />
                <Route path="/admin/settings" element={<AdminSettings />} />

                {/* Partner Routes */}
                <Route path="/partner/dashboard" element={<PartnerDashboard />} />
                <Route path="/partner/events" element={<Events />} />
                <Route path="/partner/menu" element={<Menu />} />
                <Route path="/partner/messages" element={<PartnerMessages />} />
                <Route path="/partner/settings" element={<PartnerSettings />} />

                {/* Authentication Routes */}
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />

                {/* 404 Page */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
};

export default App;
