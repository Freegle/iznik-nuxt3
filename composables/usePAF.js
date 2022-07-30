// Adapted from https://github.com/AllenJB/PafUtils.

/**
 * Assemble the address lines (excluding post town and post code) according to the rule laid out by Royal Mail.
 * The primary reference for these rules is the Royal Mail programmers guide. In some cases (particularly those
 * not covered by the programmers guide), the layout used by the RM online address finder has been followed.
 **/
export function constructAddress(
  udprn,
  postcode,
  postTown,
  dependentLocality,
  doubleDependentLocality,
  thoroughfare,
  dependentThoroughfare,
  buildingNumber,
  buildingName,
  subBuildingName,
  poBox,
  departmentName,
  organizationName,
  postcodeType,
  suOrganizationIndicator,
  deliveryPointSuffix
) {
  let processed = false
  let processingError = false
  const addressLines = []
  let nextLinePrefix = null

  if (buildingNumber === 0) {
    buildingNumber = null
  }

  // Exception 4 regex: Any of the specified prefixes followed by either a number with an alpha suffix or a numeric range
  const specialPrefixes = [
    'Back of',
    'Block',
    'Blocks',
    'Building',
    'Maisonette',
    'Maisonettes',
    'Rear of',
    'Shop',
    'Shops',
    'Stall',
    'Stalls',
    'Suite',
    'Suites',
    'Unit',
    'Units',
  ]

  const ex4Regex = new RegExp(
    '/^(' +
      specialPrefixes.join('|') +
      ')\\s([0-9]+[a-zA-Z]+|[0-9]+\\-[0-9]+|[a-zA-Z])$/'
  )

  // Do we need to split the building name - see Table 27c / 27d
  if (buildingName && !buildingNumber) {
    if (
      buildingName.match(/\s[0-9]+[a-zA-Z]+$/) ||
      buildingName.match(/\s[0-9]+-[0-9]+$/)
    ) {
      if (!buildingName.match(ex4Regex)) {
        const parts = buildingName.split(' ')
        buildingNumber = parts.pop()
        buildingName = parts.join(' ')
      }
    }
  }
  // Table 19, note b: If an organization name is present, it should appear on the first address line
  if (organizationName) {
    addressLines.push(organizationName)
  }
  // Table 19, note c: If a department name is present, it should appear on the second line (after organization name)
  if (departmentName) {
    addressLines.push(departmentName)
  }
  // Table 19, note d: If a PO Box is present, it should appear on the first address line after any organization / dept. name
  // The PO Box number MUST be preceded by 'PO Box'
  if (poBox) {
    addressLines.push('PO Box ' + poBox)
  }
  nextLinePrefix = null
  // Rule 1 - Organisation name only
  if (!subBuildingName && !buildingName && buildingNumber) {
    if (organizationName) {
      processed = true
      // No actual manipulation code as the organization name is handled above
    }
  }
  // The following code is based on Table 20
  // Rule 2 - Building number only
  if (!subBuildingName && !buildingName && buildingNumber) {
    processed = true
    nextLinePrefix = buildingNumber + ' '
  }
  // Rule 3 - Building Name only
  if (!subBuildingName && buildingName && !buildingNumber) {
    processed = true
    // Exceptions:
    // i) First and last characters of the building name are numeric (eg. '1to1' or '100:1')
    // ii) First and penultimate characters are numeric, last character is alphabetic
    // iii) Building name has only 1 character
    if (
      buildingName.match(/^[0-9].*[0-9]$/) ||
      buildingName.match(/^[0-9].*[0-9][a-zA-Z]$/) ||
      buildingName.length === 1
    ) {
      if (nextLinePrefix !== null) {
        processingError = true
      }
      nextLinePrefix = buildingName
      if (buildingName.length === 1 && isNaN(buildingName)) {
        nextLinePrefix += ','
      }
      nextLinePrefix += ' '
    } else {
      addressLines.push(buildingName)
    }
  }
  // Rule 4 - Building Name & Building Number
  if (!subBuildingName && buildingName && buildingNumber) {
    processed = true
    addressLines.push(buildingName)
    nextLinePrefix = buildingNumber + ' '
  }
  // Rule 5 - Sub building name & Building Number
  // The programmers guide talks about an exception involving the 'concatenation indicator',
  // But as far as I can see this field doesn't exist in the CSV format files
  if (subBuildingName && !buildingName && buildingNumber) {
    processed = true
    addressLines.push(subBuildingName)
    nextLinePrefix = buildingNumber + ' '
  }
  // Rule 6 - Sub Building Name & Building Name
  if (subBuildingName && buildingName && !buildingNumber) {
    processed = true
    let exceptionSubBuildingName = false
    // Exceptions:
    // i) First and last characters of the building name are numeric (eg. '1to1' or '100:1')
    // ii) First and penultimate characters are numeric, last character is alphabetic
    // iii) Building name has only 1 character
    if (
      subBuildingName.match(/^[0-9].*[0-9]$/) ||
      subBuildingName.match(/^[0-9].*[0-9][a-zA-Z]$/) ||
      subBuildingName.length === 1
    ) {
      exceptionSubBuildingName = true
      if (nextLinePrefix !== null) {
        processingError = true
      }
      nextLinePrefix = subBuildingName
      if (subBuildingName.length === 1 && isNaN(subBuildingName)) {
        nextLinePrefix += ','
      }
      nextLinePrefix += ' '
    } else {
      addressLines.push(subBuildingName)
    }
    // Exceptions:
    // i) First and last characters of the building name are numeric (eg. '1to1' or '100:1')
    // ii) First and penultimate characters are numeric, last character is alphabetic
    // iii) Building name has only 1 character
    if (
      buildingName.match(/^[0-9].*[0-9]$/) ||
      buildingName.match(/^[0-9].*[0-9][a-zA-Z]$/) ||
      buildingName.length === 1
    ) {
      if (nextLinePrefix.length && !exceptionSubBuildingName) {
        addressLines.push(nextLinePrefix.trim())
      }
      nextLinePrefix = (nextLinePrefix.trim() + ' ' + buildingName).trim()
      if (buildingName.length === 1 && isNaN(buildingName)) {
        nextLinePrefix += ','
      }
      nextLinePrefix += ' '
    } else {
      addressLines.push(
        (nextLinePrefix ? nextLinePrefix.trim() + ' ' : '') + buildingName
      )
      nextLinePrefix = null
    }
  }
  // Rule 7 - Sub building name, building name & building number
  if (!(!subBuildingName || !buildingName || !buildingNumber)) {
    processed = true
    // Exceptions:
    // i) First and last characters of the building name are numeric (eg. '1to1' or '100:1')
    // ii) First and penultimate characters are numeric, last character is alphabetic
    // iii) Building name has only 1 character
    if (
      subBuildingName.match(/^[0-9].*[0-9]$/) ||
      subBuildingName.match(/^[0-9].*[0-9][a-zA-Z]$/) ||
      subBuildingName.length === 1
    ) {
      if (nextLinePrefix !== null) {
        processingError = true
      }
      nextLinePrefix = subBuildingName
      if (subBuildingName.length === 1 && isNaN(subBuildingName)) {
        nextLinePrefix += ','
      }
      nextLinePrefix += ' '
    } else {
      addressLines.push(
        (nextLinePrefix ? nextLinePrefix.trim() + ' ' : '') + subBuildingName
      )
      nextLinePrefix = null
    }
    addressLines.push(
      (nextLinePrefix ? nextLinePrefix.trim() + ' ' : '') + buildingName
    )
    nextLinePrefix = null
    nextLinePrefix =
      (nextLinePrefix ? nextLinePrefix.trim() + ' ' : '') + buildingNumber
  }
  // Rule C1 - Self-written rule: Sub-building name occurs, but no building name or number
  // This occurred in the Y14M09 update - 8350793 / EH12 5DD (15Gf Eglinton Crescent)
  // And was still the same on the Royal Mail Postcode Lookup website data as of 2014-10-21
  if (!buildingName && !buildingNumber && subBuildingName) {
    processed = true
    nextLinePrefix = subBuildingName
  }
  if (nextLinePrefix && nextLinePrefix.charAt(nextLinePrefix.length !== ' ')) {
    nextLinePrefix += ' '
  }
  // Dependent Thoroughfare
  if (dependentThoroughfare) {
    addressLines.push((nextLinePrefix || '') + dependentThoroughfare)
    nextLinePrefix = null
  }
  // Thoroughfare
  if (thoroughfare) {
    addressLines.push((nextLinePrefix || '') + thoroughfare)
    nextLinePrefix = null
  }
  // Double dependent locality
  if (doubleDependentLocality) {
    addressLines.push((nextLinePrefix || '') + doubleDependentLocality)
    nextLinePrefix = null
  }
  // Dependent locality
  if (dependentLocality) {
    addressLines.push((nextLinePrefix || '') + dependentLocality)
    nextLinePrefix = null
  }
  // Yup, apparently there's addresses in the database with no locality / thoroughfare. Just a number.
  // UDPRNs affected as of 2014-02-06: 2431986 and 328392
  if (nextLinePrefix !== null) {
    addressLines.push(nextLinePrefix)
  }
  // Send a notification to developers if an address was not processed by any of the above rules
  // (and should have been) or if we think there was an error in processing the address correctly
  // (because the RM programmers guide does not specify how to correctly handle the address encountered)
  if (!processed || processingError) {
    if (!(subBuildingName && buildingName && buildingNumber)) {
      if (processingError) {
        console.error(
          'An address (with UDPRN: {udprn}) was probably processed incorrectly'
        )
      } else {
        console.error(
          'An address (with UDPRN: {udprn}) was not processed by any rules'
        )
      }
    }
  }

  // EH additions.
  if (
    addressLines.length >= 2 &&
    addressLines[1].includes(addressLines[0] + ' ')
  ) {
    // House number which appears in the first line and the second line.
    addressLines.shift()
  }

  if (addressLines.length > 0) {
    addressLines[0] = addressLines[0].replace('PO Box Flat', 'Flat')
    addressLines[0] = addressLines[0].replace('PO Box ', '')
  }

  if (
    addressLines.length >= 3 &&
    addressLines[2].includes(addressLines[1] + ' ')
  ) {
    // House number which appears in the third line and the fourth line.
    addressLines.splice(1, 1)
  }

  return addressLines
}

export function constructMultiLine(address) {
  if (!address) {
    return null
  }

  const delimiter = '\n'
  const addressLines = constructAddress(
    address.id,
    address.postcode,
    address.posttown,
    address.dependentlocality,
    address.doubledependentlocality,
    address.thoroughfaredescriptor,
    address.dependentthoroughfaredescriptor,
    address.buildingnumber,
    address.buildingname,
    address.subbuildingname,
    address.pobox,
    address.departmentname,
    address.organizationname,
    address.postcodetype,
    address.suorganizationindicator,
    address.deliverypointsuffix
  )

  let ret =
    addressLines.join(delimiter) +
    delimiter +
    address.posttown +
    ' ' +
    address.postcode
  ret = ret.indexOf(', ') === 0 ? ret.substring(2) : ret

  return ret
}

export function constructSingleLine(address) {
  let ret = constructMultiLine(address)

  if (ret) {
    ret = ret.replace(/\n/g, ', ')
  }

  return ret
}
