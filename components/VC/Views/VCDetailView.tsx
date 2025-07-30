
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, ImageBackground, TextInput, View } from 'react-native';
import {
  Credential,
  CredentialWrapper,
  VerifiableCredential,
  VerifiableCredentialData,
  WalletBindingResponse,
} from '../../../machines/VerifiableCredential/VCMetaMachine/vc';
import { Button, Column, Row, Text } from '../../ui';
import { Theme } from '../../ui/styleUtils';
import { QrCodeOverlay } from '../../QrCodeOverlay';
import { ProfileIcon } from '../../ProfileIcon';
import {
  BOTTOM_SECTION_FIELDS_WITH_DETAILED_ADDRESS_FIELDS,
  DETAIL_VIEW_BOTTOM_SECTION_FIELDS,
  Display,
  getFieldName,
  getFieldValue,
} from '../common/VCUtils';
import { VCFormat } from '../../../shared/VCFormat';
import { VCItemField } from '../common/VCItemField';
import { VCVerification } from '../../VCVerification';

const getProfileImage = (face: any) => {
  if (face) {
    return (
      <Image source={{ uri: face }} style={Theme.Styles.detailedViewImage} />
    );
  }
  return (
    <ProfileIcon
      profileIconContainerStyles={Theme.Styles.openCardProfileIconContainer}
      profileIconSize={40}
    />
  );
};

