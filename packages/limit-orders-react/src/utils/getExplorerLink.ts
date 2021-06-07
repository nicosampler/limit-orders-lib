export enum ExplorerDataType {
  TRANSACTION = "transaction",
  TOKEN = "token",
  ADDRESS = "address",
  BLOCK = "block",
}

/**
 * Return the explorer link for the given data and data type
 * @param chainId the ID of the chain for which to return the data
 * @param data the data to return a link for
 * @param type the type of the data
 */
export function getExplorerLink(
  chainId: number,
  data: string,
  type: ExplorerDataType
): string {
  let prefix = `https://etherscan.io`;

  if (chainId === 3) prefix = `https://ropsten.etherscan.io`;
  else if (chainId === 37) prefix = `https://explorer-mainnet.maticvigil.com`;

  switch (type) {
    case ExplorerDataType.TRANSACTION: {
      return `${prefix}/tx/${data}`;
    }
    case ExplorerDataType.TOKEN: {
      return `${prefix}/token/${data}`;
    }
    case ExplorerDataType.BLOCK: {
      return `${prefix}/block/${data}`;
    }
    case ExplorerDataType.ADDRESS:
    default: {
      return `${prefix}/address/${data}`;
    }
  }
}