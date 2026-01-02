// src/features/gallery/ui/index.tsx
'use client';

import * as React from 'react';
import Image from 'next/image';
import Section from '@/ui/Section';

export type GalleryItem = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

type Props = {
  items: GalleryItem[];
  className?: string;
};

export default function GallerySection({ items, className }: Props) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const st = React.useRef({
    down: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    dragged: false,
  });

  // Arrastre horizontal manual (sin inercia, sin animaciones)
  const onPointerDown = (e: React.PointerEvent) => {
    const el = trackRef.current;
    if (!el) return;
    st.current.down = true;
    st.current.startX = e.pageX;
    st.current.startY = e.pageY;
    st.current.scrollLeft = el.scrollLeft;
    st.current.dragged = false;
    el.classList.add('dragging');
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const el = trackRef.current;
    if (!el || !st.current.down) return;

    const dx = e.pageX - st.current.startX;
    const dy = e.pageY - st.current.startY;

    // Solo interceptamos si el gesto es horizontal; vertical deja scrollear la página
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 2) {
      st.current.dragged = true;
      e.preventDefault(); // evita seleccionar texto/imagen mientras arrastras
      el.scrollLeft = st.current.scrollLeft - dx;
    }
  };

  const onPointerUp = () => {
    const el = trackRef.current;
    if (!el) return;
    st.current.down = false;
    el.classList.remove('dragging');
  };

  if (!items?.length) return null;

  return (
    <Section className={['mb-12 sm:mb-16', className].filter(Boolean).join(' ')}>
      {/* Full-bleed: rompe el contenedor central y ocupa todo el viewport */}
      <div className="relative ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] w-screen">
        <div
          ref={trackRef}
          role="region"
          aria-label="Gallery"
          className={[
            'relative',
            'overflow-x-auto overflow-y-visible',
            'flex gap-2 md:gap-3', // separación reducida
            'px-4 sm:px-6',        // gutters seguros en bordes
            'select-none',
            'cursor-grab [&.dragging]:cursor-grabbing',
            'touch-pan-y',         // NO bloquea scroll vertical en touch
            '[&::-webkit-scrollbar]:h-0',
          ].join(' ')}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          {items.map((item, i) => (
            <div
              key={`${item.src}-${i}`}
              className={[
                'shrink-0',
                // tamaño tipo card vertical
                'w-[64vw] sm:w-[44vw] md:w-[30vw] lg:w-[22vw] xl:w-[18vw]',
                'relative',
                'aspect-3/4',
                // puntas más marcadas (menos redondas)
                'rounded-sm',
                'overflow-hidden',
              ].join(' ')}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(max-width: 640px) 64vw, (max-width: 768px) 44vw, (max-width: 1024px) 30vw, (max-width: 1280px) 22vw, 18vw"
                loading="lazy"
                decoding="async"
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                className="object-cover pointer-events-none select-none [-webkit-user-drag:none]"
              />
            </div>
          ))}
          {/* pequeño spacer para que el último no quede pegado al borde */}
          <div aria-hidden className="shrink-0 w-2 md:w-3" />
        </div>
      </div>
    </Section>
  );
}
