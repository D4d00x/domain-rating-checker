# Domain Rating Checker Pro

A professional domain rating checker tool with automation, reporting, and comprehensive SEO metrics tracking.

## Features

### Core Functionality
- ✅ Single domain rating checks
- ✅ Bulk domain analysis via CSV upload
- ✅ Multiple data sources (Ahrefs, Moz, basic metrics)
- ✅ Real-time results display
- ✅ Historical data storage

### Automation & Reporting
- ✅ Scheduled automated checks (daily/weekly/monthly)
- ✅ Email report delivery
- ✅ CSV export functionality
- ✅ Results tracking and history

### Professional UI
- ✅ Modern, responsive design
- ✅ Tabbed interface for easy navigation
- ✅ Real-time loading indicators
- ✅ Professional styling with animations

## Quick Start

### 1. Installation

```bash
# Clone or download the project
cd domain-rating-checker

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### 2. Configuration

Edit `.env` file with your API keys and email settings:

```env
# API Keys (Optional - for enhanced accuracy)
AHREFS_API_KEY=your_ahrefs_api_key
MOZ_API_KEY=your_moz_api_key
SERANKING_API_KEY=your_seranking_api_key

# Email Configuration (Required for reports)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

PORT=3000
```

### 3. Run the Application

```bash
# Development mode
npm run dev

# Production mode
npm start
```

Visit `http://localhost:3000` in your browser.

## Usage Guide

### Single Domain Check
1. Go to the "Domain Checker" tab
2. Enter a domain in the single domain field
3. Click "Check" to get instant results

### Bulk Domain Analysis
1. Prepare a CSV file with a "domain" column (see `sample-domains.csv`)
2. Upload the CSV file using the upload button
3. Click "Process Domains" to analyze all domains

### Automation Setup
1. Go to the "Settings" tab
2. Enable "Automated Checking"
3. Choose your preferred schedule
4. Configure email reports if needed
5. Save settings

### Viewing Results
1. Go to the "Results" tab to see all historical data
2. Export results to CSV for further analysis
3. Results include domain rating, backlinks, and referring domains

## API Endpoints

### Check Single Domain
```http
POST /api/check-domain
Content-Type: application/json

{
  "domain": "example.com"
}
```

### Upload CSV
```http
POST /api/upload-csv
Content-Type: multipart/form-data

csvFile: [file]
```

### Get Results
```http
GET /api/results
```

### Export CSV
```http
GET /api/export-csv
```

### Settings Management
```http
GET /api/settings
POST /api/settings
```

## Data Sources

The tool integrates with multiple data sources for comprehensive analysis:

1. **Seranking.com API** - High-quality domain metrics including Domain Trust (DT), backlinks, and referring domains
2. **Ahrefs API** - Premium domain metrics
3. **Moz API** - Domain authority and link data
4. **Basic Web Scraping** - Fallback metrics and basic site info

## File Structure

```
domain-rating-checker/
├── lib/
│   ├── domainChecker.js    # Core domain analysis logic
│   └── database.js         # SQLite database operations
├── public/
│   ├── index.html         # Main UI
│   ├── style.css          # Professional styling
│   └── script.js          # Frontend functionality
├── data/                  # SQLite database storage
├── exports/               # CSV export files
├── uploads/               # Temporary CSV uploads
├── server.js              # Express server
├── package.json           # Dependencies
└── README.md             # This file
```

## Database Schema

### domain_results
- id (PRIMARY KEY)
- domain (TEXT)
- domain_rating (INTEGER)
- backlinks (INTEGER)
- referring_domains (INTEGER)
- organic_traffic (TEXT)
- status (TEXT)
- error (TEXT)
- checked_at (DATETIME)

### settings
- id (PRIMARY KEY)
- key (TEXT)
- value (TEXT)
- updated_at (DATETIME)

### tracked_domains
- id (PRIMARY KEY)
- domain (TEXT)
- added_at (DATETIME)

## Automation Features

### Scheduled Checks
- Daily at 9 AM
- Weekly (Mondays at 9 AM)
- Monthly (1st day at 9 AM)
- Custom cron expressions supported

### Email Reports
- Automatic HTML email generation
- Professional table formatting
- Configurable recipient email
- Error handling and retry logic

## Security Considerations

- API keys stored in environment variables
- File upload validation
- SQL injection prevention
- Rate limiting for API calls
- Input sanitization

## Troubleshooting

### Common Issues

1. **API Rate Limits**
   - The tool includes built-in rate limiting
   - Batch processing with delays between requests

2. **Email Not Sending**
   - Verify EMAIL_USER and EMAIL_PASS in .env
   - Use app-specific passwords for Gmail

3. **CSV Upload Issues**
   - Ensure CSV has "domain" column header
   - Check file permissions in uploads/ directory

4. **Database Errors**
   - Ensure data/ directory exists and is writable
   - SQLite database is created automatically

## Development

### Adding New Data Sources
1. Extend the `DomainChecker` class in `lib/domainChecker.js`
2. Add new API integration methods
3. Update result extraction logic

### Customizing UI
1. Modify `public/style.css` for styling changes
2. Update `public/script.js` for functionality
3. Edit `public/index.html` for structure changes

## License

MIT License - feel free to use and modify for your projects.

## Support

For issues and feature requests, please create an issue in the project repository.
