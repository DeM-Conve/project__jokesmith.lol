// jsdom has no FontFaceSet; Mantine's autosize Textarea listens on document.fonts.
if (!document.fonts) {
  Object.defineProperty(document, 'fonts', {
    value: { addEventListener() {}, removeEventListener() {}, ready: Promise.resolve() },
    configurable: true,
  })
}
