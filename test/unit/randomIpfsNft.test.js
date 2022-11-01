const { ethers, network, deployments } = require("hardhat")
const { assert, expect } = require("chai")
const { developmentChains } = require("../../helper-hardhat-config")
const { randomBytes } = require("ethers/lib/utils")
!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Random NFt Tests", function () {
          let randomNft, vrfCoordinatorV2Mock, deployer

          beforeEach(async () => {
              accounts = await ethers.getSigners() // could also do with getNamedAccounts
              deployer = accounts[0]

              await deployments.fixture(["mocks", "randomipfs"]) // Deploys modules with the tags "mocks" and "raffle"
              randomNft = await ethers.getContract("RandomIpfsNft") // Returns a new connection to the Raffle contract
              vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock") // Returns a new connection to the VRFCoordinatorV2Mock contract
          })
          describe("constructor", function () {
              it("initializes the nft randomly and correctly", async () => {
                  // tokenuri is the only unique thin gwe havwe to check in trhe constructor
                  const dogTokenUriZero = await randomNft.getDogTokenUris(0)
                  const isInitialized = await randomNft.getIntialized()
                  assert(dogTokenUriZero.includes("ipfs://"))
                  assert.equal(isInitialized, true)
              })
          })

          describe("requestNft", function () {
              it("fails if payment isn't sent with the request", async function () {
                  await expect(randomNft.requestNft()).to.be.revertedWith(
                      "RandomIpfsNft__NeedMoreETHSent"
                  )
              })
              it("reverts if payment amount is less than the mint fee", async function () {
                  const fee = await randomNft.getMintFee()
                  await expect(
                      randomNft.requestNft({
                          value: fee.sub(ethers.utils.parseEther("0.01")),
                      })
                  ).to.be.revertedWith("RandomIpfsNft__NeedMoreETHSent")
              })
              it("emits an event and kick off a random word request", async function () {
                  const fee = await randomNft.getMintFee()
                  await expect(randomNft.requestNft({ value: fee.toString() })).to.emit(
                      randomNft,
                      "NftRequested"
                  )
              })
          })
          describe("fulfillRandomWords", () => {
              it("mint NFT after random is returned", async function () {
                  await new Promise(async (resolve, reject) => {
                      randomNft.once("NftMInted", async () => {
                          try {
                              const tokenUri = await randomNft.tokenURI("0")
                              const tokenCounter = await randomNft.getTokenCounter()
                              assert.equal(tokenUri.toString().includes("ipfs://"))
                              assert.equal(tokenCounter.toString(), "1")
                              resolve()
                          } catch (e) {
                              console.log(e)
                              reject(e)
                          }
                      })
                      try {
                          const fee = await randomNft.getMintFee()
                          const requestNftResponse = await randomNft.requestNft({
                              value: fee.toString(),
                          })
                          const requestNftReceipt = await requestNftResponse.wait(1)
                          await vrfCoordinatorV2Mock.fulfillRandomWords(
                              requestNftReceipt.events[1].args.requesteId,
                              randomNft.address
                          )
                      } catch (e) {
                          console.log(e)
                          reject(e)
                      }
                  })
              })
          })

          describe("getBreedFromMOddedRNg", function () {
              it("should return pug if moddedRng < 10", async function () {
                  const expectedValue = await randomNft.getBreedFromModdedRng(7)
                  assert.equal(0, expectedValue)
              })
              it("should return shiba-inu if moddedRng is between 10 - 39", async function () {
                  const expectedValue = await randomNft.getBreedFromModdedRng(21)
                  assert.equal(1, expectedValue)
              })
              it("should return st. bernard if moddedRng is between 40 - 99", async function () {
                  const expectedValue = await randomNft.getBreedFromModdedRng(77)
                  assert.equal(2, expectedValue)
              })
              it("should revert if moddedRng > 99", async function () {
                  await expect(randomNft.getBreedFromModdedRng(100)).to.be.revertedWith(
                      "RandomIpfsNft__RangeOutOfBounds"
                  )
              })
          })
      })
