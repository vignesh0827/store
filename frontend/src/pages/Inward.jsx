import React, { useState, useEffect } from 'react';
import {
    Plus,
    X,
    Search,
    User,
    Package,
    Calendar,
    Tag,
    Receipt,
    Trash2,
    AlertTriangle,
    IndianRupee,
    Wallet,
    Scale,
    ChevronDown,
    Printer,
    ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiSvc } from '../services/api';
import { serialSvc } from '../services/serial';

const Inward = () => {
    const [vegetables, setVegetables] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories] = useState([
        { id: 'all', names: { en: 'All' } },
        { id: 'Vegetables', names: { en: 'Vegetables' } },
        { id: 'Greens', names: { en: 'Greens' } },
        { id: 'Fruits', names: { en: 'Fruits' } }
    ]);
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Math.floor(Math.random() * 9000 + 1000)}`);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedVeg, setSelectedVeg] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [lowStockItems, setLowStockItems] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [vData, sData, lData] = await Promise.all([
                    apiSvc.get('/vegetables/'),
                    apiSvc.get('/suppliers/'),
                    apiSvc.get('/vegetables/low-stock/')
                ]);
                setVegetables(vData);
                setSuppliers(sData);
                setLowStockItems(lData);
                if (vData.length > 0) setSelectedVeg(vData[0]);
            } catch (error) {
                toast.error("Failed to load data from server");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Entry Form State
    const [quantity, setQuantity] = useState('');
    const [purchasePrice, setPurchasePrice] = useState('');
    const [sellingPrice, setSellingPrice] = useState('');

    // Items List (Cart)
    const [cartItems, setCartItems] = useState([]);

    // Payment State
    const [amountPaid, setAmountPaid] = useState('');
    const [paymentMode, setPaymentMode] = useState('cash');

    // Weight Machine State
    const [isWeighing, setIsWeighing] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    const filteredVegetables = vegetables.filter(v => {
        const searchLower = searchTerm.toLowerCase();
        const nameEn = v.name_en || '';
        const nameTa = v.name_ta || '';
        const matchesSearch = nameEn.toLowerCase().includes(searchLower) || nameTa.includes(searchTerm);
        const matchesCategory = activeCategory === 'all' || v.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    // Calculations for the current entry (Commercial Rounding)
    const entryTotal = Math.round((Number(quantity) || 0) * (Number(purchasePrice) || 0));
    const profitPerKg = (Number(sellingPrice) || 0) - (Number(purchasePrice) || 0);
    const expectedProfit = Math.round(profitPerKg * (Number(quantity) || 0));

    // Cart Calculations
    const totalPurchaseAmount = Math.round(cartItems.reduce((sum, item) => sum + item.total, 0));
    const pendingAmount = Math.round(totalPurchaseAmount - (Number(amountPaid) || 0));

    const handleConnectScale = async () => {
        try {
            await serialSvc.connect();
            setIsConnected(true);
            toast.success("Scale Connected!");

            serialSvc.onDataReceived = (data) => {
                const weight = serialSvc.parseWeight(data);
                if (weight !== null) {
                    setQuantity(weight.toFixed(3));
                }
            };
        } catch (error) {
            toast.error("Failed to connect to scale");
        }
    };

    const handleWeightMachine = () => {
        if (!isConnected) {
            handleConnectScale();
            return;
        }
        setIsWeighing(true);
        toast.loading("Reading Scale...", { id: 'scale' });
        // The serialSvc.onDataReceived will update quantity automatically when data arrives
        setTimeout(() => {
            setIsWeighing(false);
            toast.dismiss('scale');
        }, 1000);
    };

    const addItemToCart = () => {
        if (!selectedVeg) {
            toast.error("Select a vegetable first");
            return;
        }
        if (!quantity || !purchasePrice || !sellingPrice) {
            toast.error("Fill all details");
            return;
        }

        const newItem = {
            id: Date.now(),
            vegId: selectedVeg.id,
            name: selectedVeg.name_en,
            tamilName: selectedVeg.name_ta,
            quantity: Number(quantity),
            purchasePrice: Number(purchasePrice),
            sellingPrice: Number(sellingPrice),
            total: entryTotal,
            profit: expectedProfit
        };

        setCartItems([...cartItems, newItem]);
        setQuantity('');
        setPurchasePrice('');
        setSellingPrice('');
        toast.success(`Added ${selectedVeg.name_en}`);
    };

    const removeItem = (id) => {
        setCartItems(cartItems.filter(item => item.id !== id));
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        if (!selectedSupplier) { toast.error("Select supplier"); return; }
        if (cartItems.length === 0) { toast.error("Add items first"); return; }

        const inwardData = {
            invoice_number: invoiceNumber,
            supplier_name: selectedSupplier,
            date: date,
            total_amount: totalPurchaseAmount,
            amount_paid: Number(amountPaid) || 0,
            payment_mode: paymentMode,
            items: cartItems.map(item => ({
                veg_id: item.id,
                name: item.name,
                quantity: item.quantity,
                purchase_price: item.purchasePrice,
                selling_price: item.sellingPrice,
                total: item.total
            }))
        };

        try {
            await apiSvc.post('/inward/', inwardData);
            toast.success(`Entry Saved: ${invoiceNumber}`);
            setCartItems([]);
            setAmountPaid('');
            setSelectedSupplier('');
            setInvoiceNumber(`INV-${Math.floor(Math.random() * 9000 + 1000)}`);

            // Refresh vegetable list to show updated stock
            const vData = await apiSvc.get('/vegetables/');
            setVegetables(vData);
        } catch (error) {
            toast.error("Failed to save entry");
            console.error(error);
        }
    };

    const handlePrint = () => {
        if (cartItems.length === 0) return;
        const printContent = document.getElementById('thermal-inward-bill');
        const WinPrint = window.open('', '', 'width=400,height=600');
        WinPrint.document.write('<html><body>' + printContent.innerHTML + '</body></html>');
        WinPrint.document.close();
        WinPrint.print();
        WinPrint.close();
        handleSave();
    };

    return (
        <>
            <div className="max-w-[1600px] mx-auto space-y-4 animate-in fade-in duration-500 font-sans text-left pb-10">
                {/* COMPACT TOP HEADER */}
                <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-xl">
                            <Package className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 leading-none">Inward Stock</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Purchase Entry {loading && '(Loading...)'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-2 rounded-xl">
                            <Receipt className="w-3 h-3 text-gray-400" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Bill:</span>
                            <span className="text-xs font-bold text-gray-700">{invoiceNumber}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-2 rounded-xl group focus-within:ring-2 focus-within:ring-green-500/20 transition-all">
                            <Calendar className="w-3 h-3 text-gray-400 group-focus-within:text-green-600" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Date:</span>
                            <input
                                type="date"
                                className="bg-transparent text-xs font-bold text-gray-700 focus:outline-none cursor-pointer"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* 1. SELECTION GRID */}
                    <div className="lg:col-span-7">
                        <div className="bg-white rounded-[32px] border border-gray-100 p-6 shadow-sm h-[calc(100vh-140px)] flex flex-col">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="relative flex-1 group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-green-500 transition-all" />
                                    <input
                                        type="text"
                                        placeholder="Search vegetables..."
                                        className="w-full bg-gray-50 border border-gray-100 py-3 pl-12 pr-4 rounded-2xl text-xs focus:outline-none focus:ring-4 focus:ring-green-500/5 transition-all font-medium"
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
                                        className={`px-4 py-2 rounded-xl text-[9px] font-bold uppercase transition-all whitespace-nowrap ${activeCategory === cat.id ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
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
                                            ? 'bg-green-50 border-green-200 shadow-md transform scale-[1.02]'
                                            : 'bg-white border-gray-50 hover:border-green-100 hover:bg-gray-50/30'}`}
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
                                        </div>
                                        <h3 className={`font-bold text-[9px] uppercase text-center leading-tight tracking-wide line-clamp-1 w-full ${selectedVeg?.id === veg.id ? 'text-green-700' : 'text-gray-600'}`}>
                                            {veg.name_en}
                                        </h3>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 2. RIGHT PANEL: ENTRY FORM & FINAL LIST */}
                    <div className="lg:col-span-5 lg:sticky lg:top-24 flex flex-col gap-4">

                        {/* TOP BOX: ENTRY FORM (MATCHING SCREENSHOT) */}
                        <div className="bg-white rounded-[32px] border border-gray-100 p-6 shadow-sm flex flex-col gap-6 flex-shrink-0">

                            {/* SUPPLIER SECTION */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">CHOOSE SUPPLIER</label>
                                <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 px-4 py-3.5 rounded-[20px] group focus-within:ring-4 focus-within:ring-blue-500/5 transition-all">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <select
                                        className="bg-transparent flex-1 text-sm font-bold text-gray-700 focus:outline-none cursor-pointer"
                                        value={selectedSupplier}
                                        onChange={(e) => setSelectedSupplier(e.target.value)}
                                    >
                                        <option value="">Select a Supplier</option>
                                        {suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                </div>
                            </div>

                            <div className="h-px bg-gray-50 w-full" />

                            {/* ITEM DETAILS */}
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0 flex items-center justify-center">
                                    {!selectedVeg?.image ? (
                                        <Package className="w-8 h-8 text-gray-200" />
                                    ) : (
                                        <img src={selectedVeg?.image} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900 uppercase text-lg leading-tight tracking-tight">{selectedVeg?.name_en || 'Select Item'}</h3>
                                    <p className="text-[11px] font-bold text-[#0fa83b] uppercase tracking-widest mt-0.5">SUGGESTED: ₹{selectedVeg?.price || 0}/KG</p>
                                </div>
                            </div>

                            {/* INPUT GRID */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100/50">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-tight leading-none">QUANTITY (KG)</label>
                                        <Scale className={`w-4 h-4 cursor-pointer ${isConnected ? 'text-green-500 animate-pulse' : 'text-gray-300'}`} onClick={handleWeightMachine} />
                                    </div>
                                    <input
                                        type="number" step="0.1" placeholder="0.0"
                                        className="w-full bg-transparent text-xl font-bold text-gray-600 focus:outline-none font-mono tracking-tighter"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100/50">
                                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-tight leading-none block mb-3">PURCHASE PRICE (₹)</label>
                                    <input
                                        type="number" placeholder="0"
                                        className="w-full bg-transparent text-xl font-bold text-gray-600 focus:outline-none font-mono tracking-tighter"
                                        value={purchasePrice}
                                        onChange={(e) => setPurchasePrice(e.target.value)}
                                    />
                                </div>
                                <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100/50">
                                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-tight leading-none block mb-3">SELLING PRICE (₹)</label>
                                    <input
                                        type="number" placeholder="0"
                                        className="w-full bg-transparent text-xl font-bold text-blue-500 focus:outline-none font-mono tracking-tighter"
                                        value={sellingPrice}
                                        onChange={(e) => setSellingPrice(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* SUMMARY GRID */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#f0fdf4] rounded-2xl p-4 border border-[#dcfce7]">
                                    <label className="text-[9px] font-bold text-[#15803d] uppercase tracking-wider block mb-2">ROW TOTAL</label>
                                    <span className="text-2xl font-bold text-gray-900 font-mono">₹{entryTotal}</span>
                                </div>
                                <div className="bg-[#eff6ff] rounded-2xl p-4 border border-[#dbeafe]">
                                    <label className="text-[9px] font-bold text-[#1d4ed8] uppercase tracking-wider block mb-2">EXP. PROFIT</label>
                                    <span className="text-2xl font-bold text-gray-900 font-mono">₹{expectedProfit}</span>
                                </div>
                            </div>

                            <button onClick={addItemToCart} className="w-full py-[18px] bg-[#0f172a] hover:bg-slate-800 text-white font-bold uppercase tracking-[0.2em] rounded-[16px] shadow-lg text-xs transition-all active:scale-95 flex items-center justify-center gap-3">
                                <Plus className="w-5 h-5" /> ADD TO LIST
                            </button>
                        </div>

                        {/* BOTTOM BOX: FINAL LIST & BILLING */}
                        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
                            <div className="p-4 bg-gray-50/80 border-b border-gray-100 flex justify-between items-center px-6">
                                <span className="font-bold text-[10px] uppercase tracking-wider text-gray-900">Purchase Items List</span>
                                <span className="bg-white px-2.5 py-1 rounded-lg border border-gray-200 text-[9px] font-bold text-gray-500">{cartItems.length} Products</span>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                                {cartItems.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-200 py-10 opacity-30">
                                        <Package className="w-10 h-10 mb-2" />
                                        <p className="text-[9px] font-bold uppercase tracking-wider">Empty List</p>
                                    </div>
                                ) : (
                                    cartItems.map((item) => (
                                        <div key={item.id} className="p-3 bg-gray-50/30 border border-gray-100 rounded-2xl flex justify-between items-center group hover:bg-gray-50 transition-colors">
                                            <div className="text-left">
                                                <p className="font-bold text-gray-900 uppercase text-[10px] mb-0.5">{item.name}</p>
                                                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">
                                                    {item.quantity} KG × ₹{item.purchasePrice}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="font-bold text-gray-900 text-xs">₹{item.total}</p>
                                                </div>
                                                <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors bg-white p-1.5 rounded-lg border border-gray-100">
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="p-6 bg-white border-t border-gray-100 space-y-5">
                                <div className="flex justify-between items-center px-2">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pr-4">Purchase Bill Amount</span>
                                    <span className="text-3xl font-bold text-gray-900 font-mono tracking-tight">₹{totalPurchaseAmount}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider ml-1">Paid to Supplier (₹)</label>
                                        <input
                                            type="number" placeholder="0"
                                            className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-green-600 font-bold text-xl focus:outline-none focus:ring-4 focus:ring-green-500/5 transition-all text-center placeholder:text-gray-200"
                                            value={amountPaid}
                                            onChange={(e) => setAmountPaid(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2 text-right">
                                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mr-1">Balance Amount (₹)</label>
                                        <div className={`w-full px-4 py-4 rounded-2xl border text-xl font-bold font-mono text-center flex items-center justify-center ${pendingAmount > 0 ? 'bg-red-50 border-red-100 text-red-600' : 'bg-green-50 border-green-100 text-green-600'}`}>
                                            {pendingAmount}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPaymentMode('cash')}
                                        className={`flex-1 py-3 items-center justify-center flex gap-2 rounded-xl border transition-all font-bold text-[10px] uppercase tracking-wider ${paymentMode === 'cash' ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'}`}
                                    >
                                        <Wallet className="w-3 h-3" /> Cash
                                    </button>
                                    <button
                                        onClick={() => setPaymentMode('online')}
                                        className={`flex-1 py-3 items-center justify-center flex gap-2 rounded-xl border transition-all font-bold text-[10px] uppercase tracking-wider ${paymentMode === 'online' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'}`}
                                    >
                                        <IndianRupee className="w-3 h-3" /> Online
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <button onClick={handlePrint} className="py-4 bg-green-600 hover:bg-green-700 text-white font-bold uppercase tracking-wider rounded-[24px] shadow-xl shadow-green-600/20 text-xs transition-all active:scale-95 flex items-center justify-center gap-2">
                                        <Plus className="w-4 h-4" /> Save Purchase
                                    </button>
                                    <button
                                        onClick={() => { setCartItems([]); setAmountPaid(''); setSelectedSupplier(''); }}
                                        className="py-4 bg-white border border-gray-200 text-gray-400 font-bold uppercase tracking-wider rounded-[24px] text-xs hover:bg-gray-50 transition-colors"
                                    >
                                        Clear All
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hidden Thermal Invoice for Suppliers */}
                <div id="thermal-inward-bill" className="hidden">
                    <div style={{
                        fontFamily: '"Courier New", Courier, monospace',
                        width: '240px',
                        padding: '10px',
                        margin: '0 auto',
                        color: '#000',
                        fontSize: '12px',
                        lineHeight: '1.2'
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                            <h2 style={{ margin: '0', fontSize: '18px', fontWeight: 'bold' }}>STOCK INWARD</h2>
                            <p style={{ margin: '2px 0', fontSize: '10px' }}>Inventory Receipt</p>
                        </div>

                        <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '5px 0', marginBottom: '10px', fontSize: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Inv: {invoiceNumber}</span>
                                <span>{date}</span>
                            </div>
                            <div style={{ textAlign: 'left', marginTop: '2px' }}>
                                <span>Supplier: {selectedSupplier || 'N/A'}</span>
                            </div>
                        </div>

                        <table style={{ width: '100%', marginBottom: '10px', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #000' }}>
                                    <th style={{ textAlign: 'left', padding: '4px 0' }}>Item</th>
                                    <th style={{ textAlign: 'center', padding: '4px 0' }}>Qty</th>
                                    <th style={{ textAlign: 'right', padding: '4px 0' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cartItems.map(i => (
                                    <tr key={i.id}>
                                        <td style={{ textAlign: 'left', padding: '4px 0' }}>{i.name}</td>
                                        <td style={{ textAlign: 'center' }}>{i.quantity}</td>
                                        <td style={{ textAlign: 'right' }}>₹{i.total}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div style={{ borderTop: '1px solid #000', paddingTop: '5px', fontSize: '11px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                <span>Net Total:</span>
                                <span>₹{totalPurchaseAmount}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                <span>Paid Amt:</span>
                                <span>₹{amountPaid || 0}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold', marginTop: '5px', borderTop: '1px dashed #000', paddingTop: '5px' }}>
                                <span>DUE BAL:</span>
                                <span>₹{pendingAmount}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Inward;
