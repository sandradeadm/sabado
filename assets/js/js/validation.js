// ========== VALIDACIÓN DE CONTRASEÑA ==========

// Verificar que la contraseña cumpla con los requisitos de seguridad
function validarPassword(password) {
    const minLength = 8;
    const maxLength = 16;
    if (password.length < minLength || password.length > maxLength) return false;
    if (!/[A-Z]/.test(password)) return false; // Al menos una mayúscula
    if (!/[a-z]/.test(password)) return false; // // Al menos una minúscula
    if (!/[0-9]/.test(password)) return false; // Al menos un numero
    if (!/[!@#$%^&*()_\-+=\[\]{};:,.<>|\/?]/.test(password)) return false; // Al menos un caracter especial
    return true;
}