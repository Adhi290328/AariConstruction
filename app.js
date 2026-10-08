/**
 * AARI CONSTRUCTION — Application Controller
 * Login-gated, role-based SPA with admin customer management
 */
import { APP_CONFIG, INITIAL_DATA } from './data.js';

class App {
  constructor() {
    this.data = this._load();
    this.role = null;        // 'admin' | 'customer'
    this.customerUnit = null; // the unit object when customer logs in
    this.selectedProject = 'proj-1';
    this.selectedUnit = null;
    this.activeTab = 'timeline';
    this.filter = 'all';
    this._bind();
  }

  /* =================================================================
     PERSISTENCE
     ================================================================= */
  _load() {
    try {
      const s = localStorage.getItem('aari_data');
      if (s) return JSON.parse(s);
    } catch (_) {}
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }

  _save() {
    localStorage.setItem('aari_data', JSON.stringify(this.data));
  }

  /* =================================================================
     HELPERS
     ================================================================= */
  _el(id) { return document.getElementById(id); }

  _allUnits() {
    const out = [];
    this.data.projects.forEach(p => {
      (p.blocks || []).forEach(b => {
        (b.units || []).forEach(u => {
          out.push({ ...u, projectName: p.name, projectId: p.id, blockName: b.name });
        });
      });
    });
    return out;
  }

  _findUnit(id) {
    return this._allUnits().find(u => u.id === id) || null;
  }

  _unitRef(id) {
    for (const p of this.data.projects) {
      for (const b of (p.blocks || [])) {
        for (const u of (b.units || [])) {
          if (u.id === id) return u;
        }
      }
    }
    return null;
  }

  _progress(unit) {
    if (!unit.stages || unit.stages.length === 0) return 0;
    const completed = unit.stages.filter(s => s.status === 'completed').length;
    const total = unit.stages.length;
    return Math.round((completed / total) * 100);
  }

  _expectedDate(unit) {
    if (!unit.stages || unit.stages.length === 0) return 'TBD';
    const last = unit.stages[unit.stages.length - 1];
    return last.date || 'TBD';
  }

  _pkgBadge(pkg) {
    if (pkg === 'Bare-Bones') return 'badge-bare';
    if (pkg === 'Semi-Finished') return 'badge-semi';
    return 'badge-full';
  }

  _statusBadge(s) {
    if (s === 'Approved') return 'badge-approved';
    if (s === 'Rejected') return 'badge-rejected';
    return 'badge-pending';
  }

