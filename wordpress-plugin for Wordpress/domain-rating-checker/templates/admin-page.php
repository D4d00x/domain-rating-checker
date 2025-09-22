<div class="wrap">
    <h1><i class="dashicons dashicons-chart-line"></i> Domain Rating Checker Pro</h1>
    
    <div class="drc-container">
        <div class="nav-tab-wrapper">
            <a href="#checker" class="nav-tab nav-tab-active" data-tab="checker">Domain Checker</a>
            <a href="#results" class="nav-tab" data-tab="results">Results</a>
            <a href="#settings" class="nav-tab" data-tab="settings">Settings</a>
        </div>

        <!-- Domain Checker Tab -->
        <div id="checker" class="tab-content active">
            <div class="postbox">
                <h2 class="hndle">Check Domain Rating</h2>
                <div class="inside">
                    <div class="drc-section">
                        <h3>Single Domain Check</h3>
                        <div class="drc-input-group">
                            <input type="text" id="singleDomain" placeholder="Enter domain (e.g., example.com)" class="regular-text">
                            <button id="checkSingleBtn" class="button button-primary">
                                <span class="dashicons dashicons-search"></span> Check
                            </button>
                        </div>
                    </div>

                    <div class="drc-section">
                        <h3>Priority Thresholds</h3>
                        <div class="drc-threshold-settings">
                            <div class="drc-threshold-item">
                                <label>High Priority Domain Rating ≥</label>
                                <input type="number" id="priorityRating" value="50" min="0" max="100" class="small-text">
                            </div>
                            <div class="drc-threshold-item">
                                <label>High Priority Backlinks ≥</label>
                                <input type="number" id="priorityBacklinks" value="1000" min="0" class="small-text">
                            </div>
                        </div>
                    </div>

                    <div class="drc-section">
                        <h3>Bulk Domain Check</h3>
                        <div class="drc-file-upload">
                            <input type="file" id="csvFile" accept=".csv" style="display: none;">
                            <button id="uploadBtn" class="button button-secondary">
                                <span class="dashicons dashicons-upload"></span> Upload CSV File
                            </button>
                            <span id="fileName"></span>
                        </div>
                        <button id="processCsvBtn" class="button button-primary" disabled>
                            <span class="dashicons dashicons-admin-tools"></span> Process Domains
                        </button>
                    </div>

                    <div id="loadingIndicator" class="drc-loading hidden">
                        <span class="spinner is-active"></span> Checking domains...
                    </div>

                    <div id="quickResults" class="drc-results-preview"></div>
                </div>
            </div>
        </div>

        <!-- Results Tab -->
        <div id="results" class="tab-content">
            <div class="postbox">
                <h2 class="hndle">Domain Results</h2>
                <div class="inside">
                    <div class="drc-results-header">
                        <div class="drc-results-actions">
                            <button id="clearResultsBtn" class="button button-secondary">
                                <span class="dashicons dashicons-trash"></span> Clear All
                            </button>
                            <button id="exportBtn" class="button button-primary">
                                <span class="dashicons dashicons-download"></span> Export CSV
                            </button>
                        </div>
                    </div>

                    <div class="drc-filters-section">
                        <h3>Filters</h3>
                        <div class="drc-filter-row">
                            <div class="drc-filter-group">
                                <label>Domain Rating ≥</label>
                                <input type="number" id="minRating" placeholder="0" min="0" max="100" class="small-text">
                            </div>
                            <div class="drc-filter-group">
                                <label>Backlinks ≥</label>
                                <input type="number" id="minBacklinks" placeholder="0" min="0" class="small-text">
                            </div>
                            <div class="drc-filter-group">
                                <label>Referring Domains ≥</label>
                                <input type="number" id="minRefDomains" placeholder="0" min="0" class="small-text">
                            </div>
                            <div class="drc-filter-group">
                                <label>Priority Level</label>
                                <select id="priorityFilter">
                                    <option value="">All Domains</option>
                                    <option value="high">High Priority Only</option>
                                    <option value="low">Low Priority Only</option>
                                </select>
                            </div>
                            <div class="drc-filter-group">
                                <label>Status</label>
                                <select id="statusFilter">
                                    <option value="">All</option>
                                    <option value="success">Success</option>
                                    <option value="error">Error</option>
                                </select>
                            </div>
                            <div class="drc-filter-actions">
                                <button id="applyFiltersBtn" class="button button-primary">
                                    <span class="dashicons dashicons-search"></span> Apply
                                </button>
                                <button id="clearFiltersBtn" class="button button-secondary">
                                    <span class="dashicons dashicons-dismiss"></span> Clear
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="drc-pagination-controls">
                        <button id="prevBtn" class="button" disabled>
                            <span class="dashicons dashicons-arrow-left-alt2"></span> Previous
                        </button>
                        <span id="pageInfo">Page 1</span>
                        <button id="nextBtn" class="button">
                            Next <span class="dashicons dashicons-arrow-right-alt2"></span>
                        </button>
                    </div>

                    <div class="drc-table-container">
                        <table class="wp-list-table widefat fixed striped">
                            <thead>
                                <tr>
                                    <th>Domain</th>
                                    <th>Rating</th>
                                    <th>Backlinks</th>
                                    <th>Referring Domains</th>
                                    <th>Checked At</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody id="resultsBody">
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- Settings Tab -->
        <div id="settings" class="tab-content">
            <div class="postbox">
                <h2 class="hndle">Settings & Automation</h2>
                <div class="inside">
                    <p>Settings functionality can be extended here for automation and email reports.</p>
                </div>
            </div>
        </div>
    </div>
</div>
