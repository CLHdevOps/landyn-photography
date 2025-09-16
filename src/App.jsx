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

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Lock, Upload, Camera, Sparkles, Shield, GalleryHorizontalEnd, X, Check, CreditCard, Eye } from "lucide-react";
// You can swap these imports with your own if you're not using shadcn/ui
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/toaster";

// ------------------------------
// Mock In-Memory Data Store
// ------------------------------
// In production, replace with API calls.
const initialGalleries = {
  // Example pre-seeded sports gallery
  "HUSKIES-0907": {
    id: "HUSKIES-0907",
    label: "Huskies vs Wildcats (Sept 7)",
    coverUrl: "https://images.unsplash.com/photo-1521417531039-74fdf9de0c3b?q=80&w=2000&auto=format&fit=crop",
    passcode: "huskies2025", // DEMO ONLY — store hashed on server in production
    price: 25, // price per photo (USD)
    photos: [
      {
        id: "p1",
        url: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1800&auto=format&fit=crop",
        thumb: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=600&auto=format&fit=crop",
        title: "Game Winner",
        tags: ["sports", "action"],
      },
      {
        id: "p2",
        url: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=1800&auto=format&fit=crop",
        thumb: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=600&auto=format&fit=crop",
        title: "Slide into Home",
        tags: ["sports"],
      },
      {
        id: "p3",
        url: "https://images.unsplash.com/photo-1582582429416-9fa99ce1a7c4?q=80&w=1800&auto=format&fit=crop",
        thumb: "https://images.unsplash.com/photo-1582582429416-9fa99ce1a7c4?q=80&w=600&auto=format&fit=crop",
        title: "Team Huddle",
        tags: ["team"],
      },
    ],
  },
  // Example pre-seeded family gallery
  "SMITH-FAMILY": {
    id: "SMITH-FAMILY",
    label: "Smith Family — Fall Minis",
    coverUrl: "https://images.unsplash.com/photo-1441123694162-e54a981ceba3?q=80&w=2000&auto=format&fit=crop",
    passcode: "smith2025", // DEMO ONLY
    price: 30,
    photos: [
      {
        id: "f1",
        url: "https://images.unsplash.com/photo-1583336663277-620dc1996580?q=80&w=1800&auto=format&fit=crop",
        thumb: "https://images.unsplash.com/photo-1583336663277-620dc1996580?q=80&w=600&auto=format&fit=crop",
        title: "Golden Hour",
        tags: ["family", "portrait"],
      },
      {
        id: "f2",
        url: "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?q=80&w=1800&auto=format&fit=crop",
        thumb: "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?q=80&w=600&auto=format&fit=crop",
        title: "Candid Laughs",
        tags: ["family"],
      },
      {
        id: "f3",
        url: "https://images.unsplash.com/photo-1551218808-94e220e084d2?q=80&w=1800&auto=format&fit=crop",
        thumb: "https://images.unsplash.com/photo-1551218808-94e220e084d2?q=80&w=600&auto=format&fit=crop",
        title: "Walk in the Park",
        tags: ["family"],
      },
    ],
  },
};

// Utility watermark overlay for previews (client-visible before purchase)
function WatermarkedImage({ src, alt }) {
  return (
    <div className="relative group">
      <img src={src} alt={alt} className="h-64 w-full object-cover rounded-xl" />
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <span className="text-white/70 text-3xl font-bold rotate-[-20deg] tracking-widest select-none">
          SAMPLE
        </span>
      </div>
      <div className="absolute inset-0 rounded-xl ring-1 ring-white/10 group-hover:ring-white/30 transition" />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=2500&auto=format&fit=crop"
        alt="Sports action background"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      <div className="relative mx-auto max-w-7xl px-6 py-28 text-white">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-extrabold tracking-tight"
        >
          Freeze the Moment. <span className="text-white/80">Own the Memory.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-4 max-w-2xl text-lg md:text-xl text-white/90"
        >
          Premium family portraits and high‑energy sports action shots. View your private gallery with a passcode and purchase digital downloads in seconds.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-8 flex flex-wrap gap-3"
        >
          <a href="#client-access">
            <Button size="lg" className="rounded-2xl px-6 text-base">
              <Lock className="mr-2 h-5 w-5" /> Access My Gallery
            </Button>
          </a>
          <a href="#portfolio">
            <Button size="lg" variant="secondary" className="rounded-2xl px-6 text-base">
              <GalleryHorizontalEnd className="mr-2 h-5 w-5" /> See Portfolio
            </Button>
          </a>
        </motion.div>
        <div className="mt-10 flex items-center gap-4">
          <Badge className="bg-emerald-500/90">24‑48hr Delivery</Badge>
          <Badge className="bg-indigo-500/90">Passcode Protected</Badge>
          <Badge className="bg-rose-500/90">Watermarked Previews</Badge>
        </div>
      </div>
    </section>
  );
}

