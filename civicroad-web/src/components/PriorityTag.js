import {
  formatPriorityLabel,
  getPriorityTone,
} from "../utils/reportPresentation";
import Badge from "./ui/Badge";

function PriorityTag({ className, priority, size = "md" }) {
  const normalizedPriority = priority || null;

  return (
    <Badge
      className={className}
      size={size}
      tone={getPriorityTone(normalizedPriority)}
    >
      {formatPriorityLabel(normalizedPriority)}
    </Badge>
  );
}

export { formatPriorityLabel };
export default PriorityTag;
