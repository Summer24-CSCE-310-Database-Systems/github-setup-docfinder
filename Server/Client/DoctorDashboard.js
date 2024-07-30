async function viewAppointments() {
    const response = await fetch('/viewAppointments', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Include the token
        }
    });
}

async function viewPatients() {
    const response = await fetch('/viewPatients', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Include the token
        }
    });
}

async function createBill(){
    const response = await fetch('/createBill', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Include the token
        },
        body: JSON.stringify({ patientId, billAmount, description })
    });
}

async function deleteBill(){
    const response = await fetch('/deleteBill', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Include the token
        },
        body: JSON.stringify({ billId })
    });
}

async function editAccount(){
    const response = await fetch('/editAccount', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Include the token
        },
        body: JSON.stringify({ name, email, password })
    });
}

async function logout() {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
}

async function deleteAccount() {
    const response = await fetch('/deleteAccount', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`, // Include the token
            'User-Role': 'doctor',
        }
    });
}