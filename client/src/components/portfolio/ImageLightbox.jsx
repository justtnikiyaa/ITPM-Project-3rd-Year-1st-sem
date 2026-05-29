import { X, ZoomIn, Download } from 'lucide-react';

function ImageLightbox({ isOpen, imageUrl, title, onClose }) {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-10 transition-opacity duration-300 animate-in fade-in"
            onClick={onClose}
        >
            <div className="relative max-w-5xl w-full max-h-full flex flex-col items-center animate-in zoom-in-95 duration-300">
                <button 
                    onClick={onClose}
                    className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors p-2"
                    aria-label="Close"
                >
                    <X size={32} />
                </button>
                
                <div className="relative group overflow-hidden rounded-xl shadow-2xl bg-white/5 p-1" onClick={(e) => e.stopPropagation()}>
                    <img 
                        src={imageUrl} 
                        alt={title} 
                        className="max-w-full max-h-[80vh] rounded-lg object-contain"
                    />
                    
                    <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
                        <h3 className="text-xl font-bold">{title}</h3>
                        <div className="flex gap-4 mt-2">
                            <a 
                                href={imageUrl} 
                                download 
                                className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Download size={16} /> Download
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ImageLightbox;
