import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../store/AuthContext";

const navigationItems = [
  {
    to: "/",
    title: "Dashboard",
    description: "Quick municipal overview",
  },
  {
    to: "/reports",
    title: "Reports",
    description: "Browse every submitted issue",
  },
  {
    to: "/map",
    title: "Map",
    description: "See reports across the city",
  },
];

function AppShell() {
  const { user, logout } = useAuth();
  const municipalityLabel = user?.municipality || "Unassigned municipality";

  return (
    <div className="app-shell">
      <aside className="app-shell__sidebar">
        <div className="brand-block">
          <span className="brand-badge">Municipality Dashboard</span>
          <div>
            <h1 className="brand-title">CivicRoad</h1>
            <p className="brand-text">
              Municipal staff workspace for triaging citizen reports, checking
              status, and spotting location patterns quickly.
            </p>
          </div>

          <nav className="nav-list" aria-label="Main navigation">
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                to={item.to}
                end={item.to === "/"}
              >
                <span className="nav-link__title">{item.title}</span>
                <span className="nav-link__meta">{item.description}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="sidebar-card">
          <p className="sidebar-card__label">Signed In</p>
          <p className="sidebar-card__value">{user?.email}</p>
          <p className="nav-link__meta">{municipalityLabel}</p>
          <button className="ghost-button" onClick={logout} type="button">
            Log Out
          </button>
        </div>
      </aside>

      <div className="app-shell__body">
        <header className="app-shell__header">
          <div className="header-copy">
            <p className="header-eyebrow">Municipality Operations Board</p>
            <h2 className="header-title">Respond faster to street issues.</h2>
            <p className="header-text">
              Track what is pending, move active work forward, and keep the
              latest field reports visible in one place.
            </p>
          </div>

          <div className="user-chip">
            <span className="user-chip__email">{user?.email}</span>
            <span className="user-chip__role">
              {user?.municipality || user?.role || "staff"}
            </span>
          </div>
        </header>

        <main className="page-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppShell;
