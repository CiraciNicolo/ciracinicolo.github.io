document.addEventListener('DOMContentLoaded', (event) => {
    fetchGitHubContributions('ciracinicolo');
    initThemeToggle();

    const sidebar = document.getElementById('sidebar');
    const rightSidebar = document.getElementById('right-sidebar');
    const toggleSidebar = document.getElementById('toggle-sidebar');
    const toggleRightSidebar = document.getElementById('toggle-right-sidebar');

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

function initThemeToggle() {
    const root = document.documentElement;
    const toggleButton = document.getElementById('theme-toggle');
    const stored = localStorage.getItem('theme');

    if (stored === 'light' || stored === 'dark') {
        root.setAttribute('data-theme', stored);
    }

    toggleButton.addEventListener('click', () => {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const current = root.getAttribute('data-theme') || (prefersDark ? 'dark' : 'light');
        const next = current === 'dark' ? 'light' : 'dark';

        root.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    });
}

function isMobile() {
    return window.innerWidth <= 768;
}

function updateSidebarPosition() {
    if (isMobile()) {
        const sidebar = document.getElementById('sidebar');
        const rightSidebar = document.getElementById('right-sidebar');
        const scrollTop = window.scrollY;

        sidebar.style.top = `${scrollTop + 100}px`;
        rightSidebar.style.top = `${scrollTop + 100}px`;
    }
}

function fetchGitHubContributions(username) {
    const apiUrl = `https://api.github.com/users/${username}/repos`;
    const prApiUrl = `https://api.github.com/search/issues?q=author%3A${username}`;
    const excluded = ["PR_kwDOKzhRRM5x_XAl", "PR_kwDOC6bl6c5rEl9A", "PR_kwDOC6bl6c5oBThX"]

    // Fetch all repositories
    fetch(apiUrl)
        .then(response => response.json())
        .then(repos => {
            let summary = '';
            const forkedRepos = repos.filter(repo => !repo.archived && repo.fork);
            const personalRepos = repos.filter(repo => !repo.archived && !repo.fork);

            // Process personal repositories
            personalRepos.forEach(repo => {
                const repoName = repo.name;
                const repoUrl = repo.html_url;
                const repoDescription = repo.description || 'No description';
                summary += `<div class="project-personal"><p><strong><a href="${repoUrl}" target="_blank">${repoName}</a></strong> - ${repoDescription} <em>(Personal Project)</em></p></div>`;
            });

            fetch(prApiUrl)
                .then(response => response.json())
                .then(data => {
                    const prs = data.items.filter(issue => issue.node_id.startsWith('PR') && !excluded.includes(issue.node_id));

                    // Process forked repositories
                    let promises = forkedRepos.map(repo => {
                        return fetch(repo.url)
                            .then(response => response.json())
                            .then(repoData => {
                                const parentUrl = repoData.parent ? repoData.parent.url : '';
                                const repoName = repo.name;
                                const repoUrl = repo.html_url;
                                const repoDescription = repo.description || 'No description';
                                const repoOwner = repo.owner.login;
                                const projectType = 'Contribution';
                                const repoPrs = prs.filter(pr => pr.repository_url === parentUrl);

                                if (repoPrs.length > 0) {

                                    summary += `<div class="project-contribution"><p><strong><a href="${repoUrl}" target="_blank">${repoName}</a></strong> - ${repoDescription} <em>(${projectType})</em>`;

                                    summary += ' - Pull Requests: <ul>';
                                    repoPrs.forEach(pr => {
                                        const prNumber = pr.number;
                                        summary += `<li><a href="${pr.html_url}" target="_blank">#${prNumber} - ${pr.title}</a></li>`;
                                    });
                                    summary += '</ul>';
                                    summary += `</p></div>`;
                                }
                            })
                            .catch(error => console.error('Error fetching parent repo:', error));
                    });

                    Promise.all(promises).then(() => {
                        document.getElementById('github-summary').innerHTML = summary;
                    });
                })
                .catch(error => console.error('Error fetching PRs:', error));
        })
        .catch(error => console.error('Error fetching GitHub repos:', error));
}
