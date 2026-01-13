// Show/Hide elements
function toggleVisibility(element) {
    element.style.display = element.style.display === 'none' ? 'block' : 'none';
}

// Fetch data
async function fetchData(url) {
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
    }
}


//Kommentar von Pablo
