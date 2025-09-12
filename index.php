<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>V-Electric | Bản đồ trạm sạc VinFast</title>
    <meta name="description" content="Bản đồ trạm sạc VinFast chính thức tại Việt Nam - Dữ liệu real-time từ Google My Maps">
    <meta name="keywords" content="trạm sạc VinFast, bản đồ, Việt Nam, EV charging, electric vehicle, VinFast stations">
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Leaflet CSS -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.css" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.Default.css" />
    
    <style>
        :root {
            --primary-color: #000000;
            --secondary-color: #ffffff;
            --accent-color: #ff6b35;
            --text-primary: #1a1a1a;
            --text-secondary: #666666;
            --border-color: #e5e5e5;
            --background-light: #f8f9fa;
            --shadow: 0 4px 20px rgba(0,0,0,0.08);
            --border-radius: 12px;
            --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            --sidebar-width: 320px;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        html, body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--secondary-color);
            color: var(--text-primary);
            line-height: 1.6;
            overflow: hidden;
            height: 100%;
            margin: 0;
            padding: 0;
        }

        /* Notification Styles */
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            max-width: 350px;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        }

        .notification-success {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
        }

        .notification-error {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
        }

        .notification-info {
            background: #d1ecf1;
            border: 1px solid #bee5eb;
            color: #0c5460;
        }

        .notification-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 10px;
        }

        .notification-close {
            background: none;
            border: none;
            font-size: 18px;
            cursor: pointer;
            padding: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }


        /* Buttons */
        .btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 20px;
            border: none;
            border-radius: var(--border-radius);
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            transition: var(--transition);
            text-decoration: none;
            margin: 4px;
        }

        .btn-primary {
            background: var(--primary-color);
            color: var(--secondary-color);
        }

        .btn-primary:hover:not(:disabled) {
            background: #333333;
            transform: translateY(-2px);
        }

        .btn-secondary {
            background: var(--background-light);
            color: var(--text-primary);
            border: 2px solid var(--border-color);
        }

        .btn-secondary:hover:not(:disabled) {
            background: var(--border-color);
            transform: translateY(-2px);
        }

        .btn-success {
            background: #28a745;
            color: white;
            border: 2px solid #28a745;
        }

        .btn-success:hover:not(:disabled) {
            background: #218838;
            border-color: #218838;
            transform: translateY(-2px);
        }

        .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none !important;
        }

        .btn-sm {
            padding: 6px 12px;
            font-size: 12px;
        }
    </style>
</head>
<body>

    <?php include 'header.php'; ?>
    <?php include 'center.php'; ?>
    <?php include 'footer.php'; ?>

    <!-- Leaflet and Plugins -->
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="https://unpkg.com/leaflet.markercluster@1.4.1/dist/leaflet.markercluster.js"></script>
    <script src="https://unpkg.com/@tmcw/togeojson@5.8.1/dist/togeojson.umd.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>

    <!-- Main Script -->
    <script src="script.js"></script>
</body>
</html>
