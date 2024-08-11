import React from 'react';
import { Table } from 'react-bootstrap';

const DynamicTable = ({ columns, data, onEdit, onDelete, actions }) => {
  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          {columns.map((column, index) => (
            <th key={index}>{column.header}</th>
          ))}
          {(onEdit || onDelete || actions) ? <th>Actions</th> : null}
        </tr>
      </thead>
      <tbody>
        {data.length > 0 ? (
          data.map((item, index) => (
            <tr key={index}>
              {columns.map((column, colIndex) => (
                <td key={colIndex}>{item[column.accessor]}</td>
              ))}
              {(onEdit || onDelete || actions) ? (
                <td>
                  {onEdit && (
                    <button
                      className="btn btn-primary btn-sm mr-2"
                      onClick={() => onEdit(item)}
                    >
                     <i class="bi bi-pencil-square"></i>
                    </button>
                  )}
                  {onDelete && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => onDelete(item)}
                    >
                      <i class="bi bi-trash3-fill"></i>
                    </button>
                  )}
                  {actions && actions.length > 0 && actions.map((action, actionIndex) => (
                    <button
                      key={actionIndex}
                      className={`btn btn-${action.variant} btn-sm ${actionIndex > 0 ? 'ml-2' : ''}`}
                      onClick={() => action.handler(item)}
                    >
                      {action.label}
                    </button>
                  ))}
                </td>
              ) : null}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={columns.length + 1}>
              No data available
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
};

export default DynamicTable;
