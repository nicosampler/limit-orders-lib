import { Currency, Percent, TradeType } from "@uniswap/sdk-core";
import { Trade } from "@uniswap/v2-sdk";
import React, { useState } from "react";
import { ArrowDown, AlertTriangle } from "react-feather";
import { Text } from "rebass";
import styled from "styled-components";
import { useUSDCValue } from "../../hooks/useUSDCPrice";
import { TYPE } from "../../theme";
import { ButtonPrimary } from "../Button";
import { isAddress, shortenAddress } from "../../utils";
import { computeFiatValuePriceImpact } from "../../utils/computeFiatValuePriceImpact";
import { AutoColumn } from "../Column";
import { FiatValue } from "../CurrencyInputPanel/FiatValue";
import CurrencyLogo from "../CurrencyLogo";
import { RowBetween, RowFixed } from "../Row";
import { TruncatedText, SwapShowAcceptChanges } from "./styleds";
import { AdvancedSwapDetails } from "./AdvancedSwapDetails";
import { LightCard } from "../Card";
import { DarkGreyCard } from "../Card";
import TradePrice from "../order/TradePrice";
import useTheme from "../../hooks/useTheme";
import { useGelatoLimitOrders } from "../../hooks/gelato";

export const ArrowWrapper = styled.div`
  padding: 4px;
  border-radius: 12px;
  height: 32px;
  width: 32px;
  position: relative;
  margin-top: -18px;
  margin-bottom: -18px;
  left: calc(50% - 16px);
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.bg1};
  z-index: 2;
`;

export default function SwapModalHeader({
  trade,
  recipient,
  showAcceptChanges,
  onAcceptChanges,
}: {
  trade?: Trade<Currency, Currency, TradeType>;
  recipient: string | null;
  showAcceptChanges: boolean;
  onAcceptChanges: () => void;
}) {
  const theme = useTheme();

  const [showInverted, setShowInverted] = useState<boolean>(false);

  const {
    derivedOrderInfo: { price, parsedAmounts },
  } = useGelatoLimitOrders();

  const inputAmount = parsedAmounts.input;
  const outputAmount = parsedAmounts.output;

  const fiatValueInput = useUSDCValue(inputAmount);
  const fiatValueOutput = useUSDCValue(outputAmount);

  if (!inputAmount || !outputAmount) return null;

  return (
    <AutoColumn gap={"4px"} style={{ marginTop: "1rem" }}>
      <DarkGreyCard padding="0.75rem 1rem">
        <AutoColumn gap={"8px"}>
          <RowBetween>
            <TYPE.body color={theme.text3} fontWeight={500} fontSize={14}>
              From
            </TYPE.body>
            <FiatValue fiatValue={fiatValueInput} />
          </RowBetween>
          <RowBetween align="center">
            <RowFixed gap={"0px"}>
              <CurrencyLogo
                currency={inputAmount.currency}
                size={"20px"}
                style={{ marginRight: "12px" }}
              />
              <Text fontSize={20} fontWeight={500}>
                {inputAmount.currency.symbol}
              </Text>
            </RowFixed>
            <RowFixed gap={"0px"}>
              <TruncatedText
                fontSize={24}
                fontWeight={500}
                color={
                  showAcceptChanges &&
                  trade?.tradeType === TradeType.EXACT_OUTPUT
                    ? theme.primary1
                    : ""
                }
              >
                {inputAmount.toSignificant(6)}
              </TruncatedText>
            </RowFixed>
          </RowBetween>
        </AutoColumn>
      </DarkGreyCard>
      <ArrowWrapper>
        <ArrowDown size="16" color={theme.text2} />
      </ArrowWrapper>
      <DarkGreyCard padding="0.75rem 1rem" style={{ marginBottom: "0.25rem" }}>
        <AutoColumn gap={"8px"}>
          <RowBetween>
            <TYPE.body color={theme.text3} fontWeight={500} fontSize={14}>
              To
            </TYPE.body>
            <TYPE.body fontSize={14} color={theme.text3}>
              <FiatValue
                fiatValue={fiatValueOutput}
                priceImpact={computeFiatValuePriceImpact(
                  fiatValueInput,
                  fiatValueOutput
                )}
              />
            </TYPE.body>
          </RowBetween>
          <RowBetween align="flex-end">
            <RowFixed gap={"0px"}>
              <CurrencyLogo
                currency={outputAmount.currency}
                size={"20px"}
                style={{ marginRight: "12px" }}
              />
              <Text fontSize={20} fontWeight={500}>
                {outputAmount.currency.symbol}
              </Text>
            </RowFixed>
            <RowFixed gap={"0px"}>
              <TruncatedText fontSize={24} fontWeight={500}>
                {outputAmount.toSignificant(6)}
              </TruncatedText>
            </RowFixed>
          </RowBetween>
        </AutoColumn>
      </DarkGreyCard>
      <RowBetween style={{ marginTop: "0.25rem", padding: "0 1rem" }}>
        <TYPE.body color={theme.text2} fontWeight={500} fontSize={14}>
          {"Limit Price:"}
        </TYPE.body>
        <TradePrice
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          price={price!}
          showInverted={showInverted}
          setShowInverted={setShowInverted}
        />
      </RowBetween>

      <LightCard style={{ padding: ".75rem", marginTop: "0.5rem" }}>
        <AdvancedSwapDetails />
      </LightCard>

      {showAcceptChanges ? (
        <SwapShowAcceptChanges justify="flex-start" gap={"0px"}>
          <RowBetween>
            <RowFixed>
              <AlertTriangle
                size={20}
                style={{ marginRight: "8px", minWidth: 24 }}
              />
              <TYPE.main color={theme.primary1}> Price Updated</TYPE.main>
            </RowFixed>
            <ButtonPrimary
              style={{
                padding: ".5rem",
                width: "fit-content",
                fontSize: "0.825rem",
                borderRadius: "12px",
              }}
              onClick={onAcceptChanges}
            >
              Accept
            </ButtonPrimary>
          </RowBetween>
        </SwapShowAcceptChanges>
      ) : null}

      {/* <AutoColumn
        justify="flex-start"
        gap="sm"
        style={{ padding: ".75rem 1rem" }}
      >
        {trade.tradeType === TradeType.EXACT_INPUT ? (
          <TYPE.italic
            fontWeight={400}
            textAlign="left"
            style={{ width: "100%" }}
          >
            {`Output is estimated. You will receive at least `}
            <b>
              {trade.minimumAmountOut(allowedSlippage).toSignificant(6)}{" "}
              {outputAmount.currency.symbol}
            </b>
            {" or the transaction will revert."}
          </TYPE.italic>
        ) : (
          <TYPE.italic
            fontWeight={400}
            textAlign="left"
            style={{ width: "100%" }}
          >
            {`Input is estimated. You will sell at most `}
            <b>
              {trade.maximumAmountIn(allowedSlippage).toSignificant(6)}{" "}
              {inputAmount.currency.symbol}
            </b>
            {" or the transaction will revert."}
          </TYPE.italic>
        )}
      </AutoColumn> */}
      {recipient !== null ? (
        <AutoColumn
          justify="center"
          gap="sm"
          style={{ padding: "12px 0 0 0px" }}
        >
          <TYPE.main>
            Output will be sent to{" "}
            <b title={recipient}>
              {isAddress(recipient) ? shortenAddress(recipient) : recipient}
            </b>
          </TYPE.main>
        </AutoColumn>
      ) : null}
    </AutoColumn>
  );
}
