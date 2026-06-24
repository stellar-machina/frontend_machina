- [ ] Update src/app/admin/page.tsx with a real latest-wins stale-status guard using useRef.
- [ ] Ensure load useCallback is stable (no statusSeq deps) and remove eslint-disable hacks for deps.
- [ ] Add/extend unit tests in src/app/admin/page.test.tsx to verify out-of-order status responses are ignored, latest response wins, and toggle refresh works.
- [ ] Add a JSDoc note documenting latest-wins semantics.
- [ ] Run npm run lint, npm run typecheck, npm test, npm run build.
- [ ] Verify tests cover edge cases (slow then fast status, toggle during in-flight status, unmount during fetch, load error).
- [ ] Commit changes with message: refactor(admin): replace dead statusSeq with working latest-wins guard
- [ ] Push branch to GitHub.

