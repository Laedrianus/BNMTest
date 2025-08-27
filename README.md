# BlockSense Network Monitor

This application provides a comprehensive dashboard to monitor the BlockSense network, its data feeds, and related GitHub activity. It offers real-time updates, advanced filtering, and insightful visualizations to understand the network's health and performance.

## Features

*   **BlockSense Web Updates:** Checks the main BlockSense website (`https://blocksense.network`) for content changes.
*   **Networks & Data Feeds:** Lists available networks and data feeds with advanced search, filtering (by network, pair type), sorting, and pagination.
*   **GitHub Repository Updates:** Displays recent Commits, Issues, Pull Requests, and Releases from the BlockSense GitHub repository (`https://github.com/blocksense-network/blocksense`).
*   **Chain Connectivity Map:** Visualizes supported networks in an interactive grid.
*   **Common Contracts Details:** Provides information and Etherscan links for key BlockSense smart contracts.
*   **Network Health & Activity Dashboard:** Shows key metrics like total networks, total feeds, top assets, and last check time.
*   **Cross-Chain Journey Flow:** Illustrates the step-by-step process of a cross-chain data request.
*   **Oracle Performance Dashboard (Simulated):** Displays simulated performance metrics.
*   **ZK Proof Observer (Simplified):** Visualizes the simplified flow of Zero-Knowledge proof generation and verification.
*   **ZK & SchellingCoin Comparison:** Compares BlockSense's unique offerings with other oracles like Chainlink and Pyth.
*   **Scenario Builder:** Allows users to define their oracle needs and receive tailored recommendations.
*   **Ecosystem Map:** Shows key statistics and integrations within the BlockSense ecosystem.
*   **Dark/Light Theme Toggle:** Switch between light and dark UI themes.
*   **Responsive Design:** Adapts layout for different screen sizes.

## How It Works

1.  The application loads static data defined in `data.js` (NETWORKS, DATA_FEEDS, COMMON_CONTRACTS).
2.  It periodically or on user request (`Check` button) fetches the content of `https://blocksense.network`.
3.  It compares the fetched content with the previous check to detect changes.
4.  It fetches updates from the BlockSense GitHub repository based on user selection.
5.  The UI dynamically updates to display the fetched data, changes, and allows interaction (filtering, sorting, modal views).

## Deployment

This application is designed to be deployed using **GitHub Pages**.

1.  Ensure all files (`index.html`, `light.css`, `script.js`, `data.js`, `pirate.png`) are in the repository.
2.  Go to your repository's **Settings** > **Pages**.
3.  Under **Source**, select the branch where your files are located (e.g., `main`) and the root directory `/`.
4.  Click **Save**. GitHub Pages will provide a URL for your live site.

## Local Development

To run the application locally:

1.  Clone or download this repository.
2.  Open `index.html` in a web browser.

*Note: Direct fetching from `https://blocksense.network` might be subject to CORS policies. The application includes a fallback to a CORS proxy (`api.allorigins.win`) if the direct request fails.*

## Files

*   `index.html`: Main HTML structure.
*   `light.css`: Stylesheet for both light and dark themes.
*   `script.js`: Core application logic (data fetching, DOM manipulation, UI interactions).
*   `data.js`: Contains static data like networks, feeds, contracts, and mock GitHub data.
*   `pirate.png`: Application logo.

## Changelog (Recent Updates)

*   **URL Spacing:** Removed leading/trailing spaces from URLs in `script.js` and `index.html`.
*   **CORS Handling:** Implemented direct fetch with a fallback to a CORS proxy for `blocksense.network` updates.
*   **Code Refactoring:** Reduced code duplication in pagination logic by creating a common `paginateData` function.
*   **Persistence:** Network view counts are now saved to `localStorage` to persist across page reloads.
*   **Data Filtering:** Enhanced network detail modal and feed filtering to work with `networkId` association in `DATA_FEEDS` (requires `data.js` update).
*   **File Cleanup:** Removed incorrect `.txt` files from the repository.
