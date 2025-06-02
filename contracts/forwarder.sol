// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Forwarder {
    error NativeTransferFailed();
    event FundsForwardedInt(uint256 ID);
    event FundsForwardedWithData(bytes data);

    address private immutable SOLVER;

    constructor(address solver) {
        SOLVER = solver;
    }

    fallback() external payable {
        send(SOLVER, msg.value);
        emit FundsForwardedWithData(msg.data);
    }

    function forward(bytes calldata data) external payable {
        send(SOLVER, msg.value);
        emit FundsForwardedWithData(data);
    }

    function forwardInt(uint256 ID) external payable{
        send(SOLVER, msg.value);
        emit FundsForwardedInt(ID);
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