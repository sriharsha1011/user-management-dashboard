# User Management Dashboard

A React + Vite single-page app for viewing, adding, editing, and deleting users against the [JSONPlaceholder](https://jsonplaceholder.typicode.com/) mock REST API.

---

## Features

- **View** — fetches all users from `GET /users` on load.
- **Add** — modal form, `POST /users` (simulated by the API; see Assumptions below).
- **Edit** — modal form pre-filled with the selected user, `PUT /users/:id`.
- **Delete** — confirmation dialog, `DELETE /users/:id`.
- **Search** — single search box matches first name, last name, email, and department.
- **Filter** — slide-in drawer with independent filters for first name, last name, email, and department (combinable with search and with each other).
- **Sort** — click any column header to sort ascending/descending.
- **Pagination** — 10 / 25 / 50 / 100 rows per page, with page-number controls.
- **Infinite scroll** — alternate view mode (toggle in the toolbar) that loads more rows as you scroll, satisfying the "pagination OR infinite scroll" requirement with both implemented.
- **Validation** — required fields, minimum-length first name, and email format, checked on blur and on submit.
- **Error handling** — failed requests (network errors, timeouts, non-2xx responses) surface a dismissible banner with a retry option where relevant; the app never silently fails.
- **Responsive layout** — the table collapses into stacked cards below 720px wide.

---

## Tech stack

- **React 19** + **Vite** — fast dev server, small production bundle, no framework lock-in beyond React itself.
- **Axios** — HTTP client with a shared instance and a response interceptor that normalizes errors into user-friendly messages.
- **Plain CSS** (custom properties / design tokens, no UI framework) — kept the dependency surface small and gave full control over the look.
- No global state library — the app's state is small enough that a single custom hook (`useUsers`) is more transparent than introducing Redux/Zustand/etc.

---

## Getting started

### Prerequisites
- Node.js 18+ and npm.

### Install & run
```bash
npm install
npm run dev
```
Then open the URL Vite prints (typically `http://localhost:5173`).

### Production build
```bash
npm run build   # outputs to dist/
npm run preview # serve the production build locally
```

---

## Project structure

```
src/
  api/
    client.js         # configured axios instance + error normalization
    mappers.js         # JSONPlaceholder <-> internal user shape
    usersApi.js         # CRUD functions (fetchUsers, createUser, updateUser, deleteUser)
  hooks/
    useUsers.js         # central data hook: fetch, CRUD, search, filter, sort, pagination
    useInfiniteScrollSentinel.js  # IntersectionObserver helper for infinite scroll
  components/
    UsersTable.jsx      # sortable table / responsive cards
    PaginationBar.jsx    # page-size select + page navigation
    FilterDrawer.jsx     # slide-in filter panel
    UserForm.jsx         # add/edit modal with validation
    ConfirmDialog.jsx     # delete confirmation
    Icons.jsx            # small inline SVG icon set
  utils/
    validation.js       # form validation rules
  App.jsx / App.css      # layout, toolbar, wiring
  index.css             # design tokens (color, type, spacing)
```

The split keeps API concerns, state/business logic, and presentation in separate layers, so e.g. swapping JSONPlaceholder for a real backend should only touch `src/api/`.

---

## Assumptions & design decisions

JSONPlaceholder's `/users` objects don't actually contain `firstName`, `lastName`, or `department` fields — the spec asks for those, so I had to map them:

| Spec field | JSONPlaceholder source | Mapping rule |
|---|---|---|
| First name / Last name | `name` (e.g. `"Leanne Graham"`) | Split on the **first space**. Everything before it is first name, everything after is last name. Single-word names keep the whole name as first name with an empty last name. |
| Department | `company.name` | Used as-is, since there's no department concept in the API. |

This is a lossy, best-effort mapping and it shows at the edges of the seed data — e.g. user 6, `"Mrs. Dennis Schulist"`, splits to first name `Mrs.` / last name `Dennis Schulist`. I left this as-is rather than special-casing it, since handling titles "correctly" would mean guessing at a rule the spec doesn't define. The form lets you fix any name in-place via Edit.

Other notable decisions:

- **JSONPlaceholder doesn't persist writes.** `POST`, `PUT`, and `DELETE` all return a successful, "faked" response without actually creating/updating/deleting anything server-side — this is documented behavior of the API, not a bug. The app treats a successful response as authoritative and updates its **local** state to match, so the UI behaves like a real CRUD app within a session. A page refresh will reset the list back to the original 10 seed users, since there is nowhere real for the data to live. A note at the bottom of the page calls this out.
- **New user IDs.** JSONPlaceholder always echoes back `id: 11` for new users regardless of how many you add, which would cause collisions. The app instead assigns a local incrementing ID (starting at 1001) to anything JSONPlaceholder doesn't give a real unique ID to, so multiple adds in one session don't collide and remain individually editable/deletable within that session.
- **Two view modes, one data pipeline.** Pagination and infinite scroll are both implemented (the spec allows either) and share the exact same search/filter/sort pipeline — switching modes mid-session keeps your filters intact.
- **Validation** is intentionally light per the spec's "client-side validation" ask: required fields, a minimum length on first name, and an email format check. It is not trying to validate deliverability or anything server-side.
- **No router.** This is a single view with modals/drawers rather than separate pages, so `react-router` would have been unused weight, and was removed from dependencies.

---

## Challenges faced

- **JSONPlaceholder's non-persistence** was the biggest design fork early on: do I pretend writes persist (and silently lose data on refresh with no explanation), or do I make the simulated nature visible and design around it? I chose the latter — local state becomes the source of truth for the session, with a clear note in the UI, so the CRUD flows are fully testable without the user being confused about why a refresh reverts everything.
- **Mapping fields that don't exist on the API** (first/last name, department) meant picking a deterministic, explainable rule rather than something that looks right only on the demo data. The "Mrs. Dennis Schulist" case above is the cost of that choice, and I'd rather have a known, documented edge case than a hidden, undocumented one.
- **Responsive table layout**: collapsing a data table into mobile cards via CSS (rather than rendering a second markup structure) needed care — pseudo-element labels, hidden headers, and making sure no leftover desktop-only rule (like a fixed `min-width` meant to enable horizontal scroll on desktop) silently overrides the mobile layout. I caught exactly this bug during testing (the table was staying 720px wide inside a scroll container instead of collapsing) and fixed it by explicitly resetting `min-width` inside the mobile media query.
- **Combining search, filters, sort, and two pagination modes** without the logic turning into a tangle: centralizing all of it in one `useUsers` hook with a single derived pipeline (filter → search → sort → paginate/slice) kept the four features composable instead of each needing to know about the others.

## What I'd improve with more time

- **Optimistic UI with rollback** — currently the app waits for the API response before updating state; for a snappier feel I'd update state immediately and roll back only on failure.
- **Toast notifications** instead of (or alongside) the error banner for success states ("User added", "User deleted") to make confirmations more visible.
- **Persisted local changes** — layering `localStorage` (or IndexedDB) under the JSONPlaceholder calls so additions/edits survive a refresh within the same browser, while still hitting the real API for the "network request" half of the requirement.
- **Automated tests** — I relied on manual + Playwright-driven exploratory testing during development (mocking the API to verify each flow visually); given more time I'd add a small Vitest + React Testing Library suite for the hook's filter/sort/paginate logic and key component interactions, which are the parts most likely to regress silently.
- **Bulk actions** (multi-select + bulk delete) and **column visibility toggles**, which came up as natural extensions of the table but weren't in scope.
- **Debounced search** — currently search filters on every keystroke against an in-memory array, which is fine at this data size but I'd debounce it before reusing this pattern against a paginated real backend.
- **Accessibility pass with a screen reader**, beyond the aria-labels and visible focus states already in place — I'd want to verify the modal/drawer focus trapping and return-focus behavior with assistive tech, not just keyboard tabbing.

---

## Notes on testing this submission

If you run this behind a restrictive proxy/firewall and see network or CORS-looking errors, that's almost always an environment/proxy restriction rather than the app — JSONPlaceholder itself supports CORS for browser requests. The error banner and "Retry" button are exactly the UI you'd want in that scenario. During development I used Playwright with the API mocked to verify every flow end-to-end with real interaction (table render, sort, filter, search, add validation, add success, edit, delete confirm, mobile layout, pagination/infinite-scroll toggle) rather than relying on code review alone.
