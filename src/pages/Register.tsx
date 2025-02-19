import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, AlertCircle, Info } from 'lucide-react';
import { validatePassword, validateEmail } from '../utils/validation';

interface SignupError {
  step: string;
  message: string;
  details?: any;
}

const Register = () => {
  // ... rest of the component code stays the same ...
};

export default Register;
