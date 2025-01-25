// Initialize Supabase client
const supabaseUrl = 'https://znuxahdqxencqtsvxvja.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpudXhhaGRxeGVuY3F0c3Z4dmphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4MDQzNjUsImV4cCI6MjA1MzM4MDM2NX0.8evCXHMfkn1yhsVB8lQ62BL3b6-j4KZ_oszTuYLT6G0';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Show toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Remove toast after animation
    setTimeout(() => {
        toast.remove();
    }, 2000);
}

// Search function
async function searchRecords(searchTerm) {
    console.log('Searching for:', searchTerm);
    const { data, error } = await supabase
        .from('csv_data_january')
        .select('*')
        .or(`full_name.ilike.%${searchTerm}%,gender.ilike.%${searchTerm}%,phone_number.ilike.%${searchTerm}%`)
        .order('full_name');

    if (error) {
        console.error('Error fetching data:', error);
        return [];
    }

    console.log('Search results:', data);
    return data;
}

// Current record being edited
let currentRecord = null;

// Modal functions
function openEditModal(record) {
    console.log('Opening modal for record:', record);
    currentRecord = record;
    const modal = document.getElementById('editModal');
    
    // Populate form fields with correct column names
    document.getElementById('editFullName').value = record.full_name;
    document.getElementById('editGender').value = record.gender;
    document.getElementById('editPhone').value = record.phone_number;
    document.getElementById('edit5th').value = record.attendance_5th || '';
    document.getElementById('edit12th').value = record.attendance_12th || '';
    document.getElementById('edit19th').value = record.attendance_19th || '';
    document.getElementById('edit26th').value = record.attendance_26th || '';
    document.getElementById('editAge').value = record.age || '';
    document.getElementById('editCurrentLevel').value = record.current_level || '';
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    showToast('Editing record...');
}

function closeEditModal() {
    const modal = document.getElementById('editModal');
    modal.style.display = 'none';
    document.body.style.overflow = ''; // Restore scrolling
    currentRecord = null;
}

// Update record in Supabase
async function updateRecord(id, data) {
    console.log('Updating record. ID:', id, 'Data:', data);
    
    try {
        // First verify the record exists
        const { data: existing, error: fetchError } = await supabase
            .from('csv_data_january')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError) {
            console.error('Error fetching record:', fetchError);
            throw new Error('Could not find record to update');
        }

        if (!existing) {
            throw new Error(`No record found with ID ${id}`);
        }

        console.log('Existing record:', existing);

        // Perform the update
        const { data: result, error: updateError } = await supabase
            .from('csv_data_january')
            .update({
                full_name: data.full_name,
                gender: data.gender,
                phone_number: data.phone_number,
                attendance_5th: data.attendance_5th,
                attendance_12th: data.attendance_12th,
                attendance_19th: data.attendance_19th,
                attendance_26th: data.attendance_26th,
                age: data.age,
                current_level: data.current_level
            })
            .eq('id', id)
            .select();

        if (updateError) {
            console.error('Supabase update error:', updateError);
            throw new Error(updateError.message);
        }

        if (!result || result.length === 0) {
            throw new Error('Update succeeded but no data was returned');
        }

        console.log('Update successful. New data:', result);
        return result;
    } catch (error) {
        console.error('Error in updateRecord:', error);
        throw error;
    }
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
        
        // Create content with proper column names
        const content = `
            <h3>${record.full_name}</h3>
            <p><strong>Gender:</strong> ${record.gender}</p>
            <p><strong>Phone:</strong> ${record.phone_number}</p>
            <p><strong>Age:</strong> ${record.age || 'Not Set'}</p>
            <p><strong>Current Level:</strong> ${record.current_level || 'Not Set'}</p>
            <p><strong>Attendance:</strong></p>
            <ul>
                <li>5th: <span class="attendance-status ${record.attendance_5th || ''}">${record.attendance_5th || 'Not Set'}</span></li>
                <li>12th: <span class="attendance-status ${record.attendance_12th || ''}">${record.attendance_12th || 'Not Set'}</span></li>
                <li>19th: <span class="attendance-status ${record.attendance_19th || ''}">${record.attendance_19th || 'Not Set'}</span></li>
                <li>26th: <span class="attendance-status ${record.attendance_26th || ''}">${record.attendance_26th || 'Not Set'}</span></li>
            </ul>
            <div class="button-group">
                <button onclick="openEditModal(${JSON.stringify(record).replace(/"/g, '&quot;')})" class="edit-btn">Edit</button>
                <button onclick="handleDelete(${record.id})" class="delete-btn">Delete</button>
            </div>
        `;
        
        resultItem.innerHTML = content;
        resultsDiv.appendChild(resultItem);
    });
}

