document.getElementById('reviewForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const doctorId = document.getElementById('doctorId').value;
    const rating = document.getElementById('rating').value;
    const review = document.getElementById('review').value;

    const response = await fetch('/leaveReview', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Include the token
        },
        body: JSON.stringify({ doctorId, rating, review })
    });

    const data = await response.json();

    if (data.success) {
        alert('Review submitted successfully');
    } else {
        alert('Failed to submit review');
    }
});

document.getElementById('appointmentForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const doctorId = document.getElementById('appointmentDoctorId').value;
    const appointmentDate = document.getElementById('appointmentDate').value;
    const description = document.getElementById('description').value;

    const response = await fetch('/createAppointment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Include the token
        },
        body: JSON.stringify({ doctorId, appointmentDate, description })
    });

    const data = await response.json();

    if (data.success) {
        alert('Appointment created successfully');
    } else {
        alert('Failed to create appointment');
    }
});

async function searchDoctors() {
    const searchQuery = document.getElementById('searchQuery').value;

    const response = await fetch(`/searchDoctors`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Include the token
        }
    });

    const data = await response.json();

    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = '';

    if (data.length > 0) {
        data.forEach(doctor => {
            const div = document.createElement('div');
            div.innerHTML = `<p>${doctor.name} - ${doctor.specialty} - ${doctor.loc} - ${doctor.phone}</p>`;
            searchResults.appendChild(div);
        });
    } else {
        searchResults.innerHTML = '<p>No doctors found</p>';
    }
}

async function viewBills() {
    const response = await fetch('/viewBills', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Include the token
        }
    });

    const data = await response.json();

    const billResults = document.getElementById('billResults');
    billResults.innerHTML = '';

    if (data.length > 0) {
        data.forEach(bill => {
            const div = document.createElement('div');
            div.innerHTML = `<p>Bill ID: ${bill.billID}, Amount: $${bill.bill}</p>`;
            billResults.appendChild(div);
        });
    } else {
        billResults.innerHTML = '<p>No bills found</p>';
    }
}