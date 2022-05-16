module.exports = async function({ ethers: { getNamedSigner }, getNamedAccounts, deployments }) {
    const { deploy } = deployments

    const wbtcaddr = "0x321162Cd933E2Be498Cd2267a90534A804051b11"

    const indexTokenETH = "0x74b23882a30290451a17c44f4f05243b6b58c76d"

    const uniSwapFactory = "0x152ee697f2e276fa89e96742e9bb9ab1f2e61be3"
  
    const { deployer, dev } = await getNamedAccounts()
  
    const chainId = await getChainId()

    const moduleType = {
        version: 0,
        controller: 1,
        strategy: 2,
        mintMaster: 3,
        oracle: 4,
        voterRoll: 5
    }

    const 
        name = "wBTC Oracle"
        url = "hhtps://strudel.finance"

    if (chainId != 1) { //don't deploy to mainnet
        const 
            collateralToken = wbtcaddr //change to wBTC
            factory = await deployments.get("OneTokenFactory")
            Admin = await ethers.getContractFactory("OneTokenFactory")
            admin = Admin.attach(factory.address)
            rate = 1000

        const oracle = await deploy("UniswapOracleSimple", { // wBTC:DAI
            from: deployer,
            args: [factory.address, uniSwapFactory, collateralToken, rate],
            log: true
        })

        if (chainId != 31337) { //don't verify contract on localnet
            await hre.run("verify:verify", {
                address: oracle.address,
                constructorArguments: [
                    factory.address,
                    uniSwapFactory,
                    indexTokenETH,
                    name,
                    collateralToken
                ],
            })
        }
    
        await admin.admitModule(oracle.address, moduleType.oracle, name, url, {
            from: deployer
        })
    }
    

}

module.exports.tags = ["testMemberTokenOracle","testToken"]
module.exports.dependencies = ["testTokens","oneTokenFactory"]