// Form submission handler
document.getElementById('editForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!currentRecord) {
        console.error('No record selected for editing');
        return;
    }

    console.log('Starting form submission for record:', currentRecord);

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    const resultsDiv = document.getElementById('searchResults');
    
    // Create update data with correct column names
    const ageValue = document.getElementById('editAge').value;
    const updateData = {
        full_name: document.getElementById('editFullName').value,
        gender: document.getElementById('editGender').value,
        phone_number: document.getElementById('editPhone').value,
        attendance_5th: document.getElementById('edit5th').value,
        attendance_12th: document.getElementById('edit12th').value,
        attendance_19th: document.getElementById('edit19th').value,
        attendance_26th: document.getElementById('edit26th').value,
        age: ageValue ? parseInt(ageValue) : null,
        current_level: document.getElementById('editCurrentLevel').value
    };

    // Validate data before sending
    if (!updateData.full_name || !updateData.gender || !updateData.phone_number) {
        showToast('Please fill in all required fields');
        return;
    }
    
    console.log('Update data prepared:', updateData);
    
    // Show loading state
    submitBtn.textContent = 'Saving...';
    submitBtn.disabled = true;

    try {
        const result = await updateRecord(currentRecord.id, updateData);
        console.log('Update successful:', result);

        if (!result) {
            throw new Error('No response from update operation');
        }
        
        // Close modal only after we confirm the update
        closeEditModal();
        
        // Show toast message
        showToast('Record updated successfully!');
        
        // Refresh the search results
        const searchTerm = document.getElementById('searchInput').value.trim();
        if (searchTerm) {
            console.log('Refreshing search results');
            const results = await searchRecords(searchTerm);
            displayResults(results);
        }
    } catch (error) {
        console.error('Error in form submission:', error);
        
        // Close modal on error
        closeEditModal();
        showToast(`Error: ${error.message}`);
    } finally {
        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

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
        console.error('Search error:', error);
        resultsDiv.innerHTML = `<p>Error searching: ${error.message}</p>`;
    }
});

// Event listener for Enter key in search input
document.getElementById('searchInput').addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        document.getElementById('searchBtn').click();
    }
});

// Create record in Supabase
async function createRecord(data) {
    console.log('Creating new record. Data:', data);
    
    try {
        // First verify table exists and is accessible
        const { data: test, error: testError } = await supabase
            .from('csv_data_january')
            .select('*')
            .limit(1);

        if (testError) {
            console.error('Table access error:', testError);
            throw new Error(`Table access error: ${testError.message}`);
        }

        console.log('Table access successful');

        // Attempt to create the record
        const { data: result, error } = await supabase
            .from('csv_data_january')
            .insert([data]) // Explicitly wrap data in array
            .select();

        if (error) {
            console.error('Supabase create error:', error);
            throw new Error(`Create error: ${error.message}`);
        }

        if (!result || result.length === 0) {
            throw new Error('No result returned after insert');
        }

        console.log('Create successful. Result:', result);
        return result;
    } catch (error) {
        console.error('Error in createRecord:', error);
        throw error;
    }
}

