document.addEventListener('DOMContentLoaded', (event) => {
    fetchGitHubContributions('ciracinicolo');
    startEmojiSlideshow();

    const sidebar = document.getElementById('sidebar');
    const rightSidebar = document.getElementById('right-sidebar');
    const toggleSidebar = document.getElementById('toggle-sidebar');
    const toggleRightSidebar = document.getElementById('toggle-right-sidebar');

    function isMobile() {
        return window.innerWidth <= 768;
    }

    function updateSidebarPosition() {
        if (isMobile()) {
            const scrollTop = window.scrollY;
            sidebar.style.top = `${scrollTop + 100}px`;
            rightSidebar.style.top = `${scrollTop + 100}px`;
        }
    }

    toggleSidebar.addEventListener('click', () => {
        updateSidebarPosition();
        sidebar.classList.toggle('show');
    });

    toggleRightSidebar.addEventListener('click', () => {
        updateSidebarPosition();
        rightSidebar.classList.toggle('show');
    });

    window.addEventListener('scroll', updateSidebarPosition);
    window.addEventListener('resize', updateSidebarPosition);
});

function fetchGitHubContributions(username) {
    const apiUrl = `https://api.github.com/users/${username}/repos`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(repos => {
            let summary = '';
            repos.forEach(repo => {
                if (!repo.archived) {
                    const repoName = repo.name;
                    const repoUrl = repo.html_url;
                    const repoDescription = repo.description || 'No description';
                    const isPersonal = !repo.fork;
                    const projectClass = isPersonal ? 'project-personal' : 'project-contribution';
                    const projectType = isPersonal ? 'Personal Project' : 'Contribution';
                    summary += `<div class="${projectClass}"><p><strong><a href="${repoUrl}" target="_blank">${repoName}</a></strong> - ${repoDescription} <em>(${projectType})</em></p></div>`;
                }
            });
            document.getElementById('github-summary').innerHTML = summary;
        })
        .catch(error => console.error('Error fetching GitHub repos:', error));
}

function startEmojiSlideshow() {
    const emojis = ['😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'];
    let index = 0;
    const emojiElement = document.getElementById('emoji');

    setInterval(() => {
        emojiElement.textContent = emojis[index];
        index = (index + 1) % emojis.length;
    }, 500);
}