export const VCDetailView: React.FC<VCItemDetailsProps> = props => {
  const { t } = useTranslation('VcDetails');
  const { verifiableCredentialData, credential } = props;
  const logo = verifiableCredentialData.issuerLogo;
  const face = verifiableCredentialData.face;
  const wellknownDisplayProperty = new Display(props.wellknown);

  const isReceived = props.isReceived ?? !verifiableCredentialData?.isFromWallet;

  const shouldShowHrLine = (verifiableCredential) => {
    let availableFieldNames: string[] = [];
    console.log('Credential structure:', verifiableCredential);
    if (verifiableCredentialData.vcMetadata.format === VCFormat.ldp_vc) {
      availableFieldNames = Object.keys(verifiableCredential?.credentialSubject || {});
    } else if (verifiableCredentialData.vcMetadata.format === VCFormat.mso_mdoc) {
      const namespaces = verifiableCredential['issuerSigned']?.['nameSpaces'];
      if (namespaces) {
        Object.keys(namespaces).forEach(namespace => {
          (namespaces[namespace] as Array<Object>).forEach(element => {
            availableFieldNames.push(`${namespace}~${element['elementIdentifier']}`);
          });
        });
      }
    }
    console.log('Available field names:', availableFieldNames);
    return availableFieldNames.some(fieldName =>
      BOTTOM_SECTION_FIELDS_WITH_DETAILED_ADDRESS_FIELDS.includes(fieldName)
    );
  };

  const renderReadOnlyField = (field: string, value: string) => (
    <Column key={field} margin="8 0">
      <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>
        {field}
      </Text>
      <TextInput
        value={value}
        editable={false}
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 6,
          padding: 10,
          backgroundColor: '#f5f5f5',
          color: '#333',
        }}
      />
    </Column>
  );

  // Enhanced fields, excluding status
  const enhancedFields = isReceived
    ? [...props.fields.filter(f => f !== 'status'), 'address']
    : [...DETAIL_VIEW_BOTTOM_SECTION_FIELDS.filter(f => f !== 'status'), 'address'];

  // Custom render for status with boxed style
  const [statusText, setStatusText] = useState('Verifying...');
  useEffect(() => {
    // Attempt to extract text from VCVerification (placeholder logic)
    // Note: This assumes VCVerification has a way to get its text; adjust based on its implementation
    setStatusText('Verified' || 'Pending'); // Replace with actual logic if available
  }, [verifiableCredentialData.vcMetadata]);

  const renderStatus = () => (
    <Column key="status" margin="8 0">
      <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>
        {getFieldName('status', props.wellknown, verifiableCredentialData.vcMetadata.format)}
      </Text>
      <TextInput
        value={statusText}
        editable={false}
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 6,
          padding: 10,
          backgroundColor: '#f5f5f5',
          color: '#333',
        }}
      />
    </Column>
  );

  return (
    <Column scroll>
      <Column fill>
        {isReceived ? (
          <Column padding="10" backgroundColor={Theme.Colors.DetailedViewBackground}>
            {enhancedFields.map(field => {
              const fieldName = getFieldName(
                field,
                props.wellknown,
                verifiableCredentialData.vcMetadata.format,
              );
              const fieldValue = getFieldValue(
                credential,
                field,
                props.wellknown,
                props,
                wellknownDisplayProperty,
                verifiableCredentialData.vcMetadata.format,
              );
              console.log(`Field: ${fieldName}, Value: ${fieldValue}, Type: ${typeof fieldValue}, Raw Credential: ${JSON.stringify(credential)}`);
              if (!fieldValue || typeof fieldValue !== 'string') return null;
              return renderReadOnlyField(fieldName, fieldValue);
            })}
            {renderStatus()}
          </Column>
        ) : (
          <Column padding="10 10 3 10" backgroundColor={Theme.Colors.DetailedViewBackground}>
            <ImageBackground
              imageStyle={Theme.Styles.vcDetailBg}
              resizeMethod="scale"
              resizeMode="stretch"
              style={[
                Theme.Styles.openCardBgContainer,
                wellknownDisplayProperty.getBackgroundColor(),
              ]}
              source={wellknownDisplayProperty.getBackgroundImage(Theme.OpenCard)}>
              <Row padding="14 14 0 14">
                <Column crossAlign="center">
                  {getProfileImage(face)}
                  <QrCodeOverlay
                    verifiableCredential={props.credentialWrapper as unknown as VerifiableCredential}
                    meta={verifiableCredentialData.vcMetadata}
                  />
                  <Column width={80} height={59} crossAlign="center" margin="12 0 0 0">
                    <Image
                      src={logo?.url}
                      alt={logo?.alt_text}
                      style={Theme.Styles.issuerLogo}
                      resizeMethod="scale"
                      resizeMode="contain"
                    />
                  </Column>
                </Column>
                <Column align="space-evenly" margin="0 0 0 24" style={{ flex: 1 }}>
                  {/* Not shown here since it's not a received card */}
                </Column>
              </Row>
              <View
                style={[
                  Theme.Styles.hrLine,
                  {
                    borderBottomColor: wellknownDisplayProperty.getTextColor(
                      Theme.Styles.hrLine.borderBottomColor,
                    ),
                  },
                ]}
              />
              <Column padding="0 14 14 14">
                {shouldShowHrLine(credential) &&
                  enhancedFields.map(field => {
                    const fieldName = getFieldName(
                      field,
                      props.wellknown,
                      verifiableCredentialData.vcMetadata.format,
                    );
                    const fieldValue = getFieldValue(
                      credential,
                      field,
                      props.wellknown,
                      props,
                      wellknownDisplayProperty,
                      verifiableCredentialData.vcMetadata.format,
                    );
                    if (!fieldValue || typeof fieldValue !== 'string') return null;
                    return renderReadOnlyField(fieldName, fieldValue);
                  })}
                {renderStatus()}
              </Column>
            </ImageBackground>
          </Column>
        )}
      </Column>
    </Column>
  );
};

export interface VCItemDetailsProps {
  fields: any[];
  wellknown: any;
  credential: VerifiableCredential | Credential;
  verifiableCredentialData: VerifiableCredentialData;
  walletBindingResponse?: WalletBindingResponse;
  credentialWrapper: CredentialWrapper;
  onBinding?: () => void;
  activeTab?: Number;
  vcHasImage: boolean;
  isReceived?: boolean;
}
