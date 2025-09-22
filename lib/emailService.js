const axios = require('axios');

class EmailService {
    constructor() {
        this.services = {
            sendgrid: process.env.SENDGRID_API_KEY,
            mailgun: process.env.MAILGUN_API_KEY,
            resend: process.env.RESEND_API_KEY
        };
    }

    async sendViaSendGrid(to, subject, html) {
        const response = await axios.post('https://api.sendgrid.com/v3/mail/send', {
            personalizations: [{ to: [{ email: to }] }],
            from: { email: 'reports@yourdomain.com' },
            subject: subject,
            content: [{ type: 'text/html', value: html }]
        }, {
            headers: {
                'Authorization': `Bearer ${this.services.sendgrid}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    }

    async sendViaResend(to, subject, html) {
        const response = await axios.post('https://api.resend.com/emails', {
            from: 'reports@yourdomain.com',
            to: [to],
            subject: subject,
            html: html
        }, {
            headers: {
                'Authorization': `Bearer ${this.services.resend}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    }

    async sendViaMailgun(to, subject, html) {
        const domain = 'yourdomain.com';
        const response = await axios.post(`https://api.mailgun.net/v3/${domain}/messages`, 
            new URLSearchParams({
                from: `Domain Reports <reports@${domain}>`,
                to: to,
                subject: subject,
                html: html
            }), {
            auth: {
                username: 'api',
                password: this.services.mailgun
            }
        });
        return response.data;
    }
}

module.exports = { EmailService };
