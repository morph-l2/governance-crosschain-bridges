import { BigNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import { task } from 'hardhat/config';
import { ADDRESSES, CONSTANTS } from '../../helpers/gov-constants';

import { DRE } from '../../helpers/misc-utils';
import { eEthereumNetwork, eMorphNetwork } from '../../helpers/types';
import {
  Greeter__factory,
  IMorphMessenger__factory,
  MorphBridgeExecutor__factory,
} from '../../typechain';

task(
  'morph:initiate-greeting',
  'Queue a greeting in the governance executor on Morph by transacting on L1'
).setAction(async (_, hre) => {
  await hre.run('set-DRE');

  if (DRE.network.name != eEthereumNetwork.sepolia && DRE.network.name != eEthereumNetwork.main) {
    throw new Error('Only applicable on mainnet or kovan where morph L2 exist');
  }

  const GAS_LIMIT = 1500000;
  const MESSAGE = 'Miguel was also here';

  let L1_MORPH_MESSENGER = ADDRESSES['L1_MORPH_MESSENGER'];
  if (DRE.network.name == eEthereumNetwork.holesky) {
    L1_MORPH_MESSENGER = ADDRESSES['L1_MORPH_MESSENGER_HOLESKY'];
  }

  const l2 = DRE.companionNetworks['morph'];

  const { deployer: deployerAddress } = await DRE.getNamedAccounts();
  const deployer = await DRE.ethers.getSigner(deployerAddress);
  console.log(
    `Deployer address: ${deployer.address} (${formatUnits(await deployer.getBalance())})`
  );

  // Note, the contract is on the morph network, but only used to encode so no issue
  const morphGov = MorphBridgeExecutor__factory.connect(
    (await l2.deployments.get('MorphGov')).address,
    deployer
  );
  console.log(`Morph Gov at ${morphGov.address}`);

  // Note, the contract is on the morph network, but only used to encode so no issue
  const greeter = Greeter__factory.connect((await l2.deployments.get('Greeter')).address, deployer);
  console.log(`Greeter at ${greeter.address}`);

  const messenger = IMorphMessenger__factory.connect(L1_MORPH_MESSENGER, deployer);
  console.log(`L1_MORPH_MESSENGER at: ${messenger.address}`);

  const encodedGreeting = greeter.interface.encodeFunctionData('setMessage', [MESSAGE]);

  const targets: string[] = [greeter.address];
  const values: BigNumber[] = [BigNumber.from(0)];
  const signatures: string[] = [''];
  const calldatas: string[] = [encodedGreeting];
  const withDelegatecalls: boolean[] = [false];

  const encodedQueue = morphGov.interface.encodeFunctionData('queue', [
    targets,
    values,
    signatures,
    calldatas,
    withDelegatecalls,
  ]);

  const tx = await messenger.sendMessage(morphGov.address, 0, encodedQueue, GAS_LIMIT);
  console.log(`Transaction initiated: ${tx.hash}`);
});

task('morph:execute-greeting', '')
  .addParam('id', 'Id of the proposal to execute')
  .setAction(async (taskArg, hre) => {
    await hre.run('set-DRE');

    if (
      DRE.network.name != eMorphNetwork.morph &&
      DRE.network.name != eMorphNetwork.morphHolesky
    ) {
      throw new Error('Only applicable on morph L2');
    }

    const id = taskArg.id;

    const { deployer: deployerAddress } = await DRE.getNamedAccounts();
    const deployer = await DRE.ethers.getSigner(deployerAddress);
    console.log(
      `Deployer address: ${deployer.address} (${formatUnits(await deployer.getBalance())})`
    );

    // Note, the contract is on the morph network, but only used to encode so no issue
    const morphGov = MorphBridgeExecutor__factory.connect(
      (await DRE.deployments.get('MorphGov')).address,
      deployer
    );
    console.log(`Morph Gov at ${morphGov.address}`);

    // Note, the contract is on the morph network, but only used to encode so no issue
    const greeter = Greeter__factory.connect(
      (await DRE.deployments.get('Greeter')).address,
      deployer
    );
    console.log(`Greeter at ${greeter.address}`);

    const tx = await morphGov.execute(id);

    console.log(`Transaction initiated: ${tx.hash}`);
  });
