import React from 'react';
import { HelpCircle, Book, MessageSquare, Phone, ShieldCheck, Zap, Laptop, FileText } from 'lucide-react';

const Help = () => {
    return (
        <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700 text-left pb-10 font-sans">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <h2 className="text-5xl font-bold text-gray-900 leading-none">Get <span className="text-green-600">Help</span></h2>
                    <p className="text-gray-500 font-semibold uppercase tracking-wider text-[10px] mt-3">Guides & support</p>
                </div>
                <button className="px-10 py-5 bg-green-600 text-white font-bold uppercase tracking-wider rounded-3xl shadow-xl shadow-green-600/30 hover:-translate-y-1 transition-all text-xs">
                    Contact Support
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { title: 'Buying Stock', desc: 'Learn how to add purchase entries and pay suppliers.', icon: Zap },
                    { title: 'Sales & Billing', desc: 'How to create bills for customers and set today\'s prices.', icon: Book },
                    { title: 'Full Stock', desc: 'View current stock levels and track items in your shop.', icon: ShieldCheck },
                ].map((item, i) => (
                    <div key={i} className="bg-white p-10 rounded-[50px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all group hover:-translate-y-2">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-8 border border-gray-100 group-hover:scale-110 group-hover:bg-green-600 group-hover:text-white transition-all shadow-sm">
                            <item.icon className="w-8 h-8 text-green-600 group-hover:text-white transition-colors" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4 uppercase group-hover:text-green-600 transition-colors uppercase tracking-tight">{item.title}</h3>
                        <p className="text-gray-400 text-xs font-semibold leading-relaxed uppercase tracking-wider">{item.desc}</p>
                    </div>
                ))}
            </div>

            <div className="bg-gray-900 rounded-[60px] p-16 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-green-500/10 rounded-full -mr-40 -mt-40 blur-[100px]"></div>
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center text-left">
                    <div className="space-y-8">
                        <h3 className="text-3xl font-bold text-white uppercase whitespace-nowrap">Frequently Asked</h3>
                        <div className="space-y-4">
                            {[
                                'How to pay suppliers',
                                'How to export daily reports',
                                'Changing shop location details',
                                'Setting up stock alerts',
                            ].map((q, i) => (
                                <div key={i} className="p-5 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-green-600 hover:border-green-500 transition-all opacity-80 hover:opacity-100">
                                    <span className="text-white font-bold text-[11px] uppercase tracking-wider">{q}</span>
                                    <MessageSquare className="w-4 h-4 text-green-500 group-hover:text-white transition-colors" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white p-12 rounded-[50px] space-y-8 text-center border-b-8 border-b-green-600/20">
                        <div className="w-24 h-24 bg-green-50 rounded-[32px] flex items-center justify-center mx-auto text-5xl shadow-inner border border-green-100/50">
                            📞
                        </div>
                        <div>
                            <h4 className="text-2xl font-bold text-gray-900 uppercase mb-2 leading-none">Need Help?</h4>
                            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Our team is available to help you anytime</p>
                        </div>
                        <div className="pt-4 p-6 bg-gray-50 rounded-[32px] border border-gray-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Phone Support</p>
                            <p className="text-3xl font-bold text-green-600">+91 9865694241</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Help;
