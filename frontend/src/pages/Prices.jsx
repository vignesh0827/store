import React, { useState, useEffect } from 'react';
import { Tag, Search, Save, RotateCcw, TrendingUp, TrendingDown, Filter, CheckCircle } from 'lucide-react';
import { apiSvc } from '../services/api';
import toast from 'react-hot-toast';

const Prices = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');

    const [vegetables, setVegetables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories] = useState([
        { id: 'all', names: { en: 'All Items' } },
        { id: 'Vegetables', names: { en: 'Vegetables' } },
        { id: 'Greens', names: { en: 'Greens' } },
        { id: 'Fruits', names: { en: 'Fruits' } }
    ]);

    const [rates, setRates] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await apiSvc.get('/vegetables/');
                setVegetables(data);

                // Initialize rates from data
                const initialRates = data.reduce((acc, v) => ({
                    ...acc,
                    [v.id]: {
                        selling: Math.round(v.price * 1.25), // 25% margin default
                        market: v.price
                    }
                }), {});
                setRates(initialRates);
            } catch (error) {
                toast.error("Failed to load products");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredVegetables = vegetables.filter(v => {
        const nameEn = v.name_en || '';
        const nameTa = v.name_ta || '';
        const matchesSearch = nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
            nameTa.includes(searchTerm);
        const matchesCategory = activeCategory === 'all' || v.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const handleRateChange = (id, type, val) => {
        setRates(prev => ({
            ...prev,
            [id]: { ...prev[id], [type]: Number(val) }
        }));
    };

    const handleSaveAll = () => {
        toast.success("Prices updated successfully!", {
            style: { borderRadius: '16px', background: '#0F172A', color: '#fff', border: '1px solid #10B981' }
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 text-left pb-10 font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <h2 className="text-5xl font-bold text-gray-900 leading-none">Today's <span className="text-green-600">Prices</span></h2>
                    <p className="text-gray-400 text-[10px] mt-3 uppercase font-semibold tracking-wider">Set today's selling rates</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => window.location.reload()} className="flex items-center justify-center w-14 h-14 bg-white border border-gray-100 text-gray-400 hover:text-green-600 rounded-2xl transition-all shadow-sm active:scale-95">
                        <RotateCcw className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleSaveAll}
                        className="flex items-center justify-center gap-3 px-8 py-4 bg-green-600 text-white rounded-2xl text-[11px] font-bold uppercase tracking-wider hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 active:scale-95"
                    >
                        <Save className="w-5 h-5" />
                        Update Prices
                    </button>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-4">
                <div className="relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search vegetable (e.g. Potato / தக்காளி)..."
                        className="w-full bg-gray-50 border border-gray-100 py-4 pl-16 pr-6 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:bg-white transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <button
                        onClick={() => setActiveCategory('all')}
                        className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeCategory === 'all' ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                    >
                        All Items
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeCategory === cat.id ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                        >
                            {cat.names.en}
                        </button>
                    ))}
                </div>
            </div>

            {/* Rates Table */}
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden overflow-x-auto text-left">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Vegetable</th>
                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Bought Price (₹/kg)</th>
                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Sell Price (₹/kg)</th>
                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Profit</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredVegetables.map((v) => {
                            const vegetableRate = rates[v.id] || { selling: 0, market: 0 };
                            const margin = vegetableRate.selling - vegetableRate.market;
                            const marginPct = vegetableRate.market !== 0
                                ? (margin / vegetableRate.market * 100).toFixed(1)
                                : '0.0';

                            return (
                                <tr key={v.id} className="group hover:bg-gray-50/50 transition-all text-left">
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-4 text-left">
                                            <div className="w-12 h-12 rounded-xl border border-gray-100 overflow-hidden shadow-inner">
                                                <img src={v.image} className="w-full h-full object-cover" alt={v.name_en} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm uppercase leading-none mb-1 group-hover:text-green-600 transition-colors">
                                                    {v.name_en}
                                                </p>
                                                <p className="text-[10px] font-semibold text-gray-400 leading-none uppercase tracking-wider">
                                                    {v.name_ta}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <div className="flex justify-center">
                                            <div className="relative w-32">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 font-bold text-xs">₹</span>
                                                <input
                                                    type="number"
                                                    className="w-full bg-gray-50 border border-gray-100 py-3 pl-8 pr-4 rounded-xl text-center font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
                                                    value={vegetableRate.market}
                                                    onChange={(e) => handleRateChange(v.id, 'market', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <div className="flex justify-center">
                                            <div className="relative w-32">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500 font-bold text-xs">₹</span>
                                                <input
                                                    type="number"
                                                    className="w-full bg-white border-2 border-green-100 py-3 pl-8 pr-4 rounded-xl text-center font-bold text-gray-900 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all shadow-sm"
                                                    value={vegetableRate.selling}
                                                    onChange={(e) => handleRateChange(v.id, 'selling', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <div className="flex flex-col items-center">
                                            <div className={`flex items-center gap-1.5 font-bold ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {margin >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                                ₹{margin.toFixed(2)}
                                            </div>
                                            <span className={`text-[9px] font-bold uppercase tracking-wider mt-1 ${margin >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {marginPct}% Profit
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filteredVegetables.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center text-gray-400 font-medium">
                        <Tag className="w-12 h-12 mb-4 opacity-20" />
                        <p>No products found matching your search...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Prices;
