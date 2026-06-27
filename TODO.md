# TODO

- [x] Inspect existing numeric validation helper (`src/lib/validateNumber.ts`).
- [x] Verify usage/edit/new pages already import and use the helper.
- [ ] Update helper tests (`src/lib/__tests__/validateNumber.test.ts`) to cover required edge cases for both ranges.
- [ ] Adjust `src/app/usage/page.test.tsx` to assert validation message is surfaced through `TextField` error UI for non-integer requests.
- [ ] Update `README.md` with validation rule summary (price: >=0 int; requests: >=1 int).
- [ ] Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:coverage`.
- [ ] Ensure coverage threshold (>=95%) for helper + changed pages.
- [ ] Commit with message: `refactor(forms): extract shared numeric-field validation helper`.

