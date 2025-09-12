// Global variables
let map = null;
let userLocation = null;
let nearestStation = null;
let markersLayer = null;
let userMarker = null;
let stations = [];
const markerByKey = {};
const favoriteKeys = new Set();
const provinces = new Set();
const districtsByProvince = {};
let searchTimeout = null;
let currentPage = 1;
const itemsPerPage = 10;
let isBottomSheetExpanded = false;
let selectedStation = null;
let currentUser = firebase.auth().currentUser;

// Tạo icon tùy chỉnh cho trạm sạc
const stationIcons = {
    active: L.divIcon({
        className: 'custom-marker active-station',
        html: '<i class="fas fa-charging-station"></i>',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30]
    }),
    maintenance: L.divIcon({
        className: 'custom-marker maintenance-station',
        html: '<i class="fas fa-tools"></i>',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30]
    })
};

// Initialize map and load KML data
async function initMap() {
    // Create map centered on Vietnam
    map = L.map('map').setView([16.0544, 107.7442], 6);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Initialize markers layer with clustering
    markersLayer = L.markerClusterGroup({
        showCoverageOnHover: false,
        maxClusterRadius: 50,
        iconCreateFunction: function(cluster) {
            return L.divIcon({
                html: '<div class="cluster-marker">' + cluster.getChildCount() + '</div>',
                className: 'marker-cluster',
                iconSize: L.point(40, 40)
            });
        }
    });
    map.addLayer(markersLayer);

    try {
        // Fetch KML file
        const response = await fetch('/v-electric/VinFast.kml');
        const kmlText = await response.text();

        // Parse KML to GeoJSON
        const kmlDoc = new DOMParser().parseFromString(kmlText, 'text/xml');
        const geoJson = toGeoJSON.kml(kmlDoc);

        // Process features and add markers
        geoJson.features.forEach(feature => {
            if (feature.geometry.type === 'Point') {
                const coords = feature.geometry.coordinates;
                const props = feature.properties;
                
                // Log để kiểm tra cấu trúc dữ liệu
                console.log("Feature props:", props);
                
                // Lấy ExtendedData
                const extData = parseExtendedData(props);
                
                const address = extData["Địa Chỉ"] || '';
                const { province, district } = extractProvinceAndDistrict(address);
                
                const station = {
                    name: props.name || 'Trạm sạc VinFast',
                    lat: coords[1],
                    lng: coords[0],
                    address: address,
                    ports: extData["Cổng sạc"] || '',
                    hours: extData["Thời gian hoạt động"] || '',
                    parking: extData["Gửi xe"] || '',
                    type: extData["Trạm sạc"] || '',
                    updated: extData["Cập nhật lần cuối"] || '',
                    status: extData["Trạng thái"] || 'Hoạt động',
                    province: province,
                    district: district,
                    powerLevels: extractPowerLevels(extData["Cổng sạc"] || '')
                };

                // Thêm vào danh sách tỉnh và quận/huyện
                if (province) {
                    provinces.add(province);
                    if (!districtsByProvince[province]) {
                        districtsByProvince[province] = new Set();
                    }
                    if (district) {
                        districtsByProvince[province].add(district);
                    }
                }
                
                stations.push(station);
                
                const icon = station.status === 'Hoạt động' ? stationIcons.active : stationIcons.maintenance;
                const marker = L.marker([station.lat, station.lng], { icon: icon })
                    .on('click', () => showStationModal(station));
                const key = stationKey(station);
                marker.__station = station;
                markerByKey[key] = marker;
                    
                markersLayer.addLayer(marker);
            }
        });

        // Đã tải xong dữ liệu trạm

        map.fitBounds(markersLayer.getBounds());

        // Nạp danh sách công suất vào select box
        const powerLevels = new Set();
        stations.forEach(st => {
            st.powerLevels.forEach(p => powerLevels.add(p));
        });

        const modalPowerSelect = document.getElementById('modalPowerSelect');
        modalPowerSelect.innerHTML = '<option value="">-- Tất cả công suất --</option>';
        Array.from(powerLevels).sort().forEach(p => {
            const opt = document.createElement('option');
            opt.value = p;
            opt.textContent = p;
            modalPowerSelect.appendChild(opt);
        });

        // Nạp danh sách tỉnh vào select box
        const modalProvinceSelect = document.getElementById('modalProvinceSelect');
        const provinceArray = Array.from(provinces);
        provinceArray.sort(); // Sắp xếp theo alphabet
        provinceArray.forEach(province => {
            const option = document.createElement('option');
            option.value = province;
            option.textContent = province;
            modalProvinceSelect.appendChild(option);
        });

        // Gắn sự kiện cho select box
        modalProvinceSelect.addEventListener('change', function() {
            loadDistricts(this.value);
        });

        // Đã tải xong dữ liệu trạm
    } catch (error) {
        console.error('Error loading KML:', error);
        showError('Không thể tải dữ liệu trạm sạc. Vui lòng thử lại sau.');
    }
}

