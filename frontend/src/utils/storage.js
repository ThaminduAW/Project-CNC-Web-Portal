export const saveExperiences = (experiences) => {
  try {
    const serializedExperiences = experiences.map(exp => ({
      ...exp,
      availableDates: exp.availableDates.map(date => date.toISOString())
    }));
    localStorage.setItem('experiences', JSON.stringify(serializedExperiences));
    return true;
  } catch (error) {
    console.error('Error saving experiences:', error);
    return false;
  }
};

export const loadExperiences = () => {
  try {
    const storedExperiences = JSON.parse(localStorage.getItem('experiences') || '[]');
    return storedExperiences.map(exp => ({
      ...exp,
      availableDates: exp.availableDates.map(date => new Date(date))
    }));
  } catch (error) {
    console.error('Error loading experiences:', error);
    return [];
  }
};

export const saveImage = (file) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File must be an image'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

// Get experiences by category (e.g., 'restaurant')
export const getExperiencesByCategory = (category) => {
  try {
    const experiences = loadExperiences();
    return experiences.filter(exp => exp.category === category);
  } catch (error) {
    console.error('Error getting experiences by category:', error);
    return [];
  }
};

// Get featured experiences for home page
export const getFeaturedExperiences = () => {
  try {
    const experiences = loadExperiences();
    // Sort by rating and return top experiences
    return experiences
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 6);
  } catch (error) {
    console.error('Error getting featured experiences:', error);
    return [];
  }
}; 