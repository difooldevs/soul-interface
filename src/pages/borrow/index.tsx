import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import Card from 'components/Card'
import Dots from 'components/Dots'
import GradientDot from 'components/GradientDot'
import Image from 'components/Image'
// import { Feature } from 'enums/Feature'
import ListHeaderWithSort from 'features/lending/components/ListHeaderWithSort'
import { useUnderworldPairAddresses, useUnderworldPairs } from 'features/lending/hooks'
import { formatNumber, formatPercent } from 'functions/format'
// import NetworkGuard from 'guards/Network'
import { useInfiniteScroll } from 'hooks/useInfiniteScroll'
import useSearchAndSort from 'hooks/useSearchAndSort'
import Layout from 'layouts/Underworld'
import Head from 'next/head'
import Link from 'next/link'
import React from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { RecoilRoot } from 'recoil'
import MarketHeader from 'features/lending/components/MarketHeader'
import NetworkGuard from 'guards/Network'
import { Feature } from 'enums'
import { useUnderworldBorrowPositions } from 'features/portfolio/AssetBalances/underworld/hooks'
import { usePrice, useUSDCPrice } from 'hooks'
import { e10 } from 'functions/math'

const BORROW_IMG = "https://media.giphy.com/media/GgyKe2YYi3UR8HltC6/giphy.gif"

