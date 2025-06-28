import React from 'react';

const ErrorBoundary = ({ children }) => {
  return (
    <React.Suspense
      fallback={
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <h2>Algo salió mal</h2>
          <p>Intenta recargar la página.</p>
        </div>
      }
    >
      {children}
    </React.Suspense>
  );
};

export default ErrorBoundary;
