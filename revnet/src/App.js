import { ConnectWallet } from "@thirdweb-dev/react";
import "./styles/Home.css";
import { EAS, Offchain, SchemaEncoder, SchemaRegistry } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from 'ethers';

export const EASContractAddress = "0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587"; // Changed to Ethereum to test on existing schemas

// Initialize the sdk with the address of the EAS Schema contract address
const eas = new EAS(EASContractAddress);

// Gets a default provider (in production use something else like infura/alchemy)
const provider = ethers.providers.getDefaultProvider(
  "mainnet"
);

// Connects an ethers style provider/signingProvider to perform read/write functions.
// MUST be a signer to do write operations!
eas.connect(provider);

const uid = "0x68af8459d9109a928ae426f516ccede794c83bc70641ceb63248a31f67090f99";

const attestation = await eas.getAttestation(uid);

console.log(attestation);

export default function Home() {
  return (
    <main className="main">
      <div className="container">
        <div className="header">
          <h1 className="title">
            Welcome to{" "}
            <span className="gradient-text-0">
              <a
                href="https://thirdweb.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                thirdweb.
              </a>
            </span>
          </h1>

          <p className="description">
            Get started by configuring your desired network in{" "}
            <code className="code">src/index.js</code>, then modify the{" "}
            <code className="code">src/App.js</code> file!
          </p>

          <div className="connect">
            <ConnectWallet
              dropdownPosition={{
                side: "bottom",
                align: "center",
              }}
            />
          </div>
        </div>

        <div className="grid">
          <a
            href="https://portal.thirdweb.com/"
            className="card"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/images/portal-preview.png"
              alt="Placeholder preview of starter"
            />
            <div className="card-text">
              <h2 className="gradient-text-1">Portal ➜</h2>
              <p>
                Guides, references, and resources that will help you build with
                thirdweb.
              </p>
            </div>
          </a>

          <a
            href="https://thirdweb.com/dashboard"
            className="card"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/images/dashboard-preview.png"
              alt="Placeholder preview of starter"
            />
            <div className="card-text">
              <h2 className="gradient-text-2">Dashboard ➜</h2>
              <p>
                Deploy, configure, and manage your smart contracts from the
                dashboard.
              </p>
            </div>
          </a>

          <a
            href="https://thirdweb.com/templates"
            className="card"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/images/templates-preview.png"
              alt="Placeholder preview of templates"
            />
            <div className="card-text">
              <h2 className="gradient-text-3">Templates ➜</h2>
              <p>
                Discover and clone template projects showcasing thirdweb
                features.
              </p>
            </div>
          </a>
        </div>
      </div>
    </main>
  );
}
