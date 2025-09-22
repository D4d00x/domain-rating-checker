// Translation function for status
function translateStatus(status) {
    const statusTranslations = {
        'success': 'Framgång',
        'error': 'Fel',
        'pending': 'Väntar',
        'checking': 'Kontrollerar'
    };
    return statusTranslations[status] || status;
}

// Dark mode functionality
function toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('darkMode', isDark);
}

// Initialize dark mode from localStorage
if (localStorage.getItem('darkMode') === 'true') {
    document.documentElement.classList.add('dark');
}

// Global variables for pagination
let currentPage = 1;
const resultsPerPage = 50;

// Tab functionality
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;
        
        // Update active tab button with new color scheme
        document.querySelectorAll('.tab-btn').forEach(b => {
            b.classList.remove('text-cyan-400', 'bg-slate-700', 'border-b-2', 'border-cyan-400');
            b.classList.add('text-slate-300');
        });
        btn.classList.remove('text-slate-300');
        btn.classList.add('text-cyan-400', 'bg-slate-700', 'border-b-2', 'border-cyan-400');
        
        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabId).classList.add('active');
        
        // Load data for specific tabs
        if (tabId === 'results') {
            currentPage = 1;
            loadResults();
        } else if (tabId === 'settings') {
            loadSettings();
        }
    });
});

// File upload handling
document.getElementById('csvFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        document.getElementById('fileName').textContent = file.name;
        document.getElementById('processCsvBtn').disabled = false;
    }
});

// Single domain check
async function checkSingleDomain() {
    const domain = document.getElementById('singleDomain').value.trim();
    if (!domain) {
        showNotification(t('Please enter a domain'), 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch('/api/check-domain', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ domain })
        });
        
        const result = await response.json();
        
        if (result.error) {
            showNotification(`Fel: ${result.error}`, 'error');
        } else {
            displayQuickResult(result);
            showNotification(t('Domain checked successfully!'), 'success');
        }
    } catch (error) {
        showNotification(t('Failed to check domain'), 'error');
    } finally {
        showLoading(false);
    }
}

// CSV file processing
async function processCsvFile() {
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];
    
    if (!file) {
        showNotification('Vänligen välj en CSV-fil', 'error');
        return;
    }
    
    showLoading(true);
    
    const formData = new FormData();
    formData.append('csvFile', file);
    
    try {
        const response = await fetch('/api/upload-csv', {
            method: 'POST',
            body: formData
        });
        
        const results = await response.json();
        
        if (results.length > 0) {
            displayBulkResults(results);
            showNotification(`Bearbetade ${results.length} domäner framgångsrikt!`, 'success');
        }
    } catch (error) {
        showNotification('Misslyckades med att bearbeta CSV-fil', 'error');
    } finally {
        showLoading(false);
        fileInput.value = '';
        document.getElementById('fileName').textContent = '';
        document.getElementById('processCsvBtn').disabled = true;
    }
}

// Display single result
function displayQuickResult(result) {
    const container = document.getElementById('quickResults');
    
    if (result.source === 'seranking.com') {
        container.innerHTML = `
            <div class="result-item">
                <div>
                    <div class="result-domain">${result.domain}</div>
                    <small>Source: Seranking.com | Checked: ${new Date(result.checkedAt).toLocaleString()}</small>
                </div>
                <div class="result-metrics">
                    <div>DT: ${result.domainTrust}/100</div>
                    <div>PT: ${result.pageTrust}/100</div>
                    <div>Traffic: ${result.organicTraffic}</div>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="result-item">
                <div>
                    <div class="result-domain">${result.domain}</div>
                    <small>Checked: ${new Date(result.checkedAt).toLocaleString()}</small>
                </div>
                <div class="result-rating">DR: ${result.domainRating}</div>
            </div>
        `;
    }
}

