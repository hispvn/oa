import React from 'react'
import { useDataEngine } from '@dhis2/app-runtime'
import {
    Button,
    Modal,
    ModalTitle,
    ModalActions,
    ButtonStrip,
    ModalContent,
    NoticeBox,
} from '@dhis2/ui'

import { updateTemplate } from '../../../utils/api'

export const DeleteTemplate = ({ setShow, initValue, templates,putNameForTemplate }) => {
    const engine = useDataEngine()
    const onClick = async () => {
        let findTemplate = templates.findIndex(e => e.uid === initValue.uid)
        if (findTemplate !== -1) {
            templates.splice(findTemplate, 1)
        }
        await updateTemplate(engine, templates)
        await putNameForTemplate(templates)
        setShow()
    }
    return (
        <Modal
            onClose={() => {
                setShow()
            }}
            position="middle"
            medium
        >
            <ModalTitle>Delete Template</ModalTitle>
            <ModalContent>
                <NoticeBox
                    title="Are you sure you want to delete this Template?"
                    warning
                >
                    This process cannot be undone!
                </NoticeBox>
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button
                        onClick={() => {
                            onClick()
                        }}
                        primary
                        type="submit"
                    >
                        Submit
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
