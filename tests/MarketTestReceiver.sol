// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IMarketUnderTest {
    function buy(uint8 side, uint256 amount) external payable;
    function sell(
        uint8 side,
        uint256 amount,
        uint256 minReturn
    ) external;
    function claim() external;
}

contract MarketTestReceiver {
    address public immutable controller;
    IMarketUnderTest public immutable market;

    bool public rejectETH;
    bool public attemptReentry;
    uint256 public reentryAttempts;
    bool public lastReentrySucceeded;
    bytes public lastReentryError;

    modifier onlyController() {
        require(msg.sender == controller, "Only controller");
        _;
    }

    constructor(address marketAddress) {
        require(marketAddress != address(0), "Invalid market");
        controller = msg.sender;
        market = IMarketUnderTest(marketAddress);
    }

    function configure(
        bool reject_,
        bool reenter_
    ) external onlyController {
        rejectETH = reject_;
        attemptReentry = reenter_;
        reentryAttempts = 0;
        lastReentrySucceeded = false;
        delete lastReentryError;
    }

    function buy(
        uint8 side,
        uint256 amount
    ) external payable onlyController {
        market.buy{value: msg.value}(side, amount);
    }

    function sell(
        uint8 side,
        uint256 amount,
        uint256 minReturn
    ) external onlyController {
        market.sell(side, amount, minReturn);
    }

    function claim() external onlyController {
        market.claim();
    }

    receive() external payable {
        require(msg.sender == address(market), "Only market");
        require(!rejectETH, "Receiver rejects ETH");

        if (attemptReentry) {
            attemptReentry = false;
            reentryAttempts += 1;

            (bool ok, bytes memory data) =
                address(market).call(
                    abi.encodeWithSignature("claim()")
                );

            lastReentrySucceeded = ok;
            lastReentryError = data;
        }
    }
}
