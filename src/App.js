import React from 'react'
import { HashRouter, Switch, Route } from 'react-router-dom'
// import i18n from '@dhis2/d2-i18n'
import classes from './App.module.css'
import { Navigation } from './components/navigation/Navigation.component'
import { TemplateList } from './components/views/TemplateList/TemplateList.component'
import { CreateExcel } from './components/views/CreateExcel/CreateExcel.component'

const MyApp = () => (
    <HashRouter>
        <div className={classes.AppContainer}>
            <div className={classes.AppLeft}>
                <Navigation />
            </div>
            <div className={classes.AppRight}>
                <Switch>
                    <Route exact path="/" component={TemplateList} />
                    <Route exact path="/create-excel" component={CreateExcel} />
                </Switch>
            </div>
        </div>
    </HashRouter>
)

export default MyApp
