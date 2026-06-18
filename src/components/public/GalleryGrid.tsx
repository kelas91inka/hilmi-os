'use client';

import { useState } from 'react';
import { X, ZoomIn } from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  image_url: string;
  description: string | null;
  created_at: string;
}

interface GalleryGridProps {
  items: GalleryItem[];
}

export function GalleryGrid({ items }: GalleryGridProps) {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  if (items.length === 0) {
    return (
      <div className="text-center py-24 border-2 border-dashed rounded-2xl bg-card">
        <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ZoomIn className="w-8 h-8 text-muted-foreground/30" />
        </div>
        <p className="text-muted-foreground text-lg font-medium">
          Belum ada foto di galeri.
        </p>
        <p className="text-muted-foreground/60 text-sm mt-1">
          Galeri akan segera diperbarui.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Masonry-style grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="break-inside-avoid group cursor-pointer relative overflow-hidden rounded-2xl border bg-card hover:shadow-lg transition-all duration-300"
            onClick={() => setSelectedItem(item)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-end p-4">
              <div className="translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <p className="text-white font-semibold text-sm line-clamp-1">
                  {item.title}
                </p>
                {item.description && (
                  <p className="text-white/70 text-xs line-clamp-1 mt-0.5">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
            {/* Zoom icon */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow">
                <ZoomIn className="w-4 h-4 text-gray-800" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute -top-10 right-0 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Image */}
            <div className="rounded-2xl overflow-hidden bg-black/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedItem.image_url}
                alt={selectedItem.title}
                className="w-full max-h-[75vh] object-contain"
              />
            </div>

            {/* Caption */}
            {(selectedItem.title || selectedItem.description) && (
              <div className="mt-4 text-center">
                <p className="text-white font-semibold">{selectedItem.title}</p>
                {selectedItem.description && (
                  <p className="text-white/60 text-sm mt-1">
                    {selectedItem.description}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