// Hàm tách công suất từ chuỗi
function extractPowerLevels(ports) {
    if (!ports) return [];
    const regex = /(\d+\s*KW)/gi;
    const matches = ports.match(regex);
    return matches ? matches.map(p => p.trim().toUpperCase()) : [];
}

// Parse ExtendedData from KML properties
function parseExtendedData(props) {
    const result = {};

    // Trường hợp 1: dữ liệu phẳng sẵn
    Object.keys(props).forEach(k => {
        if (typeof props[k] === "string" && k !== "name") {
            result[k] = props[k];
        }
    });

    // Trường hợp 2: ExtendedData dạng SimpleData[]
    if (props.ExtendedData && props.ExtendedData.SimpleData) {
        props.ExtendedData.SimpleData.forEach(sd => {
            result[sd.name] = sd["#text"] || "";
        });
    }

    return result;
}

// Hàm trích xuất tỉnh và quận/huyện từ địa chỉ
function extractProvinceAndDistrict(address) {
    let province = '';
    let district = '';
    if (address) {
        const parts = address.split(',');
        // Lấy tỉnh (phần tử cuối)
        province = parts[parts.length - 1].trim();
        // Lấy quận/huyện (phần tử kế cuối)
        if (parts.length > 1) {
            district = parts[parts.length - 2].trim();
        }
    }
    return { province, district };
}

// Hàm nạp danh sách quận/huyện khi chọn tỉnh
function loadDistricts(province) {
    const modalDistrictSelect = document.getElementById('modalDistrictSelect');
    modalDistrictSelect.innerHTML = '<option value="">-- Chọn quận/huyện --</option>';
    if (province && districtsByProvince[province]) {
        const districts = Array.from(districtsByProvince[province]);
        districts.sort(); // Sắp xếp theo alphabet
        districts.forEach(district => {
            const opt = document.createElement('option');
            opt.value = district;
            opt.textContent = district;
            modalDistrictSelect.appendChild(opt);
        });
    }
}

// Hàm lọc và hiển thị trạm theo tỉnh/quận
function filterStations() {
    const province = document.getElementById('modalProvinceSelect').value;
    const district = document.getElementById('modalDistrictSelect').value;
    const power = document.getElementById('modalPowerSelect').value;

    console.log('Filtering with:', { province, district, power }); // Debug log
    console.log('Total stations before filter:', stations.length); // Debug log

    // Xóa tất cả marker hiện tại
    markersLayer.clearLayers();

    // Lọc trạm
    const filteredStations = stations.filter(station => {
        // Lọc theo công suất
        if (power && !station.powerLevels.includes(power)) {
            return false;
        }

        // Nếu không chọn tỉnh và huyện, chỉ lọc theo công suất
        if (!province && !district) return true;

        // Nếu chỉ chọn tỉnh
        if (province && !district) {
            return station.province && station.province.includes(province);
        }

        // Nếu chọn cả tỉnh và huyện
        if (province && district) {
            return station.province && station.province.includes(province) &&
                   station.district && station.district.includes(district);
        }

        return true;
    });

    console.log('Filtered stations:', filteredStations.length); // Debug log

    // Thêm marker cho các trạm đã lọc
    filteredStations.forEach(station => {
        const icon = station.status === 'Hoạt động' ? stationIcons.active : stationIcons.maintenance;
        const marker = L.marker([station.lat, station.lng], { icon: icon })
            .on('click', () => showStationModal(station));
        const key = stationKey(station);
        marker.__station = station;
        markerByKey[key] = marker;
        markersLayer.addLayer(marker);
    });

    // Đã lọc xong trạm

    // Fit bounds nếu có marker
    if (markersLayer.getLayers().length > 0) {
        map.fitBounds(markersLayer.getBounds());
    }

    // Cập nhật danh sách trạm gần đây
    updateStationList();
}

