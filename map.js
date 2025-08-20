// Biến toàn cục
let map;
let markers = [];
let allStations = [];
let filteredStations = [];
let userLocation = null;
let searchTimeout = null;

// Khởi tạo bản đồ
function initMap() {
    // Tọa độ trung tâm Việt Nam
    const centerLat = 16.0544;
    const centerLng = 108.2022;
    
    // Khởi tạo bản đồ
    map = L.map('map').setView([centerLat, centerLng], 6);
    
    // Thêm tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(map);
    
    // Lấy vị trí người dùng
    getUserLocation();
    
    // Load dữ liệu trạm sạc
    loadStations();
}

// Lấy vị trí người dùng
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                // Xóa marker cũ nếu có
                const existingMarkers = document.querySelectorAll('.user-marker');
                existingMarkers.forEach(marker => {
                    if (marker._leaflet_id) {
                        map.removeLayer(marker);
                    }
                });
                
                // Thêm marker vị trí người dùng
                const userMarker = L.marker([userLocation.lat, userLocation.lng], {
                    icon: L.divIcon({
                        html: '<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><i class="fas fa-user" style="color: white; font-size: 10px;"></i></div>',
                        className: 'user-marker',
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                    })
                }).addTo(map);
                
                userMarker.bindPopup('<strong><i class="fas fa-user"></i> Vị trí của bạn</strong>');
                
                // Zoom vào vị trí người dùng với animation mượt mà
                map.flyTo([userLocation.lat, userLocation.lng], 15, {
                    duration: 1.5,
                    easeLinearity: 0.25
                });
            },
            function(error) {
                console.log('Không thể lấy vị trí:', error);
                let errorMessage = 'Không thể lấy vị trí. Vui lòng cho phép truy cập vị trí để sử dụng tính năng tìm trạm gần nhất.';
                
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Truy cập vị trí bị từ chối. Vui lòng cho phép truy cập vị trí trong trình duyệt.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Thông tin vị trí không khả dụng.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Hết thời gian lấy vị trí. Vui lòng thử lại.';
                        break;
                }
                
                showNotification(errorMessage, 'warning');
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    } else {
        showNotification('Trình duyệt không hỗ trợ định vị địa lý.', 'warning');
    }
}

// Toggle sidebar trên mobile
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
}

// Hiển thị thông báo
function showNotification(message, type = 'info') {
    // Tạo notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
    `;
    
    // Thêm styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
    `;
    
    // Thêm animation CSS
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            .notification button {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                margin-left: auto;
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Tự động xóa sau 5 giây
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Load dữ liệu trạm sạc từ API
async function loadStations() {
    showLoading(true);
    hideError();
    
    try {
        const response = await fetch('api.php?action=list');
        if (!response.ok) {
            throw new Error('Không thể tải dữ liệu');
        }
        
        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || 'Lỗi khi tải dữ liệu');
        }
        
        allStations = result.data.stations || [];
        filteredStations = [...allStations];
        
        // Cập nhật thống kê
        updateStats();
        
        // Hiển thị trạm sạc trên bản đồ
        displayStations();
        
        // Cập nhật danh sách tỉnh/thành và đơn vị vận hành
        updateProvinceList();
        updateDistrictList();
        updateOperatorList();
        
        showNotification(`Đã tải thành công ${allStations.length} trạm sạc!`, 'success');
        
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        showError('Không thể tải dữ liệu trạm sạc. Vui lòng thử lại sau.');
        showNotification('Lỗi khi tải dữ liệu. Vui lòng kiểm tra kết nối database.', 'warning');
    } finally {
        showLoading(false);
    }
}

// Tìm trạm sạc gần nhất
async function findNearbyStations() {
    if (!userLocation) {
        showNotification('Vui lòng cho phép truy cập vị trí để tìm trạm gần nhất', 'warning');
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch(`api.php?action=nearby&lat=${userLocation.lat}&lng=${userLocation.lng}&radius=10`);
        if (!response.ok) {
            throw new Error('Không thể tìm trạm gần nhất');
        }
        
        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || 'Lỗi khi tìm trạm gần nhất');
        }
        
        const nearbyStations = result.data.stations;
        
        // Xóa markers hiện tại
        clearMarkers();
        
        // Hiển thị chỉ trạm gần nhất
        nearbyStations.forEach(station => {
            const marker = L.marker([station.lat, station.lng], {
                icon: createCustomIcon(station)
            });
            
            const popupContent = createPopupContent(station, station.distance_km);
            marker.bindPopup(popupContent);
            marker.addTo(map);
            markers.push(marker);
        });
        
        // Fit bounds cho trạm gần nhất
        if (markers.length > 0) {
            const group = new L.featureGroup(markers);
            map.fitBounds(group.getBounds().pad(0.1));
        }
        
        // Cập nhật thống kê
        updateStatsForNearby(nearbyStations);
        
        showNotification(`Tìm thấy ${nearbyStations.length} trạm sạc trong bán kính 10km!`, 'success');
        
    } catch (error) {
        console.error('Lỗi khi tìm trạm gần nhất:', error);
        showError('Không thể tìm trạm gần nhất. Vui lòng thử lại sau.');
        showNotification('Lỗi khi tìm trạm gần nhất', 'warning');
    } finally {
        showLoading(false);
    }
}

