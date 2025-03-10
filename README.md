# NYC-transit-hub

A comprehensive web application providing real-time information about New York City's transit system, including subway, bus, and rail services.

## Features

- **Real-time Transit Status**: View current service status for all NYC transit lines
- **Trip Planning**: Plan your journey with optimized routes based on current conditions
- **Service Alerts**: Get notified about delays, service changes, and disruptions
- **Station Information**: Access detailed information about stations and stops

## Tech Stack

### Frontend
- **Framework**: Next.js (React)
- **Styling**: Tailwind CSS
- **State Management**: React Hooks

### Backend
- **API**: Python Flask
- **Database**: SQLite
- **Data Sources**: MTA Real-time Data Feeds

## Project Structure

```
nyc-transit-hub/
├── frontend/               # Next.js frontend
│   ├── app/                # App Router 
│   │   ├── components/     # Reusable UI components
│   │   ├── lib/            # Utility functions, API clients
│   │   ├── status/         # Status page
│   │   ├── planner/        # Trip planner page
│   │   ├── maps/           # Maps page
│   │   ├── alerts/         # Service alerts page
│   │   └── page.tsx        # Homepage
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
│
├── backend/                # Flask backend
│   ├── app.py              # Main Flask application
│   ├── models/             # Database models
│   ├── routes/             # API endpoints
│   ├── services/           # Business logic and integrations
│   └── tests/              # Backend tests
│
└── README.md               # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- Python (v3.8+)
- Git

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/nyc-transit-hub.git
   cd nyc-transit-hub
   ```

2. Set up the frontend
   ```bash
   cd frontend
   npm install
   ```

3. Set up the backend
   ```bash
   cd ../backend
   python -m venv venv
   
   # On Windows:
   # venv\Scripts\activate
   
   # On macOS/Linux:
   source venv/bin/activate
   
   pip install -r requirements.txt
   ```

### Running the Application

1. Start the backend server
   ```bash
   cd backend
   python app.py
   ```

2. In a new terminal, start the frontend development server
   ```bash
   cd frontend
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000`

## API Integration

This application integrates with the MTA's real-time data feeds:

- **Subway Status**: Provides current service status for subway lines
- **Bus Status**: Provides current service status for bus routes
- **GTFS Real-time Feeds**: Provides real-time train arrival information

## Development Timeline

- **Week 1-2**: Repository setup, basic UI & API integration
- **Week 3-4**: Backend logic, database implementation
- **Week 5-6**: Testing, security, optimizations
- **Week 7+**: Deployment, feedback, iteration

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- MTA for providing open transit data
- NYC Open Data platform
