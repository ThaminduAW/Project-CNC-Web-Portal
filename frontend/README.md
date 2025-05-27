# CNC Web Portal - Frontend

A React-based web application for managing restaurant partnerships, reservations, and customer experiences.

## Features

### Partner Dashboard
- **Calendar Management**: Interactive calendar view for managing events and viewing reservations
- **Reservation Management**: View and manage customer reservations with status updates
- **Menu Management**: Add, edit, and organize restaurant menu items
- **Messaging System**: Communicate with administrators and customers
- **Profile Settings**: Update restaurant information and operating hours

### Calendar Page Features

The calendar page (`/partner/calendar`) provides partners with a comprehensive view of their restaurant's schedule:

#### Event Management
- **Create Events**: Add special events like wine tastings, dinner specials, or promotional activities
- **Edit Events**: Modify existing event details including time, capacity, and description
- **Delete Events**: Remove cancelled or outdated events
- **Visual Indicators**: Color-coded events for easy identification

#### Reservation Display
- **Reservation Overview**: View all customer reservations directly on the calendar
- **Status Management**: Update reservation statuses (confirm, cancel) directly from calendar
- **Customer Details**: Access customer information including name, email, party size, and special instructions
- **Color Coding**:
  - Green: Confirmed reservations
  - Yellow: Pending reservations
  - Red: Cancelled reservations
  - Orange: Special events

#### Calendar Views
- **Month View**: See the entire month at a glance
- **Week View**: Detailed weekly schedule view
- **Day View**: Hour-by-hour breakdown for specific days
- **Agenda View**: List format showing upcoming events and reservations

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Dependencies

- React 19.0.0
- React Router DOM 7.2.0
- React Big Calendar 1.18.0
- Moment.js 2.30.1
- Axios 1.8.4
- React Icons 5.5.0
- React Toastify 11.0.5
- Tailwind CSS 4.0.11

## API Endpoints

### Reservations
- `GET /api/reservations/partner` - Fetch partner's reservations
- `PUT /api/reservations/:id/status` - Update reservation status

### Events (Future Implementation)
- `GET /api/partner/:id/events` - Fetch partner's events
- `POST /api/partner/events` - Create new event
- `PUT /api/partner/events/:id` - Update existing event
- `DELETE /api/partner/events/:id` - Delete event

## Component Structure

```
src/
├── pages/
│   └── Partners/
│       ├── PartnerCalendar.jsx     # Main calendar component
│       ├── PartnerDashboard.jsx    # Dashboard overview
│       ├── Reservations.jsx        # Reservation management
│       └── ...
├── components/
│   ├── PartnerSideBar.jsx          # Navigation sidebar
│   └── ...
├── styles/
│   ├── calendar.css                # Custom calendar styling
│   └── ...
└── utils/
    ├── baseURL.js                  # API configuration
    └── ...
```

## Usage

### Accessing the Calendar
1. Log in as a partner
2. Navigate to the Partner Dashboard
3. Click on "Calendar" in the sidebar menu

### Creating Events
1. Click on any empty calendar slot or use the "Add Event" button
2. Fill in event details (title, description, time, capacity)
3. Save the event

### Managing Reservations
1. Click on any reservation in the calendar
2. View customer details and special instructions
3. Update status if needed (confirm/cancel)

## Styling

The calendar uses custom CSS (`src/styles/calendar.css`) to match the application's design theme:
- Primary color: `#fea116` (orange)
- Background: `#fdfcdc` (light cream)
- Text: `#001524` (dark blue)

## Future Enhancements

- **Backend Integration**: Full API implementation for events management
- **Recurring Events**: Support for weekly/monthly recurring events
- **Email Notifications**: Automatic customer notifications for event updates
- **Availability Management**: Set restaurant availability directly from calendar
- **Export Features**: Export calendar data to external formats
- **Mobile Optimization**: Enhanced mobile calendar interface

## Development Notes

The calendar component currently uses mock data for events while the reservations are fetched from the actual API. This allows immediate testing and demonstration while the events API is being developed.

## Support

For technical issues or feature requests, please contact the development team.
