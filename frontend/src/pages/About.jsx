import React from 'react';
import { Package, ShieldCheck, Mail, MapPin, Globe, ExternalLink, Code } from 'lucide-react';

const About = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700 text-left font-sans">
            <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-green-600 rounded-[32px] mx-auto flex items-center justify-center shadow-2xl shadow-green-600/30 rotate-3 border-4 border-white transition-transform hover:rotate-0">
                    <ShieldCheck className="w-12 h-12 text-white" />
                </div>
                <div>
                    <h2 className="text-5xl font-bold text-gray-900 leading-none">Vegetable <span className="text-green-600">Shop</span></h2>
                    <p className="text-gray-400 font-semibold uppercase tracking-wider text-[10px] mt-3">Shop Management System</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-12 rounded-[50px] border border-gray-100 shadow-sm space-y-8">
                    <h3 className="font-bold text-gray-900 uppercase tracking-wider flex items-center gap-3">
                        <Code className="w-6 h-6 text-green-600" />
                        System Details
                    </h3>
                    <ul className="space-y-8">
                        <li className="flex justify-between border-b border-gray-50 pb-5">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Built With</span>
                            <span className="font-bold text-gray-900 uppercase text-xs">React + Tailwind</span>
                        </li>
                        <li className="flex justify-between border-b border-gray-50 pb-5">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Database</span>
                            <span className="font-bold text-gray-900 uppercase text-xs">Secure Storage</span>
                        </li>
                        <li className="flex justify-between">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Built By</span>
                            <span className="font-bold text-green-600 uppercase text-xs">seenivasan k</span>
                        </li>
                    </ul>
                </div>

                <div className="bg-gray-900 p-12 rounded-[50px] shadow-2xl space-y-10 text-left relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-600/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                    <h3 className="font-bold text-white uppercase tracking-wider flex items-center gap-3 relative z-10">
                        <Mail className="w-6 h-6 text-green-400" />
                        Contact Us
                    </h3>

                    <div className="space-y-8 relative z-10">
                        <div className="flex items-center gap-5 group/item cursor-pointer">
                            <div className="w-14 h-14 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center group-hover/item:bg-green-600 group-hover/item:text-white transition-all shadow-sm">
                                <Mail className="w-6 h-6 text-green-400 group-hover/item:text-white transition-colors" />
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-gray-600 uppercase tracking-wider mb-1">Email Support</p>
                                <p className="font-bold text-white text-sm tracking-wider uppercase">info@nexaglowtech.in</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-5 group/item cursor-pointer">
                            <div className="w-14 h-14 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center group-hover/item:bg-green-600 group-hover/item:text-white transition-all shadow-sm">
                                <MapPin className="w-6 h-6 text-green-400 group-hover/item:text-white transition-colors" />
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-gray-600 uppercase tracking-wider mb-1">Location</p>
                                <p className="font-bold text-white text-sm tracking-wider uppercase">Chennai, Tamil Nadu</p>
                            </div>
                        </div>

                        <div className="pt-6">
                            <a href="https://nexaglowtech.in/" target="_blank" rel="noopener noreferrer" className="w-full py-5 bg-green-600 hover:bg-green-700 text-white font-bold uppercase tracking-wider rounded-3xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-green-600/10">
                                <Globe className="w-5 h-5" />
                                Visit Website
                                <ExternalLink className="w-4 h-4 opacity-50" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center pt-10">
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                    © 2026 VEGETABLE SHOP. ALL RIGHTS RESERVED.
                </p>
            </div>
        </div>
    );
};

export default About;
