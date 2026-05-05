import { useEffect, useState } from "react";
import {
  NavLink,
  Outlet,
  matchPath,
  useLocation,
} from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import { classNames } from "../utils/classNames";
import {
  getUserDisplayName,
  getUserInitials,
} from "../utils/reportPresentation";
import Icon from "./Icon";
import Button from "./ui/Button";
import styles from "./AppShell.module.css";

const navigationItems = [
  {
    to: "/",
    title: "Dashboard",
    description: "Operations overview",
    icon: "dashboard",
  },
  {
    to: "/reports",
    title: "Reports",
    description: "Manage submitted issues",
    icon: "reports",
  },
  {
    to: "/map",
    title: "Map",
    description: "Inspect reports spatially",
    icon: "map",
  },
  {
    to: "/false-reports",
    title: "False Reports",
    description: "Review archived submissions",
    icon: "archive",
  },
];

const pageMetadata = [
  {
    path: "/",
    end: true,
    title: "Municipal Operations Overview",
    description:
      "Keep incoming issues triaged, visible, and moving through the service workflow.",
  },
  {
    path: "/reports",
    end: true,
    title: "Reports Queue",
    description:
      "Search, filter, and review every citizen report assigned to your municipality.",
  },
  {
    path: "/reports/:reportId",
    title: "Report Review",
    description:
      "Inspect evidence, adjust workflow status, and confirm the issue details before action.",
  },
  {
    path: "/map",
    end: true,
    title: "Spatial Report View",
    description:
      "Use the city map to spot clusters, validate coordinates, and coordinate field response.",
  },
  {
    path: "/false-reports",
    end: true,
    title: "False Report Archive",
    description:
      "Monitor archived submissions so the active queue stays focused on real incidents.",
  },
];

function getPageMeta(pathname) {
  const match = pageMetadata.find((entry) =>
    matchPath({ path: entry.path, end: entry.end ?? false }, pathname)
  );

  return (
    match || {
      title: "CivicRoad Dashboard",
      description:
        "Municipality workspace for managing citizen-submitted urban issues.",
    }
  );
}

function AppShell() {
  const location = useLocation();
  const { logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const municipalityLabel = user?.municipality || "Municipality workspace";
  const displayName = getUserDisplayName(user);
  const initials = getUserInitials(user);
  const pageMeta = getPageMeta(location.pathname);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className={styles.shell}>
      <button
        aria-label="Close navigation"
        aria-hidden={!sidebarOpen}
        className={classNames(styles.overlay, sidebarOpen && styles.overlayVisible)}
        onClick={() => setSidebarOpen(false)}
        tabIndex={sidebarOpen ? 0 : -1}
        type="button"
      />

      <aside
        className={classNames(
          styles.sidebar,
          sidebarOpen && styles.sidebarOpen
        )}
      >
        <div className={styles.sidebarInner}>
          <div className={styles.brandBlock}>
            <div className={styles.brandMark}>
              <Icon name="road" size={22} />
            </div>
            <div className={styles.brandCopy}>
              <span className={styles.brandBadge}>CivicRoad</span>
              <h1 className={styles.brandTitle}>Municipality Control Center</h1>
              <p className={styles.brandText}>
                A calm, structured workspace for triage, investigation, and
                service follow-up across the city.
              </p>
            </div>
          </div>

          <nav aria-label="Main navigation" className={styles.navList}>
            {navigationItems.map((item) => (
              <NavLink
                className={({ isActive }) =>
                  classNames(styles.navLink, isActive && styles.navLinkActive)
                }
                end={item.to === "/"}
                key={item.to}
                to={item.to}
              >
                <span className={styles.navIcon}>
                  <Icon name={item.icon} size={18} />
                </span>
                <span className={styles.navCopy}>
                  <span className={styles.navTitle}>{item.title}</span>
                  <span className={styles.navDescription}>
                    {item.description}
                  </span>
                </span>
              </NavLink>
            ))}
          </nav>

          <div className={styles.sidebarCard}>
            <span className={styles.sidebarLabel}>Current municipality</span>
            <strong className={styles.sidebarValue}>{municipalityLabel}</strong>
            <p className={styles.sidebarText}>
              Logged in as {user?.email}. Route work carefully, archive noise,
              and keep citizens informed through timely status changes.
            </p>
          </div>
        </div>
      </aside>

      <div className={styles.mainFrame}>
        <header className={styles.topbar}>
          <div className={styles.topbarPrimary}>
            <button
              aria-label="Open navigation"
              className={styles.menuButton}
              onClick={() => setSidebarOpen(true)}
              type="button"
            >
              <Icon name="menu" size={20} />
            </button>

            <div className={styles.pageCopy}>
              <span className={styles.pageEyebrow}>{municipalityLabel}</span>
              <h2 className={styles.pageTitle}>{pageMeta.title}</h2>
              <p className={styles.pageDescription}>{pageMeta.description}</p>
            </div>
          </div>

          <div className={styles.userPanel}>
            <div className={styles.userCard}>
              <span className={styles.avatar}>{initials}</span>
              <div className={styles.userCopy}>
                <span className={styles.userName}>{displayName}</span>
                <span className={styles.userMeta}>{user?.email}</span>
              </div>
            </div>

            <Button
              icon={<Icon name="logout" size={16} />}
              onClick={logout}
              size="sm"
              variant="secondary"
            >
              Logout
            </Button>
          </div>
        </header>

        <main className={styles.contentArea}>
          <div className={styles.contentInner}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppShell;
