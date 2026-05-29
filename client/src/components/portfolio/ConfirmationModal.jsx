import { AlertTriangle, X } from 'lucide-react';

function ConfirmationModal({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger' }) {
    if (!isOpen) return null;

    const accentColor = type === 'danger' ? '#ff6b6b' : '#4a3fb9';
    const bgColor = type === 'danger' ? 'bg-red-50' : 'bg-[#f0f0ff]';
    const textColor = type === 'danger' ? 'text-red-500' : 'text-[#4a3fb9]';

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div 
                className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative p-8">
                    <button 
                        onClick={onCancel}
                        className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex flex-col items-center text-center">
                        <div className={`p-4 ${bgColor} ${textColor} rounded-2xl mb-6`}>
                            <AlertTriangle size={32} />
                        </div>
                        
                        <h3 className="text-xl font-black text-[#1a1a2e] mb-2">{title}</h3>
                        <p className="text-sm font-medium text-gray-500 leading-relaxed mb-8">
                            {message}
                        </p>

                        <div className="flex w-full gap-4">
                            <button 
                                onClick={onCancel}
                                className="flex-1 py-3 bg-gray-100 text-gray-600 font-black rounded-xl hover:bg-gray-200 transition-all uppercase tracking-widest text-[10px]"
                            >
                                {cancelText}
                            </button>
                            <button 
                                onClick={onConfirm}
                                className="flex-1 py-3 text-white font-black rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 uppercase tracking-widest text-[10px]"
                                style={{ backgroundColor: accentColor }}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ConfirmationModal;
