<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Cấu hình database
$db_config = [
    'host' => 'localhost',
    'dbname' => 'v_electric_db',
    'username' => 'root',
    'password' => '',
    'charset' => 'utf8mb4'
];

try {
    // Kết nối database
    $dsn = "mysql:host={$db_config['host']};dbname={$db_config['dbname']};charset={$db_config['charset']}";
    $pdo = new PDO($dsn, $db_config['username'], $db_config['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    
    // Xử lý request
    $method = $_SERVER['REQUEST_METHOD'];
    
    if ($method === 'GET') {
        $action = $_GET['action'] ?? 'list';
        
        switch ($action) {
            case 'list':
                // Lấy danh sách trạm sạc với filter
                $province = $_GET['province'] ?? '';
                $district = $_GET['district'] ?? '';
                $status = $_GET['status'] ?? '';
                $operator = $_GET['operator'] ?? '';
                $vehicle_type = $_GET['vehicle_type'] ?? '';
                $search = $_GET['search'] ?? '';
                $limit = (int)($_GET['limit'] ?? 1000);
                $offset = (int)($_GET['offset'] ?? 0);
                
                $where_conditions = [];
                $params = [];
                
                if ($province) {
                    $where_conditions[] = "province = ?";
                    $params[] = $province;
                }
                
                if ($district) {
                    $where_conditions[] = "district = ?";
                    $params[] = $district;
                }
                
                if ($status) {
                    $where_conditions[] = "status = ?";
                    $params[] = $status;
                }
                
                if ($operator) {
                    $where_conditions[] = "operator = ?";
                    $params[] = $operator;
                }
                
                if ($vehicle_type && $vehicle_type !== 'both') {
                    // Lọc theo loại xe dựa trên connector_type
                    if ($vehicle_type === 'car') {
                        $where_conditions[] = "(connector_type LIKE '%CCS%' OR connector_type LIKE '%CHAdeMO%' OR connector_type LIKE '%Type 2%')";
                    } elseif ($vehicle_type === 'motorcycle') {
                        $where_conditions[] = "(connector_type LIKE '%Type 1%' OR connector_type LIKE '%GB/T%')";
                    }
                }
                
                if ($search) {
                    $where_conditions[] = "(name LIKE ? OR address LIKE ?)";
                    $params[] = "%$search%";
                    $params[] = "%$search%";
                }
                
                $where_clause = '';
                if (!empty($where_conditions)) {
                    $where_clause = 'WHERE ' . implode(' AND ', $where_conditions);
                }
                
                $sql = "SELECT * FROM charging_stations $where_clause ORDER BY name LIMIT ? OFFSET ?";
                $params[] = $limit;
                $params[] = $offset;
                
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                $stations = $stmt->fetchAll();
                
                echo json_encode([
                    'success' => true,
                    'data' => [
                        'stations' => $stations,
                        'total' => count($stations),
                        'limit' => $limit,
                        'offset' => $offset
                    ]
                ], JSON_UNESCAPED_UNICODE);
                break;
                
            case 'stats':
                // Lấy thống kê
                $stmt = $pdo->query("SELECT * FROM station_stats ORDER BY total_stations DESC");
                $stats = $stmt->fetchAll();
                
                // Thống kê tổng quan
                $total_stmt = $pdo->query("SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
                    SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive,
                    SUM(CASE WHEN is_free = 1 THEN 1 ELSE 0 END) as free,
                    AVG(price_per_kwh) as avg_price
                FROM charging_stations");
                $overview = $total_stmt->fetch();
                
                echo json_encode([
                    'success' => true,
                    'data' => [
                        'overview' => $overview,
                        'by_province' => $stats
                    ]
                ], JSON_UNESCAPED_UNICODE);
                break;
                
            case 'nearby':
                // Tìm trạm sạc gần nhất
                $lat = (float)($_GET['lat'] ?? 0);
                $lng = (float)($_GET['lng'] ?? 0);
                $radius = (float)($_GET['radius'] ?? 10); // km
                
                if ($lat == 0 || $lng == 0) {
                    throw new Exception('Tọa độ không hợp lệ');
                }
                
                $stmt = $pdo->prepare("CALL FindNearbyStations(?, ?, ?)");
                $stmt->execute([$lat, $lng, $radius]);
                $nearby_stations = $stmt->fetchAll();
                
                echo json_encode([
                    'success' => true,
                    'data' => [
                        'stations' => $nearby_stations,
                        'user_location' => ['lat' => $lat, 'lng' => $lng],
                        'radius_km' => $radius
                    ]
                ], JSON_UNESCAPED_UNICODE);
                break;
                
            case 'provinces':
                // Lấy danh sách tỉnh/thành
                $stmt = $pdo->query("SELECT DISTINCT province FROM charging_stations WHERE province IS NOT NULL ORDER BY province");
                $provinces = $stmt->fetchAll(PDO::FETCH_COLUMN);
                
                echo json_encode([
                    'success' => true,
                    'data' => $provinces
                ], JSON_UNESCAPED_UNICODE);
                break;
                
            case 'districts':
                // Lấy danh sách quận/huyện
                $province = $_GET['province'] ?? '';
                
                if ($province) {
                    $stmt = $pdo->prepare("SELECT DISTINCT district FROM charging_stations WHERE province = ? AND district IS NOT NULL ORDER BY district");
                    $stmt->execute([$province]);
                } else {
                    $stmt = $pdo->query("SELECT DISTINCT district FROM charging_stations WHERE district IS NOT NULL ORDER BY district");
                }
                
                $districts = $stmt->fetchAll(PDO::FETCH_COLUMN);
                
                echo json_encode([
                    'success' => true,
                    'data' => $districts
                ], JSON_UNESCAPED_UNICODE);
                break;
                
            case 'operators':
                // Lấy danh sách đơn vị vận hành
                $stmt = $pdo->query("SELECT DISTINCT operator FROM charging_stations WHERE operator IS NOT NULL ORDER BY operator");
                $operators = $stmt->fetchAll(PDO::FETCH_COLUMN);
                
                echo json_encode([
                    'success' => true,
                    'data' => $operators
                ], JSON_UNESCAPED_UNICODE);
                break;
                
            case 'vehicle_types':
                // Lấy thống kê theo loại xe
                $car_stmt = $pdo->query("SELECT COUNT(*) as count FROM charging_stations WHERE connector_type LIKE '%CCS%' OR connector_type LIKE '%CHAdeMO%' OR connector_type LIKE '%Type 2%'");
                $motorcycle_stmt = $pdo->query("SELECT COUNT(*) as count FROM charging_stations WHERE connector_type LIKE '%Type 1%' OR connector_type LIKE '%GB/T%'");
                $both_stmt = $pdo->query("SELECT COUNT(*) as count FROM charging_stations WHERE (connector_type LIKE '%CCS%' OR connector_type LIKE '%CHAdeMO%' OR connector_type LIKE '%Type 2%') AND (connector_type LIKE '%Type 1%' OR connector_type LIKE '%GB/T%')");
                
                $car_count = $car_stmt->fetch()['count'];
                $motorcycle_count = $motorcycle_stmt->fetch()['count'];
                $both_count = $both_stmt->fetch()['count'];
                
                echo json_encode([
                    'success' => true,
                    'data' => [
                        'car' => $car_count,
                        'motorcycle' => $motorcycle_count,
                        'both' => $both_count
                    ]
                ], JSON_UNESCAPED_UNICODE);
                break;
                
            default:
                throw new Exception('Action không hợp lệ');
        }
        
    } elseif ($method === 'POST') {
        // Thêm trạm sạc mới
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            throw new Exception('Dữ liệu không hợp lệ');
        }
        
        $required_fields = ['name', 'address', 'province', 'lat', 'lng'];
        foreach ($required_fields as $field) {
            if (empty($input[$field])) {
                throw new Exception("Trường $field là bắt buộc");
            }
        }
        
        $sql = "INSERT INTO charging_stations (name, address, province, district, lat, lng, status, phone, operator, charger_type, power_rating, connector_type, price_per_kwh, is_free, operating_hours, amenities) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $input['name'],
            $input['address'],
            $input['province'],
            $input['district'] ?? null,
            $input['lat'],
            $input['lng'],
            $input['status'] ?? 'active',
            $input['phone'] ?? null,
            $input['operator'] ?? null,
            $input['charger_type'] ?? null,
            $input['power_rating'] ?? null,
            $input['connector_type'] ?? null,
            $input['price_per_kwh'] ?? null,
            $input['is_free'] ?? false,
            $input['operating_hours'] ?? null,
            $input['amenities'] ?? null
        ]);
        
        $station_id = $pdo->lastInsertId();
        
        echo json_encode([
            'success' => true,
            'message' => 'Thêm trạm sạc thành công',
            'data' => ['id' => $station_id]
        ], JSON_UNESCAPED_UNICODE);
        
    } else {
        throw new Exception('Method không được hỗ trợ');
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Lỗi database: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?> 