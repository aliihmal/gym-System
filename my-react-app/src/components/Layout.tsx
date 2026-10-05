import type { ReactNode } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";

const Icon = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const links = [
  { to: "/", label: "Home", end: true,
    icon: <Icon><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></Icon> },
  { to: "/users/new", label: "Add member", end: false,
    icon: <Icon><circle cx="9" cy="8" r="4" /><path d="M2 21c0-4 3-6 7-6s7 2 7 6" /><path d="M19 8v6M16 11h6" /></Icon> },
  { to: "/users/find", label: "Find member", end: false,
    icon: <Icon><circle cx="11" cy="11" r="7" /><path d="M21 21l-5-5" /></Icon> },
  { to: "/members", label: "All members", end: true,
    icon: <Icon><circle cx="9" cy="8" r="3.5" /><path d="M2 20c0-3.5 3-5.5 7-5.5s7 2 7 5.5" /><path d="M17 4.5a3.5 3.5 0 010 7M22 20c0-2.5-1.5-4.3-4-5" /></Icon> },
  { to: "/members/renew", label: "Renew", end: false,
    icon: <Icon><path d="M21 12a9 9 0 01-15.5 6.2L3 16" /><path d="M3 12a9 9 0 0115.5-6.2L21 8" /><path d="M21 3v5h-5M3 21v-5h5" /></Icon> },
  { to: "/members/expired", label: "Expired", end: false,
    icon: <Icon><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icon> },
];

export default function Layout() {
  return (
    <div className="app">
      <aside className="sidebar">
        <Link className="brand" to="/">
          <span className="brand-mark">G</span>
          <span>GYM MANAGER</span>
        </Link>
        <nav className="side-nav" aria-label="Main">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}>
              {l.icon}
              {l.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}