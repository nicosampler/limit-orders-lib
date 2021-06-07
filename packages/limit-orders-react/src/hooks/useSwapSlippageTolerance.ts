import { Currency, Percent, TradeType } from "@uniswap/sdk-core";
import { Trade as V2Trade } from "@uniswap/v2-sdk";
import { useMemo } from "react";
import { useUserSlippageToleranceWithDefault } from "../state/guser/hooks";

const V2_SWAP_DEFAULT_SLIPPAGE = new Percent(50, 10_000); // .50%
const V3_SWAP_DEFAULT_SLIPPAGE = new Percent(50, 10_000); // .50%
const ONE_TENTHS_PERCENT = new Percent(10, 10_000); // .10%

export default function useSwapSlippageTolerance(
  trade: V2Trade<Currency, Currency, TradeType> | undefined
): Percent {
  const defaultSlippageTolerance = useMemo(() => {
    if (!trade) return ONE_TENTHS_PERCENT;
    if (trade instanceof V2Trade) return V2_SWAP_DEFAULT_SLIPPAGE;
    return V3_SWAP_DEFAULT_SLIPPAGE;
  }, [trade]);
  return useUserSlippageToleranceWithDefault(defaultSlippageTolerance);
}
