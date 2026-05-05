const iconMap = {
  archive: (
    <>
      <path d="M4 7h16" />
      <path d="M6 7v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7" />
      <path d="M9 11h6" />
      <path d="M4 4h16v3H4z" />
    </>
  ),
  arrowLeft: (
    <>
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </>
  ),
  arrowRight: (
    <>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </>
  ),
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="11" rx="2" />
      <rect x="14" y="17" width="7" height="4" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="m21 15-4.5-4.5L8 19" />
    </>
  ),
  location: (
    <>
      <path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10Z" />
      <circle cx="12" cy="11" r="2.5" />
    </>
  ),
  logout: (
    <>
      <path d="M14 8V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-3" />
      <path d="M10 12h11" />
      <path d="m17 7 5 5-5 5" />
    </>
  ),
  map: (
    <>
      <path d="m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2V6Z" />
      <path d="M9 4v14" />
      <path d="M15 6v14" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </>
  ),
  reports: (
    <>
      <path d="M7 3h8l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      <path d="M15 3v4h4" />
      <path d="M9 13h6" />
      <path d="M9 17h6" />
      <path d="M9 9h3" />
    </>
  ),
  road: (
    <>
      <path d="M10 3 8 21" />
      <path d="M14 3 16 21" />
      <path d="M12 6v2" />
      <path d="M12 11v2" />
      <path d="M12 16v2" />
      <path d="M6 21h12" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.35-4.35" />
    </>
  ),
};

function Icon({
  className,
  name,
  size = 20,
  strokeWidth = 1.8,
  title,
}) {
  return (
    <svg
      aria-hidden={title ? undefined : "true"}
      className={className}
      fill="none"
      height={size}
      role={title ? "img" : undefined}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      viewBox="0 0 24 24"
      width={size}
    >
      {title ? <title>{title}</title> : null}
      {iconMap[name] || iconMap.reports}
    </svg>
  );
}

export default Icon;
