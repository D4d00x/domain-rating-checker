<?php
/**
 * Plugin Name: Domain Rating Checker Pro
 * Description: Professional domain rating checker with automation, reporting, and comprehensive SEO metrics tracking.
 * Version: 1.0.0
 * Author: Your Name
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('DRC_PLUGIN_URL', plugin_dir_url(__FILE__));
define('DRC_PLUGIN_PATH', plugin_dir_path(__FILE__));

// Main plugin class
class DomainRatingChecker {
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('wp_ajax_drc_check_domain', array($this, 'ajax_check_domain'));
        add_action('wp_ajax_drc_get_results', array($this, 'ajax_get_results'));
        add_action('wp_ajax_drc_upload_csv', array($this, 'ajax_upload_csv'));
        register_activation_hook(__FILE__, array($this, 'activate'));
    }
    
    public function init() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_scripts'));
    }
    
    public function activate() {
        $this->create_tables();
    }
    
    private function create_tables() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'domain_results';
        
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE $table_name (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            domain varchar(255) NOT NULL,
            domain_rating int(11) DEFAULT NULL,
            backlinks int(11) DEFAULT NULL,
            referring_domains int(11) DEFAULT NULL,
            organic_traffic text DEFAULT NULL,
            status varchar(50) NOT NULL,
            error text DEFAULT NULL,
            checked_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    public function add_admin_menu() {
        add_menu_page(
            'Domain Rating Checker',
            'Domain Checker',
            'manage_options',
            'domain-rating-checker',
            array($this, 'admin_page'),
            'dashicons-chart-line',
            30
        );
    }
    
    public function enqueue_scripts($hook) {
        if ($hook !== 'toplevel_page_domain-rating-checker') {
            return;
        }
        
        wp_enqueue_script('drc-script', DRC_PLUGIN_URL . 'assets/script.js', array('jquery'), '1.0.0', true);
        wp_enqueue_style('drc-style', DRC_PLUGIN_URL . 'assets/style.css', array(), '1.0.0');
        
        wp_localize_script('drc-script', 'drc_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('drc_nonce')
        ));
    }
    
    public function admin_page() {
        include DRC_PLUGIN_PATH . 'templates/admin-page.php';
    }
    
    public function ajax_check_domain() {
        check_ajax_referer('drc_nonce', 'nonce');
        
        $domain = sanitize_text_field($_POST['domain']);
        $result = $this->check_single_domain($domain);
        
        wp_send_json($result);
    }
    
    public function ajax_get_results() {
        check_ajax_referer('drc_nonce', 'nonce');
        
        $page = intval($_POST['page']) ?: 1;
        $limit = intval($_POST['limit']) ?: 50;
        $filters = $_POST['filters'] ?: array();
        
        $results = $this->get_results($page, $limit, $filters);
        wp_send_json($results);
    }
    
    public function ajax_upload_csv() {
        check_ajax_referer('drc_nonce', 'nonce');
        
        if (!isset($_FILES['csvFile'])) {
            wp_send_json_error('No file uploaded');
        }
        
        $results = $this->process_csv($_FILES['csvFile']);
        wp_send_json($results);
    }
    
    private function check_single_domain($domain) {
        // Basic domain checking logic
        $domain = preg_replace('/^https?:\/\//', '', $domain);
        $domain = preg_replace('/^www\./', '', $domain);
        
        // Simulate API call (replace with actual API integration)
        $result = array(
            'domain' => $domain,
            'domain_rating' => rand(10, 90),
            'backlinks' => rand(100, 50000),
            'referring_domains' => rand(50, 5000),
            'status' => 'success'
        );
        
        $this->save_result($result);
        return $result;
    }
    
    private function save_result($result) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'domain_results';
        
        $wpdb->insert(
            $table_name,
            array(
                'domain' => $result['domain'],
                'domain_rating' => $result['domain_rating'],
                'backlinks' => $result['backlinks'],
                'referring_domains' => $result['referring_domains'],
                'status' => $result['status'],
                'error' => isset($result['error']) ? $result['error'] : null
            )
        );
    }
    
    private function get_results($page = 1, $limit = 50, $filters = array()) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'domain_results';
        $offset = ($page - 1) * $limit;
        
        $where = "WHERE 1=1";
        
        if (!empty($filters['minRating'])) {
            $where .= $wpdb->prepare(" AND domain_rating >= %d", $filters['minRating']);
        }
        
        if (!empty($filters['minBacklinks'])) {
            $where .= $wpdb->prepare(" AND backlinks >= %d", $filters['minBacklinks']);
        }
        
        if (!empty($filters['status'])) {
            $where .= $wpdb->prepare(" AND status = %s", $filters['status']);
        }
        
        if (!empty($filters['priority'])) {
            if ($filters['priority'] === 'high') {
                $where .= " AND (domain_rating >= 50 OR backlinks >= 1000)";
            } elseif ($filters['priority'] === 'low') {
                $where .= " AND (domain_rating < 50 AND backlinks < 1000)";
            }
        }
        
        $sql = "SELECT * FROM $table_name $where ORDER BY checked_at DESC LIMIT %d OFFSET %d";
        $results = $wpdb->get_results($wpdb->prepare($sql, $limit, $offset), ARRAY_A);
        
        return $results;
    }
    
    private function process_csv($file) {
        $results = array();
        
        if (($handle = fopen($file['tmp_name'], "r")) !== FALSE) {
            $header = fgetcsv($handle);
            
            while (($data = fgetcsv($handle)) !== FALSE) {
                if (isset($data[0]) && !empty($data[0])) {
                    $domain = trim($data[0]);
                    $result = $this->check_single_domain($domain);
                    $results[] = $result;
                }
            }
            fclose($handle);
        }
        
        return $results;
    }
}

// Initialize the plugin
new DomainRatingChecker();
