// UniVibe API Client
class UniVibeAPI {
    constructor(baseUrl = "https://univibe-eye3eaavf3dugggw.francecentral-01.azurewebsites.net") {
        this.baseUrl = baseUrl;
        this.token = null;
    }

    async login(username, password) {
        try {
            const response = await fetch(`${this.baseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const data = await response.json();
            this.token = data.auth_token;
            return this.token;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async getAllEvents() {
        if (!this.token) {
            throw new Error('Not authenticated. Please login first.');
        }

        try {
            const response = await fetch(`${this.baseUrl}/events`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch events');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching events:', error);
            throw error;
        }
    }

    async getEventById(eventId) {
        if (!this.token) {
            throw new Error('Not authenticated. Please login first.');
        }

        try {
            const response = await fetch(`${this.baseUrl}/events/${eventId}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch event');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching event:', error);
            throw error;
        }
    }

    async getEventParticipants(eventId) {
        if (!this.token) {
            throw new Error('Not authenticated. Please login first.');
        }

        try {
            const response = await fetch(`${this.baseUrl}/events/${eventId}/participants`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch participants');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching participants:', error);
            throw error;
        }
    }
}

// Example usage:
/*
const api = new UniVibeAPI();

// Login
api.login('yassine', '7/10/2005')
    .then(token => {
        console.log('Logged in successfully');
        
        // Get all events
        return api.getAllEvents();
    })
    .then(events => {
        console.log('Events:', events);
        
        // Get details of first event
        if (events.length > 0) {
            return api.getEventById(events[0].event_id);
        }
    })
    .then(event => {
        if (event) {
            console.log('Event details:', event);
            return api.getEventParticipants(event.event_id);
        }
    })
    .then(participants => {
        if (participants) {
            console.log('Participants:', participants);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
*/ 