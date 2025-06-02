// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract BalanceViewer {
    function getBalances(
        address user,
        address[] calldata tokens
    )
        external
        view
        returns (bool[] memory _successes, uint256[] memory _balances)
    {
        _successes = new bool[](tokens.length + 1);
        _balances = new uint256[](tokens.length + 1);

        for (uint i = 0; i < tokens.length; i++) {
            (_successes[i], _balances[i]) = getBalance(user, tokens[i]);
        }

        (_successes[tokens.length], _balances[tokens.length]) = (
            true,
            address(user).balance
        );
    }

    function batchGetBalances(
        address[] calldata users,
        address[] calldata tokens
    )
        external
        view
        returns (bool[][] memory allSuccesses, uint256[][] memory allBalances)
    {
        allSuccesses = new bool[][](users.length);
        allBalances = new uint256[][](users.length);

        for (uint i = 0; i < users.length; i++) {
            bool[] memory successes = new bool[](tokens.length + 1);
            uint256[] memory balances = new uint256[](tokens.length + 1);

            for (uint j = 0; j < tokens.length; j++) {
                (successes[j], balances[j]) = getBalance(users[i], tokens[j]);
            }

            successes[tokens.length] = true;
            balances[tokens.length] = users[i].balance;

            allSuccesses[i] = successes;
            allBalances[i] = balances;
        }
    }

    function getBalance(
        address user,
        address token
    ) internal view returns (bool txSuccess, uint256 balance) {
        uint256 size;
        assembly {
            size := extcodesize(token)
        }
        if (size == 0) {
            return (txSuccess, balance);
        }

        (bool success, bytes memory data) = token.staticcall(
            abi.encodeWithSelector(0x70a08231, user)
        );

        if (success) {
            balance = abi.decode(data, (uint256));
            txSuccess = true;
        }
    }
}