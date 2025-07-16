// Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Load user information
    loadUserInfo();
    
    // Load statistics
    loadStats();
    
    // Add animations
    animateElements();
});

async function loadUserInfo() {
    try {
        const response = await fetch('/api/user');
        const data = await response.json();
        
        if (data.success && data.user) {
            // Update user information
            document.getElementById('userName').textContent = data.user.name || 'User';
            document.getElementById('userEmail').textContent = data.user.email;
            
            // Update last login
            if (data.user.last_login) {
                const lastLogin = new Date(data.user.last_login);
                document.getElementById('lastLogin').textContent = lastLogin.toLocaleString();
            } else {
                document.getElementById('lastLogin').textContent = 'First time login';
            }
        } else {
            // User not authenticated, redirect to login
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Error loading user info:', error);
        // Redirect to login on error
        window.location.href = '/';
    }
}

async function loadStats() {
    try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        
        if (data.success && data.stats) {
            // Animate number updates
            animateNumber('totalUsers', 0, data.stats.total_users, 2000);
            animateNumber('verifiedUsers', 0, data.stats.verified_users, 2500);
            animateNumber('activeUsers', 0, data.stats.active_users, 3000);
        }
    } catch (error) {
        console.error('Error loading stats:', error);
        // Show fallback values
        document.getElementById('totalUsers').textContent = 'N/A';
        document.getElementById('verifiedUsers').textContent = 'N/A';
        document.getElementById('activeUsers').textContent = 'N/A';
    }
}

function animateNumber(elementId, start, end, duration) {
    const element = document.getElementById(elementId);
    const startTime = performance.now();
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(start + (end - start) * easeOutQuart);
        
        element.textContent = current.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        } else {
            element.textContent = end.toLocaleString();
        }
    }
    
    requestAnimationFrame(updateNumber);
}

async function logout() {
    try {
        // Show loading state
        const logoutBtn = document.querySelector('.logout-btn');
        const originalText = logoutBtn.innerHTML;
        logoutBtn.innerHTML = '<span class="spinner"></span> Logging out...';
        logoutBtn.disabled = true;
        
        const response = await fetch('/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Show success message briefly
            showMessage('Logged out successfully!', 'success');
            
            // Redirect to login page
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        } else {
            showMessage('Error logging out. Please try again.', 'error');
            logoutBtn.innerHTML = originalText;
            logoutBtn.disabled = false;
        }
    } catch (error) {
        console.error('Error logging out:', error);
        showMessage('Network error. Please try again.', 'error');
        
        // Reset button
        const logoutBtn = document.querySelector('.logout-btn');
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
        logoutBtn.disabled = false;
    }
}

function showMessage(message, type = 'info') {
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;
    messageEl.textContent = message;
    messageEl.style.position = 'fixed';
    messageEl.style.top = '20px';
    messageEl.style.right = '20px';
    messageEl.style.zIndex = '9999';
    messageEl.style.maxWidth = '300px';
    messageEl.style.padding = '15px 20px';
    messageEl.style.borderRadius = '8px';
    messageEl.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    messageEl.style.animation = 'slideInRight 0.3s ease-out';
    
    // Add to page
    document.body.appendChild(messageEl);
    
    // Remove after delay
    setTimeout(() => {
        messageEl.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 300);
    }, 3000);
}

function animateElements() {
    // Animate stat cards
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 200 * (index + 1));
    });
    
    // Animate dashboard header
    const header = document.querySelector('.dashboard-header');
    header.style.opacity = '0';
    header.style.transform = 'translateY(-20px)';
    
    setTimeout(() => {
        header.style.transition = 'all 0.6s ease';
        header.style.opacity = '1';
        header.style.transform = 'translateY(0)';
    }, 100);
    
    // Animate features
    const features = document.querySelectorAll('.feature');
    features.forEach((feature, index) => {
        feature.style.opacity = '0';
        feature.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            feature.style.transition = 'all 0.5s ease';
            feature.style.opacity = '1';
            feature.style.transform = 'translateX(0)';
        }, 100 * (index + 1));
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
}

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);

// Auto-refresh stats every 30 seconds
setInterval(loadStats, 30000);