const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
    constructor() {
        this.dbPath = path.join(__dirname, '..', 'data', 'domains.db');
    }

    async init() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) reject(err);
                else {
                    this.createTables();
                    resolve();
                }
            });
        });
    }

    createTables() {
        const tables = [
            `CREATE TABLE IF NOT EXISTS domain_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                domain TEXT NOT NULL,
                domain_rating INTEGER,
                domain_trust INTEGER,
                page_trust INTEGER,
                backlinks TEXT,
                referring_domains TEXT,
                organic_traffic TEXT,
                status TEXT,
                error TEXT,
                source TEXT DEFAULT 'basic',
                checked_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT UNIQUE NOT NULL,
                value TEXT NOT NULL,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS tracked_domains (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                domain TEXT UNIQUE NOT NULL,
                added_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`
        ];

        tables.forEach(sql => {
            this.db.run(sql, (err) => {
                if (err) console.error('Error creating table:', err);
            });
        });

        // Add new columns to existing table if they don't exist
        this.addColumnsIfNotExist();
    }

    addColumnsIfNotExist() {
        const alterQueries = [
            'ALTER TABLE domain_results ADD COLUMN domain_trust INTEGER',
            'ALTER TABLE domain_results ADD COLUMN page_trust INTEGER', 
            'ALTER TABLE domain_results ADD COLUMN source TEXT DEFAULT "basic"'
        ];

        alterQueries.forEach(sql => {
            this.db.run(sql, (err) => {
                // Ignore errors for existing columns
            });
        });
    }

    async saveDomainResult(result) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO domain_results 
                (domain, domain_rating, domain_trust, page_trust, backlinks, referring_domains, organic_traffic, status, error, source)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            
            this.db.run(sql, [
                result.domain,
                result.domainRating || null,
                result.domainTrust || null,
                result.pageTrust || null,
                result.backlinks,
                result.referringDomains,
                result.organicTraffic,
                result.status,
                result.error,
                result.source || 'basic'
            ], function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
        });
    }

    async saveBulkResults(results) {
        const promises = results.map(result => this.saveDomainResult(result));
        return Promise.all(promises);
    }

    async getResults(limit = 50, page = 1, filters = {}) {
        return new Promise((resolve, reject) => {
            const offset = (page - 1) * limit;
            let sql = `SELECT * FROM domain_results WHERE 1=1`;
            const params = [];
            
            if (filters.minRating) {
                sql += ` AND domain_rating >= ?`;
                params.push(filters.minRating);
            }
            
            if (filters.minBacklinks) {
                sql += ` AND backlinks >= ?`;
                params.push(filters.minBacklinks);
            }
            
            if (filters.minRefDomains) {
                sql += ` AND referring_domains >= ?`;
                params.push(filters.minRefDomains);
            }
            
            if (filters.status) {
                sql += ` AND status = ?`;
                params.push(filters.status);
            }
            
            // Priority filtering (default thresholds: DR >= 50 OR backlinks >= 1000)
            if (filters.priority === 'high') {
                sql += ` AND (domain_rating >= 50 OR backlinks >= 1000)`;
            } else if (filters.priority === 'low') {
                sql += ` AND (domain_rating < 50 AND backlinks < 1000)`;
            }
            
            sql += ` ORDER BY checked_at DESC LIMIT ? OFFSET ?`;
            params.push(limit, offset);
            
            this.db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    async clearResults() {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM domain_results`;
            
            this.db.run(sql, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    async getSettings() {
        return new Promise((resolve, reject) => {
            const sql = `SELECT key, value FROM settings`;
            
            this.db.all(sql, (err, rows) => {
                if (err) reject(err);
                else {
                    const settings = {};
                    rows.forEach(row => {
                        try {
                            settings[row.key] = JSON.parse(row.value);
                        } catch {
                            settings[row.key] = row.value;
                        }
                    });
                    resolve(settings);
                }
            });
        });
    }

    async updateSettings(settings) {
        const promises = Object.entries(settings).map(([key, value]) => {
            return new Promise((resolve, reject) => {
                const sql = `INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`;
                this.db.run(sql, [key, JSON.stringify(value)], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        });
        
        return Promise.all(promises);
    }

    async getTrackedDomains() {
        return new Promise((resolve, reject) => {
            const sql = `SELECT domain FROM tracked_domains`;
            
            this.db.all(sql, (err, rows) => {
                if (err) reject(err);
                else resolve(rows.map(row => row.domain));
            });
        });
    }

    async addTrackedDomain(domain) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT OR IGNORE INTO tracked_domains (domain) VALUES (?)`;
            
            this.db.run(sql, [domain], function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
        });
    }
}

module.exports = { Database };
