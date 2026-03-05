import React, { useState, useEffect } from 'react';
import {
    Phone,
    ArrowUpRight,
    Truck,
    Star,
    UserPlus,
    Search,
    Edit2,
    Trash2,
    Save,
    X,
    MoreHorizontal,
    MapPin,
    Package
} from 'lucide-react';
import toast from 'react-hot-toast';

import { apiSvc } from '../services/api';

const Suppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSup, setEditingSup] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        location: '',
        contact: '',
        products: '',
        status: 'Active',
        rating: 4.5
    });

    const fetchSuppliers = async () => {
        try {
            const data = await apiSvc.get('/suppliers/');
            setSuppliers(data);
        } catch (error) {
            toast.error("Failed to load suppliers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const filteredSuppliers = suppliers.filter(sup =>
        sup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sup.products.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sup.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (sup = null) => {
        if (sup) {
            setEditingSup(sup);
            setFormData({
                name: sup.name,
                location: sup.location,
                contact: sup.contact,
                products: sup.products,
                status: sup.status,
                rating: sup.rating
            });
        } else {
            setEditingSup(null);
            setFormData({
                name: '',
                location: '',
                contact: '',
                products: '',
                status: 'Active',
                rating: '4.5'
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.contact) {
            toast.error("Required fields missing");
            return;
        }

        try {
            if (editingSup) {
                await apiSvc.put(`/suppliers/${editingSup.id}`, formData);
                toast.success("Supplier updated on server");
            } else {
                await apiSvc.post('/suppliers/', formData);
                toast.success("New supplier saved to database");
            }
            fetchSuppliers();
            setIsModalOpen(false);
        } catch (error) {
            toast.error("Failed to save supplier");
        }
    };

    const handleDelete = async (id) => {
        try {
            await apiSvc.delete(`/suppliers/${id}`);
            toast.success("Supplier removed from database");
            fetchSuppliers();
        } catch (error) {
            toast.error("Failed to delete supplier");
        }
    };

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left pb-10 font-sans">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                <div>
                    <h2 className="text-4xl font-black text-gray-900 leading-none tracking-tight">Suppliers <span className="text-green-600">Register</span></h2>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                        <span className="w-8 h-[2px] bg-green-500"></span> Farm & Wholesale Network
                    </p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-4 w-full text-xs font-bold focus:outline-none focus:ring-4 focus:ring-green-500/5 transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-wider hover:bg-black transition-all shadow-xl shadow-gray-900/10 active:scale-95 whitespace-nowrap"
                    >
                        <UserPlus className="w-5 h-5" />
                        Add New
                    </button>
                </div>
            </div>

            {/* PREMIUM SUPPLIER TABLE */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center w-20">Identity</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Supplier Details</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Market Offerings</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Info</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Performance</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredSuppliers.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-20 text-center">
                                        <div className="flex flex-col items-center opacity-20">
                                            <Package className="w-16 h-16 mb-4" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">No matching partners found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredSuppliers.map((sup) => (
                                    <tr key={sup.id} className="group hover:bg-gray-50/50 transition-all duration-300">
                                        <td className="px-8 py-6">
                                            <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center group-hover:bg-green-600 group-hover:border-green-600 transition-all shadow-sm mx-auto">
                                                <Truck className="w-5 h-5 text-green-600 group-hover:text-white transition-colors" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <p className="text-sm font-black text-gray-900 uppercase tracking-tight group-hover:text-green-600 transition-colors mb-1">{sup.name}</p>
                                            <div className="flex items-center gap-1.5 opacity-50">
                                                <MapPin className="w-3 h-3" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">{sup.location}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 font-sans">
                                            <div className="flex items-center gap-2 max-w-[250px]">
                                                <div className="bg-blue-50/50 p-2 rounded-lg">
                                                    <Package className="w-3.5 h-3.5 text-blue-500" />
                                                </div>
                                                <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wide truncate" title={sup.products}>{sup.products}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 px-4 py-2 rounded-xl group-hover:bg-white transition-all w-fit">
                                                <Phone className="w-3.5 h-3.5 text-green-600" />
                                                <span className="text-[11px] font-black tracking-widest text-gray-900">{sup.contact}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-wider border ${sup.status === 'Active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                                                {sup.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-lg w-fit shadow-sm">
                                                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                                <span className="text-xs font-black text-gray-900">{sup.rating}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleOpenModal(sup)}
                                                    className="p-2.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl hover:bg-blue-600 hover:text-white transition-all transform hover:scale-110"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(sup.id)}
                                                    className="p-2.5 bg-red-50 text-red-500 border border-red-100 rounded-xl hover:bg-red-500 hover:text-white transition-all transform hover:scale-110"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="bg-gray-900 p-8 text-white relative">
                            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-white/40 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                            <p className="text-green-500 text-[10px] font-black uppercase tracking-widest mb-2">Supplier Profile</p>
                            <h3 className="text-3xl font-black tracking-tight">{editingSup ? 'Update Supplier' : 'Add New Member'}</h3>
                        </div>

                        <div className="p-10 space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Supplier Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl font-bold text-gray-900 focus:outline-none focus:border-green-500 transition-all"
                                    placeholder="Enter farm name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Location</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl font-bold text-gray-900 focus:outline-none focus:border-green-500 transition-all"
                                        placeholder="City/State"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contact <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl font-bold text-gray-900 focus:outline-none focus:border-green-500 transition-all"
                                        placeholder="Mobile"
                                        value={formData.contact}
                                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Supplied Products</label>
                                <textarea
                                    className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl font-bold text-gray-900 focus:outline-none focus:border-green-500 transition-all resize-none h-24"
                                    placeholder="List products..."
                                    value={formData.products}
                                    onChange={(e) => setFormData({ ...formData, products: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Status</label>
                                    <select
                                        className="w-full bg-gray-50 border border-gray-100 px-6 py-3 rounded-2xl font-bold text-gray-900 focus:outline-none focus:border-green-500 transition-all"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option>Active</option>
                                        <option>On Hold</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Initial Rating</label>
                                    <select
                                        className="w-full bg-gray-50 border border-gray-100 px-6 py-3 rounded-2xl font-bold text-gray-900 focus:outline-none focus:border-green-500 transition-all"
                                        value={formData.rating}
                                        onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                                    >
                                        <option>5.0</option>
                                        <option>4.5</option>
                                        <option>4.0</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                onClick={handleSave}
                                className="w-full bg-green-600 text-white py-5 rounded-[24px] font-black uppercase tracking-widest shadow-xl shadow-green-600/20 hover:bg-green-700 transition-all active:scale-95 flex items-center justify-center gap-3"
                            >
                                <Save className="w-5 h-5" />
                                {editingSup ? 'Save Updates' : 'Add Supplier'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Suppliers;
