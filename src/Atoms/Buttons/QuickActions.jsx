const { Building2, Users, Package, BarChart3, Zap } = require("lucide-react");
const { useNavigate } = require("react-router-dom");

// Quick Actions Component
const QuickActions = () => {
  const navigate = useNavigate();
  const actions = [
    {
      title: "Add New Hotel",
      description: "Register a new hotel property",
      icon: Building2,
      color: "bg-green-500",
      onClick: () => navigate("/super-admin/hotels"),
    },
    {
      title: "Manage Admins",
      description: "Add or manage admin users",
      icon: Users,
      color: "bg-blue-500",
      onClick: () => navigate("/super-admin/admins"),
    },
    {
      title: "Subscription Plans",
      description: "Create and manage plans",
      icon: Package,
      color: "bg-purple-500",
      onClick: () => navigate("/super-admin/subscriptions"),
    },
    {
      title: "View Reports",
      description: "Generate detailed analytics",
      icon: BarChart3,
      color: "bg-orange-500",
      onClick: () => navigate("/super-admin/reports"),
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <Zap className="mr-2" />
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className="p-4 border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-lg transition-all duration-200 text-left group"
          >
            <div
              className={`p-2 rounded-lg ${action.color} bg-opacity-20 mb-3 w-fit`}
            >
              <action.icon
                className={`text-lg ${action.color.replace("bg-", "text-")}`}
              />
            </div>
            <h4 className="font-semibold text-gray-800 group-hover:text-gray-900">
              {action.title}
            </h4>
            <p className="text-sm text-gray-600 mt-1">{action.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
