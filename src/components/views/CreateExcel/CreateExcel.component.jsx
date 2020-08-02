import React, { useState, useCallback } from 'react'
import { Checkbox, Button, Chip, CircularLoader, NoticeBox } from '@dhis2/ui'
import viewClasses from '../../views/Views.module.css'
import classes from './CreateExcel.module.css'
import { useDataEngine } from '@dhis2/app-runtime'
import { SearchField } from '../SearchField/SearchField.component'
import {
    generateAnalyticUrl,
    generateExcelFromAnalytic,
} from '../../../utils/analytic'
import { saveAs } from 'file-saver'
import _ from 'lodash'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons'
import {
    fetchFavoritesByName,
    fetchFavoriteById,
    fetchAnalytic,
    fetchOrganisationUnits,
} from '../../../utils/api'

export const CreateExcel = () => {
    const engine = useDataEngine()
    const [selectedFavorite, setSelectedFavorite] = useState(null)
    const [searchFavoriteValue, setSearchFavoriteValue] = useState('')
    const [favorites, setFavorites] = useState([])
    const [loading, setLoading] = useState({
        searchLoading: false,
        downloadLoading: false,
    })
    const [includeNumden, setIncludeNumden] = useState(false)
    const [includeOrgUnitHierarchy, setIncludeOrgUnitHierarchy] = useState(
        false
    )
    const [errors, setErrors] = useState([])

    const debouncedFetchFavorites = useCallback(
        _.debounce(async searchValue => {
            if (!searchValue) {
                setFavorites([])
                return
            }

            loading.searchLoading = true
            setLoading({ ...loading })
            const resultFavorites = await fetchFavoritesByName(
                engine,
                searchValue
            )
            setFavorites(
                resultFavorites.map(f => {
                    return { name: f.displayName, id: f.id }
                })
            )
            loading.searchLoading = false
            setLoading({ ...loading })
        }, 1000),
        []
    )

    const handleSearchFavorite = async value => {
        const searchValue = value.value
        setSearchFavoriteValue(searchValue)
        debouncedFetchFavorites(searchValue)
    }

    const handleMenuClick = item => {
        setSelectedFavorite(item.value)
        setSearchFavoriteValue('')
        setFavorites([])
    }

    const handleRemoveSelectedFavorite = () => {
        setSelectedFavorite(null)
    }

    const handleDownload = async () => {
        const currentErrors = validate()
        if (currentErrors.length > 0) {
            setErrors(currentErrors)
            return
        } else {
            setErrors([])
        }
        setLoading({ ...loading, downloadLoading: true })
        const favorite = await fetchFavoriteById(engine, selectedFavorite.id)
        const result = await Promise.all([
            fetchAnalytic(
                engine,
                generateAnalyticUrl(
                    favorite,
                    includeNumden,
                    includeOrgUnitHierarchy
                )
            ),
            fetchOrganisationUnits(engine),
        ])

        const blob = await generateExcelFromAnalytic(
            result[0],
            includeOrgUnitHierarchy,
            result[1],
            null
        )
        setLoading({ ...loading, downloadLoading: false })
        saveAs(blob, `${selectedFavorite.name}.xlsx`)
    }

    const validate = () => {
        const errors = []
        if (!selectedFavorite) {
            errors.push('Selected favorite is required')
        }
        return errors
    }
    return (
        <div className={viewClasses.SectionContainer}>
            <div className={viewClasses.SectionTitle}>
                Create Excel{' '}
                <FontAwesomeIcon icon={faQuestionCircle} color="#808080" />
            </div>
            <div className={viewClasses.SectionContentContainer}>
                <div className={viewClasses.SectionContent}>
                    <div className={classes.CreateExcelFormItem}>
                        <SearchField
                            value={searchFavoriteValue}
                            placeholder="Search favorites ..."
                            items={favorites}
                            onChange={handleSearchFavorite}
                            loading={loading.searchLoading}
                            onItemClick={handleMenuClick}
                        />
                    </div>
                    {selectedFavorite && (
                        <div className={classes.CreateExcelFormItem}>
                            Selected favorite:
                            <Chip
                                selected
                                onRemove={handleRemoveSelectedFavorite}
                            >
                                {selectedFavorite.name}
                            </Chip>
                        </div>
                    )}
                    <div className={classes.CreateExcelFormItem}>
                        <Checkbox
                            checked={includeNumden}
                            label="Include numerator and denominator"
                            onChange={value => {
                                setIncludeNumden(value.checked)
                            }}
                            value="default"
                        />
                    </div>
                    <div className={classes.CreateExcelFormItem}>
                        <Checkbox
                            checked={includeOrgUnitHierarchy}
                            label="Include organisation unit hierachy"
                            onChange={value => {
                                setIncludeOrgUnitHierarchy(value.checked)
                            }}
                        />
                    </div>
                    <div className={classes.CreateExcelFormItem}>
                        <Button
                            name="Primary button"
                            onClick={handleDownload}
                            initialFocus
                        >
                            Download
                            {loading.downloadLoading && (
                                <CircularLoader small />
                            )}
                        </Button>
                    </div>
                    <div className={classes.CreateExcelFormItem}>
                        {errors.length > 0 && (
                            <NoticeBox error title="Error">
                                {errors.map((error, index) => (
                                    <div key={index}>{error}</div>
                                ))}
                            </NoticeBox>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
