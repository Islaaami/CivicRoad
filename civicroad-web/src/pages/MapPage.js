import { useEffect, useState } from "react";
import { getMapReports } from "../api/reports";
import ReportMap from "../components/ReportMap";
import { useAuth } from "../store/AuthContext";

function MapPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const municipalityLabel = user?.municipality || "your municipality";

  useEffect(() => {
    let active = true;

    async function loadReports() {
      try {
        const data = await getMapReports();
        if (active) {
          setReports(data);
        }
      } catch (requestError) {
        if (active) {
          setError(
            requestError.response?.data?.message || "Unable to load map data."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadReports();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="page-stack">
      <section className="page-header">
        <div className="page-header__copy">
          <h1 className="page-header__title">Report map</h1>
          <p className="page-header__text">
            {`Spatial view of reports assigned to ${municipalityLabel}.`}
          </p>
        </div>
      </section>

      {error ? <div className="error-banner">{error}</div> : null}
      {loading ? (
        <div className="loading-state">Loading report markers...</div>
      ) : (
        <ReportMap reports={reports} />
      )}
    </div>
  );
}

export default MapPage;
