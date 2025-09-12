<!-- Map Styles -->
<style>
    /* Map Section */
    #map {
        height: 100% !important;
        width: 100% !important;
        z-index: 1;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
    }

    /* Ẩn nút zoom của Leaflet */
    .leaflet-control-zoom {
        display: none !important;
    }

    /* Ẩn popup mặc định của Leaflet */
    .leaflet-popup {
        display: none !important;
    }

    /* Favorites Modal Styles */
.favorite-item {
    padding: 16px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: flex-start;
    gap: 12px;
    transition: all 0.3s ease;
    overflow: hidden;
}

.favorite-item-content {
    flex: 1;
    cursor: pointer;
    min-width: 0;
}

.favorite-remove {
    background: none;
    border: none;
    width: 24px;
    height: 24px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    cursor: pointer;
    border-radius: 50%;
    transition: all 0.2s ease;
    flex-shrink: 0;
    opacity: 0;
    transform: scale(0.8);
}

.favorite-item:hover .favorite-remove {
    opacity: 1;
    transform: scale(1);
}

.favorite-remove:hover {
    background: #fee2e2;
    color: #dc2626;
}

.favorite-item:last-child {
    border-bottom: none;
}

.favorite-item:hover {
    background: var(--background-light);
}

.favorite-item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.favorite-item-name {
    font-weight: 600;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 8px;
}

.favorite-item-name i {
    font-size: 16px;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    background: var(--background-light);
}

.favorite-item-name i.status-active {
    color: #28a745;
}

.favorite-item-name i.status-maintenance {
    color: #dc3545;
}

.favorite-item-status {
    font-size: 13px;
    padding: 4px 8px;
    border-radius: 4px;
    font-weight: 500;
}

.favorite-item-status.status-active {
    background: rgba(40, 167, 69, 0.1);
    color: #28a745;
}

.favorite-item-status.status-maintenance {
    background: rgba(220, 53, 69, 0.1);
    color: #dc3545;
}

.favorite-item-address {
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 8px;
}

.favorite-item-info {
    display: flex;
    gap: 16px;
    font-size: 13px;
    color: var(--text-secondary);
}

.favorite-item-info span {
    display: flex;
    align-items: center;
    gap: 6px;
}

.favorite-item-info i {
    color: var(--accent-color);
    font-size: 14px;
}

