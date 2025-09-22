const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const { Resend } = require('resend');
const { DomainChecker } = require('./lib/domainChecker');
const { Database } = require('./lib/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// File upload configuration
const upload = multer({ dest: 'uploads/' });

// Initialize services
const domainChecker = new DomainChecker();
const db = new Database();

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Check single domain
app.post('/api/check-domain', async (req, res) => {
    try {
        const { domain } = req.body;
        const settings = await db.getSettings();
        
        // Create checker with current settings
        const checker = new DomainChecker();
        if (settings.serankingApiKey) {
            checker.serankingApiKey = settings.serankingApiKey;
        }
        
        const result = await checker.checkDomain(domain);
        await db.saveDomainResult(result);
        
        // Send email report automatically
        if (settings.autoEmailAfterCheck && settings.email) {
            try {
                await sendEmailReport([result], settings);
            } catch (emailError) {
                console.error('Failed to send email:', emailError.message);
            }
        }
        
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Upload and check CSV
app.post('/api/upload-csv', upload.single('csvFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const domains = [];
        
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (row) => {
                // Handle different column names
                const domain = row.domain || row.Domain || row.url || row.URL || row.website || row.Website;
                if (domain) {
                    domains.push(domain.trim().replace(/^https?:\/\//, '').replace(/\/$/, ''));
                }
            })
            .on('end', async () => {
                try {
                    if (domains.length === 0) {
                        fs.unlinkSync(req.file.path);
                        return res.status(400).json({ error: 'No valid domains found in CSV. Make sure you have a "domain" column.' });
                    }

                    const settings = await db.getSettings();
                    const checker = new DomainChecker();
                    if (settings.serankingApiKey) {
                        checker.serankingApiKey = settings.serankingApiKey;
                    }

                    const results = await checker.checkMultipleDomains(domains);
                    await db.saveBulkResults(results);
                    
                    // Send email report automatically
                    if (settings.autoEmailAfterCheck && settings.email) {
                        try {
                            await sendEmailReport(results, settings);
                        } catch (emailError) {
                            console.error('Failed to send email:', emailError.message);
                        }
                    }
                    
                    res.json(results);
                    fs.unlinkSync(req.file.path);
                } catch (error) {
                    fs.unlinkSync(req.file.path);
                    res.status(500).json({ error: error.message });
                }
            })
            .on('error', (error) => {
                fs.unlinkSync(req.file.path);
                res.status(500).json({ error: 'Failed to parse CSV file' });
            });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: error.message });
    }
});

// Get results
app.get('/api/results', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const filters = {
            minRating: req.query.minRating ? parseInt(req.query.minRating) : null,
            minBacklinks: req.query.minBacklinks ? parseInt(req.query.minBacklinks) : null,
            minRefDomains: req.query.minRefDomains ? parseInt(req.query.minRefDomains) : null,
            status: req.query.status || null,
            priority: req.query.priority || null
        };
        const results = await db.getResults(limit, page, filters);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Clear all results
app.delete('/api/results', async (req, res) => {
    try {
        await db.clearResults();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Export results to CSV
app.get('/api/export-csv', async (req, res) => {
    try {
        const results = await db.getResults();
        const csvWriter = createCsvWriter({
            path: 'exports/domain-results.csv',
            header: [
                { id: 'domain', title: 'Domain' },
                { id: 'domainRating', title: 'Domain Rating' },
                { id: 'backlinks', title: 'Backlinks' },
                { id: 'referringDomains', title: 'Referring Domains' },
                { id: 'checkedAt', title: 'Checked At' }
            ]
        });
        
        await csvWriter.writeRecords(results);
        res.download('exports/domain-results.csv');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Test email endpoint
app.post('/api/test-email', async (req, res) => {
    try {
        const { smtpEmail, smtpPassword, testEmail, smtpProvider, smtpHost, smtpPort, resendApiKey, resendFromEmail } = req.body;
        
        if (smtpProvider === 'resend') {
            if (!resendApiKey) {
                return res.status(400).json({ error: 'Resend API key required' });
            }

            const resend = new Resend(resendApiKey);
            const recipients = testEmail.split(',').map(email => email.trim()).filter(email => email);
            const fromEmail = resendFromEmail || 'onboarding@resend.dev';

            const { data, error } = await resend.emails.send({
                from: `Domain Reports <${fromEmail}>`,
                to: recipients,
                subject: 'Domain Rating Checker - Test Email',
                html: `
                    <h2>✅ Resend API configuration successful!</h2>
                    <p>Your Resend email settings are working correctly.</p>
                    <p><strong>Recipients:</strong> ${recipients.length}</p>
                    <p><strong>Provider:</strong> Resend API</p>
                    <p><strong>From:</strong> ${fromEmail}</p>
                `
            });

            if (error) {
                return res.status(500).json({ error: error.message });
            }

            return res.json({ success: true, message: `Test email sent via Resend to ${recipients.length} recipient(s)!` });
        }

        // SMTP providers
        const smtpConfig = getSmtpConfig(smtpProvider, smtpHost, smtpPort);
        
        const transporter = nodemailer.createTransporter({
            ...smtpConfig,
            auth: {
                user: smtpEmail,
                pass: smtpPassword
            }
        });

        const recipients = testEmail.split(',').map(email => email.trim()).filter(email => email);

        const mailOptions = {
            from: smtpEmail,
            to: recipients.join(', '),
            subject: 'Domain Rating Checker - Test Email',
            html: `
                <h2>✅ Email configuration successful!</h2>
                <p>Your email settings are working correctly.</p>
                <p><strong>Provider:</strong> ${smtpProvider}</p>
                <p><strong>Recipients:</strong> ${recipients.length}</p>
            `
        };

        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: `Test email sent to ${recipients.length} recipient(s)!` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Settings management
app.get('/api/settings', async (req, res) => {
    try {
        const settings = await db.getSettings();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/settings', async (req, res) => {
    try {
        await db.updateSettings(req.body);
        setupAutomation(req.body);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Test Seranking API key
app.post('/api/test-seranking', async (req, res) => {
    try {
        const { apiKey } = req.body;
        if (!apiKey) {
            return res.status(400).json({ error: 'API key is required' });
        }

        const checker = new DomainChecker();
        checker.serankingApiKey = apiKey;
        
        // Test with a known domain
        const result = await checker.getSerankingMetrics('example.com');
        
        if (result && (result.domainTrust > 0 || result.backlinks !== '0')) {
            res.json({ success: true, message: 'API key is working!', sample: result });
        } else {
            res.json({ success: false, message: 'API key may be invalid or domain not found in Seranking database' });
        }
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Automation setup
function setupAutomation(settings) {
    if (settings.automation && settings.schedule) {
        cron.schedule(settings.schedule, async () => {
            const domains = await db.getTrackedDomains();
            const currentSettings = await db.getSettings();
            const checker = new DomainChecker();
            if (currentSettings.serankingApiKey) {
                checker.serankingApiKey = currentSettings.serankingApiKey;
            }
            const results = await checker.checkMultipleDomains(domains);
            await db.saveBulkResults(results);
            
            if (settings.emailReports && settings.smtpEmail) {
                await sendEmailReport(results, settings);
            }
        });
    }
}

async function sendEmailReport(results, settings) {
    if (settings.smtpProvider === 'resend') {
        return await sendViaResend(results, settings);
    }
    
    if (!settings.smtpEmail || !settings.smtpPassword) {
        throw new Error('Email credentials not configured');
    }

    const smtpConfig = getSmtpConfig(settings.smtpProvider, settings.smtpHost, settings.smtpPort);
    
    const transporter = nodemailer.createTransporter({
        ...smtpConfig,
        auth: {
            user: settings.smtpEmail,
            pass: settings.smtpPassword
        }
    });

    // Parse multiple email addresses
    const recipients = settings.email.split(',').map(email => email.trim()).filter(email => email);

    const mailOptions = {
        from: settings.smtpEmail,
        to: recipients.join(', '),
        subject: `Domain Rating Report - ${new Date().toLocaleDateString()}`,
        html: generateEmailHTML(results)
    };

    await transporter.sendMail(mailOptions);
}

async function sendViaResend(results, settings) {
    if (!settings.resendApiKey) {
        throw new Error('Resend API key not configured');
    }

    const resend = new Resend(settings.resendApiKey);
    const recipients = settings.email.split(',').map(email => email.trim()).filter(email => email);
    const fromEmail = settings.resendFromEmail || 'onboarding@resend.dev';

    const { data, error } = await resend.emails.send({
        from: `Domain Reports <${fromEmail}>`,
        to: recipients,
        subject: `Domain Rating Report - ${new Date().toLocaleDateString()}`,
        html: generateEmailHTML(results)
    });

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

function getSmtpConfig(provider, customHost, customPort) {
    switch (provider) {
        case 'gmail':
            return { service: 'gmail' };
        case 'outlook':
            return { service: 'hotmail' };
        case 'yahoo':
            return { service: 'yahoo' };
        case 'custom':
            return {
                host: customHost,
                port: customPort || 587,
                secure: false,
                tls: { ciphers: 'SSLv3' }
            };
        default:
            return { service: 'gmail' };
    }
}

function generateEmailHTML(results) {
    return `
        <h2>Domain Rating Report</h2>
        <table border="1" style="border-collapse: collapse;">
            <tr>
                <th>Domain</th>
                <th>Rating</th>
                <th>Backlinks</th>
                <th>Referring Domains</th>
            </tr>
            ${results.map(r => `
                <tr>
                    <td>${r.domain}</td>
                    <td>${r.domainRating}</td>
                    <td>${r.backlinks}</td>
                    <td>${r.referringDomains}</td>
                </tr>
            `).join('')}
        </table>
    `;
}

// Initialize database and start server
db.init().then(() => {
    app.listen(PORT, () => {
        console.log(`Domain Rating Checker running on port ${PORT}`);
    });
});
