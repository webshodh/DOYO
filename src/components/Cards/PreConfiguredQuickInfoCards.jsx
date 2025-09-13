import React, { memo } from "react";
import { Clock, Users, Flame, Zap } from "lucide-react";
import QuickInfoCard from "./QuickInfoCard";

// Pre-configured variants for common use cases
export const CookingTimeCard = memo((props) => (
  <QuickInfoCard icon={Clock} colorScheme="orange" {...props} />
));

export const ServingSizeCard = memo((props) => (
  <QuickInfoCard icon={Users} colorScheme="blue" {...props} />
));

export const SpiceLevelCard = memo((props) => (
  <QuickInfoCard icon={Flame} colorScheme="red" {...props} />
));

export const CaloriesCard = memo((props) => (
  <QuickInfoCard icon={Zap} colorScheme="green" {...props} />
));

// Display names
CookingTimeCard.displayName = "CookingTimeCard";
ServingSizeCard.displayName = "ServingSizeCard";
SpiceLevelCard.displayName = "SpiceLevelCard";
CaloriesCard.displayName = "CaloriesCard";
