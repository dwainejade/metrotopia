import { forwardRef } from 'react';

const RoundedButton = forwardRef(({ text, color, onClick, size, disabled, fontSize }, ref) => {
  // Define sizes based on the size prop
  const sizes = {
    small: {
      fontSize: fontSize || '.8rem',
      padding: '5px 9px',
      minWidth: '85px',
      width: 'fit-content',
      height: '34px',
    },
    medium: {
      fontSize: '1rem',
      padding: '8px 15px',
      width: 'fit-content',
      height: '40px',
    },
    large: {
      fontSize: '1.2rem',
      padding: '2px 25px',
      width: 'fit-content',
      height: '50px',
    },
  };

  // Default to medium size if none provided
  const selectedSize = sizes[size] || sizes.medium;

  const buttonStyle = {
    ...selectedSize, // Apply size-based styles
    position: 'relative',
    // fontFamily: 'Arial, sans-serif',
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: color || '#4a6537', // Default color if no color prop is passed
    borderRadius: '40px',
    transition: 'all 0.2s ease-in-out',
    textTransform: 'uppercase',
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.5 : 1, // Adjust opacity for disabled state
    border: '1px solid white', // Inner border
  };

  const outerBorderStyle = {
    boxShadow: `0 0 0 2px ${color || '#4a6537'}`, // Outer border
  };

  const hoverStyle = (color) => {
    if (color === '#779de0') {
      return '#a1bef5';
    } else if (color === '#c78e67') {
      return '#dbb093';
    } else if (color === '#8d5999') {
      return '#d8aae3';
    } else if (color === '#fbb040') {
      return '#d48d35';
    } else if (color === '#4a6536') {
      return '#fbb040';
    } else {
      return '#385020';
    }
  };

  const handleMouseEnter = (e) => {
    if (!disabled) {
      e.target.style.backgroundColor = hoverStyle(color || '#385020');

      if (color === '#4a6536') {
        e.target.style.boxShadow = `0 0 0 2px #fbb040`;
      }
    }
  };

  const handleMouseLeave = (e) => {
    if (!disabled) {
      e.target.style.backgroundColor = color || '#4a6537';

      if (color === '#4a6536') {
        e.target.style.boxShadow = `0 0 0 2px #4a6536`;
      }
    }
  };

  return (
    <button
      ref={ref}
      style={{ ...buttonStyle, ...outerBorderStyle }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={disabled}
      onClick={!disabled ? onClick : null}
    >
      {text}
    </button>
  );
});

export default RoundedButton;
