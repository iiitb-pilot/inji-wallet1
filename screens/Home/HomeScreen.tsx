
import React, { useEffect } from 'react';
import { Pressable } from 'react-native';
import { Column, Row, Text } from '../../components/ui';
import { Theme } from '../../components/ui/styleUtils';
import { HomeRouteProps } from '../../routes/routeTypes';
import { MyVcsTab } from './MyVcsTab';
import { ReceivedVcsTab } from './ReceivedVcsTab';
import { ViewVcModal } from './ViewVcModal';
import { useHomeScreen } from './HomeScreenController';
import { ErrorMessageOverlay } from '../../components/MessageOverlay';
import { BannerNotificationContainer } from '../../components/BannerNotificationContainer';
import { VCItemMachine } from '../../machines/VerifiableCredential/VCItemMachine/VCItemMachine';
import { VerifiableCredential } from '../../machines/VerifiableCredential/VCMetaMachine/vc';
import { useTranslation } from 'react-i18next';
import { SvgImage } from '../../components/ui/svg';
import testIDProps from '../../shared/commonUtil';
import { ReceivedCards } from '../Settings/ReceivedCards';

export const HomeScreen: React.FC<HomeRouteProps> = props => {
  const controller = useHomeScreen(props);
  const { t } = useTranslation();

  useEffect(() => {
    if (controller.IssuersService) {
      props.navigation.navigate('IssuersScreen', {
        service: controller.IssuersService,
      });
    }
  }, [controller.IssuersService]);

  return (
    <>
      <BannerNotificationContainer />

      <Column fill backgroundColor={Theme.Colors.lightGreyBackgroundColor}>
        {/* ✅ Same Receive Card section as Settings screen */}
        <Column
          style={{
            width: '100%',
            backgroundColor: Theme.Colors.whiteBackgroundColor,
            paddingVertical: 12,
            paddingHorizontal: 16,
          }}>
          <Text
            testID="injiAsVerifierApp"
            weight="semibold"
            margin="10"
            color={Theme.Colors.aboutVersion}
            style={{ paddingTop: 3 }}>
            {t('SettingScreen:injiAsVerifierApp')}
          </Text>

          <Row
            align="space-evenly"
            backgroundColor={Theme.Colors.whiteBackgroundColor}>
            {/* 🔘 Receive Card Button */}
            <Pressable
              {...testIDProps('receiveCardPressableArea')}
              onPress={controller.RECEIVE_CARD}>
              <Column
                align="center"
                style={Theme.Styles.receiveCardsContainer}>
                {SvgImage.ReceiveCard()}
                <Text
                  testID="receiveCard"
                  margin="6"
                  style={{ paddingTop: 3 }}
                  weight="semibold">
                  {t('SettingScreen:receiveCard')}
                </Text>
              </Column>
            </Pressable>

            {/* 🧾 Received Cards */}
            <ReceivedCards />
          </Row>
        </Column>

        {/* 🔽 Tabs */}
        {controller.haveTabsLoaded ? (
          <Column fill>
            <MyVcsTab
              isVisible={controller.activeTab === 0}
              service={controller.tabRefs.myVcs}
              vcItemActor={controller.selectedVc}
            />
            <ReceivedVcsTab
              isVisible={controller.activeTab === 1}
              service={controller.tabRefs.receivedVcs}
              vcItemActor={controller.selectedVc}
            />
          </Column>
        ) : (
          <Column fill align="center" justifyContent="center">
            <Text testID="loadingTabs" weight="semibold">
              {t('common:loading')}
            </Text>
          </Column>
        )}
      </Column>

      {/* ❗ Error Overlay */}
      <ErrorMessageOverlay
        translationPath={'MyVcsTab'}
        isVisible={controller.isMinimumStorageLimitReached}
        error={'errors.storageLimitReached'}
        onDismiss={controller.DISMISS}
      />

      {/* 👁 VC Detail Modal */}
      {controller.selectedVc && (
        <ViewVcModal
          isVisible={controller.isViewingVc}
          onDismiss={controller.DISMISS_MODAL}
          vcItemActor={controller.selectedVc}
          activeTab={controller.activeTab}
          flow="downloadedVc"
        />
      )}
    </>
  );
};

export interface HomeScreenTabProps {
  isVisible: boolean;
  service: any;
  vcItemActor: any;
  vc: VerifiableCredential | Credential;
}
