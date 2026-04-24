import { useEffect, useRef } from "react";
import L from "leaflet";
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";

const DEFAULT_CENTER = [33.5731, -7.5898];
const STATUS_COLORS = {
  pending: "#f59e0b",
  in_progress: "#2563eb",
  resolved: "#10b981",
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildPopupMarkup(report) {
  return `
    <div style="min-width: 180px;">
      <strong>${escapeHtml(report.title)}</strong>
      <div style="margin-top: 6px;">${escapeHtml(
        report.category_name || "Uncategorized"
      )}</div>
      <div style="margin-top: 6px; color: #475569;">${report.status.replace("_", " ")}</div>
    </div>
  `;
}

function ReportMap({ reports, compact = false }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);

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

    const validReports = reports.filter((report) => {
      return (
        Number.isFinite(Number(report.latitude)) &&
        Number.isFinite(Number(report.longitude))
      );
    });

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
        fillColor: STATUS_COLORS[report.status] || "#475569",
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
  }, [compact, reports]);

  return (
    <div className="map-layout">
      <div className={`map-card ${compact ? "map-panel--compact" : "map-panel"}`}>
        <div className="map-canvas" ref={containerRef} />
      </div>

      <div className="section-card">
        <div className="section-heading">
          <div>
            <h3 className="section-title">Mapped reports</h3>
            <p className="section-copy">
              Live markers for all issues with valid coordinates.
            </p>
          </div>
        </div>

        <div className="quick-list">
          {reports.length ? (
            reports.map((report) => (
              <Link className="quick-item" key={report.id} to={`/reports/${report.id}`}>
                <div className="quick-item__copy">
                  <p className="quick-item__title">{report.title}</p>
                  <p className="quick-item__meta">
                    {report.category_name || "Uncategorized"}
                  </p>
                </div>
                <StatusBadge status={report.status} />
              </Link>
            ))
          ) : (
            <div className="empty-state">
              No reports with coordinates are available to display on the map.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReportMap;
