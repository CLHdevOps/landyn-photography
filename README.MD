// Photo Sales Landing Page & Client Gallery (Passcode Protected)
// Stack: React + TailwindCSS (+ optional shadcn/ui for nicer UI) — single-file demo
// -----------------------------------------------------------------------------
// WHAT THIS DOES (demo)
// - Beautiful landing page for a photography service targeting families & sports.
// - Client access flow: enter passcode → load their private gallery.
// - Gallery grid with lightbox preview, add-to-cart, simple cart & mock checkout.
// - Admin "Upload" modal (demo-only) lets you create a new passcode-protected link
//   and upload multiple photos (simulated). In production, wire to your backend.
// - Purchase flow is mocked. Replace `handleCheckout()` with Stripe Checkout, etc.
//
// HOW TO USE
// - Drop this component into a React project (Vite/Next/CRA). Ensure Tailwind is set up.
// - (Optional) Install shadcn/ui if you want the exact UI components referenced here.
//   You can also replace them with your own minimal components if you prefer.
//
// PRODUCTION NOTES (swap the mock bits):
// - Storage: Firebase Storage / Supabase Storage / S3 for photo files.
// - Database: Firestore / Supabase / Postgres for galleries, items & orders.
// - AuthZ: Store passcodes as hashed (e.g., bcrypt) & verify server-side.
// - Checkout: Stripe Checkout or Payment Element; generate server session.
// - Signed URLs: Serve watermarked previews; deliver original after purchase.
// - Links: Use /g/[galleryId] deep links (+ passcode gate) so clients can return.
// - Expiry: Add expiration timestamps + rate limiting.
//
// Tailwind quickstart (Vite): https://tailwindcss.com/docs/guides/vite
// shadcn/ui: https://ui.shadcn.com
// -----------------------------------------------------------------------------