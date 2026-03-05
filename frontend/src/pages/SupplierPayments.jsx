import React, { useState, useEffect } from 'react';
import { Phone, ArrowUpRight, Clock, UserCheck, Wallet, Loader2, X } from 'lucide-react';
import { apiSvc } from '../services/api';
import toast from 'react-hot-toast';

const SupplierPayments = () => {
    const [dues, setDues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [payModalOpen, setPayModalOpen] = useState(false);
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [selectedSup, setSelectedSup] = useState(null);
    const [history, setHistory] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [paidSuccessId, setPaidSuccessId] = useState(null);

    const [paymentData, setPaymentData] = useState({
        amount: '',
        payment_mode: 'Cash',
        notes: ''
    });

    const fetchDues = async () => {
        try {
            const data = await apiSvc.get('/suppliers/dues/');
            setDues(data);
        } catch (error) {
            toast.error("Failed to load supplier dues");
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async (sup) => {
        setSelectedSup(sup);
        try {
            const data = await apiSvc.get(`/suppliers/payments/${sup.id}`);
            setHistory(data);
            setHistoryModalOpen(true);
        } catch (error) {
            toast.error("Failed to load payment history");
        }
    };

    const handleOpenPayModal = (sup) => {
        setSelectedSup(sup);
        setPaymentData({ amount: '', payment_mode: 'Cash', notes: '' });
        setPayModalOpen(true);
    };

    const handlePayment = async () => {
        if (!paymentData.amount || paymentData.amount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }
        setSubmitting(true);
        const currentSupId = selectedSup.id;
        try {
            await apiSvc.post('/suppliers/payments/', {
                ...paymentData,
                supplier_id: currentSupId,
                date: new Date().toISOString().split('T')[0]
            });

            setPayModalOpen(false);
            setPaidSuccessId(currentSupId);
            toast.success("Payment recorded successfully");

            setTimeout(() => {
                setPaidSuccessId(null);
            }, 3000);

            fetchDues();
        } catch (error) {
            toast.error("Failed to record payment");
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        fetchDues();
    }, []);

    const totalPending = dues.reduce((sum, d) => sum + d.total_due, 0);

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-gray-400 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-green-600" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Synchronizing Accounts...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700 text-left pb-10 font-sans">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 leading-none">Pay <span className="text-green-600">Suppliers</span></h2>
                    <p className="text-gray-500 text-sm mt-1 uppercase font-semibold tracking-wider">Farmer payment history</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pending Due</p>
                    <h3 className="text-4xl font-bold text-red-600 mt-2 group-hover:scale-105 transition-transform origin-left">₹{totalPending.toLocaleString()}</h3>
                </div>
                <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden group cursor-pointer" onClick={() => toast.info("Check individual history for details")}>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Transaction Status</p>
                    <h3 className="text-4xl font-bold text-green-600 mt-2 group-hover:scale-105 transition-transform origin-left">Active</h3>
                </div>
            </div>

            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden overflow-x-auto text-left">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Supplier</th>
                            <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Contact</th>
                            <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Balance Due</th>
                            <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Last Inward</th>
                            <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {dues.map((sup, idx) => (
                            <tr key={idx} className="hover:bg-green-50/20 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="font-bold text-gray-900 text-lg uppercase leading-none group-hover:text-green-600 transition-colors">{sup.name}</div>
                                    <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-1">Vendor</div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-3 text-gray-900 font-bold tracking-wider text-[11px]">
                                        <Phone className="w-4 h-4 text-green-600" />
                                        {sup.contact}
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <span className={`font-bold text-xl ${sup.total_due > 0 ? 'text-red-500' : 'text-green-600'}`}>
                                        ₹{sup.total_due.toLocaleString()}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <div className="flex items-center justify-center gap-2 text-gray-500 text-xs font-semibold">
                                        <Clock className="w-4 h-4 text-gray-300" />
                                        {sup.last_payment}
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex justify-end items-center gap-2">
                                        {paidSuccessId === sup.id ? (
                                            <div className="flex items-center gap-2 bg-green-100 text-green-700 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest animate-in zoom-in-50 duration-300">
                                                <UserCheck className="w-4 h-4" />
                                                Paid Successfully!
                                            </div>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => fetchHistory(sup)}
                                                    className="px-4 py-2 text-gray-400 hover:text-blue-600 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
                                                >
                                                    <Clock className="w-3.5 h-3.5" /> History
                                                </button>
                                                {sup.total_due <= 0 ? (
                                                    <div className="flex items-center gap-2 bg-gray-100 text-gray-400 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest select-none">
                                                        <UserCheck className="w-4 h-4" />
                                                        Cleared
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleOpenPayModal(sup)}
                                                        className="px-6 py-2.5 bg-green-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-600/10 active:scale-95 flex items-center gap-2"
                                                    >
                                                        <Wallet className="w-3.5 h-3.5" />
                                                        Pay Now
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* PAYMENT MODAL */}
            {payModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="bg-gray-900 p-8 text-white relative">
                            <button onClick={() => setPayModalOpen(false)} className="absolute top-8 right-8 text-white/40 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                            <p className="text-green-500 text-[10px] font-black uppercase tracking-widest mb-2">Record Payment</p>
                            <h3 className="text-3xl font-black tracking-tight">{selectedSup?.name}</h3>
                        </div>
                        <div className="p-10 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase">Amount (₹)</label>
                                <input
                                    type="number"
                                    className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl font-bold text-gray-900 text-xl focus:outline-none focus:border-green-500 transition-all"
                                    placeholder="0.00"
                                    value={paymentData.amount}
                                    onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase">Payment Mode</label>
                                <div className="flex gap-2">
                                    {['Cash', 'Online'].map(mode => (
                                        <button
                                            key={mode}
                                            onClick={() => setPaymentData({ ...paymentData, payment_mode: mode })}
                                            className={`flex-1 py-3 rounded-xl border font-bold text-xs transition-all ${paymentData.payment_mode === mode ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'}`}
                                        >
                                            {mode}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase">Notes (Optional)</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 border border-gray-100 px-6 py-3 rounded-2xl font-bold text-gray-900 focus:outline-none focus:border-green-500 transition-all"
                                    placeholder="Reference/Remarks"
                                    value={paymentData.notes}
                                    onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                                />
                            </div>
                            <button
                                onClick={handlePayment}
                                disabled={submitting}
                                className="w-full bg-green-600 text-white py-5 rounded-[24px] font-black uppercase tracking-widest shadow-xl shadow-green-600/20 hover:bg-green-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wallet className="w-5 h-5" />}
                                Confirm Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* HISTORY MODAL */}
            {historyModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="bg-gray-900 p-8 text-white relative flex justify-between items-center">
                            <div>
                                <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-1">Transaction Log</p>
                                <h3 className="text-3xl font-black tracking-tight">{selectedSup?.name}</h3>
                            </div>
                            <button onClick={() => setHistoryModalOpen(false)} className="text-white/40 hover:text-white">
                                <X className="w-8 h-8" />
                            </button>
                        </div>
                        <div className="p-8 max-h-[500px] overflow-y-auto custom-scrollbar">
                            {history.length === 0 ? (
                                <div className="py-20 text-center text-gray-300 italic uppercase text-[10px] font-bold tracking-widest">No standalone payments found</div>
                            ) : (
                                <div className="space-y-3">
                                    {history.map((log, i) => (
                                        <div key={i} className="p-5 bg-gray-50 border border-gray-100 rounded-3xl flex justify-between items-center hover:bg-white transition-all cursor-default">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white rounded-2xl border border-gray-100 flex items-center justify-center shadow-sm">
                                                    <ArrowUpRight className="w-6 h-6 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-900">{log.date}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{log.payment_mode} • {log.notes || 'No remarks'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-bold text-gray-950">₹{log.amount.toLocaleString()}</p>
                                                <p className="text-[9px] font-black text-green-600 uppercase">Confirmed</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupplierPayments;
