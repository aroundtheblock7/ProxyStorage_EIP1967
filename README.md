# Proxy Storage with EIP1967 

### In this project a proxy contract is written with 2 logic contracts (implementaion contracts). In the proxy contract a function is created to pass in the the implementation address (upgraded contract) and a fallback function that uses delegatecall is created to forward the calls to the implementation (logic contract), all the while using the storage on the proxy contract. Instead of roling my own proxy (never good to do this) I have used EIP1967 (Open Zeppelin Storage Slot Library) which defines where the implementation should live on a proxy contract so to avoid slot collisions.

### One thing that it does not do is return the return value in the fallback function. This can only be done by dropping down into assembly code, as shown by the OpenZeppelin proxy logic... https://docs.openzeppelin.com/upgrades-plugins/1.x/proxies#proxy-forwarding

### A number of tests have been written in the test folder (proxy.js) (`npx hardhat test`) to test the smart contract functionality and ensure the upgrade from Logic1 to Logic2 contract's are working correctly. 