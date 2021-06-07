import { Percent, Token } from "@uniswap/sdk-core";
import { Pair } from "@uniswap/v2-sdk";
import JSBI from "jsbi";
import flatMap from "lodash.flatmap";
import { useCallback, useMemo } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import {
  BASES_TO_TRACK_LIQUIDITY_FOR,
  PINNED_PAIRS,
} from "../../constants/routing";

import { useAllTokens } from "../../hooks/Tokens";
import { useWeb3 } from "../../web3";
import { AppDispatch, AppState } from "../index";
import {
  addSerializedPair,
  addSerializedToken,
  removeSerializedToken,
  SerializedPair,
  SerializedToken,
  updateUserDarkMode,
  updateUserDeadline,
  updateUserExpertMode,
  updateUserSingleHopOnly,
  updateUserSlippageTolerance,
} from "./actions";

function serializeToken(token: Token): SerializedToken {
  return {
    chainId: token.chainId,
    address: token.address,
    decimals: token.decimals,
    symbol: token.symbol,
    name: token.name,
  };
}

function deserializeToken(serializedToken: SerializedToken): Token {
  return new Token(
    serializedToken.chainId,
    serializedToken.address,
    serializedToken.decimals,
    serializedToken.symbol,
    serializedToken.name
  );
}

export function useIsDarkMode(): boolean {
  const { userDarkMode, matchesDarkMode } = useSelector<
    AppState,
    { userDarkMode: boolean | null; matchesDarkMode: boolean }
  >(
    ({ guser: { matchesDarkMode, userDarkMode } }) => ({
      userDarkMode,
      matchesDarkMode,
    }),
    shallowEqual
  );

  return userDarkMode === null ? matchesDarkMode : userDarkMode;
}

export function useDarkModeManager(): [boolean, () => void] {
  const dispatch = useDispatch<AppDispatch>();
  const darkMode = useIsDarkMode();

  const toggleSetDarkMode = useCallback(() => {
    dispatch(updateUserDarkMode({ userDarkMode: !darkMode }));
  }, [darkMode, dispatch]);

  return [darkMode, toggleSetDarkMode];
}

export function useIsExpertMode(): boolean {
  return useSelector<AppState, AppState["guser"]["userExpertMode"]>(
    (state) => state.guser.userExpertMode
  );
}

export function useExpertModeManager(): [boolean, () => void] {
  const dispatch = useDispatch<AppDispatch>();
  const expertMode = useIsExpertMode();

  const toggleSetExpertMode = useCallback(() => {
    dispatch(updateUserExpertMode({ userExpertMode: !expertMode }));
  }, [expertMode, dispatch]);

  return [expertMode, toggleSetExpertMode];
}

export function useUserSingleHopOnly(): [
  boolean,
  (newSingleHopOnly: boolean) => void
] {
  const dispatch = useDispatch<AppDispatch>();

  const singleHopOnly = useSelector<
    AppState,
    AppState["guser"]["userSingleHopOnly"]
  >((state) => state.guser.userSingleHopOnly);

  const setSingleHopOnly = useCallback(
    (newSingleHopOnly: boolean) => {
      dispatch(
        updateUserSingleHopOnly({ userSingleHopOnly: newSingleHopOnly })
      );
    },
    [dispatch]
  );

  return [singleHopOnly, setSingleHopOnly];
}

export function useSetUserSlippageTolerance(): (
  slippageTolerance: Percent | "auto"
) => void {
  const dispatch = useDispatch<AppDispatch>();

  return useCallback(
    (userSlippageTolerance: Percent | "auto") => {
      let value: "auto" | number;
      try {
        value =
          userSlippageTolerance === "auto"
            ? "auto"
            : JSBI.toNumber(userSlippageTolerance.multiply(10_000).quotient);
      } catch (error) {
        value = "auto";
      }
      dispatch(
        updateUserSlippageTolerance({
          userSlippageTolerance: value,
        })
      );
    },
    [dispatch]
  );
}

/**
 * Return the user's slippage tolerance, from the redux store, and a function to update the slippage tolerance
 */
export function useUserSlippageTolerance(): Percent | "auto" {
  const userSlippageTolerance = useSelector<
    AppState,
    AppState["guser"]["userSlippageTolerance"]
  >((state) => {
    return state.guser.userSlippageTolerance;
  });

  return useMemo(
    () =>
      userSlippageTolerance === "auto"
        ? "auto"
        : new Percent(userSlippageTolerance, 10_000),
    [userSlippageTolerance]
  );
}

/**
 * Same as above but replaces the auto with a default value
 * @param defaultSlippageTolerance the default value to replace auto with
 */
export function useUserSlippageToleranceWithDefault(
  defaultSlippageTolerance: Percent
): Percent {
  const allowedSlippage = useUserSlippageTolerance();
  return useMemo(
    () =>
      allowedSlippage === "auto" ? defaultSlippageTolerance : allowedSlippage,
    [allowedSlippage, defaultSlippageTolerance]
  );
}

