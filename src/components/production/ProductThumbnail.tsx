import React from 'react';
import { Maximize2 } from 'lucide-react';

interface ProductThumbnailProps {
  url: string;
  onClick: () => void;
}

const ProductThumbnail: React.FC<ProductThumbnailProps> = ({ url, onClick }) => (
  <div 
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/50 shadow-md cursor-zoom-in group transition-transform active:scale-95"
  >
    <img src={url} alt="Bánh" className="w-full h-full object-cover" />
    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
    <div className="absolute bottom-1 right-1 p-0.5 bg-white/80 rounded-md text-slate-800 opacity-0 group-hover:opacity-100 transition-opacity">
      <Maximize2 size={10} />
    </div>
  </div>
);

export default ProductThumbnail;
