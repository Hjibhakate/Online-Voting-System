
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');

  if (loginForm) {
    loginForm.addEventListener('submit', function (event) {
      event.preventDefault();

      const voterId = document.getElementById('voterId').value;
      const password = document.getElementById('password').value;

      fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voterId, password }),
        credentials: 'include' // IMPORTANT: allows cookies for session
      })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          // Redirect to dashboard
          window.location.href = '/dashboard';
        } else {
          alert(data.message || 'Login failed');
        }
      })
      .catch(error => {
        console.error('Login error:', error);
        alert('An error occurred during login.');
      });
    });
  }

  // Handle register link click
  const registerLink = document.querySelector('a[href="/register"]');
  if (registerLink) {
    registerLink.addEventListener('click', function (event) {
      event.preventDefault();
      window.location.href = '/register';
    });
  }
});
