// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract BalanceViewer {
    struct UserBalances {
        bool success;      
        uint256 tokenBalance;    
        uint256 nativeBalance; 
    }

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

    function getMultiUserBalances(
        address[] calldata users,
        address[] calldata tokens
    )
        external
        view
        returns (UserBalances[] memory)
    {
        UserBalances[] memory results = new UserBalances[](users.length);

        for (uint256 i = 0; i < users.length; i++) {
            (bool ok, uint256 tokenBal) = getBalance(users[i], tokens[i]);
            results[i] = UserBalances({
                success: ok,
                tokenBalance: tokenBal,
                nativeBalance: users[i].balance
            });
        }
        return results;
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