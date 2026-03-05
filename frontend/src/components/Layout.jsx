import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <Sidebar />
            <div className="ml-64 flex flex-col min-h-screen">
                <Navbar />
                <main className="p-8 flex-1">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
