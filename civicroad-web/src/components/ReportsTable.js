import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";

function formatDate(dateValue) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateValue));
}

function ReportsTable({ reports }) {
  if (!reports.length) {
    return (
      <div className="empty-state">
        No reports are available yet. New reports will appear here as soon as
        they are submitted.
      </div>
    );
  }

  return (
    <div className="table-card">
      <div className="table-scroll">
        <table className="reports-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Status</th>
              <th>Created date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id}>
                <td>
                  <p className="table-title">{report.title}</p>
                  <p className="table-meta">{report.description}</p>
                </td>
                <td>{report.category_name || "Uncategorized"}</td>
                <td>
                  <StatusBadge status={report.status} />
                </td>
                <td>{formatDate(report.created_at)}</td>
                <td>
                  <Link className="table-link" to={`/reports/${report.id}`}>
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export { formatDate };
export default ReportsTable;
