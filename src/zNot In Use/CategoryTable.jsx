import React from "react";

const CategoryTable = ({ categories, onUpdateCategory, onDeleteCategory }) => {
  return (
    <table className="table">
      <thead className="thead-dark">
        <tr>
          <th scope="col">Sr.No</th>
          <th scope="col">Category Name</th>
          <th scope="col" colSpan="2">Action</th>
        </tr>
      </thead>
      <tbody>
        {categories.map((item, index) => (
          <tr key={item.categoryId}>
            <th scope="row">{index + 1}</th>
            <td>{item.categoryName}</td>
            <td>
              <img
                src="/update.png"
                width="25px"
                height="25px"
                style={{ marginRight: "2px" }}
                onClick={() => onUpdateCategory(item)}
                alt="Update"
              />
            </td>
            <td>
              <img
                src="/delete.png"
                width="25px"
                height="25px"
                style={{ marginRight: "2px" }}
                onClick={() => onDeleteCategory(item)}
                alt="Delete"
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default CategoryTable;
