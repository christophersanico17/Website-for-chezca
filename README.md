# 📚 Library Table Reservation System

A modern web application for managing library table bookings and reservations. Check real-time availability, book tables, and manage seat allocations.

## Features

✅ **Real-time Table Management**
- View all library tables with live availability status
- Check capacity and available seats for each table
- Filter tables by availability status

✅ **Smart Booking System**
- Book tables with your details (name, email, purpose)
- Specify number of seats needed
- Automatic validation of available seats
- Prevent overbooking

✅ **Availability Tracking**
- See which tables are available and which are occupied
- View total available seats across all tables
- Quick statistics dashboard

✅ **Easy Release System**
- Mark tables as available when done using them
- Clear all bookings with one click
- Automatic update of seat availability for other users

✅ **Responsive Design**
- Works on desktop, tablet, and mobile devices
- Smooth animations and modern UI
- User-friendly interface

## How to Use

### 1. **Opening the Website**
   - Double-click `index.html` to open in your browser
   - Or right-click → Open with → Your preferred browser

### 2. **Viewing Tables**
   - All 8 tables are displayed with their current status
   - **Green badge** = Available table
   - **Red badge** = Occupied table
   - Shows capacity and current bookings

### 3. **Filtering Tables**
   - Click "All Tables" to see everything
   - Click "Available Only" to see unbooked tables
   - Click "Occupied Only" to see booked tables

### 4. **Booking a Table**
   1. Click "Book Table" on an available table card
   2. Fill in your details:
      - Your Name (required)
      - Email (required)
      - Number of Seats Needed (required)
      - Purpose/Notes (optional)
   3. Click "Confirm Booking"
   4. You'll see a success message

### 5. **Viewing Table Details**
   1. Click "Details" on any table card
   2. See:
      - Table status (Available/Occupied)
      - Total capacity
      - Available and booked seats
      - All current bookings with user info

### 6. **Releasing a Table**
   1. Click "Details" on an occupied table
   2. Click "Mark as Available" button
   3. Confirm to clear all bookings
   4. Table becomes available for others

### 7. **Checking Statistics**
   - Top section shows real-time stats:
     - **Total Tables**: Number of library tables
     - **Available Tables**: Tables with no bookings
     - **Occupied Tables**: Tables with active bookings
     - **Total Seats Available**: Sum of all free seats

## Table Information

The system comes pre-configured with 8 library tables:
- **Tables 1, 2, 7**: 4 seats each
- **Tables 3, 4, 8**: 6 seats each
- **Table 5**: 8 seats
- **Table 6**: 2 seats

## Data Storage

- All bookings are saved automatically using browser's local storage
- Data persists between sessions (won't be lost when you close the browser)
- Only clearing browser cache will reset the data
- To reset all tables, delete the stored data in your browser settings

## Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- No server or internet connection needed
- Works completely offline

## File Structure

```
├── index.html      # Main webpage structure and layout
├── style.css       # Styling and responsive design
├── script.js       # All booking and reservation logic
└── README.md       # This file
```

## Tips for Best Results

1. **Mobile Friendly**: Works great on smartphones and tablets
2. **Share Links**: Each user can access the same website to see live availability
3. **Print**: Use browser's print function (Ctrl+P) to print table status
4. **Accessibility**: Keyboard navigation fully supported

## Troubleshooting

**Tables not appearing?**
- Refresh the page (F5 or Ctrl+R)
- Make sure all three files (HTML, CSS, JS) are in the same folder

**Bookings disappeared?**
- Check if you cleared your browser cache/data
- Data is stored per browser per website

**Buttons not working?**
- Try updating your browser to the latest version
- Disable any browser extensions that might interfere

## Future Enhancements Possible

- Email notifications for reservations
- Time-based bookings (reserve for specific hours)
- Admin dashboard
- Integration with calendar system
- Photo/QR codes for tables
- Recurring reservations

---

**Enjoy your improved library management system!** 📚✨
