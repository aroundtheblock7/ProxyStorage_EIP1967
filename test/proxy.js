const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { assert } = require("chai");

describe("Proxy", function () {

  async function deployFixture() {

    const Proxy = await ethers.getContractFactory("Proxy");
    const proxy = await Proxy.deploy();

    const Logic1 = await ethers.getContractFactory("Logic1");
    const logic1 = await Logic1.deploy();

    const Logic2 = await ethers.getContractFactory("Logic2");
    const logic2 = await Logic2.deploy();

    //The 3 options we have to call changeX or any functions on Logic1 or Logic2 are...
    //1.)We can come up call data manually using keccak hash of the functon sig, encode the arguments, etc. 
    //2.)We can use... new ethers.utils.Interface("function changeX() external") & define our own interface for the proxy
    //3.)Since we already have the interfaces of logic1 & logic2 using getContractFactory we can use getContractAt like so...
    //... this uses the abi from Logic1 pointing at the proxy address
     const proxyAsLogic1 = await ethers.getContractAt("Logic1", proxy.address)
     const proxyAsLogic2 = await ethers.getContractAt("Logic2", proxy.address)

    return { proxy, logic1, logic2, proxyAsLogic1, proxyAsLogic2 };
  }

  //eth_getStorageAt
  async function lookupUint(contractAddr, slot) {
    return parseInt(await ethers.provider.getStorageAt(contractAddr, slot));
  }

    it("It should work with logic1", async function () {
      const { proxy, logic1, proxyAsLogic1} = await loadFixture(deployFixture);

      await proxy.changeImplementation(logic1.address);

      assert.equal(await lookupUint(proxy.address, "0x0"), 0);

      //changeX function is not defined on the proxy abi and can no longer be called like this...
      //await proxy.changeX(52);
      
      //After setting up proxyAsLogic1 we can call now call changeX like so...
      await proxyAsLogic1.changeX(52);

      assert.equal(await lookupUint(proxy.address, "0x0"), 52);
    });

    it("It should work with upgrades", async function () {

      const { proxy, logic1, logic2, proxyAsLogic1, proxyAsLogic2 } = await loadFixture(deployFixture);

      //START AT LOGIC 1
      await proxy.changeImplementation(logic1.address);

      assert.equal(await lookupUint(proxy.address, "0x0"), 0)

      await proxyAsLogic1.changeX(45);

      assert.equal(await lookupUint(proxy.address, "0x0"), 45);

      //UPGRADE TO LOGIC 2
      await proxy.changeImplementation(logic2.address);

      //We chnaged implemenation address to logic2 but remember we are using proxy storage so x still = 45 here. 
      assert.equal(await lookupUint(proxy.address, "0x0"), 45);

      await proxyAsLogic2.changeX(25);

      assert.equal(await lookupUint(proxy.address, "0x0"), 50);

      await proxyAsLogic2.tripleX();

      assert.equal(await lookupUint(proxy.address, "0x0"), 150);

    });
});