// Hiển thị trạm sạc trên bản đồ
function displayStations() {
    // Xóa markers cũ
    clearMarkers();
    
    // Tạo markers mới
    filteredStations.forEach(station => {
        const marker = L.marker([station.lat, station.lng], {
            icon: createCustomIcon(station)
        });
        
        const popupContent = createPopupContent(station);
        marker.bindPopup(popupContent);
        marker.addTo(map);
        markers.push(marker);
    });
    
    // Fit bounds nếu có markers
    if (markers.length > 0) {
        const group = new L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1));
    }
}

// Tạo nội dung popup
function createPopupContent(station, distance = null) {
    const priceText = station.is_free == 1 ? 'Miễn phí' : 
                     station.price_per_kwh ? `${station.price_per_kwh.toLocaleString()} VNĐ/kWh` : 'Chưa có thông tin';
    
    const distanceText = distance ? `<p style="margin: 5px 0; color: #ff6b35; font-weight: 600;"><i class="fas fa-location-arrow"></i> Khoảng cách: ${distance.toFixed(1)} km</p>` : '';
    
    // Xác định trạng thái và màu sắc
    const statusConfig = getStatusConfig(station.status);
    
    // Xác định loại xe dựa trên connector_type
    const vehicleType = getVehicleType(station.connector_type);
    const vehicleIcon = vehicleType === 'car' ? 'fas fa-car' : vehicleType === 'motorcycle' ? 'fas fa-motorcycle' : 'fas fa-car';
    const vehicleText = vehicleType === 'car' ? 'Ô tô điện' : vehicleType === 'motorcycle' ? 'Xe máy điện' : 'Cả hai loại';
    
    return `
        <div style="min-width: 320px; font-family: 'Inter', sans-serif;">
            <div style="border-bottom: 2px solid #f3f4f6; padding-bottom: 10px; margin-bottom: 15px;">
                <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 1.1rem; font-weight: 600;">${station.name}</h3>
                <p style="margin: 5px 0; color: #6b7280; font-size: 0.9rem;">
                    <i class="fas fa-map-marker-alt" style="color: #ff6b35;"></i> ${station.address}
                </p>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                <div>
                    <p style="margin: 5px 0; color: #374151; font-size: 0.9rem;">
                        <i class="fas fa-building" style="color: #6b7280;"></i> <strong>Tỉnh/Thành:</strong><br>
                        ${station.province}
                    </p>
                    ${station.district ? `<p style="margin: 5px 0; color: #374151; font-size: 0.9rem;">
                        <i class="fas fa-map" style="color: #6b7280;"></i> <strong>Quận/Huyện:</strong><br>
                        ${station.district}
                    </p>` : ''}
                </div>
                <div>
                    <p style="margin: 5px 0; color: #374151; font-size: 0.9rem;">
                        <i class="fas fa-power-off" style="color: ${statusConfig.color};"></i> <strong>Trạng thái:</strong><br>
                        <span style="color: ${statusConfig.color}; font-weight: 600;">
                            <i class="fas fa-${statusConfig.icon}"></i> ${statusConfig.text}
                        </span>
                    </p>
                    <p style="margin: 5px 0; color: #374151; font-size: 0.9rem;">
                        <i class="fas fa-building" style="color: #6b7280;"></i> <strong>Đơn vị:</strong><br>
                        ${station.operator || 'Chưa có thông tin'}
                    </p>
                </div>
            </div>
            
            ${station.phone ? `<p style="margin: 5px 0; color: #374151; font-size: 0.9rem;"><i class="fas fa-phone" style="color: #3b82f6;"></i> <strong>Điện thoại:</strong> ${station.phone}</p>` : ''}
            <p style="margin: 5px 0; color: #374151; font-size: 0.9rem;"><i class="${vehicleIcon}" style="color: #8b5cf6;"></i> <strong>Loại xe:</strong> ${vehicleText}</p>
            ${station.charger_type ? `<p style="margin: 5px 0; color: #374151; font-size: 0.9rem;"><i class="fas fa-bolt" style="color: #f59e0b;"></i> <strong>Loại sạc:</strong> ${station.charger_type} ${station.power_rating || ''}</p>` : ''}
            ${station.connector_type ? `<p style="margin: 5px 0; color: #374151; font-size: 0.9rem;"><i class="fas fa-plug" style="color: #8b5cf6;"></i> <strong>Cổng sạc:</strong> ${station.connector_type}</p>` : ''}
            <p style="margin: 5px 0; color: #374151; font-size: 0.9rem;"><i class="fas fa-money-bill" style="color: #10b981;"></i> <strong>Giá:</strong> ${priceText}</p>
            ${station.operating_hours ? `<p style="margin: 5px 0; color: #374151; font-size: 0.9rem;"><i class="fas fa-clock" style="color: #6b7280;"></i> <strong>Giờ hoạt động:</strong> ${station.operating_hours}</p>` : ''}
            ${station.amenities ? `<p style="margin: 5px 0; color: #374151; font-size: 0.9rem;"><i class="fas fa-star" style="color: #f59e0b;"></i> <strong>Tiện ích:</strong> ${station.amenities}</p>` : ''}
            ${distanceText}
            
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                <div style="display: flex; gap: 8px;">
                    <button onclick="getDirections(${station.lat}, ${station.lng}, '${station.name}')" style="
                        background: #3b82f6;
                        color: white;
                        border: none;
                        padding: 8px 12px;
                        border-radius: 6px;
                        font-size: 0.85rem;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 5px;
                        transition: all 0.2s ease;
                    " onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">
                        <i class="fas fa-route"></i> Chỉ đường
                    </button>
                    <button onclick="shareStation('${station.name}', ${station.lat}, ${station.lng})" style="
                        background: #6b7280;
                        color: white;
                        border: none;
                        padding: 8px 12px;
                        border-radius: 6px;
                        font-size: 0.85rem;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 5px;
                        transition: all 0.2s ease;
                    " onmouseover="this.style.background='#4b5563'" onmouseout="this.style.background='#6b7280'">
                        <i class="fas fa-share"></i> Chia sẻ
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Xác định cấu hình trạng thái
function getStatusConfig(status) {
    switch (status) {
        case 'active':
            return {
                color: '#10b981',
                icon: 'check-circle',
                text: 'Đang hoạt động'
            };
        case 'inactive':
            return {
                color: '#ef4444',
                icon: 'times-circle',
                text: 'Không hoạt động'
            };
        case 'full':
            return {
                color: '#f59e0b',
                icon: 'exclamation-triangle',
                text: 'Đầy xe'
            };
        default:
            return {
                color: '#6b7280',
                icon: 'question-circle',
                text: 'Không xác định'
            };
    }
}

// Xác định loại xe dựa trên connector_type
function getVehicleType(connectorType) {
    if (!connectorType) return 'both';
    
    const carConnectors = ['CCS', 'CHAdeMO', 'Type 2'];
    const motorcycleConnectors = ['Type 1', 'GB/T'];
    
    const connectors = connectorType.split(',').map(c => c.trim());
    
    const hasCarConnector = connectors.some(c => carConnectors.includes(c));
    const hasMotorcycleConnector = connectors.some(c => motorcycleConnectors.includes(c));
    
    if (hasCarConnector && hasMotorcycleConnector) return 'both';
    if (hasCarConnector) return 'car';
    if (hasMotorcycleConnector) return 'motorcycle';
    
    return 'both'; // Mặc định
}

// Tạo custom icon cho marker theo loại xe và trạng thái
function createCustomIcon(station) {
    const vehicleType = getVehicleType(station.connector_type);
    const statusConfig = getStatusConfig(station.status);
    
    // Icon theo loại xe
    let vehicleIcon = 'fas fa-charging-station';
    if (vehicleType === 'car') {
        vehicleIcon = 'fas fa-car';
    } else if (vehicleType === 'motorcycle') {
        vehicleIcon = 'fas fa-motorcycle';
    }
    
    // Border theo trạng thái
    let borderColor = '#ffffff';
    if (station.status === 'full') {
        borderColor = '#f59e0b';
    }
    
    const iconHtml = `
        <div style="
            background-color: ${statusConfig.color};
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: 3px solid ${borderColor};
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            position: relative;
        ">
            <i class="${vehicleIcon}" style="color: white; font-size: 14px;"></i>
            ${station.status === 'full' ? '<div style="position: absolute; top: -2px; right: -2px; width: 8px; height: 8px; background: #f59e0b; border-radius: 50%; border: 1px solid white;"></div>' : ''}
        </div>
    `;
    
    return L.divIcon({
        html: iconHtml,
        className: 'custom-marker',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
    });
}

// Xóa tất cả markers
function clearMarkers() {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
}

// Cập nhật thống kê
function updateStats() {
    const total = allStations.length;
    const active = allStations.filter(s => s.status === 'active').length;
    const inactive = allStations.filter(s => s.status === 'inactive').length;
    const full = allStations.filter(s => s.status === 'full').length;
    const provinces = [...new Set(allStations.map(s => s.province).filter(p => p))].length;
    
    // Cập nhật header stats
    document.getElementById('totalStations').textContent = total;
    document.getElementById('activeStations').textContent = active;
    document.getElementById('inactiveStations').textContent = inactive;
    
    // Cập nhật card stats
    document.getElementById('totalStationsCard').textContent = total;
    document.getElementById('activeStationsCard').textContent = active;
    document.getElementById('inactiveStationsCard').textContent = inactive + full; // Gộp inactive và full
    document.getElementById('provincesCount').textContent = provinces;
}

// Cập nhật thống kê cho trạm gần nhất
function updateStatsForNearby(nearbyStations) {
    const total = nearbyStations.length;
    const active = nearbyStations.filter(s => s.status === 'active').length;
    const inactive = nearbyStations.filter(s => s.status === 'inactive').length;
    const full = nearbyStations.filter(s => s.status === 'full').length;
    const provinces = [...new Set(nearbyStations.map(s => s.province).filter(p => p))].length;
    
    // Cập nhật header stats
    document.getElementById('totalStations').textContent = total;
    document.getElementById('activeStations').textContent = active;
    document.getElementById('inactiveStations').textContent = inactive;
    
    // Cập nhật card stats
    document.getElementById('totalStationsCard').textContent = total;
    document.getElementById('activeStationsCard').textContent = active;
    document.getElementById('inactiveStationsCard').textContent = inactive + full; // Gộp inactive và full
    document.getElementById('provincesCount').textContent = provinces;
}

// Cập nhật danh sách tỉnh/thành
async function updateProvinceList() {
    try {
        const response = await fetch('api.php?action=provinces');
        const result = await response.json();
        
        if (result.success) {
            const provinces = result.data;
            const select = document.getElementById('provinceFilter');
            select.innerHTML = '<option value="">Tất cả tỉnh/thành</option>';
            
            provinces.forEach(province => {
                const option = document.createElement('option');
                option.value = province;
                option.textContent = province;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Lỗi khi tải danh sách tỉnh:', error);
    }
}

// Cập nhật danh sách quận/huyện
async function updateDistrictList() {
    try {
        const response = await fetch('api.php?action=districts');
        const result = await response.json();
        
        if (result.success) {
            const districts = result.data;
            const select = document.getElementById('districtFilter');
            select.innerHTML = '<option value="">Tất cả quận/huyện</option>';
            
            districts.forEach(district => {
                const option = document.createElement('option');
                option.value = district;
                option.textContent = district;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Lỗi khi tải danh sách quận/huyện:', error);
    }
}

// Cập nhật danh sách đơn vị vận hành
async function updateOperatorList() {
    try {
        const response = await fetch('api.php?action=operators');
        const result = await response.json();
        
        if (result.success) {
            const operators = result.data;
            const select = document.getElementById('operatorFilter');
            if (select) {
                select.innerHTML = '<option value="">Tất cả đơn vị</option>';
                
                operators.forEach(operator => {
                    const option = document.createElement('option');
                    option.value = operator;
                    option.textContent = operator;
                    select.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Lỗi khi tải danh sách đơn vị:', error);
    }
}

// Tìm kiếm gợi ý
function showSearchSuggestions(searchTerm) {
    if (!searchTerm || searchTerm.length < 2) {
        hideSearchSuggestions();
        return;
    }
    
    const suggestions = allStations.filter(station => 
        station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        station.address.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);
    
    const suggestionsContainer = document.getElementById('searchSuggestions');
    suggestionsContainer.innerHTML = '';
    
    if (suggestions.length > 0) {
        suggestions.forEach(station => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.innerHTML = `
                <div class="suggestion-name">${station.name}</div>
                <div class="suggestion-address">${station.address}</div>
            `;
            item.onclick = () => {
                document.getElementById('searchInput').value = station.name;
                hideSearchSuggestions();
                searchStations();
            };
            suggestionsContainer.appendChild(item);
        });
        suggestionsContainer.style.display = 'block';
    } else {
        hideSearchSuggestions();
    }
}

// Ẩn gợi ý tìm kiếm
function hideSearchSuggestions() {
    document.getElementById('searchSuggestions').style.display = 'none';
}

// Tìm kiếm trạm sạc
function searchStations() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const vehicleTypeFilter = document.getElementById('vehicleTypeFilter').value;
    const provinceFilter = document.getElementById('provinceFilter').value;
    const districtFilter = document.getElementById('districtFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    const operatorFilter = document.getElementById('operatorFilter')?.value || '';
    
    filteredStations = allStations.filter(station => {
        // Tìm kiếm theo tên hoặc địa chỉ
        const matchesSearch = !searchTerm || 
            station.name.toLowerCase().includes(searchTerm) ||
            station.address.toLowerCase().includes(searchTerm);
        
        // Lọc theo loại xe
        const stationVehicleType = getVehicleType(station.connector_type);
        const matchesVehicleType = !vehicleTypeFilter || 
            stationVehicleType === vehicleTypeFilter || 
            vehicleTypeFilter === 'both';
        
        // Lọc theo tỉnh/thành
        const matchesProvince = !provinceFilter || station.province === provinceFilter;
        
        // Lọc theo quận/huyện (nếu có dữ liệu)
        const matchesDistrict = !districtFilter || 
            (station.district && station.district === districtFilter);
        
        // Lọc theo trạng thái
        const matchesStatus = !statusFilter || station.status === statusFilter;
        
        // Lọc theo đơn vị vận hành
        const matchesOperator = !operatorFilter || station.operator === operatorFilter;
        
        return matchesSearch && matchesVehicleType && matchesProvince && 
               matchesDistrict && matchesStatus && matchesOperator;
    });
    
    displayStations();
    updateStatsForFiltered();
    
    // Hiển thị thông báo kết quả tìm kiếm
    const resultCount = filteredStations.length;
    if (searchTerm || vehicleTypeFilter || provinceFilter || districtFilter || statusFilter || operatorFilter) {
        showNotification(`Tìm thấy ${resultCount} trạm sạc phù hợp!`, 'success');
    }
}

// Cập nhật thống kê cho kết quả đã lọc
function updateStatsForFiltered() {
    const total = filteredStations.length;
    const active = filteredStations.filter(s => s.status === 'active').length;
    const inactive = filteredStations.filter(s => s.status === 'inactive').length;
    const full = filteredStations.filter(s => s.status === 'full').length;
    const provinces = [...new Set(filteredStations.map(s => s.province).filter(p => p))].length;
    
    // Cập nhật header stats
    document.getElementById('totalStations').textContent = total;
    document.getElementById('activeStations').textContent = active;
    document.getElementById('inactiveStations').textContent = inactive;
    
    // Cập nhật card stats
    document.getElementById('totalStationsCard').textContent = total;
    document.getElementById('activeStationsCard').textContent = active;
    document.getElementById('inactiveStationsCard').textContent = inactive + full; // Gộp inactive và full
    document.getElementById('provincesCount').textContent = provinces;
}

// Xóa bộ lọc
function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('vehicleTypeFilter').value = '';
    document.getElementById('provinceFilter').value = '';
    document.getElementById('districtFilter').value = '';
    document.getElementById('statusFilter').value = '';
    if (document.getElementById('operatorFilter')) {
        document.getElementById('operatorFilter').value = '';
    }
    
    filteredStations = [...allStations];
    displayStations();
    updateStats();
    hideSearchSuggestions();
    
    showNotification('Đã làm mới bộ lọc!', 'success');
}

// Hiển thị loading
function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
}

// Hiển thị lỗi
function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.querySelector('p').textContent = message;
    errorDiv.style.display = 'block';
}

// Ẩn lỗi
function hideError() {
    document.getElementById('error').style.display = 'none';
}

// Tính năng chỉ đường đến trạm sạc
function getDirections(lat, lng, stationName) {
    // Kiểm tra xem có vị trí hiện tại không
    if (userLocation) {
        // Mở Google Maps với chỉ đường từ vị trí hiện tại đến trạm sạc
        const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${lat},${lng}&travelmode=driving`;
        window.open(directionsUrl, '_blank');
        
        showNotification(`Đang mở chỉ đường đến ${stationName}`, 'success');
    } else {
        // Nếu không có vị trí hiện tại, chỉ mở vị trí trạm sạc
        const locationUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        window.open(locationUrl, '_blank');
        
        showNotification(`Đã mở vị trí ${stationName} trên Google Maps`, 'info');
    }
}

