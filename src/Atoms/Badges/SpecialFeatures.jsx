import React, { memo, useMemo } from "react";
import { Leaf, Shield, Zap } from "lucide-react";

const SpecialFeatures = memo(({ item, maxFeatures = 1 }) => {
  const features = useMemo(() => {
    const featureList = [];

    if (item.isVegan) {
      featureList.push({
        text: "Vegan",
        icon: <Leaf className="w-3 h-3" />,
        color: "bg-green-100 text-green-700",
      });
    }
    if (item.isGlutenFree) {
      featureList.push({
        text: "Gluten Free",
        icon: <Shield className="w-3 h-3" />,
        color: "bg-blue-100 text-blue-700",
      });
    }
    if (item.isHighProtein) {
      featureList.push({
        text: "High Protein",
        icon: <Zap className="w-3 h-3" />,
        color: "bg-red-100 text-red-700",
      });
    }
    if (item.isOrganic) {
      featureList.push({
        text: "Organic",
        icon: <Leaf className="w-3 h-3" />,
        color: "bg-emerald-100 text-emerald-700",
      });
    }
    if (item.isSugarFree) {
      featureList.push({
        text: "Sugar Free",
        icon: <Shield className="w-3 h-3" />,
        color: "bg-purple-100 text-purple-700",
      });
    }

    return featureList.slice(0, maxFeatures);
  }, [item, maxFeatures]);

  if (features.length === 0) return null;

  return (
    <div className="flex items-center flex-wrap gap-1">
      {features.map((feature, index) => (
        <span
          key={`${feature.text}-${index}`}
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${feature.color} animate-fadeIn`}
        >
          {feature.icon}
          <span className=" sm:inline">{feature.text}</span>
        </span>
      ))}
    </div>
  );
});

SpecialFeatures.displayName = "SpecialFeatures";

export default SpecialFeatures;
