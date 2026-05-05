import { classNames } from "../../utils/classNames";
import Icon from "../Icon";
import styles from "./EmptyState.module.css";

function EmptyState({
  action,
  className,
  compact = false,
  description,
  icon = "reports",
  title,
}) {
  return (
    <div
      className={classNames(
        styles.emptyState,
        compact && styles.compact,
        className
      )}
    >
      <div className={styles.iconWrap}>
        <Icon name={icon} size={22} />
      </div>
      <div className={styles.copy}>
        <h3 className={styles.title}>{title}</h3>
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}

export default EmptyState;