export default function Borrow() {
  const { i18n } = useLingui()
  const addresses = useUnderworldPairAddresses()
  // @ts-ignore TYPE NEEDS FIXING
  const pairs = useUnderworldPairs(addresses)

  const positions = useUnderworldBorrowPositions(pairs)

  const data = useSearchAndSort(
    pairs,
    { keys: ['search'], threshold: 0.1 },
    { key: 'totalAssetAmount.usdValue', direction: 'descending' }
  )

  const [numDisplayed, setNumDisplayed] = useInfiniteScroll(data.items)
  let pairPrice = '0'

  return (
    <BorrowLayout>
      <Head>
        <title>{i18n._(t`Borrow`)} | Soul</title>
        <meta
          key="description"
          name="description"
          content="Underworld is a lending and margin trading platform, built upon CoffinBox, which allows for anyone to create customized and gas-efficient markets for lending, borrowing, and collateralizing a variety of DeFi tokens, stable coins, and synthetic assets."
        />
        <meta
          key="twitter:description"
          name="twitter:description"
          content="Underworld is a lending and margin trading platform, built upon CoffinBox, which allows for anyone to create customized and gas-efficient markets for lending, borrowing, and collateralizing a variety of DeFi tokens, stable coins, and synthetic assets."
        />
        <meta
          key="og:description"
          property="og:description"
          content="Underworld is a lending and margin trading platform, built upon CoffinBox, which allows for anyone to create customized and gas-efficient markets for lending, borrowing, and collateralizing a variety of DeFi tokens, stable coins, and synthetic assets."
        />
      </Head>
      <Card className="h-full bg-dark-900" header={<MarketHeader type="Borrow" lists={[pairs, positions]} />}>
        {positions.items && positions.items.length > 0 && (
          <div className="pb-4">
            <div>
              <div className="grid grid-cols-4 gap-4 px-4 pb-4 text-sm md:grid-cols-6 lg:grid-cols-7 text-secondary">
                <ListHeaderWithSort
                  className="col-span-1 md:col-span-2 lg:col-span-3"
                  sort={positions}
                  sortKey="search"
                >
                  <>
                    <span className="hidden md:inline-block">{i18n._(t``)}</span> {i18n._(t`Positions`)}
                  </>
                </ListHeaderWithSort>
                <ListHeaderWithSort
                  // className="justify-end"
                  className="justify-center"
                  sort={positions}
                  sortKey="currentUserBorrowAmount.usdValue"
                  direction="descending"
                >
                  {i18n._(t`Borrowed`)}
                </ListHeaderWithSort>
                <ListHeaderWithSort
                  className="justify-center"
                  sort={positions}
                  sortKey="userCollateralAmount.usdValue"
                  direction="descending"
                >
                  {i18n._(t`Collateral`)}
                </ListHeaderWithSort>
                {/* <ListHeaderWithSort
                  className="justify-center lg:flex"
                  sort={positions}
                  sortKey="health.value"
                  direction="descending"
                >
                  <>
                    {i18n._(t`Limit`)} <span className="hidden md:inline-block">{i18n._(t` Used`)}</span>
                  </>
                </ListHeaderWithSort> */}
                <ListHeaderWithSort
                  // className="justify-end"
                  className="justify-center"
                  sort={positions}
                  sortKey="interestPerYear.value"
                  direction="descending"
                >
                  {i18n._(t`APR`)}
                </ListHeaderWithSort>
              </div>
              <div className="flex-col space-y-2">
                {positions.items.map((pair: any) => {
                  return (
                    <div key={pair.address}>
                      <Link href={'/borrow/' + pair.address}>
                        <a className="block text-high-emphesis">
                          <div className="grid items-center grid-cols-4 gap-4 px-4 py-4 text-sm rounded md:grid-cols-6 lg:grid-cols-7 align-center bg-dark-800 hover:bg-dark-purple">
                            <div className="hidden space-x-2 md:flex">
                              <Image
                                height={48}
                                width={48}
                                src={pair.asset.tokenInfo.logoURI}
                                className="w-5 h-5 rounded-lg md:w-10 md:h-10 lg:w-12 lg:h-12"
                                alt={pair.asset.tokenInfo.symbol}
                              />

                              <Image
                                height={48}
                                width={48}
                                src={pair.collateral.tokenInfo.logoURI}
                                className="w-5 h-5 rounded-lg md:w-10 md:h-10 lg:w-12 lg:h-12"
                                alt={pair.collateral.tokenInfo.symbol}
                              />
                            </div>
                            <div className="sm:block md:col-span-1 lg:col-span-2">
                              <div>
                                <strong>{pair.asset.tokenInfo.symbol}</strong> / {pair.collateral.tokenInfo.symbol}
                              </div>
                              <div>{pair.oracle.name}</div>
                            </div>
                            <div className="text-center">
                              <div>
                                {formatNumber(pair.currentUserBorrowAmount.string, false)} {pair.asset.tokenInfo.symbol}
                              </div>
                              <div className="text-sm text-secondary">
                                {formatNumber(pair.currentUserBorrowAmount.usd, true)}
                              </div>
                            </div>
                            <div className="text-center md:block">
                              <div>
                                {formatNumber(Number(pair?.userCollateralShare / 1e18), false)}{' '}
                              {pair.collateral.tokenInfo.symbol}
                              </div>
                              {/* <div className="text-center text-sm text-secondary"> */}
                                {/* {formatNumber(Number(pair?.userCollateralShare) * Number(pair?.collateralPrice / 1e18), true)} */}
                                {/* {formatNumber(pair?.userCollateralShare / 1e18 * (Number(usePrice(pair?.collateral.address))), true) } */}
                              {/* </div> */}
                            </div>
                            {/* <div className="flex items-center justify-end">
                              {formatPercent(pair.health.string)}
                              <GradientDot percent={pair.health.string} />
                            </div> */}
                            <div className="text-center">{formatPercent(pair.interestPerYear.string)}</div>
                          </div>
                        </a>
                      </Link>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-flow-col grid-cols-4 gap-4 px-4 pb-4 text-sm md:grid-cols-6 lg:grid-cols-7 text-secondary">
          <ListHeaderWithSort sort={data} sortKey="search">
            {i18n._(t`Markets`)}
          </ListHeaderWithSort>
          <ListHeaderWithSort className="hidden md:flex" sort={data} sortKey="asset.tokenInfo.symbol">
            {i18n._(t`Borrow`)}
          </ListHeaderWithSort>
          <ListHeaderWithSort className="hidden md:flex" sort={data} sortKey="collateral.tokenInfo.symbol">
            {i18n._(t`Collateral`)}
          </ListHeaderWithSort>
          <ListHeaderWithSort className="hidden lg:flex" sort={data} sortKey="oracle.name">
            {i18n._(t`Oracle`)}
          </ListHeaderWithSort>
          <ListHeaderWithSort
            className="justify-end"
            sort={data}
            sortKey="currentBorrowAmount.usdValue"
            direction="descending"
          >
            {i18n._(t`Borrowed`)}
          </ListHeaderWithSort>
          <ListHeaderWithSort
            className="justify-end"
            sort={data}
            sortKey="totalAssetAmount.usdValue"
            direction="descending"
          >
            {i18n._(t`Available`)}
          </ListHeaderWithSort>
          <ListHeaderWithSort
            className="justify-end"
            sort={data}
            sortKey="currentInterestPerYear.value"
            direction="descending"
          >
            {i18n._(t`APR`)}
          </ListHeaderWithSort>
        </div>

        <InfiniteScroll
          dataLength={numDisplayed}
          next={() => setNumDisplayed(numDisplayed + 5)}
          hasMore={true}
          loader={
            <div className="mt-8 text-center">
              <Dots>Loading</Dots>
            </div>
          }
        >
          <div className="flex-col space-y-2">
            {data.items.slice(0, numDisplayed).map((pair) => (
              <div key={pair.address}>
                <Link href={'/borrow/' + String(pair.address).toLowerCase()}>
                  <a className="block text-high-emphesis">
                    <div className="grid items-center grid-cols-4 gap-4 px-4 py-4 text-sm rounded md:grid-cols-6 lg:grid-cols-7 align-center bg-dark-800 hover:bg-dark-purple">
                      <div className="flex flex-col items-start sm:flex-row sm:items-center">
                        <div className="hidden space-x-2 md:flex">
                          <Image
                            height={48}
                            width={48}
                            src={pair.asset.tokenInfo.logoURI}
                            className="w-5 h-5 rounded-lg md:w-10 md:h-10 lg:w-12 lg:h-12"
                            alt={pair.asset.tokenInfo.symbol}
                          />
                          <Image
                            height={48}
                            width={48}
                            src={pair.collateral.tokenInfo.logoURI}
                            className="w-5 h-5 rounded-lg md:w-10 md:h-10 lg:w-12 lg:h-12"
                            alt={pair.collateral.tokenInfo.symbol}
                          />
                        </div>
                        <div className="sm:items-end md:hidden">
                          <div className="flex flex-col md:flex-row">
                            <div className="font-semibold">{pair.asset.tokenInfo.symbol} / </div>
                            <div> {pair.collateral.tokenInfo.symbol}</div>
                          </div>
                          <div className="block mt-0 text-xs text-left text-white-500 lg:hidden">
                            {pair.oracle.name}
                          </div>
                        </div>
                      </div>
                      <div className="hidden text-white md:block">
                        <strong>{pair.asset.tokenInfo.symbol}</strong>
                      </div>
                      <div className="hidden md:block">
                        {formatNumber(pair?.totalCollateralShare.div(e10(18)), false)}{' '}
                        {pair.collateral.tokenInfo.symbol}</div>
                      <div className="hidden lg:block">{pair.oracle.name}</div>
                      <div className="text-left md:text-right">
                        <div className="md:hidden">
                          <div className="flex flex-col">
                            {/* <div>{formatNumber(pair.currentAllAssets)}</div> */}
                            {/* <div>{formatNumber(pair.currentAllAssets)}</div> */}
                          </div>                        </div>
                        <div className="text-center md:block">
                          {formatNumber(pair.currentBorrowAmount.string)} {pair.asset.tokenInfo.symbol}
                          <div className="text-secondary">{formatNumber(pair.currentBorrowAmount.usd, true)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="md:hidden">
                          <div className="flex flex-col">
                            <div>{formatNumber(pair.totalAssetAmount.string)}</div>
                            <div>{pair.asset.tokenInfo.symbol}</div>
                          </div>
                          <div className="text-secondary">{formatNumber(pair.totalAssetAmount.usd, true)}</div>
                        </div>
                        <div className="hidden md:block">
                          {formatNumber(pair.totalAsset.base.div(e10(18)))} {pair.asset.tokenInfo.symbol}
                          {/* <div className="text-secondary">{formatNumber(pair.totalAsset.base.usd, true)}</div> */}
                        </div>
                      </div>
                      <div className="text-right">{formatPercent(pair.currentInterestPerYear.value / 1e18 * 100)}</div>
                      {/* <div className="text-right">{formatPercent(pair.currentInterestPerYear.value)}</div> */}
                    </div>
                  </a>
                </Link>
              </div>
            ))}
          </div>
        </InfiniteScroll>
      </Card>
    </BorrowLayout>
  )
}

Borrow.Provider = RecoilRoot

// @ts-ignore TYPE NEEDS FIXING
const BorrowLayout = ({ children }) => {
  const { i18n } = useLingui()
  return (
    <Layout
      left={
        <Card
          className="h-full bg-dark-900"
          backgroundImage={BORROW_IMG}
          title={i18n._(t`Borrow assets and leverage up`)}
          description={i18n._(
            t`Borrowing allows you to obtain liquidity without selling. Your borrow limit depends on the amount of deposited collateral. You will be able to borrow up to 75% of your collateral and repay at any time with accrued interest.`
          )}
        />
      }
    >
      {children}
    </Layout>
  )
}

Borrow.Guard = NetworkGuard(Feature.UNDERWORLD)