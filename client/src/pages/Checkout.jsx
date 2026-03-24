import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    ChevronRight,
    Upload,
    CreditCard,
    Landmark,
    ShieldCheck,
    Download
} from 'lucide-react';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Checkout = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [requirements, setRequirements] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Form States
    const [cardName, setCardName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCVC, setCardCVC] = useState('');
    const [receiptFile, setReceiptFile] = useState(null);
    const [mainAttachment, setMainAttachment] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    
    // Validation States
    const [touched, setTouched] = useState({
        cardName: false,
        cardNumber: false,
        cardExpiry: false,
        cardCVC: false
    });

    const getCardError = (field) => {
        if (!touched[field]) return null;
        switch (field) {
            case 'cardName':
                if (cardName.trim().length === 0) return 'Cardholder name is required';
                if (!/^[a-zA-ZÀ-ÿ\s\-']+$/.test(cardName)) return 'Cannot contain numbers or special characters';
                return null;
            case 'cardNumber':
                return cardNumber.replace(/\s/g, '').length < 15 ? 'Enter a valid 16-digit card number' : null;
            case 'cardExpiry':
                return !/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry) ? 'Use MM/YY format' : null;
            case 'cardCVC':
                return cardCVC.length < 3 ? 'Invalid CVC' : null;
            default:
                return null;
        }
    };

    const handleBlur = (field) => setTouched({ ...touched, [field]: true });

    const handleCardNumberChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 16) value = value.slice(0, 16);
        setCardNumber(value.replace(/(\d{4})/g, '$1 ').trim());
    };

    const handleCardExpiryChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) value = value.slice(0, 2) + '/' + value.slice(2, 4);
        setCardExpiry(value);
    };

    const handleCardCVCChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 4) value = value.slice(0, 4);
        setCardCVC(value);
    };

    useEffect(() => {
        const fetchService = async () => {
            try {
                const res = await axios.get(`/api/services/${id}`);
                setService(res.data);
                setLoading(false);
            } catch (err) {
                console.error('Fetch service error:', err);
                setError(err.response?.data?.message || 'Failed to load service');
                setLoading(false);
            }
        };
        fetchService();
        window.scrollTo(0, 0);
    }, [id]);

    const handleConfirmPay = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            setIsSuccess(true);
            window.scrollTo(0, 0);
        }, 2000);
    };

    const downloadPDF = async () => {
        try {
            setIsDownloading(true);
            const receiptElement = document.getElementById('payment-receipt-content');
            if (!receiptElement) throw new Error('Receipt content not found');

            // Temporarily hide buttons manually
            const buttons = document.getElementById('receipt-buttons');
            const originalDisplay = buttons ? buttons.style.display : '';
            if (buttons) buttons.style.display = 'none';

            // Wait a tick for DOM to update
            await new Promise(resolve => setTimeout(resolve, 50));

            const imgData = await toPng(receiptElement, {
                cacheBust: true,
                style: { backgroundColor: '#ffffff' }
            });

            // Restore buttons
            if (buttons) buttons.style.display = originalDisplay;
            
            // Handle different jsPDF import resolutions safely
            const PdfConstructor = typeof jsPDF === 'function' ? jsPDF : window.jspdf?.jsPDF;
            if (!PdfConstructor) throw new Error('PDF library failed to load');

            const pdf = new PdfConstructor('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const imgProps = pdf.getImageProperties(imgData);
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`unigig_receipt_${service?._id || 'order'}.pdf`);
            
        } catch (error) {
            console.error('Failed to generate PDF:', error);
            alert(`Error: ${error.message || 'Unknown error occurred'}`);
            const buttons = document.getElementById('receipt-buttons');
            if (buttons) buttons.style.display = 'flex';
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

    if (error || !service) {
        return (
            <div className="min-h-screen pt-32 flex items-center justify-center text-gray-600">
                <p>{error || 'Service not found.'}</p>
            </div>
        );
    }

    const serviceFee = service.price * 0.05;
    const totalAmount = service.price + serviceFee;

    if (isSuccess) {
        return (
            <div className="bg-[#fcfdfd] min-h-screen pt-24 pb-20 font-sans flex flex-col items-center">
                <div className="max-w-xl w-full px-6" id="payment-receipt-content">
                    <div className="bg-white rounded-3xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 flex flex-col items-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
                        
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 mt-4">
                            <ShieldCheck className="w-10 h-10 text-emerald-500" />
                        </div>
                        <h2 className="text-3xl font-black text-gray-800 text-center mb-2">Payment Successful!</h2>
                        <p className="text-gray-500 font-medium text-center mb-10">Thank you for your order. Your payment has been securely processed.</p>
                        
                        <div className="w-full border-t border-b border-gray-100 py-6 mb-8 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-bold text-[13px]">Service ID</span>
                                <span className="text-gray-800 font-bold text-[13px] uppercase">{service._id.substring(0, 8)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-bold text-[13px]">Date</span>
                                <span className="text-gray-800 font-bold text-[13px]">{new Date().toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-bold text-[13px]">Payment Method</span>
                                <span className="text-gray-800 font-bold text-[13px] capitalize">{paymentMethod === 'card' ? 'Credit Card' : 'Bank Transfer'}</span>
                            </div>
                        </div>

                        <div className="w-full space-y-4 mb-8">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 font-bold text-[14px] truncate max-w-[200px]">{service.title}</span>
                                <span className="text-gray-800 font-bold text-[14px]">LKR {service.price.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium text-[13px]">Service Fee</span>
                                <span className="text-gray-800 font-bold text-[13px]">LKR {serviceFee.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="w-full bg-[#f8fafc] rounded-2xl p-6 flex justify-between items-center border border-gray-200/80">
                            <span className="text-gray-600 font-black text-lg">Amount Paid</span>
                            <span className="text-3xl font-black text-indigo-600 tracking-tight">LKR {totalAmount.toLocaleString()}</span>
                        </div>
                    </div>

                    <div id="receipt-buttons" className="mt-8 flex flex-col sm:flex-row gap-4">
                        <button 
                            onClick={downloadPDF}
                            disabled={isDownloading}
                            className={`flex-1 py-4 rounded-[14px] font-bold text-[15px] bg-white border-[1.5px] border-indigo-600 text-indigo-600 hover:bg-indigo-50 transition-colors flex justify-center items-center gap-2 ${isDownloading ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {isDownloading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                    Downloading...
                                </>
                            ) : (
                                <>
                                    <Download className="w-[18px] h-[18px]" />
                                    Download Receipt
                                </>
                            )}
                        </button>
                        <button 
                            onClick={() => navigate('/')}
                            disabled={isDownloading}
                            className={`flex-1 py-4 rounded-[14px] font-bold text-[15px] bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-colors ${isDownloading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            Return to Homepage
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    const isReadyToPay = paymentMethod === 'card' ? (
        cardName.trim().length > 0 &&
        /^[a-zA-ZÀ-ÿ\s\-']+$/.test(cardName) &&
        cardNumber.replace(/\s/g, '').length >= 15 &&
        cardExpiry.length >= 4 &&
        cardCVC.length >= 3
    ) : (
        receiptFile !== null
    );

    return (
        <div className="bg-[#fcfdfd] min-h-screen pt-24 pb-20 font-sans">
            <div className="max-w-[1100px] mx-auto px-6">
                
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-6 mt-4">
                    <Link to="/" className="hover:text-gray-600 transition-colors">Home</Link>
                    <ChevronRight className="w-3 h-3 text-gray-300" />
                    <Link to={`/service/${service._id}`} className="truncate max-w-[150px] hover:text-gray-600 transition-colors">
                        {service.title}
                    </Link>
                    <ChevronRight className="w-3 h-3 text-gray-300" />
                    <span className="text-gray-800 font-bold">Checkout</span>
                </div>

                {/* Title */}
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-1.5 h-8 bg-teal-400 rounded-full"></div>
                    <h1 className="text-3xl font-bold text-gray-800">Checkout & Order Details</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
                    
                    {/* Left Column */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* Service Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100/80 flex flex-col sm:flex-row items-start gap-6">
                            {service.coverImage ? (
                                <img
                                    src={`${API_BASE}${service.coverImage}`}
                                    alt={service.title}
                                    className="w-[120px] h-[90px] object-cover rounded-xl shadow-sm"
                                />
                            ) : (
                                <div className="w-[120px] h-[90px] bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-xs text-gray-400 font-medium">
                                    No Image
                                </div>
                            )}
                            <div className="flex flex-col mt-1">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                                    {service.category}
                                </span>
                                <h3 className="text-[17px] font-bold text-gray-800 mb-2 leading-tight">{service.title}</h3>
                                <p className="text-[13px] font-medium text-gray-500">Delivery in {service.deliveryTime}</p>
                            </div>
                        </div>

                        {/* Order Requirements */}
                        <div className="bg-white rounded-2xl p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100/80">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-100">1</div>
                                <h2 className="text-[19px] font-bold text-gray-800">Order Requirements</h2>
                            </div>
                            <p className="text-gray-500 text-[13px] mb-8 font-medium">Provide specific instructions, details, or brand guidelines for the seller to get started.</p>
                            
                            <div className="mb-8">
                                <label className="block text-[13px] font-bold text-gray-700 mb-2.5">Instructions for Seller <span className="text-red-500">*</span></label>
                                <textarea 
                                    rows="4" 
                                    value={requirements}
                                    onChange={(e) => setRequirements(e.target.value)}
                                    className="w-full bg-[#f8fafc] border border-gray-200/80 rounded-xl p-4 text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors resize-none placeholder-gray-400 font-medium"
                                    placeholder="E.g., I need a modern logo using blue and white. Please include the source files."
                                />
                            </div>

                            <div>
                                <label className="block text-[13px] font-bold text-gray-700 mb-2.5">Attachments (Optional)</label>
                                <label className="border border-dashed border-gray-300/80 rounded-[14px] p-8 flex flex-col items-center justify-center bg-[#f8fafc] hover:bg-gray-50 cursor-pointer transition-colors group">
                                    <input type="file" className="hidden" onChange={(e) => setMainAttachment(e.target.files[0])} />
                                    <Upload className={`w-6 h-6 mb-3 transition-colors ${mainAttachment ? 'text-indigo-500' : 'text-gray-400/80 group-hover:text-indigo-500'}`} />
                                    <span className="text-[13px] font-bold text-gray-600 mb-1">{mainAttachment ? mainAttachment.name : 'Upload a file'}</span>
                                    {!mainAttachment && <span className="text-[11px] text-gray-400/80 font-bold uppercase tracking-wider">PNG, JPG, PDF up to 10MB</span>}
                                </label>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white rounded-2xl p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100/80">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-100">2</div>
                                <h2 className="text-[19px] font-bold text-gray-800">Payment Method</h2>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {/* Card Payment */}
                                <div 
                                    onClick={() => setPaymentMethod('card')} 
                                    className={`flex flex-col items-center justify-center py-7 px-4 rounded-xl border-[1.5px] cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-indigo-600 bg-indigo-50/10 shadow-sm' : 'border-gray-200/80 hover:border-gray-300'}`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 transition-colors ${paymentMethod === 'card' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        <CreditCard className="w-[18px] h-[18px]" />
                                    </div>
                                    <span className={`text-[13px] font-bold ${paymentMethod === 'card' ? 'text-gray-900' : 'text-gray-600'}`}>Card Payment</span>
                                </div>
                                
                                {/* Bank Transfer */}
                                <div 
                                    onClick={() => setPaymentMethod('bank')} 
                                    className={`flex flex-col items-center justify-center py-7 px-4 rounded-xl border-[1.5px] cursor-pointer transition-all ${paymentMethod === 'bank' ? 'border-indigo-600 bg-indigo-50/10 shadow-sm' : 'border-gray-200/80 hover:border-gray-300'}`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 transition-colors ${paymentMethod === 'bank' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        <Landmark className="w-[18px] h-[18px]" />
                                    </div>
                                    <span className={`text-[13px] font-bold ${paymentMethod === 'bank' ? 'text-gray-900' : 'text-gray-600'}`}>Bank Transfer</span>
                                </div>
                            </div>

                            {/* Payment Details Section */}
                            <div className="mt-8 pt-8 border-t border-gray-100/80">
                                {paymentMethod === 'card' && (
                                    <div className="space-y-4 animate-fade-in-up">
                                        <h3 className="text-[15px] font-bold text-gray-800 mb-4">Card Details</h3>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-2">Cardholder Name</label>
                                            <input 
                                                type="text" 
                                                value={cardName} 
                                                onChange={(e) => setCardName(e.target.value)} 
                                                onBlur={() => handleBlur('cardName')}
                                                placeholder="John Doe" 
                                                className={`w-full bg-[#f8fafc] border rounded-xl p-3.5 text-[13px] text-gray-700 focus:outline-none focus:ring-2 transition-colors placeholder-gray-400 font-medium ${getCardError('cardName') ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200/80 focus:ring-indigo-500/20 focus:border-indigo-400'}`} 
                                            />
                                            {getCardError('cardName') && <p className="text-red-500 text-[10px] mt-1.5 font-bold">{getCardError('cardName')}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-2">Card Number</label>
                                            <input 
                                                type="text" 
                                                value={cardNumber} 
                                                onChange={handleCardNumberChange} 
                                                onBlur={() => handleBlur('cardNumber')}
                                                placeholder="0000 0000 0000 0000" 
                                                className={`w-full bg-[#f8fafc] border rounded-xl p-3.5 text-[13px] text-gray-700 focus:outline-none focus:ring-2 transition-colors placeholder-gray-400 font-medium ${getCardError('cardNumber') ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200/80 focus:ring-indigo-500/20 focus:border-indigo-400'}`} 
                                            />
                                            {getCardError('cardNumber') && <p className="text-red-500 text-[10px] mt-1.5 font-bold">{getCardError('cardNumber')}</p>}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 mb-2">Expiry Date</label>
                                                <input 
                                                    type="text" 
                                                    value={cardExpiry} 
                                                    onChange={handleCardExpiryChange} 
                                                    onBlur={() => handleBlur('cardExpiry')}
                                                    placeholder="MM/YY" 
                                                    className={`w-full bg-[#f8fafc] border rounded-xl p-3.5 text-[13px] text-gray-700 focus:outline-none focus:ring-2 transition-colors placeholder-gray-400 font-medium ${getCardError('cardExpiry') ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200/80 focus:ring-indigo-500/20 focus:border-indigo-400'}`} 
                                                />
                                                {getCardError('cardExpiry') && <p className="text-red-500 text-[10px] mt-1.5 font-bold">{getCardError('cardExpiry')}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 mb-2">CVC</label>
                                                <input 
                                                    type="text" 
                                                    value={cardCVC} 
                                                    onChange={handleCardCVCChange} 
                                                    onBlur={() => handleBlur('cardCVC')}
                                                    placeholder="123" 
                                                    className={`w-full bg-[#f8fafc] border rounded-xl p-3.5 text-[13px] text-gray-700 focus:outline-none focus:ring-2 transition-colors placeholder-gray-400 font-medium ${getCardError('cardCVC') ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200/80 focus:ring-indigo-500/20 focus:border-indigo-400'}`} 
                                                />
                                                {getCardError('cardCVC') && <p className="text-red-500 text-[10px] mt-1.5 font-bold">{getCardError('cardCVC')}</p>}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {paymentMethod === 'bank' && (
                                    <div className="space-y-6 animate-fade-in-up">
                                        <div>
                                            <h3 className="text-[15px] font-bold text-gray-800 mb-2">Bank Transfer Details</h3>
                                            <p className="text-[13px] text-gray-500 font-medium mb-4">Please transfer the total amount to the following bank account and upload the receipt.</p>
                                            
                                            <div className="bg-[#f8fafc] border border-gray-200/80 rounded-xl p-5 space-y-3">
                                                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100">
                                                    <span className="text-xs font-bold text-gray-500">Bank Name</span>
                                                    <span className="text-[13px] font-bold text-gray-800">Commercial Bank</span>
                                                </div>
                                                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100">
                                                    <span className="text-xs font-bold text-gray-500">Account Name</span>
                                                    <span className="text-[13px] font-bold text-gray-800">UniGig Pvt Ltd</span>
                                                </div>
                                                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100">
                                                    <span className="text-xs font-bold text-gray-500">Account Number</span>
                                                    <span className="text-[13px] font-black text-indigo-600">800 234 5678</span>
                                                </div>
                                                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100">
                                                    <span className="text-xs font-bold text-gray-500">Branch</span>
                                                    <span className="text-[13px] font-bold text-gray-800">Colombo 03</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-2.5">Upload Payment Receipt <span className="text-red-500">*</span></label>
                                            <label className="border border-dashed border-gray-300/80 rounded-xl p-6 flex flex-col items-center justify-center bg-[#f8fafc] hover:bg-gray-50 cursor-pointer transition-colors group">
                                                <input type="file" className="hidden" onChange={(e) => setReceiptFile(e.target.files[0])} />
                                                <Upload className={`w-5 h-5 mb-2 transition-colors ${receiptFile ? 'text-indigo-500' : 'text-gray-400/80 group-hover:text-indigo-500'}`} />
                                                <span className="text-xs font-bold text-gray-600 mb-1">{receiptFile ? receiptFile.name : 'Upload Receipt'}</span>
                                                {!receiptFile && <span className="text-[10px] text-gray-400/80 font-bold uppercase tracking-wider">PNG, JPG, PDF up to 5MB</span>}
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-28 bg-transparent">
                            <h2 className="text-xl font-bold text-gray-800 mb-8 pt-1">Order Summary</h2>
                            
                            <div className="space-y-4 mb-10">
                                <div className="flex justify-between items-center text-[13px]">
                                    <span className="text-gray-500 font-medium">Service Subtotal</span>
                                    <span className="font-bold text-gray-800">LKR {service.price.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-[13px]">
                                    <span className="text-gray-500 font-medium">Service Fee (5%)</span>
                                    <span className="font-bold text-gray-800">LKR {serviceFee.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="flex flex-col mb-10">
                                <span className="text-[10px] uppercase font-bold text-gray-400 text-right mb-1">LKR</span>
                                <div className="flex justify-between items-end">
                                    <span className="text-[13px] font-bold text-gray-600 pb-1.5">Total Amount</span>
                                    <span className="text-4xl font-black text-gray-800 tracking-tight">{totalAmount.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534] p-4 rounded-[14px] flex items-start gap-3 mb-8">
                                <ShieldCheck className="w-5 h-5 text-[#22c55e] flex-shrink-0 mt-0.5" />
                                <p className="text-[11px] font-semibold leading-relaxed">
                                    Payment is held securely by UniGig and only released when you approve the delivered work.
                                </p>
                            </div>

                            <div>
                                <button 
                                    disabled={!isReadyToPay || isProcessing}
                                    onClick={handleConfirmPay}
                                    className={`w-full py-4 rounded-[14px] font-bold text-[15px] transition-all duration-300 flex justify-center items-center gap-2 ${
                                        isReadyToPay 
                                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer shadow-lg shadow-indigo-200' 
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    {isProcessing ? (
                                        <>
                                        <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                        Processing...
                                    </>
                                ) : (
                                    'Checkout & Pay'
                                )}
                            </button>
                            
                            {!isReadyToPay && (
                                <p className="text-center text-[11px] font-bold text-gray-400/80 mt-4">
                                    Please complete payment details to continue.
                                </p>
                            )}
                        </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Checkout;
