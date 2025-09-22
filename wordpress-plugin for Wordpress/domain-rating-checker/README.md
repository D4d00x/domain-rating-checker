# Domain Rating Checker Pro - WordPress Plugin

A professional WordPress plugin for domain rating checking with automation, reporting, and comprehensive SEO metrics tracking.

## Installation for LocalWP Testing

### 1. Copy Plugin to WordPress
```bash
# Copy the entire plugin folder to your LocalWP site
cp -r /home/skywalker/domain-rating-checker/wordpress-plugin/domain-rating-checker /path/to/your/localwp/site/app/public/wp-content/plugins/
```

### 2. Activate Plugin
1. Open your LocalWP site admin dashboard
2. Go to **Plugins** → **Installed Plugins**
3. Find "Domain Rating Checker Pro" and click **Activate**

### 3. Access the Tool
- Go to **Domain Checker** in your WordPress admin menu
- The plugin will create its own database table automatically

## Features

### ✅ WordPress Integration
- Native WordPress admin interface
- Uses WordPress database and security features
- AJAX-powered for smooth user experience
- Responsive design matching WordPress admin

### ✅ Core Functionality
- Single domain rating checks
- Bulk CSV upload processing
- Advanced filtering system
- Priority domain identification
- Results export capabilities

### ✅ Security Features
- WordPress nonce verification
- Sanitized inputs
- SQL injection prevention
- Admin-only access

## Plugin Structure

```
domain-rating-checker/
├── domain-rating-checker.php    # Main plugin file
├── templates/
│   └── admin-page.php           # Admin interface template
├── assets/
│   ├── script.js               # JavaScript functionality
│   └── style.css               # Plugin styling
└── README.md                   # This file
```

## Usage

### Single Domain Check
1. Go to **Domain Checker** in WordPress admin
2. Enter domain in the single domain field
3. Click "Check" for instant results

### Bulk Domain Analysis
1. Prepare CSV file with "domain" column
2. Upload CSV using the upload button
3. Click "Process Domains" to analyze all domains

### Filtering Results
- Filter by minimum domain rating, backlinks, referring domains
- Priority level filtering (High/Low priority domains)
- Status filtering (Success/Error)
- Customizable priority thresholds

## Database

The plugin creates a `wp_domain_results` table with:
- Domain information
- SEO metrics (rating, backlinks, referring domains)
- Check timestamps
- Status tracking

## Customization

### Adding Real API Integration
Replace the simulated data in `check_single_domain()` method with actual API calls:

```php
private function check_single_domain($domain) {
    // Replace with actual Ahrefs/Moz API integration
    $api_result = $this->call_external_api($domain);
    return $api_result;
}
```

### Extending Functionality
- Add email reporting features
- Implement scheduled checks using WordPress cron
- Add more data sources
- Enhance filtering options

## Development Notes

- Uses WordPress coding standards
- Follows WordPress plugin development best practices
- Prepared statements for database security
- Responsive design for mobile compatibility

## Testing in LocalWP

1. **Install**: Copy plugin to `/wp-content/plugins/`
2. **Activate**: Enable in WordPress admin
3. **Test**: Use the Domain Checker menu item
4. **Debug**: Check WordPress debug logs if needed

## Next Steps

- Integrate real API services (Ahrefs, Moz)
- Add email notification system
- Implement WordPress cron for automation
- Add user role permissions
- Create settings page for API keys
