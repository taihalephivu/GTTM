<!-- Bottom Sheet Styles -->
<style>
    .bottom-sheet {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: white;
        border-radius: 20px 20px 0 0;
        box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
        z-index: 900;
        transition: transform 0.3s ease;
        transform: translateY(100%);
    }

    .bottom-sheet.active {
        transform: translateY(calc(100% - 60px));
    }

    .bottom-sheet.expanded {
        transform: translateY(0);
    }

    .bottom-sheet-header {
        padding: 16px 20px;
        border-bottom: 1px solid var(--border-color);
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
    }

    .bottom-sheet-title {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .bottom-sheet-title h3 {
        margin: 0;
        font-size: 16px;
        color: var(--text-primary);
    }

    .station-count {
        font-size: 13px;
        color: var(--text-secondary);
    }

    .bottom-sheet-content {
        height: calc(100vh - 200px);
        overflow-y: auto;
        padding: 20px;
    }

    .station-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .station-item {
        background: white;
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 15px;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .station-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }

    .station-item-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 10px;
    }

    .station-name {
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 4px;
    }

    .station-address {
        font-size: 13px;
        color: var(--text-secondary);
    }

    .station-distance {
        font-size: 13px;
        color: var(--accent-color);
        font-weight: 500;
    }

    .station-tags {
        display: flex;
        gap: 8px;
        margin-top: 10px;
    }

    .station-tag {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
    }

    .tag-24h {
        background: #e3f2fd;
        color: #1976d2;
    }

    .tag-public {
        background: #e8f5e9;
        color: #2e7d32;
    }

    .tag-verified {
        background: #f3e5f5;
        color: #7b1fa2;
    }

    .pagination {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 20px;
        padding: 10px 0;
        border-top: 1px solid var(--border-color);
    }

    .pagination button {
        padding: 8px 16px;
        border: 1px solid var(--border-color);
        border-radius: 6px;
        background: white;
        cursor: pointer;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.3s ease;
    }

    .pagination button:hover:not(:disabled) {
        background: var(--background-light);
    }

    .pagination button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>

<!-- Bottom Sheet -->
<div class="bottom-sheet active" id="bottomSheet">
    <div class="bottom-sheet-header" onclick="toggleBottomSheet()">
        <div class="bottom-sheet-title">
            <h3>Trạm sạc gần đây</h3>
            <span class="station-count" id="nearbyCount">0 trạm sạc được tìm thấy</span>
        </div>
        <i class="fas fa-chevron-up" id="bottomSheetIcon"></i>
    </div>
    <div class="bottom-sheet-content">
        <div class="station-list" id="stationList">
            <!-- Station items will be added here dynamically -->
        </div>
        <div class="pagination">
            <button onclick="changePage('prev')" id="prevPage">
                <i class="fas fa-chevron-left"></i> Trước
            </button>
            <span id="pageInfo">Trang 1/1</span>
            <button onclick="changePage('next')" id="nextPage">
                Sau <i class="fas fa-chevron-right"></i>
            </button>
        </div>
    </div>
</div>
