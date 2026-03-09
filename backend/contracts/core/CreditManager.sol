// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Errors} from "../libraries/Errors.sol";
import {ICreditManager} from "../interfaces/ICreditManager.sol";

contract CreditManager is ICreditManager {
    address public router;
    address public oracle;
    address public pool;

    mapping(address => uint256) private _collateralValue;
    mapping(address => uint256) private _delegatedCredit;
    mapping(address => uint256) private _totalDebt;
    mapping(address => bool) public frozen;
    mapping(address => uint256) public accountOpenedAt;
    mapping(address => uint256) public borrowCount;
    mapping(address => uint256) public repaymentCount;
    mapping(address => uint256) public liquidationCount;

    event BorrowRecorded(address indexed user, uint256 amount, uint256 newDebt);
    event RepayRecorded(address indexed user, uint256 amount, uint256 newDebt);
    event LiquidationRecorded(address indexed user, uint256 repayAmount, uint256 newDebt);
    event Frozen(address indexed user);

    modifier onlyRouter() {
        _onlyRouter();
        _;
    }

    modifier onlyRouterOrPool() {
        if (msg.sender != router && msg.sender != pool) revert Errors.NotAuthorized();
        _;
    }

    function _onlyRouter() internal view {
        if (msg.sender != router) revert Errors.NotAuthorized();
    }

    constructor(address _router, address _oracle) {
        router = _router;
        oracle = _oracle;
    }

    function setCollateralValue(address user, uint256 value) external onlyRouter {
        _collateralValue[user] = value;
    }

    function setPool(address _pool) external onlyRouter {
        pool = _pool;
    }

    function setDelegatedCredit(address user, uint256 value) external onlyRouterOrPool {
        _delegatedCredit[user] = value;
    }

    function validateBorrow(address user, uint256 amount) external view override returns (bool) {
        if (frozen[user]) return false;
        if (amount == 0) return false;

        uint256 limit = _collateralValue[user] + _delegatedCredit[user];
        return _totalDebt[user] + amount <= limit;
    }

    function onBorrow(address user, uint256 amount) external override onlyRouter {
        if (!this.validateBorrow(user, amount)) revert Errors.InsufficientCredit();

        if (accountOpenedAt[user] == 0) {
            accountOpenedAt[user] = block.timestamp;
        }

        _totalDebt[user] += amount;
        borrowCount[user] += 1;

        emit BorrowRecorded(user, amount, _totalDebt[user]);
    }

    function onRepay(address user, uint256 amount) external onlyRouter {
        uint256 debt = _totalDebt[user];
        if (amount > debt) amount = debt;

        _totalDebt[user] -= amount;

        if (amount > 0) {
            repaymentCount[user] += 1;
        }

        emit RepayRecorded(user, amount, _totalDebt[user]);
    }

    function onLiquidation(address user, uint256 repayAmount) external override onlyRouter {
        if (repayAmount == 0) revert Errors.InvalidAmount();

        uint256 debt = _totalDebt[user];
        if (repayAmount > debt) revert Errors.RepayExceedsDebt();

        _totalDebt[user] = debt - repayAmount;
        liquidationCount[user] += 1;
        frozen[user] = true;

        emit LiquidationRecorded(user, repayAmount, _totalDebt[user]);
        emit Frozen(user);
    }

    function freeze(address user) external onlyRouter {
        frozen[user] = true;
        emit Frozen(user);
    }

    function totalDebt(address user) external view override returns (uint256) {
        return _totalDebt[user];
    }

    function creditLimit(address user) external view override returns (uint256) {
        return _collateralValue[user] + _delegatedCredit[user];
    }

    function collateralValue(address user) external view returns (uint256) {
        return _collateralValue[user];
    }

    function delegatedCredit(address user) external view returns (uint256) {
        return _delegatedCredit[user];
    }

    function healthFactor(address user) public view returns (uint256) {
        uint256 debt = _totalDebt[user];
        if (debt == 0) return type(uint256).max;

        uint256 credit = _collateralValue[user] + _delegatedCredit[user];
        return (credit * 1e18) / debt;
    }


    function creditScore(address user) public view returns (uint256) {
        (
            uint256 ageScore,
            uint256 healthScore,
            uint256 repaymentScore,
            uint256 delegatedScore,
            uint256 utilizationPenalty,
            uint256 liquidationPenalty
        ) = scoreBreakdown(user);

        uint256 score =
            ageScore +
            healthScore +
            repaymentScore +
            delegatedScore;

        uint256 totalPenalty = utilizationPenalty + liquidationPenalty;

        if (totalPenalty >= score) return 0;
        score = score - totalPenalty;

        if (score > 1000) return 1000;
        return score;
    }

    function riskTier(address user) external view returns (uint8) {
        uint256 score = creditScore(user);

        if (score >= 700) return 3; 
        if (score >= 500) return 2; 
        if (score >= 300) return 1; 
        return 0; 
    }

    function scoreBreakdown(address user)
        public
        view
        returns (
            uint256 ageScore,
            uint256 healthScore,
            uint256 repaymentScore,
            uint256 delegatedScore,
            uint256 utilizationPenalty,
            uint256 liquidationPenalty
        )
    {
        ageScore = _accountAgeScore(user);                 
        healthScore = _healthFactorScore(user);            
        repaymentScore = _repaymentBehaviorScore(user);    
        delegatedScore = _delegatedCreditScore(user);      

        utilizationPenalty = _utilizationPenalty(user);    
        liquidationPenalty = _liquidationPenalty(user);    
    }

    function userMetrics(address user)
        external
        view
        returns (
            uint256 collateral,
            uint256 delegated,
            uint256 debt,
            uint256 hf,
            uint256 score,
            uint8 tier,
            uint256 openedAt,
            uint256 borrows,
            uint256 repays,
            uint256 liquidations,
            bool isFrozen
        )
    {
        collateral = _collateralValue[user];
        delegated = _delegatedCredit[user];
        debt = _totalDebt[user];
        hf = healthFactor(user);
        score = creditScore(user);

        if (score >= 700) {
            tier = 3;
        } else if (score >= 500) {
            tier = 2;
        } else if (score >= 300) {
            tier = 1;
        } else {
            tier = 0;
        }

        openedAt = accountOpenedAt[user];
        borrows = borrowCount[user];
        repays = repaymentCount[user];
        liquidations = liquidationCount[user];
        isFrozen = frozen[user];
    }


    function _accountAgeScore(address user) internal view returns (uint256) {
        uint256 openedAt = accountOpenedAt[user];
        if (openedAt == 0 || block.timestamp <= openedAt) return 0;

        uint256 ageDays = (block.timestamp - openedAt) / 1 days;

        if (ageDays >= 180) return 150;
        return (ageDays * 150) / 180;
    }

    function _healthFactorScore(address user) internal view returns (uint256) {
        uint256 hf = healthFactor(user);

        if (hf == type(uint256).max) return 200;
        if (hf >= 2e18) return 250;
        if (hf >= 15e17) return 200; 
        if (hf >= 12e17) return 150; 
        if (hf >= 1e18) return 100; 
        return 0;
    }

    function _repaymentBehaviorScore(address user) internal view returns (uint256) {
        uint256 reps = repaymentCount[user];

        if (reps >= 20) return 200;
        return reps * 10;
    }

    function _delegatedCreditScore(address user) internal view returns (uint256) {
        uint256 delegated = _delegatedCredit[user];
        if (delegated == 0) return 0;
        uint256 cap = 10_000e6;
        if (delegated >= cap) return 100;

        return (delegated * 100) / cap;
    }

    function _utilizationPenalty(address user) internal view returns (uint256) {
        uint256 limit = _collateralValue[user] + _delegatedCredit[user];
        uint256 debt = _totalDebt[user];

        if (limit == 0 || debt == 0) return 0;

        uint256 utilizationBps = (debt * 10_000) / limit;

        if (utilizationBps <= 5000) return 0;      
        if (utilizationBps >= 10000) return 150;    

        return ((utilizationBps - 5000) * 150) / 5000;
    }

    function _liquidationPenalty(address user) internal view returns (uint256) {
        uint256 liqs = liquidationCount[user];

        if (liqs == 0) return 0;

        uint256 penalty = liqs * 100;
        if (penalty > 300) return 300;

        return penalty;
    }
}