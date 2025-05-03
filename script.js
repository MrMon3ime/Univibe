document.addEventListener('DOMContentLoaded', async function() {
    const eventsGrid = document.getElementById('eventsGrid');
    const leftArrow = document.getElementById('carouselLeft');
    const rightArrow = document.getElementById('carouselRight');
    const trendingGrid = document.getElementById('trendingGrid');
    const trendingLeft = document.getElementById('trendingLeft');
    const trendingRight = document.getElementById('trendingRight');
    const EVENTS_PER_PAGE = 3;
    const TRENDING_PER_PAGE = 3;
    let events = [];
    let currentPage = 0;
    let trendingPage = 0;
    const seeMoreBtn = document.getElementById('seeMoreEvents');
    let mobileEventsShown = 3;

    // Helper to format date
    function formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    // Convert base64 to Blob URL for better performance
    function base64ToBlobUrl(base64) {
        if (!base64 || !base64.startsWith('data:')) return 'univibe_logo.png';
        const arr = base64.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        return URL.createObjectURL(blob);
    }

    // Scroll to top (download button)
    function scrollToDownload() {
        const downloadBtn = document.querySelector('.cta-button');
        if (downloadBtn) {
            downloadBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    function animateGrid(grid, renderFn) {
        grid.style.opacity = '0';
        setTimeout(() => {
            renderFn();
            grid.style.opacity = '1';
        }, 250);
    }

    function getEventsPerPage() {
        if (window.innerWidth <= 768) return 3; // mobile (used for See More logic)
        if (window.innerWidth <= 1200) return 2; // tablet/medium
        return 3; // large desktop
    }

    function getTrendingPerPage() {
        if (window.innerWidth <= 768) return 3;
        if (window.innerWidth <= 1200) return 2;
        return 3;
    }

    // Render events for the current page (carousel or all for mobile)
    function renderEvents() {
        eventsGrid.style.opacity = '1';
        eventsGrid.innerHTML = '';
        let pageEvents;
        const EVENTS_PER_PAGE = getEventsPerPage();
        if (window.innerWidth <= 768) {
            // On mobile, show only a limited number of events
            pageEvents = events.slice(0, mobileEventsShown);
            if (leftArrow && rightArrow) {
                leftArrow.style.display = 'none';
                rightArrow.style.display = 'none';
            }
            if (seeMoreBtn) {
                seeMoreBtn.style.display = mobileEventsShown < events.length ? 'block' : 'none';
            }
        } else {
            // On tablet/desktop, show paginated events
            const start = currentPage * EVENTS_PER_PAGE;
            const end = Math.min(start + EVENTS_PER_PAGE, events.length);
            pageEvents = events.slice(start, end);
            if (leftArrow && rightArrow) {
                leftArrow.style.display = '';
                rightArrow.style.display = '';
                leftArrow.disabled = currentPage === 0;
                // Debug logging
                console.log('currentPage:', currentPage, 'start:', start, 'end:', end, 'EVENTS_PER_PAGE:', EVENTS_PER_PAGE, 'events.length:', events.length);
                rightArrow.disabled = start + EVENTS_PER_PAGE >= events.length;
            }
            if (seeMoreBtn) {
                seeMoreBtn.style.display = 'none';
            }
        }
        pageEvents.forEach(event => {
            const eventCard = document.createElement('div');
            eventCard.className = 'event-card';
            let imageUrl = base64ToBlobUrl(event.event_image);
            eventCard.innerHTML = `
                <div class="event-image" style="background-image: url('${imageUrl}')">
                    <span class="event-category">${event.event_name || ''}</span>
                </div>
                <div class="event-details">
                    <div class="event-date">${formatDate(event.event_date)}</div>
                    <h3>${event.event_name}</h3>
                    <p>${event.event_description}</p>
                    <button class="event-button">Join Now</button>
                </div>
            `;
            eventCard.querySelector('.event-button').addEventListener('click', scrollToDownload);
            eventsGrid.appendChild(eventCard);
        });
    }

    // Render trending events (carousel or all for mobile)
    function renderTrending() {
        trendingGrid.style.opacity = '1';
        trendingGrid.innerHTML = '';
        const trendingEvents = [...events]
            .sort((a, b) => (b.event_id || 0) - (a.event_id || 0))
            .slice(0, 4);
        let pageTrending;
        const TRENDING_PER_PAGE = getTrendingPerPage();
        if (window.innerWidth <= 768) {
            // On mobile, show all trending events
            pageTrending = trendingEvents;
            if (trendingLeft && trendingRight) {
                trendingLeft.style.display = 'none';
                trendingRight.style.display = 'none';
            }
        } else {
            // On tablet/desktop, show paginated trending events (carousel)
            const start = trendingPage * TRENDING_PER_PAGE;
            const end = start + TRENDING_PER_PAGE;
            pageTrending = trendingEvents.slice(start, end);
            if (trendingLeft && trendingRight) {
                trendingLeft.style.display = '';
                trendingRight.style.display = '';
                trendingLeft.disabled = trendingPage === 0;
                trendingRight.disabled = end >= trendingEvents.length;
            }
        }
        pageTrending.forEach(event => {
            const eventCard = document.createElement('div');
            eventCard.className = 'event-card';
            let imageUrl = base64ToBlobUrl(event.event_image);
            eventCard.innerHTML = `
                <div class="event-image" style="background-image: url('${imageUrl}')">
                    <span class="event-category">${event.event_name || ''}</span>
                </div>
                <div class="event-details">
                    <div class="event-date">${formatDate(event.event_date)}</div>
                    <h3>${event.event_name}</h3>
                    <p>${event.event_description}</p>
                    <button class="event-button">Join Now</button>
                </div>
            `;
            eventCard.querySelector('.event-button').addEventListener('click', scrollToDownload);
            trendingGrid.appendChild(eventCard);
        });
    }

    // Carousel navigation for popular events
    if (leftArrow) leftArrow.addEventListener('click', () => {
        if (currentPage > 0) {
            currentPage--;
            animateGrid(eventsGrid, renderEvents);
        }
    });
    if (rightArrow) rightArrow.addEventListener('click', () => {
        const EVENTS_PER_PAGE = getEventsPerPage();
        const maxPage = Math.ceil(events.length / EVENTS_PER_PAGE) - 1;
        if (currentPage < maxPage) {
            currentPage++;
            animateGrid(eventsGrid, renderEvents);
        }
    });

    // Carousel navigation for trending events
    if (trendingLeft) trendingLeft.addEventListener('click', () => {
        if (trendingPage > 0) {
            trendingPage--;
            animateGrid(trendingGrid, renderTrending);
        }
    });
    if (trendingRight) trendingRight.addEventListener('click', () => {
        const trendingEvents = [...events].sort((a, b) => (b.event_id || 0) - (a.event_id || 0)).slice(0, 4);
        if ((trendingPage + 1) * TRENDING_PER_PAGE < trendingEvents.length) {
            trendingPage++;
            animateGrid(trendingGrid, renderTrending);
        }
    });

    // See More button handler for mobile
    if (seeMoreBtn) {
        seeMoreBtn.addEventListener('click', function() {
            mobileEventsShown += 3;
            animateGrid(eventsGrid, renderEvents);
        });
    }

    // Fetch events from API
    try {
        const api = new UniVibeAPI();
        await api.login('yassine', '7/10/2005');
        events = await api.getAllEvents();
        renderEvents();
        renderTrending();
    } catch (error) {
        eventsGrid.innerHTML = '<div style="color:red;text-align:center;">Failed to load events.</div>';
        trendingGrid.innerHTML = '<div style="color:red;text-align:center;">Failed to load trending events.</div>';
    }

    // Responsive: re-render on resize
    window.addEventListener('resize', () => {
        // Reset mobile events shown if switching to mobile
        if (window.innerWidth <= 768) {
            mobileEventsShown = 3;
        }
        renderEvents();
        renderTrending();
    });

    // Logo and button effects (unchanged)
    const logo = document.getElementById('logo');
    if (logo) {
        logo.addEventListener('click', () => {
            logo.style.transform = 'rotate(360deg)';
            setTimeout(() => {
                logo.style.transform = '';
            }, 1000);
        });
    }
    const buttons = document.querySelectorAll('.cta-button');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
        });
    });
});