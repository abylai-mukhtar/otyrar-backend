<script>
async function adminLogin() {
  const user = document.getElementById('admin-user').value.trim();
  const pass = document.getElementById('admin-pass').value.trim();
  const err = document.getElementById('login-error');

  err.textContent = '';

  try {

    const res = await fetch('https://otyrar-backend.onrender.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user: user,
        pass: pass
      })
    });

    const data = await res.json();

    if (!res.ok) {
      err.textContent = data.error || 'Логин немесе пароль қате!';
      return;
    }

    localStorage.setItem('otyrar_token', data.token);

    window.location.href = 'dashboard.html';

  } catch (e) {
    err.textContent = 'Backend connection error!';
    console.error(e);
  }
}

// If already logged in
if (localStorage.getItem('otyrar_token')) {
  window.location.href = 'dashboard.html';
}

document.getElementById('admin-pass').addEventListener('keydown', e => {
  if (e.key === 'Enter') adminLogin();
});
</script>
