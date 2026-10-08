/**
 * AARI CONSTRUCTION — Application Controller
 * Handles view switching, authentication, interactive quotation estimator,
 * request lifecycle, site owner contact flow, and admin verification pipeline.
 * Includes complete Mobile Back-Button navigation support (popstate/history stack).
 */

import {
  CONFIG,
  HISTORICAL_PROJECTS,
  CATEGORIES,
  CUSTOMIZATION_TIERS,
  getRequests,
  saveRequests
} from './data.js';

class AariApp {
  constructor() {
    this.requests = getRequests();
    this.currentUser = this.loadUserSession();
    this.activePortfolioFilter = 'all';
    this.selectedCategory = CATEGORIES[0];
    this.activeAdminStatusFilter = 'Pending';
    this.adminSearchQuery = '';

    // History & Navigation State Tracking
    this.currentView = 'landing';
    this.currentClientTab = 'categoriesTab';
    this.currentAdminTab = 'requestsTab';

    this.initElements();
    this.bindEvents();
    this.renderPortfolio();
    this.renderCategories();
    
    // Set initial baseline history state
    if (!history.state) {
      history.replaceState({ view: 'landing' }, '', window.location.hash || '#home');
    }

    // Resume session or show landing page
    if (this.currentUser) {
      if (this.currentUser.role === 'admin') {
        this.switchView('admin', false);
      } else {
        this.switchView('client', false);
      }
    } else {
      this.switchView('landing', false);
    }
  }

  /* ---------------------------------------------------------------------
     STATE & SESSION MANAGEMENT
     --------------------------------------------------------------------- */
  loadUserSession() {
    try {
      const saved = sessionStorage.getItem('aari_user_session');
      return saved ? JSON.parse(saved) : null;
    } catch (_) {
      return null;
    }
  }

  saveUserSession(user) {
    this.currentUser = user;
    if (user) {
      sessionStorage.setItem('aari_user_session', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('aari_user_session');
    }
    this.updateHeaderAuthState();
  }

  /* ---------------------------------------------------------------------
     DOM ELEMENT INITIALIZATION
     --------------------------------------------------------------------- */
  initElements() {
    // Views
    this.viewLanding = document.getElementById('viewLanding');
    this.viewClientPortal = document.getElementById('viewClientPortal');
    this.viewAdminDashboard = document.getElementById('viewAdminDashboard');

    // Nav bars
    this.landingNav = document.getElementById('landingNav');
    this.clientNav = document.getElementById('clientNav');
    this.adminNav = document.getElementById('adminNav');

    // Header Auth
    this.unauthControls = document.getElementById('unauthControls');
    this.authControls = document.getElementById('authControls');
    this.headerAvatar = document.getElementById('headerAvatar');
    this.headerUserName = document.getElementById('headerUserName');
    this.headerUserRole = document.getElementById('headerUserRole');
    this.userRequestCount = document.getElementById('userRequestCount');
    this.pendingRequestCount = document.getElementById('pendingRequestCount');

    // Buttons
    this.btnOpenLoginModal = document.getElementById('btnOpenLoginModal');
    this.btnLogout = document.getElementById('btnLogout');
    this.btnMobileToggle = document.getElementById('btnMobileToggle');
    this.mobileDrawer = document.getElementById('mobileDrawer');
    this.mobileDrawerContent = document.getElementById('mobileDrawerContent');
    this.brandLogoBtn = document.getElementById('brandLogoBtn');

    // Step-back Buttons
    this.btnBackFromClient = document.getElementById('btnBackFromClient');
    this.btnBackFromAdmin = document.getElementById('btnBackFromAdmin');
    this.btnCancelInquiryModal = document.getElementById('btnCancelInquiryModal');

    // Modals
    this.loginModal = document.getElementById('loginModal');
    this.btnCloseLoginModal = document.getElementById('btnCloseLoginModal');
    this.inquiryModal = document.getElementById('inquiryModal');
    this.btnCloseInquiryModal = document.getElementById('btnCloseInquiryModal');
    this.confirmationModal = document.getElementById('confirmationModal');
    this.btnCloseConfirmationModal = document.getElementById('btnCloseConfirmationModal');
    this.adminApprovalModal = document.getElementById('adminApprovalModal');
    this.btnCloseApprovalModal = document.getElementById('btnCloseApprovalModal');
    this.btnCancelApprovalModal = document.getElementById('btnCancelApprovalModal');

    // Login Form Elements
    this.tabBtnClient = document.getElementById('tabBtnClient');
    this.tabBtnAdmin = document.getElementById('tabBtnAdmin');
    this.clientLoginForm = document.getElementById('clientLoginForm');
    this.adminLoginForm = document.getElementById('adminLoginForm');
    this.clientLoginName = document.getElementById('clientLoginName');
    this.clientLoginEmail = document.getElementById('clientLoginEmail');
    this.adminLoginUser = document.getElementById('adminLoginUser');
    this.adminLoginPass = document.getElementById('adminLoginPass');
    this.adminLoginError = document.getElementById('adminLoginError');
    this.btnAutofillAdmin = document.getElementById('btnAutofillAdmin');

    // Inquiry Form Elements
    this.categoryInquiryForm = document.getElementById('categoryInquiryForm');
    this.inquiryCatBadge = document.getElementById('inquiryCatBadge');
    this.inquiryModalTitle = document.getElementById('inquiryModalTitle');
    this.inquiryModalSubtitle = document.getElementById('inquiryModalSubtitle');
    this.inquiryCategoryId = document.getElementById('inquiryCategoryId');
    this.inquiryCategoryName = document.getElementById('inquiryCategoryName');
    this.inqClientName = document.getElementById('inqClientName');
    this.inqClientPhone = document.getElementById('inqClientPhone');
    this.inqClientEmail = document.getElementById('inqClientEmail');
    this.inqClientCity = document.getElementById('inqClientCity');
    this.inqBHKSelect = document.getElementById('inqBHKSelect');
    this.inqCustomTier = document.getElementById('inqCustomTier');
    this.inqBudgetSlider = document.getElementById('inqBudgetSlider');
    this.budgetFormattedVal = document.getElementById('budgetFormattedVal');
    this.budgetSliderMin = document.getElementById('budgetSliderMin');
    this.budgetSliderMid = document.getElementById('budgetSliderMid');
    this.budgetSliderMax = document.getElementById('budgetSliderMax');
    this.approxSqftVal = document.getElementById('approxSqftVal');
    this.approxRateVal = document.getElementById('approxRateVal');
    this.approxTimelineVal = document.getElementById('approxTimelineVal');
    this.inqNotes = document.getElementById('inqNotes');

    // Confirmation Modal Elements
    this.confirmRefId = document.getElementById('confirmRefId');
    this.confirmSummaryBox = document.getElementById('confirmSummaryBox');
    this.btnViewMyRequestsFromModal = document.getElementById('btnViewMyRequestsFromModal');

    // Admin Elements
    this.adminRequestsTable = document.getElementById('adminRequestsTable');
    this.adminApprovedGrid = document.getElementById('adminApprovedGrid');
    this.adminSearchInput = document.getElementById('adminSearchInput');
    this.adminStatusFilter = document.getElementById('adminStatusFilter');
    this.adminAddCustomerForm = document.getElementById('adminAddCustomerForm');
    this.btnAdminQuickAddCustomer = document.getElementById('btnAdminQuickAddCustomer');
    this.adminApprovalForm = document.getElementById('adminApprovalForm');
    this.approveReqId = document.getElementById('approveReqId');
    this.approvalClientPreview = document.getElementById('approvalClientPreview');
    this.assignFlatNumber = document.getElementById('assignFlatNumber');
    this.approvalAdminNotes = document.getElementById('approvalAdminNotes');

    // KPI Counters
    this.metricTotal = document.getElementById('metricTotal');
    this.metricPending = document.getElementById('metricPending');
    this.metricApproved = document.getElementById('metricApproved');
    this.metricCancelled = document.getElementById('metricCancelled');

    // Client Portal Elements
    this.clientWelcomeName = document.getElementById('clientWelcomeName');
    this.clientCategoriesGrid = document.getElementById('clientCategoriesGrid');
    this.clientRequestsList = document.getElementById('clientRequestsList');
    this.clientPortfolioGrid = document.getElementById('clientPortfolioGrid');
    this.tabCategoriesContent = document.getElementById('tabCategoriesContent');
    this.tabMyRequestsContent = document.getElementById('tabMyRequestsContent');
    this.tabPortfolioContent = document.getElementById('tabPortfolioContent');
    this.btnScrollToCategories = document.getElementById('btnScrollToCategories');
  }

  /* ---------------------------------------------------------------------
     EVENT BINDINGS
     --------------------------------------------------------------------- */
  bindEvents() {
    // Intercept Browser & Mobile Hardware Back Button (Popstate)
    window.addEventListener('popstate', (e) => this.handlePopState(e));

    // Brand Logo Click -> Go to Landing or Client Portal
    this.brandLogoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (this.currentUser && this.currentUser.role === 'admin') {
        this.switchView('admin');
      } else if (this.currentUser) {
        this.switchView('client');
      } else {
        this.switchView('landing');
      }
    });

