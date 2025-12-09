// Free Fire Glory Panel - Main Script
class GloryPanel {
    constructor() {
        this.accounts = JSON.parse(localStorage.getItem('glory_accounts') || '[]');
        this.clans = JSON.parse(localStorage.getItem('glory_clans') || '[]');
        this.currentView = 'dashboard';
        this.init();
    }
    
    init() {
        this.checkAuth();
        this.loadStats();
        this.setupEventListeners();
        this.setupWebSocket();
    }
    
    checkAuth() {
        if(!localStorage.getItem('glory_logged_in') && window.location.pathname.includes('dashboard')) {
            window.location.href = 'index.html';
        }
    }
    
    loadStats() {
        // Update account count
        document.getElementById('totalAccounts')?.textContent = this.accounts.length;
        
        // Calculate total glory
        let totalGlory = 0;
        let todayGlory = 0;
        let activeBots = 0;
        
        this.accounts.forEach(account => {
            totalGlory += account.glory || 0;
            if(account.status === 'active') activeBots++;
            
            // Calculate today's glory (simulated)
            if(account.lastActive) {
                const lastActive = new Date(account.lastActive);
                const today = new Date();
                if(lastActive.toDateString() === today.toDateString()) {
                    todayGlory += account.todayGlory || 0;
                }
            }
        });
        
        // Update UI
        document.getElementById('totalGlory')?.textContent = totalGlory.toLocaleString();
        document.getElementById('todayGlory')?.textContent = todayGlory.toLocaleString();
        document.getElementById('activeBots')?.textContent = activeBots;
        
        // Update progress
        const progressBar = document.getElementById('gloryProgress');
        if(progressBar) {
            const percent = Math.min(100, (totalGlory / 100000) * 100);
            progressBar.style.width = `${percent}%`;
        }
    }
    
    setupEventListeners() {
        // Add account form
        document.getElementById('addAccountForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addAccount();
        });
        
