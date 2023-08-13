# RevNet

RevNet is an open, decentralized review network where users can create profiles and review others, establishing an on-chain history. Built using Ethereum Attestation Service (EAS) and thirdweb, RevNet aims to be the go-to platform for transparent and open-source reviews.

## Features

- **Profile Creation**: Users can set up their profile with a username, profile picture, Twitter handle, and a brief "About Me" section.
- **Review System**: Each user can review other members by validating their profile's authenticity, providing a rating, and leaving a textual review.
- **Reply to Reviews**: Users can also reply to reviews and express their agreement with them through a "like" system.
- **Integrated with Ethereum Attestation Service (EAS)**: All reviews, profiles, and replies are attestations on the blockchain, ensuring transparency and immutability.
- **Built on Base**: To ensure broad accessibility and minimize fees, RevNet is deployed on Base, Coinbase's new blockchain.
  
## Getting Started

Before you dive in, ensure you have the necessary dependencies and environment variables set up.

### Prerequisites

- Node.js
- Yarn or npm
- Metamask or another web3 provider

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/sherajr/RevNet.git
    ```
2. Navigate to the project directory:
    ```bash
    cd RevNet
    ```
3. Install the dependencies:
    ```bash
    yarn install
    # or
    npm install
    ```
4. Start the development server:
    ```bash
    yarn start
    # or
    npm start
    ```

## Built With

- [**Ethereum Attestation Service (EAS)**](https://docs.attest.sh/docs/welcome) - The core of the project used for attestations.
- [**thirdweb**](https://thirdweb.com) - Used as a foundation to bootstrap the project.
- [**Base**](https://base.org/) - The blockchain network where RevNet is deployed.

## Future Improvements

- **Enhanced Frontend Features**: Add functionality to continue replying, filter, and sort reviews.
- **UI Enhancements**: Introduce colored bars to visually represent scores and other meaningful metrics.
- **React Optimizations**: Improve the usage of React effects to ensure the UI updates after new reviews or replies.

## Acknowledgements

Special thanks to chatGPT for assisting throughout the development process.

## License

This project is licensed under the MIT License. See `LICENSE` for more details.

## Author

Sheraj Ragoobeer
