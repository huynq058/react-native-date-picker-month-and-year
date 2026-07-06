import React, { useCallback, useEffect, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'

// @react-native-picker/picker is a peerDependency required for iOS < 17.4 yearAndMonth mode
let Picker
try {
  // @ts-ignore
  Picker = require('@react-native-picker/picker').Picker
} catch (e) {
  Picker = null
}

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
const DEFAULT_MIN_YEAR = 1900
const DEFAULT_MAX_YEAR = 2100
const DEFAULT_HEIGHT = 216
const DEFAULT_WIDTH = 310

/**
 * Generates an array of year integers from minYear to maxYear (inclusive).
 * @param {number} minYear
 * @param {number} maxYear
 * @returns {number[]}
 */
const generateYears = (minYear, maxYear) => {
  const years = []
  for (let y = minYear; y <= maxYear; y++) years.push(y)
  return years
}

/**
 * A JavaScript-based YearMonth picker for iOS < 17.4.
 * Renders two side-by-side Picker columns (Month, Year) using
 * @react-native-picker/picker which wraps the native UIPickerView.
 *
 * @type {React.FC<PlatformPickerProps>}
 */
export const YearMonthPickerIOS = (props) => {
  const { date, minimumDate, maximumDate, onDateChange, textColor, style } =
    props

  const minYear = minimumDate ? minimumDate.getFullYear() : DEFAULT_MIN_YEAR
  const maxYear = maximumDate ? maximumDate.getFullYear() : DEFAULT_MAX_YEAR

  const years = useRef(generateYears(minYear, maxYear)).current

  // Selected state (month is 1-indexed to match human convention)
  const [selectedMonth, setSelectedMonth] = useState(
    date ? date.getMonth() + 1 : new Date().getMonth() + 1
  )
  const [selectedYear, setSelectedYear] = useState(
    date ? date.getFullYear() : new Date().getFullYear()
  )

  // Sync when the `date` prop changes from outside
  useEffect(() => {
    if (date) {
      setSelectedMonth(date.getMonth() + 1)
      setSelectedYear(date.getFullYear())
    }
  }, [date])

  const handleMonthChange = useCallback(
    (month) => {
      setSelectedMonth(month)
      if (onDateChange) {
        // Keep day=1 since we're only picking month/year
        const newDate = new Date(selectedYear, month - 1, 1)
        onDateChange(newDate)
      }
    },
    [selectedYear, onDateChange]
  )

  const handleYearChange = useCallback(
    (year) => {
      setSelectedYear(year)
      if (onDateChange) {
        const newDate = new Date(year, selectedMonth - 1, 1)
        onDateChange(newDate)
      }
    },
    [selectedMonth, onDateChange]
  )

  if (!Picker) {
    console.warn(
      '[react-native-date-picker] yearAndMonth mode on iOS < 17.4 requires ' +
        '@react-native-picker/picker to be installed. ' +
        'Please add it as a dependency: `yarn add @react-native-picker/picker`'
    )
    return null
  }

  const pickerItemStyle = textColor ? { color: textColor } : {}
  const containerStyle = [styles.container, style]

  return (
    <View style={containerStyle}>
      {/* Month picker */}
      <Picker
        style={styles.picker}
        selectedValue={selectedMonth}
        onValueChange={handleMonthChange}
        itemStyle={pickerItemStyle}>
        {MONTHS.map((m) => (
          <Picker.Item key={m} label={String(m).padStart(2, '0')} value={m} />
        ))}
      </Picker>

      {/* Year picker */}
      <Picker
        style={styles.picker}
        selectedValue={selectedYear}
        onValueChange={handleYearChange}
        itemStyle={pickerItemStyle}>
        {years.map((y) => (
          <Picker.Item key={y} label={String(y)} value={y} />
        ))}
      </Picker>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: DEFAULT_HEIGHT,
    width: DEFAULT_WIDTH,
    overflow: 'hidden',
  },
  picker: {
    flex: 1,
  },
})

export default YearMonthPickerIOS
