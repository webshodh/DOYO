// components/order-success/ImportantNotes.jsx
import { Star } from "lucide-react";

const ImportantNotes = ({
  title = "Important Information",
  icon: IconComponent = Star,
  notes = null,
  variant = "orange", // orange, blue, green, yellow
}) => {
  const defaultNotes = [
    "Please remain at your table during preparation",
    "Your order will be served hot and fresh",
    "Kitchen staff will notify you when ready",
    "Contact staff if you need any assistance",
  ];

  const notesList = notes || defaultNotes;

  const variants = {
    orange: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      titleColor: "text-orange-900",
      textColor: "text-orange-800",
      bulletColor: "text-orange-500",
    },
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      titleColor: "text-blue-900",
      textColor: "text-blue-800",
      bulletColor: "text-blue-500",
    },
    green: {
      bg: "bg-green-50",
      border: "border-green-200",
      titleColor: "text-green-900",
      textColor: "text-green-800",
      bulletColor: "text-green-500",
    },
    yellow: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      titleColor: "text-yellow-900",
      textColor: "text-yellow-800",
      bulletColor: "text-yellow-500",
    },
  };

  const styles = variants[variant] || variants.orange;

  return (
    <div className={`${styles.bg} border ${styles.border} rounded-lg p-4 mb-6`}>
      <h4
        className={`flex items-center gap-2 font-medium ${styles.titleColor} mb-3`}
      >
        <IconComponent size={16} />
        {title}
      </h4>
      <ul className={`text-sm ${styles.textColor} space-y-2`}>
        {notesList.map((note, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className={`${styles.bulletColor} mt-0.5`}>•</span>
            <span>{note}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ImportantNotes;
