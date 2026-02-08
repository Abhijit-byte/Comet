# CosmosTrace - NEO Tracker

A complete real-time Near-Earth Object (NEO) monitoring system powered by NASA's API.

## Features

- **Real-Time Dashboard**: Live tracking of asteroids with velocity and distance metrics
- **Risk Analysis**: Comprehensive hazard assessment with visual charts
- **Asteroid Catalog**: Browse and filter all tracked Near-Earth Objects
- **AI Assistant Chat**: Interactive chatbot for NEO-related questions
- **Data Visualization**: Charts showing velocity distribution and distance metrics
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## Technology Stack

- **Frontend**: Next.js 16 with React 19
- **Styling**: Tailwind CSS with shadcn/ui components
- **Data Visualization**: Recharts
- **API**: NASA NEO API v1
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- NASA API Key (provided)

### Installation

1. **Clone and Setup**
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Environment Variables**
   The `.env.local` file is already configured with:
   - `NASA_API_KEY`: BtS3sRoAXOeRx0YS8M5EjFUYvblVAJd6CZy3mulD

3. **Run Development Server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. **Open in Browser**
   Navigate to `http://localhost:3000`

## Project Structure

```
app/
├── api/
│   ├── asteroids/route.ts    # Fetch NEO data
│   ├── stats/route.ts         # Compute statistics
│   └── chat/route.ts          # AI assistant responses
├── layout.tsx                 # Root layout with dark theme
└── page.tsx                   # Main dashboard page

components/
├── dashboard.tsx              # Main metrics and charts
├── asteroid-list.tsx          # Searchable NEO catalog
├── risk-analysis.tsx          # Risk assessment & visualization
├── chat.tsx                   # Interactive assistant
└── ui/                        # shadcn/ui components
```

## Features Documentation

### Dashboard Tab
- **NEO Statistics**: Total tracked objects, hazardous count, safe count, max velocity
- **Velocity Distribution**: Bar chart of top 10 asteroids by speed
- **Distance from Earth**: Line chart showing proximity data
- **Close Approaches Table**: Details of incoming asteroids

### Asteroids Tab
- **Search & Filter**: Find asteroids by name
- **Hazard Filter**: View only potentially hazardous objects
- **Asteroid Cards**: Diameter, velocity, distance, and approach date
- **Direct Links**: External links to NASA JPL data

### Risk Analysis Tab
- **Risk Overview**: Critical asteroids, high-velocity objects, very close passes
- **Hazard Distribution**: Pie chart of safe vs hazardous NEOs
- **Risk Scoring**: Impact assessment by velocity
- **Closest Approaches**: Five nearest asteroids with distances
- **Largest Asteroids**: Five biggest tracked objects
- **Risk Assessment Legend**: Explanation of hazard criteria

### Chat Tab
- **Quick Questions**: Pre-populated NEO-related topics
- **Smart Responses**: Context-aware answers about asteroids
- **Real-time Communication**: Instant responses to user queries
- **Educational Content**: Learn about NEO tracking and impact risks

## API Endpoints

### GET /api/asteroids
Fetches current NEO data with parameters:
- Returns array of asteroids with diameter, velocity, distance, and hazard status

### GET /api/stats
Computes aggregate statistics:
- Total asteroids, hazardous count, safe count
- Maximum diameter, velocity, and average velocity
- Hazard percentage

### POST /api/chat
Interactive AI assistant:
- Request: `{ messages: Array<{ role, content }> }`
- Response: `{ message: string, timestamp: string }`

## Data Processing

The application processes NASA's NEO feed API and:
1. Extracts close approach data for each asteroid
2. Calculates risk metrics based on size and distance
3. Identifies potentially hazardous objects (>140m and <19.5M km)
4. Sorts by distance for closest approaches
5. Provides real-time updates every 30 seconds

## Hazard Criteria

An asteroid is marked as **Potentially Hazardous** if:
- Estimated diameter > 140 meters
- Closest approach within 19.5 million kilometers
- Listed by NASA as potentially hazardous

## Performance

- Auto-refreshes every 30 seconds
- Optimized API calls with parallel fetching
- Client-side data caching and filtering
- Responsive loading states and error handling

## Customization

### Change Refresh Rate
Edit `/components/dashboard.tsx`:
```typescript
const interval = setInterval(fetchData, 30000) // Change to desired milliseconds
```

### Modify Risk Thresholds
Edit `/components/risk-analysis.tsx`:
```typescript
asteroids.filter((a) => parseFloat(a.velocity) > 50) // Adjust velocity threshold
asteroids.filter((a) => parseFloat(a.distance) < 4000000) // Adjust distance threshold
```

### Add Custom Charts
Use Recharts in any component:
```typescript
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={chartData}>
    {/* Chart configuration */}
  </BarChart>
</ResponsiveContainer>
```

