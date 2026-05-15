# Strategy Explainer — How TradeLikeMe Trades

## The 89% Win Rate — What Does That Mean?
Every trade has been independently verified on TradingView charts. Not backtested on historical data — verified on live charts in real time as they happened. The current verified sample shows 89% of trades hitting at least Take Profit 1. The average winning trade returns +4.2%. The average losing trade costs -2.8%. The risk-reward ratio is 1.5:1, meaning winning trades are larger than losing ones on average.

## What Is Supply and Demand Zone Trading?
Every asset price moves between zones where buyers previously overwhelmed sellers (demand zones) and zones where sellers overwhelmed buyers (supply zones). These zones act like magnets — price tends to return to them, then reverse sharply. Our strategy identifies these zones and waits for price to revisit them before entering.

We use seven timeframes to find zones: 1-month, 1-week, 1-day, 4-hour, 1-hour, 30-minute, and 15-minute. Higher timeframes set the overall direction. The 4-hour timeframe identifies the zone. The 15-minute chart is used for precise entry timing.

## The BTC Macro Gate
Before entering any altcoin trade, the agent checks Bitcoin's daily chart. If Bitcoin is in an active recovery (consecutive green daily closes, making higher lows), all short trades on altcoins are blocked. Two of our three early losses happened because this rule was not yet in place. Adding it immediately stopped that type of loss.

## The Body-Close Stop Loss — Our Core Edge
Most platforms set a stop loss at a price level, and if price touches it, the trade closes. We do something different. Our stop loss only triggers when a 30-minute candle BODY closes below the stop loss level. A wick (a spike down and back up) is ignored.

This matters because professional traders and large funds deliberately push price below stop loss clusters to trigger retail stops and then reverse. This is called a stop hunt. By requiring a full candle body close, we survive 70% of these stop hunts. In one documented case on AAVE, price spiked 3.8% below our stop loss and immediately reversed for a +2192% winning trade. A standard stop loss would have closed that trade for a loss.

## Position Sizing and Risk
Each trade uses 0.5% of total account balance as margin, at 200x cross leverage. The maximum number of concurrent open positions is 2. The account must stay above a $35 minimum balance floor — the agent stops taking new trades if this floor is breached.

Take Profit 1 closes 50% of the position at the nearest supply or demand zone. When TP1 hits, the stop loss is moved to the entry price (break-even). Take Profit 2 closes the remaining 50% at the second nearest zone. We never target the third or fourth zone — verified testing showed those targets are missed on 2 of 3 trades.
