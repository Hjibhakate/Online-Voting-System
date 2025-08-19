document.getElementById('registerForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const fullName = document.getElementById('fullName').value;
  const voterId = document.getElementById('voterId').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  fetch('http://localhost:5000/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fullName, voterId, email, password })
  })
  .then(response => response.json())
  .then(data => {
    if (data.status === 'success') {
      alert('Registration successful!');
      window.location.href = '/'; // Redirect to login
    } else {
      alert(data.message);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('An error occurred during registration.');
  });
});
