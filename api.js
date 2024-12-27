const NASA_API_KEY = '7k0s1hIe8qyiehIjr1JrGPJd20FAnofuGBXBRjvp'; // Replace with your NASA API key
const BASE_URL = 'https://api.nasa.gov/planetary/earth/assets';

export const fetchLandsatData = async (lat, lon, date) => {
  try {
    const response = await fetch(
      `${BASE_URL}?lon=${lon}&lat=${lat}&date=${date}&dim=0.15&api_key=${NASA_API_KEY}`
    );
    return await response.json();
  } catch (error) {
    console.error('Error fetching Landsat data:', error);
    throw error;
  }
};