import { classNames } from "../../utils/classNames";
import styles from "./Card.module.css";

const paddingClassNames = {
  none: "paddingNone",
  sm: "paddingSm",
  md: "paddingMd",
  lg: "paddingLg",
};

const toneClassNames = {
  default: "toneDefault",
  soft: "toneSoft",
  subtle: "toneSubtle",
};

function Card({
  as: Component = "section",
  children,
  className,
  padding = "md",
  tone = "default",
  ...props
}) {
  return (
    <Component
      className={classNames(
        styles.card,
        styles[paddingClassNames[padding] || paddingClassNames.md],
        styles[toneClassNames[tone] || toneClassNames.default],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export default Card;
