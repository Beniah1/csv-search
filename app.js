// Initialize Supabase client
const supabaseUrl = 'https://znuxahdqxencqtsvxvja.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpudXhhaGRxeGVuY3F0c3Z4dmphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4MDQzNjUsImV4cCI6MjA1MzM4MDM2NX0.8evCXHMfkn1yhsVB8lQ62BL3b6-j4KZ_oszTuYLT6G0';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Search function
async function searchRecords(searchTerm) {
    const { data, error } = await supabase
        .from('csv_data')
        .select('*')
        .or(`full_name.ilike.%${searchTerm}%,gender.ilike.%${searchTerm}%,phone_number.ilike.%${searchTerm}%`)
        .order('full_name');

    if (error) {
        console.error('Error fetching data:', error);
        return [];
    }

    return data;
}

// Current record being edited
let currentRecord = null;

// Modal functions
function openEditModal(record) {
    currentRecord = record;
    const modal = document.getElementById('editModal');
    
    // Populate form fields
    document.getElementById('editFullName').value = record.full_name;
    document.getElementById('editGender').value = record.gender;
    document.getElementById('editPhone').value = record.phone_number;
    document.getElementById('edit5th').value = record['5th'] || '';
    document.getElementById('edit12th').value = record['12th'] || '';
    document.getElementById('edit19th').value = record['19th'] || '';
    document.getElementById('edit26th').value = record['26th'] || '';
    
    modal.style.display = 'block';
}

function closeEditModal() {
    const modal = document.getElementById('editModal');
    modal.style.display = 'none';
    currentRecord = null;
}

// Update record in Supabase
async function updateRecord(id, data) {
    const { error } = await supabase
        .from('csv_data')
        .update(data)
        .eq('id', id);
    
    if (error) throw error;
}

// Display results in a clean format
function displayResults(results) {
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = '';

    if (results.length === 0) {
        resultsDiv.innerHTML = '<p>No results found</p>';
        return;
    }

    results.forEach(record => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        
        // Create content with proper formatting
        const content = `
            <h3>${record.full_name}</h3>
            <p><strong>Gender:</strong> ${record.gender}</p>
            <p><strong>Phone:</strong> ${record.phone_number}</p>
            <p><strong>Attendance:</strong></p>
            <ul>
                <li>5th: <span class="attendance-status ${record['5th']?.toLowerCase() || ''}">${record['5th'] || 'Not Set'}</span></li>
                <li>12th: <span class="attendance-status ${record['12th']?.toLowerCase() || ''}">${record['12th'] || 'Not Set'}</span></li>
                <li>19th: <span class="attendance-status ${record['19th']?.toLowerCase() || ''}">${record['19th'] || 'Not Set'}</span></li>
                <li>26th: <span class="attendance-status ${record['26th']?.toLowerCase() || ''}">${record['26th'] || 'Not Set'}</span></li>
            </ul>
            <button onclick="openEditModal(${JSON.stringify(record).replace(/"/g, '&quot;')})" class="edit-btn">Edit</button>
        `;
        
        resultItem.innerHTML = content;
        resultsDiv.appendChild(resultItem);
    });
}

// Event listener for search button
document.getElementById('searchBtn').addEventListener('click', async () => {
    const searchTerm = document.getElementById('searchInput').value.trim();
    const resultsDiv = document.getElementById('searchResults');
    
    if (!searchTerm) {
        resultsDiv.innerHTML = '<p>Please enter a search term</p>';
        return;
    }
    
    // Show loading state
    resultsDiv.innerHTML = '<div class="loading">Searching</div>';
    
    try {
        const results = await searchRecords(searchTerm);
        displayResults(results);
    } catch (error) {
        resultsDiv.innerHTML = '<p>An error occurred while searching. Please try again.</p>';
        console.error('Search error:', error);
    }
});

// Event listener for Enter key in search input
document.getElementById('searchInput').addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        const searchTerm = e.target.value.trim();
        const resultsDiv = document.getElementById('searchResults');
        
        if (!searchTerm) {
            resultsDiv.innerHTML = '<p>Please enter a search term</p>';
            return;
        }
        
        // Show loading state
        resultsDiv.innerHTML = '<div class="loading">Searching</div>';
        
        try {
            const results = await searchRecords(searchTerm);
            displayResults(results);
        } catch (error) {
            resultsDiv.innerHTML = '<p>An error occurred while searching. Please try again.</p>';
            console.error('Search error:', error);
        }
    }
});

// Test database connection on load
(async () => {
    try {
        const { data, error } = await supabase
            .from('csv_data')
            .select('count()', { count: 'exact' });
            
        if (error) throw error;
        console.log('Connected to database successfully. Total records:', data[0].count);
    } catch (error) {
        console.error('Database connection error:', error);
        document.getElementById('searchResults').innerHTML = 
            '<p>Error connecting to database. Please check your connection and refresh the page.</p>';
    }
})();

// Form submission handler
document.getElementById('editForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!currentRecord) return;
    
    const updateData = {
        full_name: document.getElementById('editFullName').value,
        gender: document.getElementById('editGender').value,
        phone_number: document.getElementById('editPhone').value,
        '5th': document.getElementById('edit5th').value,
        '12th': document.getElementById('edit12th').value,
        '19th': document.getElementById('edit19th').value,
        '26th': document.getElementById('edit26th').value
    };
    
    try {
        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Saving...';
        submitBtn.disabled = true;
        
        await updateRecord(currentRecord.id, updateData);
        
        // Show success message
        const resultsDiv = document.getElementById('searchResults');
        const message = document.createElement('div');
        message.className = 'message success';
        message.textContent = 'Record updated successfully!';
        resultsDiv.insertBefore(message, resultsDiv.firstChild);
        
        // Remove message after 3 seconds
        setTimeout(() => message.remove(), 3000);
        
        // Refresh the search results
        const searchTerm = document.getElementById('searchInput').value.trim();
        if (searchTerm) {
            const results = await searchRecords(searchTerm);
            displayResults(results);
        }
        
        closeEditModal();
    } catch (error) {
        console.error('Error updating record:', error);
        const message = document.createElement('div');
        message.className = 'message error';
        message.textContent = 'Error updating record. Please try again.';
        document.getElementById('searchResults').insertBefore(message, resultsDiv.firstChild);
        setTimeout(() => message.remove(), 3000);
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// Initialize search input and edit modal
document.getElementById('searchInput').disabled = false;
document.getElementById('searchBtn').disabled = false;

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('editModal');
    if (event.target == modal) {
        closeEditModal();
    }
}
