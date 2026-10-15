import '@testing-library/jest-dom/vitest'

// Mantine needs these in jsdom.
window.matchMedia ||= () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} })
window.ResizeObserver ||= class { observe() {} unobserve() {} disconnect() {} }
window.HTMLElement.prototype.scrollIntoView ||= () => {}
