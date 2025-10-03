// components/form/TemplateSelector.jsx
import React, { memo } from "react";

const TemplateSelector = memo(({ templates, onSelectTemplate, disabled }) => {
  const handleTemplateSelect = (templateKey) => {
    const template = templates[templateKey];
    onSelectTemplate(template);
  };

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-700">Quick Templates:</div>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(templates).map(([key, template]) => (
          <button
            key={key}
            type="button"
            onClick={() => handleTemplateSelect(key)}
            disabled={disabled}
            className="p-2 text-left border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-sm font-medium text-gray-900">
              {template.planName}
            </div>
            <div className="text-xs text-gray-600">₹{template.price}/month</div>
          </button>
        ))}
      </div>
    </div>
  );
});

TemplateSelector.displayName = "TemplateSelector";
export default TemplateSelector;
