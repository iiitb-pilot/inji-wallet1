import React, {useEffect, useState} from 'react';
import {Pressable} from 'react-native';
import {ActorRefFrom} from 'xstate';
import {ErrorMessageOverlay} from '../../MessageOverlay';
import {Theme} from '../../ui/styleUtils';
import {VCMetadata} from '../../../shared/VCMetadata';
import {format} from 'date-fns';

import {VCCardSkeleton} from '../common/VCCardSkeleton';
import {VCCardViewContent} from './VCCardViewContent';
import {useVcItemController} from '../VCItemController';
import {getCredentialIssuersWellKnownConfig} from '../../../shared/openId4VCI/Utils';
import {CARD_VIEW_DEFAULT_FIELDS, isVCLoaded} from '../common/VCUtils';
import {VCItemMachine} from '../../../machines/VerifiableCredential/VCItemMachine/VCItemMachine';
import {useTranslation} from 'react-i18next';
import {Copilot} from '../../ui/Copilot';
import {VCProcessor} from '../common/VCProcessor';

export const VCCardView: React.FC<VCItemProps> = props => {
  const controller = useVcItemController(props);
  const {t} = useTranslation();

  const service = controller.VCItemService;
  const verifiableCredentialData = controller.verifiableCredentialData;
  const generatedOn = -controller.generatedOn;

  const formattedDate = generatedOn
    ? format(new Date(generatedOn), 'MM/dd/yyyy')
    : '';

  const [fields, setFields] = useState([]);
  const [wellknown, setWellknown] = useState(null);
  const [vc, setVc] = useState(null);

  useEffect(() => {
    controller.UPDATE_VC_METADATA(props.vcMetadata);
  }, [props.vcMetadata]);

  useEffect(() => {
    async function loadVc() {
      if (!props.isDownloading) {
        const processedData = await VCProcessor.processForRendering(
          controller.credential,
          controller.verifiableCredentialData.format,
        );
        setVc(processedData);
      }
    }

    loadVc();
  }, [props.isDownloading, controller.credential]);

  useEffect(() => {
    const {
      issuer,
      wellKnown,
      credentialConfigurationId,
      vcMetadata: {format},
    } = verifiableCredentialData;

    if (wellKnown) {
      getCredentialIssuersWellKnownConfig(
        issuer,
        CARD_VIEW_DEFAULT_FIELDS,
        credentialConfigurationId,
        format,
        props.vcMetadata.issuerHost,
      )
        .then(response => {
          setWellknown(response.matchingCredentialIssuerMetadata);
          setFields(response.fields);
        })
        .catch(error => {
          console.error(
            'Error fetching wellknown config for VC view:',
            error,
          );
        });
    }
  }, [verifiableCredentialData?.wellKnown]);

  if (!isVCLoaded(controller.credential, fields)) {
    return <VCCardSkeleton />;
  }

  const CardViewContent = () => (
    <VCCardViewContent
      vcMetadata={props.vcMetadata}
      context={controller.context}
      walletBindingResponse={controller.walletBindingResponse}
      credential={vc}
      verifiableCredentialData={verifiableCredentialData}
      fields={fields}
      wellknown={wellknown}
      generatedOn={formattedDate}
      selectable={props.selectable}
      selected={props.selected}
      service={service}
      isPinned={props.isPinned}
      onPress={() => props.onPress?.(service)}
      isDownloading={props.isDownloading}
      flow={props.flow}
      isKebabPopUp={controller.isKebabPopUp}
      DISMISS={controller.DISMISS}
      KEBAB_POPUP={controller.KEBAB_POPUP}
      isInitialLaunch={props.isInitialLaunch}
    />
  );

  const wrapTopCard = () => (
    <Copilot
      description={t('copilot:cardMessage')}
      order={6}
      title={t('copilot:cardTitle')}>
      <CardViewContent />
    </Copilot>
  );

  return (
    <>
      <Pressable
        accessible={false}
          onPress={() => {
            console.log('Card pressed'); // ✅ For debug
            if (props.onPress) {
              props.onPress(service);
            }
          }}
          style={
            props.selected
              ? Theme.Styles.selectedBindedVc
              : Theme.Styles.closeCardBgContainer
        }>
        {(props.isInitialLaunch || controller.isTourGuide) && props.isTopCard
          ? wrapTopCard()
          : <CardViewContent />}
      </Pressable>

      <ErrorMessageOverlay
        isVisible={controller.isSavingFailedInIdle}
        error={controller.storeErrorTranslationPath}
        onDismiss={controller.DISMISS}
        translationPath={'VcDetails'}
      />
    </>
  );
};

export interface VCItemProps {
  vcMetadata: VCMetadata;
  margin?: string;
  selectable?: boolean;
  selected?: boolean;
  onPress?: (vcRef?: ActorRefFrom<typeof VCItemMachine>) => void;
  onShow?: (vcRef?: ActorRefFrom<typeof VCItemMachine>) => void;
  isDownloading?: boolean;
  isPinned?: boolean;
  flow?: string;
  isInitialLaunch?: boolean;
  isTopCard?: boolean;
}

VCCardView.defaultProps = {
  isInitialLaunch: false,
  isTopCard: false,
};
