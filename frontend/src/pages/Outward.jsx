import React, { useState, useEffect } from 'react';
import {
    Plus,
    X,
    Search,
    User,
    Package,
    Calendar,
    Receipt,
    Printer,
    Trash2,
    IndianRupee,
    Wallet,
    Scale,
    Smartphone,
    ShoppingBag,
    ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiSvc } from '../services/api';
import { serialSvc } from '../services/serial';

const categories = [
    { id: 'all', names: { en: 'All' } },
    { id: 'Vegetables', names: { en: 'Vegetables' } },
    { id: 'Greens', names: { en: 'Greens' } },
    { id: 'Fruits', names: { en: 'Fruits' } }
];

const Outward = () => {
    const [vegetables, setVegetables] = useState([]);
    const [loading, setLoading] = useState(true);

    // Customer Info
    const [customerName, setCustomerName] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [billNumber, setBillNumber] = useState(`OUT-${Math.floor(Math.random() * 9000 + 1000)}`);

    // Item Selection
    const [selectedVeg, setSelectedVeg] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [showCustomerModal, setShowCustomerModal] = useState(false);

    useEffect(() => {
        const fetchVegetables = async () => {
            try {
                const data = await apiSvc.get('/vegetables/');
                setVegetables(data);
                if (data.length > 0) setSelectedVeg(data[0]);
            } catch (error) {
                toast.error("Failed to load vegetables");
            } finally {
                setLoading(false);
            }
        };
        fetchVegetables();
    }, []);
    const [quantity, setQuantity] = useState('');

    // Items List (Cart)
    const [cartItems, setCartItems] = useState([]);
    const [discount, setDiscount] = useState('');
    const [amountReceived, setAmountReceived] = useState('');
    const [paymentMode, setPaymentMode] = useState('cash');

    // Weight Machine State
    const [isWeighing, setIsWeighing] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    // Simulated Stock and Prices
    const getStock = (id) => (id.length * 15) % 100 + 10;
    const getSellingPrice = (id) => (id.length * 7) % 50 + 20;

    const filteredVegetables = vegetables.filter(v => {
        const searchLower = searchTerm.toLowerCase();
        const nameEn = v.name_en || '';
        const nameTa = v.name_ta || '';
        const matchesSearch = nameEn.toLowerCase().includes(searchLower) || nameTa.includes(searchTerm);
        const matchesCategory = activeCategory === 'all' || v.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const availableStock = selectedVeg?.stock || 0;
    const sellingPrice = selectedVeg?.price || 0;
    // GST Rate (e.g., 5%)
    const gstRate = 5;
    const billerName = localStorage.getItem('username') || 'House User';

    // Commercial Rounding: Round amount to nearest Rupee
    const itemTotal = Math.round((Number(quantity) || 0) * sellingPrice);

    // Cart Calculations (Commercial Rounding)
    const subtotal = Math.round(cartItems.reduce((sum, item) => sum + item.total, 0));
    const taxableAmount = Math.round(subtotal - (Number(discount) || 0));
    const gstAmount = Math.round((taxableAmount * gstRate) / 100);
    const grandTotal = taxableAmount + gstAmount;
    const balanceReturned = Math.round((Number(amountReceived) || 0) > grandTotal ? (Number(amountReceived) || 0) - grandTotal : 0);

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
        toast.loading("Reading Scale...", { id: 'scale-out' });

        setTimeout(() => {
            setIsWeighing(false);
            toast.dismiss('scale-out');
        }, 1000);
    };

    const addItemToBill = () => {
        if (!quantity || Number(quantity) <= 0) {
            toast.error("Invalid quantity");
            return;
        }

        if (Number(quantity) > availableStock) {
            toast.error(`Out of stock! Max ${availableStock} KG`, { icon: '⚠️' });
            return;
        }

        const newItem = {
            id: Date.now(),
            vegId: selectedVeg.id,
            name: selectedVeg.name_en,
            quantity: Number(quantity),
            price: sellingPrice,
            total: itemTotal
        };

        setCartItems([...cartItems, newItem]);
        setQuantity('');
        toast.success(`Added ${selectedVeg.names.en}`);
    };

    const removeItem = (id) => {
        setCartItems(cartItems.filter(item => item.id !== id));
    };

    const handleSave = async () => {
        if (cartItems.length === 0) {
            toast.error("Add items first");
            return;
        }

        const billData = {
            bill_number: billNumber,
            customer_name: customerName,
            mobile_number: mobileNumber,
            date: date,
            subtotal: subtotal,
            discount: Number(discount) || 0,
            gst_amount: gstAmount,
            taxable_amount: taxableAmount,
            grand_total: grandTotal,
            payment_mode: paymentMode,
            biller_name: billerName,
            items: cartItems.map(item => ({
                veg_id: item.vegId,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                total: item.total
            }))
        };

        try {
            await apiSvc.post('/sales/', billData);
            toast.success(`Bill ${billNumber} Saved to Server!`);
            setCartItems([]);
            setAmountReceived('');
            setDiscount('');
            setCustomerName('');
            setMobileNumber('');
            setBillNumber(`OUT-${Math.floor(Math.random() * 9000 + 1000)}`);
        } catch (error) {
            toast.error("Failed to save bill to server");
            console.error(error);
        }
    };

    const handlePrint = () => {
        if (cartItems.length === 0) {
            toast.error("Add items first");
            return;
        }
        setShowCustomerModal(true);
    };

    const completeCheckout = async () => {
        // First hide modal
        setShowCustomerModal(false);

        // Then wait a bit for state/UI updates
        setTimeout(async () => {
            const printContent = document.getElementById('thermal-sales-bill');
            const WinPrint = window.open('', '', 'width=400,height=600');
            WinPrint.document.write('<html><body>' + printContent.innerHTML + '</body></html>');
            WinPrint.document.close();
            WinPrint.focus();
            WinPrint.print();
            WinPrint.close();

            await handleSave();
        }, 300);
    };

    const categories = [
        { id: 'all', names: { en: 'All' } },
        { id: 'Vegetables', names: { en: 'Vegetables' } },
        { id: 'Greens', names: { en: 'Greens' } },
        { id: 'Fruits', names: { en: 'Fruits' } }
    ];

    return (
        <div className="max-w-[1600px] mx-auto space-y-4 animate-in fade-in duration-500 font-sans text-left pb-10">
            {/* COMPACT POS HEADER */}
            <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-xl text-white">
                        <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 leading-none">Sales Counter</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">POS Checkout {loading && '(Loading...)'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-2 rounded-xl">
                        <Receipt className="w-3 h-3 text-gray-400" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Bill:</span>
                        <span className="text-xs font-bold text-gray-700">{billNumber}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-2 rounded-xl group focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                        <Calendar className="w-3 h-3 text-gray-400 group-focus-within:text-blue-600" />
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
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-all" />
                                <input
                                    type="text"
                                    placeholder="Search vegetables..."
                                    className="w-full bg-gray-50 border border-gray-100 py-3 pl-12 pr-4 rounded-2xl text-xs focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all font-medium"
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
                                    className={`px-4 py-2 rounded-xl text-[9px] font-bold uppercase transition-all whitespace-nowrap ${activeCategory === cat.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
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
                                        ? 'bg-blue-50 border-blue-200 shadow-md transform scale-[1.02]'
                                        : 'bg-white border-gray-50 hover:border-blue-100 hover:bg-gray-50/30'}`}
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
                                    <h3 className={`font-bold text-[9px] uppercase text-center leading-tight tracking-wide line-clamp-1 w-full ${selectedVeg?.id === veg.id ? 'text-blue-700' : 'text-gray-600'}`}>
                                        {veg.name_en}
                                    </h3>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 2. RIGHT PANEL: QUICK ADD & CURRENT ORDER */}
                <div className="lg:col-span-5 lg:sticky lg:top-24 flex flex-col gap-4">

                    {/* TOP BOX: QUICK ADD */}
                    <div className="bg-white rounded-[32px] border border-gray-100 p-4 shadow-sm flex items-center justify-between gap-4 flex-shrink-0">
                        <div className="flex items-center gap-4 flex-1 overflow-hidden">
                            <div className="w-14 h-14 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0 flex items-center justify-center">
                                {!selectedVeg?.image ? (
                                    <Package className="w-6 h-6 text-gray-300" />
                                ) : (
                                    <img src={selectedVeg?.image} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                )}
                            </div>
                            <div className="flex-1 truncate">
                                <h3 className="font-bold text-gray-900 uppercase text-sm leading-tight tracking-tight truncate">{selectedVeg?.name_en || 'Select Item'}</h3>
                                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">₹{sellingPrice}/KG</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="flex items-center bg-gray-50/80 border border-gray-100 rounded-[20px] px-4 py-3 relative w-24 md:w-32 transition-all focus-within:ring-2 focus-within:ring-blue-500/20">
                                <input
                                    type="number" step="0.1" placeholder="0.0"
                                    className="bg-transparent w-full text-lg md:text-xl font-bold text-gray-600 focus:outline-none placeholder:text-gray-400 font-mono tracking-tighter"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    autoFocus
                                />
                                <button onClick={handleWeightMachine} className={`absolute right-3 ${isConnected ? 'text-green-500' : 'text-gray-300'} hover:text-green-600 transition-colors`}>
                                    <Scale className="w-4 h-4" />
                                </button>
                            </div>
                            <button onClick={addItemToBill} className="bg-[#2563eb] hover:bg-blue-700 text-white font-bold uppercase tracking-widest px-6 md:px-8 py-3.5 rounded-[20px] shadow-[0_8px_20px_rgb(37,99,235,0.2)] text-xs transition-all active:scale-95 flex-shrink-0">
                                ADD
                            </button>
                        </div>
                    </div>

                    {/* BOTTOM BOX: CURRENT ORDER & BILLING */}
                    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-230px)]">

                        <div className="flex justify-between items-center px-6 py-6 pb-2 flex-shrink-0">
                            <label className="text-[12px] font-bold text-[#0a1128] uppercase tracking-widest">Current Order</label>
                            <span className="bg-white px-3 py-1 rounded-full border border-gray-200 text-[10px] font-bold text-gray-600 shadow-sm">{cartItems.length} Products</span>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 space-y-3 custom-scrollbar min-h-[100px] mt-2">
                            {cartItems.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-200 py-10 opacity-30">
                                    <ShoppingBag className="w-12 h-12 mb-2" />
                                </div>
                            ) : (
                                cartItems.map((item) => (
                                    <div key={item.id} className="p-4 bg-gray-50/30 border border-gray-100 rounded-2xl flex justify-between items-center group hover:bg-gray-50 transition-all">
                                        <div className="text-left">
                                            <p className="font-bold text-gray-900 uppercase text-xs mb-1">{item.name}</p>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                                {item.quantity} KG × ₹{item.price}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <p className="font-bold text-gray-900 text-sm font-mono">₹{item.total}</p>
                                            <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="px-6 py-6 pb-8 bg-white border-t border-gray-100 space-y-6 flex-shrink-0">
                            <div className="flex justify-between items-end pb-2">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Total Bill</p>
                                    <p className="text-[40px] leading-none font-bold text-gray-900 tracking-tighter">₹{grandTotal}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Balance</p>
                                    <p className={`text-2xl leading-none font-bold ${balanceReturned > 0 ? 'text-gray-400' : 'text-gray-300'}`}>₹{balanceReturned}</p>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setPaymentMode('cash')}
                                    className={`flex-1 py-[18px] items-center justify-center flex rounded-[16px] transition-all font-bold text-[11px] uppercase tracking-[0.1em] ${paymentMode === 'cash' ? 'bg-[#0f172a] text-white' : 'bg-white border border-gray-100/80 text-gray-400 hover:bg-gray-50'}`}
                                >
                                    CASH
                                </button>
                                <button
                                    onClick={() => setPaymentMode('online')}
                                    className={`flex-1 py-[18px] items-center justify-center flex rounded-[16px] transition-all font-bold text-[11px] uppercase tracking-[0.1em] ${paymentMode === 'online' ? 'bg-[#0f172a] text-white' : 'bg-white border border-gray-100/80 text-gray-400 hover:bg-gray-50'}`}
                                >
                                    ONLINE
                                </button>
                            </div>

                            <button
                                onClick={handlePrint}
                                className="w-full py-5 bg-[#0fa83b] hover:bg-[#0c9132] text-white font-bold uppercase tracking-widest rounded-2xl shadow-[0_8px_30px_rgb(15,168,59,0.3)] text-sm transition-all active:scale-95 flex items-center justify-center gap-3 mt-4"
                            >
                                <Printer className="w-5 h-5" /> SAVE & PRINT BILL <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden Thermal Bill Optimized for 58mm/80mm */}
            <div id="thermal-sales-bill" className="hidden">
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
                        <h2 style={{ margin: '0', fontSize: '18px', fontWeight: 'bold' }}>VEGETABLE STORE</h2>
                        <p style={{ margin: '2px 0', fontSize: '10px' }}>Fresh & Organic Daily</p>
                        <p style={{ margin: '2px 0', fontSize: '10px' }}>Mob: {mobileNumber || 'N/A'}</p>
                    </div>

                    <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '5px 0', marginBottom: '10px', fontSize: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Bill: {billNumber}</span>
                            <span>{date}</span>
                        </div>
                        <div style={{ textAlign: 'left', marginTop: '2px' }}>
                            <span>Cust: {customerName || 'Cash'} ({mobileNumber || 'N/A'})</span>
                        </div>
                        <div style={{ textAlign: 'left', marginTop: '2px' }}>
                            <span>Biller: {billerName}</span>
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
                            <span>Subtotal:</span>
                            <span>₹{subtotal}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <span>Discount:</span>
                            <span>-₹{discount || 0}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <span>GST ({gstRate}%):</span>
                            <span>₹{gstAmount}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold', marginTop: '5px', borderTop: '1px dashed #000', paddingTop: '5px' }}>
                            <span>GRAND TOTAL:</span>
                            <span>₹{grandTotal}</span>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '15px', borderTop: '1px dashed #000', paddingTop: '10px' }}>
                        <p style={{ margin: '0', fontWeight: 'bold' }}>Thank You! Visit Again</p>
                        <p style={{ margin: '2px 0', fontSize: '9px' }}>Software by VeggieFlow Pro</p>
                    </div>
                </div>
            </div>
            {/* Customer Details Modal */}
            {showCustomerModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-8 space-y-6 text-left">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1 text-left">
                                    <h3 className="text-xl font-bold text-gray-900">Customer Details</h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Enter details to complete bill</p>
                                </div>
                                <button onClick={() => setShowCustomerModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Customer Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500" />
                                        <input
                                            type="text"
                                            placeholder="Enter name (e.g. Cash)"
                                            className="w-full bg-gray-50 border border-gray-100 py-4 pl-12 pr-4 rounded-2xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Phone Number</label>
                                    <div className="relative group">
                                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500" />
                                        <input
                                            type="text"
                                            placeholder="Enter 10-digit number"
                                            className="w-full bg-gray-50 border border-gray-100 py-4 pl-12 pr-4 rounded-2xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all font-mono outline-none"
                                            value={mobileNumber}
                                            onChange={(e) => setMobileNumber(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-4 text-left">
                                <button
                                    onClick={() => completeCheckout()}
                                    className="flex-1 py-5 bg-[#0fa83b] hover:bg-[#0c9132] text-white font-bold uppercase tracking-widest rounded-2xl shadow-[0_8px_30px_rgb(15,168,59,0.3)] text-xs transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <Printer className="w-4 h-4" /> CONFIRM & PRINT
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Outward;