// Menu functions
function toggleMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const sideMenu = document.querySelector('.side-menu');
    const menuOverlay = document.querySelector('.menu-overlay');
    const headerCenter = document.querySelector('.header-center');
    const searchResults = document.getElementById('searchResults');
    
    menuToggle.classList.toggle('active');
    sideMenu.classList.toggle('active');
    menuOverlay.classList.toggle('active');
    
    // Ẩn/hiện thanh tìm kiếm
    headerCenter.classList.toggle('hidden');
    
    // Ẩn kết quả tìm kiếm nếu đang hiển thị
    searchResults.classList.remove('active');
    
    // Prevent body scroll when menu is open
    document.body.style.overflow = sideMenu.classList.contains('active') ? 'hidden' : '';
}

function showGuide() {
    toggleMenu();
    showNotification('🔍 Tính năng đang được phát triển', 'info');
}

function showAbout() {
    toggleMenu();
    showNotification('ℹ️ Tính năng đang được phát triển', 'info');
}

// Bottom sheet functions
function toggleBottomSheet() {
    const bottomSheet = document.getElementById('bottomSheet');
    const icon = document.getElementById('bottomSheetIcon');
    isBottomSheetExpanded = !isBottomSheetExpanded;
    
    if (isBottomSheetExpanded) {
        bottomSheet.classList.add('expanded');
        icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
    } else {
        bottomSheet.classList.remove('expanded');
        icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
    }
}

function showNearbyStations() {
    const bottomSheet = document.getElementById('bottomSheet');
    bottomSheet.classList.add('active');
    
    // Nếu có vị trí người dùng, tự động mở rộng bottom sheet
    if (userLocation) {
        bottomSheet.classList.add('expanded');
        document.getElementById('bottomSheetIcon').classList.replace('fa-chevron-up', 'fa-chevron-down');
        isBottomSheetExpanded = true;
    }
}

function updateStationList() {
    const stationList = document.getElementById('stationList');
    const nearbyCount = document.getElementById('nearbyCount');
    
    // Lọc và sắp xếp trạm theo khoảng cách
    const nearbyStations = stations
        .filter(station => {
            if (!userLocation) return false;
            station.distance = calculateDistance(
                userLocation.lat, userLocation.lng,
                station.lat, station.lng
            );
            return true;
        })
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 10); // Chỉ lấy 10 trạm gần nhất

    // Phân trang
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageStations = nearbyStations.slice(startIndex, endIndex);

    // Cập nhật số lượng
    nearbyCount.textContent = `${nearbyStations.length} trạm sạc được tìm thấy`;

    // Render danh sách
    stationList.innerHTML = pageStations.map(station => `
        <div class="station-item" onclick="zoomToStation('${stationKey(station)}')">
            <div class="station-item-header">
                <div>
                    <div class="station-name">${station.name}</div>
                    <div class="station-address">${station.address}</div>
                </div>
                ${station.distance ? `
                    <div class="station-distance">${station.distance.toFixed(1)} km</div>
                ` : ''}
            </div>
            <div class="station-tags">
                <span class="station-tag tag-24h">24/7</span>
                <span class="station-tag tag-public">Công cộng</span>
                <span class="station-tag tag-verified">
                    <i class="fas fa-check-circle"></i>
                </span>
            </div>
        </div>
    `).join('');

    // Cập nhật phân trang
    updatePagination(nearbyStations.length);
}

function updatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pageInfo = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');

    pageInfo.textContent = `Trang ${currentPage}/${totalPages}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
}

function changePage(direction) {
    if (direction === 'prev' && currentPage > 1) {
        currentPage--;
    } else if (direction === 'next') {
        currentPage++;
    }
    updateStationList();
}

// Search functions
function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const clearButton = document.querySelector('.clear-button');
    
    searchInput.value = '';
    searchResults.classList.remove('active');
    clearButton.style.display = 'none';
}

function handleSearch(query) {
    clearTimeout(searchTimeout);
    const searchResults = document.getElementById('searchResults');
    const sideMenu = document.querySelector('.side-menu');
    const clearButton = document.querySelector('.clear-button');
    
    // Hiển thị/ẩn nút xóa
    clearButton.style.display = query.trim() ? 'flex' : 'none';
    
    // Nếu menu đang mở, không hiển thị kết quả tìm kiếm
    if (sideMenu.classList.contains('active')) {
        return;
    }
    
    if (!query.trim()) {
        searchResults.classList.remove('active');
        return;
    }

    searchTimeout = setTimeout(() => {
        const results = [];
        const queryLower = query.toLowerCase();

        // Tìm kiếm trong danh sách trạm
        stations.forEach(station => {
            if (results.length >= 10) return; // Giới hạn 10 kết quả

            // Tìm theo tên trạm
            if (station.name.toLowerCase().includes(queryLower)) {
                results.push({
                    type: 'station',
                    name: station.name,
                    info: station.address,
                    data: station
                });
            }
            // Tìm theo địa chỉ
            else if (station.address.toLowerCase().includes(queryLower)) {
                results.push({
                    type: 'station',
                    name: station.name,
                    info: station.address,
                    data: station
                });
            }
        });

        // Tìm kiếm trong danh sách tỉnh
        Array.from(provinces).forEach(province => {
            if (results.length >= 10) return;
            if (province.toLowerCase().includes(queryLower)) {
                results.push({
                    type: 'province',
                    name: province,
                    info: 'Tỉnh/Thành phố',
                    data: province
                });
            }
        });

        // Tìm kiếm trong danh sách quận/huyện
        Object.entries(districtsByProvince).forEach(([province, districts]) => {
            if (results.length >= 10) return;
            districts.forEach(district => {
                if (district.toLowerCase().includes(queryLower)) {
                    results.push({
                        type: 'district',
                        name: district,
                        info: `${province}`,
                        data: { province, district }
                    });
                }
            });
        });

        // Hiển thị kết quả
        if (results.length > 0) {
            searchResults.innerHTML = results.map(result => `
                <div class="search-item" data-type="${result.type}" data-info='${JSON.stringify(result.data)}'>
                    <div class="name">
                        <i class="fas ${result.type === 'station' ? 'fa-charging-station' : result.type === 'province' ? 'fa-map-marked-alt' : 'fa-map-marker-alt'}"></i>
                        ${result.name}
                    </div>
                    <div class="info">${result.info}</div>
                </div>
            `).join('');

            // Thêm event listeners cho các kết quả tìm kiếm
            const searchItems = searchResults.querySelectorAll('.search-item');
            searchItems.forEach(item => {
                item.addEventListener('click', function() {
                    const type = this.dataset.type;
                    const data = JSON.parse(this.dataset.info);
                    handleSearchItemClick(type, data);
                });
            });
            searchResults.classList.add('active');
        } else {
            searchResults.innerHTML = '<div class="search-item">Không tìm thấy kết quả</div>';
            searchResults.classList.add('active');
        }
    }, 300); // Delay 300ms để tránh search quá nhiều
}

function handleSearchItemClick(type, data) {
    const searchResults = document.getElementById('searchResults');
    const searchInput = document.getElementById('searchInput');
    
    switch (type) {
        case 'station':
            // Zoom đến trạm và hiển thị modal
            map.setView([data.lat, data.lng], 16);
            showStationModal(data);
            break;

        case 'province':
            // Chọn tỉnh trong select box
            document.getElementById('provinceSelect').value = data;
            document.getElementById('provinceSelect').dispatchEvent(new Event('change'));
            break;

        case 'district':
            // Chọn tỉnh và quận trong select box
            document.getElementById('provinceSelect').value = data.province;
            document.getElementById('provinceSelect').dispatchEvent(new Event('change'));
            setTimeout(() => {
                document.getElementById('districtSelect').value = data.district;
                document.getElementById('districtSelect').dispatchEvent(new Event('change'));
            }, 100);
            break;
    }

    // Clear search
    searchInput.value = '';
    searchResults.classList.remove('active');
}

// Location functions
function getCurrentLocation() {
    if (!navigator.geolocation) {
        showError('Trình duyệt không hỗ trợ định vị GPS');
        return;
    }

    // Bắt đầu xác định vị trí

    navigator.geolocation.getCurrentPosition(
        function(position) {
            userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            // Update user marker on map
            if (userMarker) {
                map.removeLayer(userMarker);
            }
            
            userMarker = L.marker([userLocation.lat, userLocation.lng], {
                icon: L.divIcon({
                    html: '<div class="user-location-marker"><div class="location-tooltip">Vị trí của bạn</div></div>',
                    className: 'user-marker-container',
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                })
            }).addTo(map);

            // Zoom đến vị trí người dùng với hiệu ứng mượt mà
            map.flyTo([userLocation.lat, userLocation.lng], 16, {
                duration: 1.5,
                easeLinearity: 0.25
            });

            // Cập nhật trạng thái các nút
            document.querySelector('.map-controls button').disabled = false;

            console.log('User location:', userLocation);
            
            // Chỉ cập nhật danh sách trạm, không tự động mở bottom sheet
            currentPage = 1;
            updateStationList();
        },
        function(error) {
            let errorMessage = 'Không thể xác định vị trí';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = 'Bạn đã từ chối quyền truy cập vị trí';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = 'Thông tin vị trí không khả dụng';
                    break;
                case error.TIMEOUT:
                    errorMessage = 'Hết thời gian chờ định vị';
                    break;
            }
            showError(errorMessage);
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
        }
    );
}

function findNearestStation() {
    if (!userLocation) {
        showError('Vui lòng định vị trước khi tìm trạm gần nhất');
        return;
    }

    const nearestBtn = document.getElementById('nearestBtn');
    nearestBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    nearestBtn.disabled = true;

    // Tìm trạm gần nhất
    let nearest = null;
    let minDistance = Infinity;

    stations.forEach(station => {
        const distance = calculateDistance(
            userLocation.lat, userLocation.lng,
            station.lat, station.lng
        );
        if (distance < minDistance) {
            minDistance = distance;
            nearest = station;
        }
    });

    if (nearest) {
        // Zoom đến trạm gần nhất
        const bounds = L.latLngBounds([
            [userLocation.lat, userLocation.lng],
            [nearest.lat, nearest.lng]
        ]);
        map.fitBounds(bounds, {
            padding: [50, 50]
        });

        // Hiển thị modal thông tin trạm
        showStationModal(nearest);

        // Đã tìm thấy trạm gần nhất
    } else {
        showError('Không tìm thấy trạm sạc nào');
    }

    setTimeout(() => {
        nearestBtn.innerHTML = '<i class="fas fa-route"></i>';
        nearestBtn.disabled = false;
    }, 1000);
}

// Favorite functions
function stationKey(station) {
    // Dùng tên + toạ độ để định danh ổn định
    return `${station.name}|${station.lat.toFixed(6)}|${station.lng.toFixed(6)}`;
}

function isFavorite(key) {
    return favoriteKeys.has(key);
}

async function loadFavorites() {
    if (!currentUser) {
        favoriteKeys.clear();
        return;
    }

    try {
        const doc = await firebase.firestore()
            .collection('users')
            .doc(currentUser.uid)
            .get();

        if (doc.exists) {
            const data = doc.data();
            favoriteKeys.clear();
            (data.favorites || []).forEach(key => favoriteKeys.add(key));
        }
    } catch (error) {
        console.error('Error loading favorites:', error);
        showError('Không thể tải danh sách trạm yêu thích');
    }
}

async function saveFavorites() {
    if (!currentUser) return;

    try {
        await firebase.firestore()
            .collection('users')
            .doc(currentUser.uid)
            .set({
                favorites: Array.from(favoriteKeys),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
    } catch (error) {
        console.error('Error saving favorites:', error);
        showError('Không thể lưu trạm yêu thích');
    }
}

async function removeFavorite(key, event) {
    // Ngăn sự kiện click lan ra ngoài
    event.stopPropagation();

    // Lấy user hiện tại
    const user = firebase.auth().currentUser;
    if (!user) {
        showError('Vui lòng đăng nhập để quản lý trạm yêu thích');
        return;
    }
    currentUser = user;

    // Xóa khỏi danh sách yêu thích
    favoriteKeys.delete(key);
    await saveFavorites();

    // Cập nhật lại danh sách hiển thị
    const favoriteItem = event.target.closest('.favorite-item');
    favoriteItem.style.height = favoriteItem.offsetHeight + 'px';
    favoriteItem.style.opacity = '0';
    favoriteItem.style.transform = 'translateX(100%)';
    
    setTimeout(() => {
        favoriteItem.style.height = '0';
        favoriteItem.style.padding = '0';
        favoriteItem.style.margin = '0';
        favoriteItem.style.border = 'none';
        
        setTimeout(() => {
            favoriteItem.remove();
            
            // Kiểm tra nếu không còn trạm yêu thích nào
            const favoritesList = document.getElementById('favoritesList');
            if (!favoritesList.children.length) {
                closeFavoritesModal();
                showNotification('Bạn chưa có trạm yêu thích nào');
            }
        }, 300);
    }, 300);
}

async function toggleFavorite(key) {
    // Lấy user hiện tại vì biến global có thể chưa được cập nhật
    const user = firebase.auth().currentUser;
    if (!user) {
        showError('Vui lòng đăng nhập để lưu trạm yêu thích');
        return;
    }
    currentUser = user; // Cập nhật biến global

    if (favoriteKeys.has(key)) {
        favoriteKeys.delete(key);
    } else {
        favoriteKeys.add(key);
    }

    await saveFavorites();

    // Cập nhật lại modal nếu đang mở
    if (selectedStation && stationKey(selectedStation) === key) {
        const favoriteBtn = document.getElementById('favoriteBtn');
        const isFav = isFavorite(key);
        favoriteBtn.innerHTML = `
            <i class="fas ${isFav ? 'fa-star' : 'fa-star-half-alt'}"></i>
            ${isFav ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
        `;
        // Toggle màu nút theo trạng thái yêu thích
        if (isFav) {
            favoriteBtn.classList.remove('btn-secondary');
            favoriteBtn.classList.add('btn-success');
        } else {
            favoriteBtn.classList.remove('btn-success');
            favoriteBtn.classList.add('btn-secondary');
        }
    }
}

async function showFavoritesModal() {
    // Lấy user hiện tại vì biến global có thể chưa được cập nhật
    const user = firebase.auth().currentUser;
    if (!user) {
        showError('Vui lòng đăng nhập để xem trạm yêu thích');
        return;
    }
    currentUser = user; // Cập nhật biến global

    // Lấy danh sách trạm yêu thích
    const favoriteStations = stations.filter(station => 
        favoriteKeys.has(stationKey(station))
    ).sort((a, b) => a.name.localeCompare(b.name));

    if (favoriteStations.length === 0) {
        showNotification('Bạn chưa có trạm yêu thích nào');
        return;
    }

    // Hiển thị danh sách trong modal
    const favoritesList = document.getElementById('favoritesList');
    favoritesList.innerHTML = favoriteStations.map(station => {
        const key = stationKey(station);
        return `
            <div class="favorite-item">
                <div class="favorite-item-content" onclick="showStationModal(${JSON.stringify(station)})">
                    <div class="favorite-item-header">
                        <div class="favorite-item-name">
                            <i class="fas fa-charging-station ${station.status === 'Hoạt động' ? 'status-active' : 'status-maintenance'}"></i>
                            ${station.name}
                        </div>
                        <div class="favorite-item-status ${station.status === 'Hoạt động' ? 'status-active' : 'status-maintenance'}">
                            ${station.status}
                        </div>
                    </div>
                    <div class="favorite-item-address">${station.address}</div>
                    <div class="favorite-item-info">
                        <span><i class="fas fa-plug"></i> ${station.ports || 'Chưa có thông tin'}</span>
                        <span><i class="fas fa-clock"></i> ${station.hours || '24/7'}</span>
                    </div>
                </div>
                <button class="favorite-remove" onclick="removeFavorite('${key}', event)" title="Bỏ yêu thích">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }).join('');

    // Hiển thị modal
    document.getElementById('favoritesModal').classList.add('active');
    document.getElementById('modalOverlay').classList.add('active');
}

