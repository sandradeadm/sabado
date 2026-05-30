// ========== FUNCIONALIDAD DE ALTERNAR CONTRASEÑA ==========
// Mostrar/Ocultar contraseña
const togglePassword = document.getElementById('togglePassword');
const eyeIcon = document.getElementById('eyeIcon');
const passwordInput = document.getElementById('password'); 
let passwordVisible = false;

togglePassword.onclick = function() {
    passwordVisible = !passwordVisible;
    passwordInput.type = passwordVisible ? 'text' : 'password';
    eyeIcon.innerHTML = passwordVisible
        ? `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.999 9.999 0 012.005-3.417M6.7 6.7A9.998 9.998 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.95 9.95 0 01-4.118 5.225M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l18 18" />`
        : `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />`;
};