  toast(msg, type = 'info') {
    const c = this._el('toastContainer');
    if (!c) return;
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
    c.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = '.3s'; setTimeout(() => t.remove(), 300); }, 3000);
  }

  /* =================================================================
     EVENT BINDING
     ================================================================= */
  _bind() {
    // Login tabs
    document.querySelectorAll('.login-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.login-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.login-form').forEach(f => f.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.dataset.loginTab;
        this._el(target === 'admin' ? 'adminLoginForm' : 'customerLoginForm').classList.add('active');
      });
    });

    // Admin login
    this._el('adminLoginForm')?.addEventListener('submit', e => {
      e.preventDefault();
      const u = this._el('adminUser').value.trim();
      const p = this._el('adminPass').value;
      const err = this._el('adminLoginError');
      if (u === APP_CONFIG.adminCredentials.username && p === APP_CONFIG.adminCredentials.password) {
        err.style.display = 'none';
        this._loginAsAdmin();
      } else {
        err.textContent = 'Invalid username or password.';
        err.style.display = 'block';
      }
    });

    // Customer login
    this._el('customerLoginForm')?.addEventListener('submit', e => {
      e.preventDefault();
      const name = this._el('custName').value.trim().toLowerCase();
      const email = this._el('custEmail').value.trim().toLowerCase();
      const err = this._el('customerLoginError');
      const unit = this._allUnits().find(u => u.customer.toLowerCase() === name && u.email.toLowerCase() === email);
      if (unit) {
        err.style.display = 'none';
        this._loginAsCustomer(unit);
      } else {
        err.textContent = 'No matching customer found. Check your name and email.';
        err.style.display = 'block';
      }
    });

    // Logout
    this._el('btnLogout')?.addEventListener('click', () => this._logout());

    // Hamburger
    this._el('btnHamburger')?.addEventListener('click', () => {
      const m = this._el('mobileNav');
      m.classList.toggle('open');
    });

    // Nav buttons (desktop)
    document.querySelectorAll('.nav-btn[data-view]').forEach(btn => {
      btn.addEventListener('click', () => this._navigate(btn.dataset.view));
    });

    // Upload Photo modal
    this._el('btnUploadPhoto')?.addEventListener('click', () => this._openUploadModal());
    this._el('closeUploadModal')?.addEventListener('click', () => this._el('uploadModal').classList.remove('open'));
    this._el('uploadModal')?.addEventListener('click', e => { if (e.target === e.currentTarget) e.currentTarget.classList.remove('open'); });

    this._el('uploadPhotoForm')?.addEventListener('submit', e => {
      e.preventDefault();
      this._handlePhotoUpload();
    });

    // Add Customer form
    this._el('addCustomerForm')?.addEventListener('submit', e => {
      e.preventDefault();
      this._handleAddCustomer();
    });

    // Customer request form
    this._el('custRequestForm')?.addEventListener('submit', e => {
      e.preventDefault();
      this._handleCustRequest();
    });

    // Add Customer project dropdown change
    this._el('acProject')?.addEventListener('change', () => this._populateBlockDropdown());
  }

  /* =================================================================
     AUTH FLOW
     ================================================================= */
  _loginAsAdmin() {
    this.role = 'admin';
    this._el('loginPage').classList.add('hidden');
    this._el('appShell').classList.add('active');
    this._el('adminNav').classList.remove('hidden');
    this._el('customerNav').classList.add('hidden');
    this._el('headerAvatar').className = 'avatar-circle avatar-admin';
    this._el('headerAvatar').textContent = 'A';
    this._el('headerName').textContent = 'Admin';
    this._el('headerRole').textContent = 'Consultant';
    this._buildMobileNav('admin');
    this._navigate('dashboard');
    this.toast('Logged in as Admin', 'success');
  }

  _loginAsCustomer(unit) {
    this.role = 'customer';
    this.customerUnit = unit;
    this._el('loginPage').classList.add('hidden');
    this._el('appShell').classList.add('active');
    this._el('adminNav').classList.add('hidden');
    this._el('customerNav').classList.remove('hidden');
    this._el('headerAvatar').className = 'avatar-circle avatar-customer';
    this._el('headerAvatar').textContent = unit.customer.charAt(0);
    this._el('headerName').textContent = unit.customer;
    this._el('headerRole').textContent = `${unit.number} · ${unit.package}`;
    this._buildMobileNav('customer');
    this._navigate('myHome');
    this.toast(`Welcome, ${unit.customer}!`, 'success');
  }

  _logout() {
    this.role = null;
    this.customerUnit = null;
    this._el('loginPage').classList.remove('hidden');
    this._el('appShell').classList.remove('active');
    this._el('adminNav').classList.add('hidden');
    this._el('customerNav').classList.add('hidden');
    this._el('mobileNav').classList.remove('open');
    // Clear form fields
    this._el('adminUser').value = '';
    this._el('adminPass').value = '';
    this._el('custName').value = '';
    this._el('custEmail').value = '';
    this._el('adminLoginError').style.display = 'none';
    this._el('customerLoginError').style.display = 'none';
  }

  _buildMobileNav(role) {
    const nav = this._el('mobileNav');
    const items = role === 'admin'
      ? [['dashboard','Dashboard'],['projects','Projects'],['units','Unit Matrix'],['customizations','Requests'],['addCustomer','+ Add Customer']]
      : [['myHome','My Home'],['myPhotos','Site Photos'],['myRequests','Request Changes'],['myDelivery','Delivery']];
    nav.innerHTML = items.map(([v,l]) => `<button class="nav-btn" data-view="${v}">${l}</button>`).join('');
    nav.querySelectorAll('.nav-btn').forEach(b => b.addEventListener('click', () => {
      this._navigate(b.dataset.view);
      nav.classList.remove('open');
    }));
  }

  /* =================================================================
     NAVIGATION
     ================================================================= */
  _navigate(view) {
    // Hide all views
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

    // Map view name to element id
    const map = {
      dashboard: 'viewDashboard', projects: 'viewProjects', units: 'viewUnits',
      customizations: 'viewCustomizations', addCustomer: 'viewAddCustomer',
      myHome: 'viewMyHome', myPhotos: 'viewMyPhotos', myRequests: 'viewMyRequests', myDelivery: 'viewMyDelivery'
    };

    const el = this._el(map[view]);
    if (el) el.classList.add('active');

    // Update active nav
    const navContainer = this.role === 'admin' ? this._el('adminNav') : this._el('customerNav');
    navContainer?.querySelectorAll('.nav-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.view === view);
    });

    // Render
    this._render(view);
  }

  _render(view) {
    switch (view) {
      case 'dashboard': this._renderDashboard(); break;
      case 'projects': this._renderProjects('allProjects'); break;
      case 'units': this._renderUnits(); break;
      case 'customizations': this._renderAllRequests(); break;
      case 'addCustomer': this._renderAddCustomerForm(); break;
      case 'myHome': this._renderCustomerHome(); break;
      case 'myPhotos': this._renderCustomerPhotos(); break;
      case 'myRequests': this._renderCustomerRequests(); break;
      case 'myDelivery': this._renderCustomerDelivery(); break;
    }
  }

  /* =================================================================
     ADMIN: DASHBOARD
     ================================================================= */
  _renderDashboard() {
    const all = this._allUnits();
    const totalProjects = this.data.projects.length;
    const totalUnits = all.length;
    const inProgress = all.filter(u => u.stages?.some(s => s.status === 'in-progress')).length;
    const completed = all.filter(u => this._progress(u) === 100).length;
    const pendingReqs = all.reduce((n, u) => n + (u.customizations?.filter(c => c.status === 'Pending').length || 0), 0);

    this._el('statsRow').innerHTML = `
      <div class="stat-card" style="--stat-color:var(--accent)"><div class="stat-label">Projects</div><div class="stat-value">${totalProjects}</div><div class="stat-sub">Active developments</div></div>
      <div class="stat-card" style="--stat-color:var(--cyan)"><div class="stat-label">Total Units</div><div class="stat-value">${totalUnits}</div><div class="stat-sub">Across all projects</div></div>
      <div class="stat-card" style="--stat-color:var(--purple)"><div class="stat-label">In Progress</div><div class="stat-value">${inProgress}</div><div class="stat-sub">Active construction</div></div>
      <div class="stat-card" style="--stat-color:var(--green)"><div class="stat-label">Completed</div><div class="stat-value">${completed}</div><div class="stat-sub">Ready for handover</div></div>
      <div class="stat-card" style="--stat-color:var(--rose)"><div class="stat-label">Pending Requests</div><div class="stat-value">${pendingReqs}</div><div class="stat-sub">Customer customizations</div></div>
    `;
    this._renderProjects('dashProjects');
  }

  _renderProjects(containerId) {
    const el = this._el(containerId);
    if (!el) return;
    el.innerHTML = this.data.projects.map(p => {
      const units = [];
      (p.blocks || []).forEach(b => (b.units || []).forEach(u => units.push(u)));
      const avgProg = units.length ? Math.round(units.reduce((s, u) => s + this._progress(u), 0) / units.length) : 0;
      return `
        <div class="card" style="cursor:pointer" data-pid="${p.id}">
          <div class="project-img" style="background-image:url('${p.image}')">
            <span class="project-type-badge">${p.type}</span>
          </div>
          <div class="card-body">
            <h3 class="font-bold">${p.name}</h3>
            <p class="text-sm text-secondary">${p.location}</p>
            <div class="progress-bar">
              <div class="progress-header"><span>Progress</span><strong class="text-accent">${avgProg}%</strong></div>
              <div class="progress-track"><div class="progress-fill ${avgProg===100?'complete':''}" style="width:${avgProg}%"></div></div>
            </div>
            <div class="flex justify-between text-xs text-dim" style="margin-top:8px;">
              <span>${units.length} Units</span>
              <span>${p.blocks?.[0]?.name || ''}</span>
            </div>
          </div>
          <div class="card-footer">
            <button class="btn btn-ghost btn-sm w-full">View Unit Matrix →</button>
          </div>
        </div>`;
    }).join('');

    el.querySelectorAll('[data-pid]').forEach(card => {
      card.addEventListener('click', () => {
        this.selectedProject = card.dataset.pid;
        this.selectedUnit = null;
        this._navigate('units');
      });
    });
  }

  /* =================================================================
     ADMIN: UNIT MATRIX
     ================================================================= */
  _renderUnits() {
    const project = this.data.projects.find(p => p.id === this.selectedProject) || this.data.projects[0];
    const block = project.blocks?.[0];
    if (!block) return;

    this._el('unitsTitle').textContent = `${project.name} — ${block.name}`;

    // Filter bar
    const filterEl = this._el('filterBar');
    const packages = ['all', ...new Set(block.units.map(u => u.package))];
    filterEl.innerHTML = packages.map(f =>
      `<button class="btn btn-sm ${this.filter === f ? 'btn-primary' : 'btn-ghost'}" data-filter="${f}">${f === 'all' ? `All (${block.units.length})` : f}</button>`
    ).join('');
    filterEl.querySelectorAll('[data-filter]').forEach(b => {
      b.addEventListener('click', () => { this.filter = b.dataset.filter; this._renderUnits(); });
    });

    let units = block.units;
    if (this.filter !== 'all') units = units.filter(u => u.package === this.filter);

    const grid = this._el('unitsGrid');
    grid.innerHTML = units.map(u => {
      const prog = this._progress(u);
      const sel = this.selectedUnit === u.id ? 'selected' : '';
      return `
        <div class="unit-card ${sel}" data-uid="${u.id}">
          <div class="flex justify-between items-center mb-sm">
            <span class="unit-number">${u.number}</span>
            <span class="badge ${this._pkgBadge(u.package)}">${u.package}</span>
          </div>
          <div class="unit-customer">${u.customer}</div>
          <div class="text-xs text-dim mt-sm">${u.sqft} sq.ft · Floor ${u.floor}</div>
          <div class="progress-bar">
            <div class="progress-header"><span>Progress</span><strong>${prog}%</strong></div>
            <div class="progress-track"><div class="progress-fill ${prog===100?'complete':''}" style="width:${prog}%"></div></div>
          </div>
          <div class="flex justify-between text-xs text-dim" style="margin-top:6px;">
            <span>ETA: ${this._expectedDate(u)}</span>
            ${prog === 100 ? '<span class="badge badge-approved">Ready</span>' : ''}
          </div>
        </div>`;
    }).join('');

    grid.querySelectorAll('.unit-card').forEach(c => {
      c.addEventListener('click', () => {
        this.selectedUnit = c.dataset.uid;
        this.activeTab = 'timeline';
        this._renderUnits();
      });
    });

    this._renderUnitDetail();
  }

  _renderUnitDetail() {
    const el = this._el('unitDetail');
    if (!this.selectedUnit) { el.innerHTML = ''; return; }
    const unit = this._unitRef(this.selectedUnit);
    if (!unit) { el.innerHTML = ''; return; }
    const prog = this._progress(unit);

    el.innerHTML = `
      <div class="detail-panel">
        <div class="detail-hero">
          <div>
            <h2 class="page-title">${unit.number} — ${unit.customer} <span class="badge ${this._pkgBadge(unit.package)}">${unit.package}</span></h2>
            <p class="text-sm text-secondary">${unit.sqft} sq.ft · Floor ${unit.floor} · ${unit.phone}</p>
          </div>
          <div class="flex gap-sm" style="flex-wrap:wrap;">
            <button class="btn btn-ghost btn-sm" id="btnViewAsCust">👁 View as Customer</button>
          </div>
        </div>

        <div class="tabs">
          <button class="tab-btn ${this.activeTab==='timeline'?'active':''}" data-dtab="timeline">Milestones</button>
          <button class="tab-btn ${this.activeTab==='scope'?'active':''}" data-dtab="scope">Scope</button>
          <button class="tab-btn ${this.activeTab==='photos'?'active':''}" data-dtab="photos">Photos (${unit.photos?.length||0})</button>
          <button class="tab-btn ${this.activeTab==='requests'?'active':''}" data-dtab="requests">Requests (${unit.customizations?.length||0})</button>
        </div>

        <div id="detailTabContent"></div>
      </div>`;

    // Tab switching
    el.querySelectorAll('.tab-btn').forEach(b => {
      b.addEventListener('click', () => { this.activeTab = b.dataset.dtab; this._renderUnitDetail(); });
    });

    // View as customer
    el.querySelector('#btnViewAsCust')?.addEventListener('click', () => {
      this._loginAsCustomer(this._findUnit(this.selectedUnit));
    });

    const content = el.querySelector('#detailTabContent');
    if (this.activeTab === 'timeline') content.innerHTML = this._htmlTimeline(unit);
    else if (this.activeTab === 'scope') content.innerHTML = this._htmlScope(unit);
    else if (this.activeTab === 'photos') content.innerHTML = this._htmlPhotos(unit.photos);
    else if (this.activeTab === 'requests') {
      content.innerHTML = this._htmlRequests(unit);
      this._bindRequestActions(content, unit);
    }
  }

  /* =================================================================
     SHARED HTML BUILDERS
     ================================================================= */
  _htmlTimeline(unit) {
    const stages = unit.stages || [];
    if (stages.length === 0) return '<p class="text-sm text-dim">No milestones defined yet.</p>';
    return `
      <div class="flex justify-between items-center mb-md">
        <div>
          <div class="text-sm text-secondary">Progress: <strong class="text-accent">${this._progress(unit)}%</strong></div>
          <div class="text-xs text-dim">Expected: ${this._expectedDate(unit)}</div>
        </div>
        <span class="badge ${this._pkgBadge(unit.package)}">${unit.package}</span>
      </div>
      <div class="timeline">
        ${stages.map((s, i) => `
          <div class="tl-step ${s.status}">
            <div class="tl-dot">${s.status === 'completed' ? '✓' : (i+1)}</div>
            <div class="tl-content">
              <div class="flex justify-between items-center">
                <span class="tl-title">${s.name}</span>
                <span class="badge badge-${s.status === 'completed' ? 'completed' : s.status === 'in-progress' ? 'in-progress' : 'pending'}">${s.status.replace('-',' ')}</span>
              </div>
              <div class="tl-meta">${s.date || ''}</div>
            </div>
          </div>`).join('')}
      </div>`;
  }

  _htmlScope(unit) {
    const inc = unit.scopeIncluded || [];
    const exc = unit.scopeExcluded || [];
    return `
      <div class="scope-grid">
        <div class="scope-box scope-included">
          <h4 class="text-sm font-bold" style="color:#6ee7b7; margin-bottom:10px;">✓ Aari Construction Delivers</h4>
          ${inc.map(x => `<div class="text-sm" style="padding:3px 0;">✅ ${x}</div>`).join('')}
        </div>
        <div class="scope-box scope-excluded">
          <h4 class="text-sm font-bold" style="color:#fda4af; margin-bottom:10px;">✗ Customer Responsibility</h4>
          ${exc.length ? exc.map(x => `<div class="text-sm" style="padding:3px 0;">❌ ${x}</div>`).join('') : '<div class="text-sm text-dim">None — Full turnkey delivery</div>'}
        </div>
      </div>`;
  }

  _htmlPhotos(photos) {
    if (!photos || photos.length === 0) return '<p class="text-sm text-dim">No photos uploaded yet.</p>';
    return `<div class="photo-grid">${photos.map(p => `
      <div class="card">
        <img src="${p.url}" alt="${p.title}" style="width:100%; height:160px; object-fit:cover;">
        <div class="card-body" style="padding:12px 14px;">
          <div class="photo-title">${p.title}</div>
          <div class="photo-meta"><span class="badge badge-semi">${p.stage}</span><span>${p.timestamp}</span></div>
          <p class="text-xs text-dim mt-sm">${p.notes}</p>
        </div>
      </div>`).join('')}</div>`;
  }

  _htmlRequests(unit) {
    const reqs = unit.customizations || [];
    if (reqs.length === 0) return '<p class="text-sm text-dim">No customization requests.</p>';
    return `<div class="table-wrap"><table class="data-table">
      <thead><tr><th>ID</th><th>Category</th><th>Request</th><th>Cost</th><th>Time</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>${reqs.map(r => `<tr>
        <td><strong>${r.id}</strong></td>
        <td><span class="badge badge-semi">${r.category}</span></td>
        <td><strong>${r.title}</strong><div class="text-xs text-dim">${r.description}</div></td>
        <td class="text-accent">${r.costImpact}</td>
        <td class="text-dim text-xs">${r.timeImpact}</td>
        <td><span class="badge ${this._statusBadge(r.status)}">${r.status}</span></td>
        <td>${r.status === 'Pending' ? `<button class="btn btn-success btn-sm" data-rid="${r.id}" data-act="Approved">✓</button> <button class="btn btn-danger btn-sm" data-rid="${r.id}" data-act="Rejected">✗</button>` : '—'}</td>
      </tr>`).join('')}</tbody></table></div>`;
  }

  _bindRequestActions(container, unit) {
    container.querySelectorAll('[data-rid]').forEach(btn => {
      btn.addEventListener('click', () => {
        const rid = btn.dataset.rid;
        const act = btn.dataset.act;
        const ref = this._unitRef(unit.id);
        const req = ref?.customizations?.find(c => c.id === rid);
        if (req) {
          req.status = act;
          this._save();
          this.toast(`Request ${rid} ${act.toLowerCase()}`, 'success');
          this._renderUnitDetail();
          this._renderDashboard();
        }
      });
    });
  }

  /* =================================================================
     ADMIN: ALL REQUESTS
     ================================================================= */
  _renderAllRequests() {
    const all = [];
    this._allUnits().forEach(u => {
      (u.customizations || []).forEach(c => all.push({ ...c, unitNumber: u.number, customer: u.customer, unitId: u.id }));
    });

    const el = this._el('allRequestsTable');
    if (all.length === 0) { el.innerHTML = '<p class="text-sm text-dim">No requests found.</p>'; return; }

    el.innerHTML = `<table class="data-table">
      <thead><tr><th>ID</th><th>Unit</th><th>Customer</th><th>Category</th><th>Request</th><th>Cost</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>${all.map(r => `<tr>
        <td><strong>${r.id}</strong></td>
        <td>${r.unitNumber}</td>
        <td>${r.customer}</td>
        <td><span class="badge badge-semi">${r.category}</span></td>
        <td><strong>${r.title}</strong></td>
        <td class="text-accent">${r.costImpact}</td>
        <td><span class="badge ${this._statusBadge(r.status)}">${r.status}</span></td>
        <td>${r.status === 'Pending' ? `<button class="btn btn-success btn-sm" data-grid="${r.id}" data-gunit="${r.unitId}" data-gact="Approved">✓</button> <button class="btn btn-danger btn-sm" data-grid="${r.id}" data-gunit="${r.unitId}" data-gact="Rejected">✗</button>` : '—'}</td>
      </tr>`).join('')}</tbody></table>`;

    el.querySelectorAll('[data-grid]').forEach(btn => {
      btn.addEventListener('click', () => {
        const ref = this._unitRef(btn.dataset.gunit);
        const req = ref?.customizations?.find(c => c.id === btn.dataset.grid);
        if (req) { req.status = btn.dataset.gact; this._save(); this.toast(`Request ${btn.dataset.grid} ${btn.dataset.gact.toLowerCase()}`, 'success'); this._renderAllRequests(); }
      });
    });
  }

  /* =================================================================
     ADMIN: ADD CUSTOMER
     ================================================================= */
  _renderAddCustomerForm() {
    const sel = this._el('acProject');
    sel.innerHTML = this.data.projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    this._populateBlockDropdown();
  }

  _populateBlockDropdown() {
    const pid = this._el('acProject').value;
    const project = this.data.projects.find(p => p.id === pid);
    const bSel = this._el('acBlock');
    bSel.innerHTML = (project?.blocks || []).map(b => `<option value="${b.name}">${b.name}</option>`).join('');
  }

  _handleAddCustomer() {
    const pid = this._el('acProject').value;
    const blockName = this._el('acBlock').value;
    const flatNo = this._el('acFlatNo').value.trim();
    const floor = parseInt(this._el('acFloor').value);
    const sqft = parseInt(this._el('acSqft').value);
    const name = this._el('acName').value.trim();
    const email = this._el('acEmail').value.trim();
    const phone = this._el('acPhone').value.trim();
    const pkg = this._el('acPackage').value;

    if (!flatNo || !name || !email) { this.toast('Please fill all fields', 'error'); return; }

    const project = this.data.projects.find(p => p.id === pid);
    const block = project?.blocks?.find(b => b.name === blockName);
    if (!block) { this.toast('Invalid project/block', 'error'); return; }

    // Check if flat number already exists
    if (block.units.some(u => u.number === flatNo)) {
      this.toast(`Flat ${flatNo} already exists in ${blockName}`, 'error');
      return;
    }

    const id = `${pid}-${flatNo.toLowerCase().replace(/\s+/g,'-')}-${Date.now()}`;

    // Default stages based on package
    let stages = [{ name: 'Foundation & Substructure', status: 'pending', date: 'TBD' }];
    if (pkg === 'Bare-Bones') {
      stages = [
        { name: 'Foundation & Substructure', status: 'pending', date: 'TBD' },
        { name: 'RCC Frame & Columns', status: 'pending', date: 'TBD' },
        { name: 'Brick Masonry & Plastering', status: 'pending', date: 'TBD' }
      ];
    } else if (pkg === 'Semi-Finished') {
      stages = [
        { name: 'Foundation & Substructure', status: 'pending', date: 'TBD' },
        { name: 'RCC Frame & Columns', status: 'pending', date: 'TBD' },
        { name: 'Brick Masonry & Plastering', status: 'pending', date: 'TBD' },
        { name: 'Electrical Conduit & Plumbing', status: 'pending', date: 'TBD' },
        { name: 'Wall Painting (Primer + Base)', status: 'pending', date: 'TBD' },
        { name: 'Tile Cladding & Fixtures', status: 'pending', date: 'TBD' },
        { name: 'Final Inspection & Handover', status: 'pending', date: 'TBD' }
      ];
    } else {
      stages = [
        { name: 'Foundation & Substructure', status: 'pending', date: 'TBD' },
        { name: 'RCC Frame & Columns', status: 'pending', date: 'TBD' },
        { name: 'Brick Masonry & Plastering', status: 'pending', date: 'TBD' },
        { name: 'Electrical & Plumbing', status: 'pending', date: 'TBD' },
        { name: 'Premium Flooring & Paint', status: 'pending', date: 'TBD' },
        { name: 'Modular Kitchen & Wardrobes', status: 'pending', date: 'TBD' },
        { name: 'Smart Home Setup & Handover', status: 'pending', date: 'TBD' }
      ];
    }

    const scopeMap = {
      'Bare-Bones': { inc: ['RCC Structure', 'Brickwork', 'Plastering'], exc: ['Electrical', 'Plumbing', 'Painting', 'Interiors'] },
      'Semi-Finished': { inc: ['Structure', 'Plastering', 'Electrical Conduit', 'Plumbing', 'Base Paint', 'Cladding'], exc: ['Modular Kitchen', 'Wardrobes', 'False Ceiling', 'Interior Decor'] },
      'Fully Finished': { inc: ['Complete Turnkey Construction', 'Flooring', 'Kitchen', 'Wardrobes', 'Automation'], exc: [] }
    };

    const newUnit = {
      id, number: flatNo, floor, sqft,
      customer: name, email: email.toLowerCase(), phone,
      package: pkg,
      stages,
      scopeIncluded: scopeMap[pkg]?.inc || [],
      scopeExcluded: scopeMap[pkg]?.exc || [],
      photos: [],
      customizations: []
    };

    block.units.push(newUnit);
    project.totalUnits = block.units.length;
    this._save();
    this._el('addCustomerForm').reset();
    this.toast(`${name} assigned to ${flatNo} (${pkg})`, 'success');
  }

  /* =================================================================
     ADMIN: PHOTO UPLOAD
     ================================================================= */
  _openUploadModal() {
    const sel = this._el('upUnit');
    const units = this._allUnits();
    sel.innerHTML = units.map(u => `<option value="${u.id}">${u.number} — ${u.customer}</option>`).join('');
    if (this.selectedUnit) sel.value = this.selectedUnit;
    this._el('uploadModal').classList.add('open');
  }

  _handlePhotoUpload() {
    const uid = this._el('upUnit').value;
    const stage = this._el('upStage').value;
    const url = this._el('upImage').value;
    const title = this._el('upCaption').value.trim();
    const notes = this._el('upNotes').value.trim();

    const ref = this._unitRef(uid);
    if (!ref) return;
    if (!ref.photos) ref.photos = [];

    ref.photos.unshift({
      id: `ph-${Date.now()}`,
      title: title || 'Site photo',
      stage, url, notes: notes || '',
      timestamp: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    });

    this._save();
    this._el('uploadModal').classList.remove('open');
    this.toast(`Photo uploaded to ${ref.number}`, 'success');
    if (this.selectedUnit === uid) this._renderUnitDetail();
  }

  /* =================================================================
     CUSTOMER: HOME
     ================================================================= */
  _renderCustomerHome() {
    const unit = this._unitRef(this.customerUnit?.id);
    if (!unit) return;
    const info = this._findUnit(unit.id);
    const prog = this._progress(unit);

    this._el('custHero').innerHTML = `
      <div class="customer-hero">
        <div class="flex justify-between items-center" style="flex-wrap:wrap; gap:12px;">
          <div>
            <span class="badge ${this._pkgBadge(unit.package)}">${unit.package}</span>
            <h1 style="font-size:1.5rem; font-weight:800; margin-top:6px;">Welcome, ${unit.customer}</h1>
            <p class="text-sm text-secondary">${unit.number} · ${info?.projectName || ''} · ${unit.sqft} sq.ft</p>
          </div>
          <div style="text-align:right;">
            <div class="text-xs text-dim" style="text-transform:uppercase;">Expected Handover</div>
            <div style="font-size:1.3rem; font-weight:800; color:var(--accent-light);">${this._expectedDate(unit)}</div>
          </div>
        </div>
        <div class="progress-bar" style="margin-top:18px;">
          <div class="progress-header"><span>Stage: <strong style="color:var(--cyan)">${this._currentStage(unit)}</strong></span><strong>${prog}%</strong></div>
          <div class="progress-track" style="height:8px;"><div class="progress-fill ${prog===100?'complete':''}" style="width:${prog}%"></div></div>
        </div>
      </div>`;

    // Timeline
    this._el('custTimeline').innerHTML = `
      <div class="card">
        <div class="card-body">
          <h3 class="font-bold mb-md">Construction Progress</h3>
          ${this._htmlTimeline(unit)}
        </div>
      </div>`;

    // Sidebar: Latest photo + scope
    const photos = unit.photos || [];
    const latestPhoto = photos.length ? `
      <div class="card mb-md">
        <img src="${photos[0].url}" alt="${photos[0].title}" style="width:100%; height:150px; object-fit:cover;">
        <div class="card-body" style="padding:12px 14px;">
          <div class="photo-title">${photos[0].title}</div>
          <div class="photo-meta"><span class="badge badge-semi">${photos[0].stage}</span><span>${photos[0].timestamp}</span></div>
        </div>
      </div>` : '<div class="card mb-md"><div class="card-body"><p class="text-sm text-dim">No photos yet.</p></div></div>';

    this._el('custSidebar').innerHTML = `
      ${latestPhoto}
      <div class="card">
        <div class="card-body">
          <h4 class="font-bold mb-sm text-sm">Scope Summary</h4>
          <div style="margin-bottom:10px;">
            <div class="text-xs font-bold" style="color:#6ee7b7; text-transform:uppercase;">Included:</div>
            <div class="text-sm text-secondary mt-sm">${(unit.scopeIncluded||[]).map(x=>'✓ '+x).join('<br>')}</div>
          </div>
          <div>
            <div class="text-xs font-bold" style="color:var(--rose); text-transform:uppercase;">Your Scope:</div>
            <div class="text-sm text-dim mt-sm">${(unit.scopeExcluded||[]).length ? (unit.scopeExcluded||[]).map(x=>'✗ '+x).join('<br>') : 'None — Turnkey'}</div>
          </div>
        </div>
      </div>`;
  }

  _currentStage(unit) {
    const ip = unit.stages?.find(s => s.status === 'in-progress');
    if (ip) return ip.name;
    const pending = unit.stages?.find(s => s.status === 'pending');
    if (pending) return pending.name;
    return 'Completed';
  }

  /* =================================================================
     CUSTOMER: PHOTOS
     ================================================================= */
  _renderCustomerPhotos() {
    const unit = this._unitRef(this.customerUnit?.id);
    if (!unit) return;
    this._el('custPhotos').innerHTML = this._htmlPhotos(unit.photos);
  }

  /* =================================================================
     CUSTOMER: REQUESTS
     ================================================================= */
  _renderCustomerRequests() {
    const unit = this._unitRef(this.customerUnit?.id);
    if (!unit) return;

    const el = this._el('custExistingRequests');
    const reqs = unit.customizations || [];
    if (reqs.length === 0) {
      el.innerHTML = '<p class="text-sm text-dim">No requests submitted yet.</p>';
    } else {
      el.innerHTML = reqs.map(r => `
        <div class="card mb-sm">
          <div class="card-body" style="padding:14px;">
            <div class="flex justify-between items-center mb-sm">
              <strong>${r.title}</strong>
              <span class="badge ${this._statusBadge(r.status)}">${r.status}</span>
            </div>
            <p class="text-xs text-secondary">${r.description}</p>
            <div class="flex justify-between text-xs text-dim mt-sm">
              <span>${r.id} · ${r.category}</span>
              <span class="text-accent">${r.costImpact}</span>
            </div>
          </div>
        </div>`).join('');
    }
  }

  _handleCustRequest() {
    const unit = this._unitRef(this.customerUnit?.id);
    if (!unit) return;
    const cat = this._el('crCategory').value;
    const title = this._el('crTitle').value.trim();
    const desc = this._el('crDesc').value.trim();
    if (!title || !desc) return;

    if (!unit.customizations) unit.customizations = [];
    unit.customizations.unshift({
      id: `CR-${Math.floor(1000+Math.random()*9000)}`,
      category: cat, title, description: desc,
      status: 'Pending',
      date: new Date().toLocaleDateString('en-IN'),
      costImpact: 'Under review',
      timeImpact: 'Under review'
    });

    this._save();
    this._el('custRequestForm').reset();
    this.toast('Request submitted for review', 'success');
    this._renderCustomerRequests();
  }

  /* =================================================================
     CUSTOMER: DELIVERY
     ================================================================= */
  _renderCustomerDelivery() {
    const unit = this._unitRef(this.customerUnit?.id);
    if (!unit) return;
    const info = this._findUnit(unit.id);
    const prog = this._progress(unit);
    const remaining = unit.stages?.filter(s => s.status !== 'completed') || [];

    this._el('custDeliveryContent').innerHTML = `
      <div class="card">
        <div class="card-body">
          <div class="flex justify-between items-center mb-md" style="flex-wrap:wrap; gap:10px;">
            <h3 class="font-bold">Handover Plan</h3>
            <span class="badge badge-approved">On Track</span>
          </div>

          <div class="stats-row" style="margin-bottom:20px;">
            <div class="stat-card" style="--stat-color:var(--accent)"><div class="stat-label">Package</div><div class="stat-value" style="font-size:1.2rem;">${unit.package}</div></div>
            <div class="stat-card" style="--stat-color:var(--green)"><div class="stat-label">Expected Date</div><div class="stat-value" style="font-size:1.2rem;">${this._expectedDate(unit)}</div></div>
            <div class="stat-card" style="--stat-color:var(--cyan)"><div class="stat-label">Remaining</div><div class="stat-value" style="font-size:1.2rem;">${100-prog}%</div></div>
          </div>

          ${remaining.length ? `<h4 class="font-bold text-sm mb-sm">Pending Milestones:</h4>
          <ul style="list-style:none; font-size:.85rem; line-height:1.8; color:var(--text-secondary);">
            ${remaining.map(s => `<li>⏳ ${s.name} — ${s.date}</li>`).join('')}
          </ul>` : '<p class="text-sm" style="color:var(--green);">All milestones completed! Ready for handover.</p>'}

          <div style="margin-top:20px; padding-top:16px; border-top:1px solid var(--border);">
            <h4 class="font-bold text-sm mb-sm">Non-Interference Guarantee</h4>
            <p class="text-sm text-secondary">Your ${unit.package} delivery is tracked independently. Custom work on neighboring units will never delay your handover date.</p>
          </div>
        </div>
      </div>
      <div class="mt-md">${this._htmlScope(unit)}</div>`;
  }
}

document.addEventListener('DOMContentLoaded', () => { window.app = new App(); });
