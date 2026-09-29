import { Link, useNavigate } from "@tanstack/react-router";
import { ClipboardList, LayoutDashboard, LogOut, Settings, ShoppingBag, Store, Tags, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import logoMark from "@/assets/logo-mark.png";

const LINKS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/orders", label: "Orders", icon: ClipboardList },
  { to: "/admin/products", label: "Products", icon: ShoppingBag },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/settings", label: "Settings", icon: Settings },
] as const;

export function AdminSidebar() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="border-b border-border bg-foreground text-background md:min-h-screen md:w-60 md:shrink-0 md:border-b-0 md:border-r">
      <div className="flex items-center gap-2 px-4 py-5">
        <img src={logoMark} alt="" className="h-8 w-8 object-contain" />
        <div>
          <p className="font-display text-sm leading-tight">Explorers</p>
          <p className="text-[10px] uppercase tracking-widest text-background/60">Admin</p>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-2 pb-3 md:flex-col md:overflow-visible md:pb-6">
        {LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            activeOptions={{ exact: link.to === "/admin" }}
            activeProps={{ className: "bg-primary text-primary-foreground" }}
            className="flex shrink-0 items-center gap-2 px-3 py-2.5 text-xs font-bold uppercase tracking-widest text-background/80 transition-colors hover:bg-background/10"
          >
            <link.icon size={15} aria-hidden="true" />
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="flex gap-1 px-2 pb-4 md:flex-col">
        <Link
          to="/"
          className="flex items-center gap-2 px-3 py-2.5 text-xs font-bold uppercase tracking-widest text-background/70 hover:bg-background/10"
        >
          <Store size={15} aria-hidden="true" /> View store
        </Link>
        <button
          type="button"
          onClick={async () => {
            await signOut();
            navigate({ to: "/login" });
          }}
          className="flex items-center gap-2 px-3 py-2.5 text-xs font-bold uppercase tracking-widest text-background/70 hover:bg-background/10"
        >
          <LogOut size={15} aria-hidden="true" /> Sign out
        </button>
      </div>
    </aside>
  );
}
