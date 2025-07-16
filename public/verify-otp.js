// OTP Verification JavaScript

let otpSentTime = null;
let countdownInterval = null;

document.addEventListener('DOMContentLoaded', function() {
    // Auto-send OTP when page loads
    sendOTP();
    
    // Setup OTP input handling
    setupOTPInputs();
    
    // Setup form submission
    document.getElementById('otpForm').addEventListener('submit', verifyOTP);
});

function setupOTPInputs() {
    const inputs = document.querySelectorAll('.otp-input');
    
    inputs.forEach((input, index) => {
        input.addEventListener('input', function(e) {
            // Only allow numbers
            this.value = this.value.replace(/[^0-9]/g, '');
            
            // Move to next input
            if (this.value.length === 1 && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
            
            // Check if all inputs are filled
            checkAllInputsFilled();
        });
        
        input.addEventListener('keydown', function(e) {
            // Move to previous input on backspace
            if (e.key === 'Backspace' && this.value === '' && index > 0) {
                inputs[index - 1].focus();
            }
        });
        
        input.addEventListener('paste', function(e) {
            e.preventDefault();
            const pastedData = e.clipboardData.getData('text');
            const numbers = pastedData.replace(/[^0-9]/g, '').slice(0, 6);
            
            // Fill inputs with pasted numbers
            inputs.forEach((inp, idx) => {
                if (numbers[idx]) {
                    inp.value = numbers[idx];
                }
            });
            
            // Focus on next empty input or last input
            const nextEmpty = Array.from(inputs).findIndex(inp => inp.value === '');
            if (nextEmpty !== -1) {
                inputs[nextEmpty].focus();
            } else {
                inputs[inputs.length - 1].focus();
            }
            
            checkAllInputsFilled();
        });
    });
}

function checkAllInputsFilled() {
    const inputs = document.querySelectorAll('.otp-input');
    const allFilled = Array.from(inputs).every(input => input.value.length === 1);
    
    const verifyBtn = document.getElementById('verifyBtn');
    verifyBtn.disabled = !allFilled;
    
    if (allFilled) {
        verifyBtn.classList.add('btn-ready');
    } else {
        verifyBtn.classList.remove('btn-ready');
    }
}

function getOTPValue() {
    const inputs = document.querySelectorAll('.otp-input');
    return Array.from(inputs).map(input => input.value).join('');
}

function clearOTPInputs() {
    const inputs = document.querySelectorAll('.otp-input');
    inputs.forEach(input => input.value = '');
    inputs[0].focus();
    checkAllInputsFilled();
}

function showMessage(message, type = 'error') {
    const container = document.getElementById('message-container');
    container.innerHTML = `<div class="message ${type}">${message}</div>`;
    
    // Auto-hide success messages
    if (type === 'success') {
        setTimeout(() => {
            container.innerHTML = '';
        }, 3000);
    }
}

function startCountdown() {
    otpSentTime = new Date();
    const countdownElement = document.getElementById('countdown');
    const resendBtn = document.getElementById('resendBtn');
    
    let timeLeft = 600; // 10 minutes in seconds
    
    countdownInterval = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        countdownElement.textContent = `Code expires in ${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            countdownElement.textContent = 'Code has expired. Please request a new one.';
            resendBtn.disabled = false;
            resendBtn.style.opacity = '1';
        } else if (timeLeft <= 60) {
            // Enable resend button in last minute
            resendBtn.disabled = false;
            resendBtn.style.opacity = '1';
        }
        
        timeLeft--;
    }, 1000);
    
    // Disable resend button initially
    resendBtn.disabled = true;
    resendBtn.style.opacity = '0.6';
    
    // Enable resend button after 30 seconds
    setTimeout(() => {
        resendBtn.disabled = false;
        resendBtn.style.opacity = '1';
    }, 30000);
}

async function sendOTP() {
    try {
        const response = await fetch('/send-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('OTP sent successfully! Check your email.', 'success');
            startCountdown();
            document.querySelector('.otp-input').focus();
        } else {
            showMessage(data.message || 'Failed to send OTP. Please try again.');
        }
    } catch (error) {
        console.error('Error sending OTP:', error);
        showMessage('Network error. Please check your connection.');
    }
}

async function resendOTP() {
    const resendBtn = document.getElementById('resendBtn');
    const originalText = resendBtn.innerHTML;
    
    resendBtn.innerHTML = '<span class="spinner"></span> Sending...';
    resendBtn.disabled = true;
    
    try {
        clearInterval(countdownInterval);
        clearOTPInputs();
        
        await sendOTP();
    } catch (error) {
        showMessage('Failed to resend OTP. Please try again.');
    } finally {
        resendBtn.innerHTML = originalText;
    }
}

async function verifyOTP(e) {
    e.preventDefault();
    
    const verifyBtn = document.getElementById('verifyBtn');
    const spinner = verifyBtn.querySelector('.spinner');
    const btnText = verifyBtn.querySelector('.btn-text');
    
    // Show loading state
    verifyBtn.disabled = true;
    spinner.style.display = 'inline-block';
    btnText.style.display = 'none';
    
    const otp = getOTPValue();
    
    if (otp.length !== 6) {
        showMessage('Please enter all 6 digits of the OTP code.');
        resetVerifyButton();
        return;
    }
    
    try {
        const response = await fetch('/verify-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ otp })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('OTP verified successfully! Logging you in...', 'success');
            
            // Clear countdown
            clearInterval(countdownInterval);
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = data.redirectUrl || '/dashboard';
            }, 1500);
        } else {
            showMessage(data.message || 'Invalid OTP. Please try again.');
            clearOTPInputs();
            resetVerifyButton();
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
        showMessage('Network error. Please check your connection.');
        resetVerifyButton();
    }
}

function resetVerifyButton() {
    const verifyBtn = document.getElementById('verifyBtn');
    const spinner = verifyBtn.querySelector('.spinner');
    const btnText = verifyBtn.querySelector('.btn-text');
    
    verifyBtn.disabled = false;
    spinner.style.display = 'none';
    btnText.style.display = 'inline';
    checkAllInputsFilled();
}

// Add animation effects
document.addEventListener('DOMContentLoaded', function() {
    // Animate OTP inputs
    const inputs = document.querySelectorAll('.otp-input');
    inputs.forEach((input, index) => {
        input.style.opacity = '0';
        input.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            input.style.transition = 'all 0.3s ease';
            input.style.opacity = '1';
            input.style.transform = 'translateY(0)';
        }, 100 * (index + 1));
    });
});