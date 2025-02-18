// ... (previous imports remain the same)

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const newErrors: SignupError[] = [];
  setDebugInfo('Starting signup process...');

  try {
    // Log the attempt
    console.log('Attempting signup:', {
      email,
      timestamp: new Date().toISOString(),
      origin: window.location.origin
    });

    // ... (validation code remains the same)

    setLoading(true);
    setDebugInfo('Initiating signup with Supabase...');
    
    const { error, confirmationSent, debugDetails } = await signUp(email, password);
    
    setDebugInfo(`Signup response received:\n${JSON.stringify(debugDetails, null, 2)}`);
    
    if (error) {
      console.error('Signup error:', error);
      newErrors.push({
        step: 'supabase_signup',
        message: error.message,
        details: debugDetails
      });
      setErrors(newErrors);
      return;
    }

    if (confirmationSent) {
      setDebugInfo('Signup successful - confirmation email should be sent');
      console.log('Redirecting to email verification page:', {
        email,
        timestamp: new Date().toISOString()
      });
      navigate('/email-verification');
    } else {
      setDebugInfo('Signup successful - no confirmation required');
      navigate('/');
    }

  } catch (err) {
    // ... (error handling remains the same)
  } finally {
    setLoading(false);
  }
};

// ... (rest of the component remains the same)
