export const fetchFavoritesByName = async (engine, name) => {
    const query = {
        favorites: {
            resource: 'reportTables',
            params: {
                fields: 'id,displayName',
                filter: `name:ilike:${name}`,
                paging: false,
            },
        }
    }
    const result = await engine.query(query)
    return result.favorites.reportTables
}

export const fetchFavoriteById = async (engine, id) => {
    const favoriteQuery = {
        favorite: {
            fields: '*',
            resource: `reportTables/${id}`,
        },
    }
    const result = await engine.query(favoriteQuery)
    return result.favorite
}

export const fetchAnalytic = async (engine, analyticUrl) => {
    const query = {
        analytic: {
            resource: analyticUrl,
        },
    }
    const result = await engine.query(query)
    return result.analytic
}

export const fetchOrganisationUnits = async engine => {
    const query = {
        organisationUnits: {
            resource: 'organisationUnits.json',
            params: {
                fields: 'id,name,code,level',
                paging: 'false',
            },
        },
    }
    const result = await engine.query(query)
    return result.organisationUnits.organisationUnits
}

export const fetchDocuments = async engine => {
    const query = {
        resources: {
            resource: 'documents',
            params: {
                fields: 'id,displayName',
                filter: `name:$like:OAH_`,
                paging: false,
            },
        },
    }
    const result = await engine.query(query)
    return result.resources.documents
}

export const fetchFavorites = async engine => {
    const query = {
        favorite: {
            resource: 'reportTables',
            params: {
                fields: 'id,displayName',
                paging: false,
            },
        },
    }
    const result = await engine.query(query)
    return result.favorite.reportTables
}

export const fetchUserDataStores = async engine => {
    const query = {
        userDataStores: {
            resource: 'userDataStore',
        },
    }
    const result = await engine.query(query)
    return result.userDataStores
}

export const fetchUserDataStoreKey = async engine => {
    const query = {
        templates: {
            resource: 'userDataStore/oah/templates',
        },
    }
    const result = await engine.query(query)
    return result.templates
}

export const pushUserDataStore = async engine => {
    const mutationKey = {
        resource: 'userDataStore/oah/templates',
        type: 'create',
        data: [],
    }
    await engine.mutate(mutationKey)
}

export const updateTemplate = async (engine, templates) => {
    const mutationKey = {
        resource: 'userDataStore/oah/templates',
        type: 'update',
        data: templates,
    }
    await engine.mutate(mutationKey)
}