export function useUserTransactionTTL(): [number, (slippage: number) => void] {
  const dispatch = useDispatch<AppDispatch>();
  const userDeadline = useSelector<AppState, AppState["guser"]["userDeadline"]>(
    (state) => {
      return state.guser.userDeadline;
    }
  );

  const setUserDeadline = useCallback(
    (userDeadline: number) => {
      dispatch(updateUserDeadline({ userDeadline }));
    },
    [dispatch]
  );

  return [userDeadline, setUserDeadline];
}

export function useAddUserToken(): (token: Token) => void {
  const dispatch = useDispatch<AppDispatch>();
  return useCallback(
    (token: Token) => {
      dispatch(addSerializedToken({ serializedToken: serializeToken(token) }));
    },
    [dispatch]
  );
}

export function useRemoveUserAddedToken(): (
  chainId: number,
  address: string
) => void {
  const dispatch = useDispatch<AppDispatch>();
  return useCallback(
    (chainId: number, address: string) => {
      dispatch(removeSerializedToken({ chainId, address }));
    },
    [dispatch]
  );
}

export function useUserAddedTokens(): Token[] {
  const { chainId } = useWeb3();
  const serializedTokensMap = useSelector<
    AppState,
    AppState["guser"]["tokens"]
  >(({ guser: { tokens } }) => tokens);

  return useMemo(() => {
    if (!chainId) return [];
    return Object.values(serializedTokensMap?.[chainId] ?? {}).map(
      deserializeToken as any
    );
  }, [serializedTokensMap, chainId]);
}

function serializePair(pair: Pair): SerializedPair {
  return {
    token0: serializeToken(pair.token0),
    token1: serializeToken(pair.token1),
  };
}

export function usePairAdder(): (pair: Pair) => void {
  const dispatch = useDispatch<AppDispatch>();

  return useCallback(
    (pair: Pair) => {
      dispatch(addSerializedPair({ serializedPair: serializePair(pair) }));
    },
    [dispatch]
  );
}

export function useURLWarningVisible(): boolean {
  return useSelector((state: AppState) => state.guser.URLWarningVisible);
}

/**
 * Given two tokens return the liquidity token that represents its liquidity shares
 * @param tokenA one of the two tokens
 * @param tokenB the other token
 */
export function toV2LiquidityToken([tokenA, tokenB]: [Token, Token]): Token {
  return new Token(
    tokenA.chainId,
    Pair.getAddress(tokenA, tokenB),
    18,
    "UNI-V2",
    "Uniswap V2"
  );
}

/**
 * Returns all the pairs of tokens that are tracked by the user for the current chain ID.
 */
export function useTrackedTokenPairs(): [Token, Token][] {
  const { chainId } = useWeb3();
  const tokens = useAllTokens();

  // pinned pairs
  const pinnedPairs = useMemo(
    () => (chainId ? PINNED_PAIRS[chainId] ?? [] : []),
    [chainId]
  );

  // pairs for every token against every base
  const generatedPairs: [Token, Token][] = useMemo(
    () =>
      chainId
        ? flatMap(Object.keys(tokens), (tokenAddress) => {
            const token = tokens[tokenAddress];
            // for each token on the current chain,
            return (
              // loop though all bases on the current chain
              (BASES_TO_TRACK_LIQUIDITY_FOR[chainId] ?? [])
                // to construct pairs of the given token with each base
                .map((base) => {
                  if (base.address === token.address) {
                    return null;
                  } else {
                    return [base, token];
                  }
                })
                .filter((p): p is [Token, Token] => p !== null)
            );
          })
        : [],
    [tokens, chainId]
  );

  // pairs saved by users
  const savedSerializedPairs = useSelector<
    AppState,
    AppState["guser"]["pairs"]
  >(({ guser: { pairs } }) => pairs);

  const userPairs: [Token, Token][] = useMemo(() => {
    if (!chainId || !savedSerializedPairs) return [];
    const forChain = savedSerializedPairs[chainId];
    if (!forChain) return [];

    return Object.keys(forChain).map((pairId) => {
      return [
        deserializeToken(forChain[pairId].token0),
        deserializeToken(forChain[pairId].token1),
      ];
    });
  }, [savedSerializedPairs, chainId]);

  const combinedList = useMemo(
    () => userPairs.concat(generatedPairs).concat(pinnedPairs),
    [generatedPairs, pinnedPairs, userPairs]
  );

  return useMemo(() => {
    // dedupes pairs of tokens in the combined list
    const keyed = combinedList.reduce<{ [key: string]: [Token, Token] }>(
      (memo, [tokenA, tokenB]) => {
        const sorted = tokenA.sortsBefore(tokenB);
        const key = sorted
          ? `${tokenA.address}:${tokenB.address}`
          : `${tokenB.address}:${tokenA.address}`;
        if (memo[key]) return memo;
        memo[key] = sorted ? [tokenA, tokenB] : [tokenB, tokenA];
        return memo;
      },
      {}
    );

    return Object.keys(keyed).map((key) => keyed[key]);
  }, [combinedList]);
}