// Modal functions for create
function openCreateModal() {
    const modal = document.getElementById('createModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    showToast('Creating new record...');
    
    // Clear form fields
    document.getElementById('newFullName').value = '';
    document.getElementById('newGender').value = '';
    document.getElementById('newPhone').value = '';
    document.getElementById('new5th').value = '';
    document.getElementById('new12th').value = '';
    document.getElementById('new19th').value = '';
    document.getElementById('new26th').value = '';
    document.getElementById('newAge').value = '';
    document.getElementById('newCurrentLevel').value = '';
}

function closeCreateModal() {
    const modal = document.getElementById('createModal');
    modal.style.display = 'none';
    document.body.style.overflow = ''; // Restore scrolling
}

// Handle create form submission
document.getElementById('createForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    const resultsDiv = document.getElementById('searchResults');
    
    // Create new record data
    const ageValue = document.getElementById('newAge').value;
    const newData = {
        full_name: document.getElementById('newFullName').value,
        gender: document.getElementById('newGender').value,
        phone_number: document.getElementById('newPhone').value,
        attendance_5th: document.getElementById('new5th').value,
        attendance_12th: document.getElementById('new12th').value,
        attendance_19th: document.getElementById('new19th').value,
        attendance_26th: document.getElementById('new26th').value,
        age: ageValue ? parseInt(ageValue) : null,
        current_level: document.getElementById('newCurrentLevel').value
    };

    // Validate data before sending
    if (!newData.full_name || !newData.gender || !newData.phone_number) {
        showToast('Please fill in all required fields');
        return;
    }
    
    console.log('New record data prepared:', newData);
    
    // Show loading state
    submitBtn.textContent = 'Creating...';
    submitBtn.disabled = true;

    try {
        const result = await createRecord(newData);
        console.log('Create successful:', result);
        
        // Close modal
        closeCreateModal();
        
        // Show toast message
        showToast('Record created successfully!');
        
        // Refresh the search results to show the new record
        const searchTerm = document.getElementById('searchInput').value.trim();
        if (searchTerm) {
            const results = await searchRecords(searchTerm);
            displayResults(results);
        }
    } catch (error) {
        console.error('Error in create form submission:', error);
        closeCreateModal();
        showToast(`Error: ${error.message}`);
    } finally {
        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// Add event listener for Add New button
document.getElementById('addNewBtn').addEventListener('click', openCreateModal);

// Close modals when clicking outside
window.onclick = function(event) {
    const editModal = document.getElementById('editModal');
    const createModal = document.getElementById('createModal');
    
    if (event.target == editModal) {
        closeEditModal();
    } else if (event.target == createModal) {
        closeCreateModal();
    }
}

// Prevent scrolling when modal is open
document.addEventListener('DOMContentLoaded', () => {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('touchmove', e => {
            e.preventDefault();
        }, { passive: false });
    });
});

// Delete record from Supabase
async function deleteRecord(id) {
    try {
        const { error } = await supabase
            .from('csv_data_january')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Delete error:', error);
            throw new Error(error.message);
        }

        return true;
    } catch (error) {
        console.error('Error in deleteRecord:', error);
        throw error;
    }
}

// Handle delete button click
async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this record? This cannot be undone.')) {
        return;
    }

    try {
        await deleteRecord(id);
        showToast('Record deleted successfully');
        
        // Refresh the search results
        const searchTerm = document.getElementById('searchInput').value.trim();
        if (searchTerm) {
            const results = await searchRecords(searchTerm);
            displayResults(results);
        } else {
            // If no search term, clear the results
            document.getElementById('searchResults').innerHTML = '';
        }
    } catch (error) {
        showToast(`Error deleting record: ${error.message}`);
    }
}

// Test database connection and log details
(async () => {
    try {
        const { data, error } = await supabase
            .from('csv_data_january')
            .select('*')
            .limit(1);
            
        if (error) throw error;
        console.log('Database connection successful');
        console.log('Connection test record:', data);
    } catch (error) {
        console.error('Database connection error:', error);
        document.getElementById('searchResults').innerHTML = 
            `<p>Database Error: ${error.message}</p>`;
    }
})();
