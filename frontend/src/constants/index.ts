// Get office location from localStorage or use default
const storedLocation = localStorage.getItem('officeLocation');
const defaultLocation = {
  lat: -7.446754760104717,
  lng: 109.24140415854745,
  radius: 100,
};

export const OFFICE_LOCATION = storedLocation 
  ? JSON.parse(storedLocation) 
  : defaultLocation;

export const ATTENDANCE_RULES = {
  checkIn: {
    start: '07:00',
    end: '07:30',
  },
  checkOut: {
    start: '13:30',
    end: '14:00',
  }
}; 