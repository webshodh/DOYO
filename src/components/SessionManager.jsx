// components/session/SessionManager.jsx
import React, { useState, useEffect } from "react";
import { useTableSession } from "../Context/TableSessionContext";
import { Play, Square, Clock, Users, Receipt } from "lucide-react";

const SessionManager = ({
  tableNumber,
  onSessionChange,
  showControls = true,
}) => {
  const {
    currentSession,
    hasActiveSession,
    sessionTotals,
    startTableSession,
    getActiveSessionForTable,
    endTableSession,
    isLoading,
  } = useTableSession();

  const [isStarting, setIsStarting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  useEffect(() => {
    if (tableNumber && !hasActiveSession) {
      checkForActiveSession();
    }
  }, [tableNumber]);

  const checkForActiveSession = async () => {
    try {
      const session = await getActiveSessionForTable(tableNumber);
      if (session && onSessionChange) {
        onSessionChange(session);
      }
    } catch (error) {
      console.error("Error checking for active session:", error);
    }
  };

  const handleStartSession = async () => {
    setIsStarting(true);
    try {
      const sessionId = await startTableSession(tableNumber);
      if (onSessionChange) {
        onSessionChange({ sessionId, tableNumber });
      }
    } catch (error) {
      console.error("Error starting session:", error);
      alert("Failed to start session. Please try again.");
    } finally {
      setIsStarting(false);
    }
  };

  const handleEndSession = async () => {
    if (!currentSession) return;

    setIsEnding(true);
    try {
      const completedSession = await endTableSession();
      if (onSessionChange) {
        onSessionChange(null);
      }
      return completedSession;
    } catch (error) {
      console.error("Error ending session:", error);
      alert("Failed to end session. Please try again.");
      return null;
    } finally {
      setIsEnding(false);
    }
  };

  const formatDuration = (startTime) => {
    const start = new Date(startTime);
    const now = new Date();
    const diff = now - start;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (!tableNumber) {
    return (
      <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-500">
        Please enter table number to manage session
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Session Status Card */}
      <div
        className={`rounded-lg border-2 p-4 ${
          hasActiveSession
            ? "border-green-200 bg-green-50"
            : "border-gray-200 bg-gray-50"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                hasActiveSession ? "bg-green-500 animate-pulse" : "bg-gray-400"
              }`}
            />
            <div>
              <h3 className="font-semibold text-gray-900">
                Table {tableNumber} Session
              </h3>
              <p className="text-sm text-gray-600">
                {hasActiveSession ? "Active Session" : "No Active Session"}
              </p>
            </div>
          </div>

          {hasActiveSession && (
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Clock size={14} />
                {formatDuration(currentSession.startTime)}
              </div>
            </div>
          )}
        </div>

        {hasActiveSession && (
          <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <p className="text-gray-600">Orders</p>
              <p className="font-semibold text-gray-900">
                {sessionTotals.orderCount}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-600">Items</p>
              <p className="font-semibold text-gray-900">
                {sessionTotals.itemCount}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-600">Total</p>
              <p className="font-semibold text-green-600">
                ₹{sessionTotals.total}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Session Controls */}
      {showControls && (
        <div className="flex gap-3">
          {!hasActiveSession ? (
            <button
              onClick={handleStartSession}
              disabled={isStarting || isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              {isStarting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Starting Session...
                </>
              ) : (
                <>
                  <Play size={18} />
                  Start Session
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleEndSession}
              disabled={isEnding || isLoading}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              {isEnding ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Ending Session...
                </>
              ) : (
                <>
                  <Square size={18} />
                  End Session
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SessionManager;
