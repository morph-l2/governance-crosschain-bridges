//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.10;

import {IMorphMessenger} from '../dependencies/morph/interfaces/IMorphMessenger.sol';

import {MockMorphL1CrossDomainMessenger} from "./MockMorphL1CrossDomainMessenger.sol";

contract MockMorphL2CrossDomainMessenger is IMorphMessenger {
  address private sender;
  address private l1Messenger;

  function setSender(address _sender) external {
    sender = _sender;
  }

  function setL1Messenger(address _l1Messenger) external {
    l1Messenger = _l1Messenger;
  }

  function xDomainMessageSender() external view override returns (address) {
    return sender;
  }

  function sendMessage(
    address _target,
    uint256 _value,
    bytes calldata _message,
    uint256 _gasLimit
  ) external payable override {
    MockMorphL1CrossDomainMessenger(l1Messenger).redirect{value:_value}(_target, _value, _message, _gasLimit);
  }

  // This error must be defined here or else Hardhat will not recognize the selector
  error UnauthorizedEthereumExecutor();

  function redirect(
    address _xDomainMessageSender,
    address _target,
    uint256 _value,
    bytes calldata _message,
    uint256 _gasLimit
  ) external payable {
    sender = _xDomainMessageSender;
    (bool success, bytes memory data) = _target.call{value: _value, gas: _gasLimit}(_message);
    if (!success) {
      assembly {
        revert(add(data, 32), mload(data))
      }
    }
  }
}
