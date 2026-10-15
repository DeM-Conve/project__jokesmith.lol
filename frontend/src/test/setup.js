import '@testing-library/jest-dom/vitest'

// Mantine needs these in jsdom.
window.matchMedia ||= () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} })
window.ResizeObserver ||= class { observe() {} unobserve() {} disconnect() {} }
window.HTMLElement.prototype.scrollIntoView ||= () => {}
// jsdom has no FontFaceSet; Mantine's autosize Textarea listens on document.fonts.
if (!document.fonts) {
  Object.defineProperty(document, 'fonts', {
    value: { addEventListener() {}, removeEventListener() {}, ready: Promise.resolve() },
    configurable: true,
  })
}
