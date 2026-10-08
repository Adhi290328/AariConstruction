/**
 * AARI CONSTRUCTION — Application Controller
 * Handles view switching, authentication, interactive quotation estimator,
 * request lifecycle, site owner contact flow, and admin verification pipeline.
 * Admin view is strictly isolated to managing client requests and construction stages:
 * Pending, Approved, Needs to Start, Processing, Finished, Rejected.
 */

import {
  CONFIG,
  PREVIOUS_PROJECTS,
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
    this.activeAdminFilter = 'all';
    this.adminSearchQuery = '';

    // History & Navigation State Tracking
    this.currentView = 'landing';
    this.currentClientTab = 'categoriesTab';
    this.currentAdminTab = 'allTab';

    this.initElements();
    this.bindEvents();
    this.renderPortfolio();
    this.renderCategories();
    
    // Set initial baseline history state
    if (!history.state) {
      const initialView = (this.currentUser && this.currentUser.role === 'admin') ? 'admin' : 'landing';
      history.replaceState({ view: initialView }, '', window.location.hash || '#home');
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

    // Admin Nav Count Badges
    this.adminAllCount = document.getElementById('adminAllCount');
    this.adminPendingNavCount = document.getElementById('adminPendingNavCount');
    this.adminNeedsStartNavCount = document.getElementById('adminNeedsStartNavCount');
    this.adminProcessingNavCount = document.getElementById('adminProcessingNavCount');
    this.adminFinishedNavCount = document.getElementById('adminFinishedNavCount');
    this.adminRejectedNavCount = document.getElementById('adminRejectedNavCount');

    // On-Page Stage & Client Tab Badges
    this.clientPillRequestCount = document.getElementById('clientPillRequestCount');
    this.pillCountAll = document.getElementById('pillCountAll');
    this.pillCountPending = document.getElementById('pillCountPending');
    this.pillCountNeedsStart = document.getElementById('pillCountNeedsStart');
    this.pillCountProcessing = document.getElementById('pillCountProcessing');
    this.pillCountFinished = document.getElementById('pillCountFinished');
    this.pillCountRejected = document.getElementById('pillCountRejected');

    // Buttons
    this.btnOpenLoginModal = document.getElementById('btnOpenLoginModal');
    this.btnLogout = document.getElementById('btnLogout');
    this.btnMobileToggle = document.getElementById('btnMobileToggle');
    this.mobileDrawer = document.getElementById('mobileDrawer');
    this.mobileDrawerContent = document.getElementById('mobileDrawerContent');
    this.brandLogoBtn = document.getElementById('brandLogoBtn');

    // Step-back Buttons
    this.btnBackFromClient = document.getElementById('btnBackFromClient');
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

    // Admin Progress Modal Elements
    this.adminProgressModal = document.getElementById('adminProgressModal');
    this.btnCloseProgressModal = document.getElementById('btnCloseProgressModal');
    this.btnCancelProgressModal = document.getElementById('btnCancelProgressModal');
    this.adminProgressForm = document.getElementById('adminProgressForm');
    this.progressReqId = document.getElementById('progressReqId');
    this.progressClientPreview = document.getElementById('progressClientPreview');
    this.selectConstructionStage = document.getElementById('selectConstructionStage');
    this.rangeProgressPercent = document.getElementById('rangeProgressPercent');
    this.progressPercentDisplay = document.getElementById('progressPercentDisplay');
    this.inputStageNotes = document.getElementById('inputStageNotes');

    // Admin Reject Modal Elements
    this.adminRejectModal = document.getElementById('adminRejectModal');
    this.btnCloseRejectModal = document.getElementById('btnCloseRejectModal');
    this.btnCancelRejectModal = document.getElementById('btnCancelRejectModal');
    this.adminRejectForm = document.getElementById('adminRejectForm');
    this.rejectReqId = document.getElementById('rejectReqId');
    this.rejectClientPreview = document.getElementById('rejectClientPreview');
    this.rejectReason = document.getElementById('rejectReason');

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
    this.metricNeedsStart = document.getElementById('metricNeedsStart');
    this.metricProcessing = document.getElementById('metricProcessing');
    this.metricFinished = document.getElementById('metricFinished');
    this.metricRejected = document.getElementById('metricRejected');

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

    // Brand Logo Click
    this.brandLogoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // Admin should stay strictly in admin portal and NOT go to landing page
      if (this.currentUser && this.currentUser.role === 'admin') {
        this.switchView('admin', false);
        this.switchAdminTab('allTab', false);
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
        // Redirect directly to Admin Portal (never show landing)
        this.switchView('admin', true);
      } else {
        this.adminLoginError.classList.remove('hidden');
      }
    });

    // Logout: Only logout takes the user/admin back to landing page
    this.btnLogout.addEventListener('click', () => {
      this.saveUserSession(null);
      this.switchView('landing', true);
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

    // On-Page Stage Tab Switcher Pills (Admin)
    document.querySelectorAll('.stage-tab-pill[data-stage-tab]').forEach(pill => {
      pill.addEventListener('click', () => {
        const target = pill.getAttribute('data-stage-tab');
        this.switchAdminTab(target);
      });
    });

    // On-Page Client Tab Switcher Pills
    document.querySelectorAll('.stage-tab-pill[data-client-pill]').forEach(pill => {
      pill.addEventListener('click', () => {
        const target = pill.getAttribute('data-client-pill');
        this.switchClientTab(target);
      });
    });

    // Interactive Admin Metric KPI Cards (Click to switch to relevant stage tab)
    document.querySelectorAll('.metric-card[data-kpi-target]').forEach(card => {
      card.addEventListener('click', () => {
        const target = card.getAttribute('data-kpi-target');
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
      const val = e.target.value;
      if (val === 'all') this.switchAdminTab('allTab');
      else if (val === 'Pending') this.switchAdminTab('pendingTab');
      else if (val === 'Needs to Start') this.switchAdminTab('needsStartTab');
      else if (val === 'Processing') this.switchAdminTab('processingTab');
      else if (val === 'Finished') this.switchAdminTab('finishedTab');
      else if (val === 'Rejected') this.switchAdminTab('rejectedTab');
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

    // Admin Progress Modal Events
    this.btnCloseProgressModal.addEventListener('click', () => this.closeProgressModal());
    this.btnCancelProgressModal.addEventListener('click', () => this.closeProgressModal());
    this.adminProgressModal.addEventListener('click', (e) => {
      if (e.target === this.adminProgressModal) this.closeProgressModal();
    });
    this.rangeProgressPercent.addEventListener('input', (e) => {
      this.progressPercentDisplay.textContent = `${e.target.value}%`;
    });
    this.adminProgressForm.addEventListener('submit', (e) => this.handleProgressSubmit(e));

    // Admin Reject Modal Events
    this.btnCloseRejectModal.addEventListener('click', () => this.closeRejectModal());
    this.btnCancelRejectModal.addEventListener('click', () => this.closeRejectModal());
    this.adminRejectModal.addEventListener('click', (e) => {
      if (e.target === this.adminRejectModal) this.closeRejectModal();
    });
    this.adminRejectForm.addEventListener('submit', (e) => this.handleRejectSubmit(e));

    // Client Scroll To Categories
    if (this.btnScrollToCategories) {
      this.btnScrollToCategories.addEventListener('click', () => {
        this.switchClientTab('categoriesTab');
      });
    }
  }

  /* ---------------------------------------------------------------------
     MOBILE POPSTATE / BACK BUTTON HANDLER
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

    // 3. For Admin: NEVER go back to landing page! Stay strictly in Admin view
    if (this.currentUser && this.currentUser.role === 'admin') {
      if (this.currentAdminTab !== 'allTab') {
        this.switchAdminTab('allTab', false);
      }
      return;
    }

    // 4. For Client / Guests:
    if (e.state && e.state.view) {
      this.switchView(e.state.view, false);
      if (e.state.view === 'client' && e.state.tab) {
        this.switchClientTab(e.state.tab, false);
      }
      return;
    }

    // 5. Fallback navigation step-back for client:
    if (this.currentView === 'client') {
      if (this.currentClientTab && this.currentClientTab !== 'categoriesTab') {
        this.switchClientTab('categoriesTab', false);
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
    // CRITICAL: Admin should NEVER see or be redirected to landing page
    if (this.currentUser && this.currentUser.role === 'admin' && viewName === 'landing') {
      viewName = 'admin';
    }

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
        history.pushState({ view: 'admin', tab: this.currentAdminTab || 'allTab' }, '', '#admin');
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
    if (this.currentUser && this.currentUser.role === 'client') {
      const myCount = this.requests.filter(r => 
        (r.clientEmail && r.clientEmail.toLowerCase() === this.currentUser.email.toLowerCase()) ||
        (r.clientName && r.clientName.toLowerCase() === this.currentUser.name.toLowerCase())
      ).length;
      if (this.userRequestCount) {
        this.userRequestCount.textContent = myCount;
      }
      if (this.clientPillRequestCount) {
        this.clientPillRequestCount.textContent = myCount;
      }
    }
    this.updateAdminKPIs();
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

    if (this.currentUser && this.currentUser.role === 'client') {
      this.inqClientName.value = this.currentUser.name;
      this.inqClientEmail.value = this.currentUser.email;
    }

    this.inqBHKSelect.innerHTML = '';
    category.bhkOptions.forEach(opt => {
      const el = document.createElement('option');
      el.value = opt;
      el.textContent = opt;
      this.inqBHKSelect.appendChild(el);
    });

    this.inqBudgetSlider.min = category.minBudget;
    this.inqBudgetSlider.max = category.maxBudget;
    this.inqBudgetSlider.step = 250000;
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
      status: "Pending", // Pending | Approved | Rejected
      assignedFlat: "",
      constructionStage: "Pending", // Needs to Start | Processing | Finished | Rejected
      progressPercent: 0,
      progressStageNotes: "Awaiting phone verification call for token advance payment.",
      adminNotes: "New registration inquiry. Awaiting phone call for manual payment verification."
    };

    this.requests.unshift(newReq);
    saveRequests(this.requests);

    if (!this.currentUser) {
      this.saveUserSession({
        role: 'client',
        name: name,
        email: email
      });
    }

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
      // When approving, default construction stage to "Needs to Start"
      if (!req.constructionStage || req.constructionStage === 'Pending') {
        req.constructionStage = 'Needs to Start';
        req.progressPercent = 10;
        req.progressStageNotes = 'Advance verified. Architectural drawings & foundation excavation in prep.';
      }
      saveRequests(this.requests);
      this.closeApprovalModal();
      this.renderAdminDashboard();
    }
  }

  /* ---------------------------------------------------------------------
     MODAL CONTROLS: BUILDING CONSTRUCTION PROGRESS UPDATE
     --------------------------------------------------------------------- */
  openProgressModal(reqId) {
    const req = this.requests.find(r => r.id === reqId);
    if (!req) return;

    this.progressReqId.value = req.id;
    this.selectConstructionStage.value = req.constructionStage || 'Needs to Start';
    this.rangeProgressPercent.value = req.progressPercent || (req.constructionStage === 'Finished' ? 100 : 30);
    this.progressPercentDisplay.textContent = `${this.rangeProgressPercent.value}%`;
    this.inputStageNotes.value = req.progressStageNotes || '';

    this.progressClientPreview.innerHTML = `
      <div style="background:var(--bg-card); padding:0.85rem; border-radius:var(--radius-md); margin-bottom:1rem; font-size:0.85rem;">
        <div style="font-weight:700; color:#fff; font-size:1rem; margin-bottom:0.25rem;">
          ${this.escapeHtml(req.clientName)} — <strong>${this.escapeHtml(req.assignedFlat || req.category)}</strong>
        </div>
        <div style="color:var(--text-muted); display:flex; flex-wrap:wrap; gap:1rem;">
          <span>Ref: <strong style="color:var(--gold-400);">${req.id}</strong></span>
          <span>Category: <strong>${this.escapeHtml(req.category)} (${this.escapeHtml(req.bhk)})</strong></span>
          <span>Location: <strong>${this.escapeHtml(req.city)}</strong></span>
        </div>
      </div>
    `;

    this.openModal(this.adminProgressModal, 'progress');
  }

  closeProgressModal() {
    this.closeModal(this.adminProgressModal);
  }

  handleProgressSubmit(e) {
    e.preventDefault();
    const reqId = this.progressReqId.value;
    const stage = this.selectConstructionStage.value;
    const pct = parseInt(this.rangeProgressPercent.value, 10);
    const notes = this.inputStageNotes.value.trim();

    const req = this.requests.find(r => r.id === reqId);
    if (req) {
      req.constructionStage = stage;
      req.progressPercent = pct;
      req.progressStageNotes = notes;
      if (stage === 'Finished') {
        req.progressPercent = 100;
      }
      saveRequests(this.requests);
      this.closeProgressModal();
      this.renderAdminDashboard();
    }
  }

  /* ---------------------------------------------------------------------
     MODAL CONTROLS: ADMIN REJECT INQUIRY
     --------------------------------------------------------------------- */
  openRejectModal(reqId) {
    const req = this.requests.find(r => r.id === reqId);
    if (!req) return;

    this.rejectReqId.value = req.id;
    this.rejectReason.value = req.adminNotes || 'Client declined / budget mismatch during verification call.';
    this.rejectClientPreview.innerHTML = `
      Reject inquiry for <strong>${this.escapeHtml(req.clientName)}</strong> (${req.id} - ${req.category})?
    `;

    this.openModal(this.adminRejectModal, 'reject');
  }

  closeRejectModal() {
    this.closeModal(this.adminRejectModal);
  }

  handleRejectSubmit(e) {
    e.preventDefault();
    const reqId = this.rejectReqId.value;
    const reason = this.rejectReason.value.trim();

    const req = this.requests.find(r => r.id === reqId);
    if (req) {
      req.status = 'Rejected';
      req.constructionStage = 'Rejected';
      req.adminNotes = reason;
      saveRequests(this.requests);
      this.closeRejectModal();
      this.renderAdminDashboard();
    }
  }

  /* ---------------------------------------------------------------------
     RENDER METHODS: PORTFOLIO & CATEGORIES
     --------------------------------------------------------------------- */
  renderPortfolio() {
    const filter = this.activePortfolioFilter;
    const projectList = PREVIOUS_PROJECTS || HISTORICAL_PROJECTS;
    const filtered = filter === 'all' 
      ? projectList 
      : projectList.filter(p => p.category === filter);

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

    const grid = document.getElementById('portfolioGrid') || document.getElementById('historicalGrid');
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

    // Sync Header Nav Tabs
    document.querySelectorAll('#clientNav .nav-tab').forEach(t => t.classList.remove('active'));
    const tabBtn = document.querySelector(`#clientNav [data-target-tab="${tabName}"]`);
    if (tabBtn) tabBtn.classList.add('active');

    // Sync On-Page Tab Pills
    document.querySelectorAll('#clientPageTabBar .stage-tab-pill').forEach(p => p.classList.remove('active'));
    const pillBtn = document.querySelector(`#clientPageTabBar [data-client-pill="${tabName}"]`);
    if (pillBtn) {
      pillBtn.classList.add('active');
      pillBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }

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
        const stage = req.constructionStage || 'Needs to Start';
        statusClass = stage === 'Finished' ? 'finished' : (stage === 'Processing' ? 'processing' : 'needs_start');
        statusLabel = `Approved • ${stage} (${req.progressPercent || 0}%) • Unit: ${req.assignedFlat || 'Confirmed'}`;
      } else if (req.status === 'Rejected') {
        statusClass = 'rejected';
        statusLabel = 'Rejected / Cancelled';
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
            ${req.progressStageNotes ? `
              <div style="background:var(--bg-card); padding:0.6rem 0.85rem; border-radius:var(--radius-sm); font-size:0.82rem; margin-top:0.75rem; color:var(--text-secondary);">
                🏗️ <strong>Site Status:</strong> ${this.escapeHtml(req.progressStageNotes)}
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
    const needsStart = this.requests.filter(r => r.constructionStage === 'Needs to Start').length;
    const processing = this.requests.filter(r => r.constructionStage === 'Processing').length;
    const finished = this.requests.filter(r => r.constructionStage === 'Finished').length;
    const rejected = this.requests.filter(r => r.status === 'Rejected').length;

    // KPI Cards
    if (this.metricTotal) this.metricTotal.textContent = total;
    if (this.metricPending) this.metricPending.textContent = pending;
    if (this.metricNeedsStart) this.metricNeedsStart.textContent = needsStart;
    if (this.metricProcessing) this.metricProcessing.textContent = processing;
    if (this.metricFinished) this.metricFinished.textContent = finished;
    if (this.metricRejected) this.metricRejected.textContent = rejected;

    // Header Nav Counts
    if (this.adminAllCount) this.adminAllCount.textContent = total;
    if (this.adminPendingNavCount) this.adminPendingNavCount.textContent = pending;
    if (this.adminNeedsStartNavCount) this.adminNeedsStartNavCount.textContent = needsStart;
    if (this.adminProcessingNavCount) this.adminProcessingNavCount.textContent = processing;
    if (this.adminFinishedNavCount) this.adminFinishedNavCount.textContent = finished;
    if (this.adminRejectedNavCount) this.adminRejectedNavCount.textContent = rejected;

    // On-Page Stage Tab Badges
    if (this.pillCountAll) this.pillCountAll.textContent = total;
    if (this.pillCountPending) this.pillCountPending.textContent = pending;
    if (this.pillCountNeedsStart) this.pillCountNeedsStart.textContent = needsStart;
    if (this.pillCountProcessing) this.pillCountProcessing.textContent = processing;
    if (this.pillCountFinished) this.pillCountFinished.textContent = finished;
    if (this.pillCountRejected) this.pillCountRejected.textContent = rejected;

    // Synchronize active indicator on KPI cards
    document.querySelectorAll('.metric-card[data-kpi-target]').forEach(card => {
      const target = card.getAttribute('data-kpi-target');
      if (target === this.currentAdminTab) {
        card.classList.add('active-kpi');
      } else {
        card.classList.remove('active-kpi');
      }
    });
  }

  switchAdminTab(tabName, pushHistory = true) {
    this.currentAdminTab = tabName;
    document.querySelectorAll('.admin-tab-pane').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('#adminNav .nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('#adminPageTabBar .stage-tab-pill').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.metric-card[data-kpi-target]').forEach(c => c.classList.remove('active-kpi'));

    // Sync Header Tab
    const tabBtn = document.querySelector(`#adminNav [data-admin-tab="${tabName}"]`);
    if (tabBtn) tabBtn.classList.add('active');

    // Sync On-Page Pill & Auto-Scroll
    const pillBtn = document.querySelector(`#adminPageTabBar [data-stage-tab="${tabName}"]`);
    if (pillBtn) {
      pillBtn.classList.add('active');
      pillBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }

    // Sync KPI Card
    const activeKpi = document.querySelector(`.metric-card[data-kpi-target="${tabName}"]`);
    if (activeKpi) activeKpi.classList.add('active-kpi');

    if (tabName === 'addCustomerTab') {
      document.getElementById('paneAddCustomer').classList.add('active');
    } else {
      document.getElementById('paneRequests').classList.add('active');
      
      // Update filter based on tab
      if (tabName === 'pendingTab') this.activeAdminFilter = 'Pending';
      else if (tabName === 'needsStartTab') this.activeAdminFilter = 'Needs to Start';
      else if (tabName === 'processingTab') this.activeAdminFilter = 'Processing';
      else if (tabName === 'finishedTab') this.activeAdminFilter = 'Finished';
      else if (tabName === 'rejectedTab') this.activeAdminFilter = 'Rejected';
      else this.activeAdminFilter = 'all';

      if (this.adminStatusFilter) {
        this.adminStatusFilter.value = this.activeAdminFilter;
      }
      this.renderAdminRequests();
    }

    if (pushHistory) {
      history.pushState({ view: 'admin', tab: tabName }, '', '#' + tabName);
    }
  }

  renderAdminRequests() {
    let list = [...this.requests];

    // Filter by stage/status
    if (this.activeAdminFilter !== 'all') {
      if (this.activeAdminFilter === 'Pending') {
        list = list.filter(r => r.status === 'Pending');
      } else if (this.activeAdminFilter === 'Rejected') {
        list = list.filter(r => r.status === 'Rejected');
      } else {
        list = list.filter(r => r.constructionStage === this.activeAdminFilter);
      }
    }

    // Search query
    if (this.adminSearchQuery) {
      list = list.filter(r => 
        (r.clientName && r.clientName.toLowerCase().includes(this.adminSearchQuery)) ||
        (r.clientPhone && r.clientPhone.toLowerCase().includes(this.adminSearchQuery)) ||
        (r.assignedFlat && r.assignedFlat.toLowerCase().includes(this.adminSearchQuery)) ||
        (r.category && r.category.toLowerCase().includes(this.adminSearchQuery)) ||
        (r.id && r.id.toLowerCase().includes(this.adminSearchQuery))
      );
    }

    if (list.length === 0) {
      this.adminRequestsTable.innerHTML = `
        <div style="background:var(--bg-surface); padding:3rem; border-radius:var(--radius-lg); text-align:center; border:1px solid var(--border-card);">
          <div style="font-size:2.5rem; margin-bottom:0.75rem;">🔍</div>
          <h3 style="color:#fff; font-size:1.25rem;">No Requests Found</h3>
          <p style="color:var(--text-muted);">No records match your selected stage (${this.activeAdminFilter}).</p>
        </div>
      `;
      return;
    }

    this.adminRequestsTable.innerHTML = list.map(req => {
      const isPending = req.status === 'Pending';
      const isApproved = req.status === 'Approved';
      const isRejected = req.status === 'Rejected';

      const stage = req.constructionStage || (isPending ? 'Pending' : (isRejected ? 'Rejected' : 'Needs to Start'));
      let stageClass = 'needs_start';
      let stageLabel = 'Needs to Start';
      if (stage === 'Processing') { stageClass = 'processing'; stageLabel = 'Processing / In Progress'; }
      else if (stage === 'Finished') { stageClass = 'finished'; stageLabel = 'Finished / Completed'; }
      else if (stage === 'Pending') { stageClass = 'pending'; stageLabel = 'Pending Verification'; }
      else if (stage === 'Rejected') { stageClass = 'rejected'; stageLabel = 'Rejected / Cancelled'; }

      const pct = req.progressPercent || (stage === 'Finished' ? 100 : (stage === 'Processing' ? 60 : 0));

      return `
        <div class="admin-req-card ${isPending ? 'pending' : (isApproved ? 'approved' : 'cancelled')}">
          <div class="admin-req-content">
            <div class="admin-req-header" style="flex-wrap:wrap;">
              <span class="req-id-pill">${req.id}</span>
              <span class="client-name-title">${this.escapeHtml(req.clientName)}</span>
              <span class="status-badge ${isPending ? 'pending' : (isApproved ? 'approved' : 'rejected')}">
                ${req.status}
              </span>
              <span class="status-badge ${stageClass}">
                ${stageLabel}
              </span>
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
                <span>Approx Built-up</span>
                <span>~${req.approxSqft ? req.approxSqft.toLocaleString() : 'N/A'} sq.ft</span>
              </div>
              <div class="admin-req-grid-item">
                <span>City Location</span>
                <span>${this.escapeHtml(req.city || 'Tamil Nadu')}</span>
              </div>
              <div class="admin-req-grid-item">
                <span>Submission Date</span>
                <span>${req.createdAt}</span>
              </div>
            </div>

            ${req.assignedFlat ? `
              <div style="background:rgba(16,185,129,0.15); border:1px solid rgba(16,185,129,0.35); padding:0.45rem 0.75rem; border-radius:var(--radius-sm); font-size:0.85rem; color:#6ee7b7; display:inline-block; margin-bottom:0.5rem;">
                🏢 <strong>Allotted Unit / Flat:</strong> ${this.escapeHtml(req.assignedFlat)}
              </div>
            ` : ''}

            ${isApproved ? `
              <!-- Construction Lifecycle Progress Bar -->
              <div class="building-stage-bar">
                <div class="stage-bar-header">
                  <span class="stage-bar-title">
                    <span>${stage === 'Finished' ? '🏆' : (stage === 'Processing' ? '⚙️' : '🏗️')}</span>
                    <span>Building Stage: <strong>${stageLabel}</strong></span>
                  </span>
                  <span class="stage-bar-pct">${pct}% Complete</span>
                </div>
                <div class="progress-track">
                  <div class="progress-fill ${stageClass}" style="width: ${pct}%;"></div>
                </div>
                ${req.progressStageNotes ? `
                  <div class="stage-notes-snippet">
                    📍 <strong>Site Progress Note:</strong> ${this.escapeHtml(req.progressStageNotes)}
                  </div>
                ` : ''}
              </div>
            ` : ''}

            ${isPending ? `
              <div>
                <span class="manual-call-notice">
                  ⚠️ Action Required: Call and verify payment manual
                </span>
              </div>
            ` : ''}

            ${req.adminNotes ? `
              <div style="font-size:0.82rem; color:var(--text-muted); margin-top:0.4rem;">
                <strong>Admin Remarks:</strong> ${this.escapeHtml(req.adminNotes)}
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
              <button class="btn btn-danger btn-open-reject-action" data-req-id="${req.id}" style="font-size:0.82rem;">
                ❌ Reject Request
              </button>
            ` : ''}

            ${isApproved ? `
              <button class="btn btn-primary btn-update-stage-action" data-req-id="${req.id}" style="font-size:0.82rem;">
                ⚙️ Update Stage & %
              </button>
              <button class="btn btn-outline btn-edit-allotment" data-req-id="${req.id}" style="font-size:0.82rem;">
                ✏️ Edit Flat No
              </button>
            ` : ''}

            ${isRejected ? `
              <button class="btn btn-outline btn-reopen-action" data-req-id="${req.id}" style="font-size:0.82rem;">
                🔄 Re-Open Inquiry
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

    document.querySelectorAll('.btn-open-reject-action').forEach(btn => {
      btn.addEventListener('click', () => {
        const reqId = btn.getAttribute('data-req-id');
        this.openRejectModal(reqId);
      });
    });

    document.querySelectorAll('.btn-update-stage-action').forEach(btn => {
      btn.addEventListener('click', () => {
        const reqId = btn.getAttribute('data-req-id');
        this.openProgressModal(reqId);
      });
    });

    document.querySelectorAll('.btn-edit-allotment').forEach(btn => {
      btn.addEventListener('click', () => {
        const reqId = btn.getAttribute('data-req-id');
        this.openApprovalModal(reqId);
      });
    });

    document.querySelectorAll('.btn-reopen-action').forEach(btn => {
      btn.addEventListener('click', () => {
        const reqId = btn.getAttribute('data-req-id');
        const req = this.requests.find(r => r.id === reqId);
        if (req) {
          req.status = 'Pending';
          req.constructionStage = 'Pending';
          req.adminNotes = 'Re-opened inquiry by Admin for manual verification.';
          saveRequests(this.requests);
          this.renderAdminDashboard();
        }
      });
    });
  }

  renderAdminApprovedGrid() {
    if (!this.adminApprovedGrid) return;
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
          <span style="font-size:0.75rem; color:var(--emerald-500); font-weight:800; text-transform:uppercase;">${item.constructionStage || 'ACTIVE'}</span>
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
      constructionStage: "Needs to Start",
      progressPercent: 10,
      progressStageNotes: "Allotted directly by Admin. Architectural planning & foundation excavation underway.",
      adminNotes: "Added directly by Admin Aarikrishnan. Payment verified."
    };

    this.requests.unshift(newReq);
    saveRequests(this.requests);

    alert(`Customer ${name} registered successfully with unit "${flatNo}"!`);
    this.adminAddCustomerForm.reset();
    this.switchAdminTab('needsStartTab');
  }

  /* ---------------------------------------------------------------------
     MOBILE DRAWER NAVIGATION
     --------------------------------------------------------------------- */
  renderMobileDrawer() {
    let linksHtml = '';
    if (this.currentUser && this.currentUser.role === 'admin') {
      const curTab = this.currentAdminTab || 'allTab';
      linksHtml = `
        <button class="nav-tab ${curTab==='allTab'?'active':''}" data-admin-tab="allTab">All Inquiries (${this.requests.length})</button>
        <button class="nav-tab ${curTab==='pendingTab'?'active':''}" data-admin-tab="pendingTab">⏳ Pending (${this.requests.filter(r=>r.status==='Pending').length})</button>
        <button class="nav-tab ${curTab==='needsStartTab'?'active':''}" data-admin-tab="needsStartTab">🏗️ Needs to Start (${this.requests.filter(r=>r.constructionStage==='Needs to Start').length})</button>
        <button class="nav-tab ${curTab==='processingTab'?'active':''}" data-admin-tab="processingTab">⚙️ Processing (${this.requests.filter(r=>r.constructionStage==='Processing').length})</button>
        <button class="nav-tab ${curTab==='finishedTab'?'active':''}" data-admin-tab="finishedTab">🏆 Finished (${this.requests.filter(r=>r.constructionStage==='Finished').length})</button>
        <button class="nav-tab ${curTab==='rejectedTab'?'active':''}" data-admin-tab="rejectedTab">❌ Rejected (${this.requests.filter(r=>r.status==='Rejected').length})</button>
        <button class="nav-tab ${curTab==='addCustomerTab'?'active':''}" data-admin-tab="addCustomerTab">+ Add Customer (Flat No)</button>
      `;
    } else if (this.currentUser) {
      const curTab = this.currentClientTab || 'categoriesTab';
      const myCount = this.requests.filter(r => 
        (r.clientEmail && r.clientEmail.toLowerCase() === (this.currentUser.email || '').toLowerCase()) ||
        (r.clientName && r.clientName.toLowerCase() === (this.currentUser.name || '').toLowerCase())
      ).length;
      linksHtml = `
        <button class="nav-tab ${curTab==='categoriesTab'?'active':''}" data-target-tab="categoriesTab">Explore Categories</button>
        <button class="nav-tab ${curTab==='myRequestsTab'?'active':''}" data-target-tab="myRequestsTab">My Requests (${myCount})</button>
        <button class="nav-tab ${curTab==='portfolioTab'?'active':''}" data-target-tab="portfolioTab">Previous Projects</button>
        <button class="btn btn-outline w-full mt-sm btn-drawer-back-showcase">← Back to Showcase</button>
      `;
    } else {
      linksHtml = `
        <a href="#heroSection" class="nav-link">Home</a>
        <a href="#projectsSection" class="nav-link">Previous Projects</a>
        <a href="#categoriesSection" class="nav-link">Categories</a>
        <a href="#ownerSection" class="nav-link">About Owner</a>
        <button class="btn btn-primary w-full mt-sm btn-trigger-login">Sign In / Login</button>
      `;
    }

    this.mobileDrawerContent.innerHTML = linksHtml;

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
