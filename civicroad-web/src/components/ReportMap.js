import { useEffect, useRef } from "react";
import L from "leaflet";
import { Link } from "react-router-dom";
import { classNames } from "../utils/classNames";
import {
  formatCategoryLabel,
  getReportPriority,
} from "../utils/reportPresentation";
import PriorityTag from "./PriorityTag";
import StatusBadge, { formatStatusLabel } from "./StatusBadge";
import Card from "./ui/Card";
import EmptyState from "./ui/EmptyState";
import sharedPageStyles from "../styles/PageLayout.module.css";
import styles from "./ReportMap.module.css";

const DEFAULT_CENTER = [33.5731, -7.5898];
const STATUS_COLORS = {
  pending: "#f97316",
  in_progress: "#7c3aed",
  resolved: "#10b981",
};

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildPopupMarkup(report) {
  return `
    <div class="civicroad-map-popup">
      <strong class="civicroad-map-popup__title">${escapeHtml(report.title)}</strong>
      <span class="civicroad-map-popup__meta">${escapeHtml(
        formatCategoryLabel(report.category_name)
      )}</span>
      <span class="civicroad-map-popup__status civicroad-map-popup__status--${escapeHtml(
        report.status || "unknown"
      )}">${escapeHtml(
        formatStatusLabel(report.status)
      )}</span>
    </div>
  `;
}

function ReportMap({
  compact = false,
  reports,
  showList = !compact,
  title = "Signalements géolocalisés",
  description = "Marqueurs actifs pour les signalements disposant de coordonnées valides.",
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const validReports = reports.filter(
    (report) =>
      Number.isFinite(Number(report.latitude)) &&
      Number.isFinite(Number(report.longitude))
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return undefined;
    }

    mapRef.current = L.map(containerRef.current, {
      zoomControl: true,
      scrollWheelZoom: !compact,
    }).setView(DEFAULT_CENTER, 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(mapRef.current);

    layerRef.current = L.layerGroup().addTo(mapRef.current);

    window.requestAnimationFrame(() => {
      mapRef.current?.invalidateSize();
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, [compact]);

  useEffect(() => {
    if (!mapRef.current || !layerRef.current) {
      return;
    }

    layerRef.current.clearLayers();

    if (!validReports.length) {
      mapRef.current.setView(DEFAULT_CENTER, 12);
      return;
    }

    const bounds = [];

    validReports.forEach((report) => {
      const latLng = [Number(report.latitude), Number(report.longitude)];
      const marker = L.circleMarker(latLng, {
        radius: compact ? 8 : 10,
        color: "#ffffff",
        weight: 3,
        fillColor: STATUS_COLORS[report.status] || "#64748b",
        fillOpacity: 0.95,
      });

      marker.bindPopup(buildPopupMarkup(report));
      marker.addTo(layerRef.current);
      bounds.push(latLng);
    });

    if (bounds.length === 1) {
      mapRef.current.setView(bounds[0], compact ? 14 : 15);
    } else {
      mapRef.current.fitBounds(bounds, {
        padding: [36, 36],
      });
    }

    window.requestAnimationFrame(() => {
      mapRef.current?.invalidateSize();
    });
  }, [compact, validReports]);

  return (
    <div className={classNames(styles.layout, compact && styles.layoutCompact)}>
      <Card
        className={classNames(styles.mapCard, compact && styles.mapCardCompact)}
        padding="none"
      >
        <div className={styles.canvas} ref={containerRef} />
      </Card>

      {showList ? (
        <Card className={styles.listCard}>
          <div className={sharedPageStyles.sectionHeader}>
            <div className={sharedPageStyles.sectionCopy}>
              <h3 className={sharedPageStyles.sectionTitle}>{title}</h3>
              <p className={sharedPageStyles.sectionText}>{description}</p>
            </div>
          </div>

          {validReports.length ? (
            <div className={styles.reportList}>
              {validReports.map((report) => (
                <Link className={styles.reportItem} key={report.id} to={`/reports/${report.id}`}>
                  <div className={styles.reportCopy}>
                    <p className={styles.reportTitle}>{report.title}</p>
                    <p className={styles.reportMeta}>
                      {formatCategoryLabel(report.category_name)}
                    </p>
                  </div>
                  <div className={styles.reportBadges}>
                    <PriorityTag
                      priority={getReportPriority(report)}
                      size="sm"
                    />
                    <StatusBadge size="sm" status={report.status} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              compact
              description="Les signalements sans coordonnées valides ne peuvent pas être affichés sur la carte."
              icon="map"
              title="Aucun signalement géolocalisé"
            />
          )}
        </Card>
      ) : null}
    </div>
  );
}

export default ReportMap;
