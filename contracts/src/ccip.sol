// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {IERC20} from "./IERC20.sol";

// Ethereum Sepolia LINK: 0x779877A7B0D9E8603169DdbD7836e478b4624789

// Ethereum Sepolia USDC: 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
// Arbitrum Sepolia USDC: 0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d
// Base Sepolia USDC: 0x036CbD53842c5426634e7929541eC2318f3dCF7e

// Ethereum Sepolia Chain Selector: 16015286601757825753
// Arbitrum Sepolia Chain Selector:	3478487238524512106
// Base Sepolia Chain Selector: 10344971235874465080

// Ethereum Sepolia Router: 0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59
// Arbitrum Sepolia Router:	0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165
// Base Sepolia Router: 0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93

contract CCIP is OwnerIsCreator {
    error NotEnoughBalance(uint256 currentBalance, uint256 calculatedFees); 
    error NothingToWithdraw(); 
    error FailedToWithdrawEth(address owner, address target, uint256 value); 
    error DestinationChainNotAllowlisted(uint64 destinationChainSelector); 
    error InvalidReceiverAddress(); 
    event TokensTransferred(
        bytes32 indexed messageId, 
        uint64 indexed destinationChainSelector, 
        address receiver, 
        address token, 
        uint256 tokenAmount, 
        address feeToken, 
        uint256 fees 
    );

    IRouterClient private s_router;

    constructor(address _router) {
        s_router = IRouterClient(_router);
    }

    modifier validateReceiver(address _receiver) {
        if (_receiver == address(0)) revert InvalidReceiverAddress();
        _;
    }

    function estimateFee(
        uint64 _destinationChainSelector,
        address _receiver,
        address _token,
        uint256 _amount
    ) external view returns (uint256) {
        Client.EVM2AnyMessage memory evm2AnyMessage = _buildCCIPMessage(
            _receiver,
            _token,
            _amount,
            address(0)
        );

        uint256 fees = s_router.getFee(
            _destinationChainSelector,
            evm2AnyMessage
        );

        return fees;
    }

    function bridge(
        uint64 _destinationChainSelector,
        address _receiver,
        address _token,
        uint256 _amount
    )
        internal
        validateReceiver(_receiver)
        returns (bytes32 messageId)
    {

        Client.EVM2AnyMessage memory evm2AnyMessage = _buildCCIPMessage(
            _receiver,
            _token,
            _amount,
            address(0)
        );

        uint256 fees = s_router.getFee(
            _destinationChainSelector,
            evm2AnyMessage
        );

        if (fees > address(this).balance)
            revert NotEnoughBalance(address(this).balance, fees);

        IERC20(_token).approve(address(s_router), _amount);

        messageId = s_router.ccipSend{value: fees}(
            _destinationChainSelector,
            evm2AnyMessage
        );

        emit TokensTransferred(
            messageId,
            _destinationChainSelector,
            _receiver,
            _token,
            _amount,
            address(0),
            fees
        );

        return messageId;
    }

    function _buildCCIPMessage(
        address _receiver,
        address _token,
        uint256 _amount,
        address _feeTokenAddress
    ) private pure returns (Client.EVM2AnyMessage memory) {
        Client.EVMTokenAmount[]
            memory tokenAmounts = new Client.EVMTokenAmount[](1);
        tokenAmounts[0] = Client.EVMTokenAmount({
            token: _token,
            amount: _amount
        });

        return
            Client.EVM2AnyMessage({
                receiver: abi.encode(_receiver), 
                data: "", 
                tokenAmounts: tokenAmounts, 
                extraArgs: Client._argsToBytes(
                    Client.EVMExtraArgsV1({gasLimit: 0})
                ),
                feeToken: _feeTokenAddress
            });
    }

    receive() external payable {}
}
