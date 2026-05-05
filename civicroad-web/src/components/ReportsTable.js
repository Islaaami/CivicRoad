import { Link } from "react-router-dom";
import { getAssetUrl } from "../api/client";
import {
  formatDate,
  getReportPriority,
  truncateText,
} from "../utils/reportPresentation";
import { classNames } from "../utils/classNames";
import Icon from "./Icon";
import PriorityTag from "./PriorityTag";
import StatusBadge from "./StatusBadge";
import Card from "./ui/Card";
import EmptyState from "./ui/EmptyState";
import sharedStyles from "./DataTable.module.css";
import styles from "./ReportsTable.module.css";

function ReportsTable({
  action,
  className,
  description,
  emptyDescription = "No reports match the current view. Adjust the filters or wait for new submissions.",
  emptyTitle = "No reports found",
  reports,
  title = "Reports queue",
}) {
  return (
    <Card className={classNames(sharedStyles.card, className)} padding="none">
      <div className={sharedStyles.header}>
        <div className={sharedStyles.headerCopy}>
          <h2 className={sharedStyles.title}>{title}</h2>
          {description ? (
            <p className={sharedStyles.description}>{description}</p>
          ) : null}
        </div>
        {action}
      </div>

      {reports.length ? (
        <div className={sharedStyles.scroll}>
          <table className={sharedStyles.table}>
            <thead>
              <tr>
                <th>Report</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => {
                const imageUrl = getAssetUrl(report.image_url);

                return (
                  <tr className={sharedStyles.row} key={report.id}>
                    <td>
                      <div className={styles.reportCell}>
                        {imageUrl ? (
                          <img
                            alt={report.title}
                            className={styles.thumbnail}
                            src={imageUrl}
                          />
                        ) : (
                          <div
                            className={classNames(
                              styles.thumbnail,
                              styles.thumbnailPlaceholder
                            )}
                          >
                            <Icon name="image" size={20} />
                          </div>
                        )}

                        <div className={styles.copy}>
                          <p className={styles.title}>{report.title}</p>
                          <p className={styles.description}>
                            {truncateText(report.description)}
                          </p>
                          <div className={styles.meta}>
                            <span className={styles.metaItem}>
                              <Icon name="location" size={14} />
                              {report.municipality || "Municipality not set"}
                            </span>
                            <span className={styles.metaItem}>
                              Report #{report.id}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={sharedStyles.secondaryText}>
                      {report.category_name || "Uncategorized"}
                    </td>
                    <td>
                      <PriorityTag priority={getReportPriority(report)} />
                    </td>
                    <td>
                      <StatusBadge status={report.status} />
                    </td>
                    <td className={sharedStyles.secondaryText}>
                      {formatDate(report.created_at)}
                    </td>
                    <td>
                      <Link className={styles.actionLink} to={`/reports/${report.id}`}>
                        Open
                        <Icon name="arrowRight" size={16} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={sharedStyles.scroll}>
          <EmptyState
            compact
            description={emptyDescription}
            icon="search"
            title={emptyTitle}
          />
        </div>
      )}
    </Card>
  );
}

export { formatDate };
export default ReportsTable;
