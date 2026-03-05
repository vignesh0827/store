import React, { useState, useEffect } from 'react';
import {
    UserCheck,
    Clock,
    Calendar,
    Search,
    Filter,
    ShieldCheck,
    Plus,
    Edit2,
    Trash2,
    Save,
    X,
    CheckCircle2,
    MoreVertical
} from 'lucide-react';
import toast from 'react-hot-toast';

import { apiSvc } from '../services/api';

const Attendance = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmp, setEditingEmp] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        role: 'Sales Staff',
        mobile: '',
        avatar: '👤',
        status: 'Absent',
        check_in: '--',
        check_out: '--'
    });

    const fetchStaff = async () => {
        try {
            const data = await apiSvc.get('/staff/');
            setEmployees(data);
        } catch (error) {
            toast.error("Failed to load staff");
        } finally {
            setLoading(false);
        }
    };

    const [activeTab, setActiveTab] = useState('live'); // live, history, or report
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    const fetchHistory = async () => {
        setHistoryLoading(true);
        try {
            const data = await apiSvc.get('/attendance/history');
            setHistory(data);
        } catch (error) {
            toast.error("Failed to load history");
        } finally {
            setHistoryLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    useEffect(() => {
        if (activeTab === 'history' || activeTab === 'report') fetchHistory();
    }, [activeTab]);

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (emp = null) => {
        if (emp) {
            setEditingEmp(emp);
            setFormData({
                name: emp.name,
                role: emp.role,
                mobile: emp.mobile,
                avatar: emp.avatar
            });
        } else {
            setEditingEmp(null);
            setFormData({
                name: '',
                role: 'Sales Staff',
                mobile: '',
                avatar: '👤'
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.mobile) {
            toast.error("Please fill all details");
            return;
        }

        try {
            if (editingEmp) {
                await apiSvc.put(`/staff/${editingEmp.id}`, formData);
                toast.success("Staff updated successfully");
            } else {
                await apiSvc.post('/staff/', formData);
                toast.success("New staff added to database");
            }
            fetchStaff();
            setIsModalOpen(false);
        } catch (error) {
            toast.error("Failed to save staff member");
        }
    };

    const handleDelete = async (id) => {
        try {
            await apiSvc.delete(`/staff/${id}`);
            toast.success("Staff removed from database");
            fetchStaff();
        } catch (error) {
            toast.error("Failed to delete staff member");
        }
    };

    const toggleStatus = async (id) => {
        const emp = employees.find(e => e.id === id);
        if (!emp) return;

        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const newStatus = emp.status === 'Present' ? 'Absent' : 'Present';

        const historyData = {
            staff_id: id,
            date: new Date().toISOString().split('T')[0],
            status: newStatus,
            check_in: newStatus === 'Present' ? now : '--',
            check_out: '--'
        };

        try {
            await apiSvc.post('/attendance/', historyData);
            toast.success(`Status updated: ${newStatus}`);
            fetchStaff();
            if (activeTab === 'history') fetchHistory();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left pb-10 font-sans">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                <div>
                    <h2 className="text-4xl font-black text-gray-900 leading-none tracking-tight">Staff <span className="text-green-600">Attendance</span></h2>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                        <span className="w-8 h-[2px] bg-green-500"></span> Management & Daily Logs
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-white border border-gray-100 rounded-2xl p-1.5 shadow-sm">
                        <button
                            onClick={() => setActiveTab('live')}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === 'live' ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Live Status
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === 'history' ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            History Log
                        </button>
                        <button
                            onClick={() => setActiveTab('report')}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === 'report' ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Monthly Report
                        </button>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-gray-900 text-white p-4 rounded-2xl hover:bg-black transition-all shadow-xl shadow-gray-900/10 flex items-center gap-2 group"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                        <span className="font-bold text-xs uppercase tracking-wider pr-2">Add Staff</span>
                    </button>
                </div>
            </div>

            {activeTab === 'live' ? (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left">On Duty Today</p>
                            <div className="flex items-end justify-between mt-4">
                                <h3 className="text-5xl font-black text-green-600 font-mono">
                                    {employees.filter(e => e.status === 'Present').length.toString().padStart(2, '0')}
                                    <span className="text-gray-200 text-xl font-bold ml-2">/ {employees.length.toString().padStart(2, '0')}</span>
                                </h3>
                                <div className="p-4 bg-green-50 rounded-2xl border border-green-100 group-hover:rotate-12 transition-transform">
                                    <UserCheck className="w-7 h-7 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm transition-all hover:shadow-xl hover:shadow-gray-900/5">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <Search className="w-6 h-6 text-gray-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Search Directory</p>
                                    <input
                                        type="text"
                                        placeholder="Staff name or role..."
                                        className="w-full bg-transparent font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-900 p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
                            <div className="absolute bottom-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-16 -mb-16 blur-3xl"></div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left">Recent Activity</p>
                            <div className="mt-4 flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-green-400" />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm">Last Update</p>
                                    <p className="text-green-400 font-mono text-xs">Just Now</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Attendance Table */}
                    <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden text-left">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100 text-left">
                                        <th className="px-10 py-8 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left">Staff Member</th>
                                        <th className="px-10 py-8 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left">Role & ID</th>
                                        <th className="px-10 py-8 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Status</th>
                                        <th className="px-10 py-8 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Check-in</th>
                                        <th className="px-10 py-8 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredEmployees.map((emp) => (
                                        <tr key={emp.id} className="hover:bg-gray-50/50 transition-all group">
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-4xl group-hover:rotate-6 group-hover:bg-white group-hover:shadow-lg transition-all duration-300">
                                                        {emp.avatar}
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-gray-900 text-xl block uppercase leading-none mb-1.5 group-hover:text-green-600 transition-colors">{emp.name}</span>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{emp.mobile}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6">
                                                <div className="space-y-1">
                                                    <p className="font-black text-gray-950 uppercase text-xs tracking-tight">{emp.role}</p>
                                                    <p className="text-[9px] font-bold text-gray-300 uppercase tracking-wider">EMP-00{emp.id}</p>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 text-center">
                                                <button
                                                    onClick={() => toggleStatus(emp.id)}
                                                    className={`px-6 py-2.5 rounded-2xl border text-[10px] font-bold uppercase tracking-wider shadow-sm transition-all hover:scale-105 ${emp.status === 'Present'
                                                        ? 'bg-green-100 text-green-700 border-green-200'
                                                        : 'bg-red-50 text-red-500 border-red-100'
                                                        }`}
                                                >
                                                    {emp.status}
                                                </button>
                                            </td>
                                            <td className="px-10 py-6 text-center">
                                                <div className={`font-black text-sm tracking-widest font-mono ${emp.status === 'Present' ? 'text-gray-900' : 'text-gray-300'}`}>
                                                    {emp.check_in}
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleOpenModal(emp)}
                                                        className="p-3 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl hover:bg-blue-600 hover:text-white transition-all active:scale-95"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(emp.id)}
                                                        className="p-3 bg-red-50 text-red-500 border border-red-100 rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-95"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {filteredEmployees.length === 0 && !loading && (
                            <div className="p-20 text-center">
                                <p className="text-gray-300 font-bold uppercase tracking-widest text-sm">No Staff Members Found</p>
                            </div>
                        )}
                    </div>
                </>
            ) : activeTab === 'history' ? (
                /* History Log View */
                <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden text-left animate-in slide-in-from-right-4 duration-500">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100 text-left">
                                    <th className="px-10 py-8 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left">Date</th>
                                    <th className="px-10 py-8 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left">Staff Member</th>
                                    <th className="px-10 py-8 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Status</th>
                                    <th className="px-10 py-8 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Check-in</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {history.map((record) => {
                                    const staff = employees.find(e => e.id === record.staff_id);
                                    return (
                                        <tr key={record.id} className="hover:bg-gray-50/50 transition-all">
                                            <td className="px-10 py-6">
                                                <div className="font-bold text-gray-900 text-sm font-mono">
                                                    {new Date(record.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </div>
                                            </td>
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-xl border border-gray-100">
                                                        {staff?.avatar || '👤'}
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-gray-900 text-sm block uppercase">{staff?.name || 'Unknown Staff'}</span>
                                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{staff?.role}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 text-center">
                                                <span className={`px-4 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-wider ${record.status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-500'}`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className="px-10 py-6 text-center">
                                                <div className="font-bold text-xs text-gray-900 font-mono">
                                                    {record.check_in}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {history.length === 0 && !historyLoading && (
                        <div className="p-20 text-center">
                            <CheckCircle2 className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                            <p className="text-gray-300 font-bold uppercase tracking-widest text-sm">No history records found yet</p>
                        </div>
                    )}
                </div>
            ) : (
                /* 30-Day Performance Report View */
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {employees.map(emp => {
                            // Calculate days in the current month
                            const now = new Date();
                            const year = now.getFullYear();
                            const month = now.getMonth();
                            const daysInMonth = new Date(year, month + 1, 0).getDate();
                            const monthName = now.toLocaleString('default', { month: 'long' });

                            const days = [];
                            for (let i = 1; i <= daysInMonth; i++) {
                                const d = new Date(year, month, i);
                                days.push(d.toISOString().split('T')[0]);
                            }

                            const empHistory = history.filter(h => h.staff_id === emp.id);
                            // Only count history for the current month
                            const currentMonthHistory = empHistory.filter(h => {
                                const hDate = new Date(h.date);
                                return hDate.getMonth() === month && hDate.getFullYear() === year;
                            });

                            const presentCount = currentMonthHistory.filter(h => h.status === 'Present').length;
                            const currentDay = now.getDate();
                            const absentCount = currentMonthHistory.filter(h => h.status === 'Absent').length;

                            return (
                                <div key={emp.id} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-8">
                                    <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-4">
                                        <div className="w-20 h-20 bg-gray-50 border border-gray-100 rounded-3xl flex items-center justify-center text-5xl shadow-sm">
                                            {emp.avatar}
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black text-gray-900 uppercase leading-tight">{emp.name}</h4>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{emp.role}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 w-full">
                                            <div className="bg-green-50 p-3 rounded-2xl border border-green-100">
                                                <p className="text-[10px] font-bold text-green-600 uppercase mb-1">Present</p>
                                                <p className="text-2xl font-black text-green-700 font-mono">{presentCount.toString().padStart(2, '0')}</p>
                                            </div>
                                            <div className="bg-red-50 p-3 rounded-2xl border border-red-100">
                                                <p className="text-[10px] font-bold text-red-500 uppercase mb-1">Absent</p>
                                                <p className="text-2xl font-black text-red-700 font-mono">{absentCount.toString().padStart(2, '0')}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <Clock className="w-3 h-3" /> {monthName} Presence Visualizer ({daysInMonth} Days)
                                            </p>
                                            <div className="grid grid-cols-7 sm:grid-cols-10 gap-2 mb-6">
                                                {days.map((date, idx) => {
                                                    const hRecord = currentMonthHistory.find(h => h.date === date);
                                                    const status = hRecord ? hRecord.status : (new Date(date) < now ? 'Not Recorded' : 'Future');

                                                    let bgColor = 'bg-gray-100 border-gray-50';
                                                    if (status === 'Present') bgColor = 'bg-green-500 border-green-100 shadow-lg shadow-green-500/20';
                                                    if (status === 'Absent') bgColor = 'bg-red-400 border-red-100 shadow-lg shadow-red-400/20';
                                                    if (status === 'Future') bgColor = 'bg-gray-50 border-gray-100 opacity-30';

                                                    return (
                                                        <div
                                                            key={date}
                                                            title={`${new Date(date).toLocaleDateString()} - ${status}`}
                                                            className={`aspect-square rounded-lg border-2 transition-all hover:scale-110 cursor-help flex items-center justify-center text-[8px] font-black ${bgColor}`}
                                                        >
                                                            {idx + 1}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                            <div className="flex items-center gap-2">
                                                <ShieldCheck className="w-4 h-4 text-green-600" />
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Month Score</p>
                                            </div>
                                            <span className="text-lg font-black text-gray-900 font-mono">
                                                {Math.round((presentCount / currentDay) * 100) || 0}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )
            }

            {/* Simple Modal */}
            {
                isModalOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-[40px] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                            <div className="bg-gray-900 p-8 text-white relative">
                                <div className="absolute top-0 right-0 p-8">
                                    <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                                <p className="text-green-500 text-[10px] font-black uppercase tracking-widest mb-2">Internal Directory</p>
                                <h3 className="text-3xl font-black tracking-tight">{editingEmp ? 'Edit Staff' : 'New Staff Card'}</h3>
                            </div>

                            <div className="p-10 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl font-bold text-gray-900 focus:outline-none focus:border-green-500 transition-all"
                                        placeholder="Enter staff name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Staff Role</label>
                                        <select
                                            className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl font-bold text-gray-900 focus:outline-none focus:border-green-500 transition-all"
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        >
                                            <option>Sales Staff</option>
                                            <option>Inward Manager</option>
                                            <option>Delivery</option>
                                            <option>Cleaning</option>
                                            <option>Security</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Avatar</label>
                                        <select
                                            className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl font-bold text-gray-900 focus:outline-none focus:border-green-500 transition-all"
                                            value={formData.avatar}
                                            onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                                        >
                                            <option>👤</option>
                                            <option>👨‍💼</option>
                                            <option>🧔</option>
                                            <option>🚴</option>
                                            <option>🧑‍🌾</option>
                                            <option>👵</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contact Number</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl font-bold text-gray-900 focus:outline-none focus:border-green-500 transition-all"
                                        placeholder="Mobile number"
                                        value={formData.mobile}
                                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                    />
                                </div>

                                <button
                                    onClick={handleSave}
                                    className="w-full bg-green-600 text-white py-5 rounded-[24px] font-black uppercase tracking-widest shadow-xl shadow-green-600/20 hover:bg-green-700 transition-all active:scale-95 flex items-center justify-center gap-3"
                                >
                                    <Save className="w-5 h-5" />
                                    {editingEmp ? 'Update Changes' : 'Save New Staff'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Attendance;
