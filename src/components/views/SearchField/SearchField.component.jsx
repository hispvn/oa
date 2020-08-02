import React from 'react'
import { PropTypes } from '@dhis2/prop-types'
import { InputField, Menu, MenuItem, CircularLoader } from '@dhis2/ui'
import classes from './SearchField.module.css'

export const SearchField = ({
    items,
    placeholder,
    onChange,
    value,
    loading,
    onItemClick,
    maxHeight,
}) => {
    console.log(loading)
    return (
        <div className={classes.SearchFieldContainer}>
            <InputField
                value={value}
                placeholder={placeholder}
                onChange={value => {
                    onChange(value)
                }}
            />
            {items.length > 0 && (
                <div
                    className={classes.SearchFieldSearchResult}
                    style={{ maxHeight: maxHeight ? maxHeight : '' }}
                >
                    <Menu dense>
                        {loading ? (
                            <div className={classes.SearchFieldLoaderContainer}>
                                <CircularLoader />
                            </div>
                        ) : (
                            items.map(item => (
                                <MenuItem
                                    value={{
                                        name: item.name,
                                        id: item.id,
                                    }}
                                    onClick={item => {
                                        onItemClick(item)
                                    }}
                                    label={item.name}
                                    key={item.id}
                                />
                            ))
                        )}
                    </Menu>
                </div>
            )}
        </div>
    )
}

SearchField.propTypes = {
    items: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired,
    placeholder: PropTypes.string.isRequired,
    value: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    onItemClick: PropTypes.func.isRequired,
    maxHeight: PropTypes.number,
}
