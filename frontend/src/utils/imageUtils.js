// Function to get complete image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  // Remove any leading slash to avoid double slashes in the URL
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  return `http://localhost:3000/${cleanPath}`;
};

// Image error handler that removes the image on error
export const handleImageError = (e) => {
  e.target.style.display = 'none';
  e.target.onerror = null;
}; 