/* Station Modal Styles */
    .station-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.9);
        width: 90%;
        max-width: 400px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 4px 24px rgba(0,0,0,0.2);
        z-index: 9999;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
    }

    #filterModal {
        max-width: 320px;
    }

    .station-modal.active {
        opacity: 1;
        visibility: visible;
        transform: translate(-50%, -50%) scale(1);
    }

    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        backdrop-filter: blur(4px);
        z-index: 9998;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
    }

    .modal-overlay.active {
        opacity: 1;
        visibility: visible;
    }

    .station-modal-header {
        padding: 16px;
        border-bottom: 1px solid var(--border-color);
        position: relative;
    }

    #filterModal .station-modal-header {
        padding: 12px 16px;
    }

    .station-modal-close {
        position: absolute;
        top: 20px;
        right: 20px;
        width: 32px;
        height: 32px;
        border: none;
        background: none;
        font-size: 20px;
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.2s ease;
    }

    .station-modal-close:hover {
        background: var(--background-light);
        color: var(--text-primary);
    }

    .station-modal-title {
        font-size: 20px;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 32px 8px 0;
    }

    .station-modal-status {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
    }

    .station-modal-content {
        padding: 20px;
        max-height: calc(80vh - 180px);
        overflow-y: auto;
    }

    #filterModal .station-modal-content {
        padding: 16px;
        max-height: calc(70vh - 140px);
    }

    .station-modal-info {
        display: grid;
        gap: 16px;
    }

    .modal-info-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
    }

    .modal-info-item i {
        width: 24px;
        height: 24px;
        background: var(--background-light);
        color: var(--accent-color);
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .modal-info-content {
        flex: 1;
    }

    .modal-info-label {
        font-size: 13px;
        color: var(--text-secondary);
        margin-bottom: 4px;
    }

    .modal-info-value {
        font-size: 15px;
        color: var(--text-primary);
        line-height: 1.5;
    }

    /* Filter Modal Styles */
    .modal-filter-group {
        margin-bottom: 16px;
    }

    .modal-filter-group:last-child {
        margin-bottom: 0;
    }

    .modal-filter-group label {
        display: block;
        font-size: 13px;
        color: var(--text-secondary);
        margin-bottom: 6px;
    }

    .modal-select {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid var(--border-color);
        border-radius: 6px;
        font-size: 14px;
        color: var(--text-primary);
        background: white;
        cursor: pointer;
        transition: all 0.3s ease;
        height: 36px;
    }

    /* Tùy chỉnh dropdown của select */
    .modal-select option {
        padding: 8px;
        font-size: 14px;
    }

    /* Giới hạn chiều cao của dropdown */
    #filterModal select {
        max-height: 36px;
    }

    #filterModal select[size]:not([size="1"]) {
        height: auto;
        max-height: 200px;
    }

    /* Tùy chỉnh scrollbar cho dropdown */
    #filterModal select::-webkit-scrollbar {
        width: 8px;
    }

    #filterModal select::-webkit-scrollbar-track {
        background: var(--background-light);
        border-radius: 4px;
    }

    #filterModal select::-webkit-scrollbar-thumb {
        background: var(--border-color);
        border-radius: 4px;
    }

    #filterModal select::-webkit-scrollbar-thumb:hover {
        background: var(--text-secondary);
    }

    .modal-select:hover {
        border-color: var(--accent-color);
    }

    .modal-select:focus {
        outline: none;
        border-color: var(--accent-color);
        box-shadow: 0 0 0 3px rgba(255,107,53,0.1);
    }

    .station-modal-actions {
        padding: 20px;
        border-top: 1px solid var(--border-color);
        display: flex;
        gap: 12px;
    }

    .station-modal-actions button {
        flex: 1;
        padding: 12px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.2s ease;
    }

    .btn-primary {
        background: #28a745;
        color: white;
    }

    .btn-primary:hover {
        background: #218838;
    }

    .btn-secondary {
        background: var(--background-light);
        color: var(--text-primary);
    }

    .btn-secondary:hover {
        background: #e9ecef;
    }
    
    .map-section {
        flex: 1;
        position: relative;
        background: var(--background-light);
        height: 100vh;
        margin-top: 60px;
        pointer-events: auto;
    }

    .map-container {
        position: relative;
        height: 100%;
        width: 100%;
        overflow: hidden;
    }

    /* Map Controls */
    .map-controls {
        position: fixed;
        right: 20px;
        bottom: 70px; /* Đẩy lên cao hơn để tránh bottom sheet */
        display: flex;
        flex-direction: column;
        gap: 12px;
        z-index: 900;
    }

    .map-control-button {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: white;
        border: none;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-primary);
        transition: all 0.3s ease;
    }

    .map-control-button i {
        font-size: 20px;
    }

    .map-control-button:hover {
        background: var(--background-light);
        transform: scale(1.1);
    }

    .map-control-button.active {
        background: var(--accent-color);
        color: white;
    }

    /* Custom marker styles */
    .custom-marker {
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        border: 2px solid #fff;
        transition: all 0.3s ease;
        width: 30px !important;
        height: 30px !important;
    }

    .custom-marker i {
        font-size: 16px;
        color: white;
    }

    .active-station {
        background: #28a745;
    }

    .active-station:hover {
        background: #218838;
        transform: scale(1.1);
    }

    .maintenance-station {
        background: #dc3545;
    }

    .maintenance-station:hover {
        background: #c82333;
        transform: scale(1.1);
    }

    /* Marker Cluster Styles */
    .marker-cluster {
        background: rgba(40, 167, 69, 0.4);
        border: 3px solid rgba(40, 167, 69, 0.3);
        border-radius: 50%;
        color: white;
        text-align: center;
        font-weight: bold;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px !important;
        height: 40px !important;
    }

    .cluster-marker {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        color: white;
        padding-bottom: 2px; /* Điều chỉnh vị trí số cho cân bằng hơn */
    }

    /* Station Popup Styles */
    .station-popup {
        padding: 10px;
        min-width: 300px;
    }

    .station-popup h3 {
        margin: 0 0 8px 0;
        font-size: 16px;
        color: var(--text-primary);
        border-bottom: 2px solid var(--accent-color);
        padding-bottom: 8px;
    }

    .station-popup p {
        margin: 0 0 12px 0;
        font-size: 14px;
        color: var(--text-secondary);
        line-height: 1.4;
    }

    .station-popup strong {
        color: var(--text-primary);
        display: block;
        margin-bottom: 4px;
    }

    .station-popup strong i {
        width: 20px;
        color: var(--accent-color);
    }

    .station-popup .btn {
        margin: 12px 0 0 0;
        width: 100%;
        justify-content: center;
    }

    .station-status {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 12px;
    }

    .status-active {
        background: #d4edda;
        color: #155724;
    }

    .status-maintenance {
        background: #fff3cd;
        color: #856404;
    }

    .station-updated {
        font-size: 12px !important;
        color: #6c757d !important;
        margin-top: 12px !important;
        padding-top: 8px;
        border-top: 1px solid var(--border-color);
    }

    .station-updated i {
        margin-right: 4px;
    }

    /* User Location Marker Styles */
    .user-location-marker {
        width: 20px;
        height: 20px;
        background: #4285f4;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 0 2px #4285f4;
        position: relative;
        animation: pulse 2s infinite;
    }

    .user-location-marker::after {
        content: '\f007';  /* Unicode cho icon người của Font Awesome */
        font-family: 'Font Awesome 5 Free';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-size: 10px;
    }

    .location-tooltip {
        position: absolute;
        bottom: calc(100% + 8px);
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        white-space: nowrap;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    .user-location-marker:hover .location-tooltip {
        opacity: 1;
    }

    @keyframes pulse {
        0% {
            box-shadow: 0 0 0 0 rgba(66, 133, 244, 0.4);
        }
        70% {
            box-shadow: 0 0 0 10px rgba(66, 133, 244, 0);
        }
        100% {
            box-shadow: 0 0 0 0 rgba(66, 133, 244, 0);
        }
    }
</style>

<!-- Map Section -->
<section class="map-section">
    <div class="map-container">
        <div id="map"></div>
    </div>
    
    <!-- Map Controls -->
    <div class="map-controls">
        <button class="map-control-button" onclick="getCurrentLocation()" title="Định vị của tôi">
            <i class="fas fa-location-arrow"></i>
        </button>
        <button class="map-control-button" onclick="findNearestStation()" id="nearestBtn" title="Tìm trạm gần nhất">
            <i class="fas fa-route"></i>
        </button>
    </div>

    <!-- Modal Overlay -->
    <div class="modal-overlay" id="modalOverlay" onclick="closeStationModal()"></div>

<!-- Favorites Modal -->
<div class="station-modal" id="favoritesModal">
    <div class="station-modal-header">
        <h3 class="station-modal-title">Trạm yêu thích</h3>
        <button class="station-modal-close" onclick="closeFavoritesModal()">
            <i class="fas fa-times"></i>
        </button>
    </div>
    <div class="station-modal-content">
        <div id="favoritesList"></div>
    </div>
</div>

<!-- Filter Modal -->
<div class="station-modal" id="filterModal">
        <div class="station-modal-header">
            <h3 class="station-modal-title">Lọc trạm sạc</h3>
            <button class="station-modal-close" onclick="closeFilterModal()">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="station-modal-content">
            <div class="modal-filter-group">
                <label for="powerSelect">Công suất:</label>
                <select id="modalPowerSelect" class="modal-select">
                    <option value="">-- Tất cả công suất --</option>
                </select>
            </div>
            <div class="modal-filter-group">
                <label for="provinceSelect">Tỉnh/Thành phố:</label>
                <select id="modalProvinceSelect" class="modal-select">
                    <option value="">-- Chọn tỉnh/thành phố --</option>
                </select>
            </div>
            <div class="modal-filter-group">
                <label for="districtSelect">Quận/Huyện:</label>
                <select id="modalDistrictSelect" class="modal-select">
                    <option value="">-- Chọn quận/huyện --</option>
                </select>
            </div>
        </div>
        <div class="station-modal-actions">
            <button class="btn-primary" onclick="applyFilter()">
                <i class="fas fa-check"></i> Áp dụng
            </button>
            <button class="btn-secondary" onclick="resetFilter()">
                <i class="fas fa-undo"></i> Đặt lại
            </button>
        </div>
    </div>

    <!-- Station Modal -->
    <div class="station-modal" id="stationModal">
        <div class="station-modal-header">
            <h3 class="station-modal-title" id="modalStationName"></h3>
            <div class="station-modal-status" id="modalStationStatus"></div>
            <button class="station-modal-close" onclick="closeStationModal()">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="station-modal-content">
            <div class="station-modal-info" id="modalStationInfo"></div>
        </div>
        <div class="station-modal-actions">
            <button class="btn-primary" onclick="findDirections(selectedStation.lat, selectedStation.lng)">
                <i class="fas fa-directions"></i> Chỉ đường
            </button>
            <button class="btn-secondary" id="favoriteBtn" onclick="toggleFavorite(stationKey(selectedStation))">
                <i class="fas fa-star"></i> Yêu thích
            </button>
        </div>
    </div>
</section>
