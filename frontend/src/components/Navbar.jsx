import React, { useState, useEffect } from 'react';
import { Search, Bell, User, LogOut, Package, ShoppingBag, Truck, UserCheck, HelpCircle, Info, Tag, Users, ShieldCheck as Shield } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiSvc } from '../services/api';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const userName = localStorage.getItem('user_name') || 'Administrator';
    const userRole = localStorage.getItem('user_role') || 'manager';

    const menuItems = [
        { name: 'Dashboard', path: '/', icon: Package },
        { name: 'Stock View', path: '/stock', icon: ShoppingBag },
        { name: 'Inward / Purchase', path: '/inward', icon: Truck },
        { name: 'Outward / Sales', path: '/outward', icon: ShoppingBag },
        { name: 'Suppliers', path: '/suppliers', icon: Users },
        { name: 'Staff Attendance', path: '/attendance', icon: UserCheck },
        { name: 'Today\'s Prices', path: '/prices', icon: Tag },
        { name: 'User Management', path: '/users', icon: Shield },
        { name: 'About Shop', path: '/about', icon: Info },
        { name: 'Get Help', path: '/help', icon: HelpCircle },
    ].filter(item => {
        if (userRole !== 'manager') {
            return !['/stock', '/inward', '/suppliers', '/attendance', '/prices', '/users'].includes(item.path);
        }
        return true;
    });

    const fetchNotifications = async () => {
        try {
            const data = await apiSvc.get('/notifications');
            setNotifications(data);
            setUnreadCount(data.length);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll for notifications every 60 seconds
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const filteredResults = menuItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setShowResults(e.target.value.length > 0);
    };

    const handleResultClick = (path) => {
        navigate(path);
        setSearchTerm('');
        setShowResults(false);
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <header className="h-20 bg-white/70 backdrop-blur-2xl border-b border-gray-100/50 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
            <div className="flex-1 max-w-xl text-left relative search-container">
                <div className="relative group/search">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within/search:text-green-600 transition-all duration-300" />
                    <input
                        type="text"
                        placeholder="Search products, orders, pages..."
                        className="w-full pl-14 pr-6 py-2.5 bg-gray-50/50 border border-transparent rounded-xl text-sm focus:outline-none focus:bg-white focus:border-green-500/20 focus:ring-4 focus:ring-green-500/5 transition-all font-medium shadow-inner"
                        value={searchTerm}
                        onChange={handleSearch}
                        onFocus={() => searchTerm.length > 0 && setShowResults(true)}
                    />
                </div>

                {showResults && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-3 border-b border-gray-50">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Quick Navigation</p>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                            {filteredResults.length > 0 ? (
                                filteredResults.map((item, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleResultClick(item.path)}
                                        className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-green-50 text-gray-700 transition-all text-left"
                                    >
                                        <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-white">
                                            <item.icon className="w-4 h-4 text-green-600" />
                                        </div>
                                        <span className="text-sm font-bold">{item.name}</span>
                                    </button>
                                ))
                            ) : (
                                <div className="p-10 text-center">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-loose">No pages found matching "{searchTerm}"</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-8">
                <div className="relative">
                    <button
                        onClick={() => {
                            setShowNotifications(!showNotifications);
                            if (!showNotifications) setUnreadCount(0); // Mark as read locally
                        }}
                        className={`relative p-3 rounded-[18px] transition-all duration-300 group ${showNotifications ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}
                    >
                        <Bell className={`w-5 h-5 ${!showNotifications && 'group-hover:rotate-12'} transition-transform`} />
                        {unreadCount > 0 && (
                            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-[pulse_2s_infinite]"></span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-[24px] shadow-2xl border border-gray-100 py-4 z-50 animate-in fade-in slide-in-from-top-2 duration-300 overflow-hidden text-left">
                            <div className="px-6 pb-4 border-b border-gray-50 flex justify-between items-center">
                                <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Notifications</h4>
                                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md">{notifications.length} Total</span>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map((n) => (
                                        <div key={n.id} className="px-6 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 cursor-pointer text-left">
                                            <div className="flex items-start gap-3">
                                                <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${n.type === 'warning' ? 'bg-amber-500' :
                                                        n.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                                                    }`} />
                                                <div>
                                                    <p className="text-xs font-bold text-gray-800 leading-relaxed mb-1">{n.text}</p>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{n.time}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">No new notifications</p>
                                    </div>
                                )}
                            </div>
                            <button onClick={fetchNotifications} className="w-full py-4 text-[10px] font-black uppercase text-gray-400 hover:text-green-600 transition-colors bg-white border-t border-gray-50">
                                Refresh Feed
                            </button>
                        </div>
                    )}
                </div>

                <div className="relative group">
                    <div className="flex items-center gap-4 pl-8 border-l border-gray-100 cursor-pointer">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-gray-900 leading-none">{userName}</p>
                            <div className="flex items-center justify-end gap-1.5 mt-2">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                <p className="text-xs text-green-600 font-medium">
                                    {userRole === 'manager' ? 'Shop manager' : 'Terminal user'}
                                </p>
                            </div>
                        </div>
                        <div className="w-11 h-11 bg-gradient-to-br from-green-50 to-white rounded-xl flex items-center justify-center border border-green-100 shadow-sm transition-all duration-500 group-hover:shadow-[0_10px_20px_rgba(34,197,94,0.15)] group-hover:scale-105 group-hover:rotate-3">
                            <User className="text-green-600 w-5 h-5" strokeWidth={2} />
                        </div>
                    </div>

                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all z-50">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-6 py-3 hover:bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-wider transition-all"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
