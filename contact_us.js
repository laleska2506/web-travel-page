document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Clear inputs
            document.getElementById('contact-name').value = '';
            document.getElementById('contact-email').value = '';
            document.getElementById('contact-message').value = '';
            
            // Show toast notification
            const toast = document.getElementById('contact-toast');
            if (toast) {
                toast.classList.add('show');
                
                // Hide toast after 3.5 seconds
                setTimeout(function() {
                    toast.classList.remove('show');
                }, 3500);
            }
        });
    }
});
