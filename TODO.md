# TODO

- [ ] Implement `dismissOnBackdrop?: boolean` prop and accessible backdrop click cancel in `src/components/ConfirmDialog.tsx` (guard clicks so only backdrop—not panel—cancels).
- [ ] Update JSDoc documentation for the new prop.
- [ ] Extend tests in `src/components/__tests__/ConfirmDialog.test.tsx`:
  - [ ] backdrop click cancels only when enabled
  - [ ] backdrop click does not cancel when prop is off
  - [ ] clicks inside dialog panel do not cancel (when enabled)
  - [ ] Escape handling remains unchanged
- [ ] Run `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build`.
- [ ] Capture/record npm test output and add short a11y note in final summary.

