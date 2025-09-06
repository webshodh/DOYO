import { Activity, Zap } from "lucide-react";

const NutritionCard = ({ 
  icon: Icon, 
  label, 
  value, 
  unit = "",
  colorScheme = "green",
  showLetter = false,
  letter = ""
}) => {
  const colorClasses = {
    green: {
      bg: "bg-green-500",
      textPrimary: "text-green-600",
      textSecondary: "text-green-800"
    },
    blue: {
      bg: "bg-blue-500",
      textPrimary: "text-blue-600",
      textSecondary: "text-blue-800"
    },
    red: {
      bg: "bg-red-500",
      textPrimary: "text-red-600",
      textSecondary: "text-red-800"
    },
    orange: {
      bg: "bg-orange-500",
      textPrimary: "text-orange-600",
      textSecondary: "text-orange-800"
    },
    purple: {
      bg: "bg-purple-500",
      textPrimary: "text-purple-600",
      textSecondary: "text-purple-800"
    }
  };

  const colors = colorClasses[colorScheme] || colorClasses.green;

  return (
    <div className="text-center bg-white rounded-lg p-3">
      <div className={`w-8 h-8 ${colors.bg} rounded-full mx-auto mb-2 flex items-center justify-center`}>
        {showLetter ? (
          <span className="text-white text-xs font-bold">
            {letter || label.charAt(0).toUpperCase()}
          </span>
        ) : (
          Icon && <Icon className="w-4 h-4 text-white" />
        )}
      </div>
      <p className={`text-xs ${colors.textPrimary} font-medium capitalize`}>
        {label}
      </p>
      <p className={`text-lg font-bold ${colors.textSecondary}`}>
        {value}
      </p>
      {unit && (
        <p className={`text-xs ${colors.textPrimary}`}>
          {unit}
        </p>
      )}
    </div>
  );
};

// Demo showing how to use it
const NutritionalInfoDemo = () => {
  // Sample data (replace with your actual data)
  const modalData = {
    calories: 350,
    nutritionalInfo: {
      protein: 25,
      carbs: 30,
      fat: 15,
      fiber: 8
    }
  };

  // Your formatting function (replace with actual implementation)
  const formatNutritionalInfo = (info) => {
    if (!info) return [];
    return Object.entries(info);
  };

  const hasNutritionalData = modalData.calories || 
    formatNutritionalInfo(modalData.nutritionalInfo)?.length > 0;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Nutritional Information Demo</h2>
      
      {/* Updated Nutritional Information Section */}
      {hasNutritionalData && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-500" />
            Nutritional Information
          </h3>
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {/* Calories Card */}
              {modalData.calories && (
                <NutritionCard
                  icon={Zap}
                  label="Calories"
                  value={modalData.calories}
                  unit="kcal"
                  colorScheme="green"
                />
              )}

              {/* Other Nutritional Info Cards */}
              {formatNutritionalInfo(modalData.nutritionalInfo)?.map(
                ([key, value]) => (
                  <NutritionCard
                    key={key}
                    label={key}
                    value={value}
                    unit="g"
                    colorScheme="blue"
                    showLetter={true}
                    letter={key.charAt(0).toUpperCase()}
                  />
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Additional examples showing different configurations */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Other Examples</h3>
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <NutritionCard
              icon={Zap}
              label="Energy"
              value="450"
              unit="kJ"
              colorScheme="orange"
            />
            
            <NutritionCard
              label="Sodium"
              value="120"
              unit="mg"
              colorScheme="red"
              showLetter={true}
            />
            
            <NutritionCard
              label="Sugar"
              value="8"
              unit="g"
              colorScheme="purple"
              showLetter={true}
            />
            
            <NutritionCard
              icon={Activity}
              label="Vitamins"
              value="Rich"
              colorScheme="green"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionCard;