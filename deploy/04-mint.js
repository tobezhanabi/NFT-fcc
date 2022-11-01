const { ethers, network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

module.exports = async function ({ getNamedAccounts }) {
    const { deployer } = await getNamedAccounts()

    //Basic NFT

    const basicNft = await ethers.getContract("BasicNft", deployer)
    const basicMinTx = await basicNft.mintNft()
    await basicMinTx.wait(1)
    console.log(`basic NFt index 0 has tokenUri: ${await basicNft.tokenURI(0)}`)

    //random IPFS NFT

    const randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer)
    const mintFee = await randomIpfsNft.getMintFee()
    const randomIpfsNftMinTx = await randomIpfsNft.requestNft({ value: mintFee.toString() })
    const randomIpfsNftMinTxReceipt = await randomIpfsNftMinTx.wait(1)

    await new Promise(async (resolve, reject) => {
        setTimeout(() => reject("Rimeout:  'NFTMinted' event did not fire"), 300000)
        randomIpfsNft.once("NftMinted", async function () {
            resolve()
        })

        if (developmentChains.includes(network.name)) {
            const requestId = randomIpfsNftMinTxReceipt.events[1].args.requestId.toString()
            const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
            await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, randomIpfsNft.address)
        }
    })
    console.log(`Random IPFS NFtT index 0 tokenURI: ${await randomIpfsNft.tokenURI(0)}`)

    //dynamic SVG NFT
    const highValue = ethers.utils.parseEther("4000")
    const dynamicSvgNft = await ethers.getContract("DynamicSvgNft", deployer)
    const dynamicSvgNftMintTx = await dynamicSvgNft.mintNft(highValue.toString())
    await dynamicSvgNftMintTx.wait(1)
    console.log(`Dynanic SVg NFT  index 0 tokenURI: ${await dynamicSvgNft.tokenURI(0)}`)
}
module.exports.tags = ["all", "mint"]
