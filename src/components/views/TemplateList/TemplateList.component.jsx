import React, { useState, useEffect } from 'react'
import { useDataEngine, useConfig } from '@dhis2/app-runtime'
import {
    Table,
    TableHead,
    TableRowHead,
    TableCellHead,
    TableBody,
    TableRow,
    TableCell,
    ButtonStrip,
    Button,
    CircularLoader,
    NoticeBox,
} from '@dhis2/ui'
import Tooltip from '@material-ui/core/Tooltip'
import Fab from '@material-ui/core/Fab'
import AddIcon from '@material-ui/icons/Add'
import EditIcon from '@material-ui/icons/Edit'
import DeleteIcon from '@material-ui/icons/Delete'
import CloudDownloadIcon from '@material-ui/icons/CloudDownload'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons'
import classes from '../../views/Views.module.css'
import classesTemplateList from './TemplateList.module.css'
import { DeleteTemplate } from '../DeleteTemplate/DeleteTemplate.component'
import { TemplateForm } from '../TemplateForm/TemplateForm.component'

//////////////////////
import { getExcelFileFromResource } from '../../../utils/excel'
import {
    generateAnalyticUrl,
    generateExcelFromAnalytic,
} from '../../../utils/analytic'
import saveAs from 'file-saver'
/////////////////////
import {
    fetchOrganisationUnits,
    fetchFavoriteById,
    fetchDocuments,
    fetchUserDataStores,
    fetchUserDataStoreKey,
    pushUserDataStore,
    fetchAnalytic,
} from '../../../utils/api'
/////////////////////