// Display bulk results
function displayBulkResults(results) {
    const container = document.getElementById('quickResults');
    const successResults = results.filter(r => r.status === 'success');
    
    container.innerHTML = `
        <h3>Bulk Check Results (${successResults.length}/${results.length} successful)</h3>
        ${successResults.slice(0, 5).map(result => {
            if (result.source === 'seranking.com') {
                return `
                    <div class="result-item">
                        <div>
                            <div class="result-domain">${result.domain}</div>
                            <small>DT: ${result.domainTrust}/100 | PT: ${result.pageTrust}/100 | Backlinks: ${result.backlinks} | Ref Domains: ${result.referringDomains}</small>
                        </div>
                        <div class="result-metrics">Traffic: ${result.organicTraffic}</div>
                    </div>
                `;
            } else {
                return `
                    <div class="result-item">
                        <div>
                            <div class="result-domain">${result.domain}</div>
                            <small>Backlinks: ${result.backlinks} | Referring Domains: ${result.referringDomains}</small>
                        </div>
                        <div class="result-rating">DR: ${result.domainRating}</div>
                    </div>
                `;
            }
        }).join('')}
        ${successResults.length > 5 ? '<p><em>View all results in the Results tab</em></p>' : ''}
    `;
}

// Load and display results
async function loadResults(page = 1, filters = {}) {
    if (page < 1) return;
    
    currentPage = page;
    
    try {
        const params = new URLSearchParams({
            page: page,
            limit: resultsPerPage,
            ...filters
        });
        
        const response = await fetch(`/api/results?${params}`);
        const results = await response.json();
        
        const tbody = document.getElementById('resultsBody');
        
        if (results.length === 0 && page === 1) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 20px;">Inga resultat hittades</td></tr>';
        } else {
            tbody.innerHTML = results.map(result => {
                const isHighPriority = isPriorityDomain(result);
                const rowClass = isHighPriority ? 'bg-cyan-900/20 border-l-4 border-cyan-400' : 'hover:bg-slate-800';
                
                return `
                <tr class="${rowClass}">
                    <td class="px-4 py-3 text-sm text-white">${result.domain} ${isHighPriority ? '<i class="fas fa-star text-cyan-400 ml-2" title="High Priority"></i>' : ''}</td>
                    <td class="px-4 py-3 text-sm text-slate-300">${result.domain_trust ? result.domain_trust + '/100' : (result.domain_rating || 'N/A')}</td>
                    <td class="px-4 py-3 text-sm text-slate-300">${result.page_trust ? result.page_trust + '/100' : 'N/A'}</td>
                    <td class="px-4 py-3 text-sm text-slate-300">${result.backlinks || 'N/A'}</td>
                    <td class="px-4 py-3 text-sm text-slate-300">${result.referring_domains || 'N/A'}</td>
                    <td class="px-4 py-3 text-sm text-slate-300">${result.organic_traffic || 'N/A'}</td>
                    <td class="px-4 py-3 text-sm"><span class="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-900/30 text-emerald-300">${result.source || 'basic'}</span></td>
                    <td class="px-4 py-3 text-sm text-slate-400">${new Date(result.checked_at).toLocaleString()}</td>
                    <td class="px-4 py-3 text-sm"><span class="px-2 py-1 text-xs font-semibold rounded-full ${result.status === 'success' ? 'bg-emerald-900/30 text-emerald-300' : 'bg-red-900/30 text-red-300'}">${translateStatus(result.status)}</span></td>
                </tr>
            `}).join('');
        }
        
        // Update pagination controls
        document.getElementById('pageInfo').textContent = `Sida ${page}`;
        document.getElementById('prevBtn').disabled = page === 1;
        document.getElementById('nextBtn').disabled = results.length < resultsPerPage;
        
    } catch (error) {
        showNotification('Misslyckades med att ladda resultat', 'error');
    }
}

// Clear all results
async function clearResults() {
    if (!confirm('Are you sure you want to clear all results? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch('/api/results', {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showNotification('Alla resultat rensade framgångsrikt!', 'success');
            currentPage = 1;
            loadResults();
        } else {
            showNotification('Misslyckades med att rensa resultat', 'error');
        }
    } catch (error) {
        showNotification('Misslyckades med att rensa resultat', 'error');
    }
}