    // Step-Back Buttons
    if (this.btnBackFromClient) {
      this.btnBackFromClient.addEventListener('click', () => this.switchView('landing'));
    }
    if (this.btnBackFromAdmin) {
      this.btnBackFromAdmin.addEventListener('click', () => this.switchView('landing'));
    }
    if (this.btnCancelInquiryModal) {
      this.btnCancelInquiryModal.addEventListener('click', () => this.closeInquiryModal());
    }

    // Login Modal Open
    this.btnOpenLoginModal.addEventListener('click', () => this.openLoginModal('client'));
    document.querySelectorAll('.btn-trigger-login').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = btn.getAttribute('data-tab') || 'client';
        this.openLoginModal(tab);
      });
    });

    // Login Modal Close
    this.btnCloseLoginModal.addEventListener('click', () => this.closeLoginModal());
    this.loginModal.addEventListener('click', (e) => {
      if (e.target === this.loginModal) this.closeLoginModal();
    });

    // Login Tabs Switcher
    this.tabBtnClient.addEventListener('click', () => this.switchLoginTab('client'));
    this.tabBtnAdmin.addEventListener('click', () => this.switchLoginTab('admin'));

    // Autofill Admin Credentials
    this.btnAutofillAdmin.addEventListener('click', () => {
      this.adminLoginUser.value = CONFIG.admin.username;
      this.adminLoginPass.value = CONFIG.admin.password;
    });

    // Form: Client Login
    this.clientLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = this.clientLoginName.value.trim();
      const email = this.clientLoginEmail.value.trim().toLowerCase();
      if (!name || !email) return;

      this.saveUserSession({
        role: 'client',
        name: name,
        email: email
      });
      this.closeLoginModal();
      this.switchView('client');
    });

    // Form: Admin Login
    this.adminLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = this.adminLoginUser.value.trim();
      const pass = this.adminLoginPass.value.trim();

      if (user === CONFIG.admin.username && pass === CONFIG.admin.password) {
        this.adminLoginError.classList.add('hidden');
        this.saveUserSession({
          role: 'admin',
          name: 'Aarikrishnan (Admin)',
          email: CONFIG.owner.email
        });
        this.closeLoginModal();
        this.switchView('admin');
      } else {
        this.adminLoginError.classList.remove('hidden');
      }
    });

    // Logout
    this.btnLogout.addEventListener('click', () => {
      this.saveUserSession(null);
      this.switchView('landing');
    });

    // Mobile Hamburger Menu
    this.btnMobileToggle.addEventListener('click', () => {
      const willOpen = !this.mobileDrawer.classList.contains('open');
      this.mobileDrawer.classList.toggle('open');
      this.renderMobileDrawer();
      if (willOpen) {
        history.pushState({ drawer: true }, '', '#menu');
      }
    });

    // Portfolio Filter Pills
    const filterPills = document.querySelectorAll('#portfolioFilter .filter-pill');
    filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.activePortfolioFilter = pill.getAttribute('data-filter');
        this.renderPortfolio();
      });
    });

    // Client Nav Tabs
    document.querySelectorAll('#clientNav .nav-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-target-tab');
        this.switchClientTab(target);
      });
    });

    // Admin Nav Tabs
    document.querySelectorAll('#adminNav .nav-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-admin-tab');
        this.switchAdminTab(target);
      });
    });

    // Inquire Direct buttons on Landing page
    document.querySelectorAll('.btn-inquire-direct').forEach(btn => {
      btn.addEventListener('click', () => {
        const catId = btn.getAttribute('data-cat');
        const cat = CATEGORIES.find(c => c.id === catId) || CATEGORIES[0];
        if (!this.currentUser) {
          this.openLoginModal('client');
        } else {
          this.openInquiryModal(cat);
        }
      });
    });

    // Inquiry Modal Close
    this.btnCloseInquiryModal.addEventListener('click', () => this.closeInquiryModal());
    this.inquiryModal.addEventListener('click', (e) => {
      if (e.target === this.inquiryModal) this.closeInquiryModal();
    });

    // Inquiry Slider & Tier calculation
    this.inqBudgetSlider.addEventListener('input', () => this.updateBudgetCalculations());
    this.inqCustomTier.addEventListener('change', () => this.updateBudgetCalculations());

    // Inquiry Form Submit
    this.categoryInquiryForm.addEventListener('submit', (e) => this.handleInquirySubmit(e));

    // Confirmation Modal Close
    this.btnCloseConfirmationModal.addEventListener('click', () => this.closeConfirmationModal());
    this.confirmationModal.addEventListener('click', (e) => {
      if (e.target === this.confirmationModal) this.closeConfirmationModal();
    });

    this.btnViewMyRequestsFromModal.addEventListener('click', () => {
      this.closeConfirmationModal();
      if (this.currentUser && this.currentUser.role === 'client') {
        this.switchView('client');
        this.switchClientTab('myRequestsTab');
      }
    });

    // Admin Search & Filter
    this.adminSearchInput.addEventListener('input', (e) => {
      this.adminSearchQuery = e.target.value.toLowerCase().trim();
      this.renderAdminRequests();
    });

    this.adminStatusFilter.addEventListener('change', (e) => {
      this.activeAdminStatusFilter = e.target.value;
      this.renderAdminRequests();
    });

    // Admin Quick Add Customer Button
    this.btnAdminQuickAddCustomer.addEventListener('click', () => {
      this.switchAdminTab('addCustomerTab');
    });

    // Admin Direct Add Customer Form Submit
    this.adminAddCustomerForm.addEventListener('submit', (e) => this.handleAdminAddCustomer(e));

    // Admin Approval Modal Close & Submit
    this.btnCloseApprovalModal.addEventListener('click', () => this.closeApprovalModal());
    this.btnCancelApprovalModal.addEventListener('click', () => this.closeApprovalModal());
    this.adminApprovalModal.addEventListener('click', (e) => {
      if (e.target === this.adminApprovalModal) this.closeApprovalModal();
    });
    this.adminApprovalForm.addEventListener('submit', (e) => this.handleApprovalSubmit(e));

    // Client Scroll To Categories
    if (this.btnScrollToCategories) {
      this.btnScrollToCategories.addEventListener('click', () => {
        this.switchClientTab('categoriesTab');
      });
    }
  }

  /* ---------------------------------------------------------------------
     MOBILE POPSTATE / BACK BUTTON HANDLER (1-Step Back Control)
     --------------------------------------------------------------------- */
  handlePopState(e) {
    // 1. If any modal is currently open, close it first and prevent page exit!
    const openModal = document.querySelector('.modal-backdrop.open');
    if (openModal) {
      openModal.classList.remove('open');
      return;
    }

    // 2. If mobile drawer menu is open, close it!
    if (this.mobileDrawer && this.mobileDrawer.classList.contains('open')) {
      this.mobileDrawer.classList.remove('open');
      return;
    }

    // 3. If there is a recorded view state in history, restore it
    if (e.state && e.state.view) {
      this.switchView(e.state.view, false);
      if (e.state.view === 'client' && e.state.tab) {
        this.switchClientTab(e.state.tab, false);
      } else if (e.state.view === 'admin' && e.state.tab) {
        this.switchAdminTab(e.state.tab, false);
      }
      return;
    }

    // 4. Fallback navigation step-back:
    if (this.currentView === 'client') {
      if (this.currentClientTab && this.currentClientTab !== 'categoriesTab') {
        this.switchClientTab('categoriesTab', false);
      } else {
        this.switchView('landing', false);
      }
    } else if (this.currentView === 'admin') {
      if (this.currentAdminTab && this.currentAdminTab !== 'requestsTab') {
        this.switchAdminTab('requestsTab', false);
      } else {
        this.switchView('landing', false);
      }
    }
  }

  /* ---------------------------------------------------------------------
     GENERIC MODAL CONTROLLER WITH HISTORY STACK
     --------------------------------------------------------------------- */
  openModal(modalEl, hashId) {
    if (!modalEl) return;
    modalEl.classList.add('open');
    history.pushState({ modal: modalEl.id }, '', '#' + hashId);
  }

  closeModal(modalEl) {
    if (!modalEl) return;
    if (modalEl.classList.contains('open')) {
      modalEl.classList.remove('open');
      if (history.state && history.state.modal === modalEl.id) {
        history.back();
      }
    }
  }

  /* ---------------------------------------------------------------------
     VIEW ROUTING & AUTH HEADER STATE
     --------------------------------------------------------------------- */
  switchView(viewName, pushHistory = true) {
    this.currentView = viewName;
    this.viewLanding.classList.remove('active');
    this.viewClientPortal.classList.remove('active');
    this.viewAdminDashboard.classList.remove('active');

    this.landingNav.classList.add('hidden');
    this.clientNav.classList.add('hidden');
    this.adminNav.classList.add('hidden');

    if (viewName === 'admin') {
      this.viewAdminDashboard.classList.add('active');
      this.adminNav.classList.remove('hidden');
      this.renderAdminDashboard();
      if (pushHistory) {
        history.pushState({ view: 'admin', tab: this.currentAdminTab || 'requestsTab' }, '', '#admin');
      }
    } else if (viewName === 'client') {
      this.viewClientPortal.classList.add('active');
      this.clientNav.classList.remove('hidden');
      this.renderClientPortal();
      if (pushHistory) {
        history.pushState({ view: 'client', tab: this.currentClientTab || 'categoriesTab' }, '', '#client');
      }
    } else {
      this.viewLanding.classList.add('active');
      this.landingNav.classList.remove('hidden');
      if (pushHistory) {
        history.pushState({ view: 'landing' }, '', '#home');
      }
    }

    this.updateHeaderAuthState();
    this.updatePendingCount();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  updateHeaderAuthState() {
    if (this.currentUser) {
      this.unauthControls.classList.add('hidden');
      this.authControls.classList.remove('hidden');

      if (this.currentUser.role === 'admin') {
        this.headerAvatar.textContent = 'A';
        this.headerAvatar.style.background = 'var(--gold-gradient)';
        this.headerUserName.textContent = 'Aari Admin';
        this.headerUserRole.textContent = 'Managing Director';
      } else {
        const initial = this.currentUser.name ? this.currentUser.name.charAt(0).toUpperCase() : 'U';
        this.headerAvatar.textContent = initial;
        this.headerAvatar.style.background = 'var(--emerald-500)';
        this.headerUserName.textContent = this.currentUser.name;
        this.headerUserRole.textContent = 'Client';
      }
    } else {
      this.unauthControls.classList.remove('hidden');
      this.authControls.classList.add('hidden');
    }
  }

  updatePendingCount() {
    const pending = this.requests.filter(r => r.status === 'Pending').length;
    if (this.pendingRequestCount) {
      this.pendingRequestCount.textContent = pending;
    }

    if (this.currentUser && this.currentUser.role === 'client') {
      const myCount = this.requests.filter(r => 
        (r.clientEmail && r.clientEmail.toLowerCase() === this.currentUser.email.toLowerCase()) ||
        (r.clientName && r.clientName.toLowerCase() === this.currentUser.name.toLowerCase())
      ).length;
      if (this.userRequestCount) {
        this.userRequestCount.textContent = myCount;
      }
    }
  }

  /* ---------------------------------------------------------------------
     MODAL CONTROLS: LOGIN
     --------------------------------------------------------------------- */
  openLoginModal(defaultTab = 'client') {
    this.switchLoginTab(defaultTab);
    this.adminLoginError.classList.add('hidden');
    this.openModal(this.loginModal, 'login');
  }

  closeLoginModal() {
    this.closeModal(this.loginModal);
  }

  switchLoginTab(tab) {
    if (tab === 'admin') {
      this.tabBtnAdmin.classList.add('active');
      this.tabBtnClient.classList.remove('active');
      this.adminLoginForm.classList.add('active');
      this.clientLoginForm.classList.remove('active');
    } else {
      this.tabBtnClient.classList.add('active');
      this.tabBtnAdmin.classList.remove('active');
      this.clientLoginForm.classList.add('active');
      this.adminLoginForm.classList.remove('active');
    }
  }

  /* ---------------------------------------------------------------------
     MODAL CONTROLS: INQUIRY & QUOTATION CALCULATOR
     --------------------------------------------------------------------- */
  openInquiryModal(category) {
    this.selectedCategory = category;
    this.inquiryCategoryId.value = category.id;
    this.inquiryCategoryName.value = category.name;
    this.inquiryCatBadge.textContent = category.name;
    this.inquiryModalTitle.textContent = `Configure Quotation — ${category.name}`;
    this.inquiryModalSubtitle = `Tailored estimates for ${category.name}. From Bare Bones structure to luxury turnkey finishing.`;

    // Populate user info if logged in
    if (this.currentUser && this.currentUser.role === 'client') {
      this.inqClientName.value = this.currentUser.name;
      this.inqClientEmail.value = this.currentUser.email;
    }

    // Populate BHK options
    this.inqBHKSelect.innerHTML = '';
    category.bhkOptions.forEach(opt => {
      const el = document.createElement('option');
      el.value = opt;
      el.textContent = opt;
      this.inqBHKSelect.appendChild(el);
    });

    // Setup Slider boundaries
    this.inqBudgetSlider.min = category.minBudget;
    this.inqBudgetSlider.max = category.maxBudget;
    this.inqBudgetSlider.step = 250000; // 2.5L increments
    this.inqBudgetSlider.value = category.defaultBudget;

    this.budgetSliderMin.textContent = this.formatCurrency(category.minBudget);
    this.budgetSliderMax.textContent = this.formatCurrency(category.maxBudget);
    this.budgetSliderMid.textContent = this.formatCurrency((category.minBudget + category.maxBudget) / 2);

    this.updateBudgetCalculations();
    this.openModal(this.inquiryModal, 'inquire');
  }

  closeInquiryModal() {
    this.closeModal(this.inquiryModal);
  }

  updateBudgetCalculations() {
    const rawVal = parseInt(this.inqBudgetSlider.value, 10);
    this.budgetFormattedVal.textContent = this.formatCurrency(rawVal);

    const tierId = this.inqCustomTier.value;
    const tier = CUSTOMIZATION_TIERS.find(t => t.id === tierId) || CUSTOMIZATION_TIERS[1];
    
    // Calculate rate based on category and tier
    const baseRate = this.selectedCategory.avgSqftRate || 2200;
    const effectiveRate = Math.round(baseRate * (tier.rateMultiplier || 1.2));
    const approxSqft = Math.round(rawVal / effectiveRate);

    this.approxSqftVal.textContent = `~${approxSqft.toLocaleString()} sq.ft`;
    this.approxRateVal.textContent = `₹${effectiveRate.toLocaleString()} / sq.ft`;

    if (approxSqft < 1500) {
      this.approxTimelineVal.textContent = '6 – 8 Months';
    } else if (approxSqft < 3500) {
      this.approxTimelineVal.textContent = '9 – 14 Months';
    } else {
      this.approxTimelineVal.textContent = '15 – 20 Months';
    }
  }

  handleInquirySubmit(e) {
    e.preventDefault();
    const name = this.inqClientName.value.trim();
    const phone = this.inqClientPhone.value.trim();
    const email = this.inqClientEmail.value.trim();
    const city = this.inqClientCity.value;
    const bhk = this.inqBHKSelect.value;
    const tierId = this.inqCustomTier.value;
    const tierObj = CUSTOMIZATION_TIERS.find(t => t.id === tierId) || CUSTOMIZATION_TIERS[1];
    const budgetVal = parseInt(this.inqBudgetSlider.value, 10);
    const notes = this.inqNotes.value.trim();

    // Calculate approx sqft
    const baseRate = this.selectedCategory.avgSqftRate || 2200;
    const effectiveRate = Math.round(baseRate * (tierObj.rateMultiplier || 1.2));
    const approxSqft = Math.round(budgetVal / effectiveRate);

    const refId = `REQ-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newReq = {
      id: refId,
      clientName: name,
      clientPhone: phone,
      clientEmail: email,
      category: this.selectedCategory.name,
      bhk: bhk,
      city: city,
      budgetNum: budgetVal,
      budgetText: this.formatCurrency(budgetVal),
      customizationTier: tierId,
      approxSqft: approxSqft,
      notes: notes || "Direct quotation request via portal.",
      createdAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      status: "Pending", // Pending | Approved | Cancelled
      assignedFlat: "",
      adminNotes: "New registration inquiry. Awaiting phone call for manual payment verification."
    };

    // Prepend to requests list
    this.requests.unshift(newReq);
    saveRequests(this.requests);

    // If user wasn't registered in current session, register them
    if (!this.currentUser) {
      this.saveUserSession({
        role: 'client',
        name: name,
        email: email
      });
    }

    // Close inquiry modal without pushing an extra back
    this.inquiryModal.classList.remove('open');
    this.openConfirmationModal(newReq);
    this.updatePendingCount();
  }

  /* ---------------------------------------------------------------------
     MODAL CONTROLS: CONFIRMATION & SITE OWNER INFO
     --------------------------------------------------------------------- */
  openConfirmationModal(req) {
    this.confirmRefId.textContent = req.id;
    const tierObj = CUSTOMIZATION_TIERS.find(t => t.id === req.customizationTier);
    const tierName = tierObj ? tierObj.name.split(':')[1] || tierObj.name : req.customizationTier;

    this.confirmSummaryBox.innerHTML = `
      <div class="confirm-summary-row">
        <span>Client Name:</span>
        <span>${this.escapeHtml(req.clientName)}</span>
      </div>
      <div class="confirm-summary-row">
        <span>Category & BHK:</span>
        <span>${this.escapeHtml(req.category)} (${this.escapeHtml(req.bhk)})</span>
      </div>
      <div class="confirm-summary-row">
        <span>Location:</span>
        <span>${this.escapeHtml(req.city)}</span>
      </div>
      <div class="confirm-summary-row">
        <span>Budget Range:</span>
        <span style="color:var(--gold-400);">${req.budgetText} (~${req.approxSqft.toLocaleString()} sq.ft)</span>
      </div>
      <div class="confirm-summary-row">
        <span>Customization:</span>
        <span>${tierName}</span>
      </div>
      <div class="confirm-summary-row">
        <span>Current Status:</span>
        <span class="status-badge pending">Pending Manual Call</span>
      </div>
    `;

    this.openModal(this.confirmationModal, 'confirmation');
  }

  closeConfirmationModal() {
    this.closeModal(this.confirmationModal);
  }

  /* ---------------------------------------------------------------------
     MODAL CONTROLS: ADMIN APPROVAL & ASSIGN FLAT
     --------------------------------------------------------------------- */
  openApprovalModal(reqId) {
    const req = this.requests.find(r => r.id === reqId);
    if (!req) return;

    this.approveReqId.value = req.id;
    this.assignFlatNumber.value = req.assignedFlat || '';
    this.approvalAdminNotes.value = req.adminNotes || 'Client contacted by phone. Advance token verified.';

    this.approvalClientPreview.innerHTML = `
      <div style="background:var(--bg-card); padding:0.85rem; border-radius:var(--radius-md); margin-bottom:1rem; font-size:0.85rem;">
        <div style="font-weight:700; color:#fff; font-size:1rem; margin-bottom:0.25rem;">
          ${this.escapeHtml(req.clientName)} — <span style="color:var(--gold-400);">${req.id}</span>
        </div>
        <div style="color:var(--text-muted); display:flex; flex-wrap:wrap; gap:1rem;">
          <span>📞 ${this.escapeHtml(req.clientPhone)}</span>
          <span>🏠 ${this.escapeHtml(req.category)} (${this.escapeHtml(req.bhk)})</span>
          <span>💰 ${req.budgetText}</span>
        </div>
      </div>
    `;

    this.openModal(this.adminApprovalModal, 'approval');
  }

  closeApprovalModal() {
    this.closeModal(this.adminApprovalModal);
  }

  handleApprovalSubmit(e) {
    e.preventDefault();
    const reqId = this.approveReqId.value;
    const flatNo = this.assignFlatNumber.value.trim();
    const notes = this.approvalAdminNotes.value.trim();

    const req = this.requests.find(r => r.id === reqId);
    if (req) {
      req.status = 'Approved';
      req.assignedFlat = flatNo;
      req.adminNotes = notes;
      saveRequests(this.requests);
      this.closeApprovalModal();
      this.renderAdminDashboard();
    }
  }

  /* ---------------------------------------------------------------------
     RENDER METHODS: PORTFOLIO & CATEGORIES
     --------------------------------------------------------------------- */
  renderPortfolio() {
    const filter = this.activePortfolioFilter;
    const filtered = filter === 'all' 
      ? HISTORICAL_PROJECTS 
      : HISTORICAL_PROJECTS.filter(p => p.category === filter);

    const html = filtered.map(item => `
      <div class="portfolio-card">
        <div class="portfolio-media">
          <img src="${item.image}" alt="${this.escapeHtml(item.title)}" loading="lazy">
          <span class="portfolio-tag">${this.escapeHtml(item.category)}</span>
          <span class="portfolio-year">Completed ${item.year}</span>
        </div>
        <div class="portfolio-body">
          <h3 class="portfolio-title">${this.escapeHtml(item.title)}</h3>
          <div class="portfolio-location">
            <span>📍</span>
            <span>${this.escapeHtml(item.location)}</span>
          </div>
          <p class="portfolio-desc">${this.escapeHtml(item.description)}</p>
          <div class="portfolio-specs-row">
            <span>Built-Up: <strong>${item.area}</strong></span>
            <span>Scale: <strong>${item.units}</strong></span>
          </div>
        </div>
      </div>
    `).join('');

    const grid = document.getElementById('historicalGrid');
    if (grid) grid.innerHTML = html;

    if (this.clientPortfolioGrid) {
      this.clientPortfolioGrid.innerHTML = html;
    }
  }

  renderCategories() {
    if (!this.clientCategoriesGrid) return;

    this.clientCategoriesGrid.innerHTML = CATEGORIES.map(cat => `
      <div class="client-cat-card">
        <div class="card-media">
          <img src="${cat.image}" alt="${this.escapeHtml(cat.name)}" loading="lazy">
          <span class="category-badge">${this.escapeHtml(cat.name)}</span>
        </div>
        <div class="card-body">
          <h3 class="card-title">${this.escapeHtml(cat.name)}</h3>
          <p class="card-price">${cat.priceRange}</p>
          <p class="card-desc">${this.escapeHtml(cat.tagline)}</p>
          <ul class="card-bullets">
            ${cat.highlights.map(h => `<li>✓ ${h}</li>`).join('')}
          </ul>
          <button class="btn btn-primary w-full btn-configure-cat" data-cat-id="${cat.id}">
            Configure Quotation & Inquire →
          </button>
        </div>
      </div>
    `).join('');

    // Attach click listeners to category cards
    document.querySelectorAll('.btn-configure-cat').forEach(btn => {
      btn.addEventListener('click', () => {
        const catId = btn.getAttribute('data-cat-id');
        const cat = CATEGORIES.find(c => c.id === catId);
        if (cat) this.openInquiryModal(cat);
      });
    });
  }

  /* ---------------------------------------------------------------------
     RENDER METHODS: CLIENT PORTAL
     --------------------------------------------------------------------- */
  renderClientPortal() {
    if (!this.currentUser) return;
    this.clientWelcomeName.textContent = this.currentUser.name;
    this.renderClientRequests();
    this.updatePendingCount();
  }

  switchClientTab(tabName, pushHistory = true) {
    this.currentClientTab = tabName;
    this.tabCategoriesContent.classList.remove('active');
    this.tabMyRequestsContent.classList.remove('active');
    this.tabPortfolioContent.classList.remove('active');

    document.querySelectorAll('#clientNav .nav-tab').forEach(t => t.classList.remove('active'));
    const tabBtn = document.querySelector(`#clientNav [data-target-tab="${tabName}"]`);
    if (tabBtn) tabBtn.classList.add('active');

    if (tabName === 'myRequestsTab') {
      this.tabMyRequestsContent.classList.add('active');
      this.renderClientRequests();
    } else if (tabName === 'portfolioTab') {
      this.tabPortfolioContent.classList.add('active');
      this.renderPortfolio();
    } else {
      this.tabCategoriesContent.classList.add('active');
    }

    if (pushHistory && tabName !== 'categoriesTab') {
      history.pushState({ view: 'client', tab: tabName }, '', '#' + tabName);
    }
  }

  renderClientRequests() {
    if (!this.currentUser) return;
    const userEmail = (this.currentUser.email || '').toLowerCase();
    const userName = (this.currentUser.name || '').toLowerCase();

    // Match requests for this customer
    const myRequests = this.requests.filter(r => 
      (r.clientEmail && r.clientEmail.toLowerCase() === userEmail) ||
      (r.clientName && r.clientName.toLowerCase() === userName)
    );

    if (myRequests.length === 0) {
      this.clientRequestsList.innerHTML = `
        <div style="background:var(--bg-surface); padding:2.5rem; border-radius:var(--radius-lg); text-align:center; border:1px solid var(--border-card);">
          <div style="font-size:2.5rem; margin-bottom:0.75rem;">📋</div>
          <h3 style="color:#fff; font-size:1.25rem; margin-bottom:0.4rem;">No Inquiries Submitted Yet</h3>
          <p style="color:var(--text-muted); max-width:480px; margin:0 auto 1.5rem;">
            You haven't submitted any quotation inquiries yet. Select a category below to generate an estimate.
          </p>
          <button class="btn btn-primary" id="btnGoToCatEmpty">Browse Categories</button>
        </div>
      `;
      const btn = document.getElementById('btnGoToCatEmpty');
      if (btn) btn.addEventListener('click', () => this.switchClientTab('categoriesTab'));
      return;
    }

    this.clientRequestsList.innerHTML = myRequests.map(req => {
      let statusClass = 'pending';
      let statusLabel = 'Pending Manual Verification (Call Needed)';
      if (req.status === 'Approved') {
        statusClass = 'approved';
        statusLabel = `Approved • Flat Allotted: ${req.assignedFlat || 'Confirmed'}`;
      } else if (req.status === 'Cancelled') {
        statusClass = 'cancelled';
        statusLabel = 'Cancelled';
      }

      return `
        <div class="user-req-card">
          <div class="user-req-info">
            <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.35rem;">
              <span class="req-id-pill">${req.id}</span>
              <span style="font-size:0.8rem; color:var(--text-dim);">${req.createdAt}</span>
            </div>
            <h3>${this.escapeHtml(req.category)} — ${this.escapeHtml(req.bhk)}</h3>
            <div class="user-req-meta">
              <span>Location: <strong>${this.escapeHtml(req.city)}</strong></span>
              <span>Budget: <strong style="color:var(--gold-400);">${req.budgetText}</strong></span>
              <span>Built-up: <strong>~${req.approxSqft.toLocaleString()} sq.ft</strong></span>
            </div>
            <div>
              <span class="status-badge ${statusClass}">${statusLabel}</span>
            </div>
            ${req.adminNotes ? `
              <div style="background:var(--bg-card); padding:0.6rem 0.85rem; border-radius:var(--radius-sm); font-size:0.82rem; margin-top:0.75rem; color:var(--text-secondary);">
                💬 <strong>Admin Update:</strong> ${this.escapeHtml(req.adminNotes)}
              </div>
            ` : ''}
          </div>
          <div style="display:flex; flex-direction:column; gap:0.5rem;">
            <a href="tel:+919876543210" class="btn btn-outline" style="font-size:0.82rem;">
              📞 Call Owner
            </a>
            <a href="https://wa.me/919876543210?text=Hello%20Aari%20Construction,%20regarding%20my%20request%20${req.id}" target="_blank" class="btn btn-secondary" style="font-size:0.82rem;">
              WhatsApp
            </a>
          </div>
        </div>
      `;
    }).join('');
  }

  /* ---------------------------------------------------------------------
     RENDER METHODS: ADMIN DASHBOARD
     --------------------------------------------------------------------- */
  renderAdminDashboard() {
    this.updateAdminKPIs();
    this.renderAdminRequests();
    this.renderAdminApprovedGrid();
  }

  updateAdminKPIs() {
    const total = this.requests.length;
    const pending = this.requests.filter(r => r.status === 'Pending').length;
    const approved = this.requests.filter(r => r.status === 'Approved').length;
    const cancelled = this.requests.filter(r => r.status === 'Cancelled').length;

    this.metricTotal.textContent = total;
    this.metricPending.textContent = pending;
    this.metricApproved.textContent = approved;
    this.metricCancelled.textContent = cancelled;
  }

  switchAdminTab(tabName, pushHistory = true) {
    this.currentAdminTab = tabName;
    document.querySelectorAll('.admin-tab-pane').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('#adminNav .nav-tab').forEach(t => t.classList.remove('active'));

    const tabBtn = document.querySelector(`#adminNav [data-admin-tab="${tabName}"]`);
    if (tabBtn) tabBtn.classList.add('active');

    if (tabName === 'approvedTab') {
      document.getElementById('paneApproved').classList.add('active');
      this.renderAdminApprovedGrid();
    } else if (tabName === 'addCustomerTab') {
      document.getElementById('paneAddCustomer').classList.add('active');
    } else {
      document.getElementById('paneRequests').classList.add('active');
      this.renderAdminRequests();
    }

    if (pushHistory && tabName !== 'requestsTab') {
      history.pushState({ view: 'admin', tab: tabName }, '', '#' + tabName);
    }
  }

  renderAdminRequests() {
    let list = [...this.requests];

    // Status filter
    if (this.activeAdminStatusFilter !== 'all') {
      list = list.filter(r => r.status === this.activeAdminStatusFilter);
    }

    // Search query
    if (this.adminSearchQuery) {
      list = list.filter(r => 
        (r.clientName && r.clientName.toLowerCase().includes(this.adminSearchQuery)) ||
        (r.clientPhone && r.clientPhone.toLowerCase().includes(this.adminSearchQuery)) ||
        (r.category && r.category.toLowerCase().includes(this.adminSearchQuery)) ||
        (r.id && r.id.toLowerCase().includes(this.adminSearchQuery))
      );
    }

    if (list.length === 0) {
      this.adminRequestsTable.innerHTML = `
        <div style="background:var(--bg-surface); padding:3rem; border-radius:var(--radius-lg); text-align:center; border:1px solid var(--border-card);">
          <div style="font-size:2.5rem; margin-bottom:0.75rem;">🔍</div>
          <h3 style="color:#fff; font-size:1.25rem;">No Requests Found</h3>
          <p style="color:var(--text-muted);">No records match your selected filter (${this.activeAdminStatusFilter}).</p>
        </div>
      `;
      return;
    }

    this.adminRequestsTable.innerHTML = list.map(req => {
      const isPending = req.status === 'Pending';
      const isApproved = req.status === 'Approved';
      const isCancelled = req.status === 'Cancelled';

      return `
        <div class="admin-req-card ${req.status.toLowerCase()}">
          <div class="admin-req-content">
            <div class="admin-req-header">
              <span class="req-id-pill">${req.id}</span>
              <span class="client-name-title">${this.escapeHtml(req.clientName)}</span>
              <span class="status-badge ${req.status.toLowerCase()}">${req.status}</span>
            </div>

            <div class="admin-req-grid">
              <div class="admin-req-grid-item">
                <span>Phone / Call</span>
                <span style="color:#60a5fa;">${this.escapeHtml(req.clientPhone)}</span>
              </div>
              <div class="admin-req-grid-item">
                <span>Category & Layout</span>
                <span>${this.escapeHtml(req.category)} (${this.escapeHtml(req.bhk)})</span>
              </div>
              <div class="admin-req-grid-item">
                <span>Target Quotation</span>
                <span style="color:var(--gold-400);">${req.budgetText}</span>
              </div>
              <div class="admin-req-grid-item">
                <span>Approx Area</span>
                <span>~${req.approxSqft ? req.approxSqft.toLocaleString() : 'N/A'} sq.ft</span>
              </div>
              <div class="admin-req-grid-item">
                <span>Location</span>
                <span>${this.escapeHtml(req.city || 'Tamil Nadu')}</span>
              </div>
              <div class="admin-req-grid-item">
                <span>Submission Date</span>
                <span>${req.createdAt}</span>
              </div>
            </div>

            ${req.notes ? `
              <div style="font-size:0.83rem; color:var(--text-secondary); margin-bottom:0.4rem;">
                <strong>Client Notes:</strong> "${this.escapeHtml(req.notes)}"
              </div>
            ` : ''}

            ${isApproved && req.assignedFlat ? `
              <div style="background:rgba(16,185,129,0.15); border:1px solid rgba(16,185,129,0.35); padding:0.45rem 0.75rem; border-radius:var(--radius-sm); font-size:0.85rem; color:#6ee7b7; display:inline-block; margin-top:0.35rem;">
                🏢 <strong>Allotted Unit:</strong> ${this.escapeHtml(req.assignedFlat)}
              </div>
            ` : ''}

            ${isPending ? `
              <div>
                <span class="manual-call-notice">
                  ⚠️ Action Required: Call and verify payment manual
                </span>
              </div>
            ` : ''}
          </div>

          <div class="admin-actions-col">
            <a href="tel:${req.clientPhone}" class="btn btn-secondary" style="font-size:0.82rem;">
              📞 Call Client
            </a>
            <a href="https://wa.me/${req.clientPhone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(req.clientName)},%20this%20is%20Mr.%20Aarikrishnan%20from%20Aari%20Construction%20regarding%20your%20inquiry%20${req.id}" target="_blank" class="btn btn-outline" style="font-size:0.82rem;">
              💬 WhatsApp
            </a>

            ${isPending ? `
              <button class="btn btn-success btn-approve-action" data-req-id="${req.id}" style="font-size:0.82rem;">
                ✅ Approve & Allot
              </button>
              <button class="btn btn-danger btn-cancel-action" data-req-id="${req.id}" style="font-size:0.82rem;">
                ❌ Cancel
              </button>
            ` : ''}

            ${isApproved ? `
              <button class="btn btn-outline btn-edit-allotment" data-req-id="${req.id}" style="font-size:0.82rem;">
                ✏️ Edit Flat No
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    // Attach Action Listeners
    document.querySelectorAll('.btn-approve-action').forEach(btn => {
      btn.addEventListener('click', () => {
        const reqId = btn.getAttribute('data-req-id');
        this.openApprovalModal(reqId);
      });
    });

    document.querySelectorAll('.btn-cancel-action').forEach(btn => {
      btn.addEventListener('click', () => {
        const reqId = btn.getAttribute('data-req-id');
        if (confirm(`Are you sure you want to cancel request ${reqId}?`)) {
          const req = this.requests.find(r => r.id === reqId);
          if (req) {
            req.status = 'Cancelled';
            req.adminNotes = 'Declined by admin during manual verification call.';
            saveRequests(this.requests);
            this.renderAdminDashboard();
          }
        }
      });
    });

    document.querySelectorAll('.btn-edit-allotment').forEach(btn => {
      btn.addEventListener('click', () => {
        const reqId = btn.getAttribute('data-req-id');
        this.openApprovalModal(reqId);
      });
    });
  }

  renderAdminApprovedGrid() {
    const approved = this.requests.filter(r => r.status === 'Approved');

    if (approved.length === 0) {
      this.adminApprovedGrid.innerHTML = `
        <div style="background:var(--bg-surface); padding:2rem; border-radius:var(--radius-lg); text-align:center; grid-column:1/-1;">
          <p style="color:var(--text-muted);">No approved units yet. Approve inquiries from the pipeline or use "+ Add Customer".</p>
        </div>
      `;
      return;
    }

    this.adminApprovedGrid.innerHTML = approved.map(item => `
      <div style="background:var(--bg-surface); border:1px solid rgba(16,185,129,0.3); border-radius:var(--radius-lg); padding:1.5rem; display:flex; flex-direction:column; gap:0.5rem;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.75rem; color:var(--emerald-500); font-weight:800; text-transform:uppercase;">APPROVED & ALLOTTED</span>
          <span class="req-id-pill">${item.id}</span>
        </div>
        <h3 style="color:#fff; font-size:1.3rem; margin:0.25rem 0;">${this.escapeHtml(item.assignedFlat || 'Flat Allotted')}</h3>
        <div style="font-size:0.95rem; font-weight:700; color:var(--gold-400);">
          Client: ${this.escapeHtml(item.clientName)}
        </div>
        <div style="font-size:0.84rem; color:var(--text-muted);">
          <span>📞 ${this.escapeHtml(item.clientPhone)}</span> • <span>✉️ ${this.escapeHtml(item.clientEmail)}</span>
        </div>
        <div style="border-top:1px solid var(--border-subtle); padding-top:0.6rem; margin-top:0.4rem; font-size:0.82rem; display:flex; justify-content:space-between;">
          <span>${item.category} (${item.bhk})</span>
          <strong style="color:#fff;">${item.budgetText}</strong>
        </div>
      </div>
    `).join('');
  }

  handleAdminAddCustomer(e) {
    e.preventDefault();
    const name = document.getElementById('newCustName').value.trim();
    const phone = document.getElementById('newCustPhone').value.trim();
    const email = document.getElementById('newCustEmail').value.trim();
    const category = document.getElementById('newCustCategory').value;
    const flatNo = document.getElementById('newCustFlatNo').value.trim();
    const bhk = document.getElementById('newCustBHK').value.trim();
    const budget = document.getElementById('newCustBudget').value.trim();
    const tier = document.getElementById('newCustTier').value;
    const notes = document.getElementById('newCustNotes').value.trim();

    const newReq = {
      id: `DIR-2026-${Math.floor(100 + Math.random() * 900)}`,
      clientName: name,
      clientPhone: phone,
      clientEmail: email,
      category: category,
      bhk: bhk,
      city: "Chennai (Direct Registration)",
      budgetNum: 5000000,
      budgetText: budget,
      customizationTier: tier,
      approxSqft: 1800,
      notes: notes || "Direct customer registration by admin with assigned flat.",
      createdAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      status: "Approved",
      assignedFlat: flatNo,
      adminNotes: "Added directly by Admin Aarikrishnan. Payment verified."
    };

    this.requests.unshift(newReq);
    saveRequests(this.requests);

    alert(`Customer ${name} registered successfully with unit "${flatNo}"!`);
    this.adminAddCustomerForm.reset();
    this.switchAdminTab('approvedTab');
  }

  /* ---------------------------------------------------------------------
     MOBILE DRAWER NAVIGATION
     --------------------------------------------------------------------- */
  renderMobileDrawer() {
    let linksHtml = '';
    if (this.currentUser && this.currentUser.role === 'admin') {
      linksHtml = `
        <button class="nav-tab active" data-admin-tab="requestsTab">Client Requests (${this.requests.filter(r => r.status==='Pending').length})</button>
        <button class="nav-tab" data-admin-tab="approvedTab">Approved Units</button>
        <button class="nav-tab" data-admin-tab="addCustomerTab">+ Add Customer</button>
        <button class="btn btn-outline w-full mt-sm btn-drawer-back-showcase">← Back to Showcase</button>
      `;
    } else if (this.currentUser) {
      linksHtml = `
        <button class="nav-tab active" data-target-tab="categoriesTab">Explore Categories</button>
        <button class="nav-tab" data-target-tab="myRequestsTab">My Requests</button>
        <button class="nav-tab" data-target-tab="portfolioTab">Completed Landmarks</button>
        <button class="btn btn-outline w-full mt-sm btn-drawer-back-showcase">← Back to Showcase</button>
      `;
    } else {
      linksHtml = `
        <a href="#heroSection" class="nav-link">Home</a>
        <a href="#historicalSection" class="nav-link">Historical Projects</a>
        <a href="#categoriesSection" class="nav-link">Categories</a>
        <a href="#ownerSection" class="nav-link">About Owner</a>
        <button class="btn btn-primary w-full mt-sm btn-trigger-login">Sign In / Login</button>
      `;
    }

    this.mobileDrawerContent.innerHTML = linksHtml;

    // Attach listeners in drawer
    this.mobileDrawerContent.querySelectorAll('.nav-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        this.mobileDrawer.classList.remove('open');
        const adminTab = btn.getAttribute('data-admin-tab');
        const clientTab = btn.getAttribute('data-target-tab');
        if (adminTab) this.switchAdminTab(adminTab);
        if (clientTab) this.switchClientTab(clientTab);
      });
    });

    this.mobileDrawerContent.querySelectorAll('.btn-drawer-back-showcase').forEach(btn => {
      btn.addEventListener('click', () => {
        this.mobileDrawer.classList.remove('open');
        this.switchView('landing');
      });
    });

    this.mobileDrawerContent.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        this.mobileDrawer.classList.remove('open');
      });
    });

    this.mobileDrawerContent.querySelectorAll('.btn-trigger-login').forEach(btn => {
      btn.addEventListener('click', () => {
        this.mobileDrawer.classList.remove('open');
        this.openLoginModal('client');
      });
    });
  }

  /* ---------------------------------------------------------------------
     HELPERS
     --------------------------------------------------------------------- */
  formatCurrency(num) {
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(2)} Crores`;
    } else if (num >= 100000) {
      return `₹${(num / 100000).toFixed(1)} Lakhs`;
    }
    return `₹${num.toLocaleString('en-IN')}`;
  }

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

// Bootstrap application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.aariApp = new AariApp();
});