export const TemplateList = () => {
    const engine = useDataEngine()
    const dhis2Config = useConfig()
    const [showTemplate, setShowTemplate] = useState(false)
    const [showDelete, setShowDelete] = useState(false)
    const [initValue, setInitValue] = useState(null)
    const [documents, setDocuments] = useState([])
    const [templates, setTemplates] = useState([])
    const [loading, setLoading] = useState(false)
    const [orgUnits, setOrgUnits] = useState([])
    const [templateWithName, setTemplateWithName] = useState([])

    const handleDownload = async template => {
        setLoading(true)
        const {
            name,
            includeNumDen,
            resource,
            favorite,
            includeOrgUnitHierarchy,
        } = template
        let resultSelectedFavorite = await fetchFavoriteById(engine, favorite)
        const analyticUrl = generateAnalyticUrl(
            resultSelectedFavorite,
            includeNumDen,
            includeOrgUnitHierarchy
        )
        const result = await Promise.all([
            getExcelFileFromResource(resource, dhis2Config),
            fetchAnalytic(engine, analyticUrl),
        ])
        const blob = await generateExcelFromAnalytic(
            result[1],
            includeOrgUnitHierarchy,
            orgUnits,
            result[0]
        )
        saveAs(blob, `${name}.xlsx`)
        setLoading(false)
    }

    const onClick = (row, type) => {
        if (type === 'delete') {
            setShowDelete(!showDelete)
        } else {
            setShowTemplate(!showTemplate)
        }
        setInitValue(row)
    }

    const putNameForTemplate = async (templates, docs) => {
        let array = []
        if (docs === undefined) {
            docs = documents
        }
        for (let i = 0; i < templates.length; i++) {
            let object = { ...templates[i] }
            let requestName = await fetchFavoriteById(
                engine,
                templates[i].favorite
            )
            if (requestName) {
                object['favoriteName'] = requestName.displayName
                array.push(object)
            } else {
                object['deletedFavorite'] = 'true'
            }
            let findResources = docs.find(f => f.id === templates[i].resource)
            if (findResources) {
                object['resourceName'] = findResources.displayName
            } else {
                object['deletedResource'] = 'true'
            }
        }
        setTemplateWithName(array)
    }

    useEffect(() => {
        ;(async () => {
            setLoading(true)
            const result = await Promise.all([
                fetchDocuments(engine),
                fetchUserDataStores(engine),
                fetchOrganisationUnits(engine),
            ])
            let findNameSpace = result[1].find(e => e === 'oah')
            if (!findNameSpace) {
                await pushUserDataStore(engine)
            } else {
                const resultTemplate = await fetchUserDataStoreKey(engine)
                putNameForTemplate(resultTemplate, result[0])
                setTemplates(resultTemplate)
            }
            setDocuments(result[0])
            setOrgUnits(result[2])
            setLoading(false)
        })()
    }, [])

    return (
        <div className={classes.SectionContainer}>
            <div className={classes.SectionTitle}>
                Templates{' '}
                <FontAwesomeIcon
                    style={{ cursor: 'pointer' }}
                    icon={faQuestionCircle}
                    color="#808080"
                    onClick={() => {
                        window.open(
                            'https://docs.google.com/document/d/1hXbHtqR3y7XgIRHemngRfPmJ2oCD3P3pnvfO_THryhM'
                        )
                    }}
                />
            </div>
            <div className={classes.SectionContentContainer}>
                <div className={classes.SectionContent}>
                    {loading === true ? (
                        <div align="center">
                            <CircularLoader />
                        </div>
                    ) : (
                        <Table>
                            <TableHead>
                                <TableRowHead>
                                    <TableCellHead>Name</TableCellHead>
                                    <TableCellHead>Favorite</TableCellHead>
                                    <TableCellHead>Resource</TableCellHead>
                                    <TableCellHead>
                                        Include numerator and denominator
                                    </TableCellHead>
                                    <TableCellHead>
                                        Include org unit hierachy
                                    </TableCellHead>
                                    <TableCellHead
                                        className={
                                            classesTemplateList.TemplateListTableCell
                                        }
                                    >
                                        Action
                                    </TableCellHead>
                                </TableRowHead>
                            </TableHead>
                            <TableBody>
                                {templateWithName.map(template => {
                                    return (
                                        <TableRow>
                                            <TableCell>
                                                {template.name}
                                            </TableCell>
                                            <TableCell>
                                                {template.favoriteName ? (
                                                    template.favoriteName
                                                ) : (
                                                    <NoticeBox
                                                        title="This Favorite already removed from the system"
                                                        warning
                                                        className={
                                                            classesTemplateList.TemplateWarning
                                                        }
                                                    ></NoticeBox>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {template.resourceName ? (
                                                    template.resourceName
                                                ) : (
                                                    <NoticeBox
                                                        title="This Resource already removed from the system"
                                                        warning
                                                        className={
                                                            classesTemplateList.TemplateWarning
                                                        }
                                                    ></NoticeBox>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {template.includeNumDen
                                                    ? 'Yes'
                                                    : 'No'}
                                            </TableCell>
                                            <TableCell>
                                                {template.includeOrgUnitHierarchy
                                                    ? 'Yes'
                                                    : 'No'}
                                            </TableCell>
                                            <TableCell>
                                                <ButtonStrip right>
                                                    <Tooltip
                                                        title="Edit Template"
                                                        placement="top"
                                                    >
                                                        <Fab
                                                            size="small"
                                                            color="default"
                                                            aria-label="add"
                                                            onClick={() => {
                                                                onClick(
                                                                    template
                                                                )
                                                            }}
                                                        >
                                                            <EditIcon />
                                                        </Fab>
                                                    </Tooltip>
                                                    <Tooltip
                                                        title="Delete Template"
                                                        placement="top"
                                                    >
                                                        <Fab
                                                            size="small"
                                                            color="secondary"
                                                            aria-label="delete"
                                                            onClick={() => {
                                                                onClick(
                                                                    template,
                                                                    'delete'
                                                                )
                                                            }}
                                                        >
                                                            <DeleteIcon />
                                                        </Fab>
                                                    </Tooltip>
                                                    {template.deletedFavorite ||
                                                    template.deletedResource ? (
                                                        ''
                                                    ) : (
                                                        <Tooltip
                                                            title="Download Excel"
                                                            placement="top"
                                                        >
                                                            <Fab
                                                                size="small"
                                                                color="primary"
                                                                aria-label="download"
                                                                onClick={() => {
                                                                    handleDownload(
                                                                        template
                                                                    )
                                                                }}
                                                            >
                                                                <CloudDownloadIcon />
                                                            </Fab>
                                                        </Tooltip>
                                                    )}
                                                </ButtonStrip>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    )}
                </div>
                <div className={classesTemplateList.SectionNewButtonContainer}>
                    {loading === false ? (
                        <Tooltip title="Add New Template" placement="top">
                            <Fab
                                size="small"
                                color="primary"
                                aria-label="add"
                                className={
                                    classesTemplateList.TemplateNewButton
                                }
                                onClick={() => {
                                    onClick()
                                }}
                            >
                                <AddIcon />
                            </Fab>
                        </Tooltip>
                    ) : (
                        ''
                    )}
                </div>

                {showTemplate ? (
                    <TemplateForm
                        setShow={setShowTemplate}
                        initValue={initValue}
                        documents={documents}
                        templates={templates}
                        putNameForTemplate={putNameForTemplate}
                    />
                ) : (
                    ''
                )}
                {showDelete ? (
                    <DeleteTemplate
                        setShow={setShowDelete}
                        initValue={initValue}
                        templates={templates}
                        putNameForTemplate={putNameForTemplate}
                    />
                ) : (
                    ''
                )}
            </div>
        </div>
    )
}
