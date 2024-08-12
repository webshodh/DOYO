import React from 'react';
import { useAuthContext } from '../../Context/AuthContext'; // Adjust the import path accordingly
import useAdminData from '../../data/useAdminData'; // Adjust the path as necessary

function NavAvatar() {
  const { currentAdminId } = useAuthContext(); // Get the current admin ID from context
  const { data, loading, error } = useAdminData(`/admins/${currentAdminId}`);
  
  console.log('Admin Data:', data); // Check if you're getting the correct admin data

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const adminData = data;

  return (
    <li className="nav-item dropdown pe-3">
      <a
        className="nav-link nav-profile d-flex align-items-center pe-0"
        href="#"
        data-bs-toggle="dropdown"
      >
        <span className="d-none d-md-block dropdown-toggle ps-2">
          {adminData?.name || 'User'}
        </span>
      </a>

      <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow profile">
        <li className="dropdown-header">
          <h6>{adminData?.name || 'User'}</h6>
          <span>{adminData?.role || 'Role'}</span>
        </li>
        <li>
          <hr className="dropdown-divider" />
        </li>

        <li>
          <a
            className="dropdown-item d-flex align-items-center"
            href="users-profile.html"
          >
            <i className="bi bi-person"></i>
            <span>My Profile</span>
          </a>
        </li>
        <li>
          <hr className="dropdown-divider" />
        </li>

        <li>
          <a
            className="dropdown-item d-flex align-items-center"
            href="users-profile.html"
          >
            <i className="bi bi-gear"></i>
            <span>Account Settings</span>
          </a>
        </li>
        <li>
          <hr className="dropdown-divider" />
        </li>

        <li>
          <a
            className="dropdown-item d-flex align-items-center"
            href="pages-faq.html"
          >
            <i className="bi bi-question-circle"></i>
            <span>Need Help?</span>
          </a>
        </li>
        <li>
          <hr className="dropdown-divider" />
        </li>

        <li>
          <a className="dropdown-item d-flex align-items-center" href="#">
            <i className="bi bi-box-arrow-right"></i>
            <span>Sign Out</span>
          </a>
        </li>
      </ul>
    </li>
  );
}

export default NavAvatar;
