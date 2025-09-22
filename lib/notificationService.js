const axios = require('axios');

class NotificationService {
    async sendToSlack(webhookUrl, results) {
        const message = {
            text: "Domain Rating Report",
            blocks: [
                {
                    type: "header",
                    text: { type: "plain_text", text: "📊 Domain Rating Report" }
                },
                {
                    type: "section",
                    text: { 
                        type: "mrkdwn", 
                        text: `*Checked ${results.length} domains*\n${results.slice(0, 5).map(r => 
                            `• ${r.domain}: DR ${r.domainRating}`
                        ).join('\n')}`
                    }
                }
            ]
        };
        
        return axios.post(webhookUrl, message);
    }

    async sendToDiscord(webhookUrl, results) {
        const embed = {
            title: "📊 Domain Rating Report",
            color: 0x0099ff,
            fields: results.slice(0, 10).map(r => ({
                name: r.domain,
                value: `DR: ${r.domainRating} | Backlinks: ${r.backlinks}`,
                inline: true
            })),
            timestamp: new Date().toISOString()
        };
        
        return axios.post(webhookUrl, { embeds: [embed] });
    }

    async sendToWebhook(url, results) {
        return axios.post(url, {
            type: 'domain_report',
            timestamp: new Date().toISOString(),
            results: results
        });
    }
}

module.exports = { NotificationService };
