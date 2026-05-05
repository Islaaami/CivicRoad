import { classNames } from "../../utils/classNames";
import Card from "./Card";
import styles from "./LoadingPanel.module.css";

function LoadingPanel({
  className,
  description,
  rows = 4,
  title = "Chargement",
}) {
  return (
    <Card className={classNames(styles.panel, className)} tone="subtle">
      <div className={styles.copy}>
        <span className={styles.eyebrow}>Chargement</span>
        <h2 className={styles.title}>{title}</h2>
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>

      <div className={styles.skeletonList} aria-hidden="true">
        {Array.from({ length: rows }).map((_, index) => (
          <div className={styles.row} key={index}>
            <span className={styles.barWide} />
            <span className={styles.barShort} />
          </div>
        ))}
      </div>
    </Card>
  );
}

export default LoadingPanel;
