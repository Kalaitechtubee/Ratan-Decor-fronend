import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserTypeContext } from '../context/UserTypeContext';
import UserTypePopup from '../components/UserTypePopup';

const Popup = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openUserTypePopup } = useContext(UserTypeContext);

  useEffect(() => {
    const storedType = localStorage.getItem('userType');
    if (user && !storedType) {
      openUserTypePopup();
    } else if (user && storedType) {
      navigate('/home');
    } else if (!user) {
      navigate('/login');
    }
  }, [user, navigate, openUserTypePopup]);

  return <UserTypePopup />;
};

export default Popup;