## Deployment

### Deploy to Vercel
1. Push code to GitHub repository
2. Import project in Vercel dashboard
3. Add environment variable: `NASA_API_KEY`
4. Deploy with one click

### Deploy Elsewhere
Ensure your hosting provider supports:
- Node.js 18+ runtime
- Environment variables
- External API requests to `api.nasa.gov`

## Troubleshooting

### API Not Working
- Verify `NASA_API_KEY` is set in `.env.local`
- Check NASA API status: https://api.nasa.gov
- Rate limit: 1000 requests per hour

### No Data Displaying
- Open browser DevTools → Network tab
- Check `/api/asteroids` and `/api/stats` responses
- Verify NASA API key has correct permissions

### Styling Issues
- Clear `.next` cache: `rm -rf .next`
- Restart dev server
- Clear browser cache (Ctrl+Shift+Delete)

## API Testing with Postman

### Import Collection

1. **Open Postman**
   - Launch the Postman desktop application or visit https://www.postman.com

2. **Import Files**
   - Click **Import** button in top-left
   - Select `postman/CosmicWatch.postman_collection.json`
   - Select `postman/CosmicWatch.postman_environment.json`
   - Click **Import**

3. **Select Environment**
   - In the environment dropdown (top-right), select **CosmosTrace - Development**

### Quick Start - Authentication Flow

1. **Login to Get Tokens**
   - Navigate to **Authentication → Obtain Token (Login)**
   - Click **Send**
   - Tokens are automatically saved to environment variables
   - Check console to see saved `access_token` and `refresh_token`

2. **Test Authenticated Endpoint**
   - Navigate to **Dashboard & Statistics → Get Dashboard Statistics**
   - Click **Send**
   - Response includes total asteroids and hazard metrics

3. **Refresh Expired Token**
   - Navigate to **Authentication → Refresh Access Token**
   - Click **Send**
   - New access token automatically saves

### Endpoint Overview

| Folder | Endpoint | Method | Description |
|--------|----------|--------|-------------|
| **Auth** | /api/auth/login/ | POST | Get JWT tokens |
| | /api/auth/register/ | POST | Create new operator account |
| | /api/auth/token/refresh/ | POST | Refresh expired access token |
| | /api/auth/me/ | GET | Get current user profile |
| | /api/auth/logout/ | POST | Terminate session |
| **Asteroids** | /api/asteroids/ | GET | List all asteroids (paginated) |
| | /api/asteroids/hazardous/ | GET | List hazardous asteroids |
| | /api/asteroids/upcoming_approaches/ | GET | Asteroids approaching Earth |
| **Dashboard** | /api/stats/ | GET | System statistics & metrics |
| **Watched** | /api/watched-asteroids/ | GET | Get operator's watchlist |
| | /api/watched-asteroids/ | POST | Add asteroid to watchlist |
| **Alerts** | /api/alerts/config/ | GET | Get alert configuration |
| | /api/alerts/config/ | PUT | Update alert thresholds |
| **Notifications** | /api/notifications/ | GET | List recent notifications |

### cURL Examples

**Login and Get Tokens:**
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@cosmic.watch","password":"TestPass123"}'
```

**Get Asteroids (with Bearer Token):**
```bash
curl -X GET http://localhost:8000/api/asteroids/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Get Hazardous Asteroids:**
```bash
curl -X GET http://localhost:8000/api/asteroids/hazardous/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Get Dashboard Stats:**
```bash
curl -X GET http://localhost:8000/api/stats/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Refresh Token:**
```bash
curl -X POST http://localhost:8000/api/auth/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{"refresh":"YOUR_REFRESH_TOKEN"}'
```

### Test Credentials

```
Email: test@cosmic.watch
Password: TestPass123
```

### Authentication Details

- **Access Token**: 15-minute expiration
- **Refresh Token**: 30-day expiration
- **Method**: Bearer token in Authorization header
- **Header Format**: `Authorization: Bearer {{access_token}}`

### Test Scripts

All endpoints include automated test scripts that:
- ✅ Verify HTTP 200 status codes
- ✅ Validate response JSON structure
- ✅ Auto-save tokens to environment
- ✅ Check for required object properties

Run all tests:
1. Open **Collection** (left sidebar)
2. Click **▶ Run** button
3. Select **CosmosTrace - Development** environment
4. Click **Run CosmicWatch**

## License

MIT License - Use freely for personal and commercial projects

## Support

For issues or questions:
1. Check NASA NEO API documentation: https://api.nasa.gov
2. Review component code comments
3. Check console logs for error messages

## Credits

- **Data Source**: NASA Near-Earth Object API
- **UI Library**: shadcn/ui
- **Charts**: Recharts
- **Framework**: Next.js
