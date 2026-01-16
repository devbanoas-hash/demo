import { useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface ImageZoomModalProps {
    images: string[];
    currentIndex: number;
    onClose: () => void;
    onNavigate: (newIndex: number) => void;
}

const ImageZoomModal = ({ images, currentIndex, onClose, onNavigate }: ImageZoomModalProps) => {
    if (!images || images.length === 0) return null;
    
    const currentImage = images[currentIndex];
    const totalImages = images.length;

    const handlePrev = () => {
        const newIndex = currentIndex > 0 ? currentIndex - 1 : totalImages - 1;
        onNavigate(newIndex);
    };

    const handleNext = () => {
        const newIndex = currentIndex < totalImages - 1 ? currentIndex + 1 : 0;
        onNavigate(newIndex);
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowLeft') {
                const newIndex = currentIndex > 0 ? currentIndex - 1 : totalImages - 1;
                onNavigate(newIndex);
            } else if (e.key === 'ArrowRight') {
                const newIndex = currentIndex < totalImages - 1 ? currentIndex + 1 : 0;
                onNavigate(newIndex);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, totalImages, onClose, onNavigate]);

    return (
        <div 
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors z-10"
            >
                <X size={20} />
            </button>

            {/* Image Container */}
            <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                {/* Previous Button */}
                {totalImages > 1 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handlePrev();
                        }}
                        className="absolute left-4 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all z-10"
                    >
                        <ChevronLeft size={24} />
                    </button>
                )}

                {/* Image */}
                <img 
                    src={currentImage} 
                    alt={`Ảnh ${currentIndex + 1} của ${totalImages}`}
                    className="max-w-full max-h-[90vh] object-contain rounded-lg"
                    loading="lazy"
                />

                {/* Next Button */}
                {totalImages > 1 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleNext();
                        }}
                        className="absolute right-4 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all z-10"
                    >
                        <ChevronRight size={24} />
                    </button>
                )}

                {/* Image Counter */}
                {totalImages > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold">
                        {currentIndex + 1} / {totalImages}
                    </div>
                )}
            </div>
        </div>
    );
}
 
export default ImageZoomModal;