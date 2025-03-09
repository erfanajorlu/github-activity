import * as readline from 'readline';

const GITHUB_API_URL = 'https://api.github.com/users';

async function fetchGithubActivity(username: string) {
    try {
        const response = await fetch(`${GITHUB_API_URL}/${username}/events`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(`Error while fetching data from github ${error}`);
    }
}

function displayActivity(activity: any[]): void {
    if (activity.length === 0) {
        console.log('No recent activity found.');
    } else {
        console.log('Recent GitHub Activity:');
        activity.forEach((event: any) => {
            console.log(`- ${event.type} on ${event.repo.name} at ${event.created_at}`);
        });
    }
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter Github username: ', async (username) => {
    try {
        const activity = await fetchGithubActivity(username);
        displayActivity(activity);
    } catch (error) {
        console.error(`Error: ${error}`);
    } finally {
        rl.close();
    }
})