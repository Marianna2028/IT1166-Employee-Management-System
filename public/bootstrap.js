'use strict';
(function () {
  const loginView = document.querySelector('#loginView');
  const dashboardView = document.querySelector('#dashboardView');
  const dashboardRoute = window.location.pathname === '/dashboard';
  loginView.classList.toggle('view-hidden', dashboardRoute);
  dashboardView.classList.toggle('view-hidden', !dashboardRoute);
  document.body.classList.toggle('login-page-body', !dashboardRoute);
  document.title = dashboardRoute ? 'Dashboard | Employee Management System' : 'Sign in | Employee Management System';
  const script = document.createElement('script');
  script.src = dashboardRoute ? '/assets/app.js' : '/assets/login.js';
  script.defer = true;
  document.body.appendChild(script);
})();
