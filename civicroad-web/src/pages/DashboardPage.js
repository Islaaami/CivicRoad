import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getReports } from "../api/reports";
import PriorityTag from "../components/PriorityTag";
import ReportsTable from "../components/ReportsTable";
import StatusBadge from "../components/StatusBadge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import LoadingPanel from "../components/ui/LoadingPanel";
import Notice from "../components/ui/Notice";
import { useAuth } from "../store/AuthContext";
import pageStyles from "../styles/PageLayout.module.css";
import {
  formatDate,
  getReportPriority,
} from "../utils/reportPresentation";
import styles from "./DashboardPage.module.css";

const PRIORITY_ORDER = {
  high: 0,
  medium: 1,
  low: 2,
  none: 3,
};

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const STATUS_CHART_COLORS = {
  pending: "#f97316",
  in_progress: "#7c3aed",
  resolved: "#10b981",
};

const AXIS_TICK_STYLE = {
  fill: "#6b7280",
  fontSize: 12,
  fontWeight: 600,
};

const TOOLTIP_CONTENT_STYLE = {
  border: "1px solid #e0e6ed",
  borderRadius: "16px",
  boxShadow: "0 20px 40px rgba(15, 23, 42, 0.12)",
};

function KpiCard({ emphasized = false, label, value }) {
  return (
    <Card
      className={
        emphasized
          ? `${styles.kpiCard} ${styles.kpiCardPrimary}`
          : styles.kpiCard
      }
      padding={emphasized ? "lg" : "md"}
    >
      <span
        className={
          emphasized
            ? `${styles.kpiLabel} ${styles.kpiLabelPrimary}`
            : styles.kpiLabel
        }
      >
        {label}
      </span>
      <strong
        className={
          emphasized
            ? `${styles.kpiValue} ${styles.kpiValuePrimary}`
            : styles.kpiValue
        }
      >
        {value}
      </strong>
    </Card>
  );
}

function DashboardPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const municipalityLabel = user?.municipality || "your municipality";

  useEffect(() => {
    let active = true;

    async function loadReports() {
      try {
        const data = await getReports();

        if (active) {
          setReports(data);
        }
      } catch (requestError) {
        if (active) {
          setError(
            requestError.response?.data?.message ||
              "Unable to load dashboard reports."
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

  const pendingReports = reports.filter((report) => report.status === "pending");
  const inProgressReports = reports.filter(
    (report) => report.status === "in_progress"
  );
  const resolvedReports = reports.filter(
    (report) => report.status === "resolved"
  );
  const reportDistribution = [
    {
      name: "Pending",
      value: pendingReports.length,
      color: STATUS_CHART_COLORS.pending,
    },
    {
      name: "In Progress",
      value: inProgressReports.length,
      color: STATUS_CHART_COLORS.in_progress,
    },
    {
      name: "Resolved",
      value: resolvedReports.length,
      color: STATUS_CHART_COLORS.resolved,
    },
  ];
  const hasDistributionData = reportDistribution.some(
    (entry) => entry.value > 0
  );
  const monthlyReportCounts = MONTH_LABELS.map((month) => ({
    month,
    count: 0,
  }));

  reports.forEach((report) => {
    const createdAt = new Date(report.created_at);

    if (Number.isNaN(createdAt.getTime())) {
      return;
    }

    monthlyReportCounts[createdAt.getMonth()].count += 1;
  });

  const latestReports = reports.slice(0, 5);
  const focusReports = reports
    .filter(
      (report) =>
        report.status === "pending" || report.status === "in_progress"
    )
    .slice()
    .sort((leftReport, rightReport) => {
      const leftPriority = getReportPriority(leftReport) || "none";
      const rightPriority = getReportPriority(rightReport) || "none";
      const priorityDifference =
        PRIORITY_ORDER[leftPriority] - PRIORITY_ORDER[rightPriority];

      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      return new Date(rightReport.created_at) - new Date(leftReport.created_at);
    })
    .slice(0, 5);

  return (
    <div className={pageStyles.stack}>
      <Card tone="soft">
        <div className={styles.analyticsLayout}>
          <div className={styles.kpiRow}>
            <KpiCard emphasized label="Total" value={reports.length} />
            <KpiCard label="Pending" value={pendingReports.length} />
            <KpiCard label="In Progress" value={inProgressReports.length} />
            <KpiCard label="Resolved" value={resolvedReports.length} />
          </div>

          <div className={styles.chartGrid}>
            <Card className={styles.chartCard} tone="subtle">
              <div className={pageStyles.sectionHeader}>
                <div className={pageStyles.sectionCopy}>
                  <h2 className={pageStyles.sectionTitle}>
                    Reports Distribution
                  </h2>
                  <p className={pageStyles.sectionText}>
                    Current workflow mix across pending, active, and resolved
                    reports.
                  </p>
                </div>
              </div>

              <div className={styles.chartArea}>
                {hasDistributionData ? (
                  <ResponsiveContainer height="100%" width="100%">
                    <PieChart>
                      <Pie
                        cornerRadius={10}
                        data={reportDistribution}
                        dataKey="value"
                        innerRadius="56%"
                        nameKey="name"
                        outerRadius="84%"
                        paddingAngle={3}
                      >
                        {reportDistribution.map((entry) => (
                          <Cell fill={entry.color} key={entry.name} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={TOOLTIP_CONTENT_STYLE}
                        formatter={(value, name) => [value, name]}
                        labelStyle={{ color: "#1f2937", fontWeight: 700 }}
                      />
                      <Legend
                        align="center"
                        iconType="circle"
                        verticalAlign="bottom"
                        wrapperStyle={{ paddingTop: 20 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className={styles.emptyChartText}>
                    No report distribution data is available yet.
                  </p>
                )}
              </div>
            </Card>

            <Card className={styles.chartCard} tone="subtle">
              <div className={pageStyles.sectionHeader}>
                <div className={pageStyles.sectionCopy}>
                  <h2 className={pageStyles.sectionTitle}>
                    Monthly Report Counts
                  </h2>
                  <p className={pageStyles.sectionText}>
                    Report volume grouped by submission month.
                  </p>
                </div>
              </div>

              <div className={styles.chartArea}>
                <ResponsiveContainer height="100%" width="100%">
                  <BarChart
                    data={monthlyReportCounts}
                    margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
                  >
                    <CartesianGrid
                      stroke="rgba(224, 230, 237, 0.92)"
                      vertical={false}
                    />
                    <XAxis
                      axisLine={false}
                      dataKey="month"
                      tick={AXIS_TICK_STYLE}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      axisLine={false}
                      tick={AXIS_TICK_STYLE}
                      tickLine={false}
                      width={30}
                    />
                    <Tooltip
                      contentStyle={TOOLTIP_CONTENT_STYLE}
                      cursor={{ fill: "rgba(0, 123, 255, 0.08)" }}
                      formatter={(value) => [value, "Reports"]}
                      labelStyle={{ color: "#1f2937", fontWeight: 700 }}
                    />
                    <Bar
                      dataKey="count"
                      fill="var(--color-primary)"
                      maxBarSize={34}
                      radius={[10, 10, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>
      </Card>

      {error ? <Notice>{error}</Notice> : null}

      {loading ? (
        <LoadingPanel
          description="Preparing the latest queue summary, focus list, and recent report activity."
          rows={5}
          title="Loading dashboard"
        />
      ) : null}

      {!loading && !error ? (
        <div className={styles.layout}>
          <ReportsTable
            action={
              <Button as={Link} to="/reports" variant="secondary">
                Full list
              </Button>
            }
            description={`Newest submissions routed to ${municipalityLabel}.`}
            reports={latestReports}
            title="Recent reports"
          />

          <div className={styles.sideColumn}>
            <Card>
              <div className={pageStyles.sectionHeader}>
                <div className={pageStyles.sectionCopy}>
                  <h2 className={pageStyles.sectionTitle}>Priority focus</h2>
                  <p className={pageStyles.sectionText}>
                    Quick access to the reports that deserve the most immediate
                    staff awareness.
                  </p>
                </div>
              </div>

              <div className={styles.focusList}>
                {focusReports.length ? (
                  focusReports.map((report) => (
                    <Link
                      className={styles.focusItem}
                      key={report.id}
                      to={`/reports/${report.id}`}
                    >
                      <div className={styles.focusCopy}>
                        <p className={styles.focusTitle}>{report.title}</p>
                        <p className={styles.focusMeta}>
                          {`${report.category_name || "Uncategorized"} - ${formatDate(
                            report.created_at
                          )}`}
                        </p>
                      </div>
                      <div className={styles.focusBadges}>
                        <PriorityTag
                          priority={getReportPriority(report)}
                          size="sm"
                        />
                        <StatusBadge size="sm" status={report.status} />
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className={styles.emptyText}>
                    No reports need immediate attention right now.
                  </p>
                )}
              </div>
            </Card>

            <Card tone="subtle">
              <div className={pageStyles.sectionHeader}>
                <div className={pageStyles.sectionCopy}>
                  <h2 className={pageStyles.sectionTitle}>Workflow balance</h2>
                  <p className={pageStyles.sectionText}>
                    A quick distribution of active work across the queue.
                  </p>
                </div>
              </div>

              <div className={styles.metricList}>
                <div className={styles.metricItem}>
                  <span className={styles.metricLabel}>Pending</span>
                  <strong className={styles.metricValue}>
                    {pendingReports.length}
                  </strong>
                </div>
                <div className={styles.metricItem}>
                  <span className={styles.metricLabel}>In progress</span>
                  <strong className={styles.metricValue}>
                    {inProgressReports.length}
                  </strong>
                </div>
                <div className={styles.metricItem}>
                  <span className={styles.metricLabel}>Resolved</span>
                  <strong className={styles.metricValue}>
                    {resolvedReports.length}
                  </strong>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default DashboardPage;
