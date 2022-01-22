import { ChainId, Percent } from 'sdk'
import React, { FC, useState } from 'react'
import {
  useExpertModeManager,
  useUserOpenMev,
  useUserSingleHopOnly,
  useUserTransactionTTL,
} from 'state/user/hooks'
import { useModalOpen, useToggleSettingsMenu } from '../../state/application/hooks'
import Image from '../../components/Image'
import { CheckIcon, CogIcon } from '@heroicons/react/outline'
import CloseIcon from 'components/CloseIcon'
import Switch from 'components/Switch'
import { classNames } from 'functions'
import { useActiveWeb3React } from 'services/web3'
// import { AdjustmentsIcon } from '@heroicons/react/outline'
import { ApplicationModal } from 'state/application/actions'
import { Button } from '../Button'
import { OPENMEV_ENABLED, OPENMEV_SUPPORTED_NETWORKS } from 'config/openmev'
import Modal from '../DefaultModal'
import ModalHeader from '../ModalHeader'
import QuestionHelper from '../QuestionHelper'
import Toggle from '../Toggle'
import TransactionSettings from '../TransactionSettings'
import Typography from '../Typography'
import { t } from '@lingui/macro'
// import { useActiveWeb3React } from 'hooks'
import { useLingui } from '@lingui/react'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import SETTINGS from 'assets/icons/controls.svg'
import Popover from 'components/Popover'
import HeadlessUiModal from 'components/Modal/HeadlessUIModal'

interface SettingsTabProps {
  placeholderSlippage?: Percent
  trident?: boolean
  className?: string
}

const SettingsTab: FC<SettingsTabProps> = ({ placeholderSlippage, className, trident = false }) => {
  const { i18n } = useLingui()
  const { chainId } = useActiveWeb3React()

  const toggle = useToggleSettingsMenu()
  const [expertMode, toggleExpertMode] = useExpertModeManager()
  const [singleHopOnly, setSingleHopOnly] = useUserSingleHopOnly()
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [userUseOpenMev, setUserUseOpenMev] = useUserOpenMev()

  return (
    <>
    <Popover
        placement="bottom-end"
        content={
          <div className="flex flex-col gap-3 p-3 border rounded shadow-xl bg-dark-900 w-80 border-dark-700">
            <div className="flex flex-col gap-4 p-3 border rounded border-dark-800/60">
              <Typography variant="xxs" weight={700} className="text-secondary">
                {i18n._(t`Transaction Settings`)}
              </Typography>
              <TransactionSettings placeholderSlippage={placeholderSlippage}
              // trident={trident} 
              />
            </div>
            <div className="flex flex-col gap-3 p-3 border rounded border-dark-800/60">
              <Typography variant="xxs" weight={700} className="text-secondary">
                {i18n._(t`Interface Settings`)}
              </Typography>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Typography variant="xs" className="text-high-emphesis" weight={700}>
                    {i18n._(t`Toggle expert mode`)}
                  </Typography>
                  <QuestionHelper
                    text={i18n._(
                      t`Bypasses confirmation modals and allows high slippage trades. Use at your own risk.`
                    )}
                  />
                </div>
                <Switch
                  size="sm"
                  id="toggle-expert-mode-button"
                  checked={expertMode}
                  onChange={
                    expertMode
                      ? () => {
                          toggleExpertMode()
                          setShowConfirmation(false)
                        }
                      : () => {
                          toggle()
                          setShowConfirmation(true)
                        }
                  }
                  checkedIcon={<CheckIcon className="text-dark-700" />}
                  uncheckedIcon={<CloseIcon />}
                  color="gradient"
                />
              </div>
              {/* {!trident && ( */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Typography variant="xs" className="text-high-emphesis" weight={700}>
                      {i18n._(t`Disable multihops`)}
                    </Typography>
                    <QuestionHelper text={i18n._(t`Restricts swaps to direct pairs only.`)} />
                  </div>
                  <Switch
                    size="sm"
                    id="toggle-disable-multihop-button"
                    checked={singleHopOnly}
                    onChange={() => (singleHopOnly ? setSingleHopOnly(false) : setSingleHopOnly(true))}
                    checkedIcon={<CheckIcon className="text-dark-700" />}
                    uncheckedIcon={<CloseIcon />}
                    color="gradient"
                  />
                </div>
              {/* )} */}
              {/*@ts-ignore TYPE NEEDS FIXING*/}
              {OPENMEV_ENABLED && OPENMEV_SUPPORTED_NETWORKS.includes(chainId) && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Typography variant="xs" className="text-high-emphesis" weight={700}>
                      {i18n._(t`OpenMEV Gas Refunder`)}
                    </Typography>
                    <QuestionHelper text={i18n._(t`OpenMEV refunds up to 95% of transaction costs in 35 blocks.`)} />
                  </div>
                  <Switch
                    size="sm"
                    id="toggle-use-openmev"
                    checked={userUseOpenMev}
                    onChange={() => (userUseOpenMev ? setUserUseOpenMev(false) : setUserUseOpenMev(true))}
                    checkedIcon={<CheckIcon className="text-dark-700" />}
                    uncheckedIcon={<CloseIcon />}
                    color="gradient"
                  />
                </div>
              )}
            </div>
          </div>
        }
      >
        <div
          className={classNames(className, 'flex items-center justify-center w-10 h-10 rounded-full cursor-pointer')}
        >
          <CogIcon className="w-[26px] h-[26px] transform rotate-90 hover:text-white" />
        </div>
      </Popover>
      <HeadlessUiModal.Controlled isOpen={showConfirmation} onDismiss={() => setShowConfirmation(false)} maxWidth="md">
        <div className="flex flex-col gap-4">
          <HeadlessUiModal.Header header={i18n._(t`Confirm`)} onClose={() => setShowConfirmation(false)} />
          <HeadlessUiModal.BorderedContent className="flex flex-col gap-3 !border-yellow/40">
            <Typography variant="xs" weight={700} className="text-secondary">
              {i18n._(t`Only use this mode if you know what you are doing.`)}
            </Typography>
            <Typography variant="sm" weight={700} className="text-yellow">
              {i18n._(t`Expert mode turns off the confirm transaction prompt and allows high slippage trades
                                that often result in bad rates and lost funds.`)}
            </Typography>
          </HeadlessUiModal.BorderedContent>
          <Button
            id="confirm-expert-mode"
            color="blue"
            variant="filled"
            onClick={() => {
              toggleExpertMode()
              setShowConfirmation(false)
            }}
          >
            {i18n._(t`Enable Expert Mode`)}
          </Button>
        </div>
      </HeadlessUiModal.Controlled>
    </>
  )
}

export default SettingsTab