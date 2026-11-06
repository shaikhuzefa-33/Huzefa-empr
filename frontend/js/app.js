/**
 * Employee Payroll Management System (EPMS) - Core Client Script
 */

const EPMS = {
  currentUser: null,
  employeeProfile: null,

  async init() {
    await this.fetchCurrentUser();
    this.renderHeaderAndSidebar();
    this.setupEventListeners();
  },

  async fetchCurrentUser() {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success) {
        this.currentUser = data.user;
        this.employeeProfile = data.employeeProfile;
      }
    } catch (err) {
      console.error('Failed to load user session', err);
    }
  },

  renderHeaderAndSidebar() {
    const role = this.currentUser ? this.currentUser.role : 'admin';
    const fullName = this.currentUser ? this.currentUser.fullName : 'Administrator';
    const profilePic = (this.employeeProfile && this.employeeProfile.profile_picture)
      ? this.employeeProfile.profile_picture
      : '/assets/aistudio/WhatsApp_Image_2026-08-10_at_11.59.10__2__21d628fb.jpeg';

    // Inject Mobile Menu Toggle if not present
    const topbarLeft = document.querySelector('.topbar-left');
    if (topbarLeft && !document.getElementById('mobile-menu-toggle')) {
      const toggleBtn = document.createElement('button');
      toggleBtn.id = 'mobile-menu-toggle';
      toggleBtn.className = 'btn btn-outline btn-sm mobile-only';
      toggleBtn.style.marginRight = '8px';
      toggleBtn.innerHTML = `
        <svg style="width:20px; height:20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
      `;
      toggleBtn.onclick = () => this.toggleMobileSidebar();
      topbarLeft.prepend(toggleBtn);
    }

    // Update Topbar Elements
    const userRoleBadge = document.getElementById('user-role-badge');
    if (userRoleBadge) {
      userRoleBadge.innerHTML = `
        <span style="font-size:0.75rem; text-transform:uppercase; color:#2563eb; font-weight:700;">Role:</span>
        <select id="role-select" onchange="EPMS.switchRole(this.value)" aria-label="Select active user role">
          <option value="admin" ${role === 'admin' ? 'selected' : ''}>Admin</option>
          <option value="hr" ${role === 'hr' ? 'selected' : ''}>HR Manager</option>
          <option value="employee" ${role === 'employee' ? 'selected' : ''}>Employee</option>
        </select>
      `;
    }

    const userProfileEl = document.getElementById('user-profile-widget');
    if (userProfileEl) {
      userProfileEl.innerHTML = `
        <img src="${profilePic}" alt="User Avatar" class="user-avatar" onerror="this.src='/assets/aistudio/WhatsApp_Image_2026-08-10_at_11.59.10__2__21d628fb.jpeg'" />
        <div class="user-info">
          <div class="user-name">${fullName}</div>
          <div class="user-role-label">${role.toUpperCase()}</div>
        </div>
      `;
    }

    // Role-based navigation items
    const navContainer = document.getElementById('sidebar-nav-container');
    if (navContainer) {
      const currentPath = window.location.pathname.split('/').pop() || 'dashboard.html';

      let navHtml = `
        <div class="nav-section-title">Overview</div>
        <a href="dashboard.html" class="nav-item ${currentPath === 'dashboard.html' || currentPath === '' || currentPath === 'index.html' ? 'active' : ''}">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
          Dashboard
        </a>
      `;

      if (role === 'admin' || role === 'hr') {
        navHtml += `
          <div class="nav-section-title">Organization</div>
          <a href="employees.html" class="nav-item ${currentPath === 'employees.html' ? 'active' : ''}">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            Employees
          </a>
          <a href="departments.html" class="nav-item ${currentPath === 'departments.html' ? 'active' : ''}">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
            Departments
          </a>
        `;
      }

      navHtml += `
        <div class="nav-section-title">Time & Attendance</div>
        <a href="attendance.html" class="nav-item ${currentPath === 'attendance.html' ? 'active' : ''}">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          Attendance
        </a>
        <a href="leaves.html" class="nav-item ${currentPath === 'leaves.html' ? 'active' : ''}">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          Leave Management
        </a>
      `;

      if (role === 'admin' || role === 'hr') {
        navHtml += `
          <div class="nav-section-title">Payroll Engine</div>
          <a href="salary.html" class="nav-item ${currentPath === 'salary.html' ? 'active' : ''}">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
            Salary Structures
          </a>
          <a href="payroll.html" class="nav-item ${currentPath === 'payroll.html' ? 'active' : ''}">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            Payroll Processing
          </a>
          <a href="payments.html" class="nav-item ${currentPath === 'payments.html' ? 'active' : ''}">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
            Disbursements
          </a>
        `;
      }

      navHtml += `
        <div class="nav-section-title">Documents & Reports</div>
        <a href="payslips.html" class="nav-item ${currentPath === 'payslips.html' ? 'active' : ''}">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          ${role === 'employee' ? 'My Payslips' : 'All Payslips'}
        </a>
      `;

      if (role === 'admin' || role === 'hr') {
        navHtml += `
          <a href="reports.html" class="nav-item ${currentPath === 'reports.html' ? 'active' : ''}">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            Reports & Analytics
          </a>
        `;
      }

      navHtml += `
        <a href="settings.html" class="nav-item ${currentPath === 'settings.html' ? 'active' : ''}">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          Settings & Info
        </a>
      `;

      navContainer.innerHTML = navHtml;
    }
  },

  toggleMobileSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.classList.toggle('open');
    }
  },

  async switchRole(role) {
    try {
      const res = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (data.success) {
        this.showToast(`Switched active session to ${role.toUpperCase()}`, 'success');
        setTimeout(() => {
          window.location.reload();
        }, 400);
      }
    } catch (err) {
      this.showToast('Failed to switch role', 'error');
    }
  },

  async logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = 'login.html';
    } catch (err) {
      window.location.href = 'login.html';
    }
  },

  showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  formatINR(num) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(Number(num) || 0);
  },

  openModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.add('open');
  },

  closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove('open');
  },

  setupEventListeners() {
    // Close modal when clicking outside dialog
    document.querySelectorAll('.modal-overlay').forEach((overlay) => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('open');
        }
      });
    });
  },
};

document.addEventListener('DOMContentLoaded', () => {
  EPMS.init();
});