function FeatureGrid() {
  const features = [
    {
      icon: <Camera className="h-6 w-6" />, title: "Family & Sports Pros",
      desc: "From golden‑hour portraits to game‑winning moments, captured crisply."
    },
    {
      icon: <Shield className="h-6 w-6" />, title: "Private Galleries",
      desc: "Share a simple link gated by a passcode. You control who sees it."
    },
    {
      icon: <CreditCard className="h-6 w-6" />, title: "Fast, Secure Checkout",
      desc: "Buy individual photos or bundles. Instant download delivery."
    },
    {
      icon: <Sparkles className="h-6 w-6" />, title: "Pro‑Level Finishing",
      desc: "Color‑true edits and optional retouching available at checkout."
    },
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid gap-6 md:grid-cols-4">
        {features.map((f, idx) => (
          <Card key={idx} className="rounded-2xl border-white/10 bg-white/5 backdrop-blur">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="rounded-xl bg-white/10 p-3 text-white">{f.icon}</div>
              <CardTitle className="text-lg">{f.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-white/70 -mt-2 pb-6">{f.desc}</CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function PortfolioShowcase() {
  const samples = [
    "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1583336663277-620dc1996580?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1551218808-94e220e084d2?q=80&w=1600&auto=format&fit=crop",
  ];
  return (
    <section id="portfolio" className="mx-auto max-w-7xl px-6 pb-16">
      <h2 className="text-2xl md:text-3xl font-bold mb-6">Featured Work</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {samples.map((src, i) => (
          <div key={i} className="overflow-hidden rounded-2xl">
            <img src={src} alt="Portfolio sample" className="h-64 w-full object-cover hover:scale-105 transition" />
          </div>
        ))}
      </div>
    </section>
  );
}

function ClientAccess({ onOpenGallery }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleOpen = () => {
    setError("");
    onOpenGallery(code, (ok) => {
      if (!ok) setError("Invalid passcode or gallery not found.");
    });
  };

  return (
    <section id="client-access" className="mx-auto max-w-7xl px-6 pb-16">
      <Card className="rounded-2xl border-white/10 bg-white/5 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5"/> Access Your Private Gallery</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <div>
              <Label htmlFor="passcode">Passcode</Label>
              <Input id="passcode" placeholder="e.g. huskies2025" value={code} onChange={(e)=>setCode(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button className="w-full md:w-auto rounded-xl" onClick={handleOpen}>Open Gallery</Button>
            </div>
          </div>
          {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}
          <p className="mt-3 text-xs text-white/60">Tip: Save your gallery link and passcode to revisit anytime.</p>
        </CardContent>
      </Card>
    </section>
  );
}

function AdminUpload({ onCreateGallery }) {
  // DEMO admin upload (no auth). Replace with real admin login.
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [passcode, setPasscode] = useState("");
  const [price, setPrice] = useState(25);
  const [files, setFiles] = useState([]);

  const handleCreate = () => {
    // Create a simple id from label
    const id = label.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    if (!id || !passcode || !files?.length) return;

    // Map files to preview object URLs (in prod: upload & store real URLs)
    const photos = Array.from(files).map((f, i) => ({
      id: `${id}-${i}`,
      url: URL.createObjectURL(f), // demo only
      thumb: URL.createObjectURL(f),
      title: f.name,
      tags: [],
    }));

    const coverUrl = photos[0]?.url;
    onCreateGallery({ id, label, passcode, photos, price, coverUrl });
    setOpen(false);
    setLabel("");
    setPasscode("");
    setFiles([]);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 pb-8">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="rounded-xl"><Upload className="h-4 w-4 mr-2"/> Admin: Upload Gallery (Demo)</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Upload New Gallery</DialogTitle>
            <DialogDescription>Demo-only uploader. Replace with authenticated admin tools + cloud storage in production.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Gallery Label</Label>
              <Input placeholder="e.g. Johnson Family — Fall 2025" value={label} onChange={(e)=>setLabel(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Client Passcode</Label>
              <Input placeholder="e.g. johnson2025" value={passcode} onChange={(e)=>setPasscode(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Price per Photo (USD)</Label>
              <Input type="number" value={price} onChange={(e)=>setPrice(parseFloat(e.target.value||"0"))} />
            </div>
            <div className="grid gap-2">
              <Label>Photos</Label>
              <Input type="file" accept="image/*" multiple onChange={(e)=>setFiles(e.target.files)} />
              <p className="text-xs text-muted-foreground">You can drag/drop or select multiple files. In production, upload to cloud + store URLs.</p>
            </div>
            <div className="flex justify-end">
              <Button className="rounded-xl" onClick={handleCreate}>
                <Check className="h-4 w-4 mr-2"/> Create Gallery
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Lightbox({ photo, onClose }) {
  if (!photo) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/90 p-4 md:p-8">
      <button onClick={onClose} className="absolute right-4 top-4 rounded-full bg-white/10 p-2 hover:bg-white/20">
        <X className="h-6 w-6 text-white" />
      </button>
      <div className="h-full w-full grid place-items-center">
        <img src={photo.url} alt={photo.title} className="max-h-full max-w-full object-contain" />
      </div>
    </div>
  );
}

function CartSheet({ items, onRemove, onCheckout, open, setOpen, priceMap }) {
  const total = items.reduce((sum, it) => sum + (priceMap[it.galleryId] ?? 0), 0);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-[420px]">
        <SheetHeader>
          <SheetTitle>Your Cart</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Your cart is empty.</p>
          ) : (
            items.map((it) => (
              <div key={it.id} className="flex items-center gap-3">
                <img src={it.thumb} alt={it.title} className="h-16 w-16 rounded-lg object-cover" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{it.title}</div>
                  <div className="text-xs text-muted-foreground">{it.galleryLabel}</div>
                </div>
                <div className="text-sm font-medium">${priceMap[it.galleryId] ?? 0}</div>
                <Button variant="ghost" size="icon" onClick={() => onRemove(it.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
        <div className="mt-6 flex items-center justify-between border-t pt-4">
          <div className="text-base font-semibold">Total</div>
          <div className="text-lg font-bold">${total}</div>
        </div>
        <div className="mt-4">
          <Button className="w-full rounded-xl" disabled={items.length===0} onClick={onCheckout}>
            <CreditCard className="mr-2 h-5 w-5"/> Checkout
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function GalleryView({ gallery, onAddToCart }) {
  const [active, setActive] = useState(null);

  return (
    <section className="mx-auto max-w-7xl px-6 pb-16">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl md:text-2xl font-bold">{gallery.label}</h3>
          <p className="text-sm text-white/70">Select photos to purchase. Previews are watermarked; downloads are full‑resolution and unwatermarked.</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Badge className="bg-white/10">${gallery.price} / photo</Badge>
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {gallery.photos.map((p) => (
          <div key={p.id} className="group">
            <button className="w-full" onClick={() => setActive(p)}>
              <WatermarkedImage src={p.thumb} alt={p.title} />
            </button>
            <div className="mt-2 flex items-center justify-between">
              <div className="text-sm font-medium truncate pr-2">{p.title}</div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" className="rounded-xl" onClick={() => setActive(p)}>
                  <Eye className="h-4 w-4 mr-1"/>View
                </Button>
                <Button size="sm" className="rounded-xl" onClick={() => onAddToCart({ ...p })}>
                  <ShoppingCart className="h-4 w-4 mr-1"/>Add
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Lightbox photo={active} onClose={() => setActive(null)} />
    </section>
  );
}

export default function PhotoSalesApp() {
  const [galleries, setGalleries] = useState(initialGalleries);
  const [currentGallery, setCurrentGallery] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  const priceMap = useMemo(() => {
    const m = {};
    Object.values(galleries).forEach((g) => (m[g.id] = g.price));
    return m;
  }, [galleries]);

  // Client passes a passcode; we try to find matching gallery
  const handleOpenGallery = (passcode, cb) => {
    const match = Object.values(galleries).find((g) => g.passcode === passcode);
    if (match) {
      setCurrentGallery(match);
      window.history.replaceState({}, "", `#g/${match.id}`); // shallow deep-link
      cb?.(true);
    } else {
      cb?.(false);
    }
  };

  // Admin creates a new gallery (demo only — no persistence on refresh)
  const handleCreateGallery = ({ id, label, passcode, photos, price, coverUrl }) => {
    setGalleries((prev) => ({
      ...prev,
      [id]: { id, label, passcode, photos, price: price || 25, coverUrl },
    }));
  };

  // Add photo to cart with gallery context
  const handleAddToCart = (photo) => {
    if (!currentGallery) return;
    setCartItems((prev) => [
      ...prev,
      {
        id: `${currentGallery.id}_${photo.id}`,
        galleryId: currentGallery.id,
        galleryLabel: currentGallery.label,
        title: photo.title,
        thumb: photo.thumb,
      },
    ]);
    setCartOpen(true);
  };

  // Remove one item
  const handleRemove = (id) => {
    setCartItems((prev) => prev.filter((it) => it.id !== id));
  };

  // Checkout (mock). In production, call your server to create a Stripe Checkout session.
  const handleCheckout = () => {
    // TODO: Implement server call that creates a Stripe session with line items from `cartItems`.
    // After payment succeeds, generate secure download links and email the client.
    alert("Checkout is mocked in this demo. Wire this to Stripe Checkout on your server.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <Toaster />
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/10">
              <Camera className="h-5 w-5" />
            </div>
            <span className="font-semibold tracking-tight">Peak & Play Photography</span>
          </div>

          <div className="hidden items-center gap-6 md:flex text-sm text-white/80">
            <a href="#portfolio" className="hover:text-white">Portfolio</a>
            <a href="#client-access" className="hover:text-white">Client Access</a>
            <a href="#contact" className="hover:text-white">Contact</a>
          </div>

          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="rounded-xl">
                  <ShoppingCart className="mr-2 h-4 w-4"/> Cart ({cartItems.length})
                </Button>
              </SheetTrigger>
              <CartSheet
                items={cartItems}
                onRemove={handleRemove}
                onCheckout={handleCheckout}
                open={cartOpen}
                setOpen={setCartOpen}
                priceMap={priceMap}
              />
            </Sheet>
          </div>
        </div>
      </header>

      <main>
        <Hero />
        <FeatureGrid />
        {!currentGallery && (
          <>
            <PortfolioShowcase />
            <ClientAccess onOpenGallery={handleOpenGallery} />
            <AdminUpload onCreateGallery={handleCreateGallery} />
          </>
        )}
        {currentGallery && (
          <GalleryView gallery={currentGallery} onAddToCart={handleAddToCart} />
        )}

        <section id="contact" className="mx-auto max-w-7xl px-6 pb-24">
          <Card className="rounded-2xl border-white/10 bg-white/5 backdrop-blur">
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-sm text-white/80">Questions or special requests? We're happy to help with team packages and extended family sessions.</div>
                <div className="mt-3 text-sm text-white/60">Email: hello@peakandplay.com • Phone: (555) 123‑4567</div>
              </div>
              <div className="text-sm text-white/60">
                Studio Hours: Mon–Fri 9am–5pm • Sat 10am–4pm (by appointment)
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t border-white/10 py-8 text-center text-xs text-white/60">
        © {new Date().getFullYear()} Peak & Play Photography. All rights reserved.
      </footer>
    </div>
  );
}