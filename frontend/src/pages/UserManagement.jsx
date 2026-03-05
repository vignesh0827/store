import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, ShieldCheck as Shield, User, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiSvc } from '../services/api';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [isCreating, setIsCreating] = useState(false);

    const fetchUsers = async () => {
        try {
            const data = await apiSvc.get('/users/');
            setUsers(data);
        } catch (error) {
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            toast.error("Please fill all fields");
            return;
        }
        setIsCreating(true);
        try {
            await apiSvc.post('/users/', { username, password, role });
            toast.success("User created successfully!");
            setUsername('');
            setPassword('');
            fetchUsers();
        } catch (error) {
            toast.error(error.message || "Failed to create user");
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteUser = async (userId, targetUsername) => {
        const currentUser = localStorage.getItem('username');
        if (targetUsername === currentUser) {
            toast.error("You cannot delete yourself!");
            return;
        }
        if (!confirm(`Are you sure you want to delete user "${targetUsername}"?`)) return;

        try {
            await apiSvc.delete(`/users/${userId}`);
            toast.success("User deleted");
            fetchUsers();
        } catch (error) {
            toast.error("Failed to delete user");
        }
    };

    return (
        <div className="max-w-[1200px] mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-2xl">
                        <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                        <p className="text-sm text-gray-400 font-medium">Control access for Managers and Bill Counters</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Create User Form */}
                <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm h-fit">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-green-500" />
                        Create New User
                    </h2>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Username <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 border border-gray-100 py-3 pl-12 pr-4 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all font-medium"
                                    placeholder="Enter username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Password <span className="text-red-500">*</span></label>
                            <input
                                type="password"
                                className="w-full bg-gray-50 border border-gray-100 py-3 px-4 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all font-medium"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Role</label>
                            <select
                                className="w-full bg-gray-50 border border-gray-100 py-3 px-4 rounded-2xl text-sm focus:outline-none cursor-pointer font-bold text-gray-700"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                            >
                                <option value="user">Bill Counter (POS Only)</option>
                                <option value="manager">Manager (Full Access)</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            disabled={isCreating}
                            className="w-full py-4 bg-gray-900 hover:bg-black text-white font-bold uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg text-xs mt-4 disabled:opacity-50"
                        >
                            {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                            Add User
                        </button>
                    </form>
                </div>

                {/* User List */}
                <div className="lg:col-span-2 bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                        <span className="font-bold text-xs uppercase tracking-wider text-gray-900">Existing System Users</span>
                        <span className="bg-white px-3 py-1 rounded-full border border-gray-200 text-[10px] font-bold text-gray-500">{users.length} Users</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar min-h-[400px]">
                        {loading ? (
                            <div className="h-full flex items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {users.map((u) => (
                                    <div key={u.id} className="p-4 bg-white border border-gray-100 rounded-3xl flex justify-between items-center group hover:border-blue-100 hover:bg-blue-50/10 transition-all shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${u.role === 'manager' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                                <User className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-lg leading-tight">{u.username}</p>
                                                <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${u.role === 'manager' ? 'text-purple-500' : 'text-blue-500'}`}>
                                                    {u.role.replace('_', ' ')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleDeleteUser(u.id, u.username)}
                                                className="text-gray-300 hover:text-red-500 transition-all bg-gray-50 hover:bg-red-50 p-3 rounded-2xl group/del"
                                            >
                                                <Trash2 className="w-5 h-5 group-hover/del:scale-110 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
