document.getElementById('accessForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const passcode = document.getElementById('passcode').value.trim();

    // Example passcode check - in production, validate on the server
    const validPasscodes = {
        "family2025": "family-gallery.html",
        "sports2025": "sports-gallery.html"
    };

    if (validPasscodes[passcode]) {
        window.location.href = validPasscodes[passcode];
    } else {
        alert("Invalid passcode. Please try again or contact your photographer.");
    }
});