        // Clan invite form
        document.getElementById('inviteForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendClanInvites();
        });
        
        // Refresh button
        document.getElementById('refreshBtn')?.addEventListener('click', () => {
            this.refreshData();
        });
        
        // Logout button
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            this.logout();
        });
    }
    
    setupWebSocket() {
        // Simulate WebSocket connection
        setInterval(() => {
            this.simulateRealTimeUpdates();
        }, 5000);
    }
    
    addAccount() {
        const uid = document.getElementById('accountUID').value;
        const token = document.getElementById('accountToken').value;
        const clanId = document.getElementById('accountClan').value;
        
        if(!uid || !token) {
            this.showNotification('⚠️ يرجى ملء جميع الحقول المطلوبة', 'warning');
            return;
        }
        
        const newAccount = {
            id: Date.now(),
            uid: uid,
            token: token,
            clanId: clanId || null,
            glory: 0,
            status: 'inactive',
            created: new Date().toISOString(),
            lastActive: null
        };
        
        this.accounts.push(newAccount);
        this.saveData();
        this.loadStats();
        this.renderAccounts();
        
        document.getElementById('addAccountForm').reset();
        this.showNotification('✅ تم إضافة الحساب بنجاح!', 'success');
    }
    
    sendClanInvites() {
        const clanId = document.getElementById('clanID').value;
        const count = parseInt(document.getElementById('inviteCount').value) || 10;
        
        if(!clanId) {
            this.showNotification('⚠️ يرجى إدخال Clan ID', 'warning');
            return;
        }
        
        // Simulate sending invites
        this.showNotification(`📨 جاري إرسال ${count} دعوة إلى الكلان ${clanId}...`, 'info');
        
        setTimeout(() => {
            this.showNotification(`✅ تم إرسال ${count} دعوة بنجاح`, 'success');
        }, 2000);
    }
    
    startAccount(accountId) {
        const account = this.accounts.find(a => a.id === accountId);
        if(!account) return;
        
        account.status = 'active';
        account.lastActive = new Date().toISOString();
        
        // Start farming simulation
        this.startFarmingSimulation(accountId);
        
        this.saveData();
        this.renderAccounts();
        this.showNotification(`🚀 بدأ جمع القلوري للحساب ${account.uid}`, 'success');
    }
    
    stopAccount(accountId) {
        const account = this.accounts.find(a => a.id === accountId);
        if(!account) return;
        
        account.status = 'inactive';
        this.saveData();
        this.renderAccounts();
        this.showNotification(`⏹️ توقف جمع القلوري للحساب ${account.uid}`, 'warning');
    }
    
    startFarmingSimulation(accountId) {
        // Simulate glory farming
        setInterval(() => {
            const account = this.accounts.find(a => a.id === accountId);
            if(account && account.status === 'active') {
                const gloryEarned = Math.floor(Math.random() * 20) + 5;
                account.glory += gloryEarned;
                account.todayGlory = (account.todayGlory || 0) + gloryEarned;
                account.lastActive = new Date().toISOString();
                
                this.saveData();
                this.loadStats();
                
                // Update specific account in UI
                const accountElement = document.querySelector(`[data-account-id="${accountId}"] .account-glory`);
                if(accountElement) {
                    accountElement.textContent = account.glory.toLocaleString();
                }
            }
        }, 30000); // Every 30 seconds
    }
    
    renderAccounts() {
        const container = document.getElementById('accountsList');
        if(!container) return;
        
        let html = '';
        
        this.accounts.forEach(account => {
            html += `
                <div class="account-item" data-account-id="${account.id}">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-1">${account.uid}</h6>
                            <small class="text-muted">
                                ${account.clanId ? `Clan: ${account.clanId}` : 'لا يوجد كلان'}
                            </small>
                        </div>
                        <div class="text-end">
                            <span class="badge bg-success account-glory">${account.glory.toLocaleString()}</span>
                            <div class="mt-2">
                                <span class="badge ${account.status === 'active' ? 'bg-success' : 'bg-secondary'}">
                                    ${account.status === 'active' ? 'نشط' : 'متوقف'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="mt-3">
                        <button class="btn btn-sm btn-success me-2" onclick="panel.startAccount(${account.id})">
                            <i class="fas fa-play"></i> تشغيل
                        </button>
                        <button class="btn btn-sm btn-danger me-2" onclick="panel.stopAccount(${account.id})">
                            <i class="fas fa-stop"></i> إيقاف
                        </button>
                        <button class="btn btn-sm btn-info" onclick="panel.showAccountDetails(${account.id})">
                            <i class="fas fa-chart-line"></i> تفاصيل
                        </button>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html || '<p class="text-center text-muted">لا توجد حسابات</p>';
    }
    
    showAccountDetails(accountId) {
        const account = this.accounts.find(a => a.id === accountId);
        if(!account) return;
        
        const detailsHtml = `
            <div class="modal fade" id="accountModal">
                <div class="modal-dialog">
                    <div class="modal-content glass-card">
                        <div class="modal-header">
                            <h5 class="modal-title">تفاصيل الحساب</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p><strong>UID:</strong> ${account.uid}</p>
                            <p><strong>الحالة:</strong> ${account.status === 'active' ? 'نشط' : 'متوقف'}</p>
                            <p><strong>القلوري الإجمالي:</strong> ${account.glory.toLocaleString()}</p>
                            <p><strong>Clan ID:</strong> ${account.clanId || 'لا يوجد'}</p>
                            <p><strong>تاريخ الإضافة:</strong> ${new Date(account.created).toLocaleDateString('ar-SA')}</p>
                            <p><strong>آخر نشاط:</strong> ${account.lastActive ? new Date(account.lastActive).toLocaleString('ar-SA') : 'لا يوجد'}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', detailsHtml);
        const modal = new bootstrap.Modal(document.getElementById('accountModal'));
        modal.show();
        
        modal._element.addEventListener('hidden.bs.modal', () => {
            modal._element.remove();
        });
    }
    
    simulateRealTimeUpdates() {
        // Simulate random account updates
        if(this.accounts.length > 0 && Math.random() > 0.7) {
            const randomAccount = this.accounts[Math.floor(Math.random() * this.accounts.length)];
            if(randomAccount.status === 'active') {
                const gloryEarned = Math.floor(Math.random() * 15) + 5;
                randomAccount.glory += gloryEarned;
                this.saveData();
                this.loadStats();
            }
        }
    }
    
    saveData() {
        localStorage.setItem('glory_accounts', JSON.stringify(this.accounts));
        localStorage.setItem('glory_clans', JSON.stringify(this.clans));
    }
    
    refreshData() {
        this.loadStats();
        this.renderAccounts();
        this.showNotification('🔄 تم تحديث البيانات', 'info');
    }
    
    logout() {
        localStorage.removeItem('glory_logged_in');
        window.location.href = 'index.html';
    }
    
    showNotification(message, type = 'info') {
        const types = {
            success: 'linear-gradient(45deg, #28a745, #20c997)',
            error: 'linear-gradient(45deg, #dc3545, #fd7e14)',
            warning: 'linear-gradient(45deg, #ffc107, #ff922b)',
            info: 'linear-gradient(45deg, #17a2b8, #0dcaf0)'
        };
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.style.background = types[type] || types.info;
        notification.innerHTML = `
            <div class="d-flex align-items-center">
                <span>${message}</span>
                <button class="btn btn-sm btn-link ms-auto text-white" 
                        onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if(notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
}

// Initialize panel
document.addEventListener('DOMContentLoaded', () => {
    window.panel = new GloryPanel();
    
    // Auto-refresh every minute
    setInterval(() => {
        if(window.panel) {
            window.panel.refreshData();
        }
    }, 60000);
});
