const { ethers, network, deployments } = require("hardhat")
const { assert } = require("chai")
const { developmentChains } = require("../../helper-hardhat-config")
// remember we have to test on testnet so we need a developmentschain
!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Basic NFT unit test", function () {
          let basicNft, deployer
          beforeEach(async function () {
              accounts = await ethers.getSigners()
              deployer = accounts[0]
              await deployments.fixture(["basicnft"])
              basicNft = await ethers.getContract("BasicNft")
          })
          describe("Constructor", function () {
              it("initializes the NFT correctly", async function () {
                  const name = await basicNft.name()
                  const symbol = await basicNft.symbol()
                  const tokenCounter = await basicNft.getTokenCounter()
                  assert.equal(name, "Dogie")
                  assert.equal(symbol, "DOG")
                  assert.equal(tokenCounter.toString(), "0")
              })
          })
          describe("Mint NFT", function () {
              beforeEach(async function () {
                  const txResponse = await basicNft.mintNft()
                  await txResponse.wait(1)
              })
              it("allows users to mint an NFT and updates app ", async function () {
                  const tokenURI = await basicNft.tokenURI(0)
                  const tokenCounter = await basicNft.getTokenCounter()

                  assert.equal(tokenCounter.toString(), "1")
                  assert.equal(tokenURI, await basicNft.TOKEN_URI())
              })

              it("show the correct balance and owner of an NFT", async function () {
                  const deployerAddress = deployer.address
                  const deployerBalance = await basicNft.balanceOf(deployerAddress)
                  const owner = await basicNft.ownerOf("1")

                  assert.equal(deployerBalance.toString(), "1")
                  expect(owner, deployerAddress)
              })
          })
      })
