/* eslint-disable */
import XlsxPopulate from 'xlsx-populate'
import _ from 'lodash'

export const generateAnalyticUrl = (favorite, numDen, ouHierarchy) => {
    const relativePeriodMap = {
        biMonthsThisYear: 'BIMONTHS_THIS_YEAR',
        last12Months: 'LAST_12_MONTHS',
        last12Weeks: 'LAST_12_WEEKS',
        last14Days: 'LAST_14_DAYS',
        last2SixMonths: 'LAST_2_SIXMONTHS',
        last3Days: 'LAST_3_DAYS',
        last3Months: 'LAST_3_MONTHS',
        last4BiWeeks: 'LAST_4_BIWEEKS',
        last4Quarters: 'LAST_4_QUARTERS',
        last4Weeks: 'LAST_4_WEEKS',
        last5FinancialYears: 'LAST_5_FINANCIAL_YEARS',
        last5Years: 'LAST_5_YEARS',
        last52Weeks: 'LAST_52_WEEKS',
        last6BiMonths: 'LAST_6_BIMONTHS',
        last6Months: 'LAST_6_MONTHS',
        last7Days: 'LAST_7_DAYS',
        lastBimonth: 'LAST_BIMONTH',
        lastBiWeek: 'LAST_BIWEEK',
        lastFinancialYear: 'LAST_FINANCIAL_YEAR',
        lastMonth: 'LAST_MONTH',
        lastQuarter: 'LAST_QUARTER',
        lastSixMonth: 'LAST_SIX_MONTH',
        lastWeek: 'LAST_WEEK',
        lastYear: 'LAST_YEAR',
        monthsThisYear: 'MONTHS_THIS_YEAR',
        quartersThisYear: 'QUARTERS_THIS_YEAR',
        thisBimonth: 'THIS_BIMONTH',
        thisBiWeek: 'THIS_BIWEEK',
        thisFinancialYear: 'THIS_FINANCIAL_YEAR',
        thisMonth: 'THIS_MONTH',
        thisQuarter: 'THIS_QUARTER',
        thisSixMonth: 'THIS_SIX_MONTH',
        thisWeek: 'THIS_WEEK',
        thisYear: 'THIS_YEAR',
        thisDay: 'TODAY',
        weeksThisYear: 'WEEKS_THIS_YEAR',
        yesterday: 'YESTERDAY',
    }
    const optionParam = favorite => {
        let param = ''
        if (favorite.hasOwnProperty('aggregationType')) {
            if (favorite.aggregationType != 'DEFAULT')
                param += '&aggregationType=' + favorite.aggregationType
        }
        if (favorite.hasOwnProperty('skipRounding')) {
            if (favorite.skipRounding) param += '&skipRounding=true'
        }
        if (favorite.hasOwnProperty('completedOnly')) {
            if (favorite.completedOnly) param += '&completedOnly=true'
        }
        if (favorite.hasOwnProperty('measureCriteria')) {
            param += '&measureCriteria=' + favorite.measureCriteria
        }
        if (favorite.hasOwnProperty('showHierarchy')) {
            if (favorite.showHierarchy) param += '&hierarchyMeta=true'
        }

        return param
    }

    //get category dimension
    const catsParam = favorite => {
        let param = ''
        for (let cats of favorite.categoryDimensions) {
            param += '&dimension=' + cats.category.id + ':'
            if (cats.categoryOptions.length > 0) {
                for (let co of cats.categoryOptions) {
                    param += co.id + ';'
                }
            }
            param = param.slice(0, -1)
        }

        return param
    }

    //get category option group set dimension
    const cogsParam = favorite => {
        let param = ''
        for (let cogs of favorite.categoryOptionGroupSetDimensions) {
            param += '&dimension=' + cogs.categoryOptionGroupSet.id + ':'
            if (degs.categoryOptionGroups.length > 0) {
                for (let cog of cogs.categoryOptionGroups) {
                    param += cog.id + ';'
                }
            }
            param = param.slice(0, -1)
        }

        return param
    }

    //get data element group set dimension
    const degsParam = favorite => {
        let param = ''
        for (let degs of favorite.dataElementGroupSetDimensions) {
            param += '&dimension=' + degs.dataElementGroupSet.id + ':'
            if (degs.dataElementGroups.length > 0) {
                for (let deg of degs.dataElementGroups) {
                    param += deg.id + ';'
                }
            }
            param = param.slice(0, -1)
        }

        return param
    }

    //get orgunit group set dimension
    const ougsParam = favorite => {
        let param = ''
        for (let ougs of favorite.organisationUnitGroupSetDimensions) {
            param += '&dimension=' + ougs.organisationUnitGroupSet.id + ':'
            if (ougs.organisationUnitGroups.length > 0) {
                for (let oug of ougs.organisationUnitGroups) {
                    param += oug.id + ';'
                }
            }
            param = param.slice(0, -1)
        }

        return param
    }

    //get data params
    const dxParam = favorite => {
        let param = '&dimension=dx:'
        for (let dx of favorite.dataDimensionItems) {
            switch (dx.dataDimensionItemType) {
                case 'DATA_ELEMENT':
                    param += dx.dataElement.id + ';'
                    break
                case 'DATA_ELEMENT_OPERAND':
                    param += dx.dataElementOperand.id + ';'
                    break
                case 'INDICATOR':
                    param += dx.indicator.id + ';'
                    break
                case 'REPORTING_RATE':
                    param += dx.reportingRate.dimensionItem + ';'
                    break
                case 'PROGRAM_DATA_ELEMENT':
                    param += dx.programDataElement.dimensionItem + ';'
                    break
                case 'PROGRAM_INDICATOR':
                    param += dx.programIndicator.id + ';'
                    break
                default:
                    console.log(
                        'Unsupported dataDimensionItemType:' +
                            dx.dataDimensionItemType
                    )
            }
        }

        //remove trailing ; and return
        return param.slice(0, -1)
    }

    //get period params
    const peParam = favorite => {
        let param = '&dimension=pe:'

        //Fixed
        for (let pe of favorite.periods) {
            param += pe.id + ';'
        }

        //Relative
        for (let rp in favorite.relativePeriods) {
            if (favorite.relativePeriods[rp]) {
                param += relativePeriodMap[rp] + ';'
            }
        }

        //remove trailing ; and return
        return param.slice(0, -1)
    }

    //get orgunit params
    const ouParam = favorite => {
        let param = '&dimension=ou:'
        
        for (let ou of favorite.organisationUnits) {
            param += ou.id + ';'
        }

        for (let ouLevel of favorite.organisationUnitLevels) {
            param += 'LEVEL-' + ouLevel + ';'
        }

        for (let ouGroup of favorite.itemOrganisationUnitGroups) {
            param += 'OU_GROUP-' + ouGroup.id + ';'
        }

        if (favorite.userOrganisationUnit) param += 'USER_ORGUNIT;'
        if (favorite.userOrganisationUnitChildren)
            param += 'USER_ORGUNIT_CHILDREN;'
        if (favorite.userOrganisationUnitGrandChildren)
            param += 'USER_ORGUNIT_GRANDCHILDREN;'

        //remove trailing ; and return
        return param.slice(0, -1)
    }

    let analyticUrl = 'analytics.json?displayProperty=NAME&outputIdScheme=UID'
    if (numDen) analyticUrl += '&includeNumDen=true'
    if (ouHierarchy) analyticUrl += '&hierarchyMeta=true'
    analyticUrl += optionParam(favorite)
    analyticUrl += ouParam(favorite)
    analyticUrl += peParam(favorite)
    analyticUrl += dxParam(favorite)
    analyticUrl += catsParam(favorite)
    analyticUrl += ougsParam(favorite)
    analyticUrl += degsParam(favorite)
    analyticUrl += cogsParam(favorite)
    return analyticUrl
}

