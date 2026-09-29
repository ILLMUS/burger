import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, MapPin, MessageCircle, Phone } from "lucide-react";
import { useSettings } from "@/hooks/useCatalog";
import { StoreStatus } from "@/components/StoreStatus";

export function Footer() {
  const { data: settings } = useSettings();
  const whatsapp = (settings?.whatsapp_number ?? "").replace(/\D/g, "");

  return (
    <footer className="mt-20 border-t border-border bg-surface">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-lg">
            Explorers <span className="text-primary">Smash Burger</span>
          </p>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin size={14} aria-hidden="true" />
            {settings?.location ?? "Zulwini, Eswatini"}
          </p>
          <div className="mt-4">
            <StoreStatus />
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest">Navigate</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-primary">Home</Link></li>
            <li><Link to="/products" className="hover:text-primary">Products</Link></li>
            <li><Link to="/about" className="hover:text-primary">About</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
            <li><Link to="/track-order" className="hover:text-primary">Track order</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest">Customer</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/favorites" className="hover:text-primary">Favourites</Link></li>
            <li><Link to="/cart" className="hover:text-primary">Cart</Link></li>
            <li><Link to="/track-order" className="hover:text-primary">Track order</Link></li>
            <li><Link to="/login" className="hover:text-primary">Account</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest">Contact</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Phone size={14} aria-hidden="true" />
              <a href={`tel:${settings?.phone_number ?? ""}`} className="hover:text-primary">
                {settings?.phone_number ?? "+268 7642 7025"}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle size={14} aria-hidden="true" />
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-primary"
              >
                WhatsApp us
              </a>
            </li>
            {settings?.facebook && (
              <li className="flex items-center gap-2">
                <Facebook size={14} aria-hidden="true" />
                <a href={settings.facebook} target="_blank" rel="noreferrer" className="hover:text-primary">
                  Facebook
                </a>
              </li>
            )}
            {settings?.instagram && (
              <li className="flex items-center gap-2">
                <Instagram size={14} aria-hidden="true" />
                <a href={settings.instagram} target="_blank" rel="noreferrer" className="hover:text-primary">
                  Instagram
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <p className="mx-auto w-full max-w-7xl px-4 py-6 text-xs text-muted-foreground">
          © 2026 Explorers Smash Burger. Zulwini, Eswatini.
        </p>
      </div>
    </footer>
  );
}
