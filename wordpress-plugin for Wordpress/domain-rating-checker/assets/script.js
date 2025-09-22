jQuery(document).ready(function($) {
    let currentPage = 1;
    const resultsPerPage = 50;

    // Tab switching
    $('.nav-tab').on('click', function(e) {
        e.preventDefault();
        const tabId = $(this).data('tab');
        
        $('.nav-tab').removeClass('nav-tab-active');
        $(this).addClass('nav-tab-active');
        
        $('.tab-content').removeClass('active');
        $('#' + tabId).addClass('active');
        
        if (tabId === 'results') {
            currentPage = 1;
            loadResults();
        }
    });

    // Single domain check
    $('#checkSingleBtn').on('click', function() {
        const domain = $('#singleDomain').val().trim();
        if (!domain) {
            alert('Please enter a domain');
            return;
        }
        
        checkSingleDomain(domain);
    });

    // CSV upload
    $('#uploadBtn').on('click', function() {
        $('#csvFile').click();
    });

    $('#csvFile').on('change', function() {
        const fileName = this.files[0]?.name;
        $('#fileName').text(fileName || '');
        $('#processCsvBtn').prop('disabled', !fileName);
    });

    $('#processCsvBtn').on('click', function() {
        processCsvFile();
    });

    // Filters
    $('#applyFiltersBtn').on('click', applyFilters);
    $('#clearFiltersBtn').on('click', clearFilters);

    // Pagination
    $('#prevBtn').on('click', function() {
        if (currentPage > 1) {
            loadResults(currentPage - 1);
        }
    });

    $('#nextBtn').on('click', function() {
        loadResults(currentPage + 1);
    });

    // Clear results
    $('#clearResultsBtn').on('click', function() {
        if (confirm('Are you sure you want to clear all results?')) {
            clearResults();
        }
    });

    function checkSingleDomain(domain) {
        $('#loadingIndicator').removeClass('hidden');
        
        $.ajax({
            url: drc_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'drc_check_domain',
                domain: domain,
                nonce: drc_ajax.nonce
            },
            success: function(response) {
                $('#loadingIndicator').addClass('hidden');
                displayQuickResult(response);
                $('#singleDomain').val('');
            },
            error: function() {
                $('#loadingIndicator').addClass('hidden');
                alert('Error checking domain');
            }
        });
    }

    function processCsvFile() {
        const fileInput = document.getElementById('csvFile');
        if (!fileInput.files[0]) return;

        const formData = new FormData();
        formData.append('csvFile', fileInput.files[0]);
        formData.append('action', 'drc_upload_csv');
        formData.append('nonce', drc_ajax.nonce);

        $('#loadingIndicator').removeClass('hidden');

        $.ajax({
            url: drc_ajax.ajax_url,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                $('#loadingIndicator').addClass('hidden');
                displayBulkResults(response);
                $('#csvFile').val('');
                $('#fileName').text('');
                $('#processCsvBtn').prop('disabled', true);
            },
            error: function() {
                $('#loadingIndicator').addClass('hidden');
                alert('Error processing CSV file');
            }
        });
    }

    function loadResults(page = 1, filters = {}) {
        currentPage = page;
        
        $.ajax({
            url: drc_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'drc_get_results',
                page: page,
                limit: resultsPerPage,
                filters: filters,
                nonce: drc_ajax.nonce
            },
            success: function(response) {
                displayResults(response);
                updatePagination(page, response.length);
            },
            error: function() {
                alert('Error loading results');
            }
        });
    }

    function applyFilters() {
        const filters = {
            minRating: $('#minRating').val(),
            minBacklinks: $('#minBacklinks').val(),
            minRefDomains: $('#minRefDomains').val(),
            priority: $('#priorityFilter').val(),
            status: $('#statusFilter').val()
        };
        
        currentPage = 1;
        loadResults(1, filters);
    }

    function clearFilters() {
        $('#minRating, #minBacklinks, #minRefDomains').val('');
        $('#priorityFilter, #statusFilter').val('');
        currentPage = 1;
        loadResults();
    }

    function displayQuickResult(result) {
        const isHighPriority = isPriorityDomain(result);
        const priorityClass = isHighPriority ? 'priority-high' : '';
        
        $('#quickResults').html(`
            <h4>Latest Result:</h4>
            <div class="drc-result-item ${priorityClass}">
                <strong>${result.domain}</strong> ${isHighPriority ? '⭐' : ''}
                <br>Rating: ${result.domain_rating || 'N/A'} | 
                Backlinks: ${result.backlinks || 'N/A'} | 
                Referring Domains: ${result.referring_domains || 'N/A'}
            </div>
        `);
    }

    function displayBulkResults(results) {
        const successResults = results.filter(r => r.status === 'success');
        const errorCount = results.length - successResults.length;
        
        $('#quickResults').html(`
            <h4>Bulk Check Complete:</h4>
            <p>✅ ${successResults.length} domains checked successfully</p>
            ${errorCount > 0 ? `<p>❌ ${errorCount} domains failed</p>` : ''}
            <p><em>View all results in the Results tab</em></p>
        `);
    }

    function displayResults(results) {
        const tbody = $('#resultsBody');
        
        if (results.length === 0) {
            tbody.html('<tr><td colspan="6" style="text-align: center; padding: 20px;">No results found</td></tr>');
        } else {
            const rows = results.map(result => {
                const isHighPriority = isPriorityDomain(result);
                const rowClass = isHighPriority ? 'priority-high' : '';
                
                return `
                    <tr class="${rowClass}">
                        <td>${result.domain} ${isHighPriority ? '⭐' : ''}</td>
                        <td>${result.domain_rating || 'N/A'}</td>
                        <td>${result.backlinks || 'N/A'}</td>
                        <td>${result.referring_domains || 'N/A'}</td>
                        <td>${new Date(result.checked_at).toLocaleString()}</td>
                        <td class="status-${result.status}">${result.status}</td>
                    </tr>
                `;
            }).join('');
            
            tbody.html(rows);
        }
    }

    function updatePagination(page, resultCount) {
        $('#pageInfo').text(`Page ${page}`);
        $('#prevBtn').prop('disabled', page === 1);
        $('#nextBtn').prop('disabled', resultCount < resultsPerPage);
    }

    function isPriorityDomain(result) {
        const priorityRating = parseInt($('#priorityRating').val()) || 50;
        const priorityBacklinks = parseInt($('#priorityBacklinks').val()) || 1000;
        
        return (result.domain_rating >= priorityRating) || (result.backlinks >= priorityBacklinks);
    }

    function clearResults() {
        // Implementation for clearing results
        alert('Clear results functionality to be implemented');
    }

    // Load initial results
    loadResults();
});