function showStationModal(station) {
    selectedStation = station;
    const key = stationKey(station);
    
    // Cập nhật nội dung modal
    document.getElementById('modalStationName').textContent = station.name;
    
    const statusEl = document.getElementById('modalStationStatus');
    statusEl.className = `station-modal-status ${station.status === 'Hoạt động' ? 'status-active' : 'status-maintenance'}`;
    statusEl.innerHTML = `
        <i class="fas ${station.status === 'Hoạt động' ? 'fa-check-circle' : 'fa-tools'}"></i>
        ${station.status}
    `;

    document.getElementById('modalStationInfo').innerHTML = `
        <div class="modal-info-item">
            <i class="fas fa-map-marker-alt"></i>
            <div class="modal-info-content">
                <div class="modal-info-label">Địa chỉ</div>
                <div class="modal-info-value">${station.address}</div>
            </div>
        </div>
        <div class="modal-info-item">
            <i class="fas fa-charging-station"></i>
            <div class="modal-info-content">
                <div class="modal-info-label">Cổng sạc</div>
                <div class="modal-info-value">${station.ports}</div>
            </div>
        </div>
        <div class="modal-info-item">
            <i class="fas fa-clock"></i>
            <div class="modal-info-content">
                <div class="modal-info-label">Thời gian hoạt động</div>
                <div class="modal-info-value">${station.hours}</div>
            </div>
        </div>
        <div class="modal-info-item">
            <i class="fas fa-parking"></i>
            <div class="modal-info-content">
                <div class="modal-info-label">Gửi xe</div>
                <div class="modal-info-value">${station.parking}</div>
            </div>
        </div>
        <div class="modal-info-item">
            <i class="fas fa-info-circle"></i>
            <div class="modal-info-content">
                <div class="modal-info-label">Loại</div>
                <div class="modal-info-value">${station.type}</div>
            </div>
        </div>
        <div class="modal-info-item">
            <i class="fas fa-sync"></i>
            <div class="modal-info-content">
                <div class="modal-info-label">Cập nhật lần cuối</div>
                <div class="modal-info-value">${station.updated}</div>
            </div>
        </div>
    `;

    // Cập nhật nút yêu thích
    const favoriteBtn = document.getElementById('favoriteBtn');
    const isFav = isFavorite(key);
    favoriteBtn.innerHTML = `
        <i class="fas ${isFav ? 'fa-star' : 'fa-star-half-alt'}"></i>
        ${isFav ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
    `;
    // Toggle màu nút theo trạng thái yêu thích
    if (isFav) {
        favoriteBtn.classList.remove('btn-secondary');
        favoriteBtn.classList.add('btn-success');
    } else {
        favoriteBtn.classList.remove('btn-success');
        favoriteBtn.classList.add('btn-secondary');
    }

    // Hiển thị modal
    document.getElementById('modalOverlay').classList.add('active');
    document.getElementById('stationModal').classList.add('active');
}

function closeStationModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    document.getElementById('stationModal').classList.remove('active');
    selectedStation = null;
}

function closeFavoritesModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    document.getElementById('favoritesModal').classList.remove('active');
}

function zoomToStation(key) {
    const marker = markerByKey[key];
    if (marker) {
        map.setView([marker.__station.lat, marker.__station.lng], 16);
        showStationModal(marker.__station);
    }
}

// Utility functions
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function findDirections(lat, lng) {
    if (!userLocation) {
        showError('Vui lòng định vị trước khi tìm đường');
        return;
    }
    
    const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${lat},${lng}`;
    window.open(url, '_blank');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function showError(message) {
    showNotification(`❌ ${message}`, 'error');
    
    // Cập nhật trạng thái các nút
    document.querySelector('.map-controls button').disabled = false;
}

// Filter functions
function toggleFilter() {
    const filterModal = document.getElementById('filterModal');
    const modalOverlay = document.getElementById('modalOverlay');
    filterModal.classList.add('active');
    modalOverlay.classList.add('active');
    modalOverlay.onclick = closeFilterModal;
}

function closeFilterModal() {
    const filterModal = document.getElementById('filterModal');
    const modalOverlay = document.getElementById('modalOverlay');
    filterModal.classList.remove('active');
    modalOverlay.classList.remove('active');
    modalOverlay.onclick = closeStationModal;
}

function applyFilter() {
    filterStations();
    closeFilterModal();
}

function resetFilter() {
    document.getElementById('modalPowerSelect').value = '';
    document.getElementById('modalProvinceSelect').value = '';
    document.getElementById('modalDistrictSelect').value = '';
    filterStations();
    closeFilterModal();
}

function showAllStations() {
    filterStations();
    toggleMenu();
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initMap();
    // Tự động định vị khi tải trang
    setTimeout(() => {
        getCurrentLocation();
    }, 1000);
    console.log('V-Electric - Map initialized and ready');
});
