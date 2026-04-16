import React from 'react';

interface GalleryPageProps {
  galleryImages: string[];
}

const GalleryPage: React.FC<GalleryPageProps> = ({ galleryImages }) => {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold flex items-center gap-3 text-slate-900">
          <span className="w-1.5 h-8 bg-blue-600 rounded-full"></span>创作画廊
        </h2>
        <span className="text-sm font-semibold text-slate-400 bg-slate-100 px-4 py-1.5 rounded-full">
          共 {galleryImages.length} 件作品
        </span>
      </div>

      {galleryImages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
          <div className="p-6 bg-white rounded-full text-slate-200 mb-6 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
          </div>
          <p className="text-slate-400 font-medium">还没有任何作品，开始你的第一次创作吧</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-8">
          {galleryImages.map((img, i) => (
            <div key={i} className="group relative aspect-video bg-slate-100 rounded-[2rem] overflow-hidden border border-slate-200 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
              <img src={img} className="w-full h-full object-cover" alt={`Gallery ${i}`} />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button className="p-3 bg-white rounded-2xl text-slate-900 shadow-xl hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