// Export results to CSV
async function exportResults() {
    try {
        const response = await fetch('/api/export-csv');
        const blob = await response.blob();
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'domain-results.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showNotification('Resultat exporterade framgångsrikt!', 'success');
    } catch (error) {
        showNotification('Misslyckades med att exportera resultat', 'error');
    }
}

// Load settings
async function loadSettings() {
    try {
        const response = await fetch('/api/settings');
        const settings = await response.json();
        
        document.getElementById('enableAutomation').checked = settings.automation || false;
        document.getElementById('scheduleSelect').value = settings.schedule || '0 9 * * *';
        document.getElementById('enableEmailReports').checked = settings.emailReports || false;
        document.getElementById('autoEmailAfterCheck').checked = settings.autoEmailAfterCheck || false;
        document.getElementById('emailAddress').value = settings.email || '';
        document.getElementById('smtpProvider').value = settings.smtpProvider || 'gmail';
        document.getElementById('smtpEmail').value = settings.smtpEmail || '';
        document.getElementById('smtpPassword').value = settings.smtpPassword || '';
        document.getElementById('resendApiKey').value = settings.resendApiKey || '';
        document.getElementById('resendFromEmail').value = settings.resendFromEmail || '';
        document.getElementById('serankingApiKey').value = settings.serankingApiKey || '';
        document.getElementById('smtpHost').value = settings.smtpHost || '';
        document.getElementById('smtpPort').value = settings.smtpPort || 587;
        
        toggleEmailFields();
    } catch (error) {
        console.error('Failed to load settings:', error);
    }
}

// Test Seranking API key
async function testSerankingApi() {
    const apiKey = document.getElementById('serankingApiKey').value.trim();
    if (!apiKey) {
        showNotification('Vänligen ange en API-nyckel först', 'error');
        return;
    }

    showLoading(true);
    
    try {
        const response = await fetch('/api/test-seranking', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apiKey })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('✅ API-nyckeln fungerar! ' + result.message, 'success');
        } else {
            showNotification('❌ ' + (result.message || result.error), 'error');
        }
    } catch (error) {
        showNotification('Misslyckades med att testa API-nyckel: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Save settings
async function saveSettings() {
    const settings = {
        automation: document.getElementById('enableAutomation').checked,
        schedule: document.getElementById('scheduleSelect').value,
        emailReports: document.getElementById('enableEmailReports').checked,
        autoEmailAfterCheck: document.getElementById('autoEmailAfterCheck').checked,
        email: document.getElementById('emailAddress').value,
        smtpProvider: document.getElementById('smtpProvider').value,
        smtpEmail: document.getElementById('smtpEmail').value,
        smtpPassword: document.getElementById('smtpPassword').value,
        resendApiKey: document.getElementById('resendApiKey').value,
        resendFromEmail: document.getElementById('resendFromEmail').value,
        serankingApiKey: document.getElementById('serankingApiKey').value,
        smtpHost: document.getElementById('smtpHost').value,
        smtpPort: document.getElementById('smtpPort').value
    };
    
    try {
        const response = await fetch('/api/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(settings)
        });
        
        if (response.ok) {
            showNotification('Inställningar sparade framgångsrikt!', 'success');
        } else {
            showNotification('Misslyckades med att spara inställningar', 'error');
        }
    } catch (error) {
        showNotification('Misslyckades med att spara inställningar', 'error');
    }
}

// Toggle email fields based on provider
function toggleEmailFields() {
    const provider = document.getElementById('smtpProvider').value;
    const passwordField = document.getElementById('passwordField');
    const resendField = document.getElementById('resendField');
    const customSettings = document.getElementById('customSmtpSettings');
    
    // Hide all optional fields first
    passwordField.style.display = 'none';
    resendField.style.display = 'none';
    customSettings.style.display = 'none';
    
    if (provider === 'resend') {
        resendField.style.display = 'block';
    } else if (provider === 'custom') {
        passwordField.style.display = 'block';
        customSettings.style.display = 'block';
    } else {
        passwordField.style.display = 'block';
    }
}

// Test email function
async function testEmail() {
    const settings = {
        smtpProvider: document.getElementById('smtpProvider').value,
        smtpEmail: document.getElementById('smtpEmail').value,
        smtpPassword: document.getElementById('smtpPassword').value,
        resendApiKey: document.getElementById('resendApiKey').value,
        resendFromEmail: document.getElementById('resendFromEmail').value,
        smtpHost: document.getElementById('smtpHost').value,
        smtpPort: document.getElementById('smtpPort').value,
        testEmail: document.getElementById('emailAddress').value || document.getElementById('smtpEmail').value
    };

    if (settings.smtpProvider === 'resend') {
        if (!settings.resendApiKey) {
            showNotification('Vänligen ange Resend API-nyckel', 'error');
            return;
        }
    } else {
        if (!settings.smtpEmail || !settings.smtpPassword) {
            showNotification('Vänligen fyll i e-postuppgifter först', 'error');
            return;
        }
    }

    showLoading(true);

    try {
        const response = await fetch('/api/test-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(settings)
        });

        const result = await response.json();

        if (result.success) {
            showNotification(result.message, 'success');
        } else {
            showNotification(`Test misslyckades: ${result.error}`, 'error');
        }
    } catch (error) {
        showNotification('Test-e-post misslyckades', 'error');
    } finally {
        showLoading(false);
    }
}

