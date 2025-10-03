// components/order-success/ProgressStep.jsx
const ProgressStep = ({
  step,
  isCompleted,
  isInProgress,
  isPending,
  index,
}) => {
  const Icon = step.icon;

  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
          isCompleted
            ? "bg-green-500 text-white"
            : isInProgress
              ? "bg-yellow-100 border-2 border-yellow-500 text-yellow-600"
              : "bg-gray-200 text-gray-500"
        }`}
      >
        <Icon size={16} />
      </div>
      <div className="flex-1">
        <span
          className={`text-sm font-medium ${
            isPending ? "text-gray-500" : "text-gray-700"
          }`}
        >
          {step.title}
        </span>
        <p
          className={`text-xs mt-0.5 ${
            isPending ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {step.description}
        </p>
      </div>
      <span
        className={`text-xs px-2 py-1 rounded-full ${
          isCompleted
            ? "bg-green-100 text-green-700"
            : isInProgress
              ? "bg-yellow-100 text-yellow-700"
              : "bg-gray-100 text-gray-500"
        }`}
      >
        {isCompleted ? "Completed" : isInProgress ? "In Progress" : "Pending"}
      </span>
    </div>
  );
};

export default ProgressStep;
