//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.10;

import {IMorphMessenger} from '../dependencies/morph/interfaces/IMorphMessenger.sol';

import {MockMorphL2CrossDomainMessenger} from "./MockMorphL2CrossDomainMessenger.sol";

contract MockMorphL1CrossDomainMessenger is IMorphMessenger {
  address private sender;
  address private l2Messenger;

  function setSender(address _sender) external {
    sender = _sender;
  }

  function setL2Messenger(address _l2Messenger) external {
    l2Messenger = _l2Messenger;
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
    MockMorphL2CrossDomainMessenger(l2Messenger).redirect{value: _value}(msg.sender, _target, _value, _message, _gasLimit);
  }

  function redirect(
    address _target,
    uint256 _value,
    bytes calldata _message,
    uint256 _gasLimit
  ) external payable {
    bool success;
    (success, ) = _target.call{value: _value, gas: _gasLimit}(_message);
  }
}
