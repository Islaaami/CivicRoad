import { classNames } from "../../utils/classNames";
import styles from "./Field.module.css";

function Field({ children, className, hint, htmlFor, label }) {
  return (
    <label className={classNames(styles.field, className)} htmlFor={htmlFor}>
      <span className={styles.header}>
        <span className={styles.label}>{label}</span>
        {hint ? <span className={styles.hint}>{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

function Input({ className, ...props }) {
  return <input className={classNames(styles.control, className)} {...props} />;
}

function Select({ children, className, ...props }) {
  return (
    <select
      className={classNames(styles.control, styles.select, className)}
      {...props}
    >
      {children}
    </select>
  );
}

export { Field, Input, Select };
