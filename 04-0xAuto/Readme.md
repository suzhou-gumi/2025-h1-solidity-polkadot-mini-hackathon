# 0xAuto OS: Automate Your AI Strategies, Empowered by MCP &amp; A2A!

Tired of manual grinding in Web3? Overwhelmed by information? Missing out on opportunities?
Say goodbye to tedious tasks and embrace intelligence! Introducing 0xAuto OS!

## 1. Project Introduction

**What is 0xAuto OS?**

Simply put, 0xAuto OS is an AI-powered intelligent operating system designed for the Web3 world. Imagine having a team of AI-driven, 7x24 tireless intelligent assistants (we call them Agents). These Agents not only help you automatically acquire and process massive amounts of information but also execute various complex tasks automatically according to your settings, such as DEX trading, token issuance, monitoring market anomalies, and more – allowing you to completely free your hands!

**Core Concepts &amp; Technologies:**

0xAuto OS empowers users to automate tasks and strategies in the Web3 space through a suite of powerful features:

*   **Intelligent Agents:** Customizable AI bots that act as your automated executors in the Web3 world. They can be configured to perform a wide range of tasks based on your specific needs and strategies.
*   **MCP (Model Context Protocol) &amp; A2A (Agent2Agent Protocol):** Our unique, open protocols that enable Agents to easily leverage external capabilities (data, models, APIs) and the abilities of other Agents. This allows for a collaborative and extensible ecosystem where developers and projects can easily integrate their services.
*   **Multi-Agent System:** Multiple Agents can collaborate to handle more complex tasks, significantly amplifying their capabilities.
*   **Abstract Wallet:** A secure, programmable built-in wallet that allows Agents to automatically execute on-chain transactions and manage assets on your behalf, enabling true automated quantitative investment.
*   **Scheduled Execution:** A key advantage! Set up your Agent once, and it will automatically execute tasks according to your schedule, eliminating the need for repeated manual intervention or dialogue.

**What Problems Does 0xAuto OS Solve?**

*   **Information Overload:** Agents can be scheduled to collect, filter, and summarize key information, generating personalized intelligence reports.
*   **Tedious Operations &amp; Lack of Time:** Automate repetitive tasks like daily investments, monitoring whale wallets, or auto-following trades.
*   **Complex Strategies, No Coding Skills Required:** Configure Agents through a simple interface to execute your trading strategies or automated workflows without writing any code.
*   **Security Concerns:** The Abstract Wallet ensures asset security, providing peace of mind for automated trading.
*   **Beyond Chat-Based AI:** Our Agents support scheduled tasks, running autonomously once set up, requiring no manual intervention.

**Who Needs 0xAuto OS?**

*   **Web3 Investors:** From novices to veterans, use it to automatically discover Alpha, execute trading strategies, and manage DeFi positions, saving time and staying ahead.
*   **Web3 Developers/Project Owners:** Easily provide Agent capabilities for your project or service, or integrate your services into the 0xAuto ecosystem using our MCP and A2A protocols.
*   **Anyone Seeking Automation in Web3:** Any scenario requiring scheduled information retrieval or automated execution of on-chain or off-chain tasks can benefit from 0xAuto OS.

## 2. Frontend Architecture

The 0xAuto OS frontend is a modern web application built with a robust and scalable stack:

