import React, { useCallback } from 'react'
import { Platform, StyleSheet } from 'react-native'
import { useModal } from './modal'
import { getNativeComponent } from './modules'
import { YearMonthPickerIOS } from './YearMonthPickerIOS'

const NativeComponent = getNativeComponent()

/**
 * Returns true if the current iOS version is older than 17.4,
 * which does NOT natively support UIDatePickerModeYearAndMonth.
 */
const isIosOlderThan17_4 = () => {
  const version = Platform.Version
  if (typeof version === 'string') {
    const major = parseInt(version.split('.')[0], 10)
    const minor = parseInt(version.split('.')[1] || '0', 10)
    if (major < 17) return true
    if (major === 17 && minor < 4) return true
    return false
  }
  // On iOS, Platform.Version is always a string, but guard anyway
  return parseInt(String(version), 10) < 17
}

/** @type {React.FC<PlatformPickerProps>} */
export const DatePickerIOS = (props) => {
  const onChange = useCallback(
    /** @param {{ nativeEvent: { timestamp: string } }} event */
    (event) => {
      const nativeTimeStamp = event.nativeEvent.timestamp
      if (props.onDateChange) props.onDateChange(new Date(nativeTimeStamp))
    },
    [props]
  )

  /** @type {NativeProps}  */
  const modifiedProps = {
    ...props,
    onChange,
    style: [styles.datePickerIOS, props.style],
    date: props.date ? props.date.toISOString() : undefined,
    locale: props.locale ? props.locale : undefined,
    maximumDate: props.maximumDate
      ? props.maximumDate.toISOString()
      : undefined,
    minimumDate: props.minimumDate
      ? props.minimumDate.toISOString()
      : undefined,
    theme: props.theme ? props.theme : 'auto',
  }

  useModal({ props: modifiedProps, id: undefined })

  if (props.modal) return null

  // Fallback: Use JS-based picker for yearAndMonth mode on iOS < 17.4
  // This only applies when modal=false (inline).
  if (props.mode === 'yearAndMonth' && isIosOlderThan17_4()) {
    return <YearMonthPickerIOS {...props} />
  }

  return (
    <NativeComponent
      {...modifiedProps}
      onStartShouldSetResponder={() => true}
      onResponderTerminationRequest={() => false}
    />
  )
}

const styles = StyleSheet.create({
  datePickerIOS: {
    height: 216,
    width: 310,
  },
})
