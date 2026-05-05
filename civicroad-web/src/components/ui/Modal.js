import { useEffect } from "react";
import Button from "./Button";
import styles from "./Modal.module.css";

function Modal({ children, description, onClose, open, title }) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className={styles.backdrop}
      onClick={onClose}
      role="presentation"
    >
      <div
        aria-label={title}
        aria-modal="true"
        className={styles.panel}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className={styles.header}>
          <div className={styles.copy}>
            <h2 className={styles.title}>{title}</h2>
            {description ? (
              <p className={styles.description}>{description}</p>
            ) : null}
          </div>
          <Button onClick={onClose} size="sm" variant="secondary">
            Close
          </Button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}

export default Modal;
