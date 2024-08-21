import React from "react";

const DynamicTable = ({ columns, data, onEdit, onDelete, actions }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-orange-500 text-white">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="text-left px-6 py-3 text-sm font-medium tracking-wider"
              >
                {column.header}
              </th>
            ))}
            {(onEdit || onDelete || actions) && (
              <th className="text-left px-6 py-3 text-sm font-medium tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item, index) => (
              <tr
                key={index}
                className="even:bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 text-sm text-gray-700">
                    {item[column.accessor]}
                  </td>
                ))}
                {(onEdit || onDelete || actions) && (
                  <td className="px-6 py-4 text-sm text-gray-700 flex space-x-2">
                    {onEdit && (
                      <button
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        onClick={() => onEdit(item)}
                      >
                        <i className="bi bi-pencil-square"></i>
                      </button>
                    )}
                    {onDelete && (
                      <button
                       
                      className="text-red-600 hover:text-red-800 transition-colors"
                      onClick={() => onDelete(item)}
                    >
                      <i className="bi bi-trash3-fill"></i>
                    </button>
                  )}
                  {actions &&
                    actions.length > 0 &&
                    actions.map((action, actionIndex) => (
                      <button
                        key={actionIndex}
                        className={`text-${action.variant}-600 hover:text-${action.variant}-800 transition-colors`}
                        onClick={() => action.handler(item)}
                      >
                        {action.label}
                      </button>
                    ))}
                </td>
              )}
            </tr>
          ))
        ) : (
          <tr>
            <td
              colSpan={columns.length + 1}
              className="px-6 py-4 text-center text-gray-500"
            >
              No data available
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);
};

export default DynamicTable;
