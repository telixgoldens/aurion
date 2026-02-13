Access Control

 Only router can mutate CreditManager

 Only pool can delegate credit

 No external call before state update (checks-effects-interactions)

B. Accounting

 Debt monotonically increases only via router

 Delegated credit tracked consistently

 No rounding loss on USDC (6 decimals)

C. External Integrations

 Aave adapter calls correct pool

 Compound adapter uses correct cToken

 No approvals left dangling

D. Oracle Safety

 Oracle heartbeat enforced

 Oracle owner restricted

E. Reentrancy

 No external call before internal state update

 SafeERC20 used everywhere


B. Add EVENTS everywhere state changes

Examples:

event Borrow(address indexed user, uint256 amount);
event Deposit(address indexed user, uint256 amount);
event CreditDelegated(address indexed user, uint256 amount);
event Frozen(address indexed user);


