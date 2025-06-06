const NASA_API = 'https://images-api.nasa.gov/search';

async function searchMedia() {
    const searchTerm = document.getElementById('searchInput').value;
    const mediaType = document.getElementById('mediaType').value;
    const resultsGrid = document.getElementById('resultsGrid');
    const loading = document.querySelector('.loading');

    if (!searchTerm) return;

    loading.classList.remove('hidden');
    resultsGrid.innerHTML = '';

    try {
        const params = new URLSearchParams({
            q: searchTerm,
            media_type: mediaType === 'all' ? 'image,video' : mediaType
        });

        const response = await fetch(`${NASA_API}?${params}`);
        const data = await response.json();
        
        loading.classList.add('hidden');
        
        if (data.collection.items.length === 0) {
            resultsGrid.innerHTML = '<p>Aucun résultat trouvé</p>';
            return;
        }

        displayResults(data.collection.items);
    } catch (error) {
        console.error('Erreur:', error);
        loading.classList.add('hidden');
        resultsGrid.innerHTML = '<p>Une erreur est survenue lors de la recherche</p>';
    }
}

function displayResults(items) {
    const resultsGrid = document.getElementById('resultsGrid');
    
    items.forEach(item => {
        if (item.links && item.data) {
            const mediaData = item.data[0];
            const thumbnail = item.links[0].href;
            const mediaType = mediaData.media_type;

            const card = document.createElement('div');
            card.className = 'media-card';
            card.innerHTML = `
                <img src="${thumbnail}" alt="${mediaData.title}">
                <div class="media-info">
                    <h3>${mediaData.title}</h3>
                    <span class="media-type">${mediaType}</span>
                </div>
            `;

            card.addEventListener('click', () => showDetails(mediaData, thumbnail));
            resultsGrid.appendChild(card);
        }
    });
}

async function showDetails(mediaData, thumbnail) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    try {
        let mediaUrl = thumbnail;
        
        if (mediaData.media_type === 'video') {
            const nasaId = mediaData.nasa_id;
            const manifestResponse = await fetch(`https://images-api.nasa.gov/asset/${nasaId}`);
            const manifestData = await manifestResponse.json();
            
            // Find the MP4 video URL
            const videoAsset = manifestData.collection.items.find(item => 
                item.href.endsWith('.mp4')
            );
            
            if (videoAsset) {
                mediaUrl = videoAsset.href;
            }
        }
        
        const content = `
            <h2>${mediaData.title}</h2>
            ${mediaData.media_type === 'image' 
                ? `<img src="${mediaUrl}" alt="${mediaData.title}" loading="lazy">` 
                : `<video src="${mediaUrl}" controls>
                    Your browser does not support the video tag.
                   </video>`
            }
            <p><strong>Date:</strong> ${new Date(mediaData.date_created).toLocaleDateString()}</p>
            <p><strong>Description:</strong> ${mediaData.description || 'No description available'}</p>
            ${mediaData.keywords ? `<p><strong>Keywords:</strong> ${mediaData.keywords.join(', ')}</p>` : ''}
        `;

        modalBody.innerHTML = content;
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
    } catch (error) {
        console.error('Error loading media:', error);
        modalBody.innerHTML = '<p>Error loading media. Please try again later.</p>';
    }
}

function closeModal() {
    const modal = document.getElementById('modal');
    const videos = modal.getElementsByTagName('video');
    
    Array.from(videos).forEach(video => {
        video.pause();
        video.currentTime = 0;
    });
    
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

function searchByTag(keyword) {
    const searchInput = document.getElementById('searchInput');
    searchInput.value = keyword;
    searchMedia();
}

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modal');
    const closeBtn = document.querySelector('.close-btn');

    closeBtn?.addEventListener('click', closeModal);

    modal?.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
});

document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchMedia();
    }
});
