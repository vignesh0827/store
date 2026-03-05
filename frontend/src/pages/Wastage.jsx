import React, { useState, useEffect } from 'react';
import { apiSvc } from '../services/api';
import {
    PackageX,
    Plus,
    RefreshCw,
    Trash2,
    Calendar,
    Scale,
    AlertTriangle,
    User,
    Search,
    Package,
    ChevronDown,
    History
} from 'lucide-react';
import toast from 'react-hot-toast';

const Wastage = () => {
    const [wastages, setWastages] = useState([]);
    const [vegetables, setVegetables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Filter & Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [categories] = useState([
        { id: 'all', names: { en: 'All' } },
        { id: 'Greens', names: { en: 'Greens' } },
        { id: 'Root Vegetables', names: { en: 'Root' } },
        { id: 'Bulb Vegetables', names: { en: 'Bulb' } },
        { id: 'Common Vegetables', names: { en: 'Common' } },
        { id: 'Gourds', names: { en: 'Gourds' } },
        { id: 'Others', names: { en: 'Others' } },
        { id: 'Fruits', names: { en: 'Fruits' } }
    ]);

    // Form state
    const [selectedVeg, setSelectedVeg] = useState(null);
    const [quantity, setQuantity] = useState('');
    const [reason, setReason] = useState('Spoiled');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [wastageData, vegData] = await Promise.all([
                apiSvc.getWastages(),
                apiSvc.get('/vegetables/')
            ]);
            setWastages(wastageData);
            setVegetables(vegData);
        } catch (error) {
            console.error("Error fetching data", error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const filteredVegetables = vegetables.filter(v => {
        const searchLower = searchTerm.toLowerCase();
        const nameEn = v.name_en || '';
        const nameTa = v.name_ta || '';
        const matchesSearch = nameEn.toLowerCase().includes(searchLower) || nameTa.includes(searchTerm);
        const matchesCategory = activeCategory === 'all' || v.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!selectedVeg || !quantity || !reason) {
            toast.error("Please fill all fields");
            return;
        }

        if (Number(quantity) > selectedVeg.stock) {
            toast.error(`Cannot waste more than available stock (${selectedVeg.stock} KG)`);
            return;
        }

        setSubmitting(true);
        try {
            const record = {
                veg_id: selectedVeg.id,
                name: selectedVeg.name_en,
                quantity: Number(quantity),
                reason: reason,
                date: new Date().toISOString(),
                added_by: "Manager"
            };

            await apiSvc.addWastage(record);
            toast.success("Wastage recorded successfully");

            // Reset form
            setSelectedVeg(null);
            setQuantity('');
            setReason('Spoiled');

            // Refresh data
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Failed to add record");
        } finally {
            setSubmitting(false);
        }
    };

    const getReasonColor = (reason) => {
        switch (reason) {
            case 'Spoiled': return 'bg-red-100 text-red-800';
            case 'Damaged': return 'bg-orange-100 text-orange-800';
            case 'Dried': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-4 animate-in fade-in duration-500 font-sans text-left pb-10">
            {/* COMPACT TOP HEADER */}
            <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-red-100 p-2 rounded-xl">
                        <PackageX className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 leading-none">Wastage Tracking</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Record and Monitor Stock Loss</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchData}
                        className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                        <RefreshCw className={`w-3 h-3 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Refresh Data</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* 1. SELECTION GRID */}
                <div className="lg:col-span-12 xl:col-span-7">
                    <div className="bg-white rounded-[32px] border border-gray-100 p-6 shadow-sm h-[calc(100vh-140px)] flex flex-col">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-red-500 transition-all" />
                                <input
                                    type="text"
                                    placeholder="Search vegetables..."
                                    className="w-full bg-gray-50 border border-gray-100 py-3 pl-12 pr-4 rounded-2xl text-xs focus:outline-none focus:ring-4 focus:ring-red-500/5 transition-all font-medium"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex gap-1 mb-6 overflow-x-auto pb-2 scrollbar-hide flex-shrink-0">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`px-4 py-2 rounded-xl text-[9px] font-bold uppercase transition-all whitespace-nowrap ${activeCategory === cat.id ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                >
                                    {cat.names.en}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 overflow-y-auto pr-2 custom-scrollbar flex-1 content-start pb-4">
                            {filteredVegetables.map((veg) => (
                                <div
                                    key={veg.id}
                                    onClick={() => setSelectedVeg(veg)}
                                    className={`group cursor-pointer rounded-2xl border p-3 transition-all flex flex-col items-center gap-2 h-fit ${selectedVeg?.id === veg.id
                                        ? 'bg-red-50 border-red-200 shadow-md transform scale-[1.02]'
                                        : 'bg-white border-gray-50 hover:border-red-100 hover:bg-gray-50/30'}`}
                                >
                                    <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shadow-inner flex items-center justify-center relative">
                                        {!veg.image ? (
                                            <div className="flex flex-col items-center gap-1">
                                                <Package className="w-8 h-8 text-gray-200/50" />
                                                <span className="text-[6px] text-gray-300 font-bold uppercase tracking-widest">No Image</span>
                                            </div>
                                        ) : (
                                            <>
                                                <img
                                                    src={veg.image}
                                                    alt={veg.name_en}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                                />
                                                <div className="hidden absolute inset-0 items-center justify-center bg-gray-50 flex-col gap-1">
                                                    <Package className="w-8 h-8 text-gray-200/50" />
                                                    <span className="text-[6px] text-gray-300 font-bold uppercase tracking-widest">No Image</span>
                                                </div>
                                            </>
                                        )}
                                        {veg.stock <= 5 && (
                                            <div className="absolute top-1 right-1 bg-amber-500 text-white p-1 rounded-lg">
                                                <AlertTriangle size={10} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="w-full text-center">
                                        <h3 className={`font-bold text-[9px] uppercase leading-tight tracking-wide line-clamp-1 ${selectedVeg?.id === veg.id ? 'text-red-700' : 'text-gray-600'}`}>
                                            {veg.name_en}
                                        </h3>
                                        <p className="text-[8px] font-bold text-gray-400 mt-0.5">{veg.stock} KG</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 2. RIGHT PANEL: ENTRY FORM & HISTORY */}
                <div className="lg:col-span-12 xl:col-span-5 flex flex-col gap-4">
                    {/* ENTRY FORM */}
                    <div className="bg-white rounded-[32px] border border-gray-100 p-6 shadow-sm flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                            <Plus className="w-5 h-5 text-red-500" />
                            <h2 className="text-xl font-bold text-gray-900">New Wastage Entry</h2>
                        </div>

                        {selectedVeg ? (
                            <div className="flex items-center gap-4 animate-in slide-in-from-left duration-300">
                                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0 flex items-center justify-center">
                                    {!selectedVeg.image ? (
                                        <Package className="w-8 h-8 text-gray-200" />
                                    ) : (
                                        <img src={selectedVeg.image} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-baseline justify-between">
                                        <h3 className="font-bold text-gray-900 uppercase text-lg leading-tight tracking-tight">{selectedVeg.name_en}</h3>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selectedVeg.stock > 10 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                            Stock: {selectedVeg.stock} KG
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 font-medium">{selectedVeg.name_ta}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 rounded-2xl p-6 border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 gap-2">
                                <Package className="w-8 h-8 opacity-20" />
                                <p className="text-[10px] font-bold uppercase tracking-widest">Select an item from the grid</p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">WASTAGE QUANTITY (KG)</label>
                                <div className="relative group">
                                    <Scale className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-red-500 transition-all" />
                                    <input
                                        type="number" step="0.1" placeholder="0.0"
                                        className="w-full bg-gray-50 border border-gray-100 py-4 pl-12 pr-4 rounded-2xl text-xl font-bold text-gray-600 focus:outline-none focus:ring-4 focus:ring-red-500/5 transition-all font-mono"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">SELECT REASON</label>
                                <div className="relative group">
                                    <AlertTriangle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-red-500 transition-all" />
                                    <select
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 py-4 pl-12 pr-4 rounded-2xl text-xs font-bold text-gray-600 focus:outline-none focus:ring-4 focus:ring-red-500/5 transition-all appearance-none cursor-pointer uppercase tracking-wider"
                                    >
                                        <option value="Spoiled">Spoiled / Rotten (அழுகியது)</option>
                                        <option value="Damaged">Damaged (சேதமானது)</option>
                                        <option value="Dried">Dried / Unsellable (காய்ந்தது)</option>
                                        <option value="Other">Other Reason</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={submitting || !selectedVeg}
                            className={`w-full py-5 rounded-[20px] shadow-lg text-xs font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${submitting || !selectedVeg ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#0f172a] hover:bg-slate-800 text-white active:scale-95'}`}
                        >
                            {submitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                            RECORD LOSS & DEDUCT STOCK
                        </button>
                    </div>

                    {/* RECENT LOG CARD */}
                    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col flex-1 h-[400px]">
                        <div className="p-4 bg-gray-50/80 border-b border-gray-100 flex justify-between items-center px-6">
                            <div className="flex items-center gap-2">
                                <History className="w-4 h-4 text-gray-400" />
                                <span className="font-bold text-[10px] uppercase tracking-wider text-gray-900">Recent Wastage Log</span>
                            </div>
                            <span className="bg-white px-2.5 py-1 rounded-lg border border-gray-200 text-[9px] font-bold text-gray-500">{wastages.length} Records</span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                            {wastages.length === 0 && !loading ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-200 py-10 opacity-30">
                                    <PackageX className="w-10 h-10 mb-2" />
                                    <p className="text-[9px] font-bold uppercase tracking-wider">No Records Yet</p>
                                </div>
                            ) : (
                                wastages.map((record) => (
                                    <div key={record.id} className="p-3 bg-gray-50/30 border border-gray-100 rounded-2xl flex justify-between items-center group hover:bg-white hover:border-red-100 transition-all hover:shadow-sm">
                                        <div className="text-left">
                                            <p className="font-bold text-gray-900 uppercase text-[10px] mb-0.5">{record.name}</p>
                                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                {new Date(record.date).toLocaleDateString()} at {new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="font-bold text-red-600 text-[11px] flex items-center gap-1">
                                                    -{record.quantity} KG
                                                </p>
                                                <span className={`text-[7px] font-bold uppercase px-1.5 py-0.5 rounded-md ${getReasonColor(record.reason)}`}>
                                                    {record.reason}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            {loading && (
                                <div className="flex justify-center py-10">
                                    <RefreshCw className="w-6 h-6 text-red-500 animate-spin" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Wastage;
