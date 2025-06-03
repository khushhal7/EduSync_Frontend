    // src/components/Notification.jsx
    import React, { useEffect } from 'react';

    function Notification({ message, type = 'info', show, onClose, duration = 3000 }) {
      useEffect(() => {
        let timer;
        if (show && duration > 0) {
          timer = setTimeout(() => {
            onClose();
          }, duration);
        }
        return () => clearTimeout(timer); // Cleanup timer on component unmount or if show/duration changes
      }, [show, duration, onClose]);

      if (!show) {
        return null;
      }

      // Determine the Bootstrap alert class based on the type
      let alertClass = 'alert-info'; // Default
      if (type === 'success') {
        alertClass = 'alert-success';
      } else if (type === 'danger' || type === 'error') {
        alertClass = 'alert-danger';
      } else if (type === 'warning') {
        alertClass = 'alert-warning';
      }

      return (
        <div 
          className={`alert ${alertClass} alert-dismissible fade show shadow-sm`} 
          role="alert"
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1050, // Ensure it's above most other content
            minWidth: '250px',
            maxWidth: '400px',
          }}
        >
          {message}
          <button 
            type="button" 
            className="btn-close" 
            onClick={onClose} 
            aria-label="Close"
          ></button>
        </div>
      );
    }

    export default Notification;
    
    