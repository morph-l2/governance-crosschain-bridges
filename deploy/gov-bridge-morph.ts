import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ADDRESSES, CONSTANTS } from '../helpers/gov-constants';
import { eMorphNetwork } from '../helpers/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log(`Deployer: ${deployer}\n`);

  const morphGov = await deployments.getOrNull('MorphGov');

  if (morphGov) {
    log(`Reusing Morph governance at: ${morphGov.address}`);
  } else {
    let L2_MORPH_MESSENGER = ADDRESSES['L2_MORPH_MESSENGER'];
    let MORPH_GOV_EXECUTOR = ADDRESSES['MORPH_GOV_EXECUTOR'];
    if (hre.network.name == eMorphNetwork.morphHolesky) {
        L2_MORPH_MESSENGER = ADDRESSES['L2_MORPH_MESSENGER_HOLESKY'];
        MORPH_GOV_EXECUTOR = ADDRESSES['MORPH_GOV_EXECUTOR_HOLESKY'];
      }

    await deploy('MorphGov', {
      args: [
        L2_MORPH_MESSENGER,
        MORPH_GOV_EXECUTOR,
        CONSTANTS['DELAY'],
        CONSTANTS['GRACE_PERIOD'],
        CONSTANTS['MIN_DELAY'],
        CONSTANTS['MAX_DELAY'],
        ADDRESSES['MORPH_GUARDIAN'],
      ],
      contract: 'MorphBridgeExecutor',
      from: deployer,
      log: true,
    });
  }
};

export default func;
func.dependencies = [];
func.tags = ['MorphGov'];
