// Function to get complete image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) {
    // Ensure HTTPS protocol for security
    return imagePath.replace(/^http:/, 'https:');
  }
  // Remove any leading slash to avoid double slashes in the URL
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  return `https://project-cnc-web-portal.onrender.com/${cleanPath}`;
};

// Image error handler with fallback placeholder
export const handleImageError = (e) => {
  // Set a fallback placeholder image
  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTI1SDIyNVYxNzVIMTc1VjEyNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTE1MCAyMDBIMjUwVjIyNUgxNTBWMjAwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
  e.target.alt = 'Image not available';
  e.target.className += ' opacity-50';
  e.target.onerror = null; // Prevent infinite loop
};

// Filter console warnings to reduce noise from third-party libraries
export const setupConsoleFilter = () => {
  if (process.env.NODE_ENV === 'development') {
    const originalWarn = console.warn;
    console.warn = (...args) => {
      const message = args.join(' ');
      // Filter out specific third-party library warnings that we can't control
      if (
        message.includes('DialogContent') ||
        message.includes('DialogTitle') ||
        message.includes('VisuallyHidden') ||
        message.includes('aria-describedby')
      ) {
        return; // Suppress these warnings
      }
      originalWarn.apply(console, args);
    };
  }
}; 