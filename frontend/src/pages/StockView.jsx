import React, { useState, useEffect } from 'react';
import { Search, Plus, Download, TrendingUp, X, FileText, Table, File as FileIcon } from 'lucide-react';
import { apiSvc } from '../services/api';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const StockView = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [vegetables, setVegetables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showExportOptions, setShowExportOptions] = useState(false);

    const exportToCSV = () => {
        const headers = ["S.No", "Name (EN)", "Name (TA)", "Category", "Stock (KG)", "Base Price", "Market Price"];
        const rows = filteredVegetables.map((v, i) => [
            i + 1,
            v.name_en,
            v.name_ta,
            v.category,
            v.stock,
            v.price,
            Math.round(v.price * 1.2)
        ]);
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Full_Stock_${new Date().toLocaleDateString()}.csv`);
        link.click();
        setShowExportOptions(false);
        toast.success("CSV Downloaded");
    };

    const exportToExcel = () => {
        const data = filteredVegetables.map((v, i) => ({
            "S.No": i + 1,
            "Name (EN)": v.name_en,
            "Name (TA)": v.name_ta,
            "Category": v.category,
            "Stock (KG)": v.stock,
            "Base Price": v.price,
            "Market Price": Math.round(v.price * 1.2)
        }));
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Stock");
        XLSX.writeFile(workbook, `Full_Stock_${new Date().toLocaleDateString()}.xlsx`);
        setShowExportOptions(false);
        toast.success("Excel Downloaded");
    };

    const exportToPDF = () => {
        try {
            const doc = new jsPDF();
            doc.text("VeggieFlow Pro - Full Stock Report", 14, 15);
            const tableColumn = ["S.No", "Vegetable", "Category", "Qty (KG)", "Base", "Market"];
            const tableRows = filteredVegetables.map((v, i) => [
                i + 1,
                v.name_en,
                v.category,
                v.stock,
                `Rs.${v.price}`,
                `Rs.${Math.round(v.price * 1.2)}`
            ]);

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 25,
                theme: 'striped',
                headStyles: { fillColor: [34, 197, 94] }
            });
            doc.save(`Full_Stock_${new Date().toLocaleDateString()}.pdf`);
            setShowExportOptions(false);
            toast.success("PDF Downloaded");
        } catch (error) {
            console.error("PDF Export failed:", error);
            toast.error("Failed to generate PDF");
        }
    };
    const [formData, setFormData] = useState({
        name_en: '',
        name_ta: '',
        price: '',
        category: 'Vegetables',
        stock: '',
        min_stock: 10,
        image: ''
    });

    const [translating, setTranslating] = useState(false);
    const [uploading, setUploading] = useState(false);
    const translationTimeoutRef = React.useRef(null);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('file', file);

            const data = await apiSvc.post('/upload/image/', fd);
            if (data && data.url) {
                setFormData(prev => ({ ...prev, image: data.url }));
                toast.success("Image uploaded successfully!");
            } else {
                throw new Error("Invalid response format from server");
            }
        } catch (error) {
            console.error("Upload error details:", error);
            toast.error(`Upload failed: ${error.message || "Unknown error"}`);
        } finally {
            setUploading(false);
            // Clear input so same file can be selected again
            e.target.value = '';
        }
    };

    const fetchVegetables = async () => {
        setLoading(true);
        try {
            const data = await apiSvc.get('/vegetables/');
            setVegetables(data);
        } catch (error) {
            toast.error("Failed to load stock data");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVegetables();
    }, []);

    const handleOpenModal = () => {
        setFormData({
            name_en: '',
            name_ta: '',
            price: '',
            category: 'Vegetables',
            stock: '',
            min_stock: 10,
            image: ''
        });
        setIsModalOpen(true);
    };

    const translateText = async (text, from, to) => {
        if (!text || text.length < 2) return null;
        try {
            const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`);
            const data = await res.json();
            return data[0][0][0];
        } catch (error) {
            console.error("Translation error:", error);
            return null;
        }
    };

    const handleEnChange = (val) => {
        setFormData(prev => ({ ...prev, name_en: val }));
        if (translationTimeoutRef.current) clearTimeout(translationTimeoutRef.current);
        translationTimeoutRef.current = setTimeout(async () => {
            if (val.trim()) {
                setTranslating(true);
                const translated = await translateText(val, 'en', 'ta');
                if (translated) setFormData(prev => ({ ...prev, name_ta: translated }));
                setTranslating(false);
            }
        }, 800);
    };

    const handleTaChange = (val) => {
        setFormData(prev => ({ ...prev, name_ta: val }));
        if (translationTimeoutRef.current) clearTimeout(translationTimeoutRef.current);
        translationTimeoutRef.current = setTimeout(async () => {
            if (val.trim()) {
                setTranslating(true);
                const translated = await translateText(val, 'ta', 'en');
                if (translated) setFormData(prev => ({ ...prev, name_en: translated }));
                setTranslating(false);
            }
        }, 800);
    };

    const handleSave = async () => {
        if (!formData.name_en || !formData.name_ta || !formData.price) {
            toast.error("Required fields missing");
            return;
        }

        try {
            await apiSvc.post('/vegetables/', {
                ...formData,
                price: parseFloat(formData.price),
                stock: parseFloat(formData.stock || 0),
                min_stock: parseFloat(formData.min_stock || 10)
            });
            toast.success("New vegetable added to stock");
            fetchVegetables();
            setIsModalOpen(false);
        } catch (error) {
            toast.error("Failed to save vegetable");
        }
    };

    const getStatusColor = (stock) => {
        if (stock > 50) return 'bg-green-100 text-green-700 border-green-200';
        if (stock > 10) return 'bg-amber-100 text-amber-700 border-amber-200';
        return 'bg-red-100 text-red-700 border-red-200';
    };

    const getStatusLabel = (stock) => {
        if (stock > 50) return 'Healthy';
        if (stock > 10) return 'Restock';
        return 'Critical';
    };

    const filteredVegetables = vegetables.filter(v =>
        (v.name_en || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.name_ta || '').includes(searchTerm)
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left pb-10 font-sans max-w-[1600px] mx-auto px-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 leading-none">Full <span className="text-green-600">Stock</span></h2>
                    <p className="text-gray-500 text-sm mt-1 uppercase font-semibold tracking-wider">Stock & prices {loading && '(Loading...)'}</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <button
                            onClick={() => setShowExportOptions(!showExportOptions)}
                            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border border-gray-100 rounded-2xl text-[10px] font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
                        >
                            <Download className="w-5 h-5" />
                            Export
                        </button>

                        {showExportOptions && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                <button onClick={exportToPDF} className="w-full flex items-center gap-3 px-6 py-3 hover:bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-600 transition-colors">
                                    <FileIcon className="w-4 h-4 text-red-500" />
                                    Export as PDF
                                </button>
                                <button onClick={exportToExcel} className="w-full flex items-center gap-3 px-6 py-3 hover:bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-600 transition-colors">
                                    <Table className="w-4 h-4 text-green-600" />
                                    Export as Excel
                                </button>
                                <button onClick={exportToCSV} className="w-full flex items-center gap-3 px-6 py-3 hover:bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-600 transition-colors">
                                    <FileText className="w-4 h-4 text-blue-500" />
                                    Export as CSV
                                </button>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleOpenModal}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-green-600 text-white rounded-2xl text-[10px] font-bold uppercase tracking-wider hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Add New
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Search vegetables (e.g. Potato / உருளைக்கிழங்கு)..."
                    className="w-full bg-white border border-gray-100 py-5 pl-16 pr-6 rounded-[32px] text-sm focus:outline-none focus:ring-8 focus:ring-green-500/5 focus:border-green-500/20 shadow-sm group-hover:shadow-md transition-all font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden overflow-x-auto text-left">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100 h-14">
                            <th className="px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">S.No</th>
                            <th className="px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vegetable</th>
                            <th className="px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Quantity</th>
                            <th className="px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Base Price</th>
                            <th className="px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Market Price</th>
                            <th className="px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Margin</th>
                            <th className="px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-left">
                        {filteredVegetables.map((item, index) => (
                            <tr key={item.id} className="hover:bg-green-50/20 transition-colors group text-left h-20">
                                <td className="px-6 text-left font-bold text-gray-400 text-xs">
                                    {String(index + 1).padStart(2, '0')}
                                </td>
                                <td className="px-6 text-left">
                                    <div className="flex items-center gap-4 text-left">
                                        <div className="relative shrink-0">
                                            <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                                                <img
                                                    src={item.image || 'https://images.unsplash.com/photo-1566385278603-975bb943ee3e?q=80&w=200&h=200&auto=format&fit=crop'}
                                                    alt={item.name_en || ''}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1566385278603-975bb943ee3e?q=80&w=200&h=200&auto=format&fit=crop'; }}
                                                />
                                            </div>
                                        </div>
                                        <div className="min-w-0">
                                            <span className="font-bold text-gray-900 text-sm block uppercase leading-none mb-0.5 group-hover:text-green-600 transition-colors truncate">{item.name_en}</span>
                                            <span className="text-[10px] font-semibold text-gray-400 block leading-none uppercase tracking-wider truncate">{item.name_ta}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6">
                                    <div className="flex items-baseline gap-1">
                                        <span className="font-bold text-gray-900 text-lg">{item.stock}</span>
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">kg</span>
                                    </div>
                                </td>
                                <td className="px-6">
                                    <span className="font-bold text-gray-600 text-sm">₹{item.price}</span>
                                </td>
                                <td className="px-6">
                                    <span className="font-bold text-green-600 text-sm">₹{Math.round(item.price * 1.2)}</span>
                                </td>
                                <td className="px-6 font-bold text-gray-900">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-gray-50 text-green-600 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-all">
                                            <TrendingUp className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-sm">₹{Math.round(item.price * 0.2)}</span>
                                    </div>
                                </td>
                                <td className="px-6 text-right">
                                    <span className={`px-4 py-1.5 rounded-xl border text-[8px] font-bold uppercase tracking-wider ${getStatusColor(item.stock)} shadow-sm inline-block`}>
                                        {getStatusLabel(item.stock)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredVegetables.length === 0 && !loading && (
                    <div className="p-24 text-center">
                        <div className="w-24 h-24 bg-gray-50 rounded-[32px] flex items-center justify-center mx-auto mb-6 border border-gray-100">
                            <Search className="w-12 h-12 text-gray-200" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 uppercase">No Match Found</h3>
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-2">Try refined search keywords</p>
                    </div>
                )}
            </div>

            {/* Add New Vegetable Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="bg-green-600 p-8 text-white flex justify-between items-center">
                            <div>
                                <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-1">Stock Management</p>
                                <h3 className="text-2xl font-bold tracking-tight">Add New Vegetable</h3>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                            {translating && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl animate-pulse">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Translating...</span>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Name (English) <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl font-bold text-gray-900 focus:outline-none focus:border-green-500 transition-all shadow-inner"
                                        placeholder="e.g. Tomato"
                                        value={formData.name_en}
                                        onChange={(e) => handleEnChange(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Name (Tamil) <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl font-bold text-gray-900 focus:outline-none focus:border-green-500 transition-all shadow-inner"
                                        placeholder="எ.கா. தக்காளி"
                                        value={formData.name_ta}
                                        onChange={(e) => handleTaChange(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Base Price (₹/kg) <span className="text-red-500">*</span></label>
                                    <input
                                        type="number"
                                        className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl font-bold text-gray-900 focus:outline-none focus:border-green-500 transition-all shadow-inner"
                                        placeholder="0.00"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Category <span className="text-red-500">*</span></label>
                                    <select
                                        className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl font-bold text-gray-900 focus:outline-none focus:border-green-500 transition-all shadow-inner"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="Greens">Greens</option>
                                        <option value="Root Vegetables">Root Vegetables</option>
                                        <option value="Bulb Vegetables">Bulb Vegetables</option>
                                        <option value="Common Vegetables">Common Vegetables</option>
                                        <option value="Gourds">Gourds</option>
                                        <option value="Others">Others</option>
                                        <option value="Fruits">Fruits</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Initial Stock (kg) <span className="text-red-500">*</span></label>
                                    <input
                                        type="number"
                                        className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl font-bold text-gray-900 focus:outline-none focus:border-green-500 transition-all shadow-inner"
                                        placeholder="0"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Min. Stock Alert (kg)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl font-bold text-gray-900 focus:outline-none focus:border-green-500 transition-all shadow-inner"
                                        placeholder="10"
                                        value={formData.min_stock}
                                        onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-gray-50">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Vegetable Image (Select File or Paste URL)</label>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl font-bold text-gray-900 focus:outline-none focus:border-green-500 transition-all shadow-inner text-[10px]"
                                            placeholder="Paste image link here..."
                                            value={formData.image}
                                            onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                                        />
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            id="imageUpload"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={uploading}
                                        />
                                        <label
                                            htmlFor="imageUpload"
                                            className={`flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-[10px] h-full uppercase tracking-wider cursor-pointer transition-all border ${uploading ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white text-green-600 border-green-600 hover:bg-green-600 hover:text-white shadow-sm'}`}
                                        >
                                            {uploading ? (
                                                <div className="w-4 h-4 border-2 border-gray-300 border-t-green-600 rounded-full animate-spin"></div>
                                            ) : (
                                                <Plus className="w-5 h-5" />
                                            )}
                                            {uploading ? 'Processing' : 'Browse'}
                                        </label>
                                    </div>
                                </div>

                                {formData.image && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1 italic">Image Preview:</p>
                                        <div className="flex items-center gap-4 bg-green-50/50 p-4 rounded-[24px] border border-green-100/30">
                                            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-white shrink-0">
                                                <img
                                                    src={formData.image}
                                                    alt="Vegetable"
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        toast.error("Invalid image link");
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-[10px] font-bold text-green-700 uppercase tracking-tight truncate mb-1">
                                                    {formData.image.startsWith('http') ? 'Linked Image' : 'Uploaded File'}
                                                </p>
                                                <button
                                                    onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                                                    className="text-[10px] font-bold text-red-500 uppercase hover:text-red-700 transition-colors underline"
                                                >
                                                    Remove / Change
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-8 bg-gray-50 border-t border-gray-100">
                            <button
                                onClick={handleSave}
                                className="w-full bg-green-600 text-white py-5 rounded-2xl font-bold uppercase tracking-widest shadow-xl shadow-green-600/20 hover:bg-green-700 transition-all active:scale-95 flex items-center justify-center gap-3"
                            >
                                <Plus className="w-5 h-5" />
                                Save to Stock
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockView;
