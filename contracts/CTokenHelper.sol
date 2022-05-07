pragma solidity ^0.5.16;

import "./CTokenInterfaces.sol";
import "./EIP20NonStandardInterface.sol";

contract CTokenHelper {
    /// @notice Admin address
    address payable public admin;

    /**
     * @dev Throws if called by any account other than the admin.
     */
    modifier onlyAdmin() {
        require(msg.sender == admin, "admin only");
        _;
    }

    constructor() public {
        admin = msg.sender;
    }

    /**
     * @notice The sender mints and borrows.
     * @param cTokenMint The market that user wants to mint
     * @param mintAmount The mint amount
     * @param cTokenBorrow The market that user wants to borrow
     * @param borrowAmount The borrow amount
     */
    function mintBorrow(
        CErc20Interface cTokenMint,
        uint256 mintAmount,
        CErc20Interface cTokenBorrow,
        uint256 borrowAmount
    ) external {
        cTokenMint.mint(msg.sender, mintAmount);
        cTokenBorrow.borrow(msg.sender, borrowAmount);
    }

    /**
     * @notice The sender repays and redeems.
     * @param cTokenRepay The market that user wants to repay
     * @param repayAmount The repay amount
     * @param cTokenRedeem The market that user wants to redeem
     * @param redeemTokens The number of cTokens to redeem into underlying
     * @param redeemAmount The amount of underlying to receive from redeeming cTokens
     */
    function repayRedeem(
        CErc20Interface cTokenRepay,
        uint256 repayAmount,
        CErc20Interface cTokenRedeem,
        uint256 redeemTokens,
        uint256 redeemAmount
    ) external {
        cTokenRepay.repayBorrow(msg.sender, repayAmount);
        cTokenRedeem.redeem(msg.sender, redeemTokens, redeemAmount);
    }

    /*** Admin functions ***/

    /**
     * @notice Seize the stock assets
     * @param token The token address
     */
    function seize(address token) external onlyAdmin {
        uint256 amount = EIP20NonStandardInterface(token).balanceOf(address(this));
        if (amount > 0) {
            EIP20NonStandardInterface(token).transfer(admin, amount);

            bool success;
            assembly {
                switch returndatasize()
                case 0 {
                    // This is a non-standard ERC-20
                    success := not(0) // set success to true
                }
                case 32 {
                    // This is a complaint ERC-20
                    returndatacopy(0, 0, 32)
                    success := mload(0) // Set `success = returndata` of external call
                }
                default {
                    if lt(returndatasize(), 32) {
                        revert(0, 0) // This is a non-compliant ERC-20, revert.
                    }
                    returndatacopy(0, 0, 32) // Vyper compiler before 0.2.8 will not truncate RETURNDATASIZE.
                    success := mload(0) // See here: https://github.com/vyperlang/vyper/security/advisories/GHSA-375m-5fvv-xq23
                }
            }
            require(success, "TOKEN_TRANSFER_OUT_FAILED");
        }
    }

    /**
     * @notice Set the admin
     * @param newAdmin The new admin
     */
    function setAdmin(address payable newAdmin) external onlyAdmin {
        admin = newAdmin;
    }
}
