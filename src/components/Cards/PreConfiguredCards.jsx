import React, { memo } from "react";
import { Activity, Heart, Zap, TrendingUp, Shield, Target } from "lucide-react";
import NutritionCard from "./NutritionCard";

// Pre-configured variants for common nutrition values
export const CaloriesCard = memo((props) => (
  <NutritionCard icon={Zap} colorScheme="orange" unit="kcal" {...props} />
));

export const ProteinCard = memo((props) => (
  <NutritionCard icon={Activity} colorScheme="blue" unit="g" {...props} />
));

export const CarbsCard = memo((props) => (
  <NutritionCard icon={TrendingUp} colorScheme="green" unit="g" {...props} />
));

export const FatCard = memo((props) => (
  <NutritionCard icon={Heart} colorScheme="purple" unit="g" {...props} />
));

export const FiberCard = memo((props) => (
  <NutritionCard icon={Shield} colorScheme="teal" unit="g" {...props} />
));

export const SugarCard = memo((props) => (
  <NutritionCard icon={Target} colorScheme="red" unit="g" {...props} />
));

// Display names for pre-configured variants
CaloriesCard.displayName = "CaloriesCard";
ProteinCard.displayName = "ProteinCard";
CarbsCard.displayName = "CarbsCard";
FatCard.displayName = "FatCard";
FiberCard.displayName = "FiberCard";
SugarCard.displayName = "SugarCard";
