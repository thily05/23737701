import React, { memo } from 'react';
import {
    StyleSheet,
    Text,
    TextProps,
    TextStyle,
    StyleProp,
} from 'react-native';

import { COLORS, FONTS } from '@constants/theme';

export type TypographyVariant =
    | 'title'
    | 'subtitle'
    | 'body'
    | 'bodyMedium'
    | 'caption'
    | 'button'
    | 'price'
    | 'bold'
    | 'medium'
    | 'regular';

interface TypographyProps extends TextProps {
    variant?: TypographyVariant;
    color?: string;
    numberOfLines?: number;
    children: React.ReactNode;
    style?: StyleProp<TextStyle>;
}

const VARIANT_STYLES: Record<TypographyVariant, TextStyle> = {
    title: FONTS.title,
    subtitle: FONTS.subtitle,
    body: FONTS.body,
    bodyMedium: FONTS.bodyMedium,
    caption: FONTS.caption,
    button: FONTS.button,
    price: FONTS.price,
    bold: { fontSize: 14, fontWeight: '700' },
    medium: { fontSize: 14, fontWeight: '500' },
    regular: { fontSize: 14, fontWeight: '400' },
};

export const Typography = memo(
    ({
        variant = 'body',
        color = COLORS.text,
        numberOfLines,
        children,
        style,
        ...rest
    }: TypographyProps) => {
        const fontStyle = VARIANT_STYLES[variant] || FONTS.body;

        return (
            <Text
                {...rest}
                numberOfLines={numberOfLines}
                style={[
                    styles.base,
                    fontStyle,
                    { color },
                    style,
                ]}>
                {children}
            </Text>
        );
    },
);

Typography.displayName = 'Typography';

const styles = StyleSheet.create({
    base: {
        includeFontPadding: false,
    } as TextStyle,
});