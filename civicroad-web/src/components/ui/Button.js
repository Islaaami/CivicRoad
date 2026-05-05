import { classNames } from "../../utils/classNames";
import styles from "./Button.module.css";

const sizeClassNames = {
  sm: "sizeSm",
  md: "sizeMd",
  lg: "sizeLg",
};

const variantClassNames = {
  primary: "variantPrimary",
  secondary: "variantSecondary",
  ghost: "variantGhost",
  danger: "variantDanger",
};

function Button({
  as: Component = "button",
  children,
  className,
  disabled = false,
  fullWidth = false,
  icon,
  iconRight,
  loading = false,
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}) {
  const isButtonElement = Component === "button";

  return (
    <Component
      className={classNames(
        styles.button,
        styles[variantClassNames[variant] || variantClassNames.primary],
        styles[sizeClassNames[size] || sizeClassNames.md],
        fullWidth && styles.fullWidth,
        loading && styles.loading,
        className
      )}
      {...(isButtonElement ? { disabled: disabled || loading, type } : {})}
      {...props}
    >
      {loading ? <span aria-hidden="true" className={styles.spinner} /> : null}
      {!loading && icon ? <span className={styles.icon}>{icon}</span> : null}
      <span className={styles.label}>{children}</span>
      {!loading && iconRight ? (
        <span className={styles.icon}>{iconRight}</span>
      ) : null}
    </Component>
  );
}

export default Button;
