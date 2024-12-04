// import { View, type ViewProps } from "react-native";

// import { useThemeColor } from "@/hooks/useThemeColor";
// import React from "react";

// export type ThemedViewProps = ViewProps & {
//   lightColor?: string;
//   darkColor?: string;
// };

// export function ThemedView({
//   style,
//   lightColor,
//   darkColor,
//   ...otherProps
// }: ThemedViewProps) {
//   const backgroundColor = useThemeColor(
//     { light: lightColor, dark: darkColor },
//     "background"
//   );

//   return <View style={[{ backgroundColor }, style]} {...otherProps} />;
// }


import { View, type ViewProps } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import React from "react";

//Base class for themed views
class BaseThemedView extends React.Component<ViewProps & { backgroundColor?: string }> {
  render() {
    const { style, backgroundColor, ...otherProps } = this.props;
    return <View style={[{ backgroundColor }, style]} {...otherProps} />;
  }
}

//Props for ThemedView
export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

//Derived class that implements specific behavior
export class ThemedView extends React.Component<ThemedViewProps> {
  render() {
    const { style, lightColor, darkColor, ...otherProps } = this.props;
    const backgroundColor = useThemeColor(
      { light: lightColor, dark: darkColor },
      "background"
    );

    //reusing the base class's render logic
    return <BaseThemedView style={style} backgroundColor={backgroundColor} {...otherProps} />;
  }
}