const addOrgUnitLevelHeaders = (analytic, headers, organisationUnits) => {
    let ouIndex = analytic.headers.findIndex(header => header.name === 'ou')
    if (ouIndex === -1) return headers
    let maxLevel = _.max(organisationUnits.map(ou => ou.level))
    for (let i = 1; i <= maxLevel; i++) {
        headers.push({
            header: `Organisation unit level ${i}`,
            generateValue: (row, a) => {
                let ou = row[ouIndex]
                let currentLevelOu = a.metaData.ouHierarchy[ou].split('/')[
                    i - 1
                ]
                return currentLevelOu
                    ? a.metaData.items[currentLevelOu].name
                    : ''
            },
        })
    }
    return headers
}

export const generateExcelFromAnalytic = async (
    analytic,
    ouHierarchy,
    organisationUnits,
    workbook
) => {
    let headers = analytic.headers.map((header, index) => {
        const { valueType, column, meta } = header
        return {
            header: column,
            generateValue: (row, analytic) => {
                return row[index]
                    ? valueType === 'NUMBER'
                        ? parseInt(row[index])
                        : meta
                        ? analytic.metaData.items[row[index]].name
                        : row[index]
                    : ''
            },
        }
    })
    if (ouHierarchy) {
        headers = addOrgUnitLevelHeaders(analytic, headers, organisationUnits)
    }

    let rows = analytic.rows.map(row => {
        return headers.reduce((rowObject, header) => {
            rowObject[header.header] = header.generateValue(row, analytic)
            return rowObject
        }, {})
    })

    /////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////
    const newWorkbook = workbook
        ? workbook
        : await XlsxPopulate.fromBlankAsync()
    if (!newWorkbook.sheet('DHIS2 Data')) {
        newWorkbook.addSheet('DHIS2 Data')
        newWorkbook.deleteSheet('Sheet1')
    } else {
        newWorkbook.addSheet('TEMP')
        newWorkbook.deleteSheet('DHIS2 Data')
        newWorkbook.addSheet('DHIS2 Data')
        newWorkbook.deleteSheet('TEMP')
    }

    newWorkbook
        .sheet('DHIS2 Data')
        .cell('A1')
        .value([
            headers.map(header => header.header),
            ...rows.map(row => Object.values(row)),
        ])

    const blob = await newWorkbook.outputAsync()
    return blob
}