// Tính năng chia sẻ trạm sạc
function shareStation(stationName, lat, lng) {
    const shareData = {
        title: `Trạm sạc ${stationName} - V-Electric`,
        text: `Tìm thấy trạm sạc ${stationName} trên bản đồ V-Electric`,
        url: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    };

    // Kiểm tra xem trình duyệt có hỗ trợ Web Share API không
    if (navigator.share) {
        navigator.share(shareData)
            .then(() => {
                showNotification('Đã chia sẻ trạm sạc thành công!', 'success');
            })
            .catch((error) => {
                console.log('Lỗi chia sẻ:', error);
                fallbackShare(shareData);
            });
    } else {
        // Fallback cho trình duyệt không hỗ trợ Web Share API
        fallbackShare(shareData);
    }
}

// Fallback cho chia sẻ
function fallbackShare(shareData) {
    // Tạo URL chia sẻ
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(`${shareData.title}\n${shareData.text}\n${shareData.url}`)}`;
    
    // Hiển thị menu chia sẻ
    const shareMenu = document.createElement('div');
    shareMenu.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 10000;
        min-width: 300px;
        text-align: center;
    `;
    
    shareMenu.innerHTML = `
        <h3 style="margin-bottom: 15px; color: #1f2937;">Chia sẻ trạm sạc</h3>
        <div style="display: flex; flex-direction: column; gap: 10px;">
            <button onclick="window.open('${shareUrl}', '_blank'); this.parentElement.parentElement.remove();" style="
                background: #25d366;
                color: white;
                border: none;
                padding: 12px;
                border-radius: 8px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                font-size: 1rem;
            ">
                <i class="fab fa-whatsapp"></i> Chia sẻ qua WhatsApp
            </button>
            <button onclick="copyToClipboard('${shareData.url}'); this.parentElement.parentElement.remove();" style="
                background: #3b82f6;
                color: white;
                border: none;
                padding: 12px;
                border-radius: 8px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                font-size: 1rem;
            ">
                <i class="fas fa-copy"></i> Sao chép liên kết
            </button>
            <button onclick="this.parentElement.parentElement.remove();" style="
                background: #6b7280;
                color: white;
                border: none;
                padding: 12px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 1rem;
            ">
                Hủy
            </button>
        </div>
    `;
    
    // Thêm overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 9999;
    `;
    overlay.onclick = () => {
        overlay.remove();
        shareMenu.remove();
    };
    
    document.body.appendChild(overlay);
    document.body.appendChild(shareMenu);
}

// Sao chép vào clipboard
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Đã sao chép liên kết vào clipboard!', 'success');
        });
    } else {
        // Fallback cho trình duyệt cũ
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('Đã sao chép liên kết vào clipboard!', 'success');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    initMap();
    
    // Tìm kiếm khi nhấn Enter
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchStations();
        }
    });
    
    // Gợi ý tìm kiếm với debounce
    document.getElementById('searchInput').addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            showSearchSuggestions(e.target.value);
        }, 300);
    });
    
    // Ẩn gợi ý khi click ra ngoài
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.search-container')) {
            hideSearchSuggestions();
        }
    });
    
    // Tự động tìm kiếm khi thay đổi filter
    document.getElementById('vehicleTypeFilter').addEventListener('change', searchStations);
    document.getElementById('provinceFilter').addEventListener('change', searchStations);
    document.getElementById('districtFilter').addEventListener('change', searchStations);
    document.getElementById('statusFilter').addEventListener('change', searchStations);
    if (document.getElementById('operatorFilter')) {
        document.getElementById('operatorFilter').addEventListener('change', searchStations);
    }
    
    // Thêm hiệu ứng hover cho markers
    document.addEventListener('mouseover', function(e) {
        if (e.target.closest('.custom-marker')) {
            e.target.style.transform = 'scale(1.2)';
        }
    });
    
    document.addEventListener('mouseout', function(e) {
        if (e.target.closest('.custom-marker')) {
            e.target.style.transform = 'scale(1)';
        }
    });
}); 