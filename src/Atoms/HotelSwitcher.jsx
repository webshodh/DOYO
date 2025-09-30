import { Building, Check, ChevronDown, Loader } from "lucide-react";
import { memo, useCallback, useState } from "react";

// Hotel switcher dropdown component
const HotelSwitcher = memo(
  ({
    selectedHotel,
    availableHotels,
    onHotelSwitch,
    isOpen,
    onToggle,
    dropdownRef,
  }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleHotelSwitch = useCallback(
      async (hotel) => {
        setIsLoading(true);
        try {
          await onHotelSwitch(hotel);
        } finally {
          setIsLoading(false);
        }
      },
      [onHotelSwitch]
    );

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={onToggle}
          className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-sm font-medium"
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          <Building className="w-4 h-4 text-gray-600" />
          <span className="hidden sm:inline text-gray-700">Switch Hotel</span>
          <span className="sm:hidden text-gray-700">Switch</span>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <>
            {/* Mobile backdrop */}
            <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden" />

            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
              <div className="p-2">
                {/* Header */}
                <div className="px-3 py-2 border-b border-gray-100 mb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">
                      Available Hotels
                    </span>
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                      {availableHotels.length}
                    </span>
                  </div>
                </div>

                {/* Hotel list */}
                <div className="max-h-64 overflow-y-auto space-y-1">
                  {availableHotels.map((hotel) => (
                    <button
                      key={hotel.id}
                      onClick={() => handleHotelSwitch(hotel)}
                      disabled={isLoading}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
                        selectedHotel?.id === hotel.id
                          ? "bg-orange-50 border border-orange-200 text-orange-800"
                          : "hover:bg-gray-50 text-gray-700"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          selectedHotel?.id === hotel.id
                            ? "bg-orange-200 text-orange-600"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <Building className="w-4 h-4" />
                      </div>
                      <span className="flex-1 font-medium truncate">
                        {hotel.name}
                      </span>
                      {selectedHotel?.id === hotel.id && (
                        <Check className="w-4 h-4 text-orange-600 flex-shrink-0" />
                      )}
                      {isLoading && (
                        <Loader className="w-4 h-4 animate-spin text-gray-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
);

HotelSwitcher.displayName = "HotelSwitcher";
export default HotelSwitcher