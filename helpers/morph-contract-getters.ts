import { Signer, BigNumber } from 'ethers';
import {
  MorphBridgeExecutor,
  MorphBridgeExecutor__factory,
  MockMorphL1CrossDomainMessenger,
  MockMorphL1CrossDomainMessenger__factory,
  MockMorphL2CrossDomainMessenger,
  MockMorphL2CrossDomainMessenger__factory,
} from '../typechain';
import { tEthereumAddress } from './types';

export const deployMorphMessengers = async (
  signer: Signer
): Promise<[MockMorphL1CrossDomainMessenger, MockMorphL2CrossDomainMessenger]> => {
  const l1Messenger = await new MockMorphL1CrossDomainMessenger__factory(signer).deploy();
  const l2Messenger = await new MockMorphL2CrossDomainMessenger__factory(signer).deploy();
  await l1Messenger.deployTransaction.wait();
  await l2Messenger.deployTransaction.wait();
  await l1Messenger.setL2Messenger(l2Messenger.address);
  await l2Messenger.setL1Messenger(l1Messenger.address);
  return [l1Messenger, l2Messenger];
};

export const deployMorphBridgeExecutor = async (
  morphMessenger: tEthereumAddress,
  ethereumExecutor: tEthereumAddress,
  delay: BigNumber,
  gracePeriod: BigNumber,
  minimumDelay: BigNumber,
  maximumDelay: BigNumber,
  guardian: tEthereumAddress,
  signer: Signer
): Promise<MorphBridgeExecutor> => {
  const morphBridgeExecutorFactory = new MorphBridgeExecutor__factory(signer);
  const morphBridgeExecutor = await morphBridgeExecutorFactory.deploy(
    morphMessenger,
    ethereumExecutor,
    delay,
    gracePeriod,
    minimumDelay,
    maximumDelay,
    guardian
  );
  await morphBridgeExecutor.deployTransaction.wait();
  return morphBridgeExecutor;
};