*   **Framework:** [Next.js](https://nextjs.org/) (version 15.3.1) - A React framework for production, offering server-side rendering, static site generation, and a great developer experience.
*   **UI Library:** [React](https://react.dev/) (version 19.0.0) - A JavaScript library for building user interfaces.
*   **Styling:**
    *   [Tailwind CSS](https://tailwindcss.com/) (version 3.4.17) - A utility-first CSS framework for rapid UI development.
    *   [DaisyUI](https://daisyui.com/) (version 4.11.1) - A Tailwind CSS component library that provides pre-designed components.
*   **State Management:** While not explicitly listed as a dedicated state management library like Redux or Zustand in `package.json`, React's built-in Context API (`ThemeContext.tsx` is present) and component state are likely used for managing application state. For more complex global state, Next.js patterns or a dedicated library might be adopted as needed.
*   **Language:** [TypeScript](https://www.typescriptlang.org/) (version 5) - Adds static typing to JavaScript, improving code quality and maintainability.
*   **Web3 Integration:**
    *   The user request mentions integrating **Wagmi** and **RainbowKit** for wallet connections and blockchain interactions. These libraries simplify connecting to user wallets (like MetaMask) and interacting with smart contracts.
*   **Key UI Components & Features:**
    *   Agent creation and management forms.
    *   Dashboard for displaying active tasks, token balances, and an explore section.
    *   Chat interfaces for interacting with Agents.
    *   Theme toggling for light/dark mode.
    *   Dynamic backgrounds for an enhanced user experience.

The frontend is structured to provide a seamless and intuitive user experience for creating, managing, and monitoring AI Agents and their automated tasks.

## 3. Prisma Backend Architecture

The backend of 0xAuto OS leverages [Prisma](https://www.prisma.io/) (version 6.6.0) as its Object-Relational Mapper (ORM) to interact with a PostgreSQL database. This setup provides a type-safe and efficient way to manage application data.

*   **Database:** PostgreSQL (as specified in `datasource db` in `prisma/schema.prisma`).
*   **ORM:** Prisma Client - Auto-generated and type-safe database client. The client is generated into `src/app/generated/prisma`.
*   **Schema Definition:** The database schema is defined in `prisma/schema.prisma`. Key models include:
    *   `User`: Manages user information, including credentials, points, and associations with Agents and Subscriptions.
    *   `Subscription`: Defines user subscription plans (e.g., FREE, PRO, ELITE) and their associated benefits like daily points.
    *   `Agent`: Represents the AI assistants, including their configuration, status, and links to MCPs, triggers, and logs.
    *   `Mcp`: Defines Model Context Protocol services that Agents can utilize (e.g., price feeds, DEX swap functionalities).
    *   `AgentMcp`: A many-to-many relation table linking Agents to the MCPs they use, including specific configurations.
    *   `Trigger`: Defines conditions or schedules that activate Agents (e.g., scheduled time, price events, on-chain events).
    *   `Log`: Records Agent activity and important events.
    *   `StoreItem`: Represents items available in a potential store, such as Agent templates or MCP services.
    *   `ChatMessage` &amp; `ChatSession`: Manages conversation history for Agent interactions.
*   **Database Migrations:** Prisma Migrate is used to manage database schema changes and ensure consistency across environments. Migrations are stored in the `prisma/migrations` directory.
*   **Seeding:** Prisma supports database seeding, with a seed script likely located at `prisma/seed.ts` (as indicated by the `prisma.seed` script in `package.json`).
*   **Prisma Accelerate:** The schema comments suggest consideration for Prisma Accelerate for query speed-up and scaling, indicating a forward-looking approach to performance.

This Prisma-based backend provides a solid foundation for storing and managing all data related to users, AI Agents, their configurations, interactions, and the broader 0xAuto OS ecosystem.

## 4. EVM Contract Deployment on Asset Hub

The EVM (Ethereum Virtual Machine) smart contracts for 0xAuto OS are developed and managed using [Foundry](https://book.getfoundry.sh/), a fast and modular toolkit for Ethereum application development written in Rust.

**Development & Testing with Foundry:**

*   **Forge:** Foundry's testing framework is used for writing and running unit tests and integration tests for the smart contracts. This ensures contract reliability and correctness.
    *   Test files are typically located in the `contracts/test/` directory (e.g., `FollowAndCopy.t.sol`, `Paymaster.t.sol`).
*   **Anvil:** A local Ethereum node provided by Foundry, used for development and testing in a local environment, simulating live blockchain conditions.
*   **Cast:** A command-line tool for interacting with smart contracts, sending transactions, and querying chain data during development and deployment.
*   **Chisel:** A Solidity REPL for quick experimentation and debugging of Solidity code.

**Contract Structure:**

The smart contracts are organized within the `contracts/src/` directory, likely with subdirectories for different functionalities:
*   `contracts/src/agent/`: Contracts related to Agent functionalities on-chain.
*   `contracts/src/paymaster/`: Contracts potentially related to gas abstraction or payment mechanisms (as suggested by `Paymaster.t.sol`).
*   `contracts/src/registry/`: Contracts for managing registries of Agents, MCPs, or other entities.
*   `contracts/src/token/`: Contracts related to any native tokens or token interactions within the 0xAuto OS.

**Deployment Process (General Flow for Asset Hub):**

While the specific deployment scripts for "Asset Hub" are not fully detailed in the provided `contracts/README.md` (which is a generic Foundry README), the general process using Foundry involves:

1.  **Writing Deployment Scripts:** Solidity scripting (using files ending in `.s.sol`) is Foundry's preferred way to handle deployments. These scripts define the deployment logic.
    *   Examples in the project: `contracts/script/DeployAll.s.sol`, `contracts/script/DeployToGalileo.s.sol`. The `DeployToGalileo.s.sol` suggests deployments to specific testnets or environments. A similar script would be created or adapted for Asset Hub.
2.  **Configuring the Target Network (Asset Hub):**
    *   The RPC URL for Asset Hub needs to be configured. This might be done via environment variables or directly in the deployment command/script.
    *   The private key of the deploying account must be securely provided, typically via environment variables or a secure wallet/hardware wallet integration if supported by Foundry.
3.  **Running the Deployment Script:**
    *   The `forge script` command is used to execute the deployment script. For example:
        ```shell
        forge script script/YourAssetHubDeployScript.s.sol:YourDeployerScript --rpc-url <ASSET_HUB_RPC_URL> --private-key <YOUR_PRIVATE_KEY> --broadcast
        ```
    *   The `--broadcast` flag is used to actually send the transactions to the network. Without it, Forge runs a simulation.
    *   Verification on block explorers (like Etherscan, or Asset Hub's specific explorer) is often an additional step, which can also be automated with Foundry plugins or scripts.

**Managing Contracts on Asset Hub:**

*   **Upgradability:** Depending on the contract design, proxies (like UUPS or Transparent Upgradeable Proxies) might be used to allow for future upgrades to the contract logic without changing the contract address. OpenZeppelin Contracts (listed as a library in `contracts/lib/`) provide standard implementations for such patterns.
*   **Interaction:** Once deployed, Cast can be used to interact with the live contracts on Asset Hub for administrative tasks, checks, or manual interventions if necessary.
*   **Monitoring:** Off-chain services or custom scripts would monitor contract events and state on Asset Hub to integrate with the 0xAuto OS backend and frontend.

The `contracts/script/Config.s.sol` file likely plays a role in managing deployment configurations for different networks, including potentially Asset Hub.

---

**0xAuto OS – Welcome to the new era of intelligent Web3 automation!**
Explore now and let AI accelerate your Web3 journey!