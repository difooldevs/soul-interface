import React, { useState } from 'react'
import { isMobile } from 'react-device-detect'
import { Disclosure } from '@headlessui/react'
import CurrencyLogo from 'components/CurrencyLogo'
import DoubleLogo from 'components/DoubleLogo'
import QuestionHelper from 'components/QuestionHelper'
import { classNames, formatNumber, formatPercent } from 'functions'
import { useCurrency } from 'hooks/Tokens'

import { PairType } from './enum'
import MineListItemDetails from './MineListItemDetails'
import { SOUL, SOUL_ADDRESS, WNATIVE } from '../../constants'
import { useActiveWeb3React } from 'hooks'
import Logo from 'components/Logo'
import { usePriceHelperContract } from 'features/bond/hooks/useContract'
import { useV2PairsWithPrice } from 'hooks/useV2Pairs'
import { useSingleCallResult } from 'state/multicall/hooks'

const MineListItem = ({ farm, ...rest }) => {
  const { chainId } = useActiveWeb3React()
  
  const token0 = useCurrency(farm.pair.token0?.id)
  const token1 = useCurrency(farm.pair.token1?.id)

  const priceHelperContract = usePriceHelperContract()

  const rawSoulPrice = useSingleCallResult(priceHelperContract, 'currentTokenUsdcPrice', ['0xe2fb177009FF39F52C0134E8007FA0e4BaAcBd07'])?.result
  console.log(Number(rawSoulPrice))
  const soulPrice = Number(rawSoulPrice) / 1E18
  console.log('soul price:%s', soulPrice)

  const rawFtmPrice = useSingleCallResult(priceHelperContract, 'currentTokenUsdcPrice', ['0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83'])?.result
  console.log(Number(rawFtmPrice))
  const ftmPrice = Number(rawFtmPrice) / 1E18
  console.log(ftmPrice)

  const rawSeancePrice = useSingleCallResult(priceHelperContract, 'currentTokenUsdcPrice', ['0x124B06C5ce47De7A6e9EFDA71a946717130079E6'])?.result
  console.log(Number(rawSeancePrice))
  const seancePrice = Number(rawSeancePrice) / 1E18
  console.log(seancePrice)
  
  const [selectedFarm, setSelectedFarm] = useState<string>(null)

  let [data] = useV2PairsWithPrice([[token0, token1]])
  let [state, pair, pairPrice] = data

  function getTvl(farm) {
    let lpPrice = 0
    let decimals = 18
    if (farm.lpToken.toLowerCase() == SOUL_ADDRESS[chainId].toLowerCase()) {
      lpPrice = Number(soulPrice)
      decimals = farm.pair.token0?.decimals
    } else if (farm.lpToken.toLowerCase() == WNATIVE[chainId].toLowerCase()) {
      lpPrice =  Number(ftmPrice)
    } else if (farm.lpToken.toLowerCase() == '0x124B06C5ce47De7A6e9EFDA71a946717130079E6'.toLowerCase()) {
      lpPrice =  Number(seancePrice)
    } else {
      lpPrice = pairPrice
    }

    farm.lpPrice = lpPrice
    farm.soulPrice = Number(soulPrice)

    return Number(farm.totalLp / 10 ** decimals) * lpPrice
  }

  const tvl = getTvl(farm)

  return (
    <Disclosure {...rest}>
      {({ open }) => (
        <div>
        { token1 ? 
          <Disclosure.Button
            className={classNames(
              open && 'rounded-b-none',
              'w-full px-4 py-6 text-left rounded cursor-pointer select-none bg-dark-900 text-primary text-sm md:text-lg'
            )}
          >
            <div className="grid grid-cols-4">
              <div className="flex col-span-2 space-x-4 md:col-span-1">
                <DoubleLogo currency0={ token0 } currency1={ token1 } size={40} />
              
                <div className="flex flex-col justify-center">
                  <div>
                    <span className="font-bold">{farm?.pair?.token0?.symbol}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-center font-bold">{formatNumber(farm.tvl, true)}</div>
              <div className="flex-row items-center hidden space-x-4 md:flex">
                <div className="flex items-center space-x-2">
                  {farm?.rewards?.map((reward, i) => (
                    <div key={i} className="flex items-center">
                      <CurrencyLogo currency={SOUL[chainId]} size={isMobile ? 32 : 50} />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col space-y-1">
                  {farm?.rewards?.map((reward, i) => (
                    <div key={i} className="text-xs md:text-sm whitespace-nowrap">
                    {reward.rewardPerDay > 0 ?
                        formatNumber(reward.rewardPerDay) + ' / DAY'
                        : 'ZERO'
                        }
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-end justify-center">
                <div className="flex flex-row items-center font-bold text-right text-high-emphesis">
                  {farm?.tvl !== 0
                    ? farm?.roiPerYear > 10000
                      ? '>10,000%'
                      : formatPercent(farm?.roiPerYear * 100)
                    : 'Infinite'}
                  {!!farm?.feeApyPerYear && (
                    <QuestionHelper
                      text={
                        <div className="flex flex-col">
                          <div>
                            Reward APR:{' '}
                            {farm?.tvl !== 0
                              ? farm?.rewardAprPerYear > 10000
                                ? '>10,000%'
                                : formatPercent(farm?.rewardAprPerYear * 100)
                              : 'Infinite'}
                          </div>
                          <div>
                            Fee APR:{' '}
                            {farm?.feeApyPerYear < 10000 ? formatPercent(farm?.feeApyPerYear * 100) : '>10,000%'}
                          </div>
                        </div>
                      }
                    />
                  )}
                </div>
                <div className="text-xs text-right md:text-base text-secondary">annualized</div>
              </div>
            </div>
          </Disclosure.Button>
          : '' }
          {open && <MineListItemDetails farm={farm} />}
        </div>
      )}
    </Disclosure>
  )
}

export default MineListItem