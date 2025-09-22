// Swedish translations
const translations = {
    // Error messages
    'Please enter a domain': 'Vänligen ange en domän',
    'Domain checked successfully!': 'Domän kontrollerad framgångsrikt!',
    'Failed to check domain': 'Misslyckades med att kontrollera domän',
    'Please select a CSV file': 'Vänligen välj en CSV-fil',
    'Failed to process CSV file': 'Misslyckades med att bearbeta CSV-fil',
    'Failed to load results': 'Misslyckades med att ladda resultat',
    'All results cleared successfully!': 'Alla resultat rensade framgångsrikt!',
    'Failed to clear results': 'Misslyckades med att rensa resultat',
    'Results exported successfully!': 'Resultat exporterade framgångsrikt!',
    'Failed to export results': 'Misslyckades med att exportera resultat',
    'Please enter an API key first': 'Vänligen ange en API-nyckel först',
    'Failed to test API key: ': 'Misslyckades med att testa API-nyckel: ',
    'Settings saved successfully!': 'Inställningar sparade framgångsrikt!',
    'Failed to save settings': 'Misslyckades med att spara inställningar',
    'Please enter Resend API key': 'Vänligen ange Resend API-nyckel',
    'Please fill in email credentials first': 'Vänligen fyll i e-postuppgifter först',
    'Test failed: ': 'Test misslyckades: ',
    'Test email failed': 'Test-e-post misslyckades',
    
    // Success messages with dynamic content
    'processed_domains': (count) => `Bearbetade ${count} domäner framgångsrikt!`,
    'api_working': (message) => `✅ API-nyckeln fungerar! ${message}`,
    'api_error': (message) => `❌ ${message}`,
    
    // Page info
    'page_info': (page) => `Sida ${page}`,
    
    // Status values
    'success': 'Framgång',
    'error': 'Fel',
    'checking': 'Kontrollerar',
    
    // Loading messages
    'checking_domains': 'Kontrollerar domäner...',
    'loading': 'Laddar...',
    
    // Priority levels
    'high_priority': 'Hög Prioritet',
    'low_priority': 'Låg Prioritet',
    
    // Table headers (already translated in HTML, but keeping for consistency)
    'domain': 'Domän',
    'domain_trust': 'Domäntillit',
    'page_trust': 'Sidtillit',
    'backlinks': 'Bakåtlänkar',
    'referring_domains': 'Hänvisande Domäner',
    'organic_traffic': 'Organisk Trafik',
    'source': 'Källa',
    'checked_at': 'Kontrollerad',
    'status': 'Status'
};

// Translation function
function t(key, ...args) {
    const translation = translations[key];
    if (typeof translation === 'function') {
        return translation(...args);
    }
    return translation || key;
}
