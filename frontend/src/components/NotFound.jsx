import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
            <h1 className="text-8xl font-bold text-red-500">404</h1>
            <h2 className="text-3xl font-semibold mt-4">Oops! Page Not Found</h2>
            <p className="text-lg text-gray-400 mt-2">
                The page you're looking for doesn't exist or has been moved.
            </p>
            <Link to="/" className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-500 transition">
                Go Home
            </Link>
        </div>
    );
};

export default NotFound;
