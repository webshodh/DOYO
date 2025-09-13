import React, { memo } from "react";
import { AlertCircle } from "lucide-react";

const UnavailableNotice = memo(() => (
  <div className="w-full bg-red-50 border border-red-200 text-red-700 py-4 px-6 rounded-xl flex items-center justify-center gap-3 font-semibold text-lg mb-4">
    <AlertCircle className="w-5 h-5" />
    Currently Unavailable
  </div>
));

UnavailableNotice.displayName = "UnavailableNotice";

export default UnavailableNotice;
