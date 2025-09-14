import { formatCurrency } from "Constants/orderConfig";
import {
  CheckCircle,
  Clock,
  DollarSign,
  Package,
  TrendingUp,
  Users,
} from "lucide-react";
import StatCard from "./StatCard";

export const OrderStatsCards = ({ analytics, variant = "basic" }) => {
  const basicCards = [
    {
      icon: Package,
      title: "Total Orders",
      value: analytics.totalOrders,
      color: "blue",
    },
    {
      icon: CheckCircle,
      title: "Completed Orders",
      value: analytics.completedOrders,
      color: "green",
    },
    {
      icon: DollarSign,
      title: "Total Revenue",
      value: formatCurrency(analytics.totalRevenue),
      color: "purple",
    },
    {
      icon: TrendingUp,
      title: "Avg Order Value",
      value: formatCurrency(analytics.avgOrderValue),
      color: "orange",
    },
  ];

  const detailedCards = [
    ...basicCards,
    {
      icon: Clock,
      title: "Pending Orders",
      value: analytics.pendingOrders,
      color: "yellow",
    },
    {
      icon: Users,
      title: "Unique Customers",
      value: analytics.uniqueCustomers,
      color: "indigo",
    },
  ];

  const cards = variant === "detailed" ? detailedCards : basicCards;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="transform hover:scale-105 transition-all duration-300"
        >
          <StatCard
            icon={card.icon}
            title={card.title}
            value={card.value}
            color={card.color}
          />
        </div>
      ))}
    </div>
  );
};
