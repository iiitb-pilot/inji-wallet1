import React from 'react';
import {View} from 'react-native';
import {Column, Row, Text} from '../../ui';
import {Theme} from '../../ui/styleUtils';

interface VCItemFieldProps {
  fieldName: string;
  fieldValue: string;
  testID: string;
  fieldNameColor?: string;
  fieldValueColor?: string;
}

export const VCItemFieldName = ({
  fieldName,
  testID,
  fieldNameColor: textColor = Theme.Colors.DetailsLabel,
}: {
  fieldName: string;
  testID: string;
  fieldNameColor?: string;
}) => {
  return (
    <Row>
      <Text
        testID={`${testID}Title`}
        color={textColor}
        style={[
          Theme.Styles.fieldItemTitle,
          {fontWeight: 'bold'}, // Bold label
        ]}>
        {fieldName}
      </Text>
    </Row>
  );
};

export const VCItemFieldValue = ({
  fieldValue,
  testID,
  fieldValueColor: textColor = Theme.Colors.Details,
}: {
  fieldValue: string;
  testID: string;
  fieldValueColor?: string;
}) => {
  return (
    <Text
      testID={`${testID}Value`}
      color={textColor}
      style={Theme.Styles.fieldItemValue}>
      {fieldValue}
    </Text>
  );
};

export const VCItemField: React.FC<VCItemFieldProps> = ({
  fieldName,
  fieldValue,
  testID,
  fieldNameColor,
  fieldValueColor,
}) => {
  return (
    <Column margin="8 0">
      <VCItemFieldName
        fieldName={fieldName}
        testID={testID}
        fieldNameColor={fieldNameColor}
      />
      <VCItemFieldValue
        fieldValue={fieldValue}
        testID={testID}
        fieldValueColor={fieldValueColor}
      />
    </Column>
  );
};
