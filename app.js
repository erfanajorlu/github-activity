document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('search-btn');
    const usernameInput = document.getElementById('username');
    const profileContainer = document.getElementById('profile-container');
    const activityContainer = document.getElementById('activity-container');
    const loadingElement = document.getElementById('loading');
    const errorMessage = document.getElementById('error-message');

    // GitHub API URLs
    const GITHUB_API_URL = 'https://api.github.com/users';

    // Event listeners
    searchBtn.addEventListener('click', handleSearch);
    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    async function handleSearch() {
        const username = usernameInput.value.trim();

        if (!username) {
            showError('Please enter a GitHub username');
            return;
        }

        resetUI();
        showLoading();

        try {
            const [userProfile, userActivity] = await Promise.all([
                fetchUserProfile(username),
                fetchGithubActivity(username)
            ]);

            // Hide loading spinner
            hideLoading();

            if (userProfile.message === 'Not Found') {
                showError('User not found. Please check the username and try again.');
                return;
            }

            // Display user profile and activity
            displayUserProfile(userProfile);
            displayActivity(userActivity);
        } catch (error) {
            hideLoading();
            showError(`Error: ${error.message || 'Something went wrong'}`);
        }
    }

    // Fetch user profile from GitHub API
    async function fetchUserProfile(username) {
        try {
            const response = await fetch(`${GITHUB_API_URL}/${username}`);
            return await response.json();
        } catch (error) {
            throw new Error(`Failed to fetch user profile: ${error.message}`);
        }
    }

    // Fetch GitHub activity from GitHub API
    async function fetchGithubActivity(username) {
        try {
            const response = await fetch(`${GITHUB_API_URL}/${username}/events`);
            return await response.json();
        } catch (error) {
            throw new Error(`Failed to fetch GitHub activity: ${error.message}`);
        }
    }

    // Display user profile
    function displayUserProfile(profile) {
        profileContainer.innerHTML = `
            <img src="${profile.avatar_url}" alt="${profile.login}" class="profile-image">
            <div class="profile-info">
                <h2>${profile.name || profile.login}</h2>
                <p>@${profile.login}</p>
                ${profile.bio ? `<p>${profile.bio}</p>` : ''}
                ${profile.location ? `<p><i class="fas fa-map-marker-alt"></i> ${profile.location}</p>` : ''}
                ${profile.blog ? `<p><i class="fas fa-link"></i> <a href="${profile.blog}" target="_blank">${profile.blog}</a></p>` : ''}
                
                <div class="profile-stats">
                    <div class="stat">
                        <div class="stat-value">${profile.public_repos}</div>
                        <div class="stat-label">Repositories</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${profile.followers}</div>
                        <div class="stat-label">Followers</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${profile.following}</div>
                        <div class="stat-label">Following</div>
                    </div>
                </div>
            </div>
        `;
        profileContainer.style.display = 'flex';
    }

    // Display GitHub activity
    function displayActivity(activity) {
        if (!Array.isArray(activity) || activity.length === 0) {
            activityContainer.innerHTML = '<p>No recent activity found.</p>';
            activityContainer.style.display = 'block';
            return;
        }

        // Limit to 10 most recent activities
        const recentActivity = activity.slice(0, 10);

        let activityHTML = '<h3>Recent GitHub Activity</h3>';

        recentActivity.forEach(event => {
            const eventIcon = getEventIcon(event.type);
            const formattedDate = formatDate(event.created_at);

            activityHTML += `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="${eventIcon}"></i>
                    </div>
                    <div class="activity-details">
                        <div class="activity-repo">${event.repo.name}</div>
                        <div class="activity-type">${formatEventType(event.type)}</div>
                        <div class="activity-time">${formattedDate}</div>
                    </div>
                </div>
            `;
        });

        activityContainer.innerHTML = activityHTML;
        activityContainer.style.display = 'block';
    }

    // Helper function to get icon for event type
    function getEventIcon(eventType) {
        const icons = {
            PushEvent: 'fas fa-code-branch',
            CreateEvent: 'fas fa-plus-circle',
            DeleteEvent: 'fas fa-minus-circle',
            IssuesEvent: 'fas fa-exclamation-circle',
            IssueCommentEvent: 'fas fa-comment',
            PullRequestEvent: 'fas fa-code-pull-request',
            PullRequestReviewEvent: 'fas fa-code-branch',
            PullRequestReviewCommentEvent: 'fas fa-comment-dots',
            ForkEvent: 'fas fa-code-branch',
            WatchEvent: 'fas fa-star',
            ReleaseEvent: 'fas fa-tag'
        };

        return icons[eventType] || 'fas fa-code';
    }

    // Helper function to format event type
    function formatEventType(eventType) {
        const eventNames = {
            PushEvent: 'Pushed code',
            CreateEvent: 'Created repository/branch',
            DeleteEvent: 'Deleted repository/branch',
            IssuesEvent: 'Opened/closed issue',
            IssueCommentEvent: 'Commented on issue',
            PullRequestEvent: 'Opened/closed pull request',
            PullRequestReviewEvent: 'Reviewed pull request',
            PullRequestReviewCommentEvent: 'Commented on pull request',
            ForkEvent: 'Forked repository',
            WatchEvent: 'Starred repository',
            ReleaseEvent: 'Released new version'
        };

        return eventNames[eventType] || eventType;
    }

    // Format date to a more readable format
    function formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
    }

    // Show loading spinner
    function showLoading() {
        loadingElement.style.display = 'flex';
    }

    // Hide loading spinner
    function hideLoading() {
        loadingElement.style.display = 'none';
    }

    // Show error message
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }

    // Reset UI elements
    function resetUI() {
        profileContainer.style.display = 'none';
        activityContainer.style.display = 'none';
        errorMessage.style.display = 'none';
    }
}); 