// Main login page JavaScript

function loginWithGoogle() {
    // Add loading state to button
    const btn = document.querySelector('.google-login-btn');
    const originalText = btn.innerHTML;
    
    btn.innerHTML = '<span class="spinner"></span> Connecting to Google...';
    btn.disabled = true;
    
    // Redirect to Google OAuth
    window.location.href = '/auth/google';
}

// Add some interactive effects
document.addEventListener('DOMContentLoaded', function() {
    // Animate features on load
    const features = document.querySelectorAll('.feature');
    features.forEach((feature, index) => {
        feature.style.opacity = '0';
        feature.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            feature.style.transition = 'all 0.5s ease';
            feature.style.opacity = '1';
            feature.style.transform = 'translateX(0)';
        }, 200 * (index + 1));
    });
    
    // Animate steps
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        step.style.opacity = '0';
        step.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            step.style.transition = 'all 0.6s ease';
            step.style.opacity = '1';
            step.style.transform = 'translateY(0)';
        }, 150 * (index + 1));
    });
    
    // Add hover effect to login button
    const loginBtn = document.querySelector('.google-login-btn');
    loginBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px) scale(1.02)';
    });
    
    loginBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Check if user is already logged in
fetch('/api/user')
    .then(response => response.json())
    .then(data => {
        if (data.success && data.user) {
            // User is already logged in, redirect to dashboard
            window.location.href = '/dashboard';
        }
    })
    .catch(error => {
        // User not logged in, stay on login page
        console.log('User not logged in');
    });