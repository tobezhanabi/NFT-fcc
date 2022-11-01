const { deployments, ethers, network, getNamedAccounts } = require("hardhat")
const { DECIMALS, INITIAL_PRICE } = require("../helper-hardhat-config")

//const DECIMALS = "18"
//const INITIAL_PRICE = ethers.utils.parseUnits("2000", "ether")
module.exports = async function ({ getNamedAccounts, deployments }) {
    const BASE_FEE = ethers.utils.parseEther("0.025")
    const GAS_PRICE_LINK = 1e9 // calculated value by chainlink

    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const chainId = network.config.chainId

    if (chainId == 31337) {
        log("Local network detected! Deploying mocks...")
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            log: true,
            args: [BASE_FEE, GAS_PRICE_LINK],
        })
        await deploy("MockV3Aggregator", {
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_PRICE],
        })
        log("Mocks deployed")
        log("___________________________________")
    }
}
module.exports.tags = ["all", "mocks"]
