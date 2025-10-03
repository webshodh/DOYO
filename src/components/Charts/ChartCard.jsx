// Enhanced Chart Component
const ChartCard = ({
  title,
  data,
  color,
  maxValue,
  icon: Icon,
  delay = 0,
  onItemClick,
}) => (
  <div
    className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 animate-fade-in-up overflow-hidden`}
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${color} bg-opacity-20`}>
            <Icon className={`text-lg ${color.replace("bg-", "text-")}`} />
          </div>
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        </div>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {Object.keys(data || {}).length} items
        </span>
      </div>
    </div>

    <div className="p-6">
      <div className="space-y-4 max-h-80 overflow-y-auto">
        {Object.entries(data || {})
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([name, count], index) => (
            <div
              key={name}
              className="group hover:bg-gray-50 p-3 rounded-lg transition-colors duration-200 cursor-pointer"
              onClick={() => onItemClick && onItemClick(name, count)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 truncate max-w-[200px] group-hover:text-gray-900 transition-colors capitalize">
                  {name.replace("_", " ")}
                </span>
                <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                  {count}
                </span>
              </div>
              <div className="flex-1 bg-gray-200 h-3 rounded-full overflow-hidden">
                <div
                  className={`${color} h-3 rounded-full transition-all duration-1000 ease-out`}
                  style={{
                    width: `${(count / Math.max(maxValue, 1)) * 100}%`,
                    animationDelay: `${index * 100}ms`,
                  }}
                ></div>
              </div>
            </div>
          ))}
      </div>
      {Object.keys(data || {}).length === 0 && (
        <div className="text-center text-gray-500 py-8">
          <Icon className="mx-auto text-4xl mb-2 opacity-20" />
          <p>No data available</p>
        </div>
      )}
    </div>
  </div>
);

export default ChartCard;
