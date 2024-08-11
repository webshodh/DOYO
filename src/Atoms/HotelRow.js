// src/components/HotelRow/HotelRow.js
import React from 'react';
import { Link } from 'react-router-dom';

const HotelRow = ({ index, hotel, onDelete }) => {
  return (
    <tr>
      <th scope="row">{index + 1}</th>
      <td>{hotel.Hotelname}</td>
      <td>{hotel.district || "NA"}</td>
      <td style={{ textAlign: "center" }}>
        <Link to={`/admin/${hotel.Hotelname}`}>
          <img src="view.png" alt="View" width="25px" height="25px" />
        </Link>
      </td>
      <td style={{ textAlign: "center" }}>
        <img src="/update.png" alt="Edit" width="25px" height="25px" />
      </td>
      <td style={{ textAlign: "center" }}>
        <img
          src="delete.png"
          alt="Delete"
          width="25px"
          height="25px"
          onClick={() => onDelete(hotel.Hotelname)}
          style={{ cursor: 'pointer' }}
        />
      </td>
    </tr>
  );
};

export default HotelRow;
