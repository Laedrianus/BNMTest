// content.js - Bilgi sayfaları için içerik

(function() {
    window.contentData = {
        oracle: {
            title: "What is Oracles?",
            html: `
                <p>In the context of cryptocurrencies and blockchain technology, an oracle is a system that provides external data to a blockchain in a secure and reliable manner. Since blockchains are closed environments by design and cannot directly access real-world information, oracles serve as the bridge between on-chain smart contracts and off-chain data sources.</p>
                <p>For example, a decentralized finance (DeFi) protocol may require the latest price of Bitcoin, exchange rates, weather data, or even the outcome of a sports event to execute specific logic within a smart contract. An oracle retrieves this information from external sources, such as APIs, data feeds, or IoT devices, and delivers it to the blockchain in a verifiable format.</p>
                <p>Oracles can be centralized or decentralized.</p>
                <ul>
                    <li>Centralized oracles rely on a single source, which can create a single point of failure and a trust issue.</li>
                    <li>Decentralized oracles aggregate data from multiple independent sources and use consensus mechanisms to ensure accuracy and prevent manipulation.</li>
                </ul>
                <p>In essence, oracles are critical components of the Web3 ecosystem, enabling smart contracts to interact with the real world while maintaining transparency, security, and trustlessness. Without oracles, blockchains would remain isolated, unable to support advanced use cases like DeFi, NFTs with dynamic attributes, prediction markets, and more.</p>
            `
        },
        bsn: {
            title: "What is Blocksense?",
            html: `
                <p>Blocksense is an innovative blockchain oracle (zincir dışı verileri zincire aktaran sistem) project designed to deliver secure, verifiable, and decentralized data to smart contracts. Unlike traditional oracle solutions that often rely on a limited number of nodes, Blocksense employs Zero-Knowledge (ZK) proofs to ensure data correctness without exposing sensitive details. This allows information such as prices, transaction states, or external real-world data to be transmitted to blockchain networks with strong cryptographic guarantees.</p>
                <p>Additionally, Blocksense integrates a SchellingCoin-based consensus model, which incentivizes participants to report accurate data by rewarding honesty and penalizing malicious behavior. The combination of ZK proofs and decentralized consensus enhances both security and trustworthiness, addressing common oracle challenges like centralization risks and data manipulation.</p>
                <p>In essence, Blocksense aims to bridge the gap between blockchains and the real world, enabling developers to build next-generation decentralized applications (DApps) (merkeziyetsiz uygulamalar) that require reliable external data while maintaining transparency and decentralization at their core.</p>
            `
        },
        whyBsn: {
            title: "Why Blocksense?",
            html: `
                <p>Blocksense stands out in the oracle ecosystem because it introduces a combination of advanced cryptography, decentralized consensus, and robust incentive mechanisms that address the key weaknesses of traditional oracle systems. While many oracle solutions rely heavily on reputation-based validation or a limited number of trusted nodes, Blocksense integrates Zero Knowledge proofs to ensure that the data provided is not only correct but also verifiable without revealing sensitive details. This creates a strong security layer that is both privacy-preserving and tamper-resistant.</p>
                <p>Another defining aspect of Blocksense is its use of a SchellingCoin-based consensus mechanism. This model incentivizes participants to submit accurate data by rewarding those who align with the majority of honest reporters and penalizing dishonest behavior. As a result, data integrity is maintained not by trust in a central authority but through economic game theory and cryptographic assurances.</p>
                <p>Blocksense is also designed for true decentralization, avoiding single points of failure and ensuring resilience even in adversarial conditions. This makes it suitable for high-stakes applications like DeFi protocols, automated trading systems, or cross-chain bridges, where even minor data discrepancies can lead to significant financial losses.</p>
                <p>Furthermore, the project aims to simplify developer adoption by providing clear interfaces, on-chain accessibility, and support for various blockchain networks. By combining security, decentralization, and usability, Blocksense positions itself as a next-generation oracle solution for an evolving Web3 ecosystem.</p>
            `
        }
    };
})();