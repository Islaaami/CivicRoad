import { classNames } from "../../utils/classNames";
import styles from "./Badge.module.css";

const sizeClassNames = {
  sm: "sizeSm",
  md: "sizeMd",
};

const toneClassNames = {
  neutral: "toneNeutral",
  info: "toneInfo",
  accent: "toneAccent",
  success: "toneSuccess",
  attention: "toneAttention",
  warning: "toneWarning",
  danger: "toneDanger",
};

function Badge({ children, className, size = "md", tone = "neutral" }) {
  return (
    <span
      className={classNames(
        styles.badge,
        styles[sizeClassNames[size] || sizeClassNames.md],
        styles[toneClassNames[tone] || toneClassNames.neutral],
        className
      )}
    >
      {children}
    </span>
  );
}

export default Badge;
