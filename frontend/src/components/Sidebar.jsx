import React from 'react';
import {
    LayoutDashboard,
    Package,
    ArrowDownCircle,
    ArrowUpCircle,
    Truck,
    Users,
    Info,
    HelpCircle,
    LogOut,
    Tag,
    Receipt,
    BarChart3,
    ShieldCheck as Shield,
    Store,
    PackageX
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { apiSvc } from '../services/api';
import StoreLogo from './StoreLogo';

const Sidebar = () => {
    const navigate = useNavigate();
    const userRole = localStorage.getItem('user_role') || 'manager';
    const displayRole = userRole === 'manager' ? 'Shop Manager' : 'Bill Counter';
    const [lowStockCount, setLowStockCount] = React.useState(0);

    React.useEffect(() => {
        if (userRole !== 'manager') return;

        const fetchLowStock = async () => {
            try {
                const data = await apiSvc.get('/vegetables/low-stock/');
                setLowStockCount(data.length);
            } catch (error) {
                console.error("Failed to fetch low stock count", error);
            }
        };

        fetchLowStock();
        const interval = setInterval(fetchLowStock, 30000); // Update every 30s
        return () => clearInterval(interval);
    }, [userRole]);

    const allMenuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/', roles: ['manager'] },
        { name: 'Today\'s Prices', icon: Tag, path: '/prices', roles: ['manager'] },
        { name: 'Full Stock', icon: Package, path: '/stock', roles: ['manager'] },
        { name: 'Inward', icon: ArrowDownCircle, path: '/inward', roles: ['manager'] },
        { name: 'Outward', icon: ArrowUpCircle, path: '/outward', roles: ['manager', 'bill_counter'] },
        { name: 'Wastage', icon: PackageX, path: '/wastage', roles: ['manager'] },
        { name: 'Suppliers List', icon: Truck, path: '/suppliers', roles: ['manager'] },
        { name: 'Pay Suppliers', icon: Users, path: '/supplier-payments', roles: ['manager'] },
        { name: 'Manage Users', icon: Shield, path: '/users', roles: ['manager'] },
        { name: 'Staff Attendance', icon: Users, path: '/attendance', roles: ['manager'] },
        { name: 'About Shop', icon: Info, path: '/about', roles: ['manager', 'bill_counter'] },
        { name: 'Get Help', icon: HelpCircle, path: '/help', roles: ['manager', 'bill_counter'] },
    ];

    const menuItems = allMenuItems.filter(item => item.roles.includes(userRole));

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="w-64 bg-[#0a0a0a]/95 backdrop-blur-xl h-screen flex flex-col text-white fixed left-0 top-0 shadow-[10px_0_40px_rgba(0,0,0,0.4)] z-20 font-sans border-r border-white/5 overflow-hidden">
            <div className="p-4 flex flex-col items-center gap-2 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent flex-shrink-0">
                <div className="relative group">
                    <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full group-hover:bg-green-500/30 transition-all duration-500"></div>
                    <StoreLogo className="w-10 h-10 relative z-10 drop-shadow-2xl transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div className="text-center">
                    <h1 className="font-bold text-base leading-none tracking-tight text-white italic">
                        Vegetable <span className="text-green-500 not-italic block text-[10px] mt-0.5 font-medium italic">Shop</span>
                    </h1>
                    <div className="mt-2 px-2.5 py-0.5 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center gap-1.5">
                        <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                        <p className="text-[8px] text-green-400 font-semibold lowercase first-letter:uppercase">
                            {displayRole}
                        </p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-3 mt-3 space-y-0.5 overflow-y-auto scrollbar-hide">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 group ${isActive
                                ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-[0_4px_12px_rgba(34,197,94,0.2)] scale-[1.01]'
                                : 'text-gray-500 hover:text-white hover:bg-white/5'
                            }`
                        }
                    >
                        <item.icon className={`w-4.5 h-4.5 ${item.name === 'Dashboard' ? 'transition-transform group-hover:rotate-12' : 'group-hover:scale-110 transition-transform'}`} />
                        <span className="font-bold text-[15px] flex-1">{item.name}</span>
                        {item.name === 'Inward' && lowStockCount > 0 && (
                            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-lg shadow-red-500/40 animate-pulse">
                                {lowStockCount}
                            </span>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="p-3 border-t border-white/5 bg-gradient-to-t from-white/5 to-transparent flex-shrink-0">
                <button
                    onClick={handleLogout}
                    className="flex text-left items-center gap-3 px-4 py-2 w-full rounded-xl transition-all duration-300 text-gray-400 hover:text-white hover:bg-red-500/10 group overflow-hidden relative"
                >
                    <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/5 transition-colors"></div>
                    <LogOut className="w-4.5 h-4.5 text-gray-500 group-hover:text-red-400 group-hover:-translate-x-1 transition-all" />
                    <span className="font-bold text-[15px] group-hover:text-red-400 transition-colors">Sign Out</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
