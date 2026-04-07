import { useEffect, useMemo, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronRight, CreditCard, Download, Landmark, ShieldCheck, ShoppingCart, Sparkles, Upload, X, FileText, CalendarDays, Building2, User, Hash, Banknote, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const buildLegacyPackage = (service) => ({
    _id: 'legacy-package',
    name: 'Standard',
    description: service.shortDescription || service.description || 'Standard delivery package',
    price: Number(service.price) || 0,
    deliveryDays: Number.parseInt(service.deliveryTime, 10) || 7,
});

const Checkout = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [requirements, setRequirements] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [selectedPackageId, setSelectedPackageId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [placedOrder, setPlacedOrder] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);
    const [cardName, setCardName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCVC, setCardCVC] = useState('');
    const [bankReference, setBankReference] = useState('');
    const [bankAccountHolder, setBankAccountHolder] = useState('');
    const [bankName, setBankName] = useState('');
    const [transferAmount, setTransferAmount] = useState('');
    const [transferDate, setTransferDate] = useState('');
    const [bankSlip, setBankSlip] = useState(null);
    const [bankSlipPreview, setBankSlipPreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const bankSlipInputRef = useRef(null);
    const [touched, setTouched] = useState({});

    const handleBlur = (field) => setTouched((prev) => ({ ...prev, [field]: true }));

    // --- Field-level validation ---
    const fieldErrors = useMemo(() => {
        const e = {};
        // Card fields
        if (cardName.length > 0 && cardName.trim().length < 2) e.cardName = 'Name must be at least 2 characters.';
        if (cardNumber.length > 0 && cardNumber.replace(/\s/g, '').length < 16) e.cardNumber = 'Enter a valid 16-digit card number.';
        if (cardExpiry.length > 0 && !/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry)) e.cardExpiry = 'Use MM/YY format.';
        if (cardCVC.length > 0 && cardCVC.length < 3) e.cardCVC = 'CVC must be 3-4 digits.';
        // Bank fields
        if (bankAccountHolder.length > 0 && !/^[A-Za-z\s.'-]+$/.test(bankAccountHolder)) e.bankAccountHolder = 'Name can only contain letters and spaces.';
        else if (bankAccountHolder.length > 0 && bankAccountHolder.trim().length < 2) e.bankAccountHolder = 'Name must be at least 2 characters.';
        if (bankName.length > 0 && !/^[A-Za-z\s.&'-]+$/.test(bankName)) e.bankName = 'Enter a valid bank name.';
        if (bankReference.length > 0 && bankReference.trim().length < 4) e.bankReference = 'Reference must be at least 4 characters.';
        if (transferAmount.length > 0) {
            const amt = Number(transferAmount);
            if (isNaN(amt) || amt <= 0) e.transferAmount = 'Enter a valid positive amount.';
            else if (amt > 10000000) e.transferAmount = 'Amount seems too large. Please verify.';
        }
        if (transferDate) {
            const picked = new Date(transferDate);
            const today = new Date(); today.setHours(23, 59, 59, 999);
            if (picked > today) e.transferDate = 'Transfer date cannot be in the future.';
        }
        return e;
    }, [cardName, cardNumber, cardExpiry, cardCVC, bankAccountHolder, bankName, bankReference, transferAmount, transferDate]);

    const inputClass = (field) =>
        `w-full bg-[#f8fafc] border rounded-xl p-3.5 text-[13px] text-gray-700 focus:outline-none focus:ring-2 transition-all ${
            touched[field] && fieldErrors[field]
                ? 'border-red-400 focus:ring-red-200/60 focus:border-red-400'
                : 'border-gray-200/80 focus:ring-indigo-500/20 focus:border-indigo-400'
        }`;

    const FieldError = ({ field }) =>
        touched[field] && fieldErrors[field] ? (
            <p className="mt-1.5 text-[11px] font-semibold text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors[field]}</p>
        ) : null;

    useEffect(() => {
        const fetchService = async () => {
            try {
                const res = await axios.get(`/api/services/${id}`);
                setService(res.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load service');
            } finally {
                setLoading(false);
            }
        };

        fetchService();
        window.scrollTo(0, 0);
    }, [id]);

    const packages = useMemo(() => {
        if (!service) return [];
        return service.packages?.length ? service.packages : [buildLegacyPackage(service)];
    }, [service]);

    useEffect(() => {
        if (!selectedPackageId && packages.length > 0) {
            setSelectedPackageId(String(packages[0]._id));
        }
    }, [packages, selectedPackageId]);

    const selectedPackage = useMemo(
        () => packages.find((pkg) => String(pkg._id) === String(selectedPackageId)) || packages[0] || null,
        [packages, selectedPackageId]
    );

    const isOwnGig = !!user && service?.seller?._id === user._id;
    const orderBlockedReason = !user
        ? 'Please sign in to continue.'
        : user.isStudentSeller
            ? 'Only buyer accounts can place orders on UniGig.'
            : isOwnGig
                ? 'You cannot place an order on your own gig.'
                : '';

    const isCardValid =
        cardName.trim().length >= 2 &&
        cardNumber.replace(/\s/g, '').length >= 16 &&
        /^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry) &&
        cardCVC.length >= 3;
    const isBankValid = bankReference.trim().length >= 4 && bankAccountHolder.trim().length >= 2 && /^[A-Za-z\s.'-]+$/.test(bankAccountHolder) && !!bankSlip && Object.keys(fieldErrors).filter(k => ['bankAccountHolder','bankName','bankReference','transferAmount','transferDate'].includes(k)).length === 0;
    const isReadyToSubmit =
        !!selectedPackage &&
        requirements.trim().length > 0 &&
        !orderBlockedReason &&
        (paymentMethod === 'card' ? isCardValid : isBankValid);

    const handleCardNumberChange = (e) => {
        const digits = e.target.value.replace(/\D/g, '').slice(0, 16);
        setCardNumber(digits.replace(/(\d{4})/g, '$1 ').trim());
    };

    const handleCardExpiryChange = (e) => {
        let digits = e.target.value.replace(/\D/g, '').slice(0, 4);
        if (digits.length > 2) digits = `${digits.slice(0, 2)}/${digits.slice(2)}`;
        setCardExpiry(digits);
    };

    const handleBankSlipChange = (file) => {
        if (!file) return;
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            setError('Please upload a valid bank slip (JPG, PNG, WEBP, or PDF).');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('Bank slip must be under 5MB.');
            return;
        }
        setBankSlip(file);
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => setBankSlipPreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setBankSlipPreview(null);
        }
    };

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleBankSlipChange(file);
    };

    const removeBankSlip = () => { setBankSlip(null); setBankSlipPreview(null); if (bankSlipInputRef.current) bankSlipInputRef.current.value = ''; };

    const handlePlaceOrder = async () => {
        if (!selectedPackage || requirements.trim().length === 0 || orderBlockedReason) {
            setError(orderBlockedReason || 'Please complete the order form before continuing.');
            return;
        }

        try {
            setIsSubmitting(true);
            setError('');
            const res = await axios.post('/api/orders', {
                serviceId: service._id,
                packageId: selectedPackage._id,
                requirementsMessage: requirements.trim(),
            });
            setPlacedOrder(res.data.order);
            setSuccessMessage(res.data.sellerNotification || 'Order placed successfully.');
            window.scrollTo(0, 0);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to place the order. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const downloadReceipt = async () => {
        try {
            setIsDownloading(true);
            const receiptElement = document.getElementById('order-receipt-content');
            const actions = document.getElementById('order-receipt-actions');
            if (!receiptElement) throw new Error('Receipt content not found');
            const originalDisplay = actions ? actions.style.display : '';
            if (actions) actions.style.display = 'none';
            await new Promise((resolve) => setTimeout(resolve, 50));

            const image = await toPng(receiptElement, {
                cacheBust: true,
                style: { backgroundColor: '#ffffff' },
            });

            if (actions) actions.style.display = originalDisplay;
            const PdfConstructor = typeof jsPDF === 'function' ? jsPDF : window.jspdf?.jsPDF;
            if (!PdfConstructor) throw new Error('PDF library failed to load');

            const pdf = new PdfConstructor('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const imgProps = pdf.getImageProperties(image);
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(image, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`unigig-order-${placedOrder?._id || 'receipt'}.pdf`);
        } catch (receiptError) {
            alert(receiptError.message || 'Failed to download receipt.');
        } finally {
            setIsDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="home-page-light min-h-screen pt-32 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error && !service) {
        return (
            <div className="home-page-light min-h-screen pt-32 flex items-center justify-center px-6">
                <div className="glass-card max-w-lg p-10 text-center">
                    <h2 className="text-2xl font-black text-gray-900 mb-4">Unable to load checkout</h2>
                    <p className="text-gray-500 mb-6">{error}</p>
                    <Link to="/" className="btn-primary inline-flex items-center gap-2">Browse Services</Link>
                </div>
            </div>
        );
    }

    if (!service || !selectedPackage) return null;

    if (placedOrder) {
        return (
            <div className="bg-[#fcfdfd] min-h-screen pt-24 pb-20 font-sans flex flex-col items-center">
                <div className="max-w-xl w-full px-6" id="order-receipt-content">
                    <div className="bg-white rounded-3xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 flex flex-col items-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 mt-4">
                            <ShieldCheck className="w-10 h-10 text-emerald-500" />
                        </div>
                        <h2 className="text-3xl font-black text-gray-800 text-center mb-2">Order Placed Successfully</h2>
                        <p className="text-gray-500 font-medium text-center mb-6">
                            {successMessage || 'Your seller has been notified and can now view this order in the dashboard.'}
                        </p>
                        <div className="w-full bg-[#f8fafc] rounded-2xl p-5 border border-gray-200/80 mb-8">
                            <div className="flex justify-between items-center py-2"><span className="text-gray-500 font-bold text-[13px]">Order ID</span><span className="text-gray-800 font-black text-[13px]">{placedOrder._id}</span></div>
                            <div className="flex justify-between items-center py-2"><span className="text-gray-500 font-bold text-[13px]">Gig</span><span className="text-gray-800 font-bold text-[13px] text-right max-w-[240px]">{placedOrder.titleSnapshot}</span></div>
                            <div className="flex justify-between items-center py-2"><span className="text-gray-500 font-bold text-[13px]">Package</span><span className="text-gray-800 font-bold text-[13px]">{placedOrder.packageName}</span></div>
                            <div className="flex justify-between items-center py-2"><span className="text-gray-500 font-bold text-[13px]">Delivery Time</span><span className="text-gray-800 font-bold text-[13px]">{placedOrder.deliveryTime}</span></div>
                            <div className="flex justify-between items-center py-2"><span className="text-gray-500 font-bold text-[13px]">Status</span><span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-amber-700">{placedOrder.status}</span></div>
                        </div>
                        <div className="w-full bg-[#f5f7ff] rounded-2xl p-6 flex justify-between items-center border border-indigo-100/80">
                            <span className="text-gray-600 font-black text-lg">Order Total</span>
                            <span className="text-3xl font-black text-indigo-600 tracking-tight">LKR {Number(placedOrder.price || 0).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
                <div id="order-receipt-actions" className="max-w-xl w-full px-6 mt-8 flex flex-col sm:flex-row gap-4">
                    <button onClick={downloadReceipt} disabled={isDownloading} className="flex-1 py-4 rounded-[14px] font-bold text-[15px] bg-white border-[1.5px] border-indigo-600 text-indigo-600 hover:bg-indigo-50 transition-colors flex justify-center items-center gap-2 disabled:opacity-70">
                        {isDownloading ? <><div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>Downloading...</> : <><Download className="w-[18px] h-[18px]" />Download Receipt</>}
                    </button>
                    <button onClick={() => navigate('/')} className="flex-1 py-4 rounded-[14px] font-bold text-[15px] bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-colors">Browse More Services</button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#fcfdfd] min-h-screen pt-24 pb-20 font-sans">
            <div className="max-w-[1120px] mx-auto px-6">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-6 mt-4">
                    <Link to="/" className="hover:text-gray-600 transition-colors">Home</Link>
                    <ChevronRight className="w-3 h-3 text-gray-300" />
                    <Link to={`/service/${service._id}`} className="truncate max-w-[150px] hover:text-gray-600 transition-colors">{service.title}</Link>
                    <ChevronRight className="w-3 h-3 text-gray-300" />
                    <span className="text-gray-800 font-bold">Checkout</span>
                </div>
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-1.5 h-8 bg-teal-400 rounded-full"></div>
                    <h1 className="text-3xl font-bold text-gray-800">Checkout & Order Details</h1>
                </div>

                {error && <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">{error}</div>}
                {orderBlockedReason && <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-700">{orderBlockedReason}</div>}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100/80 flex flex-col sm:flex-row items-start gap-6">
                            {service.coverImage ? <img src={`${API_BASE}${service.coverImage}`} alt={service.title} className="w-[120px] h-[90px] object-cover rounded-xl shadow-sm" /> : <div className="w-[120px] h-[90px] bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-xs text-gray-400 font-medium">No Image</div>}
                            <div className="flex flex-col mt-1">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{service.category}</span>
                                <h3 className="text-[17px] font-bold text-gray-800 mb-2 leading-tight">{service.title}</h3>
                                <p className="text-[13px] font-medium text-gray-500">Seller: {service.seller?.name || 'Unknown seller'}</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100/80">
                            <div className="flex items-center gap-4 mb-6"><div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-100">1</div><h2 className="text-[19px] font-bold text-gray-800">Select a Package</h2></div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {packages.map((pkg) => {
                                    const active = String(selectedPackageId) === String(pkg._id);
                                    return (
                                        <button key={String(pkg._id)} type="button" onClick={() => setSelectedPackageId(String(pkg._id))} className={`text-left rounded-2xl border p-5 transition-all ${active ? 'border-indigo-500 bg-indigo-50/60 shadow-lg shadow-indigo-100' : 'border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/20'}`}>
                                            <div className="flex items-center justify-between gap-3 mb-3"><span className="text-sm font-black text-gray-900">{pkg.name}</span><span className="text-sm font-black text-indigo-600">LKR {Number(pkg.price || 0).toLocaleString()}</span></div>
                                            <p className="text-xs font-medium text-gray-500 leading-5 min-h-[42px]">{pkg.description || 'Package details will be confirmed with the seller after ordering.'}</p>
                                            <div className="mt-4 inline-flex rounded-full bg-white px-3 py-1 text-[11px] font-bold text-gray-700 border border-gray-100">Delivery: {Number(pkg.deliveryDays || 1)} {Number(pkg.deliveryDays || 1) === 1 ? 'Day' : 'Days'}</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100/80">
                            <div className="flex items-center gap-4 mb-4"><div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-100">2</div><h2 className="text-[19px] font-bold text-gray-800">Order Requirements</h2></div>
                            <p className="text-gray-500 text-[13px] mb-8 font-medium">Give the seller everything needed to start your project well.</p>
                            <label className="block text-[13px] font-bold text-gray-700 mb-2.5">Instructions for Seller <span className="text-red-500">*</span></label>
                            <textarea rows="6" value={requirements} onChange={(e) => setRequirements(e.target.value)} className="w-full bg-[#f8fafc] border border-gray-200/80 rounded-xl p-4 text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors resize-none placeholder-gray-400 font-medium" placeholder="Describe what you need, share your goals, preferred style, deadlines, or any important files/links." />
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100/80">
                            <div className="flex items-center gap-4 mb-8"><div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-100">3</div><h2 className="text-[19px] font-bold text-gray-800">Payment Method</h2></div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <button type="button" onClick={() => setPaymentMethod('card')} className={`flex flex-col items-center justify-center py-7 px-4 rounded-xl border-[1.5px] transition-all ${paymentMethod === 'card' ? 'border-indigo-600 bg-indigo-50/10 shadow-sm' : 'border-gray-200/80 hover:border-gray-300'}`}><div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${paymentMethod === 'card' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}><CreditCard className="w-[18px] h-[18px]" /></div><span className={`text-[13px] font-bold ${paymentMethod === 'card' ? 'text-gray-900' : 'text-gray-600'}`}>Card Payment</span></button>
                                <button type="button" onClick={() => setPaymentMethod('bank')} className={`flex flex-col items-center justify-center py-7 px-4 rounded-xl border-[1.5px] transition-all ${paymentMethod === 'bank' ? 'border-indigo-600 bg-indigo-50/10 shadow-sm' : 'border-gray-200/80 hover:border-gray-300'}`}><div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${paymentMethod === 'bank' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}><Landmark className="w-[18px] h-[18px]" /></div><span className={`text-[13px] font-bold ${paymentMethod === 'bank' ? 'text-gray-900' : 'text-gray-600'}`}>Bank Transfer</span></button>
                            </div>
                            <div className="mt-8 pt-8 border-t border-gray-100/80">
                                {paymentMethod === 'card' ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-2">Cardholder Name</label>
                                            <input type="text" value={cardName} onChange={(e) => setCardName(e.target.value)} onBlur={() => handleBlur('cardName')} placeholder="John Doe" className={inputClass('cardName')} />
                                            <FieldError field="cardName" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-2">Card Number</label>
                                            <input type="text" value={cardNumber} onChange={handleCardNumberChange} onBlur={() => handleBlur('cardNumber')} placeholder="0000 0000 0000 0000" className={inputClass('cardNumber')} />
                                            <FieldError field="cardNumber" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 mb-2">Expiry Date</label>
                                                <input type="text" value={cardExpiry} onChange={handleCardExpiryChange} onBlur={() => handleBlur('cardExpiry')} placeholder="MM/YY" className={inputClass('cardExpiry')} />
                                                <FieldError field="cardExpiry" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 mb-2">CVC</label>
                                                <input type="text" value={cardCVC} onChange={(e) => setCardCVC(e.target.value.replace(/\D/g, '').slice(0, 4))} onBlur={() => handleBlur('cardCVC')} placeholder="123" className={inputClass('cardCVC')} />
                                                <FieldError field="cardCVC" />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-5">
                                        {/* Bank Account Details */}
                                        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-violet-50/60 p-5">
                                            <h4 className="text-[13px] font-black text-indigo-700 mb-3 flex items-center gap-2"><Building2 className="w-4 h-4" />UniGig Bank Account Details</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-[12px]"><span className="text-gray-500 font-medium">Bank</span><span className="text-gray-800 font-bold">Commercial Bank of Ceylon</span></div>
                                                <div className="flex justify-between text-[12px]"><span className="text-gray-500 font-medium">Branch</span><span className="text-gray-800 font-bold">Colombo Main Branch</span></div>
                                                <div className="flex justify-between text-[12px]"><span className="text-gray-500 font-medium">Account Name</span><span className="text-gray-800 font-bold">UniGig (Pvt) Ltd</span></div>
                                                <div className="flex justify-between text-[12px]"><span className="text-gray-500 font-medium">Account Number</span><span className="text-gray-800 font-bold font-mono">8012 4500 3217</span></div>
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-amber-100 bg-amber-50/80 px-5 py-3.5 text-[12px] text-amber-800 font-medium flex items-start gap-2.5">
                                            <Banknote className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                            <span>Please make your transfer to the account above and fill in details below. Attach a clear photo or scan of your bank slip for verification.</span>
                                        </div>

                                        {/* Transfer Details Form */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 mb-2 flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-gray-400" />Account Holder Name <span className="text-red-500">*</span></label>
                                                <input type="text" value={bankAccountHolder} onChange={(e) => setBankAccountHolder(e.target.value)} onBlur={() => handleBlur('bankAccountHolder')} placeholder="e.g. Kamal Perera" className={inputClass('bankAccountHolder')} />
                                                <FieldError field="bankAccountHolder" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 mb-2 flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-gray-400" />Your Bank Name</label>
                                                <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} onBlur={() => handleBlur('bankName')} placeholder="e.g. Bank of Ceylon" className={inputClass('bankName')} />
                                                <FieldError field="bankName" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 mb-2 flex items-center gap-1.5"><Hash className="w-3.5 h-3.5 text-gray-400" />Transfer Reference <span className="text-red-500">*</span></label>
                                                <input type="text" value={bankReference} onChange={(e) => setBankReference(e.target.value)} onBlur={() => handleBlur('bankReference')} placeholder="TRX-4582" className={inputClass('bankReference')} />
                                                <FieldError field="bankReference" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 mb-2 flex items-center gap-1.5"><Banknote className="w-3.5 h-3.5 text-gray-400" />Amount Transferred</label>
                                                <input type="text" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value.replace(/[^0-9.]/g, ''))} onBlur={() => handleBlur('transferAmount')} placeholder={`LKR ${Number(selectedPackage?.price || 0).toLocaleString()}`} className={inputClass('transferAmount')} />
                                                <FieldError field="transferAmount" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-2 flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5 text-gray-400" />Transfer Date</label>
                                            <input type="date" value={transferDate} onChange={(e) => setTransferDate(e.target.value)} onBlur={() => handleBlur('transferDate')} className={inputClass('transferDate')} />
                                            <FieldError field="transferDate" />
                                        </div>

                                        {/* Bank Slip Upload */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-2 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-gray-400" />Attach Bank Slip <span className="text-red-500">*</span></label>
                                            {!bankSlip ? (
                                                <div
                                                    onClick={() => bankSlipInputRef.current?.click()}
                                                    onDragOver={handleDragOver}
                                                    onDragLeave={handleDragLeave}
                                                    onDrop={handleDrop}
                                                    className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
                                                        isDragging
                                                            ? 'border-indigo-400 bg-indigo-50/60 scale-[1.01]'
                                                            : 'border-gray-200 bg-[#f8fafc] hover:border-indigo-300 hover:bg-indigo-50/30'
                                                    }`}
                                                >
                                                    <input
                                                        ref={bankSlipInputRef}
                                                        type="file"
                                                        accept="image/jpeg,image/png,image/webp,application/pdf"
                                                        onChange={(e) => handleBankSlipChange(e.target.files?.[0])}
                                                        className="hidden"
                                                    />
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                                                            isDragging ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'
                                                        }`}>
                                                            <Upload className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[13px] font-bold text-gray-700">
                                                                {isDragging ? 'Drop your bank slip here' : 'Click to upload or drag & drop'}
                                                            </p>
                                                            <p className="text-[11px] text-gray-400 mt-1 font-medium">JPG, PNG, WEBP or PDF — Max 5MB</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="rounded-2xl border border-gray-200 bg-[#f8fafc] p-4">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                                <FileText className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[13px] font-bold text-gray-800 truncate max-w-[200px]">{bankSlip.name}</p>
                                                                <p className="text-[11px] text-gray-400 font-medium">{(bankSlip.size / 1024).toFixed(1)} KB</p>
                                                            </div>
                                                        </div>
                                                        <button type="button" onClick={removeBankSlip} className="w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors">
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    {bankSlipPreview && (
                                                        <div className="rounded-xl overflow-hidden border border-gray-200 bg-white">
                                                            <img src={bankSlipPreview} alt="Bank slip preview" className="w-full max-h-[220px] object-contain" />
                                                        </div>
                                                    )}
                                                    {!bankSlipPreview && bankSlip.type === 'application/pdf' && (
                                                        <div className="rounded-xl border border-gray-200 bg-white p-4 flex items-center justify-center gap-2 text-gray-500 text-[12px] font-medium">
                                                            <FileText className="w-4 h-4" /> PDF file attached
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4">
                        <div className="sticky top-28 bg-white rounded-3xl border border-gray-100 shadow-[0_10px_35px_rgba(80,70,170,0.08)] p-8">
                            <div className="flex items-center gap-3 mb-6"><ShoppingCart className="w-5 h-5 text-indigo-600" /><h2 className="text-xl font-bold text-gray-800">Order Summary</h2></div>
                            <div className="rounded-2xl bg-[#f8fafc] border border-gray-100 p-5 mb-6">
                                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Selected Package</p>
                                <h3 className="text-lg font-black text-gray-900">{selectedPackage.name}</h3>
                                <p className="text-sm text-gray-500 mt-2 leading-6">{selectedPackage.description || 'Package details will be shared with the seller at order time.'}</p>
                            </div>
                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center text-[13px]"><span className="text-gray-500 font-medium">Package Price</span><span className="font-bold text-gray-800">LKR {Number(selectedPackage.price || 0).toLocaleString()}</span></div>
                                <div className="flex justify-between items-center text-[13px]"><span className="text-gray-500 font-medium">Delivery Time</span><span className="font-bold text-gray-800">{Number(selectedPackage.deliveryDays || 1)} {Number(selectedPackage.deliveryDays || 1) === 1 ? 'Day' : 'Days'}</span></div>
                                <div className="flex justify-between items-center text-[13px]"><span className="text-gray-500 font-medium">Order Status</span><span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-amber-700">Pending</span></div>
                            </div>
                            <div className="flex flex-col mb-8">
                                <span className="text-[10px] uppercase font-bold text-gray-400 text-right mb-1">LKR</span>
                                <div className="flex justify-between items-end"><span className="text-[13px] font-bold text-gray-600 pb-1.5">Total Amount</span><span className="text-4xl font-black text-gray-800 tracking-tight">{Number(selectedPackage.price || 0).toLocaleString()}</span></div>
                            </div>
                            <div className="bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534] p-4 rounded-[14px] flex items-start gap-3 mb-8"><ShieldCheck className="w-5 h-5 text-[#22c55e] flex-shrink-0 mt-0.5" /><p className="text-[11px] font-semibold leading-relaxed">Once placed, the seller will immediately see this order inside the UniGig seller dashboard.</p></div>
                            <button disabled={!isReadyToSubmit || isSubmitting} onClick={handlePlaceOrder} className={`w-full py-4 rounded-[14px] font-bold text-[15px] transition-all duration-300 flex justify-center items-center gap-2 ${isReadyToSubmit ? 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer shadow-lg shadow-indigo-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                                {isSubmitting ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Placing Order...</> : <><Sparkles className="w-4 h-4" />Checkout & Place Order</>}
                            </button>
                            {!isReadyToSubmit && <p className="text-center text-[11px] font-bold text-gray-400/80 mt-4">Select a package, add requirements, and complete payment details to continue.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
