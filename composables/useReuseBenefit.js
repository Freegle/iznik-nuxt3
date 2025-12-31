/**
 * Reuse benefit calculation with inflation adjustment.
 *
 * The base benefit of reuse value (£711 per tonne) comes from the WRAP
 * "Benefits of Reuse" tool, originally published in 2011.
 * https://www.wrap.ngo/resources/tool/benefits-of-reuse-tool
 *
 * To express this value in current prices, we up-rate by UK CPI inflation.
 * CPI data source: ONS Consumer Price Index (2015=100)
 * https://www.ons.gov.uk/economy/inflationandpriceindices/timeseries/d7bt/mm23
 *
 * The CO2 impact (0.51 tCO2eq per tonne) is not adjusted for inflation as it
 * represents physical quantities, not monetary values.
 */

/* UK CPI Annual Averages (2015=100)
 * Source: ONS MM23 dataset, series D7BT
 * Last updated: January 2025
 *
 * To update: Visit the ONS URL above, download data, and add the new year's value.
 */
const CPI_DATA = {
  2011: 93.4,
  2012: 96.1,
  2013: 98.5,
  2014: 100.0,
  2015: 100.0,
  2016: 100.7,
  2017: 103.4,
  2018: 105.9,
  2019: 107.8,
  2020: 108.7,
  2021: 111.6,
  2022: 121.7,
  2023: 130.5,
  2024: 133.9,
}

/* Base year for the WRAP benefits of reuse value. */
const BASE_YEAR = 2011

/* Base benefit of reuse value in GBP per tonne (2011 prices). */
const BASE_BENEFIT_PER_TONNE = 711

/* CO2 impact per tonne (tCO2eq) - not inflation adjusted. */
const CO2_PER_TONNE = 0.51

/**
 * Get the CPI value for a given year.
 * Returns the latest available year if the requested year is in the future.
 * Returns the earliest available year if the requested year is before 2011.
 */
function getCPI(year) {
  const years = Object.keys(CPI_DATA)
    .map(Number)
    .sort((a, b) => a - b)
  const minYear = years[0]
  const maxYear = years[years.length - 1]

  if (year < minYear) {
    return CPI_DATA[minYear]
  }
  if (year > maxYear) {
    return CPI_DATA[maxYear]
  }
  return CPI_DATA[year]
}

/**
 * Calculate the inflation multiplier from the base year to the target year.
 */
function getInflationMultiplier(targetYear = null) {
  const year = targetYear || new Date().getFullYear()
  const baseCPI = getCPI(BASE_YEAR)
  const targetCPI = getCPI(year)
  return targetCPI / baseCPI
}

/**
 * Get the inflation-adjusted benefit per tonne in GBP.
 * By default, adjusts to current year prices.
 */
function getBenefitPerTonne(targetYear = null) {
  const multiplier = getInflationMultiplier(targetYear)
  return Math.round(BASE_BENEFIT_PER_TONNE * multiplier)
}

/**
 * Calculate the total benefit in GBP for a given weight in tonnes.
 * Weight should be in tonnes (not kg).
 */
function calculateBenefit(weightInTonnes, targetYear = null) {
  return weightInTonnes * getBenefitPerTonne(targetYear)
}

/**
 * Calculate the CO2 saved for a given weight in tonnes.
 * Returns tCO2eq. Weight should be in tonnes.
 */
function calculateCO2(weightInTonnes) {
  return weightInTonnes * CO2_PER_TONNE
}

/**
 * Get the latest year for which we have CPI data.
 */
function getLatestCPIYear() {
  const years = Object.keys(CPI_DATA).map(Number)
  return Math.max(...years)
}

export function useReuseBenefit() {
  return {
    BASE_YEAR,
    BASE_BENEFIT_PER_TONNE,
    CO2_PER_TONNE,
    getCPI,
    getInflationMultiplier,
    getBenefitPerTonne,
    calculateBenefit,
    calculateCO2,
    getLatestCPIYear,
  }
}

/* Also export individual functions for direct import. */
export {
  BASE_YEAR,
  BASE_BENEFIT_PER_TONNE,
  CO2_PER_TONNE,
  getCPI,
  getInflationMultiplier,
  getBenefitPerTonne,
  calculateBenefit,
  calculateCO2,
  getLatestCPIYear,
}
