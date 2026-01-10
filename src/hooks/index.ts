// Barrel file for UI hooks (front-only).
// Nota: NO uses "use client" aquí para no forzar client boundary en consumidores.

export * from './useDisclosure';
export * from './useLockBodyScroll';
export * from './useOnClickOutside';
export * from './useKeyboardShortcut';
export * from './usePrefersReducedMotion';
export * from './useIntersectionObserver';
export * from './useSectionInView';
export * from './useHeroReady';

// Si más adelante añades estos, descomenta:
// export * from './usePrefersReducedMotion';
// export * from './useIntersectionObserver';
