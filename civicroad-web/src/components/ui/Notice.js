import { classNames } from "../../utils/classNames";
import styles from "./Notice.module.css";

const toneClassNames = {
  error: "toneError",
  info: "toneInfo",
  success: "toneSuccess",
};

function Notice({ children, className, tone = "error" }) {
  return (
    <div
      className={classNames(
        styles.notice,
        styles[toneClassNames[tone] || toneClassNames.error],
        className
      )}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}

export default Notice;
