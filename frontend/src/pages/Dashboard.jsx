// Dashboard Component - Dynamic Data Enabled
import React from 'react';
import {
    TrendingUp,
    ArrowDownLeft,
    ArrowUpRight,
    Wallet,
    Users,
    ShoppingBag,
    MoreVertical,
    AlertTriangle,
    CircleDollarSign,
    Clock,
    Download,
    FileText,
    Table,
    File as FileIcon
} from 'lucide-react';
import { apiSvc } from '../services/api';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
    const [statsData, setStatsData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [showExportOptions, setShowExportOptions] = React.useState(false);

    const exportToCSV = () => {
        if (!statsData) { toast.error("No data to export"); return; }
        const headers = ["Label", "Value", "Change"];
        const rows = [
            ["Stock Value", statsData.stock_value, "+12%"],
            ["Today Sales", statsData.today_sales, "+8%"],
            ["Total Profit", statsData.total_profit, "+15%"],
            ["Staff Present", statsData.staff_present, "0%"],
            ["Total Orders", statsData.total_orders, "+22%"]
        ];
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Dashboard_Report_${new Date().toLocaleDateString()}.csv`);
        link.click();
        setShowExportOptions(false);
        toast.success("CSV Downloaded");
    };

    const exportToExcel = () => {
        if (!statsData) { toast.error("No data to export"); return; }
        const data = [
            { Label: "Stock Value", Value: statsData.stock_value, Change: "+12%" },
            { Label: "Today Sales", Value: statsData.today_sales, Change: "+8%" },
            { Label: "Today Purchase", Value: statsData.today_purchase, Change: "N/A" },
            { Label: "Wastage Loss", Value: statsData.today_wastage, Change: "N/A" },
            { Label: "Today Profit", Value: statsData.total_profit, Change: "+15%" },
            { Label: "Total Orders", Value: statsData.total_orders, Change: "+22%" }
        ];
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Dashboard Stats");
        XLSX.writeFile(workbook, `Dashboard_Report_${new Date().toLocaleDateString()}.xlsx`);
        setShowExportOptions(false);
        toast.success("Excel Downloaded");
    };

    const exportToPDF = () => {
        if (!statsData) { toast.error("No data to export"); return; }
        try {
            const doc = new jsPDF();
            doc.text("VeggieFlow Pro - Dashboard Summary", 14, 15);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

            const tableColumn = ["Statistic", "Value", "Growth Period"];
            const tableRows = [
                ["Stock Value", `Rs.${statsData.stock_value}`, "+12%"],
                ["Today Sales", `Rs.${statsData.today_sales}`, "+8%"],
                ["Today Purchase", `Rs.${statsData.today_purchase}`, "N/A"],
                ["Wastage Loss", `Rs.${statsData.today_wastage}`, "N/A"],
                ["Today Profit", `Rs.${statsData.total_profit}`, "+15%"],
                ["Total Orders", statsData.total_orders.toString(), "+22%"]
            ];

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 30,
                theme: 'striped',
                headStyles: { fillColor: [34, 197, 94] }
            });

            doc.save(`Dashboard_Report_${new Date().toLocaleDateString()}.pdf`);
            setShowExportOptions(false);
            toast.success("PDF Downloaded");
        } catch (error) {
            console.error("PDF Export failed:", error);
            toast.error("Failed to generate PDF");
        }
    };

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await apiSvc.get('/dashboard/stats');
                setStatsData(data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const displayStats = [
        { label: 'Stock Value', value: statsData ? `₹${Math.round(statsData.stock_value).toLocaleString()}` : '₹0', icon: ShoppingBag, change: '+12%', color: 'blue' },
        { label: 'Today Sales', value: statsData ? `₹${Math.round(statsData.today_sales).toLocaleString()}` : '₹0', icon: TrendingUp, change: '+8%', color: 'green' },
        { label: 'Today Purchase', value: statsData ? `₹${Math.round(statsData.today_purchase).toLocaleString()}` : '₹0', icon: ArrowDownLeft, change: 'Cost', color: 'orange' },
        { label: 'Wastage Loss', value: statsData ? `₹${Math.round(statsData.today_wastage).toLocaleString()}` : '₹0', icon: AlertTriangle, change: 'Loss', color: 'red' },
        { label: 'Today Profit', value: statsData ? `₹${Math.round(statsData.total_profit).toLocaleString()}` : '₹0', icon: CircleDollarSign, change: '+15%', color: 'emerald' },
        { label: 'Staff Present', value: statsData ? statsData.staff_present : '0/0', icon: Users, change: '0%', color: 'purple' },
        { label: 'Total Orders', value: statsData ? statsData.total_orders.toString() : '0', icon: ArrowUpRight, change: '+22%', color: 'green' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700 text-left pb-10 font-sans">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 leading-none italic">Vegetable Shop <span className="text-green-600 not-italic">Dashboard</span></h2>
                    <p className="text-gray-500 text-sm mt-1 uppercase font-semibold tracking-wider">Summary • {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <button
                            onClick={() => setShowExportOptions(!showExportOptions)}
                            className="bg-white border border-gray-100 rounded-2xl px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-600 shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Download Report
                        </button>

                        {showExportOptions && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                <button onClick={exportToPDF} className="w-full text-left flex items-center gap-3 px-6 py-3 hover:bg-gray-50 text-[9px] font-bold uppercase tracking-wider text-gray-600 transition-colors bg-transparent border-none cursor-pointer">
                                    <FileIcon className="w-4 h-4 text-red-500" />
                                    Export as PDF
                                </button>
                                <button onClick={exportToExcel} className="w-full text-left flex items-center gap-3 px-6 py-3 hover:bg-gray-50 text-[9px] font-bold uppercase tracking-wider text-gray-600 transition-colors bg-transparent border-none cursor-pointer">
                                    <Table className="w-4 h-4 text-green-600" />
                                    Export as Excel
                                </button>
                                <button onClick={exportToCSV} className="w-full text-left flex items-center gap-3 px-6 py-3 hover:bg-gray-50 text-[9px] font-bold uppercase tracking-wider text-gray-600 transition-colors bg-transparent border-none cursor-pointer">
                                    <FileText className="w-4 h-4 text-blue-500" />
                                    Export as CSV
                                </button>
                            </div>
                        )}
                    </div>
                    <select className="bg-green-600 text-white border-none rounded-2xl px-6 py-3 text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-green-600/20 outline-none cursor-pointer appearance-none">
                        <option>Today</option>
                        <option>Weekly View</option>
                        <option>Monthly View</option>
                    </select>
                </div>
            </div>

            {/* Compact Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4">
                {displayStats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden">
                        <div className="flex justify-between items-start">
                            <div className={`p-3 rounded-2xl bg-green-50 text-green-600 group-hover:rotate-6 transition-transform`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4 text-left">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-2">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-gray-900 tracking-tight truncate" title={loading ? '' : stat.value}>{loading ? '...' : stat.value}</h3>
                            <div className="flex items-center gap-1.5 mt-2">
                                <span className={`px-2 py-0.5 rounded-lg text-[8px] font-bold uppercase ${stat.change.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {stat.change}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Side: Analytics & Products */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Volume Chart */}
                    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg uppercase leading-none">Sales Today</h3>
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-1">Last 7 Days</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-600 shadow-lg shadow-green-600/20"></div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Revenue</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-400 shadow-lg shadow-slate-400/20"></div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Expenses</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={statsData?.sales_history || []}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorPurchase" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} tickFormatter={(value) => `₹${value / 1000}k`} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '16px' }}
                                        itemStyle={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '10px' }}
                                    />
                                    <Area type="monotone" dataKey="sales" stroke="#22c55e" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                                    <Area type="monotone" dataKey="purchase" stroke="#94a3b8" strokeWidth={4} fillOpacity={1} fill="url(#colorPurchase)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Top Moving Products */}
                        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm text-left relative overflow-hidden">
                            <h3 className="font-bold text-gray-900 uppercase tracking-wider text-xs mb-8 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-green-600" />
                                Top Selling Items
                            </h3>
                            <div className="space-y-6">
                                {statsData?.top_selling?.map((p, i) => (
                                    <div key={i} className="space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="font-bold text-gray-900">{p.name}</span>
                                            <span className="font-bold text-green-600">{p.sold}</span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                                            <div className="h-full bg-green-600 rounded-full" style={{ width: `${p.val}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payment Mode Snapshot */}
                        <div className="bg-gray-900 p-8 rounded-[40px] shadow-2xl relative overflow-hidden text-left group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-16 -mt-16 blur-2xl transition-transform duration-700"></div>
                            <h3 className="font-bold text-white uppercase tracking-wider text-[10px] mb-8">Payment Types</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 group/item hover:bg-white/10 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center text-green-400 font-bold">₹</div>
                                        <span className="text-white font-bold text-xs uppercase">Cash</span>
                                    </div>
                                    <span className="font-bold text-white text-lg">65%</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 group/item hover:bg-white/10 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-500/20 rounded-xl flex items-center justify-center text-slate-400 text-xl font-bold">📱</div>
                                        <span className="text-white font-bold text-xs uppercase">UPI / Online</span>
                                    </div>
                                    <span className="font-bold text-white text-lg">35%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Feed & Alerts */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Activity Feed */}
                    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm text-left">
                        <h3 className="font-bold text-gray-900 text-[10px] uppercase tracking-wider mb-8 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-green-600" />
                            Recent activity
                        </h3>
                        <div className="space-y-6">
                            {statsData?.recent_activity?.map((act) => (
                                <div key={act.id} className="flex gap-4 group">
                                    <div className={`w-12 h-12 rounded-2xl bg-gray-50 text-green-600 flex items-center justify-center shrink-0 group-hover:bg-green-600 group-hover:text-white transition-all`}>
                                        <ArrowUpRight className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <p className="font-bold text-gray-900 text-xs leading-none uppercase">{act.type === 'Inward' ? 'Bought' : act.type}</p>
                                            <span className="text-[9px] font-bold text-gray-400 uppercase shrink-0">{act.time}</span>
                                        </div>
                                        <p className="text-[11px] font-semibold text-gray-500 mt-2 truncate" title={act.desc}>{act.desc}</p>
                                        <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider mt-1">{act.amount}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-10 py-5 bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-600 rounded-2xl hover:bg-green-600 hover:text-white transition-all border border-gray-100">
                            See All Logs
                        </button>
                    </div>

                    {/* Low Stock Simplified */}
                    <div className="bg-green-50/50 p-8 rounded-[40px] border border-green-100 text-left relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-600/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-white rounded-2xl shadow-sm text-red-500 border border-red-50">
                                <AlertTriangle className="w-6 h-6 animate-pulse" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm uppercase leading-none">Low Stock</h3>
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-1">Check Items</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {statsData?.low_stock?.map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 group-hover:border-green-200 transition-all">
                                    <span className="font-bold text-gray-700 text-xs tracking-tight uppercase truncate mr-4" title={item.name}>{item.name}</span>
                                    <span className="text-[10px] font-bold text-red-600 uppercase bg-red-50 px-3 py-1 rounded-lg">{item.level}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
