// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Forwarder {
    error NativeTransferFailed();
    event FundsForwardedWithId(uint256 id);
    event FundsForwardedWithData(bytes data);

    address private immutable SOLVER;

    constructor(address solver) {
        SOLVER = solver;
    }

    fallback() external payable {
        send(SOLVER, msg.value);
        emit FundsForwardedWithData(msg.data);
    }

    function forwardWithData(bytes calldata data) external payable {
        send(SOLVER, msg.value);
        emit FundsForwardedWithData(data);
    }

    function forwardWithId(uint256 id) external payable{
        send(SOLVER, msg.value);
        emit FundsForwardedWithId(id);
    }

    function send(address to, uint256 value) internal {
        bool success;
        assembly {
            success := call(100000, to, value, 0, 0, 0, 0)
        }

        if (!success) {
            revert NativeTransferFailed();
        }
    }
}