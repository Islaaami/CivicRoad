import {
  formatStatusLabel,
  getStatusTone,
} from "../utils/reportPresentation";
import Badge from "./ui/Badge";

function StatusBadge({ className, size = "md", status }) {
  return (
    <Badge className={className} size={size} tone={getStatusTone(status)}>
      {formatStatusLabel(status)}
    </Badge>
  );
}

export { formatStatusLabel };
export default StatusBadge;
