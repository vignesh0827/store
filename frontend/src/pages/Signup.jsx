import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, UserPlus, ShieldCheck, Contact2 } from 'lucide-react';
import StoreLogo from '../components/StoreLogo';
import toast from 'react-hot-toast';
import { apiSvc } from '../services/api';

const Signup = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user'); // Default to user
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await apiSvc.signup(username, password, role);
            toast.success('Account created successfully! Please login.');
            navigate('/login');
        } catch (error) {
            toast.error(error.message || 'Signup failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex overflow-hidden bg-white fixed inset-0 font-sans">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex w-1/2 bg-[#052e16] relative items-center justify-center flex-col overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542223189-67a03fa0f0bd?q=80&w=2000')] bg-cover bg-center opacity-10 mix-blend-overlay scale-110 animate-[pulse_8s_infinite]"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-[#064e3b] via-[#052e16] to-[#022c22]"></div>

                <div className="relative z-10 flex flex-col items-center text-center p-12 max-w-lg">
                    <div className="w-32 h-32 bg-white/5 backdrop-blur-2xl rounded-[40px] flex items-center justify-center border border-white/10 mb-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] group hover:scale-105 transition-transform duration-500">
                        <StoreLogo className="w-20 h-20 drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]" />
                    </div>

                    <h1 className="text-6xl font-bold text-white leading-none tracking-tight mb-6 italic">
                        Join Our <span className="text-green-400 font-semibold not-italic block mt-2 text-4xl italic">Network</span>
                    </h1>

                    <div className="h-1 w-24 bg-gradient-to-r from-transparent via-green-500 to-transparent mb-8"></div>

                    <p className="text-green-100/60 text-lg font-medium leading-relaxed">
                        Start managing your <br />
                        <span className="text-white font-semibold">Vegetable Business efficiently</span>
                    </p>
                </div>
            </div>

            {/* Right Panel - Signup Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative bg-white overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-green-50/50 to-transparent"></div>

                <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-4 duration-1000 relative z-10">
                    <div className="bg-white p-8 sm:p-10 rounded-[30px] shadow-[0_20px_60px_rgb(0,0,0,0.06)] border border-gray-100/50">
                        <div className="mb-8 text-center sm:text-left">
                            <h2 className="text-3xl font-bold text-gray-900 tracking-tight leading-tight">Create <br /><span className="text-green-600 underline decoration-green-500/20 underline-offset-4">Account.</span></h2>
                            <p className="text-gray-400 font-medium mt-2 text-sm">Join the VeggieFlow pro network</p>
                        </div>

                        <form onSubmit={handleSignup} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 ml-1">Username</label>
                                <div className="relative group/input">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within/input:text-green-600 transition-colors z-10">
                                        <User strokeWidth={2} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Choose a username"
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
                                        placeholder="Create a password"
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

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 ml-1">Select Role</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setRole('manager')}
                                        className={`p-3.5 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${role === 'manager'
                                                ? 'bg-green-600 border-green-600 text-white shadow-lg shadow-green-600/20'
                                                : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'
                                            }`}
                                    >
                                        <ShieldCheck size={16} />
                                        <span className="text-[11px] font-bold">Manager</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole('user')}
                                        className={`p-3.5 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${role === 'user'
                                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20'
                                                : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'
                                            }`}
                                    >
                                        <Contact2 size={16} />
                                        <span className="text-[11px] font-bold">Staff / User</span>
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-600/10 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-[13px] disabled:opacity-70 group mt-4"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <span>Create Account</span>
                                        <UserPlus className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-gray-500 text-xs font-medium">
                                Already have an account?{' '}
                                <Link to="/login" className="text-green-600 font-bold hover:underline">
                                    Sign In here
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
