// components/order-success/OrderProgress.jsx
import { useEffect, useState } from "react";
import { CheckCircle, Clock, Utensils } from "lucide-react";
import ProgressStep from "./ProgressStep";

const OrderProgress = ({
  title = "Order Progress",
  autoProgress = true,
  initialStep = 1,
  steps = null,
}) => {
  const [currentStep, setCurrentStep] = useState(initialStep);

  const defaultSteps = [
    {
      id: 1,
      title: "Order Placed",
      status: "completed",
      icon: CheckCircle,
      description: "Your order has been received",
    },
    {
      id: 2,
      title: "Kitchen Preparation",
      status: "pending",
      icon: Clock,
      description: "Chef is preparing your meal",
    },
    {
      id: 3,
      title: "Ready to Serve",
      status: "pending",
      icon: Utensils,
      description: "Order ready for serving",
    },
  ];

  const progressSteps = steps || defaultSteps;

  useEffect(() => {
    if (!autoProgress) return;

    const timer = setTimeout(() => {
      setCurrentStep(2);
    }, 2000);

    return () => clearTimeout(timer);
  }, [autoProgress]);

  const getStepStatus = (stepId) => {
    if (stepId < currentStep) return "completed";
    if (stepId === currentStep) return "in-progress";
    return "pending";
  };

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 text-center">
        {title}
      </h3>
      <div className="space-y-4">
        {progressSteps.map((step, index) => {
          const status = getStepStatus(step.id);
          return (
            <ProgressStep
              key={step.id}
              step={step}
              isCompleted={status === "completed"}
              isInProgress={status === "in-progress"}
              isPending={status === "pending"}
              index={index}
            />
          );
        })}
      </div>
    </div>
  );
};

export default OrderProgress;
