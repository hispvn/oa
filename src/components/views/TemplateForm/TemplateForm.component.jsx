import React, { useState, useCallback, useEffect } from 'react'
import { useDataEngine } from '@dhis2/app-runtime'
import {
    Button,
    Modal,
    ModalTitle,
    ModalContent,
    ModalActions,
    InputField,
    ButtonStrip,
    SingleSelect,
    SingleSelectOption,
    Checkbox,
    NoticeBox,
} from '@dhis2/ui'
import _ from 'lodash'
import moment from 'moment'
import classes from '../../views/TemplateForm/TemplateForm.module.css'
import { SearchField } from '../SearchField/SearchField.component'
import { generateUid } from '../../../utils/misc'
import {
    updateTemplate,
    fetchFavoriteById,
    fetchFavoritesByName,
} from '../../../utils/api'

export const TemplateForm = ({
    setShow,
    initValue,
    documents,
    templates,
    putNameForTemplate,
}) => {
    const engine = useDataEngine()
    const [searchFavoriteValue, setSearchFavoriteValue] = useState('')
    const [favorites, setFavorites] = useState([])
    const [loading, setLoading] = useState({
        searchLoading: false,
        downloadLoading: false,
    })
    const [selectedFavorite, setSelectedFavorite] = useState(null)
    const [selectedResource, setSelectedResource] = useState('')
    const [includeNumDen, setIncludeNumDen] = useState(false)
    const [includeOrgUnitHierarchy, setIncludeOrgUnitHierarchy] = useState(
        false
    )
    const [name, setName] = useState('')
    const [showError, setShowError] = useState(false)

    const returnDisplayName = async id => {
        const result = await fetchFavoriteById(engine, id)
        return result.displayName
    }

    useEffect(() => {
        ;(async () => {
            if (initValue) {
                setName(initValue.name)
                if (initValue.deletedFavorite === undefined) {
                    setSelectedFavorite({
                        id: initValue.favorite,
                        name: await returnDisplayName(initValue.favorite),
                    })
                }
                if (initValue.deletedResource === undefined) {
                    setSelectedResource(initValue.resource)
                }
                setIncludeNumDen(initValue.includeNumDen)
                setIncludeOrgUnitHierarchy(initValue.includeOrgUnitHierarchy)
            }
        })()
    }, [])

    const debouncedFetchFavorites = useCallback(
        _.debounce(async searchValue => {
            if (!searchValue) {
                setFavorites([])
                return
            }
            loading.searchLoading = true
            setLoading({ ...loading })
            const result = await fetchFavoritesByName(engine, searchValue)
            setFavorites(
                result.map(rt => {
                    return { name: rt.displayName, id: rt.id }
                })
            )
            loading.searchLoading = false
            setLoading({ ...loading })
        }, 1000),
        []
    )

    const handleSearchFavorite = async value => {
        const searchValue = value.value
        if (value.value === '') {
            setSelectedFavorite(null)
        }
        setSearchFavoriteValue(searchValue)
        debouncedFetchFavorites(searchValue)
    }

    const handleMenuClick = item => {
        setSelectedFavorite(item.value)
        setSearchFavoriteValue('')
        setFavorites([])
    }

    const onClick = async () => {
        if (initValue) {
            templates.forEach(e => {
                if (e.uid === initValue.uid) {
                    e.name = name
                    e.favorite = selectedFavorite.id
                    e.resource = selectedResource
                    e.includeNumDen = includeNumDen
                    e.includeOrgUnitHierarchy = includeOrgUnitHierarchy
                    e.lastUpdated = moment().format('YYYY-MM-DD')
                }
            })
            await updateTemplate(engine, templates)
            await putNameForTemplate(templates)
            setShow()
        } else {
            let object = {
                uid: generateUid(),
                name: name,
                favorite: selectedFavorite.id,
                resource: selectedResource,
                includeNumDen: includeNumDen,
                includeOrgUnitHierarchy: includeOrgUnitHierarchy,
                createdAt: moment().format('YYYY-MM-DD'),
                lastUpdated: moment().format('YYYY-MM-DD'),
            }
            templates.push(object)
            await updateTemplate(engine, templates)
            await putNameForTemplate(templates)
            setShow()
        }
    }

    return (
        <Modal position="middle" large className={classes.TemplatePopUp}>
            <ModalTitle>
                {initValue !== undefined ? 'Edit Template' : 'Add New Template'}
            </ModalTitle>
            <ModalContent>
                <InputField
                    label="Name"
                    name="rename"
                    required
                    onChange={e => {
                        setName(e.value)
                    }}
                    value={name}
                />
                <br />
                <div>
                    <SearchField
                        value={
                            searchFavoriteValue === ''
                                ? selectedFavorite !== null
                                    ? selectedFavorite.name
                                    : searchFavoriteValue
                                : searchFavoriteValue
                        }
                        placeholder="Search favorites ..."
                        items={favorites}
                        onChange={handleSearchFavorite}
                        loading={loading.searchLoading}
                        onItemClick={handleMenuClick}
                        maxHeight={300}
                    />
                </div>

                <br />
                <SingleSelect
                    className="select"
                    placeholder="Select Resource"
                    selected={selectedResource}
                    onChange={e => {
                        setSelectedResource(e.selected)
                    }}
                    filterable
                    noMatchText="No match found"
                >
                    {documents.map(e => {
                        return (
                            <SingleSelectOption
                                label={e.displayName}
                                value={e.id}
                            />
                        )
                    })}
                </SingleSelect>
                <br />
                <Checkbox
                    label="Include numerator and denominator"
                    onChange={e => {
                        setIncludeNumDen(e.checked)
                    }}
                    checked={includeNumDen}
                />
                <br />
                <Checkbox
                    label="Include org unit hierachy"
                    onChange={e => {
                        setIncludeOrgUnitHierarchy(e.checked)
                    }}
                    checked={includeOrgUnitHierarchy}
                />
                {showError ? (
                    name === '' ||
                    selectedFavorite === null ||
                    selectedResource === '' ? (
                        <NoticeBox title="Errors" error>
                            {name === '' ? <p>- Name field is required</p> : ''}
                            {selectedFavorite === null ? (
                                <p>- Favorite field is required</p>
                            ) : (
                                ''
                            )}
                            {selectedResource === '' ? (
                                <p>- Resource field is required</p>
                            ) : (
                                ''
                            )}
                        </NoticeBox>
                    ) : (
                        ''
                    )
                ) : (
                    ''
                )}
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button
                        onClick={() => {
                            if (
                                name === '' ||
                                selectedFavorite === null ||
                                selectedResource === ''
                            ) {
                                setShowError(true)
                            } else {
                                setShowError(false)
                                onClick()
                            }
                        }}
                        primary
                        type="submit"
                    >
                        Save Template
                    </Button>
                    <Button
                        onClick={() => {
                            setShow()
                        }}
                        secondary
                        type="button"
                    >
                        Cancel
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}
