import { useHistory, useRouteMatch } from 'react-router-dom'
import { PropTypes } from '@dhis2/prop-types'
import React from 'react'
import { Menu, MenuItem } from '@dhis2/ui'
import classes from './Navigation.module.css'
import './Navigation.styles.css'

const NavigationItem = ({ path, label }) => {
    const history = useHistory()
    const routeMatch = useRouteMatch(path)
    const isActive = routeMatch?.isExact
    const onClick = () => !isActive && history.push(path)
    return (
        <MenuItem
            label={label}
            active={isActive}
            onClick={onClick}
            // className={classes.NavigationItem}
        />
    )
}

NavigationItem.propTypes = {
    label: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
}

export const Navigation = () => (
    <Menu className={classes.NavigationMenu}>
        <NavigationItem label="Templates" path="/" />
        <NavigationItem label="Create excel file" path="/create-excel" />
    </Menu>
)
