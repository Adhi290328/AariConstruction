/**
 * AARI CONSTRUCTION - Main Application Engine
 * Handles State, Dynamic DOM Rendering, Role Switching,
 * Customization Workflows, and Photo Upload Simulation.
 */

import { INITIAL_DATA } from './data.js';

class AariConstructionApp {
  constructor() {
    // Clone initial data or load from localStorage for persistent demo interactions
    this.data = this.loadState();
    
    // Application runtime state
    this.state = {
      currentRole: 'consultant', // 'consultant' or 'customer'
      currentCustomerId: 'gv-a-102', // Default: Priya Sharma (Flat 102)
      selectedProjectId: 'proj-1', // Green Valley Apartments
      selectedUnitId: 'gv-a-102',
      tierFilter: 'all',
      activeView: 'consultantDashboard',
      activeUnitDetailTab: 'timeline'
    };

    this.init();
  }

  loadState() {
    const saved = localStorage.getItem('aari_construction_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse cached state, falling back to initial', e);
      }
    }
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }

  saveState() {
    localStorage.setItem('aari_construction_data', JSON.stringify(this.data));
  }

  init() {
    this.bindEvents();
    this.renderAll();
  }

  /* =========================================================================
     EVENT BINDING & ROUTING
     ========================================================================= */
  bindEvents() {
    // Top Bar Role Switchers
    document.getElementById('roleBtnConsultant')?.addEventListener('click', () => {
      this.switchRole('consultant');
    });

    document.getElementById('roleBtnCustomerPriya')?.addEventListener('click', () => {
      this.switchRole('customer', 'gv-a-102'); // Priya
    });

    document.getElementById('roleBtnCustomerVikram')?.addEventListener('click', () => {
      this.switchRole('customer', 'gv-a-101'); // Vikram
    });

    // HLD Architecture Modal
    document.getElementById('btnOpenHldModal')?.addEventListener('click', () => {
      this.openModal('hldModal');
    });

    document.getElementById('btnCloseHldModal')?.addEventListener('click', () => {
      this.closeModal('hldModal');
    });

    // Close modal on click outside
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('active');
        }
      });
    });

    // Navigation links
    document.querySelectorAll('.nav-link-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetView = e.currentTarget.getAttribute('data-view');
        if (targetView) {
          this.switchView(targetView);
        }
      });
    });

    // Quick Button to Inspect Green Valley from Dashboard
    document.getElementById('btnQuickSelectGreenValley')?.addEventListener('click', () => {
      this.state.selectedProjectId = 'proj-1';
      this.state.selectedUnitId = 'gv-a-102';
      this.switchView('consultantUnits');
    });

    // Unit Matrix Tier Filters
    document.getElementById('tierFilterPills')?.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-pill');
      if (!btn) return;
      document.querySelectorAll('#tierFilterPills .filter-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.state.tierFilter = btn.getAttribute('data-filter');
      this.renderUnitsGrid();
    });

    // Upload Site Photo Modal triggers
    document.getElementById('btnUploadNewPhotoPrompt')?.addEventListener('click', () => {
      this.openModal('uploadModal');
    });

    document.getElementById('btnCloseUploadModal')?.addEventListener('click', () => {
      this.closeModal('uploadModal');
    });

    // Site Photo Upload Form Submit
    document.getElementById('sitePhotoUploadForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSitePhotoUpload();
    });

    // Customer Customization Form Submit
    document.getElementById('customizationRequestForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleCustomerCustomizationSubmit();
    });
  }

  /* =========================================================================
     ROLE & VIEW SWITCHING
     ========================================================================= */
  switchRole(role, customerId = null) {
    this.state.currentRole = role;
    if (customerId) {
      this.state.currentCustomerId = customerId;
    }

    // Update Top Role Buttons
    document.getElementById('roleBtnConsultant')?.classList.toggle('active', role === 'consultant');
    document.getElementById('roleBtnCustomerPriya')?.classList.toggle('active', role === 'customer' && this.state.currentCustomerId === 'gv-a-102');
    document.getElementById('roleBtnCustomerVikram')?.classList.toggle('active', role === 'customer' && this.state.currentCustomerId === 'gv-a-101');

    // Update Navbars
    const consultantNav = document.getElementById('consultantNav');
    const customerNav = document.getElementById('customerNav');
    const userAvatar = document.getElementById('userAvatar');
    const userNameLabel = document.getElementById('userNameLabel');
    const userRoleSubLabel = document.getElementById('userRoleSubLabel');

    if (role === 'consultant') {
      if (consultantNav) consultantNav.style.display = 'flex';
      if (customerNav) customerNav.style.display = 'none';
      if (userAvatar) {
        userAvatar.className = 'avatar consultant';
        userAvatar.textContent = 'AC';
      }
      if (userNameLabel) userNameLabel.textContent = 'Aari Management';
      if (userRoleSubLabel) userRoleSubLabel.textContent = 'Lead Construction PM';
      this.switchView('consultantDashboard');
      this.showToast('Switched to Consultant / Admin Mode', 'info');
    } else {
      if (consultantNav) consultantNav.style.display = 'none';
      if (customerNav) customerNav.style.display = 'flex';
      
      const currentUnit = this.getCurrentCustomerUnit();
      if (userAvatar) {
        userAvatar.className = 'avatar';
        userAvatar.textContent = currentUnit ? currentUnit.customer.charAt(0) : 'C';
      }
      if (userNameLabel) userNameLabel.textContent = currentUnit ? currentUnit.customer : 'Valued Customer';
      if (userRoleSubLabel) userRoleSubLabel.textContent = `${currentUnit?.number || 'Unit'} (${currentUnit?.package || 'Package'})`;
      this.switchView('customerHome');
      this.showToast(`Switched to ${currentUnit?.customer || 'Customer'} Portal`, 'success');
    }

    this.renderAll();
  }

  switchView(viewId) {
    this.state.activeView = viewId;

    // Toggle active classes on view containers
    document.querySelectorAll('.view-container').forEach(el => {
      el.classList.remove('active');
    });

    const target = document.getElementById(this.getViewElementId(viewId));
    if (target) {
      target.classList.add('active');
    }

    // Toggle active on navbar buttons
    document.querySelectorAll('.nav-link-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-view') === viewId);
    });

    // Trigger view-specific re-renders
    if (viewId === 'consultantUnits') {
      this.renderUnitsGrid();
      this.renderUnitDetailPanel();
    } else if (viewId === 'consultantCustomizations') {
      this.renderCustomizationsQueue();
    } else if (viewId.startsWith('customer')) {
      this.renderCustomerViews();
    }
  }

  getViewElementId(viewId) {
    const map = {
      consultantDashboard: 'viewConsultantDashboard',
      consultantProjects: 'viewConsultantProjects',
      consultantUnits: 'viewConsultantUnits',
      consultantCustomizations: 'viewConsultantCustomizations',
      customerHome: 'viewCustomerHome',
      customerPhotos: 'viewCustomerPhotos',
      customerCustomization: 'viewCustomerCustomization',
      customerDelivery: 'viewCustomerDelivery'
    };
    return map[viewId] || 'viewConsultantDashboard';
  }

  /* =========================================================================
     RENDERING PIPELINES
     ========================================================================= */
  renderAll() {
    this.renderDashboardStats();
    this.renderProjectsList();
    this.renderUnitsGrid();
    this.renderUnitDetailPanel();
    this.renderCustomizationsQueue();
    this.renderCustomerViews();
    this.renderTeamAllocation();
  }

  renderDashboardStats() {
    const metrics = this.data.metrics;
    if (document.getElementById('statProjects')) document.getElementById('statProjects').textContent = metrics.totalProjects;
    if (document.getElementById('statUnits')) document.getElementById('statUnits').textContent = metrics.totalUnits;
    if (document.getElementById('statActive')) document.getElementById('statActive').textContent = metrics.activeConstruction;
    if (document.getElementById('statReady')) document.getElementById('statReady').textContent = metrics.readyForHandover;

    // Pending customizations badge
    let pendingCount = 0;
    this.data.projects.forEach(p => {
      p.blocks?.forEach(b => {
        b.units?.forEach(u => {
          u.customizations?.forEach(c => {
            if (c.status === 'Pending') pendingCount++;
          });
        });
      });
    });

    const badge = document.getElementById('pendingBadgeCount');
    if (badge) {
      badge.textContent = pendingCount;
      badge.style.display = pendingCount > 0 ? 'inline-flex' : 'none';
    }
  }

  renderProjectsList() {
    const dashList = document.getElementById('dashboardProjectsList');
    const fullList = document.getElementById('fullProjectsList');

    const html = this.data.projects.map(p => `
      <div class="project-card">
        <div class="project-card-img" style="background-image: url('${p.image}');">
          <span class="project-card-type">${p.type}</span>
        </div>
        <div class="project-card-body">
          <h3 class="project-card-title">${p.name}</h3>
          <p class="project-card-location">📍 ${p.location}</p>
          <div class="progress-bar-container">
            <div class="progress-bar-header">
              <span>Overall Progress</span>
              <strong style="color: var(--accent-amber-light);">${p.overallProgress}%</strong>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width: ${p.overallProgress}%;"></div>
            </div>
          </div>
          <div class="project-meta-grid">
            <div class="meta-item">
              <div class="meta-label">Total Units</div>
              <div class="meta-val">${p.totalUnits} Units</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Target Handover</div>
              <div class="meta-val">${p.expectedDelivery}</div>
            </div>
          </div>
          <button class="btn-view-project" data-project-id="${p.id}">
            Inspect Unit Matrix &rarr;
          </button>
        </div>
      </div>
    `).join('');

    if (dashList) dashList.innerHTML = html;
    if (fullList) fullList.innerHTML = html;

    // Attach click events
    document.querySelectorAll('.btn-view-project').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const pId = e.currentTarget.getAttribute('data-project-id');
        this.state.selectedProjectId = pId;
        this.switchView('consultantUnits');
      });
    });
  }

  renderUnitsGrid() {
    const project = this.data.projects.find(p => p.id === this.state.selectedProjectId) || this.data.projects[0];
    const block = project.blocks ? project.blocks[0] : null;
    if (!block) return;

    const titleEl = document.getElementById('matrixProjectTitle');
    if (titleEl) {
      titleEl.innerHTML = `${project.name} &mdash; ${block.name}`;
    }

    let units = block.units || [];
    if (this.state.tierFilter !== 'all') {
      units = units.filter(u => u.package === this.state.tierFilter);
    }

    const container = document.getElementById('unitsGridContainer');
    if (!container) return;

    container.innerHTML = units.map(unit => {
      const isSelected = unit.id === this.state.selectedUnitId;
      const readyBadge = unit.isReadyForHandover 
        ? `<span class="badge badge-ready">READY FOR HANDOVER</span>` 
        : `<span class="badge ${unit.packageBadge}">${unit.package}</span>`;

      return `
        <div class="unit-card ${isSelected ? 'active-selected' : ''}" data-unit-id="${unit.id}">
          <div class="unit-card-header">
            <span class="unit-card-num">${unit.number}</span>
            ${readyBadge}
          </div>
          <div class="unit-customer-name">Client: <strong>${unit.customer}</strong></div>
          <div class="unit-card-stage">
            <span style="color: var(--accent-amber);">●</span> Stage: ${unit.stage}
          </div>
          <div class="progress-bar-container" style="margin-bottom: 8px;">
            <div class="progress-bar-header">
              <span>Scope Completion</span>
              <strong>${unit.progress}%</strong>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width: ${unit.progress}%; background: ${unit.progress === 100 ? 'var(--accent-emerald)' : ''};"></div>
            </div>
          </div>
          <div class="unit-card-footer">
            <span class="eta-label">Expected Handover:</span>
            <span class="eta-value">${unit.expectedHandover}</span>
          </div>
        </div>
      `;
    }).join('');

    // Attach card click
    container.querySelectorAll('.unit-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const uId = e.currentTarget.getAttribute('data-unit-id');
        this.state.selectedUnitId = uId;
        this.renderUnitsGrid();
        this.renderUnitDetailPanel();
      });
    });
  }

  renderUnitDetailPanel() {
    const panel = document.getElementById('unitDetailPanel');
    if (!panel) return;

    const project = this.data.projects.find(p => p.id === this.state.selectedProjectId) || this.data.projects[0];
    const unit = project.blocks?.[0]?.units?.find(u => u.id === this.state.selectedUnitId);

    if (!unit) {
      panel.style.display = 'none';
      return;
    }

    panel.style.display = 'block';

    const handoverBtnText = unit.isReadyForHandover 
      ? '✓ Handover Certificate Issued' 
      : '📦 Mark Ready For Handover';

    panel.innerHTML = `
      <div class="unit-detail-hero">
        <div class="unit-detail-left">
          <h2>
            ${unit.number} &mdash; ${unit.customer}
            <span class="badge ${unit.packageBadge}">${unit.package}</span>
            ${unit.isReadyForHandover ? '<span class="badge badge-ready">READY FOR DELIVERY</span>' : ''}
          </h2>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">
            ${unit.description}
          </p>
        </div>
        <div class="unit-detail-actions">
          <button class="btn-action ${unit.isReadyForHandover ? '' : 'primary'}" id="btnToggleHandoverStatus">
            ${handoverBtnText}
          </button>
          <button class="btn-action" id="btnSwitchToCustomerDirect" title="View customer portal for this unit">
            👁️ Open as Customer
          </button>
        </div>
      </div>

      <!-- Navigation Tabs inside Unit Detail -->
      <div class="tab-nav">
        <button class="tab-btn ${this.state.activeUnitDetailTab === 'timeline' ? 'active' : ''}" data-tab="timeline">
          📅 Construction Milestones & ETA
        </button>
        <button class="tab-btn ${this.state.activeUnitDetailTab === 'scope' ? 'active' : ''}" data-tab="scope">
          📋 Scope & Custom Boundary
        </button>
        <button class="tab-btn ${this.state.activeUnitDetailTab === 'photos' ? 'active' : ''}" data-tab="photos">
          📷 Site Verification Photos (${unit.photos ? unit.photos.length : 0})
        </button>
        <button class="tab-btn ${this.state.activeUnitDetailTab === 'customizations' ? 'active' : ''}" data-tab="customizations">
          ✏️ Custom Requests (${unit.customizations ? unit.customizations.length : 0})
        </button>
      </div>

      <!-- Tab Content Area -->
      <div id="unitDetailTabContent">
        ${this.getUnitDetailTabContentHtml(unit)}
      </div>
    `;

    // Bind tab clicks
    panel.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.state.activeUnitDetailTab = e.currentTarget.getAttribute('data-tab');
        this.renderUnitDetailPanel();
      });
    });

    // Bind Handover Toggle
    document.getElementById('btnToggleHandoverStatus')?.addEventListener('click', () => {
      unit.isReadyForHandover = !unit.isReadyForHandover;
      if (unit.isReadyForHandover) {
        unit.progress = 100;
        unit.handoverStatus = "Ready for Delivery";
        this.showToast(`${unit.number} marked Ready for Delivery! Handover notice sent.`, 'success');
      } else {
        unit.progress = 80;
        unit.handoverStatus = "In Progress";
        this.showToast(`${unit.number} status reverted to In Progress`, 'info');
      }
      this.saveState();
      this.renderAll();
    });

    // Bind Direct Switch to Customer
    document.getElementById('btnSwitchToCustomerDirect')?.addEventListener('click', () => {
      this.switchRole('customer', unit.id);
    });

    // Bind Customization Actions inside unit
    this.bindCustomizationTableEvents(panel);
  }

  getUnitDetailTabContentHtml(unit) {
    if (this.state.activeUnitDetailTab === 'timeline') {
      const stages = unit.stages && unit.stages.length > 0 ? unit.stages : [
        { name: "Foundation & Substructure", status: "completed", date: "15 Jan 2026", note: "RCC Foundation cast" },
        { name: "Superstructure Frame", status: "completed", date: "22 Mar 2026", note: "Pillar and beams certified" },
        { name: "Brick Masonry & Plastering", status: "completed", date: "10 Jul 2026", note: "Double sand-face plaster" },
        { name: "Electrical & Plumbing Rough-in", status: "in-progress", date: "In Progress", note: "Conduit piping laid" },
        { name: "Painting & Cladding", status: "pending", date: "Target Nov 2026", note: "Pending MEP sign-off" },
        { name: "Handover Inspection", status: "pending", date: "Target Dec 2026", note: "Key handover" }
      ];

      return `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            <h3 style="font-size: 1rem; font-weight: 700;">Milestone Roadmap & Delivery Tracker</h3>
            <p style="font-size: 0.8rem; color: var(--text-muted);">
              Expected Handover: <strong style="color: var(--accent-amber-light);">${unit.expectedHandover}</strong>
              &bull; Scope Completion: <strong>${unit.progress}%</strong>
            </p>
          </div>
          <span class="badge ${unit.packageBadge}">${unit.package} Tier</span>
        </div>
        <div class="timeline-list">
          ${stages.map((st, idx) => `
            <div class="timeline-step ${st.status}">
              <div class="timeline-marker">${st.status === 'completed' ? '✓' : (idx + 1)}</div>
              <div class="timeline-content">
                <div class="timeline-title-row">
                  <span class="timeline-title">${st.name}</span>
                  <span class="badge ${st.status === 'completed' ? 'badge-ready' : (st.status === 'in-progress' ? 'badge-pending' : '')}">${st.status.toUpperCase()}</span>
                </div>
                <div class="timeline-note">
                  ${st.note || 'Milestone verified by site engineer'} &bull; <span style="color: var(--text-dim);">${st.date || ''}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    if (this.state.activeUnitDetailTab === 'scope') {
      const included = unit.scopeIncluded || ["Foundation & Columns", "Brickwork & Plaster"];
      const excluded = unit.scopeExcluded || ["Interior Finishes"];

      return `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div style="background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: var(--radius-md); padding: 18px;">
            <h3 style="font-size: 0.95rem; font-weight: 700; color: #6ee7b7; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
              <span>✓</span> Scope Included by Aari Construction (${unit.package})
            </h3>
            <ul style="list-style: none; font-size: 0.85rem; line-height: 1.8;">
              ${included.map(i => `<li style="display: flex; align-items: center; gap: 8px;"><span>✅</span> ${i}</li>`).join('')}
            </ul>
          </div>

          <div style="background: rgba(244, 63, 94, 0.05); border: 1px solid rgba(244, 63, 94, 0.3); border-radius: var(--radius-md); padding: 18px;">
            <h3 style="font-size: 0.95rem; font-weight: 700; color: #fda4af; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
              <span>✗</span> Excluded & Handled by Customer
            </h3>
            <ul style="list-style: none; font-size: 0.85rem; line-height: 1.8;">
              ${excluded.length > 0 ? excluded.map(e => `<li style="display: flex; align-items: center; gap: 8px;"><span>❌</span> ${e}</li>`).join('') : '<li style="color: var(--text-dim);">No exclusions &mdash; Full Turnkey Project!</li>'}
            </ul>
          </div>
        </div>
      `;
    }

    if (this.state.activeUnitDetailTab === 'photos') {
      const photos = unit.photos || [];
      return `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            <h3 style="font-size: 1rem; font-weight: 700;">Field Engineer Verification Photos</h3>
            <p style="font-size: 0.8rem; color: var(--text-muted);">Real-time site imagery accessible to client</p>
          </div>
          <button class="btn-action primary" id="btnUploadModalInline">
            📷 Upload New Field Photo
          </button>
        </div>

        ${photos.length === 0 ? '<p style="color: var(--text-muted); font-size: 0.85rem;">No site photos uploaded yet for this unit.</p>' : `
          <div class="photo-gallery-grid">
            ${photos.map(p => `
              <div class="photo-card">
                <img src="${p.url}" alt="${p.title}" class="photo-img">
                <div class="photo-caption">
                  <div class="photo-title">${p.title}</div>
                  <div class="photo-meta">
                    <span class="badge badge-semifinished">${p.stage}</span>
                    <span>${p.timestamp}</span>
                  </div>
                  <div class="photo-notes">${p.notes}</div>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      `;
    }

    if (this.state.activeUnitDetailTab === 'customizations') {
      const cust = unit.customizations || [];
      return `
        <div class="section-header" style="margin-bottom: 12px;">
          <div>
            <h3 style="font-size: 1rem; font-weight: 700;">Unit Customization Log</h3>
            <p style="font-size: 0.8rem; color: var(--text-muted);">Decoupled customer variations with isolated cost/schedule impacts</p>
          </div>
        </div>

        ${cust.length === 0 ? '<p style="color: var(--text-muted); font-size: 0.85rem;">No customization requests submitted for this unit.</p>' : `
          <table class="customization-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Category</th>
                <th>Title / Description</th>
                <th>Impact</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${cust.map(c => `
                <tr>
                  <td><strong>${c.id}</strong></td>
                  <td><span class="badge badge-custom">${c.category}</span></td>
                  <td>
                    <strong>${c.title}</strong>
                    <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">${c.description}</div>
                  </td>
                  <td>
                    <div style="color: #6ee7b7; font-weight: 600;">${c.costImpact}</div>
                    <div style="font-size: 0.72rem; color: var(--text-dim);">${c.timeImpact}</div>
                  </td>
                  <td>
                    <span class="badge ${c.status === 'Approved' ? 'badge-ready' : (c.status === 'Pending' ? 'badge-pending' : '')}">${c.status}</span>
                  </td>
                  <td>
                    ${c.status === 'Pending' ? `
                      <button class="btn-approve" data-req-id="${c.id}" data-unit-id="${unit.id}">Approve</button>
                      <button class="btn-reject" data-req-id="${c.id}" data-unit-id="${unit.id}">Reject</button>
                    ` : '<span style="color: var(--text-dim); font-size: 0.75rem;">Processed</span>'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}
      `;
    }

    return '';
  }

  bindCustomizationTableEvents(container) {
    container.querySelectorAll('.btn-approve').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const reqId = e.currentTarget.getAttribute('data-req-id');
        const unitId = e.currentTarget.getAttribute('data-unit-id');
        this.updateCustomizationStatus(unitId, reqId, 'Approved');
      });
    });

    container.querySelectorAll('.btn-reject').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const reqId = e.currentTarget.getAttribute('data-req-id');
        const unitId = e.currentTarget.getAttribute('data-unit-id');
        this.updateCustomizationStatus(unitId, reqId, 'Rejected');
      });
    });

    container.querySelector('#btnUploadModalInline')?.addEventListener('click', () => {
      this.openModal('uploadModal');
    });
  }

  updateCustomizationStatus(unitId, reqId, newStatus) {
    let found = false;
    this.data.projects.forEach(p => {
      p.blocks?.forEach(b => {
        b.units?.forEach(u => {
          if (u.id === unitId) {
            u.customizations?.forEach(c => {
              if (c.id === reqId) {
                c.status = newStatus;
                found = true;
              }
            });
          }
        });
      });
    });

    if (found) {
      this.saveState();
      this.showToast(`Request ${reqId} marked as ${newStatus}!`, newStatus === 'Approved' ? 'success' : 'info');
      this.renderAll();
    }
  }

  renderCustomizationsQueue() {
    const tbody = document.getElementById('customizationsTableBody');
    if (!tbody) return;

    const allRequests = [];
    this.data.projects.forEach(p => {
      p.blocks?.forEach(b => {
        b.units?.forEach(u => {
          u.customizations?.forEach(c => {
            allRequests.push({ ...c, unitNumber: u.number, customer: u.customer, unitId: u.id });
          });
        });
      });
    });

    if (allRequests.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">No customization requests found.</td></tr>`;
      return;
    }

    tbody.innerHTML = allRequests.map(r => `
      <tr>
        <td><strong>${r.id}</strong></td>
        <td>
          <strong>${r.unitNumber}</strong>
          <div style="font-size: 0.75rem; color: var(--text-dim);">${r.customer}</div>
        </td>
        <td><span class="badge badge-custom">${r.category}</span></td>
        <td>
          <div style="font-weight: 600;">${r.title}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted);">${r.description}</div>
        </td>
        <td style="color: #6ee7b7; font-weight: 600;">${r.costImpact}</td>
        <td style="color: var(--text-dim); font-size: 0.75rem;">${r.timeImpact}</td>
        <td>
          <span class="badge ${r.status === 'Approved' ? 'badge-ready' : (r.status === 'Pending' ? 'badge-pending' : '')}">${r.status}</span>
        </td>
        <td>
          ${r.status === 'Pending' ? `
            <button class="btn-approve" data-req-id="${r.id}" data-unit-id="${r.unitId}">Approve</button>
            <button class="btn-reject" data-req-id="${r.id}" data-unit-id="${r.unitId}">Reject</button>
          ` : '<span style="color: var(--text-dim); font-size: 0.75rem;">Completed</span>'}
        </td>
      </tr>
    `).join('');

    this.bindCustomizationTableEvents(tbody);
  }

  /* =========================================================================
     CUSTOMER PORTAL RENDERING
     ========================================================================= */
  getCurrentCustomerUnit() {
    for (const p of this.data.projects) {
      for (const b of (p.blocks || [])) {
        for (const u of (b.units || [])) {
          if (u.id === this.state.currentCustomerId) {
            return { ...u, projectName: p.name, blockName: b.name };
          }
        }
      }
    }
    // Fallback to Flat 102
    return this.data.projects[0].blocks[0].units[1];
  }

  renderCustomerViews() {
    const unit = this.getCurrentCustomerUnit();
    if (!unit) return;

    // 1. Customer Hero Banner
    const hero = document.getElementById('customerHeroBanner');
    if (hero) {
      const isReady = unit.isReadyForHandover;
      hero.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
          <div>
            <span class="badge ${unit.packageBadge}">${unit.package} PACKAGE</span>
            <h2 style="font-size: 1.8rem; font-weight: 800; margin: 8px 0 4px 0;">
              Welcome, ${unit.customer}! 🏡
            </h2>
            <p style="font-size: 0.9rem; color: var(--text-muted);">
              ${unit.number} &bull; ${unit.projectName} (${unit.blockName})
            </p>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 0.78rem; color: var(--text-dim); text-transform: uppercase;">Expected Handover</div>
            <div style="font-size: 1.5rem; font-weight: 800; color: var(--accent-amber-light);">${unit.expectedHandover}</div>
            <div style="font-size: 0.75rem; color: #34d399;">
              ${isReady ? '🎉 Handover Ready for Key Collection' : '⚡ Non-Interference Schedule: Protected from neighbor delays'}
            </div>
          </div>
        </div>

        <div style="margin-top: 24px;">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px;">
            <span>Current Stage: <strong style="color: var(--accent-cyan);">${unit.stage}</strong></span>
            <strong>${unit.progress}% Complete</strong>
          </div>
          <div class="progress-track" style="height: 10px;">
            <div class="progress-fill" style="width: ${unit.progress}%; background: ${isReady ? 'var(--accent-emerald)' : 'linear-gradient(90deg, var(--accent-amber), var(--accent-cyan))'};"></div>
          </div>
        </div>
      `;
    }

    // 2. Customer Timeline
    const timelineList = document.getElementById('customerTimelineList');
    if (timelineList) {
      const stages = unit.stages && unit.stages.length > 0 ? unit.stages : [
        { name: "Foundation", status: "completed", date: "15 Jan 2026", note: "RCC foundation certified" },
        { name: "Structure & Masonry", status: "completed", date: "22 Mar 2026", note: "Brick partition walls done" },
        { name: "Plastering", status: "completed", date: "10 Jul 2026", note: "Cured and certified" },
        { name: "Electrical & Plumbing", status: "completed", date: "20 Sep 2026", note: "Conduit lines installed" },
        { name: "Painting & Cladding", status: "in-progress", date: "Target 15 Nov", note: "Primer & Balcony tiling" },
        { name: "Key Handover", status: "pending", date: "Target 15 Dec", note: "Final walk-through" }
      ];

      timelineList.innerHTML = stages.map((st, i) => `
        <div class="timeline-step ${st.status}">
          <div class="timeline-marker">${st.status === 'completed' ? '✓' : (i + 1)}</div>
          <div class="timeline-content">
            <div class="timeline-title-row">
              <span class="timeline-title">${st.name}</span>
              <span class="badge ${st.status === 'completed' ? 'badge-ready' : (st.status === 'in-progress' ? 'badge-pending' : '')}">${st.status.toUpperCase()}</span>
            </div>
            <div class="timeline-note">${st.note || ''} &bull; <span style="color: var(--text-dim);">${st.date || ''}</span></div>
          </div>
        </div>
      `).join('');
    }

    // 3. Customer Latest Photo Preview & Scope Box
    const latestPhotoEl = document.getElementById('customerLatestPhotoPreview');
    if (latestPhotoEl) {
      const photos = unit.photos || [];
      if (photos.length > 0) {
        const p = photos[0];
        latestPhotoEl.innerHTML = `
          <div class="photo-card" style="margin-bottom: 0;">
            <img src="${p.url}" alt="${p.title}" class="photo-img" style="height: 160px;">
            <div class="photo-caption">
              <div class="photo-title">${p.title}</div>
              <div class="photo-meta">
                <span class="badge badge-semifinished">${p.stage}</span>
                <span>${p.timestamp}</span>
              </div>
              <div class="photo-notes">${p.notes}</div>
            </div>
          </div>
        `;
      } else {
        latestPhotoEl.innerHTML = `<p style="font-size: 0.82rem; color: var(--text-dim);">No photos uploaded yet.</p>`;
      }
    }

    const scopeBox = document.getElementById('customerScopeBox');
    if (scopeBox) {
      const inc = unit.scopeIncluded || ["Structure", "Plaster"];
      const exc = unit.scopeExcluded || ["Interior Furniture"];
      scopeBox.innerHTML = `
        <div style="margin-bottom: 12px;">
          <div style="font-size: 0.75rem; color: #34d399; font-weight: 700; text-transform: uppercase;">Aari Construction Deliverables:</div>
          <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">
            ${inc.map(x => `✓ ${x}`).join('<br>')}
          </div>
        </div>
        <div>
          <div style="font-size: 0.75rem; color: #f43f5e; font-weight: 700; text-transform: uppercase;">Your Contractor Scope:</div>
          <div style="font-size: 0.8rem; color: var(--text-dim); margin-top: 4px;">
            ${exc.length > 0 ? exc.map(x => `✗ ${x}`).join('<br>') : 'None (Turnkey House)'}
          </div>
        </div>
      `;
    }

    // 4. Customer Full Photo Grid
    const fullPhotoGrid = document.getElementById('customerFullPhotoGrid');
    if (fullPhotoGrid) {
      const photos = unit.photos || [];
      if (photos.length === 0) {
        fullPhotoGrid.innerHTML = `<p style="color: var(--text-muted);">No photos available for your unit yet.</p>`;
      } else {
        fullPhotoGrid.innerHTML = photos.map(p => `
          <div class="photo-card">
            <img src="${p.url}" alt="${p.title}" class="photo-img">
            <div class="photo-caption">
              <div class="photo-title">${p.title}</div>
              <div class="photo-meta">
                <span class="badge badge-semifinished">${p.stage}</span>
                <span>${p.timestamp}</span>
              </div>
              <div class="photo-notes">${p.notes}</div>
            </div>
          </div>
        `).join('');
      }
    }

    // 5. Customer Existing Requests List
    const custReqList = document.getElementById('customerExistingRequestsList');
    if (custReqList) {
      const custs = unit.customizations || [];
      if (custs.length === 0) {
        custReqList.innerHTML = `<p style="font-size: 0.8rem; color: var(--text-dim);">You have not submitted any customization requests yet.</p>`;
      } else {
        custReqList.innerHTML = custs.map(c => `
          <div style="background: rgba(0,0,0,0.3); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 12px; margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <strong>${c.title}</strong>
              <span class="badge ${c.status === 'Approved' ? 'badge-ready' : 'badge-pending'}">${c.status}</span>
            </div>
            <div style="font-size: 0.78rem; color: var(--text-muted);">${c.description}</div>
            <div style="font-size: 0.72rem; color: var(--text-dim); margin-top: 6px; display: flex; justify-content: space-between;">
              <span>Ref: ${c.id} &bull; ${c.category}</span>
              <span style="color: #6ee7b7;">Cost Impact: ${c.costImpact}</span>
            </div>
          </div>
        `).join('');
      }
    }

    // 6. Customer Delivery & Schedule Details
    const delivCard = document.getElementById('customerDeliveryDetailsCard');
    if (delivCard) {
      delivCard.innerHTML = `
        <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 22px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
            <div>
              <h3 style="font-size: 1.2rem; font-weight: 700;">Guaranteed Handover Plan</h3>
              <p style="font-size: 0.85rem; color: var(--text-muted);">${unit.projectName} &mdash; ${unit.number}</p>
            </div>
            <span class="badge badge-ready">ON TRACK</span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-bottom: 22px;">
            <div style="background: rgba(0,0,0,0.3); padding: 14px; border-radius: var(--radius-sm);">
              <div style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase;">Selected Package</div>
              <div style="font-size: 1.1rem; font-weight: 700; color: var(--accent-amber-light);">${unit.package}</div>
            </div>
            <div style="background: rgba(0,0,0,0.3); padding: 14px; border-radius: var(--radius-sm);">
              <div style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase;">Expected Date</div>
              <div style="font-size: 1.1rem; font-weight: 700; color: #34d399;">${unit.expectedHandover}</div>
            </div>
            <div style="background: rgba(0,0,0,0.3); padding: 14px; border-radius: var(--radius-sm);">
              <div style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase;">Remaining Work</div>
              <div style="font-size: 1.1rem; font-weight: 700; color: var(--accent-cyan);">${100 - unit.progress}% Remaining</div>
            </div>
          </div>

          <div style="border-top: 1px solid var(--border-subtle); padding-top: 16px;">
            <h4 style="font-size: 0.9rem; font-weight: 700; color: #fff; margin-bottom: 8px;">Why your house is delivered on-schedule:</h4>
            <ul style="font-size: 0.8rem; color: var(--text-muted); padding-left: 20px; line-height: 1.8;">
              <li><strong>Independent Package Gates:</strong> Because you selected the <em>${unit.package}</em> package, your handover is tied only to structure and cladding, not the interior decor of neighboring apartments.</li>
              <li><strong>Concurrent Customization:</strong> Any requested changes are processed concurrently so electrical or plastering works are not delayed.</li>
              <li><strong>Digital Inspection Certificate:</strong> Once cladding and paint inspection completes, you receive the key handover pass without waiting for complex-wide inauguration.</li>
            </ul>
          </div>
        </div>
      `;
    }
  }

  /* =========================================================================
     SITE PHOTO UPLOAD SIMULATOR
     ========================================================================= */
  handleSitePhotoUpload() {
    const url = document.getElementById('photoSelectPreset').value;
    const stage = document.getElementById('photoStage').value;
    const title = document.getElementById('photoTitle').value;
    const notes = document.getElementById('photoNotes').value;

    const newPhoto = {
      id: `ph-new-${Date.now()}`,
      title: title || 'Field Inspection Photo',
      stage: stage || 'Painting',
      timestamp: 'Just Now (Floor Engineer)',
      url: url,
      notes: notes || 'Verified by on-site supervisor.'
    };

    // Attach to selected unit
    let targetUnit = null;
    this.data.projects.forEach(p => {
      p.blocks?.forEach(b => {
        b.units?.forEach(u => {
          if (u.id === this.state.selectedUnitId) {
            if (!u.photos) u.photos = [];
            u.photos.unshift(newPhoto);
            targetUnit = u;
          }
        });
      });
    });

    this.closeModal('uploadModal');
    this.saveState();
    this.showToast(`Photo "${title}" posted to ${targetUnit?.number || 'Unit'} site log!`, 'success');
    this.renderAll();
  }

  /* =========================================================================
     CUSTOMER CUSTOMIZATION SUBMISSION WORKFLOW
     ========================================================================= */
  handleCustomerCustomizationSubmit() {
    const category = document.getElementById('reqCategory').value;
    const title = document.getElementById('reqTitle').value;
    const description = document.getElementById('reqDescription').value;

    const newId = `CR-${Math.floor(1000 + Math.random() * 9000)}`;

    const newReq = {
      id: newId,
      category: category,
      title: title,
      description: description,
      status: 'Pending',
      date: 'Today',
      costImpact: '+ ₹6,500 (Est.)',
      timeImpact: '0 days (Concurrent)'
    };

    // Attach to current customer unit
    this.data.projects.forEach(p => {
      p.blocks?.forEach(b => {
        b.units?.forEach(u => {
          if (u.id === this.state.currentCustomerId) {
            if (!u.customizations) u.customizations = [];
            u.customizations.unshift(newReq);
          }
        });
      });
    });

    // Reset form
    document.getElementById('customizationRequestForm').reset();
    this.saveState();
    this.showToast(`Request #${newId} submitted! Under review by Aari's Lead Engineer.`, 'success');
    this.renderAll();
  }

  /* =========================================================================
     TEAM PRESENTATION DIVISION RENDERING
     ========================================================================= */
  renderTeamAllocation() {
    const grid = document.getElementById('hldTeamGrid');
    if (!grid) return;

    grid.innerHTML = this.data.teamBreakdown.map(m => `
      <div class="team-member-card">
        <div class="team-member-title">
          <span>${m.member}</span>
          <span style="font-size: 0.72rem; color: #a78bfa;">${m.role}</span>
        </div>
        <div class="team-member-focus">${m.focus}</div>
      </div>
    `).join('');
  }

  /* =========================================================================
     MODAL & TOAST HELPERS
     ========================================================================= */
  openModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.add('active');
  }

  closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove('active');
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    const icon = type === 'success' ? '✅' : (type === 'error' ? '❌' : 'ℹ️');
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
}

// Instantiate on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  window.aariApp = new AariConstructionApp();
});
