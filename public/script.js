document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const userForm = document.getElementById('userForm');
    const formStatus = document.getElementById('formStatus');
    const submissionsList = document.getElementById('submissionsList');
    const refreshBtn = document.getElementById('refreshBtn');
    
    // Load submissions when page loads
    loadSubmissions();
    
    // Form submission handler
    userForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            message: document.getElementById('message').value.trim()
        };
        
        // Submit form data to API
        submitFormData(formData);
    });
    
    // Refresh button handler
    refreshBtn.addEventListener('click', function() {
        loadSubmissions();
        
        // Add rotation animation
        this.classList.add('rotate');
        setTimeout(() => {
            this.classList.remove('rotate');
        }, 1000);
    });
    
    // Function to submit form data
    async function submitFormData(data) {
        try {
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                // Show success message
                showStatus('Form submitted successfully!', 'success');
                
                // Clear form
                userForm.reset();
                
                // Reload submissions
                loadSubmissions();
            } else {
                // Show error message
                showStatus(`Error: ${result.error}`, 'error');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            showStatus('Failed to submit form. Please try again.', 'error');
        }
    }
    
    // Function to load submissions
    async function loadSubmissions() {
        try {
            const response = await fetch('/api/submissions');
            const submissions = await response.json();
            
            if (response.ok) {
                displaySubmissions(submissions);
            } else {
                submissionsList.innerHTML = '<p class="text-danger">Failed to load submissions.</p>';
            }
        } catch (error) {
            console.error('Error loading submissions:', error);
            submissionsList.innerHTML = '<p class="text-danger">Failed to load submissions.</p>';
        }
    }
    
    // Function to display submissions
    function displaySubmissions(submissions) {
        if (submissions.length === 0) {
            submissionsList.innerHTML = '<p class="text-muted">No submissions yet.</p>';
            return;
        }
        
        let html = '';
        
        submissions.forEach(submission => {
            const date = new Date(submission.created_at).toLocaleString();
            
            html += `
                <div class="submission-item">
                    <div class="submission-header">
                        <span class="submission-name">${escapeHtml(submission.name)}</span>
                        <span class="submission-date">${date}</span>
                    </div>
                    <div class="submission-email">${escapeHtml(submission.email)}</div>
                    <div class="submission-message">${escapeHtml(submission.message || '')}</div>
                </div>
            `;
        });
        
        submissionsList.innerHTML = html;
    }
    
    // Function to show status message
    function showStatus(message, type) {
        formStatus.textContent = message;
        formStatus.className = type === 'success' ? 'status-success' : 'status-error';
        formStatus.style.display = 'block';
        
        // Hide status after 5 seconds
        setTimeout(() => {
            formStatus.style.display = 'none';
        }, 5000);
    }
    
    // Helper function to escape HTML
    function escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});

// Add CSS for refresh button rotation
document.head.insertAdjacentHTML('beforeend', `
    <style>
        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        .rotate {
            animation: rotate 1s linear;
        }
    </style>
`);
