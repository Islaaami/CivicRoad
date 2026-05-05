import { useEffect, useState } from "react";
import {
  Link,
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
    icon: "dashboard",
  },
  {
    to: "/reports",
    title: "Reports",
    icon: "reports",
  },
  {
    to: "/map",
    title: "Map",
    icon: "map",
  },
  {
    to: "/false-reports",
    title: "False Reports",
    icon: "archive",
  },
];

const pageMetadata = [
  {
    path: "/",
    end: true,
    title: "Dashboard",
    description:
      "Municipal Report Summary.",
  },
  {
    path: "/reports",
    end: true,
    title: "Reports Queue",
    description:
      "Manage Citizen Submissions.",
  },
  {
    path: "/reports/:reportId",
    title: "Report Details",
    description:
      "Review evidence and update status.",
  },
  {
    path: "/map",
    end: true,
    title: "Map View",
    description:
      "Track and validate report locations.",
  },
  {
    path: "/false-reports",
    end: true,
    title: "False Reports",
    description:
      "Manage flagged and invalid submissions.",
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
          <Link className={styles.brand} to="/">
            <div className={styles.brandMark}>
              <Icon name="road" size={22} />
            </div>
            <span className={styles.brandName}>CivicRoad</span>
          </Link>

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
                <span className={styles.navTitle}>{item.title}</span>
              </NavLink>
            ))}
          </nav>
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
