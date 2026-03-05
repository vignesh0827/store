import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, LogIn, Store, ShieldCheck } from 'lucide-react';
import StoreLogo from '../components/StoreLogo';
import toast from 'react-hot-toast';
import { apiSvc } from '../services/api';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const data = await apiSvc.login(username, password);
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('user_role', data.role);
            localStorage.setItem('username', username);
            localStorage.setItem('user_name', data.role === 'manager' ? 'Admin Manager' : 'Bill Counter');

            toast.success(`Welcome ${username}!`);

            if (data.role === 'manager') {
                navigate('/');
            } else {
                navigate('/outward');
            }
        } catch (error) {
            toast.error(error.message || 'Invalid credentials');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex overflow-hidden bg-white fixed inset-0 font-sans">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex w-1/2 bg-[#052e16] relative items-center justify-center flex-col overflow-hidden">
                {/* Dynamic Background */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542223189-67a03fa0f0bd?q=80&w=2000')] bg-cover bg-center opacity-10 mix-blend-overlay scale-110 animate-[pulse_8s_infinite]"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-[#064e3b] via-[#052e16] to-[#022c22]"></div>

                {/* Decorative Elements */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-400/10 rounded-full blur-[120px]"></div>

                <div className="relative z-10 flex flex-col items-center text-center p-12 max-w-lg">
                    <div className="w-32 h-32 bg-white/5 backdrop-blur-2xl rounded-[40px] flex items-center justify-center border border-white/10 mb-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] group hover:scale-105 transition-transform duration-500">
                        <StoreLogo className="w-20 h-20 drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]" />
                    </div>

                    <h1 className="text-6xl font-bold text-white leading-none tracking-tight mb-6 italic">
                        Vegetable <span className="text-green-400 font-semibold not-italic block mt-2 text-4xl italic">Shop</span>
                    </h1>

                    <div className="h-1 w-24 bg-gradient-to-r from-transparent via-green-500 to-transparent mb-8"></div>

                    <p className="text-green-100/60 text-lg font-medium leading-relaxed">
                        Experience the next generation of <br />
                        <span className="text-white font-semibold">Vegetable Shop Management</span>
                    </p>
                </div>

                {/* Bottom Footer Info */}
                <div className="absolute bottom-10 left-12 right-12 flex justify-between items-center text-green-100/30 text-[10px] font-bold uppercase tracking-[0.2em]">
                    <span>Premium Edition 2026</span>
                    <div className="h-px flex-1 mx-8 bg-white/5"></div>
                    <span>All Rights Reserved</span>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative bg-white overflow-hidden">
                {/* Subtle Background Pattern */}
                <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-green-50/50 to-transparent"></div>

                <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-4 duration-1000 relative z-10">
                    {/* Mobile Header - More Compact */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="w-16 h-16 bg-green-600 rounded-2xl mx-auto flex items-center justify-center shadow-xl mb-4 border-2 border-white">
                            <StoreLogo className="w-10 h-10" />
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 leading-none italic tracking-tighter">
                            Vegetable <span className="text-green-600 not-italic block text-2xl mt-1">Shop</span>
                        </h1>
                    </div>

                    <div className="bg-white p-8 sm:p-10 rounded-[30px] shadow-[0_20px_60px_rgb(0,0,0,0.06)] border border-gray-100/50">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 tracking-tight leading-tight">Welcome <br /><span className="text-green-600 underline decoration-green-500/20 underline-offset-4">back.</span></h2>
                            <p className="text-gray-400 font-medium mt-2 text-sm">Secure access terminal</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 ml-1">Username</label>
                                <div className="relative group/input">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within/input:text-green-600 transition-colors z-10">
                                        <User strokeWidth={2} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Enter username"
                                        className="w-full pl-12 pr-6 py-3.5 bg-gray-50/50 border border-transparent rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-green-500/20 focus:ring-8 focus:ring-green-500/5 transition-all font-medium text-sm shadow-inner"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 ml-1">Password</label>
                                <div className="relative group/input">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within/input:text-green-600 transition-colors z-10">
                                        <Lock strokeWidth={2} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        placeholder="Enter password"
                                        className="w-full pl-12 pr-12 py-3.5 bg-gray-50/50 border border-transparent rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-green-500/20 focus:ring-8 focus:ring-green-500/5 transition-all font-medium text-sm shadow-inner"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-200 hover:text-green-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-600/10 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-[13px] disabled:opacity-70 group"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <span>Login</span>
                                        <LogIn className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Quick Login Section - More Integrated */}
                        <div className="mt-8 pt-8 border-t border-gray-50">
                            {/* <div className="flex items-center gap-4 mb-6">
                                <div className="h-px flex-1 bg-gray-50"></div>
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Master Terminals</p>
                                <div className="h-px flex-1 bg-gray-50"></div>
                            </div> */}
                            {/* <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => { setUsername('Manager'); setPassword('Manager@1234'); }}
                                    className="p-3.5 bg-gray-50/50 rounded-xl border border-transparent hover:border-green-500/20 hover:bg-green-50/30 transition-all active:scale-95 group/btn flex items-center gap-3"
                                >
                                    <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center text-green-600 group-hover/btn:bg-green-600 group-hover/btn:text-white transition-colors">
                                        <ShieldCheck size={16} strokeWidth={2} />
                                    </div>
                                    <span className="text-[11px] font-semibold text-gray-900">Admin</span>
                                </button>
                                <button
                                    onClick={() => { setUsername('Employee'); setPassword('Passwords@1234'); }}
                                    className="p-3.5 bg-gray-50/50 rounded-xl border border-transparent hover:border-blue-500/20 hover:bg-blue-50/30 transition-all active:scale-95 group/btn flex items-center gap-3"
                                >
                                    <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center text-blue-600 group-hover/btn:bg-blue-600 group-hover/btn:text-white transition-colors">
                                        <User size={16} strokeWidth={2} />
                                    </div>
                                    <span className="text-[11px] font-semibold text-gray-900">Counter</span>
                                </button>
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