// Utility functions
function showLoading(show) {
    const indicator = document.getElementById('loadingIndicator');
    if (show) {
        indicator.classList.remove('hidden');
    } else {
        indicator.classList.add('hidden');
    }
}

function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = 'notification fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg font-semibold text-white transform transition-all duration-300';
    
    // Add type-specific classes
    if (type === 'success') {
        notification.classList.add('bg-green-600');
    } else if (type === 'error') {
        notification.classList.add('bg-red-600');
    } else {
        notification.classList.add('bg-blue-600');
    }
    
    // Show notification
    notification.classList.remove('hidden', 'translate-x-full');
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 300);
    }, 3000);
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Add event listener for SMTP provider change
    document.getElementById('smtpProvider').addEventListener('change', toggleEmailFields);
    
    // Enter key support for single domain input
    document.getElementById('singleDomain').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkSingleDomain();
        }
    });
    
    // Load initial data
    loadResults();
});
// Apply filters to results
function applyFilters() {
    const filters = {};
    
    const minRating = document.getElementById('minRating').value;
    const minBacklinks = document.getElementById('minBacklinks').value;
    const minRefDomains = document.getElementById('minRefDomains').value;
    const statusFilter = document.getElementById('statusFilter').value;
    const priorityFilter = document.getElementById('priorityFilter').value;
    
    if (minRating) filters.minRating = minRating;
    if (minBacklinks) filters.minBacklinks = minBacklinks;
    if (minRefDomains) filters.minRefDomains = minRefDomains;
    if (statusFilter) filters.status = statusFilter;
    if (priorityFilter) filters.priority = priorityFilter;
    
    currentPage = 1;
    loadResults(1, filters);
}

// Clear all filters
function clearFilters() {
    document.getElementById('minRating').value = '';
    document.getElementById('minBacklinks').value = '';
    document.getElementById('minRefDomains').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('priorityFilter').value = '';
    
    currentPage = 1;
    loadResults();
}

// Check if domain meets priority thresholds
function isPriorityDomain(result) {
    const priorityRating = parseInt(document.getElementById('priorityRating').value) || 50;
    const priorityBacklinks = parseInt(document.getElementById('priorityBacklinks').value) || 1000;
    
    return (result.domain_rating >= priorityRating) || (result.backlinks >= priorityBacklinks);
}
